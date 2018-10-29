$.extend(com.sms.plugin.organization.orgUserRole.i18n,{
	title :'组织人员',
	form: {
		name: "名称：",
		system: "所属系统：",
		deptCode: "组织编号：",
		deptCodeDesc: "组织编号描述："
	},
	columns: {
		member: "成员",
		user: "用户",
		role: "角色",
		handle: "操作"
	},
	buttons: {
		remove: "移除",
		role: "角色"
	},
	messages: {
		userIsNull: "成员不能为空",
		roleIsNull: "角色不能为空",
		notRecords: '抱歉未找到记录',
		notSelectedOrg: "未选择任何组织",
		confirmRemoveUser: ["确认从组织<strong>", "</strong>中移除用户<strong>","</strong>？"]
	},
	addMemberDialog: {
		title: "添加成员",
		buttons: {
			ok: "添加",
			cancel: "取消"
		}
	},
	editRoleDialog: {
		title: "编辑角色"
	},
	delMemberDialog: {
		title: "移除成员:",
		body: "从当前组织中移除此人员？",
		buttons: {
			ok: "确定",
			cancel: "取消"
		}
	}
});
