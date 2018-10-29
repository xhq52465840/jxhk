"use strict";
//@ sourceURL=com.sms.detailmodule.staffReport.taskAssignment
$.u.define('com.sms.detailmodule.staffReport.taskAssignment', null, {
    init: function(option) {
        /** option结构
         ** {
         **    activity: 0,
         **    statusCategory: ''
         ** }
         **/
        this._options = option || {};
        this.editable=this._options.editable;
        this._COMPLETE = "COMPLETE";
        this._TR_TEMPLATE = [
            "<tr data-id='#{id}'>",
            "<td>#{unitName}</td>",
            "<td>#{status}</td>",
            "<td>#{operator}</td>",
            "<td>",
            "<a class='btn btn-link btn-sm viewbuttton' target='_blank', style='padding-left: 0px;' href='#{url}' >#{viewButton}</a>",
            "<a class='btn btn-link btn-sm exportbuttton' target='_blank', style='padding-left: 0px;' href='#{exportUrl}' >#{exportButton}</a>",
            // "<i class='fa fa-trash-o fa-lg remove uui-cursor-pointer'  data-id='#{id}' ></i>",
            "</td>",
            "</tr>"
        ];
    },
    afterrender: function(bodystr) {
        this.i18n = com.sms.detailmodule.staffReport.taskAssignment.i18n;
        this.btnAdd = this.qid("btn_add");
        this.table = this.qid("table");
        this.tbody = this.table.find("tbody");

        if (this._options.editable !== true || this._options.statusCategory === this._COMPLETE) {
            this.btnAdd.remove();
        } else {
            this.btnAdd.click(this.proxy(this.on_addUnit_click));
            this.tbody.on("click", ".remove", this.proxy(this.on_remove_click));
        }

        this._drawTable(this._options.assignments || []);
    },
    /**
     * @title 分配事件
     */
    on_addUnit_click: function(e) {
        if (!this.assignUnit) {
            var clz = $.u.load("com.sms.detailmodule.staffReport.taskAssignmentUnit");
            this.assignUnit = new clz(this.$.find("div[umid=assignUnit]"));
            this.assignUnit.override({
                "on_afterSave": this.proxy(function(data) {
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        data: {
                            tokenid: $.cookie("tokenid"),
                            method: "distributeActivity",
                            id: this._options.activity,
                            unitIds: JSON.stringify(data.units),
                            reason : data.reason ||''
                        },
                        dataType: "json"
                    }, this.assignUnit.unitDialog.parent()).done(this.proxy(function(response) {
                        if (response.success) {
                            this._drawTable(response.data.activities);
                            this.assignUnit.unitDialog.dialog("close");
                        }
                    }));
                })
            });
        }
        this.assignUnit.open();
    },
    /**
     * @title 删除“信息报告”
     */
    on_remove_click: function(e) {
        var $this = $(e.currentTarget),
            id = $this.attr("data-id");
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>" + this.i18n.removeDialog.removeContent +
                "</div>" +
                "</div>",
            title: this.i18n.removeDialog.removeTitle,
            dataobject: "activity",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $.u.alert.info(this.i18n.messages.success);
                $this.closest("tr").remove();
            })
        });
    },
    /**
     * @title 填充信息报告列表
     * @param {Array} items 信息报告集合
     */
    _drawTable: function(items) {
        this.tbody.empty();
        if (items.length > 0) {
            this.table.removeClass("hidden");
            $.each(items, this.proxy(function(idx, item) {
                this._drawTr(item);
            }));
        }
    },
    /**
     * @title 绘制表格行
     * @param {object} data 信息报告
     */
    _drawTr: function(data) {
        var $tr = $(this._TR_TEMPLATE.join('').replace(/#\{unitName\}/g, data.unit.name)
            .replace(/#\{status\}/g, data.status.name)
            .replace(/#\{operator\}/g, $.map(data.processors || [], function(item, index) {
                return item.fullname;
            }).join(','))  //http://localhost:8080/sms/query.do?method=exportActivityToPdf&tokenid=1495699267124&activity=33700799
            .replace(/#\{url\}/g, this.getabsurl('../../search/activity.html?activityId=' + data.id))
            .replace(/#\{exportUrl\}/g, this.getabsurl('../../../../../../sms/query.do?method=exportActivityToPdf&tokenid=' + $.cookie("tokenid") + '&activity=' + data.id))
            .replace(/#\{viewButton\}/g, this.i18n.buttons.view)
            .replace(/#\{exportButton\}/g, this.i18n.buttons.exportButton)
            .replace(/#\{id\}/g, data.id)).appendTo(this.tbody);
        if (this._options.editable !== true) {
            $tr.find(".remove").remove();
        }
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.detailmodule.staffReport.taskAssignment.widgetjs = [
    "../../../../uui/widget/spin/spin.js",
    "../../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../../uui/widget/ajax/layoutajax.js"
];
com.sms.detailmodule.staffReport.taskAssignment.widgetcss = [];