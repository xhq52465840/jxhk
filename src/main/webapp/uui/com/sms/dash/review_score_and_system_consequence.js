//@ sourceURL=com.sms.dash.review_score_and_system_consequence
$.u.load('com.sms.dash.singleDchen');
$.u.define('com.sms.dash.review_score_and_system_consequence', null, {
	init: function (options) {
		this._options = options;
	},
	afterrender: function () {
		this.tabGroup = this.qid("tabGroup").tabs();
		var params = $.urlParam();
		this.unitId = window.unescape(window.unescape(params.unitId));
		this.unitName = window.unescape(window.unescape(params.unitName));
		params.sysTypeId = "0";
		var sysTypeName = "全部";
		params.sysTypeName = window.escape(sysTypeName);
		this.qid("unit").text(this.unitName);
    	this.qid("system").text(sysTypeName);
    	
    	// 日期为当前日期的上月的1号
    	var date = new Date();
    	date.setMonth(date.getMonth() - 1);
    	date.setDate(1);
    	date = date.format("yyyy/MM/dd");
    	params.date = date;
    	$('li>a',this.tabGroup).on("click",this.proxy(function(e){
    		var href = $(e.currentTarget).attr("href");
    		switch(href){
	    		case "#tab-1":
	    			var length = $('div[umid=singleDchen]',this.tabGroup).children().length;
	    			if(!length){
	    				new com.sms.dash.singleDchen($("div[umid=singleDchen]",this.$),params);
	    			}
	    			break;
	    		case "#tab-2":
	    			var length = $('div[umid=radar]',this.tabGroup).children().length;
	    			if(!length){
	    				$.u.load('com.sms.dash.systemRadar');
	    				new com.sms.dash.systemRadar($("div[umid=radar]",this.$),params);
	    			}
	    			break;
	    		case "#tab-3":
	    			var length = $('div[umid=bar]',this.tabGroup).children().length;
	    			if(!length){
	    				$.u.load('com.sms.dash.systemConsequenceBar');
	    				new com.sms.dash.systemConsequenceBar($("div[umid=bar]",this.$),params);
	    			}
	    			break;
	    		case "#tab-4":
	    			var length = $('div[umid=systemType]',this.tabGroup).children().length;
	    			if(!length){
	    				$.u.load('com.sms.dash.activityLine');
	    				new com.sms.dash.activityLine($("div[umid=systemType]",this.$),{"method":"getByIncidentType","mark":"S","unit":params.unitId, "symbol" : "A"});
	    			}
	    			break;
	    		case "#tab-5":
	    			var length = $('div[umid=accidentType]',this.tabGroup).children().length;
	    			if(!length){
	    				$.u.load('com.sms.dash.activityLine');
	    				new com.sms.dash.activityLine($("div[umid=accidentType]",this.$),{"method":"getByIncidentType","mark":"S","unit":params.unitId, "symbol" : "E"});
	    			}
	    			break;
    		}
    		
    	}));
    	new com.sms.dash.singleDchen($("div[umid=singleDchen]",this.$),params);
	},
	destroy: function () {
		this._super();
	}
}, { usehtm: true, usei18n: false });

com.sms.dash.review_score_and_system_consequence.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
							  '../../../uui/widget/spin/spin.js',
							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
							  '../../../uui/widget/ajax/layoutajax.js',
							  'echarts/js/echarts.js',
							  '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.review_score_and_system_consequence.widgetcss = [{id:'',path:'../../../uui/widget/select2/css/select2.css'},
							   {id:'',path:'../../../uui/widget/select2/css/select2-bootstrap.css'},
							   { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
							   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];