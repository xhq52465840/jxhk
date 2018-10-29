package com.usky.sms.section;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.directory.DirectoryDO;
import com.usky.sms.directory.DirectoryDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;

public class SectionDao extends BaseDao<SectionDO> {
	@Autowired
	private DirectoryDao directoryDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;

	public SectionDao() {
		super(SectionDO.class);
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	protected void afterSave(SectionDO section) {
		Integer directoryId = section.getDirectory().getId();
		DirectoryDO directory = (DirectoryDO) directoryDao.internalGetById(directoryId);
		directory.setLastUpdate();
		directoryDao.update(directory);
	}

	@Override
	public void afterUpdate(SectionDO section, SectionDO dbsection) {
		DirectoryDO directory = section.getDirectory();
		directory.setLastUpdate(section.getLastUpdate());
		directoryDao.update(directory);
	}

	@Override
	protected void afterDelete(Collection<SectionDO> sections) {
		for (SectionDO section : sections) {
			Integer directoryId = section.getDirectory().getId();
			DirectoryDO directory = directoryDao.internalGetById(directoryId);
			directory.setLastUpdate();
			directoryDao.update(directory);
		}
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 是否有管理图书馆的全局权限
		checkModifyPermission();
		super.beforeUpdate(id, map);
	}

	@Override
	protected void beforeUpdate(SectionDO obj) {
		// 是否有管理图书馆的全局权限
		checkModifyPermission();
		super.beforeUpdate(obj);
	}

	@Override
	protected void beforeDelete(Collection<SectionDO> collection) {
		// 是否有管理图书馆的全局权限
		checkModifyPermission();
		super.beforeDelete(collection);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 是否有管理图书馆的全局权限
		checkModifyPermission();
		
		Double directoryId = (Double) map.get("directory");

		List<Integer> sortkeys = getMaxSectionSortKey(directoryId.intValue());
		if (sortkeys.isEmpty() || null == sortkeys.get(0)) {
			map.put("sortKey", 0.0);
		} else {
			map.put("sortKey", sortkeys.get(0).doubleValue() + 1);
		}
		return true;
	}
	
	/**
	 * 检查是否有管理图书馆的全局权限
	 */
	public void checkModifyPermission(){
		// 是否有管理图书馆的全局权限
		if (!permissionSetDao.hasPermission(PermissionSets.MANAGE_SAFETY_LIBRARY.getName())) {
			throw SMSException.NO_ACCESS_RIGHT;
		}
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sort(Integer[] ids) {
		int sequence = 0;
		for (Integer id : ids) {
			SectionDO item = this.internalGetById(id);
			item.setSortKey(sequence++);
		}
	}

	@SuppressWarnings("unchecked")
	public List<Integer> getMaxSectionSortKey(Integer directoryId) {
		return (List<Integer>) this.query(
				"select max(sortKey) from SectionDO where directory.id = ? and deleted = false", directoryId);
	}

	/**
	 * @param directoryDao
	 *            the directoryDao to set
	 */
	public void setDirectoryDao(DirectoryDao directoryDao) {
		this.directoryDao = directoryDao;
	}

	/**
	 * @param permissionSetDao the permissionSetDao to set
	 */
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

}
