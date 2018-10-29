//@ sourceURL=com.sms.dash.sysThreadError
$.u.load('com.sms.dash.pie3');
$.u.load('com.sms.dash.threadErrorLine');
$.u.define('com.sms.dash.sysThreadError', null, {
	init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	var params = $.urlParam(null);
    	unitName = window.unescape(unescape(params.unitName)),//安监机构名称
	 	sysTypeName = window.unescape(unescape(params.sysTypeName)),//系统名称
	 	conseName = window.unescape(unescape(params.conseName)),//重大风险名称
	 	insecurityName = window.unescape(unescape(params.insecurityName)),
	 	date = params.date;//
    	if(sysTypeName=="0"){
    		sysTypeName = "全部";
    	}
	 	this.qid("unit").text(unitName);
    	this.qid("system").text(sysTypeName);
    	this.qid("consequence").text(conseName);
    	this.qid("insecurity").text(insecurityName);
    	this.insecurityTabs = this.qid("insecurityTabs");
    	this.insecurityTabs.tabs();
    	this.errorPie = new com.sms.dash.pie3($("div[umid=errorPie]",this.$),{'unitId' :params.unitId,'insecurityId':params.insecurityId,'systemId':params.systemId,'paramType' : 'error','date':params.date,"method":"calculateByMultiConOneMonthForThreatAndError"});
    	this.threadPie = new com.sms.dash.pie3($("div[umid=threadPie]",this.$),{'unitId' :params.unitId,'insecurityId':params.insecurityId,'systemId':params.systemId,'paramType' : 'threat','date':params.date,"method":"calculateByMultiConOneMonthForThreatAndError"});
    	this.errorLine = new com.sms.dash.threadErrorLine($("div[umid=errorLine]",this.$),{"unitId" :params.unitId,"insecurityId":params.insecurityId,"systemId":params.systemId,"paramType" : "error","date":date});
    	this.threadLine = new com.sms.dash.threadErrorLine($("div[umid=threadLine]",this.$),{"unitId" :params.unitId,"insecurityId":params.insecurityId,"systemId":params.systemId,"paramType" : "threat","date":date});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.sysThreadError.widgetjs = [
		                              "../../../uui/widget/spin/spin.js",
		                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
		                              "../../../uui/widget/ajax/layoutajax.js",
		                              'echarts/js/echarts.js',
		                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.sysThreadError.widgetcss = [];