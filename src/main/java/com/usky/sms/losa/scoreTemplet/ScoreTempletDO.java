package com.usky.sms.losa.scoreTemplet;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "L_SCORE_TEMPLET")
@Comment("LOSA 评分模板表")
public class ScoreTempletDO extends AbstractBaseDO{
	
	private static final long serialVersionUID = 441513451588304187L;
	
	/** 创建人 */
	private Integer creator;

	/** 更新人 */
	private Integer modifier;

	/** 模板类型：A、B、C */
	private String tempType;

	/** 飞行阶段名称 */
	private String flyStageName;

	/** 评分基准 */
	private String scoreStandard;

	/** 评分项 */
	private String scoreItems;

	/** 评分项解释 */
	private String scoreItemsExplan;

	/** 评分项内容 */
	private String scoreItemContent;

	/** 评分下拉选项类型：1布尔型，2数值型 */
	private Integer scoreSelectType;

	/** 评分项显示的顺序 */
	private Integer scoreItemsSort;

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

	@Column(name = "TEMP_TYPE", length = 100)
	@Comment("模板类型：A、B、C")
	public String getTempType() {
		return tempType;
	}

	public void setTempType(String tempType) {
		this.tempType = tempType;
	}

	@Column(name = "FLY_STAGE_NAME", length = 1000)
	@Comment("飞行阶段名称")
	public String getFlyStageName() {
		return flyStageName;
	}

	public void setFlyStageName(String flyStageName) {
		this.flyStageName = flyStageName;
	}

	@Column(name = "SCORE_STANDARD", length = 4000)
	@Comment("评分基准")
	public String getScoreStandard() {
		return scoreStandard;
	}

	public void setScoreStandard(String scoreStandard) {
		this.scoreStandard = scoreStandard;
	}

	@Column(name = "SCORE_ITEMS", length = 4000)
	@Comment("评分项")
	public String getScoreItems() {
		return scoreItems;
	}

	public void setScoreItems(String scoreItems) {
		this.scoreItems = scoreItems;
	}

	@Column(name = "SCORE_ITEMS_EXPLAIN", length = 4000)
	@Comment("评分项解释")
	public String getScoreItemsExplan() {
		return scoreItemsExplan;
	}

	public void setScoreItemsExplan(String scoreItemsExplan) {
		this.scoreItemsExplan = scoreItemsExplan;
	}

	@Column(name = "SCORE_ITEM_CONTENT", length = 4000)
	@Comment("评分项内容")
	public String getScoreItemContent() {
		return scoreItemContent;
	}

	public void setScoreItemContent(String scoreItemContent) {
		this.scoreItemContent = scoreItemContent;
	}

	@Column(name = "SCORE_SELECT_TYPE", length = 10)
	@Comment("评分下拉选项类型：1布尔型，2数值型")
	public Integer getScoreSelectType() {
		return scoreSelectType;
	}

	public void setScoreSelectType(Integer scoreSelectType) {
		this.scoreSelectType = scoreSelectType;
	}

	@Column(name = "SCORE_ITEMS_SORT", length = 10)
	@Comment("评分项显示的顺序")
	public Integer getScoreItemsSort() {
		return scoreItemsSort;
	}

	public void setScoreItemsSort(Integer scoreItemsSort) {
		this.scoreItemsSort = scoreItemsSort;
	}

}
