package com.usky.sms.field;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import com.usky.sms.core.AbstractCache;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;

public class FieldQarRegister extends AbstractCache{

    private static final Logger log = Logger.getLogger(FieldQarRegister.class);
	
	private Map<String, Field> fieldMap = new HashMap<String, Field>();
	
	@Override
	protected void refresh() {
		fieldMap.clear();
		registerFields();
	}
	
	private void registerFields() {
		registerCommonFields();
	}
	
	//配置查询条件
	private void registerCommonFields() {
		
		registerField("takeoff_runway", "起飞跑道", null, "com.sms.plugin.render.singleTextProp","com.sms.plugin.search.textProp");
		registerField("landing_runway", "降落跑道", null, "com.sms.plugin.render.singleTextProp","com.sms.plugin.search.textProp");
		registerField("version_no", "版本号", null, "com.sms.plugin.render.singleTextProp","com.sms.plugin.search.textProp");
		registerField("procedure_no", "进程号", null, "com.sms.plugin.render.singleTextProp","com.sms.plugin.search.textProp");
		registerField("procedure_type", "程序类型", null, "com.sms.plugin.render.singleTextProp","com.sms.plugin.search.textProp");
		registerField("flight_phase_no", "飞行阶段", null, "com.sms.plugin.render.singleTextProp","com.sms.plugin.search.textProp");
	}
	
	public void registerField(String key, String name, String description, String renderer) {
		List<ISearchTemplate> templates = SearchTemplateRegister.getSearchTemplates(key);
		String template;
		if (templates != null && templates.size() > 0) {
			template = templates.get(0).getKey();
		} else {
			template = null;
			log.warn("字段<" + key + ">没有搜索模板！");
		}
		Field field = new Field(key, name, description, renderer, template, null);
		fieldMap.put(key, field);
	}
	
	public void registerField(String key, String name, String description, String renderer, String searcher) {
		Field field = new Field(key, name, description, renderer, searcher, null);
		fieldMap.put(key, field);
	}
	
	public void unregisterField(String key) {
		fieldMap.remove(key);
	}
	
	public Collection<Field> getAllFields() {
		refresh();
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
		
}
