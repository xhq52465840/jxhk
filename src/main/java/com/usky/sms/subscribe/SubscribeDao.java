
package com.usky.sms.subscribe;

import java.lang.reflect.Field;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.mail.SendFailedException;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.hibernate.Hibernate;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.sun.mail.smtp.SMTPAddressFailedException;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.email.EmailDO;
import com.usky.sms.email.SmtpDao;
import com.usky.sms.email.SmtpService;
import com.usky.sms.filtermanager.FiltermanagerDO;
import com.usky.sms.filtermanager.FiltermanagerDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.job.CronSendFilterSearchResultJob;
import com.usky.sms.service.QueryService;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.utils.SpringBeanUtils;

public class SubscribeDao extends BaseDao<SubscribeDO> {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(SubscribeDao.class);
	
	@Autowired
	private FiltermanagerDao filtermanagerDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private UserDao userDao;
	
	private Config config;
	
	private static final String NAME_PREFIX = "sendFilterSearchResultJob_";
	
	private static final String NAME_SUFIX_TRIGGER = "_trigger";
	
	private static final String GROUP = "subscribe";
	
	public SubscribeDao() {
		super(SubscribeDO.class);
		this.config = Config.getInstance();
	}
	
	public List<SubscribeDO> getByFiltermanager(FiltermanagerDO filtermanagerDO) {
		@SuppressWarnings("unchecked")
		List<SubscribeDO> list = this.getHibernateTemplate().find("from SubscribeDO where filtermanager =?", filtermanagerDO);
		return list;
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		if (map.get("lastSend") == null) map.put("lastSend", null);
		return true;
	}
	
	@Override
	protected void afterSave(SubscribeDO subscribe) {
		super.afterSave(subscribe);
		sendSubscribeEmail(subscribe);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		SubscribeDO subscribe = (SubscribeDO) obj;
		if ("lastSend".equals(fieldName)) {
			Date lastSend = subscribe.getLastSend();
			map.put("lastSend", lastSend == null ? null : DateHelper.formatIsoSecond(lastSend));
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	/**
	 * 启动发送订阅邮件的job
	 * 
	 * @param subscribe
	 */
	private void sendSubscribeEmail(SubscribeDO subscribe) {
		Scheduler scheduler;
		try {
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			sendSubscribeEmail(scheduler, subscribe);
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("发送订阅邮件失败！" + e.getMessage(), e);
		}
	}
	
	/**
	 * 启动发送订阅邮件的job
	 * 
	 * @param scheduler
	 */
	public void sendSubscribeEmail(Scheduler scheduler) {
		@SuppressWarnings("unchecked")
		List<SubscribeDO> subscribeList = (List<SubscribeDO>) this.query("select s from SubscribeDO s left join s.receive r left join s.receivegroup left join s.filtermanager where s.deleted = false");
		
		for (SubscribeDO subscribe : subscribeList) {
			if (null != subscribe.getReceive() || null != subscribe.getReceivegroup()) {
				try {
					this.sendSubscribeEmail(scheduler, subscribe);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}
	
	/**
	 * scheduler不为空时启动发送订阅邮件的job,否则立即发送
	 * 
	 * @param scheduler Scheduler
	 * @param subscribe SubscribeDO
	 * @throws Exception
	 */
	public void sendSubscribeEmail(Scheduler scheduler, SubscribeDO subscribe) throws Exception {
		String defaultExpression = config.getCronExpression();
		// 任务执行时间规则表达式
		String cronexpression = subscribe.getCronexpression();
		if (StringUtils.isNotBlank(cronexpression)) {
			// 订阅者id
			String creatorId = subscribe.getCreator().getId().toString();
			// 过滤器检索规则
			FiltermanagerDO filtermanager = subscribe.getFiltermanager();
			if (null != filtermanager) {
				filtermanager = filtermanagerDao.internalGetById(filtermanager.getId());
				String filterRule = filtermanager.getFilterRule();
				Integer filterId = filtermanager.getId();
				String filterName = filtermanager.getName();
				String isEmail = subscribe.getIsEmail();
				// 接收人
				List<UserDO> receivers = new ArrayList<UserDO>();
				UserDO user = subscribe.getReceive();
				
				if (null != user) {
					user = userDao.internalGetById(user.getId());
					if (!Hibernate.isInitialized(user)) {
						Hibernate.initialize(user);
					}
					receivers.add(user);
				}
				if (null != subscribe.getReceivegroup()) {
					UserGroupDO userGroup = userGroupDao.internalGetById(subscribe.getReceivegroup().getId());
					if (null != userGroup.getUsers()) {
						receivers.addAll(userGroupDao.getUsersByGroupId(userGroup.getId()));
					}
				}
				if (null != scheduler) {
					createCron(scheduler, NAME_PREFIX + subscribe.getId(), CronSendFilterSearchResultJob.class, defaultExpression, cronexpression, "creatorId", creatorId, "isEmail", isEmail, "filterId", filterId, "filterName", filterName, "filterRule", filterRule, "receivers", receivers, "subscribeId", subscribe.getId());
				} else {
					try {
						sendFilterSearchResult(creatorId, isEmail, filterId, filterName, filterRule, receivers, subscribe.getId());
						
						// 发送成功后更新最后发送时间
						subscribe.setLastSend(new Date());
						this.update(subscribe);
					} catch (Exception e) {
						e.printStackTrace();
						log.error("发送订阅邮件失败！" + e.getMessage(), e);
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "发送订阅邮件失败！" + e.getMessage());
					}
				}
			}
		}
	}
	
	/**
	 * 创建一个job
	 * 
	 * @param scheduler
	 * @param name
	 * @param jobClass
	 * @param cronDefaultExpression
	 * @param cronExpression
	 * @param params
	 */
	private void createCron(final Scheduler scheduler, final String name, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Object... params) {
		final JobDetail job = new JobDetail(name, GROUP, jobClass);
		if (params != null) {
			Validate.isTrue(params.length % 2 == 0);
			final JobDataMap map = job.getJobDataMap();
			for (int i = 0; i < params.length - 1; i += 2) {
				Validate.isTrue(params[i] instanceof String);
				map.put(params[i], params[i + 1]);
			}
		}
		final String cronEx;
		if (StringUtils.isNotBlank(cronExpression) == true) {
			cronEx = cronExpression;
		} else {
			cronEx = cronDefaultExpression;
		}
		final Trigger trigger;
		try {
			trigger = new CronTrigger(name + NAME_SUFIX_TRIGGER, GROUP, cronEx);
		} catch (final ParseException ex) {
			log.error("Could not create cron trigger with expression '" + cronEx + "' (cron job is disabled): " + ex.getMessage(), ex);
			return;
		}
		try {
			// Schedule the job with the trigger
			scheduler.scheduleJob(job, trigger);
		} catch (final SchedulerException ex) {
			log.error("Could not create cron job: " + ex.getMessage(), ex);
			return;
		}
		log.info("Cron job '" + name + "' successfully configured: " + cronEx);
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
		if (map.get("lastSend") == null) {
			map.put("lastSend", null);
		}
	}
	
	@Override
	protected void afterUpdate(SubscribeDO obj, SubscribeDO dbObj) {
		super.afterUpdate(obj, dbObj);
		Scheduler scheduler;
		try {
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			
			// 如果cronexpression变了,替换原有的trigger
			// new Trigger 
			Trigger newTrigger = new CronTrigger(NAME_PREFIX + obj.getId() + NAME_SUFIX_TRIGGER, GROUP, NAME_PREFIX + obj.getId(), GROUP, obj.getCronexpression());
			
			scheduler.rescheduleJob(NAME_PREFIX + obj.getId() + NAME_SUFIX_TRIGGER, GROUP, newTrigger);
		} catch (ParseException e) {
			e.printStackTrace();
			log.error("更新job[" + NAME_PREFIX + obj.getId() + "]失败: " + e.getMessage(), e);
		} catch (SchedulerException e) {
			e.printStackTrace();
			log.error("更新job[" + NAME_PREFIX + obj.getId() + "]失败: " + e.getMessage(), e);
		}
		
	}
	
	@Override
	protected void afterDelete(Collection<SubscribeDO> collection) {
		super.afterDelete(collection);
		
		for (SubscribeDO subscribe : collection) {
			// 关闭对应的job
			Scheduler scheduler;
			try {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				scheduler.unscheduleJob(NAME_PREFIX + subscribe.getId() + NAME_SUFIX_TRIGGER, GROUP);
			} catch (SchedulerException e) {
				e.printStackTrace();
				log.error("关闭job[" + NAME_PREFIX + subscribe.getId() + "]失败: " + e.getMessage(), e);
			}
		}
	}
	
	@SuppressWarnings("unchecked")
	public void sendFilterSearchResult(String creatorId, String isEmail, Integer filterId, String filterName, String filterRule, List<UserDO> receivers, Integer subscribeId) throws Exception {
		Gson gson = GsonBuilder4SMS.getInstance();
		SubscribeDO sub = this.internalGetById(subscribeId);
		sub.setLastSend(new Date());
		this.internalUpdate(sub);
		Map<String, Object> map = gson.fromJson(filterRule, new TypeToken<Map<String, Object>>() {}.getType());
		// 获取静态过滤条件和动态过滤条件,并合并到一起
		List<Map<String, Object>> staticfilters = (List<Map<String, Object>>) map.get("staticfilters");
		List<Map<String, Object>> dynamicfilters = (List<Map<String, Object>>) map.get("dynamicfilters");
		List<Map<String, Object>> allfilters = new ArrayList<Map<String,Object>>();
		if (null != staticfilters) {
			allfilters.addAll(staticfilters);
		}
		if (null != dynamicfilters) {
			allfilters.addAll(dynamicfilters);
		}
		List<Map<String, Object>> queryList = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> item : allfilters) {
			List<Map<String, String>> propvalue = (List<Map<String, String>>) item.get("propvalue");
			if (null != propvalue && !propvalue.isEmpty()) {
				Map<String, Object> queryItem = new HashMap<String, Object>();
				queryItem.put("id", item.get("propid"));
				queryItem.put("value", propvalue);
				queryList.add(queryItem);
			}
		}
		// 排序
		Map<String, Map<String, Object>> orders = (Map<String, Map<String, Object>>) map.get("orders");
		String column = null;
		String order = null;
		if (null != orders) {
			if (null != orders.get("list")) {
				column = (String) orders.get("list").get("propid");
				order = (String) orders.get("list").get("order");
			}
		}
		// 查询条件
		String sort = (null != column && null != order) ? column + " " + order : "";
		String query = gson.toJson(queryList);
		String core = "activity";
		String start = "0";
		String displayMaxLength = "200";
		String fl = null;
		String search = null;
		List<Map<String, Object>> columns = (List<Map<String, Object>>) map.get("columns");
		
		QueryService queryService = (QueryService) SpringBeanUtils.getBean("query");
		Map<String, Object> result = queryService.getResultByParams(creatorId, query, core, start, displayMaxLength, fl, sort, search, columns, true);
		if (null != result) {
			List<Map<String, Object>> list_result = (List<Map<String, Object>>) result.get("aaData");
			int actualLength = ((Double) result.get("iTotalRecords")).intValue();
			if ("Y".equals(isEmail) || !list_result.isEmpty()) {
				String html = generateHtml(filterId, filterName, list_result, columns, actualLength, creatorId);
				sendResult(html, "SMS 邮件订阅：" + filterName, receivers);
			}
		}
		
	}
	
	private void sendResult(String content, String subject, List<UserDO> receivers) throws SendFailedException {
		SmtpDao smtpDao = (SmtpDao) SpringBeanUtils.getBean("smtpDao");
		SmtpService smtpService = (SmtpService) SpringBeanUtils.getBean("smtp");
		try {
			Map<String, Object> smtp = smtpDao.getSmtp();
			if (null == smtp) {
				throw new SMTPAddressFailedException(null, null, 4, "未配置smtp");
			}
			for (UserDO user : receivers) {
				EmailDO email = new EmailDO();
				email.setContent(content);
				email.setSubject(subject);
				email.setFrom((String) smtp.get("address"));
				email.setTo(user.getEmail());
				smtpService.sendEmail(email);
			}
		} catch (Exception e) {
			throw new SendFailedException(e.getMessage());
		}
	}
	
	/**
	 * 生成html
	 * 
	 * @param contentList
	 * @return
	 */
	private String generateHtml(Integer filterId, String filterName, List<Map<String, Object>> contentList, List<Map<String, Object>> columns, int actualLength, String creatorId) {
		String[][] defaultColums = { { "编号", "类型", "安监机构", "主题", "状态", "创建人", "创建日期" }, { "id", "type", "unit", "summary", "status", "creator", "created" } };
		// 获取表头的名称和要显示的字段名
		// 表头的名称
		List<String> tableHeads = new ArrayList<String>();
		// 要显示的字段名
		List<String> tdFields = new ArrayList<String>();
		tableHeads = Arrays.asList(defaultColums[0]);
		tdFields = Arrays.asList(defaultColums[1]);
		
		String hostAddress = config.getHostAddress();
		
		StringBuffer sb = new StringBuffer();
		sb.append("<html xmlns='http://www.w3.org/1999/xhtml'>");
		sb.append("<html>");
		sb.append("<body>");
		sb.append("<table cellpadding='0' cellspacing='0' width='100%' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f5f5f5; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt'>");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td id='header-pattern-spacer' style='padding: 0px; border-collapse: collapse; font-size: 10px; height: 10px; line-height: 10px'>&nbsp;</td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td id='email-content-container' style='padding: 0px; border-collapse: collapse; padding: 0 20px'>");
		sb.append("<table id='email-content-table' cellspacing='0' cellpadding='0' border='0' width='100%' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0; border-collapse: separate'>");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td class='email-content-rounded-top mobile-expand' style='padding: 0px; border-collapse: collapse; color: #fff; padding: 0 15px 0 16px; height: 15px; background-color: #fff; border-left: 1px solid #ccc; border-top: 1px solid #ccc; border-right: 1px solid #ccc; border-bottom: 0; border-top-right-radius: 5px; border-top-left-radius: 5px; height: 10px; line-height: 10px; padding: 0 15px 0 16px; mso-line-height-rule: exactly'> &nbsp;</td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td class='email-content-main mobile-expand ' style='padding: 0px; border-collapse: collapse; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-top: 0; border-bottom: 0; padding: 0 15px 0 16px; background-color: #fff'>");
		sb.append("<table id='page-title-pattern' cellspacing='0' cellpadding='0' border='0' width='100%' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt'>");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td id='page-title-pattern-header-container' style='padding: 0px; border-collapse: collapse; padding-right: 5px; font-size: 20px; line-height: 30px; mso-line-height-rule: exactly'> <span id='page-title-pattern-header' style='font-family: Arial, sans-serif; padding: 0; font-size: 20px; line-height: 30px; mso-text-raise: 2px; mso-line-height-rule: exactly; vertical-align: middle'>邮件订阅</span> </td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table></td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td class='email-content-main mobile-expand ' style='padding: 0px; border-collapse: collapse; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-top: 0; border-bottom: 0; padding: 0 15px 0 16px; background-color: #fff'>");
		sb.append("<table class='keyvalue-table' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt'>");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<th style='color: #707070; font: normal 14px/20px Arial, sans-serif; text-align: left; vertical-align: top; padding: 2px 0'> 过滤器:</th>");
		sb.append("<td style='padding: 0px; border-collapse: collapse; font: normal 14px/20px Arial, sans-serif; padding: 2px 0 2px 5px; vertical-align: top'> ");
		// filter的链接
		sb.append("<a href='");
		sb.append(hostAddress);
		sb.append("/sms/uui/com/sms/search/Search.html?filterId=");
		sb.append(filterId);
		sb.append("' style='color: #3b73af; text-decoration: none' >");
		sb.append(filterName);
		sb.append(" </a>");
		sb.append(" (第 ");
		sb.append(contentList.size());
		sb.append("个问题,共 ");
		sb.append(actualLength);
		sb.append("个)");
		sb.append("</td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<th style='color: #707070; font: normal 14px/20px Arial, sans-serif; text-align: left; vertical-align: top; padding: 2px 0'> 订阅者:</th>");
		sb.append("<td style='padding: 0px; border-collapse: collapse; font: normal 14px/20px Arial, sans-serif; padding: 2px 0 2px 5px; vertical-align: top'>");
		// TODO 订阅者
		UserDO user = userDao.internalGetById(Integer.parseInt(creatorId));
		sb.append(user.getDisplayName());
		sb.append("</td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table></td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td class='email-content-main mobile-expand ' style='padding: 0px; border-collapse: collapse; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-top: 0; border-bottom: 0; padding: 0 15px 0 16px; background-color: #fff'>");
		sb.append("<table id='issuetable' border='0' cellpadding='2' cellspacing='0' width='100%' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; font: normal 14px/20px Arial, sans-serif'>");
		sb.append("<thead>");
		sb.append("<tr class='rowHeader'>");
		// 表头
		sb.append("<thead><tr>");
		for (String tableHead : tableHeads) {
			sb.append("<th class='colHeaderLink headerrow-issuetype' data-id='issuetype' style='text-align: left; vertical-align: top; padding: 7px; font: bold 14px/20px Arial, sans-serif'>");
			sb.append(tableHead);
			sb.append("</th>");
		}
		sb.append("</tr></thead>");
		// 表的body
		sb.append("<tbody>");
		for (Map<String, Object> content : contentList) {
			// 行
			if (!(Boolean) content.get("deleted")) {
				sb.append("<tr>");
				sb.append("<tr id='issuerow");
				sb.append(content.get("id"));
				sb.append("' rel='");
				sb.append(content.get("id"));
				sb.append(" class='issuerow'>");
				for (String tdField : tdFields) {
					// 列
					sb.append("<td class='issuetype' style='padding: 0px; border-collapse: collapse; text-align: left; vertical-align: top; padding: 7px; border-top: 1px solid #ccc'>");
					if (null == tdField) {
						sb.append("");
					} else if (null == content.get(tdField)) {
						sb.append("");
					} else if ("unit".equals(tdField) || "creator".equals(tdField) || "status".equals(tdField) || "type".equals(tdField)) { // 安监机构、状态、创建人、类型的时候,取安监机构、状态、创建人、类型的name字段
						@SuppressWarnings("unchecked")
						Map<String, Object> fieldMap = (Map<String, Object>) content.get(tdField);
						String name = null;
						if ("creator".equals(tdField)) {
							name = (String) fieldMap.get("fullname");
						} else {
							name = (String) fieldMap.get("name");
						}
						if (!StringUtils.isBlank(hostAddress)) {
							String url = null;
							if (null == name) {
								sb.append("");
							} else if ("unit".equals(tdField)) {
								url = (String) fieldMap.get("avatarUrl");
							} else if ("type".equals(tdField)) {
								url = "/sms/uui" + (String) fieldMap.get("url");
							}
							// 添加img的url(相对路径)
							if (null != url) {
								sb.append("<img height='16' width='16' border='0' align='absmiddle' src='");
								sb.append(hostAddress);
								sb.append(url);
								sb.append("' />");
							}
						}
						sb.append(name);
					} else if ("summary".equals(tdField)) {
						if (!StringUtils.isBlank(hostAddress)) {
							sb.append("<a class='issue-link' style='color: #3b73af; text-decoration: none' href='");
							sb.append(hostAddress);
							sb.append("/sms/uui/com/sms/search/activity.html?activityId=");
							// activityId
							sb.append(content.get("id"));
							sb.append("'>");
						}
						// 主题
						sb.append(content.get(tdField));
						if (!StringUtils.isBlank(hostAddress)) {
							sb.append("</a>");
						}
					} else if ("id".equals(tdField)) {
						@SuppressWarnings("unchecked")
						Map<String, Object> fieldMap = (Map<String, Object>) content.get("unit");
						String code = (String) fieldMap.get("code");
						sb.append(code);
						sb.append("-");
						sb.append(content.get(tdField));
					} else {
						sb.append(content.get(tdField));
					}
					sb.append("</td>");
				}
				sb.append("</tr>");
			}
		}
		sb.append("</tbody></table>");
		sb.append("<div class='end-of-stable-message'></div> </td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td class='email-content-main mobile-expand ' style='padding: 0px; border-collapse: collapse; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-top: 0; border-bottom: 0; padding: 0 15px 0 16px; background-color: #fff'>");
		sb.append("<table class='text-paragraph-pattern' cellspacing='0' cellpadding='0' border='0' width='100%' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; mso-line-height-rule: exactly; mso-text-raise: 2px'>");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td class='text-paragraph-pattern-container mobile-resize-text ' style='padding: 0px; border-collapse: collapse; padding: 0 0 10px 0'>");
		sb.append("当前显示 ");
		sb.append(contentList.size());
		sb.append("个匹配的问题，你可以在");
		sb.append("<a href='");
		sb.append(hostAddress);
		sb.append("/sms/uui/com/sms/search/Search.html?filterId=");
		sb.append(filterId);
		sb.append("'color: #3b73af; text-decoration: none'>这里</a>查看所有匹配的");
		sb.append(actualLength);
		sb.append("个问题。 </td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table></td>");
		sb.append("</tr>");
		//		sb.append("<tr>");
		//		sb.append("<td class='email-content-main mobile-expand ' style='padding: 0px; border-collapse: collapse; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-top: 0; border-bottom: 0; padding: 0 15px 0 16px; background-color: #fff'>");
		//		sb.append("<table class='text-paragraph-pattern' cellspacing='0' cellpadding='0' border='0' width='100%' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; mso-line-height-rule: exactly; mso-text-raise: 2px'>");
		//		sb.append("<tbody>");
		//		sb.append("<tr>");
		//		sb.append("<td class='text-paragraph-pattern-container mobile-resize-text ' style='padding: 0px; border-collapse: collapse; padding: 0 0 10px 0'>你可以点击 <a href='");
		//		// TODO
		//		sb.append(hostAddress);
		//		sb.append("");
		//		sb.append("' style='color: #3b73af; text-decoration: none'>这里</a>编辑这个订阅设置。 </td>");
		//		sb.append("</tr>");
		//		sb.append("</tbody>");
		//		sb.append("</table></td>");
		//		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td class='email-content-rounded-bottom mobile-expand' style='padding: 0px; border-collapse: collapse; color: #fff; padding: 0 15px 0 16px; height: 5px; line-height: 5px; background-color: #fff; border-top: 0; border-left: 1px solid #ccc; border-bottom: 1px solid #ccc; border-right: 1px solid #ccc; border-bottom-right-radius: 5px; border-bottom-left-radius: 5px; mso-line-height-rule: exactly'> &nbsp;</td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table></td>");
		sb.append("</tr>");
		sb.append("<tr>");
		sb.append("<td id='footer-pattern' style='padding: 0px; border-collapse: collapse; padding: 12px 20px'>");
		sb.append("<table id='footer-pattern-container' cellspacing='0' cellpadding='0' border='0' style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt'>");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td id='footer-pattern-text' class='mobile-resize-text' width='100%' style='padding: 0px; border-collapse: collapse; color: #999; font-size: 12px; line-height: 18px; font-family: Arial, sans-serif; mso-line-height-rule: exactly; mso-text-raise: 2px'> 这条信息是由吉祥安全风险分析系统发送的</td>");
		sb.append("<td id='footer-pattern-logo-desktop-container' valign='top' style='padding: 0px; border-collapse: collapse; padding-left: 20px; vertical-align: top'>");
		sb.append("<table style='border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt'>");
		sb.append("<tbody>");
		sb.append("<tr>");
		sb.append("<td id='footer-pattern-logo-desktop-padding' style='padding: 0px; border-collapse: collapse; padding-top: 3px'>  </td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table></td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table></td>");
		sb.append("</tr>");
		sb.append("</tbody>");
		sb.append("</table>");
		sb.append("</body>");
		sb.append("</html>");
		return sb.toString();
	}
	
	/**
	 * @param filtermanagerDao the filtermanagerDao to set
	 */
	public void setFiltermanagerDao(FiltermanagerDao filtermanagerDao) {
		this.filtermanagerDao = filtermanagerDao;
	}
	
	/**
	 * @param userGroupDao the userGroupDao to set
	 */
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
	/**
	 * @param userDao the userDao to set
	 */
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
}
