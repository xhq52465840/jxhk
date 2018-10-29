//@ sourceURL=com.sms.plugin.audit.workflow
$.u.define('com.sms.plugin.audit.workflow', null, {
    init: function (options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
        this._exist = [];
    },
    afterrender: function (bodystr) {
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            paging: false,
            dom: "tip",
            "columns": [
                { "title": "审计工作流名称" ,"mData":"auditInfoType"},
                { "title": "安全信息类型" ,"mData":"workflowTemplate"},
                { "title": "操作","mData":"id","sWidth":150}
            ],
            "oLanguage": {
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示"+"_MENU_"+"条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从"+" _START_ "+"到"+" _END_ /"+"共"+"_TOTAL_ "+"条数据",
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
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "auditWorkflowScheme",
            		"columns": "",
            		"search": ""
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this._exist = [];
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
                    cache: false,
                    data: aoData
                },this.$).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
				{
				    "aTargets": 0,
				    "mRender": this.proxy(function (data, type, full) {
				    	if($.inArray(data.id, this._exist) < 0){
				    		this._exist.push(data.id);
				    	}
				    	return data && data.name || "";
 				    })
				},
				{
				    "aTargets": 1,
				    "mRender": this.proxy(function (data, type, full) {
				    	return data && data.name || "";
				    })
				},
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
	                	return "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>删除</button>";
                    })
                }
            ]
        });
    	this.qid("btn_add").click(this.proxy(this.on_add_click));
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeActivityType_click));
    },
    /**
     * @title 添加
     * @param e {object} 鼠标对象
     * @return void
     */
    on_add_click:function(e){
    	if(this.workflowDialog == null){
    		this._initDialog();
    	}    	
    	this.workflowDialog.open();
    },
    /**
     * @title 删除
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_removeActivityType_click:function(e){ 
		var data = JSON.parse($(e.currentTarget).attr("data"));
		$.u.load("com.sms.common.stdcomponentdelete");
		(new com.sms.common.stdcomponentdelete({
			body: "<div>"+
				 	"<p>请确认你要删除？</p>"+
				 "</div>",
			title: "删除：" + data.auditInfoType.name,
			dataobject: "auditWorkflowScheme",
			dataobjectids: JSON.stringify([parseInt(data.id)])
		})).override({
			refreshDataTable:this.proxy(function(){
				this.dataTable.fnDraw();
			})
		});
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    _initDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.workflowDialog = new com.sms.common.stdComponentOperate($("div[umid='workflowDialog']",this.$),{
    		"title":"添加",
    		"fields":[
    		  {name: "workflowName", label: "审计工作流名称", type: "select", rule:{required:true}, message:"审计工作流名称不能为空",
    			  option: {
	        		  ajax: {
	        			  data: this.proxy(function(term, page){
	        				  return {
	        					  "tokenid": $.cookie("tokenid"),
			        			  "method": "getAuditInfoType"
	        				  };
	        			  }),
        				  success: this.proxy(function(response, page){
        					  var data = $.grep(response.data, this.proxy(function(k, v){
        						  return $.inArray(k.id, this._exist) < 0;
        					  }));
        					  return {
        						  "results": data
        					  };
        				  })
	        		  }
	        	  }  
    		  },
	          {name:"activityType", label:"工作流模板", type:"select", rule:{required:true}, message:"工作流模板不能为空",
	        	  option: {
	        		  ajax: {
	        			  data: this.proxy(function(term, page){
	        				  return {
	        					  "tokenid": $.cookie("tokenid"),
			        			  "method": "getWorkflowTemplates",
			        			  "name":term
	        				  };
	        			  }),
        				  success: this.proxy(function(response, page){
        					  return {
        						  "results": response.data
        					  };
        				  })
	        		  }
	        	  }
	          }
	        ],
	        "add":this.proxy(function(comp,formdata){
	        	$.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    dataType: "json",
                    type: "post",
                    cache: false,
                    data: {
                    	"tokenid": $.cookie("tokenid"),
	        			"method": "addAuditWorkflowScheme",
	        			"auditInfoType": formdata.workflowName,
	        			"workflowTemplate": formdata.activityType
                    }
                },comp.form.parent()).done(this.proxy(function (data) {
                    if (data.success) {
                    	comp.formDialog.dialog("close");
                    	this.dataTable.fnDraw();
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
	        })
    	});
    	this.workflowDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.plugin.audit.workflow.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                               '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.plugin.audit.workflow.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];