
package com.usky.sms.event;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import com.usky.sms.core.AbstractCache;

public class EventRegister extends AbstractCache {
	
	public static final String SYSTEM_EVENT = "system";
	
	private Map<String, Event> eventMap = new HashMap<String, Event>();
	
	@Override
	protected void refresh() {
		eventMap.clear();
		registerEvents();
	}
	
	private void registerEvents() {
		registerSystemEvents();
		registerCustomEvents();
	}
	
	private void registerSystemEvents() {
		// activity
		registerEvent("活动已创建", "活动已经被创建成功。", "ACTIVITY_CREATED", "text", SYSTEM_EVENT);
		registerEvent("活动已更新", "某个活动已经被用户进行了修改。", "ACTIVITY_UPDATED", "text", SYSTEM_EVENT);
		registerEvent("活动已被分配", "某个活动已经被分配给了指定的用户。", "ACTIVITY_ASSIGNED", "text", SYSTEM_EVENT);
		registerEvent("活动已解决", "这是一个 '活动被解决' 的事件", "ACTIVITY_RESOLVED", "text", SYSTEM_EVENT);
		registerEvent("活动已关闭", "某个活动已经被关闭。", "ACTIVITY_CLOSED", "text", SYSTEM_EVENT);
		registerEvent("重新打开", "某个被关闭的活动被重新打开。", "ACTIVITY_REOPENED", "text", SYSTEM_EVENT);
		registerEvent("活动已删除", "某个活动已经被删除。", "ACTIVITY_DELETED", "text", SYSTEM_EVENT);
		registerEvent("活动被移动", "某个活动已经被移动到其他机构中", "ACTIVITY_MOVED", "text", SYSTEM_EVENT);
		registerEvent("开始解决活动", "某个活动已经被接受，并开始解决", "WORK_STARTED", "text", SYSTEM_EVENT);
		registerEvent("停止解决活动", "某个活动因为某种原因被人为停止。", "WORK_STOPPED", "text", SYSTEM_EVENT);
		// remark
		registerEvent("已添加备注", "有用户对活动添加了备注", "ACTIVITY_COMMENTED", "text", SYSTEM_EVENT);
		registerEvent("备注被编辑", "活动的备注已经被修改", "ACTIVITY_COMMENT_EDITED", "text", SYSTEM_EVENT);
		// worklog
		registerEvent("已添加工作日志", "已经有用户为活动添加了工作日志", "WORK_LOGGED", "text", SYSTEM_EVENT);
		registerEvent("工作日志已更新", "某个活动的工作日志发生了变化", "ACTIVITY_WORKLOG_UPDATED", "text", SYSTEM_EVENT);
		registerEvent("工作日志被删除", "某个活动的工作日志被用户删除", "ACTIVITY_WORKLOG_DELETED", "text", SYSTEM_EVENT);
		// general
		registerEvent("一般事件", "这是一个 '一般事件'", "GENERIC_EVENT", "text", SYSTEM_EVENT);
	}
	
	private void registerCustomEvents() {
		// TODO: 自定义事件的注册
	}
	
	public void registerEvent(String name, String description, String code, String template, String type) {
		Event event = new Event(name, description, code, template, type);
		eventMap.put(code, event);
	}
	
	public Collection<Event> getEvents() {
		return eventMap.values();
	}
	
}
