//@ sourceURL=com.sms.activityinfo.selectMan
/**
 * 选择审核人
 * @author wans
 */
"use strict";
$.u.define('com.sms.activityinfo.selectMan', null, {
    init: function(option) {
        this._option = option || null;
        this._lineIds = null;
        this._template = '<div class="form-group" style="margin:5px,0">' +
            '<label for="man" class="col-sm-3 control-label">处理人<span class="text-danger">*</span></label>' +
            '<div class="col-sm-9">' +
            '<input type="text" class="form-control audit" id="#{id}" name="#{name}" lineName="#{lineName}"/>' +
            '</div>' +
            '</div>';
    },
    afterrender: function() {
        this.form = this.qid("form");
        this.selectManDialog = this.qid("selectManDialog").dialog({
            title: "请选择处理人",
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text": "确定",
                "click": this.proxy(this.on_dialog_save)
            }, {
                "text": "取消",
                "click": this.proxy(function() {
                    this.selectManDialog.dialog("close");
                })
            }],
            open: this.proxy(function() {

            }),
            close: this.proxy(function() {

            }),
            create: this.proxy(this.on_dialog_create)
        });
    },
    /**
     * @title 模态层创建时执行
     */
    on_dialog_create: function() {
        this.approveMan = [];
        $.each(this._option.num.lines[0].man || [], this.proxy(function(k, v) {
            this.approveMan.push({
                id: v.id,
                text: v.name
            });
        }));
    },
    on_dialog_save: function() {
        var userIds = this.form.find("input.audit:first").select2('val'),
            actionUsers = {};
        if (userIds!=='') {
            $.each(this._lineIds, function(idx, lineId) {
                actionUsers[lineId] = userIds
            });
            this.refresh(actionUsers);
            this.selectManDialog.dialog("close");
        }else if(userIds===''){
            $.u.alert.error("请选择处理人");
        }
    },
    open: function(param) {
        var $approvedContainer = this.qid('form'),
            lines = this._option.num.lines,
            ids = [];
        this._lineIds = [];
        if (lines.length > 0) {
            for (var i = 0; i < lines.length; i++) {
                if (i === 0) {
                    $(this._template.replace(/#\{id\}/g, lines[i].id).replace(/#\{name\}/g, lines[i].id).replace(/#\{lineName\}/g, lines[i].name)).appendTo($approvedContainer);
                }
                this._lineIds.push(lines[i].id);
            }
        };
        this.form.find("input:first").select2({
            placeholder: "请选择",
            allowClear: true,
            multiple: false,
            data: this.approveMan
            /**
             * @param 处理人不可以过滤
             */
            /*,
            formatSelection: function(item) {
                return item.name;
            },
            formatResult: function(item) {
                return item.name;
            }*/
        });
        this.selectManDialog.dialog("open");
    },
    refresh: function(param) {

    },
    destroy: function() {
        this._super();
    }

}, {
    usehtm: true,
    usei18n: false
});

com.sms.activityinfo.selectMan.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.activityinfo.selectMan.widgetcss = [{
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}];