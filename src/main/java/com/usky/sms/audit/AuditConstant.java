package com.usky.sms.audit;

/**
 * 审计模块所使用的常量
 * @author zheng.xl
 *
 */
public interface AuditConstant {

	/** 审计编号前缀 {@value}*/
	String PRE_AUDIT_SN = "HO";
	
	/** 审计代号 {@value} */
	String AUDIT_CODE = "A";
	
	/** 检查代号 {@value} */
	String CHECK_CODE = "C";
	
	/** 部门代号 {@value} */
	String DEPARTMENT = "DP";
	
	/** 专项检查代号 {@value} */
	String SPEC_CODE = "EC";
	
	/** 专项检查名称 {@value} */
	String SPEC_NAME = "专项检查";
	
	/** 检查单代号 {@value} */
	String CHECK_LIST_CODE = "CL";
	
	/** 整改反馈代号 {@value} */
	String RECTIFICATION_CODE = "RE";
	
	/** 跟踪表代号 {@value} */
	String TRACE_CODE = "TR";
	
	/** 安监部名称 {@value} */
	String SAFETY_SUPERVISION_DEPT = "安全监察部";
	
	/** 责任单位ID安监机构前缀 {@value} */
	String IMPROVE_UNIT_ID_PREFIX_UT = "UT";
	
	/** 责任单位ID组织前缀 {@value} */
	String IMPROVE_UNIT_ID_PREFIX_DP = "DP";
	
	/** 安全的名称 {@value} */
	String SAFETY_NAME = "安全";
	
	/** 审计的名称 {@value} */
	String AUDIT_NAME = "审计";
	
	/** 检查的名称 {@value} */
	String CHECK_NAME = "检查";
	
	/** 现场/日常检查的名称 {@value} */
	String SPEC_SPOT_CHECK_NAME = "现场/日常检查";
	
	/** 工作单名称后缀 {@value} */
	String TASK_SUFIX = "工作单";
	
	/** 报告名称后缀 {@value} */
	String REPORT_SUFIX = "报告";
	
	/** 航站名称 {@value} */
	String TERMINAL_NAME = "航站";
	
	/** 公司名称 {@value} */
	String COMPANY_NAME = "公司";
}
