package com.usky.sms.losa.activity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.jsoup.helper.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class ObserverInfoDao extends BaseDao<ObserverInfoDO>{
	@Autowired
	private UserDao userDao;
	
	public ObserverInfoDao(){
		super(ObserverInfoDO.class);
	}
	
	public List<Map<String,Object>> queryObserverInfo(){
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql = "select a.userid,nvl(a.observer_no,'L'||a.observer_aircraft_type||a.observer_fwx_id)"
							+" from l_observer_info a where a.deleted = 0";
			SQLQuery query0 = session0.createSQLQuery(sql);
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("userId", obj[0]);
	        		 map.put("observerNumber", obj[1]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	//根据用户id，查询观察员编码
	public String queryObserverNumberById(String userId){
		String observerNumber = "";
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql = "select nvl(a.observer_no,'L'||a.observer_aircraft_type||a.observer_fwx_id)"
							+" from l_observer_info a where a.deleted = 0 and a.userid="+userId;
			SQLQuery query0 = session0.createSQLQuery(sql);
			Object o = query0.uniqueResult();
			observerNumber = (String)o;
		}catch(Exception e){
			e.printStackTrace();
		}
		return observerNumber;
	}
	//观察员信息维护页面，查询所有观察员信息
	public Map<String,Object> queryObserverInfos(Map<String,Object> paramMap,ObserverQueryForm observerQueryForm) throws Exception{
		Map<String,Object> result = new HashMap<String,Object>();
		try{
			int count = 0;
			List<Map<String,Object>> resultList = new ArrayList<Map<String,Object>>();	
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			Integer start = Integer.valueOf((String)paramMap.get("start"));
			Integer length = Integer.valueOf((String)paramMap.get("length"));
			String observerInfoId = (String) paramMap.get("observerInfoId");
			String sql="select max(tt.id),max(tt.deleted),max(tt.observer_no),max(tt.observer_name),max(tt.observer_org),max(tt.observer_post),"
					   +" max(tt.observer_phone),max(tt.observer_idcode),max(tt.observer_aircraft_type),max(tt.observer_fwx_id),tt.userid,max(b.\"name\"),"
					   +" max(tt.resp_name),to_char(wm_concat(l.dict_name)) from (SELECT a.id,a.deleted,a.observer_no,a.observer_name,a.observer_org,a.observer_post,"
		               +" a.observer_phone,a.observer_idcode,a.observer_aircraft_type,a.observer_fwx_id, a.userid,a.resp_name,REGEXP_SUBSTR(a.resp_name, '[^,]+', 1, L) AS respName"
			           +" FROM l_observer_info a,(SELECT LEVEL L FROM DUAL CONNECT BY LEVEL <= 10)WHERE L(+) <=LENGTH(a.resp_name) - LENGTH(REPLACE(a.resp_name, ',')) + 1) tt"               
					   +" left join l_dict_entry l on l.dict_type = 'losa_role' and tt.respname = l.dict_code left join t_organization b on tt.observer_org = b.id"
					   +" where 1 = 1 ";
			Map<String,String> map1 = new HashMap<String,String>();
			if(!StringUtil.isBlank(observerInfoId)){
				sql += " and tt.id = "+observerInfoId;
			}
			if(!StringUtil.isBlank(observerQueryForm.getObserverName())){
				sql += " and tt.observer_name like :observerName";
				map1.put("observerName", observerQueryForm.getObserverName());
			}
			if(!StringUtil.isBlank(observerQueryForm.getRespName())){
				sql += " and tt.resp_name like :respName";
				map1.put("respName", observerQueryForm.getRespName());
			}
			if(!StringUtil.isBlank(observerQueryForm.getObserverOrg())){
				sql += " and  b.\"name\" like :observerOrg";
				map1.put("observerOrg", observerQueryForm.getObserverOrg());
			}
			if(!StringUtil.isBlank(observerQueryForm.getObserverPost())){
				sql += " and tt.observer_post like :observerPost";
				map1.put("observerPost", observerQueryForm.getObserverPost());
			}
			if(!StringUtil.isBlank(observerQueryForm.getObserverAircraftType())){
				sql += " and tt.observer_aircraft_type like :observerAircraftType";
				map1.put("observerAircraftType", observerQueryForm.getObserverAircraftType());
			}
			if(!StringUtil.isBlank(observerQueryForm.getObserverFXWID())){
				sql += " and tt.observer_fwx_id like :observerFXWID";
				map1.put("observerFXWID", observerQueryForm.getObserverFXWID());
			}
			if(!StringUtil.isBlank(observerQueryForm.getObserverStatus())){
				sql += " and tt.deleted= :observerStatus";
				map1.put("observerStatus", observerQueryForm.getObserverStatus());
			}
			//查询用户职责
			UserDO user = UserContext.getUser();
			ObserverInfoDO observerInfo=getOrgName(user.getFullname());			
			String auth = getUserAuth(user.getId());
			if(auth.equals("子公司管理员")||auth.equals("子公司管理员+观察员")){
				//子公司管理员查看所在子公司数据
				sql+=" and tt.observer_org="+observerInfo.getObserverOrg()+"";
			}else{
				sql+=" and 1=1";
			}
			sql += " group by tt.userid,tt.observer_name order by tt.observer_name ";
			SQLQuery query0 = session0.createSQLQuery(sql);
			Iterator<Map.Entry<String, String>> entries = map1.entrySet().iterator();  
			while (entries.hasNext()) {  
			    Map.Entry<String, String> entry = entries.next();  
			    if(entry.getKey().equals("observerStatus")){
			    	query0.setParameter(entry.getKey(), entry.getValue());
			    }else{
			    	query0.setParameter(entry.getKey(), "%"+entry.getValue()+"%");
			    }
			    
			} 
			List<?> list= new ArrayList<Object[]>();
			count = query0.list().size();
			if(start!=null&&length!=null){
		        query0.setFirstResult(start);
			    query0.setMaxResults(length);
		    } 
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("id", obj[0]);
	        		 map.put("deleted", obj[1]);
	        		 map.put("observerNo", obj[2]);
	        		 map.put("observerName", obj[3]);
	        		 map.put("observerOrg", obj[4]);
	        		 map.put("observerPost", obj[5]);
	        		 map.put("observerPhone", obj[6]);	 
	        		 map.put("observerIDCode",obj[7]);
	        		 map.put("observerAircraftType",obj[8]);
	        		 map.put("observerFXWID", obj[9]);
	        		 map.put("userId", obj[10]);
	        		 map.put("observerOrgName", obj[11]);
	        		 map.put("respName", obj[12]);
	        		 map.put("respCode", obj[13]);
	        		 resultList.add(map);
	        	}
	        }
			result.put("all", count);
		    result.put("data", resultList);
		    result.put("success", true);
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
	//根据观察员名字查询信息ID
		public ObserverInfoDO getOrgName(String userName) {
			String sql=" from ObserverInfoDO t where t.deleted=false and t.observerName= ?";
			List<ObserverInfoDO> docList = this.getHibernateTemplate().find(sql, userName);
			ObserverInfoDO observerInfoDO = null;
			if (CollectionUtils.isNotEmpty(docList)) observerInfoDO = docList.get(0);
			return observerInfoDO;
		}
	//从用户里面选择观察员
	public Map<String,Object> queryObservers() throws Exception{
		Map<String,Object> result = new HashMap<String,Object>();
		try{
			List<Map<String,Object>> resultList = new ArrayList<Map<String,Object>>();	
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select a.id,a.fullname,a.email from t_user a where a.deleted = 0";
			SQLQuery query0 = session0.createSQLQuery(sql);
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("id", obj[0]);
	        		 map.put("userName", obj[1]);
	        		 map.put("email", obj[2]);
	        		 resultList.add(map);
	        	}
	        }
		    result.put("data", resultList);
		    result.put("success", true);
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	//保存观察员信息
	public Map<String,Object> saveObserverInfo(ObserverInfoDO observer) throws Exception{
		Map<String,Object> result = new HashMap<String,Object>();
		UserDO user = UserContext.getUser();
		try{
			if (observer.getId() != null) {
				Integer userId = observer.getUserId();
		    	if(!isObserverExistForMod(userId,observer.getId())){
		    		result.put("success", false);
		    		result.put("message","不能重复维护观察员！");
		    		return result;
		    	}
				ObserverInfoDO objdo = this.getHibernateTemplate().get(ObserverInfoDO.class, Integer.valueOf(observer.getId()));
				observer.setCreated(objdo.getCreated());
			    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			    session.clear();
			    String observerNo = "L"+observer.getObserverAircraftType()+observer.getObserverFXWID();
			    observer.setObserverNo(observerNo);
			    String observerName = userDao.internalGetById(userId).getFullname();
			    observer.setObserverName(observerName);
			    observer.setLastUpdate();
			    session.update(observer);
			    session.flush();
			    result.put("id", observer.getId());
		    } else {
		    	Integer userId = observer.getUserId();
		    	if(!isObserverExist(userId)){
		    		result.put("success", false);
		    		result.put("message","不能重复维护观察员！");
		    		return result;
		    	}
		        String observerName = userDao.internalGetById(userId).getFullname();
		        observer.setCreator(user.getId());
		        observer.setLastModifier(user.getId());
		        String observerNo = "L"+observer.getObserverAircraftType()+observer.getObserverFXWID();
		        observer.setObserverNo(observerNo);
		        observer.setObserverName(observerName);
		        Serializable id = this.internalSave(observer);
		        result.put("id", id);
		    }
		    result.put("success", true);
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	public Boolean isObserverExist(Integer userId) throws Exception{
		Boolean flag = true;
		try{
			String sql="from ObserverInfoDO t where t.userId="+userId;
			@SuppressWarnings("unchecked")
			List<Object> list = this.getHibernateTemplate().find(sql);
			if(list.size()>0){
				flag = false;
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return flag;
	}
	
	public Boolean isObserverExistForMod(Integer userId,Integer id) throws Exception{
		Boolean flag = true;
		try{
			String sql="from ObserverInfoDO t where t.userId="+userId+" and t.id != "+id;
			@SuppressWarnings("unchecked")
			List<Object> list = this.getHibernateTemplate().find(sql);
			if(list.size()>0){
				flag = false;
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return flag;
	}
	
	//查询LOSA人员所属机构
	public Map<String, Object> queryObserverOrg() throws Exception{
		Map<String, Object> result = new HashMap<String, Object>();
		try{
			List<Map<String,Object>> resultList = new ArrayList<Map<String,Object>>();	
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select a.id,a.\"name\" from t_organization a where a.olevel = '2'"
					+" and (a.deptcode like 'EA%' or a.id = 10) and a.deleted = 0 and a.\"unit\" is not null";
			//查询用户职责
			UserDO user = UserContext.getUser();
			ObserverInfoDO observerInfo=getOrgName(user.getFullname());			
			String auth = getUserAuth(user.getId());
			if(auth.equals("子公司管理员")||auth.equals("子公司管理员+观察员")){
				//子公司管理员查看所在子公司数据
				sql+=" and a.id="+observerInfo.getObserverOrg()+"";
			}else{
				sql+=" and 1=1";
			}
			SQLQuery query0 = session0.createSQLQuery(sql.toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("id", obj[0]);
	        		 map.put("unitName", obj[1]);
	        		 resultList.add(map);
	        	}
	        }
			result.put("data", resultList);
		    result.put("success", true);
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return result;
	}
	
	public UserDao getUserDao() {
		return userDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
}
