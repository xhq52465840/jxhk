package com.usky.sms.losa.score;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 评分的下拉选项
 */
@Entity
@Table(name = "L_SCORE_SELECT_CONTENT")
@Comment("LOSA 评分的下拉选项")
public class ScoreSelectContentDO extends AbstractBaseDO{

	private static final long serialVersionUID = -7257630889439468443L;

	/** 创建人 */
	private Integer creator;
	
	/** 更新人 */
	private Integer modifier; 
	
	/** 分数类型：1布尔，2数值 */
	private Integer scoreType;
	
	/** 下拉选择的key */
	private String scoreKey;
	
	/** 下拉选择的valye */
	private String scoreVlaue;
	
	/** 下拉选择的描述 */
	private String discrib;
	
	/** 排序 */
	private Integer scoreSort;

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

	@Column(name = "SCORE_TYPE", length = 5)
	@Comment("分数类型：1布尔，2数值")
	public Integer getScoreType() {
		return scoreType;
	}

	public void setScoreType(Integer scoreType) {
		this.scoreType = scoreType;
	}

	@Column(name = "SCORE_KEY", length = 4000)
	@Comment("下拉选择的key")
	public String getScoreKey() {
		return scoreKey;
	}

	public void setScoreKey(String scoreKey) {
		this.scoreKey = scoreKey;
	}

	@Column(name = "SCORE_VALUE", length = 4000)
	@Comment("下拉选择的valye")
	public String getScoreVlaue() {
		return scoreVlaue;
	}

	public void setScoreVlaue(String scoreVlaue) {
		this.scoreVlaue = scoreVlaue;
	}

	@Column(name = "DISCRIBE", length = 4000)
	@Comment("下拉选择的描述")
	public String getDiscrib() {
		return discrib;
	}

	public void setDiscrib(String discrib) {
		this.discrib = discrib;
	}

	@Column(name = "SCORE_SORT", length = 5)
	@Comment("排序")
	public Integer getScoreSort() {
		return scoreSort;
	}

	public void setScoreSort(Integer scoreSort) {
		this.scoreSort = scoreSort;
	}
}
