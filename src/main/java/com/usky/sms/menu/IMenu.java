
package com.usky.sms.menu;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public interface IMenu {
	
	public List<Map<String, Object>> getSubMenus(Integer id, HttpServletRequest request);
	
}
