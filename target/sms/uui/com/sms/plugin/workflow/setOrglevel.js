//@ sourceURL=com.sms.plugin.workflow.setOrglevel
$.u.define('com.sms.plugin.workflow.setOrglevel', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.orgLevel=this.qid("orgLevel");
    	this._options.data && this.fillData(this._options.data);
    },
    fillData:function(data){
    	this.orgLevel.val(data);
    },
    getData:function(){
    	return this.orgLevel.val();
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.plugin.workflow.setOrglevel.widgetjs = ['../../../../uui/widget/jqurl/jqurl.js'];
com.sms.plugin.workflow.setOrglevel.widgetcss = [];