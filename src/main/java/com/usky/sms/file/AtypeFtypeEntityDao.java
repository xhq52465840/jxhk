package com.usky.sms.file;

import java.util.List;
import java.util.Map;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.directory.EnumSafetyInfoType;

public class AtypeFtypeEntityDao extends BaseDao<AtypeFtypeEntityDO> {

	protected AtypeFtypeEntityDao() {
		super(AtypeFtypeEntityDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		if (map.containsKey("fileTypeKey")) {
			map.put("fileTypeName", EnumSafetyInfoType.getEnumByVal(((Number) map.get("fileTypeKey")).intValue() + "").getName());
		}
		return super.beforeSave(map);
	}
	
	public List<AtypeFtypeEntityDO> getAtypeFtypeEntityByActivityType(ActivityTypeDO activityType) {
		@SuppressWarnings("unchecked")
		List<AtypeFtypeEntityDO> list = this.getHibernateTemplate().find("from AtypeFtypeEntityDO where activityType= ?", activityType);
		return list;
	}
}
