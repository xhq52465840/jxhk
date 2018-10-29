//@ sourceURL=com.audit.innerAudit.xitong_jihua.zhenggaifankuidan
$.u.define('com.audit.innerAudit.xitong_jihua.zhenggaifankuidan', null, {
    init: function(options) {
        this._options = options || {};
        this._DATATABE_LANGUAGE = { //语言
            "sSearch": "搜索:",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉未找到记录",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
            "sProcessing": "检索中...",
            "oPaginate": {
                "sFirst": "",
                "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
                "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
                "sLast": ""
            }
        }
        this.attachmenttemp = '<tr>' + '<td class="name" data-field="#{propid}">#{propname}</td>' + '<td class="value" colspan="3">' + '<table class="table table-condensed attachmenttemp">' + '<thead><tr>' + '<th >文件名</th>' + '<th style="width: 10%;">文件大小</th>' + '<th style="width: 20%;">上传人</th>' + '<th style="width: 20%;">上传时间</th>' + '</tr></thead>' + '<tbody></tbody>' + '</table>' + '</td>' + '</tr>';
        /**
         *  扩展jquery选择器的方法
         */
        $.fn.extend({
            mutton: function(s) {
                return (s || "") + " mutton is  muootn " + $(this).html();
            }
        });

        $.u.mutton = function(s) {
            return (s || "") + " mutton is  muootn " + $(this).html();
        };

        $.u.requiredfn = function(s) {
            var cText = "",
                cName = "";
            $.each(s.split(","), function(id, item) {
                if ($("td[data-field=" + item + "]").length) {
                    if ($("[name=" + item + "]").val() == "") {
                        cName = item;
                        cText = $("td[data-field=" + item + "]").text().match("[\u4e00-\u9fa5]{2,8}")[0];
                    }
                }
            })
            if (cText != "" && cName != "") {
                $("[name=" + cName + "]").parents(".panel-sms").find("span").trigger("click");
                $("[name=" + cName + "]").focus();
                return $.u.alert.error("请填写" + cText, 2000);
            }
        }
    },
    afterrender: function(bodystr) {
        this._type = $.urlParam().type;
        this._options.isDividedByProfession = false;
        this._type == "erjineishen" ? $("[name=anquan]").text("二级内审") : $("[name=anquan]").text("内部安全审核");
        this.currdata = null;
        this.flowid = "";
        this.initform();
        this.form = this.qid("content").find("form");
        this.leftColumns = this.qid("left-column");
        this.init_data();
        this.qid("add_file").off("click").on("click", this.proxy(this._add_file));
    },

    initform: function() {
        this.improveName = $("[name=improveName]"); //整改反馈名称
        this.improveNo = $("[name=improveNo]"); //整改反馈单编号
        this.auditunit_Name = $("[name=auditunit_Name]"); //审计单位
        this.auditDate = $("[name=auditDate]"); //审计日期
        this.auditedunit_Name = $("[name=auditedunit_Name]"); //被审计单位
        this.audit_address = $("[name=audit_address]"); //审计地点
        this.transactor = $("[name=transactor]"); //经办人
        this.transactorTel = $("[name=transactorTel]"); //经办人联系方式
        this.improver = $("[name=improver]"); //整改联系人
        this.improverTel = $("[name=improverTel]"); //联系方式
        this.remark = $("[name=remark]"); //备注
    },

    _on_close_button: function(e) {
        //结案
        var cur_name = $(e.currentTarget).attr("name");
        var wipId = $(e.currentTarget).attr("wipId");
        var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        if (this.zhuanfa_id != "") {
                            $.u.ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                type: "post",
                                dataType: "json",
                                cache: false,
                                data: {
                                    "method": "operate",
                                    "tokenid": $.cookie("tokenid"),
                                    "action": wipId,
                                    "dataobject": "improve",
                                    "id": this.zhenggaidan_id
                                },
                            }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                if (response.success) {
                                    $.u.alert.success("操作成功");
                                    confirm.confirmDialog.dialog("close");
                                    this.refresh();
                                } else {
                                    $.u.alert.error(response.reason);
                                }
                            }))
                        }
                    })
                }
            }
        })
    },

    download_file: function(e) { //下载文件
        e.preventDefault();
        var id = $(e.currentTarget).attr("fileid") || "";
        var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([parseInt(id)]));
        form.appendTo('body').submit().remove();
    },



    init_data: function() {
        this.zhenggaidan_id = "";
        $.u.ajax({ //初始化页面数据
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "getImproveById",
                "isTransmitted": this._options.isTransmitted || false,
                "isGroupedByImproveUnit": this._options.isGroupedByImproveUnit || false,
                "isDividedByProfession": this._options.isDividedByProfession || false,
                "id": this._options.id, //整改单ID
                "tokenid": $.cookie("tokenid"),
            },
        }, this.$).done(this.proxy(function(response) {
            if (response.success) {
                this.currdata = response;
                this.zhenggaidan_id = response.data.improve.id;
                this.flowid = response.data.improve.flowId;
                this.improveName.val(response.data.improve.improveName || ""); //整改反馈名称
                this.improveNo.val(response.data.improve.improveNo || ""); //整改反馈单编号
                this.auditunit_Name.val(response.data.improve.operator ? response.data.improve.operator.name : ""); //审计单位
                this.auditDate.val(response.data.improve.startDate || "" + "至" + response.data.improve.endDate || ""); //审计日期
                this.auditedunit_Name.val(response.data.improve.target ? response.data.improve.target.name : ""); //被审计的单位
                this.audit_address.val(response.data.improve.address || ""); //审计地点
                var transactors = "";
                for (i in response.data.improve.transactor) {
                    transactors += response.data.improve.transactor[i].name + " "
                }
                this.transactor.val(transactors); //经办人
                this.transactorTel.val(response.data.improve.transactorTel || ""); //经办人电话
                this.improver.val(response.data.improve.improver || ""); //整改联系人
                this.improverTel.val(response.data.improve.improverTel || ""); //整改联系人电话
                this.remark.val(response.data.improve.remark || ""); //备注

                if (response.data.actions.length) {
                    this.action = true;
                } else {
                    this.action = false;
                }
                var flowStatus = response.data.workflowNodeAttributes.flowStatus;

                //              switch(flowStatus){
                //                  case "cuoShi":
                //                      break;
                //                  case "shenHe":
                //                      break;
                //                  case "zhengGaiWanCheng":
                //                      this.creat_audit_attachment(response.data.improve.improveSUB2_SUB3Files);// //验证签批件
                //                      break;
                //                  case "wanCheng":
                //                      this.creat_audit_attachment(response.data.improve.improveSUB2_SUB3Files);// //验证签批件
                //                      break;
                //                  case "jieAn":
                //                      this.creat_audit_attachment(response.data.improve.improveSUB2_SUB3Files);// //验证签批件
                //                      break;
                //              }
                this.creat_downfiles(response.data.improve); //基本信息中可下载的签批件
                this.creat_checklist(response.data.improve.checkLists); //整改问题列表
                this.creat_reject(response); // //被拒绝的签批件
                this.zhenggaidanattachment = this.qid("zhenggaidan_attachment");
                this.creat_files(response.data.improve.improveFiles); //签批件
                this._init_glyphicon();
                this.creat_hiddenModel(response); //隐藏模块
                this.creat_action(response.data);
            } else {
                $(".no_thead").hide();
            }

            this.form.find("input,textarea").attr("readonly", "readonly");
            if (response.data.workflowNodeAttributes && $.isArray(response.data.actions) && response.data.actions.length > 0) {
                if (response.data.workflowNodeAttributes.canDo) {
                    $.each(response.data.workflowNodeAttributes.canDo.split(","), this.proxy(function(k, v) {
                        this.canDo(v);
                    }));
                }
                if (response.data.workflowNodeAttributes.canModify) {
                    $.each(response.data.workflowNodeAttributes.canModify.split(","), this.proxy(function(k, v) {
                        this.canModify(v);
                    }));
                }
            }


            if (response.data.workflowNodeAttributes.required) {
                var rules = [],
                    messages = [];
                var requiredArray = response.data.workflowNodeAttributes.required.split(",");
                if ($.inArray("improver", requiredArray) === -1) {
                    requiredArray.push("improver");
                }
                if ($.inArray("improverTel", requiredArray) === -1) {
                    requiredArray.push("improverTel");
                }
                this.requiredArray = requiredArray;
                $.each(requiredArray, this.proxy(function(idx, item) {
                    var $lable = $("[data-field=" + item + "]", this.form);
                    rules[item] = {
                        required: true
                    };
                    messages[item] = {
                        required: "该项不能为空"
                    };
                    if ($lable.find("span.text-danger").length < 1) {
                        $("<span class='text-danger'>&nbsp;&nbsp;*</span>").appendTo($lable);
                    }
                }))
                this.form.validate({
                    rules: rules,
                    messages: messages,
                    errorClass: "text-danger text-validate-element",
                    errorElement: "div"
                });
            }
            if (response.data.logArea && response.data.logArea.key) {
                var zhenggaidan_id = this.zhenggaidan_id;
                var clz = $.u.load(response.data.logArea.key);
                this.qid("left-column").html("");
                var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("left-column"));
                new clz(target, $.extend(true, response.data.logArea, {
                    logRule: [
                        [{
                            "key": "source",
                            "value": zhenggaidan_id
                        }],
                        [{
                            "key": "sourceType",
                            "value": "improve"
                        }]
                    ],
                    remarkRule: [
                        [{
                            "key": "source",
                            "value": zhenggaidan_id
                        }],
                        [{
                            "key": "sourceType",
                            "value": "improve"
                        }]
                    ],
                    remarkObj: {
                        source: zhenggaidan_id,
                        sourceType: "improve"
                    },
                    addable: true,
                    flowid: this.flowid
                }));
            }

            if (response.data.improve.flowStep == "1") {
                this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
            } else {
                if (response.data.workflowNodeAttributes.hiddenModel) {
                    $.each(response.data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k, v) {
                        if (v === "logs") {
                            this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                        }
                    }));
                }
            }
        }))
    },



    _init_glyphicon: function() {
        $(".glyphicon-btn").off("click").on("click", this.proxy(function(event) {
            var $tar = $(event.currentTarget);
            var $span = "";
            if ($tar.prop("nodeName") === "I") {
                $span = $tar;
            } else {
                $span = $tar.find("i") || $tar.find(".glyphicon");
            }
            $tar.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
            if ($span.hasClass("glyphicon-minus")) {
                $span.removeClass("glyphicon-minus").addClass("glyphicon-plus");
            } else {
                $span.removeClass("glyphicon-plus").addClass("glyphicon-minus");
            }
        })).css({
            "cursor": "pointer"
        });
        $(".glyphicon-btn").eq(0).add($(".glyphicon-btn").eq(2))
            .add($(".glyphicon-btn").eq(3)).trigger("click");
    },


    //上传签批件
    _add_file: function() {
        var num;
        if (this.currdata.data.workflowNodeAttributes.flowStatus == "wanCheng") {
            num = 12;
        } else {
            num = 6;
        }
        if (!this.fileDialog) {
            var clz = $.u.load("com.audit.innerAudit.comm_file.audit_uploadDialog");
            this.fileDialog = new clz($("div[umid='fileDialog']", this.$), null);
        }
        this.fileDialog.override({
            refresh: this.proxy(function(data) {
                this.refresh();
            }),
            close: this.proxy(function() {

            })
        });
        try {
            this.fileDialog.open({
                "method": "uploadFiles",
                "source": this._options.id,
                "tokenid": $.cookie("tokenid"),
                "sourceType": num
            });
        } catch (e) {
            $.u.alert.error("上传出错！");
        }
    },

    delete_file: function(e) {
        var $e = $(e.currentTarget);
        var $tr = $e.closest("tr");
        var file_id = $e.attr("fileid");
        var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认删除？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        $.u.ajax({ //删除文件
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: {
                                "method": "stdcomponent.delete",
                                "dataobjectids": JSON.stringify([parseInt(file_id)]),
                                "tokenid": $.cookie("tokenid"),
                                "dataobject": "file"
                            },
                        }).done(this.proxy(function(response) {
                            if (response.success) {
                                confirm.confirmDialog.dialog("close");
                                this.refresh();
                            } else {
                                $.u.alert.error(response.reason);
                            }
                        }))
                    })
                }
            }
        });
    },
    //上传验证单签批件模块
    //    creat_audit_attachment:function(attachmentData){
    //      if(!this.auditattachment){
    //          $.u.load('com.audit.innerAudit.xitong_jihua.RectifyAttachment');
    //          this.auditattachment = new com.audit.innerAudit.xitong_jihua.RectifyAttachment($('div[umid=attachment]'),{
    //                  id:this.zhenggaidan_id,
    //                  editable:this.action
    //          })
    //      }
    //      this.auditattachment.override({
    //          refresh:this.proxy(function(da){
    //              this.refresh();
    //          }),
    //          delete_file:this.proxy(function(e){
    //              this.delete_file(e);
    //          })
    //      })
    //      this.auditattachment.creat_list(attachmentData);
    //     
    //    },



    modifyRow: function(e) {
        e.preventDefault();
        //填写原因和措施
        //责任人 产生原因 整改期限
        //保存 取消  baocun
        //保存updateImproveRecordReasonAndMeasure

        //审核通过不通过
        //审核意见
        //审核通过 拒绝 暂时无法完成  取消 pass reject uncompleted
        //updateImproveRecordReasonAndMeasure
        //updateImproveRecordStatus

        //填写完成情况
        //整改完成情况
        //保存 提交 取消 save update
        //保存updateImproveRecordCompletion
        //提交commitImproveRecordCompletion
        var datadata = JSON.parse($(e.currentTarget).attr("datadata"));
        var flowStatus = this.currdata.data.workflowNodeAttributes.flowStatus || "";
        var tomData = {
            "canModify": this.currdata.data.workflowNodeAttributes.canModify || '',
            "required": this.currdata.data.workflowNodeAttributes.required || '',
            "actions": this.currdata.data.actions || [],
            "showActions": this.currdata.data.showActions,
            "canDo": this.currdata.data.workflowNodeAttributes.canDo
        }
        var buttons = [];
        var canModify, required, readonly;
        switch (flowStatus) {
            case "cuoShi":
                if (tomData.actions.length > 0) {
                    if (tomData.showActions) {
                        required = tomData.required;
                        if (datadata.improveItemStatus.description === "预案通过") {
                            buttons.push("close");
                            canModify = tomData.canModify;
                            readonly = true;
                        } else {
                            buttons = tomData.canDo.split(",").concat("baocun").concat("close");
                            canModify = tomData.canModify;
                        }
                    }
                } else {
                    buttons.push("close");
                    canModify = tomData.canModify;
                    readonly = true;
                }
                break;
            case "chuShiShenHe":
                if (tomData.actions.length > 0) {
                    if (tomData.showActions) {
                        required = tomData.required;
                        if (datadata.improveItemStatus.description === "预案通过") {
                            buttons.push("close");
                            canModify = tomData.canModify;
                            readonly = true;
                        } else {
                            buttons = tomData.canDo.split(",").concat("baocun").concat("close");
                            canModify = tomData.canModify;
                        }
                    }
                } else {
                    buttons.push("close");
                    canModify = tomData.canModify;
                    readonly = true;
                }
                break;
            case "shenHe":
                if (tomData.actions.length > 0) {
                    if (tomData.showActions) {
                        required = tomData.required;
                        if (datadata.improveItemStatus.description !== "措施制定") {
                            buttons.push("close");
                            canModify = tomData.canModify;
                            readonly = true;
                        } else {
                            buttons = tomData.canDo.split(",").concat("close");
                            canModify = tomData.canModify;
                        }
                    } else {
                        buttons.push("close");
                        canModify = tomData.canModify;
                        readonly = true;
                    }
                } else {
                    buttons.push("close");
                    canModify = tomData.canModify;
                    readonly = true;
                }
                break;
            case "zhengGaiWanCheng":
                //save commit
                if (tomData.actions.length > 0) {
                    if (tomData.showActions) {
                        buttons = tomData.canDo.split(",").concat("close");
                        canModify = tomData.canModify;
                        required = tomData.required;
                    } else {
                        buttons.push("close");
                        canModify = tomData.canModify;
                        readonly = true;
                    }
                    if (datadata.improveItemStatus.code == "8") {
                        buttons = ["close"];
                    }
                } else {
                    buttons.push("close");
                    canModify = tomData.canModify;
                    readonly = true;
                }
                break;
            case "wanCheng":
                buttons.push("close");
                canModify = tomData.canModify || "improveRemark,auditOpinion";
                readonly = true;
                break;
            case "jieAn":
                buttons.push("close");
                canModify = tomData.canModify;
                readonly = true;
                break;
        }

        if (!this.recordDiForm) {
            $.u.load('com.audit.innerAudit.xitong_jihua.zhenggaidan_dialog');
        }
        this.recordDiForm = new com.audit.innerAudit.xitong_jihua.zhenggaidan_dialog($("div[umid='recordDiForm']", this.$), {
            "id": $(e.currentTarget).attr("dataid") || "",
            "data": {
                "buttons": buttons,
                "canModify": canModify,
                "required": required,
                "readonly": readonly
            }
        });
        this.recordDiForm.open();
        this.recordDiForm.override({
            refresh: this.proxy(function(data) {
                this.refresh();
            })
        });
    },

    save_zhenggaidan: function(e) {
        if (!this.form.valid()) {
            return
        }
        var obj = this.getParm();
        if (this.zhenggaidan_id != "") {
            $.u.ajax({ //保存数据
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "stdcomponent.update",
                    "dataobject": "improve",
                    "obj": JSON.stringify(obj),
                    "dataobjectid": parseInt(this.zhenggaidan_id),
                    "tokenid": $.cookie("tokenid"),
                },
            }).done(this.proxy(function(response) {
                if (response.success) {
                    $.u.alert.success("保存成功");
                } else {
                    $.u.alert.error(response.reason);
                }
            }))
        }
    },
    //右上角按钮
    _on_action_button: function(e) {
        var cur_name = $(e.currentTarget).attr("name");
        var wipId = $(e.currentTarget).attr("wipId");
        //签批件是否上传
        // if(this.currdata.data.improve.improveFiles.length == 0){
        //  return $.u.alert.error("请先上传签批件",2000);
        // }
        //      if($(".com-audit-innerAudit-xitong_jihua-RectifyAttachment").length){
        //          if( $(".com-audit-innerAudit-xitong_jihua-RectifyAttachment").find("tbody td").hasClass("dataTables_empty")){
        //              return $.u.alert.error("请先上传验证签批件",2000);
        //          }
        //      }
        if ($.inArray("improver", this.requiredArray) > -1) {
            if (this.improver.val() === "") {
                if (!this.improver.closest(".panel-body").is(":visible")) {
                    this.improver.closest(".panel-body").siblings(".panel-heading").find(".glyphicon-btn").trigger("click");
                }
                this.improver.focus();
                return $.u.alert.info("请填写下方的整改联系人！", 2000)
            }
        }
        if ($.inArray("improverTel", this.requiredArray) > -1) {
            if (this.improverTel.val() === "") {
                if (!this.improverTel.closest(".panel-body").is(":visible")) {
                    this.improverTel.closest(".panel-body").siblings(".panel-heading").find(".glyphicon-btn").trigger("click");
                }
                this.improverTel.focus();
                return $.u.alert.info("请填写下方的联系方式！", 2000)
            }
        }
        if (!this.form.valid()) {
            return
        }

        var obj = this.getParm();
        var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        if (this.zhenggaidan_id != "") {
                            $.u.ajax({ //先保存数据
                                url: $.u.config.constant.smsmodifyserver,
                                type: "post",
                                dataType: "json",
                                cache: false,
                                data: {
                                    "method": "stdcomponent.update",
                                    "dataobject": "improve",
                                    "obj": JSON.stringify(obj),
                                    "dataobjectid": parseInt(this.zhenggaidan_id),
                                    "tokenid": $.cookie("tokenid"),
                                },
                            }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                if (response.success) {
                                    $.u.ajax({ //actinos按钮操作
                                        url: $.u.config.constant.smsmodifyserver,
                                        type: "post",
                                        dataType: "json",
                                        cache: false,
                                        data: {
                                            "method": "operate",
                                            "tokenid": $.cookie("tokenid"),
                                            "action": wipId,
                                            "dataobject": "improve",
                                            "id": parseInt(this.zhenggaidan_id),
                                        },
                                    }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                        if (response.success) {
                                            confirm.confirmDialog.dialog("close");
                                            $.u.alert.success("操作成功");
                                            window.location.reload();
                                        } else {
                                            $.u.alert.error(response.reason);
                                        }
                                    }))
                                } else {
                                    $.u.alert.error(response.reason);
                                }
                            }))
                        }
                    })
                }
            }
        })
    },

    //填写原因和措施的导出
    _on_export_button: function(e) {
        e.preventDefault();
        window.open($.u.config.constant.smsqueryserver + "?method=exportImproveToPdf&tokenid=" + $.cookie("tokenid") + "&improveId=" + this._options.id);
    },
    //填写完成情况的导出
    _on_exportpdf_button: function(e) {
        e.preventDefault();
        window.open($.u.config.constant.smsqueryserver + "?method=exportTraceToPdf&tokenid=" + $.cookie("tokenid") + "&improveId=" + this._options.id);
    },



    refresh: function() {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "method": "getImproveById",
                "isTransmitted": this._options.isTransmitted || false,
                "isGroupedByImproveUnit": this._options.isGroupedByImproveUnit || false,
                "id": this._options.id, //整改单ID
                "tokenid": $.cookie("tokenid"),
            },
        }, this.$).done(this.proxy(function(response) {
            if (response.success) {
                if (response.data.improve) {
                    this.currdata = response;
                    if (response.data.actions.length) {
                        this.action = true;
                    } else {
                        this.action = false;
                    }
                    var flowStatus = response.data.workflowNodeAttributes.flowStatus;

                    //                      switch(flowStatus){
                    //                          case "cuoShi":
                    //                              break;
                    //                          case "shenHe":
                    //                              break;
                    //                          case "zhengGaiWanCheng":
                    //                              this.creat_audit_attachment(response.data.improve.improveSUB2_SUB3Files);// //验证签批件
                    //                              break;
                    //                          case "wanCheng":
                    //                              this.creat_audit_attachment(response.data.improve.improveSUB2_SUB3Files);// //验证签批件
                    //                              break;
                    //                          case "jieAn":
                    //                              this.creat_audit_attachment(response.data.improve.improveSUB2_SUB3Files);// //验证签批件
                    //                              break;
                    //                      }

                    this.creat_downfiles(response.data.improve);
                    this.creat_checklist(response.data.improve.checkLists);
                    this.creat_files(response.data.improve.improveFiles);
                    this.creat_action(response.data);
                }
            } else {
                $.u.alert.error(response.reason);
            }
        }))
    },

    creat_downfiles: function(improveData) {
        //下载的签批件
        this.formtbody = this.form.find("tbody");
        this.formtbody.find("table").each(this.proxy(function(idx, item) {
            $(item).closest("tr").remove();
        }))

        var datadata = [{
            "propkey": "auditReportFiles",
            "propid": "reportattachment",
            "propname": "审计报告签批件"
        }, {
            "propkey": "improveFiles",
            "propid": "improvettachment",
            "propname": "整改反馈签批件"
        }]
        $.each(datadata, this.proxy(function(idy, item) {
            if (improveData[item.propkey].length) {
                var _htm = this.attachmenttemp.replace(/#\{propid\}/g, item.propid)
                    .replace(/#\{propname\}/g, item.propname);
                var $htm = $(_htm);
                $.each(improveData[item.propkey], this.proxy(function(k, file) {
                    $htm.find("tbody").append("<tr>" +
                        "<td>" + (k + 1) + ".  <a class='file_click' href='#' fileid='" + file.id + "'>" + file.fileName + "</a></td>" +
                        "<td>" + file.size + "</td>" +
                        "<td>" + file.uploadUser + "</td>" +
                        "<td>" + file.uploadTime + "</td>" +
                        "</tr>");
                }))
                $htm.appendTo(this.formtbody);
            }
        }))
        this.form.off("click", ".file_click").on("click", ".file_click", this.proxy(this.download_file));
    },

    creat_checklist: function(checkListsData) {
        var arrayUnit = [],
            arrayUnit2 = [];
        $.each(checkListsData || [], this.proxy(function(idx, item) {
            if (item.constructor == Array) {
                $.each(item, this.proxy(function(k, obj) {
                    if (obj.improveUnit2) {
                        arrayUnit2.push(obj);
                    } else {
                        arrayUnit.push(obj);
                    }
                }))
            } else {
                if (item.improveUnit2) {
                    arrayUnit2.push(item);
                } else {
                    arrayUnit.push(item);
                }
            }
        }))
        arrayUnit = arrayUnit.concat(arrayUnit2).sort(function(a, b) {
            return a.id < b.id;
        });
        if ($.fn.DataTable.isDataTable(this.qid("zhenggaidan_modify_table"))) {
            this.qid("zhenggaidan_modify_table").dataTable().api().destroy();
            this.qid("zhenggaidan_modify_table").empty();
        }
        //整改反馈问题列表
        this.checklistdataTable = this.qid("zhenggaidan_modify_table").dataTable({
            pageLength: 50,
            searching: false,
            serverSide: false, //是否启动服务器端数据导入  
            bProcessing: false,
            sDom: "t<f>",
            ordering: false,
            "info": true,
            "loadingRecords": "加载中...",
            "aaData": arrayUnit || [],
            "aoColumns": [{
                "title": "序号",
                "mData": "id",
                "sWidth": "7%"
            }, {
                "title": "存在问题汇总",
                "mData": "itemPoint",
                "sWidth": "40%"
            }, {
                "title": "主要责任单位",
                "mData": "improveUnit",
                "sWidth": "12%"
            }, {
                "title": "额外责任单位",
                "mData": "id",
                "sWidth": "12%"
            }, {
                "title": "整改期限",
                "mData": "improveLastDate",
                "sWidth": "12%"
            }, {
                "title": "审计状态",
                "mData": "improveItemStatus",
                "sWidth": "12%"
            }],
            "oLanguage": this._DATATABE_LANGUAGE,
            "fnServerParams": this.proxy(function(aoData) {}),
            "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {}),
            "aoColumnDefs": [{
                "aTargets": 0,
                "orderable": false,
                "sClass": "tdidx",
                "sContentPadding": "mmm",
                "mDataProp": "",
                "bVisible": true,
                "sDefaultContent": "--", //允许给列值一个默认值，只要发现null值就会显示默认值
                "mRender": function(data, type, full) {
                    return ""
                }
            }, {
                "aTargets": 1,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return "<div>检查要点：<a href='#' class='rModify' dataid='" + full.id + "' datadata='" + JSON.stringify(full) + "'> " + full.itemPoint + "</a><br/><div>审计记录：" + full.auditRecord
                })
            }, {
                "aTargets": 2,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return data.name || ""
                })
            }, {
                "aTargets": 3,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    if (full.improveUnit2) {
                        return full.improveUnit2.name
                    }
                    return ""
                })
            }, {
                "aTargets": 4,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return data
                })
            }, {
                "aTargets": 5,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return data.description || ""
                })
            }],

            "rowCallback": this.proxy(function(row, data, index) {
                if (data.improveItemStatus && data.improveItemStatus.description == "措施制定") {
                    $(row).attr("style", "background-color: #dff0d8 !important");
                }
                if (data.improveItemStatus && data.improveItemStatus.description == "完成情况") {
                    $(row).attr("style", "background-color: #CFE4D5 !important");
                }
            })
        });

        this.checklistdataTable.off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
        $(".tdidx").each(function(ids, item) {
            if (item.tagName == "TD") {
                $(item).text(ids);
            }
        })
    },


    creat_files: function(improveFilesData) {
        //上传的签批件
        if ($.fn.DataTable.isDataTable(this.zhenggaidanattachment)) {
            this.zhenggaidanattachment.dataTable().api().destroy();
            this.zhenggaidanattachment.empty();
        }
        this.zhenggaidanattachment.dataTable({
            pageLength: 50,
            searching: false,
            serverSide: false, //是否启动服务器端数据导入  
            bProcessing: false,
            sDom: "t<f>",
            ordering: false,
            "info": true,
            "loadingRecords": "加载中...",
            "aaData": improveFilesData || [],
            "aoColumns": [{
                "title": "文件名",
                "mData": "fileName",
                "sWidth": ""
            }, {
                "title": "大小",
                "mData": "size",
                "sWidth": "15%"
            }, {
                "title": "上传时间",
                "mData": "uploadTime",
                "sWidth": "15%"
            }, {
                "title": "上传用户",
                "mData": "uploadUser",
                "sWidth": "15%"
            }, {
                "title": "操作",
                "mData": "id",
                "sWidth": "10%"
            }],
            "oLanguage": this._DATATABE_LANGUAGE,
            "fnServerParams": this.proxy(function(aoData) {}),
            "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {}),
            "aoColumnDefs": [{
                "aTargets": 0,
                "orderable": false,
                "sClass": "",
                "sContentPadding": "mmm",
                "mDataProp": "",
                "bVisible": true,
                "sDefaultContent": "--", //允许给列值一个默认值，只要发现null值就会显示默认值
                "mRender": function(data, type, full) {
                    return data
                }
            }, {
                "aTargets": 1,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return data
                })
            }, {
                "aTargets": 2,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return data
                })
            }, {
                "aTargets": 3,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return data
                })
            }, {
                "aTargets": 4,
                "sClass": "",
                "mRender": this.proxy(function(data, type, full) {
                    return "<span class='glyphicon glyphicon-trash del-file' fileid='" + full.id + "' style='cursor: pointer;'></span>"
                })
            }],

            "rowCallback": this.proxy(function(row, data, index) {

            })
        });

        this.zhenggaidanattachment.off("click", ".del-file").on("click", ".del-file", this.proxy(this.delete_file));
    },
    creat_hiddenModel: function(response) {
        if (response.data.workflowNodeAttributes && response.data.workflowNodeAttributes.hiddenModel) {
            if (!(this.isfirst_init)) {
                $.each(response.data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k, v) {

                }));
            }
        }
    },


    creat_reject: function(response) {
        this.qid("improveRejectedFiles").addClass("hidden");
        if (response.data.improve.improveRejectedFiles.length > 0) {
            this.qid("improveRejectedFiles").removeClass("hidden");
            if ($.fn.DataTable.isDataTable(this.qid("Rejectdatatable"))) {
                this.qid("Rejectdatatable").dataTable().api().destroy();
                this.qid("Rejectdatatable").empty();
            }
            this.dataTable_reject = this.qid("Rejectdatatable").dataTable({
                searching: false,
                serverSide: false,
                bProcessing: true,
                ordering: false,
                pageLength: 10,
                "sDom": "t<i>",
                "columns": [{
                        "title": "文件名",
                        "mData": "fileName",
                        "sWidth": "40%"
                    }, {
                        "title": "大小",
                        "mData": "size",
                        "sWidth": "20%"
                    }, {
                        "title": "上传时间",
                        "mData": "uploadTime",
                        "sWidth": "20%"
                    }, {
                        "title": "上传用户",
                        "mData": "uploadUser",
                        "sWidth": "20%"
                    }

                ],
                "aaData": response.data.improve.improveRejectedFiles || [],
                "bInfo": false,
                "bDeferRender": true,
                "oLanguage": { //语言
                    "sZeroRecords": "抱歉未找到记录",
                    "sInfoEmpty": "没有数据",
                },
                "fnServerParams": this.proxy(function(aoData) {}),
                "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {}),
                "aoColumnDefs": []
            });

        }
    },


    creat_action: function(Data) {
        //右上角actions button
        this.qid("top_buttons").empty();
        var ret = [];
        if (Data.workflowNodeAttributes.canModify) {
            ret = $.grep(Data.workflowNodeAttributes.canModify.split(","), this.proxy(function(item, idx) {
                return this.form.find("[name=" + item + "]:not([readonly]):enabled").length > 0;
            }))
        }
        if (Data.actions.length) {
            if (ret.length) {
                this.qid("top_buttons").append("<button type='button' qid='baoCun' class='btn btn-default btn-sm save'>保存</button>")
            }
            if (Data.workflowNodeAttributes.flowStatus === "cuoShi") {
                this.qid("top_buttons").append("<button type='button'  class='btn btn-default btn-sm export'>导出</button>")
            }
            if (Data.workflowNodeAttributes.flowStatus === "zhengGaiWanCheng") {
                this.qid("top_buttons").append("<button type='button'  class='btn btn-default btn-sm exportpdf'>导出</button>")
            }
            $.each(Data.actions, this.proxy(function(k, v) {
                if (v.name === "结案") {
                    this.qid("top_buttons").append('<button class="btn btn-default btn-sm closeImprove" name="' + v.name + '" wipId="' + v.wipId + '">' + v.name + '</button>');
                } else {
                    this.qid("top_buttons").append('<button class="btn btn-default btn-sm action_button" name="' + v.name + '" wipId="' + v.wipId + '">' + v.name + '</button>');
                }
            }))

            this.qid("top_buttons").off("click", ".save").on("click", ".save", this.proxy(this.save_zhenggaidan));
            this.qid("top_buttons").off("click", ".action_button").on("click", ".action_button", this.proxy(this._on_action_button));
            this.qid("top_buttons").off("click", ".closeImprove").on("click", ".closeImprove", this.proxy(this._on_close_button));
            this.qid("top_buttons").off("click", ".export").on("click", ".export", this.proxy(this._on_export_button));
            this.qid("top_buttons").off("click", ".exportpdf").on("click", ".exportpdf", this.proxy(this._on_export_button));
        }

        //所有的都通过了 ，通过可用，有一条拒绝，拒绝可用
        //整改反馈 :1,措施制定 :2,  预案通过: 4,预案拒绝: 5
        if (Data.improve.flowStep == "3" && Data.improve.flowStatus=="整改审核") { //整改审核
        	this.isReject = 5;
        	this.isPass = 4;
            $.each(Data.improve.checkLists || [], this.proxy(function(idy, Titem) {
            	$.each(Titem,this.proxy(function(index,item){
                        if (item.improveItemStatus && item.improveItemStatus.code == "5") {
                        	this.isReject = 5;
                        	this.isPass = 0;
                        } 
//                        if (Titem.improveItemStatus && Titem.improveItemStatus.code == "5") {
//                        	this.isComplete = 5;
//                        }
            	}))
            }))

            this.qid("top_buttons").children("button").each(this.proxy(function(i, btn) {
                var $btn = $(btn).attr("disabled", true);

                if (this.isPass == 0 && ($btn.text() == "退回" || $btn.text() == "拒绝")) {
                    $btn.removeAttr("disabled");
                }
                if (this.isPass == 4 && $btn.text() == "通过") {
                    $btn.removeAttr("disabled");
                }
            }))
        }
        if (Data.workflowNodeAttributes.flowStatus === "cuoShi" && $.isArray(Data.actions) && Data.actions.length) {
            this.qid("add_file").removeClass("hidden");
            this.zhenggaidanattachment.find(".del-file").removeClass("hidden");
        } else {
            this.qid("add_file").addClass("hidden");
            this.zhenggaidanattachment.find(".del-file").addClass("hidden");
        }
        if ($(".com-audit-innerAudit-xitong_jihua-RectifyAttachment").length) {
            var RectifyAttachment = $(".com-audit-innerAudit-xitong_jihua-RectifyAttachment");
            var add_attachment = $(".com-audit-innerAudit-xitong_jihua-RectifyAttachment").find("[qid=add_attachment]");
            if (Data.workflowNodeAttributes.flowStatus === "zhengGaiWanCheng" && $.isArray(Data.actions) && Data.actions.length) {
                add_attachment.removeClass("hidden");
                RectifyAttachment.find(".delete-file").removeClass("hidden");
            } else {
                add_attachment.addClass("hidden");
                RectifyAttachment.find(".delete-file").addClass("hidden");
            }
        }
        if (!Data.showActions) {
            this.qid("top_buttons").addClass("hidden");
        }
    },

    getParm: function() {
        return {
            "improver": this.improver.val(),
            "improverTel": this.improverTel.val(),
            "remark": this.remark.val()
        }
    },
    /**
     * @title 销毁页面的组件,请空按钮
     */
    _destroyModule: function() {
        this.comps && $.each(this.comps, this.proxy(function(key, comp) {
            comp.destroy();
            delete this.comps[key];
        }));
        this.leftColumns.empty();
    },
    _drawModule: function(config) {
        var $target = null,
            clazz = null,
            option = {};
        var zhenggaidan_id = this.zhenggaidan_id;
        this._destroyModule();
        if (config) {
            //config.left && $.each(config.left,this.proxy(function(idx,comp){
            clazz = $.u.load(config.key);
            option = $.extend(true, {}, config, {
                logRule: [
                    [{
                        "key": "source",
                        "value": parseInt(zhenggaidan_id)
                    }],
                    [{
                        "key": "sourceType",
                        "value": "improve"
                    }]
                ],
                remarkRule: [
                    [{
                        "key": "source",
                        "value": parseInt(zhenggaidan_id)
                    }],
                    [{
                        "key": "sourceType",
                        "value": "improve"
                    }]
                ],
                remarkObj: {
                    source: parseInt(zhenggaidan_id),
                    sourceType: "improve"
                },
                "addable": true,
                flowid: this.flowid
            });
            this.comps[config.key] = new clazz($("<div umid='leftmodule4" + "'/>").appendTo(this.leftColumns), option);
        };
    },



    canModify: function(data) {
        switch (data) {
            case "improveName":
                this.improveName.attr("readonly", false);
                break;
            case "improveNo":
                this.improveNo.attr("readonly", false);
                break;
            case "auditunit_Name":
                this.auditunit_Name.attr("readonly", false);
                break;
            case "auditDate":
                this.auditDate.attr("readonly", false);
                break;
            case "auditedunit_Name":
                this.auditedunit_Name.attr("readonly", false);
                break;
            case "audit_address":
                this.audit_address.attr("readonly", false);
                break;
            case "transactor":
                this.transactor.attr("readonly", false);
                break;
            case "transactorTel":
                this.transactorTel.attr("readonly", false);
                break;
            case "improver":
                this.improver.attr("readonly", false);
                break;
            case "improverTel":
                this.improverTel.attr("readonly", false);
                break;
            case "remark":
                this.remark.attr("readonly", false);
                break;
            case "aCheck":

                break;
        }
    },
    canDo: function(data) {
        switch (data) {
            case "baoCun":
                $('button[qid=' + data + ']').removeClass("hidden");
                break;
            case "xiaFa":
                $('button[qid=' + data + ']').removeClass("hidden");
                break;
        }
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});
com.audit.innerAudit.xitong_jihua.zhenggaifankuidan.widgetjs = ['../../../../uui/widget/jqurl/jqurl.js',
    '../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'
];
com.audit.innerAudit.xitong_jihua.zhenggaifankuidan.widgetcss = [{
    path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];