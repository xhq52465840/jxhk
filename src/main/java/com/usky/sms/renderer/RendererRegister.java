
package com.usky.sms.renderer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RendererRegister {
	
	private static Map<String, Renderer> keyMap = new HashMap<String, Renderer>();
	
	private static Map<String, List<Renderer>> typeMap = new HashMap<String, List<Renderer>>();
	
	static {
		// checkbox
		register("checkbox", "com.sms.plugin.render.checkboxProp", "复选框渲染器");
		// date
		register("date", "com.sms.plugin.render.dateProp", "日期选择渲染器");
		// datetime
		register("datetime", "com.sms.plugin.render.datetimeProp", "日期时间选择渲染器");
		// dictionary
		register("dictionary", "com.sms.plugin.render.dictionaryProp", "数据字典单选渲染器");
		// dictionaryId
		register("dictionaryId", "com.sms.plugin.render.dictionaryIDProp", "数据字典ID单选渲染器");
		// dictionaries
		register("dictionaries", "com.sms.plugin.render.dictionariesProp", "数据字典多选渲染器");
		// singleText
		register("singleText", "com.sms.plugin.render.singleTextProp", "单行文本框渲染器");
		register("singleText", "com.sms.plugin.render.multiTextProp", "多行文本框渲染器");
		// label
		register("label", "com.sms.plugin.render.tagProp", "标签渲染器");
		// multiText
		register("multiText", "com.sms.plugin.render.multiTextProp", "多行文本框渲染器");
		// priority
		register("priority","com.sms.plugin.render.priorityProp","优先级渲染器");
		// status
		register("status","com.sms.plugin.render.statusProp","状态渲染器");
		// user
		register("user", "com.sms.plugin.render.selectUserProp", "用户选择渲染器");
		
		// activity
		register("summary", "com.sms.plugin.render.singleTextProp", "单行文本框渲染器");
		register("description", "com.sms.plugin.render.multiTextProp", "多行文本框渲染器");
		register("processors", "com.sms.plugin.render.selectUserProp", "用户选择渲染器");
		register("reporter", "com.sms.plugin.render.selectUserProp", "用户选择渲染器");
		register("originalType", "com.sms.plugin.render.originalTypeProp", "初始信息类型选择渲染器");
		
		// organization
		register("organization", "com.sms.plugin.organization.orgProp", "组织渲染器");
		register("organization", "com.sms.plugin.organization.orgTreeProp", "组织(树型)渲染器");
		register("organization", "com.sms.plugin.render.organizationProp", "机构组织渲染器");
		
		// temUnits
		register("crossUnits", "com.sms.plugin.render.unitsProp", "多安监机构渲染器");
		
		// controls
		register("controls", "com.sms.plugin.render.controlProp", "多控制措施渲染器");
		
		// insecurity
		register("insecurity", "com.sms.plugin.render.insecurityProp", "不安全状态渲染器");
	}
	
	public static void register(String type, String key, String name) {
		Renderer renderer = new Renderer(key, name);
		if (!keyMap.containsKey(key)) keyMap.put(key, renderer);
		List<Renderer> renderers = typeMap.get(type);
		if (renderers == null) {
			renderers = new ArrayList<Renderer>();
			typeMap.put(type, renderers);
		}
		renderers.add(renderer);
	}
	
	public static List<Renderer> getRenderers(String type) {
		return typeMap.get(type);
	}
	
	public static String getRendererName(String key) {
		return keyMap.get(key).getName();
	}
}
