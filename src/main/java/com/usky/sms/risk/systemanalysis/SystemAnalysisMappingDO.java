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
@Table(name = "T_SYSTEM_ANALYSIS_MAPPING")
@Comment("系统工作分析块")
public class SystemAnalysisMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9082256999635197135L;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** 系统分类 */
	private SystemAnalysisDO systemAnalysis;
	
	/** 三级流程 */
	private String tertiaryWorkflow;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 更新人 */
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

	@ManyToOne
	@JoinColumn(name = "SYSTEM_ANALYSIS_ID")
	@Comment("系统工作分析")
	public SystemAnalysisDO getSystemAnalysis() {
		return systemAnalysis;
	}

	public void setSystemAnalysis(SystemAnalysisDO systemAnalysis) {
		this.systemAnalysis = systemAnalysis;
	}
	
	@Column(name = "TERTIARY_WORKFLOW", length = 255)
	@Comment("三级流程")
	public String getTertiaryWorkflow() {
		return tertiaryWorkflow;
	}
	
	public void setTertiaryWorkflow(String tertiaryWorkflow) {
		this.tertiaryWorkflow = tertiaryWorkflow;
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
