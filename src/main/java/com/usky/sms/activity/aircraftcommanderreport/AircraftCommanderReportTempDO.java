package com.usky.sms.activity.aircraftcommanderreport;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 用于存放从外部系统同步过来的有效数据
 * @author Administrator
 *
 */
@Entity
@Table(name = "T_AIRCRAFT_CMD_REPORT_TEMP")
@Comment("机长报告临时表")
public class AircraftCommanderReportTempDO extends AbstractBaseDO {

	private static final long serialVersionUID = -7948760680327098L;

	/** 报告的数据 **/
	private String reportData;

	/** 回收时间 */
	private Date retvTime;
	
	/** 航班ID */
	private Integer legId;
	
	/** 是否已被导入 **/
	private boolean imported = false;
	
	@Column(name = "REPORT_DATA", columnDefinition = "clob")
	@Comment("报告的数据")
	public String getReportData() {
		return reportData;
	}

	public void setReportData(String reportData) {
		this.reportData = reportData;
	}

	@Basic
	@Column(name = "RETV_TIME", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("回收时间")
	public Date getRetvTime() {
		return retvTime;
	}

	public void setRetvTime(Date retvTime) {
		this.retvTime = retvTime;
	}

	@Column(name = "LEG_ID")
	@Comment("航班ID")
	public Integer getLegId() {
		return legId;
	}

	public void setLegId(Integer legId) {
		this.legId = legId;
	}
	
	public boolean isImported() {
		return imported;
	}
	
	public void setImported(boolean imported) {
		this.imported = imported;
	}

}
