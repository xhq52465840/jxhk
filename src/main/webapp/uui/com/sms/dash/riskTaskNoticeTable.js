//@ sourceURL=com.sms.dash.riskTaskNoticeTable
$.u.define('com.sms.dash.riskTaskNoticeTable', null, {
    init: function(mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;

    },
    afterrender: function(bodystr) {
        this._initDataTable();
    },
    _initDataTable: function() {
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 10,
            "sDom": "rt<ip>",
            "columns": [{
                "title": "类型",
                "mData": "type.name",
                "width": "11%"
            },{
                "title": "编号",
                "mData": "unit",
                "width": "11%"
            },{
                "title": "优先级",
                "mData": "priority.name",
                "width": "11%"
            },{
                "title": "主题",
                "mData": "summary",
                "width": "32%"
            },{
                "title": "安监机构",
                "mData": "unit.name",
                "width": "12%"
            },{
                "title": "状态",
                "mData": "status.name",
                "width": "10%"
            },{
                "title": "最后更新时间",
                "sClass": "nowrap",
                "mData": "lastUpdate",
                "width": "15%"
            }],
            "oLanguage": { //语言
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                    "sFirst": "",
                    "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
                    "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
                    "sLast": ""
                }
            },
            "fnServerParams": this.proxy(function(aoData) {
                $.extend(aoData, {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getToDoActivities",
                    //"paramType": "getUncheckedMessagesByReceiver",
                    "sort": JSON.stringify({key:"lastUpdate",value:"desc"}),
                    "infoType": "risk"
                }, true);
            }),
            "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {
                this._ajax(
                    $.u.config.constant.smsqueryserver,
                    true,
                    aoData,
                    this.qid("datatable"), {
                        size: 2,
                        backgroundColor: "#fff"
                    },
                    this.proxy(function(response) {
                        fnCallBack(response.data);
                        if (window.parent) {
                            window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
                        }
                    })
                );
            }),
            "aoColumnDefs": [{
                "aTargets": 0,
                "mRender": this.proxy(function(data, type, full) {
                    return data ;
                })
            }, {
                "aTargets": 1,
                "mRender": this.proxy(function(data, type, full) {
                    var results = "";
                    if (data) {
                        results = '<a href="' + this.getabsurl("../search/activity.html?activityId=" + full.id) + '" target="_blank">' + full.unit.code + "-" + full.num + '</a>';
                    }
                    return results;
                })
            }, {
                "aTargets": 2,
                "mRender": this.proxy(function(data, type, full) {
                    return '<div title="' + data + '" style="padding-left:15px;position:relative;white-space:nowrap;text-overflow:ellipsis;min-width:130px;"><span style="position: absolute;left:0px;top:-2px;margin: 0px;padding: 0px;width: 22px;height: 22px;"><img class="msg-i" style="left: 0px;top: 0px;position: absolute;" src="../../../img/icons/minor.png" /></span><span>' + data + '</span></div>';
                	
                })
            },{
                "aTargets": 3,
                "mRender": this.proxy(function(data, type, full) {
                    var results = "";
                    if (data) {
                        var results = "";
                        if (data && full.tag==1) {
                            results = '<a style="display:inline-block;width:100%;height:100%;color:#FF0909" href="' + this.getabsurl("../search/activity.html?activityId=" + full.id) + '" target="_top">' + full.summary + '</a>';
                        }else if(data && full.tag!=1){
                            results = '<a  href="' + this.getabsurl("../search/activity.html?activityId=" + full.id) + '" target="_top">' + full.summary + '</a>';                   	
                        }
                        return results;
                    }
                    return results;
                })
            },{
                "aTargets": 4,
                "mRender": this.proxy(function(data, type, full) {
                    return '<div title="' + data + '" style="padding-left:15px;position:relative;white-space:nowrap;text-overflow:ellipsis;min-width:130px;"><span style="position: absolute;left:0px;top:-2px;margin: 0px;padding: 0px;width: 16px;height: 16px;"><img class="msg-i" style="left: 0px;top: 0px;position: absolute; width:16px; height:16px" src="../../../img/unitavatar/unitavatar-default.png" /></span><span>' + data + '</span></div>';
                	
                })
            }],
            "rowCallback": this.proxy(function(row, data) {
                $(row).data({
                    "notice": data
                }).css("cursor", "pointer");
            }),
            "drawCallback": this.proxy(function(row, data) {
                window.top && window.top.goHash(this._gadgetsinstanceid);
            })
        });
       // this.dataTable.off("click", "tbody > tr").on("click", "tbody > tr", this.proxy(this.on_row_click));
        this.dataTable.off("click", "a.editSee").on("click", "a.editSee", this.proxy(this.on_editSee_click));
    },
    on_row_click: function(e) {
        var $tr = $(e.currentTarget);
        if ($tr.children("td").length === 1) return;
        if ($(e.target).is("a")) return;
        this._notice = $tr.data("notice");
        if (this.detailDialog == null) {
            this.qid("detailDialog").removeClass("hidden")
            this.detailDialog = this.qid("detailDialog").dialog({
                title: "信息详情",
                width: 800,
                modal: true,
                resizable: false,
                autoOpen: false,
                draggable: false,
                open: this.proxy(function() {
                    this.qid("text_sender").text(this._notice.senderDisplayName);
                    this.qid("text_title").text(this._notice.title);
                    this.qid("textarea_content").html(this._notice.content);
                    if (this._notice.risk) {
                        this.qid("a_link").removeClass("hidden").attr("href", this.getabsurl("../risk/RiskDetail.html?mode=edit&riskId=" + this._notice.risk.id)).text(this._notice.risk.activitySummary);
                    } else {
                        this.qid("a_link").addClass("hidden");
                    }
                    this._resizeGadget();
                }),
                close: this.proxy(function() {
                    this.qid("text_sender").text("");
                    this.qid("text_title").text("");
                    this.qid("textarea_content").text("");
                    this.qid("a_link").attr("href", "#");
                    this._resizeGadget();
                }),
                buttons: [{
                    text: "关闭",
                    "class": "aui-button-link",
                    click: this.proxy(function() {
                        this.detailDialog.dialog("close");
                    })
                }]
            });
        }
        this.detailDialog.dialog("open");
    },
    on_editSee_click: function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            var id = parseInt($(e.currentTarget).attr("data-id"));
            this._ajax(
                $.u.config.constant.smsmodifyserver,
                true, {
                    "method": "modifyMessage",
                    "paramType": "checkMessage",
                    "messageId": id
                },
                this.dataTable, {},
                this.proxy(function(response) {
                    this.dataTable.fnDraw();
                })
            );
        } catch (e) {
            throw new Error("操作失败:" + e.message);
        }
    },
    /**
     * @title ajax
     * @param url {string} ajax url
     * @param async {bool} async
     * @param param {object} ajax param
     * @param $container {jQuery object} block
     * @param blockParam {object} block param
     * @param callback {function} callback
     */
    _ajax: function(url, async, param, $container, blockParam, callback) {
        $.u.ajax({
            "url": url,
            "datatype": "json",
            "async": async,
            "type": "post",
            "data": $.isArray(param) ? param : $.extend({
                "tokenid": $.cookie("tokenid")
            }, param)
        }, $container || this.$, $.extend({}, blockParam || {
            size: 2,
            backgroundColor: "#fff"
        })).done(this.proxy(function(response) {
            if (response.success) {
                callback(response);
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title 控制行动项看板的iframe高度
     */
    _resizeGadget: function(showDialog) {
        if (window.parent) {
            var params = $.urlParam();
            if (this.qid("detailDialog").parent().is(":visible")) {
                window.parent.resizeGadget && window.parent.resizeGadget(parseInt(params.gadgetsinstance), (this.qid("detailDialog").parent().outerHeight(true)) + 1 + "px");
            } else {
                window.parent.resizeGadget && window.parent.resizeGadget(parseInt(params.gadgetsinstance), ($("body").outerHeight(true)) + 1 + "px");
            }

        }
    },
    destroy: function() {
        return this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.dash.riskTaskNoticeTable.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
    '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.dash.riskTaskNoticeTable.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];