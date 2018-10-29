
package com.usky.sms.filter;

import java.io.IOException;
import java.text.ParseException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.context.support.XmlWebApplicationContext;

import com.usky.sms.activity.ActivityDao;
import com.usky.sms.activity.aircraftcommanderreport.AircraftCommanderReportTempDao;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.improvenotice.ImproveNoticeIssueDao;
import com.usky.sms.config.Config;
import com.usky.sms.config.ConfigService;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.email.SmtpDao;
import com.usky.sms.flightmovementinfo.FlightInfoDao;
import com.usky.sms.safetyreview.inst.MethanolInstDao;
import com.usky.sms.shortmessage.ShortMessageDao;
import com.usky.sms.subscribe.SubscribeDao;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.user.UserDao;

public class JobFilter implements Filter {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(JobFilter.class);
	
	private static final String CRON_EXPRESSION;
	
	/** 延迟启动job时间({@value}秒) */
	private static final int STARTUP_DELAY = 60;
	
	private String username;
	
	private String password;
	
	private Scheduler scheduler;
	
	static {
		Config config = new ConfigService().getConfig();
		CRON_EXPRESSION = config.getCronExpression();
	}

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest arg0, ServletResponse arg1, FilterChain arg2) throws IOException, ServletException {
	}

	@Override
	public void init(FilterConfig config) throws ServletException {
		try {
			XmlWebApplicationContext context = (XmlWebApplicationContext) WebApplicationContextUtils.getRequiredWebApplicationContext(config.getServletContext());
			username = config.getInitParameter("username");
			password = config.getInitParameter("password");
			// Grab the Scheduler instance from the Factory
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			
			scheduler.getContext().put("servletContext", config.getServletContext());
			
			// 启动发送邮件的job
			startSendEmailJob(scheduler, context);
			
			// 启动发送订阅邮件的job
//			startSendSubscribeEmailJob(scheduler, context);
			
			// 启动生成评审单的job
			startGenerateMethanolInstJob(scheduler, context);
			
			// 启动关闭评审单的job
//			startCloseMethanolInstJob(scheduler, context);
			
			// 启动同步机长报告的job
//			startSynchronizeAircraftCommanderReportJob(scheduler, context);
			
			// 启动导入机长报告数据的job
//			startImportAircraftCommanderReportJob(scheduler, context);
			
			// 启动refresh机场及飞机信息的job
//			startRefreshAirportAndAircraftJob(scheduler, context);
			
			// 启动发送未发送短信的job
			startSendUnsentShortMessageJob(scheduler, context);
			
			// 启动重发失败短信的job
			startSendFailedShortMessageJob(scheduler, context);
			
			// 启动发送整改期限到期提醒的通知
//			startSendImproveShortMsgJob(scheduler, context);
			
			// 启动同步用户的job
			startSynchronizeUserSchedulerJob(scheduler, context);
			
			// 启动发送行动项执行通知的job
			startSendActionItemExecuteNoticeSchedulerJob(scheduler, context);
			
			// 启动发送整改通知单问题执行通知的job
			startSendImproveNoticeIssueExecuteNoticeSchedulerJob(scheduler, context);
			
			// 启动发送整改单问题执行通知的job
			startSendCheckListExecuteNoticeSchedulerJob(scheduler, context);
			
			Thread schedulerThread = new Thread() {
				@Override
				public void run() {
					try {
						Thread.sleep(STARTUP_DELAY * 1000);
					} catch (InterruptedException ex) {
						// simply proceed
					}
					if (log.isInfoEnabled()) {
						log.info("Starting Quartz Scheduler now, after delay of " + STARTUP_DELAY + " seconds");
					}
					try {
						scheduler.start();
					}
					catch (SchedulerException ex) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "Could not start Quartz Scheduler after delay: " + ex.getMessage());
					}
				}
			};
			schedulerThread.setName("Quartz Scheduler [" + scheduler.getSchedulerName() + "]");
			schedulerThread.setDaemon(true);
			schedulerThread.start();
			
			// and start it off
//			scheduler.start();
		} catch (final SchedulerException ex) {
			log.error(ex.getMessage(), ex);
		}
		//		createCron("dataSynchronizeJob", CronDataSynchronizingJob.class, CRON_EXPRESSION, null, "username", username, "password", password);
	}

	private void createCron(final String name, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Object... params) {
		// Define job instance (group = "default")
		final JobDetail job = new JobDetail(name, "default", jobClass);
		if (params != null) {
			Validate.isTrue(params.length % 2 == 0);
			final JobDataMap map = job.getJobDataMap();
			for (int i = 0; i < params.length - 1; i += 2) {
				Validate.isTrue(params[i] instanceof String);
				map.put(params[i], params[i + 1]);
			}
		}
		final String cronEx;
		if (StringUtils.isNotBlank(cronExpression) == true) {
			cronEx = cronExpression;
		} else {
			cronEx = cronDefaultExpression;
		}
		final Trigger trigger;
		try {
			trigger = new CronTrigger(name + "Trigger", "default", cronEx);
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
	 * 启动发送邮件的job
	 */
	private void startSendEmailJob(Scheduler scheduler, XmlWebApplicationContext context){
		SmtpDao smtpDao= (SmtpDao) context.getBean("smtpDao");
		smtpDao.sendUnderSendingEmails(scheduler);
	}
	
	/**
	 * 启动发送订阅邮件的job
	 */
	private void startSendSubscribeEmailJob(Scheduler scheduler, XmlWebApplicationContext context){
		SubscribeDao subscribeDao= (SubscribeDao) context.getBean("subscribeDao");
		subscribeDao.sendSubscribeEmail(scheduler);
	}

	/**
	 * 启动生成评审单的job
	 */
	private void startGenerateMethanolInstJob(Scheduler scheduler, XmlWebApplicationContext context){
		MethanolInstDao methanolInstDao= (MethanolInstDao) context.getBean("methanolInstDao");
		methanolInstDao.generateMethanolInstWithScheduler(scheduler);
	}

	/**
	 * 启动关闭评审单的job
	 */
	private void startCloseMethanolInstJob(Scheduler scheduler, XmlWebApplicationContext context){
		MethanolInstDao methanolInstDao= (MethanolInstDao) context.getBean("methanolInstDao");
		methanolInstDao.closeMethanolInstWithScheduler(scheduler);
	}

	/**
	 * 启动同步机长报告的job
	 */
	private void startSynchronizeAircraftCommanderReportJob(Scheduler scheduler, XmlWebApplicationContext context){
		ActivityDao activityDao= (ActivityDao) context.getBean("activityDao");
		activityDao.synchronizeAircraftCommanderReport(scheduler);
	}
	
	/**
	 * 启动导入机长报告数据的job
	 */
	private void startImportAircraftCommanderReportJob(Scheduler scheduler, XmlWebApplicationContext context){
		AircraftCommanderReportTempDao aircraftCommanderReportTempDao= (AircraftCommanderReportTempDao) context.getBean("aircraftCommanderReportTempDao");
		aircraftCommanderReportTempDao.importAircraftCommanderReport(scheduler);
	}
	
	/**
	 * 启动refresh机场及飞机信息的job
	 */
	private void startRefreshAirportAndAircraftJob(Scheduler scheduler, XmlWebApplicationContext context){
		FlightInfoDao flightInfoDao= (FlightInfoDao) context.getBean("flightInfoDao");
		flightInfoDao.refreshAirportAndAircraft(scheduler);
	}
	
	/**
	 * 启动发送未发送短信的job
	 */
	private void startSendUnsentShortMessageJob(Scheduler scheduler, XmlWebApplicationContext context){
		ShortMessageDao shortMessageDao= (ShortMessageDao) context.getBean("shortMessageDao");
		shortMessageDao.sendUnsentShortMessage(scheduler);
	}
	
	/**
	 * 启动重发失败短信的job
	 */
	private void startSendFailedShortMessageJob(Scheduler scheduler, XmlWebApplicationContext context){
		ShortMessageDao shortMessageDao= (ShortMessageDao) context.getBean("shortMessageDao");
		shortMessageDao.sendFailedShortMessage(scheduler);
	}
	
	/**
	 * 启动发送整改提醒短信的job
	 */
	private void startSendImproveShortMsgJob(Scheduler scheduler, XmlWebApplicationContext context){
		CheckListDao checkListDao = (CheckListDao) context.getBean("checkListDao");
		checkListDao.sendImproveShortMsg(scheduler);
		ImproveNoticeIssueDao improveNoticeIssueDao = (ImproveNoticeIssueDao) context.getBean("improveNoticeIssueDao");
		improveNoticeIssueDao.sendImproveShortMsg(scheduler);
	}
	
	/**
	 * 启动同步用户的job
	 */
	private void startSynchronizeUserSchedulerJob(Scheduler scheduler, XmlWebApplicationContext context){
		UserDao userDao = (UserDao) context.getBean("userDao");
		userDao.synchronizeUserScheduler(scheduler);
	}
	
	/**
	 * 启动发送行动项执行通知的job
	 */
	private void startSendActionItemExecuteNoticeSchedulerJob(Scheduler scheduler, XmlWebApplicationContext context){
		ActionItemDao actionItemDao = (ActionItemDao) context.getBean("actionItemDao");
		actionItemDao.sendExecuteNoticeScheduler(scheduler);
	}
	
	/**
	 * 启动发送整改通知单问题执行通知的job
	 */
	private void startSendImproveNoticeIssueExecuteNoticeSchedulerJob(Scheduler scheduler, XmlWebApplicationContext context){
		ImproveNoticeIssueDao improveNoticeIssueDao = (ImproveNoticeIssueDao) context.getBean("improveNoticeIssueDao");
		improveNoticeIssueDao.sendExecuteNoticeScheduler(scheduler);
	}
	
	/**
	 * 启动发送整改单问题执行通知的job
	 */
	private void startSendCheckListExecuteNoticeSchedulerJob(Scheduler scheduler, XmlWebApplicationContext context){
		CheckListDao checkListDao = (CheckListDao) context.getBean("checkListDao");
		checkListDao.sendExecuteNoticeScheduler(scheduler);
	}
}
