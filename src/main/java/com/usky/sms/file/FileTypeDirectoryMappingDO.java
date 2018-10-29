package com.usky.sms.file;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.directory.DirectoryDO;

/**
 * 文件类型与目录的映射
 *
 */
@Entity
@Table(name = "T_FILE_TYPE_DIRECTORY_MAPPING")
public class FileTypeDirectoryMappingDO extends AbstractBaseDO {

	private static final long serialVersionUID = -6969151300197583956L;

	/**
	 * 文件类型
	 * 
	 * @see EnumFileType
	 */
	private String fileType;

	/** 目录 */
	private DirectoryDO directory;

	@Column(name = "FILE_TYPE", unique = true)
	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	@ManyToOne
	@JoinColumn(name = "DIRECTORY_ID")
	public DirectoryDO getDirectory() {
		return directory;
	}

	public void setDirectory(DirectoryDO directory) {
		this.directory = directory;
	}

}
