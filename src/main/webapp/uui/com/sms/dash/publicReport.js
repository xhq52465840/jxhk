// @ sourceURL=com.sms.dash.publicReport
$.u.load('com.sms.dashfilter.filter');
$.u.define('com.sms.dash.publicReport', null, {
	init : function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._options = {};
		this.staticfilter = [
			{
				"propid": "summary",
				"propname": "主题",
				"propvalue": [],
				"propshow": "",
				"propplugin": "com.sms.plugin.search.textProp",
				"config": null,
				"type":"static"
			},
      {
        "propid": "type",
        "propname": "类型",
        "propvalue": [],
        "propshow":"",
        "propplugin": "com.sms.plugin.search.typeProp",
				"config": null,
				"type":"static"
      },
			{
				"propid": "status",
				"propname": "状态",
				"propvalue": [],
				"propshow":"",
				"propplugin": "com.sms.plugin.search.statusProp",
				"config": null,
				"type":"static"
			},
      {
        "propid": "priority",
        "propname": "优先级",
        "propvalue": [],
        "propshow":"",
        "propplugin": "com.sms.plugin.search.priorityProp",
				"config": null,
				"type":"static"
      },
			{
				"propid": "label",
				"propname": "标签",
				"propvalue": [],
				"propshow": "",
				"propplugin": "com.sms.plugin.search.tagProp",
				"config": null,
				"type":"static"
			},
      {
				"propid": "description",
				"propname": "详细描述",
				"propvalue": [],
				"propshow": "",
				"propplugin": "com.sms.plugin.search.textProp",
				"config": null,
				"type":"static"
			}
    ];
	},
	afterrender : function(bodystr) {
		this.getDisplayFilter();
	},
	getDisplayFilter : function(){
		var module = new com.sms.dashfilter.filter($("div[umid='filter']", this.$), this.staticfilter);
		module.override({
			loadData2:this.proxy(function(param){
				var dt = $.map($.parseJSON(param), function(filter){
					if(filter.propid !== "release" && filter.propvalue && filter.propvalue.length > 0){
						return { id:filter.propid, value:filter.propvalue };
					}
				});
				dt.push({
					id: "release",
					value: [{"id":"true","name":"发布"}]
				})
				this._setData({
					"tokenid":$.cookie("tokenid"),
					"method": "stdcomponent.getbysearchex",
					"core": "activity",
					"search":"",
					"columns": "",
					"order": "",
					"sort": "releaseDate desc",
					"isNeedPermission": false,
					"query": JSON.stringify(dt)
				});
			})
		});
		module._start();
	},
	_setData: function (data) {
		if(this.dataTable){
			this.dataTable.dataTable().api().destroy();
		}
		this.dataTable = this.qid("datatable").dataTable({
					searching: false,
					serverSide: true,
					bProcessing: true,
					ordering: false,
					pageLength:5,
					"sDom":"tip",
					"columns": [
							{ "title": "类型" ,"mData":"type"},
							{ "title": "编号" ,"mData":"unit"},
							{ "title": "主题" ,"mData":"summary"},
							{ "title": "安监机构" ,"mData":"unit"},
							{ "title": "状态" ,"mData":"status"},
							{ "title": "是否发布" ,"mData":"release"},
							{ "title": "发布时间" ,"mData":"releaseDate"}
					],
					"oLanguage": {
							"sSearch": "搜索:",
							"sLengthMenu": "每页显示 _MENU_ 条记录",
							"sZeroRecords": "抱歉未找到记录",
							"sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
							"sInfoEmpty": "没有数据",
							"sInfoFiltered": "(从总共_MAX_条记录中过滤)",
							"sProcessing": "检索中...",
							"oPaginate": {
								"sFirst": "<<",
								"sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
								"sNext": "<span class='fa fa-caret-right fa-lg'></span>",
								"sLast": ">>"
							}
					},
					"fnServerParams": this.proxy(function (aoData) {
						$.extend(aoData,data);
					}),
					"fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
						$.u.ajax({
									url: $.u.config.constant.smsqueryserver,
									dataType: "json",
									type:"post",
									cache: false,
									data: aoData
							},this.qid("datatable")).done(this.proxy(function (data) {
									if (data.success) {
										if(data.data){
											fnCallBack({
												"recordsFiltered":data.data.iTotalRecords,
												"iTotalRecords":data.data.iTotalRecords,
												"data":data.data.aaData
											})
										}else{
											fnCallBack({
												"recordsFiltered":0,
												"iTotalRecords":0,
												"data":[]
											})
										}
									}
							})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

							}));
					}),
					"aoColumnDefs": [
							{
									"aTargets": 0,
									"mRender": this.proxy(function (data, type, full) {
										return "<img src='" + this.getabsurl(data.url) + "' width='16' height='16''/>&nbsp;" + data.name;
									})
							},
							{
									"aTargets": 1,
									"mRender": this.proxy(function (data, type, full) {
										return "<span><a href='" + this.getabsurl("../search/publicReportDetail.html?activityId=" + full.id) + "' target='_blank'>" + data.code + "-" + full.num + "</a></span>";;
									})
							},
							{
									"aTargets": 2,
									"mRender": this.proxy(function (data, type, full) {
										return "<span><a href='" + this.getabsurl("../search/publicReportDetail.html?activityId=" + full.id) + "' target='_blank'>" + (data || "") + "</a></span>";
									})
							},
							{
									"aTargets": 3,
									"mRender": function (data, type, full) {
										return "<img src='"+ data.avatarUrl +"' width='16' height='16''/>&nbsp;"+data.name;
									}
							},
							{
									"aTargets": 4,
									"mRender": function (data, type, full) {
										return data.name;
									}
							},
							{
									"aTargets": 5,
									"mRender": function (data, type, full) {
										return data ? "发布" : "未发布";
									}
							},
							{
								"aTargets": 6,
								"mRender": function (data, type, full) {
									return data ? data : "";
								}
						}
					],
					"fnDrawCallback": this.proxy(function(full){
						window.parent && window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
					})
			});
	},
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.publicReport.widgetjs = [  '../../../uui/widget/spin/spin.js',
	'../../../uui/widget/jqblockui/jquery.blockUI.js',
	'../../../uui/widget/ajax/layoutajax.js',
	'../../../uui/widget/jqdatatable/js/jquery.dataTables.js'
];
com.sms.dash.publicReport.widgetcss = [
	{ path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }
];
