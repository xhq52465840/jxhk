package com.usky.sms.section;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.directory.DirectoryDO;

@Entity
@Table(name = "T_SECTION")
@Comment("段落")
public class SectionDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 3688986554366222159L;
	/**
	 * 名称
	 */
	private String name;
	/**
	 * 内容
	 */
	private String content;
	/**
	 * 排序
	 */
	private Integer sortKey;

	/**
	 * 所属目录
	 */
	private DirectoryDO directory;

	/**
	 * @return the name
	 */
	@Comment("名称")
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the content
	 */
	@Column(length = 4000)
	@Comment("内容")
	public String getContent() {
		return content;
	}

	/**
	 * @param content
	 *            the content to set
	 */
	public void setContent(String content) {
		this.content = content;
	}

	/**
	 * @return the directory
	 */
	@ManyToOne
	@JoinColumn(name = "DIRECTORY_ID")
	@Comment("所属目录")
	public DirectoryDO getDirectory() {
		return directory;
	}

	/**
	 * @param directory
	 *            the directory to set
	 */
	public void setDirectory(DirectoryDO directory) {
		this.directory = directory;
	}

	/**
	 * @return the sortKey
	 */
	@Comment("排序")
	public Integer getSortKey() {
		return sortKey;
	}

	/**
	 * @param sortKey
	 *            the sortKey to set
	 */
	public void setSortKey(Integer sortKey) {
		this.sortKey = sortKey;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}
}
