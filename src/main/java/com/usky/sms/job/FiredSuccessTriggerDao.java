
package com.usky.sms.job;

import java.util.Date;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class FiredSuccessTriggerDao extends BaseDao<FiredSuccessTriggerDO> {
	
	protected FiredSuccessTriggerDao() {
		super(FiredSuccessTriggerDO.class);
	}
	
	/** 
	 * 根据所给参数返回最近出发时间
	 * @param triggerName 触发器名称
	 * @param triggerGroup 触发器组
	 * @param  jobName ob名称
	 * @param  jobGroup job组
	 * @return
	 */
	public Date getLatestFireDate(String triggerName, String triggerGroup, String jobName, String jobGroup) {
		@SuppressWarnings("unchecked")
		List<Date> dates = (List<Date>) this.query("select max(t.firedTime) from FiredSuccessTriggerDO t where t.triggerName = ? and t.triggerGroup = ? and t.jobName = ? and t.jobGroup = ?", triggerName, triggerGroup, jobName, jobGroup);
		return dates.get(0);
	}
}
