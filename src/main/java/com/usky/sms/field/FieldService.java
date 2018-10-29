
package com.usky.sms.field;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.activity.ActivityOperation;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeDO;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeDao;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeEntityDao;
import com.usky.sms.field.screen.FieldScreenDO;
import com.usky.sms.field.screen.FieldScreenDao;
import com.usky.sms.field.screen.FieldScreenLayoutItemDO;
import com.usky.sms.field.screen.FieldScreenLayoutItemDao;
import com.usky.sms.field.screen.FieldScreenSchemeDO;
import com.usky.sms.field.screen.FieldScreenSchemeDao;
import com.usky.sms.field.screen.FieldScreenSchemeItemDao;
import com.usky.sms.field.screen.FieldScreenTabDO;
import com.usky.sms.field.screen.FieldScreenTabDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.renderer.RendererRegister;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.unit.UnitDao;

public class FieldService extends AbstractService {
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private ActivityTypeFieldScreenSchemeDao activityTypeFieldScreenSchemeDao;
	
	@Autowired
	private ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao;
	
	@Autowired
	private FieldLayoutDao fieldLayoutDao;
	
	@Autowired
	private FieldLayoutItemDao fieldLayoutItemDao;
	
	@Autowired
	private FieldLayoutSchemeDao fieldLayoutSchemeDao;
	
	@Autowired
	private FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	@Autowired
	private FieldScreenDao fieldScreenDao;
	
	@Autowired
	private FieldScreenLayoutItemDao fieldScreenLayoutItemDao;
	
	@Autowired
	private FieldScreenSchemeDao fieldScreenSchemeDao;
	
	@Autowired
	private FieldScreenSchemeItemDao fieldScreenSchemeItemDao;
	
	@Autowired
	private FieldScreenTabDao fieldScreenTabDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UnitDao unitDao;
	
	public void copyActivityTypeFieldScreenScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("activityTypeFieldScreenScheme"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			activityTypeFieldScreenSchemeDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void copyFieldLayout(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("fieldLayout"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			fieldLayoutDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void copyFieldLayoutScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("fieldLayoutScheme"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			fieldLayoutSchemeDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void copyFieldScreen(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("fieldScreen"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			fieldScreenDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void copyFieldScreenScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("fieldScreenScheme"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			fieldScreenSchemeDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setFieldTabMapping(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String key = request.getParameter("key");
			List<Map<String, Object>> mapping = gson.fromJson(request.getParameter("mapping"), new TypeToken<List<Map<String, Object>>>() {}.getType());
			fieldScreenLayoutItemDao.setFieldTabMapping(key, mapping);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void sortFieldScreenLayoutItem(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer[] itemIds = gson.fromJson(request.getParameter("itemIds"), Integer[].class);
			fieldScreenLayoutItemDao.sort(itemIds);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void sortFieldScreenTab(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer[] tabIds = gson.fromJson(request.getParameter("tabIds"), Integer[].class);
			fieldScreenTabDao.sort(tabIds);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityTypeFieldScreenSchemeEntities(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int schemeId = Integer.parseInt(request.getParameter("scheme"));
			ActivityTypeFieldScreenSchemeDO scheme = activityTypeFieldScreenSchemeDao.internalGetById(schemeId);
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("scheme", scheme.getName());
			data.put("entities", activityTypeFieldScreenSchemeEntityDao.convert(activityTypeFieldScreenSchemeEntityDao.getSortedSchemesByActivityTypeFieldScreenSchemeId(schemeId)));
			data.put("units", unitDao.convert(unitDao.getByActivityTypeFieldScreenSchemeId(schemeId)));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getAllFields(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Collection<Field> fields = fieldRegister.getAllFields();
			String screenId = request.getParameter("screenId");
			try {
				Integer id = Integer.parseInt(screenId);
				List<Field> fieldList = new ArrayList<Field>();
				List<FieldScreenLayoutItemDO> items = fieldScreenLayoutItemDao.getByFieldScreenId(id);
				for (Field field : fields) {
					boolean contain = false;
					for (FieldScreenLayoutItemDO item : items) {
						if (field.getKey().equals(item.getKey())) {
							contain = true;
							break;
						}
					}
					if (!contain) fieldList.add(field);
				}
				fields = fieldList;
			} catch (NumberFormatException e) {
				// do nothing
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(new ArrayList<Field>(fields), request));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取所有可显示的字段
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAllDisplayFields(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Collection<Field> fields = fieldRegister.getAllFields();
			List<Field> fieldList = new ArrayList<Field>();
			for (Field field : fields) {
				
				if (field.isDisplay()) {
					fieldList.add(field);
				}
			}
			fields = fieldList;
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(new ArrayList<Field>(fields), request));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getFieldLayoutItems(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int layoutId = Integer.parseInt(request.getParameter("layout"));
			FieldLayoutDO layout = fieldLayoutDao.internalGetById(layoutId);
			List<Map<String, Object>> itemMaps = fieldLayoutItemDao.convert(fieldLayoutItemDao.getByFieldLayoutId(layoutId));
			List<FieldScreenLayoutItemDO> fieldScreenLayoutItems = fieldScreenLayoutItemDao.getAllList();
			Map<String, List<Map<String, Object>>> keyScreensMap = new HashMap<String, List<Map<String, Object>>>();
			for (FieldScreenLayoutItemDO item : fieldScreenLayoutItems) {
				String key = item.getKey();
				List<Map<String, Object>> screenMaps = keyScreensMap.get(key);
				if (screenMaps == null) {
					screenMaps = new ArrayList<Map<String, Object>>();
					keyScreensMap.put(key, screenMaps);
				}
				Map<String, Object> screenMap = new HashMap<String, Object>();
				FieldScreenTabDO tab = item.getTab();
				FieldScreenDO screen = tab.getScreen();
				screenMap.put("id", screen.getId());
				screenMap.put("name", screen.getName());
				screenMap.put("tab", tab.getName());
				screenMaps.add(screenMap);
			}
			for (Map<String, Object> itemMap : itemMaps) {
				itemMap.put("screens", keyScreensMap.get(itemMap.get("key")));
				itemMap.put("rendererName", RendererRegister.getRendererName((String) itemMap.get("renderer")));
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("layout", layout.getName());
			data.put("items", itemMaps);
			data.put("units", unitDao.convert(unitDao.getByFieldLayoutId(layoutId)));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getFieldLayoutSchemeEntities(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int schemeId = Integer.parseInt(request.getParameter("scheme"));
			FieldLayoutSchemeDO scheme = fieldLayoutSchemeDao.internalGetById(schemeId);
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("layout", scheme.getName());
			data.put("entities", fieldLayoutSchemeEntityDao.convert(fieldLayoutSchemeEntityDao.getByFieldLayoutSchemeId(schemeId)));
			data.put("units", unitDao.convert(unitDao.getByFieldLayoutSchemeId(schemeId)));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getFieldScreenSchemeItems(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int schemeId = Integer.parseInt(request.getParameter("scheme"));
			FieldScreenSchemeDO scheme = fieldScreenSchemeDao.internalGetById(schemeId);
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("scheme", scheme.getName());
			data.put("tabs", fieldScreenSchemeItemDao.convert(fieldScreenSchemeItemDao.getByFieldScreenSchemeId(schemeId)));
			data.put("units", unitDao.convert(unitDao.getByFieldScreenSchemeId(schemeId)));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getFieldScreenTabs(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			boolean manage = Boolean.parseBoolean(request.getParameter("manage"));
			Integer typeId = null;
			FieldScreenDO screen;
			if (manage) {
				screen = fieldScreenDao.internalGetById(Integer.parseInt(request.getParameter("screen")));
			} else {
				int unitId = Integer.parseInt(request.getParameter("unit"));
				typeId = Integer.parseInt(request.getParameter("type"));
				screen = fieldScreenDao.getFieldScreen(unitId, typeId, ActivityOperation.VIEW);
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("id", screen.getId());
			if (!manage) {
				data.put("type", activityTypeDao.convert(activityTypeDao.internalGetById(typeId)));
				data.put("admin", permissionSetDao.hasPermission(PermissionSets.ADMIN.getName()));
			}
			data.put("screen", screen.getName());
			data.put("tabs", fieldScreenTabDao.convert(fieldScreenTabDao.getSortedTabsByFieldScreenId(screen.getId())));
			data.put("units", unitDao.convert(unitDao.getByFieldScreenId(screen.getId())));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getFieldTabMapping(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String key = request.getParameter("key");
			List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
			List<FieldScreenTabDO> tabs = fieldScreenTabDao.getAllList();
			List<FieldScreenLayoutItemDO> items = fieldScreenLayoutItemDao.getByField(key);
			for (FieldScreenTabDO tab : tabs) {
				Integer screenId = tab.getScreen().getId();
				Integer tabId = tab.getId();
				Map<String, Object> screenMap = null;
				for (Map<String, Object> map : data) {
					Integer id = (Integer) map.get("id");
					if (screenId.equals(id)) {
						screenMap = map;
						break;
					}
				}
				if (screenMap == null) {
					screenMap = new HashMap<String, Object>();
					screenMap.put("id", screenId);
					screenMap.put("name", tab.getScreen().getName());
					screenMap.put("tabs", new ArrayList<Map<String, Object>>());
					data.add(screenMap);
				}
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> tabList = (List<Map<String, Object>>) screenMap.get("tabs");
				Map<String, Object> tabMap = new HashMap<String, Object>();
				tabMap.put("id", tabId);
				tabMap.put("name", tab.getName());
				boolean selected = false;
				for (FieldScreenLayoutItemDO item : items) {
					if (item.getTab().getId().equals(tabId)) {
						selected = true;
						items.remove(item);
						break;
					}
				}
				tabMap.put("selected", selected);
				tabList.add(tabMap);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取可查询的字段
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getSearchFields(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Collection<Field> fields = fieldRegister.getAllFields();
			List<Field> fieldList = new ArrayList<Field>();
			for (Field field : fields) {
				System.out.println("name: " + field.getName() + "; searcher: " + SearchTemplateRegister.getSearchTemplate(field.getSearcher()) + "; searchable: " + field.isSearchable());
				if (StringUtils.isNotBlank(field.getSearcher())) {
					if (null != SearchTemplateRegister.getSearchTemplate(field.getSearcher()) && field.isSearchable()) {
						fieldList.add(field);
					}
				}
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(new ArrayList<Field>(fieldList), request));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setActivityTypeFieldScreenSchemeDao(ActivityTypeFieldScreenSchemeDao activityTypeFieldScreenSchemeDao) {
		this.activityTypeFieldScreenSchemeDao = activityTypeFieldScreenSchemeDao;
	}
	
	public void setActivityTypeFieldScreenSchemeEntityDao(ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao) {
		this.activityTypeFieldScreenSchemeEntityDao = activityTypeFieldScreenSchemeEntityDao;
	}
	
	public void setFieldLayoutDao(FieldLayoutDao fieldLayoutDao) {
		this.fieldLayoutDao = fieldLayoutDao;
	}
	
	public void setFieldLayoutItemDao(FieldLayoutItemDao fieldLayoutItemDao) {
		this.fieldLayoutItemDao = fieldLayoutItemDao;
	}
	
	public void setFieldLayoutSchemeDao(FieldLayoutSchemeDao fieldLayoutSchemeDao) {
		this.fieldLayoutSchemeDao = fieldLayoutSchemeDao;
	}
	
	public void setFieldLayoutSchemeEntityDao(FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao) {
		this.fieldLayoutSchemeEntityDao = fieldLayoutSchemeEntityDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
	public void setFieldScreenDao(FieldScreenDao fieldScreenDao) {
		this.fieldScreenDao = fieldScreenDao;
	}
	
	public void setFieldScreenLayoutItemDao(FieldScreenLayoutItemDao fieldScreenLayoutItemDao) {
		this.fieldScreenLayoutItemDao = fieldScreenLayoutItemDao;
	}
	
	public void setFieldScreenSchemeDao(FieldScreenSchemeDao fieldScreenSchemeDao) {
		this.fieldScreenSchemeDao = fieldScreenSchemeDao;
	}
	
	public void setFieldScreenSchemeItemDao(FieldScreenSchemeItemDao fieldScreenSchemeItemDao) {
		this.fieldScreenSchemeItemDao = fieldScreenSchemeItemDao;
	}
	
	public void setFieldScreenTabDao(FieldScreenTabDao fieldScreenTabDao) {
		this.fieldScreenTabDao = fieldScreenTabDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
}
