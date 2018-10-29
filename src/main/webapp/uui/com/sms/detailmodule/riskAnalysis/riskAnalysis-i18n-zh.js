$.extend(com.sms.detailmodule.riskAnalysis.riskAnalysis.i18n, {
	title: '风险分析',
	spareTitle:'剩余/衍生风险评价',
	summrize:'总结评价结论',
	status: {
		draft: "草稿",
		submitted: "已提交"
	},
	columns: {
		hazardIdentification: '危险源识别',
		riskAnalysis: '风险分析',
		riskLevel: '风险等级',
		manualTerms: '控制措施',
		wheatherToGenerateChecklists: '是否生成检查单',
		threat: '威胁',
		error: '差错',
		code:'编号',
		actionItem:"行动项",
		personLable:"责任人",
		dueDate:"到期日",
		status:"状态",
		creator: '创建人：',
		status: '状态',
		itemStatus: '状态',
		handel:"操作",
		lastUpdate: '最后更新时间：'
	},
	buttons: {
		addRiskAnalysis: '添加风险分析',
		submitRiskAnalysis: '提交',
		removeRiskAnalysis: '删除风险分析',
		editMappingText: '编辑风险分析',
		addControl: '添款',
		removeControl: '删除条款',
		addThreat: '添加威胁',
		addError: '添加差错',
		removeMapping: '删除',
		release: '发布'
	},
	addRiskAnalysisDialog: {
		title: "添加分析模块",
		system: "系统",
		buttons: {
			ok: "确认",
			cancel: "取消"
		}
	},
	removeRiskAnalysisDialog: {
		title: "删除确认",
		buttons: {
			remove: "删除",
			cancel: "取消"
		}
	},
	messages: {
		notAllowDeleteMapping: "删除 威胁/差错 前，请删除对应的所有的条款",
		notAllowDeleteRiskAnalysis: "删除 风险分析 前，请删除包含的威胁和差错",
		confirmSubmitRiskAnalysis: "确认提交？"
	}
});