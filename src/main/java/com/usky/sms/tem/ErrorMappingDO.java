
package com.usky.sms.tem;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.error.ErrorDO;

@Entity
@Table(name = "T_ERROR_MAPPING")
@Comment("TEM差错明细行")
public class ErrorMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2746256971796367689L;
	
	/** TEM块 */
	private TemDO tem;
	
	/** 差错 */
	private ErrorDO error;
	
	
	@ManyToOne
	@JoinColumn(name = "TEM_ID")
	@Comment("TEM块")
	public TemDO getTem() {
		return tem;
	}
	
	public void setTem(TemDO tem) {
		this.tem = tem;
	}
	
	@ManyToOne
	@JoinColumn(name = "ERROR_ID")
	@Comment("差错")
	public ErrorDO getError() {
		return error;
	}
	
	public void setError(ErrorDO error) {
		this.error = error;
	}
	
}
