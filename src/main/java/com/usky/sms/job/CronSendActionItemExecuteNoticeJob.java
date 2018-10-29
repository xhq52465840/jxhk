
package com.usky.sms.job;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 发送行动项执行通知的job
 * @author 郑小龙
 *
 */
public class CronSendActionItemExecuteNoticeJob implements Job {
	
	private static final Logger log = Logger.getLogger(CronSendActionItemExecuteNoticeJob.class);
	
	private static String timestamp = "";
	
	private static int DEFAULT_RETRY_TIME = 1;
	
	public static String getTimestamp() {
		return timestamp;
	}
	
	public static void setTimestamp(String timestamp) {
		CronSendActionItemExecuteNoticeJob.timestamp = timestamp;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Integer errorCount = (Integer)context.get("errorCount");
		if (errorCount == null || errorCount < DEFAULT_RETRY_TIME) {
			log.info("发送行动项执行通知任务开始!");
			try {
				ActionItemDao actionItemDao = (ActionItemDao) SpringBeanUtils.getBean("actionItemDao");
				actionItemDao.sendExecuteNotice();
				log.info("发送行动项执行通知任务结束!");
			} catch (Exception e) {
				e.printStackTrace();
				log.error("发送行动项执行通知任务失败！" + e.getMessage());
				context.put("errorCount", errorCount == null ? 1 : errorCount + 1);
				JobExecutionException jobExecutionException = new JobExecutionException(e);
				jobExecutionException.setRefireImmediately(true);
				throw jobExecutionException;
			}
		}
	}
	
}
