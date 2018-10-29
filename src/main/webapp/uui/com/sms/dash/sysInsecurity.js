//@ sourceURL=com.sms.dash.sysInsecurity
$.u.load('com.sms.dash.systemInsecurityBar');
$.u.load('com.sms.dash.systemInsecurityGauge');
$.u.load('com.sms.dash.sysInsecurityGauge');
$.u.define('com.sms.dash.sysInsecurity', null, {
	init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	var params = $.urlParam(null);
    	unitName = window.unescape(unescape(params.unitName)),//安监机构名称
	 	sysTypeName = window.unescape(unescape(params.sysTypeName)),//系统名称
	 	conseName = window.unescape(unescape(params.conseName));//重大风险名称
    	if(sysTypeName=="0"){
	 		sysTypeName = "全部";
	 	}
	 	this.qid("unit").text(unitName);
    	this.qid("system").text(sysTypeName);
    	this.qid("consequence").text(conseName);
    	this.insecurityTabs = this.qid("insecurityTabs");
    	this.insecurityTabs.tabs();
    	this.radar = new com.sms.dash.systemInsecurityBar($("div[umid=insebar]",this.$),params);
    	this.seachgauge = new com.sms.dash.systemInsecurityGauge($("div[umid=insegauge]",this.$),params);
    	this.allgauge = new com.sms.dash.sysInsecurityGauge($("div[umid=insegaugeall]",this.$),params);
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.sysInsecurity.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
		                              "../../../uui/widget/spin/spin.js",
		                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
		                              "../../../uui/widget/ajax/layoutajax.js",
		                              'echarts/js/echarts.js',
		                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.sysInsecurity.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                         {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                         { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                         { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];