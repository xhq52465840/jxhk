//@ sourceURL=com.audit.innerAudit.worklist.checklist
$.u.define('com.audit.innerAudit.worklist.checklist', null, {
    init: function(options) {
        this._SELECT2_PAGE_LENGTH = 10;
        this.btn = ["add", "save", "exportEx", "minus"];
        this._showMinusButton = false;
        this._requiredCheckList = false;
        this._allowModifyCheckList = false;
        this._showCheckListResultView = false;
        this._hiddenDataTableTr = true;
        this._flowStatus = "";
        this.downloadtemp = '<tr class="downloadtemp"><td class="name" field="plan_download">下载附件</td>' + '<td class="value" colspan="3" id="downloadplan">' + '<table qid="file_download" class="table table-condensed ">' + '<thead><tr>' + '<th style="width: 60%;">文件名</th>' + '<th>文件大小</th>' + '<th style="width: 15%;">上传人</th>' + '</tr></thead>' + '<tbody></tbody>' + '</table>' + '</td>' + '</tr>'
    },
    afterrender: function(bodystr) {
        this._clid = $.urlParam().id;
        if (!this._clid) {
            window.location.href = "../xitong_jihua/Xitong_jihua_jianchadan.html";
        }
        this._clid = parseInt(this._clid);
        this.checkForm = this.qid("checkForm");
        this.add = this.qid("add");
        this.add.off("click").on("click", this.proxy(this._addPoints));
        this.exportEx = this.qid("export");
        this.exportEx.off("click").on("click", this.proxy(this._exportList));
        this.save = this.qid("save");
        this.save.off("click").on("click", this.proxy(this._save));
        this.qid("btn-showmore").on("click", this.proxy(this.on_showmore_click));
        this.$.find(".toggle-panel").click(this.proxy(this.on_togglePanel_click));
        this._initColumn();

    },
    _createDialog: function() {
        this.addDialog = this.qid("addDialog").removeClass("hidden").dialog({
            title: "添加检查项",
            width: 840,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text": "保存",
                "click": this.proxy(this.on_addDialog_save)
            }, {
                "text": "取消",
                "class": "aui-button-link",
                "click": this.proxy(this.on_addDialog_cancel)
            }],
            close: this.proxy(this.on_addDialog_close),
            open: this.proxy(this.on_addDialog_open)
        });
        this.addPointDialog = this.qid("addPointDialog").removeClass("hidden").dialog({
            title: "增加临时审计要点",
            width: 840,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text": "保存",
                "click": this.proxy(this.on_addPointDialog_save)
            }, {
                "text": "取消",
                "class": "aui-button-link",
                "click": this.proxy(this.on_addPointDialog_cancel)
            }],
            open: this.proxy(function() {
                /* var zIndex = parseInt(this.addDialog.parent().css("z-index"));
                 $("body>.ui-dialog:last").css("z-index", zIndex + 2);
                 $("body>.ui-widget-overlay:last").css("z-index", zIndex + 1);*/
            }),
            close: this.proxy(this.on_addPointDialog_close),
            create: this.proxy(this.on_addPointDialog_create)
        });
    },
    on_togglePanel_click: function(e) {
        var $this = $(e.currentTarget);
        if ($this.hasClass("fa-minus")) {
            $this.removeClass("fa-minus").addClass("fa-plus");
        } else {
            $this.removeClass("fa-plus").addClass("fa-minus");
        }
        $this.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
    },
    on_showmore_click: function() {
        this._hiddenDataTableTr = false;
        this.qid("datatable").find("tbody > tr").removeClass("hidden");
        this.qid("btn-showmore").addClass("hidden");
    },
    on_addPointDialog_close: function() {
        this.addPointDialog.find("textarea").val('');
        this.tempId = '';
    },
    on_addDialog_close: function() {
        this.addDialog.find("textarea").val('');
        $.fn.zTree.destroy();
    },
    on_addPointDialog_create: function() {
        this.pointForm = this.qid("pointForm");
        this.pointForm.validate({
            rules: {
                "point": "required",
                "according": "required",
                "prompt": "required"
            },
            messages: {
                "point": "审计要点不能为空",
                "according": "审计依据不能为空",
                "prompt": "审计提示不能为空"
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
    },
    on_addDialog_open: function() {
        this._createTree();
    },
    _createTree: function() {
        var setting = {
            view: {
                selectdMulti: false
            },
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onClick: this.proxy(this._treeClick),
                onRightClick: this.proxy(this._treeRightClick)
            }
        };
        this._ajax(
            $.u.config.constant.smsqueryserver,
            true, {
                "method": "getItemTree",
                "rule": JSON.stringify([
                    [{
                        key: "profession",
                        "value": this.professionId
                    }],
                    [{
                        key: "target",
                        "value": this.targetId
                    }],
                    [{
                        key: "checkId",
                        "value": this._clid
                    }]
                ])
            },
            this.addDialog, {},
            this.proxy(function(response) {
                if (response.success) {
                    var checkArray = $.map(this.checkDataTable.data(), function(item, idx) {
                        return item.itemId || item.actionItemId || null;
                    });
                    var zNodes = $.map(response.data.aaData, this.proxy(function(perm, idx) {
                        return {
                            id: perm.id,
                            pId: perm.parentId,
                            name: perm.name,
                            type: perm.type,
                            checked: $.inArray(perm.id, checkArray) > -1,
                            chkDisabled: $.inArray(perm.id, checkArray) > -1
                        };
                    }));
                    this.tree = $.fn.zTree.init(this.leftDiv, setting, zNodes);
                }
            })
        );
    },
    _treeClick: function(event, treeId, treeNode) {
        if (!treeNode.pId) {
            this.addDialog.find("textarea[name=point]").val(treeNode.name);
            this.addDialog.find("textarea[name=according]").val('');
            this.addDialog.find("textarea[name=prompt]").val('');
        } else {
            this._ajax(
                $.u.config.constant.smsqueryserver,
                true, {
                    "method": "getItemByChapter",
                    "parentId": treeNode.id
                },
                this.addDialog, {},
                this.proxy(function(response) {
                    if (response.success) {
                        this.addDialog.find("textarea[name=point]").val(response.data.point);
                        this.addDialog.find("textarea[name=according]").val(response.data.according);
                        this.addDialog.find("textarea[name=prompt]").val(response.data.prompt);
                    }
                })
            );
        }
    },
    _treeRightClick: function(event, treeId, treeNode) {
        if (treeNode && treeNode.name == "临时检查项") {
            this.tempId = treeNode;
            this.addPointDialog.dialog("open");
        }
    },
    on_addDialog_save: function() {
        var nodes = this.tree.getCheckedNodes(true);
        var param = [];
        if (nodes.length) {
            $.each(nodes, this.proxy(function(k, v) {
                if (!v.isParent && v.pId) {
                    param.push({
                        "id": v.id,
                        "type": v.type
                    });
                }
            }));
        }
        if (param.length) {
            this._ajax(
                $.u.config.constant.smsmodifyserver,
                true, {
                    "method": "updateCheckList",
                    "checkId": this._clid,
                    "obj": JSON.stringify(param)
                },
                this.addDialog, {},
                this.proxy(function(response) {
                    if (response.success) {
                        this.addDialog.dialog("close");
                        this._createDatatable(response.data.aaData);
                    }
                })
            );
        } else {
            $.u.alert.error("未选中叶子节点");
        }
    },
    on_addPointDialog_save: function() { //TODO 保存启用状态下的节点
        if (this.pointForm.valid()) {
            var param = {
                "checkId": this._clid,
                "parentId": this.tempId.id,
                "profession": this.professionId,
                "point": this.addPointDialog.find("textarea[name=point]").val(),
                "according": this.addPointDialog.find("textarea[name=according]").val(),
                "prompt": this.addPointDialog.find("textarea[name=prompt]").val()
            };
            this._ajax(
                $.u.config.constant.smsmodifyserver,
                true, {
                    "method": "addTMPItem",
                    "obj": JSON.stringify(param)
                },
                this.addPointDialog, {},
                this.proxy(function(response) {
                    if (response.success) {
                        this.tree.addNodes(this.tempId, {
                            id: response.data,
                            pId: this.tempId.id,
                            name: param.point
                        });
                        this.addPointDialog.dialog("close");
                    }
                })
            );
        }
    },
    on_addDialog_cancel: function() {
        this.addDialog.dialog("close");
    },
    on_addPointDialog_cancel: function() {
        this.addPointDialog.dialog("close");
    },
    _createDatatable: function(data) {
        if (data) {
            if (!$.fn.DataTable.isDataTable(this.qid("datatable"))) {
                var columns = [{
                    "title": "序号",
                    "mData": "id",
                    "class": "break-word",
                    "sWidth": "7%"
                }, {
                    "title": "检查要点",
                    "mData": "itemPoint",
                    "class": "break-word",
                    "sWidth": ""
                }, {
                    "title": "检查结论",
                    "mData": "auditResult",
                    "sWidth": "10%"
                }, {
                    "title": "操作",
                    "mData": "id",
                    "sWidth": "50px",
                    "class": ""
                }];
                var columnsDefs = [{
                    "aTargets": 1,
                    "mRender": this.proxy(function(data, type, full) {
                        var htmls = "";
                        htmls = "<a href='#' class='rModify'>" + data + "</a>";
                        return htmls;
                    })
                }, {
                    "aTargets": 2,
                    "mRender": this.proxy(function(data, type, full) {
                        return data || "";
                    })
                }, {
                    "aTargets": 3,
                    "mRender": this.proxy(function(data, type, full) {
                        return this._showMinusButton ? "<span data-id='" + data + "' class='uui-cursor-pointer del'><span class='glyphicon glyphicon-trash'></span></span>" : "";
                    })
                }];
                if (this._showCheckListResultView) {
                    this.qid("conclusion").removeClass("hidden");
                    columns = [{
                        "title": "序号",
                        "mData": "id",
                        "class": "break-word",
                        "width": "50px"
                    }, {
                        "title": "存在问题汇总",
                        "mData": "id",
                        "class": "break-word",
                        "width": "200px"
                    }, {
                        "title": "主要责任单位",
                        "mData": "improveUnit",
                        "width": "100px"
                    }, {
                        "title": "审计结论",
                        "mData": "auditResult",
                        "class": "break-word",
                        "width": "100px"
                    }, {
                        "title": "整改期限",
                        "mData": "improveLastDate",
                        "width": "100px",
                        "class": ""
                    }];
                    columnsDefs = [{
                        "aTargets": 1,
                        "mRender": this.proxy(function(data, type, full) {
                            var htmls = [];
                            htmls.push("<div><strong>检查要点：</strong><span>");
                            htmls.push("<a href='#' class='rModify'>" + (full.itemPoint || "") + "</a></span>");
                            htmls.push("</div>");
                            htmls.push("<div><strong>审计记录：</strong><span>" + (full.auditRecord || "") + "</span></div>");
                            return htmls.join("");
                        })
                    }, {
                        "aTargets": 2,
                        "mRender": this.proxy(function(data, type, full) {
                            return full.improveUnit ? (full.improveUnit.name || "") : "";
                        })
                    }, {
                        "aTargets": 3,
                        "mRender": this.proxy(function(data, type, full) {
                            return full.auditResult || "";
                        })
                    }, {
                        "aTargets": 4,
                        "mRender": this.proxy(function(data, type, full) {
                            return full.improveLastDate || "";
                        })
                    }];
                }
                this.checkDataTable = this.qid("datatable").DataTable({
                    destroy: true,
                    searching: false,
                    serverSide: false,
                    bProcessing: true,
                    ordering: false,
                    paging: false,
                    pageLength: 10,
                    "sDom": "",
                    "columns": columns,
                    "aaData": [],
                    "oLanguage": { //语言
                        "sZeroRecords": "抱歉未找到记录",
                        "sInfoEmpty": "没有数据",
                    },
                    "aoColumnDefs": columnsDefs,
                    "preDrawCallback": this.proxy(function(setting) {
                        this.qid("datatable").find("tbody > tr.hidden").removeClass("hidden");
                    }),
                    "rowCallback": this.proxy(function(row, data, index) {
                        if (this._showCheckListResultView) {

                        } else {
                            if (data.auditRecord && data.auditRecord.length > 0) {
                                $(row).attr("style", "background-color: #dff0d8 !important");
                            }
                        }
                        if (this._hiddenDataTableTr === true) {
                            if (index > 9) {
                                $(row).addClass("hidden");
                                this.qid("btn-showmore").removeClass("hidden");
                            } else {
                                //if(this.qid("datatable").find("tbody > tr.hidden").length > 0)
                                this.qid("btn-showmore").addClass("hidden");
                            }
                        } else {
                            this.qid("btn-showmore").addClass("hidden");
                        }
                        $(row).children("td:first").text(index + 1);
                        $(row).data("data", data);
                    })
                });
                this.checkDataTable.off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
                if (this._showMinusButton) {
                    this.checkDataTable.off("click", ".del").on("click", ".del", this.proxy(this.deleteRow));
                }
            }

            this.checkDataTable.clear();
            this.checkDataTable.rows.add(data).draw();
        }
    },
    deleteRow: function(e) {
        e.preventDefault();
        var $e = $(e.currentTarget);
        var id = $e.attr("data-id");
        var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        this._ajax(
                            $.u.config.constant.smsmodifyserver,
                            true, {
                                "method": "stdcomponent.delete",
                                "dataobject": "checkList",
                                "dataobjectids": JSON.stringify([id])
                            },
                            confirm.confirmDialog.parent(), {},
                            this.proxy(function(response) {
                                if (response.success) {
                                    confirm.confirmDialog.dialog("close");
                                    this.checkDataTable.row($e.closest("tr")).remove().draw();
                                }
                            })
                        );
                    })
                }
            }
        });
    },
    modifyRow: function(e) {
        e.preventDefault();
        var $e = $(e.currentTarget);
        var data = $e.closest("tr").data("data");
        if (data) {
            if (!this.recordDiForm) {
                $.u.load('com.audit.innerAudit.worklist.dialog');
                this.recordDiForm = new com.audit.innerAudit.worklist.dialog($("div[umid='recordDiForm']", this.$), {
                    editable: this._allowModifyCheckList,
                    checkid: this._clid
                });
            }
            this.recordDiForm.override({
                refresh: this.proxy(function(formData) {
                    this.checkDataTable.row($e.closest("tr")).data($.extend(true, {}, data, {
                        itemPoint: formData.itemPoint,
                        auditRecord: formData.auditRecord,
                        improveUnit: formData.improveUnit,
                        improveUnit2: formData.improveUnit2,
                        auditResult: formData.auditResult,
                        improveLastDate: formData.improveLastDate
                    })).draw();
                })
            });
            this.recordDiForm.open(data.id, this.targetId);
        } else {
            console.error("未获取到data");
        }
    },
    _disabledAll: function() {
        this.checkName
            .add(this.checkNo)
            .add(this.startDate)
            .add(this.endDate)
            .add(this.checkType)
            .add(this.address)
            .add(this.target)
            .add(this.teamLeader)
            .add(this.managers)
            .add(this.standard)
            .add(this.method)
            .add(this.member)
            .add(this.remark)
            .add(this.record)
            .add(this.result)
            .attr("disabled", true);
    },
    _initColumn: function() {
        this.checkName = this.qid("checkName");
        this.checkNo = this.qid("checkNo");
        this.startDate = this.qid("startDate");
        this.endDate = this.qid("endDate");
        this.checkType = this.qid("checkType");
        this.address = this.qid("address");
        this.target = this.qid("target");
        this.teamLeader = this.qid("teamLeader");
        this.managers = this.qid("managers");
        this.standard = this.qid("standard");
        this.method = this.qid("method");
        this.member = this.qid("member");
        this.remark = this.qid("remark");
        this.record = this.qid("record");
        this.result = this.qid("result");
        this._disabledAll();
        this.leftDiv = this.qid("left-div");
        this.getCheckData();
    },
    getCheckData: function() {
        this._ajax(
            $.u.config.constant.smsqueryserver,
            true, {
                "method": "stdcomponent.getbyid",
                "dataobject": "check",
                "dataobjectid": this._clid
            },
            this.$, {},
            this.proxy(function(response) {
                if (response.success) {
                    if (response.data) {
                        this.fillData(response.data);
                        this.professionId = response.data.checkType;
                        this.targetId = response.data.target.targetId;
                        this._createDialog();
                    } else {
                        $.u.alert.error("没有数据");
                        this.qid("content").empty();
                    }
                }
            })
        );
    },
    fillData: function(data) {
        data.checkName && this.checkName.val(data.checkName);
        data.checkNo && this.checkNo.val(data.checkNo);
        data.startDate && this.startDate.val(data.startDate);
        data.endDate && this.endDate.val(data.endDate);
        data.checkTypeDisplayName && this.checkType.val(data.checkTypeDisplayName);
        data.address && this.address.val(data.address);
        data.target && data.target.targetName && this.target.val(data.target.targetName);
        data.record && this.record.val(data.record);
        data.result && this.result.val(data.result);
        data.teamLeader && this.teamLeader.val(data.teamLeader);
        data.managers && this.managers.val(data.managers[0].name + "(" + data.managers[0].username + ")");
        data.standard && this.standard.val(data.standard);
        data.method && this.method.val(data.method);
        this.qid("conclusion").text(data.conclusion || "");
        if (data.member && data.member.length) {
            var mbr = "";
            var length = data.member.length - 1;
            $.each(data.member, this.proxy(function(k, v) {
                mbr += v.name + "(" + v.username + ")" + ((k == length) ? "" : "、");
            }));
            this.member.val(mbr);
        }
        data.remark && this.remark.val(data.remark);

        if (data.taskPreAuditReport) {
            var tbody = this.checkForm.find("tbody:first");
            tbody.append(this.downloadtemp);
            var $downloadtbody = tbody.find("tbody:first");
            $.each(data.taskPreAuditReport, this.proxy(function(idx, file) {
                var num = idx + 1;
                $("<tr>" +
                    "<td>" + num + ".<a href='#' style='margin-left: 20px;' class='download' fileid='" + file.id + "'>" + file.fileName + "</a></td>" +
                    "<td>" + file.size + "</td>" +
                    "<td>" + file.uploadUser + "</td>" +
                    "</tr>").data("data", file).appendTo($downloadtbody);
            }))
            $downloadtbody.off("click", ".download").on("click", ".download", this.proxy(this.on_downloadFile_click));
        }

        if (data.logArea && data.logArea.key) {
            var clz = $.u.load(data.logArea.key);
            var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("logsContainer"));
            new clz(target, $.extend(true, data.logArea, {
                businessUrl: this.getabsurl("viewchecklist.html?id=#{source}"),
                logRule: [
                    [{
                        "key": "source",
                        "value": this._clid
                    }],
                    [{
                        "key": "sourceType",
                        "value": "check"
                    }]
                ],
                remarkRule: [
                    [{
                        "key": "source",
                        "value": this._clid
                    }],
                    [{
                        "key": "sourceType",
                        "value": "check"
                    }]
                ],
                remarkObj: {
                    source: this._clid,
                    sourceType: "check"
                },
                addable: true,
                flowid: data.flowId
            }));
        }

        if ($.isArray(data.actions) && data.actions.length > 0) {
            $.each(data.actions, this.proxy(function(k, v) {
                this.exportEx.after('<button type="submit" class="btn btn-default btn-sm workflow" data-id="' + v.wipId + '"' + ' name=' + '"' + v.name + '">' + v.name + '</button>');
            }));
            $('button.workflow').off("click").on("click", this.proxy(this._workflow));
            if (data.checkList && data.checkList.length === 0) {
                $('button.workflow').remove();
            }
            if (data.workflowNodeAttributes) {
                var canDo = data.workflowNodeAttributes.canDo || "";
                var canModify = (data.workflowNodeAttributes.canModify && data.workflowNodeAttributes.canModify.split(",")) || [];
                var hiddenModel = (data.workflowNodeAttributes.hiddenModel && data.workflowNodeAttributes.hiddenModel.split(",")) || [];
                $.each(this.btn, this.proxy(function(k, v) {
                    if (canDo.indexOf(v) > -1) {
                        if (v === "minus") {
                            this._showMinusButton = true;
                        } else if (this[v]) {
                            this[v].removeClass("hidden");
                        } else {
                            console.error("canDo [" + v + "] is undefined");
                        }
                    } else {
                        this[v] && this[v].remove();
                    }
                }));
                $.each(canModify, this.proxy(function(k, v) {
                    if (v === "pointList") {
                        this._allowModifyCheckList = true;
                    } else if (this[v]) {
                        this[v].removeAttr("disabled");
                    } else {
                        console.error("canModify [" + v + "] is undefined");
                    }
                }));

                $.each(hiddenModel, this.proxy(function(k, v) {
                    if (v === "baseInfo") {
                        this.qid("toggle-baseinfo-panel").trigger("click");
                    } else if (v === "logs") {
                        this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                    } else if (v === "pointList") {
                        this.qid("toggle-checkitem-panel").trigger("click");
                    }
                }));

                if (data.workflowNodeAttributes.required) {
                    var rules = {},
                        messages = {};
                    $.each(data.workflowNodeAttributes.required.split(","), this.proxy(function(k, v) {
                        if (v === "checkList") {
                            this._requiredCheckList = true;
                        } else if (this[v]) {
                            var $label = $("[data-field=" + v + "]");
                            rules[v] = {
                                required: true
                            };
                            messages[v] = {
                                required: "该项不能为空"
                            };
                            if (v === "startDate" || v === "endDate") {
                                rules[v] = {
                                    required: true,
                                    date: true,
                                    dateISO: true
                                };
                                messages[v] = {
                                    required: "该项不能为空",
                                    date: "无效日期",
                                    dateISO: "无效日期"
                                }
                                $label = $("[data-field=startEndDate]");
                            }
                            if ($label.children("span.text-danger").length < 1) {
                                $("<span class='text-danger'>*</span>").appendTo($label);
                            }
                        }
                    }));
                    this.checkForm.validate({
                        rules: rules,
                        messages: messages,
                        errorClass: "text-danger text-validate-element",
                        errorElement: "div"
                    });
                }
                this._flowStatus = data.workflowNodeAttributes.flowStatus;
            }
        } else {
            $.each(this.btn, this.proxy(function(k, v) {
                this[v] && this[v].remove();
            }));
        }

        if (data.workflowNodeAttributes) {
            if (data.workflowNodeAttributes.flowStatus === "result" || data.workflowNodeAttributes.flowStatus === "wanCheng") {
                this._showCheckListResultView = true;
                this.qid("resultContainer").removeClass("hidden");
            } else if (data.workflowNodeAttributes.flowStatus === "auditResult") {
                this.qid("recordContainer").removeClass("hidden");
            }
        }

        if ($.isArray(data.checkLists)) {
            this._createDatatable(data.checkLists);
        }


    },
    _validCheckList: function() {
        var valid = false;
        if (this._requiredCheckList === true) {
            if (this.checkDataTable && this.checkDataTable.data && this.checkDataTable.data().length > 0) {
                valid = true;
            } else {
                valid = false;
                $.u.alert.error("请添加检查单");
            }
        } else {
            valid = true;
        }
        return valid;
    },
    _getFormData: function() {
        var data = {};
        if (this.remark.is(":visible")) {
            data.remark = this.remark.val();
        }
        if (this.record.is(":visible")) {
            data.record = this.record.val();
        }
        if (this.result.is(":visible")) {
            data.result = this.result.val();
        }
        return data;
    },
    _addPoints: function() {
        this.addDialog.dialog("open");
    },
    _exportList: function() {
        //TODO 导出检查单
        var form = $("<form>"); //定义一个form表单
        form.attr('style', 'display:none'); //在form表单中添加查询参数
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver + "?method=exportCheckToWord&tokenid=" + $.cookie("tokenid") + "&checkId=" + this._clid + "&url=" + window.location.href);
        form.appendTo('body').submit().remove();
    },

    /*
     *  下载附件
     *
     */
    on_downloadFile_click: function(e) {
        var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([data]) + "&url=" + window.location.href);
    },
    //工作流
    _workflow: function(e) {
        e.preventDefault();
        var $e = $(e.currentTarget);
        var id = $e.attr("data-id");
        var lineName = e.target.name || '';
        if (lineName == "退回") {
            this.verify($e, id);
        } else {
            if (this.checkForm.valid() && this._validCheckList()) {
                this.verify($e, id);
            }
        }

    },

    verify: function($e, id) {
        var clz = $.u.load("com.audit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        this._ajax(
                            $.u.config.constant.smsmodifyserver,
                            true, {
                                method: "stdcomponent.update",
                                dataobject: "check",
                                dataobjectid: this._clid,
                                obj: JSON.stringify(this._getFormData())
                            },
                            confirm.confirmDialog.parent(), {},
                            this.proxy(function(response) {
                                if (response.success) {
                                    this._ajax(
                                        $.u.config.constant.smsmodifyserver,
                                        true, {
                                            "method": "operate",
                                            "tokenid": $.cookie("tokenid"),
                                            "action": id,
                                            "dataobject": "check",
                                            "id": this._clid
                                        },
                                        confirm.confirmDialog.parent(), {},
                                        this.proxy(function(response) {
                                            if (response.success) {
                                                confirm.confirmDialog.dialog("close");
                                                $.u.alert.success("操作成功");
                                                window.location.reload();
                                                // if(this._flowStatus === "result"){
                                                //     var confirm2 = new clz({
                                                //         "body": "<p class='lead' style='text-indent: 2em;'>恭喜您已经完成本专业检查单的填写！谢谢您为本次审计工作所做的努力！</p>",
                                                //         "buttons": {
                                                //             "ok": {
                                                //                 "click": this.proxy(function(e){
                                                //                     window.location.reload();
                                                //                 })
                                                //             }
                                                //         }
                                                //     });  
                                                //     $("button.aui-button-link").addClass("hidden");
                                                // }else{
                                                //     window.location.reload();
                                                // }
                                            }
                                        })
                                    );
                                }
                            })
                        );
                    })
                }
            }
        });
    },
    _save: function() {
        if (this.checkForm.valid()) {
            var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
            var confirm = new clz({
                "body": "确认操作？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function() {
                            this._ajax(
                                $.u.config.constant.smsmodifyserver,
                                true, {
                                    method: "stdcomponent.update",
                                    dataobject: "check",
                                    dataobjectid: this._clid,
                                    obj: JSON.stringify(this._getFormData())
                                },
                                confirm.confirmDialog.parent(), {},
                                this.proxy(function(response) {
                                    if (response.success) {
                                        confirm.confirmDialog.dialog("close");
                                        $.u.alert.success("保存成功");
                                        window.location.reload();
                                    }
                                })
                            );
                        })
                    }
                }
            });
        }
    },


    _ajax: function(url, async, param, $container, blockParam, callback) {
        $.u.ajax({
            url: url,
            datatype: "json",
            type: 'post',
            "async": async,
            data: $.extend({
                tokenid: $.cookie("tokenid")
            }, param)
        }, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
            callback(response);
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    }
}, {
    usehtm: true,
    usei18n: false
});

com.audit.innerAudit.worklist.checklist.widgetjs = ["../../../../uui/widget/select2/js/select2.min.js",
    "../../../../uui/widget/spin/spin.js",
    "../../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../../uui/widget/ajax/layoutajax.js",
    "../../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
    "../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
    "../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"
];
com.audit.innerAudit.worklist.checklist.widgetcss = [{
    path: "../../../../uui/widget/select2/css/select2.css"
}, {
    path: "../../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
    path: "../../../../uui/widget/jqdatatable/css/jquery.dataTables.css"
}, {
    path: "../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css"
}, {
    path: "../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"
}];