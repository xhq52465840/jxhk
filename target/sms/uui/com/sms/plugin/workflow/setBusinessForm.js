//@ sourceURL=com.sms.plugin.workflow.setBusinessForm
$.u.define('com.sms.plugin.workflow.setBusinessForm', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this._options.data && this.fillData(this._options.data);
    },
    fillData:function(data){
    	if(data){
    		this.qid("dataobject").val(data.dataobject || "");
    		this.qid("field").val(data.field || "");
    	}
    },
    getData:function(){
    	return {
    		dataobject: this.qid("dataobject").val(),
    		field: this.qid("field").val()
    	};
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

