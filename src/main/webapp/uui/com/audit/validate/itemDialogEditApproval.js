//@ sourceURL=com.audit.validate.itemDialogEditApproval
$.u.define('com.audit.validate.itemDialogEditApproval', null, {
    init: function(options) {
        this._options = options || {};
        this._options.actionItems = null;
    },
    afterrender: function(bodystr) {
        this.i18n = {
            savebtn: "提交",
            cancel: '取消',
        };

        this.form = this.qid("form");
        this.$actionItemContainer = this.qid('actionItemContainer');
        this.$auditComment = this.qid("auditComment");

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
     * @title Dialog创建时执行
     */
    on_dialog_create: function() {        
        this.form.validate({
            rules: {
                auditComment: 'required'
            },
            messages: {
                auditComment: '不能为空'
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
        if (this.form.valid()) {            
            this.onSave({auditComment:this.$auditComment.val()});
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
        this.$auditComment.val('');
        this.$actionItemContainer.empty();
        this.form.validate().resetForm();
    },
    /*
     * @title 禁用表单元素
     */
    disableForm: function() {
        this.$auditComment.attr('disable', true);
        this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * @title 启用表单元素
     */
    enableForm: function() {
        this.$auditComment.attr('disable', false);
        this.formDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
    },
    /*
     * 打开模态层
     * @param {object} params - 参数数据 {actionItems: [], title: ''}
     */
    open: function(params) {
        this._options.actionItems = params.actionItems;
        this.formDialog.dialog("option", {
            title: params.title
        }).dialog("open");
    },
    /*
     * @title 用于override
     * @param {object} data - 表单数据
     */
    onSave: function(data) {},
    destroy: function() {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});


com.audit.validate.itemDialogEditApproval.widgetjs = [
    '../../../uui/widget/select2/js/select2.min.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/validation/jquery.validate.js",
    "../../../uui/widget/ajax/layoutajax.js",
    "../../../uui/widget/uploadify/jquery.uploadify.js"
];
com.audit.validate.itemDialogEditApproval.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    id: "",
    path: "../../../uui/widget/uploadify/uploadify.css"
}];