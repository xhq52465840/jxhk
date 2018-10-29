package com.usky.sms.message;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.StringHelper;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.PagedData;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.role.RoleDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;

public class MessageService extends AbstractService {

	@Autowired
	private MessageDao messageDao;

	@Autowired
	private UserDao userDao;

	@Autowired
	private OrganizationDao organizationDao;

	@Autowired
	private RoleDao roleDao;

	@Autowired
	private UserGroupDao userGroupDao;

	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private FileDao fileDao;

	/**
	 * 获取信息的种类
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public void getMessageCatagories(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<Map<String, Object>> datas = new ArrayList<Map<String,Object>>();
			for (EnumMessageCatagory catatory : EnumMessageCatagory.values()) {
				Map<String, Object> dataMap = new HashMap<String, Object>();
				dataMap.put("id", catatory.getCode());
				dataMap.put("name", catatory.getDescription());
				datas.add(dataMap);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(datas, request));
	
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
	 * 获取当前用户所发送的消息
	 * 
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public void getMessages(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String paramType = request.getParameter("paramType");
		String sourceType = request.getParameter("sourceType");
		Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
		Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
		List<MessageDO> messages = null;
		PagedData pagedData = null;
		try {
			if ("getMessagesBySender".equals(paramType)) { // 获取当前用户所发送的消息
				pagedData = messageDao.getMessagesBySender(start, length, UserContext.getUser(), sourceType);
			} else if ("getUncheckedMessagesBySender".equals(paramType)) { // 获取当前用户未查看的发送的消息
				pagedData = messageDao.getUncheckedMessagesBySender(start, length, UserContext.getUser(), sourceType);
			} else if ("getUncheckedMessagesByReceiver".equals(paramType)) { // 获取当前用户未查看的消息
				pagedData = messageDao.getUncheckedMessagesByReceiver(start, length, UserContext.getUser(), sourceType);
			} else if ("getMessagesByReceiver".equals(paramType)) { // 获取当前用户所接收的消息
				pagedData = messageDao.getMessagesByReceiver(start, length, UserContext.getUser(), sourceType);
			}
			List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
			messages = (List<MessageDO>) pagedData.getData();
			if (null != messages) {
				for (MessageDO message : messages) {
					list.add(messageDao.convert(message));
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request, pagedData.getTotalCount()));

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
	 * 发送或查看消息
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void modifyMessage(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String paramType = request.getParameter("paramType");
			if ("sendMessage".equals(paramType)) {
				MessageDO message = new MessageDO();

				getMessageContent(message, request);
				
				// 获取接收人
				Set<UserDO> receivers = getReceivers(request);
				
				if (null == receivers || receivers.isEmpty()) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "接收人不存在！");
				}
				
				// 发送邮件和消息
				Map<String, Object> idsMap = messageDao.sendMessageAndEmail(message, receivers);
				
				if (request.getParameter("files") != null) {
					@SuppressWarnings("unchecked")
					List<Number> fileIdsNumber = gson.fromJson(request.getParameter("files"), List.class);
					if (fileIdsNumber != null && !fileIdsNumber.isEmpty()) {
						List<Integer> fileIdsInteger = new ArrayList<Integer>();
						for (Number fileId : fileIdsNumber) {
							fileIdsInteger.add(fileId.intValue());
						}
						List<FileDO> files = fileDao.getByIds(fileIdsInteger);
						@SuppressWarnings("unchecked")
						List<Integer> messageIds = (List<Integer>) idsMap.get("messages");
						if (messageIds != null) {
							int i = 0;
							for (Integer messageId : messageIds) {
								for (FileDO file : files) {
									if (i ==0) {
										file.setSource(messageId);
										fileDao.update(file);
									} else {
										FileDO newFile = new FileDO();
										BeanUtils.copyProperties(file, newFile);
										newFile.setSource(messageId);
										newFile.setId(null);
										fileDao.internalSave(newFile);
									}
								}
								i++;
							}
						}
					}
				}
			} else if ("checkMessage".equals(paramType)) {
				checkMessage(request);
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
	 * 查看消息
	 */
	public void checkMessage(HttpServletRequest request) throws Exception {
		Integer messageId = Integer.parseInt(request.getParameter("messageId"));
		Map<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("checked", true);
		paramMap.put("checkTime", new Timestamp(System.currentTimeMillis()));
		messageDao.update(messageId, paramMap);
	}
	
	/** 从页面请求解析出收件人 */
	private Set<UserDO> getReceivers(HttpServletRequest request){
		Set<UserDO> receivers = new HashSet<UserDO>();
		Set<Integer> userIdSet = new HashSet<Integer>();
		// 页面传入的userIds,并将其加入userid的set中
		Integer[] userIds = gson.fromJson(request.getParameter("userIds"),
				Integer[].class);
		userIdSet.addAll(Arrays.asList(userIds));

		// 页面传入的organizationIds
		String[] organizationIds = gson.fromJson(
				request.getParameter("organizationIds"), String[].class);

		// 页面传入的roleId和unitIds对
		List<Map<String, Object>> roleUnitMaps = gson.fromJson(
				request.getParameter("unitIds"),
				new TypeToken<List<Map<String, Object>>>() {
				}.getType());

		for (Map<String, Object> map : roleUnitMaps) {
			Double roleId = (Double) map.get("roleId");
			@SuppressWarnings("unchecked")
			List<String> unitIds = (List<String>) map.get("unitIds");
			if(null != roleId && null != unitIds){
				userIdSet.addAll(unitRoleActorDao.getUserIdsByUnitIdsAndRoleId(roleId.intValue(), StringHelper.converStringListToIntegerList(unitIds)));
			}

		}

		// 通过organizationIds获取users,并加入接收人set中
		if (organizationIds.length > 0) {
			List<OrganizationDO> organizations = organizationDao
					.internalGetByIds(organizationIds);
			for (OrganizationDO organization : organizations) {
				receivers.addAll(organization.getUsers());
			}
		}

		if (!userIdSet.isEmpty()) {
			receivers.addAll(userDao.getByIds(new ArrayList<Integer>(userIdSet)));
		}
		return receivers;
	}
	
	/** 从页面请求解析消息内容 */
	private void getMessageContent(MessageDO message, HttpServletRequest request){
		
		String link = request.getParameter("link");
		String title = request.getParameter("title");
		String content = request.getParameter("content");
		String sourceType = request.getParameter("sourceType");
		message.setChecked(false);
		message.setLink(link);
		message.setSender(UserContext.getUser());
		message.setSendTime(new Timestamp(System.currentTimeMillis()));
		message.setTitle(title);
		message.setContent(content);
		message.setSourceType(sourceType == null ? "" : sourceType.toUpperCase());
		
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	/**
	 * @param userDao
	 *            the userDao to set
	 */
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	/**
	 * @param organizationDao
	 *            the organizationDao to set
	 */
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	/**
	 * @param roleDao
	 *            the roleDao to set
	 */
	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}

	/**
	 * @param userGroupDao
	 *            the userGroupDao to set
	 */
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	/**
	 * @param unitRoleActorDao
	 *            the unitRoleActorDao to set
	 */
	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

}

