package com.usky.sms.losa.scheme;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.comm.JsonUtil;
import com.usky.sms.core.BaseDao;
import com.usky.sms.eiosa.DocumentsDO;
import com.usky.sms.losa.LosaLogOperateTypeEnum;
import com.usky.sms.losa.LosaLogTypeEnum;
import com.usky.sms.losa.LosaOperateLogDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

import net.sf.jasperreports.engine.util.ObjectUtils;

public class SchemeAuditorDao extends BaseDao<SchemeAuditorDO>{
	@Autowired
    private LosaOperateLogDao losaOperateLogDao;
    @Autowired
    private UserDao userDao;
	protected SchemeAuditorDao() {
		super(SchemeAuditorDO.class);
	}
	//根据方案id和审计员id，插入方案审计员关联表
	public void insertSchemeAuditor(Long schemeId,Long auditorId){
		try{
			UserDO user = UserContext.getUser();
			SchemeAuditorDO schemeAuditorDO = new SchemeAuditorDO();
			schemeAuditorDO.setCreator((long)user.getId());
			schemeAuditorDO.setLastModifier((long)user.getId());
			schemeAuditorDO.setDeleted(false);
			schemeAuditorDO.setSchemeId(schemeId);
			schemeAuditorDO.setAuditorId(auditorId);
//			this.addSchemeLog(schemeAuditorDO);
			internalSave(schemeAuditorDO);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//根据方案id，删除方案下的观察员
	public void delSchemeAuditorBySchemeId(Long schemeId){
		String sql = "delete from l_scheme_auditor a where a.scheme_id =  " + schemeId;
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		query.executeUpdate();
		session.flush();
	}
	//根据方案id，和观察员ids，对方案下的观察员进行增删操作
	public String updateSchemeAuditorsBySchemeId(String schemeId,String auditorIds) throws Exception{
		//根据方案id，查询方案下的观察员
		String sql=" from SchemeAuditorDO t where t.schemeId = ? ";
		List<String>details=new ArrayList<String>();
		@SuppressWarnings("unchecked")
		List<SchemeAuditorDO> list = this.getHibernateTemplate().find(sql, Long.valueOf(schemeId));
		String auditorId = "";
		String auditorName ="";
		String undelAuditorNames="";
		if(list.size()>0){
			for(int i=0;i<list.size();i++){
				SchemeAuditorDO schemeAuditor = list.get(i);
				auditorId += schemeAuditor.getAuditorId();
				auditorId += ",";
        	}
			List data = this.queryAuditorNames(auditorId.substring(0, auditorId.length()-1));
			for(int i=0;i<data.size();i++){
				Object[] obj=(Object[]) data.get(i);
				auditorName+=(String) obj[0];
				auditorName += ",";
        	}
			if(auditorName.length()>0){
				auditorName=auditorName.substring(0,auditorName.length()-1);
			}
		}
		if(StringUtils.isNotBlank(auditorIds)){//传入的观察员不为空
			String[] auditors = auditorIds.split(",");
			for(int i=0;i<auditors.length;i++){
				String auditor = auditors[i];
				if(!isExistAuditor(auditor,list)){//传入的观察员不在已有的观察员里面，需要新增
					insertSchemeAuditor(Long.valueOf(schemeId),Long.valueOf(auditor));
				}
			}
			List<SchemeAuditorDO> undelAuditors = new ArrayList<SchemeAuditorDO>();
			for(int i=0;i<list.size();i++){
				SchemeAuditorDO schemeAuditor = list.get(i);
				if(!isExist(schemeAuditor,auditors)){//已有的观察员不在传入的观察员里面，需要删除
					Boolean flag = isPlanAuditor(schemeAuditor,schemeId);//判断观察员是否已经关联计划
					if(flag){
						internalDelete(schemeAuditor);
					}else{
						undelAuditors.add(schemeAuditor);
					}
				}
			}
			undelAuditorNames = queryAuditorName(undelAuditors);
			String auditordb="";
			List data = this.queryAuditorNames(auditorIds);
			for(int i=0;i<data.size();i++){
				Object[] obj=(Object[]) data.get(i);
				auditordb+=(String) obj[0];
				auditordb += ",";
        	}
			if(auditordb.length()>0){
				auditordb=auditordb.substring(0,auditordb.length()-1);
			}
			if(list.size()>0){
					  if(!Exist(list,auditors)){
							details.add("【"+SchemeFieldEnum.UPDATEAUDITOR.getValue()+"】:由【"+auditorName+"】修改为：【"+auditordb+"】");
						  }			
			}else{
				details.add("新增【"+SchemeFieldEnum.UPDATEAUDITOR.getValue()+"】:【"+auditordb+"】");
			}
		}else{
			/*delSchemeAuditorBySchemeId(Long.valueOf(schemeId));
			if(list.size()>0){
				details.add("删除【"+SchemeFieldEnum.UPDATEAUDITOR.getValue()+"】:【"+auditorName+"】");
			}*/
		}		
		if(details.size()>0){
		    losaOperateLogDao.addLog(Integer.valueOf(schemeId), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(details));
         }
		return undelAuditorNames;
	}
	private String queryAuditorName(List<SchemeAuditorDO> undelAuditors) {
		String auditorId = "";
		String auditorName = "";
		List data = new ArrayList();
		for(int i=0;i<undelAuditors.size();i++){
			SchemeAuditorDO schemeAuditor = undelAuditors.get(i);
			auditorId += schemeAuditor.getAuditorId();
			auditorId += ",";
			data = this.queryAuditorNames(auditorId.substring(0, auditorId.length()-1));
    	}
		for(int i=0;i<data.size();i++){
			Object[] obj=(Object[]) data.get(i);
			auditorName+=(String) obj[0];
			auditorName += ",";
    	}
		if(auditorName.length()>0){
			auditorName=auditorName.substring(0,auditorName.length()-1);
		}
		return auditorName;
	}
	//判断观察员是否是方案下的计划对应的观察员
	public boolean isPlanAuditor(SchemeAuditorDO schemeAuditor, String schemeId) {
		Boolean flag = true;
		Long auditorId = schemeAuditor.getAuditorId();
		Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
		String sql="select * from l_plan a where a.deleted = 0 and a.scheme_id = "+schemeId
				+ " and a.observer_id = "+auditorId;
		SQLQuery query0 = session0.createSQLQuery((sql).toString());
		List<?> list= new ArrayList<Object[]>();
		list= query0.list();
		if(list.size()>0){
			flag = false;
		}
		return flag;
	}
	//查询观察员名称
	@SuppressWarnings("unchecked")
	public List queryAuditorNames(String auditorIds){
	    List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();		
		Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
		String sql="select a.fullName,userName from T_USER a where a.id in ("+auditorIds+") ";
		SQLQuery query0 = session0.createSQLQuery((sql).toString());
		List<?> list= new ArrayList<Object[]>();
		list= query0.list();			
		return list;
	} 
	private boolean isExistAuditor(String auditorId, List<SchemeAuditorDO> list){
		boolean result=false;
		for(int i=0;i<list.size();i++){
			SchemeAuditorDO auditor = list.get(i);
			if(auditorId.equals(auditor.getAuditorId().toString())){
				result = true;
				return result;
			}
		}
		return result;
	}
	private boolean isExist(SchemeAuditorDO schemeAuditor, String[] auditorIds){
		boolean result=false;
		for(int i=0;i<auditorIds.length;i++){
			if(auditorIds[i].equals(schemeAuditor.getAuditorId().toString())){
				result = true;
				return result;
			}
		}
		return result;
	}
	private	boolean Exist(List<SchemeAuditorDO> list, String[] auditorIds){
		boolean result=false;		
		if(auditorIds.length == list.size() ){			
			for(int i=0;i<auditorIds.length;i++){				
				result=false;			
				for(int j=0;j<list.size();j++){					
						SchemeAuditorDO auditor = list.get(j);					
						if(auditorIds[i].equals(auditor.getAuditorId().toString())){						
								result =true;								
								break;
						}
					}
			}
		}
		return result;
	}
	public LosaOperateLogDao getLosaOperateLogDao() {
		return losaOperateLogDao;
	}
	public void setLosaOperateLogDao(LosaOperateLogDao losaOperateLogDao) {
		this.losaOperateLogDao = losaOperateLogDao;
	}
	public UserDao getUserDao() {
		return userDao;
	}
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	
}
