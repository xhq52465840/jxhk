
package com.usky.sms.tem;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserDO;

public class ActionItemCommentDao extends BaseDao<ActionItemCommentDO> {
	
	private Config config;
	
	public ActionItemCommentDao() {
		super(ActionItemCommentDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
    protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(map);
	    return super.beforeSave(map);
    }

	@Override
    protected void beforeUpdate(int id, Map<String, Object> map) {
		checkConstraints(map);
    }

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ActionItemCommentDO comment = (ActionItemCommentDO) obj;
		if ("user".equals(fieldName)) {
			UserDO user = comment.getUser();
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
		} else if ("created".equals(fieldName)) {
			map.put("created", DateHelper.formatIsoSecond(comment.getCreated()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	private void checkConstraints(Map<String, Object> map) {
		String comment = (String) map.get("comment");
		checkFieldLimit(comment);
	}
	
	private void checkFieldLimit(String comment) {
		if (comment.length() > 255) throw new SMSException(SMSException.FIELD_OUT_OF_LIMIT, "comment");
	}
	
	public List<ActionItemCommentDO> getAicByActionItems(ActionItemDO actionItemDO) {
		@SuppressWarnings("unchecked")
		List<ActionItemCommentDO> list = this.getHibernateTemplate().find("from ActionItemCommentDO where actionItem=? ", actionItemDO);
		return list;
	}
	
}
