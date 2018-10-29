//@ sourceURL=com.sms.workflow.diagramView
$.u.define('com.sms.workflow.diagramView', null, {
    init: function (options) {
        this._options = options;
        this.id=null;
        this.type = null; // 参数类型wt_id查询还是wi_id
    },
    afterrender: function (bodystr) {
    	this.diagramViewDialog = $(".diagramview",this.$).dialog({
    		modal:true,
    		width:810,
    		resizable:false,
    		draggable: false,
    		autoOpen:false,
    		position:['center',50],
    		open:this.proxy(this.viewWorkflow),
    		buttons:[{
    			'text':com.sms.workflow.diagramView.i18n.close,
    			'class':'aui-button-link',
    			'click':this.proxy(function(){
    				this.diagramViewDialog.dialog("close");
    			})
    		}]
    	});
    },
    /**
     * 打开模态层
     * @param params {id:"",title:"",type:""} type为参数类型，"inst"为wi_id其它则为wt_id
     */
    open:function(params){
    	this.id=params.id;
    	this.type = params.type;
    	this.diagramViewDialog.dialog("option","title",params.title).dialog("open");
    },
    /**
     * 查看流程图
     * @param e
     */
    viewWorkflow:function(e){
    	var param = {
    		"sv":"List",
    		"user_id":$.cookie("userid"),
    		"tokenid":$.cookie("tokenid"),
    		"with_data":"Y"
    	};
    	if(this.type == "inst"){	// 工作流实例编号查询
    		param.wi_id = this.id;
    	}else{	// 模板编号查询
    		param.where = "wt_id="+this.id;
    	}
    	$.u.ajax({
            url: $.u.config.constant.workflowserver,
            dataType: "json",
            cache: false,
            data: param,
            jsonpCallback:"workflow"
        },this.diagramViewDialog.parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
            if(response.success !== false){
                if (response.responseHeader.status == 0) {
                	if(response.responseData.total == 1){
                		var workflowData=response.responseData.list[0];
                		if(this.type == "inst"){	// wi_id参数时title采用工作流的名称
                			this.diagramViewDialog.dialog("option","title",workflowData.name);
                		}
                		this.qid("graph").empty().myflow({
                    	    basePath: "",
                            _id:this._id,
                            edit:false,
                            currentNodeId:response.responseData.current_state,
                            width:720,
                            height:650,
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

        }));
    },
    destroy: function () {
    	this.diagramViewDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.diagramView.widgetjs = ['../../../uui/widget/workflow/raphael-min.js',
                                         '../../../uui/widget/workflow/myflow.js',
                                         '../../../uui/widget/workflow/myflow.jpdl4.js',
                                         '../../../uui/widget/workflow/myflow.editors.js',
                                         "../../../uui/widget/spin/spin.js",
                                         "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                         "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.diagramView.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];