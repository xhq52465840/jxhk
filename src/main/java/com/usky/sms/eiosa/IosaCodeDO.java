package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
@Entity
@Table(name = "e_iosa_code")
@Comment("EIOSA表")
public class IosaCodeDO extends AbstractBaseDO{
	/**
	 * 
	 */
	private static final long serialVersionUID = -3483816596880276294L;
	private Integer creator;
	private Integer last_modifier;
	private String type;
	private String code_name;
	private String code_key;
	private String code_description;
	private Integer code_sort;
	private Integer validity;
	private String code_value;
	@Comment("")
	public Integer getCreator() {
		return creator;
	}
	public void setCreator(Integer creator) {
		this.creator = creator;
	}
	@Comment("")
	public Integer getLast_modifier() {
		return last_modifier;
	}
	public void setLast_modifier(Integer last_modifier) {
		this.last_modifier = last_modifier;
	}
	@Comment("")
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	@Comment("")
	public String getCode_name() {
		return code_name;
	}
	public void setCode_name(String code_name) {
		this.code_name = code_name;
	}
	@Comment("")
	public String getCode_key() {
		return code_key;
	}
	public void setCode_key(String code_key) {
		this.code_key = code_key;
	}
	@Comment("")
	public String getCode_description() {
		return code_description;
	}
	public void setCode_description(String code_description) {
		this.code_description = code_description;
	}
	@Comment("")
	public Integer getCode_sort() {
		return code_sort;
	}
	public void setCode_sort(Integer code_sort) {
		this.code_sort = code_sort;
	}
	@Comment("")
	public Integer getValidity() {
		return validity;
	}
	public void setValidity(Integer validity) {
		this.validity = validity;
	}
	@Comment("")
	public String getCode_value() {
		return code_value;
	}
	public void setCode_value(String code_value) {
		this.code_value = code_value;
	}
	

}
