
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.threat.ThreatDO;

@Entity
@Table(name = "T_RISK_THREAT_MAPPING")
@Comment("风险分析块明细行（威胁）")
public class RiskThreatMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 1955140356741371843L;
	
	/** 风险分析块 */
	private RiskAnalysisDO analysis;
	
	/** 威胁 */
	private ThreatDO threat;
	
	/** 分析描述 */
	private String text;
	
	/** 分值 */
	private Integer score;
	
	/** 颜色 警戒值 */
	private String mark;
	
	@ManyToOne
	@JoinColumn(name = "ANALYSIS_ID")
	@Comment("风险分析块")
	public RiskAnalysisDO getAnalysis() {
		return analysis;
	}
	
	public void setAnalysis(RiskAnalysisDO analysis) {
		this.analysis = analysis;
	}
	
	@ManyToOne
	@JoinColumn(name = "THREAT_ID")
	@Comment("威胁")
	public ThreatDO getThreat() {
		return threat;
	}
	
	public void setThreat(ThreatDO threat) {
		this.threat = threat;
	}
	
	@Column(length = 4000)
	@Comment("分析描述")
	public String getText() {
		return text;
	}
	
	public void setText(String text) {
		this.text = text;
	}
	
	@Column
	@Comment("分值")
	public Integer getScore() {
		return score;
	}
	
	public void setScore(Integer score) {
		this.score = score;
	}
	
	@Column(length = 10)
	@Comment("颜色 警戒值")
	public String getMark() {
		return mark;
	}
	
	public void setMark(String mark) {
		this.mark = mark;
	}
	
}
