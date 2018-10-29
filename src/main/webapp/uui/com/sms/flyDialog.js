//@ sourceURL=com.sms.flyDialog

$.u.define('com.sms.flyDialog', null, {
	init: function(options) {
		this._options = options || {};
		this._select2PageLength = 10;
		com.sms.flyDialog.i18n.tag = com.sms.flyDialog.i18n[$.cookie('locale') || 'zh'];		
		this._i18n = com.sms.flyDialog.i18n.tag;
		this._flightTemplate = '<div class="row"><div class="col-sm-11"><span style="margin-right:10px">#{flightNO}</span><span style="margin-right:10px">#{deptAirportName}</span>—<span  style="margin:0px 10px">#{arrAirportName}</span></div></div>';
	},
	afterrender: function(bodystr) {
		this.form = this.qid("flyForm");
		this.date = this.qid("date"); // 航班日期
		this.flightNumber = this.qid("flightnumber"); // 航班号
		this.flightPhase = this.qid("phase"); // 飞行阶段    	

		this.flyDialog = this.qid("div_flyDialog").dialog({
			title: this._i18n.title,
			width: 540,
			modal: true,
			draggable: false,
			resizable: false,
			autoOpen: false,
			buttons: [{
				text: this._i18n.buttons.add,
				click: this.proxy(this.on_ok_click)
			}, {
				text: this._i18n.buttons.cancel,
				"class": "aui-button-link",
				click: this.proxy(this.on_cancel_click)
			}],
			open: this.proxy(this.on_dialog_open),
			close: this.proxy(this.on_dialog_close),
			create: this.proxy(this.on_dialog_create)
		});
	},
	on_select2_open: function(e) {},
	/**
	 * @title at after dialog open execute
	 * @return void 
	 */
	on_dialog_open: function() {
		var zIndex = parseInt(this.flyDialog.parent().css("z-index"));
		$("body>.ui-dialog:last").css("z-index", zIndex + 2);
		$("body>.ui-widget-overlay:last").css("z-index", 1050);
	},
	/**
	 * @title at after dialog close execute
	 * @return void 
	 */
	on_dialog_close: function() {
		this.date.val("");
		this.flightNumber.select2("val", "");
		this.flightPhase.select2("val", "");
		this.form.validate().resetForm();
	},
	/**
	 * @title at after dialog create execute
	 * @return void 
	 */

	on_dialog_create: function() {
		this.form.validate({
			rules: {
				"date": {
					"required": true,
					"dateISO": true
				},
				"flightnumber": "required",
				"phase": "required"
			},
			messages: {
				"date": {
					"required": this._i18n.messages.isRequired,
					"dateISO": this._i18n.messages.dateFormatError
				},
				"flightnumber": this._i18n.messages.isRequired,
				"phase": this._i18n.messages.isRequired
			},
			errorClass: "text-danger text-validate-element",
			errorElement: "div"
		});
		this.flightNumber.select2({
			ajax: {
				url: $.u.config.constant.smsqueryserver,
				dataType: "json",
				type: "post",
				quietMillis: 250,
				data: this.proxy(function(flightNO, page) {
					return {
						"nologin": 'Y',
						"method": "getBaseInfo",
						"dataTime": this.date.val(),
						"flightNum": flightNO,
						"start": (page - 1) * this._select2PageLength,
						"length": this._select2PageLength
					};
				}),
				results: this.proxy(function(response, page, query) {
					if (response.success) {
						return {
							"results": response.data.aaData,
							"more": (page * this._select2PageLength) < response.data.iTotalRecords
						};
					} else {
						$.u.alert.error(response.reason);
					}
				})
			},
			id: function(item) {
				return item.flightInfoID;
			},
			formatResult: this.proxy(this._getFlightHtml),
			formatSelection: function(item) {
				return item.flightNO;
			}
		}).on("select2-open", this.proxy(this.on_select2_open));
		this.flightPhase.select2({
			ajax: {
				url: $.u.config.constant.smsqueryserver,
				dataType: "json",
				type: "post",
				quietMillis: 250,
				data: this.proxy(function(term, page) {
					return {
						"nologin": 'Y',
						"method": "stdcomponent.getbysearch",
						"dataobject": "dictionary",
						"rule": JSON.stringify([
							[{
								"key": $.cookie('locale') === 'en' ? 'nameEn' : 'name',
								"op": "like",
								"value": term
							}],
							[{
								"key": "type",
								"value": "飞行阶段"
							}]
						]),
						"start": (page - 1) * this._select2PageLength,
						"length": this._select2PageLength
					};
				}),
				results: this.proxy(function(response, page, query) {
					if (response.success) {
						return {
							results: response.data.aaData,
							more: page * this._select2PageLength < response.data.iTotalRecords
						};
					}
				})
			},
			//id:function(item){ return item.id; },
			formatResult: function(item) {
				return item.nameByLanguage;
			},
			formatSelection: function(item) {
				return item.nameByLanguage;
			}
		}).on("select2-open", this.proxy(this.on_select2_open));
		this.date.datepicker({
			dateFormat: "yy-mm-dd",
			changeMonth: true,
			changeYear: true,
			onSelect: this.proxy(function(dateText, inst) {
				if (this.flightDate != dateText) {
					this.flightNumber.select2("val", null);
				}
				this.flightDate = dateText;
			}),
			onClose: this.proxy(function() {
				this.flightNumber.select2("enable", this.form.validate().element(this.date));
			})
		});
	},
	/**
	 * @title ok event
	 * @return void
	 */
	on_ok_click: function() {
		var flightID = null,
			flightNumber = null,
			phaseID = null,
			flightPhase = null,
			date = null;
		if (this.form.valid()) {
			flightID = this.flightNumber.select2('val');
			flightNumber = this.flightNumber.select2('data').flightNO;
			phaseID = this.flightPhase.select2("val");
			flightPhase = this.flightPhase.select2("data").nameByLanguage;
			date = this.date.val();
			this.addFlight(date, flightID, flightNumber, phaseID, flightPhase);
		}
	},
	/**
	 * @title cancel event
	 * @return void
	 */

	on_cancel_click: function() {
		this.flyDialog.dialog("close");
	},
	/**
	 * @title open dialog
	 * @param {string} datetime 发生日期yyyy-mm-dd
	 * @return void
	 */
	open: function(options) {
		this.date.val(options);
		this.flyDialog.dialog("open");
	},
	 _getFlightHtml: function(flight){
	    	return this._flightTemplate.replace(/#\{flightNO\}/g, flight.flightNO)
	    							   .replace(/#\{deptAirportName\}/g, flight.deptCityName)
	    							   .replace(/#\{arrAirportName\}/g, flight.arrCityName); 
	    },
	/**
	 * @title function for override
	 */
	addFlight: function() {},
	destroy: function() {
		this.flightNumber.select2("destroy");
		this.flightPhase.select2("destroy");
		this.flyDialog.dialog("destroy").remove();
		this._super();
	}
}, {
	usehtm: true,
	usei18n: true
});


com.sms.flyDialog.widgetjs = ['../../uui/widget/validation/jquery.validate.js',
	'../../uui/widget/jqurl/jqurl.js',
	"../../uui/widget/spin/spin.js",
	"../../uui/widget/jqblockui/jquery.blockUI.js",
	"../../uui/widget/ajax/layoutajax.js"
];
com.sms.flyDialog.widgetcss = [];