package com.usky.sms.eiosa;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.eiosa.user.EiosaUserGroupDao;
import com.usky.sms.section.SectionDO;
import com.usky.sms.user.UserContext;

public class IsarpService extends AbstractService {
	@Autowired
	private IsarpDao isarpDao;
	@Autowired
	private AssessmentsDao assessmentsDao;
	@Autowired
	private SectionService sectionService;
	@Autowired
	private IsarpActionDao isarpActionDao;
	@Autowired
	private IsarpHistoryDao isarpHistoryDao;
	@Autowired
	private SectionDao sectionDao;
	@Autowired
	private EiosaUserGroupDao eiosaUserGroupDao;

	public void getIsarpFull(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		Map<String, Object> data = new HashMap<String, Object>();
		try {
			IsarpDO isarpDO = isarpDao.get(Integer.valueOf(request.getParameter("id")) );
			if(isarpDO != null) {
//				Hibernate.initialize(isarpDO.getStatus()); 
//				Hibernate.initialize(isarpDO.getOperateLogDO()); 
//				Hibernate.initialize(isarpDO.getAssessment()); 
//				Hibernate.initialize(isarpDO.getSectionTask()); 
//				Hibernate.initialize(isarpDO.getSectionId()); 
//				Hibernate.initialize(isarpDO.getLast_modifier()); 
//				isarpDO.getStatus();
//				isarpDO.getOperateLogDO();
//				isarpDO.getAssessment();
//				isarpDO.getSectionTask();
//				isarpDO.getSectionId();
//				isarpDO.getLast_modifier();
				data.put("status", isarpDO.getStatus());
				//data.put("operateLog", isarpDO.getOperateLogDO());
				if(isarpDO.getAssessment()!=null){
					data.put("assessment", isarpDO.getAssessment().getId());
				}else{
					data.put("assessment", null);
				}
				
				data.put("sectionId", isarpDO.getSectionId().getId());
				data.put("sectionName", isarpDO.getSectionId().getSectionName());
//				data.put("sectionTask", isarpDO.getSectionTask());
//				data.put("section", isarpDO.getSectionId());
				//data.put("last_modifier", isarpDO.getLast_modifier());
			}
			data.put("isarp", isarpDO);
			data.put("assessments", 
					this.getAssessmentsOptionsByType(assessmentsDao.getAssessmentsOptions(), isarpDO));
			data.put("userrole", eiosaUserGroupDao.getUserEiosaRole() );
			//查询isarpHistory,根据isarpBaseId
			data.put("isarpHistory", this.getIsarpHistory(isarpDO));
			map.put("data", data);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
    private List<Map<String,Object>>getIsarpHistory(IsarpDO isarp) throws Exception{
    	List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
    	 SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    	
    		//根据当前isarpId查找到历史表中的firstId,如果null则表示没有进行重新审计过
    		IsarpHistoryDO preHistory=isarpHistoryDao.queryFirstId(isarp.getId());
    		Date firstAudidtLastUpdate=null;
    		if(preHistory==null){
    			return null;
    		}else{
    			Integer fisrtIsarp=preHistory.getFirstIsarpId();
    			List<IsarpHistoryDO> history=isarpHistoryDao.queryHistoryByFirst(fisrtIsarp);
    			for(int i=0;i<history.size();i++){
        			Map<String,Object> map=new HashMap<String,Object>();
        			IsarpHistoryDO hi=history.get(i);
        			map.put("isarpId", hi.getCurIsarpId().getId());
        			map.put("name", "Reaudit"+(history.size()-i));
    				map.put("lastUpdate", dateFormat.format(hi.getCurIsarpId().getLastUpdate()));
        			result.add(map);
        			if(i==(history.size()-1)){
        				//第一次重新审计记录中history的创建时间即firstAudit最后更新时间
        				firstAudidtLastUpdate=hi.getCreated();
        			}
        		}
    			//添加firstAudit
    			Map<String,Object> first=new HashMap<String,Object>();
    			first.put("isarpId",fisrtIsarp);
    			first.put("name", "FirstAudit");
    			first.put("lastUpdate", dateFormat.format(firstAudidtLastUpdate));
    			result.add(first);
    			return result;
    		}
    }
	//根据isarps text首行是否包含shall/should决定assessment下拉选项内容
	private List<Map<String, Object>> getAssessmentsOptionsByType(List<Map<String, Object>> list, IsarpDO isarpDO) {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		String[] r = isarpDO.getText().split("</p>");
		boolean shall = (r!=null && r.length>0 && r[0].contains("shall")) ? true : false;
		for (Map<String, Object> pair : list) {
			int value = ((Integer) pair.get("value")).intValue();
			if (shall) {
				if ( (value>=1 && value<=4)  || value==8) {
					result.add(pair);
				}
			} else {
				if ( (value>=5 && value<=8) || value==1) {
					result.add(pair);
				}
			}
		}
		return result;
	}
	/**
	 * 重新审计
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void reAudit(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		Map<String, Object> data = new HashMap<String, Object>();
		try{
			String isarpId=request.getParameter("isarpId");
			
			Integer newIsarpId=isarpDao.reauditIasrp(isarpId);
			//新建action
			List<IsarpActionDO> newActionList=this.createAction(Integer.valueOf(isarpId),newIsarpId);
		    isarpActionDao.internalSave(newActionList);
			//新建isarpHistory
			IsarpHistoryDO history=new IsarpHistoryDO();
			//查找firstIsarp
			IsarpHistoryDO first=isarpHistoryDao.queryHistoryCurrentById(Integer.valueOf(isarpId));
			IsarpDO isp=new IsarpDO();
			isp.setId(newIsarpId);
			history.setCurIsarpId(isp);
			history.setPreIsarpId(Integer.valueOf(isarpId));
			if(first!=null){
				history.setFirstIsarpId(first.getFirstIsarpId());
			}else{
				history.setFirstIsarpId(Integer.valueOf(isarpId));
			}
			
			history.setCreator(UserContext.getUser());
			history.setLast_modifier(UserContext.getUser());
			Integer historyId=(Integer)isarpHistoryDao.internalSave(history);
			data.put("isarpId", newIsarpId);
			data.put("historyId", historyId);
			map.put("data", data);
			map.put("success", true);
			ResponseHelper.output(response, map);
			
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
			
		}
		
	}
	
	private List<IsarpActionDO> createAction(Integer isarpId,Integer newIsarpId) throws Exception{
		
		List<IsarpActionDO> actionList=new ArrayList<IsarpActionDO>();
		List<IsarpActionDO> queryAction=isarpActionDao.queryActionByIsarpId(isarpId);
		if(queryAction!=null){
			for(int i=0;i<queryAction.size();i++){
				IsarpActionDO action=queryAction.get(i);
				IsarpActionDO newAction=new IsarpActionDO();
				newAction.setLibtype(2);
				newAction.setTitle(action.getTitle());
				newAction.setTypename(action.getTypename());
				newAction.setIsarpid(newIsarpId);
				newAction.setBaseid(action.getBaseid());
				newAction.setCreator(UserContext.getUserId());
				newAction.setLast_modifier(UserContext.getUserId());;
				newAction.setAaid(action.getAaid());
				IosaCodeDO code=new IosaCodeDO();
				code.setId(0);
				newAction.setStatus(code);
				actionList.add(newAction);
				
			}
		}
		
		return actionList;
		
	}
	
	public void queryIsarpIdBySectionChapter(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		try{
			String sectionName=request.getParameter("sectionName");
			String chapter=request.getParameter("chapter");
			String reportIdStr=request.getParameter("reportId");
			Integer reportId=Integer.valueOf(reportIdStr);
			IosaSectionDO sectionDO = sectionDao.getSectionByReportAndName(reportId, sectionName);
			List<IsarpDO> isarpList = isarpDao.queryIsarpNo(chapter, sectionDO.getId(), false);
			map.put("isarpId", isarpList.get(0).getId());
			map.put("sectionId", sectionDO.getId());
			map.put("success", true);
			ResponseHelper.output(response, map);
			
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
			
		}
		
	}
	public void queryIsarpCharpter(HttpServletRequest request, HttpServletResponse response)throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			Map<String, Object> tempMap = new HashMap<String, Object>();
			 String rule=request.getParameter("rule");			 
			 Integer reportId=Integer.valueOf(request.getParameter("reportId"));
			 String sectionId = request.getParameter("sectionId");
			 String acronyms=request.getParameter("acronyms");
			 String charpter=request.getParameter("charpter");
			 String sortby=request.getParameter("sortby");
		     String sortorders = request.getParameter("sortorders");
			 tempMap.put("reportId", reportId);
			 tempMap.put("acronyms", acronyms);
			 tempMap.put("sectionId", sectionId);
			 tempMap.put("charpter", charpter);
			 Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
			 Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
			 
			 List<Object> queryResultList=isarpDao.getIsarpCharpter(rule,tempMap,start,length,sortby,sortorders);		
			 Map<String, Object> isarpList = PageHelper.getPagedResult((List<?>) queryResultList.get(1), request, (Integer) queryResultList.get(0));
			 result.put("isarpList", isarpList);
			 result.put("success", true);
			ResponseHelper.output(response, result);
				
			
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
			
		}
	}
	
	public IsarpDao getIsarpDao() {
		return isarpDao;
	}

	public void setIsarpDao(IsarpDao isarpDao) {
		this.isarpDao = isarpDao;
	}

	
	

	public SectionService getSectionService() {
		return sectionService;
	}

	public void setSectionService(SectionService sectionService) {
		this.sectionService = sectionService;
	}

	public AssessmentsDao getAssessmentsDao() {
		return assessmentsDao;
	}

	public void setAssessmentsDao(AssessmentsDao assessmentsDao) {
		this.assessmentsDao = assessmentsDao;
	}

	public IsarpActionDao getIsarpActionDao() {
		return isarpActionDao;
	}

	public void setIsarpActionDao(IsarpActionDao isarpActionDao) {
		this.isarpActionDao = isarpActionDao;
	}

	public IsarpHistoryDao getIsarpHistoryDao() {
		return isarpHistoryDao;
	}

	public void setIsarpHistoryDao(IsarpHistoryDao isarpHistoryDao) {
		this.isarpHistoryDao = isarpHistoryDao;
	}
	public SectionDao getSectionDao() {
		return sectionDao;
	}
	public void setSectionDao(SectionDao sectionDao) {
		this.sectionDao = sectionDao;
	}
	public EiosaUserGroupDao getEiosaUserGroupDao() {
		return eiosaUserGroupDao;
	}
	public void setEiosaUserGroupDao(EiosaUserGroupDao eiosaUserGroupDao) {
		this.eiosaUserGroupDao = eiosaUserGroupDao;
	}
	

}
