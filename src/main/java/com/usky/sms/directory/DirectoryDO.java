package com.usky.sms.directory;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.file.FileDO;
import com.usky.sms.section.SectionDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_DIRECTORY")
@Comment("图书馆目录")
public class DirectoryDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -3578387885551223137L;
	/**
	 * 父节点
	 */
	private DirectoryDO father;
	/**
	 * 该目录下附件
	 */
	private Set<FileDO> attachments;
	/**
	 * 目录创建者
	 */
	private UserDO creator;
	/**
	 * 名称
	 */
	private String name;
	/**
	 * 详细内容说明
	 */
	private String description;

	/**
	 * 0:未发布, 1：已发布
	 */
	private Integer status;

	/**
	 * 段落
	 */
	private Set<SectionDO> sections;

	/**
	 *类别 1：自定义, 2:安全评审， 3:安全信息, 
	 * 
	 * @return
	 */
	private Integer type;

	/**
	 * 排序
	 * 
	 * @return
	 */
	private Integer sortKey;

	@ManyToOne
	@JoinColumn(name = "FATHER_ID")
	@Comment("父节点")
	public DirectoryDO getFather() {
		return father;
	}

	public void setFather(DirectoryDO father) {
		this.father = father;
	}

	@OneToMany(mappedBy = "directory")
	@Comment("该目录下附件")
	public Set<FileDO> getAttachments() {
		return attachments;
	}

	public void setAttachments(Set<FileDO> attachments) {
		this.attachments = attachments;
	}

	@ManyToOne
	@JoinColumn(name = "creator")
	@Comment("目录创建者")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 4000)
	@Comment("详细内容说明")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Comment("0:未发布, 1：已发布")
	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	/**
	 * @return the sections
	 */
	@OneToMany(mappedBy = "directory")
	@Comment("段落")
	public Set<SectionDO> getSections() {
		return sections;
	}

	/**
	 * @param sections
	 *            the sections to set
	 */
	public void setSections(Set<SectionDO> sections) {
		this.sections = sections;
	}

	/**
	 * @return the type
	 */
	@Comment("类别 1：自定义, 2:安全评审， 3:安全信息,")
	public Integer getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(Integer type) {
		this.type = type;
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

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof DirectoryDO)) {
			return false;
		}
		final DirectoryDO directory = (DirectoryDO) obj;
		if (this.getId().equals(directory.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
}
