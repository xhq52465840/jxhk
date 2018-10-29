//@ sourceURL=com.sms.detailmodule.riskAnalysis
$.u.define('com.sms.detailmodule.riskAnalysis', null, {
    init: function(option) {
        this._options = option || {};
        this._i18n = com.sms.detailmodule.riskAnalysis.i18n;
        this._MODE = {
            ADD: "add",
            EDIT: "edit",
            VIEW: "view"
        };
        this._SELECT2_PAGE_LENGTH = 3;
        this._RISK_ANALYSIS_TABLE = "" +
            "<div class='riskAnalysisTable' style='border-bottom: 1px solid #974676;'>" +
            "<table class='uui-table' >" +
            "<thead>" +
            "<tr class='infomodel-title'>" +
            "<th>#{sysTypeName}<span class='pull-right'>" + this._i18n.columns.creator + "#{creator}&nbsp;&nbsp;" + this._i18n.columns.lastUpdate + "#{lastUpdate}&nbsp;</span></th>" +
            "<th class='operate-tool'><button class='btn btn-default btn-sm submitRiskAnalysis mod-edit mod-add' data-riskAnalysisId='#{riskAnalysisId}'>" + this._i18n.buttons.submitRiskAnalysis + "</button></th>" +
            "<th class='operate-tool'><i title='" + this._i18n.buttons.removeRiskAnalysis + "' class='fa fa-lg fa-trash-o removeRiskAnalysis mod-edit mod-add' data-riskAnalysisId='#{riskAnalysisId}'></i></th>" +
            "</tr>" +
            "</thead>" +
            "</table>" +
            "<table class='uui-table table-fixed' >" +
            "<thead>" +
            "<tr>" +
            "<th style='width: 50px;' class='mod-add mod-edit'>" + this._i18n.buttons.removeMapping + "</th>" +
            "<th style='width:25%;'>" + this._i18n.columns.hazardIdentification + this._i18n.columns.threat + "</th>" +
            "<th style='width: 15%;'>" + this._i18n.columns.riskAnalysis + "</th>" +
            "<th style='width:10%;'>" + this._i18n.columns.riskLevel + "</th>" +
            "<th style='width:30%;'>" + this._i18n.columns.manualTerms + "</th>" +
            "<th style='width: 130px;' class='text-right'>" + this._i18n.columns.status + "</th>" +
            "<th style='width:100px;'></th>" +
            "<th class='operate-tool'><i title='" + this._i18n.buttons.addThreat + "' class='fa fa-plus fa-lg addRiskThreatErrorMapping mod-edit mod-add' data-type='threat' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></th>" +
            "</tr>" +
            "</thead>" +
            "<tbody class='threat-tbody'></tbody>" +
            "</table>" +
            "<table class='uui-table table-fixed' >" +
            "<thead>" +
            "<tr>" +
            "<th style='width: 50px;' class='mod-add mod-edit'>" + this._i18n.buttons.removeMapping + "</th>" +
            "<th style='width:25%;'>" + this._i18n.columns.hazardIdentification + this._i18n.columns.error + "</th>" +
            "<th style='width: 15%;'>" + this._i18n.columns.riskAnalysis + "</th>" +
            "<th style='width:10%;'>" + this._i18n.columns.riskLevel + "</th>" +
            "<th style='width:30%;'>" + this._i18n.columns.manualTerms + "</th>" +
            "<th style='width: 130px;' class='text-right'>" + this._i18n.columns.status + "</th>" +
            "<th style='width: 100px;'></th>" +
            "<th class='operate-tool'><i title='" + this._i18n.buttons.addError + "' class='fa fa-plus fa-lg addRiskThreatErrorMapping mod-edit mod-add' data-type='error' data-riskAnalysisId='#{riskAnalysisId}' data-sysTypeId='#{sysTypeId}'></i></th>" +
            "</tr>" +
            "</thead>" +
            "<tbody class='error-tbody'></tbody>" +
            "</table>" +
            "</div>";
        this._TR = "" +
            "<tr data-threat-error-id='#{threatErrorId}' data-editable='#{editable}'>" +
            "<td style='padding-left: 0px;' class='mod-add mod-edit'><button  class='btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "删除" + "</button></td>" +
            "<td>#{name}</td>" +
            "<td><span style='word-wrap: break-word;'>#{text}</span> <i title='" + this._i18n.buttons.editMappingText + "' class='fa fa-pencil editText uui-cursor-pointer mod-edit mod-add' data-mappingId='#{id}' data-text='#{text}' data-type='#{type}'></i></td>" +
            "<td><label class='label #{mark} hidden score'>#{score}</label></td>" +
            "<td colspan='2'>" +
            "<ol class='list-unstyled clauses'  style='margin:0;'></ol>" +
            "</td>" +
            "<td colspan='2' class='text-center'>" +
            "<button  class='btn btn-link addClause mod-edit mod-add' data-type='#{threatOrError}' data-threat-error-id='#{threatErrorId}' data-mappingId='#{id}' style='padding-left:0;'>" + this._i18n.buttons.addControl + "</button>" + //this._i18n.buttons.addClause
            // "<button  class='btn btn-link removeRiskThreatErrorMapping mod-edit mod-add' data-type='#{type}' data-id='#{id}'>" + "删除" + "</button>" +  //this._i18n.buttons.removeThreatError
            "</td>" +
            "</tr>";
        this._MANUAL_TERMS = "<li style='padding-right: 12em; position: relative;'>" +
            "<button style='padding-left: 0;width:75%;'  class='btn btn-link btn-sm actionItem' data-id='#{id}' data-title='#{number}&nbsp;#{title}'>" +
            "<div style='overflow: hidden;text-overflow: ellipsis;' class='text-left' title='#{title}'><nobr>#{number}&nbsp;#{title}</nobr></div>" +
            "</button>" + "&nbsp" +
            "<i class='fa fa-trash-o uui-cursor-pointer removeClause mod-edit mod-add' style='padding-left:.3em;'  data-id='#{id}' title='" + this._i18n.buttons.removeControl + "'></i>" +
            // "<input type='checkbox' class='pull-right generate' style='margin-top: 8px;position: absolute; top: 1px; right: 1em;' data-id='#{id}' data-type='#{type}' #{checked}  />" +
            // "<i class='fa fa-trash-o uui-cursor-pointer removeClause mod-edit mod-add' style='position: absolute; top: 8px; right: 3em;' data-id='#{id}' title='" + this._i18n.buttons.removeControl + "'></i>" +
            "<div style='position: absolute; top: 4px; right: 10px;'>" +
            "<span class='clause-status'>#{status}</span>" +
            // "<input type='checkbox' class='generate' style='margin-left:.3em;' data-id='#{id}' #{checked}  />" +
            "</div>" +
            "</li>";
    },
    afterrender: function(bodystr) {
        this.tableContainer = this.qid("tablecontainer");
        this.riskThreatErrorMappingDialog = null;
        this.selectControlDialog = null;
        this.actionItemDialog = null;
        this.mappingTextDialog = null;

        if (this._options.editable !== true) {
            this.qid("btn_add").remove();
        }
    },

    on_release_click: function() {
        var clz = $.u.load("com.sms.common.confirm");
        var confirm = new clz({
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        $.u.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            dataType: "json",
                            data: {
                                "tokenid": $.cookie("tokenid"),
                                "method": "distributeActionItems",
                                "riskAnalysisId": this._options.riskId
                            }
                        }, confirm.confirmDialog.parent(), {
                            size: 2,
                            backgroundColor: "#fff"
                        }).done(this.proxy(function(resp) {
                            if (resp.success) {
                                confirm.confirmDialog.dialog("close");
                                $.u.alert.success("发布成功！", 3000);
                            }
                        }));
                    })
                }
            }
        });

    },

    on_add_click: function() {
        if (this.addRiskAnalysisDialog == null) {
            this.addRiskAnalysisDialog = this.qid("addDialog").removeClass("hidden").dialog({
                title: this._i18n.addRiskAnalysisDialog.title,
                width: 520,
                modal: true,
                resizable: false,
                autoOpen: false,
                create: this.proxy(this.on_addRiskAnalysisDialog_create),
                close: this.proxy(function() {
                    this.qid("system").select2("val", null);
                }),
                buttons: [{
                    "text": this._i18n.addRiskAnalysisDialog.buttons.ok,
                    "click": this.proxy(this.on_addRiskAnalysisDialog_save)
                }, {
                    "text": this._i18n.addRiskAnalysisDialog.buttons.cancel,
                    "class": "aui-button-link",
                    "click": this.proxy(function() {
                        this.addRiskAnalysisDialog.dialog("close");
                    })
                }]
            });
        }
        this.addRiskAnalysisDialog.dialog("open");
    },
    on_submitRiskAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            riskAnalysisId = parseInt($this.attr("data-riskAnalysisId"));
        var clz = $.u.load("com.sms.common.confirm");
        var confirm = new clz({
            "body": this._i18n.messages.confirmSubmitRiskAnalysis,
            "buttons": {
                "ok": {
                    "click": this.proxy(function() {
                        this._ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            data: {
                                "method": "stdcomponent.update",
                                "dataobject": "riskAnalysis",
                                "dataobjectid": riskAnalysisId,
                                "obj": JSON.stringify({
                                    "status": this._i18n.status.submitted
                                })
                            },
                            block: $this.closest(".riskAnalysisTable"),
                            callback: this.proxy(function(response) {
                                if (response.success) {
                                    confirm.confirmDialog.dialog("close");
                                    $this.closest("th").remove();
                                }
                            })
                        });
                    })
                }
            }
        });
    },
    on_addRiskThreatErrorMapping_click: function(e) {
        var $this = $(e.currentTarget),
            type = $this.attr("data-type"),
            checkedArray = [],
            riskAnalysisId = parseInt($this.attr("data-riskAnalysisId")),
            sysTypeId = parseInt($this.attr("data-sysTypeId"));

        checkedArray = $.map($this.closest("table").find("tbody > tr"), function(tr, e) {
            return parseInt($(tr).attr("data-threat-error-id"));
        });

        this.riskThreatErrorMappingDialog && this.riskThreatErrorMappingDialog.destroy();
        var clz = $.u.load("com.sms.detailmodule.riskThreatErrorMappingDialog");
        this.riskThreatErrorMappingDialog = new clz(this.$.find("div[umid=riskThreatErrorMappingDialog]"), {
            "type": type,
            "sysTypeId": sysTypeId,
            "checkedArray": checkedArray
        });
        this.riskThreatErrorMappingDialog.override({
            save: this.proxy(function(comp, formdata) {
                if (type == "threat") {
                    this._addRiskThreatMapping({
                        "objs": $.map(formdata.threats, function(item, idx) {
                            return {
                                "threat": item.id,
                                "analysis": riskAnalysisId
                            };
                        }),
                        "container": $this.closest("table").find(".threat-tbody")
                    });
                } else if (type == "error") {
                    this._addRiskErrorMapping({
                        "objs": $.map(formdata.errors, function(item, idx) {
                            return {
                                "error": item.id,
                                "analysis": riskAnalysisId
                            };
                        }),
                        "container": $this.closest("table").find(".error-tbody")
                    });
                }
            })
        });
        this.riskThreatErrorMappingDialog.open();
    },
    on_addClause_click: function(e) {
        var $this = $(e.currentTarget),
            type = $this.attr("data-type"),
            threatOrErrorId = parseInt($this.attr("data-threat-error-id")),
            mappingId = parseInt($this.attr("data-mappingId")),
            obj = {};
        if (!this.selectControlDialog) {
            var clz = $.u.load("com.sms.detailmodule.selectControl");
            this.selectControlDialog = new clz(this.$.find("div[umid=selectControlDialog]"));
        }
        this.selectControlDialog.override({
            save: this.proxy(function(newIds) {
                this._addClause({
                    "objs": $.map(newIds, function(newId, idx) {
                        obj = {};
                        obj[type] = mappingId;
                        obj.control = newId;
                        return obj;
                    }),
                    "container": $this.closest("tr").find("ol.clauses")
                });
            })
        });
        this.selectControlDialog.open({
            "type": type,
            "threatOrErrorId": threatOrErrorId
        });
    },
    on_removeRiskAnalysis_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-riskAnalysisId"));
        $.u.load("com.sms.common.stdcomponentdelete");
        if (!$this.closest(".riskAnalysisTable").find("tbody.threat-tbody").is(":empty") || !$this.closest(".riskAnalysisTable").find("tbody.error-tbody").is(":empty")) {
            $.u.alert.error(this._i18n.messages.notAllowDeleteRiskAnalysis, 1000 * 3);
            return;
        }
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除？" +
                "</div>" +
                "</div>",
            title: "确认删除",
            dataobject: "riskAnalysis",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $this.closest(".riskAnalysisTable").fadeOut(function() {
                    $(this).remove();
                });
            })
        });
    },
    on_actionItem_click: function(e) {
        var $this = $(e.currentTarget),
            clauseId = parseInt($this.attr("data-id")),
            title = $this.attr("data-title"),
            editable = $this.closest("tr").attr("data-editable");
        this.actionItemDialog && this.actionItemDialog.destroy();
        var clz = $.u.load("com.sms.detailmodule.actionItemDialog");
        this.actionItemDialog = new clz(this.$.find("div[umid=actionItemDialog]"), {
            "mode": "TEM",
            "editable": eval(editable) && this._options.editable,
            "cate": "CLAUSE"
        });
        this.actionItemDialog.override({
            refreshControlMeasure: this.proxy(function() {
                this._ajax({
                    data: {
                        "method": "stdcomponent.getbyid",
                        "dataobject": "clause",
                        "dataobjectid": clauseId
                    },
                    block: $this.closest("td"),
                    callback: this.proxy(function(response) {
                        if (response.success && response.data) {
                            $this.closest("li").find(".clause-status").text(response.data.status || "")
                        }
                    })
                });
            })
        });
        this.actionItemDialog.open(clauseId, title);
    },
    on_removeClause_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($(e.currentTarget).attr("data-id"));
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除?" +
                "</div>" +
                "</div>",
            title: "确认删除",
            dataobject: "clause",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $this.closest("li").remove();
            })
        });
    },
    on_editMappingText_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-mappingId")),
            text = $this.attr("data-text"),
            type = $this.attr("data-type");
        this.mappingTextDialog && this.mappingTextDialog.destroy();
        var clz = $.u.load("com.sms.common.stdComponentOperate");
        this.mappingTextDialog = new clz(this.$.find("div[umid=mappingTextDialog]"), {
            dataobject: type,
            fields: [{
                "name": "text",
                "label": this._i18n.columns.riskAnalysis,
                "type": "text",
                "maxlength": 2000
            }],
            afterEdit: this.proxy(function(comp, formdata) {
                var $score = $this.closest("tr").find(".score");
                if (formdata.text) {
                    $score.removeClass("hidden");
                } else {
                    $score.addClass("hidden");
                }
                $this.prev().text(formdata.text);
                $this.attr("data-text", formdata.text);
                this.mappingTextDialog.formDialog.dialog("close");
            })
        });
        this.mappingTextDialog.open({
            "title": this._i18n.columns.riskAnalysis,
            "data": {
                "id": id,
                "text": text
            }
        });
    },
    on_editMappingGenerate_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-id"));
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.update",
                "dataobject": "clause",
                "dataobjectid": id,
                "obj": JSON.stringify({
                    "generate": $this.is(":checked")
                })
            },
            block: $this.closest("li"),
            callback: function(response) {}
        });
    },
    on_removeRiskThreatErrorMapping_click: function(e) {
        var $this = $(e.currentTarget),
            id = parseInt($(e.currentTarget).attr("data-id")),
            type = $this.attr("data-type");
        if ($this.closest("tr").find("ol.clauses > li").length > 0) {
            $.u.alert.error(this._i18n.messages.notAllowDeleteMapping, 1000 * 3);
            return;
        }
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>确认删除?" +
                "</div>" +
                "</div>",
            title: "确认删除",
            dataobject: type,
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $this.closest("tr").remove();
            })
        });
    },
    on_addRiskAnalysisDialog_create: function() {
        this.qid("system").select2({
            width: 300,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
                        "rule": JSON.stringify([
                            [{
                                "key": "name",
                                "op": "like",
                                "value": term
                            }],
                            [{
                                "key": "type",
                                "value": "系统分类"
                            }]
                        ]),
                        "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH
                    };
                }),
                results: this.proxy(function(response, page) {
                    if (response.success) {
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item) {
                return item.name;
            },
            formatResult: function(item) {
                return item.name;
            }
        });
    },
    on_addRiskAnalysisDialog_save: function() {
        var system = this.qid("system").select2("data");
        if (!system) {
            this.qid("system").select2("focus");
        } else {
            this._ajax({
                url: $.u.config.constant.smsmodifyserver,
                data: {
                    "method": "stdcomponent.add",
                    "dataobject": "riskAnalysis",
                    "obj": JSON.stringify({
                        "risk": this._options.riskId,
                        "system": system.id
                    })
                },
                block: this.addRiskAnalysisDialog.parent(),
                callback: this.proxy(function(response) {
                    if (response.success) {
                        var user = JSON.parse($.cookie("uskyuser"));
                        this._drawRiskAnalysis({
                            "id": response.data,
                            "system": system,
                            "threats": [],
                            "errors": [],
                            "fullname": user.fullname,
                            "username": user.username,
                            "lastUpdate": (new Date()).format("yyyy-MM-dd HH:mm:ss"),
                            "editable": true,
                            "status": this._i18n.status.draft
                        });
                        this.addRiskAnalysisDialog.dialog("close");
                    }
                })
            });
        }
    },
    options: function(opt) {
        if (opt) {
            $.extend(true, this._options, opt);
        }
    },
    // exec after fillForm
    entryMode: function() {
        if (this._options.mode === this._MODE.VIEW) {
            this.$.find("input:checkbox.generate").attr("disabled", true);
        } else {
            this.qid("btn_add").unbind("click").click(this.proxy(this.on_add_click));
            this.qid("btn_release").unbind("click").click(this.proxy(this.on_release_click));
            this.tableContainer.off("click", "i.addRiskThreatErrorMapping").on("click", "i.addRiskThreatErrorMapping", this.proxy(this.on_addRiskThreatErrorMapping_click));
            this.tableContainer.off("click", "i.removeRiskAnalysis").on("click", "i.removeRiskAnalysis", this.proxy(this.on_removeRiskAnalysis_click));
            this.tableContainer.off("click", "button.addClause").on("click", "button.addClause", this.proxy(this.on_addClause_click));
            this.tableContainer.off("click", "i.removeClause").on("click", "i.removeClause", this.proxy(this.on_removeClause_click));
            this.tableContainer.off("click", "button.removeRiskThreatErrorMapping").on("click", "button.removeRiskThreatErrorMapping", this.proxy(this.on_removeRiskThreatErrorMapping_click));
            this.tableContainer.off("click", "i.editText").on("click", "i.editText", this.proxy(this.on_editMappingText_click));
            this.tableContainer.off("click", "input:checkbox.generate").on("click", "input:checkbox.generate", this.proxy(this.on_editMappingGenerate_click));
            this.tableContainer.off("click", ".submitRiskAnalysis").on("click", ".submitRiskAnalysis", this.proxy(this.on_submitRiskAnalysis_click));
        }
        this.tableContainer.off("click", "button.actionItem").on("click", "button.actionItem", this.proxy(this.on_actionItem_click));
    },
    fillForm: function(data) {
        if (data.riskAnalyses) {
            $.each(data.riskAnalyses, this.proxy(function(idx, item) {
                this._drawRiskAnalysis(item);
            }));
        }
    },
    _drawRiskAnalysis: function(data) {
        var $riskAnalysisTable = null,
            $threatTbody = null,
            $errorTbody = null;
        $riskAnalysisTable = $(this._RISK_ANALYSIS_TABLE.replace(/#\{sysTypeId\}/g, data.system.id)
                .replace(/#\{creator\}/g, (data.fullname || "") + "（" + (data.username || "") + ")")
                .replace(/#\{lastUpdate\}/g, data.lastUpdate)
                .replace(/#\{sysTypeName\}/g, data.system.name)
                .replace(/#\{sysTypeName\}/g, data.system.name)
                .replace(/#\{riskAnalysisId\}/g, data.id))
            .appendTo(this.tableContainer);
        $threatTbody = $riskAnalysisTable.find(".threat-tbody");
        $errorTbody = $riskAnalysisTable.find(".error-tbody");
        if (data.status !== this._i18n.status.draft) {
            $riskAnalysisTable.find(".submitRiskAnalysis").closest("th").remove();
        }
        $.each(data.threats, this.proxy(function(idx, item) {
            item.editable = data.editable;
            this._drawRiskThreatMapping(item, $threatTbody);
        }));
        $.each(data.errors, this.proxy(function(idx, item) {
            item.editable = data.editable;
            this._drawRiskErrorMapping(item, $errorTbody);
        }));
        if (data.editable !== true || this._options.editable !== true) {
            var $objs = $riskAnalysisTable.find(".mod-add,.mod-edit");
            $.each($objs, function(idx, obj) {
                if ($(obj).parent().is("th.operate-tool") || $(obj).parent().is("td.operate-tool")) {
                    $(obj).parent().removeClass("operate-tool");
                }
            });
            $riskAnalysisTable.find("input:checkbox.generate").attr("disabled", true);
            $objs.remove();
        }
    },
    _drawRiskThreatMapping: function(data, container) {
        var $tr = $(this._TR.replace(/#\{id\}/g, data.id)
            .replace(/#\{threatErrorId\}/g, data.threat.id)
            .replace(/#\{name\}/g, data.threat.name)
            .replace(/#\{text\}/g, data.text || "")
            .replace(/#\{score\}/g, data.score)
            .replace(/#\{type\}/g, "riskThreatMapping")
            .replace(/#\{threatOrError\}/g, "threat")
            .replace(/#\{editable\}/g, data.editable)
            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
        if (data.clauses) {
            $.each(data.clauses, this.proxy(function(idx, item) {
                this._drawClause(item, $tr.find("ol.clauses"));
            }));
        }
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    _drawRiskErrorMapping: function(data, container) {
        var $tr = $(this._TR.replace(/#\{id\}/g, data.id)
            .replace(/#\{threatErrorId\}/g, data.error.id)
            .replace(/#\{name\}/g, data.error.name)
            .replace(/#\{text\}/g, data.text || "")
            .replace(/#\{score\}/g, data.score)
            .replace(/#\{type\}/g, "riskErrorMapping")
            .replace(/#\{threatOrError\}/g, "error")
            .replace(/#\{editable\}/g, data.editable)
            .replace(/#\{mark\}/g, this._getLabelTheme(data.mark))).appendTo(container);
        if (data.clauses) {
            $.each(data.clauses, this.proxy(function(idx, item) {
                this._drawClause(item, $tr.find("ol.clauses"));
            }));
        }
        if (data.text) {
            $tr.find(".score").removeClass("hidden");
        }
    },
    _drawClause: function(data, container) {
        $(this._MANUAL_TERMS.replace(/#\{id\}/g, data.id)
                .replace(/#\{number\}/g, data.controlNumber || "")
                .replace(/#\{title\}/g, data.title || "")
                .replace(/#\{status\}/g, data.status || "")
                .replace(/#\{checked\}/g, data.generate ? "checked" : ""))
            .appendTo(container);
    },
    _getLabelTheme: function(color) {
        var result = "label-default";
        switch (color) {
            case "green":
                result = "label-success";
                break;
            case "yellow":
                result = "label-warning";
                break;
            case "red":
                result = "label-danger";
                break;
        }
        return result;
    },
    _addClause: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "clause",
                "objs": JSON.stringify(params.objs)
            },
            block: this.selectControlDialog.controlDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                    this.selectControlDialog.controlDialog.dialog("close");
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "clause",
                            "dataobjectid": JSON.stringify(response.data)
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    this._drawClause(item, params.container);
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    _addRiskThreatMapping: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "riskThreatMapping",
                "objs": JSON.stringify(params.objs)
            },
            block: this.riskThreatErrorMappingDialog.formDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                    this.riskThreatErrorMappingDialog.formDialog.dialog("close");
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "riskThreatMapping",
                            "dataobjectid": JSON.stringify(response.data)
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    this._drawRiskThreatMapping(item, params.container);
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    _addRiskErrorMapping: function(params) {
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "riskErrorMapping",
                "objs": JSON.stringify(params.objs)
            },
            block: this.riskThreatErrorMappingDialog.formDialog.parent(),
            callback: this.proxy(function(response) {
                if (response.success) {
                    this.riskThreatErrorMappingDialog.formDialog.dialog("close");
                    this._ajax({
                        data: {
                            "method": "stdcomponent.getbyids",
                            "dataobject": "riskErrorMapping",
                            "dataobjectid": JSON.stringify(response.data)
                        },
                        block: params.container,
                        callback: this.proxy(function(response) {
                            if (response.success) {
                                $.each(response.data, this.proxy(function(idx, item) {
                                    item.editable = true;
                                    this._drawRiskErrorMapping(item, params.container);
                                }));
                            }
                        })
                    });
                }
            })
        });
    },
    _ajax: function(param) {
        $.u.ajax({
            url: param.url || $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: $.extend(true, {
                "tokenid": $.cookie("tokenid")
            }, (param.data || {}))
        }, param.block).done(this.proxy(param.callback));
    },
    destroy: function() {
        this.qid("system").select2("destroy");
        this.addRiskAnalysisDialog && this.addRiskAnalysisDialog.dialog("destroy");
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.detailmodule.riskAnalysis.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js",
];
com.sms.detailmodule.riskAnalysis.widgetcss = [{
    id: "",
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    id: "",
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}];