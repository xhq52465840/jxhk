
package com.usky.sms.tem.insecurity;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.user.UserContext;

public class InsecurityDao extends BaseDao<InsecurityDO> {

	@Autowired
	private PermissionSetDao permissionSetDao;
	
	protected InsecurityDao() {
		super(InsecurityDO.class);
	}

	@Override
	protected String getBaseHql(Map<String, Object> map) {
		boolean includeConsequence = false;
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> consequenceList = (List<List<Map<String, Object>>>) map.get("rule");
		for (List<Map<String, Object>> list : consequenceList) {
			for (Map<String, Object> paramMap : list) {
				if ("consequence".equals(paramMap.get("key"))) {
					includeConsequence = true;
					break;
				}
			}
			if (includeConsequence) break;
		}
		if (includeConsequence) {
			return "select distinct t from " + clazz.getSimpleName() + " t left join t.consequences g where t.deleted = false and (";
		} else {
			return super.getBaseHql(map);
		}
	}
	
	@Override
	protected String getQueryParamName(String key) {
		if ("consequence".equals(key)) return "g.id";
		return super.getQueryParamName(key);
	}
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("consequence".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz,
			boolean multiple, Field field) {
		String fieldName = field.getName();
		InsecurityDO insecurity = (InsecurityDO) obj;
		if("name".equals(fieldName)){			
			map.put("num", insecurity.getNum());
			map.put("name", insecurity.getName());
		}else{
			super.setField(map, obj, claz, multiple, field);
		}	
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		InsecurityDO insecurity = (InsecurityDO) obj;
		DictionaryDO dictionary = insecurity.getSystem();
		Set<ConsequenceDO> consequences = insecurity.getConsequences();
		Set<ThreatDO> threats = insecurity.getThreats();
		Set<ErrorDO> errors = insecurity.getErrors();
		List<Map<String, Object>> conList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> thrList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> errList = new ArrayList<Map<String, Object>>();
		for (ConsequenceDO consequenceDO : consequences) {
			if(consequenceDO.isDeleted() == true){
				continue;
			}
			Integer id = consequenceDO.getId();
			String num = consequenceDO.getNum();
			String name = consequenceDO.getName();
			Map<String, Object> conMap = new HashMap<String, Object>();
			conMap.put("id", id);
			conMap.put("num", num);
			conMap.put("name", name);
			conList.add(conMap);
		}
		for (ThreatDO threatDO : threats) {
			if(threatDO.isDeleted() == true){
				continue;
			}
			Integer id = threatDO.getId();
			String num = threatDO.getNum();
			String name = threatDO.getName();
			Map<String, Object> thrMap = new HashMap<String, Object>();
			thrMap.put("id", id);
			thrMap.put("num", num);
			thrMap.put("name", name);
			thrList.add(thrMap);
		}
		for (ErrorDO errorDO : errors) {
			if(errorDO.isDeleted() == true){
				continue;
			}
			Integer id = errorDO.getId();
			String num = errorDO.getNum();
			String name = errorDO.getName();
			Map<String, Object> errMap = new HashMap<String, Object>();
			errMap.put("id", id);
			errMap.put("num", num);
			errMap.put("name", name);
			errList.add(errMap);
		}
		Collections.sort(conList, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return (o1.get("num")+"").compareTo(o2.get("num")+"");
			}
		});
		Collections.sort(thrList, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return (o1.get("num")+"").compareTo(o2.get("num")+"");
			}
		});
		Collections.sort(errList, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return (o1.get("num")+"").compareTo(o2.get("num")+"");
			}
		});
		map.put("consequences", conList);
		map.put("threats", thrList);
		map.put("errors", errList);
		if(dictionary != null){
			map.put("systemDisplayName", dictionary.getDisplayName());
		}else{
			map.put("systemDisplayName", null);
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@SuppressWarnings("unchecked")
	public List<InsecurityDO> getByConsequence(String consequence) {
		String sql = "select i from InsecurityDO i left join i.consequences c where i.deleted = false and c.id = ?";
		return this.getHibernateTemplate().find(sql, Integer.parseInt(consequence));
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkManagementPermission();
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkManagementPermission();
		map.put("lastUpdater", UserContext.getUserId());
	}
	
	@Override
	protected void beforeDelete(Collection<InsecurityDO> collection) {
		checkManagementPermission();
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@SuppressWarnings("unchecked")
	public List<InsecurityDO> getByConName(String consequenceName){
		String sql = "select i from InsecurityDO i left join i.consequences c where i.deleted = false and c.name = ?";
		List<InsecurityDO> list = this.getHibernateTemplate().find(sql,consequenceName);
		return list;
	}
	
	/**
	 * 获取按名称排序的第一个不安全状态
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public InsecurityDO getFirstInsecurity() {
		List<InsecurityDO> insecuritys = (List<InsecurityDO>) this.query("from InsecurityDO where deleted = false order by name");
		if(insecuritys.isEmpty()){
			return null;
		}else{
			return insecuritys.get(0);
		}
	}
	
	/**
	 * 通过名称查找对应的不安全状态的记录，如果没有则返回null，否则返回第一条数据
	 */
	public InsecurityDO getByName(String name){
		if(null == name){
			return null;
		}
		@SuppressWarnings("unchecked")
		List<InsecurityDO> list = (List<InsecurityDO>) this.query("from InsecurityDO t where t.deleted = false and t.name = ?", name);
		if(list.isEmpty()){
			return null;
		}
		return list.get(0);
	}

	/**
	 * 校验是否有管理权限
	 */
	private void checkManagementPermission(){
		if(!permissionSetDao.hasPermission(PermissionSets.MANAGE_TEM_DICTIONARY.getName())){
			throw SMSException.NO_ACCESS_RIGHT;
		}
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
}
