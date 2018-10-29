
package com.usky.sms.dictionary;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class DictionaryService extends AbstractService {
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	public void publishUserDefaultSetting(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<DictionaryDO> dicts = dictionaryDao.getListByType(DictionaryDao.USER_DEFAULT_SETTING);
			List<UserDO> users = userDao.getAllList();
			for (UserDO user : users) {
				for (DictionaryDO dict : dicts) {
					String key = dict.getKey();
					if (DictionaryDao.USER_DEFAULT_SETTING_KEYS[0].equals(key)) {
						if (user.getEmailFormat() == null) continue;
						user.setEmailFormat(dict.getValue());
					} else if (DictionaryDao.USER_DEFAULT_SETTING_KEYS[1].equals(key)) {
						if (user.getPageDisplayNum() == null) continue;
						user.setPageDisplayNum(dict.getValue());
					} else if (DictionaryDao.USER_DEFAULT_SETTING_KEYS[2].equals(key)) {
						if (user.getDefaultAccess() == null) continue;
						user.setDefaultAccess(dict.getValue());
					} else if (DictionaryDao.USER_DEFAULT_SETTING_KEYS[3].equals(key)) {
						if (user.getEmailUser() == null) continue;
						user.setEmailUser(dict.getValue());
					} else if (DictionaryDao.USER_DEFAULT_SETTING_KEYS[4].equals(key)) {
						if (user.getAutoWatch() == null) continue;
						user.setAutoWatch(dict.getValue());
					}
				}
				userDao.update(user);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取管理TEM字典的全限
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getManageTemDictionaryPermission(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			Map<String, Boolean> managable = new HashMap<String, Boolean>();
			managable.put("manageable", permissionSetDao.hasPermission(PermissionSets.MANAGE_TEM_DICTIONARY.getName()));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", managable);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
}
