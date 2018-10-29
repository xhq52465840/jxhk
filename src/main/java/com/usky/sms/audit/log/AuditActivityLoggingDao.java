
package com.usky.sms.audit.log;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeansException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.audit.log.operation.AbstractAuditActivityLoggingOperation;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.utils.SpringBeanUtils;

public class AuditActivityLoggingDao extends BaseDao<AuditActivityLoggingDO> {
	
	private Config config;
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("source".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}

	public AuditActivityLoggingDao() {
		super(AuditActivityLoggingDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		AuditActivityLoggingDO logging = (AuditActivityLoggingDO) obj;
		if ("user".equals(fieldName)) {
			UserDO user = logging.getUser();
			map.put("userId", user.getId());
			map.put("username", user.getUsername());
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
			return;
		} else if ("operation".equals(fieldName)) {
			AbstractAuditActivityLoggingOperation operation = AuditActivityLoggingOperationRegister.getOperation(logging.getOperation());
			map.put("operation", operation.getName());
			map.put("operationPrefix", operation.getPrefix());
			map.put("operationSuffix", operation.getSuffix());
			return;
		} else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(logging.getCreated()));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		AuditActivityLoggingDO auditActivityLogging = (AuditActivityLoggingDO)obj;
		Integer source = auditActivityLogging.getSource();
		String sourceType = auditActivityLogging.getSourceType();
		if (source == null) throw SMSException.NO_ENTRY_SELECTED;
		AbstractBaseDO result = getDataAccessObject(sourceType).internalGetById(source);
		if (result instanceof IDisplayable) {
			map.put("name", ((IDisplayable)result).getDisplayName());
		}
		AbstractAuditActivityLoggingOperation operation = AuditActivityLoggingOperationRegister.getOperation(auditActivityLogging.getOperation());
		map.put("remark", operation.getRemark(auditActivityLogging.getData()));
		map.put("details", operation.getDetails(auditActivityLogging.getData()));
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void addLogging(int source, String sourceType, AbstractAuditActivityLoggingOperation operation) {
		AuditActivityLoggingDO logging = new AuditActivityLoggingDO();
		logging.setSource(source);
		logging.setSourceType(sourceType);
		logging.setOperation(operation.getName());
		logging.setUser(UserContext.getUser());
		logging.setData(operation.getData());
		this.internalSave(logging);
	}
	
	/**
	 * 获取数据访问对象的实体（*Dao）
	 * @param objName
	 * @return
	 */
	@SuppressWarnings("unchecked")
	protected static BaseDao<? extends AbstractBaseDO> getDataAccessObject(String objName) {
		try {
			return (BaseDao<? extends AbstractBaseDO>) SpringBeanUtils.getBean(objName + "Dao");
		} catch (BeansException e) {
			throw SMSException.NO_MATCHABLE_OBJECT;
		}
	}
	
}
