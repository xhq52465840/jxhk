
package com.usky.sms.bulletin;

import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class BulletinDao extends BaseDao<BulletinDO> {
	
	public BulletinDao() {
		super(BulletinDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		BulletinDO matrix = (BulletinDO) obj;
		map.put("lastUpdate", DateHelper.formatIsoSecond(matrix.getLastUpdate()));
		map.put("created", DateHelper.formatIsoSecond(matrix.getCreated()));
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
	}
}
