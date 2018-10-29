
package com.usky.sms.menu;

import com.google.gson.Gson;
import com.usky.sms.core.BaseDao;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class MenuDao extends BaseDao<MenuDO> {
	
	protected static Gson gson = GsonBuilder4SMS.getInstance();
	
	public MenuDao() {
		super(MenuDO.class);
	}
	
	/**
	 * 提供给安装插件时，注册菜单项<br>
	 * 安装插件时，不能直接调用{@code internalSave}方法，否则会报错，原因未明
	 * 
	 * @param menu
	 */
	public void addMenu(MenuDO menu) {
		this.internalSave(menu);
	}
	
}
