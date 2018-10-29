$.u.load("com.eiosa.isarplink.isarpLink");
$.u.load("com.eiosa.isarpCharpter");
$.u.load("com.eiosa.section.sectionStatus");
$.u.define('com.eiosa.followMain', null, {
	init : function(options) {
		this._options = options || null;
		this.reportId = this._options.reportId;
		this.isarpLinkUm = null;
	},
	afterrender : function() {
		$("#tab_isarpLink").off('click').on('click',this.proxy(this._isarpLinkInit));	
		$("#tab_documentChapter").off('click').on('click',this.proxy(this._documentChapterInit));	
		$("#tab_sectionStatus").off('click').on('click',this.proxy(this._sectionStatusInit));
		$("#tab_isarpLink").click();
	},

	_isarpLinkInit : function() {
		var that=this;
		 async.waterfall([
//		                  that._checkurl,
//		                  that._loadpage,
//		         async.apply(that._checkurl),
//		         async.asyncify(that._loadpage),
		                  
				function (cb) {that._checkurl(cb); },
				function(valid, cb) {that._loadpage(valid, cb) },
			], function (err, result) {
				// log('1.1 err: ', err);
			} );
	},
	
	//检查是否有指定reportid后缀的页面文件
	_checkurl : function(next) {
		$.ajax({
			url : 'isarplink/isarpLink-'+this.reportId+'.html',
			type : 'GET',
			complete : function(response) {
				if (response.status == 200) {
					next(null, true);
				} else {
					next(null, false);
				}
			}
		});
	},
	
	_loadpage : function(valid, next) {
		//$("#isarpLink").load("isarplink/isarpLink"+(valid ? this.reportId : "")+".html");
		if(this.isarpLinkUm != null) delete this.isarpLinkUm;
		this.isarpLinkUm = new com.eiosa.isarplink.isarpLink($("div[umid='isarpLink']",this.$),{reportId :$.cookie("workReportId")}); 

		next(null);
	},
	_documentChapterInit:function(){
		new com.eiosa.isarpCharpter($("div[umid='documentChapter']",this.$),{"reportId":this.reportId}); 
 
	},
	_sectionStatusInit:function(){
	
		new com.eiosa.section.sectionStatus($("div[umid='sectionStatus']",this.$),{"reportId":this.reportId}); 
	}
	
}, {
	usehtm : true,
	usei18n : false
});





com.eiosa.followMain.widgetjs = [
		//"base.js", "../../uui/vue.min.js",
		//"../../uui/tooltip/myTooltip.js", "../../uui/util/htmlutil.js",
		//"../../uui/async/async.min.js",
 ];
com.eiosa.followMain.widgetcss = [ {
	//path : '../../uui/tooltip/jquery.tooltip.css'
},  ];