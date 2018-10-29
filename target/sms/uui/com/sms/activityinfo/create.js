//@ sourceURL=com.sms.activityinfo.create
$.u.define('com.sms.activityinfo.create', 'com.sms.activityinfo.base', {
    afterrender: function(){
        this._i18n = com.sms.activityinfo.create.i18n;
	    this._SPECIAL_FIELDS = ["unit", "type"];
	    this._TITLE = this._i18n.title;
	    this._OK_BUTTON_NAME = this._i18n.buttons.ok;
	    this._CANCEL_BUTTON_NAME = this._i18n.buttons.cancel;
	    this._GET_CONFIG_METHOD = "getactivitycreatingconfig";
	    this.form = this.qid("form");
		this.baseArea = this.qid("base-area");
    	this.fieldDialog = this.qid("field-dialog");
    	
    	// 初始化模态层
    	this.initFieldDialog();
    	
    	// 绑定安监机构和信息类型的变更事件，变更后刷新表单结构
    	this.form.on("change",":hidden.select2-field-unit,:hidden.select2-field-activity-type",this.proxy(function(e){
			this.reloadFields({
				"unit":this.form.find(":hidden.select2-field-unit").select2("val"),
				"type":this.form.find(":hidden.select2-field-activity-type").select2("val")
			});
		}));
    },
    /**
     * @title 模态层打开时执行
     * @return void
     */
    on_dialogOpen_click: function(){
    	this.reloadFields({});
    },
    /**
     * @title 创建安全信息按钮事件
     * @return void
     */
    on_dialogcreate_click:function(){
    	var isValid = this.valid();
		if(isValid){
			var data = this.getData();
			this.disable();
			$.u.ajax({
        		url: $.u.config.constant.smsmodifyserver,
                type:"post",
                dataType: "json",
                data: {
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.addextend",
            		"dataobject":"activity",
            		"obj":JSON.stringify(data)
                }
        	},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
        		if(response.success){
        			this.fieldDialog.dialog("close");
        			window.location.href = this.getabsurl("../search/activity.html?activityId="+response.data);
        		}
        	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
        		
        	})).complete(this.proxy(function(jqXHR,errorStatus){
        		this.enable();
        	}));
		}
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usesuperhtm:true, usei18n: true });


com.sms.activityinfo.create.widgetjs = [];
