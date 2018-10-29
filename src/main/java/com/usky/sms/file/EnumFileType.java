package com.usky.sms.file;

import java.util.HashMap;
import java.util.Map;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

public enum EnumFileType {
	/**
	 * 自定义上传 ({@code 1}).
	 */
	CUSTOM("1", "CUSTOM", "自定义上传"),

	/**
	 * 安全评审上传 ({@code 2}).
	 */
	SAFETYREVIEW("2", "SAFETYREVIEW", "安全评审上传"),

	/**
	 * 安全信息上传 ({@code 3}).
	 */
	SAFETYINFORMATION("3", "SAFETYINFORMATION", "安全信息上传"),
	
	/**
	 * 审计记录上传({@code 4})
	 */
	CHECKLIST("4", "CHECKLIST","审计记录上传"),
	
	/**
	 * 工作单上传({@code 5})
	 */
	TASK("5", "TASK","工作单上传"),
	
	/**
	 * 整改反馈上传({@code 6})
	 */
	IMPROVE("6", "IMPROVE","整改反馈单上传"),
	
	/**
	 * 整改反馈记录上传({@code 7})
	 */
	IMPROVE_ITEM("7", "IMPROVE_ITEM","整改反馈记录上传"),
	
	/**
	 * 整改通知单下发文件上传({@code 8})
	 */
	IMPROVE_NOTICE_SENT("8", "IMPROVE_NOTICE_SENT","整改通知单下发文件上传"),
	
	/**
	 * 整改通知单子单响应上传({@code 9})
	 */
	SUB_IMPROVE_NOTICE_ECHO("9", "SUB_IMPROVE_NOTICE_ECHO","整改通知单子单响应上传"),
	
	/**
	 * 整改通知单问题列表上传({@code 10})
	 */
	IMPROVE_NOTICE_ISSUE("10", "IMPROVE_NOTICE_ISSUE","整改通知单问题列表上传"),
	
	/**
	 * 整改转发上传({@code 11})
	 */
	IMPROVE_TRANSMITTED("11", "IMPROVE_TRANSMITTED","整改转发上传"),
	/**
	 * 内审验证附件({@code 12})
	 */
	SUB2_3_IMPROVE_TRACE("12", "SUB2_3_IMPROVE_TRACE","内审验证附件"),
	/**
	 * 航站审计工作单附件({@code 13})
	 */
	TERM_TASK("13", "TERM_TASK", "航站审计工作单附件"),
	/**
	 * 航站审计报告({@code 14})
	 */
	TERM_AUDIT_REPORT("14", "TERM_AUDIT_REPORT", "航站审计报告"),
	
	/**
	 * 整改反馈拒绝的附件({@code 15})
	 */
	IMPROVE_REJECTED("15", "IMPROVE_REJECTED","整改反馈单上传"),
	/**
	 * 航站审计签批件({@code 16})
	 */
	TERM_TASK_QIANPIJIAN("16", "TERM_TASK_QIANPIJIAN","航站审计签批件"),
	/**
	 * 航站审计完成情况({@code 17})
	 */
	TERM_TASK_WANCHENGQINGKANG("17", "TERM_TASK_WANCHENGQINGKANG","航站审计完成情况"),
	/**
	 * 系统级，内部审计，二级内审工作单({@code 18})
	 */
	TASK_PRE_AUDIT_REPORT("18", "TASK_PRE_AUDIT_REPORT","系统级，内部审计，二级内审工作单"),
	/**
	 * 人员资质库培训课件({@code 19})
	 */
	AUDITOR_TRAIN("19", "AUDITOR_TRAIN", "人员资质库培训课件"),
	
	/**
	 * 整改通知单反馈拒绝的附件({@code 20})
	 */
	SUB_IMPROVE_NOTICE_REJECTED("20", "IMPROVE_NOTICE_REJECTED","整改通知单子单响应上传"),
	/**
	 * 航站审计审核签批件({@code 21})
	 */
	TERM_TASK_QIANPIJIAN_SHENHE("21", "TERM_TASK_QIANPIJIAN_SHENHE", "航站审计审核签批件"),
	/**
	 * 内审验证单附件({@code 22})
	 */
	SUB2_SUB3_COMFIRM_LIST("22", "SUB2_SUB3_COMFIRM_LIST", "内审验证单附件"),
	
	/** 审计验证上传({@code 23}) */
	AUDIT_CONFIRM("23", "CHECK_LIST", "审计验证上传"),
	
	/** 检查验证上传({@code 24}) */
	CHECK_CONFIRM("24", "IMPROVE_NOTICE_ISSUE", "检查验证上传"),
	
	/** 培训记录({@code 25}) */
	TRAINING_RECORD("25", "TRAINING_RECORD", "培训记录上传"),
	
	/** 站内通知({@code 26}) */
	MESSAGE("26", "MESSAGE", "站内通知上传"),
	
	/** 行动项验证上传({@code 27}) */
	ACTION_ITEM_CONFIRM("27", "ACTION_ITEM_CONFIRM", "行动项验证上传"),
	
	/** 行动项执行上传({@code 28}) */
	ACTION_ITEM_EXECUTE("28", "ACTION_ITEM_EXECUTE", "行动项执行上传"),
	;
	
	private String fileType;
	private String name;
	private String comment;

	private EnumFileType(String fileType, String name, String comment) {
		this.fileType = fileType;
		this.name = name;
		this.comment = comment;
	}

	public int getCode() {
		return Integer.parseInt(fileType);
	}

	public static EnumFileType getEnumByVal(String val) throws Exception {
		for (EnumFileType each : values()) {
            if (String.valueOf(each.getCode()).equals(val)) {
                return each;
            }
        }
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "文件类型[" + val + "]不存在!");
	}

	public String toComment() {
		return this.comment;
	}
	
	public String getName() {
		return this.name;
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> dataMap = new HashMap<String, Object>();
		dataMap.put("code", this.getCode());
		dataMap.put("name", this.getName());
		dataMap.put("comment", this.toComment());
		return dataMap;
	}
}
