//@ sourceURL=com.audit.inspection.checklist
$.u.define('com.audit.inspection.checklist', null, {
  init: function(options) {
    this._SELECT2_PAGE_LENGTH = 10;
    this.btn = ["add", "save", "exportEx", "minus"];
    this._showMinusButton = false;
    this._requiredCheckList = false;
    this._allowModifyCheckList = false;
    this._showCheckListResultView = false;
    this._hiddenDataTableTr = true;
    this._flowStatus = "";
    this.checkGrade = ""; //公司级SYS、分子公司级SUB2
    this.unitid = "";
    this.requiredfn = function(s) {
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
        if (!$("[name=" + cName + "]").parents(".panel-body").is(":visible")) {
          $("[name=" + cName + "]").parents(".panel-sms").find(".fa").trigger("click");
        }
        $("[name=" + cName + "]").focus();
        return $.u.alert.error("请填写" + cText, 2000);
      }
    }


  },
  afterrender: function(bodystr) {
    this._clid = $.urlParam().id;
    if (!this._clid) {
      window.location.href = "viewSiteInspection.html";
    }
    this._clid = parseInt(this._clid);
    this.checkForm = this.qid("checkForm");
    this.add = this.qid("add");
    this.add.off("click").on("click", this.proxy(this._addPoints));
    this.save = this.qid("save");
    this.save.off("click").on("click", this.proxy(this._save));
    this.qid("btn-showmore").on("click", this.proxy(this.on_showmore_click));
    this._initColumn();
  },

  _init_glyphicon: function() {
    $("i.fa").off("click").on("click", this.proxy(function(event) {
      var $tar = $(event.currentTarget);
      var $span = $tar.parent().find("i");
      $tar.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
      if ($span.hasClass("fa-minus")) {
        $span.removeClass("fa-minus").addClass("fa-plus");
      } else {
        $span.removeClass("fa-plus").addClass("fa-minus");
      }
    })).css({
      "cursor": "pointer"
    });
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
      title: "增加临时检查要点",
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
        /*var zIndex = parseInt($("body>.ui-dialog:last").css("z-index"));
        $("body>.ui-dialog:last").css("z-index", zIndex + 2);
        $("body>.ui-widget-overlay:last").css("z-index", zIndex + 1);*/
      }),
      close: this.proxy(this.on_addPointDialog_close),
      create: this.proxy(this.on_addPointDialog_create)
    });
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
        "point": "检查要点不能为空",
        "according": "检查依据不能为空",
        "prompt": "检查提示不能为空"
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
            key: "checkId",
            "value": this.checkId
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
  on_addPointDialog_save: function() {
    if (this.pointForm.valid()) {
      var param = {
        "checkId": this.checkId,
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
          "sWidth": "50px"
        }, {
          "title": "要点",
          "mData": "itemPoint",
          "class": "break-word",
          "sWidth": "65%"
        }, {
          "title": "结论",
          "mData": "auditResult",
          "sWidth": ""
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
            htmls = "<a href='#' class='rModify' data-id='" + full.id + "'>" + data + "</a>";
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
        if (this.showAuditResult === "yaoDian") {
          columns = [{
            "title": "序号",
            "mData": "id",
            "class": "break-word",
            "sWidth": "50px"
          }, {
            "title": "要点",
            "mData": "itemPoint",
            "class": "break-word",
            "sWidth": "65%"
          }, {
            "title": "操作",
            "mData": "id",
            "sWidth": "50px",
            "class": ""
          }];
          columnsDefs = [{
            "aTargets": 1,
            "mRender": this.proxy(function(data, type, full) {
              var htmls = "";
              htmls = "<a href='#' class='rModify' data-id='" + full.id + "'>" + data + "</a>";
              return htmls;
            })
          }, {
            "aTargets": 2,
            "mRender": this.proxy(function(data, type, full) {
              return this._showMinusButton ? "<span data-id='" + data + "' class='uui-cursor-pointer del'><span class='glyphicon glyphicon-trash'></span></span>" : "";
            })
          }];
        }
        if (this.showAuditResult === "auditRecord") {
          columns = [{
            "title": "序号",
            "mData": "id",
            "class": "break-word",
            "sWidth": "50px"
          }, {
            "title": "要点",
            "mData": "itemPoint",
            "class": "break-word",
            "sWidth": "65%"
          }, {
            "title": "责任单位",
            "mData": "improveUnit",
            "class": "break-word",
            "sWidth": "50px"
          }, {
            "title": "操作",
            "mData": "id",
            "sWidth": "50px",
            "class": ""
          }];
          columnsDefs = [{
            "aTargets": 1,
            "mRender": this.proxy(function(data, type, full) {
              var htmls = "";
              htmls = "<a href='#' class='rModify' data-id='" + full.id + "'>" + data + "</a>";
              return htmls;
            })
          }, {
            "aTargets": 2,
            "mRender": this.proxy(function(data, type, full) {
              return data ? data.name : "";
            })
          }, {
            "aTargets": 3,
            "mRender": this.proxy(function(data, type, full) {
              return this._showMinusButton ? "<span data-id='" + data + "' class='uui-cursor-pointer del'><span class='glyphicon glyphicon-trash'></span></span>" : "";
            })
          }];
        }
        if (this._showCheckListResultView) {
          this.qid("conclusion").removeClass("hidden");
          columns = [{
            "title": "序号",
            "mData": "id",
            "class": "break-word text-center",
            "width": "50px"
          }, {
            "title": "汇总",
            "mData": "id",
            "class": "break-word",
            "width": "200px"
          }, {
            "title": "责任单位",
            "mData": "improveUnit",
            "width": "100px"
          }, {
            "title": "结论",
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
              htmls.push("<div><strong>检查记录：</strong><span>" + (full.auditRecord || "") + "</span></div>");
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
              if (data.auditResult !== "符合项" && data.auditResult !== "不适用") {
                $(row).attr("style", "background-color: #dff0d8 !important");
              }
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
    var clz = $.u.load("com.audit.comm_file.confirm");
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
        $.u.load('com.audit.inspection.dialog');
        this.recordDiForm = new com.audit.inspection.dialog($("div[umid='recordDiForm']", this.$), {
          operator: this.unitid,
          editable: this._allowModifyCheckList,
          checkGrade: this.checkGrade,
          checkId: this._clid
        });
      }
      this.recordDiForm.override({
        refresh: this.proxy(function(formData, newId) {
          var $tr = $e.closest("tr");
          if ($tr.length) { //直接点击保存,或者第一次点击复制并保存
            this.checkDataTable.row($tr).data($.extend(true, {}, data, {
              itemPoint: formData.itemPoint,
              auditRecord: formData.auditRecord,
              improveUnit: formData.improveUnit,
              auditResult: formData.auditResult,
              improveLastDate: formData.improveLastDate
            })).draw();
            if (newId) {
              this.rowId = newId;
              this.recordDiForm.open(newId);
            }
          } else { //点击复制并保存
            this.rowId && this.$.find('a[data-id=' + this.rowId + ']').parents('tr').attr("style", "background-color: #dff0d8 !important");
            var newData = [];
            newData.push($.extend(true, {}, data, {
              itemPoint: formData.itemPoint,
              auditRecord: formData.auditRecord,
              improveUnit: formData.improveUnit,
              auditResult: formData.auditResult,
              id: this.rowId,
              improveLastDate: formData.improveLastDate
            }));
            this.checkDataTable.rows.add(newData).draw();
            if (newId) { //第二次,第三次..点击复制并保存 ，返回newId
              this.rowId = newId;
              this.recordDiForm.open(newId);
            } else { //最后点击保存 ，不返回newId
            }
          }
        })
      });
      this.recordDiForm.open(data.id);
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
            this.checkGrade = response.data.checkGrade;
            this.unitid = response.data.operator;
            this.fillData(response.data);
            this.professionId = response.data.checkType;
            this.checkId = response.data.id;
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
    data.record && this.record.val(data.record);
    data.result && this.result.val(data.result);
    this.qid("conclusion").text(data.conclusion || "");
    this.member.val(data.member || "");
    data.remark && this.remark.val(data.remark);

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
    this._init_glyphicon();
    if ($.isArray(data.actions) && data.actions.length > 0) {
      $.each(data.actions, this.proxy(function(k, v) {
        this.save.after('<button type="submit" class="btn btn-default btn-sm workflow" data-id="' + v.wipId + '"' + ' name=' + '"' + v.name + '">' + v.name + '</button>');
      }));
      if (data.workflowNodeAttributes.flowStatus === "yaoDian") {
        this.save.after('<button class="btn btn-default btn-sm export">导出</button>');
      }
      if (data.checkList && data.checkList.length === 0) {
        $('button.workflow').remove();
      }
      $('button.export').off("click").on("click", this.proxy(this._export));
      $('button.workflow').off("click").on("click", this.proxy(this._workflow));
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
          this.required = data.workflowNodeAttributes.required;
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
    this.showAuditResult = data.workflowNodeAttributes.flowStatus;
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
    return {
      member: this.member.val(),
      remark: this.remark.val(),
      record: this.record.val(),
      result: this.result.val()
    };
  },
  _addPoints: function() {
    this.addDialog.dialog("open");
  },
  _export: function() {
    window.open($.u.config.constant.smsqueryserver + "?method=exportCheckToWord&tokenid=" + $.cookie("tokenid") + "&checkId=" + this._clid + "&url=" + window.location.href);
  },
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
    this.requiredfn(this.required);
    if (this.checkForm.valid()) {
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

com.audit.inspection.checklist.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
  "../../../uui/widget/spin/spin.js",
  "../../../uui/widget/jqblockui/jquery.blockUI.js",
  "../../../uui/widget/ajax/layoutajax.js",
  "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
  "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
  "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"
];
com.audit.inspection.checklist.widgetcss = [{
  path: "../../../uui/widget/select2/css/select2.css"
}, {
  path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
  path: "../../../uui/widget/jqdatatable/css/jquery.dataTables.css"
}, {
  path: "../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css"
}, {
  path: "../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"
}];