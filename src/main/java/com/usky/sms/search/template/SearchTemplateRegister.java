
package com.usky.sms.search.template;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

public class SearchTemplateRegister {
	
	private static final Logger log = Logger.getLogger(SearchTemplateRegister.class);
	
	private static Map<String, ISearchTemplate> keyMap = new HashMap<String, ISearchTemplate>();
	
	private static Map<String, List<ISearchTemplate>> typeMap = new HashMap<String, List<ISearchTemplate>>();
	
	static {
		// checkbox
		register("checkbox", CheckboxSearchTemplate.class);
		// created
		register("created", DateSearchTemplate.class);
		// created
		register("creator", UserSearchTemplate.class);
		// date
		register("date", DateSearchTemplate.class);
		// date
		register("datetime", DatetimeSearchTemplate.class);
		// delete
		register("deleted", StringSearchTemplate.class);
		// description
		register("description", TextSearchTemplate.class);
		// dictionary
		register("dictionary", DictionarySearchTemplate.class);
		// dictionaryID
		register("dictionaryId", DictionaryIdSearchTemplate.class);
		// dictionaries
		register("dictionaries", DictionariesSearchTemplate.class);
		// lastUpdate
		register("lastUpdate", DateSearchTemplate.class);
		// priority
		register("priority", PrioritySearchTemplate.class);
		// processors
		register("processors", UsersSearchTemplate.class);
		// reporter
		register("reporter", UserSearchTemplate.class);
		// resolution
		register("resolution", ResolutionSearchTemplate.class);
		// status
		register("status", StatusSearchTemplate.class);
		// singleText
		register("singleText", StringSearchTemplate.class);
		// multiText
		register("multiText", TextSearchTemplate.class);
		// type
		register("type", TypeSearchTemplate.class);
		// unit
		register("unit", UnitSearchTemplate.class);
		// user
		register("user", UserSearchTemplate.class);
		// label
		register("label", TagSearchTemplate.class);
		// security
		// TODO:
		register("security", StringSearchTemplate.class);
		// summary
		register("summary", TextSearchTemplate.class);
		// occurredDate 发生时间
		register("occurredDate", DateSearchTemplate.class);
		// temSystem TEM系统分类
		register("temSystem", TemSystemSearchTemplate.class);
		// insecurity 不安全状态
		register("insecurity", CheckSearchTemplate.class);
		// severity 严重程度
		register("severity", CheckSearchTemplate.class);
		// consequence 重大风险
		register("consequence", CheckSearchTemplate.class);
		// threat 威胁
		register("threat", CheckSearchTemplate.class);
		// error 差错
		register("error", CheckSearchTemplate.class);
		// flightNO 航班号
		register("flightNO", FlightNOSearchTemplate.class);
		// flightBJDate 航班日期
		register("flightBJDate", DateSearchTemplate.class);
		// flightPhase 飞行阶段
		register("flightPhase", FlightPhaseSearchTemplate.class);
		// deptAirport 起飞机场
		register("deptAirport", AirportSearchTemplate.class);
		// arrAirport 到达机场
		register("arrAirport", AirportSearchTemplate.class);
		// aircraftType 机型(小机型)
		register("aircraftType", CraftSearchTemplate.class);
		// tailNO 机号
		register("tailNO", TailNOSearchTemplate.class);
		// aircraftTypeCat 机型分类(大机型)
		register("aircraftTypeCat", AircraftTypeCatSearchTemplate.class);
		
		// organization
		//		register("organization", OrganizationSearchTemplate.class);
		// activityNo 信息编号
		register("activityNo", StringSearchTemplate.class);
		// 发布
		register("release", ReleaseSearchTemplate.class);
		// 发布时间
		register("releaseDate", DateSearchTemplate.class);
		// 初始信息类型
		register("originalType", OriginalTypeSearchTemplate.class);
		// 组织
		register("organization", OrganizationSearchTemplate.class);
		// defectType 缺陷类型
		register("defectType", CheckSearchTemplate.class);
		// defectAnalysis 缺陷分析
		register("defectAnalysis", StringSearchTemplate.class);
		// measureType 措施类型
		register("measureType", CheckSearchTemplate.class);
		// actionItem 制定措施
		register("actionItem", StringSearchTemplate.class);
		// controls
		register("controls", ControlsSearchTemplate.class);
	}
	
	/**
	 * 搜索器的注册
	 * @param type 搜索器的类型(与自定义字段的key对应), 可以对应多个搜索器
	 * @param templateClass 搜索器的class
	 */
	public static void register(String type, Class<? extends ISearchTemplate> templateClass) {
		try {
			ISearchTemplate searchTemplate = templateClass.getConstructor().newInstance();
			String key = searchTemplate.getKey();
			if (!keyMap.containsKey(key)) keyMap.put(key, searchTemplate);
			List<ISearchTemplate> templates = typeMap.get(type);
			if (templates == null) {
				templates = new ArrayList<ISearchTemplate>();
				typeMap.put(type, templates);
			}
			templates.add(searchTemplate);
		} catch (Exception e) {
			log.warn("ISearchTemplate[" + templateClass.getName() + "] registration failed!");
			e.printStackTrace();
		}
	}
	
	public static ISearchTemplate getSearchTemplate(String key) {
		return keyMap.get(key);
	}
	
	public static List<ISearchTemplate> getSearchTemplates(String type) {
		return typeMap.get(type);
	}
	
}
