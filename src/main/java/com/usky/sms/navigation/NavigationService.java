package com.usky.sms.navigation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class NavigationService extends AbstractService {

	@Autowired
	private NavigationDao navigationDao;
	@Autowired
	private UserGroupDao userGroupDao;

	public void getNavigation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int userId = UserContext.getUserId();// 获取当前登录的用户
			List<NavigationDO> currList = new ArrayList<NavigationDO>();
			List<UserGroupDO> userGroupList = userGroupDao.getUserGroupByUserId(userId);// 该用户所属的用户组
			List<NavigationDO> naList = navigationDao.getAllList();
			out:for (NavigationDO navigationDO : naList) {
				if (StringUtils.isBlank(navigationDO.getUsergroup())) {
					currList.add(navigationDO);
				} else {
					String userGropups = "," + navigationDO.getUsergroup()+ ",";
					for (UserGroupDO userGroupDO : userGroupList) {
						int userGroupId = userGroupDO.getId();				
						if (userGropups.indexOf("," + userGroupId + ",") > -1) {
							currList.add(navigationDO);
							continue out;
						}
					}
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", navigationDao.convert(currList));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}
	
	public NavigationDao getNavigationDao() {
		return navigationDao;
	}

	public void setNavigationDao(NavigationDao navigationDao) {
		this.navigationDao = navigationDao;
	}

	public UserGroupDao getUserGroupDao() {
		return userGroupDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

}
