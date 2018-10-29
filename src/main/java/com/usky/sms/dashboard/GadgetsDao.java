
package com.usky.sms.dashboard;

import java.util.Map;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class GadgetsDao extends BaseDao<GadgetsDO> {
	
	public GadgetsDao() {
		super(GadgetsDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		return true;
	}
	
}
