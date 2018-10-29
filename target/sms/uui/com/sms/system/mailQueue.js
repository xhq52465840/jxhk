//@ sourceURL=com.sms.system.mailQueue
$.u.define('com.sms.system.mailQueue', null, {
    init: function (options) {
        this._options = options;
        this.TAB = "MAIL_QUEUE";
        this.IDS = [];
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.mailQueue.i18n;
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            sDom:"",
            "oLanguage": { 
                "sZeroRecords": this.i18n.message
            },
            "columns": [
                { "title": this.i18n.columns.subject ,"mData":"subject"},
                { "title": this.i18n.columns.queue ,"mData":"lastUpdate","sWidth":400},
            ],
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"getEmails"
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
                    data: aoData
                },this.dataTable,{size:2,backgroundColor:"#fff"}).done(this.proxy(function (response) {
                    if (response.success) {
                    	$(".mailqueuecount", this.$).text(response.undersendingEmails.iTotalRecords);
                    	$(".errorqueuecount", this.$).text(response.failedEmails.iTotalRecords);
                    	this.IDS = $.map(response.failedEmails.aaData, function(item,idx){ return parseInt(item.id); });
                    	if(this.TAB == "MAIL_QUEUE"){
                    		fnCallBack(response.undersendingEmails);
                    	}else if(this.TAB == "ERROR_QUEUE"){
                    		fnCallBack(response.failedEmails);
                    	}
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "fnCreatedRow": this.proxy(function( nRow, aData, iDataIndex ) {
            	this.TAB == "ERROR_QUEUE" && $(nRow).addClass("danger");
            })
        });
    	
    	this.qid("tabs").find("a[data-toggle=tab]").on("show.bs.tab",this.proxy(this.on_tabs_click));
    	this.qid("btn_sendmailqueue").click(this.proxy(this.on_sendMailQueue_click));
    	this.qid("btn_senderrorqueue").click(this.proxy(this.on_sendErrorQueue_click));
    	this.qid("btn_removeerrorqueue").click(this.proxy(this.on_removeErrorQueue_click));
    },
    on_tabs_click: function(e){
    	var $this = $(e.currentTarget), href = $this.attr("href");
    	switch(href){
			case "#mailqueue": this.TAB = "MAIL_QUEUE"; break;
			case "#errorqueue": this.TAB = "ERROR_QUEUE"; break;
			default: break;
    	}
    	this.qid("mailqueue").add(this.qid("errorqueue")).toggleClass("hidden");
    	this.dataTable.fnDraw(true);
    },
    on_sendMailQueue_click: function(e){
    	e.preventDefault();
    	$.u.ajax({
    		url: $.u.config.constant.smsmodifyserver,
    		type: "post",
    		data: {
    			tokenid: $.cookie("tokenid"),
    			method: "sendEmails",
    			paramType: "sendUndersendingEmails"
    		},
    		dataType: "json"
    	},this.qid("btn_sendmailqueue"),{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
    		if(response.success){
    			$.u.alert.success("操作成功。");
    			this.dataTable.fnDraw();
    		}
    	})).fail(this.proxy(function(response){
    		
    	}));
    },
    on_sendErrorQueue_click: function(e){
    	e.preventDefault();
    	$.u.ajax({
    		url: $.u.config.constant.smsmodifyserver,
    		type: "post",
    		data: {
    			tokenid: $.cookie("tokenid"),
    			method: "sendEmails",
    			paramType: "sendFailedEmails"
    		},
    		dataType: "json"
    	},this.qid("btn_senderrorqueue"),{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
    		if(response.success){
    			$.u.alert.success("操作成功。");
    			this.dataTable.fnDraw();
    		}
    	})).fail(this.proxy(function(response){
    		
    	}));
    },
    on_removeErrorQueue_click: function(e){
    	$.u.ajax({
    		url: $.u.config.constant.smsmodifyserver,
    		type: "post",
    		data: {
    			tokenid: $.cookie("tokenid"),
    			method: "stdcomponent.delete",
    			dataobject: "email",
    			dataobjectids: JSON.stringify(this.IDS)
    		},
    		dataType: "json"
    	},this.qid("btn_removeerrorqueue"),{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
    		if(response.success){
    			$.u.alert.success("操作成功。");
    			this.dataTable.fnDraw();
    		}
    	})).fail(this.proxy(function(response){
    		
    	}));
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.mailQueue.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.system.mailQueue.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];