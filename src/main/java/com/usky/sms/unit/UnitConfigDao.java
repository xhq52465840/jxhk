
package com.usky.sms.unit;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class UnitConfigDao extends BaseDao<UnitConfigDO> {
	
	public UnitConfigDao() {
		super(UnitConfigDO.class);
	}
	
	public UnitConfigDO getByUnitId(int unitId) {
		@SuppressWarnings("unchecked")
		List<UnitConfigDO> list = this.getHibernateTemplate().find("from UnitConfigDO where unit.id = ?", unitId);
		if (list.size() > 0) return list.get(0);
		return null;
	}
	
}
