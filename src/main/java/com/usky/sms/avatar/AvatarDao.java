
package com.usky.sms.avatar;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class AvatarDao extends BaseDao<AvatarDO> {
	
	private Config config;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UserDao userDao;
	
	public AvatarDao() {
		super(AvatarDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected void beforeDelete(Collection<AvatarDO> avatars) {
		for (AvatarDO avatar : avatars) {
			String type = avatar.getType();
			if ("user".equals(type)) {
				@SuppressWarnings("unchecked")
				List<UserDO> users = this.getHibernateTemplate().find("from UserDO where avatar = ?", avatar);
				if (users.size() != 1) continue;
				UserDO user = users.get(0);
				user.setAvatar(null);
				userDao.internalUpdate(user);
			} else if ("unit".equals(type)) {
				@SuppressWarnings("unchecked")
				List<UnitDO> units = this.getHibernateTemplate().find("from UnitDO where avatar = ?", avatar);
				if (units.size() != 1) continue;
				UnitDO unit = units.get(0);
				unit.setAvatar(null);
				unitDao.internalUpdate(unit);
			}
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		AvatarDO avatar = (AvatarDO) obj;
		if ("fileName".equals(fieldName)) {
			String url = avatar.getFileName();
			String type = avatar.getType();
			if ("user".equals(type)) {
				url = config.getUserAvatarWebPath() + "/" + url;
			} else if ("unit".equals(type)) {
				url = config.getUnitAvatarWebPath() + "/" + url;
			}
			map.put("url", url);
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	public UnitDao getUnitDao() {
		return unitDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public UserDao getUserDao() {
		return userDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
}
