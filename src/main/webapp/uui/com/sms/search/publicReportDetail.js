//@ sourceURL=com.sms.search.publicReportDetail
$.u.define('com.sms.search.publicReportDetail', null, {
    init: function (options) {
        this._options = options || {};
    },
    afterrender: function (bodystr) {
    	this.urlParam = $.urlParam();
    	if(!this.urlParam.activityId){
    		return false;
    	}
    	this.detail = this.qid("detail");
    	this.summary = this.qid("summary");
    	this.load();
    },
    load: function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type: "post",
            data: { 
        		"tokenid": $.cookie("tokenid"),
        		"method": "getActivityBaseInfo",
        		"isNeedPermission": "false",
        		"activityId": this.urlParam.activityId
        	}
        },this.$,{size:2,backgroundColor:"#fff"}).done(this.proxy(function (response) {
            if (response.success) {
            	this.summary.text(response.data.activity.summary);
            	this._drawModule(response.data);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    _drawModule: function(data){
    	var clazz = $.u.load(data.key);
    	new clazz($("<div umid='leftmodule'/>").appendTo(this.detail),data);
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.search.publicReportDetail.widgetjs = ["../../../uui/widget/jqurl/jqurl.js","../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.search.publicReportDetail.widgetcss = [];