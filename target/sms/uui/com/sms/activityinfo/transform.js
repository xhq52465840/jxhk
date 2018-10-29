//@ sourceURL=com.sms.activityinfo.transform
$.u.define('com.sms.activityinfo.transform', 'com.sms.activityinfo.base', {
    afterrender: function(){
        this._i18n = com.sms.activityinfo.transform.i18n;
	    this._SPECIAL_FIELDS = ["type"];
	    this._TITLE = this._i18n.title;
	    this._OK_BUTTON_NAME = this._i18n.buttons.change;
	    this._CANCEL_BUTTON_NAME = this._i18n.buttons.cancel;
	    this._GET_CONFIG_METHOD = "getactivitytransformconfig";
	    this.form = this.qid("form");
		this.baseArea = this.qid("base-area");
    	this.fieldDialog = this.qid("field-dialog");
    	this._fields = {};
    	this._initTypeSelect2 = false;
    	
    	// 初始化模态层
    	this.initFieldDialog();

    	// 绑定信息类型的变更事件，变更后刷新表单结构
    	this.form.on("change",":hidden.select2-field-activity-type",this.proxy(function(e){
			this.reloadFields({
				"activity": this._activityId,
				"type": this.form.find(":hidden.select2-field-activity-type").select2("val")
			}); 
		})); 
    },
    /**
     * @title 创建安全信息按钮事件
     * @return void
     */
    on_dialogcreate_click:function(){
    	var isValid = this.valid();
    	if(!this.form.find(":hidden.select2-field-activity-type").select2("val")){
    		this.form.find(":hidden.select2-field-activity-type").select2("focus");
    		isValid = false;
    	}
		if(isValid){
			var data = this.getData();
			this.disable();
			$.u.ajax({
        		url: $.u.config.constant.smsmodifyserver,
                type:"post",
                dataType: "json",
                data: {
            		"tokenid": $.cookie("tokenid"),
            		"method": "transform",
            		"dataobjectid": this._activityId,
            		"obj": JSON.stringify(data)
                }
        	},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
        		if(response.success){
        			this.fieldDialog.dialog("close");
        			this.refresh();
        		}
        	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
        		
        	})).complete(this.proxy(function(jqXHR,errorStatus){
        		this.enable();
        	}));
		}
    },
    /**
     * @title 销毁字段，除了type字段
     * @description 类型切换提供的字段列表没有类型字段，需前端定制，切换类型的时候不销毁类型字段
     * @param removeType {bool} 是否销毁type
     * @return void
     */
    destroyFields:function(removeType){ 
    	$.each(this._fields, this.proxy(function(key, item){
    		if(key != "type" || removeType === true){
    			item.comp.destroy();
    			delete this._fields[key];
    		}
    	})); 
    	this.customfieldform.destroyFields();
    },
    /**
     * @title 快速启动
     * @param activityid {int} 
     * @param activity {object}
     * @return void
     */
    quickTrigger: function(activityid, activity){
    	if(activity && activity.type){
    		if(this._initTypeSelect2 === false){
		    	this.buildField({
		    		activityId: activity.id,
		    		key: "type",
		    		name: "信息类型",
		    		renderer: "com.sms.plugin.render.activityTypeProp",
		    		required: true
		    	}, this.baseArea, this.reloadFields);
		    	this._initTypeSelect2 = true;
    		}
//    		this.form.find(":hidden.select2-field-activity-type").select2("data", activity.type);
    		this.form.find(":hidden.select2-field-activity-type").select2("val", null);
        	this._activityId = activity.id; 
        	this._isFirstLoad = false;
        	this.open();
    	}
    },
    /**
     * @title 用于重载
     */
    refresh: function(){},
    destroy: function () {
    	this.destroyFields(true); 
        return this._super();
    }
}, { usehtm: true, usesuperhtm:true, usei18n: true });


com.sms.activityinfo.transform.widgetjs = [];
