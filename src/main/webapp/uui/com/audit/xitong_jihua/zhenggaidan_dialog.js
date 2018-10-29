//@ sourceURL=com.audit.xitong_jihua.zhenggaidan_dialog
$.u.define('com.audit.xitong_jihua.zhenggaidan_dialog', null, {
    init: function(options) {
        this._options = options || {};
        this.status = this._options.status;
    },
    afterrender: function(bodystr) {
        this.init_html();
        var data = this._options.obj.split(",");
        this.cando = data[0];
        this.improveId = data[1]; //记录的id
        this.impId = data[2];
        this.flow = parseInt(data[3]);
        if (this.flow > 2) {
            $('.auditOpinion').show();
            this.qid("auditOpinion").attr("readonly", "readonly");
        }
        //整改反馈 0 整改转发 1 措施指定 2  预案上报3 预案通过 4 预案拒绝 5 暂时无法完成 6 完成情况 7 整改完成8  已经指派9 通过 10
        switch (this.cando) {
            case "0":
                this.dialog_reason.add(this.dialog_measure).attr("readonly", "readonly");
                this.cando_0();
                break;
            case "1":
            case "2":
                $('label.step1').append('<span style="color:red">*</span>');
                this.improveResponsiblePerson.removeAttr("readonly");
                this.reasonType.select2("readonly", false);
                this.cando_1();
                break;
            case "3":
                this.dialog_reason.add(this.dialog_measure).attr("readonly", "readonly");
                $('.auditOpinion').show();
                this.qid("auditOpinion").removeAttr("readonly", "readonly");
                $('label.step2').append('<span style="color:red">*</span>');
                this.cando_2();
                break;
            case "4":
                this.dialog_reason.add(this.dialog_measure).add(this.qid("auditOpinion")).attr("readonly", "readonly");
                $('.info_wacheng').show();
                $('label.step3').append('<span style="color:red">*</span>');
                this.cando_3();
                break;
            case "5":
                this.dialog_reason.add(this.dialog_measure).add(this.qid("auditOpinion")).add(this.qid("info_wacheng")).attr("readonly", "readonly");
                $('.auditOpinion').show();
                $('.info_wacheng').show();
                this.cando_0();
                break;
            case "6":
                this.dialog_reason.add(this.dialog_measure).add(this.qid("auditOpinion")).attr("readonly", "readonly");
                $('.auditOpinion').show();
                this.cando_0();
                break;
            case "7":
                this.dialog_reason.add(this.dialog_measure).add(this.qid("auditOpinion")).add(this.qid("info_wacheng")).attr("readonly", "readonly");
                $('.auditOpinion').show();
                $('.info_wacheng').show();
                this.cando_0();
                break;
        }
        this.init_data();
    },
    init_html: function() {
        this.improveResponsiblePerson = this.qid("improveResponsiblePerson");
        this.reasonType = this.qid("reasonType");
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

        this.dialog_reason = this.qid("dialog_reason");
        this.dialog_measure = this.qid("dialog_measure");
        this.dialog_uploadFile = this.qid("dialog_uploadFile");
        this.auditFiles = this.qid("auditFiles");
        this.contrlFile = this.qid("contrlFile");
        if (this.status < 4) {
            this.contrlFile.addClass("hidden");
        }
        this.file_upload = this.qid("file_upload");
        this.file_upload.uploadify({
            'auto': true,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
            'uploader': $.u.config.constant.smsmodifyserver + ";jsessionid=" + $.cookie("sessionid"),
            'fileTypeDesc': 'doc',
            'fileTypeExts': '*.*',
            'removeCompleted': true,
            'buttonText': "上传附件",
            'cancelImg': this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
            'height': 25,
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

            }),
            "onSWFReady": this.proxy(function() {
                this.file_upload.uploadify("disable", false);
            }),
            'onUploadStart': this.proxy(function(file) {
                var data = {
                    tokenid: $.cookie("tokenid"),
                    method: "uploadFiles",
                    sourceType: 7,
                    source: this.improveId
                };
                this.qid("file_upload").uploadify('settings', 'formData', data);
                this.$.find(".uploadify-queue").removeClass("hidden");
            }),
            'onUploadSuccess': this.proxy(function(file, data, response) {
                if (data) {
                    data = JSON.parse(data);
                    if (data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length) {
                        var file = data.data.aaData[0];
                        this.$.find(".uploadify-queue").addClass("hidden");
                        this.auditFiles.removeClass("hidden");
                        $("<tr>" +
                            "<td class='break-word'><a href='#'>" + file.fileName + "</a></td>" +
                            "<td>" + file.size + "</td>" +
                            "<td><i class='fa fa-trash-o uui-cursor-pointer delete-file'/></td>" +
                            "</tr>").data("data", file).appendTo(this.dialog_uploadFile);
                    } else {
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
                }
            })
        });
    },
    open: function() {
        this.recordDialog.dialog("open");
    },
    init_data: function() {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "getImproveRecordById",
                "id": this.improveId,
                "tokenid": $.cookie("tokenid")
            }
        }, this.recordDialog.parent()).done(this.proxy(function(response) {
            if (response.success) {
                this.point = response.data.itemPoint || "";
                this.qid("improveName").val(response.data.improve.improveName || ""); //整改反馈名称
                this.qid("improveNo").val(response.data.improve.improveNo || ""); //整改反馈单编号
                this.qid("auditunit_Name").val(response.data.improve.operator ? response.data.improve.operator.name : ""); //审计单位
                this.qid("improveUnit").val(response.data.improveUnit ? response.data.improveUnit.name : ""); //主要责任单位
                this.qid("auditedunit_Name").val(response.data.improve.target ? response.data.improve.target.name : ""); //被审计的单位
                this.qid("improveUnit2").val(response.data.improveUnit2 ? response.data.improveUnit2.name : ""); //额外责任单位
                this.qid("improveResponsiblePerson").val(response.data.improveResponsiblePerson || ""); //额外责任单位
                this.qid("auditOpinion").val(response.data.auditOpinion || "");
                var itemPoint = "检查要点：" + (response.data.itemPoint || "") + "\n";
                itemPoint += "审计记录：" + (response.data.auditRecord || "");
                this.qid("issues").val(itemPoint);
                this.qid("dialog_reason").val(response.data.improveReason || "");
                this.qid("dialog_measure").val(response.data.improveMeasure || "");
                this.qid("info_wacheng").val(response.data.improveRemark || "");
                this.qid("improveLastDate").val(response.data.improveLastDate || "");
 //               this.qid("endDate").val(response.data.improve.endDate || "");
                this.qid("verification").val(response.data.verification || "");
                var reason = [];
                $.each(response.data.auditReason || [], this.proxy(function(idx, item) {
                    reason.push({
                        "id": item.id,
                        "name": item.name
                    });
                }))
                this.reasonType.select2("data", reason);
            }
            this.dialog_uploadFile.empty();
            if (response.data.files && response.data.files.length) {
                this.qid("auditFiles").removeClass("hidden");
                var user = JSON.parse($.cookie('uskyuser'));
                var user_s = user.fullname + "(" + user.username + ")";
                $.each(response.data.files, this.proxy(function(idx, file) {
                    $("<tr>" +
                        "<td class='break-word'><a href='#' class='download-file' fileid='" + file.id + "'>" + file.fileName + "</a></td>" +
                        "<td>" + file.size + "</td>" +
                        "<td>" + (file.uploadUser == user_s ? "<i class='fa fa-trash-o uui-cursor-pointer delete-file'/>" : "") + "</td>" +
                        "</tr>").data("data", file).appendTo(this.dialog_uploadFile);
                }));
                this.dialog_uploadFile.off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
                this.dialog_uploadFile.off("click", ".download-file").on("click", ".download-file", this.proxy(this.on_downloadFile_click));
            }
        }))
    },
    cando_0: function() {
        this.recordDialog = this.qid("recordDialog").dialog({
            title: "整改反馈记录",
            width: 840,
            height: 570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable: true,
            buttons: [{
                "text": "关闭",
                "class": "aui-button-link",
                "click": this.proxy(this.on_recordDialog_cancel)
            }],
            close: this.proxy(this.closeDialog)
        });
    },
    cando_1: function() {
        this.recordDialog = this.qid("recordDialog").dialog({
            title: "整改反馈记录",
            width: 840,
            height: 570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable: true,
            buttons: [{
                "text": "保存",
                "class": "btn btn-default btn-sm",
                "click": this.proxy(this.submit_1)
            }, {
                "text": "关闭",
                "class": "aui-button-link",
                "click": this.proxy(this.on_recordDialog_cancel)
            }],
            close: this.proxy(this.closeDialog)
        });
    },
    cando_2: function() {
        this.recordDialog = this.qid("recordDialog").dialog({
            title: "整改反馈记录",
            width: 840,
            height: 570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable: true,
            buttons: [{
                "text": "审核通过",
                "name": "tongguo",
                "class": "btn btn-default btn-sm",
                "click": this.proxy(this.submit_2)
            }, {
                "text": "审核拒绝",
                "name": "jujue",
                "class": "btn btn-default btn-sm",
                "click": this.proxy(this.submit_2)
            }, {
                "text": "暂时无法完成",
                "name": "wufa_wancheng",
                "class": "btn btn-default btn-sm",
                "click": this.proxy(this.submit_2)
            }, {
                "text": "关闭",
                "class": "aui-button-link",
                "click": this.proxy(this.on_recordDialog_cancel)
            }],
        });
    },
    cando_3: function() {
        this.recordDialog = this.qid("recordDialog").dialog({
            title: "整改反馈记录",
            width: 840,
            height: 570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable: true,
            buttons: [{
                "text": "保存",
                "name": "save",
                "class": "btn btn-default btn-sm",
                "click": this.proxy(this.submit_3_save)
            }, {
                "text": "提交",
                "name": "commit",
                "class": "btn btn-default btn-sm",
                "click": this.proxy(this.submit_3_commit)
            }, {
                "text": "关闭",
                "class": "aui-button-link",
                "click": this.proxy(this.on_recordDialog_cancel)
            }],
        });
    },
    closeDialog: function() {
        this.recordDialog.find('textarea').val('');
        this.recordDialog.find('input').val('');
        this.auditFiles.addClass("hidden");
        this.dialog_uploadFile.empty();
    },
    submit_1: function() {
        var dialog_reason = this.dialog_reason.val();
        var reasonType = this.reasonType.val();
        var dialog_measure = this.dialog_measure.val();
        var improveResponsiblePerson = this.improveResponsiblePerson.val();
        if (!$.trim(improveResponsiblePerson)) {
            $.u.alert.error("整改责任人不能为空");
            this.improveResponsiblePerson.focus();
            return;
        }
        if (reasonType == "") {
            $.u.alert.error("原因类型不能为空");
            this.reasonType.focus();
            return;
        }
        if (dialog_reason == "") {
            $.u.alert.error("产生原因不能为空");
            this.dialog_reason.focus();
            return;
        }
        if (dialog_measure == "") {
            $.u.alert.error("整改措施不能为空");
            this.dialog_measure.focus();
            return;
        }
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "updateImproveRecordReasonAndMeasure",
                "id": this.improveId,
                "auditReason": reasonType,
                "improveReason": dialog_reason,
                "improveMeasure": dialog_measure,
                "improveResponsiblePerson": improveResponsiblePerson,
                "tokenid": $.cookie("tokenid")
            }
        }, this.qid("recordDialog").parent()).done(this.proxy(function(response) {
            if (response.success) {
                $.u.alert.success("保存成功");
                this.recordDialog.dialog("close");
                this.refresh(this._options.obj);
            } else {
                $.u.alert.error(response.reason);
            }
        }))
    },
    submit_2: function(e) {
        var auditOpinion = this.qid("auditOpinion").val();
        if (auditOpinion == "") {
            $.u.alert.error("审核意见不能为空");
            this.qid("auditOpinion").focus();
            return;
        }
        var istype = ""; //判断操作类型   通过    拒绝    暂时无法完成  
        var name = $(e.currentTarget).attr("name");
        if (name == "tongguo") {
            istype = "pass";
        } else if (name == "jujue") {
            istype = "reject";
        } else if (name == "wufa_wancheng") {
            istype = "uncompleted";
        }
        var clz = $.u.load("com.audit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        $.u.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            dataType: "json",
                            data: {
                                "method": "updateImproveRecordStatus",
                                "id": this.improveId,
                                "tokenid": $.cookie("tokenid"),
                                "auditOpinion": auditOpinion,
                                "operate": istype
                            }
                        }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                $.u.alert.success("操作成功");
                                confirm.confirmDialog.dialog("close");
                                this.recordDialog.dialog("close");
                                this.refresh();
                            } else {
                                $.u.alert.error(response.reason);
                            }
                        }));
                    })
                }
            }
        })
    },
    submit_3_save: function() {
        var info_wancheng = this.qid("info_wacheng").val();
        if ($.trim(info_wancheng) == "") {
            $.u.alert.error("完成情况不能为空");
            this.qid("info_wacheng").focus();
            return;
        }
        var obj = {
            improveRemark: info_wancheng
        };
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "method": "updateImproveRecordCompletion",
                "id": this.improveId,
                "tokenid": $.cookie("tokenid"),
                "obj": JSON.stringify(obj)
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
    },
    submit_3_commit: function() {
        var info_wancheng = this.qid("info_wacheng").val();
        if ($.trim(info_wancheng) == "") {
            $.u.alert.error("完成情况不能为空");
            this.qid("info_wacheng").focus();
            return;
        }
        var obj = {
            improveRemark: info_wancheng
        };
        var clz = $.u.load("com.audit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        $.u.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            dataType: "json",
                            data: {
                                "method": "commitImproveRecordCompletion",
                                "id": this.improveId,
                                "tokenid": $.cookie("tokenid"),
                                "obj": JSON.stringify(obj)
                            }
                        }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                /*$.u.ajax({
                                    url : $.u.config.constant.smsqueryserver,
                                    type:"post",
                                    dataType: "json",
                                    data: {
                                        "method": "getGradeOneManagerAuditors",
                                        "tokenid": $.cookie("tokenid")
                                    }
                                }).done(this.proxy(function(res){
                                    if(res.success){
                                        var userIds = [];
                                        res.data.aaData && $.each(res.data.aaData, function(k,v){
                                            userIds.push(v.id);
                                        });
                                        $.u.ajax({
                                            url : $.u.config.constant.smsmodifyserver,
                                            type:"post",
                                            dataType: "json",
                                            data: {
                                                "method": "modifyMessage",
                                                "paramType":"sendMessage",
                                                "title":"待分配验证人员",
                                                "sourceType":"TRACE",
                                                "content":this.point,
                                                "link":this.impId.toString(),
                                                "userIds":JSON.stringify(userIds),
                                                "unitIds":JSON.stringify([]),
                                                "organizationIds":JSON.stringify([]),
                                                "tokenid": $.cookie("tokenid")
                                            }
                                        }).done(this.proxy(function(res){ }));
                                            if(res.success){
                                            }
                                    }
                                }));
                            */
                                $.u.alert.success("提交成功");
                                confirm.confirmDialog.dialog("close");
                                this.recordDialog.dialog("close");
                                this.refresh();
                            }
                        }))
                    })
                }
            }
        })
    },
    on_recordDialog_cancel: function() {
        this.recordDialog.dialog("close");
    },
    on_deleteFile_click: function(e) {
        var $this = $(e.currentTarget),
            $tr = $this.closest("tr"),
            data = $tr.data("data");
        if (data && data.id) {
            var clz = $.u.load("com.audit.comm_file.confirm");
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
                                        if (this.auditFiles.children("tbody").children("tr").length < 1) {
                                            this.auditFiles.addClass("hidden");
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
    on_downloadFile_click: function(e) {
        e.preventDefault();
        var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([data]) + "&url=" + window.location.href);
    },
    refresh: function(data) {

    }
}, {
    usehtm: true,
    usei18n: false
});

com.audit.xitong_jihua.zhenggaidan_dialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
    "../../../uui/widget/uploadify/jquery.uploadify.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js",
    '../../../uui/widget/jqurl/jqurl.js'
];
com.audit.xitong_jihua.zhenggaidan_dialog.widgetcss = [{
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    path: "../../../uui/widget/uploadify/uploadify.css"
}];