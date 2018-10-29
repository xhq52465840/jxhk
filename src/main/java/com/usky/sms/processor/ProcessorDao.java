
package com.usky.sms.processor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.solr.SolrService;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class ProcessorDao extends BaseDao<ProcessorDO> {
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private SolrService solrService;
	
	public ProcessorDao() {
		super(ProcessorDO.class);
	}
	
	/**
	 * 通过activity获取ProcessorDO的list
	 * @param activity activity对象
	 * @return ProcessorDO的list
	 */
	public List<ProcessorDO> getProcessorsByActivity(ActivityDO activity){
		if(null == activity || null == activity.getId()){
			return new ArrayList<ProcessorDO>();
		}else{
			return getProcessorsByActivityId(activity.getId());
		}
	}
	
	/**
	 * 通过activityId获取ProcessorDO的list
	 * @param activity activity对象
	 * @return ProcessorDO的list
	 */
	@SuppressWarnings("unchecked")
	public List<ProcessorDO> getProcessorsByActivityId(Integer activityId){
		if(null == activityId){
			return new ArrayList<ProcessorDO>();
		}else{
			return (List<ProcessorDO>) this.query("from ProcessorDO where deleted = false and activity.id = ?", activityId);
		}
	}
	
	/**
	 * 通过activityId的list获取ProcessorDO的list
	 * @param activityIds activityId的list
	 * @return ProcessorDO的list
	 */
	@SuppressWarnings("unchecked")
	public List<ProcessorDO> getProcessorsByActivityIds(List<String> activityIds){
		if(null == activityIds || activityIds.isEmpty()){
			return new ArrayList<ProcessorDO>();
		}else{
			return (List<ProcessorDO>) this.query("from ProcessorDO where deleted = false and activity.ids in ?", activityIds);
		}
	}
	
	/**
	 * 通过activity获取ProcessorDO的UserDO的list
	 * @param activity activity对象
	 * @return ProcessorDO的UserDO的list
	 */
	public List<UserDO> getProcessorUsersByActivity(ActivityDO activity){
		if(null == activity || null == activity.getId()){
			return new ArrayList<UserDO>();
		}else{
			return getProcessorUsersByActivityId(activity.getId());
		}
	}
	
	/**
	 * 通过activityId获取ProcessorDO的UserDO的list
	 * @param activity activity对象
	 * @return ProcessorDO的UserDO的list
	 */
	@SuppressWarnings("unchecked")
	public List<UserDO> getProcessorUsersByActivityId(Integer activityId){
		if(null == activityId){
			return new ArrayList<UserDO>();
		}else{
			return (List<UserDO>) this.query("select p.user from ProcessorDO p where p.deleted = false and p.activity.id = ?", activityId);
		}
	}
	
	/**
	 * 通过activityId的list获取ProcessorDO的UserDO的Map
	 * @param activityIds activityId的list
	 * @return ProcessorDO的UserDO的list
	 */
	@SuppressWarnings("unchecked")
	public Map<String, List<UserDO>> getProcessorUsersByActivityIds(List<Integer> activityIds){
		Map<String, List<UserDO>> map = new HashMap<String, List<UserDO>>();
		if (null != activityIds && !activityIds.isEmpty()) {
			List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
					.findByNamedParam(
							"select p.activity.id, p.user from ProcessorDO p where p.deleted = false and p.activity.id in (:ids)",
							"ids", activityIds);
			// 将查询出来的结果按activityId分组
			for (Object[] obj : objs) {
				String activityId = obj[0].toString();
				UserDO user = (UserDO) obj[1];
				user.setUserGroups(user.getUserGroups());
				if(!Hibernate.isInitialized(user)) {
					Hibernate.initialize(user);
				}
				if (map.containsKey(activityId)) {
					map.get(activityId).add(user);
				} else {
					List<UserDO> users = new ArrayList<UserDO>();
					users.add(user);
					map.put(activityId, users);
				}
			}

		}
		return map;
	}
	
	/**
	 * 通过activityId的list获取ProcessorDO的UserDO的fullname的map的Map
	 * @param activityIds activityId的list
	 * @return ProcessorDO的UserDO的fullname的map的list
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getProcessorUserMapsByActivityIds(List<Integer> activityIds){
		if (null == activityIds || activityIds.isEmpty()) {
			return Collections.emptyMap();
		}
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
				.findByNamedParam(
						"select p.activity.id, p.user.fullname, p.user.id from ProcessorDO p where p.deleted = false and p.activity.id in (:ids)",
						"ids", activityIds);
		// 将查询出来的结果按activityId分组
		return this.getProcessorUserMapsGroupByActivityId(objs);
	}
	
	/**
	 * 通过activityId的list获取ProcessorDO的UserDO的fullname的map的Map
	 * <br>
	 * 调用前先将activityid插入到临时表中
	 * @return ProcessorDO的UserDO的fullname的map的list
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getProcessorUserMapsThroughTempTable(){
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
				.find("select p.activity.id, p.user.fullname, p.user.id from ProcessorDO p where p.deleted = false and p.activity.id in (select id from TempTableDO)");
		// 将查询出来的结果按activityId分组
		return this.getProcessorUserMapsGroupByActivityId(objs);
	}
	
	/**
	 * 将查询出来的结果按activityId分组
	 * @param activityIds
	 * @return
	 */
	private Map<String, Object> getProcessorUserMapsGroupByActivityId(List<Object[]> objs) {
		Map<String, Object> map = new HashMap<String, Object>();
		for (Object[] obj : objs) {
			String activityId = obj[0].toString();
			String fullname = obj[1] == null ? "" : obj[1].toString();
			String userId = obj[2] == null ? "" : obj[2].toString();
			Map<String, Object> userMap = new HashMap<String, Object>();
			userMap.put("fullname", fullname);
			userMap.put("id", userId);
			if (map.containsKey(activityId)) {
				((List<Map<String, Object>>)map.get(activityId)).add(userMap);
			} else {
				List<Map<String, Object>> users = new ArrayList<Map<String, Object>>();
				users.add(userMap);
				map.put(activityId, users);
			}
		}
		return map;
	}
	
	/**
	 * 根据activityId获取要更新到solr里的处理人<br>
	 * @param activityId
	 * @return
	 */
	public Map<String, Object> getProcessorsForSolr(Integer activityId) {
		Map<String, Object> map = new HashMap<String, Object>();
		StringBuffer hql = new StringBuffer("select distinct p from ProcessorDO p left join fetch p.activity left join fetch p.user where p.activity.id = ?");
//		List<UserDO> users = this.getProcessorUsersByActivityId(activityId);
		@SuppressWarnings("unchecked")
		List<ProcessorDO> processors =  (List<ProcessorDO>) this.query(hql.toString(), activityId);
		List<UserDO> users = new ArrayList<UserDO>();
		for(ProcessorDO processor : processors){
			users.add(processor.getUser());
		}
		map.put("processors", userDao.convert(users));
		return map;
	}
	
	/**
	 * 根据activityId获取要更新到solr里的处理人<br>
	 * @param activityId
	 * @return
	 */
	public Map<String, Object> getProcessorsForSolr(List<Integer> activityIds) {
		Map<String, Object> result = new HashMap<String, Object>();
		Map<String, List<UserDO>> usersMap = this.getProcessorUsersByActivityIds(activityIds);
		for(Entry<String, List<UserDO>> entry : usersMap.entrySet()){
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("processors", userDao.convert(entry.getValue()));
			result.put(entry.getKey(), map);
		}
		return result;
	}
	
	/**
	 * 获取待办的条数
	 * @param userId 用户ID
	 * @param typeCodes 安全信息类型的code数组
	 * @param typeInclude 是否包含安全信息的类型的code
	 * @return
	 */
	public Integer getToDoCount(Integer userId, String[] typeCodes, boolean typeInclude) {
		String hql = "select count(distinct t.activity.id) from ProcessorDO t where t.deleted = false and t.activity.deleted = false and t.user.id = ?";
		List<Object> params = new ArrayList<Object>();
		params.add(userId);
		if (typeCodes != null && typeCodes.length > 0) {
			hql += " and (t.activity.type.code";
			if (typeInclude) {
				hql += " in ('" + StringUtils.join(typeCodes, "','") + "')";
			} else {
				hql += " not in ('" + StringUtils.join(typeCodes, "','") + "') or t.activity.type.code is null";
			}
			hql += ")";
		}
		@SuppressWarnings("unchecked")
		List<Long> list = (List<Long>) this.query(hql, params.toArray());
		return list.get(0).intValue();
	}

	/**
	 * @param userDao the userDao to set
	 */
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}
	
}
