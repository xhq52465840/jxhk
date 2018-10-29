package com.usky.sms.risk.systemanalysis;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.tem.ActionItemDao;

public class SystemAnalysisClauseDao extends BaseDao<SystemAnalysisClauseDO> {
	
	@Autowired
	private ActionItemDao actionItemDao;

	protected SystemAnalysisClauseDao() {
		super(SystemAnalysisClauseDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		SystemAnalysisClauseDO systemAnalysisClause = (SystemAnalysisClauseDO) obj;
		if (multiple && showExtendFields) {
			// 系统分析手册条款实例
			map.put("actionItems", actionItemDao.convert(actionItemDao.getActionItemsBysystemAnalysisClause(systemAnalysisClause.getId(), false)));
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Number riskErrorMapping = (Number) map.get("riskErrorMapping");
		Integer riskErrorMappingId = riskErrorMapping == null ? null : riskErrorMapping.intValue();
		Number riskThreatMapping = (Number) map.get("riskThreatMapping");
		Integer riskThreatMappingId = riskThreatMapping == null ? null : riskThreatMapping.intValue();
		this.checkConstraint(riskErrorMappingId, riskThreatMappingId, ((Number) map.get("control")).intValue());
		return true;
	}
	
	/**
	 * 唯一校验
	 * @param errorId
	 * @param threatId
	 * @param controlId
	 */
	private void checkConstraint(Integer riskErrorMappingId, Integer riskThreatMappingId, int controlId) {
		List<SystemAnalysisClauseDO> clauses = this.getClauses(riskErrorMappingId, riskThreatMappingId, controlId);
		if (!clauses.isEmpty()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在重复的手册条款！");
		}
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
	 * 根据威胁、差错和控制措施获取对应的系统分析手册条款实例
	 * @param riskErrorMappingId 差错明细行
	 * @param riskThreatMappingId 威胁明细行
	 * @param controlId 控制措施
	 * @return
	 */
	public List<SystemAnalysisClauseDO> getClauses(Integer riskErrorMappingId, Integer riskThreatMappingId, int controlId) {
		if (riskErrorMappingId == null && riskThreatMappingId == null) return null;
		StringBuilder hql = new StringBuilder("from SystemAnalysisClauseDO where deleted = ? and control.id = ?");
		List<Object> parameters = new ArrayList<Object>();
		parameters.add(false);
		parameters.add(controlId);
		if (riskErrorMappingId != null) {
			hql.append(" and riskErrorMapping.id = ?");
			parameters.add(riskErrorMappingId);
		}
		if (riskThreatMappingId != null) {
			hql.append(" and riskThreatMapping.id = ?");
			parameters.add(riskThreatMappingId);
		}
		@SuppressWarnings("unchecked")
		List<SystemAnalysisClauseDO> list = this.getHibernateTemplate().find(hql.toString(), parameters.toArray());
		return list;
	}
	
	/**
	 * 根据风险分析块明细行（威胁） 的ID获取对应的系统分析手册条款实例
	 * <br>
	 * 如果ID为null则返回empty的list
	 * @param riskThreatMappingId 风险分析块明细行（威胁） 的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<SystemAnalysisClauseDO> getByRiskThreatMappingId(Integer riskThreatMappingId) {
		if (riskThreatMappingId == null) {
			return Collections.emptyList();
		}
		return (List<SystemAnalysisClauseDO>) this.query("from SystemAnalysisClauseDO t where t.deleted = 0 and t.riskThreatMapping.id = ?", riskThreatMappingId);
	}
	
	/**
	 * 根据风险分析块明细行（差错） 的ID获取对应的系统分析手册条款实例
	 * <br>
	 * 如果ID为null则返回empty的list
	 * @param riskErrorMappingId 风险分析块明细行（差错） 的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<SystemAnalysisClauseDO> getByRiskErrorMappingId(Integer riskErrorMappingId) {
		if (riskErrorMappingId == null) {
			return Collections.emptyList();
		}
		return (List<SystemAnalysisClauseDO>) this.query("from SystemAnalysisClauseDO t where t.deleted = 0 and t.riskErrorMapping.id = ?", riskErrorMappingId);
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}
	
}

