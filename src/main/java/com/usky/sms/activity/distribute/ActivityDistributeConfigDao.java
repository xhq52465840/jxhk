
package com.usky.sms.activity.distribute;

import java.io.Serializable;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.role.RoleDO;
import com.usky.sms.role.RoleDao;

public class ActivityDistributeConfigDao extends BaseDao<ActivityDistributeConfigDO> {
	
	/** 安监机构{@value} */
	public static final String UNIT_TYPE_UT = "UT";
	
	/** 组织{@value} */
	public static final String UNIT_TYPE_DP = "DP";
	
	@Autowired
	private RoleDao roleDao;
	
	public ActivityDistributeConfigDao() {
		super(ActivityDistributeConfigDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		ActivityDistributeConfigDO activityDistributeConfig = (ActivityDistributeConfigDO) obj;
		if ("roles".equals(field.getName())) {
			Set<RoleDO> roles = activityDistributeConfig.getRoles();
			if (roles != null) {
				map.put(field.getName(), roleDao.convert(new ArrayList<RoleDO>(roles), false));
			}
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	public Serializable internalSave(ActivityDistributeConfigDO obj) {
		try {
			return super.internalSave(obj);
		} catch (ConstraintViolationException e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_101002012);
		}
	}

	@Override
	public boolean internalUpdate(ActivityDistributeConfigDO obj) {
		try {
			return super.internalUpdate(obj);
		} catch (ConstraintViolationException e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_101002012);
		}
	}

	/**
	 * 根据源类型获取配置信息
	 * @param sourceTypeId 源安全信息类型
	 * @param unitType 机构类别
	 * @return
	 */
	public ActivityDistributeConfigDO getBySourceTypeAndUnitType(Integer sourceTypeId, String unitType) {
		if (sourceTypeId == null || unitType == null) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ActivityDistributeConfigDO> activityDistributeConfigs = (List<ActivityDistributeConfigDO>) this.query("from ActivityDistributeConfigDO t where t.deleted = false and t.sourceType.id = ? and t.unitType = ?", sourceTypeId, unitType);
		return activityDistributeConfigs.isEmpty() ? null : activityDistributeConfigs.get(0);
	}

	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}
	
}
