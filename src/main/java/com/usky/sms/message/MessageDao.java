package com.usky.sms.message;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.improvenotice.ImproveNoticeDO;
import com.usky.sms.audit.improvenotice.ImproveNoticeDao;
import com.usky.sms.audit.improvenotice.SubImproveNoticeDO;
import com.usky.sms.audit.improvenotice.SubImproveNoticeDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.PagedData;
import com.usky.sms.eiosa.EiosaReportDO;
import com.usky.sms.eiosa.IsarpDO;
import com.usky.sms.eiosa.IsarpDao;
import com.usky.sms.eiosa.ReportDao;
import com.usky.sms.email.EmailDO;
import com.usky.sms.email.EmailDao;
import com.usky.sms.email.EnumSendStatus;
import com.usky.sms.email.SmtpDO;
import com.usky.sms.email.SmtpDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.risk.RiskDO;
import com.usky.sms.risk.RiskDao;
import com.usky.sms.shortmessage.ShortMessageDO;
import com.usky.sms.shortmessage.ShortMessageDao;
import com.usky.sms.tem.ActionItemDO;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.workflow.WorkflowService;

public class MessageDao extends BaseDao<MessageDO> {
	
	private static final Logger log = Logger.getLogger(MessageDao.class);
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private RiskDao riskDao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private SmtpDao smtpDao;
	
	@Autowired
	private EmailDao emailDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private ImproveNoticeDao improveNoticeDao;
	
	@Autowired
	private SubImproveNoticeDao subImproveNoticeDao;

	@Autowired
	private ActionItemDao actionItemDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private IsarpDao isarpDao;
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private ShortMessageDao shortMessageDao;
	
	@Autowired
	private UserDao userDao;
	
	public MessageDao() {
		super(MessageDO.class);
	}
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("sender".equals(key) || "receiver".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}

	@Override
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		MessageDO message = (MessageDO) obj;
		if ("sourceType".equals(fieldName) && !multiple) {
			String link = message.getLink();
			if (!StringUtils.isBlank(link)) {
				Integer linkInt = Integer.parseInt(link);
				if ("ACTIVITY".equalsIgnoreCase(message.getSourceType())) {
					ActivityDO activity = activityDao.getBasicInfoById(linkInt);
					if (null != activity) {
						Map<String, String> activityMap = new HashMap<String, String>();
						activityMap.put("id", linkInt.toString());
						activityMap.put("summary", activity.getSummary());
						map.put("activity", activityMap);
					}
				} else if ("RISK".equalsIgnoreCase(message.getSourceType())) {
					RiskDO risk = riskDao.getBasicInfoById(linkInt);
					if (null != risk) {
						Map<String, String> activityMap = new HashMap<String, String>();
						activityMap.put("id", linkInt.toString());
						activityMap.put("activitySummary", risk.getRsummary());
						map.put("risk", activityMap);
					}
				} else if ("TRACE".equalsIgnoreCase(message.getSourceType())) {
					Map<String, Object> improveMap = improveDao.getBasicInfoMapById(linkInt);
					if (null != improveMap) {
						Map<String, String> activityMap = new HashMap<String, String>();
						activityMap.put("id", linkInt.toString());
						activityMap.put("planType", (String) improveMap.get("planType"));
						activityMap.put("checType", (String) improveMap.get("checType"));
						activityMap.put("traceName", (String) improveMap.get("traceName"));
						map.put("trace", activityMap);
					}
				} else if ("IMPROVE".equalsIgnoreCase(message.getSourceType())) {
					ImproveDO improve = improveDao.getBasicInfoById(linkInt);
					if (null != improve) {
						Map<String, String> activityMap = new HashMap<String, String>();
						activityMap.put("id", linkInt.toString());
						activityMap.put("improveName", improve.getImproveName());
						map.put("improve", activityMap);
					}
				} else if ("IMPROVE_TRANSMIT_COMMIT".equalsIgnoreCase(message.getSourceType())) {
					ImproveDO improve = improveDao.getBasicInfoById(linkInt);
					if (null != improve) {
						Map<String, String> activityMap = new HashMap<String, String>();
						activityMap.put("id", linkInt.toString());
						activityMap.put("improveName", improve.getImproveName());
						map.put("improveTransmitCommit", activityMap);
					}
				} else if ("IMPROVE_NOTICE_TRACE".equalsIgnoreCase(message.getSourceType())) {
					ImproveNoticeDO improveNotice = (ImproveNoticeDO) improveNoticeDao.getBasicInfoById(linkInt);
					if (null != improveNotice) {
						Map<String, String> improveNoticeMap = new HashMap<String, String>();
						improveNoticeMap.put("id", improveNotice.getId().toString());
						improveNoticeMap.put("operator", improveNotice.getOperator());
						improveNoticeMap.put("improveNotice", improveNotice.getDisplayName());
						map.put("improveNoticeTrace", improveNoticeMap);
					}
				} else if ("IMPROVE_NOTICE".equalsIgnoreCase(message.getSourceType())) {
					ImproveNoticeDO improveNotice = (ImproveNoticeDO) improveNoticeDao.getBasicInfoById(linkInt);
					if (null != improveNotice) {
						Map<String, String> improveNoticeMap = new HashMap<String, String>();
						improveNoticeMap.put("id", improveNotice.getId().toString());
						improveNoticeMap.put("operator", improveNotice.getOperator());
						improveNoticeMap.put("improveNotice", improveNotice.getDisplayName());
						map.put("improveNotice", improveNoticeMap);
					}
				} else if ("IMPROVE_NOTICE_AUDIT_WAITING".equalsIgnoreCase(message.getSourceType())) {
					ImproveNoticeDO improveNotice = (ImproveNoticeDO) improveNoticeDao.getBasicInfoById(linkInt);
					if (null != improveNotice) {
						Map<String, String> improveNoticeMap = new HashMap<String, String>();
						improveNoticeMap.put("id", improveNotice.getId().toString());
						improveNoticeMap.put("improveNotice", improveNotice.getDisplayName());
						map.put("improveNoticeAuditWaiting", improveNoticeMap);
					}
				} else if ("IMPROVE_NOTICE_AUDIT_REJECTED".equalsIgnoreCase(message.getSourceType())) {
					ImproveNoticeDO improveNotice = (ImproveNoticeDO) improveNoticeDao.getBasicInfoById(linkInt);
					if (null != improveNotice) {
						Map<String, String> improveNoticeMap = new HashMap<String, String>();
						improveNoticeMap.put("id", improveNotice.getId().toString());
						improveNoticeMap.put("improveNotice", improveNotice.getDisplayName());
						map.put("improveNoticeAuditRejected", improveNoticeMap);
					}
				} else if ("SUB_IMPROVE_NOTICE".equalsIgnoreCase(message.getSourceType())) {
					SubImproveNoticeDO subimproveNotice = (SubImproveNoticeDO) subImproveNoticeDao.getBasicInfoById(linkInt);
					if (null != subimproveNotice) {
						Map<String, String> subimproveNoticeMap = new HashMap<String, String>();
						subimproveNoticeMap.put("id", subimproveNotice.getId().toString());
						subimproveNoticeMap.put("subImproveNotice", subimproveNotice.getDisplayName());
						map.put("subImproveNotice", subimproveNoticeMap);
					}
				} else if ("SUB_IMPROVE_NOTICE_CLOSE".equalsIgnoreCase(message.getSourceType())) {
					SubImproveNoticeDO subimproveNotice = (SubImproveNoticeDO) subImproveNoticeDao.getBasicInfoById(linkInt);
					if (null != subimproveNotice) {
						Map<String, Object> subimproveNoticeMap = new HashMap<String, Object>();
						subimproveNoticeMap.put("id", subimproveNotice.getId().toString());
						subimproveNoticeMap.put("subImproveNotice", subimproveNotice.getDisplayName());
						subimproveNoticeMap.put("action", workflowService.getActionsWithAttributes(subimproveNotice.getFlowId()));
						map.put("subImproveNoticeClose", subimproveNoticeMap);
					}
				} else if("RISKVALIDATE".equalsIgnoreCase(message.getSourceType())) {
					ActionItemDO actionItem = actionItemDao.getBasicInfoById(linkInt);
					if (null != actionItem) {
						Map<String, String> riskMap = new HashMap<String, String>();
						riskMap.put("id", linkInt.toString());
						riskMap.put("riskValidate", actionItem.getDescription());
						map.put("riskValidate", riskMap);
					}
				} else if("ERJIJIEAN".equalsIgnoreCase(message.getSourceType())) {
					ImproveDO basicInfo = improveDao.getBasicInfoById(linkInt);
					if (null != basicInfo) {
						Map<String, Object> activityMap = new HashMap<String, Object>();
						activityMap.put("id", linkInt.toString());
						activityMap.put("improveName", basicInfo.getImproveName());
						activityMap.put("action", workflowService.getActionsWithAttributes((String) basicInfo.getFlowId()));
						map.put("erjijiean", activityMap);
					   }
						
					}else if("ISARP".equalsIgnoreCase(message.getSourceType())) {
						IsarpDO isarp =(IsarpDO)isarpDao.get(linkInt);
						if (null != isarp) {
							Map<String, Object> isarpMap = new HashMap<String, Object>();
							isarpMap.put("id", linkInt.toString());
							isarpMap.put("sectionId", isarp.getSectionId().getId());
							isarpMap.put("summary", "("+isarp.getSectionId().getSectionName()+")"+isarp.getNo());
							map.put("isarp", isarpMap);
						}
				   }else if("EIOSA_REAUDIT".equalsIgnoreCase(message.getSourceType())){
					   EiosaReportDO report=(EiosaReportDO)reportDao.internalGetById(linkInt);
					   if(null!=report){
						   Map<String, Object> reportMap = new HashMap<String, Object>();
						   reportMap.put("id", report.getId());
						   reportMap.put("summary",  "查看我分配到的任务");
						   map.put("eiosa_audit", reportMap);
					   }
					 
				   }
			}
		} else if("sendTime".equals(fieldName)){
			Date sendTime = message.getSendTime();
			map.put("sendTime", DateHelper.formatIsoSecond(sendTime));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
		
	}

	@Override
	protected void afterGetById(Map<String, Object> map) {
		Integer id = ((Number) map.get("id")).intValue();
		List<FileDO> files = fileDao.getFilesBySource(EnumFileType.MESSAGE.getCode(), id);
		map.put("files", fileDao.convert(files));
		super.afterGetById(map);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap,
			Map<String, Object> searchMap, List<String> orders) {
		// 附件
		List<Integer> ids = new ArrayList<Integer>();
		for (Map<String, Object> map : list) {
			ids.add((Integer) map.get("id"));
		}
		List<Map<String, Object>> fileMaps = fileDao.convert(fileDao.getFilesBySources(EnumFileType.MESSAGE.getCode(), ids), false);
		// file按source分组
		Map<Integer, Object> groupMap = new HashMap<Integer, Object>();
		for (Map<String, Object> fileMap : fileMaps) {
			Integer source = (Integer) fileMap.get("source");
			List<Map<String, Object>> groupList = null;
			if (groupMap.containsKey(source)) {
				groupList = (List<Map<String, Object>>) groupMap.get(source);
				groupList.add(fileMap);
			} else {
				groupList = new ArrayList<Map<String,Object>>();
				groupList.add(fileMap);
				groupMap.put(source, groupList);
			}
		}
		
		// 将分组好的file挂到问题列表中
		for (Map<String, Object> map : list) {
			map.put("files", groupMap.get((Integer) map.get("id")));
		}
		super.afterGetList(list, paramMap, searchMap, orders);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("sendTime", new Date());
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		if (map.containsKey("senderChecked") && (Boolean) map.get("senderChecked")) {
			map.put("senderCheckTime", new Date());
		}
		if (map.containsKey("checked") && (Boolean) map.get("checked")) {
			map.put("checkTime", new Date());
		}
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	/**
	 * 获取用户所发送的消息
	 * 
	 * @param sender
	 *            用户
	 * @return 所发送的消息
	 */
	public PagedData getMessagesBySender(Integer start, Integer length, UserDO sender, String sourceType) {
		StringBuffer hql = new StringBuffer("from MessageDO where deleted = false");
		List<Object> params = new ArrayList<Object>();
		if (null != sender) {
			hql.append(" and sender.id = ? ");
			params.add(sender.getId());
		}
		if (null != sourceType) {
			hql.append(" and sourceType = ?");
			params.add(sourceType);
		}
		hql.append(" order by sendTime desc");
		return this.pagedQuery(start, length, hql.toString(), params.toArray());
	}

	/**
	 * 获取用户的未查看的发送的消息
	 * 
	 * @param user
	 *            用户
	 * @return 未查看的消息
	 */
	public PagedData getUncheckedMessagesBySender(Integer start, Integer length, UserDO user, String sourceType) {
		StringBuffer hql = new StringBuffer("from MessageDO where deleted = false and senderChecked = false");
		List<Object> params = new ArrayList<Object>();
		if (null != user) {
			hql.append(" and sender.id = ? ");
			params.add(user.getId());
		}
		if (null != sourceType) {
			hql.append(" and sourceType = ?");
			params.add(sourceType);
		}
		hql.append(" order by sendTime desc");
		return this.pagedQuery(start, length, hql.toString(), params.toArray());
	}
	/**
	 * 获取用户的未查看的消息
	 * 
	 * @param user
	 *            用户
	 * @return 未查看的消息
	 */
	public PagedData getUncheckedMessagesByReceiver(Integer start, Integer length, UserDO user, String sourceType) {
		StringBuffer hql = new StringBuffer("from MessageDO where deleted = false and checked = false");
		List<Object> params = new ArrayList<Object>();
		if (null != user) {
			hql.append(" and receiver.id = ? ");
			params.add(user.getId());
		}
		if (null != sourceType) {
			hql.append(" and sourceType = ?");
			params.add(sourceType);
		}
		hql.append(" order by sendTime desc");
		return this.pagedQuery(start, length, hql.toString(), params.toArray());
	}
	
	/**
	 * 获取用户的未查看的消息的条数
	 * 
	 * @param user
	 *            用户
	 * @return 未查看的消息
	 */
	@SuppressWarnings("unchecked")
	public Integer getUncheckedMessageCountByReceiver(UserDO user, String sourceType) {
		StringBuffer hql = new StringBuffer("select count(*) from MessageDO where deleted = false and checked = false");
		List<Object> params = new ArrayList<Object>();
		if (null != user) {
			hql.append(" and receiver.id = ? ");
			params.add(user.getId());
		}
		if (null != sourceType) {
			hql.append(" and sourceType = ?");
			params.add(sourceType);
		}
		return ((List<Long>) this.query(hql.toString(), params.toArray())).get(0).intValue();
	}

	/**
	 * 获取用户的所接收的消息
	 * 
	 * @param user
	 *            用户
	 * @return 未查看的消息
	 */
	public PagedData getMessagesByReceiver(Integer start, Integer length, UserDO user, String sourceType) {
		StringBuffer hql = new StringBuffer("from MessageDO where deleted = false");
		List<Object> params = new ArrayList<Object>();
		if (null != user) {
			hql.append(" and receiver = ? ");
			params.add(user);
		}
		if (null != sourceType) {
			hql.append(" and sourceType = ?");
			params.add(sourceType);
		}
		hql.append(" order by sendTime desc");
		return this.pagedQuery(start, length, hql.toString(), params.toArray());
	}
	
	/** 发送消息 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Map<String, Object> sendMessageAndEmail(MessageDO message, Collection<UserDO> receivers) {
		Map<String, Object> result = new HashMap<String, Object>();
		if (null != message && null != receivers && !receivers.isEmpty()) {
			EmailDO email = new EmailDO();
			email.setContent(message.getContent());
			email.setSubject(message.getTitle());
	
			// 发送邮件
	//		result.put("emails", sendEmail(email, receivers));
			
			// 发送消息
			result.put("messages", sendMessage(message, receivers));
			
			// 添加活动日志
			addActivityLoggingForAddAssist(message, receivers);
		}
		return result;
	}
	
	/**
	 *  发送消息 
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Integer> sendMessage(MessageDO message, Collection<UserDO> receivers) {
		List<Integer> list = new ArrayList<Integer>();
		for (UserDO receiver : receivers) {
			MessageDO newMessage;
			try {
				newMessage = (MessageDO) BeanUtils.cloneBean(message);
				newMessage.setReceiver(receiver);
				list.add((Integer) this.internalSave(newMessage));
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return list;
	}
	
	/** 发送邮件  
	 * @throws Exception */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Integer> sendEmail(EmailDO email, Collection<UserDO> receivers) throws Exception{
		List<Integer> result = new ArrayList<Integer>();
		for (UserDO receiver : receivers) {
			List<SmtpDO> list = smtpDao.getAllList();
			if (list.size() == 0) {
				log.warn("没有配置smtp,无法发送邮件！");
				return result;
			}
			EmailDO newEmail;
			try {
				newEmail = (EmailDO) BeanUtils.cloneBean(email);
				// 发件人
				newEmail.setFrom(list.get(0).getAddress());
				// 收件人
				newEmail.setTo(receiver.getEmail());
				// 等待发送
				newEmail.setSendStatus(EnumSendStatus.WAITING.getCode());
				result.add((Integer) emailDao.internalSave(newEmail));
			} catch (Exception e) {
				e.printStackTrace();
				throw e;
			}
		}
		return result;
	}
	
	/**
	 * 添加协助处理的活动日志
	 * @param message
	 * @param receivers
	 */
	private void addActivityLoggingForAddAssist(MessageDO message, Collection<UserDO> receivers){
		if ("ACTIVITY".equals(message.getSourceType())) {
			List<String> details = new ArrayList<String>();
			List<String> userNames = new ArrayList<String>();
			for(UserDO user : receivers){
				userNames.add(user.getFullname());
			}
			details.add("协助处理人：" + StringUtils.join(userNames.toArray(), ","));
			if (!details.isEmpty()) {
				MDC.put("details", details.toArray());
				activityLoggingDao.addLogging(Integer.parseInt(message.getLink()), ActivityLoggingOperationRegister.getOperation("ADD_ASSIST"));
				MDC.remove("details");
			}
		}
	}
	
	/**
	 * 保存信息（站内通知，短信，邮件）
	 * @param sendingModeEnums 信息模式 
	 * @param sender 发送人
	 * @param receivers 接收人（多个）
	 * @param title 主题
	 * @param content 正文内容
	 * @param source 信息来源
	 * @param sourceType 信息来源类型
	 */
	public void saveTodoMsg(Collection<EnumMessageCatagory> sendingModeEnums, UserDO sender, Collection<UserDO> receivers, String title, String content, Integer source, String sourceType) {
		if (sendingModeEnums != null && !sendingModeEnums.isEmpty() && receivers != null && !receivers.isEmpty() && StringUtils.isNotBlank(content)) {
			for (UserDO user : receivers) {
				user = userDao.internalGetById(user.getId());
				for (EnumMessageCatagory sendingModeEnum : sendingModeEnums) {
					switch (sendingModeEnum) {
						case MESSAGE:
							// 站内通知
							MessageDO message = new MessageDO(sender, user, title, content, source == null ? null : source.toString(), sourceType);
							this.internalSave(message);
							break;
						case SHORT_MESSAGE:
							// 短信
							ShortMessageDO shortMessage = new ShortMessageDO(sender, user, user.getTelephoneNumber(), content, source, sourceType);
							shortMessageDao.internalSave(shortMessage);
							break;
						case EMAIL:
							// 邮件
							EmailDO email = new EmailDO(null, user.getEmail(), title, content);
							emailDao.internalSave(email);
							break;
						default:
							// do nothing
					}
				}
			}
		}
	}

	/**
	 * @param activityDao the activityDao to set
	 */
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}

	public void setRiskDao(RiskDao riskDao) {
		this.riskDao = riskDao;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setSmtpDao(SmtpDao smtpDao) {
		this.smtpDao = smtpDao;
	}

	public void setEmailDao(EmailDao emailDao) {
		this.emailDao = emailDao;
	}

	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	public void setImproveNoticeDao(ImproveNoticeDao improveNoticeDao) {
		this.improveNoticeDao = improveNoticeDao;
	}

	public void setSubImproveNoticeDao(SubImproveNoticeDao subImproveNoticeDao) {
		this.subImproveNoticeDao = subImproveNoticeDao;
	}

	public ActionItemDao getActionItemDao() {
		return actionItemDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public IsarpDao getIsarpDao() {
		return isarpDao;
	}

	public void setIsarpDao(IsarpDao isarpDao) {
		this.isarpDao = isarpDao;
	}

	public ReportDao getReportDao() {
		return reportDao;
	}

	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setShortMessageDao(ShortMessageDao shortMessageDao) {
		this.shortMessageDao = shortMessageDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	
}
