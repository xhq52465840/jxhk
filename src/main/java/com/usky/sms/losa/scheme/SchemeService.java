package com.usky.sms.losa.scheme;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;
import com.usky.sms.losa.AttachmentDO;
import com.usky.sms.losa.AttachmentDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class SchemeService extends AbstractService{
	private Config config;
	@Autowired
	private SchemeDao schemeDao;
	@Autowired
	private AttachmentDao attachementDao;
	
	//查询审计方案
	public void querySchemes(HttpServletRequest request,HttpServletResponse response) throws Exception {
		
		try{
			String schemeQueryForm = request.getParameter("schemeQueryForm");
			String schemeId = request.getParameter("schemeId");
			String start = request.getParameter("start");
		    String length = request.getParameter("length");
		    String sortby = request.getParameter("sortby");
		    String sortorders = request.getParameter("sortorders");
			HashMap<String,String> queryMap = gson.fromJson(schemeQueryForm, new TypeToken<HashMap<String,String>>() {}.getType());
			if(queryMap==null){
				queryMap = new HashMap<String,String>();
			}
			queryMap.put("start", start);
			queryMap.put("length",length);
			queryMap.put("schemeId", schemeId);
			queryMap.put("sortby", sortby);
			queryMap.put("sortorders", sortorders);
			Map<String,Object> map = schemeDao.querySchemes(queryMap);
			List<Map<String,Object>> list =(List<Map<String,Object>>) map.get("result");
			Map<String, Object> result = new HashMap<String, Object>();
//			if(list!=null){
//				for(int i=0;i<list.size();i++){
//					String id=String.valueOf(list.get(i).get("id"));
//				//根据ID查找附件
//				List<AttachmentDO> attach=attachementDao.pullAttachment(id);				
//				list.get(i).put("attach", attach);
//				}
//			}
			result.put("success", true);
			result.put("data", map.get("result"));
			result.put("all", map.get("all"));
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}
	
	//查询审计方案
	public void querySchemeInfoById(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			String schemeId = request.getParameter("schemeId");
			Map<String,Object> map = schemeDao.querySchemeInfoById(schemeId);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", map);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}
	//查询实施单位
	public void querySchemeImpleUnit(HttpServletRequest request,HttpServletResponse response) throws Exception{
		
		try{
			String unitName=request.getParameter("unitName");
			Map<String,Object> paramMap= new HashMap<String,Object>();
			paramMap.put("unitName", unitName);
			List<Map<String,Object>> list = schemeDao.querySchemeImpleUnit(paramMap);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
		
	}
	
	//新增或者修改方案信息
	public void insertOrUpdateScheme(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			String schemeInfo = request.getParameter("schemeInfo");
			HashMap<String,String> paramMap = 
					gson.fromJson(schemeInfo, new TypeToken<HashMap<String,String>>() {}.getType());
//			String observerIds = request.getParameter("observerIds");
//			String auditedUnits = request.getParameter("auditedUnits");
//			paramMap.put("observerIds", observerIds);
//			paramMap.put("auditedUnits", auditedUnits);
			String undelAuditorName = schemeDao.insertOrUpdateScheme(paramMap);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("message", undelAuditorName);
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	//删除方案
	public void delSchemes(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			boolean flag = true;
			Map<String, Object> result = new HashMap<String, Object>();
			String schemeIds = request.getParameter("schemeIds");
			List<Object> Ids = gson.fromJson(schemeIds,new TypeToken<List<Object>>() {}.getType());
			String Id = "";
			if(Ids.size()>0){
				for(int i=0;i<Ids.size();i++){
	        		 Id += Ids.get(i);
	        		 Id += ",";
	        	}
				List<Map<String,String>> data = schemeDao.querySchemePlans(Id.substring(0, Id.length()-1));
				if(data.size()>0){
					flag = false;
					result.put("data", data);
				}else{
					for(int i=0;i<Ids.size();i++){
		        		 String id = (String)Ids.get(i);
		        		 schemeDao.deleteScheme(Integer.valueOf(id));
		        	}
				}
			}
			result.put("success", flag);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
       		ResponseHelper.output(response, e);
		}
	}
	//发布方案
	public void disSchemes(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			String schemeIds = request.getParameter("schemeIds");
			List<String> Ids = gson.fromJson(schemeIds,new TypeToken<List<String>>() {}.getType());
			if(Ids.size()>0){
				for(int i=0;i<Ids.size();i++){
	        		 String id = Ids.get(i);
	        		 schemeDao.disScheme(Integer.valueOf(id));
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
	//查询用户职责
	public void getUserAuth(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			UserDO user = UserContext.getUser();
			String userAuth = schemeDao.getUserAuth(user.getId());
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", userAuth);
			ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	//根据方案id，判断当前用户是否在方案的实施单位里
	public void isUserSchemeUnit(HttpServletRequest request,HttpServletResponse response) throws Exception{
		try{
			String schemeId = request.getParameter("schemeId");
			String userAuth = schemeDao.isUserSchemeUnit(schemeId);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", userAuth);
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

	public SchemeDao getSchemeDao() {
		return schemeDao;
	}

	public void setSchemeDao(SchemeDao schemeDao) {
		this.schemeDao = schemeDao;
	}

	public AttachmentDao getAttachementDao() {
		return attachementDao;
	}

	public void setAttachementDao(AttachmentDao attachementDao) {
		this.attachementDao = attachementDao;
	}
	
	

}
