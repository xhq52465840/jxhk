//@ sourceURL=com.audit.innerAudit.xitong_jihua.zhenggaidan_dialog
$.u.define('com.audit.innerAudit.xitong_jihua.zhenggaidan_dialog', null, {
	init: function(options) {
		this._options = options || {};
	},
	afterrender: function(bodystr) {
		this.curr_data;
		this.form = this.qid("recordDialog").find("form");
		this.createDialog();
		this.readonlyForm();
		this.initform();

		if (this._options.data.required) {
			var rules = [],
				messages = [];
			$.each(this._options.data.required.split(","), this.proxy(function(idx, item) {
				var $item = $("[name=" + item.trim() + "]", this.form);
				rules[item] = {
					required: true
				};
				messages[item] = {
					required: "该项不能为空"
				};
				var $firstdiv = $item.closest(".form-group").children("div:first")
				if ($firstdiv.find("span.text-danger").length < 1) {
					$("<span class='text-danger'>&nbsp;*</span>").appendTo($firstdiv);
				}
			}))
			this.form.validate({
				rules: rules,
				messages: messages,
				errorClass: "text-danger text-validate-element",
				errorElement: "div"
			});
		}
		this.qid("completDate").datepicker({
			dateFormat: "yy-mm-dd"
		});
		this.qid("dialog_uploadFile").on("click", ".dialog_del-file", this.proxy(this.dialog_delete_file));
		this.qid("auditFiles").off("click", ".download-file").on("click", ".download-file", this.proxy(this.on_downloadFile_click));
		this.qid("auditFiles").off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
		this.init_dialog_data();
	},

	initform: function() {
		this.improveName = $("[name=improveName]", this.form); //所属整改通知单
		this.improveNo = $("[name=improveNo]", this.form); //整改通知单编号
		this.auditunit_Name = $("[name=auditunit_Name]", this.form); //签发单位
		this.improveUnit = $("[name=improveUnit]", this.form); //主要责任单位
		this.auditedunit_Name = $("[name=auditedunit_Name]", this.form); //整改单位
		this.improveUnit2 = $("[name=improveUnit2]", this.form); //额外责任单位
		this.improveResponsiblePerson = $("[name=improveResponsiblePerson]", this.form); //责任人
		this.issues = $("[name=issues]", this.form); //存在问题
		this.reasonType = $("[name=reasonType]", this.form); //原因分类
		this.improveReason = $("[name=improveReason]", this.form); //产生原因
		this.improveMeasure = $("[name=improveMeasure]", this.form); //整改措施
		this.auditOpinion = $("[name=auditOpinion]", this.form); //审核意见
		this.improveRemark = $("[name=improveRemark]", this.form); //整改完成情况
		this.startDate = $("[name=startDate]", this.form);
		this.endDate = $("[name=endDate]", this.form);
		this.reasonType.select2({
			placeholder: "选择原因类型",
			multiple: true,
			ajax: {
				url: $.u.config.constant.smsqueryserver,
				type: "post",
				dataType: "json",
				data: function(term, page) {
					return {
						tokenid: $.cookie("tokenid"),
						method: "stdcomponent.getbysearch",
						dataobject: "auditReason"
					};
				},

				results: function(data, page) {
					if (data.success) {
						return {
							results: $.map(data.data.aaData, function(item, idx) {
								return item;
							})
						};
					}
				}
			},
			formatResult: function(item) {
				return "<b>" + item.name + "</b> : <samp>" + (item.description || "") + "</samp>";
			},
			formatSelection: this.proxy(function(item) {
				return item.name;
			})
		});

	},
	readonlyForm: function() {
		this.form.find("input, textarea").attr("readonly", true)
	},



	on_downloadFile_click: function(e) {
		e.preventDefault();
		var data = parseInt($(e.currentTarget).attr("fileid"));
		window.open($.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([data]) + "&url=" + window.location.href);
	},

	on_deleteFile_click: function(e) {
		var $this = $(e.currentTarget),
			$tr = $this.closest("tr"),
			data = $(e.currentTarget).closest("tr").data("data");
		if (data && data.id) {
			var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
			var confirm = new clz({
				"body": "确认删除？",
				"buttons": {
					"ok": {
						"click": this.proxy(function() {
							$.u.ajax({
								url: $.u.config.constant.smsmodifyserver,
								type: "post",
								dataType: "json",
								data: {
									tokenid: $.cookie("tokenid"),
									method: "stdcomponent.delete",
									dataobject: "file",
									dataobjectids: JSON.stringify([data.id])
								}
							}, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
								if (response.success) {
									confirm.confirmDialog.dialog("close");
									$tr.fadeOut(this.proxy(function() {
										$tr.remove();
										if (this.qid("auditFiles").children("tbody").children("tr").length < 1) {
											this.qid("auditFiles").addClass("hidden");
										}
									}));
								}
							}));
						})
					}
				}
			});
		}
	},
	dialog_delete_file: function(e) {
		var file_id = $(e.currentTarget).attr("name");
		var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
		var confirm = new clz({
			"body": "确认删除？",
			"buttons": {
				"ok": {
					"click": this.proxy(function() {
						$.u.ajax({ //删除文件
							url: $.u.config.constant.smsmodifyserver,
							type: "post",
							dataType: "json",
							cache: false,
							data: {
								"method": "stdcomponent.delete",
								"dataobjectids": JSON.stringify([parseInt(file_id)]),
								"tokenid": $.cookie("tokenid"),
								"dataobject": "file"
							},
						}, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
							if (response.success) {
								confirm.confirmDialog.dialog("close");
								this.init_dialog_data();
							}
						}))
					})
				}
			}
		});
	},

	//初始化数据
	init_dialog_data: function() {
		$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type: "post",
			dataType: "json",
			cache: false,
			data: {
				"method": "getImproveRecordById",
				"id": this._options.id, //数据的ID
				"tokenid": $.cookie("tokenid"),
			},
		}, this.qid("recordDialog").parent()).done(this.proxy(function(response) {
			if (response.success) {
				this.curr_data = response;
				if (response.data.improve) {
					var IMDATA = response.data.improve;
					this.improve_id = IMDATA.id || "";
					this.improveName.val(IMDATA.improveName || ""); //整改反馈名称
					this.improveNo.val(IMDATA.improveNo || ""); //整改反馈单编号
					this.auditunit_Name.val(IMDATA.operator ? IMDATA.operator.name : ""); //审计单位
					this.auditedunit_Name.val(IMDATA.target ? IMDATA.target.name : ""); //被审计的单位  ,整改单位
					this.startDate.val(response.data.improveLastDate || '');
					this.endDate.val(IMDATA.endDate || '');
				}
				this.improveUnit.val(response.data.improveUnit ? response.data.improveUnit.name : ""); //主要责任单位
				this.improveResponsiblePerson.val(response.data.improveResponsiblePerson || '');
				this.improveUnit2.val(response.data.improveUnit2 ? response.data.improveUnit2.name : ""); //额外责任单位
				this.issues.val("检查要点：" + (response.data.itemPoint || "") + "\n" + "审计记录：" + (response.data.auditRecord || ""));

				var reasonTypeArr = [];
				$.each(response.data.auditReason || [], this.proxy(function(idx, item) {
					reasonTypeArr.push({
						"id": item.id,
						"name": item.name
					});
				}))
				this.reasonType.select2("data", reasonTypeArr) //原因类型
				this.improveReason.val(response.data.improveReason || ''); //产生原因
				this.improveMeasure.val(response.data.improveMeasure || ''); //整改措施
				this.auditOpinion.val(response.data.auditOpinion || '') //审核意见
				this.improveRemark.val(response.data.improveRemark || ''); //整改完成情况
				if (this._options.data.canModify) {
					$.each(this._options.data.canModify.split(","), this.proxy(function(idx, item) {
						var $item = $("[name=" + item.trim() + "]", this.form);
						if ($item.length) {
							var $formgroup = $item.closest(".form-group");
							if ($formgroup.length) {
								$formgroup.hasClass("hidden") && $formgroup.removeClass("hidden");
								if (!this._options.data.readonly) {
									if ($item.hasClass("select2-offscreen")) {
										$item.select2("readonly", false)
									} else {
										$item.attr("readonly", false) //不是readonly的可改，其他人可见不可改
									}
								}
							}
						}
					}))
				}

			}

			var $tbody = this.qid("auditFiles").children("tbody");
			$tbody.empty();
			if ($.isArray(response.data.files) && response.data.files.length > 0) {
				this.qid("auditFiles").removeClass("hidden");
				$.each(response.data.files || [], this.proxy(function(idx, file) {
					$("<tr>" +
						"<td class='break-word'><a href='#' class='download-file' fileid='" + file.id + "'>" + file.fileName + "</a></td>" +
						"<td>" + file.size + "</td>" +
						"<td>" + ((this.ismodify == "cannotmodify" || response.data.improveItemStatus.code == "8") === true ? "" : "<i class='fa fa-trash-o uui-cursor-pointer delete-file'/>") + "</td>" +
						"</tr>").data("data", file).appendTo($tbody);
				}));
			}

			this.qid("file_upload").uploadify({
				'auto': true,
				'swf': this.getabsurl('../../../../uui/widget/uploadify/uploadify.swf'),
				'uploader': $.u.config.constant.smsmodifyserver + ";jsessionid=" + $.cookie("sessionid"),
				'fileTypeDesc': 'doc',
				'fileTypeExts': '*.*', //可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
				'removeCompleted': true,
				'buttonText': "上传附件",
				'cancelImg': this.getabsurl('../../../../uui/widget/uploadify/uploadify-cancel.png'),
				'height': 25, //按钮的高度和宽度
				'width': 70,
				'progressData': 'speed',
				'method': 'get',
				'removeTimeout': 3,
				'successTimeout': 99999,
				'multi': true,
				'fileSizeLimit': '10MB',
				'queueSizeLimit': 999,
				'simUploadLimit': 999,
				'onQueueComplete': this.proxy(function(queueData) {

					if (queueData.uploadsErrored < 1) {

					} else {
						$.u.alert.error(data.reason, 1000 * 3);
					}
				}),
				"onSWFReady": this.proxy(function() {
					var istrue = true;
					if (this.ismodify == "cannotmodify" || response.data.improveItemStatus.code == "4" || response.data.improveItemStatus.code == "6" || response.data.improveItemStatus.code == "7") {
						istrue = false;
					}
					this.qid("file_upload").uploadify("disable", istrue === false);
					if (response.data.improveItemStatus.code == "0" || response.data.improveItemStatus.code == "2") {
						this.qid("file_upload").uploadify("disable", true);
					} else if (response.data.improveItemStatus.code == "4") {
						this.qid("file_upload").uploadify("disable", false);
					}
				}),
				'onUploadStart': this.proxy(function(file) {
					var data = {
						tokenid: $.cookie("tokenid"),
						method: "uploadFiles",
						sourceType: 7,
						source: this._options.id
					};
					this.qid("file_upload").uploadify('settings', 'formData', data);
					this.$.find(".uploadify-queue").removeClass("hidden");
				}),
				'onUploadSuccess': this.proxy(function(file, data, response) {
					if (data) {
						data = JSON.parse(data);
						if (data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length > 0) {
							var $tbody = this.qid("auditFiles").children("tbody");
							var file = data.data.aaData[0];

							this.$.find(".uploadify-queue").addClass("hidden");
							if (!this.qid("auditFiles").is(":visible")) {
								this.qid("auditFiles").removeClass("hidden");
							}
							$("<tr>" +
								"<td class='break-word'><a href='#'>" + file.fileName + "</a></td>" +
								"<td>" + file.size + "</td>" +
								"<td><i class='fa fa-trash-o uui-cursor-pointer delete-file'/></td>" +
								"</tr>").data("data", file).appendTo($tbody);
						} else {
							$.u.alert.error(data.reason, 1000 * 3);
						}
					}
				})
			});
		}))
	},

	open: function() {
		this.qid("recordDialog").dialog("open");
	},


	createDialog: function() {
		//填写原因和措施  保存
		//passed,noPassed,noMethodComplete
		var oppo = {
			baocun: {
				"text": "保存",
				"class": "btn btn-default btn-sm",
				"click": this.proxy(this.on_recordDialog_baocun)
			},
			passed: {
				"text": "审核通过",
				"class": "btn btn-default btn-sm",
				"click": this.proxy(this.on_recordDialog_passed)
			},
			noPassed: {
				"text": "审核拒绝",
				"class": "btn btn-default btn-sm",
				"click": this.proxy(this.on_recordDialog_noPassed)
			},
			noMethodComplete: {
				"text": "暂时无法完成",
				"class": "btn btn-default btn-sm",
				"click": this.proxy(this.on_recordDialog_noMethodComplete)
			},
			save: {
				"text": "保存",
				"class": "btn btn-default btn-sm",
				"click": this.proxy(this.on_recordDialog_save)
			},
			//commit 被剔除
			commit: {
				"text": "提交",
				"class": "btn btn-default btn-sm",
				"click": this.proxy(this.on_recordDialog_commit)
			},
			close: {
				"text": "关闭",
				"class": "aui-button-link",
				"click": this.proxy(this.on_recordDialog_close)
			}
		}
		var buttonsArray = []
		$.each(this._options.data.buttons, this.proxy(function(idx, item) {
			oppo[item] && buttonsArray.push(oppo[item]);
		}))
		this.recordDialog = this.qid("recordDialog").dialog({
			title: "整改反馈记录",
			width: 840,
			height: 570,
			modal: true,
			draggable: false,
			resizable: false,
			autoOpen: false,
			closable: true,
			buttons: buttonsArray,
		});
	},


	transform_data_type: function(data) {
		var obj = {};
		$.each(data, function(k, v) {
			obj[v.name] = v.value;
		});
		return obj;
	},
	getFormData: function() {
		var serData = this.transform_data_type($(":not([readonly]):enabled", this.form).serializeArray());
		var selArray = $(".select2-offscreen:not([readonly]):visible:enabled", this.form);
		var reData = {};
		$.each(selArray, this.proxy(function(k, value) {
			var name = $(value).attr("name");
			var prop = [];
			$.each($(value).select2("data"), this.proxy(function(idx, item) {
				prop.push(item.id)
			}))
			reData[name] = prop.join(",");
		}))
		return $.extend(serData, reData);
	},


	on_recordDialog_passed: function(e) {
		this.on_recordDialog_handel("pass");
	},
	on_recordDialog_noPassed: function(e) {
		this.on_recordDialog_handel("reject");
	},
	on_recordDialog_noMethodComplete: function(e) {
		this.on_recordDialog_handel("uncompleted");
	},

	//整改审核时操作
	on_recordDialog_handel: function(istype) {
		if (!this.form.valid()) {
			this.auditOpinion.focus();
			return
		}
		var data = this.getFormData();
		var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
		var confirm = new clz({
			"body": "确认操作？",
			"buttons": {
				"ok": {
					"click": this.proxy(function() {
						$.u.ajax({ //审核通过服务
							url: $.u.config.constant.smsmodifyserver,
							type: "post",
							dataType: "json",
							cache: false,
							data: {
								"method": "updateImproveRecordStatus",
								"id": this._options.id,
								"tokenid": $.cookie("tokenid"),
								"auditOpinion": data.auditOpinion,
								"operate": istype
							},
						}, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
							if (response.success) {
								confirm.confirmDialog.dialog("close");
								this.recordDialog.dialog("close");
								$.u.alert.success("操作成功");
								this.refresh();
							} else {
								$.u.alert.error(response.reason);
							}
						}))
					})
				}
			}
		})

	},
	//填写原因和措施时的保存
	on_recordDialog_baocun: function() {
		var data = this.getFormData();
		if (this._options.id != "" && this.form.valid()) {
			$.u.ajax({
				url: $.u.config.constant.smsmodifyserver,
				type: "post",
				dataType: "json",
				cache: false,
				data: {
					"method": "updateImproveRecordReasonAndMeasure",
					"id": this._options.id,
					"auditReason": data.reasonType,
					"improveReason": data.improveReason,
					"improveMeasure": data.improveMeasure,
					"improveResponsiblePerson": data.improveResponsiblePerson,
					"tokenid": $.cookie("tokenid"),
				},
			}, this.qid("recordDialog").parent()).done(this.proxy(function(response) {
				if (response.success) {
					$.u.alert.success("保存成功");
					this.recordDialog.dialog("close");
					this.refresh();
				} else {
					$.u.alert.error(response.reason);
				}
			}))
		}
	},
	//填写完成情况时的保存事件
	on_recordDialog_save: function(e) {
		if (!this.form.valid()) {
			return;
		}
		var data = this.getFormData();
		if (this._options.id != "") {
			$.u.ajax({
				url: $.u.config.constant.smsmodifyserver,
				type: "post",
				dataType: "json",
				cache: false,
				data: {
					"method": "updateImproveRecordCompletion",
					"id": this._options.id,
					"tokenid": $.cookie("tokenid"),
					"obj": JSON.stringify(data)
				},
			}, this.qid("recordDialog").parent()).done(this.proxy(function(response) {
				if (response.success) {
					$.u.alert.success("保存成功");
					this.recordDialog.dialog("close");
					this.refresh();
				} else {
					$.u.alert.error(response.reason);
				}
			}))
		}
	},
	//填写完成情况时的提交事件
	on_recordDialog_commit: function(e) {
		if (!this.form.valid()) {
			this.improveRemark.focus();
			return;
		}
		var data = this.getFormData();
		if (this._options.id != "") {
			$.u.ajax({
				url: $.u.config.constant.smsmodifyserver,
				type: "post",
				dataType: "json",
				cache: false,
				data: {
					"method": "commitImproveRecordCompletion",
					"id": this._options.id,
					"tokenid": $.cookie("tokenid"),
					"obj": JSON.stringify(data)
				},
			}, this.qid("recordDialog").parent()).done(this.proxy(function(response) {
				if (response.success) {
					$.u.alert.success("保存成功");
					this.recordDialog.dialog("close");
					this.refresh();
				} else {
					$.u.alert.error(response.reason);
				}
			}))
		}
	},
	on_recordDialog_close: function() {
		this.recordDialog.dialog("close");
	},
	close: function() {},
	refresh: function(data) {}
}, {
	usehtm: true,
	usei18n: false
});

com.audit.innerAudit.xitong_jihua.zhenggaidan_dialog.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
	"../../../../uui/widget/uploadify/jquery.uploadify.js",
	"../../../../uui/widget/spin/spin.js",
	"../../../../uui/widget/jqblockui/jquery.blockUI.js",
	"../../../../uui/widget/ajax/layoutajax.js",
	'../../../../uui/widget/jqurl/jqurl.js'
];
com.audit.innerAudit.xitong_jihua.zhenggaidan_dialog.widgetcss = [{
		path: "../../../../uui/widget/select2/css/select2.css"
	}, {
		path: "../../../../uui/widget/select2/css/select2-bootstrap.css"
	},


	{
		path: "../../../../uui/widget/uploadify/uploadify.css"
	}
];