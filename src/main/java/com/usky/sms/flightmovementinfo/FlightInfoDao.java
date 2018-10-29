package com.usky.sms.flightmovementinfo;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;

import com.usky.sms.accessinformation.FlightInfoEntityDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.job.CronAirportAndAircraftJob;

public class FlightInfoDao extends BaseDao<FlightInfoDO> {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(FlightInfoDao.class);
	
	protected FlightInfoDao() {
		super(FlightInfoDO.class);
	}

	// 根据时间获取当前日期内的航班号(成功)
	@SuppressWarnings("unchecked")
	public List<FlightInfoDO> getByTime(Date date,String flightNum) {
		String sql = "from FlightInfoDO t where flightBJDate = ? and upper(concat(t.carrier, t.flightNO)) like upper(?)";
		List<FlightInfoDO> list = this.getHibernateTemplate().find(sql, date, "%" + flightNum + "%");
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public Integer count(Date date,Integer page) {
		String sql = "select count(f) from FlightInfoDO f where f.flightBJDate = ?";
		String sizesql = "select count(f) from FlightInfoDO f where flightBJDate = ? and rownum <= ?";
		List<Long> list = this.getHibernateTemplate().find(sql, date);
		List<Long> sizelist = this.getHibernateTemplate().find(sizesql,date,(page * 10l));
		return list.get(0).intValue()-sizelist.get(0).intValue();
	}
	@SuppressWarnings("unchecked")
	public List<FlightInfoDO> getByFlightInfoID(Integer flightInfoID){
		String sql = "from FlightInfoDO where flightInfoID = ?";
		return this.getHibernateTemplate().find(sql,flightInfoID);
	}
	
	/**
	 * 通过模糊查询机组人员的姓名获取航班信息
	 * @param name
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<FlightInfoEntityDO> getByFlightCrewMemberName(String name){
		if(null == name){
			return new ArrayList<FlightInfoEntityDO>();
		}
		name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		name = "%" + name + "%";
		return this.getHibernateTemplate().find("select t from FlightInfoEntityDO t, FlightCrewScheduleInfoDO fcs, FlightCrewMemberDO fcm where fcs.flightInfoID = t.flightInfo.id and fcs.p_code = fcm.p_code and fcm.c_name like ? escape '/'", name);
	}
	
	/**
	 * 通过模糊查询乘务组人员的姓名获取航班信息
	 * @param name
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<FlightInfoEntityDO> getByCabinCrewMemberName(String name){
		if(null == name){
			return new ArrayList<FlightInfoEntityDO>();
		}
		name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		name = "%" + name + "%";
		return this.getHibernateTemplate().find("select t from FlightInfoEntityDO t, CabinCrewScheduleInfoDO ccs, CabinCrewMemberDO ccm where ccs.flightInfoID = t.flightInfo.id and ccs.staff_id = ccm.staff_ID and ccm.staff_name like ? escape '/'", name);
	}
	
	/**
	 * 通过航班号和时间查找对应航班信息的记录，如果没有则返回null，否则返回第一条数据
	 */
	public FlightInfoDO getByFlightNOAndDate(String flightNO, Date date){
		if(null == flightNO || null == date){
			return null;
		}
		@SuppressWarnings("unchecked")
		List<FlightInfoDO> list = this.getHibernateTemplate().find("from FlightInfoDO t where t.flightNO = ? and t.flightBJDate = ?", flightNO, date);
		if(list.isEmpty()){
			return null;
		}
		return list.get(0);
	}
	
	/**
	 * 查询所有的航班号
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<String> getAllFlightNO() {
		return this.getHibernateTemplate().find("select distinct concat(t.carrier, t.flightNO) as flightNO from FlightInfoDO t where flightNO is not null order by flightNO");
	}
	
	/**
	 * 查询所有的机号
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<String> getAllTailNO(){
		return this.getHibernateTemplate().find("select distinct t.tailNO from FlightInfoDO t where t.tailNO != null order by t.tailNO");
	}
	
	/**
	 * refresh机场及飞机信息
	 * @param scheduler
	 */
	public void refreshAirportAndAircraft(Scheduler scheduler) {
		String expression = "0 0 7 * * ?";
		try {
			createCron(scheduler, "refreshAirportAndAircraft", CronAirportAndAircraftJob.class, expression, expression);
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("refresh机场及飞机信息失败！" + e.getMessage(), e);
			throw e;
		}
	}

	/**
	 * 创建一个job
	 * 
	 * @param scheduler 
	 * @param name 定时任务的名称
	 * @param jobClass 定时任务的实现类
	 * @param cronDefaultExpression 默认的表达式
	 * @param cronExpression 表达式
	 * @param params 参数对
	 */
	private void createCron(final Scheduler scheduler, final String name, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Object... params) {
		final JobDetail job = new JobDetail(name, "refreshAirportAndAircraft", jobClass);
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
		final Trigger trigger;
		try {
			trigger = new CronTrigger(name + "_trigger", "refreshAirportAndAircraft", cronEx);
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
