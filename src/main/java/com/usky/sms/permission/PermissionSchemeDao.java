
package com.usky.sms.permission;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDao;

public class PermissionSchemeDao extends BaseDao<PermissionSchemeDO> {
	
	@Autowired
	private PermissionSchemeItemDao permissionSchemeItemDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	public PermissionSchemeDao() {
		super(PermissionSchemeDO.class);
	}
	
	@Override
	protected void beforeDelete(Collection<PermissionSchemeDO> schemes) {
		if (schemes == null || schemes.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<PermissionSchemeItemDO> list = this.getHibernateTemplate().findByNamedParam("from PermissionSchemeItemDO where scheme in (:schemes)", "schemes", schemes);
		permissionSchemeItemDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<UnitConfigDO> configs = unitConfigDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idUnitsMap = new HashMap<Integer, List<Map<String, Object>>>();
		List<String> fields = Arrays.asList(new String[] { "id", "name" });
		for (UnitConfigDO config : configs) {
			Integer id = config.getPermissionScheme().getId();
			List<Map<String, Object>> units = idUnitsMap.get(id);
			if (units == null) {
				units = new ArrayList<Map<String, Object>>();
				idUnitsMap.put(id, units);
			}
			units.add(unitDao.convert(config.getUnit(), fields));
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			map.put("units", idUnitsMap.get(map.get("id")));
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		PermissionSchemeDO src = this.internalGetById(id);
		PermissionSchemeDO dest = new PermissionSchemeDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		dest.setType(null);
		this.internalSave(dest);
		permissionSchemeItemDao.copyByPermissionScheme(src, dest);
	}
	
	public PermissionSchemeDO getDefaultScheme() {
		@SuppressWarnings("unchecked")
		List<PermissionSchemeDO> list = this.getHibernateTemplate().find("from PermissionSchemeDO where type = ?", "default");
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	public void setPermissionSchemeItemDao(PermissionSchemeItemDao permissionSchemeItemDao) {
		this.permissionSchemeItemDao = permissionSchemeItemDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
}
