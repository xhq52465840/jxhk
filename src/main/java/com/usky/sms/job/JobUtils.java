package com.usky.sms.job;

import java.text.ParseException;
import java.util.Date;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;


public class JobUtils {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(JobUtils.class);
	
	public static final String NAME_SUFIX_TRIGGER = "_trigger";

	/**
	 * 创建一个job
	 * 
	 * @param scheduler 
	 * @param name 定时任务的名称
	 * @param group 定时任务的组
	 * @param jobClass 定时任务的实现类
	 * @param cronDefaultExpression 默认的表达式
	 * @param cronExpression 表达式
	 * @param params 参数对
	 */
	public static void createCron(final Scheduler scheduler, final String name, final String group, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Object... params) {
		createCron(scheduler, name, group, jobClass, cronDefaultExpression, cronExpression, null, null, params);
	}
	
	/**
	 * 创建一个job
	 * 
	 * @param scheduler 
	 * @param name 定时任务的名称
	 * @param group 定时任务的组
	 * @param jobClass 定时任务的实现类
	 * @param cronDefaultExpression 默认的表达式
	 * @param cronExpression 表达式
	 * @param startDate 开始执行时间
	 * @param endDate 结束执行时间
	 * @param params 参数对
	 */
	public static void createCron(final Scheduler scheduler, final String name, final String group, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Date startDate, final Date endDate, final Object... params) {
		final JobDetail job = new JobDetail(name, group, jobClass);
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
		final CronTrigger trigger;
		try {
			trigger = new CronTrigger(name + NAME_SUFIX_TRIGGER, group, cronEx);
			if (null != startDate && startDate.after(new Date())) {
				trigger.setStartTime(startDate);
			}
			if (null != endDate) {
				trigger.setEndTime(endDate);
			}
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

}
