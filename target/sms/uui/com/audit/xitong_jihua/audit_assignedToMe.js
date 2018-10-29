//@ sourceURL=com.audit.xitong_jihua.audit_assignedToMe
$.u.define('com.audit.xitong_jihua.audit_assignedToMe', null, {
    init: function(mode, gadgetsinstanceid) {
        this.gadgetsinstanceid = gadgetsinstanceid;
    },
    afterrender: function(bodystr) {
        this.i18n = com.audit.xitong_jihua.audit_assignedToMe.i18n;
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 10,
            "AutoWidth": true,
            sDom: "t<ip>",
            "columns": [{
                "title": this.i18n.columns.todo_what,
                "mData": "todoWhat",
                "sWidth": "8%"
            }, {
                "title": this.i18n.columns.todo_type_name,
                "mData": "todoTypeName",
                "sWidth": "10%"
            }, {
                "title": this.i18n.columns.todo_title,
                "mData": "todoTitle",
                "sWidth": 170
            }, {
                "title": this.i18n.columns.todo_num,
                "mData": "todoNum",
                "sWidth": "18%"
            }, {
                "title": this.i18n.columns.flow_status,
                "mData": "flowStatus",
                "sWidth": "10%"
            }, {
                "title": this.i18n.columns.last_update,
                "mData": "lastUpdate",
                "sWidth": "10%"
            }],
            "aoColumnDefs": [{
                "aTargets": 0,
                "mRender": function(data, type, full) {
                    return data || "";
                }
            }, {
                "aTargets": 1,
                "mRender": function(data, type, full) {
                    return data || "";
                }
            }, {
                "aTargets": 2,
                "mRender": this.proxy(function(data, type, full) {
                    if (data == null) {
                        data = "";
                    }
                    if (full.todoName == "check") { //检查单
                        if (full.todoType == "SUB2") {
                            return "<a href='../../audit/innerAudit/worklist/viewchecklist.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else if (full.todoType == "SUB3") {
                            return "<a href='../../audit/innerAudit/worklist/viewchecklist.html?type=erjineishen&id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else if (full.todoType === "SPOT" || full.todoType === "SPEC") {
                            return "<a href='../inspection/viewchecklist.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else if (full.todoType === "TERM") {
                            return "<a href='../terminal/Sheet.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else {
                            return "<a href='../../audit/worklist/viewchecklist.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        }
                    } else if (full.todoName == "task") { //工作单
                        if (full.todoType == "SUB2") {
                            if (full.flowStep === "3" || full.flowStep === "4" || full.flowStep === "5") {
                                //return "<a href='../innerAudit/xitong_jihua/AuditReport.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                                return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/AuditReport.html?id=" + full.id) + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else {

                                return "<a href=" + this.getabsurl("../innerAudit/worklist/viewworklist.html?id=" + full.id) + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        } else if (full.todoType == "SUB3") {
                            if (full.flowStep === "3" || full.flowStep === "4" || full.flowStep === "5") {
                                return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/AuditReport.html?type=erjineishen&id=" + full.id) + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else {
                                return "<a href=" + this.getabsurl("../innerAudit/worklist/viewworklist.html?type=erjineishen&id=" + full.id) + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        } else if (full.todoType == "SPOT" || full.todoType == "SPEC") {
                            if (full.flowStep === "1" || full.flowStep === "2") {
                                return "<a href=" + this.getabsurl("../inspection/viewworklist.html?id=" + full.id) + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else if (full.flowStep === "3") {
                                return "<a href=" + this.getabsurl("../inspection/viewCheckReport.html?id=" + full.id) + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else if (full.flowStep === "4") {
                                return "<a href=" + this.getabsurl("../inspection/viewUploadDocumentsSigned.html?id=" + full.id) + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        } else if (full.todoType == "TERM") {
                            return "<a href='../../audit/terminal/Sheet.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else {
                            if (full.flowStep == "3") {
                                return "<a href='../../audit/xitong_jihua/Xitong_jihua_shengchengshenjibaogao.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else if (full.flowStep == "4") {
                                return "<a href='../../audit/xitong_jihua/Xitong_jihua_shengchengshenjibaogao.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else if (full.flowStep == "5") {
                                return "<a href='../../audit/xitong_jihua/Xitong_jihua_shengchengshenjibaogao.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else {
                                return "<a href='../../audit/worklist/viewworklist.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        }
                    } else if (full.todoName == "plan") { //计划
                        if (full.todoType == "SUB2") {
                            return "<a href='../../audit/innerAudit/xitong_jihua/Xitong_jihua_gongzuotai.html?year=" + full.todoNum + "&id=" + full.todoUnit + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else if (full.todoType == "SUB3") {
                            return "<a href='../../audit/innerAudit/xitong_jihua/Xitong_jihua_gongzuotai.html?year=" + full.todoNum + "&type=erjineishen&id=" + full.todoUnit + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else if (full.todoType == "TERM") {
                            return "<a href='../../audit/terminal/TerminalAudit.html?year=" + full.todoNum + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        } else {
                            return "<a href='../../audit/xitong_jihua/Xitong_jihua_gongzuotai.html?year=" + full.todoNum + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                        }
                    } else if (full.todoName == "improve") { //整改单
                        if (full.todoType == "SUB2") {
                            if (full.flowStep == "1") {
                                if (full.userType == "transmittedUser") { //三级主管，转发过来的，明细前没有选择框
                                    return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&isGroupedByImproveUnit=false&isTransmitted=true" + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                                } else {
                                    return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&isGroupedByImproveUnit=true" + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                                }
                            } else if (full.flowStep == "2") {
                                return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&isGroupedByImproveUnit=false&isDividedByProfession=true" + "&target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else {
                                return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&isGroupedByImproveUnit=false" + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        } else if (full.todoType == "SUB3") {
                            if (full.flowStep == "1") {
                                if (full.userType == "transmittedUser") { //三级主管，转发过来的，明细前没有选择框
                                    return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&type=erjineishen&isGroupedByImproveUnit=false&isTransmitted=true" + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                                } else {
                                    return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&type=erjineishen&isGroupedByImproveUnit=true" + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                                }
                            } else if (full.flowStep == "2") {
                                return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&type=erjineishen&isGroupedByImproveUnit=false&isDividedByProfession=true" + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else {
                                return "<a href=" + this.getabsurl("../innerAudit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id) + "&type=erjineishen&isGroupedByImproveUnit=false" + " target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        } else if (full.todoType == "SPOT" || full.todoType == "SPEC") {
                            if (full.flowStep == "1") {
                                return "<a href='../inspection/viewReviewFeedBack.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else if (full.flowStep == "2") {
                                return "<a href='../inspection/viewReviewFeedBack.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else {
                                return "<a href='../inspection/viewReviewFeedBack.html?id=" + full.id + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        } else {
                            if (full.flowStep == "1" || full.flowStep == "2") {
                                if (full.userType == "transmittedUser") { //三级主管，转发过来的，明细前没有选择框
                                    return "<a href='../../audit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id + "&isTransmitted=true&isDividedByProfession=false" + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                                } else {
                                    return "<a href='../../audit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id + "&isTransmitted=false&isDividedByProfession=false" + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                                }
                            } else if (full.flowStep == "3") {
                                return "<a href='../../audit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id + "&isTransmitted=false&isDividedByProfession=true" + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            } else {
                                return "<a href='../../audit/xitong_jihua/Xitong_jihua_zhenggaifankui.html?id=" + full.id + "&isTransmitted=false&isDividedByProfession=false" + "' target='_blank' class='view' data=''/>&nbsp;" + data + "</a>";
                            }
                        }
                    } else if (full.todoName == "subImproveNotice") {
                        //整改通知单 请不要随便修改
                        //full.flowStep == "3" 填写完成情况时多传一个参数operate
                        return "<div style='width:'15%';word-wrap:break-word'><a href='../../audit/notice/RectificationFormSubmit.html?id=" + full.id + (full.flowStep === "3" ? "&operate=completion" : "") + "' target='_blank' style='font-size:12px;'>" + data + "</a><div>";
                    }
                })
            }, {
                "aTargets": 3,
                "mRender": function(data, type, full) {
                    if (data) {
                        data = data && data.slice(0, 30) + "<br>" + data.substring(30)
                    } else {
                        data = "";
                    }
                    return "<div style='width:'10%';word-break:break-all;'>" + data || "" + "<div>";
                }
            }, {
                "aTargets": 4,
                "mRender": function(data, type, full) {
                    return data || "";
                }
            }, {
                "aTargets": 5,
                "mRender": this.proxy(function(data, type, full) {
                    return data || "";
                })
            }],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage + " _MENU_ " + this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from + " _START_ " + this.i18n.to + " _END_ /" + this.i18n.all + " _TOTAL_ " + this.i18n.allData,
                "sInfoEmpty": "",
                "sInfoFiltered": "(" + this.i18n.fromAll + "_MAX_" + this.i18n.filterRecord + ")",
                "sProcessing": "" + this.i18n.searching + "...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                },
            },
            "fnServerParams": this.proxy(function(aoData) {
                var rule = [];
                $.extend(aoData, {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getTodoList",
                    "dataobject": "user",
                    "columns": JSON.stringify(aoData.columns),
                    "search": JSON.stringify(aoData.search)
                }, true);
            }),
            "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function(data) {
                    if (data.success) {
                        fnCallBack(data.data);
                        if (window.parent) {
                            try {
                                window.parent.resizeGadget(this.gadgetsinstanceid, $("body").outerHeight(true));
                            } catch (e) {
                                throw new Error("invote window.parent.resizeGadget fail");
                            }
                        }
                    }
                })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function() {}));
            }),
            "rowCallback": this.proxy(function(row, data, index) {

                $(".dashTable th").css("min-width", "100px");
            })
        });


    }
}, {
    usehtm: true,
    usei18n: true
});
com.audit.xitong_jihua.audit_assignedToMe.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
    '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js",

    '../../../uui/widget/select2/js/select2.min.js',
    "../../../uui/widget/uploadify/jquery.uploadify.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js",
    '../../../uui/widget/jqurl/jqurl.js'
];
com.audit.xitong_jihua.audit_assignedToMe.widgetcss = [{
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