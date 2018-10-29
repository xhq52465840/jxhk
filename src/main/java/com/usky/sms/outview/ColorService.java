package com.usky.sms.outview;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;

public class ColorService extends AbstractService{
	@Autowired
	private ColorDao colorDao;
	
	public void getColor(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			List<ColorDO> list = colorDao.getList();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("data", colorDao.convert(list));
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public ColorDao getColorDao() {
		return colorDao;
	}

	public void setColorDao(ColorDao colorDao) {
		this.colorDao = colorDao;
	}
	
	
}
