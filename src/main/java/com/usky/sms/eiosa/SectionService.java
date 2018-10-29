package com.usky.sms.eiosa;


import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.losa.AttachmentDO;
import com.usky.sms.losa.AttachmentDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class SectionService extends AbstractService{
	private Config config;
	@Autowired
	private IsarpDao isarpDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	@Autowired
	private AuditorDao auditorDao;
	@Autowired
	private SectionTaskDao sectionTaskDao;
	@Autowired
	private SectionDao iosaSectionDao;
	@Autowired
	private OperateLogDao operateLogDao;
	@Autowired
	private DocumentsDao documentsDao;
	@Autowired
	private ChapterDao chapterDao;
	@Autowired
	private IsarpActionDao isarpActionDao;
	@Autowired
	private ActionAttachmentDao actionAttachmentDao;
	@Autowired
	private AttachmentDao attachementDao;
	@Autowired
	private IsarpAssessmentsDao isarpAssessmentsDao;
	@Autowired
	private AssessmentsDao  assessmentsDao;
	@Autowired
	private SectionDocumentDao sectionDocumentDao;
	@Autowired
	private IosaCodeDao iosaCodeDao;
	@Autowired
	private AuditorActionDao auditorActionDao;
	@Autowired
	private UserDao userDao;
	
	public SectionService(){
		this.config = Config.getInstance();
	}
	
	
	 public void queryReportId(HttpServletRequest request,HttpServletResponse response) throws Exception {
	   
	    try{
//	       String reportDate=request.getParameter("reportDate");
	       List<Object[]>list=iosaSectionDao.queryReportIdDao();
	      
	        Map<String, Object> result = new HashMap<String, Object>();

	        result.put("success", true);
	        result.put("data", list);
	        ResponseHelper.output(response, result);

	    }catch(Exception e){
	      e.printStackTrace();
	    }
	  
	  }
	 
//	public void queryIsarp(HttpServletRequest request,HttpServletResponse response)throws Exception {
//		try{
//			String id=request.getParameter("id");
//			Map<String, Object> result = new HashMap<String, Object>();
//			List<IsarpDO>list=isarpDao.queryIsarp(id);
//			result.put("data", list);
//			result.put("success", true);
//			ResponseHelper.output(response, result);
//		}catch(Exception e){
//			e.printStackTrace();
//		}
//	}
	public void querySection(HttpServletRequest request,HttpServletResponse response) throws Exception {
	
		try{
			 String reportId=request.getParameter("reportId");
			 List<Map<String,Object>>list=iosaSectionDao.querySection(reportId);
			
				Map<String, Object> result = new HashMap<String, Object>();
				Map<String, Object> data = new HashMap<String, Object>();		
				
				data.put("SectionList", PageHelper.getPagedResult(list, request));
				result.put("success", true);
				result.put("data", data);
				ResponseHelper.output(response, result);
				
			
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}
	
	public void queryIsarps(HttpServletRequest request,HttpServletResponse response) throws Exception {
		
		try{
			 String reportId=request.getParameter("reportId");
			 String sortby=request.getParameter("sortby");
		     String sortorders = request.getParameter("sortorders");
			 String isarpsQueryFormstr = request.getParameter("isarpsQueryForm");			 
			 IsarpsQueryForm isarpsQueryForm=gson.fromJson(isarpsQueryFormstr,new TypeToken<IsarpsQueryForm>() {}.getType());
			 List<Map<String,Object>>list=iosaSectionDao.queryIsarps(reportId,sortby,sortorders,isarpsQueryForm);
	
				if(list!=null){
					Map<String, Object> result = new HashMap<String, Object>();
					for(int i=0;i<list.size();i++){
					String no=(String) list.get(i).get("no");
					list.get(i).put("no", no);
					}
					result.put("SectionList", PageHelper.getPagedResult(list, request));
					result.put("success", true);
					ResponseHelper.output(response, result);
					
				}else{
				Map<String, Object> result = new HashMap<String, Object>();
				result.put("SectionList", PageHelper.getPagedResult(list, request));
				result.put("success", true);
				ResponseHelper.output(response, result);
				
				}	
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}

	public void querySectionDtatil(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		Map<String, Object> data = new HashMap<String, Object>();
		try {
			IosaSectionDO iosaSectionDo = iosaSectionDao.get(Integer.valueOf(request.getParameter("id")) );	
			data.put("section", iosaSectionDo);			
			map.put("data", data);
			map.put("success", true);
			ResponseHelper.output(response, map);
		 
			}catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	public void getSectionName(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			String reportId=request.getParameter("reportId");
			List<IosaSectionDO>list=iosaSectionDao.querySectionName(reportId);
			List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
			for(int i=0;i<list.size();i++){
				Map<String,Object>map=new HashMap<String,Object>();
				IosaSectionDO section=list.get(i);
				map.put("number", section.getId());
				map.put("name", section.getSectionName());
				result.add(map);
			}
			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("success", true);
			resultMap.put("data", result);
			ResponseHelper.output(response, resultMap);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	public void queryLogSender(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			List<Map<String,Object>>list=operateLogDao.queryLogSender();
			
			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("success", true);
			resultMap.put("data", list);
			ResponseHelper.output(response, resultMap);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
		
		
	}
	public void queryLogReceiver(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			List<Map<String,Object>>list=operateLogDao.queryLogReceiver();
			
			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("success", true);
			resultMap.put("data", list);
			ResponseHelper.output(response, resultMap);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
		
		
	}
	public void queryUser(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			String username = request.getParameter("username")==null?"":request.getParameter("username").toString();
			String fullname = request.getParameter("fullname")==null?"":request.getParameter("fullname").toString();
			List<Map<String,Object>>list=iosaSectionDao.queryUser(username, fullname);
			
			Map<String, Object> map = new HashMap<String, Object>();
			
			
			map.put("success", true);
			map.put("data",list);
			ResponseHelper.output(response, map);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	public void queryIsarpNo(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			String no=request.getParameter("no");
			String sectionId=request.getParameter("sectionId");
			Integer sectionIdi = (sectionId.equals(""))? null : Integer.valueOf(sectionId);
			List<IsarpDO>list=isarpDao.queryIsarpNo(no, sectionIdi , true);
			List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
			for(int i=0;i<list.size();i++){
				Map<String,Object>map=new HashMap<String,Object>();
				IsarpDO isarp=list.get(i);
				map.put("no", isarp.getNo());
				map.put("noSort",isarp.getNo_sort());
				result.add(map);
			}
			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("success", true);
			resultMap.put("data", result);
			ResponseHelper.output(response, resultMap);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}	
	}
	public void queryDocReviewed(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try{
			String sectionId=request.getParameter("sectionId");
			String reviewed=request.getParameter("reviewed");
			String reportId=request.getParameter("reportId");
			List<DocumentsDO>list=documentsDao.queryDocReviewed(reportId, sectionId, reviewed);
			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("success", true);
			resultMap.put("data", list);
			ResponseHelper.output(response, resultMap);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}	
	}
	
    public void queryAuditors(HttpServletRequest request,HttpServletResponse response) throws Exception {
		
		try{
			String reportId=request.getParameter("reportId");
			String type=request.getParameter("type");
			String auditorName=request.getParameter("name");
			String sectionId = request.getParameter("sectionId");
			Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
      Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
      String sortby=request.getParameter("sortby");
      String sortorders = request.getParameter("sortorders");
       
			Map map =auditorActionDao.queryAuditors(reportId,type,sectionId,auditorName,start,length,sortby,sortorders);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("auditorList", map.get("result"));
			result.put("all", map.get("all"));
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}
    

	/**
	 * 根据actionId查找action
	 * @param request
	 * @param response
	 * @throws Exception
	 */
   public void queryAction(HttpServletRequest request,HttpServletResponse response) throws Exception {
	   try{
		   String id=request.getParameter("id");
		   Map<String,Object>data=new HashMap<String,Object>();
		   IsarpActionDO action=isarpActionDao.queryAction(id);
		   //查询action下面的审计员
		   List<AuditorActionDO> auditors=auditorActionDao.queryByActionId(Integer.valueOf(id));
		   //根据查找附件
		   List<AttachmentDO> attach=attachementDao.pullAttachment(id);
		   data.put("action", action);
		   data.put("attach", attach);
		   data.put("auditors", auditors);
		   Map<String, Object> result = new HashMap<String, Object>();		
		   result.put("success", true);
		   result.put("data", data);
		   ResponseHelper.output(response, result);
		   
	   }catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
   }
   
   /**
    * 根据isarpId查找action
    * @param request
    * @param response
    * @throws Exception
    */
   public void queryActions(HttpServletRequest request,HttpServletResponse response) throws Exception {
		
		try{
			String rule=request.getParameter("id");
			String type=request.getParameter("type");
			List<Map<String,Object>>list=isarpActionDao.queryActions(rule,type);
			if(list!=null){
				Map<String, Object> result = new HashMap<String, Object>();
				for(int i=0;i<list.size();i++){
				String id=String.valueOf(list.get(i).get("id"));
				//根据ID查找附件
				//TODO 附件需改成批量查询
				List<AttachmentDO> attach=attachementDao.pullAttachment(id);
				
				list.get(i).put("attach", attach);
				}
				result.put("success", true);
				result.put("ActionList", list);
				ResponseHelper.output(response, result);
				
			}else{
				Map<String, Object> result = new HashMap<String, Object>();		
				result.put("success", false);
				result.put("ActionList", null);
				ResponseHelper.output(response, result);
			}
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}
   /** public void reform(HttpServletRequest request,HttpServletResponse response)throws Exception{
    	String data=request.getParameter("data");
    	try{
    	List<Map<String,Object>>actionList=gson.fromJson(data,new TypeToken<List<Map<String,Object>>>() {}.getType());
    	if(actionList.size()>0){
    		
    	}}catch(Exception e){
    		e.printStackTrace();
    		ResponseHelper.output(response, e);
    	}
    }*/

    public void updateActions(HttpServletRequest request,HttpServletResponse response)throws Exception{
   	       Map<String, Object> map = new HashMap<String, Object>();
   	   try{
   		    String id=request.getParameter("id");
   		    String auditDate=request.getParameter("auditDate");
   		    String status=request.getParameter("status"); 
   		    String auditors=request.getParameter("auditors");
   		    String reports=request.getParameter("reports");
   		    String isarpId=request.getParameter("isarpId");
   		    boolean result=isarpActionDao.updateAction(id, auditDate, status, auditors,reports);
   	        if(result==true){
 			    map.put("code", "success");
   	        }else{
   		        map.put("code", "fail");
   	         }
			ResponseHelper.output(response, map);
   	       }catch(Exception e){
   		    e.printStackTrace();
      	}
   }
   /** public void updateIsarp (HttpServletRequest request,HttpServletResponse response)throws Exception{
    	 Map<String, Object> map = new HashMap<String, Object>();
    	try{
     		  String assessment=request.getParameter("assessment");String reason=request.getParameter("reason");
     		  String rootCause=request.getParameter("rootCause");String taken=request.getParameter("taken");
     		  String comments=request.getParameter("comments");String id=request.getParameter("id");
     		  boolean result=isarpDao.updateIsarp(assessment, reason, rootCause, taken, comments, id);
     	        if(result==true){
   			    map.put("code", "success");
     	        }else{
     		        map.put("code", "fail");
     	         }
  			ResponseHelper.output(response, map);
     	       }catch(Exception e){
     		    e.printStackTrace();
        	}
    }*/
    /**
     * 保存专业联络人
     * @param request
     * @param response
     * @throws Exception
     */
    public void updateChiefAuditor(HttpServletRequest request,HttpServletResponse response)throws Exception{
    	  Map<String, Object> map = new HashMap<String, Object>();
    	  try{
    		  String sectionId=request.getParameter("sectionId");
    		  String userId=request.getParameter("userId");
    		
    		  boolean result=iosaSectionDao.updateChiefAuditor(sectionId,userId);
    		  
    		  
    		  if(result==true){
  			    map.put("code", "success");
  	          }else{
  		        map.put("code", "fail");
  	         }
  			ResponseHelper.output(response, map);
    		  
    	  }catch(Exception e){
    		  e.printStackTrace();
    		  ResponseHelper.output(response, e);
    	  }
    }
    /**
     * 保存审计员
     * @param request
     * @param response
     * @throws Exception
     */
     public void addDealer (HttpServletRequest request,HttpServletResponse response)throws Exception{
	    Map<String, Object> map = new HashMap<String, Object>();
	    try{
		  String sectionId=request.getParameter("sectionId");
		  String dealerId=request.getParameter("dealerId");
		  String isarpId=request.getParameter("isarpId");
		  String isarpNo=request.getParameter("isarpNo");
		  int dotcount =1;
		  if(isarpNo!=null){
			  for(int i = 0; i < isarpNo.length(); i++) {
				  if( isarpNo.charAt(i)=='.') dotcount++;
			  }
		  }
		  
		  String level=String.valueOf(dotcount);
//		  if(!"".equals(isarpNo)&& isarpNo!=null){
//			  if(isarpNo.length()==1){
//				  level="1"; 
//			  }else if(isarpNo.length()==3||isarpNo.length()==4){
//				  level="2";
//			  }else if(isarpNo.length()>4){
//				  level="3";
//			  }
//		  }
		  String operateFlag=request.getParameter("operateFlag");
		  String type=request.getParameter("type");
		  boolean result=false;
		  if(type==null){
			 result=sectionTaskDao.addDealer(sectionId, dealerId, isarpId, level,operateFlag,isarpNo);
		  }else{
			  SectionTaskDO secTask=new SectionTaskDO();
			  secTask.setCreator(UserContext.getUserId());
			  secTask.setLast_modifier(UserContext.getUserId());
			  secTask.setTargetId(Integer.valueOf(sectionId));
			  AuditorDO au=new AuditorDO();
			  au.setId(Integer.valueOf(dealerId));
			  secTask.setDealerId(au);
			  secTask.setType(4);
			  secTask.setValidity(1);
			  if(operateFlag!=null){
				  secTask.setId(Integer.valueOf(operateFlag));
				  result=sectionTaskDao.internalUpdate(secTask);
				  
			  }else{
				 sectionTaskDao.internalSave(secTask);
				 result=true;
			  }
		  }
		 
	        if(result==true){
			    map.put("code", "success");
	        }else{
		        map.put("code", "fail");
	         }
			ResponseHelper.output(response, map);
	       }catch(Exception e){
		    e.printStackTrace();
		    ResponseHelper.output(response, e);
   	        }
      }
   public void queryLog(HttpServletRequest request,HttpServletResponse response)throws Exception{
	   try{
			    String rule=request.getParameter("rule");
			    String sort=request.getParameter("sort");
			    List<Map<String,Object>>list=operateLogDao.queryLog(rule,sort);
				Map<String, Object> result = new HashMap<String, Object>();
				Map<String, Object> data = new HashMap<String, Object>();		
				data.put("LogList", PageHelper.getPagedResult(list, request));
				result.put("success", true);
				result.put("data", data);
				ResponseHelper.output(response, result);
		}catch(Exception e){
			e.printStackTrace();
		}
   }
   /**
   public void isarpSubmit(HttpServletRequest request,HttpServletResponse response)throws Exception{
	    try{
	    	
	    	String isarpId=request.getParameter("isarpId");
	    	String dec=request.getParameter("dec");
	    	String type=request.getParameter("type");
	    	//如果dec为空，说明没有添加说明，不需要插入数据到log，否则需要添加数据
	    	if(dec!=null){
	    		//添加记录到Log
	    		OperateLogDO op=new OperateLogDO();
	    		op.setTargetId(Integer.valueOf(isarpId));
	    		UserDO user=new UserDO();
	    		user.setId(UserContext.getUserId());
	    		op.setCreator(user);
	    		op.setDescoperate(dec);
	    		operateLogDao.internalSave(op);
	    	}
	    	//修改isarp状态
	    	
	    	boolean result=isarpDao.updateIsarpStatus(type,isarpId);
	    	Map<String, Object> resultMap = new HashMap<String, Object>();
	    	if(result){
	    		resultMap.put("success", true);
	    	}else{
	    		resultMap.put("success", false);
	    	}
			ResponseHelper.output(response, resultMap);
	    }catch(Exception e){
	    	e.printStackTrace();
	    }
   }*/
   
  public void exportReport (HttpServletRequest request,HttpServletResponse response)throws Exception{
	  OutputStream os=new FileOutputStream("d:/new.xls");   
	        String templateFile="d:/new.xls";   
       Map<String, Object> beans=new HashMap<String, Object>();   
	            
	         // fruits   
	         List<Map<String,String>> fruitList=new ArrayList<Map<String,String>>();   
	            
	         Map<String,String> fruit=null;   
	          fruit=new HashMap<String, String>();   
	         fruit.put("name", "苹果");   
	          fruit.put("price", "100");   
	         fruitList.add(fruit);   
	            
	       fruit=new HashMap<String, String>();   
	        fruit.put("name", "香蕉");   
	        fruit.put("price", "200");   
	         fruitList.add(fruit);   
	             
	         beans.put("fruits",fruitList); 
	         iosaSectionDao.exportExcel(templateFile, beans, os);   

  }
  
	public IsarpDao getIsarpDao() {
		return isarpDao;
	}
	public void setIsarpDao(IsarpDao isarpDao) {
		this.isarpDao = isarpDao;
	}
	
	public SectionDao getIosaSectionDao() {
		return iosaSectionDao;
	}
	public void setIosaSectionDao(SectionDao iosaSectionDao) {
		this.iosaSectionDao = iosaSectionDao;
	}
	public OperateLogDao getOperateLogDao() {
		return operateLogDao;
	}
	public void setOperateLogDao(OperateLogDao operateLogDao) {
		this.operateLogDao = operateLogDao;
	}
	public DocumentsDao getDocumentsDao() {
		return documentsDao;
	}
	public void setDocumentsDao(DocumentsDao documentsDao) {
		this.documentsDao = documentsDao;
	}
	
	
	public ChapterDao getChapterDao() {
		return chapterDao;
	}
	public void setChapterDao(ChapterDao chapterDao) {
		this.chapterDao = chapterDao;
	}
	public IsarpActionDao getIsarpActionDao() {
		return isarpActionDao;
	}
	public void setIsarpActionDao(IsarpActionDao isarpActionDao) {
		this.isarpActionDao = isarpActionDao;
	}
	public Config getConfig() {
		return config;
	}
	public void setConfig(Config config) {
		this.config = config;
	}
	public ActionAttachmentDao getActionAttachmentDao() {
		return actionAttachmentDao;
	}
	public void setActionAttachmentDao(ActionAttachmentDao actionAttachmentDao) {
		this.actionAttachmentDao = actionAttachmentDao;
	}
	public AttachmentDao getAttachementDao() {
		return attachementDao;
	}
	public void setAttachementDao(AttachmentDao attachementDao) {
		this.attachementDao = attachementDao;
	}
	public IsarpAssessmentsDao getIsarpAssessmentsDao() {
		return isarpAssessmentsDao;
	}
	public void setIsarpAssessmentsDao(IsarpAssessmentsDao isarpAssessmentsDao) {
		this.isarpAssessmentsDao = isarpAssessmentsDao;
	}
	public AssessmentsDao getAssessmentsDao() {
		return assessmentsDao;
	}
	public void setAssessmentsDao(AssessmentsDao assessmentsDao) {
		this.assessmentsDao = assessmentsDao;
	}
	public IosaCodeDao getIosaCodeDao() {
		return iosaCodeDao;
	}
	public void setIosaCodeDao(IosaCodeDao iosaCodeDao) {
		this.iosaCodeDao = iosaCodeDao;
	}
	public AuditorActionDao getAuditorActionDao() {
		return auditorActionDao;
	}
	public void setAuditorActionDao(AuditorActionDao auditorActionDao) {
		this.auditorActionDao = auditorActionDao;
	}
	public SectionDocumentDao getSectionDocumentDao() {
		return sectionDocumentDao;
	}
	public void setSectionDocumentDao(SectionDocumentDao sectionDocumentDao) {
		this.sectionDocumentDao = sectionDocumentDao;
	}
	public SectionTaskDao getSectionTaskDao() {
		return sectionTaskDao;
	}
	public void setSectionTaskDao(SectionTaskDao sectionTaskDao) {
		this.sectionTaskDao = sectionTaskDao;
	}
	public UserDao getUserDao() {
		return userDao;
	}
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public UserGroupDao getUserGroupDao() {
		return userGroupDao;
	}
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	public AuditorDao getAuditorDao() {
		return auditorDao;
	}
	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}
	
	
}
