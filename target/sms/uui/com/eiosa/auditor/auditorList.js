$.u.define('com.eiosa.auditor.auditorList', null, {
	init : function(options) {
		this._options = options || null;
		this.reportId = this._options.reportId;
	},

	afterrender : function() {
		this.auditorsVue = new Vue({
			el : '#auditors2',
			data : {
				auditorsList : '',
				auditorSectionNames : '',
				auditorQueryForm : {
					sectionId : '',
					auditorName : ''
				},
				pagebarsData:{
					all : 0, // 总条数
					cur : 1,// 当前页码
					start : 0,//当前条数
					length : 5,// 单页条数
				},  
				orders:{
					sortby : '', // 排序字段
					sortorders : 'asc',// 排序方式
				}, 
			},
			methods : {
				auditorInfo : this.proxy(this._auditorInfo),
				search : this.proxy(this._queryauditorsSearch),
				reset : this.proxy(this._auditorQueryFormReset),
				page : this.proxy(this._queryauditors),
			},
		});

		this._queryauditors();
		this._initSectionNames();
	},

	_auditorInfo : function(e) {
		var id = $(e.currentTarget).attr("data");
		window.open("/sms/uui/com/sms/ViewProfile.html?id=" + id);
	},

	_queryauditors : function() {
		var data = {
			"method" : "queryAuditors",
			"reportId" : this.reportId,
			"type" : "audited",
			"sectionId" : $("#auditorSection").val(),
			"name" : $("#auditorName").val(),
			"start" : this.auditorsVue.pagebarsData.start,
			"length" : this.auditorsVue.pagebarsData.length,
			"sortby" : this.auditorsVue.orders.sortby,
			"sortorders" : this.auditorsVue.orders.sortorders,
		};
		debugger
		myAjaxQuery(data, $("#auditors"), this.proxy(function(response) {
			if (response.success) {
				this.auditorsVue.$set("auditorsList", response.auditorList);
				this.auditorsVue.pagebarsData.all=response.all;
			}
		}));
	},
	
	_queryauditorsSearch : function() {
		this.auditorsVue.pagebarsData.cur=1;
		this.auditorsVue.pagebarsData.start=0;
		this._queryauditors();
	},

	_initSectionNames : function(e) {
		var data = {
			"method" : "getSectionName",
			"reportId" : this.reportId
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.auditorsVue.$set('auditorSectionNames', response.data)
			}
		}));
	},

	_auditorQueryFormReset : function() {
		$("#auditorSection").val("");
		$("#auditorName").val("");
	}

}, {
	usehtm : true,
	usei18n : false
});