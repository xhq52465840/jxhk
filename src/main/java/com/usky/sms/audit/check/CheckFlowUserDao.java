package com.usky.sms.audit.check;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;

public class CheckFlowUserDao extends BaseDao<CheckFlowUserDO> {

	protected CheckFlowUserDao() {
		super(CheckFlowUserDO.class);
	}

	@SuppressWarnings("unchecked")
	public List<UserDO> getUsersByCheck(Integer checkId) {
		if (checkId == null) return new ArrayList<UserDO>();
		String sql = "select t.flowUser from CheckFlowUserDO t where t.deleted = false and t.check.id = ?";
		List<UserDO> list = this.getHibernateTemplate().find(sql, checkId);
		return list;
	}

}
