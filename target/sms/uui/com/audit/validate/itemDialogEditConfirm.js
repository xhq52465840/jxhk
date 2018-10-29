//@ sourceURL=com.audit.validate.itemDialogEditConfirm
$.u.define('com.audit.validate.itemDialogEditConfirm', null, {
    init: function(options) {
        this._options = options || {};
        this._options.actionItems = null;
     	this._attachmentIds = []; // 上传附件的id集合
       
    },
    afterrender: function(bodystr) {
    	
        this.i18n = {
            savebtn: "提交",
            cancel: '取消',
        };

        this.form = this.qid("form");
        this.$actionItemContainer = this.qid('actionItemContainer');
        this.$processors = this.qid("processors");
        this.$attachment = this.qid("attachment");
        this.$confirmComment= this.qid("confirmComment");
        this.formDialog = this.qid("item-dialog-edit").dialog({
            title: '',
            width: 740,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                text: this.i18n.savebtn,
                click: this.proxy(this.on_dialog_ok)
            }, {
                text: this.i18n.cancel,
                "class": "aui-button-link",
                click: this.proxy(this.on_dialog_cancel)
            }],
            create: this.proxy(this.on_dialog_create),
            open: this.proxy(this.on_dialog_open),
            close: this.proxy(this.on_dialog_close)
        });
    },
    /*
     * 打开模态层
     * @param {object} params - 参数数据 {actionItems: [], title: ''}
     */
    open: function(params) {
    	this._attachmentIds = [];
        this._options.actionItems = params.actionItems;
        this.formDialog.dialog("option", {
            title: params.title
        }).dialog("open");
    },
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax: function(data) {
        this.disableForm();
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            "data": data
        }, this.qid("unit-dialog-edit").parent(), {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.formDialog.dialog("close");
                this.refreshDataTable();
                $.u.alert.success("操作成功");
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(jqXHR, errorStatus) {
            this.enableForm();
        }));
    },
    /*
     * @title Dialog创建时执行
     */
    on_dialog_create: function() {
        this.$processors.select2({
            width: '100%',
            placeholder: '请选择审批人',
            multiple: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getActionItemAuditors",
                        term: term,
                        start: (page - 1) * 10,
                        length: 10
                    };
                },
                results: function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: page * 10 < response.data.iTotalRecords
                        };
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                }
            },
            formatResult: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
            },
            formatSelection: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname+ "(" + item.username + ")";
            }
        });
        this.$attachment.uploadify({
            'auto': false,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
            'uploader': $.u.config.constant.smsmodifyserver + ";jsessionid=" + $.cookie("sessionid"),
            'fileTypeDesc': 'doc', //文件类型描述
            'fileTypeExts': '*.*', //可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
            'removeCompleted': false,
            'buttonText': '选择附件', //按钮上的字
            'cancelImg': this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
            'height': 25, //按钮的高度和宽度
            'width': 140,
            'progressData': 'speed',
            'method': 'get',
            'removeTimeout': 3,
            'successTimeout': 99999,
            'multi': true,
            'fileSizeLimit': '10MB',
            'queueSizeLimit': 999,
            'simUploadLimit': 999,
            'onQueueComplete': this.proxy(function(queueData) {
                if (queueData.uploadsErrored > 0) {
                    $.u.alert.error("上传失败：" + data.reason, 3000);
                } else {
                    this._sendModifyAjax({
                        "tokenid": $.cookie("tokenid"),
                        "method": "confirmActionItems",
                        "fileIds": JSON.stringify(this._attachmentIds),
                        "processor": JSON.stringify($.map(this.$processors.select2('val'), function(value, idx){
                            return parseInt(value);
                        })),
                        "confirmComment":this.$confirmComment.val(),
                        "actionItemIds": JSON.stringify($.map(this._options.actionItems, function(item, idx) {
                            return item.id;
                        }))
                    });
                }
            }),
            'onUploadStart': this.proxy(function(file) {
                this.$attachment.uploadify('settings', 'formData', {
                    method: 'uploadFiles',
                    tokenid: $.cookie("tokenid"),
                    sourceType: 27
                });
            }),
            'onUploadSuccess': this.proxy(function(file, data, response) {
                if (data) {
                    data = JSON.parse(data);
                    if (data.success) {
                        this._attachmentIds = this._attachmentIds.concat($.map(data.data.aaData, function(item, idx) {
                            return item.id;
                        }));
                    } else {
                        $.u.alert.error("上传失败：" + data.reason, 3000);
                    }
                }
            })
        });
        this.form.validate({
            rules: {
                processors: 'required'
            },
            messages: {
                processors: '不能为空'
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
    },
    /**
     * @title Dialog打开时执行
     */
    on_dialog_open: function(){
        this.enableForm();
        this.fillFormData(this._options.actionItems);
    },
    /**
     * @title Dialog关闭时执行
     */
    on_dialog_close: function(){
        this.clearFormData();
    },
    /**
     * @title Dialog确认时执行
     */
    on_dialog_ok: function(e){
    	var mapdata= JSON.stringify($.map(this._options.actionItems, function(item, idx) {
            return item.id;
    	}));
        if (this.form.valid()) {
            if (this.$attachment.data('uploadify').queueData.queueLength > 0) {
                this.$attachment.uploadify('upload', '*');
            } else {
                this._sendModifyAjax({
                    "tokenid": $.cookie("tokenid"),
                    "method": "confirmActionItems",
                    "processor": JSON.stringify($.map(this.$processors.select2('val'), function(value, idx) {
                        return parseInt(value);
                    })),
                    "confirmComment":this.$confirmComment.val(),
                    "actionItemIds": JSON.stringify($.map(this._options.actionItems, function(item, idx) {
                        return item.id;
                    }))
                });
            }
        }
    },
    /**
     * @title Dialog取消时执行
     */
    on_dialog_cancel: function(){
        this.formDialog.dialog("close");
    },
    /*
     * @title 填充表单数据
     * @param {Array} data - 数据集合
     */
    fillFormData: function(data) {           
        $.each(data || [], this.proxy(function(idx, item) {
            $('<tr><td>' + item.description + '</td><td>' + $.map(item.organizations, function(org, idx) {
                return org.name;
            }).join(',') + '</td></tr>').appendTo(this.$actionItemContainer);
        }));
    },
    /*
     * @title 清空表单数据和校验错误信息
     */
    clearFormData: function() {
        this.$attachment.uploadify('cancel', '*');
        this.$processors.select2('val', null);
        this.$confirmComment.val("");
        this.$actionItemContainer.empty();
        this.form.validate().resetForm();
    },
    /*
     * @title 禁用表单元素
     */
    disableForm: function() {
        this.$processors.select2('enable', false);
        this.$confirmComment.attr("disabled","disabled");
        this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * @title 启用表单元素
     */
    enableForm: function() {
        this.$processors.select2('enable', true);
        this.$confirmComment.attr("disabled",false);
        this.formDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
    },
    /*
     * @title 用于override
     */
    refreshDataTable: function() {},
    destroy: function() {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});


com.audit.validate.itemDialogEditConfirm.widgetjs = [
    '../../../uui/widget/select2/js/select2.min.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/validation/jquery.validate.js",
    "../../../uui/widget/ajax/layoutajax.js",
    "../../../uui/widget/uploadify/jquery.uploadify.js"
];
com.audit.validate.itemDialogEditConfirm.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    id: "",
    path: "../../../uui/widget/uploadify/uploadify.css"
}];