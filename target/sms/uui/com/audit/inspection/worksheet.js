//@ sourceURL=com.audit.inspection.worksheet
$.u.load("com.audit.filter.filter");
$.u.define('com.audit.inspection.worksheet', null, {
    init: function () {
    	this.staticfilter = [
			{
				"config": {
					"method":"getPlanType",
					"category":"check"
				},
				"propid": "planType",
				"propname": "计划类别",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.selectProp"
			},{
				"config": {
					"method":"getCheckGrade"
				},
				"propid": "checkType",
				"propname": "检查级别",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.selectProp"
			},{
				"config": null,
				"propid": "checkDate",
				"propname": "检查日期",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.dateProp"
			}
    	];
    	this.searchTerms = [[{"key":"permittedQuery","value":true}]];
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
				this.searchTerms = [[{"key":"permittedQuery","value":true}]];
				this.searchTerms.push([{"key":"planType","op":"in","value":["SPOT","SPEC"]}]);
				param && $.each(param, this.proxy(function(idx, obj){
					if(obj.propvalue.length){
						switch(obj.propid){
							case "checkDate":
								if(obj.propvalue[0].startDate){
									this.searchTerms.push([{"key":"startDate","value":obj.propvalue[0].startDate,"op":">="}]);
								}
								if(obj.propvalue[0].endDate){
									this.searchTerms.push([{"key":"endDate","value":obj.propvalue[0].endDate,"op":"<="}]);
								}
								break;
							case "planType":
							case "checkType":
								var temp = [];
								obj.propvalue.length && $.each(obj.propvalue,this.proxy(function(idx,item){
									temp.push(item.id);
								}));
								this.searchTerms.push([{"key":obj.propid,"value":temp,"op":"in"}]);
								break;
							default:
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
                { "title": "工作单名称" ,"mData":"workName","Width":"20%"},
                { "title": "工作单编号" ,"mData":"workNo"},
                { "title": "检查日期" ,"mData":"startDate"},
                { "title": "检查地点" ,"mData":"address"},
                { "title": "检查级别" ,"mData":"checkType"},
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
	    		}else{
	    			sort = "lastUpdate";
	    	    	dir = "desc";
	    		}
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"task",
            		"search":"",
            		"rule":JSON.stringify(this.searchTerms),
            		"columns":JSON.stringify([{"data":sort}]),
        	 		"order":JSON.stringify([{"column":0,"dir":dir}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type:"post",
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
	                    if(full.planType === "SPOT" || full.planType === "SPEC"){
	                    	return "<a href='viewworklist.html?id="+full.id +"' target='_blank' >" + (data||"") + "</a>";
	                    }else{
	                    	return data||"";
	                    }
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	return "<div style='width:140px'>"+data || ''+"</div>";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	return (full.startDate || "") + "<br/>" + (full.endDate || "");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return data || "";
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                    	var dt = "";
                    	if(data === "SYS"){
                    		dt = "公司级";
                    	}else if(data === "SUB2"){
                    		dt = "分子公司二级";
                    	}
                    	return dt;
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

com.audit.inspection.worksheet.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                                 "../../../uui/widget/spin/spin.js", 
                                                 "../../../uui/widget/jqurl/jqurl.js",
                                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                 "../../../uui/widget/ajax/layoutajax.js"];
com.audit.inspection.worksheet.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];