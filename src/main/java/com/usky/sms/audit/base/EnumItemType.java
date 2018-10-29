package com.usky.sms.audit.base;

import java.util.ArrayList;
import java.util.List;

public enum EnumItemType {
	/**
	 * 公司安全运行审计标准检查单.
	 */
	SYS_STD("公司安全运行审计标准检查单", "SYS"),
	/**
	 * 公司新增检查项.
	 */
	SYS_ADD("公司新增检查项", "SYS"),
	/**
	 * 临时检查项.
	 */
	TEMP("临时检查项", "TEMP"),
	/**
	 * 公司航站安全审计标准检查单.
	 */
	TERM_STD("公司航站安全审计标准检查单", "TERM"),
	/**
	 * 航站新增检查项.
	 */
	TERM_ADD("航站新增检查项", "TERM"),
	/**
	 * 公司现场检查标准检查单.
	 */
	SPOT_STD("公司现场检查标准检查单", "SPOT"),
	/**
	 * 现场检查新增检查项.
	 */
	SPOT_ADD("现场检查新增检查项", "SPOT"),
	/**
	 * 公司专项检查单.
	 */
	SPEC_STD("公司专项检查单", "SPEC"),
	/**
	 * 专项检查新增检查项.
	 */
	SPEC_ADD("专项检查新增检查项", "SPEC"),
	/**
	 * 分子公司新增检查项.
	 */
	SUB_ADD("分子公司新增检查项", "SUB");

	private String description;

	private String category;

	private EnumItemType(String description, String category) {
		this.description = description;
		this.category = category;
	}

	public String getDescription() {
		return this.description;
	}

	public String getCategory() {
		return this.category;
	}

	public static String getEnumByVal(String val) {
		String desc = "";
		for (EnumItemType each : values()) {
			if (each.toString().equals(val)) {
				desc = each.description;
			}
		}
		return desc;
	}
	
	public static List<String> getByCategory(String category) {
		List<String> list = new ArrayList<String>();
		for (EnumItemType itemType : EnumItemType.values()) {
			if (null != category && !itemType.getCategory().equals(category)) {
				continue;
			}
			list.add(itemType.name());
		}
		return list;
	}
}
