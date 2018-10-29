
package com.usky.sms.custom;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.field.FieldLayoutDO;
import com.usky.sms.field.FieldLayoutDao;
import com.usky.sms.field.FieldLayoutItemDO;
import com.usky.sms.field.FieldLayoutItemDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.field.screen.FieldScreenDO;
import com.usky.sms.field.screen.FieldScreenLayoutItemDO;
import com.usky.sms.field.screen.FieldScreenLayoutItemDao;
import com.usky.sms.field.screen.FieldScreenTabDO;
import com.usky.sms.renderer.Renderer;
import com.usky.sms.renderer.RendererRegister;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.unit.UnitDO;

public class CustomFieldDao extends BaseDao<CustomFieldDO> {
	
	public static final SMSException EXIST_SAME_CUSTOM_FIELD = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "已存在相同名称的自定义字段！");
	
	private static final Logger log = Logger.getLogger(CustomFieldDao.class);
	
	@Autowired
	private CustomFieldConfigSchemeDao customFieldConfigSchemeDao;
	
	@Autowired
	private CustomFieldTypeDao customFieldTypeDao;
	
	@Autowired
	private FieldLayoutDao fieldLayoutDao;
	
	@Autowired
	private FieldLayoutItemDao fieldLayoutItemDao;
	
	@Autowired
	private FieldScreenLayoutItemDao fieldScreenLayoutItemDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	public CustomFieldDao() {
		super(CustomFieldDO.class);
	}
	
	private void checkDuplicate(Integer id, String name) {
		@SuppressWarnings("unchecked")
		List<CustomFieldDO> list = this.getHibernateTemplate().find("from CustomFieldDO where name = ?", name);
		int size = list.size();
		if (size > 1 || (size == 1 && !list.get(0).getId().equals(id))) throw EXIST_SAME_CUSTOM_FIELD;
	}
	
	private void checkConstraints(Integer id, Map<String, Object> map) {
		if (map.containsKey("name")) {
			String name = (String) map.get("name");
			checkDuplicate(id, name);
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(null, map);
		return true;
	}
	
	@Override
	protected void afterSave(CustomFieldDO field) {
		CustomFieldTypeDO type = customFieldTypeDao.internalGetById(field.getType().getId());
		String key = "customfield_" + field.getId();
		List<ISearchTemplate> templates = SearchTemplateRegister.getSearchTemplates(type.getKey());
		String searcher;
		if (templates != null && templates.size() > 0) {
			searcher = templates.get(0).getKey();
		} else {
			searcher = null;
			log.warn("字段[" + key + "]没有搜索模板！");
		}
		field.setSearcher(searcher);
		this.internalUpdate(field);
		List<Renderer> renderers = RendererRegister.getRenderers(type.getKey());
		String rendererKey = "";
		if (null != renderers && !renderers.isEmpty()) {
			rendererKey = renderers.get(0).getKey();
		}
		fieldRegister.registerField(key, field.getName(), field.getDescription(), rendererKey, searcher, field.getConfig(), field.isSearchable(), field.isDisplay());
		
		CustomFieldConfigSchemeDO scheme = new CustomFieldConfigSchemeDO();
		scheme.setName(field.getName() + "的默认配置方案");
		scheme.setDescription("系统生成的默认配置方案");
		scheme.setField(field);
		scheme.setType("default");
		customFieldConfigSchemeDao.internalSave(scheme);
		
		List<FieldLayoutDO> layouts = fieldLayoutDao.getAllList();
		for (FieldLayoutDO layout : layouts) {
			FieldLayoutItemDO item = new FieldLayoutItemDO();
			item.setHidden(false);
			item.setRequired(false);
			item.setRenderer(rendererKey);
			item.setKey(key);
			item.setDescription(field.getDescription());
			item.setLayout(layout);
			fieldLayoutItemDao.internalSave(item);
		}
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkConstraints(id, map);
	}
	
	@Override
	protected void afterUpdate(CustomFieldDO field, CustomFieldDO dbField) {
		CustomFieldTypeDO type = customFieldTypeDao.internalGetById(field.getType().getId());
		fieldRegister.registerField("customfield_" + field.getId(), field.getName(), field.getDescription(), type.getKey(), field.getSearcher(), field.getConfig(), field.isSearchable(), field.isDisplay());
	}
	
	@Override
	protected void beforeDelete(Collection<CustomFieldDO> fields) {
		if (fields == null || fields.size() == 0) return;
		List<CustomFieldConfigSchemeDO> schemes = customFieldConfigSchemeDao.getByCustomFields(fields);
		customFieldConfigSchemeDao.delete(schemes);
		List<FieldLayoutItemDO> fieldLayoutItems = fieldLayoutItemDao.getByCustomFields(fields);
		fieldLayoutItemDao.delete(fieldLayoutItems);
		List<FieldScreenLayoutItemDO> fieldScreenLayoutItems = fieldScreenLayoutItemDao.getByCustomFields(fields);
		fieldScreenLayoutItemDao.delete(fieldScreenLayoutItems);
	}
	
	@Override
	protected void afterDelete(Collection<CustomFieldDO> fields) {
		for (CustomFieldDO field : fields) {
			fieldRegister.unregisterField("customfield_" + field.getId());
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		CustomFieldDO customField = (CustomFieldDO) obj;
		if ("type".equals(fieldName)) {
			CustomFieldTypeDO type = customField.getType();
			map.put("typeKey", type.getKey());
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<CustomFieldConfigSchemeDO> schemes = customFieldConfigSchemeDao.getList();
		Map<String, List<Map<String, Object>>> keySchemesMap = new HashMap<String, List<Map<String, Object>>>();
		for (CustomFieldConfigSchemeDO scheme : schemes) {
			Integer id = scheme.getField().getId();
			String key = "customfield_" + id;
			List<Map<String, Object>> schemeMaps = keySchemesMap.get(key);
			if (schemeMaps == null) {
				schemeMaps = new ArrayList<Map<String, Object>>();
				keySchemesMap.put(key, schemeMaps);
			}
			Map<String, Object> schemeMap = new HashMap<String, Object>();
			schemeMap.put("id", scheme.getId());
			schemeMap.put("name", scheme.getName());
			List<Map<String, Object>> typeMaps = new ArrayList<Map<String, Object>>();
			for (ActivityTypeDO type : scheme.getActivityTypes()) {
				Map<String, Object> typeMap = new HashMap<String, Object>();
				typeMap.put("id", type.getId());
				typeMap.put("name", type.getName());
				typeMap.put("url", type.getUrl());
				typeMaps.add(typeMap);
			}
			schemeMap.put("activityType", typeMaps);
			List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
			for (UnitDO unit : scheme.getUnits()) {
				Map<String, Object> unitMap = new HashMap<String, Object>();
				unitMap.put("id", unit.getId());
				unitMap.put("name", unit.getName());
				unitMaps.add(unitMap);
			}
			schemeMap.put("units", unitMaps);
			schemeMaps.add(schemeMap);
		}
		List<FieldScreenLayoutItemDO> items = fieldScreenLayoutItemDao.getByCustomField();
		Map<String, List<Map<String, Object>>> keyScreensMap = new HashMap<String, List<Map<String, Object>>>();
		for (FieldScreenLayoutItemDO item : items) {
			String key = item.getKey();
			List<Map<String, Object>> screenMaps = keyScreensMap.get(key);
			if (screenMaps == null) {
				screenMaps = new ArrayList<Map<String, Object>>();
				keyScreensMap.put(key, screenMaps);
			}
			FieldScreenTabDO tab = item.getTab();
			FieldScreenDO screen = tab.getScreen();
			Map<String, Object> screenMap = new HashMap<String, Object>();
			screenMap.put("id", screen.getId());
			screenMap.put("name", screen.getName());
			screenMap.put("tab", tab.getName());
			screenMaps.add(screenMap);
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			String key = "customfield_" + map.get("id");
			map.put("schemes", keySchemesMap.get(key));
			map.put("screens", keyScreensMap.get(key));
		}
	}
	
	@SuppressWarnings("unchecked")
	public List<CustomFieldDO> getByName(String name){
		List<CustomFieldDO> list = this.getHibernateTemplate().find("from CustomFieldDO where deleted = false and name = ?",name);
		return list;
	}
	
	public void setCustomFieldConfigSchemeDao(CustomFieldConfigSchemeDao customFieldConfigSchemeDao) {
		this.customFieldConfigSchemeDao = customFieldConfigSchemeDao;
	}
	
	public void setCustomFieldTypeDao(CustomFieldTypeDao customFieldTypeDao) {
		this.customFieldTypeDao = customFieldTypeDao;
	}
	
	public void setFieldLayoutDao(FieldLayoutDao fieldLayoutDao) {
		this.fieldLayoutDao = fieldLayoutDao;
	}
	
	public void setFieldLayoutItemDao(FieldLayoutItemDao fieldLayoutItemDao) {
		this.fieldLayoutItemDao = fieldLayoutItemDao;
	}
	
	public void setFieldScreenLayoutItemDao(FieldScreenLayoutItemDao fieldScreenLayoutItemDao) {
		this.fieldScreenLayoutItemDao = fieldScreenLayoutItemDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
}
