package com.usky.sms.losa;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;

import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.activity.ObserverInfoDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class DictTypeDao extends BaseDao<DictTypeDO>{
	
	public DictTypeDao(){
		super(DictTypeDO.class);
	}
	
	//查询业务字典
	public List<Map<String,Object>> queryDictNames(String dictType,String filterDictCode,String versionNo) throws Exception{
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql = "select t2.dict_code,t2.dict_name "
					+ " from l_dict_type t1,l_dict_entry t2 "
					+ " where t1.type = t2.dict_type"
					+" and t1.type = '"+dictType+"' and t1.deleted=0 and t1.validity=1 "
					+ "and t2.deleted=0 and t2.validity=1 ";
			StringBuffer buffer = new StringBuffer();
			buffer.append(sql);
			if(StringUtils.isNotEmpty(versionNo)){
				buffer.append(" and t2.version_no='"+versionNo+"'");
			}
			if(filterDictCode==null || filterDictCode.equals("")){
								
			}else{
				buffer.append(" and t2.dict_code not in (");
				String[] dictCodes = filterDictCode.split(",");
		        for (int i = 0; i < dictCodes.length; i++) {
		        	buffer.append(" '"); 
		        	buffer.append(dictCodes[i]);	
		        	buffer.append("'");
		        	buffer.append(",");
		        }
		        buffer.deleteCharAt(buffer.length()-1);
		        buffer.append(")");
			}
			buffer.append(" order by t2.dict_sort");
			SQLQuery query0 = session0.createSQLQuery((buffer.toString()).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("dictCode", obj[0]);
	        		 map.put("dictName", obj[1]);	        		 
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return result;
	}
	
	
	//根据权限查询用户职责
		public List<Map<String,Object>> queryDuty(String dictType,String filterDictCode,String versionNo) throws Exception{
			List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
			
			try{
				Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
				String sql = "select t2.dict_code,t2.dict_name "
						+ " from l_dict_type t1,l_dict_entry t2 "
						+ " where t1.type = t2.dict_type"
						+" and t1.type = '"+dictType+"' and t1.deleted=0 and t1.validity=1 "
						+ "and t2.deleted=0 and t2.validity=1 ";
				StringBuffer buffer = new StringBuffer();
				buffer.append(sql);
				if(StringUtils.isNotEmpty(versionNo)){
					buffer.append(" and t2.version_no='"+versionNo+"'");
				}
				if(filterDictCode==null || filterDictCode.equals("")){
									
				}else{
					buffer.append(" and t2.dict_code not in (");
					String[] dictCodes = filterDictCode.split(",");
			        for (int i = 0; i < dictCodes.length; i++) {
			        	buffer.append(" '"); 
			        	buffer.append(dictCodes[i]);	
			        	buffer.append("'");
			        	buffer.append(",");
			        }
			        buffer.deleteCharAt(buffer.length()-1);
			        buffer.append(")");
				}
				//查询用户职责
				UserDO user = UserContext.getUser();
				String auth = getUserAuth(user.getId());
				if(auth.equals("子公司管理员")||auth.equals("子公司管理员+观察员")){
					//子公司管理员查看所在子公司数据
					buffer.append(" and (t2.dict_code='observer' or t2.dict_code='branchAdmin' )");
				}else{
					buffer.append(" and 1=1");
				}
				buffer.append(" order by t2.dict_sort");
				SQLQuery query0 = session0.createSQLQuery((buffer.toString()).toString());
				List<?> list= new ArrayList<Object[]>();
				list= query0.list();
				if(list.size()>0){
		        	for(int i=0;i<list.size();i++){
		        		 Object[] obj = (Object[])list.get(i);
		        		 Map<String,Object> map = new HashMap<String,Object>();
		        		 map.put("dictCode", obj[0]);
		        		 map.put("dictName", obj[1]);	        		 
		        		 result.add(map);
		        	}
		        }
			}catch(Exception e){
				e.printStackTrace();
			}
			
			return result;
		}
	//根据当前登录用户的user_id，判断用户的查询权限
		public String getUserAuth(Integer userId){
			try{
				Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
				String sql= "select a.resp_name from l_observer_info a where a.deleted = 0 and a.userid ="+userId;
				SQLQuery query0 = session0.createSQLQuery((sql).toString());
				String groupName = (String)query0.uniqueResult();
				if(groupName.indexOf("sysAdmin")!=-1){
					return "系统管理员";
				}else if(groupName.indexOf("branchAdmin")!=-1&&groupName.indexOf("observer")!=-1){
					return "子公司管理员+观察员";
				}else if(groupName.indexOf("branchAdmin")!=-1){
					return "子公司管理员";
				}else if(groupName.indexOf("observer")!=-1){
					return "观察员";
				}else{
					return "";
				}
			}catch(Exception e){
				e.printStackTrace();
			}
			return null;
		}
	public List<Map<String,Object>> query(){
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql = "select t2.dict_type,t2.dict_code,t2.dict_name "
					+ " from l_dict_type t1,l_dict_entry t2 "
					+ " where t1.type = t2.dict_type"
					+" and t1.deleted=0 and t1.validity=1 "
					+ "and t2.deleted=0 and t2.validity=1 ";			
			SQLQuery query0 = session0.createSQLQuery((sql).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("dictType", obj[0]);
	        		 map.put("dictCode", obj[1]);
	        		 map.put("dictName", obj[2]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	public List<Map<String,Object>> queryBranch(){
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql = "select a.\"name\",a.deptcode,a.id from t_organization a"
					+ " where a.olevel = '2' and a.deleted = 0"
					+ " and (a.parent_id = 2 or a.id = 10)"	;	
			String sqlparam = "";
			sqlparam+=" order by a.sortkey";
			SQLQuery query0 = session0.createSQLQuery((sql+sqlparam).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("name", obj[0]);
	        		 map.put("deptcode", obj[1]);
	        		 map.put("id", obj[2]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}

}
