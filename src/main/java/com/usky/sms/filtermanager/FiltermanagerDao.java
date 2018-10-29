
package com.usky.sms.filtermanager;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.menu.IMenu;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuItem;
import com.usky.sms.subscribe.SubscribeDO;
import com.usky.sms.subscribe.SubscribeDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class FiltermanagerDao extends BaseDao<FiltermanagerDO> implements IMenu {

	public static final SMSException EXIST_SAME_FILTERMANAGER = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "已存在相同名称的过滤器！");
	
	private Config config;
	
	public FiltermanagerDao() {
		super(FiltermanagerDO.class);
		this.config = Config.getInstance();
	}
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private SubscribeDao subscribeDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private MenuCache menuCache;
	
	protected static Gson gson = GsonBuilder4SMS.getInstance();
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		if ("name".equals(fieldName)) {
			FiltermanagerDO filtermanagerDO = (FiltermanagerDO) obj;
			List<SubscribeDO> list = subscribeDao.getByFiltermanager(filtermanagerDO);
			map.put("SubscribeList", subscribeDao.convert(list));
			UserDO userInfo = userDao.internalGetById(UserContext.getUserId());
			String userColumns = userInfo.getColumns();
			map.put("userColumns", userColumns);
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(null, map);
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		if (map.get("paladin") == null) map.put("paladin", null);
		if (map.get("description") == null) map.put("description", null);
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkConstraints(id, map);
		map.put("lastUpdater", UserContext.getUserId());
		FiltermanagerDO filtermanager = this.internalGetById(id);
		if (map.get("charnelThose") != null) {
			Integer charnelThose = Integer.parseInt(map.get("charnelThose").toString());
			map.remove("charnelThose");
			String currCharnelThose = filtermanager.getCharnelThose() == null ? "" : filtermanager.getCharnelThose();
			if (charnelThose == 0) {
				if (currCharnelThose.indexOf("," + UserContext.getUserId() + ",") > -1) {
					currCharnelThose = currCharnelThose.replaceAll("," + UserContext.getUserId() + ",", ",");
					if (",".equals(currCharnelThose)) {
						currCharnelThose = "";
					}
					map.put("charnelThose", currCharnelThose);
				}
			} else if (charnelThose == 1) {
				if (currCharnelThose.indexOf("," + UserContext.getUserId() + ",") < 0) {
					if ("".equals(currCharnelThose)) {
						currCharnelThose = "," + UserContext.getUserId() + ",";
					} else {
						currCharnelThose += UserContext.getUserId() + ",";
					}
					map.put("charnelThose", currCharnelThose);
				}
			}
		}
	}
	
	private void checkConstraints(Integer id, Map<String, Object> map) {
		if (map.containsKey("name")) {
			String name = (String) map.get("name");
			checkFieldLimit(name);
			checkDuplicate(id, name);
		}
	}
	
	private void checkFieldLimit(String name) {
		if (name.length() > 50) throw new SMSException(SMSException.FIELD_OUT_OF_LIMIT, "name");
	}
	
	private void checkDuplicate(Integer id, String name) {
		@SuppressWarnings("unchecked")
		List<FiltermanagerDO> list = this.getHibernateTemplate().find("from FiltermanagerDO where creator.id = ? and name = ?", UserContext.getUserId(), name);
		int size = list.size();
		if (size > 1 || (size == 1 && !list.get(0).getId().equals(id))) throw EXIST_SAME_FILTERMANAGER;
	}
	
	@Override
	protected void beforeDelete(Collection<FiltermanagerDO> collection) {
		for (FiltermanagerDO filterManager : collection) {
			List<SubscribeDO> list = subscribeDao.getByFiltermanager(filterManager);
			subscribeDao.internalDelete(list);
		}
	}
	
	public Map<String, Object> favorFiltermanager(Integer filtermanagerId, Integer userId, Integer charnelThose) throws Exception {
		FiltermanagerDO filtermanager = this.internalGetById(filtermanagerId);
		String currCharnelThose = filtermanager.getCharnelThose() == null ? "" : filtermanager.getCharnelThose();
		if (charnelThose == 0) {
			if (currCharnelThose.indexOf("," + userId + ",") > -1) {
				currCharnelThose = currCharnelThose.replaceAll("," + userId + ",", ",");
				if (",".equals(currCharnelThose)) {
					currCharnelThose = "";
				}
				filtermanager.setCharnelThose(currCharnelThose);
			}
		} else if (charnelThose == 1) {
			if (currCharnelThose.indexOf("," + userId + ",") < 0) {
				if ("".equals(currCharnelThose)) {
					currCharnelThose = "," + userId + ",";
				} else {
					currCharnelThose += userId + ",";
				}
				filtermanager.setCharnelThose(currCharnelThose);
			}
		}
		this.internalSave(filtermanager);
		return convert(filtermanager);
	}
	
	public Map<String, Object> copyFiltermanager(Integer filtermanagerId, String filtermanagerName) throws Exception {
		checkFieldLimit(filtermanagerName);
		checkDuplicate(filtermanagerId, filtermanagerName);
		FiltermanagerDO filtermanager = this.internalGetById(filtermanagerId);
		UserDO user = UserContext.getUser();
		String charnelThose = "," + user.getId() + ",";
		FiltermanagerDO newFiltermanager = new FiltermanagerDO();
		newFiltermanager.setCreator(user);
		newFiltermanager.setLastUpdater(user);
		newFiltermanager.setDescription(filtermanager.getDescription());
		newFiltermanager.setFilterRule(filtermanager.getFilterRule());
		newFiltermanager.setName(filtermanagerName);
		newFiltermanager.setPaladin(null);
		newFiltermanager.setCharnelThose(charnelThose);
		this.internalSave(newFiltermanager);
		return convert(newFiltermanager);
	}
	
	public List<FiltermanagerDO> filterFiltermanager(String method, String param) throws Exception {
		StringBuffer sqlstr = new StringBuffer();
		// 当前用户
		Integer userId = UserContext.getUserId();
		// 当前用户所属用户组
		List<UserGroupDO> userGroup = userGroupDao.getUserGroupByUserId(UserContext.getUserId());
		if ("F".equals(method)) {//获取收藏的过滤器
			sqlstr.append("charnelThose like '%," + userId + ",%' ");
			sqlstr.append("and (creator.id=" + userId + " or paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
			sqlstr.append(")");
		} else if ("H".equals(method)) {//获取热门过滤器
			sqlstr.append("paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
		} else if ("M".equals(method)) {//获取我的过滤器
			sqlstr.append("creator.id=" + userId);
		} else if ("S".equals(method)) {//获取共享的过滤器（包含我的）
			sqlstr.append("(creator.id=" + userId + " or paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
			sqlstr.append(") ");
			// 查询参数
			Map<String, Object> paramMap = gson.fromJson(param, new TypeToken<Map<String, Object>>() {}.getType());
			if (paramMap != null) {
				String content = paramMap.get("content") == null ? "" : paramMap.get("content").toString();
				sqlstr.append("and name like '%" + content + "%' ");
				String creator = paramMap.get("creator") == null ? null : paramMap.get("creator").toString();
				if (creator != null) {
					sqlstr.append("and creator.id=" + creator + " ");
				}
				String paladin = paramMap.get("paladin") == null ? "" : paramMap.get("paladin").toString();
				sqlstr.append("and paladin like '%" + paladin + "%' ");
			}
		} else if ("MS".equals(method)) {//获取我共享的过滤器
			sqlstr.append("(paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
			sqlstr.append(") ");
			// 查询参数
			Map<String, Object> paramMap = gson.fromJson(param, new TypeToken<Map<String, Object>>() {}.getType());
			if (paramMap != null) {
				String content = paramMap.get("content") == null ? "" : paramMap.get("content").toString();
				sqlstr.append("and upper(name) like upper('%" + content + "%') ");
				String creator = paramMap.get("creator") == null ? null : paramMap.get("creator").toString();
				if (creator != null) {
					sqlstr.append("and creator.id=" + creator + " ");
				}
				String paladin = paramMap.get("paladin") == null ? "" : paramMap.get("paladin").toString();
				sqlstr.append("and paladin like '%" + paladin + "%' ");
			}
		} else if ("SYS".equals(method)) {
			sqlstr.append("id < 0");
		}
		@SuppressWarnings("unchecked")
		List<FiltermanagerDO> list = this.getHibernateTemplate().find("from FiltermanagerDO where " + sqlstr.toString() + "order by id asc");
		return list;
	}
	
	@Override
	public List<Map<String, Object>> getSubMenus(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if ("安全信息/过滤器".equals(path)) {
			try {
				List<FiltermanagerDO> sysList = this.filterFiltermanager("SYS", null);
				for (FiltermanagerDO filtermanagerDO : sysList) {
					Map<String, Object> menuMap = new HashMap<String, Object>();
					menuMap.put("name", filtermanagerDO.getName());
					menuMap.put("type", "filtermanager");
					menuMap.put("url", config.getActivitySearchPageUrl() + "?filterId=" + filtermanagerDO.getId());
					list.add(menuMap);
				}
				List<FiltermanagerDO> favList = this.filterFiltermanager("F", null);
				for (FiltermanagerDO filtermanagerDO : favList) {
					Map<String, Object> menuMap = new HashMap<String, Object>();
					menuMap.put("name", filtermanagerDO.getName());
					menuMap.put("type", "filtermanager");
					menuMap.put("url", config.getActivitySearchPageUrl() + "?filterId=" + filtermanagerDO.getId());
					list.add(menuMap);
				}
			} catch (Exception e) {
				e.printStackTrace();
				throw SMSException.UNKNOWN_EXCEPTION;
			}
		}
		return list;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
	public void setSubscribeDao(SubscribeDao subscribeDao) {
		this.subscribeDao = subscribeDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}
}
