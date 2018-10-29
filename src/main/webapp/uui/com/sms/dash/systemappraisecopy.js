//@ sourceURL=com.sms.dash.systemappraisecopy
$.u.load('com.sms.dash.systemRadar');
$.u.load('com.sms.dash.systemConsequenceBar');
$.u.define('com.sms.dash.systemappraisecopy', null, {
	init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	var params = $.urlParam(null);
    	unitName = window.unescape(unescape(params.unitName)),//安监机构名称
	 	sysTypeName = window.unescape(unescape(params.sysTypeName));//系统名称
	 	if(sysTypeName=="0"){
	 		sysTypeName = "全部";
	 	}
	 	this.qid("unit").text(unitName);
    	this.qid("sys").text(sysTypeName);
    	this.conseTabs = this.qid("consequenceTabs");
   	 	this.conseTabs.tabs();
    	this.radar = new com.sms.dash.systemRadar($("div[umid=radar]",this.$),params);
    	this.bar = new com.sms.dash.systemConsequenceBar($("div[umid=bar]",this.$),params);
    },
      
    destroy: function () {
    	this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.systemappraisecopy.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                              "../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              'echarts/js/echarts.js',
                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.systemappraisecopy.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                               {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                               { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];