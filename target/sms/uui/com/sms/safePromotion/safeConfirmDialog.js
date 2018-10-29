//@ sourceURL=com.sms.safePromotion.safeConfirmDialog
$.u.define('com.sms.safePromotion.safeConfirmDialog', null, {
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
        this.$attachment = this.qid("attachment");
        close: this.proxy(this.on_dialog_close)
        this.formDialog = this.qid("item-dialog-edit").dialog({
            title: '附件上传',
            width: 740,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                text: "确定",
                click: this.proxy(this.on_dialog_ok)
            }, {
                text: "关闭",
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
         this._options.fullid = params;
        this.formDialog.dialog("option", {
            title: "上传附件"
        }).dialog("open");
    },
    /*
     * @title Dialog创建时执行
     */
    on_dialog_create: function() {
        this.$attachment.uploadify({
            'auto': false,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
            'uploader': $.u.config.constant.smsmodifyserver + ";jsessionid=" + $.cookie("sessionid"),
            'fileTypeDesc': 'doc', //文件类型描述
            'fileTypeExts': '*.*', //可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
            'removeCompleted': false,
            'buttonText': '选择附件', //按钮上的字
            'cancelImg': this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
            'height': 30, //按钮的高度和宽度
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
                	this.formDialog.dialog("close");
                }
            }),
            'onUploadStart': this.proxy(function(file) {
                this.$attachment.uploadify('settings', 'formData', {
                    method: 'uploadFiles',
                    source:this._options.fullid,
                    tokenid: $.cookie("tokenid"),
                    sourceType: 25
                });
            }),
            'onUploadSuccess': this.proxy(function(file, data, response) {
                if (data) {
                    data = JSON.parse(data);
                    if (data.success) {
                        this._attachmentIds = this._attachmentIds.concat($.map(data.data.aaData, function(item, idx) {
                            return item.id;
                        }));
                        this.overTable();
                    } else {
                        $.u.alert.error("上传失败：" + data.reason, 3000);
                    }
                }
            })
        });
    },
    /**
     * @title Dialog打开时执行
     */
    on_dialog_open: function(){
    },
    /**
     * @title Dialog关闭时执行
     */
    on_dialog_close: function(){
        this.clearFormData();
    },
    overTable:function(){
    	
    },
    /**
     * @title Dialog确认时执行
     */
    on_dialog_ok: function(e){
            if (this.$attachment.data('uploadify').queueData.queueLength > 0) {
                this.$attachment.uploadify('upload', '*');
            } 
    },
    /**
     * @title Dialog取消时执行
     */
    on_dialog_cancel: function(){
        this.formDialog.dialog("close");
    },
    /*
     * @title 清空表单数据和校验错误信息
     */
    clearFormData: function() {
        this.$attachment.uploadify('cancel', '*');
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


com.sms.safePromotion.safeConfirmDialog.widgetjs = [
    '../../../uui/widget/select2/js/select2.min.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/validation/jquery.validate.js",
    "../../../uui/widget/ajax/layoutajax.js",
    "../../../uui/widget/uploadify/jquery.uploadify.js"
];
com.sms.safePromotion.safeConfirmDialog.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    id: "",
    path: "../../../uui/widget/uploadify/uploadify.css"
}];