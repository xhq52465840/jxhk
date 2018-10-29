
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.error.ErrorDO;

@Entity
@Table(name = "T_RISK_ERROR_MAPPING")
@Comment("风险分析块明细行（差错）")
public class RiskErrorMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4734893921742801397L;
	
	/** 风险分析块 */
	private RiskAnalysisDO analysis;
	
	/** 差错 */
	private ErrorDO error;
	
	/** 分析描述 */
	private String text;
	
	/** 分值 */
	private Integer score;
	
	/** 颜色 警戒值颜色 */
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
	@JoinColumn(name = "ERROR_ID")
	@Comment("差错")
	public ErrorDO getError() {
		return error;
	}
	
	public void setError(ErrorDO error) {
		this.error = error;
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
	@Comment("颜色 警戒值颜色")
	public String getMark() {
		return mark;
	}
	
	public void setMark(String mark) {
		this.mark = mark;
	}
	
}
