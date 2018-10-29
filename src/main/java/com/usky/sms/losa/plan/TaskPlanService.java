package com.usky.sms.losa.plan;

import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;

import com.usky.sms.losa.activity.ObserveActivityDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class TaskPlanService extends AbstractService{
	private Config config;
	@Autowired
	private TaskPlanDao taskPlanDao;
	@Autowired
	private ObserveActivityDao observeActivityDao;
	
	
	public TaskPlanService(){
		this.config = Config.getInstance();
	}
	//查询审计计划
	public void queryTaskPlan(HttpServletRequest request,HttpServletResponse response) throws Exception {
		
		try{
			String planQueryForm = request.getParameter("planQueryForm");
			String planId = request.getParameter("planId");
			String observeId=request.getParameter("observeId");
			String schemeId = request.getParameter("schemeId");
			String sortby = request.getParameter("sortby");
		    String sortorders = request.getParameter("sortorders");
			Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
		    Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
		    HashMap<String,Object> queryMap = gson.fromJson(planQueryForm, new TypeToken<HashMap<String,Object>>() {}.getType());
		    if(queryMap==null){
				queryMap = new HashMap<String,Object>();
			}
			queryMap.put("planId", planId);
			queryMap.put("observeId", observeId);
			queryMap.put("schemeId", schemeId);
			queryMap.put("start", start);
			queryMap.put("length", length);
			queryMap.put("sortby", sortby);
			queryMap.put("sortorders", sortorders);
			Map<String,Object> map = taskPlanDao.queryTaskPlans(queryMap);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", map.get("result"));
			result.put("all", map.get("all"));
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}
	//新增审计计划
	public void saveTaskPlan(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String schemeId=request.getParameter("schemeId");
			String observeDate=request.getParameter("observeDate");
			String flightId=request.getParameter("flyNo");
			String observerId = request.getParameter("observerId");			
			TaskPlanDO taskPlan = new TaskPlanDO();
			Collection<Integer> userIds=new ArrayList<Integer>();
			userIds.add(Integer.valueOf(observerId));
     		UserDO user = UserContext.getUser();
			taskPlan.setCreator(user.getId());
			taskPlan.setLastModifier(user.getId());
			taskPlan.setDeleted(false);
			taskPlan.setPlanStatus("draft");
			taskPlan.setFlightId(Integer.valueOf(flightId));
			if(StringUtils.isNotEmpty(schemeId)){
				taskPlan.setSchemeId(Integer.valueOf(schemeId));
			}
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
			taskPlan.setObserveDate(df.parse(observeDate));
			taskPlan.setObserverId(Integer.valueOf(observerId));
			if(taskPlanDao.isPlanExist(null,flightId)){
				Integer planId = (Integer)taskPlanDao.internalSave(taskPlan);
				taskPlanDao.updatePlanNoById(planId);
				observeActivityDao.creatObserveActivity(planId, observerId);
				taskPlanDao.addPlanLog(taskPlan);
				taskPlanDao.sendTodoMsg(planId, userIds);
				result.put("code", "success");	
			}else{
				result.put("code", "isExist");	
			}
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	//删除任务计划
	public void delTaskPlan(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			String planId = request.getParameter("planId");			    
			List<Object> planIds = gson.fromJson(planId,new TypeToken<List<Object>>() {}.getType());
			Collection<Integer> userIds=new ArrayList<Integer>();
			Integer observerId;
			String plan=null;
			if(planIds.size()>0){				
				for(int i=0;i<planIds.size();i++){
	        		 plan = (String)planIds.get(i);
	        		 taskPlanDao.deleteTaskPlan(Integer.valueOf(plan));
	        		 TaskPlanDO taskPlanDo = taskPlanDao.queryObserverId(Integer.parseInt(plan));
	        		  observerId=taskPlanDo.getObserverId();	        		 
	     			  userIds.add(observerId);
	     			 taskPlanDao.sendTodoMsg(Integer.valueOf(plan), userIds);
	        	}				
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
       		ResponseHelper.output(response, e);
		}
	}
	//修改任务计划
	public void modifyTaskPlan(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String planId = request.getParameter("planId");
			String planIds = request.getParameter("planIds");
			String schemeId=request.getParameter("schemeId");
			String observeDate=request.getParameter("observeDate");
			String flightId=request.getParameter("flightId");
			String observerId = request.getParameter("observerId");
			String modifyFlag = request.getParameter("modifyFlag");
			String planDesc = request.getParameter("planDesc");
			String planStatus = request.getParameter("planStatus");
			if(modifyFlag.equals("modifyStatus")){
				List<Object> plans = gson.fromJson(planIds,new TypeToken<List<Object>>() {}.getType());
				if(plans.size()>0){
					for(int i=0;i<plans.size();i++){
						 Map<String,Object> paramMap= new HashMap<String,Object>();
						 String plan = (String)plans.get(i);
						 paramMap.put("planId", plan);
						 paramMap.put("modifyFlag", modifyFlag);
						 paramMap.put("planStatus",planStatus);
		        		 taskPlanDao.modifyTaskPlan(paramMap);
		        	}
				}
				result.put("success", true);
			}else{
				Map<String,Object> paramMap= new HashMap<String,Object>();
				paramMap.put("planId", planId);
				paramMap.put("schemeId", schemeId);
				paramMap.put("observeDate", observeDate);
				paramMap.put("flightId", flightId);
				paramMap.put("observerId", observerId);
				paramMap.put("modifyFlag", modifyFlag);
				paramMap.put("planDesc",planDesc);
				paramMap.put("planStatus",planStatus);
				if(taskPlanDao.isPlanExist(planId,flightId)){
					taskPlanDao.modifyTaskPlan(paramMap);
					result.put("code", "success");	
				}else{
					result.put("code", "isExist");	
				}
			}
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
       		ResponseHelper.output(response, e);
		}
	}
	//根据机场名称和三字码查询机场信息
	public void getAirportByNameAndIATACode(HttpServletRequest request,HttpServletResponse response) 
					throws Exception {
		try{
			String name=request.getParameter("name");
			if(name==null){
				name="";
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data",
					PageHelper.getPagedResult(
							taskPlanDao.getAirportByNameAndIATACode(name), request));
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}	
	//查询连续航班信息
	public void queryMulFly(HttpServletRequest request,HttpServletResponse response) throws Exception {
		
		try{
			String flyDate=request.getParameter("flyDate");
			String flyTeam=request.getParameter("flyTeam");
			String deptAirport=request.getParameter("deptAirport");
			String arrAirport = request.getParameter("arrAirport");
			String flightTaskId = request.getParameter("flightTaskId");
			String schemeId = request.getParameter("schemeId");
			Map<String,Object> paramMap= new HashMap<String,Object>();
			paramMap.put("flyDate", flyDate);
			paramMap.put("flyTeam", flyTeam);
			paramMap.put("deptAirport", deptAirport);
			paramMap.put("arrAirport", arrAirport);
			paramMap.put("flightTaskId", flightTaskId);
			paramMap.put("schemeId", schemeId);
			List<Map<String,Object>> list = taskPlanDao.queryMulFly(paramMap);
			if (list != null) {
				for (int i = 0; i < list.size(); i++) {
					list.get(i).put("mulFlyDetails", null);
				}
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}
	//根据航段号查询航班段具体航班信息
	public void queryDetailFly(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			String flightTaskId=request.getParameter("flightTaskId");
			List<Map<String, Object>> list = taskPlanDao.queryMulFlyDetails(flightTaskId);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//查询飞行网的航班信息
	public void queryFlightInfo(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			String flightDate = request.getParameter("flightDate");
			String flightNo = request.getParameter("flightNo");
			String schemeId = request.getParameter("schemeId");
			Map<String,Object> paramMap = new HashMap<String,Object>();
			paramMap.put("flightDate", flightDate);
			paramMap.put("flightNo", flightNo);
			paramMap.put("schemeId", schemeId);
			List<Map<String, Object>> list = taskPlanDao.queryFlightInfo(paramMap);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("data",PageHelper.getPagedResult(list, request));
			result.put("success", true);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//查询losa审计员信息
	public void queryLosaAuditors(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			String auditorName = request.getParameter("auditorName");
			String schemeId = request.getParameter("schemeId");
			List<Map<String, Object>> list = taskPlanDao.queryLosaAuditors(auditorName,schemeId);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("data",list);
			result.put("success", true);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//根据航班段id，插入审计计划
	public void savePlanByTask(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String observeDate=request.getParameter("observeDate");
			String flightTaskId=request.getParameter("flightTaskId");
			String observerId = request.getParameter("observer");
			String schemeId = request.getParameter("schemeId");
			List<Map<String, Object>> list = taskPlanDao.queryMulFlyDetails(flightTaskId);
			if (list != null) {
				for (int i = 0; i < list.size(); i++) {
					String isExist = (String) list.get(i).get("isTempPlan");
					if(isExist.equals("0")){
						TaskPlanDO taskPlan = new TaskPlanDO();
						Collection<Integer> userIds=new ArrayList<Integer>();
						userIds.add(Integer.valueOf(observerId));
			     		UserDO user = UserContext.getUser();
						taskPlan.setCreator(user.getId());
						taskPlan.setLastModifier(user.getId());
						taskPlan.setDeleted(false);
						taskPlan.setPlanStatus("draft");
						BigDecimal flightPlanId = (BigDecimal)list.get(i).get("flightPlanId");
						taskPlan.setFlightId(flightPlanId.intValue());
						if(StringUtils.isNotEmpty(schemeId)){
							taskPlan.setSchemeId(Integer.valueOf(schemeId));
						}
						DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
						taskPlan.setObserveDate(df.parse(observeDate));
						taskPlan.setObserverId(Integer.valueOf(observerId));
						Integer planId = (Integer)taskPlanDao.internalSave(taskPlan);
						taskPlanDao.updatePlanNoById(planId);
						observeActivityDao.creatObserveActivity(planId, observerId);
						taskPlanDao.addPlanLog(taskPlan);
						taskPlanDao.sendTodoMsg(planId, userIds);
					}
				}
			}
			result.put("code", "success");
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	//根据航班段id，删除审计计划
	public void delPlanByTask(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String flightTaskId = request.getParameter("flightTaskId");
			String flyNos = taskPlanDao.delPlanByTask(Integer.parseInt(flightTaskId));
			result.put("code", "success");
			result.put("flyNos", flyNos);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
       		ResponseHelper.output(response, e);
		}
	}
	//根据航班id，插入审计计划
	public void savePlanByFlightId(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String observeDate=request.getParameter("observeDate");
			String flightPlanId=request.getParameter("flyId");
			String observerId = request.getParameter("observer");
			String schemeId = request.getParameter("schemeId");
			TaskPlanDO taskPlan = new TaskPlanDO();
			Collection<Integer> userIds=new ArrayList<Integer>();
			userIds.add(Integer.valueOf(observerId));
     		UserDO user = UserContext.getUser();
			taskPlan.setCreator(user.getId());
			taskPlan.setLastModifier(user.getId());
			taskPlan.setDeleted(false);
			taskPlan.setPlanStatus("draft");
			taskPlan.setFlightId(Integer.valueOf(flightPlanId));
			if(StringUtils.isNotEmpty(schemeId)){
				taskPlan.setSchemeId(Integer.valueOf(schemeId));
			}
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
			taskPlan.setObserveDate(df.parse(observeDate));
			taskPlan.setObserverId(Integer.valueOf(observerId));
			Integer planId = (Integer)taskPlanDao.internalSave(taskPlan);
			taskPlanDao.updatePlanNoById(planId);
			observeActivityDao.creatObserveActivity(planId, observerId);
			taskPlanDao.addPlanLog(taskPlan);
			taskPlanDao.sendTodoMsg(planId, userIds);
			result.put("code", "success");
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	//根据flightId,在连续航班添加页面取消计划
	public void delPlanByFlightId(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		Boolean flag = true;
		try{
			String flightId = request.getParameter("flightId");
			flag = taskPlanDao.delPlanByFlightId(flightId);
			if(flag){
				result.put("code", true);
			}else{
				result.put("code", false);
			}
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//查询方案被实施单位，也就是具体的飞行大队
	public void getFlightUnitNameAndCode(HttpServletRequest request,HttpServletResponse response) throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String unitName = request.getParameter("name");
			List<Map<String, Object>> list = taskPlanDao.getFlightUnitNameAndCode(unitName);
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	public Config getConfig() {
		return config;
	}
	public void setConfig(Config config) {
		this.config = config;
	}
	public TaskPlanDao getTaskPlanDao() {
		return taskPlanDao;
	}
	public void setTaskPlanDao(TaskPlanDao taskPlanDao) {
		this.taskPlanDao = taskPlanDao;
	}
	public ObserveActivityDao getObserveActivityDao() {
		return observeActivityDao;
	}
	public void setObserveActivityDao(ObserveActivityDao observeActivityDao) {
		this.observeActivityDao = observeActivityDao;
	}
	
	
}
