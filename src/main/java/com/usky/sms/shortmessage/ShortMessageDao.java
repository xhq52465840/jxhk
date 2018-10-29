package com.usky.sms.shortmessage;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringUtils;
import org.quartz.Scheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.external.SmsSendDubboService;
import com.usky.sms.job.CronSendFailedShortMessageJob;
import com.usky.sms.job.CronSendUnsentShortMessageJob;
import com.usky.sms.job.JobUtils;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class ShortMessageDao extends BaseDao<ShortMessageDO> {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(ShortMessageDao.class);
	
	/** 默认重发次数 */
	private static final Integer RESEND_TIME = 5;
	
	/** 默认每五分钟发送一次 */
	private static final String CRON_EXPRESSION_FOR_SEND_SHORT_MESSAGE = "0 0/5 * * * ?";
	
	private Config config;
	
	@Autowired
	private SmsSendDubboService smsSendDubboService;
	
	
	public ShortMessageDao() {
		super(ShortMessageDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("receiver".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ShortMessageDO shortMessage = (ShortMessageDO) obj;
		if("sendTime".equals(fieldName)){
			Date sendTime = shortMessage.getSendTime();
			map.put("sendTime", DateHelper.formatIsoSecond(sendTime));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
		
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		return super.beforeSave(map);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		super.beforeUpdate(id, map);
	}

	@Override
	protected void beforeUpdate(ShortMessageDO obj) {
		super.beforeUpdate(obj);
	}

	@Override
	protected void afterSave(ShortMessageDO shortMessage) {
		this.sendShortMessage(shortMessage);
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	/**
	 * 获取用户所发送的短信
	 * 
	 * @param sender
	 *            用户
	 * @return 所发送的短信
	 */
	@SuppressWarnings("unchecked")
	public List<ShortMessageDO> getShortMessagesBySender(UserDO sender) {
		return (List<ShortMessageDO>) this.query("from ShortMessageDO where sender = ? and deleted = false order by sendTime desc", sender);
	}

	/**
	 * 获取用户的所接收的短信
	 * 
	 * @param user
	 *            用户
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ShortMessageDO> getShortMessagesByReceiver(UserDO user, String sourceType) {
		StringBuffer hql = new StringBuffer("from ShortMessageDO where deleted = false");
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
		return (List<ShortMessageDO>) this.query(hql.toString(), params.toArray());
	}
	
	/** 保存短信息 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void saveShortMessage(ShortMessageDO shortMessage, Collection<UserDO> receivers) {
		for (UserDO receiver : receivers) {
			ShortMessageDO newShortMessage;
			try {
				newShortMessage = (ShortMessageDO) BeanUtils.cloneBean(shortMessage);
				newShortMessage.setReceiver(receiver);
				this.internalSave(newShortMessage);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * 发送短信并对短信信息进行持久化
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sendShortMessage(ShortMessageDO shortMessage) {
		if (null == shortMessage.getId()) {
			this.internalSave(shortMessage);
		}
		int status = smsSendDubboService.sendMessage(shortMessage.getMsgContent(), shortMessage.getReceiveTel());
		shortMessage.setSendStatus(status);
		// 设置重发送次数
		shortMessage.setResendTimes(null == shortMessage.getResendTimes() ? 0 : shortMessage.getResendTimes() + 1);
		this.internalSaveOrUpdate(shortMessage);
	}
	
	/** 发送未发送的短信 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sendUnSentShortMessage() {
		// 获取未发送的短信
		@SuppressWarnings("unchecked")
		List<ShortMessageDO> list = (List<ShortMessageDO>) this.query("from ShortMessageDO t where t.deleted = ? and t.sendStatus is null order by lastUpdate desc", false);
		for (ShortMessageDO shortMessage : list) {
			this.sendShortMessage(shortMessage);
		}
	}
	

	/**
	 * 发送未发送的短信
	 * @param scheduler
	 */
	public void sendUnsentShortMessage(Scheduler scheduler) {
		String expression = config.getCronExpForSendUnsentShortMsg();
		if (StringUtils.isNotBlank(expression)) {
			try {
				JobUtils.createCron(scheduler, "sendUnSentShortMessage", "shortMessage", CronSendUnsentShortMessageJob.class, CRON_EXPRESSION_FOR_SEND_SHORT_MESSAGE, expression);
			} catch (Exception e) {
				e.printStackTrace();
				log.warn("发送未发送短信失败！" + e.getMessage(), e);
				throw e;
			}
		}
	}
	
	/** 重发失败的短信 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sendFailedShortMessage() {
		Integer resendTime = null;
		try {
			resendTime = Integer.parseInt(config.getEmsResendTime());
		} catch (Exception e) {
			resendTime = RESEND_TIME;
		}
		// 获取发送失败的短信
		@SuppressWarnings("unchecked")
		List<ShortMessageDO> list = (List<ShortMessageDO>) this.query("from ShortMessageDO t where t.deleted = ? and t.sendStatus <= ? and t.resendTimes < ? order by lastUpdate desc", false, 0, resendTime);
		for (ShortMessageDO shortMessage : list) {
			this.sendShortMessage(shortMessage);
		}
	}
	
	
	/**
	 * 发送未发送的短信
	 * @param scheduler
	 */
	public void sendFailedShortMessage(Scheduler scheduler) {
		String expression = config.getCronExpForSendFailedShortMsg();
		if (StringUtils.isNotBlank(expression)) {
			try {
				JobUtils.createCron(scheduler, "sendFailedShortMessage", "shortMessage", CronSendFailedShortMessageJob.class, CRON_EXPRESSION_FOR_SEND_SHORT_MESSAGE, expression);
			} catch (Exception e) {
				e.printStackTrace();
				log.warn("发送短信失败！" + e.getMessage(), e);
				throw e;
			}
		}
	}
	
	/**
	 * 保存短信
	 * @param content
	 * @param cellTels
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void save(String content, Collection<String> cellTels) {
		if (StringUtils.isNotBlank(content) && null != cellTels && !cellTels.isEmpty()) {
			for (String cellTel : cellTels) {
				if (StringUtils.isNotBlank(cellTel)) {
					ShortMessageDO shortMsg = new ShortMessageDO();
					shortMsg.setCreator(UserContext.getUser());
					shortMsg.setMsgContent(content);
					shortMsg.setReceiveTel(cellTel);
					this.internalSave(shortMsg);
				}
			}
		}
	}

	public void setSmsSendDubboService(SmsSendDubboService smsSendDubboService) {
		this.smsSendDubboService = smsSendDubboService;
	}
	
}
