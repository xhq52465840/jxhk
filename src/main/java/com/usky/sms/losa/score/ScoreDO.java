package com.usky.sms.losa.score;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 评分表
 */
@Entity
@Table(name = "L_SCORE")
@Comment("评分表")
public class ScoreDO extends AbstractBaseDO{
	
	private static final long serialVersionUID = -402604903211744802L;

	/** 创建人 */
	private Integer creator;
	
	/** 更新人 */
	private Integer modifier;
	
	/**  */
	private  Integer observeActivity;
	
	/**  */
	private Integer  scoreTemplet;
	
	/**  */
	private String scoreSelectkey;

	@Column(name = "CREATOR", length = 10)
	@Comment("创建人")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

	@Column(name = "LAST_MODIFIER", length = 10)
	@Comment("更新人")
	public Integer getModifier() {
		return modifier;
	}

	public void setModifier(Integer modifier) {
		this.modifier = modifier;
	}

	@Column(name = "OBSERVE_ID")
	@Comment("")
	public Integer getObserveActivity() {
		return observeActivity;
	}

	public void setObserveActivity(Integer observeActivity) {
		this.observeActivity = observeActivity;
	}

	@Column(name = "SCORE_TEMP_ID")
	@Comment("")
	public Integer getScoreTemplet() {
		return scoreTemplet;
	}

	public void setScoreTemplet(Integer scoreTemplet) {
		this.scoreTemplet = scoreTemplet;
	}

	@Column(name = "SCORE_SELECT_KEY", length = 1000)
	@Comment("")
	public String getScoreSelectkey() {
		return scoreSelectkey;
	}

	public void setScoreSelectkey(String scoreSelectkey) {
		this.scoreSelectkey = scoreSelectkey;
	}
}
