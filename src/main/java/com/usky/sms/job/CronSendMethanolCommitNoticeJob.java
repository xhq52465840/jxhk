
package com.usky.sms.job;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.message.MessageDao;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 发送安全评审提交提醒的job
 * @author 郑小龙
 *
 */
public class CronSendMethanolCommitNoticeJob implements Job {
	
	private static final Logger log = Logger.getLogger(CronSendMethanolCommitNoticeJob.class);
	
	private static String timestamp = "";
	
	private static int DEFAULT_RETRY_TIME = 1;
	
	public static String getTimestamp() {
		return timestamp;
	}
	
	public static void setTimestamp(String timestamp) {
		CronSendMethanolCommitNoticeJob.timestamp = timestamp;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Integer errorCount = (Integer)context.get("errorCount");
		if (errorCount == null || errorCount < DEFAULT_RETRY_TIME) {
			JobDataMap map = context.getJobDetail().getJobDataMap();
			log.info("发送安全评审提交提醒开始!");
			try {
				MessageDao messageDao = (MessageDao) SpringBeanUtils.getBean("messageDao");
				messageDao.save(map);
			} catch (Exception e) {
				e.printStackTrace();
				log.info("执行定时任务失败！" + e.getMessage());
				context.put("errorCount", errorCount == null ? 1 : errorCount + 1);
				JobExecutionException jobExecutionException = new JobExecutionException(e);
				jobExecutionException.setRefireImmediately(true);
				throw jobExecutionException;
			}
			log.info("发送安全评审提交提醒结束!");
		}
	}
	
}
