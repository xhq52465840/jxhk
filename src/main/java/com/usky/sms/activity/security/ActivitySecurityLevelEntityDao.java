
package com.usky.sms.activity.security;

import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;

public class ActivitySecurityLevelEntityDao extends BaseDao<ActivitySecurityLevelEntityDO> {
	
	public static final SMSException ACTIVITY_SECURITY_EXIST = new SMSException(MessageCodeConstant.MSG_CODE_114000001);
	
	public ActivitySecurityLevelEntityDao() {
		super(ActivitySecurityLevelEntityDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Integer levelId = ((Number) map.get("level")).intValue();
		String type = (String) map.get("type");
		String parameter = (String) map.get("parameter");
		@SuppressWarnings("unchecked")
		List<ActivitySecurityLevelEntityDO> list = this.getHibernateTemplate().find("from ActivitySecurityLevelEntityDO where level.id = ? and type = ? and parameter = ?", levelId, type, parameter);
		if (list.size() > 0) throw ACTIVITY_SECURITY_EXIST;
		return true;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByActivitySecurityLevel(ActivitySecurityLevelDO levelSrc, ActivitySecurityLevelDO levelDest) throws Exception {
		List<ActivitySecurityLevelEntityDO> srcs = this.getByFieldScreenTab(levelSrc);
		for (ActivitySecurityLevelEntityDO src : srcs) {
			ActivitySecurityLevelEntityDO dest = new ActivitySecurityLevelEntityDO();
			this.copyValues(src, dest);
			dest.setLevel(levelDest);
			this.internalSave(dest);
		}
	}
	
	private List<ActivitySecurityLevelEntityDO> getByFieldScreenTab(ActivitySecurityLevelDO level) {
		@SuppressWarnings("unchecked")
		List<ActivitySecurityLevelEntityDO> list = this.getHibernateTemplate().find("from ActivitySecurityLevelEntityDO where level = ?", level);
		return list;
	}
	
}
