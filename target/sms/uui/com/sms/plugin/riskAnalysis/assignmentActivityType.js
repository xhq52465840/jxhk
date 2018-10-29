//@ sourceURL=com.sms.plugin.riskAnalysis.assignmentActivityType
$.u.define('com.sms.plugin.riskAnalysis.assignmentActivityType', null, {
    init: function (options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
        this._setting = null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.plugin.riskAnalysis.assignmentActivityType.i18n;
    	this.editDialog = null;
        this.btnSetting = this.qid("btn_editSetting");

    	this.btnSetting.click(this.proxy(this.on_editSetting_click));

        this._getSetting();
    },
    /**
     * @title 编辑配置
     * @param e {object} 鼠标对象
     * @return void
     */
    on_editSetting_click:function(e){
        var $this = $(e.currentTarget);
    	if(this.editDialog == null){
    		this._initDialog();
    	}    	
        var data = $.extend(true, {}, this._setting);
        
    	data.roles = $.map(data.roles || [], function(role, idx){
            return {
                "name": role.name,
                "id": role.id
            }
        });
    
        data.entities = $.map(data.entities || [], function(entity, idx){
            return {
                "name": entity.activityType.name,
                "id": entity.activityType.id
            };
        });
        
        if(this._setting){
        	this.editDialog.open({"title": this.i18n.dialogTitle, "data": data});
        }else{
            this.editDialog.open();
        }
    },
    _getSetting: function(){
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "riskTaskSetting"
            }
        }, this.$).done(this.proxy(function(response){
            if(response.success && response.data.iTotalRecords > 0){
                this._setting = response.data.aaData[0] ;
                this._fillTable(this._setting);
            }
        }));
    },
    _fillTable: function(data){
        this.qid("role").text($.map(data.roles || [], function(role, idx){
            return role.name;
        }).join(","));
        this.qid("activityTypes").text($.map(data.entities || [], function(entity, idx){
            return entity.activityType.name;
        }).join(","));
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    _initDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.editDialog = new com.sms.common.stdComponentOperate($("div[umid='activityTypeDialog']",this.$),{
    		"title": this.i18n.dialogTitle,
    		"dataobject":"riskTaskActivityTypeEntity",
    		"fields":[
                {
                    name: "roles",
                    label: this.i18n.form.role,
                    dataType: "int",
                    type: "select",
                    rule: {required:true},
                    message: this.i18n.messages.roleNotNull,
                    option: {
                        params: { "dataobject": "role" },
                        multiple: true,
                        ajax: {
                            data: this.proxy(function(term, page){
                                return {
                                    "tokenid": $.cookie("tokenid"),
                                    "method": "stdcomponent.getbysearch",
                                    "rule": JSON.stringify([[{"key":"name","op":"like","value":term}]]),
                                    "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                                    "length": this._SELECT2_PAGE_LENGTH,
                                    "dataobject": "role"
                                };
                            })
                        }
                    }
                },
	            {
                    name: "entities", 
                    label: this.i18n.form.activityType, 
                    dataType: "int", 
                    type: "select", 
                    rule: {required:true}, 
                    message: this.i18n.messages.activityTypeNotNull,
	        	    option: {
	        		    params: { "dataobject": "activityType" },
                        multiple: true,
	        		    ajax: {
	        			    data: this.proxy(function(term, page){
	        				    return {
	        					    "tokenid": $.cookie("tokenid"),
			        			    "method": "stdcomponent.getbysearch",
			        			    "rule": JSON.stringify([[{"key":"name","op":"like","value":term}]]),
			        			    "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
			        			    "length": this._SELECT2_PAGE_LENGTH,
	        					    "dataobject": "activityType"
	        				    };
	        			    })
	        		    }
	        	    }
	            }
	        ],
            "add": this.proxy(function(comp, formdata){
                this._setting = $.extend({},this._setting || {}, formdata);
                this._setting.entities = $.map(this._setting.entities, function(v, idx){
                    return {"activityType": v};
                });
                var params = {
                    "tokenid": $.cookie("tokenid"),
                    "method": "addRiskTaskSetting",
                    "obj": JSON.stringify(this._setting)
                };
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    dataType: "json",
                    data: params
                }, this.$).done(this.proxy(function(response){
                    if(response.success){
                        comp.formDialog.dialog("close");
                        this._getSetting();
                    }
                }));
            }),
            "edit": this.proxy(function(comp, formdata){
                this._setting = $.extend({},this._setting || {}, formdata);
                this._setting.entities = $.map(this._setting.entities, function(v, idx){
                    return {"activityType": v};
                });
                var params = {
                    "tokenid": $.cookie("tokenid"),
                    "method": "updateRiskTaskSetting",
                    "obj": JSON.stringify(this._setting)
                };
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    dataType: "json",
                    data: params
                }, this.$).done(this.proxy(function(response){
                    if(response.success){
                        comp.formDialog.dialog("close");
                        this._getSetting();
                    }
                }));
            })
    	});
    	this.editDialog.override({
    		refreshDataTable:this.proxy(function(){
    			// this.dataTable.fnDraw();
    		})
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.riskAnalysis.assignmentActivityType.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                               '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.plugin.riskAnalysis.assignmentActivityType.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];