package com.usky.sms.outview;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
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

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;

public class LogoService extends AbstractService {

	private Config config;

	@Autowired
	private LogoDao logoDao;
	@Autowired
	private SiteFlagDao siteFlagDao;

	public LogoService() {
		this.config = Config.getInstance();
	}

	// 上传新logo
	public void uploadLogo(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String fileName = null;
			String docName = null;
			ByteArrayOutputStream fileData = new ByteArrayOutputStream();
			DiskFileItemFactory fac = new DiskFileItemFactory();
			ServletFileUpload upload = new ServletFileUpload(fac);
			upload.setHeaderEncoding("utf-8");
			@SuppressWarnings("unchecked")
			List<Object> list = upload.parseRequest(request);
			for (Object obj : list) {
				FileItem item = (FileItem) obj;
				if ("Filedata".equals(item.getFieldName())) { // 文件名默认为Filedata
					fileName = item.getName();
					int pos = fileName.lastIndexOf(".");
					if (pos > 0) {
						docName = "logo.png";
					} else {
						docName = "logo.png";
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

			String objName = request.getParameter("dataobject");
			String rootPathStr = request.getSession().getServletContext()
					.getRealPath("/");
			if ("logo".equals(objName)) {
				File sysLogo = new File(rootPathStr + config.getSysLogoPath()
						+ "/" + docName);
				FileUtils.writeByteArrayToFile(sysLogo, fileData.toByteArray());
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}


	// 恢复默认
	public void backLogo(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String rootPathStr = request.getSession().getServletContext()
					.getRealPath("/");
			String path1 = rootPathStr+config.getSysLogoPath()+"/"+"default.png";
			String path2 = rootPathStr+config.getSysLogoPath()+"/"+"logo.png";
			
			FileInputStream fin = new FileInputStream(path1);
			File file = new File(path1);
			FileInputStream finExe = new FileInputStream(file);
			byte[] buffer = new byte[1024];
			FileOutputStream fout = new FileOutputStream(path2);
			int readCount = 0;
			while ((readCount = finExe.read(buffer)) >= 0)// 最多读取buffer的长度
			{
				fout.write(buffer, 0, readCount);
			}
			fin.close();
			finExe.close();
			fout.close();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//返回站点标题
	public void getSiteFlag(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("data", siteFlagDao.getById(1));
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	

	public void setLogoDao(LogoDao logoDao) {
		this.logoDao = logoDao;
	}

	public void setSiteFlagDao(SiteFlagDao siteFlagDao) {
		this.siteFlagDao = siteFlagDao;
	}

	public SiteFlagDao getSiteFlagDao() {
		return siteFlagDao;
	}

	
}
