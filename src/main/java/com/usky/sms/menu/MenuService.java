
package com.usky.sms.menu;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;

public class MenuService extends AbstractService {
	
	@Autowired
	private MenuCache menuCache;
	
	public void getMenu(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String type = request.getParameter("type");
			Integer parentId;
			try {
				parentId = Integer.parseInt(request.getParameter("pid"));
			} catch (NumberFormatException e) {
				parentId = null;
			}
			// TODO: 临时设置为每次获取菜单重置缓存，以方便开发阶段测试
			//menuCache.forceReload();
			List<Object> data = menuCache.getMenu(type, parentId, request);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}
	
}
