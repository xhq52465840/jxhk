package com.usky.sms.losa.scheme;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.comm.JsonUtil;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.core.BaseDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.eiosa.DocumentsDO;
import com.usky.sms.eiosa.DocumentsFieldEnum;
import com.usky.sms.eiosa.EiosaLogOperateTypeEnum;
import com.usky.sms.eiosa.EiosaLogTypeEnum;
import com.usky.sms.eiosa.IosaSectionDO;
import com.usky.sms.eiosa.OperateLogDao;
import com.usky.sms.eiosa.SectionFieldEnum;
import com.usky.sms.losa.LosaLogOperateTypeEnum;
import com.usky.sms.losa.LosaLogTypeEnum;
import com.usky.sms.losa.LosaOperateLogDao;
import com.usky.sms.losa.activity.ObserverInfoDao;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuItem;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.IPermission;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserGroupDao;

import net.sf.jasperreports.engine.util.ObjectUtils;

public class SchemeDao extends BaseDao<SchemeDO> implements IPermission{
	
	@Autowired
	private SchemeAuditorDao schemeAuditorDao;
	@Autowired
	private MenuCache menuCache;
	@Autowired
	private DictionaryDao dictionaryDao;
	@Autowired
	private UserGroupDao userGroupDao;
	@Autowired
	private SchemeUnitDao schemeUnitDao;
	@Autowired
    private LosaOperateLogDao losaOperateLogDao;
	@Autowired
	private OrganizationDao organizationDao;
	@Autowired
	private ObserverInfoDao observerInfoDao;
	
	protected SchemeDao() {
		super(SchemeDO.class);
	}
	
	//查询审计方案
	public Map<String,Object> querySchemes(Map<String,String> paramMap) throws Exception{
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		int count = 0;
		Map<String,Object> resultmap = new HashMap<String,Object>();
		try{
			String schemeType = paramMap.get("schemeType"); 
			String schemeNo = paramMap.get("schemeNo");
			String schemeSubject = paramMap.get("schemeSubject");
			String impleUnitName = paramMap.get("impleUnitName");
			String schemeEndDateFrom = paramMap.get("schemeEndDateFrom");
			String schemeEndDateTo = paramMap.get("schemeEndDateTo");
			String schemeStartDateFrom = paramMap.get("schemeStartDateFrom"); 
			String schemeStartDateTo = paramMap.get("schemeStartDateTo"); 
			String schemeStatus = paramMap.get("schemeStatus");
			String start = paramMap.get("start");
			String length = paramMap.get("length");
			String sortby = paramMap.get("sortby");
			String sortorders = paramMap.get("sortorders");
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			
			//查询用户职责
			UserDO user = UserContext.getUser();
			Map<String,String> map1 = new HashMap<String,String>();
			String auth = getUserAuth(user.getId());
			String sql="select l.id,l.scheme_subject,l.scheme_no,l.scheme_type,de.dict_name,l.imple_unit_id,"
					+ "tt.\"name\",to_char(l.start_date, 'yyyy-MM-dd'),to_char(l.end_date, 'yyyy-MM-dd'),"
					+ "l.status,de1.dict_name as schemeStatusName,l.scheme_desc,decode((select count(*) from L_ATTACHMENT la where la.observe_id=l.id), 0, 0, 1) as attach"
					+ " from l_scheme l"
					+ " left join l_dict_entry de on l.scheme_type = de.dict_code and de.dict_type = 'scheme_type'"
					+ " left join t_organization tt on tt.id = l.imple_unit_id "
					+ " left join l_dict_entry de1 on l.status = de1.dict_code and de1.dict_type = 'plan_status'";
			String sqlparam = " where l.deleted = 0";
			if(StringUtils.isNotBlank(schemeType)){
				sqlparam+=" and l.scheme_type = :schemeType";
				map1.put("schemeType", schemeType);
			}
			if(StringUtils.isNotBlank(schemeNo)){
				sqlparam+=" and l.scheme_no like :schemeNo";
				map1.put("schemeNo", schemeNo);
			}
			if(StringUtils.isNotBlank(schemeSubject)){
				sqlparam+=" and l.scheme_subject like :schemeSubject";
				map1.put("schemeSubject", schemeSubject);
			}
			if(StringUtils.isNotBlank(impleUnitName)){
				sqlparam+=" and tt.\"name\" like :impleUnitName";
				map1.put("impleUnitName", impleUnitName);
			}
			if(StringUtils.isNotBlank(schemeStartDateFrom)){
				sqlparam+=" and l.start_date >= to_date(:schemeStartDateFrom,'yyyy-MM-dd')";
				map1.put("schemeStartDateFrom", schemeStartDateFrom);
			}
			if(StringUtils.isNotBlank(schemeStartDateTo)){
				sqlparam+=" and l.start_date <= to_date(:schemeStartDateTo,'yyyy-MM-dd')";
				map1.put("schemeStartDateTo", schemeStartDateTo);
			}
			if(StringUtils.isNotBlank(schemeEndDateFrom)){
				sqlparam+=" and l.end_date >= to_date(:schemeEndDateFrom,'yyyy-MM-dd')";
				map1.put("schemeEndDateFrom", schemeEndDateFrom);
			}
			if(StringUtils.isNotBlank(schemeEndDateTo)){
				sqlparam+=" and l.end_date <= to_date(:schemeEndDateTo,'yyyy-MM-dd')";
				map1.put("schemeEndDateTo", schemeEndDateTo);
			}
			if(StringUtils.isNotBlank(schemeStatus)){
				sqlparam+=" and l.status = :schemeStatus";
				map1.put("schemeStatus", schemeStatus);
			}
			
			if(auth.equals("系统管理员")){
				//系统管理员查看所有数据
				sqlparam+=" and 1=1";
			}else if(auth.equals("子公司管理员+观察员")){
				sqlparam+=" and exists (select 1 from l_observer_info t where t.userid =" + user.getId()
						+ " and l.imple_unit_id = t.observer_org"
						+ " union "
						+ " select 1 from l_scheme_unit su where su.scheme_id = l.id  and l.status <> 'draft' and su.unit_id in"
						+ " (select fu.unit_id from fxw_flight_bd_aero_unit fu connect by prior fu.unit_id = fu.parent_id"
						+ " start with fu.unit_code in (select t2.deptcode from l_observer_info t1, t_organization t2"
						+ " where t1.userid = "+ user.getId()
						+ " and t1.observer_org = t2.id) and length(fu.unit_code) <= 4)"
						+ " union"
						+ " select 1 from l_scheme_auditor lsa where lsa.scheme_id = l.id"
						+ " and lsa.auditor_id ="+user.getId()+")";
			}else if(auth.equals("子公司管理员")){
				//查询实施单位和被实施单位是用户所在单位的数据
				sqlparam+=" and exists (select 1 from l_observer_info t where t.userid =" + user.getId()
							+ " and l.imple_unit_id = t.observer_org"
							+ " union "
							+ " select 1 from l_scheme_unit su where su.scheme_id = l.id and l.status <> 'draft' and su.unit_id in"
							+ " (select fu.unit_id from fxw_flight_bd_aero_unit fu connect by prior fu.unit_id = fu.parent_id"
							+ " start with fu.unit_code in (select t2.deptcode from l_observer_info t1, t_organization t2"
							+ " where t1.userid = "+ user.getId()
							+ " and t1.observer_org = t2.id) and length(fu.unit_code) <= 4))";
			}else if(auth.equals("观察员")){
				sqlparam+=" and exists (select * from l_scheme_auditor lsa where lsa.scheme_id = l.id and l.status <> 'draft'"
						+ "and lsa.auditor_id ="+user.getId()+")";
			}else{
				sqlparam+=" and 1=2";
			}
			if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
				sqlparam+=" order by "+sortby+" "+sortorders+",l.id ";
            }else{
                sqlparam+=" order by l.created desc";
            }
			SQLQuery query0 = session0.createSQLQuery((sql+sqlparam).toString());
			Iterator<Map.Entry<String, String>> entries = map1.entrySet().iterator();  
			while (entries.hasNext()) {  
			    Map.Entry<String, String> entry = entries.next();  
			    if(entry.getKey().equals("schemeNo")||entry.getKey().equals("schemeSubject")||entry.getKey().equals("impleUnitName")){
			    	query0.setParameter(entry.getKey(), "%"+entry.getValue()+"%");
			    }else{
			    	query0.setParameter(entry.getKey(), entry.getValue());
			    }
			    
			} 
			List<?> list= new ArrayList<Object[]>();
			if(start!=null&&length!=null){
		        count = query0.list().size();
		        query0.setFirstResult(Integer.parseInt(start));
			    query0.setMaxResults(Integer.parseInt(length));
		    }       
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("id", obj[0]);
	        		 map.put("schemeSubject", obj[1]);
	        		 map.put("schemeNo", obj[2]);
	        		 map.put("schemeType", obj[3]);
	        		 map.put("schemeTypeName", obj[4]);
	        		 map.put("impleUnitId", obj[5]);
	        		 map.put("impleUnitName", obj[6]);
	        		 map.put("startDate", obj[7]);
	        		 map.put("endDate", obj[8]);
	        		 map.put("schemeStatus", obj[9]);
	        		 map.put("schemeStatusName", obj[10]);
	        		 map.put("schemeDesc", obj[11]);
	        		 map.put("attach", obj[12]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		resultmap.put("all", count);
	    resultmap.put("result", result);
		return resultmap;
	}
	
	//查询审计方案
	public Map<String,Object> querySchemeInfoById(String schemeId) throws Exception{
		Map<String,Object> map = new HashMap<String,Object>();
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select l.id,l.scheme_subject,l.scheme_no,l.scheme_type,de.dict_name,l.imple_unit_id,"
					+ "tt.\"name\",to_char(l.start_date, 'yyyy-MM-dd'),to_char(l.end_date, 'yyyy-MM-dd'),"
					+ "l.status,de1.dict_name as schemeStatusName,l.scheme_desc"
					+ " from l_scheme l"
					+ " left join l_dict_entry de on l.scheme_type = de.dict_code and de.dict_type = 'scheme_type'"
					+ " left join t_organization tt on tt.id = l.imple_unit_id "
					+ " left join l_dict_entry de1 on l.status = de1.dict_code and de1.dict_type = 'plan_status'";
			String sqlparam = " where l.deleted = 0 ";
			
			if(StringUtils.isNotBlank(schemeId)){
				sqlparam+=" and l.id = '"+schemeId+"'";
			}
			
			SQLQuery query0 = session0.createSQLQuery((sql+sqlparam).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
	        Object[] obj = (Object[])list.get(0);
    		map.put("id", obj[0]);
    		map.put("schemeSubject", obj[1]);
    		map.put("schemeNo", obj[2]);
    		map.put("schemeType", obj[3]);
    		map.put("schemeTypeName", obj[4]);
    		map.put("impleUnitId", obj[5]);
    		map.put("impleUnitName", obj[6]);
    		map.put("startDate", obj[7]);
    		map.put("endDate", obj[8]);
    		map.put("schemeStatus", obj[9]);
    		map.put("schemeStatusName", obj[10]);
    		map.put("schemeDesc", obj[11]);
    		//如果schemeId不为空，查询方案的详细信息
    		if(StringUtils.isNotBlank(schemeId)){
    		//查找方案下的审计员
    			String auditorSql=" select lsa.auditor_id,tu.fullname,tu.username from l_scheme_auditor lsa"
					       +" left join t_user tu on lsa.auditor_id = tu.id "
					       +" where lsa.scheme_id ="+obj[0];
				SQLQuery query1 = session0.createSQLQuery((auditorSql).toString());
				List<?> auditorList= new ArrayList<Object[]>();
				List<Map<String,Object>> listMap = new ArrayList<Map<String,Object>>();
				auditorList = query1.list();
				if(auditorList.size()>0){
					for(int j=0;j<auditorList.size();j++){
						Object[] au = (Object[]) auditorList.get(j);
						Map<String,Object> auditorMap = new HashMap<String,Object>();
						auditorMap.put("id",au[0]);
						auditorMap.put("fullname",au[1]);
						auditorMap.put("username",au[2]);
						listMap.add(auditorMap);
					}
				}
 				map.put("auditorSelect2", listMap);
 				//查找方案下的被实施单位
 				String auditedUnitsSql=" select t.unit_code,t.unit_name,t.unit_id from l_scheme_unit lsu"
					       +" left join fxw_flight_bd_aero_unit t on t.unit_id = lsu.unit_id "
					       +" where lsu.scheme_id ="+obj[0];
				SQLQuery query2 = session0.createSQLQuery((auditedUnitsSql).toString());
				List<?> auditedUnitsList= new ArrayList<Object[]>();
				List<Map<String,Object>> listMap1 = new ArrayList<Map<String,Object>>();
				auditedUnitsList = query2.list();
				if(auditedUnitsList.size()>0){
					for(int j=0;j<auditedUnitsList.size();j++){
						Object[] au = (Object[]) auditedUnitsList.get(j);
						Map<String,Object> auditedUnitsMap = new HashMap<String,Object>();
						auditedUnitsMap.put("unitCode",au[0]);
						auditedUnitsMap.put("unitName",au[1]);
						auditedUnitsMap.put("unitId",au[2]);
						listMap1.add(auditedUnitsMap);
					}
				}
				map.put("auditedUnitsSelect2", listMap1);
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return map;
	}
	
	//查询审计方案的实施单位
	public List<Map<String,Object>> querySchemeImpleUnit(Map<String,Object> paramMap) throws Exception{
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		try{
			String unitName = (String)paramMap.get("unitName"); 
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select a.id,a.\"name\" from t_organization a where a.olevel = '2'"
					+" and (a.deptcode like 'EA%' or a.id = 10) and a.deleted = 0 and a.\"unit\" is not null";
			String sqlparam = "";
			if(StringUtils.isNotBlank(unitName)){
				sqlparam+=" and a.\"name\" like '%"+unitName+"%'";
			}
			//查询用户职责
			UserDO user = UserContext.getUser();
			String auth = getUserAuth(user.getId());
			if(auth.equals("系统管理员")){
				//系统管理员查看所有数据
				sqlparam+=" and 1=1";
			}else if(auth.equals("子公司管理员+观察员")||auth.equals("子公司管理员")){
				sqlparam+=" and exists (select * from l_observer_info t where t.userid ="+user.getId()
						+ " and t.observer_org = a.id)";
			}else{
				sqlparam+=" and 1=2";
			}
			SQLQuery query0 = session0.createSQLQuery((sql+sqlparam).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("id", obj[0]);
	        		 map.put("unitName", obj[1]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return result;
	}
	
	//新增或者修改方案信息
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public String insertOrUpdateScheme(Map<String,String> paramMap) throws Exception{
		String undelAuditorName = "";
		try{
			String schemeType = paramMap.get("schemeType");
			String schemeId = paramMap.get("id");
			String impleUnitId = paramMap.get("impleUnitId");
			String startDate = paramMap.get("startDate");
			String endDate = paramMap.get("endDate");
			String schemeDesc = paramMap.get("schemeDesc");
			String observerIds = paramMap.get("auditor");
			String auditedUnits = paramMap.get("auditedUnits");
			SchemeDO schemeDO = new SchemeDO();
			UserDO user = UserContext.getUser();
			schemeDO.setSchemeType(schemeType);
			schemeDO.setImpleUnitId(Integer.valueOf(impleUnitId));
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
			schemeDO.setStartDate(df.parse(startDate));
			schemeDO.setEndDate(df.parse(endDate));
			schemeDO.setSchemeDesc(schemeDesc);
			if(StringUtils.isBlank(schemeId)){//新增方案
				schemeDO.setCreator((long)user.getId());
				schemeDO.setLastModifier((long)user.getId());
				schemeDO.setDeleted(false);
				schemeDO.setStatus("draft");				
				Long Id = Long.valueOf(((Integer)internalSave(schemeDO)).toString());
				if(StringUtils.isNotBlank(observerIds)){
					String[] observers = observerIds.split(",");
					for(int i=0;i<observers.length;i++){
						Long auditorId = Long.valueOf(observers[i]);
						schemeAuditorDao.insertSchemeAuditor(Id, auditorId);
					}
				}
				if(StringUtils.isNotBlank(auditedUnits)){
					String[] unitIds = auditedUnits.split(",");
					for(int i=0;i<unitIds.length;i++){
						Long unitId = Long.valueOf(unitIds[i]);
						schemeUnitDao.insertSchemeUnit(Id, unitId);
					}
				}
				updateSchemeNoById(Id.intValue());
				this.addSchemeLog(schemeDO);
			}else{//修改方案信息
				boolean flag = isModSchemeNoAndSubject(paramMap);
				Map<String,Object>map=new HashMap<String,Object>();						
				map.put("schemeType", schemeType);
				map.put("impleUnitId",impleUnitId);
				map.put("startDate", startDate);
				map.put("endDate",endDate);
				map.put("schemeDesc", schemeDesc);
				this.update(Integer.valueOf(schemeId), map);
				//根据方案id，和观察员ids,新增和删除方案下的观察员
				undelAuditorName = schemeAuditorDao.updateSchemeAuditorsBySchemeId(schemeId, observerIds);
				//根据方案id，和被实施单位ids,新增和删除方案下的被实施单位
				schemeUnitDao.updateSchemeUnitsBySchemeId(schemeId, auditedUnits);
				if(flag){
					updateSchemeNoById(Integer.valueOf(schemeId));
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return undelAuditorName;
	}
   
	//删除方案
	public void deleteScheme(Integer schemeId) throws Exception {
		SchemeDO schemeDO = this.getHibernateTemplate().get(SchemeDO.class, schemeId);
		this.delSchemeLog(schemeDO);
		this.internalMarkAsDeleted(schemeDO);
	}
	
	//发布方案
	public void disScheme(Integer schemeId) throws Exception{
		SchemeDO schemeDO = this.getHibernateTemplate().get(SchemeDO.class, schemeId);
		schemeDO.setStatus("distributed");
		this.disSchemeLog(schemeDO);
		this.internalUpdate(schemeDO);
	}
	
	//根据方案id，修改方案编号和主题
	public void updateSchemeNoById(Integer schemeId){
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query0 = session0.createSQLQuery("{call LOSA_DEAL_SCHEME_PLAN_NO(?,?,?)}");
			query0.setInteger(0, schemeId);
			query0.setString(1,"scheme");
			query0.setString(2,null);
			query0.executeUpdate();
			session0.flush();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//判断当前用户是否有权限查看某一菜单
	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
		if ("审计管理/LOSA审计".equals(path)) {
			UserDO user = UserContext.getUser();
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql= "select * from l_observer_info a where a.deleted = 0 and a.userid = "+user.getId();
			SQLQuery query0 = session0.createSQLQuery((sql).toString());
			if(query0.list().size()>0){
				return true;
			}
		} 
		return false;
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
	
	
	//根据方案id，判断当前用户是否在方案的实施单位里
	public String isUserSchemeUnit(String schemeId){
		String result = "";
		try{
			UserDO user = UserContext.getUser();
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql= "select to_char(count(1)) from l_scheme a,l_observer_info b"
						+ " where a.imple_unit_id = b.observer_org"
						+ " and b.userid ="+user.getId()
						+" and a.id = "+schemeId;
			SQLQuery query0 = session0.createSQLQuery((sql).toString());
			String count = (String)query0.uniqueResult();
			if(count.equals("0")){
				result = "N";
			}else{
				result = "Y";
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	//根据方案id，判断方案下是否包含有效的计划
	public List<Map<String,String>> querySchemePlans(String schemeIds) throws Exception{
		List<Map<String,String>> result = new ArrayList<Map<String,String>>();
		try{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select a.scheme_no from l_scheme a where a.id in ("+schemeIds
					+ " ) and exists (select * from l_plan b where a.id = b.scheme_id and b.deleted = 0)";
			SQLQuery query0 = session0.createSQLQuery((sql).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 String str = (String)list.get(i);
	        		 Map<String,String> map = new HashMap<String,String>();
	        		 map.put("schemeNo", str);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	} 
	
	//修改方案，根据修改后的信息判断是否需要修改方案编号和方案主题
	public boolean isModSchemeNoAndSubject(Map<String,String> paramMap){
		boolean flag = false;
		String schemeType = paramMap.get("schemeType");
		String schemeId = paramMap.get("id");
		String impleUnitId = paramMap.get("impleUnitId");
		String startDate = paramMap.get("startDate");
		startDate = startDate.substring(0,4);
		
		String auditedUnits = paramMap.get("auditedUnits"); 
		SchemeDO schemeDO = this.getHibernateTemplate().get(SchemeDO.class, Integer.valueOf(schemeId));
		String startDateCom = schemeDO.getStartDate().toString().substring(0, 4);
		if(!schemeType.equals(schemeDO.getSchemeType())){//方案类型改变，方案编号和主题需要修改
			flag = true;
			return flag;
		}else if(!impleUnitId.equals(schemeDO.getImpleUnitId().toString())){//实施单位改变，方案编号和主题需要修改
			flag = true;
			return flag;
		}else if(!startDate.equals(startDateCom)){//方案开始日期年份改变，方案编号和主题需要修改
			flag = true;
			return flag;
		}else if(isSchemeAuditedUnitsChanged(auditedUnits,schemeDO)){
			flag = true;
			return flag;
		}
		return flag;
	}
	
	//根据被实施单位ids,和方案id，判断实施单位的改变是否需要修改方案编号和主题
	public boolean isSchemeAuditedUnitsChanged(String auditedUnits,SchemeDO schemeDO){
		boolean flag = false;
		String schemeType = schemeDO.getSchemeType();
		if(schemeType.equals("air_line")){
			return flag;
		}else{
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select to_char(decode((select substr(ff.unit_code, 0, 4)"
					+" from l_scheme_unit lsu, fxw_flight_bd_aero_unit ff where lsu.scheme_id = "+schemeDO.getId()
					+ " and lsu.unit_id = ff.unit_id and rownum = 1),"
					+ " (select substr(f.unit_code, 0, 4) from fxw_flight_bd_aero_unit f where f.unit_id ="+auditedUnits
					+" ),1,2)) from dual";
			SQLQuery query0 = session0.createSQLQuery(sql.toString());
			String res = (String)query0.uniqueResult();
			if(res.equals("1")){//方案下的被实施单位没有改变
				return flag;
			}else{
				flag = true;
				return flag;
			}
		}
	}
 //查询方案信息
	@SuppressWarnings("unchecked")
	public List queryNames(String schemeId){
	    List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();		
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select a.scheme_no,scheme_subject from l_scheme a where a.id ="+schemeId;
			SQLQuery query0 = session0.createSQLQuery((sql).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();			
		return list;
	} 
	//查询实施单位
	@SuppressWarnings("unchecked")
	public OrganizationDO getOrgName(Integer id) {
		String sql=" from OrganizationDO t where t.deleted=false and t.id= ?";
		List<OrganizationDO> docList = this.getHibernateTemplate().find(sql, id);
		OrganizationDO organizationDO = null;
		if (CollectionUtils.isNotEmpty(docList)) organizationDO = docList.get(0);
		return organizationDO;
	}
	//添加方案log信息
	public void addSchemeLog(SchemeDO scheme) throws Exception{
		List<String>details=new ArrayList<String>();
		String schemeNo="";
		String schemeSubject="";
		List schemeBase=queryNames(scheme.getId().toString());
		for(int i=0;i<schemeBase.size();i++){
			Object[] obj=(Object[]) schemeBase.get(i);
			schemeNo=(String) obj[0];
			schemeSubject =(String) obj[1];
    	}
			details.add("【"+SchemeFieldEnum.UPDATESCHEME.getValue()+"】:("+schemeNo+"--"+schemeSubject);	   
			   if(details.size()>0){
				    losaOperateLogDao.addLog(scheme.getId(), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(details));
		        }
		  }
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {	    
		try {
			saveSchemeLog(id, map);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	//修改方案log信息
	private void saveSchemeLog(int id,Map<String,Object> map) throws Exception{
		SchemeDO scheme=this.internalGetById(id);
		List<String>details=new ArrayList<String>();
		SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd");
		String key;
    	key=SchemeFieldEnum.UPDATEIMPLEUNIT.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
    		String dbvalue=String.valueOf(scheme.getImpleUnitId());
    		OrganizationDO organizationDo=getOrgName(Integer.valueOf(dbvalue));
			OrganizationDO organizationDoBaseInfo=getOrgName(Integer.valueOf(value));
        	if(!ObjectUtils.equals(dbvalue, value)){
 				details.add("【"+SchemeFieldEnum.UPDATEIMPLEUNIT.getValue()+"】:由【"+organizationDo.getName()+"】修改为：【"+organizationDoBaseInfo.getName()+"】");
   	}
        }
        key=SchemeFieldEnum.UPDATESCHEMEDESC.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
    		String dbvalue=scheme.getSchemeDesc();
    		if(dbvalue==null){
    			dbvalue="null";
    		}
        	if(!ObjectUtils.equals(dbvalue, value)){
 				details.add("【"+SchemeFieldEnum.UPDATESCHEMEDESC.getValue()+"】:由【"+dbvalue+"】修改为：【"+value+"】");
   	}
        	
        }
        key=SchemeFieldEnum.UPDATESCHEMETYPE.getKey();
        if(map.containsKey(key)){
        	Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
        	String dbvalue=scheme.getSchemeType();
        	String value=String.valueOf(map.get(key));
			String dictnamedb="select dict_name from l_dict_entry  where dict_code='"+dbvalue+"'"; 
			String dictname="select dict_name from l_dict_entry  where dict_code='"+value+"'";
			SQLQuery querydb=session.createSQLQuery((dictnamedb).toString());
			SQLQuery query=session.createSQLQuery((dictname).toString());
			Object[] objectdb=querydb.list().toArray();
			String dbvalues =objectdb[0].toString();
			Object[] object=query.list().toArray();
			String values =object[0].toString();
        	if(!ObjectUtils.equals(dbvalue, value)){
 				details.add("【"+SchemeFieldEnum.UPDATESCHEMETYPE.getValue()+"】:由【"+dbvalues+"】修改为：【"+values+"】");
   	}
        	
        }
        
        key=SchemeFieldEnum.UPDATESTARTDATE.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
    		String dbvalue=dateformat.format(scheme.getStartDate());
        	if(!ObjectUtils.equals(dbvalue, value)){
 				details.add("【"+SchemeFieldEnum.UPDATESTARTDATE.getValue()+"】:由【"+dbvalue+"】修改为：【"+value+"】");
   	}
        }
		
        key=SchemeFieldEnum.UPDATEENDDATE.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));	        	
    		String dbvalue=dateformat.format(scheme.getEndDate());
        	if(!ObjectUtils.equals(dbvalue, value)){
		   details.add("【"+SchemeFieldEnum.UPDATEENDDATE.getValue()+"】:由【"+dbvalue+"】修改为：【"+value+"】");

        	}
        	
        }
	        if(details.size()>0){
			    losaOperateLogDao.addLog(scheme.getId(), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(details));
	        }
		  }
	//删除方案log信息
	public void delSchemeLog(SchemeDO schemeDO) throws Exception{
		  List<String>details=new ArrayList<String>();
	      details.add("【"+SchemeFieldEnum.DELETESCHEME.getValue()+"】:("+schemeDO.getSchemeNo()+"--"+schemeDO.getSchemeSubject()+")");
	      losaOperateLogDao.addLog(schemeDO.getId(),LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(details));
	  }
	//发布方案log信息
	public void disSchemeLog(SchemeDO schemeDO) throws Exception{
		  List<String>details=new ArrayList<String>();
		  details.add("【"+SchemeFieldEnum.RELEASESCHEME.getValue()+"】:("+schemeDO.getSchemeNo()+"--"+schemeDO.getSchemeSubject()+")");	     
		  losaOperateLogDao.addLog(schemeDO.getId(),LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(details));
	  }
	
	public SchemeAuditorDao getSchemeAuditorDao() {
		return schemeAuditorDao;
	}

	public void setSchemeAuditorDao(SchemeAuditorDao schemeAuditorDao) {
		this.schemeAuditorDao = schemeAuditorDao;
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
	
	public SchemeUnitDao getSchemeUnitDao() {
		return schemeUnitDao;
	}

	public void setSchemeUnitDao(SchemeUnitDao schemeUnitDao) {
		this.schemeUnitDao = schemeUnitDao;
	}

	public LosaOperateLogDao getLosaOperateLogDao() {
		return losaOperateLogDao;
	}

	public void setLosaOperateLogDao(LosaOperateLogDao losaOperateLogDao) {
		this.losaOperateLogDao = losaOperateLogDao;
	}

	public OrganizationDao getOrganizationDao() {
		return organizationDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public ObserverInfoDao getObserverInfoDao() {
		return observerInfoDao;
	}

	public void setObserverInfoDao(ObserverInfoDao observerInfoDao) {
		this.observerInfoDao = observerInfoDao;
	}
	
	
}
