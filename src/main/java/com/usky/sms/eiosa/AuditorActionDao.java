package com.usky.sms.eiosa;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;

import com.usky.sms.core.BaseDao;

public class AuditorActionDao extends BaseDao<AuditorActionDO>{
	public AuditorActionDao(){
		super(AuditorActionDO.class);
	}
	public Map queryAuditors(String reportId,String type,String sectionId,String auditorName,Integer start,Integer length,String sortby,String sortorders ) throws Exception{
		List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
		int count = 0;
		Map resultmap = new HashMap<>();
		try{
      String sql = "";
      Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();

      List<?> list = new ArrayList<Object[]>();
      if (type.equals("audited")) {
				sql="select tu.username, 'Auditor', tt.recruitment, tt.sectionname, tt.spell ,tu.id"
						+" from (select temp.user_id,temp.recruitment,to_char(wm_concat(distinct(temp.sectionname))) as sectionname,temp.spell"
						+" from (select aa.user_id as user_id,aa.recruitment,eis.sectionname,aa.spell from a_auditor aa"
						+" left join e_iosa_auditor_action eiaa on aa.id = eiaa.auditorid"
				        +" left join e_iosa_isarp_action eiia on eiaa.actionid = eiia.id"
				        +" left join e_iosa_isarp eii on eiia.isarpid = eii.id"
				        +" left join e_iosa_section eis on eii.sectionid = eis.id and eis.reportid ="+reportId;
				if(!StringUtils.isBlank(sectionId)){
					sql+=" and eis.id ='"+sectionId+"'";
				 }
				sql+=" where eiia.libtype = 2 and eis.sectionname is not null"
				        + "  union"
				        + " select aa.user_id as user_id,aa.recruitment,eis.sectionname,aa.spell"
				        + " from e_iosa_operation_log a left join e_iosa_isarp eii on a.targetid = eii.id"
				        + " left join e_iosa_section eis on eii.sectionid = eis.id and eis.reportid ="+reportId;
				if(!StringUtils.isBlank(sectionId)){
					sql+=" and eis.id ='"+sectionId+"'";
				 }
				 sql+=" left join a_auditor aa on aa.user_id = a.creator where a.type = 'isarp' and aa.user_id <> 1"
				        + ") temp group by user_id, recruitment, spell) tt"
				        +" inner join t_user tu on tt.user_id = tu.id";
				String sqlQaram="";
				if(!StringUtils.isBlank(auditorName)){
					 sqlQaram+=" and upper(tt.spell) like upper('%"+auditorName+"%')";
				 }
				
				if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
				  sqlQaram+=" order by "+sortby+" "+sortorders+" ";
        }
				 SQLQuery query0 = session0.createSQLQuery((sql+sqlQaram).toString());
				 count = query0.list().size(); 
				 query0.setFirstResult(start);
				 query0.setMaxResults(length);
				 list= query0.list();
				 if(list.size()>0){
			        	for(int i=0;i<list.size();i++){
			        		 Object[] obj = (Object[])list.get(i);
			        		 Map<String,Object>map=new HashMap<String,Object>();
			        		 map.put("name", obj[4]);
			        		 map.put("id", obj[0]);
			        		 map.put("title", obj[1]);
			        		 if(null == obj[2]){
			        			 map.put("contractedOrInternal", "");
			        		 }else{
			        			 map.put("contractedOrInternal", obj[2]);
			        		 }			        		 
			        		 map.put("disciplines", obj[3]);
			        		 map.put("userId", obj[5]);
			        		
			        		 result.add(map);
			        	}
			        }
      } else if (type.equals("auditing")) {
	      sql=" select t1.id, t2.fullname ,t1.spell from  a_auditor t1 left join t_user t2 on t1.user_id=t2.id where t1.user_type like'%EIOSA审计员%'"
	                    + " and (t2.fullname like '%"+auditorName+"%' or t1.spell like '%"+auditorName+"%') and t1.deleted=0 order by t1.spell";
        SQLQuery query0 = session0.createSQLQuery((sql).toString());
        list = query0.list();
        if (list.size() > 0) {
          for (int i = 0; i < list.size(); i++) {
            Object[] obj = (Object[]) list.get(i);
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("id", obj[0]);
            map.put("fullname", obj[1]);
            map.put("username", obj[2]);
            result.add(map);
          }
        }
      }
	        
		}catch(Exception e){
			e.printStackTrace();
		}
		resultmap.put("all", count);
		resultmap.put("result", result);
		return resultmap;
	}
	
	 public List<Map<String,Object>> queryAuditors(String reportId,String type,String sectionId,String auditorName) throws Exception{
	    List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
	    try{
	      String sql="";
	      Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
	         
	          List<?> list= new ArrayList<Object[]>();
	      if(type.equals("audited")){
	        sql="select tu.username, 'Auditor', tt.recruitment, tt.sectionname, tt.spell ,tu.id"
	            +" from (select temp.user_id,temp.recruitment,to_char(wm_concat(distinct(temp.sectionname))) as sectionname,temp.spell"
	            +" from (select aa.user_id as user_id,aa.recruitment,eis.sectionname,aa.spell from a_auditor aa"
	            +" left join e_iosa_auditor_action eiaa on aa.id = eiaa.auditorid"
	                +" left join e_iosa_isarp_action eiia on eiaa.actionid = eiia.id"
	                +" left join e_iosa_isarp eii on eiia.isarpid = eii.id"
	                +" left join e_iosa_section eis on eii.sectionid = eis.id and eis.reportid ="+reportId;
	        if(!StringUtils.isBlank(sectionId)){
	          sql+=" and eis.id ='"+sectionId+"'";
	         }
	        sql+=" where eiia.libtype = 2 and eis.sectionname is not null"
	                + "  union"
	                + " select aa.user_id as user_id,aa.recruitment,eis.sectionname,aa.spell"
	                + " from e_iosa_operation_log a left join e_iosa_isarp eii on a.targetid = eii.id"
	                + " left join e_iosa_section eis on eii.sectionid = eis.id and eis.reportid ="+reportId;
	        if(!StringUtils.isBlank(sectionId)){
	          sql+=" and eis.id ='"+sectionId+"'";
	         }
	         sql+=" left join a_auditor aa on aa.user_id = a.creator where a.type = 'isarp' and aa.user_id <> 1"
	                + ") temp group by user_id, recruitment, spell) tt"
	                +" inner join t_user tu on tt.user_id = tu.id";
	        String sqlQaram="";
	        if(!StringUtils.isBlank(auditorName)){
	           sqlQaram+=" and tu.username like'%"+auditorName+"%'";
	         }
	        sqlQaram+=" order by tt.spell ";
	         SQLQuery query0 = session0.createSQLQuery((sql+sqlQaram).toString());
	         list= query0.list();
	         if(list.size()>0){
	                for(int i=0;i<list.size();i++){
	                   Object[] obj = (Object[])list.get(i);
	                   Map<String,Object>map=new HashMap<String,Object>();
	                   map.put("name", obj[4]);
	                   map.put("id", obj[0]);
	                   map.put("title", obj[1]);
	                   if(null == obj[2]){
	                     map.put("contractedOrInternal", "");
	                   }else{
	                     map.put("contractedOrInternal", obj[2]);
	                   }                   
	                   map.put("disciplines", obj[3]);
	                   map.put("userId", obj[5]);
	                  
	                   result.add(map);
	                }
	              }
	      }else if(type.equals("auditing")){
	        sql=" select t1.id, t2.fullname ,t1.spell from  a_auditor t1 left join t_user t2 on t1.user_id=t2.id where t1.user_type='EIOSA审计员'"
	                  + " and (t2.fullname like '%"+auditorName+"%' or t1.spell like '%"+auditorName+"%') and t1.deleted=0 order by t1.spell";
	         SQLQuery query0 = session0.createSQLQuery((sql).toString());
	         list= query0.list();
	         if(list.size()>0){
	                for(int i=0;i<list.size();i++){
	                   Object[] obj = (Object[])list.get(i);
	                   Map<String,Object>map=new HashMap<String,Object>();
	                   map.put("id", obj[0]);
	                   map.put("fullname", obj[1]);
	                   map.put("username", obj[2]);
	                   result.add(map);
	                }
	              }
	      }
           
	    }catch(Exception e){
	      e.printStackTrace();
	    }
	    return result;
	  }
	
	public List<AuditorActionDO> queryByActionId(Integer actionId) throws Exception{
		String sql=" from AuditorActionDO t where t.actionId.id= ? ";
		List<AuditorActionDO>list=this.getHibernateTemplate().find(sql, actionId.intValue());
		return list;
	}
}
