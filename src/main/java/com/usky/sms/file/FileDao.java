
package com.usky.sms.file;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Field;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.activity.action.ActionDao;
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.directory.DailySafetyWorkStatusDO;
import com.usky.sms.directory.DailySafetyWorkStatusDao;
import com.usky.sms.directory.DirectoryDO;
import com.usky.sms.directory.DirectoryDao;
import com.usky.sms.directory.EnumDirectoryType;
import com.usky.sms.directory.EnumSafetyInfoType;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class FileDao extends BaseDao<FileDO> {
	
	private Config config;
	
	@Autowired
	private DirectoryDao directoryDao;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private AuditActivityLoggingDao auditActivityLoggingDao;
	
	@Autowired
	private ActionDao actionDao;
	
	@Autowired
	private FileTypeDirectoryMappingDao fileTypeDirectoryMappingDao;
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if("directory.status".equals(key)) {
			return ((Double)value).intValue();
		}
		return super.getQueryParamValue(key, value);
	}

	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private DailySafetyWorkStatusDao dailySafetyWorkStatusDao;
	
	protected FileDao() {
		super(FileDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		FileDO file = (FileDO) obj;
		
		if ("uploadTime".equals(fieldName)) {
			SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			map.put("uploadTime", dateformat.format(file.getUploadTime()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void beforeDelete(Collection<FileDO> collection) {
		for (FileDO file : collection) {
			// 是否有删除附件权限
			checkDeletePermission(file);
		}
		super.beforeDelete(collection);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 是否上传权限
		Integer sourceType = (Integer) map.get("sourceType");
		Integer source = (Integer) map.get("source");
		checkUploadPermission(sourceType, source);
		
		return super.beforeSave(map);
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 是否上传权限
		Integer sourceType = (Integer) map.get("sourceType");
		Integer source = (Integer) map.get("source");
		checkUploadPermission(sourceType, source);
		
		super.beforeUpdate(id, map);
	}
	
	@Override
	protected void beforeUpdate(FileDO file) {
		// 是否有管理权限
		Integer sourceType = file.getSourceType();
		Integer source = file.getSource();
		checkUploadPermission(sourceType, source);
		
		super.beforeUpdate(file);
	}
	
	/**
	 * 如果是自定义上传判断是否有管理权限<br>
	 * 如果是安全信息上传判断是否有添加附件权限<br>
	 * 
	 * @param sourceType
	 */
	// 上传附件权限控制
	public void checkUploadPermission(Integer sourceType, Integer source) {
		if (null == sourceType || EnumFileType.CUSTOM.getCode() == sourceType) { // 自定义上传的附件时
			// 判断有无管理图书馆的权限
			if (!permissionSetDao.hasPermission(PermissionSets.MANAGE_SAFETY_LIBRARY.getName())) {
				throw SMSException.NO_ACCESS_RIGHT;
			}
		} else if (EnumFileType.SAFETYINFORMATION.getCode() == sourceType) { // 安全信息上传的附件时
			// 判断有无上传附件的权限
			if(source!=null){
				ActivityDO activity = activityDao.internalGetById(source);
				if (null != activity && null != activity.getUnit()) if (!permissionSetDao.hasActivityPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.ADD_ATTACHMENT.getName())) {
					throw SMSException.NO_ACCESS_RIGHT;
				}
			}
		}
	}
	
	/**
	 * 如果是自定义上传判断是否有管理权限<br>
	 * 如果是安全信息上传判断是否有删除附件权限<br>
	 * 
	 * @param sourceType
	 */
	// 删除附件权限控制
	public void checkDeletePermission(FileDO file) {
		Integer sourceType = file.getSourceType();
		if (null == sourceType || EnumFileType.CUSTOM.getCode() == sourceType) { // 自定义上传的附件时
			// 判断有无管理图书馆的权限
			if (!permissionSetDao.hasPermission(PermissionSets.MANAGE_SAFETY_LIBRARY.getName())) {
				throw SMSException.NO_ACCESS_RIGHT;
			}
		} else if (EnumFileType.SAFETYINFORMATION.getCode() == sourceType) { // 安全信息上传的附件时
			// 判断是否有删除附件的权限
			Integer source = file.getSource();
			int unitId = activityDao.internalGetById(source).getUnit().getId();
			boolean hasDeleteAttachmentPermission = permissionSetDao.hasActivityPermission(source, unitId, PermissionSets.DELETE_ATTACHMENT.getName());
			boolean hasDeleteSelfAttachmentPermission = false;
			if (!hasDeleteAttachmentPermission) {
				hasDeleteSelfAttachmentPermission = permissionSetDao.hasActivityPermission(source, unitId, PermissionSets.DELETE_SELF_ATTACHMENT.getName());
			}
			boolean deletable = false;
			if (hasDeleteAttachmentPermission) { // 判断是否有删除附件的权限
				deletable = true;
			} else if (hasDeleteSelfAttachmentPermission && UserContext.getUserId().equals(file.getUploadUser().getId())) { // 如果有删除自己附件的权限，判断该附件是否由当前用户上传
				deletable = true;
			}
			if (!deletable) {
				throw SMSException.NO_ACCESS_RIGHT;
			}
		}
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		List<FileDO> files = this.internalGetByIds(ids);
		for (FileDO file : files) {
			if (EnumFileType.CUSTOM.getCode() == file.getSourceType()) {
				file.setDeleted(true);
				this.update(file);
			} else if (EnumFileType.SAFETYINFORMATION.getCode() == file.getSourceType() || EnumFileType.SAFETYREVIEW.getCode() == file.getSourceType()) {
//				List<FileDO> temps = new ArrayList<FileDO>();
//				temps.add(file);
				// this.afterDelete(temps); // 活动日志会添加两条删除日志
//				super.delete(temps);
				file.setDeleted(true);
				this.update(file);
			} else {
				file.setDeleted(true);
				this.update(file);
			}
		}
		this.afterDelete(files);
	}
	
	@Override
	public void afterUpdate(FileDO file, FileDO dbfile) {
		updateLastUpdateTime(file);
	}
	
	@Override
	public void afterSave(FileDO file) {
		updateLastUpdateTime(file);
		// 写入活动日志
		addActivityLoggingForOperateFile(file, "add");
	}
	
	/**
	 * 保存和删除审计的文件时添加活动日志
	 * @param file
	 */
	private void addActivityLoggingForOperateFile(FileDO file, String operate){
		List<String> details = new ArrayList<String>();
		StringBuffer message = new StringBuffer();
		if ("add".equals(operate)) {
			message.append("上传了附件：");
		} else if ("delete".equals(operate)) {
			message.append("删除了附件：");
		}
		message.append(file.getFileName());
		details.add(message.toString());
		List<Integer> ids = new ArrayList<Integer>();
		List<String> entityNames = new ArrayList<String>();
		List<String> operationNames = new ArrayList<String>();
		if (null != file.getSourceType()) {
			// TODO 可以改成switch语句
			if (EnumFileType.IMPROVE_NOTICE_ISSUE.getCode() == file.getSourceType() || EnumFileType.CHECK_CONFIRM.getCode() == file.getSourceType()) { // 上传审计的整改通知单列表的附件时，写入整改通知单列表的活动日志
				ids.add(file.getSource());
				entityNames.add("improveNoticeIssue");
				operationNames.add("UPDATE_IMPROVE_NOTICE_ISSUE");
			} else if (EnumFileType.CHECKLIST.getCode() == file.getSourceType() || EnumFileType.IMPROVE_ITEM.getCode() == file.getSourceType() || EnumFileType.AUDIT_CONFIRM.getCode() == file.getSourceType()) { // 上传审计记录和整改反馈记录的附件时，写入到checkList的活动日志
				ids.add(file.getSource());
				entityNames.add("checkList");
				operationNames.add("UPDATE_CHECK_LIST");
				// checkList
				CheckListDO checkList = this.getHibernateTemplate().load(CheckListDO.class, file.getSource());
				ids.add(checkList.getTask().getId());
				entityNames.add("task");
				operationNames.add("UPDATE_TASK");
				if (null != checkList.getImprove()) {
					ids.add(checkList.getImprove().getId());
					entityNames.add("improve");
					operationNames.add("UPDATE_IMPROVE");
				}
				if (null != checkList.getCheck()) {
					ids.add(checkList.getCheck().getId());
					entityNames.add("check");
					operationNames.add("UPDATE_CHECK");
				}
			} else if (EnumFileType.TASK.getCode() == file.getSourceType() || EnumFileType.TERM_TASK.getCode() == file.getSourceType() || EnumFileType.TERM_AUDIT_REPORT.getCode() == file.getSourceType() || EnumFileType.TERM_TASK_QIANPIJIAN.getCode() == file.getSourceType() || EnumFileType.TERM_TASK_WANCHENGQINGKANG.getCode() == file.getSourceType()) { // 上传工作单、航站审计工作单、航站审计报告的附件时，写入到工作单的活动日志
				ids.add(file.getSource());
				entityNames.add("task");
				operationNames.add("UPDATE_TASK");
			} else if (EnumFileType.IMPROVE.getCode() == file.getSourceType() || EnumFileType.IMPROVE_TRANSMITTED.getCode() == file.getSourceType() || EnumFileType.SUB2_3_IMPROVE_TRACE.getCode() == file.getSourceType()) { // 上传整改单、转发的整改单、内审验证的附件时，写入活动日志
				ids.add(file.getSource());
				entityNames.add("improve");
				operationNames.add("UPDATE_IMPROVE");
			} else if (EnumFileType.IMPROVE_NOTICE_SENT.getCode() == file.getSourceType()) { // 上传整改通知单下发的附件时，写入整改通知单的活动日志
				ids.add(file.getSource());
				entityNames.add("improveNotice");
				operationNames.add("UPDATE_IMPROVE_NOTICE");
			} else if (EnumFileType.SUB_IMPROVE_NOTICE_ECHO.getCode() == file.getSourceType()) { // 上传整改通知单回传的附件时，写入整改通知单子单的活动日志
				ids.add(file.getSource());
				entityNames.add("subImproveNotice");
				operationNames.add("UPDATE_SUB_IMPROVE_NOTICE");
			} else if (EnumFileType.SUB2_SUB3_COMFIRM_LIST.getCode() == file.getSourceType()) { // 内审上传验证单活动日志
				ids.add(file.getSource());
				entityNames.add("improve");
				operationNames.add("UPDATE_IMPROVE");
			} else if (EnumFileType.TERM_TASK_QIANPIJIAN_SHENHE.getCode() == file.getSourceType()) {// 航站审计审核签批件
				ids.add(file.getSource());
				entityNames.add("task");
				operationNames.add("UPDATE_TASK");
			}
		}
		if (!details.isEmpty() && !entityNames.isEmpty()) {
			MDC.put("details", details.toArray());
			for (int i = 0; i < ids.size(); i++) {
				auditActivityLoggingDao.addLogging(ids.get(i), entityNames.get(i), AuditActivityLoggingOperationRegister.getOperation(operationNames.get(i)));
			}
			MDC.remove("details");
		}
	}
	
	@Override
	protected void afterDelete(Collection<FileDO> files) {
		for (FileDO file : files) {
			updateLastUpdateTime(file);
			
			// 如果是安全信息上传的附件,则需要添加活动日志
			if (EnumFileType.SAFETYINFORMATION.getCode() == file.getSourceType()) {
				ActivityDO activity = activityDao.internalGetById(file.getSource());
				if (null != activity) {
					MDC.put("details", new String[] { file.getFileName() + "(" + file.getDirectory().getName() + ")" });
					// 添加活动日志
					activityLoggingDao.addLogging(file.getSource(), ActivityLoggingOperationRegister.getOperation("DELETE_SAFETYINFORMATION_ATTACHMENT"));
					MDC.remove("details");
				}
			} else { // 删除审计的附件时，写入审计的活动日志
				addActivityLoggingForOperateFile(file, "delete");
			}
		}
		
	}
	
	/**
	 * 获取当前目录下的所有文件
	 */
	@SuppressWarnings("unchecked")
	public List<FileDO> getFiles(Integer directoryId) {
		return (List<FileDO>) this.query("from FileDO where directory.id = ? and deleted = false", directoryId);
	}
	
	/**
	 * 获取对应关联下的所有附件
	 */
	@SuppressWarnings("unchecked")
	public List<FileDO> getFilesBySource(Integer sourceType, Integer source) {
		if (null == sourceType || null == source) {
			return null;
		}
		List<FileDO> list = null;
		if (EnumFileType.SAFETYREVIEW.getCode() == sourceType) { // 安全评审上传的附件
			list = (List<FileDO>) this.query("from FileDO where deleted = false and sourceType = ? and source = ? order by lastUpdate desc", sourceType, source);
		} else if (EnumFileType.SAFETYINFORMATION.getCode() == sourceType) { // 安全信息上传的附件
			list = (List<FileDO>) this.query("from FileDO where deleted = false and sourceType = ? and source = ? order by lastUpdate desc", sourceType, source);
		} else if (EnumFileType.CUSTOM.getCode() == sourceType) { // 自定义
			list = (List<FileDO>) this.query("from FileDO where directory.id = ? and deleted = false order by lastUpdate desc", source);
		} else {
			list = (List<FileDO>) this.query("from FileDO where deleted = false and sourceType = ? and source = ? order by lastUpdate desc", sourceType, source);
		}
		return list;
	}
	
	/**
	 * 获取对应关联下的所有附件
	 */
	@SuppressWarnings("unchecked")
	public List<FileDO> getFilesBySources(Integer sourceType, List<Integer> sources) {
		if (null == sourceType || null == sources || sources.isEmpty()) {
			return new ArrayList<FileDO>();
		}
		String hql = null;
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		if (EnumFileType.CUSTOM.getCode() == sourceType) { // 自定义
			hql = "from FileDO where directory.id in (:ids) and deleted = false order by lastUpdate desc";
			params.add("ids");
			values.add(sources);
		} else {
			hql = "from FileDO where deleted = false and sourceType = :sourceType and source in (:sources) order by lastUpdate desc";
			params.add("sourceType");
			values.add(sourceType);
			params.add("sources");
			values.add(sources);
		}
		return (List<FileDO>) this.query(hql, params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 根据文件名获取当前目录下的所有文件
	 */
	@SuppressWarnings("unchecked")
	public List<FileDO> getFilesByFileName(Integer directoryId, String fileName) {
		return (List<FileDO>) this.query("from FileDO where directory.id = ? and fileName = ? and deleted = false", directoryId, fileName);
	}
	
	/**
	 * 根据文件名获取当前source下的所有文件
	 */
	@SuppressWarnings("unchecked")
	public List<FileDO> getFilesByFileName(Integer source, Integer sourceType, String fileName) {
		return (List<FileDO>) this.query("from FileDO where source = ? and sourceType = ? and fileName = ? and deleted = false", source, sourceType, fileName);
	}
	
	/**
	 * 对文件的删除、更新、保存等动作后，对文件所在目录和所在日常安全工作情况进行更新时间的更新
	 * 
	 * @param file
	 */
	private void updateLastUpdateTime(FileDO file) {
		// 更新文件所在目录的最后更新时间
		if (null != file.getDirectory()) {
			Integer directoryId = file.getDirectory().getId();
			DirectoryDO directory = directoryDao.internalGetById(directoryId);
			directory.setLastUpdate();
			directoryDao.update(directory);
		}
		// 如果是日常安全工作情况上传的文件，需更新文件所在日常安全工作情况的最后更新时间
		if (EnumFileType.SAFETYREVIEW.getCode() == file.getSourceType().intValue()) {
			List<DailySafetyWorkStatusDO> list = dailySafetyWorkStatusDao.getByAttachment(file.getId());
			for (DailySafetyWorkStatusDO dailySafetyWorkStatus : list) {
				dailySafetyWorkStatus.setLastUpdate();
				dailySafetyWorkStatusDao.internalUpdate(dailySafetyWorkStatus);
			}
		}
	}
	
	/**
	 * 通过文件名进行模糊查询
	 * 
	 * @param fileName 文件名
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<FileDO> fuzzySearchByName(String fileName) {
		fileName = fileName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		return (List<FileDO>) this.query("from FileDO where upper(name) like upper(?) escape '/' and deleted = false", "%" + fileName + "%");
	}
	
	
	public void upload4MobileTerminal(ActivityDO activity, List<Map<String, Object>> attachments, boolean isThrowExp) {
		try {
			String uploadFilePath = config.getUploadFilePath();
			if (StringUtils.isBlank(uploadFilePath)) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有配置上传文件的保存路径！");
			Date date = new Date();
			for (Map<String, Object> attachment : attachments) {
				String name = (String) attachment.get("name");
				String path = (String) attachment.get("path");
				byte[] getData=null;
				try {
					
					URL url = new URL(path);
					// 得到输入流
					InputStream inputStream = null;
					if (null != path && path.startsWith("https")) { // 如果请求是https请求则绕过验证
						// Create a trust manager that does not validate certificate
						// chains
						TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
							@Override
							public X509Certificate[] getAcceptedIssuers() {
								return null;
							}
							
							@Override
							public void checkClientTrusted(X509Certificate[] certs, String authType) {
							}
							
							@Override
							public void checkServerTrusted(X509Certificate[] certs, String authType) {
							}
							
						} };
						
						// Install the all-trusting trust manager
						SSLContext sc = SSLContext.getInstance("TLS");
						sc.init(null, trustAllCerts, new SecureRandom());
						HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
						conn.setSSLSocketFactory(sc.getSocketFactory());
						inputStream = conn.getInputStream();
					} else {
						HttpURLConnection conn = (HttpURLConnection) url.openConnection();
						inputStream = conn.getInputStream();
					}
					
					getData = readInputStream(inputStream);
				} catch (MalformedURLException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				} catch (Exception e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				String size="";
				if(getData!=null)
				{
				 size=getSizeString(getData.length);
				}
				// 生成保存在服务器中的文件名(不带文件路径)
				String savedFileName = createFileNameFromClient(name);
				// 附件的信息
				FileDO file = new FileDO();
				// 附件所属目录
				DirectoryDO d = null;
				// 获取安全信息的目录
				d = directoryDao.getSubDirectorysByName(0, EnumSafetyInfoType.INFORMATION_ACQUISITION.getName());
				if (d == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "所属目录不存在！请先创建该目录！");
				file.setDirectory(d);
				if (!this.getFilesByFileName(activity.getId(), 3, name).isEmpty()) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "文件名重复!");
				// 客户端显示的文件名
				file.setFileName(name);
				file.setSize(size);
				// TODO 还未确定
				file.setTag("tag");
				file.setType(FilenameUtils.getExtension(name));
				file.setUploadTime(date);
				file.setUploadUser(activity.getCreator());
				file.setRelativePath("/" + activity.getCreator().getUsername() + "/" + savedFileName);
				// 上传附件的来源类型
				file.setSourceType(3);
				// 不同类型附件的来源ID
				file.setSource(activity.getId());
				//不同类型附件的来源不同来源说明
				file.setDescription(activity.getSummary());
				// 将附件的信息保存到数据库中
				this.internalSave(file);
				this.afterSave(file);
				// 将附件保存到磁盘中
				try {
					FileUtils.writeByteArrayToFile(new File(uploadFilePath + "/" + file.getRelativePath()),getData);
				} catch (IOException e) {
					e.printStackTrace();
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "附件上传失败！");
				}
			}
		} catch(Exception e) {
			e.printStackTrace();
			if (isThrowExp) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
			}
		}
	}
	
	
	/** 
     * 从输出流中获取附件的大小
     * @param byte[]
     * @return  String
     *
     */  
	public String getSizeString(double size) {

		DecimalFormat df = new DecimalFormat("0.00");
		if (size > 1024 * 1024 * 1024) {
			return df.format(size / 1024.0 / 1024.0 / 1024.0) + "GB";
		}
		if (size > 1024 * 1024) {
			return df.format(size / 1024.0 / 1024.0) + "MB";
		}
		if (size > 1024) {
			return df.format(size / 1024.0) + "KB";
		}
		return df.format(size) + "B";
	}

	/**
	 * 从输入流中获取字节数组
	 * 
	 * @param inputStream
	 * @return
	 * @throws IOException
	 */
	public byte[] readInputStream(InputStream inputStream) throws IOException {
		byte[] buffer = new byte[1024];
		int len = 0;
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		while ((len = inputStream.read(buffer)) != -1) {
			bos.write(buffer, 0, len);
		}
		bos.close();
		return bos.toByteArray();
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
	 * 将上传的文件流保存到磁盘中
	 * @param request
	 * @param savedPath 保存的文件路径(绝对路径)
	 * @return
	 */
	public List<Map<String, Object>> uploadFile(HttpServletRequest request, String savedPath) {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		OutputStream fileData = null;
		InputStream in = null;
		List<FileItem> list = null;
		try {
			list = this.getFileItems(request);
			fileData = new ByteArrayOutputStream();
			for (FileItem item : list) {
				in = item.getInputStream();
				this.write(in, fileData);
				String savedFileName = this.createFileNameFromClient(item.getName());
				// 将附件保存到磁盘中
				FileUtils.writeByteArrayToFile(new File(savedPath + "/" + savedFileName), ((ByteArrayOutputStream) fileData).toByteArray());
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("savedFileName", savedFileName);
				map.put("fileItem", item);
				result.add(map);
			}
			
		} catch (Exception e) {
			throw new SMSException(e);
		} finally{
			this.close(in, fileData);
		}
		return result;
	}
	
	public List<FileDO> saveFiles(List<Map<String, Object>> fileItems, UserDO uploadUser, Integer sourceType, Integer directoryId, Integer source, String description, String attachmentType) throws Exception {
		List<FileDO> fileDOs = new ArrayList<FileDO>();
		List<String> details = new ArrayList<String>();
		for (Map<String, Object> map : fileItems) {
			// 生成保存在服务器中的文件名(不带文件路径)
			String savedFileName = (String) map.get("savedFileName");
			FileItem item= (FileItem) map.get("fileItem");
			// 获取文件的信息，生成fileDO对象
			if ("Filedata".equals(item.getFieldName())) {
				// 附件的信息
				FileDO file = new FileDO();
				
				DirectoryDO d = null;
				// 附件是从安全图书馆，安全信息，安全评审上传时，需与图书馆目录关联
				if (sourceType != null && (EnumFileType.CUSTOM.getCode() == sourceType || EnumFileType.SAFETYINFORMATION.getCode() == sourceType || EnumFileType.SAFETYREVIEW.getCode() == sourceType)) {
					// 附件所属目录
					if (EnumFileType.CUSTOM.getCode() == sourceType) {// 自定义
						if (null != directoryId) {
							if (!this.getFilesByFileName(directoryId, item.getName()).isEmpty()) {
								throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "文件名重复!");
							}
							// 从图书馆上传的附件
							d = directoryDao.internalGetById(directoryId);
						}
						if (null == description) {
							description = item.getName();
						}
						source = directoryId;
					} else if (EnumFileType.SAFETYINFORMATION.getCode() == sourceType) {// 安全信息
						// 获取安全信息的目录
						d = directoryDao.getSubDirectorysByName(0, EnumSafetyInfoType.getEnumByVal(attachmentType).getName());
						// 活动日志里的详细内容
						details.add(item.getName() + "("+ EnumSafetyInfoType.getEnumByVal(attachmentType).getName() + ")");
						if (source != null && null == description) {
							ActivityDO activity = activityDao.internalGetById(source);
							description = activity.getSummary();
						}
					} else if (EnumFileType.SAFETYREVIEW.getCode() == sourceType) { // 安全评审
						// 获取安全评审的目录
						d = directoryDao.getSubDirectorysByName(0, EnumDirectoryType.SAFETYREVIEW.toComment());
						if (null == description) {
							DailySafetyWorkStatusDO dailySafetyWorkStatus = dailySafetyWorkStatusDao.internalGetById(source);
							description = dailySafetyWorkStatus.getDescription();
						}
					}
					if (null == d) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "所属目录不存在！请先创建该目录！");
					}
				} else {
					d = fileTypeDirectoryMappingDao.getDirectoryByFileType(String.valueOf(sourceType));
				}
				file.setDirectory(d);
				
				if (null != source && null != sourceType) {
					if (!this.getFilesByFileName(source, sourceType, item.getName()).isEmpty()) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "文件名重复!");
					}
				}
	
				// 客户端显示的文件名
				file.setFileName(item.getName());
				file.setSize(convertFileSize(item.getSize()));
				// TODO 还未确定
				file.setTag("tag");
				file.setType(FilenameUtils.getExtension(item.getName()));
				file.setUploadTime(new Date());
				file.setUploadUser(uploadUser);
				file.setRelativePath("/" + savedFileName);
				// 上传附件的来源类型
				file.setSourceType(sourceType);
				// 不同类型附件的来源ID
				file.setSource(source);
				//不同类型附件的来源不同来源说明
				file.setDescription(description);
				// 将附件的信息保存到数据库中
				this.internalSave(file);
				this.afterSave(file);
				fileDOs.add(file);
			}
	
			// 从安全信息上传的附件时, 活动日志
			if (sourceType != null && EnumFileType.SAFETYINFORMATION.getCode() == sourceType && source != null) {
				MDC.put("details", details.toArray());
				// 添加活动日志
				activityLoggingDao.addLogging(source,
						ActivityLoggingOperationRegister.getOperation("UPLOAD_SAFETYINFORMATION_ATTACHMENT"));
				MDC.remove("details");
			}
		}
		return fileDOs;
	}
	
	/**
	 * 获取上传的文件列表
	 */
	public List<FileItem> getFileItems(HttpServletRequest request) throws IOException, FileUploadException {

		DiskFileItemFactory fac = new DiskFileItemFactory();
		ServletFileUpload upload = new ServletFileUpload(fac);
		upload.setHeaderEncoding("utf-8");
		@SuppressWarnings("unchecked")
		List<FileItem> list = upload.parseRequest(request);
		List<FileItem> result = new ArrayList<FileItem>();
		for (FileItem item : list) {
			if (!item.isFormField()) {
				result.add(item);
			}
		}
		return result;
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
	
	private void close(InputStream in, OutputStream out) {
		IOUtils.closeQuietly(in);
		IOUtils.closeQuietly(out);
	}
	
	/**
	 * 
	 * @param size
	 * @return
	 * @throws Exception
	 */
	public String convertFileSize(long size) {
		if (size > 100 * 1024 * 1024) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "文件大小超过100MB");
		}
		String result = "";
		DecimalFormat df = new DecimalFormat("#0.00");
		Double bsize = new Double(size);
		Double ksize = bsize / 1024;
		if (bsize < 1024) {
			result = bsize.intValue() + "B";
		} else if (ksize < 1024) {
			result = df.format(ksize) + "KB";
		} else {
			result = df.format(ksize / 1024) + "MB";
		}
		return result;
	}
	
	/**
	 * 将附件克隆挂到新的source下
	 * @param originalFileType 源附件类型
	 * @param originalSource 源附件的source
	 * @param newFileType 新附件的类型
	 * @param newSource 新附件的source
	 */
	public void cloneFilesToNewSource(EnumFileType originalFileType, int originalSource, EnumFileType newFileType, int newSource) {
		List<FileDO> files = this.getFilesBySource(originalFileType.getCode(), originalSource);
		for (FileDO file : files) {
			FileDO newFile;
			try {
				newFile = (FileDO) BeanUtils.cloneBean(file);
				newFile.setId(null);
				newFile.setSource(newSource);
				newFile.setSourceType(newFileType.getCode());
				this.internalSave(newFile);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	
	/**
	 * @param directoryDao the directoryDao to set
	 */
	public void setDirectoryDao(DirectoryDao directoryDao) {
		this.directoryDao = directoryDao;
	}
	
	/**
	 * @param activityDao the activityDao to set
	 */
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	/**
	 * @param activityLoggingDao the activityLoggingDao to set
	 */
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
	public void setAuditActivityLoggingDao(AuditActivityLoggingDao auditActivityLoggingDao) {
		this.auditActivityLoggingDao = auditActivityLoggingDao;
	}

	/**
	 * @param actionDao the actionDao to set
	 */
	public void setActionDao(ActionDao actionDao) {
		this.actionDao = actionDao;
	}
	
	/**
	 * @param permissionSetDao the permissionSetDao to set
	 */
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	/**
	 * @param dailySafetyWorkStatusDao the dailySafetyWorkStatusDao to set
	 */
	public void setDailySafetyWorkStatusDao(DailySafetyWorkStatusDao dailySafetyWorkStatusDao) {
		this.dailySafetyWorkStatusDao = dailySafetyWorkStatusDao;
	}

	public void setFileTypeDirectoryMappingDao(FileTypeDirectoryMappingDao fileTypeDirectoryMappingDao) {
		this.fileTypeDirectoryMappingDao = fileTypeDirectoryMappingDao;
	}
	
}
