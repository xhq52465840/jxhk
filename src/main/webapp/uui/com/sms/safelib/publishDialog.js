//@ sourceURL=com.sms.safelib.publishDialog
$.u.define('com.sms.safelib.publishDialog', null, {
    init: function (options) {
        this._options = options;
        this.publishDialog=$(this._options.body).dialog({
			title:this._options.title,
			width:540,
			modal:true,
			resizable:false,
			draggable: false,
			buttons:[
	         {
	        	 text:"确认",
	        	 click:this.proxy(function(e){
	        		 $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
	        		 $.u.ajax({
	        			 url: $.u.config.constant.smsmodifyserver,
	                     dataType: "json",
	                     type: "post",
	                     cache: false,
	                     data: {
	        			 	"tokenid":$.cookie("tokenid"),
	        			 	"method":"stdcomponent.update",
	        			 	"obj":JSON.stringify({"status":this._options.status}),
	        			 	"dataobject":this._options.dataobject,
	        			 	"dataobjectid":this._options.dataobjectid
		        		 }
	        		 },this.publishDialog.parent()).done(this.proxy(function(response){
	        			 if(response.success){
	        				 this.publishDialog.dialog("close");
	        				 this.refreshDataTable();
	        			 }else{
	        				 $(e.currentTarget).add($(e.currentTarget).next()).button("enable");
	        			 }
	        		 })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	        			 $(e.currentTarget).add($(e.currentTarget).next()).button("enable");
	        		 }));
	        	 })
	         },
	         {
	        	 text:"取消",
	        	 "class":"aui-button-link",
	        	 click:this.proxy(function(){
	        		 this.publishDialog.dialog("close");
	        	 })
	         }
			],
			close:this.proxy(function(){
				this.publishDialog.dialog("destroy").remove();
			})
		});
    },
    afterrender: function (bodystr) {
        
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: false });

com.sms.safelib.publishDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                       "../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.safelib.publishDialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];