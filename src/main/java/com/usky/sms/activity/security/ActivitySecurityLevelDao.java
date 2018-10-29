
package com.usky.sms.activity.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserService;
import com.usky.sms.user.UserType;

public class ActivitySecurityLevelDao extends BaseDao<ActivitySecurityLevelDO> {
	
	@Autowired
	private ActivitySecurityLevelEntityDao activitySecurityLevelEntityDao;
	
	@Autowired
	private ActivitySecuritySchemeDao activitySecuritySchemeDao;
	
	@Autowired
	private UserService userService;
	
	public ActivitySecurityLevelDao() {
		super(ActivitySecurityLevelDO.class);
	}
	
	@Override
	protected void beforeDelete(Collection<ActivitySecurityLevelDO> levels) {
		if (levels == null || levels.size() == 0) return;
		for (ActivitySecurityLevelDO level : levels) {
			ActivitySecuritySchemeDO scheme = level.getScheme();
			ActivitySecurityLevelDO defaultLevel = scheme.getDefaultLevel();
			if (defaultLevel != null && defaultLevel.getId().equals(level.getId())) {
				scheme.setDefaultLevel(null);
				activitySecuritySchemeDao.internalUpdate(scheme);
			}
		}
		@SuppressWarnings("unchecked")
		List<ActivitySecurityLevelEntityDO> list = this.getHibernateTemplate().findByNamedParam("from ActivitySecurityLevelEntityDO where level in (:levels)", "levels", levels);
		activitySecurityLevelEntityDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<ActivitySecurityLevelEntityDO> entities = activitySecurityLevelEntityDao.getList();
		Map<Integer, List<Map<String, Object>>> idMap = new HashMap<Integer, List<Map<String, Object>>>();
		for (ActivitySecurityLevelEntityDO entity : entities) {
			Integer id = entity.getLevel().getId();
			List<Map<String, Object>> idList = idMap.get(id);
			if (idList == null) {
				idList = new ArrayList<Map<String, Object>>();
				idMap.put(id, idList);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			UserType type = UserType.valueOf(entity.getType());
			map.put("id", entity.getId());
			map.put("type", type.getName());
			String parameter = entity.getParameter();
			if (parameter != null && parameter.trim().length() > 0) {
				map.put("parameter", userService.getUserTypeValueName(type, parameter));
			}
			idList.add(map);
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			map.put("entities", idMap.get(map.get("id")));
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByActivitySecurityScheme(ActivitySecuritySchemeDO schemeSrc, ActivitySecuritySchemeDO schemeDest) throws Exception {
		List<ActivitySecurityLevelDO> srcs = this.getByActivitySecuritySchemeId(schemeSrc.getId());
		for (ActivitySecurityLevelDO src : srcs) {
			ActivitySecurityLevelDO dest = new ActivitySecurityLevelDO();
			this.copyValues(src, dest);
			dest.setScheme(schemeDest);
			this.internalSave(dest);
			activitySecurityLevelEntityDao.copyByActivitySecurityLevel(src, dest);
		}
	}
	
	public List<ActivitySecurityLevelDO> getByActivitySecuritySchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<ActivitySecurityLevelDO> list = this.getHibernateTemplate().find("from ActivitySecurityLevelDO where scheme.id = ?", schemeId);
		return list;
	}
	
	public void setActivitySecurityLevelEntityDao(ActivitySecurityLevelEntityDao activitySecurityLevelEntityDao) {
		this.activitySecurityLevelEntityDao = activitySecurityLevelEntityDao;
	}
	
	public void setActivitySecuritySchemeDao(ActivitySecuritySchemeDao activitySecuritySchemeDao) {
		this.activitySecuritySchemeDao = activitySecuritySchemeDao;
	}
	
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
}
