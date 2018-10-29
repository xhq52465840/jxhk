
package com.usky.sms.field;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.AbstractCache;
import com.usky.sms.custom.CustomFieldDO;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.renderer.Renderer;
import com.usky.sms.renderer.RendererRegister;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;

public class FieldRegister extends AbstractCache {
	
	private static final Logger log = Logger.getLogger(FieldRegister.class);
	
	private Map<String, Field> fieldMap = new HashMap<String, Field>();
	
	@Autowired
	private CustomFieldDao customFieldDao;
	
	@Override
	protected void refresh() {
		fieldMap.clear();
		registerFields();
	}
	
	private void registerFields() {
		registerCommonFields();
		registerCustomFields();
	}
	
	private void registerCommonFields() {
		registerField("unit", "安监机构", null, "com.sms.plugin.render.unitProp", true, true);
		registerField("type", "信息类型", null, "com.sms.plugin.render.activityTypeProp", false, true);
		registerField("status", "状态", null, "com.sms.plugin.render.statusProp", true, true);
		registerField("priority", "优先级", null, "com.sms.plugin.render.priorityProp", true, true);
		registerField("label", "标签", null, "com.sms.plugin.render.tagProp", true, true);
		registerField("security", "安全方案", null, "text", false, false);
		registerField("summary", "主题", null, "com.sms.plugin.render.summaryProp", true, true);
		registerField("description", "详细描述", null, "com.sms.plugin.render.multiTextProp", true, true);
		registerField("processors", "处理人", null, "com.sms.plugin.render.selectUsersProp", true, true);
		//		registerField("creator", "创建人", null, "text", false);
		//		registerField("reporter", "报告人", null, "com.sms.plugin.render.selectUserProp", false);
		registerField("created", "报告时间", null, "com.sms.plugin.render.dateProp", true, true);
		registerField("creator", "创建人", null, "com.sms.plugin.render.selectUserProp", true, true);
		// TODO:
		registerField("deleted", "是否删除", null, "com.sms.plugin.render.singleTextProp", false, false);
		registerField("lastUpdate", "最后更新时间", null, "com.sms.plugin.render.dateProp", true, true);
		// TEM
		registerField("crossUnits", "其它安监机构", null, "com.sms.plugin.render.unitsProp", false, false);
		// occurredDate 发生时间
		registerField("occurredDate", "发生时间", null, "com.sms.plugin.render.dateProp", true, true);
		// temSystem TEM系统分类
		registerField("temSystem", "TEM系统分类", null, null, "com.sms.plugin.search.temSystemProp", null, false, false);
		// insecurity 不安全状态
		registerField("insecurity", "不安全状态", null, "com.sms.plugin.render.insecurityProp", "com.sms.plugin.search.checkProp", "insecurity", true, true);
		// severity 严重程度
		registerField("severity", "严重程度", null, null, "com.sms.plugin.search.checkProp", "severity", true, true);
		// consequence 重大风险
		registerField("consequence", "重大风险", null, null, "com.sms.plugin.search.checkProp", "consequence", true, true);
		// threat 威胁
		registerField("threat", "威胁", null, null, "com.sms.plugin.search.checkProp", "threat", true, true);
		// error 差错
		registerField("error", "差错", null, null, "com.sms.plugin.search.checkProp", "error", true, true);
		// flightNO 航班号
		registerField("flightNO", "航班号", null, null, "com.sms.plugin.search.flightNOProp", null, true, true);
		// flightBJDate 航班日期
		registerField("flightBJDate", "航班日期", null, null, "com.sms.plugin.search.dateProp", null, false, false);
		// flightPhase 飞行阶段
		registerField("flightPhase", "飞行阶段", null, null, "com.sms.plugin.search.flightPhaseProp", null, true, true);
		// deptAirport 起飞机场
		registerField("deptAirport", "起飞机场", null, null, "com.sms.plugin.search.airportProp", null, true, true);
		// arrAirport 到达机场
		registerField("arrAirport", "到达机场", null, null, "com.sms.plugin.search.airportProp", null, true, true);
		// aircraftType 机型
		registerField("aircraftType", "机型", null, null, "com.sms.plugin.search.craftProp", null, false, false);
		// tailNO 机号
		registerField("tailNO", "机号", null, null, "com.sms.plugin.search.tailNOProp", null, false, false);
		// aircraftTypeCat 机型分类
		registerField("aircraftTypeCat", "机型分类", null, null, "com.sms.plugin.search.aircraftTypeCatProp", null, true, true);
		// activityNo 信息编号
		registerField("activityNo", "信息编号", null, "com.sms.plugin.render.singleTextProp", "com.sms.plugin.search.stringProp", null, true, true);
		// release 发布
		registerField("release", "是否发布", null, "com.sms.plugin.render.publishProp", "com.sms.plugin.search.publishProp", null, true, true);
		// releaseDate 发布时间
		registerField("releaseDate", "发布时间", null, null, "com.sms.plugin.search.dateProp", null, false, false);
		// 组织
		registerField("organization", "组织", null, "com.sms.plugin.render.organizationProp", false, false);
		// defectType 缺陷类型
		registerField("defectType", "缺陷类型", null, null, "com.sms.plugin.search.dictionariesProp", "缺陷类型", false, true);
		// defectAnalysis 缺陷分析
		registerField("defectAnalysis", "事件分析", null, "com.sms.plugin.render.singleTextProp", "com.sms.plugin.search.stringProp", null, false, true);
		// measureType 措施类型
		registerField("measureType", "措施类型", null, null, "com.sms.plugin.search.dictionariesProp", "措施类型", false, true);
		// actionItem 制定措施
		registerField("actionItem", "制定措施", null, "com.sms.plugin.render.singleTextProp", "com.sms.plugin.search.stringProp", null, false, true);
	}
	
	private void registerCustomFields() {
		List<CustomFieldDO> customFields = customFieldDao.getAllList();
		for (CustomFieldDO customField : customFields) {
			String type = customField.getType().getKey();
			List<Renderer> renderers = RendererRegister.getRenderers(type);
			String rendererKey = "";
			if (null != renderers && !renderers.isEmpty()) {
				rendererKey = renderers.get(0).getKey();
			}
			registerField("customfield_" + customField.getId(), customField.getName(), customField.getDescription(), rendererKey, customField.getSearcher(), customField.getConfig(), customField.isSearchable(), customField.isDisplay());
		}
	}
	
	/**
	 * 
	 * @param key 自定义字段的key值，与SearchTemplateRegister注册的type值对应(根据key值查找注册的搜索模板，如果有多个模板则取第一个)
	 * @param name 自定义字段的名称
	 * @param description 自定义字段的描述
	 * @param renderer 自定义字段的渲染器
	 * @param searchable 指定该自定义字段是否加入可搜索
	 * @param display 指定该自定义字段是否加入安全信息检索的显示列
	 */
	public void registerField(String key, String name, String description, String renderer, boolean searchable, boolean display) {
		List<ISearchTemplate> templates = SearchTemplateRegister.getSearchTemplates(key);
		String template;
		if (templates != null && templates.size() > 0) {
			template = templates.get(0).getKey();
		} else {
			template = null;
			log.warn("字段<" + key + ">没有搜索模板！");
		}
		Field field = new Field(key, name, description, renderer, template, null, searchable, display);
		fieldMap.put(key, field);
	}
	
	/**
	 * 
	 * @param key 自定义字段的key值
	 * @param name 自定义字段的名称
	 * @param description 自定义字段的描述
	 * @param renderer 自定义字段的渲染器
	 * @param searcher 自定义字段的搜索器
	 * @param config 自定义字段的配置项
	 * @param searchable 指定该自定义字段是否加入可搜索
	 * @param display 指定该自定义字段是否加入安全信息检索的显示列
	 */
	public void registerField(String key, String name, String description, String renderer, String searcher, String config, boolean searchable, boolean display) {
		Field field = new Field(key, name, description, renderer, searcher, config, searchable, display);
		fieldMap.put(key, field);
	}
	
	public void unregisterField(String key) {
		fieldMap.remove(key);
	}
	
	public Collection<Field> getAllFields() {
		return fieldMap.values();
	}
	
	public Field getField(String key) {
		return fieldMap.get(key);
	}
	
	public String getFieldName(String key) {
		Field field = getField(key);
		if (field == null) return null;
		return field.getName();
	}
	
	public String getFieldDescription(String key) {
		Field field = getField(key);
		if (field == null) return null;
		return field.getDescription();
	}
	
	public String getFieldRenderer(String key) {
		Field field = getField(key);
		if (field == null) return null;
		return field.getRenderer();
	}
	
	public String getFieldSearcher(String key) {
		Field field = getField(key);
		if (field == null) return null;
		return field.getSearcher();
	}
	
	public void setCustomFieldDao(CustomFieldDao customFieldDao) {
		this.customFieldDao = customFieldDao;
	}
	
}
