package com.usky.sms.file;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.activity.action.ActionDao;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.avatar.AvatarDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.ZipHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.directory.DailySafetyWorkStatusDao;
import com.usky.sms.directory.DirectoryDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class FileService extends AbstractService {

	private Config config;

	@Autowired
	private AvatarDao avatarDao;

	@Autowired
	private FileDao fileDao;

	@Autowired
	private DirectoryDao directoryDao;

	@Autowired
	private ActionDao actionDao;

	@Autowired
	private ActivityDao activityDao;

	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private AtypeFtypeEntityDao atypeFtypeEntityDao;
	
	@Autowired
	private DailySafetyWorkStatusDao dailySafetyWorkStatusDao;
	
	@Autowired
	private UserDao userDao;

	public FileService() {
		this.config = Config.getInstance();
	}
	
	/*
	 * 通过安全信息获取其其附件类型
	 */
	public void getFtypeByActivityId (HttpServletRequest request, HttpServletResponse response) throws Exception {
		int activityId =Integer.parseInt(request.getParameter("activityId"));		
		try{
			ActivityDO activity= activityDao.internalGetById(activityId);
			List<AtypeFtypeEntityDO> list =  atypeFtypeEntityDao.getAtypeFtypeEntityByActivityType(activity.getType());
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data",atypeFtypeEntityDao.convert(list) );
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void upload(HttpServletRequest request, HttpServletResponse response) throws Exception {
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
						docName = fileName.substring(0, pos) + "_" + date.getTime() + fileName.substring(pos);
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

			String objName = request.getParameter("dataobject");
			String rootPathStr = request.getSession().getServletContext().getRealPath("/");
			if ("userAvatar".equals(objName)) {
				File userAvatar = new File(rootPathStr + config.getUserAvatarPath() + "/" + docName);
				FileUtils.writeByteArrayToFile(userAvatar, fileData.toByteArray());
				AvatarDO avatar = new AvatarDO();
				avatar.setContentType("image/png");
				avatar.setFileName(docName);
				avatar.setOwner(UserContext.getUser().getUsername());
				avatar.setSystem(false);
				avatar.setType("user");
				avatarDao.internalSave(avatar);
			} else if ("unitAvatar".equals(objName)) {
				File unitAvatar = new File(rootPathStr + config.getUnitAvatarPath() + "/" + docName);
				FileUtils.writeByteArrayToFile(unitAvatar, fileData.toByteArray());
				AvatarDO avatar = new AvatarDO();
				avatar.setContentType("image/png");
				avatar.setFileName(docName);
				avatar.setOwner(request.getParameter("unit"));
				avatar.setSystem(true);
				avatar.setType("unit");
				avatarDao.internalSave(avatar);
			}

			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
			// } catch (SMSException e) {
			// ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void uploadFiles(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String uploadFilePath = config.getUploadFilePath();
		if (StringUtils.isBlank(uploadFilePath)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有配置上传文件的保存路径！");
		}
		try {
			Integer directoryId = StringUtils.isBlank(request.getParameter("directoryId")) ? null : Integer.parseInt(request.getParameter("directoryId"));

			// 上传附件的来源类型
			Integer sourceType = StringUtils.isBlank(request.getParameter("sourceType")) ? null : Integer.parseInt(request.getParameter("sourceType"));

			// 不同类型附件的来源ID
			Integer source = StringUtils.isBlank(request.getParameter("source")) ? null : Integer.parseInt(request.getParameter("source"));
			// 描述 上传附件时需要保存一定的说明
			String description = StringUtils.isBlank(request.getParameter("description")) ? null : URLDecoder.decode(request.getParameter("description"), "utf-8");
			
			String attachmentType = request.getParameter("attachmentType");
			
			// 校验权限
			fileDao.checkUploadPermission(sourceType, source);
			
			// 上传的用户
			UserDO user = UserContext.getUser();
			if (user == null) {
				user = userDao.getByUsername("ANONYMITY");
			}
			
			// 保存到磁盘
			List<Map<String, Object>> fileItems = fileDao.uploadFile(request, uploadFilePath);
			
			List<FileDO> fileDOs = fileDao.saveFiles(fileItems, user, sourceType, directoryId, source, description, attachmentType);

			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(fileDao.convert(fileDOs), request));
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 * 下载文件
	 * 
	 * @param request
	 * @param response
	 * @param idstr
	 * @throws Exception
	 */
	public void downloadFiles(HttpServletRequest request, HttpServletResponse response) throws Exception {

		Integer[] ids = gson.fromJson(request.getParameter("ids"), Integer[].class);
        String isMobile=request.getParameter("isMobile");
		List<Integer> idList = new ArrayList<Integer>();
		for (Integer id : ids) {
			idList.add(id);
		}

		List<FileDO> fileDOs = fileDao.getByIds(idList);

		String filePath = "";
		String fileName = "";
		// 压缩文件的临时目录
		String tempDir = "";
		InputStream in = null;
		OutputStream out = null;
		FileDO errorFile = null;
		try {
			if (fileDOs.size() > 1) { // 多文件下载
				tempDir = config.getTemPath() + "/" + UserContext.getUser().getDisplayName() + "_" + UserContext.getUser().getId() + "_" +new Date().getTime();
				for (FileDO fileDO : fileDOs) {
					File destFile = new File(tempDir + "/preparedFiles/" + fileDO.getFileName());
					// 将文件复制的临时目录下的preparedFiles目录下
					try {
						FileUtils.copyFile(
								new File(config.getUploadFilePath() + "/" + fileDO.getRelativePath()),
								renameFile(destFile));
					} catch (FileNotFoundException e) {
						errorFile = fileDO;
						throw e;
					}
				}
				// 显示在客户端的压缩文件名
				fileName = "download.zip";
				// 压缩后的文件的绝对路径
				filePath = tempDir + "/" + fileName;
				// 将临时目录下的preparedFiles目录下的所有文件压缩成临时目录下的zip文件
				ZipHelper.zip(tempDir + "/preparedFiles", filePath);
				
				in = new FileInputStream(new File(filePath));
			} else { // 单文件下载

				FileDO fileDO = fileDOs.get(0);
				// 显示在客户端的文件名
				fileName = fileDO.getFileName();
				// 服务器中文件的绝对路径
				filePath = config.getUploadFilePath() + "/" + fileDO.getRelativePath();
				try {
					in = new FileInputStream(new File(filePath));
				} catch (FileNotFoundException e) {
					errorFile = fileDO;
					throw e;
				}
			}
			
            if(isMobile!=null&&isMobile.equals("true"))
            {
            	response.setContentType("image/jpeg");
            }
            else
            {
			response.setContentType("application/octet-stream");
			response.setHeader("content-disposition", "attachment;filename=" + URLEncoder.encode(fileName, "UTF-8"));
            }
			// 写明要下载的文件的大小
//			response.setContentLength((int) file.length());

			out = response.getOutputStream();
			// 将文件输出
			write(in, out);

		} catch (Exception e) {
			if (!response.isCommitted()) {
				String url = request.getParameter("url");
				if (!StringUtils.isBlank(url)) {
					url = new String(request.getParameter("url").getBytes("iso-8859-1"), "utf-8");
					url = URLDecoder.decode(url, "utf-8");
				}
				response.reset();
				response.setContentType("text/html");
				response.setCharacterEncoding("UTF-8");
				response.setHeader("Pragma", "no-cache");
				response.setHeader("Cache-Control", "no-cache");
				PrintWriter writer = response.getWriter();
				request.getServletPath();
				StringBuilder sb = new StringBuilder("<script language='javascript'>alert('下载失败！错误详情：");
				if (null != errorFile) {
					sb.append("文件(");
					sb.append(errorFile.getFileName());
					sb.append(")已被删除。");
				} else {
					sb.append(e.getMessage());
				}
				sb.append("');");
				if (!StringUtils.isBlank(url)) {
					sb.append("window.location.href='");
					sb.append(request.getScheme());
					sb.append("://");
					sb.append(url);
					sb.append("';");
				}
				sb.append("</script>");
				writer.print(sb.toString());
				writer.flush();
				writer.close();
			}
		} finally {
			close(in, out);
			// 删除临时目录
			FileUtils.deleteDirectory(new File(tempDir));
		}
	}

	/**
	 * 获取对应关联下的所有附件
	 */
	public void getFilesBySource(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer source = Integer.parseInt(request.getParameter("source"));
			Integer sourceType = Integer.parseInt(request.getParameter("sourceType"));
			List<FileDO> files = fileDao.getFilesBySource(sourceType, source);
			
			Map<String, Object> result = new HashMap<String, Object>();
			
			List<Map<String, Object>> fileMaps = fileDao.convert(files);
			
			if (EnumFileType.SAFETYINFORMATION.getCode() == sourceType) { // 安全信息时，返回是否有上传权限
				int unitId = activityDao.internalGetById(source).getUnit().getId();
				result.put("addable", permissionSetDao.hasActivityPermission(source, unitId, PermissionSets.ADD_ATTACHMENT.getName()));
				// 删除权限
				boolean hasDeleteAttachmentPermission = permissionSetDao.hasActivityPermission(source, unitId, PermissionSets.DELETE_ATTACHMENT.getName());
				boolean hasDeleteSelfAttachmentPermission = false;
				if (!hasDeleteAttachmentPermission){
					hasDeleteSelfAttachmentPermission = permissionSetDao.hasActivityPermission(source, unitId, PermissionSets.DELETE_SELF_ATTACHMENT.getName());
				}
				boolean deletable = false;
				for (Map<String, Object> fileMap : fileMaps) {
					if (hasDeleteAttachmentPermission) { // 判断是否有删除附件的权限
						deletable = true;
					} else if (hasDeleteSelfAttachmentPermission && UserContext.getUserId().equals((Integer) fileMap.get("uploadUserId"))) { // 如果有删除自己附件的权限，判断该附件是否由当前用户上传
						deletable = true;
					}
					fileMap.put("deletable", deletable);
				}
			}
			
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(fileMaps, request));

			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 * 将输入流写入输出流中
	 * 
	 * @param in
	 *            输入流
	 * @param out
	 *            输出流
	 * @throws IOException 
	 */
	private void write(InputStream in, OutputStream out) throws IOException {
		byte[] bytes = new byte[64];
		int rc = 0;
		while ((rc = in.read(bytes, 0, 64)) > 0) {
			out.write(bytes, 0, rc);
		}
	}

	/**
	 * 关闭输入输出流
	 * 
	 * @param in
	 *            输入流
	 * @param out
	 *            输出流
	 */
	private void close(InputStream in, OutputStream out) {
		IOUtils.closeQuietly(in);
		IOUtils.closeQuietly(out);
	}

	/**
	 * 文件名的base64码 + "_" + uuid
	 * 
	 * @param uploadFileName
	 * @return
	 */
	private String createFileNameFromClient(String uploadFileName) {
		String docName = null;
		String uuid = UUID.randomUUID().toString(); 
		int pos = uploadFileName.lastIndexOf(".");
		if (pos > 0) {
			docName = new String(Base64.encodeBase64(uploadFileName.substring(0, pos).getBytes())) + "_" + uuid + uploadFileName.substring(pos);
		} else {
			docName = new String(Base64.encodeBase64(uploadFileName.substring(0, pos).getBytes())) + "_" + uuid;
		}
		return docName;
	}

	/**
	 * 如果文件已存在就在文件名后加上"_副本"
	 * 
	 * @param file
	 * @return
	 */
	private File renameFile(File file) {
		Integer count = 0;
		String baseSufix = "_副本";
		String baseFileName = file.getName();
		String sufix = null;
		while (file.exists()) {
			count++;
			if (count > 1) {
				sufix = baseSufix + "(" + count + ")";
			} else {
				sufix = baseSufix;
			}
			String fileName = null;
			String filePath = file.getParent();
			if (file.isDirectory()) {
				fileName = baseFileName + sufix;
			} else {
				int pos = baseFileName.lastIndexOf(".");
				if (pos > 0) {
					fileName = baseFileName.substring(0, pos) + sufix + baseFileName.substring(pos);
				} else {
					fileName = baseFileName + sufix;
				}
			}
			file = new File(filePath + "/" + fileName);
		}
		return file;
	}
	/**
	 * 为移动审计写得附件上传
	 * @param request
	 * @return 
	 * @throws Exception
	 */
	public List<Map<String, Object>> downfile(HttpServletRequest request) throws Exception {
		Integer source = null;
		Integer sourceType = null;
		try {
		  source = NumberHelper.toInteger(request.getParameter("source"));
		  sourceType = NumberHelper.toInteger(request.getParameter("sourceType"));
		} catch (Exception e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "source或sourceType不正确！");
		}
		String description = request.getParameter("description");
		String _downurl = request.getParameter("url");
		if (_downurl == null || "".equals(_downurl)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "url不正确！");
		}
		List<String> downurls = gson.fromJson(_downurl, new TypeToken<List<String>>(){}.getType());
		String uploadFilePath = config.getUploadFilePath();
		if (StringUtils.isBlank(uploadFilePath)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有配置上传文件的保存路径！");
		}
		List<FileDO> fileDOs = new ArrayList<FileDO>();
		for (String downurl : downurls) {
			String[] str = downurl.split("/");
			String fileName = str[str.length - 1]; //文件名
			if (!fileDao.getFilesByFileName(source, sourceType, fileName).isEmpty()) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "文件名重复!");
			
			URL url = new URL(downurl);
			InputStream inputStream = null;
			try {
				HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			    inputStream = conn.getInputStream();
			} catch (Exception e) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, url + "无效，获取不到此文件！");
			}
			byte[] getData = fileDao.readInputStream(inputStream);
			
			String fileSize = fileDao.getSizeString(getData.length); // 文件大小
			String savedFileName = this.createFileNameFromClient(fileName);//存储名
			Date date = new Date();
			// 附件的信息
			FileDO file = new FileDO();
			// 客户端显示的文件名
			file.setFileName(fileName);
			file.setSize(fileSize);
			// TODO 还未确定
			file.setTag("tag");
			file.setType(FilenameUtils.getExtension(fileName));
			file.setUploadTime(date);
			file.setUploadUser(UserContext.getUser());
			file.setRelativePath("/" + savedFileName);
			// 上传附件的来源类型
			file.setSourceType(sourceType);
			// 不同类型附件的来源ID
			file.setSource(source);
			//不同类型附件的来源不同来源说明
			file.setDescription(description == null ? "" : description);
			// 将附件的信息保存到数据库中
			fileDao.internalSave(file);
			fileDao.afterSave(file);
			
			try {
				FileUtils.writeByteArrayToFile(new File(uploadFilePath + "/" + file.getRelativePath()),getData);
			} catch (IOException e) {
				e.printStackTrace();
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "附件上传失败！");
			}
			fileDOs.add(file);
		}
		return fileDao.convert(fileDOs);
	}
	
	/**
	 * 获取文件类型
	 */
	public void getFileTypes(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> result = new HashMap<String, Object>();
			List<Map<String, Object>> datas = new ArrayList<Map<String,Object>>();
			String term = request.getParameter("term");
			for (EnumFileType each : EnumFileType.values()) {
				if (StringUtils.isNotBlank(term)) {
					if (StringUtils.containsIgnoreCase(each.getName(), term) || StringUtils.containsIgnoreCase(each.toComment(), term)) {
						datas.add(each.toMap());
					}
				} else {
					datas.add(each.toMap());
				}
			}
			result.put("success", true);
			result.put("data", datas);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			ResponseHelper.output(response, e);
		}
	}

	public void setAvatarDao(AvatarDao avatarDao) {
		this.avatarDao = avatarDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	/**
	 * @param directoryDao
	 *            the directoryDao to set
	 */
	public void setDirectoryDao(DirectoryDao directoryDao) {
		this.directoryDao = directoryDao;
	}

	/**
	 * @param actionDao
	 *            the actionDao to set
	 */
	public void setActionDao(ActionDao actionDao) {
		this.actionDao = actionDao;
	}

	/**
	 * @param activityDao
	 *            the activityDao to set
	 */
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}

	/**
	 * @param activityLoggingDao
	 *            the activityLoggingDao to set
	 */
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	/**
	 * @param permissionSetDao the permissionSetDao to set
	 */
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setAtypeFtypeEntityDao(AtypeFtypeEntityDao atypeFtypeEntityDao) {
		this.atypeFtypeEntityDao = atypeFtypeEntityDao;
	}

	public void setDailySafetyWorkStatusDao(DailySafetyWorkStatusDao dailySafetyWorkStatusDao) {
		this.dailySafetyWorkStatusDao = dailySafetyWorkStatusDao;
	}
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
}
