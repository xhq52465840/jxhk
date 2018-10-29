package com.usky.sms.eiosa;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringUtils;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.losa.AttachmentDO;
import com.usky.sms.losa.AttachmentDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class DocumentService extends AbstractService {
	@Autowired
	private SectionDocumentDao sectionDocumentDao;
	@Autowired
	private SectionDao sectionDao;
	@Autowired
	private DocumentsDao documentsDao;
	@Autowired
	private ChapterDao chapterDao;
	@Autowired
	private AttachmentDao attachmentDao;
	
	
	public void getById(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String docId = request.getParameter("docId");
			DocumentsDO documentsDO = documentsDao.get(Integer.valueOf(docId) );
			documentsDO.getAttachmentList(); //lazy pull
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", documentsDO);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}
	
	public void queryAcronyms(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			String sectionId=request.getParameter("sectionId");
			String reportId=request.getParameter("reportId");
			String acronyms=request.getParameter("acronyms");
			List<DocumentsDO>list=documentsDao.queryAcronyms(sectionId, reportId,acronyms);
			Map<String, Object> resultMap = new HashMap<String, Object>();
			resultMap.put("success", true);
			resultMap.put("data", list);
			ResponseHelper.output(response, resultMap);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	public void queryDocumentsByReport(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String reportId = request.getParameter("reportId");
			String documentsQueryFormstr = request.getParameter("documentsQueryForm");
			String sortby=request.getParameter("sortby");
		    String sortorders = request.getParameter("sortorders");
		    Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
		     Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
			DocumentsQueryForm documentsQueryForm=gson.fromJson(documentsQueryFormstr,new TypeToken<DocumentsQueryForm>() {}.getType());
			//Map<String,Object>  map1 = documentsDao.queryDocumentsByReport(reportId, documentsQueryForm,sortby,sortorders,start,length);
			List<SectionDocumentViewDO>  list = documentsDao.queryDocumentsByReport(reportId, documentsQueryForm,sortby,sortorders,start,length);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(list, request));
			//result.put("all", map1.get("all"));
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void queryDocumentsByIsarp(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String isarpId = request.getParameter("isarpId");
			Map<String,Object>  map1 = documentsDao.queryDocumentsByIsarp(isarpId);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", map1);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void queryDocuments(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String reportId = request.getParameter("reportId");
			String isarpId = request.getParameter("isarpId");
			String sectionId = request.getParameter("sectionId");
			String docName = request.getParameter("docName");
			String type = request.getParameter("type");
			// String documentId=request.getParameter("documentId");
			List<Map<String, Object>> list = documentsDao.queryDocuments(isarpId, reportId, sectionId, docName, type);
			 if(list!=null){
			for(int i=0;i<list.size();i++){
			String id=String.valueOf(list.get(i).get("id"));
			 List<AttachmentDO> attach=attachmentDao.pullAttachment(id);
			 list.get(i).put("attach", attach);
			 }
			 }
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			//result.put("data", list.size()>0 ? list.get(0) : null);
			result.put("data", list.size()>0 ? list : null);
			ResponseHelper.output(response, result);

		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}

	public void addDocumentSection(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String reportIdStr = request.getParameter("reportId");
			String sectionName = request.getParameter("sectionName");
			String docIdStr = request.getParameter("docId");
			IosaSectionDO iosaSectionDO = sectionDao.getSectionByReportAndName(Integer.parseInt(reportIdStr),
					sectionName);
			Map<String, Object> map = new HashMap<String, Object>();
			// map.put("sectionId", iosaSectionDO);
			map.put("sectionId", iosaSectionDO.getId());
			map.put("documentId", Integer.valueOf(docIdStr));
			map.put("validity", 1);
			sectionDocumentDao.save(map);
			//添加日志
			SectionDocumentDO secDoc=new SectionDocumentDO();
			secDoc.setDocumentId(Integer.valueOf(docIdStr));
			secDoc.setSectionId(iosaSectionDO);
			sectionDocumentDao.sectionDocumentLinkLog(secDoc, "addLink");
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//返回引用章节
	public void checkDocumentIosa(HttpServletRequest request, HttpServletResponse response) throws Exception {
    try {
      String sectionName = request.getParameter("sectionName");
      String documentid = request.getParameter("docId");
      List list = new ArrayList<>();
      list = documentsDao.checkDocumentIosaDao(documentid, sectionName);
      
      Map<String, Object> result = new HashMap<String, Object>();
      result.put("success", true);
      result.put("data", list);
      ResponseHelper.output(response, result);
    } catch (Exception e) {
      e.printStackTrace();
      ResponseHelper.output(response, e);
    }
  }

	public void delDocumentSection(HttpServletRequest request, HttpServletResponse response) throws Exception {
		//TODO 需要完善去除专业勾选的判断逻辑，如果有isarps在引用此文档，系统弹出提示有哪些isarps与这个文件关联；
		try {
			String reportIdStr = request.getParameter("reportId");
			String sectionName = request.getParameter("sectionName");
			String docIdStr = request.getParameter("docId");
			IosaSectionDO iosaSectionDO = sectionDao.getSectionByReportAndName(Integer.parseInt(reportIdStr),
					sectionName);
			sectionDocumentDao.delete(iosaSectionDO, Integer.parseInt(docIdStr));
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
    
    public void delDocument(HttpServletRequest request,HttpServletResponse response)throws Exception{
    	
      	try{
      		String docId = request.getParameter("docId");
			//删除document
			documentsDao.delete(Integer.valueOf(docId) );
      		//sess.internalUpdate(documentsDO);
			//documentsDao.update(documentsDO);
			//删除与专业的关联
			sectionDocumentDao.delete(Integer.parseInt(docId));
			////TODO 需要完善删除文档的判断逻辑,如果关联有chapterdo，则需要提示哪些isarp在用
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
      	}catch(Exception e){
       		e.printStackTrace();
       		ResponseHelper.output(response, e);
       	}
       }
      		
    public void updateDocuments(HttpServletRequest request,HttpServletResponse response)throws Exception{
   	 Map<String, Object> map = new HashMap<String, Object>();
   	try{
   		String documentLibary=request.getParameter("documentLibary");
   		String charpter=request.getParameter("charpter");
   		String sectionId=request.getParameter("sectionId");
   		String documentType=request.getParameter("documentType");
   		String documentId=request.getParameter("documentId");
   		Integer docId=0;
   		Integer charId=0;
   		boolean resultCharp=false;
   		boolean resultDoc=false;
   		UserDO user=UserContext.getUser();
   		DocumentsDO documents=gson.fromJson(documentLibary,new TypeToken<DocumentsDO>() {}.getType());
   		ChapterDO charpterDO=gson.fromJson(charpter,new TypeToken<ChapterDO>() {}.getType());
   		if(StringUtils.isNotEmpty(documentId)){
   			documents.setId(Integer.valueOf(documentId));
   		}
   		if(documents!=null && !documents.equals("")){
   			documents.setUsed(1);
   			//如果书 的简称转换为大写
       		documents.setAcronyms(documents.getAcronyms().toUpperCase());
   		}
   		
           
   		if(documentType.equals("newDocument")){//说明是新增一本书
   			//查询是否已存在书库，若存在不能重复添加
   		
   			if(documentsDao.queryDocumentByAcronyms(documents.getAcronyms(), documents.getReportId())){
   				map.put("existDocument", true);
   				
   			}else{
   				documents.setLast_modifier(user);
   				//if(StringUtils.isNotEmpty(documentId)){
   				//	documentsDao.addDocumentsLog(documents);
   					//documentsDao.internalUpdate(documents);
   					
   				//}else{
   					documentsDao.addDocumentsLog(documents);
   					docId=(Integer)documentsDao.internalSave(documents);
   					
   				//}
   				if(StringUtils.isNotEmpty(sectionId)){//存在sectionId时进行绑定section
   					SectionDocumentDO secDoc=new SectionDocumentDO();
       				IosaSectionDO section=new IosaSectionDO();
       				section.setId(Integer.valueOf(sectionId));
       				secDoc.setCreator(user.getId());
       				secDoc.setSectionId(section);
       				secDoc.setDocumentId(documents.getId());
       				secDoc.setValidity(1);
       				sectionDocumentDao.internalSave(secDoc);
   				}
   				
   				
       	    	resultDoc=true;
       	    	
       	    	if(charpterDO!=null){
       	    		if(charpterDO.getId()==null ){//新增isarpDocument
       	    			if(charpterDO.getDocumentid().getId()==null){//书也是新增
       	    				DocumentsDO doc=new DocumentsDO();
       	    				doc.setId(documents.getId());
       	    				charpterDO.setDocumentid(doc);
       	    			}
       	    			charpterDO.setCreator(user.getId());
       	    			chapterDao.addChapterLog(charpterDO);
       	    	    	charId=(Integer)chapterDao.internalSave(charpterDO);
       	    	    	
       	    	    	if(charId>0){
       	    	    		resultCharp=true;
       	    	    	}
       	    	    	
       	    	    }else {//修改isarpDocument
       	        		charpterDO.setLast_modifier(user.getId());
       	        		chapterDao.addChapterLog(charpterDO);
       	    	    	resultCharp=chapterDao.internalUpdate(charpterDO);
       	    	    	
       	    	    }
       	    	}else{
       	    		 resultCharp=true;
       	    	}
   				
   	    	    
   			}
   	    	
   	    }else if(documentType.equals("onlyAddAttach")){
   	    	//只添加附件
   	    	DocumentsDO doc=new DocumentsDO();
   	    	doc.setCreator(user);
   	    docId=(Integer)documentsDao.internalSave(doc);
   	    map.put("docId", docId);
   	    resultDoc=true;
   	    resultCharp=true;
   	    }else if(documentType.equals("onlyUpdateDocument")){
   	    	//只是更新书，没有章节
   	    	documents.setLast_modifier(user);
   	    	documentsDao.addDocumentsLog(documents);
			documentsDao.internalUpdate(documents);
				
   	    	resultDoc=true;
       	    resultCharp=true;
   	    }else{
   	    	//只更新章节
   	    	 resultDoc=true;
   	    	 if(charpterDO.getId()==null){//新增isarpDocument
   	    			if(charpterDO.getDocumentid().getId()==null){//书也是新增
   	    				DocumentsDO doc=new DocumentsDO();
   	    				doc.setId(docId);
   	    				charpterDO.setDocumentid(doc);
   	    			}
   	    			charpterDO.setCreator(user.getId());
   	    			chapterDao.addChapterLog(charpterDO);
   	    	    	charId=(Integer)chapterDao.internalSave(charpterDO);
   	    	    	
   	    	    	if(charId>0){
   	    	    		resultCharp=true;
   	    	    	}
   	    	    	
   	    	    }else {//修改isarpDocument
   	        		charpterDO.setLast_modifier(user.getId());
   	        		chapterDao.addChapterLog(charpterDO);
   	    	    	 resultCharp=chapterDao.internalUpdate(charpterDO);
   	    	    	
   	    	    }
   	    	    
   	    }
   		
     
   	  
   	  if(resultDoc==true && resultCharp==true){
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
	public SectionDocumentDao getSectionDocumentDao() {
		return sectionDocumentDao;
	}

	public void setSectionDocumentDao(SectionDocumentDao sectionDocumentDao) {
		this.sectionDocumentDao = sectionDocumentDao;
	}

	public SectionDao getSectionDao() {
		return sectionDao;
	}

	public void setSectionDao(SectionDao sectionDao) {
		this.sectionDao = sectionDao;
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


	public AttachmentDao getAttachmentDao() {
		return attachmentDao;
	}


	public void setAttachmentDao(AttachmentDao attachmentDao) {
		this.attachmentDao = attachmentDao;
	}
	
}