
package com.usky.sms.tem.consequence;

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
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.user.UserContext;

public class ConsequenceDao extends BaseDao<ConsequenceDO> {
	
	protected ConsequenceDao() {
		super(ConsequenceDO.class);
	}
	
	@Autowired
	private ConsequenceDao consequenceDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	

	@Override
	protected String getBaseHql(Map<String, Object> map) {
		boolean includeInsecurity = false;
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> insecurityList = (List<List<Map<String, Object>>>) map.get("rule");
		for (List<Map<String, Object>> list : insecurityList) {
			for (Map<String, Object> paramMap : list) {
				if ("insecurity".equals(paramMap.get("key"))) {
					includeInsecurity = true;
					break;
				}
			}
			if (includeInsecurity) break;
		}
		if (includeInsecurity) {
			return "select distinct t from " + clazz.getSimpleName() + " t left join t.insecuritys g where t.deleted = false and (";
		} else {
			return super.getBaseHql(map);
		}
	}
	
	
	@Override
	protected String getQueryParamName(String key) {
		if ("insecurity".equals(key)) return "g.id";
		return super.getQueryParamName(key);
	}
	

	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("insecurity".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz,
			boolean multiple, Field field) {
		String fieldName = field.getName();
		ConsequenceDO consequence = (ConsequenceDO) obj;
		if("name".equals(fieldName)){
			map.put("num", consequence.getNum());
			map.put("name", consequence.getName());
		}else{
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		ConsequenceDO consequenceDO = (ConsequenceDO) obj;
		Set<InsecurityDO> Insecuritys = consequenceDO.getInsecuritys();
		List<Map<String, Object>> securityList = new ArrayList<Map<String, Object>>();
		DictionaryDO dictionary = consequenceDO.getSystem();
		for (InsecurityDO insecurityDO : Insecuritys) {
			Integer id = insecurityDO.getId();
			String num = insecurityDO.getNum();
			String name = insecurityDO.getName();
			if(insecurityDO.isDeleted() == true){
				continue;
			}
			Map<String, Object> inseMap = new HashMap<String, Object>();
			inseMap.put("id", id);
			inseMap.put("num", num);
			inseMap.put("name", name);
			securityList.add(inseMap);
		}
		Collections.sort(securityList, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return (o1.get("num")+"").compareTo(o2.get("num")+"");
			}
		});	
		map.put("insecuritys", securityList);
		if(dictionary != null){
			map.put("systemDisplayName", dictionary.getDisplayName());
		}else{
			map.put("systemDisplayName", null);
		}
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
	
	@SuppressWarnings("unchecked")
	public List<ConsequenceDO> achievelist(String name){
		String sql = "";
		List<ConsequenceDO> list = null;
		if(name != null){
			sql = "from ConsequenceDO c where c.deleted = false and upper(name) like upper(?)";
			list = this.getHibernateTemplate().find(sql,"%"+name+"%");
		}else{
			sql = "from ConsequenceDO c where c.deleted = false";
			list = this.getHibernateTemplate().find(sql);
		}
		return list;
	}
	@SuppressWarnings("unchecked")
	public List<ConsequenceDO> achieveListBySysType(Integer system,String name){
		String sql = "";
		List<ConsequenceDO> list = null;
		if(system == null){
			if(name != null){
				sql = "from ConsequenceDO  where deleted = false and upper(name) like upper(?)";
				list = this.getHibernateTemplate().find(sql,"%"+name+"%");
			}else{
				sql = "from ConsequenceDO  where deleted = false";
				list = this.getHibernateTemplate().find(sql);
			}
		}else{
			if(name != null){
				sql = "from ConsequenceDO  where deleted = false and system.id = ? and upper(name) like upper(?)";
				list = this.getHibernateTemplate().find(sql,system,"%"+name+"%");
			}else{
				sql = "from ConsequenceDO  where deleted = false and system.id = ?";
				list = this.getHibernateTemplate().find(sql,system);
			}
		}
		return list;
	}
	
	@Override
	protected void beforeDelete(Collection<ConsequenceDO> collection) {
		checkManagementPermission();
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 通过名称查找对应的重大风险的记录，如果没有则返回null，否则返回第一条数据
	 */
	public ConsequenceDO getByName(String name){
		if(null == name){
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ConsequenceDO> list = (List<ConsequenceDO>) this.query("from ConsequenceDO t where t.deleted = false and t.name = ?", name);
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
	
	public ConsequenceDao getConsequenceDao() {
		return consequenceDao;
	}
	
	public void setConsequenceDao(ConsequenceDao consequenceDao) {
		this.consequenceDao = consequenceDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
}
