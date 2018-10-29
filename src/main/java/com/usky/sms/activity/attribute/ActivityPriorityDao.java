
package com.usky.sms.activity.attribute;

import java.util.List;
import java.util.Map;

import com.usky.sms.core.BaseDao;

public class ActivityPriorityDao extends BaseDao<ActivityPriorityDO> {
	
	public ActivityPriorityDao() {
		super(ActivityPriorityDO.class);
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		ActivityPriorityDO defaultPriority = this.getDefaultPriority();
		if (defaultPriority == null || id == defaultPriority.getId()) return;
		defaultPriority.setDefaultValue(false);
		this.internalUpdate(defaultPriority);
	}
	
	public ActivityPriorityDO getDefaultPriority() {
		@SuppressWarnings("unchecked")
		List<ActivityPriorityDO> list = this.getHibernateTemplate().find("from ActivityPriorityDO where defaultValue = ?", true);
		return list.isEmpty() ? null : list.get(0);
	}
	
	/**
	 * 通过名称查找对应的优先级的记录，如果没有则返回null，否则返回第一条数据
	 */
	public ActivityPriorityDO getByName(String name) {
		if (null == name) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ActivityPriorityDO> list = (List<ActivityPriorityDO>) this.query("from ActivityPriorityDO t where t.deleted = false and t.name = ?", name);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}
	
}
