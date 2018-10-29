package com.usky.sms.eiosa;


import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.jasperreports.engine.util.ObjectUtils;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.hibernate.LockMode;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateTemplate;

import com.usky.comm.JsonUtil;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;

public class DocumentsDao extends BaseDao<DocumentsDO>{
 
	public DocumentsDao(){
		super(DocumentsDO.class);
	}
	@Autowired
	private OperateLogDao operateLogDao;
	@Autowired
	private ChapterDao chapterDao;
	public DocumentsDO get(Integer docId) {
		return this.getHibernateTemplate().get(DocumentsDO.class, docId);

//		StringBuilder sb= new StringBuilder("select t1 from DocumentsDO t1  where 1=1 and t1.deleted=false  and t1.id = ? ");
//		List<DocumentsDO> docList = this.getHibernateTemplate().find(sb.toString(), docId);
//		DocumentsDO documentsDO = null;
//		if ( CollectionUtils.isNotEmpty(docList) ) documentsDO = docList.get(0);
//		
  		//Session  sess = this.getSessionFactory().getCurrentSession(); 
  		//DocumentsDO documentsDO = (DocumentsDO) sess.get(DocumentsDO.class, Integer.valueOf(docId));

		//return documentsDO;
	}
	
	public void delete(Integer docId) throws Exception {
		DocumentsDO documentsDO = get(Integer.valueOf(docId) );
		documentsDO.setUsed(0);
  		documentsDO.setDeleted(true);
  		//添加日志
  		this.delDocumentLog(documentsDO);
  		this.internalSaveOrUpdate(documentsDO);
	}
	
	//查出报告下的所有文档
	@SuppressWarnings("unchecked")
	public List<SectionDocumentViewDO> queryDocumentsByReport(String reprotId, DocumentsQueryForm documentsQueryForm,String sortby,String sortorders,Integer start,Integer length) throws Exception {
		int count = 0;
		List<Object> param = new ArrayList<Object>();
		StringBuilder sb= new StringBuilder("select t1 from DocumentsDO t1  where 1=1 and t1.deleted=false  ");
		if(StringUtils.isNotBlank(reprotId)) {
			sb.append("and t1.reportId= ?");
			param.add(NumberHelper.toInteger(reprotId));
		}
		if (documentsQueryForm != null) {
			if(StringUtils.isNotBlank(documentsQueryForm.getReviewed())) {
//				sb.append(" (upper(t1.reviewed) like upper( ? ) or upper(t1.acronyms) like upper( ? )) ");
//				param.add("%"+documentsQueryForm.getReviewed()+"%");
//				param.add("%"+documentsQueryForm.getReviewed()+"%");
				sb.append("and t1.id=?");
				param.add(NumberHelper.toInteger(documentsQueryForm.getReviewed()));
			}
			if(StringUtils.isNotBlank(documentsQueryForm.getSectionId())) {
				sb.append(" and ? = any(select sd.sectionId.id from SectionDocumentDO sd where sd.deleted=false and sd.documentId= t1.id) ");
				param.add(NumberHelper.toInteger(documentsQueryForm.getSectionId()) );
			}
		}
		if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
			sb.append(" order by "+sortby+" "+sortorders+"");
        }else{
           sb.append(" order by t1.acronyms ");
        }
        //sb.append(" order by t1.acronyms ");
		List<DocumentsDO> ddoList = this.getHibernateTemplate().find(sb.toString(), param.toArray());		
		count=ddoList.size();
		Map<String,Object> map1 = new HashMap<String,Object>();
		Map<Integer,Object> ddoMap = new HashMap<Integer,Object>();
		List<Integer> docidList = new ArrayList<Integer>();
		if(CollectionUtils.isNotEmpty(ddoList)) {
			for (DocumentsDO ddo : ddoList) {
				docidList.add(ddo.getId());
				ddoMap.put(ddo.getId(), ddo);
				ddo.getAttachmentList(); //pull lazy
				//fix some attr?
			}
		}
		
		List<SectionDocumentViewDO> sdbeanList = null;
		if ( CollectionUtils.isNotEmpty(docidList) ) {
			String sectiondocSql=" from SectionDocumentViewDO  where  id in (:ids) ";
			String sqlQaram="";
			if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
				  sqlQaram+=" order by "+sortby+" "+sortorders+"";
	         }else{
	        	 sqlQaram+="  order by acronyms";		
	         }
			sdbeanList = this.getHibernateTemplate().findByNamedParam(sectiondocSql+sqlQaram, "ids", docidList);
			//手动设置每个SectionDocumentViewDO对象中的DocumentsDO对象
			if(CollectionUtils.isNotEmpty(sdbeanList)) {
				for (SectionDocumentViewDO sdbean : sdbeanList) {
					sdbean.setDoc((DocumentsDO)ddoMap.get(sdbean.getId()));
				}
			}
		}
		
//		map1.put("sectiondocument", sdbeanList);
//		map1.put("all", count);
		//long time2 =System.nanoTime();
		//System.out.println("SectionDocumentDO time diff：" + (time2-time1)/1000000L);		
		return sdbeanList;
	}
    public List<DocumentsDO> queryAcronyms(String sectionId,String reportId,String acronyms) throws Exception{
    	 List<Object> params = new ArrayList<Object>();
    	 StringBuilder sb = new StringBuilder("select  doc from DocumentsDO doc   where  doc.deleted=false and doc.reportId=? ");
    	 params.add(Integer.valueOf(reportId));
    	if(!StringUtils.isBlank(acronyms)){
        		sb.append(" and upper(doc.acronyms) like upper( ? ) ");
        		params.add(acronyms+"%");
        }
    	 if(!StringUtils.isBlank(sectionId)){
    		sb.append(" and ? = any(select sd.sectionId.id from SectionDocumentDO sd where sd.deleted=false and sd.documentId= doc.id) ");
    		params.add(Integer.valueOf(sectionId));
    	}
    	sb.append(" order by doc.acronyms ");
    	
    	List<DocumentsDO>list=(List<DocumentsDO>)this.query(sb.toString(), params.toArray());
    	return list;
    }
	//查出isarp下的所有文档
	public Map<String,Object> queryDocumentsByIsarp(String isarpId) throws Exception {
		String sql="";
		sql=" from ChapterDO c where c.deleted=false and c.isarpId= ? order by c.documentid.acronyms";
		List<ChapterDO> cdoList = this.getHibernateTemplate().find(sql, Integer.valueOf(isarpId));			
		Map<String,Object> map1 = new HashMap<String,Object>();
		Map<Integer,Object> ddoMap = new HashMap<Integer,Object>();
		
		//List<Integer> docidList = new ArrayList<Integer>();
		if(CollectionUtils.isNotEmpty(cdoList)) {
			for (ChapterDO cdo : cdoList) {
				cdo.getDocumentid(); //pull lazy
			}
		}

		map1.put("chapters", cdoList);
		//long time2 =System.nanoTime();
		//System.out.println("SectionDocumentDO time diff：" + (time2-time1)/1000000L);		
		return map1;
	}
	
	//TODO 旧的方法需要废弃，目前按照专业查询功能还没有被替换掉
	public List<Map<String,Object>> queryDocuments(String isarpId,String reprotId,String sectionId,String docName,String type) throws Exception {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
		String sql="";
   	 	Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();

		if(isarpId!=null && !type.equals("queryDocBySection")){
			if(type.equals("queryById")){
				sql="select t1.documentid.reviewed,t1.documentid.acronyms,t1.documentid.versionno,"
						+ "t1.documentid.type,t1.documentid.docdate,t1.documentid.id, t1.dec, "
						+ "t1.isarpId,t1.id from ChapterDO t1 where t1.id="+isarpId 
						+ " order by t1.documentid.acronyms";
			}else{
				sql="select t1.documentid.reviewed,t1.documentid.acronyms,t1.documentid.versionno,"
						+ "t1.documentid.type,t1.documentid.docdate,t1.documentid.id, t1.dec, "
						+ "t1.isarpId,t1.id from ChapterDO t1 where t1.isarpId="+isarpId 
						+ " order by t1.documentid.acronyms";
			}
			
			
			List<?>list=this.getHibernateTemplate().find(sql);
		     for(int i=0;i<list.size();i++){
					Map<String,Object>map=new HashMap<String,Object>();
					Object[] obj = (Object[])list.get(i);
					
					map.put("reviewed", obj[0]);
					map.put("acronyms", obj[1]);
					map.put("versionno", obj[2]);
					map.put("type", obj[3]);
					map.put("docdate", (obj[4]==null) ? null : dateFormat.format(obj[4]));
					map.put("id", obj[5]);
					if(obj[6]==null){
						map.put("charpter", "");
					}else{
						map.put("charpter", obj[6]);
					}
					map.put("isarpId", obj[7]);
					map.put("charpterId", obj[8]);
					
					result.add(map);
				}
			
		}else if(isarpId==null && reprotId!=null){
			//查出报告下的所有文档
			sql=" from DocumentsDO t1 where t1.used='1' and t1.reportId= ? order by t1.acronyms";
			@SuppressWarnings("unchecked")
			List<DocumentsDO> ddoList = this.getHibernateTemplate().find(sql, Integer.valueOf(reprotId));			
			Map<String,Object> map1 = new HashMap<String,Object>();
			Map<Integer,Object> ddoMap = new HashMap<Integer,Object>();
			
			List<Integer> docidList = new ArrayList<Integer>();
			if(CollectionUtils.isNotEmpty(ddoList)) {
				for (DocumentsDO ddo : ddoList) {
					docidList.add(ddo.getId());
					ddoMap.put(ddo.getId(), ddo);
					ddo.getAttachmentList(); //pull lazy
					//fix some attr?
				}
			}
			
			String sectiondocSql=" from SectionDocumentViewDO  where  id in (:ids) ";
			List<SectionDocumentViewDO> sdbeanList = this.getHibernateTemplate().findByNamedParam(sectiondocSql, "ids", docidList);
			//手动设置每个SectionDocumentViewDO对象中的DocumentsDO对象
			if(CollectionUtils.isNotEmpty(sdbeanList)) {
				for (SectionDocumentViewDO sdbean : sdbeanList) {
					sdbean.setDoc((DocumentsDO)ddoMap.get(sdbean.getId()));
				}
			}

			map1.put("sectiondocument", sdbeanList);
			result.add(map1);
			//long time2 =System.nanoTime();
			//System.out.println("SectionDocumentDO time diff：" + (time2-time1)/1000000L);
		     }else if(isarpId==null && reprotId==null){
		    	 //按照专业进行查询
		    	 String docSql="select t1.id,t1.reviewed,t1.acronyms,t1.versionno,t1.type, t1.docdate "
		    			    +" from e_iosa_document_libary t1 left join e_iosa_section_document t2  on t1.id=t2.documentid "
		    			    +" where t1.used='1' and t2.sectionid="+sectionId+" and (upper(t1.reviewed) like upper('"+docName+"%') or upper(t1.acronyms) like upper('"+docName+"%' ))"
		    			    +"order by t1.acronyms";
		    			    		//+ " or lower(t1.reviewed) like '"+docName+"%' or lower(t1.acronyms) like '"+docName+"%')";
		    	
		    	 SQLQuery query = session.createSQLQuery((docSql).toString());
				 List<Object[]> list=query.list();
				 if(list.size()>0){
					for(int i=0;i<list.size();i++){
						 Map<String,Object>map=new HashMap<String,Object>();
						 Object[] obj=list.get(i);
						 map.put("id", obj[0]);
						 map.put("reviewed",obj[1]);
						 map.put("acronyms",obj[2]);
						 map.put("versionno",obj[3]);
						 map.put("type", obj[4]);
						 map.put("docdate", (obj[5]==null) ? null : dateFormat.format(obj[5]));
						 result.add(map);
					}
					
					 
				 }
		     }else if(isarpId!=null && type.equals("queryDocBySection")){
		    	//按照专业进行查询 过滤掉 当前Isarp下已经关联的doc
		    	 String docSql="select t1.id,t1.reviewed,t1.acronyms,t1.versionno,t1.type, t1.docdate "
		    			    +" from e_iosa_document_libary t1 left join e_iosa_section_document t2  on t1.id=t2.documentid "
		    			    +" where t1.used='1' and t2.sectionid="+sectionId
		    			    +" and (upper(t1.reviewed) like upper('"+docName+"%') or upper(t1.acronyms) like upper('"+docName+"%' ))"
		    			    +" and t1.id not in (select b.documentid from e_iosa_chapter b where b.isarpid = "+isarpId+ ") "
		    			    +"order by t1.acronyms";
		    	 SQLQuery query = session.createSQLQuery((docSql).toString());
				 List<Object[]> list=query.list();
				 if(list.size()>0){
					for(int i=0;i<list.size();i++){
						 Map<String,Object>map=new HashMap<String,Object>();
						 Object[] obj=list.get(i);
						 map.put("id", obj[0]);
						 map.put("reviewed",obj[1]);
						 map.put("acronyms",obj[2]);
						 map.put("versionno",obj[3]);
						 map.put("type", obj[4]);
						 map.put("docdate", (obj[5]==null) ? null : dateFormat.format(obj[5]));
						 result.add(map);
					}
					
					 
				 }
		     }
		
		     return result;
	    }
	public List<DocumentsDO>queryDocReviewed(String reportId,String sectionId,String reviewed) throws Exception{
		List<DocumentsDO>list=new ArrayList<DocumentsDO>();
		try{
			String sql="";
			StringBuilder sb=new StringBuilder("select doc from DocumentsDO doc where doc.reportId=? and doc.deleted=false ");
			List<Object> params = new ArrayList<Object>();
			params.add(Integer.valueOf(reportId));
			if(!StringUtils.isEmpty(sectionId)){
				sb.append(" and ? = any(select sd.sectionId.id from SectionDocumentDO sd where sd.deleted=false and sd.documentId= doc.id) ");
	    		params.add(Integer.valueOf(sectionId));
			}
			if(!StringUtils.isEmpty(reviewed)){
				sb.append(" and (upper(doc.reviewed) like upper( ? ) or upper(doc.acronyms) like upper( ? ) or upper(doc.versionno) like upper( ? ))");
        		params.add(reviewed+"%");
        		params.add(reviewed+"%");
        		params.add(reviewed+"%");
			}
			
			/**if(sectionId=="" ){
				sql=" select t1.reviewed, t1.acronyms, t1.reportid,t2.sectionid,t1.id,t1.versionno from e_iosa_document_libary t1 "
						   +"   left join e_iosa_section_document t2 on t1.id = t2.documentid where t1.deleted=0 and t1.reportid = "+reportId
						   +"   and  (upper(t1.reviewed) like '"+reviewed+"%' or upper(t1.acronyms) like '"+reviewed+"%' "
		    			   + " or lower(t1.reviewed) like '"+reviewed+"%' or lower(t1.acronyms) like '"+reviewed+"%')";
			}else{
				sql=" select t1.reviewed, t1.acronyms, t1.reportid,t2.sectionid,t1.id,t1.versionno from e_iosa_document_libary t1 "
						   +"   left join e_iosa_section_document t2 on t1.id = t2.documentid where t1.deleted=0 and t1.reportid = "+reportId
						   +"   and t2.sectionid="+sectionId+""
						   +"   and  (upper(t1.reviewed) like '"+reviewed+"%' or upper(t1.acronyms) like '"+reviewed+"%' "
		    			   + " or lower(t1.reviewed) like '"+reviewed+"%' or lower(t1.acronyms) like '"+reviewed+"%')";
			}
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query=session.createSQLQuery((sql).toString());
			List<Object[]> list=query.list();
			if(list.size()>0){
				for(int i=0;i<list.size();i++){
					Object[] obj=list.get(i);
					Map<String,Object>map=new HashMap<String,Object>();
					map.put("reviewed", obj[0]);
					map.put("acronyms", obj[1]);
					map.put("id", obj[4]);
					map.put("versionno", obj[5]);
					result.add(map);
				}
			}*/
			list=(List<DocumentsDO>)this.query(sb.toString(), params.toArray());
	    	
			
		}catch(Exception e){
			e.printStackTrace();
		}
		return list;
		
	}
	public boolean queryDocumentByAcronyms(String acronyms,Integer reportId) throws Exception{
		boolean result=false;
		String sql=" from DocumentsDO t where t.acronyms='"+acronyms+"' and t.reportId="+reportId;
		List<?>list=this.getHibernateTemplate().find(sql);
		if(list.size()>0){
			result=true;
		}
		return result;
	}
   public void addDocumentsLog(DocumentsDO document) throws Exception{
	   List<String>details=new ArrayList<String>();
	   List<String>documentDetails=new ArrayList<String>();
	   if(document.getId()==null){
		   documentDetails.add("【"+DocumentsFieldEnum.ADDNEWDOCUMENT.getValue()+"】:("+document.getAcronyms()+")"+document.getReviewed()+"--"+document.getVersionno());
	   }else{
		   DocumentsDO documentInDataBase=(DocumentsDO)this.internalGetById(document.getId());
		   if(!ObjectUtils.equals(document.getReviewed(), documentInDataBase.getReviewed())){
			   documentDetails.add("【"+DocumentsFieldEnum.UPDATEREVIEWED.getValue()+"】:由【"+documentInDataBase.getReviewed()+"】修改为：【"+document.getReviewed()+"】");
			   details.add("【"+DocumentsFieldEnum.UPDATEREVIEWED.getValue()+"】:由【"+documentInDataBase.getReviewed()+"】修改为：【"+document.getReviewed()+"】");
		   }
		   if(!ObjectUtils.equals(document.getAcronyms(), documentInDataBase.getAcronyms())){
			   documentDetails.add("【"+DocumentsFieldEnum.UPDATEACRONYMS.getValue()+"】:由【"+documentInDataBase.getAcronyms()+"】修改为：【"+document.getAcronyms()+"】");
			   details.add("【"+DocumentsFieldEnum.UPDATEACRONYMS.getValue()+"】:由【"+documentInDataBase.getAcronyms()+"】修改为：【"+document.getAcronyms()+"】");
		   }
		   if(!ObjectUtils.equals(document.getVersionno(), documentInDataBase.getVersionno())){
			   documentDetails.add("【("+document.getAcronyms()+")"+DocumentsFieldEnum.UPDATEVERSIONNO.getValue()+"】:由【"+documentInDataBase.getVersionno()+"】修改为：【"+document.getVersionno()+"】");
			   details.add("【"+DocumentsFieldEnum.UPDATEVERSIONNO.getValue()+"】:由【"+documentInDataBase.getVersionno()+"】修改为：【"+document.getVersionno()+"】");
		   }
		   if(!ObjectUtils.equals(document.getType(), documentInDataBase.getType())){
			   documentDetails.add("【("+document.getAcronyms()+")"+DocumentsFieldEnum.UPDATETYPE.getValue()+"】:由【"+documentInDataBase.getType()+"】修改为：【"+document.getType()+"】");
			   details.add("【"+DocumentsFieldEnum.UPDATETYPE.getValue()+"】:由【"+documentInDataBase.getType()+"】修改为：【"+document.getType()+"】");
		   }
		   SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		   String dbvalue=dateFormat.format(documentInDataBase.getDocdate());
		   String value=dateFormat.format(document.getDocdate());
		   if(!ObjectUtils.equals(value, dbvalue)){
			   documentDetails.add("【("+document.getAcronyms()+")"+DocumentsFieldEnum.UPDATEDATE.getValue()+"】:由【"+dbvalue+"】修改为：【"+value+"】");
			   details.add("【"+DocumentsFieldEnum.UPDATEDATE.getValue()+"】:由【"+dbvalue+"】修改为：【"+value+"】");
		   }
	   }
	   if(documentDetails.size()>0){
		   operateLogDao.addLog(document.getReportId(),EiosaLogTypeEnum.REPORT.getKey(),EiosaLogOperateTypeEnum.DOCUMENT.getKey(), JsonUtil.toJson(documentDetails)); 
	   }
	   if(details.size()>0){
		   operateLogDao.addLog(document.getId(),EiosaLogTypeEnum.DOCUMENT.getKey(),EiosaLogOperateTypeEnum.DOCUMENT.getKey(), JsonUtil.toJson(details));
	   }
   }
  
  public void delDocumentLog(DocumentsDO documentsDO) throws Exception{
	  List<String>details=new ArrayList<String>();
      details.add("【"+DocumentsFieldEnum.DELETEDOCUMENT.getValue()+"】:("+documentsDO.getAcronyms()+")"+documentsDO.getReviewed()+"--"+documentsDO.getVersionno());
	   operateLogDao.addLog(documentsDO.getReportId(),EiosaLogTypeEnum.REPORT.getKey(),EiosaLogOperateTypeEnum.DOCUMENT.getKey(), JsonUtil.toJson(details));
  }
  
  public List checkDocumentIosaDao(String documentid, String sectionname) throws Exception{ 
    String sql;
    if(sectionname!=null){
      sql="select eis.sectionname, eii.no from e_iosa_chapter eic "+
          "left join e_iosa_isarp eii "+
          "on eic.isarpid = eii.id "+
          "left join e_iosa_section eis "+
          "on eii.sectionid = eis.id "+
          "where eii.libtype = 2 and eic.documentid = "+documentid+" and eis.sectionname = '"+sectionname+"' "+
          "group by eii.no,eis.sectionname,eii.no_sort "+
          "order by eis.sectionname,eii.no_sort";
    }else{
      sql="select eis.sectionname, eii.no from e_iosa_chapter eic "+
          "left join e_iosa_isarp eii "+
          "on eic.isarpid = eii.id "+
          "left join e_iosa_section eis "+
          "on eii.sectionid = eis.id "+
          "where eii.libtype = 2 and eic.documentid = "+documentid+" "+
          "group by eii.no,eis.sectionname,eii.no_sort "+
          "order by eis.sectionname,eii.no_sort";
    }
   
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query=null;
    query=session.createSQLQuery((sql).toString());
    List<Object[]> list=query.list();
    
    return list;    
  }
 
   public OperateLogDao getOperateLogDao() {
	return operateLogDao;
   }

    public void setOperateLogDao(OperateLogDao operateLogDao) {
	this.operateLogDao = operateLogDao;
   }

	public ChapterDao getChapterDao() {
		return chapterDao;
	}

	public void setChapterDao(ChapterDao chapterDao) {
		this.chapterDao = chapterDao;
	}
    
   
}