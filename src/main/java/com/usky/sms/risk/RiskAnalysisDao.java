
package com.usky.sms.risk;

import java.util.List;
import java.util.Map;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class RiskAnalysisDao extends BaseDao<RiskAnalysisDO> {
	
	public static final String RISK_ANALYSIS_STATUS_DRAFT = "草稿";
	
	public static final String RISK_ANALYSIS_STATUS_COMMIT = "已提交";
	
	public RiskAnalysisDao() {
		super(RiskAnalysisDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("status", RISK_ANALYSIS_STATUS_DRAFT);
		return true;
	}
	
	@Override
	protected void afterSave(RiskAnalysisDO analysis) {
		analysis.setCreator(UserContext.getUser());
		this.internalUpdate(analysis);
	}
	
	public List<RiskAnalysisDO> getRiskAnalysesByRisk(int riskId) {
		@SuppressWarnings("unchecked")
		List<RiskAnalysisDO> list = this.getHibernateTemplate().find("from RiskAnalysisDO r where r.risk.id = ?", riskId);
		return list;
	}
	
}
