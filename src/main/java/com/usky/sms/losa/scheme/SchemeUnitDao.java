package com.usky.sms.losa.scheme;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.comm.JsonUtil;
import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.LosaLogOperateTypeEnum;
import com.usky.sms.losa.LosaLogTypeEnum;
import com.usky.sms.losa.LosaOperateLogDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

import net.sf.jasperreports.engine.util.ObjectUtils;

public class SchemeUnitDao extends BaseDao<SchemeUnitDO>{
	@Autowired
    private LosaOperateLogDao losaOperateLogDao;
	
	protected SchemeUnitDao() {
		super(SchemeUnitDO.class);
	}
	//根据方案id和被实施单位id，插入方案被实施单位关联表
	public void insertSchemeUnit(Long schemeId,Long unitId){
		try{
			UserDO user = UserContext.getUser();
			SchemeUnitDO schemeUnitDO = new SchemeUnitDO();
			schemeUnitDO.setCreator((long)user.getId());
			schemeUnitDO.setLastModifier((long)user.getId());
			schemeUnitDO.setDeleted(false);
			schemeUnitDO.setSchemeId(schemeId);
			schemeUnitDO.setUnitId(unitId);
			internalSave(schemeUnitDO);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	//根据方案id，删除方案下的被实施单位
	public void delSchemeUnitsBySchemeId(Long schemeId){
		String sql = "delete from l_scheme_unit a where a.scheme_id =  " + schemeId;
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		query.executeUpdate();
		session.flush();
	}
	
	//根据方案id，和被实施单位ids，对方案下的被实施单位进行增删操作
	public void updateSchemeUnitsBySchemeId(String schemeId,String unitIds) throws Exception{
		//根据方案id，查询方案下的被实施单位
		String sql=" from SchemeUnitDO t where t.schemeId = ?";
		List<String>details=new ArrayList<String>();
		String unitId = "";
		String unitName ="";
		@SuppressWarnings("unchecked")
		List<SchemeUnitDO> list = this.getHibernateTemplate().find(sql, Long.valueOf(schemeId));
		if(list.size()>0){
			for(int i=0;i<list.size();i++){
				SchemeUnitDO schemeUnit = list.get(i);
				unitId += schemeUnit.getUnitId();
				unitId += ",";
        	}
			List data = this.queryUnitNames(unitId.substring(0, unitId.length()-1));
			for(int i=0;i<data.size();i++){
				Object[] obj=(Object[]) data.get(i);
				unitName+=(String) obj[0];
				unitName += ",";
        	}
			if(unitName.length()>0){
				unitName=unitName.substring(0,unitName.length()-1);
			}
		}
		if(StringUtils.isNotBlank(unitIds)){//传入的被实施单位不为空			
			String[] units = unitIds.split(",");
			for(int i=0;i<units.length;i++){
				String unit = units[i];
				if(!isExistUnit(unit,list)){//传入的被实施单位不在已有的被实施单位里面，需要新增
					insertSchemeUnit(Long.valueOf(schemeId),Long.valueOf(unit));
				}
			}
			for(int i=0;i<list.size();i++){
				SchemeUnitDO schemeUnit = list.get(i);
				if(!isExist(schemeUnit,units)){//已有的被实施单位不在传入的被实施单位里面，需要删除
					Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
					session.delete(schemeUnit);
					session.flush();
				}
			}
			String unitdb="";
			List data = this.queryUnitNames(unitIds);
			for(int i=0;i<data.size();i++){
				Object[] obj=(Object[]) data.get(i);
				unitdb+=(String) obj[0];
				unitdb += ",";
        	}
			if(unitdb.length()>0){
					unitdb=unitdb.substring(0,unitdb.length()-1);
			}
			if(list.size()>0){
				if(!Exist(list,units)){
				details.add("【"+SchemeFieldEnum.UPDATEUNIT.getValue()+"】:由【"+unitName+"】修改为：【"+unitdb+"】");
				}				
			}else{
				details.add("新增【"+SchemeFieldEnum.UPDATEUNIT.getValue()+"】:【"+unitdb+"】");
			}		
		}else{
			delSchemeUnitsBySchemeId(Long.valueOf(schemeId));
			if(list.size()>0){
				details.add("删除【"+SchemeFieldEnum.UPDATEUNIT.getValue()+"】:【"+unitName+"】");
			}}
		if(details.size()>0){
		    losaOperateLogDao.addLog(Integer.valueOf(schemeId), LosaLogTypeEnum.SCHEME.getKey(),LosaLogOperateTypeEnum.SCHEME.getKey(), JsonUtil.toJson(details));
         }
	}
	
	//根据被实施单位id，查询名称
		public List queryUnitNames(String unitIds){
		    List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();		
				Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
				String sql="select a.unit_name,unit_code from FXW_flight_bd_aero_unit a where a.unit_id in ("+unitIds+") ";
				SQLQuery query0 = session0.createSQLQuery((sql).toString());
				List<?> list= new ArrayList<Object[]>();
				list= query0.list();			
			return list;
		} 
		
	private boolean isExistUnit(String unitId, List<SchemeUnitDO> list){
		boolean result = false;
		for(int i=0;i<list.size();i++){
			SchemeUnitDO unit = list.get(i);
			if(unitId.equals(unit.getUnitId().toString())){
				result = true;
				return result;
			}
		}
		return result;
	}
	private boolean isExist(SchemeUnitDO schemeUnit, String[] unitIds){
		boolean result=false;
		for(int i=0;i<unitIds.length;i++){
			if(unitIds[i].equals(schemeUnit.getUnitId().toString())){
				result = true;
				return result;
			}
		}
		return result;
	}
	private	boolean Exist(List<SchemeUnitDO> list, String[] unitIds){
		boolean result=false;		
		if(unitIds.length == list.size() ){			
			for(int i=0;i<unitIds.length;i++){				
				result=false;			
				for(int j=0;j<list.size();j++){					
					SchemeUnitDO unit = list.get(j);					
						if(unitIds[i].equals(unit.getUnitId().toString())){						
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
	
	
}
