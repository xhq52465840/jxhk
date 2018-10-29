package com.usky.sms.audit.plan;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;

public class PlanFlowUserDao extends BaseDao<PlanFlowUserDO> {

	protected PlanFlowUserDao() {
		super(PlanFlowUserDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<UserDO> getUsersByPlanId(Integer planId){
		if (null == planId) {
			return new ArrayList<UserDO>();
		}
		return (List<UserDO>) this.query("select t.user from PlanFlowUserDO t where t.deleted = false and t.plan.id = ?", planId);
	}
	
	@SuppressWarnings("unchecked")
	public List<PlanFlowUserDO> getByPlanId(Integer planId){
		if (null == planId) {
			return new ArrayList<PlanFlowUserDO>();
		}
		return (List<PlanFlowUserDO>) this.query("select t from PlanFlowUserDO t where t.deleted = false and t.plan.id = ?", planId);
	}

}
