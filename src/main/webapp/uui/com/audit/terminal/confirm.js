﻿//@ sourceURL=com.audit.terminal.confirm
$.u.define('com.audit.terminal.confirm', null, {
    init: function (options) {
        this._options = options || {};
        this._i18n = {
        		title: "操作提示",
        		body: "确认操作？",
        		buttons: {
        			ok: "确认",
        			cancel: "取消"
        		}
        	};
        this.confirmDialog = $("<div/>").html(this._options.body || this._i18n.body).dialog({
			title: this._options.title || this._i18n.title,
			width: this._options.width,
			modal: true,
			resizable: false,
			buttons:[
	         {
	        	 text: this._options.buttons && this._options.buttons.ok  && this._options.buttons.ok.text ? this._options.buttons.ok.text : this._i18n.buttons.ok,
	        	 click: this.proxy(this._options.buttons && this._options.buttons.ok && this._options.buttons.ok.click ? this._options.buttons.ok.click : this.on_ok_click)
	         },
	         {
	        	 text: this._options.buttons && this._options.buttons.cancel && this._options.buttons.cancel.text ? this._options.buttons.cancel.text : this._i18n.buttons.cancel,
	        	 "class": "aui-button-link",
	        	 click: this.proxy(this._options.buttons && this._options.buttons.cancel && this._options.buttons.cancel.click ? this._options.buttons.cancel.click : this.on_cancel_click)
	         }
			],
			create: this.proxy(function(){
				
			}),
			open: this.proxy(function(){
				var zIndex = $("body>.ui-dialog:last").css("z-index");
				$("body>.ui-dialog:last").css("z-index", zIndex + 2);
				$("body>.ui-widget-overlay:last").css("z-index", zIndex + 1);
			}),
			close: this.proxy(function(){
				this.confirmDialog.dialog("destroy").remove();
			})
		});
    },
    on_ok_click: function(){    
    	this.confirmDialog.dialog("close");	
    },
    on_cancel_click: function(){
    	this.confirmDialog.dialog("close");
    },
    afterrender: function (bodystr) {    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });


com.audit.terminal.confirm.widgetjs = [];
com.audit.terminal.confirm.widgetcss = [];