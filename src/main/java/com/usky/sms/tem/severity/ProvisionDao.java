package com.usky.sms.tem.severity;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.user.UserContext;

public class ProvisionDao extends BaseDao<ProvisionDO> {

	@Autowired
	private PermissionSetDao permissionSetDao;

	protected ProvisionDao() {
		super(ProvisionDO.class);
		// TODO Auto-generated constructor stub
	}

	@Override
	protected void beforeDelete(Collection<ProvisionDO> collection) {
		checkManagementPermission();
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
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
	
	/**
	 * 通过严重等级查找对应的对应条款的记录，如果没有则返回null，否则返回第一条数据
	 */
	public ProvisionDO getBySeverity(SeverityDO severity){
		if(null == severity){
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ProvisionDO> list = (List<ProvisionDO>) this.query("from ProvisionDO t  where t.deleted = false and t.severity.id = ?", severity.getId());
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
