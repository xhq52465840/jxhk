
package com.usky.sms.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.Collection;
import java.util.Properties;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

public class Config {
	
	private static Config config;
	
	private String subSystem;
	
	private String upsService;
	
	private String upsUsername;
	
	private String upsPassword;
	
	private String solr;
	
	private String workflow;
	
	private String cronExpression;
	
	private String pluginService;
	
	private String pluginLibPath;
	
	private String pluginWebPath;
	
	private String userAvatarPath;
	
	private String userAvatarWebPath;
	
	private String unknownUserAvatar;
	
	private String unitAvatarPath;
	
	private String unitAvatarWebPath;
	
	private String defaultUnitAvatar;
	
	private String unitPageUrl;
	
	private String activityPageUrl;
	
	private String activityTypeForUnitPageUrl;
	
	private String activitySearchPageUrl;
	
	private String sysLogoPath;
	
	private String sysLogoWebPath;
	
	private String temPath;
	
	private String uploadFilePath;
	
	private String cronExpForSendEmail;
	
	private String hostAddress;
	
	private String ssoFlag;
	
	private String ssoServerUrl;
	
	private String ssoServiceUrl;
	
	private String ssoValidateUrl;
	
	private String cronExpressionForGenerateMethanolInst;
	
	private String cronExpressionForCloseMethanolInst;
	
	private String sendMessageIfWorkflowStatusChanged;
	
	private String airportServiceUrl;
	
	private String serverIP;
	
	private String serverPort;
	
	private String aircraftCommanderReportServiceUrl;
	
	private String cronExpressionForSyncronizeAircraftCommanderReport;
	
	private String cronExpressionForImportAircraftCommanderReport;
	
	private String emsServiceUrl;
	
	private String emsEnterpriseId;
	
	private String emsLoginName;
	
	private String emsPassword;
	
	private String emsResendTime;
	/** 发短信时候的类型 */
	private String smsType;
	
	private String cronExpForSendUnsentShortMsg;
	
	private String cronExpForSendFailedShortMsg;
	
	private String dayOfSendImproveShortMsg;
	
	private String cronExpForSendImproveShortMsg;
	
	private String savePath;
	
	private String cronExpForSendMethanolCommitNotice;
	
	private String cronExpForSetMethanolCommitDelay;
	
	private String appId;
	
	private String fetchDeviceUrl;

	private String pushMsgUrl;
	
	private String cronExpForSynchronizeUser;
	
	/** 行动项验证期限 */
	private Integer actionItemConfirmDays;
	
	/** 行动项审核期限 */
	private Integer actionItemAuditDays;

	
	
	
	private Config() {
		InputStream in = null;
		Properties config = new Properties();
		try {
			File configDirectory = new File(URLDecoder.decode(Config.class.getResource("/config").getFile(), "UTF-8"));
			Collection<File> files = FileUtils.listFiles(configDirectory, new String[]{"properties"}, false);
			if (files != null) {
				for (File configFile : files) {
					in = new FileInputStream(configFile);
					config.load(in);
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			IOUtils.closeQuietly(in);
		}
		this.subSystem = config.getProperty("subSystem");
		this.upsService = config.getProperty("upsService");
		this.upsUsername = config.getProperty("upsUsername");
		this.upsPassword = config.getProperty("upsPassword");
		this.solr = config.getProperty("solr");
		this.workflow = config.getProperty("workflow");
		this.cronExpression = config.getProperty("cronExpression");
		this.pluginService = config.getProperty("pluginService");
		this.pluginLibPath = config.getProperty("pluginLibPath");
		this.pluginWebPath = config.getProperty("pluginWebPath");
		this.userAvatarPath = config.getProperty("userAvatarPath");
		this.userAvatarWebPath = config.getProperty("userAvatarWebPath");
		this.unknownUserAvatar = config.getProperty("unknownUserAvatar");
		this.unitAvatarPath = config.getProperty("unitAvatarPath");
		this.unitAvatarWebPath = config.getProperty("unitAvatarWebPath");
		this.defaultUnitAvatar = config.getProperty("defaultUnitAvatar");
		this.unitPageUrl = config.getProperty("unitPageUrl");
		this.activityPageUrl = config.getProperty("activityPageUrl");
		this.activityTypeForUnitPageUrl = config.getProperty("activityTypeForUnitPageUrl");
		this.activitySearchPageUrl = config.getProperty("activitySearchPageUrl");
		this.sysLogoPath = config.getProperty("sysLogoPath");
		this.sysLogoWebPath = config.getProperty("sysLogoWebPath");
		this.temPath = config.getProperty("temPath");
		this.uploadFilePath = config.getProperty("uploadFilePath");
		this.cronExpForSendEmail = config.getProperty("cronExpForSendEmail");
		this.hostAddress = config.getProperty("hostAddress");
		this.ssoServerUrl = config.getProperty("ssoServerUrl");		
		this.ssoServiceUrl = config.getProperty("ssoServiceUrl");		
		this.ssoValidateUrl = config.getProperty("ssoValidateUrl");		
		this.ssoFlag = config.getProperty("ssoFlag");
		this.cronExpressionForGenerateMethanolInst = config.getProperty("cronExpressionForGenerateMethanolInst");
		this.cronExpressionForCloseMethanolInst = config.getProperty("cronExpressionForCloseMethanolInst");
		this.sendMessageIfWorkflowStatusChanged = config.getProperty("sendMessageIfWorkflowStatusChanged");
		this.airportServiceUrl = config.getProperty("airportServiceUrl");
		this.serverIP = config.getProperty("serverIP");
		this.serverPort = config.getProperty("serverPort");
		this.aircraftCommanderReportServiceUrl = config.getProperty("aircraftCommanderReportServiceUrl");
		this.cronExpressionForSyncronizeAircraftCommanderReport = config.getProperty("cronExpressionForSyncronizeAircraftCommanderReport");
		this.cronExpressionForImportAircraftCommanderReport = config.getProperty("cronExpressionForImportAircraftCommanderReport");
		this.emsServiceUrl = config.getProperty("emsServiceUrl");
		this.emsEnterpriseId = config.getProperty("emsEnterpriseId");
		this.emsLoginName = config.getProperty("emsLoginName");
		this.emsPassword = config.getProperty("emsPassword");
		this.smsType = config.getProperty("smsType");
		this.emsResendTime = config.getProperty("emsResendTime");
		this.cronExpForSendUnsentShortMsg = config.getProperty("cronExpForSendUnsentShortMsg");
		this.cronExpForSendFailedShortMsg = config.getProperty("cronExpForSendFailedShortMsg");
		this.dayOfSendImproveShortMsg = config.getProperty("dayOfSendImproveShortMsg");
		this.cronExpForSendImproveShortMsg = config.getProperty("cronExpForSendImproveShortMsg");
		this.savePath = config.getProperty("savePath");
		this.cronExpForSendMethanolCommitNotice = config.getProperty("cronExpForSendMethanolCommitNotice");
		this.cronExpForSetMethanolCommitDelay = config.getProperty("cronExpForSetMethanolCommitDelay");
		this.appId = config.getProperty("appId");
		this.fetchDeviceUrl = config.getProperty("fetchDeviceUrl");
		this.pushMsgUrl = config.getProperty("pushMsgUrl");
		this.cronExpForSynchronizeUser = config.getProperty("cronExpForSynchronizeUser");
		this.actionItemConfirmDays = config.getProperty("actionItemConfirmDays") == null ? 0 : Integer.parseInt(config.getProperty("actionItemConfirmDays"));
		this.actionItemAuditDays = config.getProperty("actionItemAuditDays") == null ? 0 : Integer.parseInt(config.getProperty("actionItemAuditDays"));

	}
	
	public static Config getInstance() {
		if (config == null) {
			config = new Config();
		}
		return config;
	}
	
	public String getSubSystem() {
		return subSystem;
	}
	
	public void setSubSystem(String subSystem) {
		this.subSystem = subSystem;
	}
	
	public String getUpsService() {
		return upsService;
	}
	
	public void setUpsService(String upsService) {
		this.upsService = upsService;
	}
	
	public String getUpsUsername() {
		return upsUsername;
	}
	
	public void setUpsUsername(String upsUsername) {
		this.upsUsername = upsUsername;
	}
	
	public String getUpsPassword() {
		return upsPassword;
	}
	
	public void setUpsPassword(String upsPassword) {
		this.upsPassword = upsPassword;
	}
	
	public String getSolr() {
		return solr;
	}
	
	public void setSolr(String solr) {
		this.solr = solr;
	}
	
	public String getWorkflow() {
		return workflow;
	}
	
	public void setWorkflow(String workflow) {
		this.workflow = workflow;
	}
	
	public String getCronExpression() {
		return cronExpression;
	}
	
	public void setCronExpression(String cronExpression) {
		this.cronExpression = cronExpression;
	}
	
	public String getPluginService() {
		return pluginService;
	}
	
	public void setPluginService(String pluginService) {
		this.pluginService = pluginService;
	}
	
	public String getPluginLibPath() {
		return pluginLibPath;
	}
	
	public void setPluginLibPath(String pluginLibPath) {
		this.pluginLibPath = pluginLibPath;
	}
	
	public String getPluginWebPath() {
		return pluginWebPath;
	}
	
	public void setPluginWebPath(String pluginWebPath) {
		this.pluginWebPath = pluginWebPath;
	}
	
	public String getUserAvatarPath() {
		return userAvatarPath;
	}
	
	public void setUserAvatarPath(String userAvatarPath) {
		this.userAvatarPath = userAvatarPath;
	}
	
	public String getUserAvatarWebPath() {
		return userAvatarWebPath;
	}
	
	public void setUserAvatarWebPath(String userAvatarWebPath) {
		this.userAvatarWebPath = userAvatarWebPath;
	}
	
	public String getUnknownUserAvatar() {
		return unknownUserAvatar;
	}
	
	public void setUnknownUserAvatar(String unknownUserAvatar) {
		this.unknownUserAvatar = unknownUserAvatar;
	}
	
	public String getUnitAvatarPath() {
		return unitAvatarPath;
	}
	
	public void setUnitAvatarPath(String unitAvatarPath) {
		this.unitAvatarPath = unitAvatarPath;
	}
	
	/**
	 * @return the cronExpForSendEmail
	 */
	public String getCronExpForSendEmail() {
		return cronExpForSendEmail;
	}
	
	/**
	 * @param cronExpForSendEmail the cronExpForSendEmail to set
	 */
	public void setCronExpForSendEmail(String cronExpForSendEmail) {
		this.cronExpForSendEmail = cronExpForSendEmail;
	}
	
	public String getUnitAvatarWebPath() {
		return unitAvatarWebPath;
	}
	
	public void setUnitAvatarWebPath(String unitAvatarWebPath) {
		this.unitAvatarWebPath = unitAvatarWebPath;
	}
	
	public String getDefaultUnitAvatar() {
		return defaultUnitAvatar;
	}
	
	public void setDefaultUnitAvatar(String defaultUnitAvatar) {
		this.defaultUnitAvatar = defaultUnitAvatar;
	}
	
	public String getUnitPageUrl() {
		return unitPageUrl;
	}
	
	public void setUnitPageUrl(String unitPageUrl) {
		this.unitPageUrl = unitPageUrl;
	}
	
	public String getActivityPageUrl() {
		return activityPageUrl;
	}
	
	public void setActivityPageUrl(String activityPageUrl) {
		this.activityPageUrl = activityPageUrl;
	}
	
	public String getActivityTypeForUnitPageUrl() {
		return activityTypeForUnitPageUrl;
	}
	
	public void setActivityTypeForUnitPageUrl(String activityTypeForUnitPageUrl) {
		this.activityTypeForUnitPageUrl = activityTypeForUnitPageUrl;
	}
	
	public String getActivitySearchPageUrl() {
		return activitySearchPageUrl;
	}

	public void setActivitySearchPageUrl(String activitySearchPageUrl) {
		this.activitySearchPageUrl = activitySearchPageUrl;
	}

	public String getSysLogoPath() {
		return sysLogoPath;
	}
	
	public void setSysLogoPath(String sysLogoPath) {
		this.sysLogoPath = sysLogoPath;
	}
	
	public String getSysLogoWebPath() {
		return sysLogoWebPath;
	}
	
	public void setSysLogoWebPath(String sysLogoWebPath) {
		this.sysLogoWebPath = sysLogoWebPath;
	}
	
	public String getTemPath() {
		return temPath;
	}
	
	public void setTemPath(String temPath) {
		this.temPath = temPath;
	}
	
	public String getUploadFilePath() {
		return uploadFilePath;
	}
	
	public void setUploadFilePath(String uploadFilePath) {
		this.uploadFilePath = uploadFilePath;
	}

	/**
	 * @return the hostAddress
	 */
	public String getHostAddress() {
		return hostAddress;
	}

	/**
	 * @param hostAddress the hostAddress to set
	 */
	public void setHostAddress(String hostAddress) {
		this.hostAddress = hostAddress;
	}
	
	public String getSsoFlag() {
		return ssoFlag;
	}

	public void setSsoFlag(String ssoFlag) {
		this.ssoFlag = ssoFlag;
	}

	public String getCronExpressionForGenerateMethanolInst() {
		return cronExpressionForGenerateMethanolInst;
	}

	public void setCronExpressionForGenerateMethanolInst(String cronExpressionForGenerateMethanolInst) {
		this.cronExpressionForGenerateMethanolInst = cronExpressionForGenerateMethanolInst;
	}

	public String getCronExpressionForCloseMethanolInst() {
		return cronExpressionForCloseMethanolInst;
	}

	public void setCronExpressionForCloseMethanolInst(String cronExpressionForCloseMethanolInst) {
		this.cronExpressionForCloseMethanolInst = cronExpressionForCloseMethanolInst;
	}

	public String getSendMessageIfWorkflowStatusChanged() {
		return sendMessageIfWorkflowStatusChanged;
	}

	public void setSendMessageIfWorkflowStatusChanged(String sendMessageIfWorkflowStatusChanged) {
		this.sendMessageIfWorkflowStatusChanged = sendMessageIfWorkflowStatusChanged;
	}

	public String getAirportServiceUrl() {
		return airportServiceUrl;
	}

	public void setAirportServiceUrl(String airportServiceUrl) {
		this.airportServiceUrl = airportServiceUrl;
	}

	public String getServerIP() {
		return serverIP;
	}

	public void setServerIP(String serverIP) {
		this.serverIP = serverIP;
	}

	public String getServerPort() {
		return serverPort;
	}

	public void setServerPort(String serverPort) {
		this.serverPort = serverPort;
	}

	public String getAircraftCommanderReportServiceUrl() {
		return aircraftCommanderReportServiceUrl;
	}

	public void setAircraftCommanderReportServiceUrl(String aircraftCommanderReportServiceUrl) {
		this.aircraftCommanderReportServiceUrl = aircraftCommanderReportServiceUrl;
	}

	public String getCronExpressionForSyncronizeAircraftCommanderReport() {
		return cronExpressionForSyncronizeAircraftCommanderReport;
	}

	public void setCronExpressionForSyncronizeAircraftCommanderReport(
			String cronExpressionForSyncronizeAircraftCommanderReport) {
		this.cronExpressionForSyncronizeAircraftCommanderReport = cronExpressionForSyncronizeAircraftCommanderReport;
	}

	public String getCronExpressionForImportAircraftCommanderReport() {
		return cronExpressionForImportAircraftCommanderReport;
	}

	public void setCronExpressionForImportAircraftCommanderReport(String cronExpressionForImportAircraftCommanderReport) {
		this.cronExpressionForImportAircraftCommanderReport = cronExpressionForImportAircraftCommanderReport;
	}

	public String getEmsServiceUrl() {
		return emsServiceUrl;
	}

	public void setEmsServiceUrl(String emsServiceUrl) {
		this.emsServiceUrl = emsServiceUrl;
	}

	public String getEmsEnterpriseId() {
		return emsEnterpriseId;
	}

	public void setEmsEnterpriseId(String emsEnterpriseId) {
		this.emsEnterpriseId = emsEnterpriseId;
	}

	public String getEmsLoginName() {
		return emsLoginName;
	}

	public void setEmsLoginName(String emsLoginName) {
		this.emsLoginName = emsLoginName;
	}

	public String getEmsPassword() {
		return emsPassword;
	}

	public void setEmsPassword(String emsPassword) {
		this.emsPassword = emsPassword;
	}

	public String getEmsResendTime() {
		return emsResendTime;
	}

	public void setEmsResendTime(String emsResendTime) {
		this.emsResendTime = emsResendTime;
	}

	public String getCronExpForSendUnsentShortMsg() {
		return cronExpForSendUnsentShortMsg;
	}

	public void setCronExpForSendUnsentShortMsg(String cronExpForSendUnsentShortMsg) {
		this.cronExpForSendUnsentShortMsg = cronExpForSendUnsentShortMsg;
	}

	public String getCronExpForSendFailedShortMsg() {
		return cronExpForSendFailedShortMsg;
	}

	public void setCronExpForSendFailedShortMsg(String cronExpForSendFailedShortMsg) {
		this.cronExpForSendFailedShortMsg = cronExpForSendFailedShortMsg;
	}

	public String getDayOfSendImproveShortMsg() {
		return dayOfSendImproveShortMsg;
	}

	public void setDayOfSendImproveShortMsg(String dayOfSendImproveShortMsg) {
		this.dayOfSendImproveShortMsg = dayOfSendImproveShortMsg;
	}

	public String getCronExpForSendImproveShortMsg() {
		return cronExpForSendImproveShortMsg;
	}

	public void setCronExpForSendImproveShortMsg(String cronExpForSendImproveShortMsg) {
		this.cronExpForSendImproveShortMsg = cronExpForSendImproveShortMsg;
	}
	
	public String getSavePath() {
		return savePath;
	}

	public void setSavePath(String savePath) {
		this.savePath = savePath;
	}

	public String getCronExpForSendMethanolCommitNotice() {
		return cronExpForSendMethanolCommitNotice;
	}

	public void setCronExpForSendMethanolCommitNotice(String cronExpForSendMethanolCommitNotice) {
		this.cronExpForSendMethanolCommitNotice = cronExpForSendMethanolCommitNotice;
	}

	public String getCronExpForSetMethanolCommitDelay() {
		return cronExpForSetMethanolCommitDelay;
	}

	public void setCronExpForSetMethanolCommitDelay(String cronExpForSetMethanolCommitDelay) {
		this.cronExpForSetMethanolCommitDelay = cronExpForSetMethanolCommitDelay;
	}

	public String getAppId() {
		return appId;
	}

	public void setAppId(String appId) {
		this.appId = appId;
	}

	public String getFetchDeviceUrl() {
		return fetchDeviceUrl;
	}

	public void setFetchDeviceUrl(String fetchDeviceUrl) {
		this.fetchDeviceUrl = fetchDeviceUrl;
	}

	public String getPushMsgUrl() {
		return pushMsgUrl;
	}

	public void setPushMsgUrl(String pushMsgUrl) {
		this.pushMsgUrl = pushMsgUrl;
	}

	public String getSsoServerUrl() {
		return ssoServerUrl;
	}

	public void setSsoServerUrl(String ssoServerUrl) {
		this.ssoServerUrl = ssoServerUrl;
	}

	public String getSsoServiceUrl() {
		return ssoServiceUrl;
	}

	public void setSsoServiceUrl(String ssoServiceUrl) {
		this.ssoServiceUrl = ssoServiceUrl;
	}

	public String getSsoValidateUrl() {
		return ssoValidateUrl;
	}

	public void setSsoValidateUrl(String ssoValidateUrl) {
		this.ssoValidateUrl = ssoValidateUrl;
	}

	public String getCronExpForSynchronizeUser() {
		return cronExpForSynchronizeUser;
	}

	public void setCronExpForSynchronizeUser(String cronExpForSynchronizeUser) {
		this.cronExpForSynchronizeUser = cronExpForSynchronizeUser;
	}

	public Integer getActionItemConfirmDays() {
		return actionItemConfirmDays;
	}

	public void setActionItemConfirmDays(Integer actionItemConfirmDays) {
		this.actionItemConfirmDays = actionItemConfirmDays;
	}

	public Integer getActionItemAuditDays() {
		return actionItemAuditDays;
	}

	public void setActionItemAuditDays(Integer actionItemAuditDays) {
		this.actionItemAuditDays = actionItemAuditDays;
	}

	public String getSmsType() {
		return smsType;
	}

	public void setSmsType(String smsType) {
		this.smsType = smsType;
	}
	
}
