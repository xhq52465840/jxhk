package com.usky.sms.outview;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_SITE_FLAG")
@Comment("标题标志表（系统表暂不启用）")
public class SiteFlagDO extends AbstractBaseDO {

	private static final long serialVersionUID = 5990680482875767729L;
	
	/** 存YES或NO */
	private String flag;

	@Column(length = 50)
	@Comment("存YES或NO")
	public String getFlag() {
		return flag;
	}

	public void setFlag(String flag) {
		this.flag = flag;
	}

}
