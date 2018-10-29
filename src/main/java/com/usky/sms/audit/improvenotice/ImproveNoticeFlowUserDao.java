package com.usky.sms.audit.improvenotice;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;

public class ImproveNoticeFlowUserDao extends BaseDao<ImproveNoticeFlowUserDO> {

	protected ImproveNoticeFlowUserDao() {
		super(ImproveNoticeFlowUserDO.class);
	}
	
	public List<UserDO> getUsersByImproveNotice(Integer improveNoticeId) {
		if (improveNoticeId == null) {
			return new ArrayList<UserDO>();
		}
		String sql = "select t.user from ImproveNoticeFlowUserDO t where t.deleted = false and t.improveNotice.id = ?";
		@SuppressWarnings("unchecked")
		List<UserDO> list = (List<UserDO>) this.query(sql, improveNoticeId);
		return list;
	}
	
	public List<ImproveNoticeFlowUserDO> getByImproveNoticeId(Integer improveNoticeId) {
		if (improveNoticeId == null) {
			return new ArrayList<ImproveNoticeFlowUserDO>();
		}
		String sql = "select t from ImproveNoticeFlowUserDO t where t.deleted = false and t.improveNotice.id = ?";
		@SuppressWarnings("unchecked")
		List<ImproveNoticeFlowUserDO> list = (List<ImproveNoticeFlowUserDO>) this.query(sql, improveNoticeId);
		return list;
	}
	
	/**
	 * 判断某用户是否是某整改通知单的当前处理人
	 * @param userId
	 * @param improveNoticeId
	 * @return
	 */
	public boolean isProcessor(int userId, int improveNoticeId) {
		@SuppressWarnings("unchecked")
		List<Long> count = (List<Long>) this.query("select count(t.id) from ImproveNoticeFlowUserDO t where t.deleted = false and t.improveNotice.id = ? and t.user.id = ?", improveNoticeId, userId);
		return count.get(0) > 0;
	}
}
