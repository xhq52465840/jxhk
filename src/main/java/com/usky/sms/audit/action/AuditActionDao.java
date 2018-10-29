
package com.usky.sms.audit.action;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.audit.IAudit;
import com.usky.sms.audit.log.AuditActivityLoggingDO;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.utils.SpringBeanUtils;

public class AuditActionDao extends BaseDao<AuditActionDO> {
	
	private Config config;
	
	@Autowired
	private AuditActivityLoggingDao auditActivityLoggingDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	public AuditActionDao() {
		super(AuditActionDO.class);
		this.config = Config.getInstance();
	}
	

	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("source".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(map);
		return super.beforeSave(map);
	}
	
	@Override
	protected void afterSave(AuditActionDO auditAction) {
		UserDO user = UserContext.getUser();
		auditAction.setAuthor(user);
		auditAction.setUpdatedAuthor(user);
		this.internalUpdate(auditAction);
		MDC.put("auditActionId", auditAction.getId());
		// TODO
		auditActivityLoggingDao.addLogging(auditAction.getSource(), auditAction.getSourceType(), AuditActivityLoggingOperationRegister.getOperation("AUDIT_COMMENTED"));
		MDC.remove("auditAction");
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkConstraints(map);
		map.put("updatedAuthor", UserContext.getUserId());
	}
	
	@Override
	protected void afterDelete(Collection<AuditActionDO> auditActions) {
		if (auditActions.size() == 0) return;
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		StringBuilder hql = new StringBuilder("from AuditActivityLoggingDO where operation = :operation and (");
		paramNames.add("operation");
		values.add("AUDIT_COMMENTED");
		int i = 0;
		for (AuditActionDO auditAction : auditActions) {
			String sourceIdName = "sourceId" + i;
			String sourceTypeName = "sourceType" + i;
			String dataName = "data" + i;
			hql.append("(source = :" + sourceIdName + " and sourceType = :" + sourceTypeName + " and to_char(substr(data, 0, 2000)) = :" + dataName + ") or ");
			paramNames.add(sourceIdName);
			values.add(auditAction.getSource());
			paramNames.add(sourceTypeName);
			values.add(auditAction.getSourceType());
			paramNames.add(dataName);
			values.add(auditAction.getId().toString());
			i++;
		}
		int length = hql.length();
		hql.delete(length - 4, length).append(")");
		@SuppressWarnings("unchecked")
		List<AuditActivityLoggingDO> loggings = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		auditActivityLoggingDao.internalDelete(loggings);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		AuditActionDO action = (AuditActionDO) obj;
		if ("author".equals(fieldName)) {
			UserDO user = action.getAuthor();
			map.put("userId", user.getId());
			map.put("username", user.getUsername());
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
			return;
		} else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(action.getCreated()));
		} else if ("lastUpdate".equals(fieldName)) {
			map.put("lastDate", DateHelper.formatIsoSecond(action.getLastUpdate()));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		if (list.isEmpty()) return;
		int sourceId = (Integer) list.get(0).get("source");
		String sourceType = (String) list.get(0).get("sourceType");
		@SuppressWarnings("unchecked")
		BaseDao<? extends AbstractBaseDO> baseDao = (BaseDao<? extends AbstractBaseDO>)SpringBeanUtils.getBean(sourceType + "Dao");
		Integer unitId = null;
		if (baseDao instanceof IAudit) {
			unitId = ((IAudit) baseDao).getRelatedUnitId(sourceId);
		}
		// 权限控制
		// 编辑所有的
		boolean editAll = false;
		// 编辑自己的
		boolean editSelf = false;
		// 删除所有的
		boolean deleteAll = false;
		// 删除自己的
		boolean deleteSelf = false;
		if (null != unitId) {
			editAll = permissionSetDao.hasUnitPermission(unitId, PermissionSets.EDIT_REMARK.getName());
			editSelf = editAll || permissionSetDao.hasUnitPermission(unitId, PermissionSets.EDIT_SELF_REMARK.getName());
			deleteAll = permissionSetDao.hasUnitPermission(unitId, PermissionSets.DELETE_REMARK.getName());
			deleteSelf = deleteAll
					|| permissionSetDao.hasUnitPermission(unitId, PermissionSets.DELETE_SELF_REMARK.getName());
		}
		for (Map<String, Object> map : list) {
			map.put("editable", editAll || (editSelf && UserContext.getUserId().equals(map.get("userId"))));
			map.put("deletable", deleteAll || (deleteSelf && UserContext.getUserId().equals(map.get("userId"))));
		}
	}
	
	private void checkConstraints(Map<String, Object> map) {
		String body = (String) map.get("body");
		checkFieldLimit(body);
	}
	
	private void checkFieldLimit(String body) {
		if (body != null && body.length() > 4000) throw new SMSException(SMSException.FIELD_OUT_OF_LIMIT, "body");
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setAuditActivityLoggingDao(AuditActivityLoggingDao auditActivityLoggingDao) {
		this.auditActivityLoggingDao = auditActivityLoggingDao;
	}
	
}
