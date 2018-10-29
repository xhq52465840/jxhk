//@ sourceURL=com.sms.system.treeDictionary
$.u.define('com.sms.system.treeDictionary', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.treeDictionary.i18n;
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            dom: "tip",
            "columns": [
                { "title": "字典名称" ,"mData":"dictionary","sWidth":"25%"},
                { "title": "所属字典名称" ,"mData":"parent","sWidth":"25%"},
                { "title": "层级" ,"mData":"grade","sWidth":"25%"},
                { "title": this.i18n.handle,"mData":"id","sWidth":100, "orderable": false}
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
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "dictionaryGrade",
            	},true);
                delete aoData.search;
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
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.system.treeDictionary.i18n.editing+"</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.system.treeDictionary.i18n.remove+"</button>";
                    }
                }
            ]
        });
    	
    	this.qid("btn_addDictionary").click(this.proxy(this.on_addDictionary_click));
    	this.qid("btn_filter").click(this.proxy(this.on_filter_click));
    	this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editDictionary_click));
    	this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeDictionary_click));
    	
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
    	this.qid("type").val("");
    	this.qid("name").val("");
    	this.qid("key").val("");
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 添加字典
     * @param e {object}
     * @return void
     */
    on_addDictionary_click:function(e){
    	if(this.dictionaryDialog == null){
    		this._initDictionaryDialog();
    	}
    	this.dictionaryDialog.override({
            "fresh": this.proxy(function(fileOption) {
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.add",
                        dataobject:"dictionaryGrade",
                        obj: JSON.stringify(fileOption)
                    },
                    dataType: "json"
                }, this.dictionaryDialog.formDialog.parent()).done(this.proxy(function(response) {
                    if (response.success) {
                    	this.dataTable.fnDraw(false);
                        this.dictionaryDialog.formDialog.dialog("close");

                    }
                }));
            })
            });
    	this.dictionaryDialog.open();
    },
    /**
     * @title 编辑字典
     * @param e {object} 鼠标对象
     * @return void
     */
    on_editDictionary_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		if(this.dictionaryDialog == null){
        		this._initDictionaryDialog();
        	}
    		this.dictionaryDialog.override({
                "fresh_edit": this.proxy(function(fileOption,objId) {
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        data: {
                            tokenid: $.cookie("tokenid"),
                            method: "stdcomponent.update",
                            dataobject:"dictionaryGrade",
                            obj: JSON.stringify(fileOption),
                            dataobjectid:objId
                        },
                        dataType: "json"
                    }, this.dictionaryDialog.formDialog.parent()).done(this.proxy(function(response) {
                        if (response.success) {
                        	this.dataTable.fnDraw(false);
                            this.dictionaryDialog.formDialog.dialog("close");

                        }
                    }));
                })
                });
    		this.dictionaryDialog.open({"data":data,mode:"edit"});
    	}catch(e){
    		throw new Error(""+this.i18n.editFail+"："+e.message);
    	}
    },
    /**
     * @title 删除字典
     * @param e {object} 鼠标对象
     * @return void
     */
    on_removeDictionary_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>"+this.i18n.choose+"</p>"+
    				 	"<p><span class='text-danger'>"+this.i18n.notice+"</span></p>"+
    				 "</div>",
    			title:""+this.i18n.removeDictionary+"："+data.dictionary,
    			dataobject:"dictionaryGrade",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				if(this.dataTable){
    					if(this.dataTable.fnGetData().length > 1 ){
    						this.dataTable.fnDraw(true);
    					}else{
    						this.dataTable.fnDraw();
    					}
    				}
    			})
    		});
    	}catch(e){
    		throw new Error(""+this.i18n.removeFail+"："+e.message);
    	}
    },
    /**
     * @title 初始化字典组件
     * @return void
     */
    _initDictionaryDialog:function(){
    	$.u.load("com.sms.system.treeDictionary_dialog");
    	this.dictionaryDialog = new com.sms.system.treeDictionary_dialog($("div[umid='dictionaryDialog']",this.$),{
    		"title":"配置树型字典",
    	});
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.treeDictionary.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.system.treeDictionary.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];