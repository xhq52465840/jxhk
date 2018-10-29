package com.usky.sms.safetyreview;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserDO;

public class MethanolRoleDao extends BaseDao<MethanolRoleDO> {

	protected MethanolRoleDao() {
		super(MethanolRoleDO.class);
	}
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public UserDO getByMethnolRole(int unitId) throws Exception{
		List<MethanolRoleDO> list = this.getAllList();
		if (list.isEmpty()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有设置评审单接收角色");
		}
		MethanolRoleDO methanolRoleDO = list.get(0);
		List<UserDO> userList= unitRoleActorDao.getUsersByUnitIdAndRoleId(unitId,methanolRoleDO.getRole().getId());
		if (userList != null && userList.size() > 0) {
			return userList.get(0);
		}

		UnitDO unitDO = unitDao.internalGetById(unitId);
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,unitDO.getName()+"下没有设置评审管理员");
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

}
