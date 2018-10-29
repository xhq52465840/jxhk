package com.usky.sms.directory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;

public class DirectoryService extends AbstractService {

	@Autowired
	private DirectoryDao directoryDao;

	@Autowired
	private UnitDao unitDao;

	@Autowired
	DailySafetyWorkStatusDao dailySafetyWorkStatusDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;

	/**
	 * 获取目录
	 */
	public void getDirectorys(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		String paramType = request.getParameter("paramType");
		List<DirectoryDO> directorys = new ArrayList<DirectoryDO>();
		try {
			Integer directoryId = StringUtils.isBlank(request.getParameter("directoryId")) ? null : Integer
					.parseInt(request.getParameter("directoryId"));
			String searchKey = request.getParameter("searchKey");
			boolean showExtensions = false;
			// 返回的字段
			String[] fields = { "id", "father", "name", "description", "status", "type", "sortKey" };
			if ("getAllDirectorys".equals(paramType)) { // 获取所有发布的目录.
				if (permissionSetDao.hasPermission(PermissionSets.VIEW_SAFETY_LIBRARY_SYS_DIR.getName())) {
					directorys = getAllDirectorys();
				} else {
					directorys = getCustomDirectorys();
				}
			} else if ("getDirectoryById".equals(paramType)) { // 通过ID获取目录信息.
				DirectoryDO directory = directoryDao.internalGetById(directoryId);
				if (null != directory) {
					if (EnumDirectoryType.SAFETYREVIEW.getCode() == directory.getType()) { // 安全评审的时候，通过安全评审完成状态获取附件信息
						/** 不需要返回日常安全工作情况的信息
						List<DailySafetyWorkStatusDO> dailySafetyWorkStatusList = dailySafetyWorkStatusDao
								.getByDirectoryId(directoryId);
						result.put("dailySafetyWorkStatusData", PageHelper.getPagedResult(
								dailySafetyWorkStatusDao.convert(dailySafetyWorkStatusList,
										showExtensions), request));
										*/
					}
					directorys.add(directory);
					showExtensions = true;
				}
			} else if ("getCustom".equals(paramType)) { // 获取自定义的目录
				if (StringUtils.isBlank(searchKey)) {
					directorys = getCustomDirectorys();
				} else {
					directorys = fuzzySearchByName(searchKey);
				}
			} else if ("getSubDirectorys".equals(paramType)) { // 获取当前目录的子目录
				if (StringUtils.isBlank(searchKey)) {
					directorys = getSubDirectorys(directoryId);
				} else {
					directorys = fuzzySearchSubDirectorysByName(searchKey, directoryId);
				}
			}

			result.put("success", true);
			result.put("managable", permissionSetDao.hasPermission(PermissionSets.MANAGE_SAFETY_LIBRARY.getName()));
			result.put("directoryData", PageHelper.getPagedResult(directoryDao.convert(directorys, Arrays.asList(fields), showExtensions), request));

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
	 * 修改目录
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void modifyDirectory(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			// 是否有管理图书馆的全局权限
			directoryDao.checkModifyPermission();
			String paramType = request.getParameter("paramType");

			Integer fatherId = StringUtils.isBlank(request.getParameter("fatherId")) ? null : Integer.parseInt(request
					.getParameter("fatherId"));
			if (null == fatherId) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "所属章节不能为空！");
			}
			
			Integer previousId = StringUtils.isBlank(request.getParameter("previousId")) ? null : Integer
					.parseInt(request.getParameter("previousId"));
			Integer status = StringUtils.isBlank(request.getParameter("status")) ? 0 : Integer.parseInt(request
					.getParameter("status"));
			// 默认是自定义目录
			Integer type = StringUtils.isBlank(request.getParameter("type")) ? EnumDirectoryType.CUSTOM.getCode() : Integer.parseInt(request
					.getParameter("type"));
			
			// 系统目录不允许修改
			if (type != EnumDirectoryType.CUSTOM.getCode()) {
				throw SMSException.NO_ACCESS_RIGHT;
			}
			String name = request.getParameter("name");
			if(StringUtils.isBlank(name)){
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "条目标题不能为空！");
			}
			String description = request.getParameter("description");
			DirectoryDO directory = null;
			if ("addDirectory".equals(paramType)) {
				directory = new DirectoryDO();
				directory.setType(type);
				directory.setCreator(UserContext.getUser());
			} else if ("updateDirectory".equals(paramType)) {
				Integer directoryId = Integer.parseInt(request.getParameter("directoryId"));
				directory = directoryDao.internalGetById(directoryId);
			}
			DirectoryDO previous = previousId == null ? null : directoryDao.internalGetById(previousId);
			
			// 安全评审下允许目录名重复, 其他类型不允许目录名重复(目录名改变了或者父目录变了需要进行判断)
			if (type != EnumDirectoryType.SAFETYREVIEW.getCode() && (!name.equals(directory.getName()) || !directory.getFather().getId().equals(fatherId))) {
				if (null != directoryDao.getSubDirectorysByName(fatherId, name)) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该条目已存在");
				}
			}
			// 新目录的父目录
			DirectoryDO father = directoryDao.internalGetById(fatherId);
			if(null == father){
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "所属章节[章节ID:" + fatherId + "]不存在！");
			}

			directory.setName(name);
			directory.setDescription(description);
			directory.setStatus(status);
			if (null == directory.getFather()) {
				// 新增目录
				directory.setFather(father);
				directoryDao.addDirectory(directory, previous);
			} else if (father.equals(directory.getFather())) {
				// 同父目录下的更新
				directoryDao.updateDirectoryToSameFather(directory, previous);
			} else {
				// 不同父目录下的更新
				directoryDao.updateDirectoryToDiffFather(directory, previous, father);
			}

			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("directoryId", directory.getId());

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
	 * 获取图书馆的全局权限值
	 * @param request
	 * @param response
	 */
	public void getSafetyLibraryPermissions(HttpServletRequest request,HttpServletResponse response){
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("managable", permissionSetDao.hasPermission(PermissionSets.MANAGE_SAFETY_LIBRARY.getName()));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 全文检索条目信息
	 * @param request
	 * @param response
	 */
	public void fuzzySearchDirectoryInfos(HttpServletRequest request, HttpServletResponse response) {
		try {
			// 关键字
			String searchKey = request.getParameter("searchKey");
			// 显示的页数
			int showPage = request.getParameter("showPage") == null ? 1 : Integer.parseInt(request.getParameter("showPage") );
			// 每页显示的数量
			int row = request.getParameter("row") == null ? 10 : Integer.parseInt(request.getParameter("row"));
			// 查询结果
			Map<String,Object> map = directoryDao.fuzzySearch(searchKey, showPage, row);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("totalCount", map.get("totalCount"));
			result.put("data", map.get("dataList"));

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
	 * 全文检索危险源条目信息
	 * @param request
	 * @param response
	 */
	public void fuzzySearchRiskSourceDirectoryInfos(HttpServletRequest request, HttpServletResponse response) {
		try {
			// 关键字
			String searchKey = request.getParameter("searchKey");
			// 显示的页数
			int showPage = request.getParameter("showPage") == null ? 1 : Integer.parseInt(request.getParameter("showPage") );
			// 每页显示的数量
			int row = request.getParameter("row") == null ? 10 : Integer.parseInt(request.getParameter("row"));
			// 危险源
			DirectoryDO root = directoryDao.getSubDirecotoryByName("自定义条目", null);
			DirectoryDO father = directoryDao.getSubDirecotoryByName("危险源", root.getId());
			// 查询结果
			Map<String,Object> map = directoryDao.fuzzySearchRiskSource(father, searchKey, showPage, row);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("totalCount", map.get("totalCount"));
			result.put("data", map.get("dataList"));

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
	 * 全文检索危险源段落信息
	 * @param request
	 * @param response
	 */
	public void fuzzySearchRiskSourceSectionInfos(HttpServletRequest request, HttpServletResponse response) {
		try {
			// 关键字
			String searchKey = request.getParameter("searchKey");
			// 显示的页数
			int showPage = request.getParameter("showPage") == null ? 1 : Integer.parseInt(request.getParameter("showPage") );
			// 每页显示的数量
			int row = request.getParameter("row") == null ? 10 : Integer.parseInt(request.getParameter("row"));
			// 危险源
			DirectoryDO root = directoryDao.getSubDirecotoryByName("自定义条目", null);
			DirectoryDO father = directoryDao.getSubDirecotoryByName("危险源", root.getId());
			// 查询结果
			Map<String,Object> map = directoryDao.fuzzySearchRiskSourceSection(father, searchKey, showPage, row);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("totalCount", map.get("totalCount"));
			result.put("data", map.get("dataList"));

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
	 * 获取安全信息附件信息类别
	 * @param request
	 * @param response
	 */
	public void getSafetyInfoType(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			// 关键字
			String term = request.getParameter("term");
			for (EnumSafetyInfoType e : EnumSafetyInfoType.values()) {
				if (StringUtils.isNotBlank(term)) {
					if (!StringUtils.containsIgnoreCase(e.getName(), term)) {
						continue;
					}
				}
				Map<String, Object> type = new HashMap<String, Object>();
				type.put("id", e.getCode());
				type.put("name", e.getName());
				list.add(type);
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			
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
	 * 获取所有未删除的目录.
	 */
	private List<DirectoryDO> getAllDirectorys() {
		return directoryDao.getAllDirectorys();
	}

	/**
	 * 获取所有自定义的目录.
	 */
	private List<DirectoryDO> getCustomDirectorys() {
		return directoryDao.getCustomDirectorys();
	}

	/**
	 * 获取当前目录下的子目录
	 */
	private List<DirectoryDO> getSubDirectorys(Integer directoryId) {
		if (null == directoryId) {
			return directoryDao.getCustomDirectorys();
		}
		return directoryDao.getSubDirectorys(directoryId);
	}

	/**
	 * 通过目录名进行模糊查询
	 * 
	 * @param content
	 *            搜索内容
	 * @return 目录列表
	 */
	private List<DirectoryDO> fuzzySearchByName(String content) {
		return directoryDao.fuzzySearchByName(content);
	}

	/**
	 * 通过目录名进行当前目录的子目录的模糊查询
	 * 
	 * @param content
	 *            搜索内容
	 * @return 目录列表
	 */
	private List<DirectoryDO> fuzzySearchSubDirectorysByName(String content, Integer fatherId) {
		return directoryDao.fuzzySearchSubDirectorysByName(content, fatherId);
	}
	
	public void setDirectoryDao(DirectoryDao directoryDao) {
		this.directoryDao = directoryDao;
	}

	/**
	 * @param unitDao
	 *            the unitDao to set
	 */
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	/**
	 * @param dailySafetyWorkStatusDao
	 *            the dailySafetyWorkStatusDao to set
	 */
	public void setDailySafetyWorkStatusDao(DailySafetyWorkStatusDao dailySafetyWorkStatusDao) {
		this.dailySafetyWorkStatusDao = dailySafetyWorkStatusDao;
	}

	/**
	 * @param permissionSetDao the permissionSetDao to set
	 */
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

}
