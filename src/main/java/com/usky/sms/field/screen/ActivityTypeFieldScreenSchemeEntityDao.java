
package com.usky.sms.field.screen;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.BaseDao;

public class ActivityTypeFieldScreenSchemeEntityDao extends BaseDao<ActivityTypeFieldScreenSchemeEntityDO> {
	
	public ActivityTypeFieldScreenSchemeEntityDao() {
		super(ActivityTypeFieldScreenSchemeEntityDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ActivityTypeFieldScreenSchemeEntityDO entity = (ActivityTypeFieldScreenSchemeEntityDO) obj;
		if ("type".equals(fieldName)) {
			ActivityTypeDO type = entity.getType();
			if (type == null) {
				map.put("type","默认");
				map.put("typeDescription", "应用于所有未指定的安全信息类型。");
				return;
			} else {
				map.put("typeDescription", type.getDescription());
				map.put("typeUrl", type.getUrl());
			}
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByActivityTypeFieldScreenScheme(ActivityTypeFieldScreenSchemeDO schemeSrc, ActivityTypeFieldScreenSchemeDO schemeDest) throws Exception {
		List<ActivityTypeFieldScreenSchemeEntityDO> srcs = this.getSortedSchemesByActivityTypeFieldScreenSchemeId(schemeSrc.getId());
		List<ActivityTypeFieldScreenSchemeEntityDO> dests = new ArrayList<ActivityTypeFieldScreenSchemeEntityDO>();
		for (ActivityTypeFieldScreenSchemeEntityDO src : srcs) {
			ActivityTypeFieldScreenSchemeEntityDO dest = new ActivityTypeFieldScreenSchemeEntityDO();
			this.copyValues(src, dest);
			dest.setScheme(schemeDest);
			dests.add(dest);
		}
		this.internalSave(dests);
	}

	public List<ActivityTypeFieldScreenSchemeEntityDO> getSortedSchemesByActivityTypeFieldScreenSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<ActivityTypeFieldScreenSchemeEntityDO> list = this.getHibernateTemplate().find("from ActivityTypeFieldScreenSchemeEntityDO where scheme.id = ? order by type", schemeId);
		return list;
    }
	
}
