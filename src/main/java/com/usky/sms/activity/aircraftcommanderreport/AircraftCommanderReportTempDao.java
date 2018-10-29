
package com.usky.sms.activity.aircraftcommanderreport;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.comm.WebClientDevWrapper;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.job.CronImportAircraftCommanderReportJob;

public class AircraftCommanderReportTempDao extends BaseDao<AircraftCommanderReportTempDO> {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(AircraftCommanderReportTempDao.class);
	
	/** 默认导入机场报告数据到中间表的时间(每天12点和23点进行同步) */
	private static final String CRON_EXPRESSION_FOR_IMPORT_AIRCRAFT_COMMANDER_REPORT = "0 0 12,23 * * ?";
	
	private static final String GROUP = "aircraftCommanderReportTemp";
	
	private static final String NAME_SUFIX_TRIGGER = "_trigger";
	
	private Config config;

	@Autowired
	private FieldRegister fieldRegister;
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	public AircraftCommanderReportTempDao() {
		super(AircraftCommanderReportTempDO.class);
		this.config = Config.getInstance();
	}
	
	/**
	 * 导入机长报告数据
	 * @param scheduler
	 */
	public void importAircraftCommanderReport(Scheduler scheduler) {
		String expression = config.getCronExpressionForImportAircraftCommanderReport();
		if (StringUtils.isNotBlank(expression)) {
			try {
				createCron(scheduler, "importAircraftCommanderReportToTemp", CronImportAircraftCommanderReportJob.class, CRON_EXPRESSION_FOR_IMPORT_AIRCRAFT_COMMANDER_REPORT, expression);
			} catch (Exception e) {
				e.printStackTrace();
				log.warn("导入机长报告数据失败！" + e.getMessage(), e);
				throw e;
			}
		}
	}

	/**
	 * 创建一个job
	 * 
	 * @param scheduler 
	 * @param name 定时任务的名称
	 * @param jobClass 定时任务的实现类
	 * @param cronDefaultExpression 默认的表达式
	 * @param cronExpression 表达式
	 * @param params 参数对
	 */
	private void createCron(final Scheduler scheduler, final String name, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Object... params) {
		final JobDetail job = new JobDetail(name, GROUP, jobClass);
		if (params != null) {
			Validate.isTrue(params.length % 2 == 0);
			final JobDataMap map = job.getJobDataMap();
			for (int i = 0; i < params.length - 1; i += 2) {
				Validate.isTrue(params[i] instanceof String);
				map.put(params[i], params[i + 1]);
			}
		}
		String cronEx;
		if (StringUtils.isNotBlank(cronExpression) == true) {
			cronEx = cronExpression;
		} else {
			cronEx = cronDefaultExpression;
		}
		final Trigger trigger;
		try {
			trigger = new CronTrigger(name + NAME_SUFIX_TRIGGER, GROUP, cronEx);
		} catch (final ParseException ex) {
			log.error("Could not create cron trigger with expression '" + cronEx + "' (cron job is disabled): " + ex.getMessage(), ex);
			return;
		}
		try {
			// Schedule the job with the trigger
			scheduler.scheduleJob(job, trigger);
		} catch (final SchedulerException ex) {
			log.error("Could not create cron job: " + ex.getMessage(), ex);
			return;
		}
		log.info("Cron job '" + name + "' successfully configured: " + cronEx);
	}

	/**
	 * 将外部接口的机长报告数据导入到临时中间表中
	 */
	@SuppressWarnings("unchecked")
	public void importAircraftCommanderReportToTemp() throws Exception{
		// 获取最近的回收时间
		Date latestRetvTime = this.getLatestRetvTime();
		
		// 获取调用外部接口获取数据(获取latestRetvTime时间之后(>=)的数据,所以要在latestRetvTime的基础上加1秒)
		Map<String, Object> dataReceive = this.getAircraftCommanderReport(new Date(latestRetvTime.getTime() + 1000));
		if (!(boolean) dataReceive.get("success")) {
			throw new Exception("获取" + DateHelper.formatIsoSecond(latestRetvTime) + "以后的数据失败!");
		}
		// 机长报告的数据
		Map<String, Object> reportMaps = (Map<String, Object>) dataReceive.get("data");
		if (null != reportMaps) {
			for (Entry<String, Object> entry : reportMaps.entrySet()) {
				Map<String, Object> reportMap = (Map<String, Object>) entry.getValue();
				if (null != reportMap && "N".equals((String) reportMap.get("reportFlag"))) { // 只导入reportFlag为N的数据
					Integer legId = reportMap.get("legId") == null ? null : Integer.parseInt((String) reportMap.get("legId"));
					Date retvTime = reportMap.get("retvTime") == null ? null : DateHelper.parseIsoSecond((String) reportMap.get("retvTime"));
					String reportData = gson.toJson(reportMap);
					AircraftCommanderReportTempDO aircraftCommanderReportTemp = new AircraftCommanderReportTempDO();
					aircraftCommanderReportTemp.setLegId(legId);
					aircraftCommanderReportTemp.setRetvTime(retvTime);
					aircraftCommanderReportTemp.setReportData(reportData);
					this.internalSave(aircraftCommanderReportTemp);
				}
			}
		}
	}
	
	/**
	 * 获取最近的回收时间
	 */
	public Date getLatestRetvTime() {
		Date result = null;
		String hql = "select max(t.retvTime) from AircraftCommanderReportTempDO t";
		result = (Date) this.query(hql).get(0);
		if (null == result) {
			// 如果没有数据返回1970年1月1日
			result = new Date(0);
		}
		return result;
	}

	/**
	 * 发送http请求获取机长报告的数据
	 * @param retvTime
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getAircraftCommanderReport(Date retvTime) throws Exception {
		String aircraftCommanderReportServiceUrl = config.getAircraftCommanderReportServiceUrl();
		if (StringUtils.isBlank(aircraftCommanderReportServiceUrl)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_112001002);
		}
		DefaultHttpClient httpClient = new DefaultHttpClient();
		if (aircraftCommanderReportServiceUrl.startsWith("https")) {
			httpClient = (DefaultHttpClient) WebClientDevWrapper.wrapClient(httpClient);
		}
		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		nvps.add(new BasicNameValuePair("retvTime", DateHelper.formatIsoSecond(retvTime)));
		
		nvps.add(new BasicNameValuePair("stream.contentType", "text/json;charset=utf-8"));
//		nvps.add(new BasicNameValuePair("wt", "json"));
		HttpPost httpPost = new HttpPost(aircraftCommanderReportServiceUrl);
		try {
			httpPost.setEntity(new UrlEncodedFormEntity(nvps, "UTF-8"));
			HttpResponse response = httpClient.execute(httpPost);
			HttpEntity entity = response.getEntity();
			try {
				String content = EntityUtils.toString(entity);
				Map<String, Object> result = (Map<String, Object>) gson.fromJson(content, new TypeToken<Map<String, Object>>(){}.getType());
				if (!(boolean) result.get("success")) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_112001001);
				}
				return result;
			} catch (IOException ex) {
				throw ex;
			} catch (RuntimeException ex) {
				httpPost.abort();
				throw ex;
			}
		} finally {
			httpPost.releaseConnection();
		}
	}
	
	/**
	 * 获取未导入的数据
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<AircraftCommanderReportTempDO> getUnImportedReports(){
		return (List<AircraftCommanderReportTempDO>) this.query("from AircraftCommanderReportTempDO t where t.deleted = false and t.imported = ? order by t.lastUpdate desc", false);
	}

	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	public void delete(Collection<AircraftCommanderReportTempDO> list) {
		List<String> ids = new ArrayList<String>();
		for (AircraftCommanderReportTempDO aircraftCommanderReportTemp : list) {
			ids.add(aircraftCommanderReportTemp.getId().toString());
		}
		this.markAsDeleted(ids.toArray(new String[0]));
	}

	public void setConfig(Config config) {
		this.config = config;
	}

	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}

	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
}
