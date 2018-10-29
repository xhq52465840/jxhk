package com.usky.sms.audit.validate;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.risk.ClauseDO;
import com.usky.sms.risk.ClauseDao;
import com.usky.sms.tem.ActionItemDO;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.utils.SpringBeanUtils;

public class ValidateRiskDao extends BaseDao<ValidateRiskDO> {
	
	private ActionItemCreatorDao actionItemCreatorDao;
	
	private ActionItemDao actionItemDao;
	
	private ClauseDao clauseDao;
	
	protected ValidateRiskDao() {
		super(ValidateRiskDO.class);
	}

	@Override
	protected void beforeUpdateAll(Map<String, Object>[] maps) {
		// 验证通过后给创建人发送站内通知
		List<Integer> ids = new ArrayList<Integer>();
		for (Map<String, Object> map : maps) {
			if (map.containsKey("result") && "通过".equals(map.get("result"))) {
				ids.add(((Number) map.get("id")).intValue());
			}
		}
		List<Map<String, Object>> list = actionItemCreatorDao.getActionItemMapsByValidateRiskIds(ids);
		for (Map<String, Object> map : list) {
			Integer actionItemId = (Integer) map.get("actionItemId");
			Integer userId =  (Integer) map.get("creator");
			
			// 将行动项的状态改成"完成"
			ActionItemDO actionItem =  (ActionItemDO) map.get("actionItem");
			actionItem.setStatus(ActionItemDao.ACTION_ITEM_STATUS_COMPLETE);
			actionItemDao.update(actionItem);
			
			// 如果此行动项对应的clause下的所有行动项的状态均为"完成"，则将clause的状态更新成"落实"
			ClauseDO clause = actionItem.getClause();
			List<ActionItemDO> actionItems = actionItemDao.getActionItemsByClause(clause.getId(), false);
			boolean allCompleted = true;
			for (ActionItemDO a : actionItems) {
				if (!ActionItemDao.ACTION_ITEM_STATUS_COMPLETE.equals(a.getStatus())) {
					allCompleted = false;
					break;
				}
			}
			if (allCompleted) {
				clause.setStatus(ClauseDao.CLAUSE_STATUS_COMPLETE);
				clauseDao.update(clause);
			}
			
			MessageDO message = new MessageDO();
			message.setSender(UserContext.getUser());
			message.setSendTime(new Date());
			message.setContent("行动项[" + actionItem.getDescription() + "]验证通过!");
			message.setTitle("行动项验证通过通知");
			message.setLink(actionItemId.toString());
			message.setChecked(false);
			message.setSourceType("RISKVALIDATE");
			MessageDao messageDao = (MessageDao) SpringBeanUtils.getBean("messageDao");
			List<UserDO> users = new ArrayList<UserDO>();
			UserDO user = new UserDO();
			user.setId(userId);
			users.add(user);
			try {
				messageDao.sendMessageAndEmail(message, users);
			} catch (Exception e) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "发送通知失败！错误信息：" + e.getMessage());
			}
		}
	}


	public void setActionItemCreatorDao(ActionItemCreatorDao actionItemCreatorDao) {
		this.actionItemCreatorDao = actionItemCreatorDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

	public void setClauseDao(ClauseDao clauseDao) {
		this.clauseDao = clauseDao;
	}
}
