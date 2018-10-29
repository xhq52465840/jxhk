package com.usky.sms.audit.improvenotice;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;

public class SubImproveNoticeFlowUserDao extends BaseDao<SubImproveNoticeFlowUserDO> {

	protected SubImproveNoticeFlowUserDao() {
		super(SubImproveNoticeFlowUserDO.class);
	}
	
	public List<UserDO> getUsersBySubImproveNotice(Integer subImproveNoticeId) {
		if (subImproveNoticeId == null) {
			return new ArrayList<UserDO>();
		}
		String sql = "select t.user from SubImproveNoticeFlowUserDO t where t.deleted = false and t.subImproveNotice.id = ?";
		@SuppressWarnings("unchecked")
		List<UserDO> list = (List<UserDO>) this.query(sql, subImproveNoticeId);
		return list;
	}
}
