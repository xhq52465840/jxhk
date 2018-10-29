
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.ActionItemDO;

/**
 * 行动项与风险分析关联的视图
 * CREATE OR REPLACE VIEW A_ACTION_ITEM_RISK_ANALYSIS AS
	(
	-----------------T_CLAUSE START----------------------------
	  SELECT ACTION_ITEM.ID AS ACTION_ITEM_ID,
	       RTM_RISK.ID AS RISK_ANALYSIS_ID
	  FROM T_ACTION_ITEM ACTION_ITEM
	  INNER JOIN T_CLAUSE CLAUSE
	    ON (ACTION_ITEM.CLAUSE_ID = CLAUSE.ID AND ACTION_ITEM.DELETED = 0 AND CLAUSE.DELETED = 0)
	  INNER JOIN T_RISK_THREAT_MAPPING RTM
	    ON (CLAUSE.THREAT_ID = RTM.ID AND RTM.DELETED = 0)
	  INNER JOIN T_RISK_ANALYSIS RTM_RA
	    ON (RTM.ANALYSIS_ID = RTM_RA.ID AND RTM_RA.DELETED = 0)
	  INNER JOIN T_RISK RTM_RISK
	    ON (RTM_RA.RISK_ID = RTM_RISK.ID AND RTM_RISK.DELETED = 0)
	UNION ALL
	  SELECT ACTION_ITEM.ID AS ACTION_ITEM_ID,
	       REM_RISK.ID AS RISK_ANALYSIS_ID
	  FROM T_ACTION_ITEM ACTION_ITEM
	  INNER JOIN T_CLAUSE CLAUSE
	    ON (ACTION_ITEM.CLAUSE_ID = CLAUSE.ID AND ACTION_ITEM.DELETED = 0 AND CLAUSE.DELETED = 0)
	  INNER JOIN T_RISK_ERROR_MAPPING REM
	    ON (CLAUSE.ERROR_ID = REM.ID AND REM.DELETED = 0)
	  INNER JOIN T_RISK_ANALYSIS REM_RA
	    ON (REM.ANALYSIS_ID = REM_RA.ID AND REM_RA.DELETED = 0)
	  INNER JOIN T_RISK REM_RISK
	    ON (REM_RA.RISK_ID = REM_RISK.ID AND REM_RISK.DELETED = 0)
	-----------------T_CLAUSE END----------------------------
	)
	with read only
	;
 * @author Administrator
 *
 */
@Entity
@Table(name = "A_ACTION_ITEM_RISK_ANALYSIS")
public class ActionItemRiskAnalysisDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9097376918180542478L;
	
	/** 风险分析 */
	private RiskAnalysisDO riskAnalysis;
	
	/** 行动项 */
	private ActionItemDO actionItem;
	
	@ManyToOne
	@JoinColumn(name = "RISK_ANALYSIS_ID")
	@Comment("风险分析")
	public RiskAnalysisDO getRiskAnalysis() {
		return riskAnalysis;
	}

	public void setRiskAnalysis(RiskAnalysisDO riskAnalysis) {
		this.riskAnalysis = riskAnalysis;
	}

	@ManyToOne
	@JoinColumn(name = "ACTION_ITEM_ID")
	@Comment("行动项")
	public ActionItemDO getActionItem() {
		return actionItem;
	}

	public void setActionItem(ActionItemDO actionItem) {
		this.actionItem = actionItem;
	}
}
