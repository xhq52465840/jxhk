package com.usky.sms.losa.activity;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;



import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.plan.TaskPlanDao;
import com.usky.sms.losa.score.ScoreDao;
import com.usky.sms.losa.score.ScoreSelectContentDao;
import com.usky.sms.losa.scoreTemplet.ScoreTempletDao;
import com.usky.sms.user.UserContext;

public class ObserveActivityDao extends BaseDao<ObserveActivityDO>{
	public ObserveActivityDao(){
		super(ObserveActivityDO.class);
	}
	@Autowired
	private ScoreDao scoreDao;
	
	@Autowired
	private ScoreTempletDao scoreTempletDao;
	
	@Autowired
	private ScoreSelectContentDao scoreSelectContentDao;
	
	@Autowired
	private TaskPlanDao taskPlanDao;
	
	@Autowired
	private  ObserverInfoDao observerInfoDao;
	
	@Autowired
	private ObserveApproachDao observeApproachDao;
	
	/**
	 * 从服务器拉取观察活动
	 * @param id
	 * @param flyStageName
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object>pullActivity(String  id,String flyStageName) throws Exception{
		Map<String,Object>map=new HashMap<String,Object>();
		ObserveActivityDO activity=new ObserveActivityDO();
		try{
			if(StringUtils.isNotBlank(id)){
				activity=this.internalGetById(Integer.valueOf(id));
				map.put("observeActivity", activity);
				map.put("planId", activity.getPlanId());
			}else{
			
				Date scoreUpdateDate=scoreTempletDao.queryLastUpdateTime();
				activity.setActivityUpdateTime(scoreUpdateDate);
				map.put("observeActivity", activity);
			}
			//获取所有的阶段score
				List<Map<String,Object>>scoreList=scoreTempletDao.queryScoreTemp(id,flyStageName);
				if(StringUtils.isBlank(flyStageName)){
					//获取各个阶段的评分信息
					
					map.put(FlyStageNameEnum.DEPARTURE.getKey(), 
							scoreTempletDao.getFlyStageScore(FlyStageNameEnum.DEPARTURE.getKey(), scoreList));
					map.put(FlyStageNameEnum.TAKEOFF.getKey(), 
							scoreTempletDao.getFlyStageScore(FlyStageNameEnum.TAKEOFF.getKey(), scoreList));
					map.put(FlyStageNameEnum.CRUISE.getKey(), 
							scoreTempletDao.getFlyStageScore(FlyStageNameEnum.CRUISE.getKey(), scoreList));
					map.put(FlyStageNameEnum.TECHWORKSHEET.getKey(), 
							scoreTempletDao.getFlyStageScore(FlyStageNameEnum.TECHWORKSHEET.getKey(), scoreList));
					map.put(FlyStageNameEnum.LAUNCH.getKey(), 
							scoreTempletDao.getFlyStageScore(FlyStageNameEnum.LAUNCH.getKey(), scoreList));
					map.put(FlyStageNameEnum.WHOLEFLIGHT.getKey(), 
							scoreTempletDao.getFlyStageScore(FlyStageNameEnum.WHOLEFLIGHT.getKey(), scoreList));
					
				}else{
					//获取该阶段的评分信息
					map.put("score", scoreTempletDao.getFlyStageScore(flyStageName, scoreList));
				}
				
		}catch(Exception e){
			e.printStackTrace();
		}
		return map;
		
	}
	public Map<String,Object>pullActivity(String  id) throws Exception{
		Map<String,Object>map=new HashMap<String,Object>();
		try{
			if(StringUtils.isNotBlank(id)){
				ObserveActivityDO activity=this.internalGetById(Integer.valueOf(id));
				map.put("observeActivity", activity);
				map.put("scoreSelectValue", scoreDao.queryByObserveId(activity.getId()));
			}	
		}catch(Exception e){
			e.printStackTrace();
		}
		return map;
		
	}
	//获取单一LOSA观察活动最新更新时间接口
		public List<Object> queryActivityUpdateTime(String id) throws ParseException{
			
			String sql="select t.activityUpdateTime from ObserveActivityDO t where t.deleted=false and t.id='"+id+"'";
			@SuppressWarnings("unchecked")
			List<Object> list=this.getHibernateTemplate().find(sql);
			return list;
			
			
		}
		//批量获取LOSA观察活动最新更新时间接口
		public List<Object[]> queryActsUpdateTime(String userId) throws ParseException{
			String sql="select t.id, t.ACTIVITY_UPDATE_DATE from L_OBSERVE_ACTIVITY t  "
					+ " left join l_plan lp on t.plan_id=lp.id  "
					+ " where t.deleted=0  and (lp.plan_status='distributed' or lp.plan_status='done') and lp.deleted=0 and lp.OBSERVER_ID='"+userId+"'";
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query= session.createSQLQuery(sql.toString());
			@SuppressWarnings("unchecked")
			List<Object[]> list=query.list();
			return list;
		}
		
		public int submitLosa(String id) throws Exception{
			//先修改Pland的状态
			int result=0;
			boolean resultBoolean=false;
			ObserveActivityDO observe=this.internalGetById(Integer.valueOf(id));
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
		public void creatObserveActivity(Integer planId,String observerUserId) throws Exception{
			//根据观察员的用户ID生成观察员的身份证明
			try{
				ObserveActivityDO observe=new ObserveActivityDO();
				String observerNumber = observerInfoDao.queryObserverNumberById(observerUserId);
				observe.setIdentifyNumber(observerNumber);
				observe.setCreator(UserContext.getUserId());
				observe.setLastModifier(UserContext.getUserId());
				observe.setPlanId(planId);
				Date date=new Date();
				observe.setActivityUpdateTime(date);
				observe = setPilotInfo(planId, observe);
				Integer observeId = (Integer)this.internalSave(observe);
				ObserveApproachDO observeApproach = new ObserveApproachDO();
				observeApproach.setCreator(UserContext.getUserId());
				observeApproach.setLastModifier(UserContext.getUserId());
				observeApproach.setDeleted(false);
				observeApproach.setApproachTime(1);
				observeApproach.setObserveId(observeId);
				observeApproachDao.internalSave(observeApproach);
			}catch(Exception e){
				e.printStackTrace();
				
			}
		}
		
	public  Map<String,Object> updateObserveActivity(Map<String,Object> map,Integer planId)throws Exception{
		Map<String,Object>result=new HashMap<String,Object>();
		try{
			Date date = new Date();
			 String observe=(String) map.get("observeActivity");
			 String activityId=(String)map.get("activityId");
			 if(StringUtils.isNotBlank(observe)){
				 ObserveActivityDO observeDO =gson.fromJson(observe,new TypeToken<ObserveActivityDO>() {}.getType());
				 observeDO.setActivityUpdateTime(date);
				 observeDO.setLastModifier(UserContext.getUserId());
				 if(observeDO.getId()==null){
					 observeDO.setCreator(UserContext.getUserId());
					 observeDO.setPlanId(planId);
					Integer id=(Integer) this.internalSave(observeDO);
					 result.put("activityId",id );
					 
				 }else{
					 this.internalUpdate(observeDO); 
					 result.put("activityId",observeDO.getId() );
				 }
				 result.put("date", date);
			 }else{
				 if(StringUtils.isNotBlank(activityId)){
					 Map<String,Object>param=new HashMap<String,Object>();
					 param.put("activityUpdateTime", date);
					 param.put("lastModifier", UserContext.getUserId());
					 Integer id=new BigDecimal(activityId).intValue();
					 this.update(id , param);
					 result.put("date", date);
					 result.put("activityId",id );
				 }
			 }
			
			 
			 
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	public void modifyUpdateTimeByPlanId(Integer planId) throws Exception{
		try{
			String sql="from ObserveActivityDO t where t.planId=?";
			@SuppressWarnings("unchecked")
			List<ObserveActivityDO>list=this.getHibernateTemplate().find(sql,planId);
			if(list.size()>0){
				ObserveActivityDO ob=list.get(0);
				ob.setActivityUpdateTime(new Date());
				ob.setLastModifier(UserContext.getUserId());
				this.internalUpdate(ob);
			}
			
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	/**
	 * 根据ID更新观察活动的活动时间
	 * @param id
	 * @throws Exception
	 */
	public void modifyUpdateTimeById(Integer id) throws Exception{
		try{
			Map<String,Object>param=new HashMap<String,Object>();
			Date date=new Date();
			param.put("activityUpdateTime", date);
			this.update(id, param);
			
		}catch(Exception  e){
			e.printStackTrace();
		}
	}
	/**
	 * 根据planId,observeActivityDO 查询航班上飞行员的基本信息，将这些信息保存在观察表中
	 * @param planId,observeActivity
	 * @throws Exception
	 */
	public ObserveActivityDO setPilotInfo(int planId,ObserveActivityDO observeActivity){
		try{
			int activityPlanId = observeActivity.getPlanId().intValue();
			if(activityPlanId != planId){
				return observeActivity;
			}else{
				Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
				String sql = "select c.post, to_char(tt.id), lv.totalflighthours,lv.commandflighthours"
						+ " ,lv.actypeflighthours,lv.telexflighthours "
						+ " from l_plan a,fxw_crs_flight_plan  b,"
						+ " fxw_crs_crew_assign  c,losa_pilot_info_view lv,t_organization tt"
						+ " where a.id = "+planId
						+ " and a.flight_id = b.flight_plan_id and b.flight_plan_id = c.flight_plan_id"
						+ " and c.assign_Type = 'FLIGHT' and c.post in "
						+ " ('A_PILOT_IN_COMMAND', 'C_FIRST_OFFICER', 'D_SECOND_OFFICER')"
						+ " and lv.pilotid = c.crew_id and lv.actypecode = b.ac_type_code "
						+ " and b.org_code = tt.deptcode and tt.deleted = 0";
				SQLQuery query0 = session0.createSQLQuery(sql);
				List<?> list= new ArrayList<Object[]>();
				list= query0.list();
				observeActivity.setCompanyCaptain1(null);
				observeActivity.setFullTimeCaptain1(null);
				observeActivity.setCaptainFlyTime1(null);
				observeActivity.setThisAircraftTimeCaptain1(null);
				observeActivity.setTelexAircraftTimeCaptain1(null);
				observeActivity.setCompanyCaptain2(null);
				observeActivity.setFullTimeCaptain2(null);
				observeActivity.setCaptainFlyTime2(null);
				observeActivity.setThisAircraftTimeCaptain2(null);
				observeActivity.setTelexAircraftTimeCaptain2(null);
				observeActivity.setCompanyCopilot1(null);
				observeActivity.setFullTimeCopilot1(null);
				observeActivity.setThisAircraftTimeCopilot1(null);
				observeActivity.setTelexAircraftTimeCopilot1(null);
				observeActivity.setCompanyCopilot2(null);
				observeActivity.setFullTimeCopilot2(null);
				observeActivity.setThisAircraftTimeCopilot2(null);
				observeActivity.setTelexAircraftTimeCopilot2(null);
				Boolean commandFlag = true;
				if(list.size()>0){
		        	for(int i=0;i<list.size();i++){
		        		 Object[] obj = (Object[])list.get(i);
		        		 String post = (String) obj[0];
		        		 if(post.equals("A_PILOT_IN_COMMAND") && commandFlag){
		        			 observeActivity.setCompanyCaptain1((String) obj[1]);
		        			 if(obj[2]!=null){
		        				 observeActivity.setFullTimeCaptain1(Long.valueOf(obj[2].toString()));
		        			 }
		        			 if(obj[3]!=null){
		        				 observeActivity.setCaptainFlyTime1(Long.valueOf(obj[3].toString()));
		        			 }
		        			 if(obj[4]!=null){
		        				 observeActivity.setThisAircraftTimeCaptain1(Long.valueOf(obj[4].toString()));
		        			 }
		        			 if(obj[5]!=null){
		        				 observeActivity.setTelexAircraftTimeCaptain1(Long.valueOf(obj[5].toString()));
		        			 }
		        			 commandFlag = false;
		        		 }else if(post.equals("A_PILOT_IN_COMMAND") && !commandFlag){
		        			 observeActivity.setCompanyCaptain2((String) obj[1]);
		        			 if(obj[2]!=null){
		        				 observeActivity.setFullTimeCaptain2(Long.valueOf(obj[2].toString()));
		        			 }
		        			 if(obj[3]!=null){
		        				 observeActivity.setCaptainFlyTime2(Long.valueOf(obj[3].toString()));
		        			 }
		        			 if(obj[4]!=null){
		        				 observeActivity.setThisAircraftTimeCaptain2(Long.valueOf(obj[4].toString()));
		        			 }
		        			 if(obj[5]!=null){
		        				 observeActivity.setTelexAircraftTimeCaptain2(Long.valueOf(obj[5].toString()));
		        			 }
		        		 }else if(post.equals("C_FIRST_OFFICER")){
		        			 observeActivity.setCompanyCopilot1((String) obj[1]);
		        			 if(obj[2]!=null){
		        				 observeActivity.setFullTimeCopilot1(Long.valueOf(obj[2].toString()));
		        			 }
		        			 if(obj[4]!=null){
		        				 observeActivity.setThisAircraftTimeCopilot1(Long.valueOf(obj[4].toString()));
		        			 }
		        			 if(obj[5]!=null){
		        				 observeActivity.setTelexAircraftTimeCopilot1(Long.valueOf(obj[5].toString()));
		        			 }
		        		 }else if(post.equals("D_SECOND_OFFICER")){
		        			 observeActivity.setCompanyCopilot2((String) obj[1]);
		        			 if(obj[2]!=null){
		        				 observeActivity.setFullTimeCopilot2(Long.valueOf(obj[2].toString()));
		        			 }
		        			 if(obj[4]!=null){
		        				 observeActivity.setThisAircraftTimeCopilot2(Long.valueOf(obj[4].toString()));
		        			 }
		        			 if(obj[5]!=null){
		        				 observeActivity.setTelexAircraftTimeCopilot2(Long.valueOf(obj[5].toString()));
		        			 }
		        		 }
		        	}
		        }
			}
			
		}catch(Exception  e){
			e.printStackTrace();
		}
		return observeActivity;
	}
	//根据审计计划id，修改计划对应的观察表里飞行员的信息
	public void updateObservePilotInfo(String planId){
		try{
			String sql="from ObserveActivityDO t where t.planId=?";
			@SuppressWarnings("unchecked")
			List<ObserveActivityDO> list = this.getHibernateTemplate().find(sql,Integer.valueOf(planId));
			if(list.size()>0){
				ObserveActivityDO ob = list.get(0);
				ob = setPilotInfo(Integer.parseInt(planId),ob);
				ob.setActivityUpdateTime(new Date());
				ob.setLastModifier(UserContext.getUserId());
				this.internalUpdate(ob);
			}
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	public ScoreSelectContentDao getScoreSelectContentDao() {
		return scoreSelectContentDao;
	}
	public void setScoreSelectContentDao(ScoreSelectContentDao scoreSelectContentDao) {
		this.scoreSelectContentDao = scoreSelectContentDao;
	}
	public ScoreDao getScoreDao() {
		return scoreDao;
	}
	public void setScoreDao(ScoreDao scoreDao) {
		this.scoreDao = scoreDao;
	}
	
	public TaskPlanDao getTaskPlanDao() {
		return taskPlanDao;
	}
	public void setTaskPlanDao(TaskPlanDao taskPlanDao) {
		this.taskPlanDao = taskPlanDao;
	}
	public ScoreTempletDao getScoreTempletDao() {
		return scoreTempletDao;
	}
	public void setScoreTempletDao(ScoreTempletDao scoreTempletDao) {
		this.scoreTempletDao = scoreTempletDao;
	}
	public ObserverInfoDao getObserverInfoDao() {
		return observerInfoDao;
	}
	public void setObserverInfoDao(ObserverInfoDao observerInfoDao) {
		this.observerInfoDao = observerInfoDao;
	}
	public ObserveApproachDao getObserveApproachDao() {
		return observeApproachDao;
	}
	public void setObserveApproachDao(ObserveApproachDao observeApproachDao) {
		this.observeApproachDao = observeApproachDao;
	}
	

}
