//@ sourceURL=com.sms.plugin.workflow.fieldEqual
$.u.define('com.sms.plugin.workflow.fieldEqual', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.field=this.qid("field");
    	
    	this._options.data && this.fillData(this._options.data);
    },
    fillData:function(data){
    	this.field.val(data);
    },
    getData:function(){
    	return this.field.val();
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.workflow.fieldEqual.widgetjs = [];
com.sms.plugin.workflow.fieldEqual.widgetcss = [];