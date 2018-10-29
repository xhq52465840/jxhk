
package com.usky.sms.tem;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class TemUnitDao extends BaseDao<TemUnitDO> {
	
	public TemUnitDao() {
		super(TemUnitDO.class);
	}
	
	public List<TemUnitDO> getByActivity(int id) {
		@SuppressWarnings("unchecked")
		List<TemUnitDO> list = this.getHibernateTemplate().find("from TemUnitDO where activity.id = ?", id);
		return list;
	}
	
}
