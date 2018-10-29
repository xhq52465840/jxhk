
package com.usky.sms.job;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.flightmovementinfo.FlightInfoCache;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 缓存机场及飞机信息的job
 *
 */
public class CronAirportAndAircraftJob implements Job {
	
	private static final Logger log = Logger.getLogger(CronAirportAndAircraftJob.class);
	
	private static String timestamp = "";
	
	private static int DEFAULT_RETRY_TIME = 5;
	
	public static String getTimestamp() {
		return timestamp;
	}
	
	public static void setTimestamp(String timestamp) {
		CronAirportAndAircraftJob.timestamp = timestamp;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Integer errorCount = (Integer)context.get("errorCount");
		if (errorCount == null || errorCount < DEFAULT_RETRY_TIME) {
			log.info("开始refresh机场及飞机信息!");
			try {
				FlightInfoCache flightInfoCache = (FlightInfoCache) SpringBeanUtils.getBean("flightInfoCache");
				flightInfoCache.forceReload();
			} catch (Exception e) {
				e.printStackTrace();
				log.info("执行定时任务失败！" + e.getMessage());
				context.put("errorCount", errorCount == null ? 1 : errorCount + 1);
				JobExecutionException jobExecutionException = new JobExecutionException(e);
				jobExecutionException.setRefireImmediately(true);
				throw jobExecutionException;
			}
			log.info("结束refresh机场及飞机信息!");
		}
	}
	
}
