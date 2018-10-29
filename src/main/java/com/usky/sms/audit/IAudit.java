package com.usky.sms.audit;

public interface IAudit {
	/**
	 * 获取信息所在的安监机构
	 * @param id 信息的ID
	 * @return 安监机构的ID，可为null
	 */
	public Integer getRelatedUnitId(Integer id);
	
	/**
	 * 获取信息所在的组织id
	 * @param id 信息的ID
	 * @return 组织的ID，可为null
	 */
	public Integer getRelatedOrganizationId(Integer id, String field);
}
