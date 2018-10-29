package com.usky.sms.risk.systemanalysis;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;

public class SystemAnalysisDao extends BaseDao<SystemAnalysisDO> {

	protected SystemAnalysisDao() {
		super(SystemAnalysisDO.class);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("id".equals(key) || "system.id".equals(key) || "unit.id".equals(key)) {
			if (null == value) {
				return null;
			}
			if (value instanceof Collection || value instanceof Object[]) {
				List<Integer> resultList = new ArrayList<Integer>();
				if (value instanceof Collection) {
					for (Object o : (Collection<Object>) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				} else {
					for (Object o : (Object[]) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				}
				return resultList;
			} else if (value instanceof Number) {
				return ((Number) value).intValue();
			}
			return (NumberHelper.toInteger((String) value));
		}
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 查询系统分析对应的字段(system:系统分类，unit：安监机构，subsystem：子系统，primaryWorkflow：一级流程，secondaryWorkflow：二级流程)
	 * @param field 查询的字段
	 * @param system 系统分类
	 * @param unit 安监机构
	 * @param subsystem 子系统
	 * @param primaryWorkflow 一级流程
	 * @param secondaryWorkflow 二级流程
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Object> getFieldBySearch(String field, Integer systemId, Integer unitId, String subsystem, String primaryWorkflow, String secondaryWorkflow, boolean fuzzySearch) {
		String[] fields = new String[]{"system", "unit", "subsystem", "primaryWorkflow", "secondaryWorkflow"};
		if (!Arrays.asList(fields).contains(field)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_101002013, field);
		}
		boolean objectField = false;
		if ("system".equals(field) || "unit".equals(field)) {
			objectField = true;
		}
		StringBuffer hql = new StringBuffer("select distinct ");
		if (!objectField) {
			hql.append(" t.");
		}
		hql.append(field);
		hql.append(" as ");
		hql.append(field);
		hql.append(" from SystemAnalysisDO t join t.unit as unit join t.system as system where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		if (systemId != null) {
			this.generateSearchHql("system.id", systemId, false, values, hql);
		}
		if (unitId != null) {
			this.generateSearchHql("unit.id", unitId, false, values, hql);
		}
		if (!StringUtils.isBlank(subsystem)) {
			this.generateSearchHql("subsystem", subsystem, fuzzySearch, values, hql);
		}
		if (!StringUtils.isBlank(primaryWorkflow)) {
			this.generateSearchHql("primaryWorkflow", primaryWorkflow, fuzzySearch, values, hql);
		}
		if (!StringUtils.isBlank(secondaryWorkflow)) {
			this.generateSearchHql("secondaryWorkflow", secondaryWorkflow, fuzzySearch, values, hql);
		}
		hql.append(" order by ");
		hql.append(field);
		if (objectField) {
			hql.append(".name");
		}
		return (List<Object>) this.query(hql.toString(), values.toArray());
	}
	
	private void generateSearchHql(String field, Object value, boolean fuzzySearch, List<Object> values, StringBuffer hql) {
		if (value != null) {
			hql.append(" and t.");
			hql.append(field);
			if (value instanceof String) {
				if (fuzzySearch) {
					String transferredvalue = ((String) value).replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
					transferredvalue = "%" + transferredvalue + "%";
					hql.append(" like ?");
					values.add(transferredvalue);
				} else {
					hql.append(" = ?");
					values.add(value);
				}
			} else {
				hql.append(" = ?");
				values.add(value);
			}
		}
	}
	
}

