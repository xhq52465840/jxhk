package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
public class DealerBySectionDO {
      private int id;
      private String fullname;
      private int CAB;
      private int GRH;
      private int CGO;
      private int DSP;
      private int FLT;
      private int MNT;
      private int ORG;
      private int SEC;
	@Comment("")
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	@Comment("")
	public String getFullname() {
		return fullname;
	}
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	@Comment("")
	public int getCAB() {
		return CAB;
	}
	public void setCAB(int cAB) {
		CAB = cAB;
	}
	@Comment("")
	public int getGRH() {
		return GRH;
	}
	public void setGRH(int gRH) {
		GRH = gRH;
	}
	@Comment("")
	public int getCGO() {
		return CGO;
	}
	public void setCGO(int cGO) {
		CGO = cGO;
	}
	@Comment("")
	public int getDSP() {
		return DSP;
	}
	public void setDSP(int dSP) {
		DSP = dSP;
	}
	@Comment("")
	public int getFLT() {
		return FLT;
	}
	public void setFLT(int fLT) {
		FLT = fLT;
	}
	
	@Comment("")
	public int getMNT() {
		return MNT;
	}
	public void setMNT(int mNT) {
		MNT = mNT;
	}
	@Comment("")
	public int getORG() {
		return ORG;
	}
	public void setORG(int oRG) {
		ORG = oRG;
	}
	@Comment("")
	public int getSEC() {
		return SEC;
	}
	public void setSEC(int sEC) {
		SEC = sEC;
	}
      
      
}
