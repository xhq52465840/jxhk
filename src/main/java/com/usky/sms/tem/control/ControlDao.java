package com.usky.sms.tem.control;

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
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.user.UserContext;

public class ControlDao extends BaseDao<ControlDO> {

	@Autowired
	private PermissionSetDao permissionSetDao;
	
	protected ControlDao() {
		super(ControlDO.class);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	protected String getBaseHql(Map<String, Object> map) {
		boolean includeThreat = false;
		boolean includeError = false;
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
		for (List<Map<String, Object>> list : ruleList) {
			for (Map<String, Object> paramMap : list) {
				if ("threat".equals(paramMap.get("key"))) {
					includeThreat = true;
					break;
				}else if("error".equals(paramMap.get("key"))){
					includeError = true;
					break;
				}
			}
			if (includeThreat || includeError) break;
		}
		if (includeThreat) {
			return "select distinct t from " + clazz.getSimpleName() + " t left join t.threats g where t.deleted = false and (";
		}else if(includeError){
			return "select distinct t from " + clazz.getSimpleName() + " t left join t.errors g where t.deleted = false and (";
		} else {
			return super.getBaseHql(map);
		}
	}
	
	@Override
	protected String getQueryParamName(String key) {
		if ("error".equals(key) || "threat".equals(key)) return "g.id";
		return super.getQueryParamName(key);
	}
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("error".equals(key) || "threat".equals(key)) return ((Number) value).intValue();
		if("number".equals(key)) return value==null?"":value.toString().toUpperCase();
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj,
			Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		ControlDO control = (ControlDO) obj;
		Set<ErrorDO> errors = control.getErrors();
		Set<ThreatDO> threats = control.getThreats();
		List<Map<String, Object>> thrList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> errList = new ArrayList<Map<String, Object>>();
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
			errMap.put("num",  num);
			errMap.put("name", name);
			errList.add(errMap);
		}
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
		map.put("threats", thrList);
		map.put("errors", errList);
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
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
	protected void beforeDelete(Collection<ControlDO> collection) {
		checkManagementPermission();
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
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
