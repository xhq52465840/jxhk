//@ sourceURL=com.sms.common.stdcomponentdelete
$.u.define('com.sms.common.stdcomponentdelete', null, {
	init: function(options) {
		/*
		{
			body:"", 					// 显示html内容
			title:"",					// 标题
			dataobject:"",		// 删除数据对象名称
			dataobejctids:""	// 删除的数据编号 （数组的字符串格式）
		}
		*/
		this._options = options;
		this._i18n = com.sms.common.stdcomponentdelete.i18n;
		this.deleteDialog = $('<div/>').html(this._options.body || this._i18n.body).dialog({
			title: this._options.title || this._i18n.title,
			width: 540,
			modal: true,
			resizable: false,
			draggable: false,
			buttons: [{
				text: this._i18n.buttons.ok,
				click: this.proxy(function(e) {
					$(e.currentTarget).add($(e.currentTarget).next()).button("disable");
					$.u.ajax({
						url: $.u.config.constant.smsmodifyserver,
						dataType: "json",
						cache: false,
						data: {
							"tokenid": $.cookie("tokenid"),
							"method": "stdcomponent.delete",
							"dataobject": this._options.dataobject,
							"dataobjectids": this._options.dataobjectids,
							"dataobjectid": this._options.dataobjectid
						}
					}, this.deleteDialog.parent(), {
						size: 1,
						backgroundColor: 'transparent',
						selector: $(e.currentTarget).parent(),
						orient: "west"
					}).done(this.proxy(function(response) {
						if (response.success) {
							this.deleteDialog.dialog("close");
							$.u.alert.success(this._i18n.messages.success);
							this.refreshDataTable();
						} else {
							$.u.alert.error(response.reason, this.deleteDialog);
							$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
						}
					})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
						$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
					}));
				})
			}, {
				text: this._i18n.buttons.cancel,
				"class": "aui-button-link",
				click: this.proxy(function() {
					this.cancel();
					this.deleteDialog.dialog("close");
				})
			}],
			open: this.proxy(function() {
				var zIndex = $("body>.ui-dialog:last").css("z-index");
				$("body>.ui-dialog:last").css("z-index", zIndex + 2);
				$("body>.ui-widget-overlay:last").css("z-index", zIndex + 1);
			}),
			close: this.proxy(function() {
				this.deleteDialog.dialog("destroy").remove();
			})
		});
	},
	afterrender: function(bodystr) {

	},
	/**
	 * @title 删除成功后调用，用于重载
	 */
	refreshDataTable: function(){},
	/**
	 * @title 取消删除后调用，用于重载
	 */
	cancel: function(){},
	destroy: function() {
		this._super();
	}
}, {
	usehtm: false,
	usei18n: true
});


com.sms.common.stdcomponentdelete.widgetjs = ["../../../uui/widget/spin/spin.js", "../../../uui/widget/jqblockui/jquery.blockUI.js", "../../../uui/widget/ajax/layoutajax.js"];
com.sms.common.stdcomponentdelete.widgetcss = [];