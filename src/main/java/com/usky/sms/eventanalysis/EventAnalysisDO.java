package com.usky.sms.eventanalysis;

import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.tem.ActionItemDO;

@Entity
@Table(name = "T_EVENT_ANALYSIS")
@Comment("事件分析")
public class EventAnalysisDO extends AbstractBaseDO {

	private static final long serialVersionUID = 1447264070888145931L;
	
	/** 对应的安全信息 */
	private ActivityDO activity;
	
	/** 缺陷类型 */
	private DictionaryDO defectType;
	
	/** 缺陷分析 */
	private String defectAnalysis;
	
	/** 措施类型 */
	private DictionaryDO measureType;
	
	/** 行动项 */
	private ActionItemDO actionItem;
	
	@ManyToOne
	@JoinColumn(name="ACTIVITY_ID")
	@Comment("对应的安全信息")
	public ActivityDO getActivity() {
		return activity;
	}

	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}

	@ManyToOne
	@JoinColumn(name="DEFECT_TYPE")
	@Comment("缺陷类型")
	public DictionaryDO getDefectType() {
		return defectType;
	}

	public void setDefectType(DictionaryDO defectType) {
		this.defectType = defectType;
	}

	@Column(length=4000)
	@Comment("缺陷分析")
	public String getDefectAnalysis() {
		return defectAnalysis;
	}

	public void setDefectAnalysis(String defectAnalysis) {
		this.defectAnalysis = defectAnalysis;
	}

	@ManyToOne
	@JoinColumn(name="MEASURE_TYPE")
	@Comment("措施类型")
	public DictionaryDO getMeasureType() {
		return measureType;
	}

	public void setMeasureType(DictionaryDO measureType) {
		this.measureType = measureType;
	}

	@ManyToOne
	@JoinColumn(name="ACTION_ITEM")
	@Comment("行动项")
	public ActionItemDO getActionItem() {
		return actionItem;
	}

	public void setActionItem(ActionItemDO actionItem) {
		this.actionItem = actionItem;
	}

}
