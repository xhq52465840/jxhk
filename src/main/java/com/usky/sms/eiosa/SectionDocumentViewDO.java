package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.Immutable;

import com.usky.sms.user.UserDO;



@Entity
@Immutable
//@Subselect("select * from VW_E_IOSA_SECTION_DOCUMENT")
@Table(name = "VW_E_IOSA_SECTION_DOCUMENT")
public class  SectionDocumentViewDO  {

	
	private Integer id;
	private  DocumentsDO doc;
	private  String acronyms;
	//@Column
	private Integer reportId;
	//@Column
	private Integer CAB;
	//@Column
	private Integer CGO;
	//@Column
	private Integer DSP;
	//@Column
	private Integer FLT;
	//@Column
	private Integer GRH;
	//@Column
	private Integer MNT;
	//@Column
	private Integer ORG;
	//@Column
	private Integer SEC;
	
	@Id
	@GeneratedValue
	@Column
	@Comment("")
	public Integer getId() {
		return id;
	}
	
	@Transient
	@Comment("")
	public DocumentsDO getDoc() {
		return doc;
	}
	public void setDoc(DocumentsDO doc1) {
		this.doc = doc1;
	}
	
	@Column
	@Comment("")
	public String getAcronyms() {
		return acronyms;
	}

	public void setAcronyms(String acronyms) {
		this.acronyms = acronyms;
	}

	@Column(name = "reportid")
	@Comment("@Column")
	public Integer getReportId() {
		return reportId;
	}
	@Column
	@Comment("@Column")
	public Integer getCAB() {
		return CAB;
	}
	@Column
	@Comment("@Column")
	public Integer getCGO() {
		return CGO;
	}
	@Column
	@Comment("@Column")
	public Integer getDSP() {
		return DSP;
	}
	@Column
	@Comment("@Column")
	public Integer getFLT() {
		return FLT;
	}
	@Comment("@Column")
	public Integer getGRH() {
		return GRH;
	}
	@Column
	@Comment("@Column")
	public Integer getMNT() {
		return MNT;
	}
	@Comment("@Column")
	public Integer getORG() {
		return ORG;
	}
	@Column
	@Comment("@Column")
	public Integer getSEC() {
		return SEC;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public void setReportId(Integer reportId) {
		this.reportId = reportId;
	}

	public void setCAB(Integer cAB) {
		CAB = cAB;
	}

	public void setCGO(Integer cGO) {
		CGO = cGO;
	}

	public void setDSP(Integer dSP) {
		DSP = dSP;
	}

	public void setFLT(Integer fLT) {
		FLT = fLT;
	}

	public void setGRH(Integer gRH) {
		GRH = gRH;
	}

	public void setMNT(Integer mNT) {
		MNT = mNT;
	}

	public void setORG(Integer oRG) {
		ORG = oRG;
	}

	public void setSEC(Integer sEC) {
		SEC = sEC;
	}
	
	
	
	
	
}
