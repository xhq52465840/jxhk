package com.usky.sms.losa.activity;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;


/**
 * 观察员表
 */
@Entity
@Table(name = "L_OBSERVER_INFO")
@Comment("LOSA 观察员表")
public class ObserverInfoDO extends AbstractBaseDO{

	private static final long serialVersionUID = -7380656546397871368L;

	/** 创建人 */
	private Integer creator;

	/** 更新人 */
	private Integer lastModifier;

	/** 观察员编号，L+主操作机型简称+飞行网ID */
	private String observerNo;

	/** 观察员姓名 */
	private String observerName;

	/** 所属公司 */
	private Integer observerOrg;

	/** 技术岗位 */
	private String observerPost;

	/** 联系电话 */
	private String observerPhone;

	/** 身份证号码 */
	private String observerIDCode;

	/** 主操作机型，A:空客、B：波音 */
	private String observerAircraftType;

	/** 飞行网ID */
	private String observerFXWID;

	/** 用户ID */
	private Integer userId;

	/** 职责 */
	private String respName;
	
	@Column(name = "CREATOR")
	@Comment("创建人")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

	@Column(name = "LAST_MODIFIER")
	@Comment("更新人")
	public Integer getLastModifier() {
		return lastModifier;
	}

	public void setLastModifier(Integer lastModifier) {
		this.lastModifier = lastModifier;
	}

	@Column(name = "OBSERVER_NO")
	@Comment("观察员编号，L+主操作机型简称+飞行网ID")
	public String getObserverNo() {
		return observerNo;
	}

	public void setObserverNo(String observerNo) {
		this.observerNo = observerNo;
	}

	@Column(name = "OBSERVER_NAME")
	@Comment("观察员姓名")
	public String getObserverName() {
		return observerName;
	}

	public void setObserverName(String observerName) {
		this.observerName = observerName;
	}

	@Column(name = "OBSERVER_ORG")
	@Comment("所属公司")
	public Integer getObserverOrg() {
		return observerOrg;
	}

	public void setObserverOrg(Integer observerOrg) {
		this.observerOrg = observerOrg;
	}

	@Column(name = "OBSERVER_POST")
	@Comment("技术岗位")
	public String getObserverPost() {
		return observerPost;
	}

	public void setObserverPost(String observerPost) {
		this.observerPost = observerPost;
	}

	@Column(name = "OBSERVER_PHONE")
	@Comment("联系电话")
	public String getObserverPhone() {
		return observerPhone;
	}

	public void setObserverPhone(String observerPhone) {
		this.observerPhone = observerPhone;
	}

	@Column(name = "OBSERVER_IDCODE")
	@Comment("身份证号码")
	public String getObserverIDCode() {
		return observerIDCode;
	}

	public void setObserverIDCode(String observerIDCode) {
		this.observerIDCode = observerIDCode;
	}

	@Column(name = "OBSERVER_AIRCRAFT_TYPE")
	@Comment("主操作机型，A:空客、B：波音")
	public String getObserverAircraftType() {
		return observerAircraftType;
	}

	public void setObserverAircraftType(String observerAircraftType) {
		this.observerAircraftType = observerAircraftType;
	}

	@Column(name = "OBSERVER_FWX_ID")
	@Comment("飞行网ID")
	public String getObserverFXWID() {
		return observerFXWID;
	}

	public void setObserverFXWID(String observerFXWID) {
		this.observerFXWID = observerFXWID;
	}

	@Column(name = "USERID")
	@Comment("用户ID")
	public Integer getUserId() {
		return userId;
	}

	public void setUserId(Integer userId) {
		this.userId = userId;
	}

	@Column(name = "RESP_NAME")
	@Comment("职责")
	public String getRespName() {
		return respName;
	}

	public void setRespName(String respName) {
		this.respName = respName;
	}

}
