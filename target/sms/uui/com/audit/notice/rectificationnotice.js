//@ sourceURL=com.audit.notice.rectificationnotice
$.u.load("com.audit.filter.filter");
$.u.define('com.audit.notice.rectificationnotice', null, {
    init: function () {
    	this.staticfilter = [
			{
				"config": {
					"method":"getImproveNoticeSource"
				},
				"propid": "source",
				"propname": "来源",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.selectProp"
			},{
				"config": {
					"method":"getOperatorForImproveIssue"
				},
				"propid": "operator",
				"propname": "签发单位",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.selectProp"
			},{
				"config": null,
				"propid": "checkDate",
				"propname": "审计日期",
				"propvalue": [],
				"propshow":"",
				"type":"static",
				"propplugin": "com.audit.filter.dateProp"
			}
    	];
    },
    afterrender: function () {
    	this.isFirst=true;
    	this.validPermission();
    	this.getDisplayFilter();
    	setInterval(this.proxy(this.yanzheng,10));
    },
    validPermission: function(){
    	this.btn_search = this.qid("btn_search");
        this.btn_search.off("click").on("click", this.proxy(this.get_validPermission));
    	this.sys_item = this.qid("sys_item").select2({
        	placeholder: "请选择检查级别",
    		allowClear : true,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"getCheckGrade"
 	        		};
 	    		},
 		        results:function(data,page){
 		        	if(data.success){
 		        		return { results: data.data };
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       }).on("select2-selecting", this.proxy(function(e) {
    	   this.qid("create").addClass("hidden");
		   $("div[id$=sys_unit]").removeClass("hidden").select2("val","");
       }));
        this.sys_unit = this.qid("sys_unit").select2({
        	placeholder: "请选择安监机构",
    		allowClear : true,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: this.proxy(function(term, page){
 	        		return {
 	        			"tokenid":$.cookie("tokenid"),
 	        			"method":"getAddableImproveNoticeUnits",
 	        			"improveNoticeType":this.sys_item.val(),
 	        			"unitName":term
 	        		}
 	    		}),
 		        results:function(data,page){
 		        	if(data.success){
 		        		return { results: data.data };
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       }).on("change", this.proxy(function(e) {
	       if(this.sys_unit.val()){
	    	   this.get_validPermission();
	       }else{
	    	   this.sys_unit.focus();
	       }
       }));
    },
    get_validPermission : function(){
    	var obj = {};
    	if(this.sys_item.val() === "SYS"){
			obj = {
    			method: "getCreateImproveNoticePermission",
    			tokenid: $.cookie("tokenid")
    		};
    	}else if(this.sys_item.val() === "SUB2"){
    		obj = {
    			method: "getCreateImproveNoticePermission",
    			tokenid: $.cookie("tokenid"),
    			unitId: this.sys_unit.val()
    		};
    	}
    	$.ajax({
    		url: $.u.config.constant.smsqueryserver,
    		type: "post",
    		data: obj,
    		dataType: "json"
    	}).done(this.proxy(function(response){
    		if(response.success && response.data && response.data.addable === true){
    	    	this.qid("create").removeClass("hidden").off("click").on("click",this.proxy(this.createForm));
    		}else{
    			this.qid("create").addClass("hidden");
    		}
    	})).fail(function(){
    		this.qid("create").addClass("hidden");
    	});
    },
    getDisplayFilter : function(){
		var module = new com.audit.filter.filter($("div[umid='auditfilter']", this.$), this.staticfilter);
		module.override({
			loadData:this.proxy(function(param){
				this.searchTerms =  {};
				param && $.each(param, this.proxy(function(idx, obj){
					if(obj.propvalue.length){
						switch(obj.propid){
							case "checkDate":
								if(obj.propvalue[0].startDate){
									this.searchTerms["startCheckDate"] = obj.propvalue[0].startDate;
								}
								if(obj.propvalue[0].endDate){
									this.searchTerms["endCheckDate"] = obj.propvalue[0].endDate;
								}
								break;
							case "flowStatus":	
								var a = [];
								obj.propvalue.length>0 && $.each(obj.propvalue,this.proxy(function(idx,item){
									a.push(item.name);
								}));
								this.searchTerms[obj.propid] = a;
								break;
							case "improveNoticeNo":
								var c = "";
								obj.propvalue.length && $.each(obj.propvalue,this.proxy(function(idx,item){
									c += item.name;
								}));
								this.searchTerms[obj.propid] = c;
								break;
							default:
								var b=[];
								obj.propvalue.length>0 && $.each(obj.propvalue,this.proxy(function(idx,item){
									b.push(item.id);
								}));
								this.searchTerms[obj.propid] = b;
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
    yanzheng:function(){
        	if(this.qid("sys_item").select2("val")==""){
        		this.qid("sys_unit").parent().hide();
        	}else{
        		this.qid("sys_unit").parent().show();
        	}
        	if(this.qid("sys_unit").select2("val")==""||this.qid("sys_item").select2("val")==""){
        		this.qid("create").parent().hide();
        	}else{
        		this.qid("create").parent().show();
        	}
    },
    validate:function(){
    	if(this.qid("sys_item").select2("val")==""){
    		$.u.alert.error("请选择类型");
    		return false;
    	}else if(this.qid("sys_unit").select2("val")==""){
    		$.u.alert.error("请选择安监机构");
    		return false;
    	}else{
    		return true;
    	}
    },
    createForm : function(){
    	var vali=this.validate();
    	if(vali){
    	this._ajax(
			$.u.config.constant.smsmodifyserver,
			"post",
			{
				"method":"stdcomponent.add",
				"dataobject":"improveNotice",
				"obj":JSON.stringify({
					"operator":this.sys_unit.val().toString(),
					"improveNoticeType":this.sys_item.val()
				})
			},
			this.$,
			this.proxy(function(response){
				this.noticeid = response.data;
				window.open("RectificationFormNew.html?id="+this.noticeid+"&NoticeType="+this.sys_item.val(), "_blank");
			})
		);

    	}
    },
    _createTable : function(){
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:10,
            "sDom":"tip",
            "aoColumns": [
                { "title": "整改编号" ,"mData":"improveNoticeNo","sWidth":""},
                { "title": "来源" ,"mData":"source","sWidth":"10%"},
                { "title": "签发单位" ,"mData":"operator","sWidth":"10%"},
                { "title": "检查地点" ,"mData":"address","sWidth":"10%"},
                { "title": "状态" ,"mData":"status","sWidth":"10%"},
                { "title": "更新时间" ,"mData":"lastUpdate","sWidth":"10%"},
                { "title": "回复期限" ,"mData":"replyDeadLine","sWidth":"10%"}
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
            	if(this.isFirst){
            		sort = "lastUpdate";
            		dir = "desc";
            		this.isFirst=false;
            	}else{
            		/*sort = aoData.columns[aoData.order[0].column].data;
                	sort == "operator" ? (sort = "operatorId") : sort;
                	dir =  aoData.order[0].dir || "desc";*/
            		sort = "lastUpdate";
            		dir = "desc";
            	}
            	delete aoData.columns;
            	delete aoData.order;
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"searchImproveNotice",
            		"rule":JSON.stringify(this.searchTerms),
            		"search":"",
            		"sort":JSON.stringify({"key":sort,"value":dir})
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
                    	var html = "";
                    	if(full.status){
	                    	if( full.status.id === "NEW"){
	                    		html = '<div style="width:20em;word-break:break-all;"><a href="RectificationFormNew.html?id='+full.id+'" target="_blank">'+(data||'--')+'</a><div>';
	                    	}else if(full.status.id === "AUDIT_WAITING"){
	                    		html = '<div style="width:20em;word-break:break-all;"><a href="RectificationFormNew.html?id='+full.id+'&improveNoticetype=AuditWaiting" target="_blank">'+(data||'--')+'</a><div>';
	                    	}else if(full.status.id === "AUDIT_REJECTED"){
	                    		html = '<div style="width:20em;word-break:break-all;"><a href="RectificationFormNew.html?id='+full.id+'&improveNoticetype=AuditRejected" target="_blank">'+(data||'--')+'</a><div>';
	                    	}else{
	                    		html = "<div style='width:20em;word-break:break-all;'><a href='RectificationFormDetail.html?id="+full.id +"' target='_blank' >" + (data||"") + "</a><div>";
	                    	}
                    	}
                    	 return html;
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	 return data?data.name:"";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	if(data && data.hasOwnProperty("name")){
                    		return data.name;
                    	}else{
                    		return "";
                    	}
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
                    	 return data?data.name:"";
                    }
                }
            ],
            "rowCallback": this.proxy(function(row, data, index){
            	$(row).find("td:first").attr("style","width:300px")
            })
        });
    	
    },
    _ajax:function(url,type,param,$container,callback){
    	$.u.ajax({
    		"url":url,
    		"type": type,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    }
}, { usehtm: true, usei18n: true });

com.audit.notice.rectificationnotice.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                                 "../../../uui/widget/spin/spin.js", 
                                                 "../../../uui/widget/jqurl/jqurl.js",
                                                 "../../../uui/widget/select2/js/select2.min.js",
                                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                 "../../../uui/widget/ajax/layoutajax.js"];
com.audit.notice.rectificationnotice.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                                  {id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                  {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];