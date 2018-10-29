package com.usky.sms.trainingrecord;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_TRAINING_RECORD")
@Comment("培训记录")
public class TrainingRecordDO extends AbstractBaseDO {

	private static final long serialVersionUID = 2479509177538584949L;
	
	/** 证书类型(SR:安全负责人; SM:安全管理人; RM:风险管理专家; SI:安全信息员; SA:安全内审员) */
	private String certificateType;
	
	/** 培训对象 **/
	private UserDO trainingTarget;
	
	/** 证书有效期 **/
	private Date expiryDate;
	
	/** 安监机构 **/
	private UnitDO trainingUnit;
	
	/** 培训机构 **/
	private String trainingInstitution;
	
	/** 是否合格 */
	private boolean qualified;
	
	/** 证书编号 */
	private String certificateNo;
	
	/** 发证机构 */
	private String certificationAuthority;
	
	/** 培训类型(IT:内训; OT:外训) */
	private String trainingType;
	
	/** 培训开始日期 */
	private Date trainingStartDate;
	
	/** 培训结束日期 */
	private Date trainingEndDate;
	
	/** 培训课程 */
	private String trainingCourse;
	
	/** 是否参加复训 */
	private boolean recurrentTraining;
	
	/** 复训日期 */
	private Date recurrentTrainingDate;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;

	@Column(name = "CERTIFICATE_TYPE", length = 2)
	@Comment("证书类型(SR:安全负责人; SM:安全管理人; RM:风险管理专家; SI:安全信息员; SA:安全内审员)")
	public String getCertificateType() {
		return certificateType;
	}

	public void setCertificateType(String certificateType) {
		this.certificateType = certificateType;
	}

	@ManyToOne
	@JoinColumn(name = "TRAINING_TARGET")
	@Comment("培训对象")
	public UserDO getTrainingTarget() {
		return trainingTarget;
	}

	public void setTrainingTarget(UserDO trainingTarget) {
		this.trainingTarget = trainingTarget;
	}

	@Column(name = "EXPIRY_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.DATE)
	@Comment("证书有效期")
	public Date getExpiryDate() {
		return expiryDate;
	}

	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}

	@ManyToOne
	@JoinColumn(name = "TRAINING_UNIT")
	@Comment("安监机构")
	public UnitDO getTrainingUnit() {
		return trainingUnit;
	}

	public void setTrainingUnit(UnitDO trainingUnit) {
		this.trainingUnit = trainingUnit;
	}

	@Column(name = "TRAINING_INSTITUTION")
	@Comment("培训机构")
	public String getTrainingInstitution() {
		return trainingInstitution;
	}

	public void setTrainingInstitution(String trainingInstitution) {
		this.trainingInstitution = trainingInstitution;
	}

	@Column(name = "QUALIFIED")
	@Comment("是否合格")
	public boolean isQualified() {
		return qualified;
	}

	public void setQualified(boolean qualified) {
		this.qualified = qualified;
	}

	@Column(name = "CERTIFICATE_NO", length = 20)
	@Comment("证书编号")
	public String getCertificateNo() {
		return certificateNo;
	}

	public void setCertificateNo(String certificateNo) {
		this.certificateNo = certificateNo;
	}

	@Column(name = "CERTIFICATION_AUTHORITY", length = 50)
	@Comment("发证机构")
	public String getCertificationAuthority() {
		return certificationAuthority;
	}

	public void setCertificationAuthority(String certificationAuthority) {
		this.certificationAuthority = certificationAuthority;
	}

	@Column(name = "TRAINING_TYPE", length = 2)
	@Comment("培训类型(IT:内训; OT:外训)")
	public String getTrainingType() {
		return trainingType;
	}

	public void setTrainingType(String trainingType) {
		this.trainingType = trainingType;
	}

	@Column(name = "TRAINING_START_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.DATE)
	@Comment("培训开始日期")
	public Date getTrainingStartDate() {
		return trainingStartDate;
	}

	public void setTrainingStartDate(Date trainingStartDate) {
		this.trainingStartDate = trainingStartDate;
	}

	@Column(name = "TRAINING_END_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.DATE)
	@Comment("培训结束日期")
	public Date getTrainingEndDate() {
		return trainingEndDate;
	}

	public void setTrainingEndDate(Date trainingEndDate) {
		this.trainingEndDate = trainingEndDate;
	}

	@Column(name = "TRAINING_COURSE", length = 50)
	@Comment("培训课程")
	public String getTrainingCourse() {
		return trainingCourse;
	}

	public void setTrainingCourse(String trainingCourse) {
		this.trainingCourse = trainingCourse;
	}

	@Column(name = "RECURRENT_TRAINING")
	@Comment("是否参加复训")
	public boolean isRecurrentTraining() {
		return recurrentTraining;
	}

	public void setRecurrentTraining(boolean recurrentTraining) {
		this.recurrentTraining = recurrentTraining;
	}

	@Column(name = "RECURRENT_TRAINING_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.DATE)
	@Comment("复训日期")
	public Date getRecurrentTrainingDate() {
		return recurrentTrainingDate;
	}

	public void setRecurrentTrainingDate(Date recurrentTrainingDate) {
		this.recurrentTrainingDate = recurrentTrainingDate;
	}

	@ManyToOne
	@JoinColumn(name = "CREATOR")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LASTUPDATER")
	@Comment("最后更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

}
