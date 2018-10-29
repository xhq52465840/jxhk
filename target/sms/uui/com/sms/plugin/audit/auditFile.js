//@ sourceURL=com.sms.plugin.audit.auditFile
$.u.define('com.sms.plugin.audit.auditFile', null, {
    init: function (options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.plugin.audit.auditFile.i18n;
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            paging: false,
            dom: "",
            "columns": [
                { "title": this.i18n.columns.activityType ,"mData":"directory", "sWidth": "40%"},
                { "title": this.i18n.columns.fileTypeName ,"mData":"fileType.comment", "sWidth": "40%"},
                { "title": this.i18n.columns.handle,"mData":"id","sWidth":"20%"}
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
            "fnServerParams": this.proxy(function () {
            	
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
                    cache: false,
                    data: {
                    	"tokenid": $.cookie("tokenid"),
                		"method": "stdcomponent.getbysearch",
                		"dataobject": "fileTypeDirectoryMapping"
                    }
                }, this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                    	fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "rowCallback": function( row, data, index ) {
                $(row).data("data", data);
            },
            "aoColumnDefs": [
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
	                	return "<button class='btn btn-link edit' >" + this.i18n.buttons.edit + "</button>" +
                               "<button class='btn btn-link delete'>" + this.i18n.buttons.remove + "</button>";
                    })
                }
            ]
        });

    	this.qid("btn_addActivityType").click(this.proxy(this.on_addActivityType_click));
    	this.qid("btn_filter").click(this.proxy(this.on_filter_click));
    	this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
        this.dataTable.off("click", "button.setdefault").on("click", "button.setdefault", this.proxy(this.on_setDefault_click));
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeActivityType_click));
        this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editActivityType_click));
    	this.deleteData=this.qid("deleteData");
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
    	this.qid("activityTypeName").val("");
        this.qid("fileTypeName").val("");
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 添加安全信息类型
     * @param e {object} 鼠标对象
     * @return void
     */
    on_addActivityType_click:function(e){
    	if(this.activityTypeDialog == null){
    		this._initActivityTypeDialog();
    	};
    	this.activityTypeDialog.override({
            "fresh": this.proxy(function(fileOption) {
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.add",
                        dataobject:"fileTypeDirectoryMapping",
                        obj: JSON.stringify(fileOption)
                    },
                    dataType: "json"
                }, this.activityTypeDialog.formDialog.parent()).done(this.proxy(function(response) {
                    if (response.success) {
                    	this.dataTable.fnDraw(false);
                        this.activityTypeDialog.formDialog.dialog("close");

                    }
                }));
            })
        });
    	this.activityTypeDialog.open();
    },
    on_setDefault_click: function(e){
    	
    },
    on_editActivityType_click: function(e){
        var data = $(e.currentTarget).closest("tr").data("data");
        if(data){
            data.activityType = data.activityTypeId;
            if(this.activityTypeDialog == null){
                this._initActivityTypeDialog();
            }       
            this.activityTypeDialog.open({
                "title": this.i18n.editActivityTypeDialog.editActivityType,
                "data": data,
                "mode":"edit"
            });
        };
        this.activityTypeDialog.override({
            "fresh_edit": this.proxy(function(fileOption,objId) {
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.update",
                        dataobject:"fileTypeDirectoryMapping",
                        obj: JSON.stringify(fileOption),
                        dataobjectid:objId
                    },
                    dataType: "json"
                }, this.activityTypeDialog.formDialog.parent()).done(this.proxy(function(response) {
                    if (response.success) {
                    	this.dataTable.fnDraw(false);
                        this.activityTypeDialog.formDialog.dialog("close");

                    }
                }));
            })
        }); 
    },
    /**
     * @title 删除安全信息类型
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_removeActivityType_click:function(e){
		var data = $(e.currentTarget).closest("tr").data("data");
        var deleteOption={directory:Number(data.directoryId),
   		                 fileType:data.fileType.id
   		                 };
       this.qid("deleteData").removeClass("hidden");
        this.deleteDataDialog=this.deleteData.dialog({
        	title:"删除配置",
            width:360,
            modal: false,
            draggable: false,
            resizable: false,
            autoOpen: true,
            body:"<div>"+
		 	     "<p>确认删除？</p>"+
		         "</div>",
            buttons:[
     				{
    					"text":"确定",
    					"class":"delete_ok",
    					"click":this.proxy(function(){
    						 $.u.ajax({
    					            url: $.u.config.constant.smsmodifyserver,
    					            type: "post",
    					            data: {
    					                tokenid: $.cookie("tokenid"),
    					                method: "stdcomponent.delete",
    					                dataobject:"fileTypeDirectoryMapping",
    					                dataobjectids:'['+data.id+']'
    					            },
    					            dataType: "json"
    					        }).done(this.proxy(function(response) {
    					            if (response.success) {
    					            	this.dataTable.fnDraw(false);
    					            	this.deleteDataDialog.dialog("close");
    					            }
    					        }));
    					})
    				},
                    {
                    	"text":"取消",
                    	"class":"delete_cancel",
                    	"click":this.proxy(function(){
                    		this.deleteDataDialog.dialog("close");
                    	})
                    }
                
                     ],
            open: this.proxy(function () {
            	
            }),
            close: this.proxy(function () {
            }),
            create: this.proxy(function () {
            })
        
        });
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    _initActivityTypeDialog:function(){
    	$.u.load("com.sms.plugin.audit.auditFile_dialog");
    	this.activityTypeDialog = new com.sms.plugin.audit.auditFile_dialog($("div[umid='activityTypeDialog']",this.$),{
    		"title":com.sms.plugin.audit.auditFile.i18n.addActivityType
    	});
    	this.activityTypeDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.audit.auditFile.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                     '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.plugin.audit.auditFile.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                      { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];