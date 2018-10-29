package com.usky.sms.email;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.DateHelper;
import com.usky.sms.core.BaseDao;

public class EmailDao extends BaseDao<EmailDO> {

	@Autowired
	private SmtpDao smtpDao;

	protected EmailDao(Class<EmailDO> clazz) {
		super(EmailDO.class);
	}

	protected EmailDao() {
		super(EmailDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		EmailDO email = (EmailDO) obj;
		if ("lastUpdate".equals(fieldName)) {
			map.put("lastUpdate", DateHelper.formatIsoSecond(email.getLastUpdate()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 如果邮件服务器被禁用，则不保存邮件
		List<SmtpDO> list = smtpDao.getAllList();
		if (!list.isEmpty()) {
			SmtpDO smtp = list.get(0);
			if (!smtp.isActive()) {
				return false;
			}
		}
		return true;
	}

	/** 获取未发送的邮件信息 */
	public List<EmailDO> getUndersendingEmails() {
		@SuppressWarnings("unchecked")
		List<EmailDO> list = (List<EmailDO>) this.query("from EmailDO where sendStatus = ?",
				EnumSendStatus.WAITING.getCode());
		return list;
	}
	
	/** 获取发送失败的邮件信息 */
	public List<EmailDO> getFailedEmails() {
		@SuppressWarnings("unchecked")
		List<EmailDO> list = (List<EmailDO>) this.query("from EmailDO where sendStatus <> ? and sendStatus <> ?",
				EnumSendStatus.WAITING.getCode(), EnumSendStatus.SUCCESS.getCode());
		return list;
	}

	/**
	 * @param smtpDao
	 *            the smtpDao to set
	 */
	public void setSmtpDao(SmtpDao smtpDao) {
		this.smtpDao = smtpDao;
	}

}
