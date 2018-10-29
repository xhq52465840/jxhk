
package com.usky.sms.risk;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.role.RoleDO;
import com.usky.sms.role.RoleDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

public class RiskTaskSettingDao extends BaseDao<RiskTaskSettingDO> {
	
	public static final SMSException NO_UNIT_ASSOCIATED = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该组织未关联任何安监机构！");
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private RiskTaskActivityTypeEntityDao riskTaskActivityTypeEntityDao;
	
	@Autowired
	private RoleDao roleDao;
	
	public RiskTaskSettingDao() {
		super(RiskTaskSettingDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		RiskTaskSettingDO setting = (RiskTaskSettingDO) obj;
		if ("roles".equals(fieldName)) {
			map.put("roles", roleDao.convert(setting.getRoles()));
			return;
		} else if ("entities".equals(fieldName)) {
			List<Map<String, Object>> riskTaskActivityTypeEntityMaps = new ArrayList<Map<String, Object>>();
			for (RiskTaskActivityTypeEntityDO entity : setting.getEntities()) {
				Map<String, Object> riskTaskActivityTypeEntityMap = new HashMap<String, Object>();
				riskTaskActivityTypeEntityMap.put("activityType", activityTypeDao.convert(entity.getActivityType()));
				riskTaskActivityTypeEntityMaps.add(riskTaskActivityTypeEntityMap);
			}
			map.put("entities", riskTaskActivityTypeEntityMaps);
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	public RiskTaskSettingDO getSetting() {
		List<RiskTaskSettingDO> list = this.getAllList();
		return list.isEmpty() ? null : list.get(0);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public int addRiskTaskSetting(Map<String, Object> map) {
		RiskTaskSettingDO setting = new RiskTaskSettingDO();
		@SuppressWarnings("unchecked")
		List<Number> roleIds = (List<Number>) map.get("roles");
		List<RoleDO> roles = new ArrayList<RoleDO>();
		for (Number roleId : roleIds) {
			RoleDO role = new RoleDO();
			role.setId(roleId.intValue());
			roles.add(role);
		}
		setting.setRoles(roles);
		setting.setEntities(new ArrayList<RiskTaskActivityTypeEntityDO>());
		int id = (int) this.internalSave(setting);
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> entityMaps = (List<Map<String, Object>>) map.get("entities");
		for (Map<String, Object> entityMap : entityMaps) {
			RiskTaskActivityTypeEntityDO entity = new RiskTaskActivityTypeEntityDO();
			entity.setSetting(setting);
			ActivityTypeDO type = new ActivityTypeDO();
			type.setId(((Number) entityMap.get("activityType")).intValue());
			entity.setActivityType(type);
			setting.getEntities().add(entity);
			riskTaskActivityTypeEntityDao.internalSave(entity);
		}
		return id;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateRiskTaskSetting(Map<String, Object> map) {
		int id = ((Number) map.get("id")).intValue();
		RiskTaskSettingDO setting = this.internalGetById(id);
		@SuppressWarnings("unchecked")
		List<Number> roleIds = (List<Number>) map.get("roles");
		List<RoleDO> roles = new ArrayList<RoleDO>();
		for (Number roleId : roleIds) {
			RoleDO role = new RoleDO();
			role.setId(roleId.intValue());
			roles.add(role);
		}
		setting.setRoles(roles);
		riskTaskActivityTypeEntityDao.internalDelete(setting.getEntities());
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> entityMaps = (List<Map<String, Object>>) map.get("entities");
		for (Map<String, Object> entityMap : entityMaps) {
			RiskTaskActivityTypeEntityDO entity = new RiskTaskActivityTypeEntityDO();
			entity.setSetting(setting);
			ActivityTypeDO type = new ActivityTypeDO();
			type.setId(((Number) entityMap.get("activityType")).intValue());
			entity.setActivityType(type);
			setting.getEntities().add(entity);
			riskTaskActivityTypeEntityDao.internalSave(entity);
		}
	}
	
	public List<UserDO> getCreators(int organizationId, List<RoleDO> roles) {
		UnitDO unit = organizationDao.internalGetById(organizationId).getUnit();
		if (unit == null) throw NO_UNIT_ASSOCIATED;
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("organizationId");
		values.add(organizationId);
		paramNames.add("roles");
		values.add(roles);
		@SuppressWarnings("unchecked")
		List<UserDO> users = this.getHibernateTemplate().findByNamedParam("select distinct u1 from OrganizationDO o inner join o.users u1, UnitRoleActorDO a, UserGroupDO g inner join g.users u2 where ((a.type = 'USER' and u1.id = a.parameter) or (a.type = 'USER_GROUP' and u1 = u2 and g.id = a.parameter)) and o.id = :organizationId and a.role in (:roles)", paramNames.toArray(new String[0]), values.toArray());
		return users;
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setRiskTaskActivityTypeEntityDao(RiskTaskActivityTypeEntityDao riskTaskActivityTypeEntityDao) {
		this.riskTaskActivityTypeEntityDao = riskTaskActivityTypeEntityDao;
	}
	
	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}
	
}
