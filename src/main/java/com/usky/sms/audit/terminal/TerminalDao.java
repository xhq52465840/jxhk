package com.usky.sms.audit.terminal;

import java.util.Map;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;

public class TerminalDao extends BaseDao<TerminalDO> {

	protected TerminalDao() {
		super(TerminalDO.class);
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		try {
			NumberHelper.toInteger(map.get("num").toString());
		}catch (Exception e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "编号请输入整数！");
		}
		map.put("creator", UserContext.getUserId());
		map.put("lastupdater", UserContext.getUserId());
		return super.beforeSave(map);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		try {
			NumberHelper.toInteger(map.get("num").toString());
		}catch (Exception e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "编号请输入整数！");
		}
		map.put("lastupdater", UserContext.getUserId());
		super.beforeUpdate(id, map);
	}
	
	
	

}
