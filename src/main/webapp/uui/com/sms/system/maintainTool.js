//@ sourceURL=com.sms.system.maintainTool
$.u.define('com.sms.system.maintainTool', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.maintainTool.i18n;
    	this.vehicleInfoDialog = null;
    	this.btnAddMaintainTool = this.qid("btn_addMaintainTool");
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            dom: "tip",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.handle,"mData":"id","sWidth":150}
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+"_MENU_"+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+"_TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": ""+this.i18n.back+"",
                    "sNext": ""+this.i18n.next+"",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"maintainTool",
            		"columns":JSON.stringify(aoData.columns),
            		"search":JSON.stringify(aoData.search),
            		"rule": JSON.stringify([[{"key":"name","op":"like","value":this.qid("name").val()}]])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.system.maintainTool.i18n.editing+"</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.system.maintainTool.i18n.remove+"</button>";
                    }
                }
            ]
        });

    	this.btnAddMaintainTool.click(this.proxy(this.on_addMaintainTool_click));
    	this.qid("btn_filter").click(this.proxy(this.on_filter_click));
    	this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editMaintainTool_click));
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeMaintainTool_click));
    	
    },
    /**
     * @title 搜索
     * @return void
     */
    on_filter_click: function(e){
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 重置
     * @return void
     */
    on_reset_click: function(e){
    	this.qid("name").val("");
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 添加位置
     * @param e {object} 鼠标对象
     * @return void
     */
    on_addMaintainTool_click:function(e){
    	if(this.maintainToolDialog == null){
    		this._initMaintainToolDialog();
    	}    	
    	this.maintainToolDialog.open();
    },
    /**
     * @title 编辑位置
     * @param e {object} 鼠标对象
     * @return void
     */
    on_editMaintainTool_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		if(this.maintainToolDialog == null){
        		this._initMaintainToolDialog();
        	} 
    		this.maintainToolDialog.open({"data":data,"title":""+this.i18n.editMaintainTool+"："+data.name});
    	}catch(e){
    		throw new Error(""+this.i18n.editFail+"："+e.message);
    	}
    },
    /**
     * @title 删除位置
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_removeMaintainTool_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>"+this.i18n.choose+"</p>"+
    				 	"<p><span class='text-danger'>"+this.i18n.notice+"</span></p>"+
    				 "</div>",
    			title:""+this.i18n.removeMaintainTool+"："+data.name,
    			dataobject:"maintainTool",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
    	}catch(e){
    		throw new Error(""+this.i18n.removeFail+"："+e.message);
    	}
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    _initMaintainToolDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.maintainToolDialog = new com.sms.common.stdComponentOperate($("div[umid='maintainToolDialog']",this.$),{
    		"title":com.sms.system.maintainTool.i18n.addMaintainTool,
    		"dataobject":"maintainTool",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull}
	        ]
    	});
    	this.maintainToolDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.maintainTool.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.system.maintainTool.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];