
package com.usky.sms.label;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_LABEL")
@Comment("安全信息标签")
public class LabelDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 215997442448066620L;
	
	/** 自定义字段 */
	private Integer fieldId;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** 标签名 */
	private String label;
	
	@Column
	@Comment("自定义字段")
	public Integer getFieldId() {
		return fieldId;
	}
	
	public void setFieldId(Integer fieldId) {
		this.fieldId = fieldId;
	}
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@Column(length = 50)
	@Comment("标签名")
	public String getLabel() {
		return label;
	}
	
	public void setLabel(String label) {
		this.label = label;
	}
	
}
