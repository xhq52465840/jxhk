//@ sourceURL=com.sms.system.dictionaryMaintenance
$.u.define('com.sms.system.dictionaryMaintenance', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.dictionaryMaintenance.i18n;
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: true,
            dom: "tip",
            "columns": [
                { "title": this.i18n.name ,"mData":"name","sWidth":"25%"},
                { "title": this.i18n.value ,"mData":"value","sWidth":"25%"},
                { "title": this.i18n.key ,"mData":"key","sWidth":"25%"},
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
            	var rule = [];
            	if(this.qid("type").val()){
            		rule.push([{"key":"type", "op":"like", "value":this.qid("type").val()}]);
            	}else{
            		rule.push([{"key":"type", "op":"like", "value":"飞行阶段"},
    		           {"key":"type", "op":"like", "value":"风险参数"},
    		           {"key":"type", "op":"like", "value":"系统分类"},
    		           {"key":"type", "op":"like", "value":"信息分类"},
    		           {"key":"type", "op":"like", "value":"车辆类型"},
    		           {"key":"type", "op":"like", "value":"事件类型"},
    		           {"key":"type", "op":"like", "value":"维护工具"},
    		           {"key":"type", "op":"like", "value":"地面位置"},
    		           {"key":"type", "op":"like", "value":"工种"}
            		]);
            	}
            	if(this.qid("name").val()){
            		rule.push([{"key":"name", "op":"like", "value":this.qid("name").val()}]);
            	}
                aoData.columns.push({"data":"created"});
                aoData.order.push({"column":aoData.columns.length - 1, "dir": "desc"});
                // aoData.order.splice(0, 0, {"column":aoData.columns.length - 1, "dir": "desc"});
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "dictionary",
            		"columns": JSON.stringify(aoData.columns),
            		"order":JSON.stringify(aoData.order),
            		"rule": JSON.stringify(rule)
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
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.system.dictionaryMaintenance.i18n.editing+"</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.system.dictionaryMaintenance.i18n.remove+"</button>";
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
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
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
        		refreshDataTable:this.proxy(function(){
        			this.dataTable.fnDraw(true);
        		})
        	});
    		this.dictionaryDialog.open({"data":data,"title":""+this.i18n.editDictionary+"："+data.key});
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
    			title:""+this.i18n.removeDictionary+"："+data.key,
    			dataobject:"dictionary",
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
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.dictionaryDialog = new com.sms.common.stdComponentOperate($("div[umid='dictionaryDialog']",this.$),{
    		"title":com.sms.system.dictionaryMaintenance.i18n.addDictionary,
    		"dataobject":"dictionary",
    		"fields":[
	          {name:"name", maxlength:50, label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull},
	          {name:"value", maxlength:50, label:this.i18n.value,type:"text",rule:{required:true},message:this.i18n.valueNotNull},
	          {name:"type", maxlength:10, label:this.i18n.type,type:"text",rule:{required:true},message:this.i18n.typeNotNull},
	          {name:"key", maxlength:50, label:this.i18n.key,type:"text",rule:{required:true},message:this.i18n.keyNotNull}
	        ]
    	});
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.dictionaryMaintenance.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.system.dictionaryMaintenance.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];