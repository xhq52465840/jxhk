
package com.usky.sms.entity;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class EntityDao extends BaseDao<EntityDO> {
	
	public EntityDao() {
		super(EntityDO.class);
	}
	
	public List<EntityDO> getEntitiesByName(String objName) {
		@SuppressWarnings("unchecked")
		List<EntityDO> list = this.getHibernateTemplate().find("from EntityDO where name = ?", objName);
		return list;
	}
	
}
