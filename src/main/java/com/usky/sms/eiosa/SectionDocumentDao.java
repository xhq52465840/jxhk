package com.usky.sms.eiosa;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateTemplate;

import com.usky.comm.JsonUtil;
import com.usky.sms.core.BaseDao;

public class SectionDocumentDao extends BaseDao<SectionDocumentDO>{

	public SectionDocumentDao(){
		super(SectionDocumentDO.class);
	}
	@Autowired
	private OperateLogDao operateLogDao;
	@Autowired
	private DocumentsDao documentsDao;
	
	//根据sectionId和documentId删除关联信息
	public boolean delete(IosaSectionDO section, Integer documentId) throws Exception{
		String sql=" from SectionDocumentDO t where t.deleted=false and t.sectionId= ? and t.documentId= ?";
		List<SectionDocumentDO>list=this.getHibernateTemplate().find(sql, section, documentId);
		//this.internalDelete(list);
		//this.delete(list);
	
		//使用逻辑删除
		for (SectionDocumentDO sddo : list) {
			sddo.setDeleted(true);
			//添加日志
			this.sectionDocumentLinkLog(sddo, "delLink");
		}
		this.getHibernateTemplate().setFlushMode(HibernateTemplate.FLUSH_EAGER); 
		this.getHibernateTemplate().saveOrUpdateAll(list);
		
		return true;
	}

	
	//根据documentId删除关联信息
	public boolean delete(Integer documentId) throws Exception{
		String sql=" from SectionDocumentDO t where t.deleted=false and t.documentId= ?";
		List<SectionDocumentDO>list=this.getHibernateTemplate().find(sql, documentId);
		//this.internalDelete(list);
		//this.delete(list);
		//使用逻辑删除
		for (SectionDocumentDO sddo : list) {
			sddo.setDeleted(true);
			//添加日志
			this.sectionDocumentLinkLog(sddo, "delLink");
		}
		this.getHibernateTemplate().setFlushMode(HibernateTemplate.FLUSH_EAGER); 
		this.getHibernateTemplate().saveOrUpdateAll(list);
		
		return true;
	}
	public void sectionDocumentLinkLog(SectionDocumentDO sdd,String type) throws Exception{
		List<String>details=new ArrayList<String>();
		List<String>documentDetails=new ArrayList<String>();
		DocumentsDO document=(DocumentsDO)documentsDao.internalGetById(sdd.getDocumentId());
		if(type.equals("delLink")){
			details.add("【("+document.getAcronyms()+")"+document.getReviewed()+"--"+document.getVersionno()+"】"+DocumentsFieldEnum.DELETESECTIONDOCUMENTLINK.getValue()+"【"+sdd.getSectionId().getSectionName()+"】");
			documentDetails.add(DocumentsFieldEnum.DELETESECTIONDOCUMENTLINK.getValue()+"【"+sdd.getSectionId().getSectionName()+"】");
		}else if(type.equals("addLink")){
			details.add("【("+document.getAcronyms()+")"+document.getReviewed()+"--"+document.getVersionno()+"】"+DocumentsFieldEnum.ADDSECTIONDOCUMENTLINK.getValue()+"【"+sdd.getSectionId().getSectionName()+"】");
			documentDetails.add(DocumentsFieldEnum.ADDSECTIONDOCUMENTLINK.getValue()+"【"+sdd.getSectionId().getSectionName()+"】");
		}
		operateLogDao.addLog(document.getReportId(),"report","document", JsonUtil.toJson(details));
		operateLogDao.addLog(document.getId(),"document","document", JsonUtil.toJson(documentDetails));
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


	
	
	
}
