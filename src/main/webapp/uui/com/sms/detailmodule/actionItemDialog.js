//@ sourceURL=com.sms.detailmodule.actionItemDialog
$.u.define('com.sms.detailmodule.actionItemDialog', null, {
    init: function(option) {
        this._options = option || {};
        this.TITLE = null; // dialog title    	
    },
    afterrender: function(bodystr) {
        this.i18n = com.sms.detailmodule.actionItemDialog.i18n;

        this.formDialog = this.qid("dialog").dialog({
            title: this.i18n.title,
            width: 900,
            minHeight: 500,
            position: ["center", 150],
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text": this.i18n.close,
                "class": "aui-button-link",
                "click": this.proxy(this.on_formDialogClose_click)
            }],
            create: this.proxy(this.on_formDialog_create),
            open: this.proxy(this.on_formDialog_open),
            close: this.proxy(this.on_formDialog_close)
        });

    },
    /**
     * @title 关闭
     * @return void
     */
    on_formDialogClose_click: function() {
        this.formDialog.dialog("close");
    },
    /**
     * @title 模态层创建时执行
     * @returns void
     */
    on_formDialog_create: function() {
        var clz = $.u.load("com.sms.detailmodule.actionItem");
        this.actionItem = new clz($("div[umid=actionItem]", this.qid("dialog")), {
            "mode": "TEM",
            "cate": this._options.cate,
            "activity": this._options.activity,
            "statusCategory": this._options.statusCategory,
            "editable": this._options.editable
        });
    },
    /**
     * @title 模态层中打开执行
     * @return void 
     */
    on_formDialog_open: function() {
        this.actionItem.reload();
    },
    /**
     * @title 模态层关闭执行
     * @return void
     */
    on_formDialog_close: function() {
        this.actionItem.empty();
        this.refreshControlMeasure(); // 刷新控制措施
    },
    /**
     * @title 打开模态层
     * @param id {int}  data id
     * @param title {string} dialog title
     * @return void
     */
    open: function(id, title) {
        if (this._options.cate == "CLAUSE") {
            this.actionItem.CLAUSE_ID = id;
        } else {
            this.actionItem.CONTROL_MEASURE_ID = id;
        }
        this.TITLE = title;
        this.formDialog.parent().find("span.ui-dialog-title").css({
            "width": "100%",
            "white-space": "nowrap"
        }).attr("title", this.TITLE);
        this.formDialog.dialog("option", "title", this.i18n.title + "(" + this.TITLE + ")").dialog("open");
    },
    /**
     * @title 用于重载nan
     */
    refreshControlMeasure: function() {},
    destroy: function() {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.detailmodule.actionItemDialog.widgetjs = ['../../../uui/widget/jqurl/jqurl.js', ];
com.sms.detailmodule.actionItemDialog.widgetcss = [];