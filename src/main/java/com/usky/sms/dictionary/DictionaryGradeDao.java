
package com.usky.sms.dictionary;

import java.io.Serializable;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;

public class DictionaryGradeDao extends BaseDao<DictionaryGradeDO> {
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	public DictionaryGradeDao() {
		super(DictionaryGradeDO.class);
	}

	@Override
	public Serializable internalSave(DictionaryGradeDO obj) {
		this.checkNotNull(obj);
		try {
			return super.internalSave(obj);
		} catch (ConstraintViolationException e) {
			DictionaryDO dic = dictionaryDao.internalGetById(obj.getDictionary().getId());
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "字典[" + dic.getDisplayName() + "]已经配置过了");
		}
	}

	@Override
	public boolean internalUpdate(DictionaryGradeDO obj) {
		this.checkNotNull(obj);
		try {
			return super.internalUpdate(obj);
		} catch (ConstraintViolationException e) {
			DictionaryDO dic = dictionaryDao.internalGetById(obj.getDictionary().getId());
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "字典[" + dic.getDisplayName() + "]已经配置过了");
		}
	}
	
	/**
	 * 非空校验
	 * @param obj
	 */
	private void checkNotNull(DictionaryGradeDO obj) {
		if (obj.getDictionary() == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "数据字典不能为空");
		}
		if (obj.getGrade() == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "级别不能为空");
		}
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

}
