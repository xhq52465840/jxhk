//@ sourceURL=com.sms.detailmodule.date
$.u.define('com.sms.detailmodule.date', null, {
    init: function (options) {
        this._options = options || {};
    },
    afterrender: function (bodystr) {
    	this.createTime = this.qid("createtime");				// 创建时间
    	this.updateTime = this.qid("updatetime");				// 最后更新事件
    	
    	this.createTime.text(this._options.created || "");
    	this.updateTime.text(this._options.lastUpdate || "");
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.date.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                      "../../../uui/widget/spin/spin.js",
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.date.widgetcss = [];