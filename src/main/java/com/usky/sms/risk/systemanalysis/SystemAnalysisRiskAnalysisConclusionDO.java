
package com.usky.sms.risk.systemanalysis;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_SYS_ANLS_RISK_ANLS_CONCL")
@Comment("系统分析风险分析总统评价结论")
public class SystemAnalysisRiskAnalysisConclusionDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4508951179289249329L;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** 评价结论 */
	private String conclusion;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@Column(name = "CONCLUSION", length = 4000)
	@Comment("评价结论")
	public String getConclusion() {
		return conclusion;
	}

	public void setConclusion(String conclusion) {
		this.conclusion = conclusion;
	}

	@ManyToOne
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}
	
	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LAST_UPDATER_ID")
	@Comment("最后更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}
	
}
