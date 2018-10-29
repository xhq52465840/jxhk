package com.usky.sms.audit.workflow;

import java.lang.reflect.Field;
import java.text.Collator;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.uwf.WfSetup;


public class AuditWorkflowSchemeDao extends BaseDao<AuditWorkflowSchemeDO> {
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	protected AuditWorkflowSchemeDao() {
		super(AuditWorkflowSchemeDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		AuditWorkflowSchemeDO auditWorkflowScheme = (AuditWorkflowSchemeDO) obj;
		if ("auditInfoType".equals(fieldName)) {
			Map<String, Object> planTypeMap = null;
			if (null != auditWorkflowScheme.getAuditInfoType()) {
				planTypeMap = new HashMap<String, Object>();
				planTypeMap.put("id", auditWorkflowScheme.getAuditInfoType());
				try {
					planTypeMap.put("name", EnumAuditInfoType.getEnumByVal(auditWorkflowScheme.getAuditInfoType()).getName());
				} catch (Exception e) {
					e.printStackTrace();
					planTypeMap.put("name", "未知类型");
				}
			}
			map.put(fieldName, planTypeMap);
		} else if ("workflowTemplate".equals(fieldName)) {
			Map<String, Object> workflowTemplateMap = null;
			if (null != auditWorkflowScheme.getWorkflowTemplate()) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> workflowTemplateMaps = ((List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetSetupList", auditWorkflowScheme.getWorkflowTemplate()));
				if (null != workflowTemplateMaps && !workflowTemplateMaps.isEmpty()) {
					workflowTemplateMap = workflowTemplateMaps.get(0);
				}
			}
			map.put(fieldName, workflowTemplateMap);
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		
	}

	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap,
			Map<String, Object> searchMap, List<String> orders) {
		super.afterGetList(list, paramMap, searchMap, orders);
		Collections.sort(list, new Comparator<Map<String, Object>>() {
			Collator collator = Collator.getInstance();
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				@SuppressWarnings("unchecked")
				String name1 = (String)((Map<String, Object>) o1.get("auditInfoType")).get("name");
				@SuppressWarnings("unchecked")
				String name2 = (String)((Map<String, Object>) o2.get("auditInfoType")).get("name");
				return collator.compare(name1, name2);
			}
		});
	}

	public AuditWorkflowSchemeDO getByAuditInfoType (String auditInfoType) {
		if (null == auditInfoType) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<AuditWorkflowSchemeDO> list = (List<AuditWorkflowSchemeDO>) this.query("from AuditWorkflowSchemeDO where deleted = '0' and auditInfoType = ?", auditInfoType);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}
	
	/**
	 * 添加审计工作流
	 * @param auditInfoType
	 * @param workflowTemplate
	 * @return
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public int addAuditWorkflowScheme (String auditInfoType, String workflowTemplate) {
		AuditWorkflowSchemeDO auditWorkflowScheme = this.getByAuditInfoType(auditInfoType);
		if (null == auditWorkflowScheme) {
			auditWorkflowScheme = new AuditWorkflowSchemeDO();
			auditWorkflowScheme.setAuditInfoType(auditInfoType);
		}
		auditWorkflowScheme.setWorkflowTemplate(workflowTemplate);
		this.getHibernateTemplate().saveOrUpdate(auditWorkflowScheme);
		return auditWorkflowScheme.getId();
	}
	
	/**
	 * 根据审计信息类型获取对应的工作流模板id
	 * @param planType
	 * @param checkType
	 * @param entityName
	 * @return
	 * @throws Exception 
	 */
	public String getWorkflowTempIdBySearch(String planType, String checkType, String entityName) {
		StringBuffer auditInfoType = new StringBuffer();
		if (!StringUtils.isBlank(checkType)) {
			auditInfoType.append(checkType);
			auditInfoType.append("_");
		}
		auditInfoType.append(planType);
		auditInfoType.append("_");
		auditInfoType.append(StringUtils.upperCase(entityName));
		AuditWorkflowSchemeDO auditWorkflowScheme = this.getByAuditInfoType(auditInfoType.toString());
		if (null == auditWorkflowScheme) {
			try {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, EnumAuditInfoType.getEnumByVal(auditInfoType.toString()).getName() + "的工作流没有配置!");
			} catch (Exception e) {
				e.printStackTrace();
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
			}
		}
		return auditWorkflowScheme.getWorkflowTemplate();
	}

	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}

}
