package com.usky.sms.audit.auditor;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.avatar.AvatarDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class AuditorService extends AbstractService {

	private Config config;

	@Autowired
	private AvatarDao avatarDao;

	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private AuditorInfoDao auditorInfoDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	public AuditorService() {
		this.config = Config.getInstance();
	}

	public void uploadAuditorPIC(HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		try {
			String fileName = null;
			String docName = null;
			Date date = new Date();
			ByteArrayOutputStream fileData = new ByteArrayOutputStream();
			DiskFileItemFactory fac = new DiskFileItemFactory();
			ServletFileUpload upload = new ServletFileUpload(fac);
			upload.setHeaderEncoding("utf-8");
			@SuppressWarnings("unchecked")
			List<Object> list = upload.parseRequest(request);
			for (Object obj : list) {
				FileItem item = (FileItem) obj;
				if ("Filedata".equals(item.getFieldName())) {
					fileName = item.getName();
					int pos = fileName.lastIndexOf(".");
					if (pos > 0) {
						docName = fileName.substring(0, pos) + "_"
								+ date.getTime() + fileName.substring(pos);
					} else {
						docName = fileName + "_" + date.getTime();
					}
					InputStream in = item.getInputStream();
					byte[] bytes = new byte[64];
					int rc = 0;
					while ((rc = in.read(bytes, 0, 64)) > 0) {
						fileData.write(bytes, 0, rc);
					}
					break;
				}
			}
			String rootPathStr = request.getSession().getServletContext()
					.getRealPath("/");
			File userAvatar = new File(rootPathStr + config.getUserAvatarPath()
					+ "/" + docName);
			FileUtils.writeByteArrayToFile(userAvatar, fileData.toByteArray());
			AvatarDO avatar = new AvatarDO();
			avatar.setContentType("image/png");
			avatar.setFileName(docName);
			avatar.setOwner(UserContext.getUser().getUsername());
			avatar.setSystem(false);
			avatar.setType("audit");
			avatarDao.internalSave(avatar);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", avatarDao.convert(avatar));
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void getAuditors(HttpServletRequest request, HttpServletResponse response){
		try {
			String unit = request.getParameter("unit");
			String user = request.getParameter("user");
			String profession = request.getParameter("profession");
//			Integer param = NumberHelper.toInteger(request.getParameter("param"));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", auditorDao.getAuditors(unit, user, profession, null, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getAuditorInfoById(HttpServletRequest request, HttpServletResponse response){
		try {
			Integer id = NumberHelper.toInteger(request.getParameter("id"));
			AuditorDO auditor = auditorDao.internalGetById(id);
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("auditor", auditorDao.convert(auditor));
			dataMap.put("auditorInfo", auditorInfoDao.getByAuditor(id));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataMap);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getAuditorInfoByUserId(HttpServletRequest request, HttpServletResponse response){
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			Integer id = NumberHelper.toInteger(request.getParameter("id"));
			AuditorDO auditor = auditorDao.getAuditorByUserId(id);
			if (auditor != null){
				Map<String, Object> dataMap = new HashMap<String, Object>();
				dataMap.put("auditor", auditorDao.convert(auditor));
				dataMap.put("auditorInfo", auditorInfoDao.getByAuditor(id));
				map.put("success", true);
				map.put("data", dataMap);
			} else {
				map.put("success", true);
				map.put("data", null);
			}
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUserInfoById(HttpServletRequest request, HttpServletResponse response){
		try {
			Integer id = NumberHelper.toInteger(request.getParameter("id"));
			UserDO user = userDao.internalGetById(id);
			List<OrganizationDO> organizations = organizationDao.getByUser(user.getId());
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("user", userDao.convert(user));
			dataMap.put("organization", organizationDao.convert(organizations,false));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataMap);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void SaveAuditorTrain(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			auditorDao.saveAuditorTrain(objMap);
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
	
	public void saveAuditorTrainErJi(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			auditorDao.saveAuditorTrainErJi(objMap);
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
	
	public void getAllUsersByUnit(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer unitId = NumberHelper.toInteger(request.getParameter("unitId"));
			String roleName = request.getParameter("roleName");
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", userDao.convert(auditorDao.getAllUsersByUnit(unitId,roleName)));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	
	public void setAvatarDao(AvatarDao avatarDao) {
		this.avatarDao = avatarDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setAuditorInfoDao(AuditorInfoDao auditorInfoDao) {
		this.auditorInfoDao = auditorInfoDao;
	}

	public void setUserdao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	
}
