
package com.usky.sms.job;

import java.util.List;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.email.SmtpDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 发送邮件的job
 * @author 郑小龙
 *
 */
public class CronSendEmailJob implements Job {
	
	private static final Logger log = Logger.getLogger(CronSendEmailJob.class);
	
	private static String timestamp = "";
	
	private static int DEFAULT_RETRY_TIME = 1;
	
	public static String getTimestamp() {
		return timestamp;
	}
	
	public static void setTimestamp(String timestamp) {
		CronSendEmailJob.timestamp = timestamp;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Integer errorCount = (Integer) context.get("errorCount");
		if (errorCount == null || errorCount < DEFAULT_RETRY_TIME) {
			log.info("发送通知邮件开始!");
			try {
				SmtpDao smtpDao = (SmtpDao) SpringBeanUtils.getBean("smtpDao");
				smtpDao.sendUnderSendingEmails();
			} catch (Exception e) {
				e.printStackTrace();
				log.info("执行定时任务失败！" + e.getMessage());
				context.put("errorCount", errorCount == null ? 1 : errorCount + 1);
				JobExecutionException jobExecutionException = new JobExecutionException(e);
				jobExecutionException.setRefireImmediately(true);
				throw jobExecutionException;
			}
			log.info("发送通知结邮件束!");
		}
	}
	
}
