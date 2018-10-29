package com.usky.sms.eiosa;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.jasperreports.engine.util.ObjectUtils;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Hibernate;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.comm.JsonUtil;
import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class IsarpActionDao extends BaseDao<IsarpActionDO>{

	public IsarpActionDao(){
		super(IsarpActionDO.class);
	}
	private AuditorActionDao auditorActionDao;
	@Autowired
	private IosaCodeDao iosaCodeDao;
	@Autowired
	private OperateLogDao operateLogDao;
	@Autowired
	private AuditorDao auditorDao;
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator",UserContext.getUserId());
		return super.beforeSave(map);
	}
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("last_modifier", UserContext.getUserId());
	}
	public IsarpActionDO queryAction(String id) throws Exception {
		if (null == id ) {
			return null;
		}
		 @SuppressWarnings("unchecked")
		List<IsarpActionDO> list = (List<IsarpActionDO>) this.query("from IsarpActionDO t where t.deleted = false and t.id=?", Integer.valueOf(id));
		 if(list.isEmpty()){
			 return null;
		 }else{
			 return list.get(0);
		 }
		
	}
	public List<IsarpActionDO> queryActionByIsarpId(Integer id) throws Exception {
		if (null == id ) {
			return null;
		}
		 @SuppressWarnings("unchecked")
		List<IsarpActionDO> list = (List<IsarpActionDO>) this.query("from IsarpActionDO t where t.deleted = false  and t.isarpid=?", id);
		 if(list.isEmpty()){
			 return null;
		 }else{
			 return list;
		 }
		
	}
	public List<Map<String,Object>> queryActions(String id,String type) throws Exception {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		List<Object[]>list=new ArrayList<Object[]>();
		String sql="";
		//TODO 使用传参的方式构建query
		if(type.equals("queryById")){
			 sql="select t1.auditors,t1.reports,t2.code_name,t1.typename,t1.title,t1.auditDate,t1.id,t1.isarpid as isarpId,t1.auditDate_string,t1.status,t1.baseId,t1.aaid  from E_IOSA_ISARP_ACTION t1"
					+ "  left join e_iosa_code t2  on t1.status=t2.id  where  t1.id="+id;
		}else{
			sql="select t1.auditors,t1.reports,t2.code_name,t1.typename,t1.title,t1.auditDate,t1.id,t1.isarpid as isarpId,t1.auditDate_string,t1.status,t1.baseId,t1.aaid  from E_IOSA_ISARP_ACTION t1"
					+ "  left join e_iosa_code t2  on t1.status=t2.id  where  t1.isarpid="+id +" order by t1.aaid";
		}
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query=session.createSQLQuery((sql).toString());
		list=query.list();
		List<Map<String,Object>> resultList=new ArrayList<Map<String,Object>>();
		if(list!=null){
			for(int i=0;i<list.size();i++){
				Object[] obj = (Object[])list.get(i);
				Map<String,Object>map=new HashMap<String,Object>();
				if(obj[0]!=null){
					map.put("auditors",obj[0]);
				}else{
					map.put("auditors","");
				}
				map.put("reports",obj[1]);
				if(obj[2]!=null){
					map.put("status",obj[2]);
				}else{
					map.put("status","");
				}
				if(obj[3]!=null){
					map.put("type",obj[3]);
				}else{
					map.put("type","");
				}
				if(obj[4]!=null){
					map.put("title",obj[4]);
				}else{
					map.put("title","");
				}
				
				if(obj[5]!=null){
					map.put("auditDate",format.format(obj[5]));
				}else{
					map.put("auditDate","");
				}
				map.put("id",obj[6]);

				
				map.put("isarpid", obj[7]);
				map.put("auditDateString", obj[8]);
				map.put("statusValue", obj[9]);
				map.put("baseId", obj[10]);
				map.put("aaid", obj[11]);
				//查找action下面的审计员
				String auditor=" select t1.id, t2.fullname ,t1.spell from  e_iosa_auditor_action t3 "
						       +" left join a_auditor t1 on t3.auditorid=t1.id "
						       +" left join t_user t2 on t1.user_id=t2.id "
						       +" where t1.user_type like '%EIOSA审计员%' and t3.actionid="+obj[6];
				SQLQuery auditorQuery=session.createSQLQuery((auditor).toString());
				List<Object[]>auditorList=auditorQuery.list();
				List<Map<String,Object>>listMap=new ArrayList<Map<String,Object>>();
				String data="";
				if(auditorList.size()>0){
					
					for(int j=0;j<auditorList.size();j++){
						Object[] au=auditorList.get(j);
						Map<String,Object> auditorMap=new HashMap<String,Object>();
						auditorMap.put("id",au[0]);
						auditorMap.put("username",au[2]);
						auditorMap.put("fullname",au[1]);
						data+=String.valueOf(au[2])+";";
						listMap.add(auditorMap);
					}
				}
				map.put("auditingAuditors", data);
				map.put("auditorSelect2", listMap);
				resultList.add(map);
			}
			return resultList;
		}else{
			return null;
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public boolean updateAction(String id,String auditDate,String status,String auditors,String reports) throws Exception{
		boolean result=false;
		try{
//			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
//    		session.beginTransaction();
    		Integer userId=UserContext.getUserId();
//    		Date date=new Date();
//    		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//    		String dateString=format.format(date);
//			String sql="update IsarpActionDO t set t.status=:status, t.reports=:reports, t.auditDate=to_date(:auditDate,'YYYY/MM/DD'),"
//					+ "  t.last_modifier=:userId,t.lastUpdate=to_date(:dateString,'YYYY/MM/DD HH24:MI:SS')  where t.id=:id";
//			Query query = session.createQuery(sql).setParameter("status",status)
//					.setParameter("reports",reports)
//					.setParameter("auditDate",auditDate)
//					.setParameter("userId",userId)
//					.setParameter("dateString",dateString)
//					.setParameter("id",id==null? null : Integer.parseInt(id) );
//			System.out.println(Integer.parseInt(id));
//    		query.executeUpdate();
//    		session.getTransaction().commit();
    		
    		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    		Map<String,Object>map=new HashMap<String,Object>();
    		map.put("status",StringUtils.isBlank(status) ? null : Integer.parseInt(status));
    		map.put("reports",reports);
    		map.put("auditDate",StringUtils.isBlank(auditDate) ? null : sdf.parse(auditDate));
    		map.put("last_modifier",userId);
    		
    		
    	    if(!StringUtils.isBlank(auditors)){
    			String[] auditor=auditors.split(",");
        		//添加审计员，先根据action查询出是否已存在
    			List<AuditorActionDO>list=this.auditorActionDao.queryByActionId(Integer.valueOf(id));
    			List<String>addAuditorName=new ArrayList<String>();
    			List<String>deleteAuditorName=new ArrayList<String>();
    			for(int i=0;i<auditor.length;i++){
    				if(isExistAuditor(Integer.valueOf(auditor[i]),list)==false){
    					//不存在进行新增
    					AuditorActionDO auditorAction=new AuditorActionDO();
    					IsarpActionDO action=new IsarpActionDO();
    					action.setId(Integer.valueOf((id)));
    					AuditorDO audit=new AuditorDO();
    					audit.setId(Integer.valueOf(auditor[i]));
    					auditorAction.setActionId(action);
    					auditorAction.setAuditorId(audit);
    					auditorAction.setCreator(UserContext.getUserId());
    					auditorActionDao.internalSave(auditorAction);
    				   //根据auditorId过获取审计员的名字
    					AuditorDO auditorName=auditorDao.internalGetById(Integer.valueOf(auditor[i]));
    					addAuditorName.add(auditorName.getUser().getFullname()+"("+auditorName.getSpell()+")");
    					
    				}else {
    					//存在时不作变化
    				}
    				
    			}
    			//当list中的人员不在auditor时进行删除
				for(int j=0;j<list.size();j++){
					AuditorActionDO obj=list.get(j);
					if(!isExist(obj,auditor)){
						//存在时进行删除
						//根据auditorId过获取审计员的名字
    					AuditorDO auditorName=auditorDao.internalGetById(obj.getAuditorId().getId());
    					deleteAuditorName.add(auditorName.getUser().getFullname()+"("+auditorName.getSpell()+")");
						auditorActionDao.internalDelete(obj);	 
					}
				}
			   
				if(addAuditorName.size()>0){
					map.put("addAuditor", addAuditorName);
				}
				if(deleteAuditorName.size()>0){
					map.put("deleteAuditor", deleteAuditorName);
				}
				
    		}
    	    //添加logToAction
    		this.addActionLog(Integer.parseInt(id),map);
    		if(map.containsKey("addAuditor")){
    			map.remove("addAuditor");
    		}
    		if(map.containsKey("deleteAuditor")){
    			map.remove("deleteAuditor");
    		}
    		this.update(Integer.parseInt(id), map);
    		
			result=true;
		}catch(Exception e){
			e.printStackTrace();
		}
		 
		
		return result;
	}
	
	public boolean addAction(String isarpId) throws Exception{
		boolean result=false;
		try{
			String hql="from IsarpActionDao t where t.deleted=false and t.isarpId=?";
			List<IsarpActionDO>lists=this.getHibernateTemplate().find(hql,isarpId);
			Map<String,Object>map=new HashMap<String,Object>();
			if(lists.size()>0){
				int id=lists.get(0).getId();
				IsarpActionDO iac=new IsarpActionDO();	
				iac.setLast_modifier(UserContext.getUserId());
				iac.setTitle(lists.get(0).getTitle());				
				iac.setReports(lists.get(0).getReports());
				iac.setStatus(lists.get(0).getStatus());				
				iac.setAuditDate(lists.get(0).getAuditDate());
				iac.setTitle(lists.get(0).getTitle());
				iac.setNewadd(lists.get(0).getNewadd());
				this.internalSave(iac);
				map.put(isarpId, iac);
			}
			
		
    	    if(!StringUtils.isBlank(lists.get(0).getAuditors())){
    			String[] auditor=(lists.get(0).getAuditors()).split(",");
        		//添加审计员，先根据action查询出是否已存在
    			List<AuditorActionDO>list=this.auditorActionDao.queryByActionId(lists.get(0).getId());
    			List<String>addAuditorName=new ArrayList<String>();
    			List<String>deleteAuditorName=new ArrayList<String>();
    			for(int i=0;i<auditor.length;i++){
    				if(isExistAuditor(Integer.valueOf(auditor[i]),list)==false){
    					//不存在进行新增
    					AuditorActionDO auditorAction=new AuditorActionDO();
    					IsarpActionDO action=new IsarpActionDO();
    					action.setId(lists.get(0).getId());
    					AuditorDO audit=new AuditorDO();
    					audit.setId(Integer.valueOf(auditor[i]));
    					auditorAction.setActionId(action);
    					auditorAction.setAuditorId(audit);
    					auditorAction.setCreator(UserContext.getUserId());
    					auditorActionDao.internalSave(auditorAction);
    				   //根据auditorId过获取审计员的名字
    					AuditorDO auditorName=auditorDao.internalGetById(Integer.valueOf(auditor[i]));
    					addAuditorName.add(auditorName.getUser().getFullname()+"("+auditorName.getSpell()+")");
    					
    				}else {
    					//存在时不作变化
    				}
    				
    			}
    			//当list中的人员不在auditor时进行删除
				for(int j=0;j<list.size();j++){
					AuditorActionDO obj=list.get(j);
					if(!isExist(obj,auditor)){
						//存在时进行删除
						//根据auditorId过获取审计员的名字
    					AuditorDO auditorName=auditorDao.internalGetById(obj.getAuditorId().getId());
    					deleteAuditorName.add(auditorName.getUser().getFullname()+"("+auditorName.getSpell()+")");
						auditorActionDao.internalDelete(obj);	 
					}
				}
			   
				if(addAuditorName.size()>0){
					map.put("addAuditor", addAuditorName);
				}
				if(deleteAuditorName.size()>0){
					map.put("deleteAuditor", deleteAuditorName);
				}
				
    		}
    	    //添加logToAction
    		this.addActionLog(lists.get(0).getId(),map);
    		if(map.containsKey("addAuditor")){
    			map.remove("addAuditor");
    		}
    		if(map.containsKey("deleteAuditor")){
    			map.remove("deleteAuditor");
    		}
    		
    		this.save(map);
    		
			result=true;
		}catch(Exception e){
			e.printStackTrace();
		}
		 
		
		return result;
	}
	/**
	 * 	//添加actionLog
	 * @param actionId
	 * @param map
	 * @throws Exception
	 */
    private void addActionLog(Integer actionId, Map<String,Object>map) throws Exception {
        IsarpActionDO action=(IsarpActionDO)this.internalGetById(actionId);
        List<String>details=new ArrayList<String>();
        SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd");
        details.add("【"+action.getTitle()+"】修改");
        String key;
        key=EiosaActionFieldEnum.STATUS.getKey();
        if(map.containsKey(key)){
        	Integer value=new BigDecimal(String.valueOf(map.get(key))).intValue();
        	
        	if(action.getStatus()==null){
        		IosaCodeDO status=iosaCodeDao.queryIosaCodeById(value);
        		details.add("【"+EiosaActionFieldEnum.STATUS.getValue()+"】:由'[]'-->修改为："+ status.getCode_name());
        	}else{
        		Integer dbvalue=action.getStatus().getId();
        		if(!ObjectUtils.equals(dbvalue, value)){
            		IosaCodeDO status=iosaCodeDao.queryIosaCodeById(value);
            		details.add("【"+EiosaActionFieldEnum.STATUS.getValue()+"】:由'" +action.getStatus().getCode_name()+"'-->修改为："+ status.getCode_name());
            	}
        	}
        }
        key=EiosaActionFieldEnum.RECORD.getKey();
        if(map.containsKey(key)){
        	String dbvalue=action.getReports();
        	String value=String.valueOf(map.get(key));
        	if(action.getReports()==null){
        		details.add("【"+EiosaActionFieldEnum.RECORD.getValue()+"】:由[]-->修改为："+value);
        	}else{
        		if(!ObjectUtils.equals(dbvalue, value)){
            		details.add("【"+EiosaActionFieldEnum.RECORD.getValue()+"】:由'" +dbvalue+"'-->修改为："+value);
            	}	
        	}
        	
        }
        key=EiosaActionFieldEnum.AUDITDATE.getKey();
        if(map.containsKey(key)){
        	String value=dateformat.format(map.get(key));
        	if(action.getAuditDate()==null){
        		details.add("【"+EiosaActionFieldEnum.AUDITDATE.getValue()+"】:由[]"+"-->修改为："+value);
        	}else{
        		String dbvalue=dateformat.format(action.getAuditDate());
            	if(!ObjectUtils.equals(dbvalue, value)){
            		details.add("【"+EiosaActionFieldEnum.AUDITDATE.getValue()+"】:由'" +dbvalue+"'-->修改为："+value);
            	}
        	}
        	
        }
        key=EiosaActionFieldEnum.ADDAUDITOR.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
        	details.add("【"+EiosaActionFieldEnum.ADDAUDITOR.getValue()+"】:"+value);
        }
        key=EiosaActionFieldEnum.DELAUDITOR.getKey();
        if(map.containsKey(key)){
        	String value=String.valueOf(map.get(key));
        	details.add("【"+EiosaActionFieldEnum.DELAUDITOR.getValue()+"】:"+value);
        }
        if (!details.isEmpty()) {
			operateLogDao.addLog(actionId,EiosaLogTypeEnum.ACTION.getKey(),EiosaLogOperateTypeEnum.ACTION.getKey(), JsonUtil.toJson(details));
			operateLogDao.addLog(action.getIsarpid(),EiosaLogTypeEnum.ISARP.getKey(),EiosaLogOperateTypeEnum.ACTION.getKey(), JsonUtil.toJson(details));
			
		}
    	
    }
  
	private boolean isExistAuditor(Integer id, List<AuditorActionDO> list){
		boolean result=false;
		for(int i=0;i<list.size();i++){
			AuditorActionDO auditor=list.get(i);
			if(id.equals(auditor.getAuditorId().getId())){
				result=true;
			}
		}
		return result;
	}
	private boolean isExist(AuditorActionDO id, String[] s){
		boolean result=false;
		for(int i=0;i<s.length;i++){
			if(Integer.valueOf(s[i]).equals(id.getAuditorId().getId())){
				result=true;
			}
		}
		return result;
	}
	public AuditorActionDao getAudiorActionDao() {
		return auditorActionDao;
	}
	public void setAudiorActionDao(AuditorActionDao audiorActionDao) {
		this.auditorActionDao = audiorActionDao;
	}
	public IosaCodeDao getIosaCodeDao() {
		return iosaCodeDao;
	}
	public void setIosaCodeDao(IosaCodeDao iosaCodeDao) {
		this.iosaCodeDao = iosaCodeDao;
	}
	public OperateLogDao getOperateLogDao() {
		return operateLogDao;
	}
	public void setOperateLogDao(OperateLogDao operateLogDao) {
		this.operateLogDao = operateLogDao;
	}
	public AuditorDao getAuditorDao() {
		return auditorDao;
	}
	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}
	
	
}
