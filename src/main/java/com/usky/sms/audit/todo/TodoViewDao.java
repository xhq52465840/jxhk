
package com.usky.sms.audit.todo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.audit.improve.EnumImproveSourceType;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;


public class TodoViewDao extends HibernateDaoSupport {
	
	private Config config;
	
	public TodoViewDao() {
		this.config = Config.getInstance();
	}
	
	/**
	 * 获取当前用户的待办列表,按照更新时间降序排序
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getTodoList(){
		List<Object[]> list = this.getHibernateTemplate().find("select distinct tv, tf.userType from TodoViewDO tv, TodoViewFlowUserDO tf where tv.id = tf.id and tf.user.id= ? order by tv.lastUpdate desc", UserContext.getUserId());
		List<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();
		for(Object[] o : list){
			TodoViewDO todoView = (TodoViewDO) o[0];
			String userType = (String) o[1];
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", todoView.getId());
			map.put("todoWhat", todoView.getTodoWhat());
			String todoName = todoView.getTodoName();
			String todoType = todoView.getTodoType();
			String todoTypeName = null;
			map.put("todoName", todoName);
			try {
				if ("plan".equals(todoName) || "task".equals(todoName) || "check".equals(todoName) || "improve".equals(todoName)) { // 计划,工作单,检查单,整改单时
						todoTypeName = EnumPlanType.getEnumByVal(todoType).getDescription();
				} else if ("improveNotice".equals(todoName) || "subImproveNotice".equals(todoName)) { // 整改通知单时或整改通知单子单
					todoTypeName = EnumImproveSourceType.getEnumByVal(todoType).getDescription();
				} else {
					todoTypeName = todoType;
				}
			} catch (Exception e) {
				todoTypeName = todoType;
			}
			map.put("todoType", todoType);
			map.put("todoTypeName", todoTypeName);
			map.put("todoTitle", todoView.getTodoTitle());
			map.put("todoNum", todoView.getTodoNum());
			map.put("todoUnit", todoView.getTodoUnit());
			map.put("flowStatus", todoView.getFlowStatus());
			map.put("flowStep", todoView.getFlowStep());
			map.put("created", DateHelper.formatIsoSecond(todoView.getCreated()));
			map.put("lastUpdate", DateHelper.formatIsoSecond(todoView.getLastUpdate()));
			map.put("userType", userType);
			UserDO user = todoView.getCreator();
			Map<String, Object> userMap = new HashMap<String, Object>();
			if (user != null) {
				userMap.put("id", user.getId());
				userMap.put("username", user.getUsername());
				userMap.put("fullname", user.getFullname());
				AvatarDO avatar = user.getAvatar();
				if (avatar == null) {
					userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
				} else {
					userMap.put("avatar", avatar.getId());
					userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
				}
				map.put("creator", userMap);
			}
			
			maps.add(map);
		}
		return maps;
	}
	
	/**
	 * 获取当前用户的待办条数
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Integer getTodoCount(UserDO user){
		List<Long> list = this.getHibernateTemplate().find("select count(distinct tv) from TodoViewDO tv, TodoViewFlowUserDO tf where tv.id = tf.id and tf.user.id= ?", user.getId());
		return list.get(0).intValue();
	}

}
