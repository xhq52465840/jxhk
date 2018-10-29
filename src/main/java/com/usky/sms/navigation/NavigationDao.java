
package com.usky.sms.navigation;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class NavigationDao extends BaseDao<NavigationDO> {
	
	public static final SMSException NAVIGATION_EXIST = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此条应用程序导航栏记录已存在！");
	
	protected NavigationDao() {
		super(NavigationDO.class);
	}
	
	@Autowired
	protected UserGroupDao userGroupDao;
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		String usergroupid = map.get("usergroup") == null ? null : map.get("usergroup").toString();
		if (usergroupid == null || "".equals(usergroupid)) {
			map.put("usergroupname", "");
		} else {
			String[] ids = usergroupid.split(",");
			String[] names = new String[ids.length];
			for (int i = 0; i < ids.length; i++) {
				UserGroupDO userGroup = userGroupDao.internalGetById(Integer.parseInt(ids[i]));
				if (userGroup == null) {
					continue;
				}
				names[i] = userGroup.getName();
			}
			map.put("usergroupname", StringUtils.join(names, ","));
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		String name = (String) map.get("name");
		@SuppressWarnings("unchecked")
		List<NavigationDO> list = this.getHibernateTemplate().find(" from NavigationDO where deleted = false and name = ?", name);
		if (list.size() > 0) throw NAVIGATION_EXIST;
		map.put("creator", UserContext.getUserId());
		map.put("updater", UserContext.getUserId());
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		String name = (String) map.get("name");
		@SuppressWarnings("unchecked")
		List<NavigationDO> list = this.getHibernateTemplate().find(" from NavigationDO where deleted = false and name = ?", name);
		if (list.size() >= 1 && list.get(0).getId() != id) throw NAVIGATION_EXIST;
		map.put("updater", UserContext.getUserId());
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
}
