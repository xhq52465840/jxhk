
package com.usky.sms.custom;
import org.hibernate.cfg.Comment;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_CUSTOM_FIELD_VALUE")
@Comment("自定义字段的值")
public class CustomFieldValueDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -1949589799609188784L;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** ID */
	private String key;
	
	/** 字符串类型 */
	private String stringValue;
	
	/** 日期类型 */
	private Date dateValue;
	
	/** 数值类型 */
	private Double numberValue;
	
	/** 文本类型 */
	private String textValue;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@Column(name = "`key`", length = 20)
	@Comment("ID")
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	@Column(name = "string_value", length = 255)
	@Comment("字符串类型")
	public String getStringValue() {
		return stringValue;
	}
	
	public void setStringValue(String stringValue) {
		this.stringValue = stringValue;
	}
	
	@Column(name = "date_value", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("日期类型")
	public Date getDateValue() {
		return dateValue;
	}
	
	public void setDateValue(Date dateValue) {
		this.dateValue = dateValue;
	}
	
	@Column(name = "number_value")
	@Comment("数值类型")
	public Double getNumberValue() {
		return numberValue;
	}
	
	public void setNumberValue(Double numberValue) {
		this.numberValue = numberValue;
	}
	
	@Column(name = "text_value", length = 2000)
	@Comment("文本类型")
	public String getTextValue() {
		return textValue;
	}
	
	public void setTextValue(String textValue) {
		this.textValue = textValue;
	}
	
}
