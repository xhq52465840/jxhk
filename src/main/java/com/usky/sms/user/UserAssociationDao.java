
package com.usky.sms.user;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;

public class UserAssociationDao extends BaseDao<UserAssociationDO> {
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private UserDao userDao;

	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	private Config config;

	public UserAssociationDao() {
		super(UserAssociationDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected void afterSave(UserAssociationDO userAssociation) {
		// 添加活动日志
		if("watch".equals(userAssociation.getType())){ // 关注
			if("activity".equals(userAssociation.getEntityType())){
				activityLoggingDao.addLogging(Integer.parseInt(userAssociation.getEntityId()),
						ActivityLoggingOperationRegister.getOperation("ADD_UER_WATCH"));
			}
		}
	}
	
	@Override
	protected void afterDelete(Collection<UserAssociationDO> collection) {
		for(UserAssociationDO userAssociation : collection){
			// 添加活动日志
			if("watch".equals(userAssociation.getType())){ // 关注
				if("activity".equals(userAssociation.getEntityType())){
					activityLoggingDao.addLogging(Integer.parseInt(userAssociation.getEntityId()),
							ActivityLoggingOperationRegister.getOperation("DELETE_UER_WATCH"));
				}
			}
		}
	}
	/*
	 * 根据安全信息查关注的人数
	 */
	@SuppressWarnings("unchecked")
	public Integer getWatchCount(String entityId){
		String sql = "select count(u) from UserAssociationDO u where u.entityType = ? and u.entityId = ? and u.type = ?";
		List<Long> list = this.getHibernateTemplate().find(sql,"activity",entityId,"watch");
		return list.get(0).intValue();
	}
	/*
	 * 返回关注人具体信息
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String,Object>> getWatchUser(String entityId){
		String sql = "from UserAssociationDO u where u.entityType = ? and u.entityId = ? and u.type = ?";
		List<UserAssociationDO> UserAssociationList = this.getHibernateTemplate().find(sql,"activity",entityId,"watch");
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(UserAssociationDO userAssociation : UserAssociationList){
			Map<String,Object> map = new HashMap<String, Object>();
			UserDO user = userDao.internalGetById((userAssociation.getUser().getId()));
			map.put("name", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			if (avatar == null) {
				map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
			} else {
				map.put("avatar", avatar.getId());
				map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
			}
			list.add(map);
		}
		return list;
	}
	/*
	 * 查看当前用户是否关注当前安全信息
	 */
	@SuppressWarnings("unchecked")
	public Integer booleanWatch(Integer userid,String entityId,String entityType){
		 String sql = "from UserAssociationDO u where u.user.id = ? and u.entityId = ? and u.entityType = ? and u.type = ? " ;
		 List<UserAssociationDO> watchList = this.getHibernateTemplate().find(sql, userid,entityId,entityType,"watch");
		 if(watchList!=null&&watchList.size()>0){
			 return watchList.get(0).getId();
		 }else{
			 return 0;
		 }
	}
	/*
	 * 查询一个人关注的所有安全信息
	 */
	 @SuppressWarnings("unchecked")
	public List<ActivityDO> getActivityByUser(UserDO userDo,String sort,String order) throws Exception{
		 String sql = "from UserAssociationDO u where u.user = ? and u.type = ? and u.entityType = ?";
		 List<UserAssociationDO> watchList = this.getHibernateTemplate().find(sql, userDo,"watch","activity");
		 String tempids = "";
		 for(UserAssociationDO associationDO : watchList){
			 tempids = tempids+associationDO.getEntityId()+",";
		 }	
		 if(!tempids.isEmpty()){
			 tempids = tempids.substring(0, tempids.length()-1);
		 }else{
			 tempids ="0";
		 }
		 return activityDao.getActivityByids(tempids, sort,order);
	 }
	 
	 
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	/**
	 * @param activityLoggingDao the activityLoggingDao to set
	 */
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
	 
}
