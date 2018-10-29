package com.usky.sms.losa.activity;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;

public class ObserverInfoService extends AbstractService{
	private Config config;
	@Autowired
	private ObserverInfoDao observerInfoDao;
	
	public ObserverInfoService(){
		this.config = Config.getInstance();
	}
	
	public void observerInfoServiceInit(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String methodName = request.getParameter("methodName");
			if(methodName.equals("queryObserverInfos")){
				result = queryObserverInfos(request,response);
			}else if(methodName.equals("queryObservers")){
				result = queryObservers(request,response);
			}else if(methodName.equals("saveObserverInfo")){
				result = saveObserver(request,response);
			}else if(methodName.equals("queryObserverOrg")){
				result = queryObserverOrg(request,response);
			}
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//查询观察员信息
	public Map<String, Object> queryObserverInfos(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String observerQueryFormstr = request.getParameter("observerQueryForm");
			ObserverQueryForm observerQueryForm=gson.fromJson(observerQueryFormstr,new TypeToken<ObserverQueryForm>() {}.getType());
			String start = request.getParameter("start");
		    String length = request.getParameter("length");
		    String observerInfoId = request.getParameter("id");
		    HashMap<String,Object> queryMap = new HashMap<String,Object>();
		    queryMap.put("start", start);
			queryMap.put("length", length);
			queryMap.put("observerInfoId",observerInfoId);
			result = observerInfoDao.queryObserverInfos(queryMap,observerQueryForm);
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	//从用户里面选择观察员
	public Map<String, Object> queryObservers(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			result = observerInfoDao.queryObservers();
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	} 
	//保存观察员信息
	public Map<String, Object> saveObserver(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			String observerInfo = request.getParameter("observerInfo");
			ObserverInfoDO observer = gson.fromJson(observerInfo, new TypeToken<ObserverInfoDO>() {}.getType());
			result = observerInfoDao.saveObserverInfo(observer);
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	//查询LOSA人员所属机构
	public Map<String, Object> queryObserverOrg(HttpServletRequest request,HttpServletResponse response) throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			result = observerInfoDao.queryObserverOrg();
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	public Config getConfig() {
		return config;
	}
	public void setConfig(Config config) {
		this.config = config;
	}

	public ObserverInfoDao getObserverInfoDao() {
		return observerInfoDao;
	}

	public void setObserverInfoDao(ObserverInfoDao observerInfoDao) {
		this.observerInfoDao = observerInfoDao;
	}
}
