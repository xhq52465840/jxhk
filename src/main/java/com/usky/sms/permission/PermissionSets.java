
package com.usky.sms.permission;

public enum PermissionSets {
	// global
	SYSTEM_ADMIN("系统管理员", "global", "负责执行所有管理功能。至少在这个权限中设置一个用户组。"), //
	ADMIN("管理员", "global", "负责执行大部分管理功能 (不包括导入 & 导出, SMTP 邮件服务器设置等)。"), //
	USER("用户", "global", "可以登录系统。他们是一个 '用户'。 所有新建的用户都会自动关联到这个权限。"), //
	//	VIEW_USER("浏览用户", "global", "Ability to select a user or group from a popup window as well as the ability to use the 'share' activities feature. Users with this permission will also be able to see names of all users and groups in the system."), //
	//	CREATE_SHARED_OBJECT("创建共享的对象", "global", "允许共享面板和过滤器给其他用户、用户组和机构角色。"), //
	//	MANAGE_FILTER_RSS("管理群组的过滤器订阅", "global", "允许管理(创建和删除)群组的 过滤器订阅。"), //
	//	BATCH_UPDATE("批量更改", "global", "允许批量编辑信息。例如至需一个操作步骤就可以解决多个信息。"), //
	ASSESSMENT_COMPLETION("评审工作完成情况", "global", "评审工作完成情况"), //
	SAFETY_ASSESSMENT_OVERVIEW("安全评审总览", "global", "安全评审总览"), //
	VIEW_SAFETY_LIBRARY("查看安全图书馆", "global", "查看安全图书馆"), //
	VIEW_SAFETY_LIBRARY_SYS_DIR("查看安全图书馆系统目录", "global", "查看安全图书馆系统目录"), //
	MANAGE_SAFETY_LIBRARY("管理安全图书馆", "global", "管理安全图书馆"), //
	MANAGE_TEM_DICTIONARY("管理TEM字典", "global", "管理TEM字典"), //
	AUDIT_SAFETY_REVIEW("审核安全评审", "global", "审核安全评审。"), //
	CREATE_SYS_IMPROVE_NOTICE("创建公司级整改通知单", "global", "创建公司级整改通知单。"), //
	BUSINESS_ADMIN("业务管理员", "global", "负责进行系统的业务配置，包括：用户，组织，，用户组，角色权限，TEM字典，数据字典，评审规则，机型维护"), //
	ADD_SYS_PLAN("创建公司级审计计划", "global", "允许创建公司级审计计划"),
	ADD_TERM_PLAN("创建航站审计的审计计划", "global", "创建航站审计的审计计划"),
	ADD_SYS_CHECK_PLAN("创建公司级检查计划", "global", "创建公司级检查计划"),
	VIEW_GLOBAL_IMPROVE_NOTICE("查看整改通知单", "global", "查看整改通知单"),
	DELETE_SYS_IMPROVE_NOTICE("删除公司级整改通知单", "global", "删除公司级整改通知单"),
	EDIT_LABEL("编辑标签", "global", "编辑标签"),
	RELEASE_ACTIVITY("发布与取消发布安全信息", "global", "允许发布与取消发布安全信息"),
	VIEW_ALL_IMPROVE_ISSUE("查看所有整改问题", "global", "查看所有整改问题"),
	VIEW_ALL_RISK_LEVEL("查看风险等级", "global", "查看所有的风险等级P、S问题"),
	UPDATE_RISK_LEVEL("更新风险等级", "global", "更新风险等级数据"),
	
	// rewards
	
	MANAGE_REWARDS("管理奖惩记录", "rewards", "允许管理奖惩记录。"),
	
	MANAGE_TRAINING_RECORD("管理培训记录", "trainingRecord", "允许管理培训记录。"),
	
	// unit
	MANAGE_UNIT("管理机构", "unit", "允许在SMS中管理机构。"), //
	VIEW_UNIT("浏览机构", "unit", "允许浏览机构和机构所属的信息。"), //
	//	VIEW_DEVELOPMENT_TOOLS("View Development Tools", "unit", "Allows users to view development-related information on the view activity screen, like commits, reviews and build information."), //
	//	VIEW_WORKFLOW("查看工作流", "unit", "拥有这个权限的用户可以查看工作流。"), //
	
	// activity
	VIEW_ACTIVITY("查看信息", "activity", "允许查看信息"), //
	CREATE_ACTIVITY("创建信息", "activity", "允许创建信息"), //
	EDIT_ACTIVITY("编辑信息", "activity", "允许编辑信息"), //
	TRANSFORM_ACTIVITY("切换信息类型", "activity", "允许切换信息类型"), //
	//	SCHEDULE_ACTIVITY("规划信息日程", "activity", "Ability to view or edit an activity's due date."), //
	//	MOVE_ACTIVITY("移动信息", "activity", "允许在不同机构之间或同一个机构不同工作流之间移动信息。请注意，用户必须具有目标机构的创建信息权限才能将信息移动到目标机构中。"), //
	//	ASSIGN_ACTIVITY("分配信息", "activity", "允许分配信息给其他用户"), //
	//	ASSIGNED("被分配", "activity", "允许其他用户把信息分配给这个权限的用户。"), //
	//	SOLVE_ACTIVITY("解决信息", "activity", "允许解决和重新打开信息。包括可以设置'解决版本'。"), //
	//	CLOSE_ACTIVITY("关闭信息", "activity", "允许关闭信息。通常是开发人员解决信息，质检部门负责关闭。"), //
	//	UPDATE_REPORTER("修改报告人", "activity", "允许在创建和编辑信息时修改报告人。"), //
	DELETE_ACTIVITY("删除信息", "activity", "允许删除信息"), //
	//	LINK_ACTIVITY("链接信息", "activity", "允许将多个信息建立联系。只有当链接信息功能打开后才能使用。"), //
	//	SET_SECURITY_LEVEL("设置安全级别", "activity", "允许设置一个信息的安全级别，来决定哪些用户可以浏览这个信息。"), //
	
	// voter&watcher
	//	VIEW_VOTER_AND_WATCHER("查看投票人与关注人", "voter&watcher", "允许查看一个信息的投票人和关注人列表。"), //
	//	MANAGE_WATCH_LIST("管理关注列表", "voter&watcher", "允许管理信息的关注者列表。"), //
	
	// remark
	ADD_REMARK("添加备注", "remark", "允许为信息添加备注"), //
	EDIT_REMARK("编辑所有备注", "remark", "允许编辑所有备注。"), //
	EDIT_SELF_REMARK("编辑自己的备注", "remark", "允许编辑自己的备注。"), //
	DELETE_REMARK("删除所有备注", "remark", "允许删除所有备注。"), //
	DELETE_SELF_REMARK("删除自己的备注", "remark", "允许删除自己的备注"), //
	
	// attachment
	ADD_ATTACHMENT("添加附件", "attachment", "这个权限中的用户可以为信息添加附件。"), //
	DELETE_ATTACHMENT("删除所有附件", "attachment", "拥有这个权限的用户可以删除所有附件。"), //
	DELETE_SELF_ATTACHMENT("删除自己的附件", "attachment", "拥有这个权限的用户可以删除自己的附件。"), //
	
	// worklog
	//	ADD_WORKLOG("添加工作日志", "worklog", "允许为信息记录工作日志。只有当时间追踪功能打开后才能使用。"), //
	//	EDIT_SELF_WORKLOG("编辑自己的工作日志", "worklog", "允许编辑自己的工作日志记录。"), //
	//	EDIT_WORKLOG("编辑所有工作日志", "worklog", "允许编辑所有人的工作日志记录。"), //
	//	DELETE_SELF_WORKLOG("删除自己的工作日志", "worklog", "允许删除自己的工作日志记录。"), //
	//	DELETE_WORKLOG("删除所有工作日志", "worklog", "允许删除所有人的工作日志记录。"), //
	
	// safetyReview
	MANAGE_SAFETY_REVIEW("管理安全评审", "safetyReview", "允许管理机构的安全评审。"), //
	VIEW_SAFETY_REVIEW("浏览安全评审", "safetyReview", "允许浏览机构的安全评审。"), //
	
	// TEM
	TEM("TEM", "tem", "允许操作安全信息的TEM数据。"), //
	CONTROL_MEASURE("控制措施", "tem", "允许操作TEM里的控制措施数据。"), //
	ACTION_ITEM("行动项", "tem", "允许操作安全措施里的行动项数据。"), //
	
	// 行动项
	EXECUTE_ACTION_ITEM("执行行动项", "actionItem", "允许执行行动项。"), //
	CONFIRM_ACTION_ITEM("验证行动项", "actionItem", "允许验证行动项。"), //
	AUDIT_ACTION_ITEM("审核行动项", "actionItem", "允许审核行动项。"), //
	
	// 事件分析
	EVENT_ANALYSIS("事件分析", "eventAnalysis", "允许操作安全信息的事件分析数据。"),
	
	// 任务分配
	ACTIVITY_ASSIGNMENT("安全信息任务分配", "activity", "允许对安全信息的进行任务分配。"),
	
	// risk
	AIRLINE_INFORMATION("航线信息", "risk", "允许操作安全信息的航线信息数据。"), //
	RISK_TASK("任务分配", "risk", "允许操作安全信息的任务分配数据。"), //
	
	// plan
	ADD_SUB_PLAN("创建分子公司内审的审计计划", "plan", "创建分子公司内审的审计计划"),
	
	//plan
	ADD_SUB3_PLAN("创建二级内审的审计计划", "plan", "创建二级内审的审计计划"),
	
	// plan
	ADD_SUB_CHECK_PLAN("创建分子公司检查计划", "plan", "允许创建分子公司检查计划"),
	
	// improveNotice
	CREATE_SUB_IMPROVE_NOTICE("创建分子公司的整改通知单", "improveNotice", "允许创建分子公司的整改通知单"),
	VIEW_UNIT_IMPROVE_NOTICE("查看分子公司整改通知单", "improveNotice", "查看分子公司整改通知单"),
	DELETE_SUB_IMPROVE_NOTICE("删除分子公司级整改通知单", "improveNotice", "删除分子公司级整改通知单"),
	
	// improveIssue
	VIEW_UNIT_IMPROVE_ISSUE("查看所在分子公司整改问题", "improveIssue", "查看分子公司整改问题"),
	VIEW_ORG_IMPROVE_ISSUE("查看所在组织整改问题", "improveIssue", "查看所在组织整改问题"),
	;
	
	private String name;
	
	private String type;
	
	private String description;
	
	PermissionSets(String name, String type, String description) {
		this.name = name;
		this.type = name;
		this.description = description;
	}
	
	public String getName() {
		return name;
	}
	
	public String getType() {
		return type;
	}
	
	public String getDescription() {
		return description;
	}
	
}
