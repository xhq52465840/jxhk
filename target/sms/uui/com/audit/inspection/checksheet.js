//@ sourceURL=com.audit.inspection.checksheet
$.u.load("com.audit.filter.filter");
$.u.define('com.audit.inspection.checksheet', null, {
    init: function () {
    	this.staticfilter = [
			{
				"config": {
					"method":"getPlanType",
					"category":"check"
				},
				"propid": "planType",
				"propname": "计划类别",
				"propvalue": [{"id": "SPOT","name": "现场检查"}],
				"propshow":"现场检查",
				"type":"static",
				"propplugin": "com.audit.filter.singleSelectProp"
			},{
				"config": {
					"method":"getCheckGrade"
				},
				"propid": "checkGrade",
				"propname": "检查级别",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.singleSelectProp"
			},
			{
				"config": null,
				"propid": "checkName",
				"propname": "检查单名称",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.textProp"
			},{
				"config": null,
				"propid": "checkNo",
				"propname": "检查单编号",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.textProp"
			},{
				"config": null,
				"propid": "checkDate",
				"propname": "检查日期",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.dateProp"
			},{
				"config": {
					"method" : "stdcomponent.getbysearch",
					"dataobject" : "dictionary",
					"rule": JSON.stringify([[{"key":"type","value":"系统分类"}]])
				},
				"propid": "checkType",
				"propname": "检查范围",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.selectProp"
			}
    	];
    	this.searchTerms = [];
    	this.count = 0;
    },
    afterrender: function () {
    	this.getDisplayFilter();
    	$('th.sorting').on("click",this.proxy(function(e){
    		this.count ++;
    	}));
    },
    getDisplayFilter : function(){
		var module = new com.audit.filter.filter($("div[umid='auditfilter']", this.$), this.staticfilter);
		module.override({
			loadData:this.proxy(function(param){
				this.searchTerms = {};
				param && $.each(param, this.proxy(function(idx, obj){
					if(obj.propvalue.length){
						switch(obj.propid){
							case "checkDate":
								this.searchTerms["startDate"] = obj.propvalue[0].startDate || "";
								this.searchTerms["endDate"] = obj.propvalue[0].endDate || "";
								break;
							case "checkType":
								var temp = [];
								obj.propvalue.length && $.each(obj.propvalue,this.proxy(function(idx,item){
									temp.push(item.id);
								}));
								this.searchTerms[obj.propid] = temp;
								break;
							case "checkGrade":
								var temp = [];
								obj.propvalue.length && $.each(obj.propvalue,this.proxy(function(idx,item){
									temp.push(item.id);
								}));
								this.searchTerms[obj.propid] = temp;
								break;
							case "planType":
								var temp = [];
									obj.propvalue.length && $.each(obj.propvalue,this.proxy(function(idx,item){
										temp.push(item.id);
									}));
								this.searchTerms[obj.propid] = temp;
								break;
							default:
								obj.propvalue.length && $.each(obj.propvalue,this.proxy(function(idx,item){
									this.searchTerms[obj.propid]=item.id;
								}));
								break;
						}
					}
				}));
				if(this.dataTable){
					this.dataTable.fnDraw();
				}else{
					this._createTable();
				}
    		})
    	});
		module._start();
    },
    _createTable : function(){
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: true,
            pageLength:10,
            "sDom":"tip",
            "columns": [
                { "title": "检查单名称" ,"mData":"checkName","sWidth":"20%"},
                { "title": "检查单编号" ,"mData":"checkNo"},
                { "title": "检查范围" ,"mData":"checkType"},
                { "title": "检查日期" ,"mData":"startDate"},
                { "title": "检查地点" ,"mData":"address"},
                { "title": "最后更新时间" ,"mData":"lastUpdate"}
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
                    "sPrevious": "上一页",
                    "sNext": "下一页",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
	    		if(this.count){
	    			sort = aoData.columns[aoData.order[0].column].data;
	            	dir =  aoData.order[0].dir;
	            	sort = "lastUpdate";
	    	    	dir = "desc";
	    		}else{
	    			sort = "lastUpdate";
	    	    	dir = "desc";
	    		}
	    		delete aoData.search;
	    		delete aoData.columns;
	    		delete aoData.order;
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"getCheckSheet",
            		"rule":JSON.stringify(this.searchTerms),
            		"sort":sort + " " + dir
            	},true);
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
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                    	return "<a href='viewchecklist.html?id="+full.id +"' target='_blank' >" + (data||"") + "</a>";
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	return data || "";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	return data || "";
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return (full.startDate || "") + "<br/>" + (full.endDate || "");
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                    	return data || "";
                    }
                },
                {
                    "aTargets": 5,
                    "mRender": function (data, type, full) {
                    	return data || "";
                    }
                }
            ]
        });
    }
}, { usehtm: true, usei18n: false });

com.audit.inspection.checksheet.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                                 "../../../uui/widget/spin/spin.js", 
                                                 "../../../uui/widget/jqurl/jqurl.js",
                                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                 "../../../uui/widget/ajax/layoutajax.js"];
com.audit.inspection.checksheet.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];