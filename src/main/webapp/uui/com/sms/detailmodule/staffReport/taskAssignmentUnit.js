"use strict";
//@ sourceURL=com.sms.detailmodule.staffReport.taskAssignmentUnit
$.u.define('com.sms.detailmodule.staffReport.taskAssignmentUnit', null, {
    init: function(option) {
        this._options = option || {};
        this.select2PageLength = 10; // 下拉机构每页显示条数
    },
    afterrender: function(bodystr) {
        this.i18n = com.sms.detailmodule.staffReport.taskAssignmentUnit.i18n;
        this.$units = this.qid('units');
        this.$reason = this.qid('reason');
        this.$errorMessage = this.qid('errorMessage');
        this.unitDialog = this.qid("unitDialog").dialog({
            title: this.i18n.title,
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                text: this.i18n.buttons.save,
                click: this.proxy(this.on_dialog_ok)
            }, {
                text: this.i18n.buttons.cancel,
                "class": "aui-button-link",
                click: this.proxy(this.on_dialog_cancel)
            }],
            create: this.proxy(this.on_dialog_create),
            open: this.proxy(this.on_dialog_open),
            close: this.proxy(this.on_dialog_close)
        });
    },
    /**
     * @title 模态层创建时执行
     */
    on_dialog_create: function() {
        this.$units.select2({
            width: '100%',
            multiple: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "unit",
                        rule: JSON.stringify([
                            [{
                                "key": "name",
                                "op": "like",
                                "value": term
                            }]
                        ]),
                        start: (page - 1) * this.select2PageLength,
                        length: this.select2PageLength
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this.select2PageLength)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.name;
            },
            formatSelection: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.name;
            }
        });
    },
    /**
     * @title 模态层打开时执行
     */
    on_dialog_open: function() {

    },
    /**
     * @title 模态层关闭时执行
     */
    on_dialog_close: function() {
        this.$units.select2('val', null);
        this.$errorMessage.text('');
        this.$reason.val("");
        this.$reason.text("");
    },
    /**
     * @title 分配事件
     */
    on_dialog_ok: function() {
        var units = this.$units.select2('val');
        var reason = this.$reason.val();
        if (units.length === 0) {
            this.$errorMessage.text(this.i18n.messages.unitIsRequired);
            this.$units.select2('focus');
            return;
        }else if (!reason) {
            this.$errorMessage.text(this.i18n.messages.reasonRequired);
            this.$reason.focus();
            return;
        };
        var data = {
            units:units,
            reason:reason
        }
        this.on_afterSave(data);
    },
    /**
     * @title "取消"事件
     */
    on_dialog_cancel: function() {
        this.unitDialog.dialog("close");
    },
    /**
     * @title 打开模态层
     * @param {object} data
     */
    open: function(data) {
        $.extend(this._options, data || {});
        this.unitDialog.dialog().dialog("open");
    },
    /**
     * @title 分配时调用，此事件用于被加载
     * @param {Array} units
     */
    on_afterSave: function(units) {},
    /**
     * @title 组件销毁
     */
    destroy: function() {
        this.$units.select2('destroy');
        this.unitDialog.dialog("destroy").remove();
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.detailmodule.staffReport.taskAssignmentUnit.widgetjs = [];
com.sms.detailmodule.staffReport.taskAssignmentUnit.widgetcss = [];