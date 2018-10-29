
package com.usky.sms.risk;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.tem.ActionItemDO;
import com.usky.sms.tem.ActionItemDao;

public class ClauseDao extends BaseDao<ClauseDO> {
	
	public static final SMSException EXIST_DUPLICATE_CLAUSES = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在重复的手册条款！");
	
	public static final String CLAUSE_STATUS_UNPUBLISHED = "未发布";
	
	public static final String CLAUSE_STATUS_INCOMPLETE = "未落实";
	
	public static final String CLAUSE_STATUS_COMPLETE = "落实";
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	public ClauseDao() {
		super(ClauseDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ClauseDO clause = (ClauseDO) obj;
		if ("control".equals(fieldName)) {
			map.put("title", clause.getControl().getTitle());
			map.put("controlNumber", clause.getControl().getNumber());
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	public List<ClauseDO> getClauses(Integer errorId, Integer threatId, int controlId) {
		if (errorId == null && threatId == null) return null;
		StringBuilder hql = new StringBuilder("from ClauseDO where deleted = ? and control.id = ?");
		List<Object> parameters = new ArrayList<Object>();
		parameters.add(false);
		parameters.add(controlId);
		if (errorId != null) {
			hql.append(" and error.id = ?");
			parameters.add(errorId);
		}
		if (threatId != null) {
			hql.append(" and threat.id = ?");
			parameters.add(threatId);
		}
		@SuppressWarnings("unchecked")
		List<ClauseDO> list = this.getHibernateTemplate().find(hql.toString(), parameters.toArray());
		return list;
	}
	
	public List<ClauseDO> getClauses(Integer errorId, Integer threatId) {
		if (errorId == null && threatId == null) return null;
		StringBuilder hql = new StringBuilder("from ClauseDO where deleted = ?");		
		List<Object> parameters = new ArrayList<Object>();
		parameters.add(false);
		if (errorId != null) {
			hql.append(" and error.id = ?");
			parameters.add(errorId);
		}
		if (threatId != null) {
			hql.append(" and threat.id = ?");
			parameters.add(threatId);
		}
		@SuppressWarnings("unchecked")
		List<ClauseDO> list = this.getHibernateTemplate().find(hql.toString(), parameters.toArray());
		return list;
	}
	
	private void checkConstraint(Integer errorId, Integer threatId, int controlId) {
		List<ClauseDO> clauses = this.getClauses(errorId, threatId, controlId);
		if (!clauses.isEmpty()) throw EXIST_DUPLICATE_CLAUSES;
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Number error = (Number) map.get("error");
		Integer errorId = error == null ? null : error.intValue();
		Number threat = (Number) map.get("threat");
		Integer threatId = threat == null ? null : threat.intValue();
		checkConstraint(errorId, threatId, ((Number) map.get("control")).intValue());
		map.put("status", CLAUSE_STATUS_UNPUBLISHED);
		return true;
	}
	
	@Override
	protected void beforeDelete(Collection<ClauseDO> collection) {
		for (ClauseDO clause : collection) {
			List<ActionItemDO> list = actionItemDao.getActionItemsByClause(clause.getId(), false);
			if (list != null && list.size() > 0) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败：条款下存在行动项");
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void setClauseStatus(int id, String status) {
		ClauseDO clause = this.internalGetById(id);
		if (status.equals(clause.getStatus())) return;
		clause.setStatus(status);
		this.internalUpdate(clause);
	}
	
	public List<ClauseDO> getClauseByRisk(int riskId) {
		@SuppressWarnings("unchecked")
		List<ClauseDO> list1 = this.getHibernateTemplate().find("from ClauseDO c where c.threat.analysis.risk.id = ?", riskId);
		@SuppressWarnings("unchecked")
		List<ClauseDO> list2 = this.getHibernateTemplate().find("from ClauseDO c where c.error.analysis.risk.id = ?", riskId);
		List<ClauseDO> list = new ArrayList<ClauseDO>();
		list.addAll(list1);
		list.addAll(list2);
		return list;
	}
	
	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}
	
}
