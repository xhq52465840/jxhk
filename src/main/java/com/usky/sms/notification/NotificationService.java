
package com.usky.sms.notification;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.event.Event;
import com.usky.sms.event.EventRegister;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserService;
import com.usky.sms.user.UserType;

public class NotificationService extends AbstractService {
	
	private Config config;
	
	@Autowired
	private EventRegister eventRegister;
	
	@Autowired
	private NotificationSchemeDao notificationSchemeDao;
	
	@Autowired
	private NotificationSchemeItemDao notificationSchemeItemDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	@Autowired
	private UserService userService;
	
	public NotificationService() {
		super();
		this.config = Config.getInstance();
	}
	
	public void copyNotificationScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("notificationScheme"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			notificationSchemeDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getNotificationSchemeItems(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			boolean manage = Boolean.parseBoolean(request.getParameter("manage"));
			Integer unitId = null;
			int schemeId;
			UnitConfigDO config = null;
			String notificationSchemeName;
			if (manage) {
				schemeId = Integer.parseInt(request.getParameter("notificationScheme"));
				notificationSchemeName = notificationSchemeDao.internalGetById(schemeId).getName();
			} else {
				unitId = Integer.parseInt(request.getParameter("unit"));
				config = unitConfigDao.getByUnitId(unitId);
				schemeId = config.getNotificationScheme().getId();
				notificationSchemeName = config.getNotificationScheme().getName();
			}
			List<NotificationSchemeItemDO> items = notificationSchemeItemDao.getByNotificationSchemeId(schemeId);
			Map<String, List<Map<String, Object>>> eventItemsMap = new HashMap<String, List<Map<String, Object>>>();
			for (NotificationSchemeItemDO item : items) {
				String event = item.getEvent();
				List<Map<String, Object>> itemMaps = eventItemsMap.get(event);
				if (itemMaps == null) {
					itemMaps = new ArrayList<Map<String, Object>>();
					eventItemsMap.put(event, itemMaps);
				}
				Map<String, Object> itemMap = new HashMap<String, Object>();
				itemMap.put("id", item.getId());
				UserType type = UserType.valueOf(item.getType());
				itemMap.put("type", type.getName());
				String parameter = item.getParameter();
				if (parameter != null && parameter.trim().length() > 0) {
					itemMap.put("parameter", userService.getUserTypeValueName(type, parameter));
				}
				itemMaps.add(itemMap);
			}
			List<Map<String, Object>> eventMaps = new ArrayList<Map<String, Object>>();
			for (Event event : eventRegister.getEvents()) {
				Map<String, Object> eventMap = new HashMap<String, Object>();
				eventMap.put("name", event.getName());
				eventMap.put("code", event.getCode());
				eventMap.put("system", EventRegister.SYSTEM_EVENT.equals(event.getType()));
				eventMap.put("items", eventItemsMap.get(event.getCode()));
				eventMaps.add(eventMap);
			}
			List<UnitDO> units = unitDao.getByNotificationSchemeId(schemeId);
			List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
			for (UnitDO unit : units) {
				Map<String, Object> unitMap = new HashMap<String, Object>();
				unitMap.put("id", unit.getId());
				unitMap.put("name", unit.getName());
				unitMap.put("code", unit.getCode());
				if (unit.getAvatar() == null) {
					unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + this.config.getDefaultUnitAvatar());
				} else {
					unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + unit.getAvatar().getFileName());
				}
				unitMaps.add(unitMap);
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("id", schemeId);
			data.put("name", notificationSchemeName);
			data.put("events", PageHelper.getPagedResult(eventMaps, request));
			data.put("units", unitMaps);
			data.put("editable", manage);
			if (!manage) {
				data.put("action", permissionSetDao.hasPermission(PermissionSets.ADMIN.getName()) ? new String[] { "编辑通知方案", "使用不同的方案" } : new String[] { "使用不同的方案" });
				data.put("config", config.getId());
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
			//		} catch (SMSException e) {
			//			e.printStackTrace();
			//			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setEventRegister(EventRegister eventRegister) {
		this.eventRegister = eventRegister;
	}
	
	public void setNotificationSchemeDao(NotificationSchemeDao notificationSchemeDao) {
		this.notificationSchemeDao = notificationSchemeDao;
	}
	
	public void setNotificationSchemeItemDao(NotificationSchemeItemDao notificationSchemeItemDao) {
		this.notificationSchemeItemDao = notificationSchemeItemDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
}
