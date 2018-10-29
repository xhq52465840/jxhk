
package com.usky.sms.entity;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class EntityFieldDao extends BaseDao<EntityFieldDO> {
	
	public EntityFieldDao() {
		super(EntityFieldDO.class);
	}
	
	public List<EntityFieldDO> getFieldsByEntityName(String objName) {
		@SuppressWarnings("unchecked")
		List<EntityFieldDO> fields = this.getHibernateTemplate().find("from EntityFieldDO where entity.name = ?", objName);
		return fields;
	}
	
}
