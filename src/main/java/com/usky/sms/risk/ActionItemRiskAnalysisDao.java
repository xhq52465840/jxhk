
package com.usky.sms.risk;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class ActionItemRiskAnalysisDao extends BaseDao<ActionItemRiskAnalysisDO> {

	protected ActionItemRiskAnalysisDao() {
		super(ActionItemRiskAnalysisDO.class);
	}

	/**
	 * 通过风险分析的id获取对应的行动项的id的list
	 * @param riskAnalysisId 风险分析的id
	 * @param actionItemStatus 行动项的状态
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getActionItemIdsByRiskAnalysisId(Integer riskAnalysisId, String actionItemStatus) {
		StringBuffer hql = new StringBuffer("select t.actionItem.id from ActionItemRiskAnalysisDO t where t.riskAnalysis.id = ?");
		List<Object> params = new ArrayList<Object>();
		params.add(riskAnalysisId);
		if (actionItemStatus != null) {
			hql.append(" and t.actionItem.status = ?");
			params.add(actionItemStatus);
		}
		return (List<Integer>) this.query(hql.toString(), params.toArray());
	}
	
	/**
	 * 从多个行动项id中筛选与风险分析相关联的行动项的id
	 * @param actionItemIds
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getActionItemIdsOfRiskAnalysis(List<Integer> actionItemIds) {
		if (actionItemIds == null || actionItemIds.isEmpty()) {
			return Collections.emptyList();
		}
		return (List<Integer>) this.query("select t.actionItem.id from ActionItemRiskAnalysisDO t where t.actionItem.id in (:ids)", new String[]{"ids"}, new Object[]{actionItemIds});
	}

}
