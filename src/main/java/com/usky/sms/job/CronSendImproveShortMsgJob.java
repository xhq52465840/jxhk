
package com.usky.sms.job;

import java.util.Collection;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.shortmessage.ShortMessageDao;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 发送整改提醒短信的job
 * @author 郑小龙
 *
 */
public class CronSendImproveShortMsgJob implements Job {
	
	private static final Logger log = Logger.getLogger(CronSendImproveShortMsgJob.class);
	
	private static String timestamp = "";
	
	private static int DEFAULT_RETRY_TIME = 1;
	
	public static String getTimestamp() {
		return timestamp;
	}
	
	public static void setTimestamp(String timestamp) {
		CronSendImproveShortMsgJob.timestamp = timestamp;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Integer errorCount = (Integer)context.get("errorCount");
		if (errorCount == null || errorCount < DEFAULT_RETRY_TIME) {
			JobDataMap map = context.getJobDetail().getJobDataMap();
			log.info("发送整改短信提醒开始!");
			try {
				ShortMessageDao shortMessageDao = (ShortMessageDao) SpringBeanUtils.getBean("shortMessageDao");
				shortMessageDao.save((String) map.get("content"), (Collection<String>) map.get("cellTels"));
			} catch (Exception e) {
				e.printStackTrace();
				log.info("执行定时任务失败！" + e.getMessage());
				context.put("errorCount", errorCount == null ? 1 : errorCount + 1);
				JobExecutionException jobExecutionException = new JobExecutionException(e);
				jobExecutionException.setRefireImmediately(true);
				throw jobExecutionException;
			}
			log.info("发送整改短信提醒结束!");
		}
	}
	
}
