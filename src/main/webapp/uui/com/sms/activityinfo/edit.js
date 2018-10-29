//@ sourceURL=com.sms.activityinfo.edit
$.u.define('com.sms.activityinfo.edit', null, {
    init: function (options) {
    	/*
    	 {
    	 	activity:"",	// 安全信息ID
    	 	screen:"",		// 界面
    	 }    	 
    	 */
        this._options = options || {};
        this.activityid = this._options.activity;
    },
    afterrender: function (bodystr) {
    	this.form=this.qid("form");
    	
    	this.fieldDialog = this.qid("field-dialog").dialog({
    		title: "编辑",
    		width: 810,
    		modal: true,
    		resizable: false,
    		draggable: false,
    		autoOpen: false,
    		position: ["center",40],
    		create: this.proxy(this.on_dialog_create),
    		open: this.proxy(this.on_dialog_open),
    		close: this.proxy(this.on_dialog_close),
    		buttons:[
    		    {
    		    	text: "确认",
    		    	"class": "button-submit",
    		    	click: this.proxy(this.on_dialogsave_click)
    		    },
    		    {
    		    	text: "取消",
    		    	"class": "aui-button-link",
    		    	click: this.proxy(function(){
    		    		this.fieldDialog.dialog("close");
    		    	})
    		    }
    		]
    	});
    },
    open:function(){
    	this.fieldDialog.dialog("open");
    },
    /**
     * @title execute when dialog open
     * @param e {object}
     * @return void
     */
    on_dialog_open:function(e){
    	if(this._options.activity && this._options.screen){
			this._reloadFields({"method":"getactivityworkflowconfig","activity":this._options.activity,"screen":this._options.screen});
		}
    },
    /**
     * @title execute when dialog create
     * @param e {object}
     * @return void
     */
    on_dialog_create:function(e){},
    /**
     * @title execute when dialog close
     * @param e {object}
     * @return void
     */
    on_dialog_close:function(e){},
    /**
     * @title save activity
     * @return void
     */
    on_dialogsave_click:function(){
    	var isValid = this.valid();
		if(isValid){
			this.disable();
			$.u.ajax({
        		url: $.u.config.constant.smsmodifyserver,
                type:"post",
                dataType: "json",
                data: {
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.updateextend",
            		"dataobject":"activity",
            		"dataobjectid":this.activityid,
            		"obj":JSON.stringify(this.getData())
                }
        	},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
        		if(response.success){
        			this.refresh();
        			this.fieldDialog.dialog("close");
        		}
        	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
        		
        	})).complete(this.proxy(function(jqXHR,errorStatus){
        		this.enable();
        	}));
		}
    },
    /**
     * @title reload fields
     * @param param {object} ajax params
     * @return void
     */
    _reloadFields:function(param){
		var size = 2 , opts={};
		opts.__spinner = new Spinner({ radius: 3 * size, width: 1 * size, length: 2 * size , color:"white" }).spin();
		var blockuiopts = {
		    message: opts.__spinner.el, 
		    overlayCSS: { 
		    	backgroundColor: 'transparent' 
		    },
		    css:{
		    	"background": "black", 
		    	"border": "none",
		    	"width":40,
		    	"height":40,
		    	"border-radius":8,
		    	"left":"50%"
		    }
		};

    	this.disable(); // 禁用创建表单的自定义字段
		this.fieldDialog.parent().addClass("hidden");
		$.blockUI(blockuiopts);
    	
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            data:$.extend({
				tokenid:$.cookie("tokenid")
	        },param)
		},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
	    	this.fieldDialog.parent().removeClass("hidden");
    		$.unblockUI();
			this.enable(); // 启用创建表单的自定义字段
			if(response.success){
	    		this._options=response.data;
	    		
	    		// 创建动态字段
	    		this.customfieldform.draw(this._options.fields,this._options.tabs);	    		
    	    	// this.qid("field-dialog").css({"maxHeight":$(window).height()*0.8,"overflow-y":"auto"});
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	this.enable();
		}));
    },
    /**
     * @title valid form
     * @return {bool} 
     */
    valid:function(){
    	return this.customfieldform.validate();
    },
    /**
     * @title disable form
     * @return void
     */
    disable:function(){
    	this.fieldDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    	this.customfieldform.disable();
    },
    /**
     * @title enable form
     * @return void
     */
    enable:function(){
    	this.fieldDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
    	this.customfieldform.enable();
    },
    /**
     * @title get form data
     * @returns tempData {object} form data
     */
    getData:function(){
    	var tempData = {};
    	tempData = $.extend({},tempData,this.customfieldform.getData());
    	return tempData;
    },
    /**
     * @title quick trigger used by detail.html
     * @param activityid {id}
     * @return void
     */
    quickTrigger:function(activityid){
    	this.activityid = activityid;
    	this.open();
    	this._reloadFields({"method":"getactivityeditingconfig","activity":activityid});
    },
    /**
     * @title used by overload
     */
    refresh:function(){},
    destroy: function () {
    	this.fieldDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.activityinfo.edit.widgetjs = ["../../../uui/widget/spin/spin.js",
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js"];
