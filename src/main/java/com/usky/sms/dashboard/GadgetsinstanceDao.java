
package com.usky.sms.dashboard;

import java.util.List;
import java.util.Map;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class GadgetsinstanceDao extends BaseDao<GadgetsinstanceDO> {
	
	public GadgetsinstanceDao() {
		super(GadgetsinstanceDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		return true;
	}
	
	public List<GadgetsinstanceDO> getGadgetsinstanceBydashboard(Integer dashboardId) {
		@SuppressWarnings("unchecked")
		List<GadgetsinstanceDO> list = this.getHibernateTemplate().find("from GadgetsinstanceDO where dashboard.id = ? order by position", dashboardId);
		return list;
	}
	
}
