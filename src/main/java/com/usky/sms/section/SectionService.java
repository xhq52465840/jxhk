package com.usky.sms.section;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSetDao;

public class SectionService extends AbstractService {

	@Autowired
	private SectionDao sectionDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;

	public void modifySection(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			// 是否有管理图书馆的全局权限
			sectionDao.checkModifyPermission();
			String paramType = request.getParameter("paramType");
			if ("sortSections".equals(paramType)) {
				Integer[] itemIds = gson.fromJson(request.getParameter("itemIds"), Integer[].class);
				sectionDao.sort(itemIds);
			}
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

	/**
	 * @param sectionDao
	 *            the sectionDao to set
	 */
	public void setSectionDao(SectionDao sectionDao) {
		this.sectionDao = sectionDao;
	}

	/**
	 * @param permissionSetDao the permissionSetDao to set
	 */
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
}
