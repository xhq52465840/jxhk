// @ sourceURL=com.sms.dash.qar_event_of_takingoff_airport
$.u.define('com.sms.dash.qar_event_of_takingoff_airport', null, {
	init: function (mode, gadgetsinstanceid) {
  	this._initmode = mode;
    this._gadgetsinstanceid = gadgetsinstanceid;
    this._gadgetsinstance = null;        
  },
	afterrender : function(bodystr) {
//		this.isShowTool = true;
//		this.showTool = this.qid("showTool");
//		this.showTool.text(this.isShowTool ? "隐藏工具栏" : "显示工具栏");
		this.boframe = this.qid('boframe');
		this.boframe.attr("src","");
		var date = new Date();
		this._getBoUrl('AadjPdO2D2pKu4Tduc_yPm0',date.getFullYear().toString(),(date.getMonth() + 1 ).toString(),'NO');
		
	},
	_getBoUrl : function(boId,year,month,isShow){
		var url = boUrl + "?ID=" + boId;
		url += "&Year=" + year;
		if('' != month){
			url += "&Month=" + month;
		}
		url += "&Show=" + isShow;
		
		this.boframe.attr('src',url);
		
		this.boframe.on("load", this.proxy(function(){
			if (window.parent) {
				window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
			}
		}));
	},
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.qar_event_of_takingoff_airport.widgetjs = [ '../../../uui/widget/select2/js/select2.min.js', '../../../uui/widget/spin/spin.js',
		'../../../uui/widget/jqblockui/jquery.blockUI.js', '../../../uui/widget/ajax/layoutajax.js',
		'../../../uui/widget/jqurl/jqurl.js', './qarConfig.js'  ];
com.sms.dash.qar_event_of_takingoff_airport.widgetcss = [ {
	path : '../../../uui/widget/select2/css/select2.css'
} ];