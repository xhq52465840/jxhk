$.extend(com.audit.xitong_jihua.audit_assignedToMe.i18n,{
	title :'用户',
	buttons: {
		CreateUser :'创建用户',
		filter :'过滤',
		removeFilter :'清除筛选',
		userGroup:'用户组',
		role :'角色',
		edit :'编辑',
		enable: '启用',
		disable: '禁用',
		remove :'删除',
	},
	filter: {
		title: '筛选用户',
		form: {
			accountNameHas :'账户名中有',
			userNameHas :'用户名中有',
			mailHas :'邮箱中有',
			userGroup :'用户组',
			allUserGroup :'全部',
		}
	},	
	columns: {
		//待办类型todo_what  待办子类型todo_type  待办名称todo_title  待办编号todo_num  
        //流程状态flow_status  创建时间create_date
		todo_what:"类型",
		todo_type_name :'子类型',
		todo_title :'名称',
		todo_num :'编号',
		flow_status :'状态',
		create_date :'创建时间',
		last_update :'最后更新时间'	
	},	
	messages: {
		lookFail : '查看用户失败：',
		editFail : '编辑用户失败：',
		edituserGroupFail : '编辑用户组失败：',
		editgroupFail : '编辑组织失败：',
		removeUserFail : '删除用户失败：',
	},
	removeUserDialog: {
		title: '删除用户：',
		affirm : '你将要删除用户',
		remaind : '此操作不能恢复。'
	},	
	search : '搜索:',
	everPage : '每页显示',
	record : '个用户',
	message : '抱歉未找到记录',
	from : '从',
	to : '到',
	all : '共',
	allData : '条数据',
	withoutData : '没有数据',
	fromAll : '从总共',
	filterRecord : '条记录中过滤',
	searching : '检索中',
	back : '<span class="fa fa-caret-left fa-lg"></span>',
	next : '<span class="fa fa-caret-right fa-lg"></span>'
	
});