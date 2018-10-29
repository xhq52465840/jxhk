package com.usky.sms.field;

import java.util.ArrayList;
import java.util.List;

public enum EnumCommonField {
	
	/** 安监机构 */
	UNIT("unit", "安监机构", "activity"),
	
	/** 信息类型 */
	TYPE("type", "信息类型", "activity"),
	
	/** 状态 */
	STATUS("status", "状态", "activity"),
	
	/** 优先级 */
	PRIORITY("priority", "优先级", "activity"),
	
	/** 标签 */
	LABEL("label", "标签", "label"),
	
	/** 安全方案 */
	SECURITY("security", "安全方案", "activity"),
	
	/** 主题 */
	SUMMARY("summary", "主题", "activity"),
	
	/** 详细描述 */
	DESCRIPTION("description", "详细描述", "activity"),
	
	/** 处理人 */
	PROCESSORS("processors", "处理人", "processor"),
	
	/** 报告时间 */
	CREATED("created", "报告时间", "activity"),
	
	/** 创建人 */
	CREATOR("creator", "创建人", "activity"),
	
	/** 是否删除 */
	DELETED("deleted", "是否删除", "activity"),
	
	/** 最后更新时间 */
	LAST_UPDATE("lastUpdate", "最后更新时间", "activity"),
	
	/** 其它安监机构 */
	CROSS_UNITS("crossUnits", "其它安监机构", "activity"),
	
	/** 发生时间 */
	OCCURRED_DATE("occurredDate", "发生时间", "occurredDate"),
	
	/** 不安全状态 */
	INSECURITY("insecurity", "不安全状态", "tem"),
	
	/** 严重程度 */
	SEVERITY("severity", "严重程度", "tem"),
	
	/** 重大风险 */
	CONSEQUENCE("consequence", "重大风险", "tem"),
	
	/** 威胁 */
	THREAT("threat", "威胁", "tem"),
	
	/** 差错 */
	ERROR("error", "差错", "tem"),
	
	/** 航班号 */
	FLIGHT_NO("flightNO", "航班号", "flightInfo"),
	
	/** 航班日期 */
	FLIGHT_DATE("flightBJDate", "航班日期", "flightInfo"),
	
	/** 飞行阶段 */
	FLIGHT_PHASE("flightPhase", "飞行阶段", "flightInfo"),
	
	/** 起飞机场 */
	DEPT_AIRPORT("deptAirport", "起飞机场", "flightInfo"),
	
	/** 到达机场 */
	ARR_AIRPORT("arrAirport", "到达机场", "flightInfo"),
	
	/** 机型 */
	AIRCRAFT_TYPE("aircraftType", "机型", "flightInfo"),
	
	/** 机号 */
	TAIL_NO("tailNO", "机号", "flightInfo"),
	
	/** 机型分类 */
	AIRCRAFT_TYPE_CAT("aircraftTypeCat", "机型分类", "flightInfo"),
	
	/** 信息编号 */
	ACTIVITY_NO("activityNo", "信息编号", "activity"),
	
	/** 是否发布 */
	RELEASE("release", "是否发布", "activity"),
	
	/** 发布时间 */
	RELEASE_DATE("releaseDate", "发布时间", "activity"),
	
	/** 组织 */
	ORGANIZATION("organization", "组织", "eventAnalysis"),
	
	/** 缺陷类型 */
	DEFECT_TYPE("defectType", "缺陷类型", "eventAnalysis"),
	
	/** 事件分析 */
	DEFECT_ANALYSIS("defectAnalysis", "事件分析", "eventAnalysis"),
	
	/** 措施类型 */
	MEASURE_TYPE("measureType", "措施类型", "eventAnalysis"),
	
	/** 制定措施 */
	ACTION_ITEM("actionItem", "制定措施", "eventAnalysis"),
	
	;
	
	private EnumCommonField(String key, String name, String group) {
		this.key = key;
		this.name = name;
		this.group = group;
	}

	/** key */
	private String key;
	
	/** 名称 */
	private String name;
	
	/** 组 */
	private String group;
	
	public static List<String> getKeyByGroup(String group) {
		List<String> result = new ArrayList<>();
		for (EnumCommonField enumCommonField : EnumCommonField.values()) {
			if (enumCommonField.getGroup().equals(group)) {
				result.add(enumCommonField.getKey());
			}
		}
		return result;
	}

	public String getKey() {
		return key;
	}

	public String getName() {
		return name;
	}

	public String getGroup() {
		return group;
	}
}
