//@ sourceURL=com.audit.xitong_jihua.zhenggaifankuidan
$.u.define('com.audit.xitong_jihua.zhenggaifankuidan', null, {
    init: function(options) {
        this._options = options || {};
        this.flowstep = "";
        this.userId = JSON.parse($.cookie('userid'));
    },
    afterrender: function(bodystr) {
        var da = $.urlParam();
        this._options.id = da.id;
        this._options.isTransmitted = da.isTransmitted;
        this._options.isDividedByProfession = "false";
        if (!this._options.id) {
            window.open("Xitong_jihua_gongzuotai.html", '_self');
        }
        this.init_html();
        this.init_data();
    },
    init_html: function() {
        this.add_file = this.qid("add_file");
        this.add_file.off("click").on("click", this.proxy(this._add_file));
        this.file1 = this.qid("file1");
        this.file2 = this.qid("file2");
        this.file3 = this.qid("file3");
        this.leftColumns = this.qid("left-column");
        this.top_buttons = this.qid("top_buttons");
        this.piliang_zhuanfa = this.qid("piliang_zhuanfa");
        this.pro_tbody = this.qid("pro_tbody");
        this.piliang_zhuanfa.off("click").on("click", this.proxy(this.zhuanfa));
        this.checkbox_all = this.qid("checkbox_all");
        this.checkbox_all.click(this.proxy(function() {
            var all = this.checkbox_all.prop("checked");
            this.pro_tbody.find("[type='checkbox']").prop("checked", all);
        }));
        this.$.find("i.fa").click(this.proxy(this.on_togglePanel_click));
    },


    on_togglePanel_click: function(e) {
        var $tar = $(e.currentTarget);
        var $span = "";
        if ($tar.prop("nodeName") == "I") {
            $span = $tar;
        } else {
            $span = $tar.find("i") || $tar.find(".fa");
        }
        if ($span.hasClass("fa-minus")) {
            $span.removeClass("fa-minus").addClass("fa-plus");
        } else {
            $span.removeClass("fa-plus").addClass("fa-minus");
        }
        $tar.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
    },

    init_data: function() {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "method": "getImproveById",
                "id": this._options.id,
                "isTransmitted": (this._options.isTransmitted == "false" ? false : true),
                "isDividedByProfession": (this._options.isDividedByProfession == "false" ? false : true),
                "tokenid": $.cookie("tokenid")
            },
        }, this.$).done(this.proxy(function(response) {
            if (response.success) {
                this.flowstep = response.data.improve.flowStep;
                //1、添加基本信息
                this.qid("improveName").val(response.data.improve.improveName || '');
                this.qid("improveNo").val(response.data.improve.improveNo || '');
                this.qid("auditunit_Name").val(response.data.improve.operator && response.data.improve.operator.name || '');
                this.qid("auditDate").val(response.data.improve.startDate + "至" + response.data.improve.endDate);
                this.qid("auditedunit_Name").val(response.data.improve.target && response.data.improve.target.name || '');
                this.qid("audit_address").val(response.data.improve.address || '');
                var transactors = '';
                for (var i in response.data.improve.transactor) {
                    transactors += response.data.improve.transactor[i].name + " ";
                }
                this.qid("transactor").val(transactors);
                this.qid("transactorTel").val(response.data.improve.transactorTel || '');
                this.qid("improver").val(response.data.improve.improver || '');
                this.qid("improverTel").val(response.data.improve.improverTel || '');
                this.qid("info_remark").val(response.data.improve.remark || '');
                var audit_report_files = "";
                response.data.improve.auditReportFiles && $.each(response.data.improve.auditReportFiles, this.proxy(function(item, value) {
                    audit_report_files += '<a class="file_click" href="#" name="' + value.id + '">' + value.fileName + '</a>';
                }));
                this.qid("audit_report_qianpijian").html(audit_report_files);
                this.qid("audit_report_qianpijian").find("a.file_click").off("click").on("click", this.proxy(this.download_file));
                //2、根据工作流的flowStep来判断必填和可以修改的表格
                switch (this.flowstep) {
                    case "1":
                    case "2":
                        if (response.data.actions && response.data.actions.length == 0) {
                            this.qid("improver").add(this.qid("improverTel")).add(this.qid("info_remark")).attr("readonly", "readonly");
                        } else {
                            this.qid("improver").add(this.qid("improverTel")).add(this.qid("info_remark")).removeAttr("readonly");
                        }
                        break;
                    default:
                        this.qid("improver").add(this.qid("improverTel")).add(this.qid("info_remark")).attr("readonly", "readonly");
                        $('span.bitian').remove();
                        break;
                }
                //3、整改反馈列表.根据flowstep传过去能否修改的参数
                var probody_html = '';
                var btnshow = false; //通过拒绝是否显示
                var hasUnit2 = [],
                    noUnit2 = [],
                    unit2 = [];
                $.each(response.data.improve.checkLists, function(k, v) {
                    v.improveUnit2 ? hasUnit2.push(v) : noUnit2.push(v);
                });
                noUnit2 = noUnit2.sort(function(a, b) {
                    return a.improveUnit.id > b.improveUnit.id;
                });
                unit2 = noUnit2.concat(hasUnit2);
                var preUnit = "";
                var show = "";
                unit2 && $.each(unit2, this.proxy(function(idx, dt) {
                    var cando = this.flowstep;
                    if (!preUnit) {
                        show = true;
                    } else if (preUnit) {
                        if (show && preUnit === dt.improveUnit.name) {
                            show = true;
                        } else if (show === false && preUnit === dt.improveUnit.name) {
                            show = false;
                        } else if (preUnit !== dt.improveUnit.name) {
                            show = false;
                        }
                    }
                    preUnit = dt.improveUnit.name;
                    //整改反馈 0 整改转发 1 措施指定 2  预案上报3 预案通过 4 预案拒绝 5 暂时无法完成 6 完成情况 7 整改完成8  已经指派9 通过 10
                    if (this._options.isTransmitted === "false") {
                        if (this.flowstep === "1" || this.flowstep === "2") {
                            if (response.data.actions && response.data.actions.length == 0) {
                                this.piliang_zhuanfa.remove();
                                cando = "0";
                            } else {
                                if (dt.improveItemStatus.code == 4) {
                                    cando = "0";
                                } else if (dt.improveItemStatus.code == 1) {
                                    this.userId = JSON.parse($.cookie('userid'));
                                    var ids = [];
                                    var improveItemUsers = unit2[idx].improveItemUsers;
                                    improveItemUsers && $.each(improveItemUsers, this.proxy(function(index, user) {
                                        if (user.userId) {
                                            ids.push(user.userId);
                                        }
                                    }));
                                    if ($.inArray(this.userId, ids) > -1) {
                                        cando = "1";
                                    } else {
                                        cando = "0";
                                    }
                                } else if (dt.improveItemStatus.code == 5) {
                                    cando = "1";
                                }
                            }
                        } else {
                            if (response.data.actions && response.data.actions.length == 0) {
                                cando = "0";
                            }
                        }
                    } else {
                        if (dt.improveItemStatus && (dt.improveItemStatus.code == 2 || dt.improveItemStatus.code == 6)) {
                            cando = "0";
                        } else {
                            cando = "1";
                        }
                        if (dt.improveItemStatus && dt.improveItemStatus.code == 6) {
                            return;
                        }
                    }
                    var style = "";
                    switch (cando) {
                        case "0":
                        case "1":
                        case "2":
                            if (dt.improveItemStatus.code == 4 || dt.improveItemStatus.code == 2 || (dt.improveItemStatus.code == 1 && dt.improveResponsiblePerson)) {
                                style = "background-color: #dff0d8;";
                            }
                            break;
                        case "3":
                            if (dt.improveItemStatus && dt.improveItemStatus.code == 4) {
                                style = "background-color: #dff0d8;";
                                cando = "6";
                            } else if (dt.improveItemStatus && dt.improveItemStatus.code == 5) {
                                style = "background-color: #dff0d8;";
                                cando = "6";
                                btnshow = true;
                            }
                            break;
                        case "4":
                            if (dt.improveItemStatus && (dt.improveItemStatus.code == 8 || dt.improveItemStatus.code == 10)) {
                                style = "background-color: #dff0d8;";
                                cando = "7";
                            }
                            break;
                    }
                    style ? probody_html += '<tr style="' + style + '">' : (show ? probody_html += '<tr style="background-color: #f9f9f9;">' : probody_html += '<tr style="    background-color: white;">');
                    // probody_html += "<td class='text-center'><input type='checkbox' name='";
                    // probody_html += dt.id + "," + dt.improveUnit.name + "," + (dt.improveUnit2 ? dt.improveUnit2.name : "") + "," + dt.improveItemStatus.code + "' value='checkbox'></td>";
                    probody_html += '<td>' + (idx + 1) + '</td><td style="text-align:left;">';
                    probody_html += '<span>检查要点：<a href="#" class="rModify" name="' + cando + "," + dt.id + "," + this._options.id + "," + dt.improveItemStatus.code + '">' + dt.itemPoint + '</a></span><br>';
                    probody_html += '审计记录：' + (dt.auditRecord || '') + '</td>';
                    probody_html += '<td>' + (dt.improveResponsiblePerson || '') + '</td>';
                    probody_html += '<td>' + (dt.improveUnit.name || '') + '</td>';
                    probody_html += '<td>' + (dt.improveUnit2 && dt.improveUnit2.name || '') + '</td>';
                    probody_html += '<td>' + (dt.improveLastDate || '') + '</td>';
                    probody_html += '<td data-code="' + dt.improveItemStatus.code + '">' + (dt.improveItemStatus && dt.improveItemStatus.description || '') + '</td></tr>';
                }));
                this.pro_tbody.html(probody_html);
                this.pro_tbody.find('a.rModify').off("click").on("click", this.proxy(this.modifyRow));
                //4、拒绝的签批件
                var file1 = "";
                this.file1.empty();
                response.data.improve.improveRejectedFiles && $.each(response.data.improve.improveRejectedFiles, this.proxy(function(k, v) {
                    file1 += "<tr><td><a href='#' class='file_click' name='" + v.id + "'>" + v.fileName + "</a></td>";
                    file1 += "<td>" + v.size + "</td>";
                    file1 += "<td>" + v.uploadTime + "</td>";
                    file1 += "<td>" + v.uploadUser + "</td>";
                    file1 += "<td></td>";
                    file1 += "</tr>";
                }));
                this.file1.append(file1);
                this.file1.find("a.file_click").off("click").on("click", this.proxy(this.download_file));
                this.file1.find("span.del-file").off("click").on("click", this.proxy(this.delete_file));
                //三级签批件
                // if (this.flowstep === "2" || this.flowstep === "4") {
                //     this.file3.parents('.panel-sms').remove();
                // } else {
                //     var file3 = "";
                //     this.file3.empty();
                //     response.data.improve.transmittedFiles && $.each(response.data.improve.transmittedFiles, this.proxy(function(k, v) {
                //         file3 += "<tr><td><a href='#' class='file_click' name='" + v.id + "'>" + v.fileName + "</a></td>";
                //         file3 += "<td>" + v.size + "</td>";
                //         file3 += "<td>" + v.uploadTime + "</td>";
                //         file3 += "<td>" + v.uploadUser + "</td>";
                //         file3 += "<td></td>";
                //         file3 += "</tr>";
                //     }));
                //     this.file3.append(file3);
                //     this.file3.find("a.file_click").off("click").on("click", this.proxy(this.download_file));
                // }
                //5、新上传的签批件
                var files = "";
                this.file2.empty();
                var user = JSON.parse($.cookie('uskyuser'));
                var user_s = user.fullname + "(" + user.username + ")";
                if (this._options.isTransmitted === "true") {
                    response.data.improve.transmittedFiles && $.each(response.data.improve.transmittedFiles, this.proxy(function(k, v) {
                        files += "<tr><td><a href='#' class='file_click' name='" + v.id + "'>" + v.fileName + "</a></td>";
                        files += "<td>" + v.size + "</td>";
                        files += "<td>" + v.uploadTime + "</td>";
                        files += "<td>" + v.uploadUser + "</td>";
                        if (v.uploadUser == user_s) {
                            files += "<td><span class='glyphicon glyphicon glyphicon-trash fl-minus del-file' name='" + v.id + "' style='cursor: pointer;'></span></td>";
                        } else {
                            files += "<td></td>";
                        }
                        files += "</tr>";
                    }));
                } else {
                    response.data.improve.improveFiles && $.each(response.data.improve.improveFiles, this.proxy(function(k, v) {
                        files += "<tr><td><a href='#' class='file_click' name='" + v.id + "'>" + v.fileName + "</a></td>";
                        files += "<td>" + v.size + "</td>";
                        files += "<td>" + v.uploadTime + "</td>";
                        files += "<td>" + v.uploadUser + "</td>";
                        if (v.uploadUser == user_s && this.flowstep === "1") {
                            files += "<td><span class='glyphicon glyphicon glyphicon-trash fl-minus del-file' name='" + v.id + "' style='cursor: pointer;'></span></td>";
                        } else {
                            files += "<td></td>";
                        }
                        files += "</tr>";
                    }));
                }

                this.file2.append(files);
                this.file2.find("a.file_click").off("click").on("click", this.proxy(this.download_file));
                this.file2.find("span.del-file").off("click").on("click", this.proxy(this.delete_file));
                //6、按钮
                this.top_buttons.empty();
                if (response.data.actions && response.data.actions.length) {
                    var btn = "";
                    if ((this.flowstep === "1") || (this.flowstep === "2" && response.data.workflowNodeAttributes.flowStatus ==="buMenShenHe")) {
                        btn += '<button type="button" class="btn btn-default btn-sm save">保存</button><button type="button" class="btn btn-default btn-sm export">导出</button>';
                    } else {
                        this.add_file.remove();
                    }
                    $.each(response.data.actions, this.proxy(function(k, v) {
                        if ((this.flowstep === "3" && response.data.workflowNodeAttributes.flowStatus ==="shenHe") || (this.flowstep === "2" && response.data.workflowNodeAttributes.flowStatus ==="shenHe")) {
                            if (response.data.hasAuditRejected) {
                                if (v.name === "退回" || v.name === "拒绝") {
                                    btn += '<button type="button" class="btn btn-default btn-sm workflow" data-workflow="' + v.wipId + '">' + v.name + '</button>';
                                }
                            } else {
                                if (btnshow) {
                                    if (v.name == "退回" || v.name === "拒绝") {
                                        btn += '<button type="button" class="btn btn-default btn-sm workflow" data-workflow="' + v.wipId + '">' + v.name + '</button>';
                                    } else {
                                        btn += '<button type="button" class="btn btn-default btn-sm workflow hidden" data-workflow="' + v.wipId + '">' + v.name + '</button>';
                                    }
                                } else {
                                    if (v.name == "通过") {
                                        btn += '<button type="button" class="btn btn-default btn-sm workflow" data-workflow="' + v.wipId + '">' + v.name + '</button>';
                                    } else {
                                        btn += '<button type="button" class="btn btn-default btn-sm workflow hidden" data-workflow="' + v.wipId + '">' + v.name + '</button>';
                                    }
                                }
                            }
                        } else {
                            btn += '<button type="button" class="btn btn-default btn-sm workflow" data-workflow="' + v.wipId + '">' + v.name + '</button>';
                        }
                    }));
                    this.top_buttons.removeClass("hidden").append(btn);
                    this.top_buttons.find('button.save').off('click').on("click", this.proxy(this._save));
                    this.top_buttons.find('button.workflow').off('click').on("click", this.proxy(this._workflow));

                } else {
                    //转发的特殊情况
                    if (this._options.isTransmitted === "true") {
                        this.qid("improver").add(this.qid("improverTel")).add(this.qid("info_remark")).attr("readonly", "readonly");
                        this.piliang_zhuanfa.remove();
                        var noBtn = true;
                        $.each(response.data.improve.checkLists, function(k, v) {
                            if (v.improveItemStatus.code == 6) {
                                return;
                            }
                            if (v.improveItemStatus.code !== 2) {
                                noBtn = false;
                                return false;
                            }
                        });
                        if (!noBtn) {
                            this.top_buttons.removeClass("hidden").append('<button type="button" class="btn btn-default btn-sm export">导出</button><button type="button" class="btn btn-default btn-sm submit_3">提交</button>');
                            this.top_buttons.find('button.submit_3').off('click').on("click", this.proxy(this.submit_3));
                        } else {
                            this.add_file.remove();
                            this.$.find('span.del-file').remove();
                        }
                        this.file1.parent().parent().parent().remove();
                    } else {
                        this.add_file.remove();
                    }
                }
                this.top_buttons.find('button.export').off('click').on("click", this.proxy(this._export));
                if (!response.data.showActions) {
                    this.top_buttons.empty();
                }
                //批量转发按钮
                this.piliang_zhuanfa.remove();
                // if (this.flowstep !== "1") {
                //     this.piliang_zhuanfa.remove();
                // }
                //7、日志
                this.leftColumns.empty();
                if (response.data.logArea && response.data.logArea.key) {
                    var id = parseInt(this._options.id);
                    var clz = $.u.load(response.data.logArea.key);
                    var target = $("<div/>").attr("umid", "logs").appendTo(this.leftColumns);
                    new clz(target, $.extend(true, response.data.logArea, {
                        businessUrl: this.getabsurl("Xitong_jihua_zhenggaifankui.html?id=#{source}"),
                        logRule: [
                            [{
                                "key": "source",
                                "value": id
                            }],
                            [{
                                "key": "sourceType",
                                "value": "improve"
                            }]
                        ],
                        remarkRule: [
                            [{
                                "key": "source",
                                "value": id
                            }],
                            [{
                                "key": "sourceType",
                                "value": "improve"
                            }]
                        ],
                        remarkObj: {
                            source: id,
                            sourceType: "improve"
                        },
                        addable: true,
                        flowid: response.data.improve.flowId
                    }));
                }
                if (response.data.workflowNodeAttributes && response.data.workflowNodeAttributes.hiddenModel) {
                    $.each(response.data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k, v) {
                        if (v === "baseInfo") {
                            $(".baseInfo_zhankai").trigger("click");
                        } else if (v === "result") {
                            $(".jielun_zhankai").trigger("click");
                        } else if (v === "hasProblem") {
                            $(".problem_zhankai").trigger("click");
                        } else if (v === "files") {
                            $(".file_zhankai").trigger("click");
                        }
                    }));
                }
            }
        }));
    },
    /**
     * 转发的提交
     */
    submit_3: function() {
        var isall_complet = true;
        var checklist_ids = [];
        if (!this.file2.children().length) {
            $.u.alert.error("请先上传签批件！");
            return;
        }
        this.pro_tbody.find('tr').each(function(k, v) {
            if ($(v).css('background-color') !== "rgb(223, 240, 216)") {
                isall_complet = false;
                return false;
            } else {
                checklist_ids.push($(v).find('input[type=checkbox]').attr('name').split(',')[0]);
            }
        });
        if (!isall_complet) {
            $.u.alert.error("有条目没有操作！");
            return;
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
                            cache: false,
                            data: {
                                "method": "commitImproveRecord",
                                "ids": JSON.stringify(checklist_ids),
                                "tokenid": $.cookie("tokenid")
                            },
                        }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                $.u.alert.success("提交成功");
                                confirm.confirmDialog.dialog("close");
                                this.init_data();
                            } else {
                                $.u.alert.error(response.reason);
                            }
                        }))
                    })
                }
            }
        })
    },
    _add_file: function() {
        var num;
        if (this._options.isTransmitted === "false") {
            num = 6;
        } else {
            num = 11;
        }
        if (!this.fileDialog) {
            var clz = $.u.load("com.audit.comm_file.audit_uploadDialog");
            this.fileDialog = new clz($("div[umid='fileDialog']", this.$), null);
        }
        this.fileDialog.override({
            refresh: this.proxy(function(data) {
                var delete_files = "";
                delete_files += "<tr><td><a href='#' class='file_click' name='" + data.id + "'>" + data.fileName + "</a></td>";
                delete_files += "<td>" + data.size + "</td>";
                delete_files += "<td>" + data.uploadTime + "</td>";
                delete_files += "<td>" + data.uploadUser + "</td>";
                delete_files += "<td><span class='glyphicon glyphicon glyphicon-trash fl-minus del-file' name='" + data.id + "' style='cursor: pointer;'></span></td>";
                delete_files += "</tr>";
                this.file2.append(delete_files);
                this.file2.find("a.file_click").off("click").on("click", this.proxy(this.download_file));
                this.file2.find('span.del-file').off("click").on("click", this.proxy(this.delete_file));
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
    download_file: function(e) {
        e.preventDefault();
        var id = $(e.currentTarget).attr("name");
        window.open($.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([parseInt(id)]));
    },
    delete_file: function(e) {
        var $e = $(e.currentTarget)
        var file_id = $e.attr("name");
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
                            cache: false,
                            data: {
                                "method": "stdcomponent.delete",
                                "dataobjectids": JSON.stringify([parseInt(file_id)]),
                                "tokenid": $.cookie("tokenid"),
                                "dataobject": "file"
                            }
                        }).done(this.proxy(function(response) {
                            if (response.success) {
                                confirm.confirmDialog.dialog("close");
                                $e.closest('tr').fadeOut();
                            }
                        }))
                    })
                }
            }
        });
    },

    /**
     * 批量转发
     */
    zhuanfa: function() {
        var isreturn = false;
        var zhuafa_ids = [];
        var checkboxes = this.qid("pro_tbody").find("input[type=checkbox]:checked");
        var contacts = this.qid("improver").val();
        var contactsTel = this.qid("improverTel").val();
        var info_remark = this.qid("info_remark").val();
        if (contacts == "") {
            $.u.alert.error("整改联系人不能为空");
            this.qid("improver").focus();
            return;
        }
        if (contactsTel == "") {
            $.u.alert.error("联系方式不能为空");
            this.qid("improverTel").focus();
            return;
        }
        if (!checkboxes.length) {
            $.u.alert.error("请先选中要转发的条目！");
            return false;
        }
        var obj = {
            improver: contacts,
            improverTel: contactsTel,
            remark: info_remark
        };
        checkboxes.each(function() {
            var data = $(this).attr("name").split(",");
            var id = data[0];
            var danwei1 = data[1];
            var danwei2 = data[2];
            var currstatus_code = data[3];
            if (currstatus_code == "1" || currstatus_code == "5") {
                $.u.alert.error("有条目不可转发，不能执行此操作！");
                isreturn = true;
                return false;
            }
            if (danwei1.indexOf("安技部") > -1) {
                $.u.alert.error("责任单位有安技部的条目，不能执行此操作！");
                isreturn = true;
                return false;
            } else if ($.trim(danwei2) != "") {
                $.u.alert.error("有额外责任单位条目，不能执行此操作！");
                isreturn = true;
                return false;
            } else {
                zhuafa_ids.push(id);
            }
        });
        if (isreturn) {
            return;
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
                                "method": "stdcomponent.update",
                                "dataobject": "improve",
                                "obj": JSON.stringify(obj),
                                "dataobjectid": parseInt(this._options.id),
                                "tokenid": $.cookie("tokenid")
                            }
                        }).done(this.proxy(function(response) {
                            if (response.success) {
                                $.u.ajax({
                                    url: $.u.config.constant.smsmodifyserver,
                                    type: "post",
                                    dataType: "json",
                                    cache: false,
                                    data: {
                                        "method": "transmitImproveRecord",
                                        "ids": JSON.stringify(zhuafa_ids),
                                        "tokenid": $.cookie("tokenid")
                                    }
                                }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                    if (response.success) {
                                        $.u.alert.success("转发成功");
                                        confirm.confirmDialog.dialog("close");
                                        this.init_data();
                                    } else {
                                        $.u.alert.error(response.reason);
                                    }
                                }));
                            }
                        }))
                    })
                }
            }
        })
    },
    modifyRow: function(e) {
        e.preventDefault();
        var id = $(e.currentTarget).attr("name");
        if (!this.recordDiForm) {
            $.u.load('com.audit.xitong_jihua.zhenggaidan_dialog');
        }
        this.recordDiForm = new com.audit.xitong_jihua.zhenggaidan_dialog($("div[umid='recordDiForm']", this.$), {
            obj: id,
            status: this.flowstep
        });
        this.recordDiForm.open();
        this.recordDiForm.override({
            refresh: this.proxy(function(data) {
                this.init_data();
            })
        });
    },
    //导出
    _export: function() {
        var checklist_ids = [];
        this.pro_tbody.find('tr').each(function(k, v) {
            checklist_ids.push(parseInt($(v).find('input[type=checkbox]').attr('name').split(',')[0]));
        });
        window.open($.u.config.constant.smsqueryserver + "?method=exportImproveToPdf&tokenid=" + $.cookie("tokenid") + "&checkListIds=" + JSON.stringify(checklist_ids) + "&improveId=" + this._options.id);
    },
    _exportList: function() {
        var form = $("<form>"); //定义一个form表单
        form.attr('style', 'display:none'); //在form表单中添加查询参数
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver + "?method=exportSubImproveNoticeToPdf&tokenid=" + $.cookie("tokenid") + "&id=" + this._options.id /*+"&url="+window.location.href*/ );
        form.appendTo('body').submit().remove();
    },

    _save: function() {
        var contacts = this.qid("improver").val();
        var contactsTel = this.qid("improverTel").val();
        var info_remark = this.qid("info_remark").val();
        if (contacts == "") {
            $.u.alert.error("整改联系人不能为空");
            this.qid("improver").focus();
            return;
        }
        if (contactsTel == "") {
            $.u.alert.error("联系方式不能为空");
            this.qid("improverTel").focus();
            return;
        }
        var obj = {
            improver: contacts,
            improverTel: contactsTel,
            remark: info_remark
        };
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "method": "stdcomponent.update",
                "dataobject": "improve",
                "obj": JSON.stringify(obj),
                "dataobjectid": parseInt(this._options.id),
                "tokenid": $.cookie("tokenid")
            }
        }).done(this.proxy(function(response) {
            if (response.success) {
                $.u.alert.success("保存成功");
            }
        }))
    },
    _workflow: function(e) {
        var $e = $(e.currentTarget);
        var workflowId = $e.attr("data-workflow");
        if (this.flowstep === "1") {
            this.flowstep_1(workflowId);
        } else {
            this.flowstep_2(workflowId);
        }
    },
    flowstep_1: function(workflowId) {
        var contacts = this.qid("improver").val();
        var contactsTel = this.qid("improverTel").val();
        var info_remark = this.qid("info_remark").val();
        if (contacts == "") {
            $.u.alert.error("整改联系人不能为空");
            this.qid("improver").focus();
            return;
        }
        if (contactsTel == "") {
            $.u.alert.error("联系方式不能为空");
            this.qid("improverTel").focus();
            return;
        }
        var isall_complet = true;
        //      if(!this.file2.children().length){
        //          $.u.alert.error("请先上传签批件！");
        //          return;
        //      }
        this.pro_tbody.find('tr').each(function(k, v) {
            var code = $(v).find('td:last').attr("data-code");
            if (code !== "2" && code !== "4") {
                isall_complet = false;
                return false;
            }
        });
        if (!isall_complet) {
            $.u.alert.error("有条目没有操作！");
            return;
        }

        var obj = {
            improver: contacts,
            improverTel: contactsTel,
            remark: info_remark
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
                            cache: false,
                            data: {
                                "method": "stdcomponent.update",
                                "dataobject": "improve",
                                "obj": JSON.stringify(obj),
                                "dataobjectid": parseInt(this._options.id),
                                "tokenid": $.cookie("tokenid")
                            }
                        }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                $.u.ajax({
                                    url: $.u.config.constant.smsmodifyserver,
                                    type: "post",
                                    dataType: "json",
                                    data: {
                                        "method": "operate",
                                        "tokenid": $.cookie("tokenid"),
                                        "action": workflowId,
                                        "dataobject": "improve",
                                        "id": this._options.id
                                    }
                                }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                    if (response.success) {
                                        confirm.confirmDialog.dialog("close");
                                        $.u.alert.success("操作成功");
                                        this.init_data();
                                    }
                                }))
                            }
                        }))
                    })
                }
            }
        })
    },
    flowstep_2: function(workflowId) {
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
                                "method": "operate",
                                "tokenid": $.cookie("tokenid"),
                                "action": workflowId,
                                "dataobject": "improve",
                                "id": this._options.id
                            }
                        }, confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                confirm.confirmDialog.dialog("close");
                                $.u.alert.success("操作成功");
                                this.init_data();
                            }
                        }))
                    })
                }
            }
        })
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});
com.audit.xitong_jihua.zhenggaifankuidan.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
    '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'
];
com.audit.xitong_jihua.zhenggaifankuidan.widgetcss = [{
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];