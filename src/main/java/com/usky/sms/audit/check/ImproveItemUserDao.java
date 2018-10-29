package com.usky.sms.audit.check;

import java.util.List;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;

public class ImproveItemUserDao extends BaseDao<ImproveItemUserDO> {

	protected ImproveItemUserDao() {
		super(ImproveItemUserDO.class);
	}
	
	/**
	 * 根据checkListId获取被转发的用户
	 * @param checkListId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<UserDO> getUsersByCheckListId(Integer checkListId){
		return (List<UserDO>) this.query("select t.user from ImproveItemUserDO t where t.deleted = false and t.checkList.id = ?", checkListId);
	}
	
	/**
	 * @param checkListId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ImproveItemUserDO> getByCheckListId(Integer checkListId){
		return (List<ImproveItemUserDO>) this.query("from ImproveItemUserDO t where t.deleted = false and t.checkList.id = ?", checkListId);
	}

}
