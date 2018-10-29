
package com.usky.sms.dictionary;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_DICTIONARY_GRADE")
@Comment("数据字典的级数")
public class DictionaryGradeDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -6257828090747108684L;
	
	/** 数据字典 */
	private DictionaryDO dictionary;
	
	/** 父数据字典 */
	private DictionaryDO parent;
		
	/** 级数(从0开始) */
	private String grade;

	@OneToOne
	@JoinColumn(name = "DICTIONARY_ID", unique = true, nullable = false, updatable = false)
	@Comment("数据字典")
	public DictionaryDO getDictionary() {
		return dictionary;
	}

	public void setDictionary(DictionaryDO dictionary) {
		this.dictionary = dictionary;
	}

	@OneToOne
	@JoinColumn(name = "PARENT_ID")
	@Comment("父数据字典")
	public DictionaryDO getParent() {
		return parent;
	}

	public void setParent(DictionaryDO parent) {
		this.parent = parent;
	}

	@Column(name = "GRADE", length = 3, nullable = false)
	@Comment("级数(从0开始)")
	public String getGrade() {
		return grade;
	}

	public void setGrade(String grade) {
		this.grade = grade;
	}
}
