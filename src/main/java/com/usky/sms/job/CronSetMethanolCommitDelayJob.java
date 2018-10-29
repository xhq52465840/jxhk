
package com.usky.sms.job;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.safetyreview.inst.MethanolInstDao;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 设置评审单延期标识的job
 * @author 郑小龙
 *
 */
public class CronSetMethanolCommitDelayJob implements Job {
	
	private static final Logger log = Logger.getLogger(CronSetMethanolCommitDelayJob.class);
	
	private static String timestamp = "";
	
	private static int DEFAULT_RETRY_TIME = 1;
	
	public static String getTimestamp() {
		return timestamp;
	}
	
	public static void setTimestamp(String timestamp) {
		CronSetMethanolCommitDelayJob.timestamp = timestamp;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Integer errorCount = (Integer)context.get("errorCount");
		if (errorCount == null || errorCount < DEFAULT_RETRY_TIME) {
			JobDataMap map = context.getJobDetail().getJobDataMap();
			log.info("设置评审单延期标识开始!");
			try {
				MethanolInstDao methanolInstDao = (MethanolInstDao) SpringBeanUtils.getBean("methanolInstDao");
				Map<String, Object> obj = new HashMap<String, Object>();
				obj.put("delay", true);
				methanolInstDao.update((Integer) map.get("id"), obj);
			} catch (Exception e) {
				e.printStackTrace();
				log.info("执行定时任务失败！" + e.getMessage());
				context.put("errorCount", errorCount == null ? 1 : errorCount + 1);
				JobExecutionException jobExecutionException = new JobExecutionException(e);
				jobExecutionException.setRefireImmediately(true);
				throw jobExecutionException;
			}
			log.info("设置评审单延期标识结束!");
		}
	}
	
}
