package com.usky.sms.outview;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
/**
 * 标识
 */
@Entity
@Table(name = "T_LOGO")
@Comment("标识")
public class LogoDO extends AbstractBaseDO {

	private static final long serialVersionUID = 1431714873777659984L;

	/** 上传图片的二进制地址 */
	private String imagename;
	
	/** 通过URl上传  URL */
	private String url;
	
	@Column(length = 255)
	@Comment("上传图片的二进制地址")
	public String getImagename() {
		return imagename;
	}
	
	public void setImagename(String imagename) {
		this.imagename = imagename;
	}
	
	@Column(length = 255)
	@Comment("通过URl上传  URL")
	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

}
