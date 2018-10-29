package com.usky.sms.losa;

import java.lang.reflect.Field;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.hibernate.SQLQuery;
import org.hibernate.Session;

import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.plan.TaskPlanDO;
import com.usky.sms.losa.plan.TaskPlanDao;
import com.usky.sms.user.UserContext;

public class ObserveDao extends BaseDao<ObserveDO>{
	public ObserveDao(){
		super(ObserveDO.class);
	}
	private TaskPlanDao taskPlanDao;
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ObserveDO file = (ObserveDO) obj;
		if ("activityUpdateTime".equals(fieldName)) {
			SimpleDateFormat dateformat = new SimpleDateFormat(
					"yyyy-MM-dd HH:mm:ss");
			map.put("activityUpdateTime", dateformat.format(file.getActivityUpdateTime()));
		}else {
			super.setField(map, obj, claz, multiple, field);
		}
		
	} 
	
	//获取单一LOSA观察活动最新更新时间接口
	public List<Object> queryActivityUpdateTime(String id) throws ParseException{
		
		String sql="select t.activityUpdateTime from ObserveDO t where t.id='"+id+"'";
		@SuppressWarnings("unchecked")
		List<Object> list=this.getHibernateTemplate().find(sql);
		return list;
		
		
	}
	//批量获取LOSA观察活动最新更新时间接口
	public List<Object[]> queryActsUpdateTime(String userId) throws ParseException{
		String sql="select t.id, t.ACTIVITY_UPDATE_DATE from L_OBSERVE t  "
				+ " left join l_plan lp on t.plan_id=lp.id  "
				+"  left join a_auditor aa on lp.OBSERVER_ID=aa.id"
				+"  left join t_user tu on tu.id = aa.user_id "
				+ " where t.deleted=0  and (lp.plan_status='distributed' or lp.plan_status='done')and tu.id='"+userId+"'";
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query= session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> list=query.list();
		return list;
	}
	
	public List<ObserveDO>pullActivity(String id) throws Exception{
		String sql="from ObserveDO t where t.id='"+id+"'";
		@SuppressWarnings("unchecked")
		List<ObserveDO>list=this.getHibernateTemplate().find(sql);
		if(list.size()!=0){
			
			return list;
			
		}else{
			return null;
		}
	}
	
	public int submitLosa(String id) throws Exception{
		//先修改Plan
		/**Date date=new Date();
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String stringDate=dateFormat.format(date);
		String sql="update ObserveDO t set t.activityStatus='已提交', t.activityUpdateTime=to_date('"+stringDate+"', 'yyyy-mm-dd hh24:mi:ss') where id="+id;
		int result=this.getHibernateTemplate().bulkUpdate(sql);*/
		//先修改Pland的状态
		int result=0;
		boolean resultBoolean=false;
		ObserveDO observe=this.internalGetById(Integer.valueOf(id));
		taskPlanDao.modifyStatusToDone(observe.getPlanId());
		observe.setActivityUpdateTime(new Date());
		observe.setLastModifier(UserContext.getUserId());
		resultBoolean=this.internalUpdate(observe);
		//修改观察表的更新时间
		if(resultBoolean==true){
			result=2;
		}
		return result;
	}
	/**
	 * 新建观察活动接口
	 * @param planId--计划ID
	 * @param flightLinkId--航班关联ID
	 * @param observerUserId--观察员的用户ID
	 * @throws Exception
	 */
	public void createObserveActivity(Integer planId,String observerUserId,String activityNumber) throws Exception{
		//根据观察员的用户ID生成观察员的身份证明
		try{
			ObserveDO observe=new ObserveDO();
			observe.setActivityStatus("执行中");
			observe.setIdentifyNumber(observerUserId);
			observe.setActivityNumber(activityNumber);
			observe.setCreator(UserContext.getUserId());
			observe.setLastModifier(UserContext.getUserId());
			observe.setPlanId(planId);
			Date date=new Date();
			observe.setActivityUpdateTime(date);
			this.internalSave(observe);
			
		}catch(Exception e){
			e.printStackTrace();
			
		}
	}
	/**
	 * 根据用户ID生成观察员的身份证明
	 * @param userId
	 * @return
	 * @throws Exception
	 */
	private String setObserverNo(Integer userId) throws Exception {
		String observerNo=null;
		try{
			
			
		}catch(Exception e){
			e.printStackTrace();
		}
		return observerNo;
	}

	public TaskPlanDao getTaskPlanDao() {
		return taskPlanDao;
	}

	public void setTaskPlanDao(TaskPlanDao taskPlanDao) {
		this.taskPlanDao = taskPlanDao;
	}

}
