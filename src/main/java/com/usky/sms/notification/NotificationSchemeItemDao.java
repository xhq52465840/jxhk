
package com.usky.sms.notification;

import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class NotificationSchemeItemDao extends BaseDao<NotificationSchemeItemDO> {
	
	public NotificationSchemeItemDao() {
		super(NotificationSchemeItemDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Integer schemeId = ((Number) map.get("scheme")).intValue();
		String event = (String) map.get("event");
		String type = (String) map.get("type");
		String parameter = (String) map.get("parameter");
		@SuppressWarnings("unchecked")
		List<NotificationSchemeItemDO> list = this.getHibernateTemplate().find("from NotificationSchemeItemDO where scheme.id = ? and event = ? and type = ? and parameter = ?", schemeId, event, type, parameter);
		if (list.size() > 0) return false;
		return true;
	}
	
	public List<NotificationSchemeItemDO> getByNotificationSchemeId(Integer schemeId) {
		@SuppressWarnings("unchecked")
		List<NotificationSchemeItemDO> list = this.getHibernateTemplate().find("from NotificationSchemeItemDO where scheme.id = ?", schemeId);
		return list;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByNotificationScheme(NotificationSchemeDO schemeSrc, NotificationSchemeDO schemeDest) throws Exception {
		List<NotificationSchemeItemDO> srcs = this.getByNotificationScheme(schemeSrc);
		for (NotificationSchemeItemDO src : srcs) {
			NotificationSchemeItemDO dest = new NotificationSchemeItemDO();
			this.copyValues(src, dest);
			dest.setScheme(schemeDest);
			this.internalSave(dest);
		}
	}
	
	public List<NotificationSchemeItemDO> getByNotificationScheme(NotificationSchemeDO scheme) {
		@SuppressWarnings("unchecked")
		List<NotificationSchemeItemDO> list = this.getHibernateTemplate().find("from NotificationSchemeItemDO where scheme = ?", scheme);
		return list;
	}
	
}
