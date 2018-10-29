package com.usky.sms.losa.plan;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.comm.JsonUtil;
import com.usky.sms.app.AppUtils;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.LosaLogOperateTypeEnum;
import com.usky.sms.losa.LosaLogTypeEnum;
import com.usky.sms.losa.LosaOperateLogDao;
import com.usky.sms.losa.ObserveDao;
import com.usky.sms.losa.activity.ObserveActivityDO;
import com.usky.sms.losa.activity.ObserveActivityDao;
import com.usky.sms.losa.scheme.SchemeDO;
import com.usky.sms.losa.scheme.SchemeDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

import net.sf.jasperreports.engine.util.ObjectUtils;

public class TaskPlanDao extends BaseDao<TaskPlanDO>{
	@Autowired
	private AuditorDao auditorDao;
	@Autowired
	private UserDao userDao;
	@Autowired
    private LosaOperateLogDao losaOperateLogDao;
	@Autowired
    private ObserveActivityDO observeActivityDO;
	@Autowired
	private ObserveActivityDao observeActivityDao;
	
	
	public TaskPlanDao(){
		super(TaskPlanDO.class);
	}

	private ObserveDao observeDao;
	private SchemeDao schemeDao;
	//查询审计计划
	public Map<String,Object> queryTaskPlans(Map<String,Object> paramMap) throws Exception{
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();	
		int count = 0;
		UserDO user = UserContext.getUser();
		Map<String,Object> resultmap = new HashMap<String,Object>();
		try{
			String planNo = (String)paramMap.get("planNo"); 
			String schemeName = (String)paramMap.get("schemeName"); 
			String flyNo = (String)paramMap.get("flyNo"); 
			String depAirportName = (String)paramMap.get("depAirportName"); 
			String arrAirportName = (String)paramMap.get("arrAirportName"); 
			String observerName = (String)paramMap.get("observerName"); 
			String observeDateFrom = (String)paramMap.get("observeDateFrom"); 
			String observeDateTo = (String)paramMap.get("observeDateTo"); 
			String planStatus = (String)paramMap.get("planStatus");
			String planId = (String)paramMap.get("planId");
			String observeId=(String)paramMap.get("observeId");
			String schemeId=(String)paramMap.get("schemeId");
			Integer start = (Integer)paramMap.get("start");
			Integer length = (Integer)paramMap.get("length");
			String sortby = (String) paramMap.get("sortby");
			String sortorders = (String) paramMap.get("sortorders");
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select lp.id,lp.scheme_id,ls.scheme_subject,to_char(lp.observe_date,'yyyy-MM-dd'),"
					+"case when fl.flight_no is null then lp.flight_no else fl.carrier || fl.flight_no end,nvl(to_char(dep.fullname),''),NVL(to_char(arr.fullname),'')"
					+",nvl(dep.icaocode,DEP_AIRPORT_NO) as depIcalCode,nvl(arr.icaocode,ARR_AIRPORT_NO) as arrIcaoCode,"
					+" lp.observer_id,tu.fullname,de.dict_name,lp.plan_status,lp.flight_id,lp.plan_no,"
					+" ls.scheme_type,de1.dict_name as schemeTypeName,lp.plan_description,ls.imple_unit_id,"
					+" sd.\"name\",tu.id as userId,NVL(fl.ac_type_code,AIRCRAFT_NO),lob.id as observieId, "
					+" fl.org_code,au.unit_name"
					+" from l_plan lp "
					+" left join l_scheme ls on lp.scheme_id = ls.id"
					+" left join fxw_crs_flight_plan fl on fl.flight_plan_id = lp.flight_id"
					+" left join yxw_tb_airport dep on fl.depart_port_code3 = dep.iatacode"
					+" left join yxw_tb_airport arr on fl.arrival_port_code3 = arr.iatacode"
					+" left join t_user tu on tu.id = lp.observer_id"
					+" left join l_dict_entry de on lp.plan_status = de.dict_code and de.dict_type = 'plan_status'"
					+" left join l_dict_entry de1 on ls.scheme_type = de1.dict_code and de1.dict_type = 'scheme_type'"
					+" left join t_organization sd on ls.imple_unit_id = sd.id "
					+" left join L_OBSERVE_ACTIVITY lob on lp.id=lob.plan_id"
					+" left join fxw_flight_bd_aero_unit au on fl.org_code = au.unit_code"
					+" where 1=1 and lp.deleted=0  ";
			String sqlparam = "";
			Map<String,String> map1 = new HashMap<String,String>();
			if(StringUtils.isNotBlank(planNo)){
				sqlparam+=" and lp.plan_no like :planNo";
				map1.put("planNo", planNo);
			}
			if(StringUtils.isNotBlank(schemeName)){
				sqlparam+=" and ls.scheme_subject like :schemeName";
				map1.put("schemeName", schemeName);
			}
			if(StringUtils.isNotBlank(flyNo)){
				sqlparam+=" and concat(fl.carrier,fl.flight_no) like :flyNo";
				map1.put("flyNo", flyNo);
			}
			if(StringUtils.isNotBlank(depAirportName)){
				sqlparam+=" and dep.fullname like :depAirportName";
				map1.put("depAirportName", depAirportName);
			}
			if(StringUtils.isNotBlank(arrAirportName)){
				sqlparam+=" and arr.fullname like :arrAirportName";
				map1.put("arrAirportName", arrAirportName);
			}
			if(StringUtils.isNotBlank(observerName)){
				sqlparam+=" and tu.fullname like :observerName";
				map1.put("observerName", observerName);
			}
			if(StringUtils.isNotBlank(observeDateFrom)){
				sqlparam+=" and lp.observe_date > to_date(:observeDateFrom,'yyyy-MM-dd')";
				map1.put("observeDateFrom", observeDateFrom);
			}
			if(StringUtils.isNotBlank(observeDateTo)){
				sqlparam+=" and lp.observe_date < to_date(:observeDateTo,'yyyy-MM-dd')";
				map1.put("observeDateTo", observeDateTo);
			}
			if(StringUtils.isNotBlank(planStatus)){
				sqlparam+=" and lp.plan_status = :planStatus";
				map1.put("planStatus", planStatus);
			}
			if(StringUtils.isNotBlank(schemeId)){
				sqlparam+=" and lp.scheme_id = "+schemeId;
			}
			if(StringUtils.isNotBlank(planId)&& !"null".equals(planId)){
				sqlparam+=" and lp.id = '"+planId+"'";
			}else{
				//查询用户职责
				String auth = schemeDao.getUserAuth(user.getId());
				if(auth.equals("系统管理员")){
					sql+=" and 1=1";
				}else if(auth.equals("子公司管理员+观察员")){
					sql+=" and ((exists (select tuo.observer_org from l_observer_info tuo, l_observer_info tuo1"
							+"	where tuo.userid = lp.observer_id"
							+"  and (lp.creator = lp.observer_id or lp.plan_status != 'draft')"
							+"	and tuo1.userid = "+user.getId()
							+"	and tuo.observer_org = tuo1.observer_org))"
							+ " or (lp.observer_id ="+user.getId()+" and (lp.creator = lp.observer_id or lp.plan_status != 'draft')))";
				}else if(auth.equals("子公司管理员")){
					sql+=" and exists (select tuo.observer_org from l_observer_info tuo, l_observer_info tuo1"
						+"	where tuo.userid = lp.observer_id"
						+"  and (lp.creator = lp.observer_id or lp.plan_status != 'draft')"
						+"	and tuo1.userid = "+user.getId()
						+"	and tuo.observer_org = tuo1.observer_org)";
				}else if(auth.equals("观察员")){
					sql+=" and lp.observer_id ="+user.getId() + " and (lp.creator = lp.observer_id or lp.plan_status != 'draft')";
				}else{
					sql+=" and 1=2";
				}
			}
			if(StringUtils.isNotBlank(observeId)){
				sqlparam+=" and lob.id= '"+observeId+"'";
			}
			if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
				sqlparam+=" order by "+sortby+" "+sortorders+",lp.id ";
            }else{
			    sqlparam+=" order by lp.id desc ";
            }
			SQLQuery query0 = session0.createSQLQuery((sql+sqlparam).toString());
			Iterator<Map.Entry<String, String>> entries = map1.entrySet().iterator();  
			while (entries.hasNext()) {  
			    Map.Entry<String, String> entry = entries.next();  
			    if(entry.getKey().equals("planNo")||entry.getKey().equals("schemeName")||entry.getKey().equals("flyNo")
			    		||entry.getKey().equals("depAirportName")||entry.getKey().equals("arrAirportName")||entry.getKey().equals("observerName")){
			    	query0.setParameter(entry.getKey(), "%"+entry.getValue()+"%");
			    }else{
			    	query0.setParameter(entry.getKey(), entry.getValue());
			    }
			    
			} 
			List<?> list= new ArrayList<Object[]>();
			if(start!=null&&length!=null){
		        count = query0.list().size();
		        query0.setFirstResult(start);
			    query0.setMaxResults(length);
		    } 
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("id", obj[0]);
	        		 map.put("schemeId", obj[1]);
	        		 map.put("schemeSubject", obj[2]);
	        		 map.put("observeDate", obj[3]);
	        		 map.put("flyNo", obj[4]);
	        		 map.put("deptAirport", obj[5]);
	        		 map.put("arrAirport", obj[6]);	 
	        		 map.put("depAirportNo",obj[7]);
	        		 map.put("arrAirportNo",obj[8]);
	        		 map.put("observerId", obj[9]);
	        		 map.put("observer", obj[10]);
	        		 map.put("planStatusName", obj[11]);
	        		 map.put("planStatus", obj[12]);
	        		 map.put("flightId", obj[13]);
	        		 map.put("planNo", obj[14]);
	        		 map.put("schemeType", obj[15]);
	        		 map.put("schemeTypeName", obj[16]);
	        		 map.put("planDesc", obj[17]);
	        		 map.put("impleUnitId",obj[18]);
	        		 map.put("impleUnitName",obj[19]);
	        		 map.put("observerUserId",obj[20]);
	        		 map.put("aircraftNo",obj[21]);
	        		 map.put("observiewId",obj[22]);
	        		 map.put("orgCode",obj[23]);
	        		 map.put("orgName",obj[24]);
	        		 map.put("checked",false);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		resultmap.put("all", count);
	    resultmap.put("result", result);
	    return resultmap;
	}
	public Map<String,Object> newPlanJson() throws Exception{
		 Map<String,Object> map = new HashMap<String,Object>();
		 map.put("id", null);
		 map.put("schemeId", null);
		 map.put("schemeSubject", null);
		 map.put("observeDate", null);
		 map.put("flyNo", null);
		 map.put("deptAirport", null);
		 map.put("arrAirport", null);	 
		 map.put("depAirportNo",null);
		 map.put("arrAirportNo",null);
		 map.put("observerId", null);
		 map.put("observer", null);
		 map.put("planStatusName", null);
		 map.put("planStatus", null);
		 map.put("flightId", null);
		 map.put("planNo", null);
		 map.put("schemeType", null);
		 map.put("schemeTypeName", null);
		 map.put("planDesc", null);
		 map.put("impleUnitId",null);
		 map.put("impleUnitName",null);
		 map.put("observerUserId",null);
		 map.put("aircraftNo",null);
		 map.put("observiewId",null);
		 map.put("orgCode",null);
		 map.put("orgName",null);
		 return map;
	}
	//删除任务计划
	public void deleteTaskPlan(Integer planId) throws Exception {
		TaskPlanDO taskPlanDO = getTaskPlanDO(planId);
		this.delPlanLog(taskPlanDO);
		this.internalMarkAsDeleted(taskPlanDO);
	}
	//删除计划log信息
	public void delPlanLog(TaskPlanDO taskPlanDO) throws Exception{
		  List<String>details=new ArrayList<String>();
		  List<String>schemeDetails=new ArrayList<String>();
	      details.add("【"+PlanFieldEnum.DELETEPLAN.getValue()+"】:("+taskPlanDO.getPlanNo());
	      schemeDetails.add("【"+taskPlanDO.getPlanNo()+"】:"+PlanFieldEnum.DELETEPLAN.getValue()+":("+taskPlanDO.getPlanNo());
		  losaOperateLogDao.addLog(taskPlanDO.getId(), LosaLogTypeEnum.PLAN.getKey(),LosaLogOperateTypeEnum.PLAN.getKey(), JsonUtil.toJson(details));
		  if(taskPlanDO.getSchemeId()!=null&&taskPlanDO.getSchemeId().toString()!=""){
			  losaOperateLogDao.addLog(taskPlanDO.getSchemeId(), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(schemeDetails));
		  }
	  }
	//发布计划log信息
	public void disPlanLog(TaskPlanDO taskPlanDO) throws Exception{
		  List<String>details=new ArrayList<String>();
		  List<String>schemeDetails=new ArrayList<String>();
	      details.add("【"+PlanFieldEnum.RELEASEPLAN.getValue()+"】:("+taskPlanDO.getPlanNo());
		  schemeDetails.add("【"+taskPlanDO.getPlanNo()+"】:"+PlanFieldEnum.RELEASEPLAN.getValue()+":("+taskPlanDO.getPlanNo());
		  losaOperateLogDao.addLog(taskPlanDO.getId(), LosaLogTypeEnum.PLAN.getKey(),LosaLogOperateTypeEnum.PLAN.getKey(), JsonUtil.toJson(details));
		  if(taskPlanDO.getSchemeId()!=null&&taskPlanDO.getSchemeId().toString()!=""){
		  losaOperateLogDao.addLog(taskPlanDO.getSchemeId(), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(schemeDetails));
		  }
	  }
	//修改任务计划信息
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void modifyTaskPlan(Map<String,Object> paramMap) throws Exception{
		String schemeId = (String)paramMap.get("schemeId"); 
		String observeDate = (String)paramMap.get("observeDate"); 
		String flightId = (String)paramMap.get("flightId"); 
		String observerId = (String)paramMap.get("observerId");
		String planId = (String)paramMap.get("planId");
		String modifyFlag = (String)paramMap.get("modifyFlag");
		String planDescription = (String)paramMap.get("planDesc");
		String planStatus = (String)paramMap.get("planStatus");
		try{
			TaskPlanDO taskPlanDO = getTaskPlanDO(Integer.parseInt(planId));
			UserDO user = UserContext.getUser();
			taskPlanDO.setLastModifier(user.getId());
			String originFlightId = taskPlanDO.getFlightId() == null ? null : taskPlanDO.getFlightId().toString();
			if(modifyFlag.equals("modifyInfo")){
				Map<String,Object>map=new HashMap<String,Object>();						
				map.put("schemeId", schemeId);
				map.put("observeDate",observeDate);
				map.put("flightId", flightId);
				map.put("observerId",observerId);
				map.put("planDescription", planDescription);
				this.update(Integer.valueOf(planId), map);
				//判断如果航班id改变，同时需要修改观察表里对应的飞行员的信息
				if((StringUtils.isNotEmpty(originFlightId) && StringUtils.isNotEmpty(flightId) && originFlightId != flightId)
						|| (StringUtils.isEmpty(originFlightId) && StringUtils.isNotEmpty(flightId))){
					observeActivityDao.updateObservePilotInfo(planId);
				}
				updatePlanNoById(Integer.valueOf(planId));
				//同时修改观察活动时间
				observeActivityDao.modifyUpdateTimeByPlanId(Integer.valueOf(planId));
			}else if(modifyFlag.equals("modifyStatus")){
				taskPlanDO.setPlanStatus(planStatus);
				//如果观察员点击发布，保存发布日期
				if(planStatus.equals("distributed")){
					taskPlanDO.setPlanPulishTime(new Date());
				}
				this.disPlanLog(taskPlanDO);
				this.internalUpdate(taskPlanDO);
			}
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//查询观察员名称
	@SuppressWarnings("unchecked")
	public UserDO getUserName(String id) {
		String sql=" from UserDO t where t.id = ?";
		List<UserDO> docList = this.getHibernateTemplate().find(sql, Integer.valueOf(id));
		UserDO userDO = null;
		if (CollectionUtils.isNotEmpty(docList)) userDO = docList.get(0);
		return userDO;
	}
	//查询方案名称
	@SuppressWarnings("unchecked")
	public SchemeDO getSchemeName(String id) {
		String sql=" from SchemeDO t where t.id = ?";
		List<SchemeDO> docList = this.getHibernateTemplate().find(sql, Integer.valueOf(id));
		SchemeDO schemeDO = null;
		if (CollectionUtils.isNotEmpty(docList)) schemeDO = docList.get(0);
		return schemeDO;
	}
	@SuppressWarnings("unchecked")
	public TaskPlanDO getId(Integer id) {
		String sql=" from TaskPlanDO t where t.deleted=false and t.id= ?";
		List<TaskPlanDO> docList = this.getHibernateTemplate().find(sql, id);
		TaskPlanDO taskPlanDO = null;
		if (CollectionUtils.isNotEmpty(docList)) taskPlanDO = docList.get(0);
		return taskPlanDO;
	}
	//添加方案log信息
	public void addPlanLog(TaskPlanDO taskPlan) throws Exception{
		List<String>details=new ArrayList<String>();
		TaskPlanDO planBaseInfo=getId(taskPlan.getId());
		List<String>schemeDetails=new ArrayList<String>();
		details.add("【"+PlanFieldEnum.UPDATEPLAN.getValue()+"】:("+planBaseInfo.getPlanNo()); 
		schemeDetails.add("【"+PlanFieldEnum.UPDATEPLAN.getValue()+"】:("+planBaseInfo.getPlanNo());   
	    losaOperateLogDao.addLog(taskPlan.getId(), LosaLogTypeEnum.PLAN.getKey(),LosaLogOperateTypeEnum.PLAN.getKey(), JsonUtil.toJson(details));
	    if(taskPlan.getSchemeId()!=null&&taskPlan.getSchemeId().toString()!=""){
		losaOperateLogDao.addLog(taskPlan.getSchemeId(), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(schemeDetails));
	    }
		  }
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {	    
		try {
			savePlanLog(id, map);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	//修改计划log信息
	private void savePlanLog(int id,Map<String,Object> map) throws Exception{
		TaskPlanDO taskPlan=this.internalGetById(id);
		List<String>details=new ArrayList<String>();
		List<String>schemeDetails=new ArrayList<String>();
		SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd");
		String key;
    	key=PlanFieldEnum.UPDATEPLANSCHEME.getKey();
        if(map.containsKey(key)){   
        	String value=String.valueOf(map.get(key));
    		String dbvalue=String.valueOf(taskPlan.getSchemeId());
    		if(StringUtils.isNotBlank(dbvalue)&&dbvalue!="null"){
    			if(StringUtils.isNotBlank(value)&&value!="null"){
    				 SchemeDO schemeDO=getSchemeName(value);
    				 SchemeDO schemeBaseInfo=getSchemeName(dbvalue);
    				 if(!ObjectUtils.equals(value, dbvalue)){
    					   details.add("【"+PlanFieldEnum.UPDATEPLANSCHEME.getValue()+"】:由【"+schemeBaseInfo.getSchemeSubject()+"】修改为：【"+schemeDO.getSchemeSubject()+"】");
    				 	   schemeDetails.add("【"+taskPlan.getPlanNo()+"】:"+PlanFieldEnum.UPDATEPLANSCHEME.getValue()+":由【"+schemeBaseInfo.getSchemeSubject()+"】修改为：【"+schemeDO.getSchemeSubject()+"】");
    				    }
    			}else{
   				 SchemeDO schemeBaseInfo=getSchemeName(dbvalue);
   				 if(!ObjectUtils.equals(value, dbvalue)){
   					details.add("删除【"+PlanFieldEnum.UPDATEPLANSCHEME.getValue()+"】:【"+schemeBaseInfo.getSchemeSubject()+"】");
   	 		 	    schemeDetails.add("【"+taskPlan.getPlanNo()+"】:删除"+PlanFieldEnum.UPDATEPLANSCHEME.getValue()+"：【"+schemeBaseInfo.getSchemeSubject()+"】");		    
   	    			}}    			
    		   }else{ 
					if(dbvalue=="null"){
						dbvalue="";
					}
					if(!ObjectUtils.equals(dbvalue, value)){
					SchemeDO schemeDO=getSchemeName(value);
					details.add("【"+PlanFieldEnum.UPDATEPLANSCHEME.getValue()+"】:新增为：【"+schemeDO.getSchemeSubject()+"】");
			 	    schemeDetails.add("【"+taskPlan.getPlanNo()+"】:"+PlanFieldEnum.UPDATEPLANSCHEME.getValue()+"新增为：【"+schemeDO.getSchemeSubject()+"】");		    
					}
				}		   
	    }
        key=PlanFieldEnum.UPDATEOBSERVERID.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
    		String dbvalue=String.valueOf(taskPlan.getObserverId());
    		if(StringUtils.isNotBlank(dbvalue)&&dbvalue!="null"){
    			UserDO user=getUserName(value);
    		    UserDO userBaseInfo=getUserName(dbvalue);
            	if(!ObjectUtils.equals(dbvalue, value)){
    				   details.add("【"+PlanFieldEnum.UPDATEOBSERVERID.getValue()+"】:由【"+userBaseInfo.getFullname()+"】修改为：【"+user.getFullname()+"】");
    				   schemeDetails.add("【"+taskPlan.getPlanNo()+"】"+PlanFieldEnum.UPDATEOBSERVERID.getValue()+":由【"+userBaseInfo.getFullname()+"】修改为：【"+user.getFullname()+"】");
    			   }
    		}else {
    			if(dbvalue=="null"){
    				dbvalue="";
    			}
    			if(!ObjectUtils.equals(dbvalue, value)){
    				UserDO user=getUserName(value);
    				if(!ObjectUtils.equals(dbvalue, value)){
     				   details.add("【"+PlanFieldEnum.UPDATEOBSERVERID.getValue()+"】:新增为：【"+user.getFullname()+"】");
     				   schemeDetails.add("【"+taskPlan.getPlanNo()+"】"+PlanFieldEnum.UPDATEOBSERVERID.getValue()+":新增为：【"+user.getFullname()+"】");
     			   }
    			}
    		}		            	
        }
        key=PlanFieldEnum.UPDATEFLIGHT.getKey();
        if(map.containsKey(key)){
        	String dbvalue=String.valueOf(taskPlan.getFlightId());
        	String value=String.valueOf(map.get(key));
        	if(StringUtils.isNotBlank(dbvalue)&&dbvalue!="null"){
        		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
        		String dbvalues="";
        		String dbvaNo="";
        		String values ="";
        		String vaNo ="";
    			String flight_nodb="select flight_no，carrier from fxw_crs_flight_plan  where flight_plan_id='"+dbvalue+"'"; 
    			String flight_no="select flight_no，carrier from fxw_crs_flight_plan  where flight_plan_id='"+value+"'";
    			SQLQuery querydb=session.createSQLQuery((flight_nodb).toString());
    			SQLQuery query=session.createSQLQuery((flight_no).toString());
    			List<?> list=querydb.list();
    			for(int i=0;i<list.size();i++){
    				Object[] obj = (Object[])list.get(i);
    				 dbvalues=(String) obj[0];
    				 dbvaNo=(String) obj[1];
    			}
    			List<?> list1=query.list();
    			for(int i=0;i<list1.size();i++){
    				Object[] obj = (Object[])list1.get(i);
    				values=(String) obj[0];
    				vaNo=(String) obj[1];
    			}
            	if(!ObjectUtils.equals(dbvalue, value)){
            		  details.add("【"+PlanFieldEnum.UPDATEFLIGHT.getValue()+"】:由【"+dbvaNo+dbvalues+"】修改为：【"+vaNo+values+"】");
    				   schemeDetails.add("【"+taskPlan.getPlanNo()+"】"+PlanFieldEnum.UPDATEFLIGHT.getValue()+":由【"+dbvaNo+dbvalues+"】修改为：【"+vaNo+values+"】");
    			   }
        	}else{
        			if(dbvalue=="null"){
        				dbvalue="";
        			}
        			if(!ObjectUtils.equals(dbvalue, value)){
        				Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
        				String values ="";
                		String vaNo ="";
            			String flight_no="select flight_no，carrier from fxw_crs_flight_plan  where flight_plan_id='"+value+"'";
            			SQLQuery query=session.createSQLQuery((flight_no).toString());
            			List<?> list=query.list();
            			for(int i=0;i<list.size();i++){
            				Object[] obj = (Object[])list.get(i);
            				values=(String) obj[0];
            				vaNo=(String) obj[1];
            			}
            			 details.add("【"+PlanFieldEnum.UPDATEFLIGHT.getValue()+"】:新增为：【"+vaNo+values+"】");
        				   schemeDetails.add("【"+taskPlan.getPlanNo()+"】"+PlanFieldEnum.UPDATEFLIGHT.getValue()+":新增为：【"+vaNo+values+"】");
        			   }     
        	}
        }        
        key=PlanFieldEnum.UPDATEOBSERVEDATE.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
    		String dbvalue=taskPlan.getObserveDate()==null?"":dateformat.format(taskPlan.getObserveDate());
        	if(!ObjectUtils.equals(dbvalue, value)){
        		 details.add("【"+PlanFieldEnum.UPDATEOBSERVEDATE.getValue()+"】:由【"+dbvalue+"】修改为：【"+value+"】");
				   schemeDetails.add("【"+taskPlan.getPlanNo()+"】"+PlanFieldEnum.UPDATEOBSERVEDATE.getValue()+":由【"+dbvalue+"】修改为：【"+value+"】");
			   }
        }
        
        key=PlanFieldEnum.UPDATEDESCRIPTION.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
    		String dbvalue=taskPlan.getPlanDescription();
    		if(dbvalue==null){
    			dbvalue="";
    		}
        	if(!ObjectUtils.equals(dbvalue, value)){
        		 details.add("【"+PlanFieldEnum.UPDATEDESCRIPTION.getValue()+"】:由【"+dbvalue+"】修改为：【"+value+"】");
				   schemeDetails.add("【"+taskPlan.getPlanNo()+"】"+PlanFieldEnum.UPDATEDESCRIPTION.getValue()+":由【"+dbvalue+"】修改为：【"+value+"】");
			   }
        }
	        if(details.size()>0){
	        	key=PlanFieldEnum.UPDATEPLANSCHEME.getKey();
	        	String value=String.valueOf(map.get(key));
			    losaOperateLogDao.addLog(taskPlan.getId(), LosaLogTypeEnum.PLAN.getKey(),LosaLogOperateTypeEnum.PLAN.getKey(), JsonUtil.toJson(details));
			    if((taskPlan.getSchemeId()!=null&&taskPlan.getSchemeId().toString()!="")||(value!=null&&value!="")){
				    losaOperateLogDao.addLog(taskPlan.getSchemeId(), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(schemeDetails));       
			    }			   
			  }
		  }
	//根据机场名称和三字码查询机场信息
	public List<Map<String,Object>> getAirportByNameAndIATACode(String name) {
		name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		name = "%" + name + "%";
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find(
				"select t.iCaoCode,t.iATACode,nvl(t.shortName,' '),nvl(t.fullName,' '),t.shortEnName,t.fullEnName from AirportDO t where concat(t.fullName,t.iATACode) like ? escape '/'", name);
		List<Map<String,Object>> airlist = new ArrayList<Map<String,Object>>();
		for(Object[] o : list){
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("ICAOCode", o[0]);
			map.put("IATACode", o[1]);
			map.put("shortName", o[2]);
			map.put("fullName", o[3]);
			map.put("shortEnName", o[4]);
			map.put("fullEnName", o[5]);
			airlist.add(map);
		}
		return airlist;
	}
	
	//根据主键获取计划信息
	public TaskPlanDO getTaskPlanDO(Integer planId){
		return this.getHibernateTemplate().get(TaskPlanDO.class, planId);
	}
		
	//查询连续航班信息
	public List<Map<String,Object>> queryMulFly(Map<String,Object> paramMap){
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();		
		try{
			String flyDate = (String)paramMap.get("flyDate"); 
			String flyTeam = (String)paramMap.get("flyTeam"); 
			String deptAirport = (String)paramMap.get("deptAirport"); 
			String arrAirport = (String)paramMap.get("arrAirport");
			String flightTaskId = (String)paramMap.get("flightTaskId");
			String schemeId = (String)paramMap.get("schemeId");
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select ft.flight_task_id,to_char(ft.task_date, 'yyyy-MM-dd'),ft.apply_flight_no,"
	          +" ft.route,ft.ac_type,ft.flight_unit_code,au.unit_name,aa.PILOT_IN_COMMAND,aa.C_FIRST_OFFICER,"
	          +" nvl(keyi_plan,1),NVL(keyi_XIUGAI1,1),to_char(ob_name),to_char(ft.depart_time,'hh24:mi')"
	          + ",to_char(ft.arrive_time,'hh24:mi')"
	          + " from fxw_crs_flight_task ft left join fxw_flight_bd_aero_unit au"
	          +" on au.unit_code = ft.flight_unit_code left join (select ca.flight_task_id,to_char(wm_concat(distinct case when "
	          +" ca.post ='A_PILOT_IN_COMMAND' then bi.pilot_name else null end)) as PILOT_IN_COMMAND,to_char(wm_concat(distinct case "
	          +" when ca.post ='C_FIRST_OFFICER' then bi.pilot_name else null end) )as C_FIRST_OFFICER from fxw_crs_crew_assign ca,"
	          +" fxw_flight_pilot_basic_info bi where  ca.post in ('A_PILOT_IN_COMMAND','C_FIRST_OFFICER') and ca.assign_type = 'FLIGHT'"
	          +" and ca.crew_id = bi.basic_info_id group by ca.flight_task_id) aa on ft.flight_task_id = aa.flight_task_id left join" 
	          +" (select flight_task_id,wm_concat(distinct tt.fullname) as ob_name,case when count(fp.flight_plan_id)>count(lp.flight_id) "
	          +" then 1 else 0 end as keyi_plan,case when sum(case when plan_status <> 'draft' then 1 else 0 end )=count(fp.flight_plan_id) "
	          +" then 0 else 1 end as keyi_XIUGAI1 from fxw_crs_flight_task_plan ftp left join fxw_crs_flight_plan fp on ftp.flight_plan_id = fp.flight_plan_id"
	          +" left join (select * from  l_plan where deleted = 0 ) lp on fp.flight_plan_id = lp.flight_id left join t_user tt on lp.observer_id = tt.id "
	          +" where ftp.task_type = 'FLIGHT' group by flight_task_id having count(distinct lp.flight_id)>0) bb on ft.flight_task_id = bb.flight_task_id"
	          +" where 1 = 1 and ft.task_type = 'FLIGHT' and exists (select * from fxw_crs_flight_task_plan f1, fxw_crs_flight_plan f2"
	          + " where f1.flight_task_id = ft.flight_task_id and f1.flight_plan_id = f2.flight_plan_id)";

			String sqlparam = "";
			if(StringUtils.isNotBlank(flyDate)){
				sqlparam+=" and ft.task_date = to_date('"+flyDate+"','yyyy-MM-dd')";
			}
			if(StringUtils.isNotBlank(flyTeam)){
				sqlparam+=" and ft.flight_unit_code like '"+flyTeam+"%'";
			}
			if(StringUtils.isNotBlank(deptAirport)){
				sqlparam+=" and ft.depart_port_code3 ='"+deptAirport+"'";
			}
			if(StringUtils.isNotBlank(arrAirport)){
				sqlparam+=" and exists (select * from fxw_crs_flight_task_plan ftp, fxw_crs_flight_plan fp"
						+ " where ftp.flight_task_id = ft.flight_task_id and ftp.flight_plan_id = fp.flight_plan_id "
						+ " and fp.arrival_port_code3 = '"+arrAirport+"')";
			}
			if(StringUtils.isNotBlank(flightTaskId)){
				sqlparam+=" and ft.flight_task_id ="+flightTaskId;
			}
			if(StringUtils.isNotBlank(schemeId)){
				String sql1 = "select  substr(c.unit_code,1,4) from l_scheme a ,l_scheme_unit b,"
						+ "fxw_flight_bd_aero_unit c where a.scheme_type = 'air_unit' and a.id = "+schemeId
						+ " and a.id = b.scheme_id and b.unit_id = c.unit_id and rownum = 1";
				SQLQuery query1 = session0.createSQLQuery(sql1);
				if(query1.list().size()>0){
					String unitCode = (String) query1.uniqueResult();
					sqlparam+=" and ft.org_code like '"+unitCode+"%'";
				}
			}
			SQLQuery query0 = session0.createSQLQuery((sql+sqlparam).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("flightTaskId", obj[0]);
	        		 map.put("taskDate", obj[1]);
	        		 map.put("applyFlightNo", obj[2]);
	        		 map.put("route", obj[3]);
	        		 map.put("acType", obj[4]);
	        		 map.put("unitCode", obj[5]);
	        		 map.put("unitName", obj[6]);
	        		 map.put("pilotIncommand", obj[7]);
	        		 map.put("cfirstOfficer", obj[8]);
	        		 map.put("joinPlan", obj[9]);
	        		 map.put("updatePlan", obj[10]);
	        		 map.put("rownum", i);
	        		 map.put("observerNames", obj[11]);
	        		 map.put("departTime", obj[12]);
	        		 map.put("arriveTime", obj[13]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	} 
	
	//查询连续航班分组下具体航班信息
	public List<Map<String,Object>> queryMulFlyDetails(String flightTaskId){
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();		
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select fp.flight_plan_id,to_char(fp.flight_date,'yyyy-MM-dd'),to_char(fp.est_dept_time,'HH24:mm'),to_char(fp.est_arr_time,'HH24:mm')"
					+ ",to_char(ta.fullname),to_char(ta1.fullname),fp.carrier||fp.flight_no,"
					+ "decode ((select count(1) from l_plan tp where tp.flight_id = fp.flight_plan_id"
					+ " and tp.deleted = 0),0, '0', '1') as isTempPlan,"
					+ "decode ((select count(1) from l_plan tp where tp.flight_id = fp.flight_plan_id"
					+ " and tp.deleted = 0 and tp.plan_status<>'draft'),0, '0','1') as isStatue,"
					+ " (select lt.observer_id from l_plan lt where lt.flight_id = fp.flight_plan_id"
					+ " and lt.deleted = 0 and rownum = 1) as observerId,"
					+ " (select tu.fullname from l_plan lt, t_user tu where lt.flight_id = fp.flight_plan_id"
					+ " and lt.observer_id = tu.id and lt.deleted = 0 and rownum = 1 ) as observerName,"
					+" ft.flight_task_id " 
			        +" from fxw_crs_flight_task ft,fxw_crs_flight_task_plan ftp,fxw_crs_flight_plan fp"
			        +",yxw_tb_airport ta ,yxw_tb_airport ta1"
			        +" where ft.flight_task_id = ftp.flight_task_id and ftp.flight_plan_id = fp.flight_plan_id"
			        +" and ftp.flight_task_id = "+flightTaskId+" and ta.iatacode = fp.depart_port_code3" 
			        +" and ta1.iatacode = fp.arrival_port_code3 order by fp.est_dept_time";
			SQLQuery query0 = session0.createSQLQuery((sql).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("flightPlanId", obj[0]);
	        		 map.put("flightDate", obj[1]);
	        		 map.put("edt", obj[2]);
	        		 map.put("eat", obj[3]);
	        		 map.put("deptAirport", obj[4]);
	        		 map.put("arrAirport", obj[5]);
	        		 map.put("flyNo", obj[6]);
	        		 map.put("isTempPlan", obj[7]);
	        		 map.put("isStatue", obj[8]);
	        		 map.put("observer", obj[9]);
	        		 map.put("observerName", obj[10]);
	        		 map.put("rownum", i);
	        		 map.put("flightTaskId", obj[11]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}  
	
	//查询飞行网的航班信息
	public List<Map<String,Object>> queryFlightInfo(Map<String,Object> paramMap){
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		try{
			String flightDate = (String)paramMap.get("flightDate");
			String flightNo = (String)paramMap.get("flightNo");
			String schemeId = (String)paramMap.get("schemeId");
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql = "select fp.flight_plan_id,to_char(fp.flight_date, 'yyyy-MM-dd'),NVL(to_char(dep.fullname),' '),"
					+ " NVL(to_char(arr.fullname),' '),fp.carrier,fp.flight_no,fp.org_code,au.unit_name, "
				    +" NVL(dep.icaocode ,'暂无数据')as depAirportNo, NVL(arr.icaocode ,'暂无数据')as arrAirportNo,to_char(fp.schedule_depart_time,'hh24:mi')"
				    + " ,to_char(fp.schedule_arrival_time,'hh24:mi') "
					+ " from fxw_crs_flight_plan fp"
					+ " left join yxw_tb_airport dep on fp.depart_port_code3 = dep.iatacode"
					+ " left join yxw_tb_airport arr on fp.arrival_port_code3 = arr.iatacode"
					+ " left join fxw_flight_bd_aero_unit au on fp.org_code = au.unit_code"
					+ " where 1=1";
			String paramSql = "";
			if(StringUtils.isNotBlank(flightDate)){
				paramSql+=" and fp.flight_date = to_date('"+flightDate+"','yyyy-MM-dd')";
			}
			if(StringUtils.isNotBlank(flightNo)){
				paramSql+=" and concat(fp.carrier,fp.flight_no) like '%"+flightNo+"%'";
			}
			if(StringUtils.isNotBlank(schemeId)&&!schemeId.equals("NaN")){
				String sql1 = "select  substr(c.unit_code,1,4) from l_scheme a ,l_scheme_unit b,"
						+ "fxw_flight_bd_aero_unit c where a.scheme_type = 'air_unit' and a.id = "+schemeId
						+ " and a.id = b.scheme_id and b.unit_id = c.unit_id and rownum = 1";
				SQLQuery query1 = session0.createSQLQuery(sql1);
				if(query1.list().size()>0){
					String unitCode = (String) query1.uniqueResult();
					paramSql+=" and fp.org_code like '"+unitCode+"%'";
				}
			}
			SQLQuery query0 = session0.createSQLQuery((sql+paramSql).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("flightPlanId", obj[0]);
	        		 map.put("flightDate", obj[1]);
	        		 map.put("deptAirport", obj[2]);
	        		 map.put("arrAirport", obj[3]);
	        		 map.put("carrier", obj[4]);
	        		 map.put("flightNo", obj[5]);
	        		 map.put("orgCode", obj[6]);
	        		 map.put("orgName", obj[7]);
	        		 map.put("depAirportNo", obj[8]);
	        		 map.put("arrAirportNo", obj[9]);
	        		 map.put("departTime", obj[10]);
	        		 map.put("arriveTime", obj[11]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	/**
	 * 提交，将状态改为已完成
	 * @param id
	 * @return
	 * @throws Exception
	 */
	public void modifyStatusToDone(Integer id) throws Exception{
		
		try{
			Map<String,Object>map=new HashMap<String,Object>();
			map.put("lastModifier", (long)UserContext.getUserId());
			map.put("planStatus", "done");
			this.update(id, map);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
     public Map<String,Object> taskPlanSave(String task) throws Exception{
    	 Map<String,Object>result=new HashMap<String,Object>();
    	 Integer taskId=null;
		try{
			Map<String,Object>map=gson.fromJson(task,new TypeToken<Map<String,Object>>() {}.getType());
			 String status=(String)map.get("planStatus");//任务状态
			
			 Object planId=map.get("id");//任务id
			 
			 if(planId!=null && planId!=""){//planId不为空时非新建，否则为新建
				 Integer id=new BigDecimal(String.valueOf(planId)).intValue();
				 taskId=id;
				 
					 TaskPlanDO taskDO=this.internalGetById(id);
					 Map<String,Object>param=new HashMap<String,Object>();
					 Object flightId=map.get("flightId");
					 if(flightId!=null){
						param.put("flightId",new BigDecimal(String.valueOf(flightId)).intValue());
					 }
					
					 if(status.equals("done")){
					     if(taskDO.getPlanStatus().equals("distributed")){
						      param.put("planStatus", "done");  
					     } 
				      } 
					 if(param.size()>0){
						 param.put("lastModifier", (long)UserContext.getUserId());
						 this.update(id, param);
					 }
				 result.put("mobileNew", false);
			 }else{//为空时，表示是新建任务
				 String aircraftNo=(String)map.get("aircraftNo");//航空器型号
				 String arrAirportNo=(String)map.get("arrAirportNo");//到达机场四字码
				 String depAirportNo=(String)map.get("depAirportNo");//降落机场四字码
				 //String planNo=(String)map.get("planNo");//任务编号
				 String observeDateStr=(String)map.get("observeDate");//观察日期
				 String flyNo=(String)map.get("flyNo");//航班号
				 Integer observerUserId=new BigDecimal(String.valueOf(map.get("observerUserId"))).intValue();
						// (String)map.get("observerUserId");//观察员用户ID
				// Integer observiewId=new BigDecimal(String.valueOf(map.get("observiewId"))).intValue();
				 String planStatus=(String)map.get("planStatus");
				 TaskPlanDO newPlan=new TaskPlanDO();
				 newPlan.setArrAirportNo(arrAirportNo);
				 newPlan.setAircraftNo(aircraftNo);
				 newPlan.setDepAirportNo(depAirportNo);
				 
				// newPlan.setPlanNo(planNo);
				
				 newPlan.setCreator(UserContext.getUserId());
				 newPlan.setLastModifier(UserContext.getUserId());
				 SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
			     Date observeDate = dateFormat.parse(observeDateStr);
				newPlan.setObserveDate(observeDate);
				 newPlan.setFlyNo(flyNo);
				 newPlan.setObserverId(observerUserId);
				 newPlan.setPlanStatus(planStatus);
				 taskId=(Integer)this.internalSave(newPlan);
				 //生成计划编号
				 this.updatePlanNoByIdMobile(taskId);
				 result.put("mobileNew", true);
				// result.put("observiewId", observiewId);
			 }
			
			
		}catch(Exception e){
			e.printStackTrace();
		}
		 result.put("planId", taskId);
		 return result;
	 }
	
	//根据计划id，修改计划编号
	public void updatePlanNoById(Integer planId){
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query0 = session0.createSQLQuery("{call LOSA_DEAL_SCHEME_PLAN_NO(?,?,?)}");
			query0.setInteger(0, planId);
			query0.setString(1,"plan");
			query0.setString(2,null);
			query0.executeUpdate();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
//根据计划id，修改计划编号 移动端 
  public void updatePlanNoByIdMobile(Integer planId){
    try{
      Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
      SQLQuery query0 = session0.createSQLQuery("{call LOSA_DEAL_SCHEME_PLAN_NO(?,?,?)}");
      query0.setInteger(0, planId);
      query0.setString(1,"plan");
      query0.setString(2, "M");
      query0.executeUpdate();
    }catch(Exception e){
      e.printStackTrace();
    }
  }
  
	//查询losa审计员
	public List<Map<String,Object>> queryLosaAuditors(String auditorName,String schemeId) throws Exception{
		List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			UserDO user = UserContext.getUser();
	        List<?> list= new ArrayList<Object[]>();
	        String sql=" select a.userid,a.observer_name from l_observer_info a where a.resp_name like '%observer%'"
	        		+ " and a.deleted = 0 ";
			if(StringUtils.isNotBlank(auditorName)){
				sql+=" and a.observer_name like '%"+auditorName+"%'";
			}	
			if(StringUtils.isNotBlank(schemeId)){
				sql+=" and exists (select * from l_scheme_auditor l where l.auditor_id = a.userid and l.scheme_id = "+schemeId+" )";
			}
			//查询用户职责
			String auth = schemeDao.getUserAuth(user.getId());
			if(auth.equals("系统管理员")){
				sql+=" and 1=1";
			}else if(auth.equals("子公司管理员+观察员")){
				sql+=" and (a.observer_org = (select loi.observer_org from l_observer_info loi"
						+"	and loi.userid = "+user.getId()+")"
						+ " or a.userid ="+user.getId()+")";
			}else if(auth.equals("子公司管理员")){
				sql+=" and a.observer_org = (select loi.observer_org from l_observer_info loi"
					+"	where loi.userid = "+user.getId()+")";
			}else if(auth.equals("观察员")){
				sql+=" and a.userid ="+user.getId();
			}else{
				sql+=" and 1=2";
			}
			 sql+=" order by a.observer_name";
			 SQLQuery query0 = session0.createSQLQuery((sql).toString());
			 list= query0.list();
			 if(list.size()>0){
		        	for(int i=0;i<list.size();i++){
		        		 Object[] obj = (Object[])list.get(i);
		        		 Map<String,Object>map=new HashMap<String,Object>();
		        		 map.put("id", obj[0]);
		        		 map.put("fullname", obj[1]);
		        		 map.put("username", obj[1]);
		        		 result.add(map);
		        	}
		     }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	/**
	 * 发送待办的信息
	 * @param id  planId
	 * @param userIds  观察员id
	 * 
	 */
	public void sendTodoMsg(Integer id, Collection<Integer> userIds) {
		TaskPlanDO taskPlan = this.internalGetById(id);
		String content = "您有一个新的LOSA工作单需要处理:名称[" + taskPlan.getPlanNo() + "],  请在移动LOSA中同步最新数据，并查看任务详情。";
		//Collection<String> cellTels = auditorDao.getCellTelByUserIds(userIds);
		Collection<String> usernames = userDao.getUsernamesByIds(userIds);
		AppUtils.pushMsgByUsernames(usernames, "LOSA任务待办提醒", content, true);
	}
	
    public TaskPlanDO queryObserverId(Integer id) throws Exception{
		
    	TaskPlanDO taskPlanDo = this.getHibernateTemplate().get(TaskPlanDO.class, id);
		
		return taskPlanDo;
	}
    /**
     * 根据观察活动编号获取计划的状态
     * @param id
     * @return
     * @throws Exception
     */
    public String getStatusByObserveId(Integer id) throws Exception{
    	String sql="select lp.plan_status from l_plan lp left join l_observe_activity lo on lp.id=lo.plan_id where lo.id="+id;
    	Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
   	    SQLQuery query = session.createSQLQuery((sql).toString());
    	List<Object>list=query.list();
    	String status=null;
    	if(list.size()>0){
    		status=list.get(0).toString();
    	}
    	return status;
    }
    //根据航班id和观察日期，查询计划里是否已经存在有效的记录
    public boolean isPlanExist(String planId,String flightId) throws Exception{
    	Boolean flag = true;
    	try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
	        List<?> list= new ArrayList<Object[]>();
	        String sql=" select * from l_plan a where a.flight_id = "+ flightId
	        		+ " and a.deleted = 0";
	        if(StringUtils.isNotBlank(planId)){
	        	sql+=" and a.id != "+planId;
	        }
			SQLQuery query0 = session0.createSQLQuery(sql);
			list= query0.list();
			if(list.size()>0){
				flag = false;
		    }
		}catch(Exception e){
			e.printStackTrace();
		}
    	return flag;
    }
    //根据航班段id，取消审计计划
  	public String delPlanByTask(Integer flightTaskId) throws Exception{
  		String flyNos="";
  		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select lp.id,lp.plan_status,fp.carrier||fp.flight_no from l_plan lp,fxw_crs_flight_task ft,"
					+ " fxw_crs_flight_task_plan ftp,fxw_crs_flight_plan fp"
					+ " where ft.flight_task_id = "+flightTaskId
					+" and ft.flight_task_id = ftp.flight_task_id and ftp.flight_plan_id = fp.flight_plan_id"
					+ " and lp.flight_id = fp.flight_plan_id and lp.deleted = 0 and ftp.task_type = 'FLIGHT'";
			SQLQuery query0 = session0.createSQLQuery(sql);
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Integer planId = ((BigDecimal) obj[0]).intValue();
	        		 String planStatus = (String) obj[1];
	        		 String flyNo = (String)obj[2];
	        		 if(planStatus.equals("draft")){
	        			 TaskPlanDO taskPlanDo = this.getHibernateTemplate().get(TaskPlanDO.class, planId);
	        			 this.internalMarkAsDeleted(taskPlanDo);
	        		 }else{
	        			 flyNos += flyNo+",";
	        		 }
	        	}
	        }
			if(flyNos.length()!=0){
				flyNos = flyNos.substring(0,flyNos.length()-1);
			}
		}catch(Exception e){
			e.printStackTrace();
		}
  		return flyNos;
  	}
    //根据flightId,在连续航班添加页面取消计划
  	public Boolean delPlanByFlightId(String flightId) throws Exception {
  		Boolean flag = true;
  		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select * from l_plan a where a.deleted = 0 and a.plan_status != 'draft' "
					+ " and a.flight_id = "+flightId;
			SQLQuery query0 = session0.createSQLQuery(sql);
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
				flag = false;
	        }else{
	        	sql = "update l_plan a set a.deleted = 1 where a.plan_status = 'draft' and a.flight_id = "+flightId;
	        	query0 = session0.createSQLQuery(sql);
	        	query0.executeUpdate();
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
  		return flag;
  	}
    //查询方案被实施单位，也就是飞行大队
  	public List<Map<String,Object>> getFlightUnitNameAndCode(String unitName) {
  		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
  		try{
  			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
  			String sql = "SELECT t.unit_code as value,LPAD('|--', 3 * (LEVEL - 1), '　') || t.UNIT_NAME as label,t.unit_id"
  					+ " FROM FXW_flight_bd_aero_unit t where t.validity = 'VALID' and t.parent_id is not null CONNECT BY PRIOR unit_id = parent_id ";
  			UserDO user = UserContext.getUser();
  			String auth = schemeDao.getUserAuth(user.getId());
  			if(auth.equals("系统管理员")){
  				if(StringUtils.isNotBlank(unitName)){
  					sql += " START WITH unit_id in (select a.unit_id from fxw_flight_bd_aero_unit a "
  							+ " where a.unit_name like '%"+unitName+"%' and length(a.unit_code) <= 4)";
  				}else{
  					sql += " START WITH parent_id is null and length(t.unit_code) <= 8";
  				}
  			}else{
  				if(StringUtils.isNotBlank(unitName)){
  					sql += " START WITH unit_id in (select a.unit_id from fxw_flight_bd_aero_unit a "
  							+ " where a.unit_name like '%"+unitName+"%' and length(a.unit_code) <= 4"
  									+ " and exists (select 1 from l_observer_info tu,t_organization tt where tu.userid = "+user.getId()
  									+ " and tu.observer_org = tt.id and tt.deptcode = a.unit_code))";
  				}else{
  					sql += " START WITH unit_id in (select a.unit_id from fxw_flight_bd_aero_unit a "
  							+ " where length(a.unit_code) <= 4"
  									+ " and exists (select 1 from l_observer_info tu,t_organization tt where tu.userid = "+user.getId()
  									+ " and tu.observer_org = tt.id and tt.deptcode = a.unit_code))";
  				}
  			}
  			
  			sql += " order by t.unit_code";
  			SQLQuery query0 = session0.createSQLQuery((sql).toString());
  			List<?> list= new ArrayList<Object[]>();
  			list= query0.list();
  			if(list.size()>0){
  	        	for(int i=0;i<list.size();i++){
  	        		 Object[] obj = (Object[])list.get(i);
  	        		 Map<String,Object> map = new HashMap<String,Object>();
  	        		 map.put("unitCode", obj[0]);
  	        		 map.put("unitName", obj[1]);
  	        		 map.put("unitId", obj[2]);
  	        		 result.add(map);
  	        	}
  	        }
  		}catch(Exception e){
  			e.printStackTrace();
  		}
  		return result;
  	}
  	public ObserveDao getObserveDao() {
		return observeDao;
	}

	public void setObserveDao(ObserveDao observeDao) {
		this.observeDao = observeDao;
	}

	public SchemeDao getSchemeDao() {
		return schemeDao;
	}

	public void setSchemeDao(SchemeDao schemeDao) {
		this.schemeDao = schemeDao;
	}
	public AuditorDao getAuditorDao() {
		return auditorDao;
	}
	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}
	public UserDao getUserDao() {
		return userDao;
	}
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	public LosaOperateLogDao getLosaOperateLogDao() {
		return losaOperateLogDao;
	}
	public void setLosaOperateLogDao(LosaOperateLogDao losaOperateLogDao) {
		this.losaOperateLogDao = losaOperateLogDao;
	}
	public ObserveActivityDO getObserveActivityDO() {
		return observeActivityDO;
	}
	public void setObserveActivityDO(ObserveActivityDO observeActivityDO) {
		this.observeActivityDO = observeActivityDO;
	}
	public ObserveActivityDao getObserveActivityDao() {
		return observeActivityDao;
	}
	public void setObserveActivityDao(ObserveActivityDao observeActivityDao) {
		this.observeActivityDao = observeActivityDao;
	}
	
	
	
		
}
