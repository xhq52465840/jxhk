//@ sourceURL=com.sms.activityinfo.anonymityStaffReport
$.u.define('com.sms.activityinfo.anonymityStaffReport', 'com.sms.activityinfo.base', {
    afterrender: function(){
        this._i18n = com.sms.activityinfo.anonymityStaffReport.i18n;
        this._STAFF_REPORT_NAME = "员工安全报告";
	    this._SPECIAL_FIELDS = ["unit"]; 
	    this._TITLE = this._i18n.title;
	    this._OK_BUTTON_NAME = this._i18n.buttons.ok;
	    this._CANCEL_BUTTON_NAME = this._i18n.buttons.cancel;
	    this._GET_CONFIG_METHOD = "getactivitycreatingconfig";
        this._fixedFields.unit.renderer = "com.sms.plugin.render.unitListProp"; // "安监机构"采用不同render
	    this.form = this.qid("form");
		this.baseArea = this.qid("base-area");
    	this.fieldDialog = this.qid("field-dialog");
        this._staffReportId = $.cookie("staffReportTypeId");
    	    	
        this.initFieldDialog();
        this._isFirstLoad = false;
    	
    },
    /**
     * @title 创建安全信息按钮事件
     * @return void
     */
    on_dialogcreate_click:function(){
    	var isValid = this.valid();
		if(isValid && $.cookie("anonymityTokenid")){
			var data = this.getData();
            data.type = this._staffReportId;
			this.disable();
			$.u.ajax({
        		url: $.u.config.constant.smsmodifyserver,
                type:"post",
                dataType: "json",
                data: {
            		"tokenid": $.cookie("anonymityTokenid"),
            		"method":"stdcomponent.addextend",
                    "dataobject":"activity",
            		"obj": JSON.stringify(data)
                }
        	},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
        		if(response.success){
        			this.fieldDialog.dialog("close");
                    $.u.alert.success(this._i18n.messages.success);
                    this.refresh();
        		}
        	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
        		
        	})).complete(this.proxy(function(jqXHR,errorStatus){
        		this.enable();
        	}));
		}
    },
    /**
     * @title 模态层打开时执行
     * @return void
     */
    open: function(){
        $.cookie("isAnonymityLogin", true, { "path": "/"});
        if(this._staffReportId){
            this._staffReportId = parseInt(this._staffReportId);
            this.form.off("change", ":hidden.select2-field-unit").on("change",":hidden.select2-field-unit",this.proxy(function(e){
                this.reloadFields({
                    "unit": this.form.find(":hidden.select2-field-unit").select2("val"),
                    "type": this._staffReportId
                });
            })); 
            this.buildField({
                key: "unit",
                name: this._i18n.fields.unit,
                renderer: "com.sms.plugin.render.unitListProp",
                required: true
            }, this.baseArea, this.reloadFields);
            this.fieldDialog.dialog("open"); 
        }else{
            $.blockUI(this._blockuiopts);
            $.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: {
                    tokenid: $.cookie("anonymityTokenid"),
                    method: "stdcomponent.getbysearch",
                    dataobject: "activityType",
                    rule: JSON.stringify( [ [{"key":"name", "value":this._STAFF_REPORT_NAME}] ] )
                },
                dataType: "json"
            }).done(this.proxy(function(response){
                if(response.success && response.data.iTotalRecords > 0){
                    $.unblockUI();
                    this._staffReportId = response.data.aaData[0].id;
                    $.cookie("staffReportTypeId", this._staffReportId, { "path": "/"  });
                    this.form.off("change", ":hidden.select2-field-unit").on("change",":hidden.select2-field-unit",this.proxy(function(e){
                        this.reloadFields({
                            "unit": this.form.find(":hidden.select2-field-unit").select2("val"),
                            "type": this._staffReportId
                        });
                    }));     

                    this.buildField({
                        key: "unit",
                        name: this._i18n.fields.unit,
                        renderer: "com.sms.plugin.render.unitProp",
                        required: true
                    }, this.baseArea, this.reloadFields);
                    this.fieldDialog.dialog("open");
                }
            }));
        }

    },
    /**
     * @title 用于重载
     */
    refresh: function(){},
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usesuperhtm:true, usei18n: true });


com.sms.activityinfo.anonymityStaffReport.widgetjs = [];
