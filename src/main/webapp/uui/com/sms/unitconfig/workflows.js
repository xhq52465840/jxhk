//@ sourceURL=com.sms.unitconfig.workflows
$.u.define('com.sms.unitconfig.workflows', null, {
    init: function (options) {
        this._options = options;
        this.unit_id = $.urlParam().id ? parseInt($.urlParam().id) : null;
        this.workflowSchemeData=null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unitconfig.workflows.i18n;

    	// 增加工作流
    	this.qid("button-add-workflow").click(this.proxy(function(){
    		if(!this.activityTypesDialog){
    			var clz = $.u.load("com.sms.workflow.assignActivityWorkflow");
    			this.activityTypesDialog = new clz(this.$.find("div[umid=activityTypesDialog]"));
    	    	this.activityTypesDialog.override({
    	    		save:this.proxy(function(data){
    	    			$.ajax({
    	                    url: $.u.config.constant.smsmodifyserver,
    	                    dataType: "json",
    	                    cache: false,
    	                    data: {
    	                    	"tokenid":$.cookie("tokenid"),
    	                		"method":"stdcomponent.addall",
    	                		"dataobject":"workflowSchemeEntity",
    	                		"objs":JSON.stringify($.map(data.activityTypes,this.proxy(function(activityType,idx){
    	                			return {scheme:this.workflowSchemeData.id,workflow:data.workflow,type:activityType}
    	                		})))
    	                    }
    	                }).done(this.proxy(function (response) {
    	                    if (response.success) {
    	                    	this.activityTypesDialog.close();
    	                    	this.dataTable.fnDraw();
    	                    }
    	                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

    	                }));
    	    		})
    	    	});
    		}
    		this.activityTypesDialog.open({data:{id:this.workflowSchemeData.id,unit:this.unit_id},title:"添加已存在工作流"});
    	}));
    	
    	// 切换不同的方案
    	this.qid("button-change-scheme").click(this.proxy(function(){
    		if(!this.changeWorkflowScheme){
    			$.u.load("com.sms.common.stdComponentOperate");
	        	this.changeWorkflowScheme = new com.sms.common.stdComponentOperate($("div[umid='changeWorkflowScheme']",this.$),{
	        		title:this.i18n.label1,
	        		dataobject:"unitConfig",
	        		fields:[{name:"workflowScheme",label:this.i18n.scheme,dataType:"int",type:"select",rule:{required:true},message:this.i18n.schemeNotNull,option:{
	        			params:{"dataobject":"workflowScheme"},
	        			ajax:{
	        				"data":function(term,page){
	        					return {
	        						"tokenid":$.cookie("tokenid"),
	    	        				"method":"stdcomponent.getbysearch",
	        						"dataobject":"workflowScheme",
	        						"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
	        					};
	        				}
	        			}
	        		}}]
	        	});
    		}
    		this.changeWorkflowScheme.open({
    			data:{
    				"id":this.workflowSchemeData.config,
    				"workflowScheme":this.workflowSchemeData.id
    			},
        		title:com.sms.unitconfig.workflows.i18n.label1,
        		afterEdit:this.proxy(function(com,formdata){
        			window.location.reload();
        		})
    		});
    	}));
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.workflow ,"mData":"name"},
                { "title": this.i18n.msgType ,"mData":"type","sWidth":"35%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":150}
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"getworkflowschemeentities",
            		"unit":this.unit_id,
            		"columns":JSON.stringify(aoData.columns),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable").parent()).done(this.proxy(function (response) {
                    if (response.success) {
                    	var $unitContainer=this.qid("units");
                    	this.workflowSchemeData = response.data;
                    	this.qid("unit-config-workflow-scheme-name").text(response.data.name);
                    	//this.qid("description").text(response.data.description);
                    	this.qid("unit-count").text(this.workflowSchemeData.units.length);
                    	if(!this.workflowSchemeData.admin || this.workflowSchemeData.units.length > 1){
                    		this.qid("button-add-workflow").remove();
                    	}
                    	$unitContainer.empty();
                    	$.each(this.workflowSchemeData.units, this.proxy(function(idx, unit){
        					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="Summary.html?id='+unit.id+'" title="'+unit.name+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo($unitContainer);
        				}));
                        fnCallBack(response.data.workflows);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
                        return '<strong>' + full.name + "</strong>&nbsp;<button class='btn btn-link btn-sm textview' data-data='"+JSON.stringify(full)+"'>" + this.i18n.textView + "</button>&nbsp;<button class='btn btn-link btn-sm diagramview' data-data='"+JSON.stringify(full)+"'>" + this.i18n.diagramView + "</button>" +
                                '<p class="text-muted"><small>' + (full.description || "") + '</small></p>';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": this.proxy(function (data, type, full) {
                		var htmls=["<ul class='list-unstyled' style='padding-left:15px;'>"];
                		full.types && $.each(full.types,function(idx,activityType){
            				htmls.push("<li><img width='16' height='16' src='/sms/uui"+activityType.url+"'/>&nbsp;"+activityType.name+"</li>");
            			});
                		this.workflowSchemeData.admin && this.workflowSchemeData.units.length == 1 && htmls.push("<li>(<button class='btn btn-link assign' style='padding:0;' data-data='"+JSON.stringify(full)+"'>分配</button>)</li>");
                		htmls.push("</ul>");
                        return htmls.join("");
                    })
                },
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
	                	return this.workflowSchemeData.admin && this.workflowSchemeData.units.length == 1 && this.workflowSchemeData.workflows.iTotalRecords > 1 ? "<button class='btn btn-link delete' data-data='"+JSON.stringify(full)+"'>删除</button>" : "";
                    })
                }
            ]
        });
    	
    	// 工作流text模式
    	this.dataTable.on("click","button.textview",this.proxy(function(e){
    		try{
    			var data = JSON.parse($(e.currentTarget).attr("data-data"));
    			if(!this.textViewDialog){
    				var clz = $.u.load("com.sms.workflow.textView");
    				this.textViewDialog = new clz(this.$.find("div[umid=textViewDialog]"));
    			}
    			this.textViewDialog.open({id:data.wt_id,title:data.name});
    		}catch(e){
    			
    		}
    	}));
    	
    	// 工作流diagram模式
    	this.dataTable.on("click","button.diagramview",this.proxy(function(e){
    		try{
    			var data = JSON.parse($(e.currentTarget).attr("data-data"));
    			if(!this.diagramViewDialog){
    				var clz = $.u.load("com.sms.workflow.diagramView");
    				this.diagramViewDialog = new clz(this.$.find("div[umid=diagramViewDialog]"));
    			}
    			this.diagramViewDialog.open({id:data.wt_id,title:data.name});
    		}catch(e){
    			
    		}
    	}));
    	
    	// 分配类型
    	this.dataTable.on("click", "button.assign", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
                if(!this.activityTypesDialog){
                    var clz = $.u.load("com.sms.workflow.assignActivityWorkflow");
                    this.activityTypesDialog = new clz(this.$.find("div[umid=activityTypesDialog]"));
                    this.activityTypesDialog.override({
                        save:this.proxy(function(data){
                            $.ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                dataType: "json",
                                cache: false,
                                data: {
                                    "tokenid":$.cookie("tokenid"),
                                    "method":"stdcomponent.addall",
                                    "dataobject":"workflowSchemeEntity",
                                    "objs":JSON.stringify($.map(data.activityTypes,this.proxy(function(activityType,idx){
                                        return {scheme:this.workflowSchemeData.id,workflow:data.workflow,type:activityType}
                                    })))
                                }
                            }).done(this.proxy(function (response) {
                                if (response.success) {
                                    this.activityTypesDialog.close();
                                    this.dataTable.fnDraw();
                                }
                            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                            }));
                        })
                    });
                }
        		this.activityTypesDialog.open({data:$.extend({},data,{id:this.workflowSchemeData.id,unit:this.unit_id}),title:"指定信息类型到 “"+data.name+"”"});
        	}catch(e){
        		throw new Error(this.i18n.allocationFail+e.message);
        	}
    	}));
    	
    	// 删除工作流
        this.dataTable.on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
        		$.u.load('com.sms.common.stdcomponentdelete');
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div >"+
        				 	"<div class='alert alert-info' role='alert'><span class='glyphicon glyphicon-info-sign'></span>"+this.i18n.affirmDel+" <strong>"+data.name+"</strong>?</div>"+
        				 "</div>",
        			title:this.i18n.delCase,
        			dataobject:"workflowSchemeEntity",
        			dataobjectids:JSON.stringify($.map(data.types,function(item,idx){
        				return item.entityId;
        			}))
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.dataTable.fnDraw();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.delFail+e.message);
        	}
        }));
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.workflows.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                         '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                         '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                         "../../../uui/widget/spin/spin.js",
                                         "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                         "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.workflows.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];