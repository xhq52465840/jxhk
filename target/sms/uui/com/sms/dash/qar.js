// @ sourceURL=com.sms.dash.qar
$.u.define('com.sms.dash.qar', null, {
	init: function (mode, gadgetsinstanceid) {
  	this._initmode = mode;
    this._gadgetsinstanceid = gadgetsinstanceid;
    this._gadgetsinstance = null;        
  },
	afterrender : function(bodystr) {
		this.boframe = this.qid('boframe');
		this._getBoUrl();
		this.boframe.attr("src","");
	},
	_getBoUrl : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : 'json',
			type : 'post',
			cache : false,
			data : {
				'tokenid' : $.cookie("tokenid"),
				'method' : 'getBoUrl',
				'obj' : JSON.stringify({'tool':'YES','boId':'AadjPdO2D2pKu4Tduc_yPm0','lsMYear':'2014','lsMMonth':'9','lsMShow':'YES'})
			}
		},this.qid('boframe')).done(this.proxy(function(data) {
				if (data.success) {
					this.boframe.attr('src',data.data);
					if (window.parent) {
						window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
					}
				}
				})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.qar.widgetjs = [ '../../../uui/widget/select2/js/select2.min.js', '../../../uui/widget/spin/spin.js',
		'../../../uui/widget/jqblockui/jquery.blockUI.js', '../../../uui/widget/ajax/layoutajax.js',
		'../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.qar.widgetcss = [ {
	path : '../../../uui/widget/select2/css/select2.css'
} ];