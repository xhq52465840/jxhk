package com.usky.sms.audit.improve;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;

public class ImproveFlowUserDao extends BaseDao<ImproveFlowUserDO> {

	protected ImproveFlowUserDao() {
		super(ImproveFlowUserDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<UserDO> getUsersByImprove(Integer improveId) {
		if (improveId == null) return new ArrayList<UserDO>();
		String sql = "select t.flowUser from ImproveFlowUserDO t where t.deleted = false and t.improve.id = ?";
		List<UserDO> list = this.getHibernateTemplate().find(sql, improveId);
		return list;
	}
}
