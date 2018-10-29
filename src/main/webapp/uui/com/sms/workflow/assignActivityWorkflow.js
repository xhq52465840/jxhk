//@ sourceURL=com.sms.workflow.assignActivityWorkflow
$.u.define('com.sms.workflow.assignActivityWorkflow', null, {
    init: function (options) {
        this._options = options;
        this.data=null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.workflow.assignActivityWorkflow.i18n;
    	this.maxDialogWidth = $(document).width() * 0.8 > 1024 ? 1024 : $(document).width() * 0.8;
    	// 工作流程表格
    	this.workflowsTable=this.qid("workflows-table");
    	
    	// 安全信息类型表格
    	this.activityTypesTable=this.qid("activity-types-table");
    	
    	// 选中工作流程 名称
    	this.workflowName=this.qid("workflow-name");
    	
    	// 选中工作流程描述
    	this.workflowDesc = this.qid("workflow-desc")
    	
    	// 选中工作流程最后修改信息
    	this.workflowLastUpdate=this.qid("workflow-lastupdate");
    	
    	// 流程图画布
    	this.workflowGraph=this.qid("workflow-graph");
    	
    	// 工作流程列表行点击事件
    	this.workflowsTable.on("click","tbody tr",this.proxy(function(e){
    		var $tr = $(e.currentTarget);
    		this.workflowsTable.find("tr.selected").removeClass("selected");
    		$tr.addClass("selected");
    		this.viewWorkFlowGraph($tr.attr("wt_id"));
    	}));
    	
    	// 表头全选复选框事件
    	this.activityTypesTable.find("thead :checkbox").click(this.proxy(function(e){ console.log("checkbox click...");
    		this.activityTypesTable.find("tbody :checkbox").prop("checked",$(e.currentTarget).is(":checked"));
    		this.controlButtonState();
    	}));
    	
    	// 表格行点击事件
    	this.activityTypesTable.on("click","tbody tr",this.proxy(function(e){ 
			var $this=$(e.currentTarget),$checkbox=$this.find(":checkbox");
    		if(!$(e.target).is(":checkbox")){
	    		$checkbox.prop("checked",!$checkbox.is(":checked"));
    		}
    		this.controlButtonState();
    	}));
    	
    	this.activityTypesDialog=this.qid("activitytyps-dialog").dialog({
    		modal:true,
    		resizable:false,
    		draggable: false,
    		autoOpen:false,
    		buttons:[
			 {
				text:this.i18n.back,
				"class":"step-first",
				click:this.proxy(function(){
	    			this.loadActivityTypes();
					this.activityTypesDialog.parent().find(".step-first,.step-second").toggleClass("hidden");
					this.activityTypesDialog.dialog("option",{width:440,height:400});
				})
			 },
	         {
	        	text:this.i18n.backTo,
	        	"class":"step-second back hidden",
	        	click:this.proxy(function(){
					this.activityTypesDialog.parent().find(".step-first,.step-second").toggleClass("hidden");
					this.activityTypesDialog.dialog("option",{width:this.maxDialogWidth,height:768});
	        	})
	         },
	         {
	        	text:this.i18n.finish,
	        	"class":"step-second done hidden",
	        	click:this.proxy(function(){
	        		var data = {
	        			workflow:this.data && this.data.wt_id ? this.data.wt_id+"" : this.workflowsTable.find("tr.selected").attr("wt_id"),
	        			activityTypes:$.map(this.activityTypesTable.find("tbody :checkbox[name='activity-types']:checked"),function(obj,idx){
	        				return parseInt($(obj).attr("data-id"));
	        			})
	        		};
	        		this.save(data);
	        	})
	         },
	         {
	        	 text:this.i18n.cancel,
	        	 "class":"aui-button-link",
	        	 click:this.proxy(function(){
	        		 this.activityTypesDialog.dialog("close");
	        	 })
	         }
            ],
    		open:this.proxy(function(){
    			if(this.data && this.data.wt_id){
    				this.activityTypesDialog.parent().find("button.step-first").trigger("click");
    				this.activityTypesDialog.parent().find("button.step-second.back").addClass("hidden");
                }else{
                	this.loadWorkflows();
                }
    			this.controlButtonState();
    		}),
    		close:this.proxy(function(){
    			this.activityTypesTable.add(this.workflowsTable).find("tbody").empty();
    		})
    	});
    },
    /*
     * 控制“完成”按钮的状态
     */
    controlButtonState:function(){
    	var $button = this.activityTypesDialog.parent().find(".ui-dialog-buttonpane button.done");
    	if(this.activityTypesTable.find("tbody :checkbox:checked").length > 0)
    		$button.button("enable");
    	else
    		$button.button("disable");
    },
    /**
     * @title 加载工作流程列表
     */
    loadWorkflows:function(){
    	this.activityTypesDialog.parent().find(".ui-dialog-buttonpane button.step-first").button("disable");
    	$.u.ajax({
            url: $.u.config.constant.workflowserver,
            dataType: "json",
            cache: false,
            data: {
	    		"sv":"List",
	    		"user_id":$.cookie("userid"),
	    		"tokenid":$.cookie("tokenid")
	    	}
        },this.workflowsTable, {size:2, backgroundColor:'#fff'}).done(this.proxy(function (response) {
            if(response.success !== false){
                if (response.responseHeader.status == 0) {
                	var $tbody = this.workflowsTable.children("tbody");
                    $.each(response.responseData.list,this.proxy(function(idx,wf){
                    	if(wf.wt_id){
                        	$("<tr wt_id='"+wf.wt_id+"'><td>"+wf.name+"</td></tr>").appendTo($tbody);
                    	}
                    }));
                    this.workflowsTable.find("tbody tr:eq(0)").trigger("click");
                }else{
                	$.u.alert.error(response.responseHeader.msg);
                }
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    /*
     * @title 查看流程图
     * @param {int} wt_id 工作流模板ID(发布后)
     */
    viewWorkFlowGraph:function(wt_id){
    	this.activityTypesDialog.parent().find(".ui-dialog-buttonpane button.step-first").button("disable");
    	$.u.ajax({
            url: $.u.config.constant.workflowserver,
            dataType: "json",
            cache: false,
            data: {
	    		"sv":"List",
	    		"tokenid":$.cookie("tokenid"),
	    		"user_id":$.cookie("userid"),
	    		"where":"wt_id="+wt_id,
	    		"with_data":"Y"
	    	},
            jsonpCallback:"workflow"
        },this.workflowGraph.parent(), {size:2, backgroundColor:'#fff'}).done(this.proxy(function (response) {
            if(response.success !== false){
                if (response.responseHeader.status == 0) {
                	this.activityTypesDialog.parent().find(".ui-dialog-buttonpane button.step-first").button("enable");
                	if(response.responseData.total == 1){
                		var workflowData=response.responseData.list[0];
                		this.workflowName.html(workflowData.name||"&nbsp;");
                		this.workflowDesc.html(workflowData.description||"&nbsp;");
                		this.workflowLastUpdate.html(workflowData.last_update||"&nbsp;");
                		this.workflowGraph.empty().myflow({
                    	    basePath: "",
                            _id:this._id,
                            editable:false,
                            width:720,
                            height:550,
                            props:{
                                attr:{top:10, right:30},
                                props:{attributes:{}}
                            },
                            restore:workflowData.data && JSON.parse(workflowData.data)
                		});
                	}
                }else{
                	$.u.alert.error(response.responseHeader.msg);
                }
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        	
        }));
    },
    /*
     * 加载安全信息类型列表
     */
    loadActivityTypes:function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
	    		"tokenid":$.cookie("tokenid"),
	    		"method":"getdistributableentities",
	    		"workflowScheme":this.data.id,
	    		"unit":this.data.unit,
	    		"workflow":this.data.wt_id ? this.data.wt_id+"" :  this.workflowsTable.find("tr.selected").attr("wt_id")
	    	}
        },this.activityTypesTable, {size:2, backgroundColor:'#fff'}).done(this.proxy(function (response) {
            if (response.success) {
            	var $tbody = this.activityTypesTable.children("tbody").empty();
                $.each(response.data,this.proxy(function(idx,activityType){
                	$("<tr><td><input type='checkbox' data-id='"+activityType.id+"' name='activity-types'/></td><td><img width='16' height='16' src='/sms/uui"+(activityType.url||"/img/all_unassigned.png")+"'/>&nbsp;"+(activityType.name||"所有未分配的信息类型")+"</td><td>"+(activityType.workflow ? activityType.workflow.name||'' : '')+"</td></tr>").appendTo($tbody);
                }));
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));
    },
    /**
     * @title 打开
     * @param params {wt_id:"",title:""}
     */
    open:function(params){
    	var option = {title:params.title};
    	this.data=params.data;
    	if(this.data.workflow){ // 分配
    		this.activityTypesDialog.parent().find(".step-second").removeClass("hidden");
    		this.activityTypesDialog.parent().find(".step-first,.back").addClass("hidden");
    		$.extend(option,{width:440,height:400});
    	}else{ // 添加已有工作流
    		this.activityTypesDialog.parent().find(".step-first").removeClass("hidden");
    		this.activityTypesDialog.parent().find(".step-second").addClass("hidden");
    		$.extend(option,{width:this.maxDialogWidth,height:768});
    	}
    	this.activityTypesDialog.dialog("option",option).dialog("open");
    },
    /**
     * @ttile 关闭
     */
    close:function(){
    	this.activityTypesDialog.dialog("close");
    },
    destroy: function () {
        this._super();
    },
    /**
     * @title 保存
     * @param data {wt_id:"",activityTypes:[]}
     */
    save:function(data){
    	throw new Error("没有重载com.sms.workflow.assignActivityWorkflow的事件");
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.assignActivityWorkflow.widgetjs = ['../../../uui/widget/jqblockui/jquery.blockUI.js',
                                                    '../../../uui/widget/workflow/raphael-min.js',
                                                    '../../../uui/widget/workflow/myflow.js',
                                                    '../../../uui/widget/workflow/myflow.jpdl4.js',
                                                    '../../../uui/widget/workflow/myflow.editors.js',
                                                    "../../../uui/widget/spin/spin.js",
                                                    "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                    "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.assignActivityWorkflow.widgetcss = [];