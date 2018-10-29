$.u.define('com.eiosa.isarplink.isarpLink', null, {
	init : function(options) {
		this._options = options || null;
		this.reportId = this._options.reportId;
	},
	afterrender : function() {
		$('.linkspot').on('click', this.proxy(this._openIsarp));
		 if (typeof(this._options.sourceSection)!='undefined' && this._options.sourceSection!='undefined' ) {
			 //根据传入的参数，显示强调字体
			 var obj = this._getJQBySectionAndNo(this._options.sourceSection, this._options.sourceNo);
			 obj.parent().css('fontWeight','bold');
			 obj.parent().css('fontStyle','italic');
			 obj.parent().css('backgroundColor','#ffff00');
		 }
	},

	exists : function(sectionName, no) {
		//console.log($('.linkspot .sectionName:contains(ORG)~.chapter:contains(1.1.10A)'));
		var obj = this._getJQBySectionAndNo(sectionName, no);
		return obj.length>0;
	},
	
	_getJQBySectionAndNo : function(sectionName, no) {
		var obj = $('.linkspot .sectionName:contains('+sectionName+')~.chapter:contains('+no+')');
		return obj;
	},
	
   //打开isarp detail
   _openIsarp:function(e){
	   var sectionName = $('.sectionName', e.currentTarget).text();
	   var chapter = $('.chapter', e.currentTarget).text();
	   var url="/sms/uui/com/eiosa/audit/auditEdit.html?chapter="+ chapter+"&sectionName="+sectionName+"&reportId="+this.reportId;
	   window.open(url);
   },

}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.isarplink.isarpLink.widgetjs = [
		//"../base.js", "../../../uui/vue.min.js",
		//"../../../uui/tooltip/myTooltip.js", "../../../uui/util/htmlutil.js",
];
com.eiosa.isarplink.isarpLink.widgetcss = [{
	//path : '../../../uui/tooltip/jquery.tooltip.css'
},];