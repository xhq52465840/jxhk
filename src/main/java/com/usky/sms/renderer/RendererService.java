
package com.usky.sms.renderer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.field.FieldLayoutItemDO;
import com.usky.sms.field.FieldLayoutItemDao;
import com.usky.sms.field.FieldRegister;

public class RendererService extends AbstractService {
	
	@Autowired
	private CustomFieldDao customFieldDao;
	
	@Autowired
	private FieldLayoutItemDao fieldLayoutItemDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	public void getRendererByFieldLayoutItem(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int id = Integer.parseInt(request.getParameter("fieldLayoutItem"));
			FieldLayoutItemDO item = fieldLayoutItemDao.internalGetById(id);
			String key = item.getKey();
			if (key.startsWith("customfield_")) key = customFieldDao.internalGetById(Integer.parseInt(key.substring(12))).getType().getKey();
			List<Renderer> renderers = RendererRegister.getRenderers(key);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", renderers);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setCustomFieldDao(CustomFieldDao customFieldDao) {
		this.customFieldDao = customFieldDao;
	}
	
	public void setFieldLayoutItemDao(FieldLayoutItemDao fieldLayoutItemDao) {
		this.fieldLayoutItemDao = fieldLayoutItemDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
}
