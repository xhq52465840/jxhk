
package com.usky.sms.job;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.ups.UpsUser;
import com.usky.sms.ups.service.UpsService;
import com.usky.sms.ups.service.UpsUserService;
import com.usky.sms.user.UserDO;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * @author li_siliang
 */
public class CronDataSynchronizingJob implements Job {
	
	private static final Logger log = Logger.getLogger(CronDataSynchronizingJob.class);
	
	private HibernateTemplate hibernateTemplate = SpringBeanUtils.getHibernateTemplate();
	
	private static String timestamp = "";
	
	public static String getTimestamp() {
		return timestamp;
	}
	
	public static void setTimestamp(String timestamp) {
		CronDataSynchronizingJob.timestamp = timestamp;
	}
	
	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		synchronized (timestamp) {
			JobDataMap map = context.getJobDetail().getJobDataMap();
			log.info("Synchronizing-all starts!");
			try {
				synchronizeAll(map.getString("username"), map.getString("password"));
			} catch (Exception e) {
				e.printStackTrace();
			}
			log.info("Synchronizing-all ends!");
		}
	}
	
	@Transactional(propagation = Propagation.REQUIRED)
	public void synchronizeAll(String username, String password) throws Exception {
		UpsService upsService = new UpsService();
		@SuppressWarnings("unchecked")
		Map<String, Object> data = (Map<String, Object>) upsService.login(username, password);
		String tokenId = (String) data.get("tokenid");
		
		UpsUserService upsUserService = new UpsUserService();
		List<UpsUser> upsUserList = upsUserService.fetchAll(tokenId);
		List<UserDO> userList = upsUserService.toUserDO(upsUserList);
		@SuppressWarnings("unchecked")
		List<UserDO> dbUserList = hibernateTemplate.find("from UserDO");
		for (UserDO dbUser : dbUserList) {
			boolean exist = false;
			for (UserDO user : userList) {
				if (user.getUsername().equals(dbUser.getUsername())) {
					user.setId(dbUser.getId());
					exist = true;
					break;
				}
			}
			if (exist) continue;
			dbUser.setDeleted(true);
			userList.add(dbUser);
		}
		hibernateTemplate.saveOrUpdateAll(userList);
	}
	
}
