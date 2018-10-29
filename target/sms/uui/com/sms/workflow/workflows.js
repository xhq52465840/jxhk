//@ sourceURL=com.sms.workflow.workflows
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.workflow.workflows', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.workflow.workflows.i18n;
    	// ”添加工作流“按钮
    	this.btnAddWorkflow=this.qid("btn_addWorkflow");
    	
    	// 绑定“添加工作流”按钮事件
    	this.btnAddWorkflow.click(this.proxy(function(){
    		this.workflowDialog.open();
    	}));
    	
    	// “工作流模态层”组件
    	this.workflowDialog = new com.sms.common.stdComponentOperate($("div[umid='workflowDialog']",this.$),{
    		"title":this.i18n.addworkflow,
    		"dataobject":"workflow",
    		"fields":[
    		  {name:"user_id",type:"hidden",value:$.cookie("userid")},
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,description:this.i18n.nameDesc,maxlength:50},
	          {name:"description",label:this.i18n.describe,type:"textarea",maxlength:255}
	        ],
	        "add":this.proxy(function(comp,formdata){
	        	comp.disableForm();
	        	$.u.ajax({
            		url:$.u.config.constant.workflowserver,
            		data:$.extend({},formdata,{
            			"sv":"Save",
            			"user_id":$.cookie("userid"),
        	    		"tokenid":$.cookie("tokenid")
            		}),
            		type:"post",
            		dataType:"json"
            	},comp.formDialog.parent(),{ size: 1,backgroundColor:'#fff', selector: comp.formDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
            		if(response.success !== false){
                        if(response.responseHeader.status == 0){
                			window.location.href="WorkflowDesign.html?id="+response.responseData.id;
                		}else{
                			$.u.alert.error(response.responseHeader.msg);
                		}
                    }
            	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
            		
            	}));
	        })
    	});
    	
    	// 重写“工作流模态层”组件的函数
    	this.workflowDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.validDataTable.fnDraw();
    			this.invalidDataTable.fnDraw();
    		})
    	});
    	
    	this.validDataTable = this.qid("validdatatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.lastModify ,"mData":"wsd_id","sWidth":"20%"},
                { "title": this.i18n.relateCase ,"mData":"wsd_id","sWidth":"30%"},
                { "title": this.i18n.handle ,"mData":"wsd_id","sWidth":150}
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
            		"sv":"List",
            		"user_id": $.cookie("userid"),
    	    		"tokenid": $.cookie("tokenid"),
                    "page_number": 1,
                    "page_size": 10000,
            		"columns": "",//JSON.stringify(aoData.columns),
            		"search": "",//JSON.stringify(aoData.search),
            		"order": "last_update",
            		"test": "test"
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.workflowserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("validdatatable"), {size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
                    if(response.success !== false){
                        if (response.responseHeader.status == 0) {
                        	response.responseData.list = $.grep(response.responseData.list,function(item,idx){
                        		return item.release_user && $.isArray(item.Scheme) && item.Scheme.length > 0;
                        	});
                            fnCallBack({aaData:response.responseData.list});
                            
                            
                            this.invalidDataTable = this.qid("invaliddatatable").dataTable({
                                searching: false,
                                serverSide: true,
                                bProcessing: true,
                                ordering: false,
                                pageLength:1000,
                                "sDom":"",
                                "columns": [
                                    { "title": this.i18n.name ,"mData":"name"},
                                    { "title": this.i18n.lastModify ,"mData":"wsd_id","sWidth":"20%"},
                                    { "title": this.i18n.relateCase ,"mData":"wsd_id","sWidth":"30%"},
                                    { "title": this.i18n.handle ,"mData":"wsd_id","sWidth":150}
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
                                		"sv":"List",
                                		"user_id":$.cookie("userid"),
                        	    		"tokenid":$.cookie("tokenid"),
                                        "page_number": 1,
                                        "page_size": 10000,
                                		"columns":"",//JSON.stringify(aoData.columns),
                                		"search":"",//JSON.stringify(aoData.search),
                                		"order":"last_update"
                                	},true);
                                }),
                                "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                                	$.u.ajax({
                                        url: $.u.config.constant.workflowserver,
                                        type:"post",
                                        dataType: "json",
                                        cache: false,
                                        data: aoData
                                    },this.qid("invaliddatatable"), {size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
                                        if(response.success !== false){
                                            if (response.responseHeader.status == 0) {
                                            	response.responseData.list = $.grep(response.responseData.list,function(item,idx){
                                            		return !item.release_user || !$.isArray(item.Scheme) || ($.isArray(item.Scheme && item.Scheme.length == 0));
                                            	});
                                                fnCallBack({aaData:response.responseData.list});
                                            }else{
                                            	$.u.alert.error(response.responseHeader.msg);
                                            }
                                        }
                                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                                    }));
                                }),
                                "aoColumnDefs": [
                                    {
                                        "aTargets": 0,
                                        "mRender": function (data, type, full) {
                                        	return '<strong>' + full.name + '</strong>' + (full.dft=="Y" ? " (只读的系统工作流)<span class='label label-default'>默认</span>" : "")+
                                            	   '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                                        }
                                    },
                                    {
                                        "aTargets": 1,
                                        "mRender": function (data, type, full) {
                                            return '<strong>' + full.last_update + '</strong><p>'+(full.modify_by||'')+'</p>';
                                        }
                                    },
                                    {
                                        "aTargets": 2,
                                        "mRender": this.proxy(function (data, type, full) {
                                        	var htmls=["<ul style='padding-left:15px;'>"];
                                        	if(full.Scheme && $.isArray(full.Scheme)){
    	                                		$.each(full.Scheme, this.proxy(function(idx, scheme){
                                        			htmls.push("<li><a href='EditWorkflowScheme.html?id="+scheme.id+"&name="+scheme.name+"'>"+scheme.name+"</a></li>");
                                        		}));
                                        	}else{
                                        		full.Scheme &&full.Scheme[data]&& $.each(full.Scheme[data],function(idx,scheme){
    	                                			htmls.push("<li><a href='EditWorkflowScheme.html?id="+scheme.id+"&name="+scheme.name+"'>"+scheme.name+"</a></li>");
    	                                		});
                                        	}
                                    		htmls.push("</ul>");
                                            return htmls.join("");
                                        })
                                    },
                                    {
                                        "aTargets": 3,
                                        "mRender": function (data, type, full) {
                    	                	return "<a class='btn btn-link edit' href='WorkflowDesign.html?id=" + full.wsd_id + "' data-data='"+JSON.stringify(full)+"'>编辑</a>"+
                    			             	   "<button class='btn btn-link copy' data-data='"+JSON.stringify(full)+"'>复制</button>"+
                    			             	   (full.dft != "Y" ? "<button class='btn btn-link delete'  data-data='"+JSON.stringify(full)+"'>删除</button>" : "");
                                        }
                                    }
                                ]
                            });
                            
                            // 复制工作流
                        	this.validDataTable.add(this.invalidDataTable).on("click", "button.copy", this.proxy(function (e) {
                            	e.preventDefault();
                            	try{
                            		var data = JSON.parse($(e.currentTarget).attr("data-data"));
                            		this.workflowDialog.open({
                            			title:"复制工作流："+data.name,
                            			data:{name:data.name+" 副本",description:data.description},
                            			edit:this.proxy(function(comp,formdata){
                            				comp.disableForm();
                            				$.u.ajax({
                                        		url:$.u.config.constant.workflowserver,
                                        		data:$.extend({},formdata,{
                                        			"sv":"Copy",
                                        			"wsd_id":data.wsd_id,
                                    	    		"tokenid":$.cookie("tokenid")                                    			
                                        		}),
                                        		type:"post",
                                        		dataType:"json"
                                        	},comp.formDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: comp.formDialog.parent().find(".ui-dialog-buttonpane button:first"), orient: "west" }).done(this.proxy(function(response){
                                        		if(response.success !== false){
                                                    if(response.responseHeader.status == 0){
                                            			window.location.href="WorkflowDesign.html?id="+response.responseData.new_id;
                                            		}else{
                                            			$.u.alert.error(response.responseHeader.msg);
                                            		}
                                                }
                                        	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                                        		
                                        	}));
                            			})
                            		});
                            	}catch(e){
                            		throw new Error(this.i18n.copyFail+e.message);
                            	}
                        	}));
                        	
                        	// 删除工作流
                        	this.invalidDataTable.on("click", "button.delete", this.proxy(function (e) {
                            	e.preventDefault();
                            	try{
                            		var data = JSON.parse($(e.currentTarget).attr("data-data"));
                            		
                            		var deleteDialog = $("<div>确认删除工作流 <strong>" + data.name + "<strong>?</div>").dialog({
                            			title: "删除提示",
                            			modal: true,
                            			resizable: false,
                            			draggable: false,
                            			width: 520,
                            			buttons: [
                            			    {
                            			    	text: "确定",
                            			    	click: this.proxy(function(){
                            			    		$.u.ajax({
                                                        url: $.u.config.constant.workflowserver,
                                                        type:"post",
                                                        dataType: "json",
                                                        data:{
                                                        	"user_id":$.cookie("userid"),
                                            	    		"tokenid":$.cookie("tokenid"),
                                                        	"sv":"Delete",
                                                        	"wsd_id":data.wsd_id
                                                        }
                                                    },deleteDialog.parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
                                                        if(response.success !== false){
                                                            if (response.responseHeader.status == 0) {
                                                            	deleteDialog.dialog("close");
                                                            	this.invalidDataTable.fnDraw();
                                                            }else{
                                                            	$.u.alert.error(response.responseHeader.msg);
                                                            }
                                                        }
                                                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                                                    }));
                            			    	})                        			    	
                            			    },
                            			    {
                            			    	text: "取消",
                            			    	"class": "aui-button-link",
                            			    	click: this.proxy(function(){
                            			    		deleteDialog.dialog("close");
                            			    	})
                            			    }
                            			],
                            			close: this.proxy(function(){
                            				deleteDialog.dialog("destroy").remove();
                            			})
                            		});
                            	}catch(e){
                            		throw new Error(this.i18n.delFail+e.message);
                            	}
                            }));
                        }else{
                        	$.u.alert.error(response.responseHeader.msg);
                        }
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                        return '<strong>' + full.name + '</strong> ' + (full.dft=="Y" ? " (只读的系统工作流)<span class='label label-default'>默认</span>" : "")+
                                '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                        return '<strong>' + full.last_update + '</strong><p>'+(full.modify_by||'')+'</p>';
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		if(full.Scheme && $.isArray(full.Scheme)){
                    		$.each(full.Scheme, this.proxy(function(idx, scheme){
                    			htmls.push("<li><a href='EditWorkflowScheme.html?id="+scheme.id+"&name="+scheme.name+"'>"+scheme.name+"</a></li>");
                    		}));
                    	}else{
                    		full.Scheme &&full.Scheme[data]&& $.each(full.Scheme[data],function(idx,scheme){
                    			htmls.push("<li><a href='EditWorkflowScheme.html?id="+scheme.id+"&name="+scheme.name+"'>"+scheme.name+"</a></li>");
                    		});
                    	}
                		htmls.push("</ul>");
                        return htmls.join("");
                    })
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
	                	return "<a class='btn btn-link view' href='WorkflowDesign.html?id=" + full.wsd_id + "&mode=view' data-data='"+JSON.stringify(full)+"'>"+com.sms.workflow.workflows.i18n.look+"</a>"+
	                		  (full.dft != "Y" ? "<a class='btn btn-link edit' href='WorkflowDesign.html?id=" + full.wsd_id + "' data-data='"+JSON.stringify(full)+"'>"+com.sms.workflow.workflows.i18n.edit+"</a>" : "")+
			             	   "<button class='btn btn-link copy' data-data='"+JSON.stringify(full)+"'>"+com.sms.workflow.workflows.i18n.copy+"</button>";
                    }
                }
            ]
        });
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.workflows.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                       '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                       "../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.workflows.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];