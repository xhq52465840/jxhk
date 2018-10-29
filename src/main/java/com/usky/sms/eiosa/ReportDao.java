package com.usky.sms.eiosa;

import java.lang.reflect.Field;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;

import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.core.BaseDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuItem;
import com.usky.sms.permission.IPermission;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserGroupDao;


public class ReportDao extends BaseDao<EiosaReportDO> implements IPermission{

	protected ReportDao(){
		super(EiosaReportDO.class);
	}
	@Autowired
	private MenuCache menuCache;
	@Autowired
	private DictionaryDao dictionaryDao;
	@Autowired
	private UserGroupDao userGroupDao;
	
	
	public EiosaReportDO get(Integer reportId) {
		EiosaReportDO eiosaReportDo =this.getHibernateTemplate().get(EiosaReportDO.class, reportId);
			
		return eiosaReportDo;
    }	
	
	
	//report查询
	public List<Map<String,Object>> queryReport(ReportQueryForm reportQueryForm,String sortby,String sortorders) throws Exception{
		List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
		  List<?>list=new ArrayList<Object>();
		  try{  
			  Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		  	  Query query =null;
			  String sql ="select t.id,t.repNo,t.title,t.repDate,t.repStatus from e_iosa_report t where t.deleted=0 and t.libtype=2";		  
			  String sqlQaram="";
			  if (!StringUtils.isBlank(reportQueryForm.getRepNo())) {
				  sqlQaram+=" and t.id ='"+reportQueryForm.getRepNo()+"'";
			  }
			  if(!StringUtils.isBlank(reportQueryForm.getRepDate())){
				  sqlQaram+=" and t.repDate  >= to_date('"+reportQueryForm.getRepDate()+"','yyyy-MM-dd')";
			  }
			  if(!StringUtils.isBlank(reportQueryForm.getRepDateto())){
				  sqlQaram+=" and t.repDate  <= to_date('"+reportQueryForm.getRepDateto()+"','yyyy-MM-dd')";
			  }
			  if (!StringUtils.isBlank(reportQueryForm.getRepStatus())) {
				  sqlQaram+=" and t.repStatus ='"+reportQueryForm.getRepStatus()+"'";
			  }
			  if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
				  sqlQaram+=" order by "+sortby+" "+sortorders+"";
	         }else{
	        	 sqlQaram+="  order by t.id ";		
	         }
			  query = session.createSQLQuery((sql+sqlQaram).toString());
			  list = query.list();
			  if(list!=null){
				  for(int i=0;i<list.size();i++){
					  Map<String,Object>map=new HashMap<String,Object>();
					  Object[] obj = (Object[]) list.get(i);
					  map.put("id", obj[0]);
					  map.put("repNo", obj[1]);
					  map.put("title", obj[2]);
					  map.put("repDate", obj[3]);
					  map.put("status", obj[4]);
					  result.add(map);
				  }
				  
			  }
			  
		  }catch(Exception e){
			  e.printStackTrace();
		  }
		  return result;
	  }
  public List queryIsarpDocument(String reportId){
    String sql="select eic.isarpid, eidl.REVIEWED, eidl.acronyms, eidl.versionno, '(' || eidl.acronyms || ')' || eic.dec as documentation " +
                     "from e_iosa_document_libary eidl " +
                     "left join e_iosa_chapter eic " +
                     "on eidl.id = eic.documentid where eidl.deleted = 0 and eidl.reportid = ? " +
                     "order by eic.isarpid";
   
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query = null;
    query = session.createSQLQuery((sql).toString());
    query.setString(0, reportId);
    List<Object[]> list = query.list();

    return list;  
  }
	
	 public List queryIsarpText(String reportId, String section){
	    String sql="select to_char(wm_concat(eii.text)), eir.repversions from E_IOSA_ISARP eii  "+
                       "left join E_IOSA_SECTION eis "+
                       "on eii.sectionid = eis.id "+
                       "left join E_IOSA_REPORT eir "+
                       "on eis.reportid = eir.id "+
                       "where length(eii.no_sort) = 3 and eii.libtype = 2 "+
                       "and eis.sectionname = ? and eis.reportid = ? "+
                       "group by eir.repversions ";
	   
	    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
	    session.beginTransaction().commit();
	    SQLQuery query = null;
	    query = session.createSQLQuery((sql).toString());
	    query.setString(0, section);
	    query.setString(1, reportId);
	    List<Object[]> list = query.list();

	    return list;  
	  }
	
	public List queryIsarpAssessmentList(String reportId, String section){
    String sql="select SUBSTR(t.no,3,1)||'.'||eii.text as no, t.Finding, t.Observation, t.NA from "+
                     "(select eii.sectionid, SUBSTR(eii.no_sort,0,3) as no,  "+
                     "sum(CASE  "+
                     "WHEN eii.assessment>1 and eii.assessment<5 THEN 1  "+
                     "ELSE 0  "+
                     "END) as Finding, "+
                     "sum(CASE  "+
                     "WHEN eii.assessment>4 and eii.assessment<8 THEN 1  "+
                     "ELSE 0  "+
                     "END) as Observation, "+
                     "sum(CASE  "+
                     "WHEN eii.assessment>7 THEN 1  "+
                     "ELSE 0  "+
                     "END) as NA  "+
                     "from e_iosa_isarp eii  "+
                     "where eii.libtype = 2  "+
                     "group by eii.sectionid, SUBSTR(eii.no_sort,0,3))t  "+
                     "join E_IOSA_SECTION eis on t.sectionid = eis.id  "+
                     "join e_iosa_isarp eii on t.no = eii.no_sort and t.sectionid = eii.sectionid  "+
                     "where eis.sectionname = ? and eis.reportid = ?  "+
                     "order by t.no ";
   
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query = null;
    query = session.createSQLQuery((sql).toString());
    query.setString(0, section);
    query.setString(1, reportId);
    List<Object[]> list = query.list();

    return list;  
  }
	
  public List queryAuditorRecordList(String reportId){
    String sql="select aa.spell as username, to_char(wm_concat(distinct(eis.sectionname))) as sectionname "+  
               "from a_auditor aa "+
               "left join e_iosa_auditor_action eiaa on aa.id = eiaa.auditorid "+
               "left join e_iosa_isarp_action eiia on eiaa.actionid = eiia.id "+
               "left join e_iosa_isarp eii on eiia.isarpid = eii.id "+
               "left join e_iosa_section eis on eii.sectionid = eis.id "+
               "where eiia.libtype = 2 and eis.reportId = ? "+
               "group by aa.user_id,aa.spell ";
   
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query=null;
    query=session.createSQLQuery((sql).toString());
    query.setString(0, reportId);
    List<Object[]> list=query.list();
    
    return list;    
  }
	
  public List queryDocumentReferencesList(String reportId, String section){
    String sql;
    if(section.isEmpty()){
      sql="select * from VW_DOCUMENTTOISARP_REPORT t where reportId = "+reportId;
    }else{
      sql="select * from VW_DOCUMENTTOISARP_REPORT t where reportId = "+reportId+" and "+section+" = 1";
    }

    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query=null;
    query=session.createSQLQuery((sql).toString());
    List<Object[]> list=query.list();
    
    return list;    
  }
  
  public List queryConformanceReportList(String reportId){
    String sql="select * from VW_CONFORMANCE_REPORT t where reportId = ? ";
   
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query=null;
    query=session.createSQLQuery((sql).toString());
    query.setString(0, reportId);
    List<Object[]> list=query.list();
    
    return list;    
  }
  
  public List queryIsmWordList(String sectionname, String reportId){
    String sql="select eii.no_sort, eii.text, nvl(eia.id,0), nvl(eii.comments,' '), "+
                     "nvl(eiia.status,0), nvl(eiia.typename,' '), nvl(eiia.title,' '), nvl(eii.guidance,' '), nvl(eii.no,' '), "+
                     "'Section '||eis.sectionno||eis.sectionfullname, eis.applicability, eis.guidance "+
                     "from e_iosa_isarp eii left join e_iosa_section eis on eii.sectionid = eis.id "+
                     "left join e_iosa_assessment eia on eii.assessment = eia.id  "+
                     "left join e_iosa_isarp_action eiia on eii.id = eiia.isarpid  "+
                     "where eii.deleted=0 and eii.libtype = 2 and eis.sectionname = ? and eis.reportId = ? "+
                     "order by eii.no_sort";
   
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query=null;
    query=session.createSQLQuery((sql).toString());
    query.setString(0, sectionname);
    query.setString(1, reportId);
    List<Object[]> list=query.list();
    
    return list;    
  }
  
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		EiosaReportDO file = (EiosaReportDO) obj;
		if ("repDate".equals(fieldName)) {
			SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd");
			map.put("repDate", dateformat.format(file.getRepDate()));
		}else {
			super.setField(map, obj, claz, multiple, field);
		}
		
	  } 
	
	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
		List<DictionaryDO> dics = dictionaryDao.getListByType("EIOSA审计角色");
		Map<String, Object> roleMap = new HashMap<String, Object>();
		for (DictionaryDO dic : dics) {
			roleMap.put(dic.getKey(), dic.getName());
		}
		// EIOSA审计员、EIOSA审计主管、EIOSA审计管理员
		if ("审计管理/E-IOSA内审".equals(path)) {
			return userGroupDao.isUserGroups(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.EIOSA_ADMIN.getKey()),(String) roleMap.get(EnumAuditRole.EIOSA_AUDITOR.getKey()), (String) roleMap.get(EnumAuditRole.EIOSA_MANAGER.getKey()));
		} 
		return false;
	}

	public MenuCache getMenuCache() {
		return menuCache;
	}

	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}

	public DictionaryDao getDictionaryDao() {
		return dictionaryDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public UserGroupDao getUserGroupDao() {
		return userGroupDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
	
}
