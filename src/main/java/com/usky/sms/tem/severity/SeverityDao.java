package com.usky.sms.tem.severity;

import java.util.ArrayList;
import java.util.Collection;
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
import com.usky.sms.user.UserContext;

public class SeverityDao extends BaseDao<SeverityDO> {

	@Autowired
	private PermissionSetDao permissionSetDao;

	protected SeverityDao() {
		super(SeverityDO.class);
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj,
			Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		SeverityDO severityDO = (SeverityDO) obj;
		Set<ProvisionDO> provisions = severityDO.getProvisions();
		List<Map<String, Object>> levelList = new ArrayList<Map<String, Object>>();
		for (ProvisionDO levelDO : provisions) {
			if (levelDO.isDeleted())
				continue;
			Integer id = levelDO.getId();
			String name = levelDO.getName();
			Integer score = levelDO.getScore();
			Map<String, Object> levelMap = new HashMap<String, Object>();
			levelMap.put("id", id);
			levelMap.put("name", name);
			levelMap.put("score", score);
			levelList.add(levelMap);
		}
		map.put("provisions", levelList);
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	public List<SeverityDO> seachAll() {
		String sql = "from SeverityDO where deleted = false";
		List<SeverityDO> list = this.getHibernateTemplate().find(sql);
		return list;
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
	protected void beforeDelete(Collection<SeverityDO> collection) {
		checkManagementPermission();
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 通过名称查找对应的严重等级的记录，如果没有则返回null，否则返回第一条数据
	 */
	public SeverityDO getByName(String name){
		if(null == name){
			return null;
		}
		@SuppressWarnings("unchecked")
		List<SeverityDO> list = (List<SeverityDO>) this.query("from SeverityDO t where t.deleted = false and t.name = ?", name);
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
