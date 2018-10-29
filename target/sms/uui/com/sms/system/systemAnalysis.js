//@ sourceURL=com.sms.system.systemAnalysis
$.u.define('com.sms.system.systemAnalysis', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.systemAnalysis.i18n;
    	this.form=this.qid("form");
    	this.system=this.qid("system");
    	this.unit=this.qid("unit");
    	this.subsystem = this.qid("subsystem");
    	this.primaryWorkflow = this.qid("primaryWorkflow");
    	this.secondaryWorkflow= this.qid("secondaryWorkflow");
    	this.rule=[];
    	/**
    	 * @title 搜索条件
    	 */
    	 this.system.select2({
	           width: '100%',
	           multiple: false,
	           ajax: {
	               url: $.u.config.constant.smsqueryserver,
	               dataType: "json",
	               type: "post",
	               data: this.proxy(function(term, page) {
		            	return {
		            		tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
		    				method: "stdcomponent.getbysearch",
		    				dataobject: "dictionary",
		    				rule: JSON.stringify([[{"key":"type","value":"系统分类"}], [{key:"name",op:"like",value:term}]]),
		    				start: (page - 1) * 10,
		    				length: 10
		    			};
		            }),
	               results: this.proxy(function(response, page, query) {
	                   if (response.success) {
	                	   return { 
	                           results: response.data.aaData,
	                       }
	                   } else {
	                       $.u.alert.error(response.reason, 1000 * 3);
	                   }
	               })
	           },
	           formatResult: function(item) {
	               return  item.name;
	           },
	           formatSelection: function(item) {
	               return  item.name;
	           }
	       
	       }),
	 
	        this.unit.select2({
		         width: '100%',
		         multiple: false,
		         ajax: {
		             url: $.u.config.constant.smsqueryserver,
		             dataType: "json",
		             type: "post",
		             data: this.proxy(function(term, page) {
		                 return {
		                     tokenid: $.cookie("tokenid"),
		                     method: "getunits",
		                     unitName:term
		                 };
		             }),
		             results: this.proxy(function(response, page, query) {
		                 if (response.success) {
		              	   return { 
		                         results: response.data,
		                     }
		                 } else {
		                     $.u.alert.error(response.reason, 1000 * 3);
		                 }
		             })
		         },
		         formatResult: function(item) {
		             return  item.name;
		         },
		         formatSelection: function(item) {
		             return  item.name;
		         }
     
       });
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            dom: "tip",
            "columns": [
                { "title": "系统" ,"mData":"system","sWidth":"18%"},
                { "title": "部门" ,"mData":"unit","sWidth":"18%"},
                { "title": "子系统" ,"mData":"subsystem","sWidth":"18%"},
                { "title": "一级流程" ,"mData":"primaryWorkflow","sWidth":"18%"},
                { "title": "二级流程" ,"mData":"secondaryWorkflow","sWidth":"18%"},
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
            		"dataobject": "systemAnalysis",
            		"rule":JSON.stringify(this.rule)
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
                    "aTargets": 5,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.system.systemAnalysis.i18n.editing+"</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.system.systemAnalysis.i18n.remove+"</button>";
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
    	this.rule=[];
    	if(this.system.select2("val")){
    		this.rule.push([{"key":"system.id","value":this.system.select2("val")}]);
    	};
    	if(this.unit.select2("val")){
    		this.rule.push([{"key":"unit.id","value":this.unit.select2("val")}]);
    	};
    	if(this.subsystem.val()){
    		this.rule.push([{"key":"subsystem","value":this.subsystem.val()}]);
    	};
    	if(this.primaryWorkflow.val()){
    		this.rule.push([{"key":"primaryWorkflow","value":this.primaryWorkflow.val()}]);
    	};
    	if(this.secondaryWorkflow.val()){
    		this.rule.push([{"key":"secondaryWorkflow","value":this.secondaryWorkflow.val()}]);
    	}
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 重置
     * @return void
     */
    on_reset_click: function(e){
    	this.system.select2("val","");
    	this.unit.select2("val","");
    	this.subsystem.val("");
    	this.primaryWorkflow.val("");
    	this.secondaryWorkflow.val("");
    	this.rule=[];
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
                        dataobject:"systemAnalysis",
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
                            dataobject:"systemAnalysis",
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
    	$.u.load("com.sms.system.systemAnalysis_dialog");
    	this.dictionaryDialog = new com.sms.system.systemAnalysis_dialog($("div[umid='dictionaryDialog']",this.$),{
    		"title":"配置树型字典",
    	});
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.systemAnalysis.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                          '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                          "../../../uui/widget/uploadify/jquery.uploadify.js",
  										 "../../../uui/widget/select2/js/select2.min.js",
                                          "../../../uui/widget/spin/spin.js", 
                                          "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                          "../../../uui/widget/ajax/layoutajax.js",
                                          "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
  										];
com.sms.system.systemAnalysis.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                           { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },

                                           { path: "../../../uui/widget/select2/css/select2.css" }, 
                                           { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
    							            {path:"../../../uui/widget/uploadify/uploadify.css"},
                                            {id:"ztreestyle",
    							            path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}
    										            ];