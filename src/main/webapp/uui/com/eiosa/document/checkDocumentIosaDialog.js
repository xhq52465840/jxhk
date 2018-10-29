$.u.define('com.eiosa.document.checkDocumentIosaDialog', null, {
	init : function(options) {
		this._options = options || null;
		this.docId = this._options.docId;
		this.sectionName = this._options.sectionName;
		this.reportId = $.cookie("workReportId");
	},
	afterrender : function() {
		this.checkDocument = new Vue({
			el : '#checkDocument',
			data : {
				iosadocuments : '',
				child_modified : false
			},
			methods : {
				iosadoccheck : this.proxy(this._checkDocumentIosa),
				openIsarp : this.proxy(this._openIsarp),
			}
		});
		this._load();
	},

	_initdata : function(data) {
		this.checkDocument.$set("iosadocuments", data);
	},

	_load : function(e) {
		// 根据传入的参数，显示强调字体
		$('.linkspot').css('fontWeight', 'bold');
		$('.linkspot').css('fontStyle', 'italic');
		$('.linkspot').css('backgroundColor', '#ffff00');
	},

	_checkDocumentIosa : function(e) {
		var flag = $(e.currentTarget).attr("value");
		eiosaMainUm.docListUm.sectionDocVue.$set("child_modified2", flag);
		layer.close(this.myLayerIndex);
	},

	// 打开isarp detail
	_openIsarp : function(e) {
		var sectionName = $('.sectionName', e.currentTarget).text();
		var chapter = $('.chapter', e.currentTarget).text();
		var url = "/sms/uui/com/eiosa/audit/auditEdit.html?chapter=" + chapter + "&sectionName=" + sectionName + "&reportId=" + this.reportId;
		window.open(url);
	},

}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.document.checkDocumentIosaDialog.widgetjs = [];
com.eiosa.document.checkDocumentIosaDialog.widgetcss = [];