
package com.usky.sms.menu;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.XmlWebApplicationContext;

import com.usky.sms.core.AbstractCache;
import com.usky.sms.permission.IPermission;

public class MenuCache extends AbstractCache {
	
	private Map<Integer, MenuItem> mapById = new HashMap<Integer, MenuItem>();
	
	private Map<String, MenuItem> mapByPath = new HashMap<String, MenuItem>();
	
	private Map<String, String> beanNameMap = new HashMap<String, String>();
	
	private XmlWebApplicationContext context;
	
	@Autowired
	private MenuDao menuDao;
	
	@Override
	protected void refresh() {
		buildMenu();
	}
	
	private void buildMenu() {
		List<MenuDO> menus = menuDao.getList();
		for (MenuDO menu : menus) {
			MenuItem item = new MenuItem();
			item.setMenu(menu);
			mapById.put(menu.getId(), item);
		}
		for (MenuItem item : mapById.values()) {
			MenuDO menu = item.getMenu();
			MenuDO parent = menu.getParent();
			if (parent == null) continue;
			MenuItem parentItem = mapById.get(parent.getId());
			if (parentItem == null) continue;
			item.setParent(parentItem);
			List<MenuItem> list = parentItem.getChildren();
			if (list == null) list = new ArrayList<MenuItem>();
			list.add(item);
		}
		for (MenuItem item : mapById.values()) {
			String path = item.getMenu().getName();
			MenuItem parent = item.getParent();
			while (parent != null) {
				path = parent.getMenu().getName() + "/" + path;
				parent = parent.getParent();
			}
			item.setPath(path);
			mapByPath.put(path, item);
		}
	}
	
	public void addMenu(String path, String type, String url, Integer weight, String beanName) {
		MenuItem item = mapByPath.get(path);
		if (item != null) return;
		String dir = getDir(path);
		String name = getName(path);
		MenuItem parent = mapByPath.get(dir);
		MenuDO menu = new MenuDO();
		menu.setName(name);
		menu.setUrl(url);
		menu.setWeight(weight);
		if (parent != null) menu.setParent(parent.getMenu());
		menuDao.addMenu(menu);
		item = new MenuItem();
		item.setMenu(menu);
		item.setPath(path);
		item.setParent(parent);
		if (parent != null) parent.addChild(item);
		mapById.put(menu.getId(), item);
		mapByPath.put(path, item);
		if (beanName != null) {
			String menuType = item.getMenu().getType();
			if (menuType != null) path = path + "(" + menuType + ")";
			beanNameMap.put(path, beanName);
		}
	}
	
	private String getDir(String path) {
		int pos = path.lastIndexOf('/');
		if (pos == -1) return null;
		return path.substring(0, pos);
	}
	
	private String getName(String path) {
		int pos = path.lastIndexOf('/');
		if (pos == -1) return path;
		return path.substring(pos + 1);
	}
	
	public void removeMenu(String path) throws Exception {
		MenuItem item = mapByPath.get(path);
		Integer id = item.getMenu().getId();
		menuDao.delete(new String[] { id.toString() });
		item.getParent().removeChild(item);
		mapById.remove(id);
		mapByPath.remove(path);
		String menuType = item.getMenu().getType();
		if (menuType != null) path = path + "(" + menuType + ")";
		beanNameMap.remove(path);
	}
	
	public MenuItem getMenuItemById(Integer id) {
		return mapById.get(id);
	}
	
	public List<Object> getMenu(String type, Integer parentId, HttpServletRequest request) {
		List<Object> list = new ArrayList<Object>();
		List<MenuItem> items = new ArrayList<MenuItem>(mapById.values());
		Collections.sort(items, new Comparator<MenuItem>() {
			
			@Override
			public int compare(MenuItem i1, MenuItem i2) {
				Integer w1 = i1.getMenu().getWeight();
				Integer w2 = i2.getMenu().getWeight();
				if (w2 == null) return -1;
				if (w1 == null) return 1;
				return w1 - w2;
			}
			
		});
		for (MenuItem item : items) {
			MenuDO menu = item.getMenu();
			if (type != null && !type.equals(menu.getType())) continue;
			if (parentId == null && item.getParent() != null) continue;
			if (parentId != null && (item.getParent() == null || !parentId.equals(item.getParent().getMenu().getId()))) continue;
			Object bean = getBean(item);
			int menuId = menu.getId();
			if (!hasPermission(bean, menuId, request)) continue;
			Map<String, Object> menuMap = getMenuMap(item);
			if (parentId != null) {
				menuMap.put("children", getSubMenus(bean, menuId, item, items, request));
			}
			list.add(menuMap);
		}
		return list;
	}
	
	private List<Map<String, Object>> getSubMenus(MenuItem item, Collection<MenuItem> items, HttpServletRequest request) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (MenuItem mi : items) {
			if (mi.getParent() == null || !mi.getParent().equals(item)) continue;
			Object bean = getBean(mi);
			int menuId = mi.getMenu().getId();
			if (!hasPermission(bean, menuId, request)) continue;
			Map<String, Object> menuMap = getMenuMap(mi);
			list.add(menuMap);
			menuMap.put("children", getSubMenus(bean, menuId, mi, items, request));
		}
		return list;
	}
	
	private Object getBean(MenuItem item) {
		String menuType = item.getMenu().getType();
		String path = item.getPath();
		if (menuType != null) path = path + "(" + menuType + ")";
		String beanName = beanNameMap.get(path);
		if (beanName == null) return null;
		return context.getBean(beanName);
	}
	
	private boolean hasPermission(Object bean, Integer id, HttpServletRequest request) {
		return !(bean instanceof IPermission) || ((IPermission) bean).hasPermission(id, request);
	}
	
	private List<Map<String, Object>> getSubMenus(Object bean, Integer id, MenuItem item, Collection<MenuItem> items, HttpServletRequest request) {
		if (bean instanceof IMenu) {
			IMenu menuBean = (IMenu) bean;
			return menuBean.getSubMenus(id, request);
		} else {
			return getSubMenus(item, items, request);
		}
	}
	
	private Map<String, Object> getMenuMap(MenuItem item) {
		MenuDO menu = item.getMenu();
		Map<String, Object> menuMap = new HashMap<String, Object>();
		menuMap.put("id", menu.getId());
		menuMap.put("name", menu.getName());
		menuMap.put("type", menu.getType());
		menuMap.put("url", menu.getUrl());
		menuMap.put("weight", menu.getWeight());
		return menuMap;
	}
	
	public void registerMenuBeans() {
		registerMenuBean("安监机构/当前安监机构", null, "unitDao");
		registerMenuBean("安监机构/最新安监机构", null, "unitDao");
		registerMenuBean("管理/安全信息类型/安全信息类型", null, "unitDao");
		registerMenuBean("安全信息/最新安全信息", null, "activityDao");
		registerMenuBean("安全信息/过滤器", null, "filtermanagerDao");
		registerMenuBean("管理", "UNIT", "unitDao");
		registerMenuBean("插件", "SYS", "permissionSetDao");
		registerMenuBean("用户", "SYS", "permissionSetDao");
		registerMenuBean("安监机构", "SYS", "permissionSetDao");
		registerMenuBean("安全信息", "SYS", "permissionSetDao");
		registerMenuBean("系统", "SYS", "permissionSetDao");
		registerMenuBean("基础数据", "SYS", "permissionSetDao");
		registerMenuBean("安全促进", "SYS", "permissionSetDao");
		registerMenuBean("安全工作评审/安全评审审核", null, "methanolInstDao");
		registerMenuBean("总览/146/安全绩效", null, "methanolInstDao");
		//qcj的request by cd		
		registerMenuBean("用户管理/当前安监机构", null, "unitDao");
		registerMenuBean("安全评审/当前安监机构", null, "unitDao");
		registerMenuBean("系统管理", "NAV", "temDao");
		registerMenuBean("安全绩效/安全评审审核", null, "methanolInstDao");
		registerMenuBean("审计管理/专业用户", null, "professionUserDao");
		registerMenuBean("审计管理/检查要点库", "USER", "professionUserDao");
		registerMenuBean("审计管理/人员资质", null, "professionUserDao");
		registerMenuBean("审计管理/整改通知单", null, "improveNoticeDao");
		registerMenuBean("审计管理/E-IOSA内审", null, "eiosaReprotDao");
		registerMenuBean("审计管理/LOSA审计", null, "schemeDao");
}
	
	public void registerMenuBean(String path, String type, String beanName) {
		if (type != null) path = path + "(" + type + ")";
		beanNameMap.put(path, beanName);
	}
	
	public void setContext(XmlWebApplicationContext context) {
		this.context = context;
	}
	
	public void setMenuDao(MenuDao menuDao) {
		this.menuDao = menuDao;
	}
	
}
