package com.usky.sms.eiosa;

import java.io.OutputStream;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.comm.JsonUtil;
import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.eiosa.user.EiosaUserGroupDao;
import com.usky.sms.section.SectionDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;

import net.sf.jasperreports.engine.util.ObjectUtils;



public class SectionDao extends BaseDao<IosaSectionDO>{

	@Autowired
    private OperateLogDao operateLogDao;
	public SectionDao(){
		super(IosaSectionDO.class);
	};
	private UserDao userDao;
	private AuditorDao auditorDao;
	private DictionaryDao dictionaryDao;
	private EiosaUserGroupDao eiosaUserGroupDao;
	
  public List queryReportIdDao(){
    String sql="select t.id from E_IOSA_REPORT t where t.libtype = 2 order by t.repdate desc";
   
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query=null;
    query=session.createSQLQuery((sql).toString());
    List<Object[]> list=query.list();
    
    return list;    
  }
  
	public List<Map<String,Object>>queryUser(String username,String fullname) throws Exception {
		List<Map<String,Object>>list=new ArrayList<Map<String,Object>>();
		try{			String sql="select t.id,t.username,t.fullname from t_user t where lower(t.username) like "
					+"lower('"+username+"%') or t.fullname like '%"+fullname+"%' and t1.deleted=0";
			 Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
	    	 SQLQuery query = session.createSQLQuery((sql).toString());
			 List<Object[]> result=query.list();
			 for(int i=0;i<result.size();i++){
				 Object[] obj=result.get(i);
				 Map<String,Object>map=new HashMap<String,Object>();
				 map.put("id", obj[0]);
				 map.put("username", obj[2]);
				// map.put("fullname", obj[2]);
				 list.add(map);
			 }
		}catch(Exception e){
			e.printStackTrace();
		}
		return list;
	}
	

	public List<Map<String,Object>> queryIsarps(String reportId,String sortby,String sortorders,IsarpsQueryForm isarpsQueryForm) throws Exception {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:MM:SS");
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query=null;
		//先查出所有的审计员
		String auditor="select  t1.id, t2.fullname,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '客舱服务CAB') then 1 else 0 end as CAB,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '地面保障GRH') then 1 else 0 end as GRH,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '货物运输CGO') then 1 else 0 end as CGO,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '运行控制DSP') then 1 else 0 end as DSP,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '飞行运行FLT') then 1 else 0 end as FLT,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '机务维修MNT') then 1 else 0 end as MNT,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '组织管理ORG') then 1 else 0 end as ORG,"
	                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '安全保卫SEC') then 1 else 0 end as SEC"
	                   +" from a_auditor t1 left join t_user t2 on t1.user_id=t2.id where t1.deleted = 0 and t2.deleted = 0 and t1.user_type like'%EIOSA审计员%'";
		query=session.createSQLQuery((auditor).toString());
		List<Object[]> queryList=query.list();
		List<DealerBySectionDO> auditorList=new ArrayList<DealerBySectionDO>();
		List<?>list=new ArrayList<Object>();

		String sql="select t7.sectionName,  t1.no, t1.text, t11.code_name, t1.id as isarpid,  t3.dealerid, t4.type, "
				+" t7.reportId,t7.CREATED,t7.libtype,t7.CHIEFAUDITOR ,"
				+ " t7.id, t1.levels, t3.id as taskId, t4.id as assessmentId,t4.text as assessText ,t21.id as userId, vw.ISARP_NUM, vw.isarp_count,  vw.total_num, vw.complete_num"
		+ " from e_iosa_isarp t1 "
		+ " left join e_iosa_assessment t4 on t1.assessment=t4.id "
		+"  left join e_iosa_section t7 on t7.id=t1.sectionId "
		+ "left join e_iosa_section_task t3  on t1.id=t3.targetId "
		+" left join a_auditor t20 on t3.dealerid=t20.id "
		+" left join t_user t21 on t20.user_id=t21.id "
		+" left join e_iosa_code t11 on t1.status=t11.id "
		+" left join vw_isarp_count vw on t1.no=vw.level_name and t1.sectionid=vw.sectionid "
		+ " where t1.deleted=0 and t1.libType='2' and  t7.reportId="+reportId;

		String sqlQaram="";
		if(!StringUtils.isBlank(isarpsQueryForm.getSectionId())){
             sqlQaram+=" and t1.sectionId ='"+isarpsQueryForm.getSectionId()+"'";
		}
		if(!StringUtils.isBlank(isarpsQueryForm.getIsarpNo())){
			String[] isarpString=isarpsQueryForm.getIsarpNo().split(",");
			
			for(int i=0;i<isarpString.length;i++){
				if(i==0 && i!=isarpString.length-1){
					if(isarpString[i].length()==3){//第一层
						String max=isarpString[i]+"999999F";
						sqlQaram+=" and ((t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"')";
					}else if(isarpString[i].length()==6)
					    {//第二层
						String max=isarpString[i]+"999F";
						sqlQaram+=" and ((t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"')";
					}else{
						sqlQaram+=" and ( t1.no_sort ='"+isarpString[i]+"'";
					}
				}else if(i==0 && i==isarpString.length-1){
					if(isarpString[i].length()==3){//第一层
						String max=isarpString[i]+"999999F";
						sqlQaram+=" and (t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"')";
					}else if(isarpString[i].length()==6)
					    {//第二层
						String max=isarpString[i]+"999F";
						sqlQaram+=" and (t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"')";
					}else{
						sqlQaram+="  and t1.no_sort ='"+isarpString[i]+"'";
					}
				}else if(i!=0 && i==isarpString.length-1){
					if(isarpString[i].length()==3){//第一层
						String max=isarpString[i]+"999999F";
						sqlQaram+=" or( t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"'))";
					}else if(isarpString[i].length()==6)
					    {//第二层
						String max=isarpString[i]+"999F";
						sqlQaram+=" or( t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"'))";
					}else{
						sqlQaram+=" or t1.no_sort ='"+isarpString[i]+"')";
					}
				}else{
					if(isarpString[i].length()==3){//第一层
						String max=isarpString[i]+"999999F";
						sqlQaram+=" or ( t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"')";
					}else if(isarpString[i].length()==6)
					    {//第二层
						String max=isarpString[i]+"999F";
						sqlQaram+=" or ( t1.no_sort >='"+isarpString[i]+"' and t1.no_sort <='"+max+"')";
					}else{
						sqlQaram+=" or t1.no_sort ='"+isarpString[i]+"'";
					}
				}
				
				
			}
		}
		if(!StringUtils.isBlank(isarpsQueryForm.getStatus())){
		    sqlQaram+=" and t11.id = '"+isarpsQueryForm.getStatus() +"'";
		}
		if(!StringUtils.isBlank(isarpsQueryForm.getConformity())){
		    sqlQaram+=" and t4.id = '"+isarpsQueryForm.getConformity() +"'";
		}
		if(!StringUtils.isBlank(isarpsQueryForm.getAssessmentType()) && isarpsQueryForm.getAssessmentType().equals("conformity")){
		    sqlQaram+=" and t4.id =1 ";
		}else if(!StringUtils.isBlank(isarpsQueryForm.getAssessmentType()) && isarpsQueryForm.getAssessmentType().equals("observation")){
			sqlQaram+=" and (t4.id =5 or t4.id=6 or t4.id=7 )";
		}else if(!StringUtils.isBlank(isarpsQueryForm.getAssessmentType()) && isarpsQueryForm.getAssessmentType().equals("finding")){
			sqlQaram+=" and (t4.id =2 or t4.id=3 or t4.id=4 ) ";
		}else if(!StringUtils.isBlank(isarpsQueryForm.getAssessmentType()) && isarpsQueryForm.getAssessmentType().equals("na")){
			sqlQaram+=" and t4.id =8 ";
		}
		if(!StringUtils.isBlank(isarpsQueryForm.getShowMine()) && isarpsQueryForm.getShowMine().equals("true")){
		    sqlQaram+=" and t21.id = "+UserContext.getUserId();
		}
		if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
			  sqlQaram+=" order by "+sortby+" "+sortorders+"";
         }else{
		  sqlQaram+=" order by t1.sectionId,t1.no_sort";		
         }
		query = session.createSQLQuery((sql+sqlQaram).toString());
		list = query.list();
		List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
		String userRole=eiosaUserGroupDao.getUserEiosaRole();
		if(list.size()>0){
			for
			(int i=0;i<list.size();i++){
				Map<String,Object>map=new HashMap<String,Object>();
				Object[] obj = (Object[])list.get(i);
				
				map.put("sectionName",obj[0]);
				auditorList=changeToDealerBySectionDO(queryList);
				if(auditorList.size()>0){
					//先对审计员进行排序
					List<DealerBySectionDO>sortAuditor=ListSort(auditorList,String.valueOf(obj[0]));
					//再设置显示形式
					map.put("auditors", setDealerFormat(sortAuditor));
				}else{
					map.put("auditors",null);
				}
				map.put("no",obj[1]);
				map.put("text",obj[2]);
				map.put("status",obj[3]);
				map.put("isarpId",obj[4]);
				if(obj[5]==null){
					map.put("dealer", "");
				}else{
					map.put("dealer", obj[5]);
				}
				if(obj[6]==null){
					map.put("conformity", "");
				}else{
					map.put("conformity", obj[15]+"("+obj[6]+")");
				}
                if(obj[7]==null){
                	 map.put("descoperate","");
                }else{
                	 map.put("descoperate",obj[7]);
                }
				if(obj[8]==null){
					map.put("created","");
				}else{
					map.put("created",format.format(obj[8]));
				}
			    if(obj[9]==null){
			    	map.put("creater","");
			    }else{
			    	map.put("creater",obj[9]);
			    }
			    if(obj[10]==null){
			    	map.put("receiver","");
			    }else{
			    	map.put("receiver",obj[10]);
			    }
			    map.put("sectionId",obj[11]);
			    map.put("level",obj[12]);
			    map.put("taskId",obj[13]);
			    String isarpPercent="0";
			    String aaPercent="0";
			   // String isaPercent="0";
				DecimalFormat df1 = new DecimalFormat("0.00%");
				if(obj[17]!=null && obj[18]!=null){
					isarpPercent=df1.format(Double.valueOf(String.valueOf(obj[17]))/Double.valueOf(String.valueOf(obj[18])));
				}
				if(obj[19]!=null && obj[20]!=null){
					 if(obj[19].toString().equals("0") && obj[20].toString().equals("0")){
						 aaPercent="100%";
					 }else{
						 aaPercent=df1.format(Double.valueOf(String.valueOf(obj[20]))/Double.valueOf(String.valueOf(obj[19])));
					 }
					 
				}
				map.put("isarpCount",obj[18]);
				map.put("isarpFinish",obj[17]);
				map.put("aaCount", obj[19]);
				map.put("aaFinish", obj[20]);
				map.put("isarpPercent", isarpPercent);
				map.put("aaPercent", aaPercent);

			    //添加用户的角色
			    map.put("userrole",userRole);
				resultList.add(map);
			}
			return resultList;
		}else{
			return resultList;
		}
	
	}
	
	public List<Map<String,Object>> querySection(String reportId) throws Exception {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:MM:SS");
		
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query=null;
			//先查出所有的审计员
			String auditor="select  t1.id as id, t2.fullname as fullname,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '客舱服务CAB') then 1 else 0 end as CAB,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '地面保障GRH') then 1 else 0 end as GRH,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '货物运输CGO') then 1 else 0 end as CGO,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '运行控制DSP') then 1 else 0 end as DSP,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '飞行运行FLT') then 1 else 0 end as FLT,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '机务维修MNT') then 1 else 0 end as MNT,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '组织管理ORG') then 1 else 0 end as ORG,"
		                   +" case when t1.id in (select auditor_id from a_auditor_system t3 left join t_dictionary t4 on t3.system_id = t4.id where name = '安全保卫SEC') then 1 else 0 end as SEC"
		                   +" from a_auditor t1 left join t_user t2 on t1.user_id=t2.id where t1.deleted = 0 and t2.deleted = 0 and t1.user_type like '%EIOSA审计员%'";
			query=session.createSQLQuery((auditor).toString());
			List<Object[]> queryList=query.list();
			List<DealerBySectionDO> auditorList=new ArrayList<DealerBySectionDO>();
			String sql="select t1.sectionName, t1.startDate, t1.endDate,t1.id,t2.dealerid,t2.id as taskId , "
					+ " (select count(1) from e_iosa_isarp t3  where t3.sectionid=t1.id  and t3.assessment='1' and t3.libtype='2')as conformity,"
					+" (select count(1) from e_iosa_isarp t3  where t3.sectionid=t1.id  and t3.libtype='2' and (t3.assessment='5' or t3.assessment='6' or t3.assessment='7' ))as observation,"
					+" (select count(1) from e_iosa_isarp t3  where t3.sectionid=t1.id  and t3.libtype='2' and (t3.assessment='2' or t3.assessment='3' or t3.assessment='4' ))as finding,"
					+" (select count(1) from e_iosa_isarp t3  where t3.sectionid=t1.id  and t3.libtype='2' and t3.assessment='8')as na ,t3.id as chiefId, t3.fullname,"
					+ " (select count(1) from e_iosa_isarp t4  where t4.sectionid=t1.id and t4.libtype='2' and length(t4.no)>4 ) as isarpCount, "
					+"  (select count(1) from e_iosa_isarp t4  where t4.sectionid=t1.id and t4.libtype='2' and t4.status='5' and length(t4.no)>4 ) as isarpFinishCount,"
					+"  (select count(1) from e_iosa_isarp_action  t5 left join  e_iosa_isarp t4 on t5.isarpid=t4.id where t4.sectionid=t1.id and t4.libtype='2' ) as aaCount,"
					+"  (select count(1) from e_iosa_isarp_action  t5 left join  e_iosa_isarp t4 on t5.isarpid=t4.id where t4.sectionid=t1.id and t4.libtype='2' and ( t5.status='1' or  t4.assessment='8')) as aaFinishCount ,t3.username"
					+ " from e_iosa_section t1 left join e_iosa_section_task t2 "
					+"  on t1.id = t2.targetId  and t2.deleted=0 left join t_user t3 on t1.chiefAuditor=t3.id "
					+ " where  t1.reportId = "+reportId+" and t1.deleted=0   order by t1.id";
			
			query = session.createSQLQuery((sql).toString());
			List<?> list=query.list();
			List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
			if(list!=null){
				for(int i=0;i<list.size();i++){
					Map<String,Object>map=new HashMap<String,Object>();
					Object[] obj = (Object[])list.get(i);
					map.put("sectionName",obj[0]);
					if(obj[1]!=null){
						map.put("startDate",dateFormat.format(obj[1]));
					}else{
						map.put("startDate","");
					}
					if(obj[2]!=null){
						map.put("endDate",dateFormat.format(obj[2]));
					}else{
						map.put("endDate","");
					}
					map.put("id",obj[3]);
					map.put("dealer",obj[4]);
					map.put("taskId",obj[5]);
					map.put("conformity",obj[6]);
					map.put("observation",obj[7]);
					map.put("finding",obj[8]);
					map.put("na",obj[9]);
					
					
					
					Map<String, Object> chiefMap=new HashMap<String,Object>();
					chiefMap.put("id", obj[10]);
					chiefMap.put("fullname", obj[11]);
					chiefMap.put("username", obj[16]);
					map.put("chief", chiefMap);
					
					
					DecimalFormat df1 = new DecimalFormat("0.00%");
					
					String isarpPercent=df1.format(Double.valueOf(String.valueOf(obj[13]))/Double.valueOf(String.valueOf(obj[12])));
					String aaPercent=df1.format(Double.valueOf(String.valueOf(obj[15]))/Double.valueOf(String.valueOf(obj[14])));
					map.put("isarpCount",obj[12]);
					map.put("isarpFinish",obj[13]);
					map.put("aaCount", obj[14]);
					map.put("aaFinish", obj[15]);
					map.put("isarpPercent", isarpPercent);
					map.put("aaPercent", aaPercent);
					
					//转换objct为DealerBySectionDO
					auditorList=changeToDealerBySectionDO(queryList);
					if(auditorList.size()>0){
						//先对审计员进行排序
						List<DealerBySectionDO> sortAuditor=ListSort(auditorList,String.valueOf(obj[0]));
						//再设置显示形式
						map.put("auditors", setDealerFormat(sortAuditor));
					}else{
						map.put("auditors",null);
					}
					
					resultList.add(map);
				}
				return resultList;
			}else{
				return resultList;
			}

	
	}

	
	
	public IosaSectionDO get(Integer sectionId) {
		return this.getHibernateTemplate().get(IosaSectionDO.class, sectionId);
    }

	
	public List<IosaSectionDO> querySectionName(String reportId) throws Exception{
		String sql="from IosaSectionDO t where t.reportId="+reportId+"  order by t.id";
		@SuppressWarnings("unchecked")
		List<IosaSectionDO>list=this.getHibernateTemplate().find(sql);
		return list;
	}
	
	public IosaSectionDO querySectionNameById(Integer id) throws Exception{
		
		IosaSectionDO iosaSectionDO = this.getHibernateTemplate().get(IosaSectionDO.class, id);
		
		return iosaSectionDO;
	}
	
	//根据report和section name得到唯一的一个section对象
	public IosaSectionDO getSectionByReportAndName(Integer reportId, String name) throws Exception{
		IosaSectionDO iosaSectionDO = null;
		String sql=" from IosaSectionDO t where t.deleted=false and t.reportId= ? and t.sectionName= ?";
		List<IosaSectionDO>list=this.getHibernateTemplate().find(sql, reportId, name);
		if (CollectionUtils.isNotEmpty(list) && list.size()>0) 
			iosaSectionDO = list.get(0);
		return iosaSectionDO;
	}
	

	
	
	public boolean updateChiefAuditor(String sectionId,String userId) throws Exception {
		boolean result=false;
		try{
			Integer id=UserContext.getUserId();
			Map<String,Object>map=new HashMap<String,Object>();						
				map.put("chiefAuditor", Integer.valueOf(userId));
				map.put("last_modifier",id);
				
				this.update(Integer.valueOf(sectionId), map);
				result=true;
//		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
//		session.beginTransaction();
//		Integer id=UserContext.getUserId();
//		Date date=new Date();
//		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//		String dateString=format.format(date);
//		String sql="update IosaSectionDO t set t.chiefAuditor='"+userId+"' , t.last_modifier="+id+" ,t.lastUpdate=to_date('"+dateString+"','YYYY/MM/DD HH24:MI:SS') where t.id="+sectionId;
//		Query query = session.createQuery(sql);
//		int i=query.executeUpdate();
//		session.getTransaction().commit();
//         
//		if(i>0){
//			
//		}
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return result;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {	    
		map.put("last_modifier", UserContext.getUserId());
		try {
			addSectionLog(id, map);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	private void addSectionLog(int id,Map<String,Object> map) throws Exception{
		IosaSectionDO iosa=this.internalGetById(id);
		List<String>details=new ArrayList<String>();
		SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd");
		String key;
		
		key=SectionFieldEnum.UPDATEAUDITOR.getKey();
		if(map.containsKey(key)){
        	Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
        	Integer dbvalue=iosa.getChiefAuditor();
        	String value=String.valueOf(map.get(key));
			String fullnamedb="select fullname from t_user  where id='"+dbvalue+"'"; 
			String fullname="select fullname from t_user  where id='"+value+"'";
			SQLQuery querydb=session.createSQLQuery((fullnamedb).toString());
			SQLQuery query=session.createSQLQuery((fullname).toString());
			Object[] objectdb=querydb.list().toArray();
			String dbvalues =objectdb[0].toString();
			Object[] object=query.list().toArray();
			String values =object[0].toString();
        	if(iosa.getChiefAuditor()==null){
        		details.add("【"+SectionFieldEnum.UPDATEAUDITOR.getValue()+"】:由[]-->添加为："+values);
        	}else{
        		if(!ObjectUtils.equals(dbvalue, value)){
            		details.add("【"+SectionFieldEnum.UPDATEAUDITOR.getValue()+"】:由'" +dbvalues+"'-->修改为："+values);
            	}	
        	}
        	
        }
		 key=SectionFieldEnum.STARTDATE.getKey();
	        if(map.containsKey(key)){
	        	String value=String.valueOf(map.get(key));
	        	if(iosa.getStartDate()==null){
	        		details.add("【"+SectionFieldEnum.STARTDATE.getValue()+"】:由[]"+"-->添加为："+value);
	        	}else{
	        		String dbvalue=dateformat.format(iosa.getStartDate());
	            	if(!ObjectUtils.equals(dbvalue, value)){
	            		details.add("【"+SectionFieldEnum.STARTDATE.getValue()+"】:由'" +dbvalue+"'-->修改为："+value);
	            	}
	        	}
	        	
	        }
	        key=SectionFieldEnum.ENDDATE.getKey();
	        if(map.containsKey(key)){
	        	String value=String.valueOf(map.get(key));
	        	if(iosa.getEndDate()==null){
	        		details.add("【"+SectionFieldEnum.ENDDATE.getValue()+"】:由[]"+"-->添加为："+value);
	        	}else{
	        		String dbvalue=dateformat.format(iosa.getEndDate());
	            	if(!ObjectUtils.equals(dbvalue, value)){
	            		details.add("【"+SectionFieldEnum.ENDDATE.getValue()+"】:由'" +dbvalue+"'-->修改为："+value);
	            	}
	        	}
	        	
	        }
			  operateLogDao.addLog(iosa.getId(), EiosaLogTypeEnum.SECTION.getKey(),EiosaLogOperateTypeEnum.SECTION.getKey(), JsonUtil.toJson(details));
			  operateLogDao.addLog(iosa.getReportId(), EiosaLogTypeEnum.REPORT.getKey(),EiosaLogOperateTypeEnum.SECTION.getKey(), JsonUtil.toJson(details));
		  }
		  
	  

	//排序
	public List<DealerBySectionDO> ListSort(List<DealerBySectionDO> list,String sortName) throws Exception{
	  try{
		for(int i=0;i<list.size();i++){
			DealerBySectionDO dealer1=list.get(i);
			DealerBySectionDO temp=new DealerBySectionDO();
			 for(int j=i+1;j<list.size();j++){
				 DealerBySectionDO dealer2=list.get(j);
				 if(sortName.equals("CAB")){
					 if(dealer2.getCAB()>=dealer1.getCAB()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }else if(sortName.equals("GRH")){
					 if(dealer2.getGRH()>=dealer1.getGRH()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }else if(sortName.equals("CGO")){
					 if(dealer2.getCGO()>=dealer1.getCGO()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }else if(sortName.equals("DSP")){
					 if(dealer2.getDSP()>=dealer1.getDSP()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }else if(sortName.equals("FLT")){
					 if(dealer2.getFLT()>=dealer1.getFLT()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }else if(sortName.equals("MNT")){
					 if(dealer2.getMNT()>=dealer1.getMNT()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }else if(sortName.equals("ORG")){
					 if(dealer2.getORG()>=dealer1.getORG()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }else if(sortName.equals("SEC")){
					 if(dealer2.getSEC()>=dealer1.getSEC()){
						 temp=dealer1;
						 dealer1=dealer2;
						 dealer2=temp;
						 list.set(i, dealer1);
						 list.set(j, dealer2);
					 }
				 }
			 }
		}
		
		
	  }catch(Exception e){
		  e.printStackTrace();
	  }
	  return list;
	}
	//返回dealer 格式为 name--major格式
	public  List<Map<String,Object>> setDealerFormat(List<DealerBySectionDO>list) throws Exception{
		 List<Map<String,Object>>auditMapList=new ArrayList<Map<String,Object>>();
		try{
			for(int i=0;i<list.size();i++){
				DealerBySectionDO dealer=list.get(i);
				Map<String,Object>map=new HashMap<String,Object>();
				map.put("number", dealer.getId());
				String major="";
				if(dealer.getCAB()==1){
					major+="CAB ";
				}
				if(dealer.getCGO()==1){
					major+="CGO ";
				}
				if(dealer.getDSP()==1){
					major+="DSP ";
				}
				if(dealer.getFLT()==1){
					major+="FLT ";
				}
				if(dealer.getGRH()==1){
					major+="GRH ";
				}
				if(dealer.getMNT()==1){
					major+="MNT ";
				}
				if(dealer.getORG()==1){
					major+="ORG ";
				}
				if(dealer.getSEC()==1){
					major+="SEC";
				}
		       if(major==""){
		    	   map.put("name", dealer.getFullname());
		       }else{
		    	  // map.put("name", dealer.getFullname()+"_"+major);
		    	   map.put("name", dealer.getFullname());
		       }
		       auditMapList.add(map);
			}
			
		}catch(Exception e){
			e.printStackTrace();
		}
		return auditMapList;
	}
	//将泛型转换为DealerBySectionDO类型
	public List<DealerBySectionDO>changeToDealerBySectionDO(List<Object[]> list) throws Exception{
		List<DealerBySectionDO> result=new ArrayList<DealerBySectionDO>();
		try{
			for(int i=0;i<list.size();i++){
				
				Object[] obj=list.get(i);
				if(obj!=null){
					DealerBySectionDO deal=new DealerBySectionDO();
					deal.setId(Integer.valueOf(obj[0].toString()));
					deal.setFullname(obj[1].toString());
					deal.setCAB(Integer.valueOf(obj[2].toString()));
					deal.setGRH(Integer.valueOf(obj[3].toString()));
					deal.setCGO(Integer.valueOf(obj[4].toString()));
					deal.setDSP(Integer.valueOf(obj[5].toString()));
					deal.setFLT(Integer.valueOf(obj[6].toString()));
					deal.setMNT(Integer.valueOf(obj[7].toString()));
					deal.setORG(Integer.valueOf(obj[8].toString()));
					deal.setSEC(Integer.valueOf(obj[9].toString()));
					result.add(deal);
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	public void exportExcel(String templateFile,Map<String,Object> beans,OutputStream os) throws Exception{   
        //XLSTransformer transformer = new XLSTransformer(); 
        //ClassPathResource cpr = new ClassPathResource("d:/new.xls");   
      try {   
           //Workbook workbook=transformer.transformXLS(cpr.getInputStream(),beans);   
           //workbook.write(os);   
      } catch (Exception e) {   
            throw new RuntimeException("导出excel错误!");   
     }    
    }

	public DictionaryDao getDictionaryDao() {
		return dictionaryDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public UserDao getUserDao() {
		return userDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public AuditorDao getAuditorDao() {
		return auditorDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public EiosaUserGroupDao getEiosaUserGroupDao() {
		return eiosaUserGroupDao;
	}

	public void setEiosaUserGroupDao(EiosaUserGroupDao eiosaUserGroupDao) {
		this.eiosaUserGroupDao = eiosaUserGroupDao;
	}

	public OperateLogDao getOperateLogDao() {
		return operateLogDao;
	}

	public void setOperateLogDao(OperateLogDao operateLogDao) {
		this.operateLogDao = operateLogDao;
	}   
    

}
