//@ sourceURL=com.sms.workflow.editWorkflowScheme
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.workflow.editWorkflowScheme', null, {
    init: function (options) {
        this._options = options;
        
        // 工作流方案id
        this.ws_id=$.urlParam() && $.urlParam().id && parseInt($.urlParam().id);
        !this.ws_id ? window.location.href="ViewWorkflowSchemes.html" : null;
        this.workflowSchemeData=null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.workflow.editWorkflowScheme.i18n;
    	// ”添加工作流“按钮
    	this.btnAddWorkflow=this.qid("btn_addWorkflow");
    	
    	// 绑定“添加工作流”按钮事件
    	this.btnAddWorkflow.click(this.proxy(function(){
    		this.activityTypesDialog.open({data:{id:this.ws_id},title:"添加已存在工作流"});
    	}));
    	
    	// 重载分配工作流模态组件
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
                			return {scheme:this.ws_id,workflow:data.workflow,type:activityType}
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
    	
    	// 工作流方案模态层
    	this.workflowSchemeDialog=new com.sms.common.stdComponentOperate($("div[umid='workflowSchemeDialog']",this.$),{
    		"dataobject":"workflowScheme",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull},
	          {name:"description",label:this.i18n.describe,type:"textarea"}
	        ]
    	});
    	
    	// 绑定编辑方案按钮事件
    	this.qid("button-edit").click(this.proxy(function(){
    		this.workflowSchemeDialog.open({dataid:this.ws_id,title:"编辑工作流方案",afterEdit:this.proxy(function(comp,formdata){
    			this.dataTable.fnDraw();
    		})});
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
                { "title": this.i18n.safeMsgType ,"mData":"type","sWidth":"35%"},
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
            		"workflowScheme":this.ws_id,
            		"manage":true,
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
                },this.qid("datatable"), {size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
                    if (response.success) {
                    	var $unitContainer = this.qid("units");
                    	this.workflowSchemeData=response.data;
                    	this.qid("workflowSchemeName").text(response.data.name);
                    	this.qid("description").text(response.data.description);
                    	response.data.units && this.qid("unit-count").text(response.data.units.length);
                    	response.data.units && $.each(response.data.units,this.proxy(function(idx,unit){
        					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo($unitContainer);
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
                                '<p class="text-muted"><small>' + full.description + '</small></p>';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul class='list-unstyled' style='padding-left:0px;'>"];
                		full.types && $.each(full.types,function(idx,activityType){
                			if(activityType.id)
                				htmls.push("<li><img width='16' height='16' src='/sms/uui"+activityType.url+"'/>&nbsp;"+activityType.name+"<i class='fa fa-times fa-1 button-remove-entity' data-data='"+JSON.stringify(activityType)+"' style='margin-left:10px;cursor:pointer;'></i></li>");
                			else
                				htmls.push("<li><img width='16' height='16' src='/sms/uui/img/all_unassigned.png'/>&nbsp;所有未分配的信息类型</li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
	                	return "<button class='btn btn-link assign' data-data='"+JSON.stringify(full)+"'>分配</button>"+
			             	   (this.workflowSchemeData.workflows.iTotalRecords > 1 ? "<button class='btn btn-link delete' data-data='"+JSON.stringify(full)+"'>删除</button>" : "");
                    })
                }
            ]
        });
    	
    	// 工作流text模式
    	this.dataTable.on("click","button.textview",this.proxy(function(e){
    		try{
    			var data = JSON.parse($(e.currentTarget).attr("data-data"));
    			this.textViewDialog.open({id:data.wt_id,title:data.name});
    		}catch(e){
    			
    		}
    	}));
    	
    	// 工作流diagram模式
    	this.dataTable.on("click","button.diagramview",this.proxy(function(e){
    		try{
    			var data = JSON.parse($(e.currentTarget).attr("data-data"));
    			this.diagramViewDialog.open({id:data.wt_id,title:data.name});
    		}catch(e){
    			
    		}
    	}));
    	
    	// 分配类型
    	this.dataTable.on("click", "button.assign", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
        		data.id=this.ws_id;
        		this.activityTypesDialog.open({data:data,title:"指定安全信息类型到 “"+data.name+"”"});
        	}catch(e){
        		throw new Error(this.i18n.allocationFail+e.message);
        	}
    	}));
    	
    	// 删除工作流
        this.dataTable.on("click", "i.button-remove-entity", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div >"+
        				 	"<div class='alert alert-info' role='alert'><span class='glyphicon glyphicon-info-sign'></span>"+this.i18n.affirm+" <strong>"+data.name+"</strong>"+this.i18n.allocation+"</div>"+
        				 "</div>",
        			title:"删除类型分配",
        			dataobject:"workflowSchemeEntity",
        			dataobjectids:JSON.stringify([parseInt(data.entityId)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.dataTable.fnDraw();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.handleFail+e.message);
        	}
        }));
    	
    	// 删除工作流
        this.dataTable.on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div >"+
        				 	"<div class='alert alert-info' role='alert'><span class='glyphicon glyphicon-info-sign'></span>"+this.i18n.affirmA+" <strong>"+data.name+"</strong>?</div>"+
        				 "</div>",
        			title:this.i18n.delWorkflow,
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


com.sms.workflow.editWorkflowScheme.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                                '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                                '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                                "../../../uui/widget/spin/spin.js",
                                                "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.editWorkflowScheme.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];