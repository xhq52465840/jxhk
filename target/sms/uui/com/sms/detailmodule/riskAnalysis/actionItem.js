//@ sourceURL=com.sms.detailmodule.riskAnalysis.actionItem
/**
 * @title 行动项组件
 * @author tchen@usky.com.cn
 * @date 2016/12/01 
 */
$.u.define('com.sms.detailmodule.riskAnalysis.actionItem', null, {
    init: function(option) {
        /**
         **   {
         **       mode: "",           // TEM、DASHBOARD
         **       cate: "",           // MEASURE、CLAUSE
         **       activity: "",       // activity's id
         **       statusCategory: "", // activity's status
         **       editable: false,    // just for clause
         **   }
         */
        this._options = option || {};
        this.i18n = com.sms.detailmodule.riskAnalysis.actionItem.i18n;
        this._select2PageLength = 10;
        this._COMPLETE = "COMPLETE";
        // 用于控制是否可以修改，组件可以被用于DashBoard
        this._denyModify = this._options.mode === "DASHBOARD" ? false : this._options.cate === "MEASURE" ? this._options.statusCategory === this._COMPLETE : this._options.editable === false;
        this._ACTIONITEM_STATUS = {
            DRAFT: '草稿',
            TO_BE_VERIFIED_BY_REJECT: '待验证(审核拒绝)',
            TO_BE_VERIFIED: '待验证',
            TO_BE_APPROVAL: '待审核',
            DONE: '完成',
        };
        this.CONTROL_MEASURE_ID = null; // control id
        this.CLAUSE_ID = null; // clause id
        this.CURRUSER = $.parseJSON($.cookie("uskyuser")); // login user
        this.AVATAR = $.parseJSON($.cookie("uskyuser")).avatarUrl;
        this.actionItemTemplate = '<tr data-id="#{id}">' + '<td>' + '<input class="edit-model text-actionitem-desc form-control input-sm hidden" type="text" maxlength="2000" value="#{description}" />' + '<span class="view-model span-actionitem-desc break-word">#{description}</span>' + '</td>' + '<td>' + '<div class="input-group edit-model hidden">' + '<input class="text-actionitem-org form-control input-sm" style="background:#fff;" readOnly="readOnly" type="text" value="#{orgTextName}" />' + '<div class="input-group-addon openunitdialog" style="cursor:pointer;"><span class="glyphicon glyphicon-home "></span></div>' + '</div>' + '<input class="hidden-actionitem-org hidden" type="text" value="#{orgId}" />' + '<span class="view-model span-actionitem-org break-word">#{orgName}</span>' + '</td>' + '<td class="nowrap">'
            //+'<div class="input-group edit-model hidden">'
            + '<input class="edit-model hidden text-actionitem-completionDeadLine form-control input-sm" type="text" maxlength="10" value="#{completionDeadLine}" />'
            //  +'<div class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></div>'
            //+'</div>'
            + '<span class="view-model span-actionitem-completionDeadLine">#{completionDeadLine}</span>' + '</td>' + '<td><div class="edit-model hidden"><input type="hidden" class="hidden-actionitem-confirmman form-control input-sm" /></div><span class="view-model span-actionitem-confirm-man">#{confirmMan}</span></td>' + '<td class="nowrap">' + '<span class="span-actionitem-status">#{status}</span>' + '</td>' + '<td class="operatebutton nowrap">' + '<span class="view-model glyphicon glyphicon-comment comment" title="' + this.i18n.buttons.comment + '" style="cursor:pointer;margin-right:5px;"></span>' + (this._options.mode == "TEM" ? '<span class="view-model glyphicon glyphicon-pencil edit" title="' + this.i18n.buttons.edit + '" style="cursor:pointer;margin-right:5px;"></span>' : '') + (this._options.mode == "TEM" ? '<span class="view-model glyphicon glyphicon-trash remove" title="' + this.i18n.buttons.remove + '" style="cursor:pointer;margin-right:5px;"></span>' : '') + '<span class="edit-model glyphicon glyphicon-ok hidden save" title="' + this.i18n.buttons.save + '" style="cursor:pointer;;margin-right:5px;"></span>' + '<span class="edit-model glyphicon glyphicon-remove hidden cancel" title="' + this.i18n.buttons.cancel + '" style="cursor:pointer;;margin-right:5px;"></span>' + '</td>' + '</tr>' + '<tr class="warning hidden">' + '<td colspan="6" style="padding-bottom:10px;">' + '<ul class="list-unstyled commentlist">' + '</ul>' + '<div class="form-group col-sm-12" style="margin:0;padding:0;">' + '<div class="input-group" style="width:100%;">' + '<textarea class="form-control text-comment" placeholder="" maxlength="100"></textarea>' + '<div class="input-group-addon"><button class="btn btn-default btn-sm addcomment">提交</button></div>' + '</div>' + '</div>' + '</td>' + '</tr>';
        this.commentTemplate = '<li style="padding:3px 0;border-bottom:1px dashed #ccc;" class="" >' + '<div style="padding-left:39px;position:relative;">' + '<span>' + '<span style="padding:0 5px;">#{fullname}</span>' + '<img width="39" height="39" src="#{img}" qid="img-user" alt="" style="position: absolute;left: 0px;">' + '</span>' + '<small class="pull-right">#{time}</small>' + '<div style="padding:12px 5px;word-wrap: break-word;word-break: break-all;">#{comment}</div>' + '</div>' + '</li>';
    },
    afterrender: function(bodystr) {
        //this.unitDialog = null; // 单位组件
        this.unitTree = null; // 单位树
        this.currTr = null; // 选择部门时记录当前行，便于下拉单位树时点击节点找到对应的隐藏域
        this.actionItemContainer = this.qid("actionitemcontainer");
        this.unitTreeContainer = this.qid("unittreecontainer");

        if (this._options.mode == "TEM") {
            this.qid("btn_addactionitem").click(this.proxy(this.on_addActionItem_click));
        } else if (this._options.mode == "DASHBOARD") {
            this.qid("btn_addactionitem").closest("tfoot").remove();
            this.$.find(".change-multi-actionitem").remove();
        }

        if (this._denyModify === true) {
            this.qid("btn_addactionitem").remove();
            this.$.find(".change-multi-actionitem").remove();
        } else {
            this.actionItemContainer.on("click", "span.comment", this.proxy(this.on_commentActionItem_click));
            this.actionItemContainer.on("click", "span.edit", this.proxy(this.on_editActionItem_click));
            this.actionItemContainer.on("click", "span.remove", this.proxy(this.on_removeActionItem_click));
            // this.actionItemContainer.on("click", "span.changestatus", this.proxy(this.on_changeActionItemStatus_click));
            this.actionItemContainer.on("click", "span.save", this.proxy(this.on_saveActionItem_click));
            this.actionItemContainer.on("click", "span.cancel", this.proxy(this.on_cancelActionItem_click));
            this.actionItemContainer.on("click", "button.addcomment", this.proxy(this.on_addActionItemComment_click));
            this.actionItemContainer.on("click", ".text-actionitem-org,div.openunitdialog", this.proxy(this.on_openUnitDialog_click));
        }
    },
    /**
     * @title 添加行动项点击事件
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_addActionItem_click: function(e) {
        //this.qid("actionitemcontainer").find("tr").css({"border":"none"});
        this.qid("actionitemcontainer").find("tr.warning").addClass("hidden");
        this._drawActionItem();
    },
    /**
     * @title 备注行动项
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_commentActionItem_click: function(e) {
        var $tr = $(e.currentTarget).closest("tr"),
            $commentTr = $tr.next(),
            actionItemId = parseInt($tr.attr("data-id"));
        if ($commentTr.is(":hidden")) {
            this._reloadComment(actionItemId, $commentTr);
            //$tr.siblings().css({"border":"none"});
            $tr.siblings(".warning:visible").addClass("hidden");
            //$tr.css({"border":"2px solid red","border-bottom":"none"});
            //$commentTr.css({"border":"2px solid red","border-top":"none"});
        } else {
            //$tr.css({"border":"none"});
            //$commentTr.css({"border":"none"});
        }
        $commentTr.toggleClass("hidden");
        this._resizeGadget();
    },
    /**
     * @title 编辑行动项
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_editActionItem_click: function(e, $editTr) {
        var $tr = e ? $(e.currentTarget).closest("tr") : $editTr,
            trData = $tr.data('data');
        $tr.addClass("warning");
        $tr.find(".view-model,.edit-model").toggleClass("hidden");
        $tr.find(".hidden-actionitem-confirmman").select2({
            width: '100%',
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getActionItemConfirmMen",
                        term: term,
                        start: (page - 1) * this._select2PageLength,
                        length: this._select2PageLength
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._select2PageLength)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
            },
            formatResult: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
            }
        }).select2('data', trData && trData.confirmMan && trData.confirmMan.length > 0 ? trData.confirmMan[0] : null);
        $tr.find(".text-actionitem-completionDeadLine").datepicker({
            dateFormat: "yy-mm-dd"
        });

    },
    /**
     * @title 删除行动项
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_removeActionItem_click: function(e) {
        var $tr = $(e.currentTarget).closest("tr").addClass('selected'),
            id = parseInt($tr.attr("data-id"));
        var clz = $.u.load("com.sms.common.stdcomponentdelete");
        (new clz({
            body: "<div>" +
                "<div class='alert alert-warning'>" +
                "<span class='glyphicon glyphicon-exclamation-sign'></span>" + this.i18n.removeActionItemDialog.confirmDeleteActionItem +
                "</div>" +
                "</div>",
            title: this.i18n.removeActionItemDialog.title,
            dataobject: "actionItem",
            dataobjectids: JSON.stringify([id])
        })).override({
            refreshDataTable: this.proxy(function() {
                $tr.next().remove();
                $tr.remove();
            }),
            cancel: function() {
                $tr.removeClass('selected');
            }
        });
    },
    /**
     * @title 更改行动项状态
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_changeActionItemStatus_click: function(e) {
        var $this = $(e.currentTarget),
            $tr = $this.closest("tr").addClass('selected'),
            id = parseInt($tr.attr("data-id")),
            status = $this.attr("data-status");
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
                                "actionItemIds": JSON.stringify([id])
                            }
                        }, confirm.confirmDialog.parent(), {
                            size: 2,
                            backgroundColor: "#fff"
                        }).done(this.proxy(function(resp) {
                            if (resp.success) {
                                $tr.removeClass('selected');
                                $tr.find(".span-actionitem-status").text(this._getStatusText(resp.data.status));
                                $this.attr({
                                    "data-status": resp.data.status
                                }).text(this._getStatusButtonText(status));
                                if (status !== this._ACTIONITEM_STATUS.DRAFT) {
                                    if (this._options.mode === "DASHBOARD") {
                                        $tr.add($tr.next()).remove();
                                    } else if (this._options.mode === "TEM") {
                                        $tr.find("span.remove, span.edit").addClass("hidden");
                                    }
                                }
                                confirm.confirmDialog.dialog("close");
                            }
                        }));
                    })
                },
                "cancel": {
                    "click": function() {
                        $tr.removeClass('selected');
                        confirm.confirmDialog.dialog("close");
                    }
                }
            }
        });

    },
    /**
     * @title 打开部门
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_openUnitDialog_click: function(e) {
        var $this = $(e.currentTarget),
            $tr = $this.closest("tr"),
            position = $this.closest("div.edit-model").position(),
            checkedOrgIds = $tr.find("input.hidden-actionitem-org").val(),
            node = null;
        this.currTr = $tr;
        if (checkedOrgIds) {
            try {
                checkedOrgIds = $.parseJSON(checkedOrgIds);
            } catch (e) {}
        } else {
            checkedOrgIds = [];
        }
        if (this.unitTree == null) {
            var clz = $.u.load("com.sms.plugin.organization.orgTree");
            this.unitTree = new clz(this.$.find("div[umid=unittree]"), {
            	type:"tem",
                "activity": this._options.activity,
                "treeOption": {
                    "check": {
                        "chkStyle": "radio"
                    },
                    "async": {
                        "dataFilter": this.proxy(function(treeId, parentNode, responseData) {
                            var nodes = [];
                            if (responseData) {
                                nodes = $.map(responseData.data.aaData, function(perm, idx) {
                                    return {
                                        "id": perm.id,
                                        "pId": perm.parentId,
                                        "name": perm.name,
                                        "checked": $.inArray(perm.id, checkedOrgIds) > -1
                                    };
                                });
                            }
                            return nodes;
                        })
                    },
                    "callback": {
                        "onCheck": this.proxy(this.on_tree_check),
                        "onClick": this.proxy(this.on_tree_click),
                        "beforeAsync": this.proxy(this.on_tree_beforeAsync),
                        "onAsyncSuccess": this.proxy(function() {
                            this.unitTreeContainer.unblock();
                            var nodes = this.unitTree.invokeTreeMethod("getNodes");
                            $.each(nodes, this.proxy(function(idx, node) {
                                $.each(node.children || [], this.proxy(function(idx, node1) {
                                    this.unitTree.invokeTreeMethod("expandNode", node1, true);
                                }));
                            }));
                        })
                    }
                }
            });
        } else {
            var nodes = this.unitTree.invokeTreeMethod("getNodes");
            $.each(nodes, this.proxy(function(idx, node) {
                $.each(node.children || [], this.proxy(function(idx, node1) {
                    this.unitTree.invokeTreeMethod("expandNode", node1, true);
                }));
            }));
            this.unitTree.invokeTreeMethod("checkAllNodes", false);
            $.each(checkedOrgIds, this.proxy(function(idx, orgId) {
                node = this.unitTree.invokeTreeMethod("getNodeByParam", "id", orgId, null);
                if (node) {
                    this.unitTree.invokeTreeMethod("checkNode", node, true);
                }
            }));
        }
        this.unitTreeContainer.removeClass("hidden").css({
            "left": position.left,
            "top": position.top + 30
        });
        $("body").unbind("mousedown").bind("mousedown", this.proxy(function(e) {
            var $this = $(e.target);
            if ($this.closest("div.unittreecontainer").length == 0) {
                this.unitTree.invokeTreeMethod("expandAll", false);
                this.unitTree.destroy();
                this.unitTree = null;
                this.unitTreeContainer.addClass("hidden");
                $("body").unbind("mousedown");
            }
        }));
    },
    /**
     * @title 保存行动项
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_saveActionItem_click: function(e) {
        var $tr = $(e.currentTarget).closest("tr"),
            id = $tr.attr("data-id"),
            $desc = $tr.find(".text-actionitem-desc"),
            $orgName = $tr.find(".text-actionitem-org"),
            $orgId = $tr.find(".hidden-actionitem-org"),
            $confirmMan = $tr.find(":hidden.hidden-actionitem-confirmman"),
            $completionDeadLine = $tr.find(".text-actionitem-completionDeadLine"),
            params = {
                "tokenid": $.cookie("tokenid"),
                "dataobject": "actionItem"
            },
            obj = {};
        if (!$desc.val()) {
            $.u.alert.error(this.i18n.messages.descNotBeNull);
            $desc.focus();
            return;
        }
        if (!$orgName.val() || !$orgId.val() || $orgId.val() === "[]") {
            $.u.alert.error(this.i18n.messages.orgNotBeNull);
            $orgName.focus();
            return;
        }
        if (!$completionDeadLine.val()) {
            $.u.alert.error(this.i18n.messages.deadlineNotBeNull);
            $completionDeadLine.focus();
            return;
        }
        if (!$confirmMan.val()) {
            $.u.alert.error(this.i18n.messages.confirmManNotBeNull);
            $confirmMan.select2('open');
            return;
        }
        if (/((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/.test($.trim($completionDeadLine.val())) === false) {
            $.u.alert.error(this.i18n.messages.deadlineFoarmatError);
            $completionDeadLine.focus();
            return;
        }


        obj = {
            "description": $desc.val(),
            "organizations": JSON.parse($orgId.val()),
            "confirmMan": [parseInt($confirmMan.val())],
            "completionDeadLine": $completionDeadLine.val(),
            "systemAnalysisClause": this.CLAUSE_ID
        };
        params["obj"] = JSON.stringify(obj);
        if (id) { // edit
            params.method = "stdcomponent.update";
            params.dataobjectid = id;
        } else { // add
            params.method = "stdcomponent.add";
        }
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: params
        }, this.$, {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.reload();
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));

    },
    /**
     * @title 取消行动项
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_cancelActionItem_click: function(e) {
        var $tr = $(e.currentTarget).closest("tr"),
            id = $tr.attr("data-id");
        $tr.find("text-actionitem-completionDeadLine").datepicker("destroy");
        if (id) { // edit
            $tr.removeClass("warning");
            $tr.find(".view-model,.edit-model").toggleClass("hidden");
        } else { // add
            $tr.remove();
        }
    },
    /**
     * @title 添加备注信息
     * @param {object} e - 鼠标对象
     * @return void
     */
    on_addActionItemComment_click: function(e) {
        var $tr = $(e.currentTarget).closest("tr"),
            actionItemId = parseInt($tr.prev().attr("data-id")),
            $comment = $tr.find(".text-comment"),
            comment = $.trim($comment.val());
        if (!comment || comment.length > 100) {
            $comment.focus();
            $.u.alert.error("请输入小于100个字", 1000 * 3);
            return;
        }
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.add",
                "dataobject": "actionItemComment",
                "obj": JSON.stringify({
                    "comment": comment,
                    "user": parseInt($.cookie("userid")),
                    "actionItem": actionItemId
                })
            }
        }, $tr, {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
                this._drawComment({
                    "comment": comment,
                    "avatar": this.AVATAR,
                    "fullname": this.CURRUSER.fullname,
                    "created": (new Date()).format("yyyy-MM-dd hh:mm:ss")
                }, $tr.find(".commentlist"));
                $comment.val("");
                this._resizeGadget();
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title 加载
     * @return void 
     */
    reload: function() {
        var rule = [];
        if (this.CONTROL_MEASURE_ID) {
            rule.push([{
                "key": "measure",
                "value": this.CONTROL_MEASURE_ID
            }]);
        }
        if (this.CLAUSE_ID) {
            rule.push([{
                "key": "systemAnalysisClause.id",
                "value": this.CLAUSE_ID
            }]);
        }
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "actionItem",
                "rule": JSON.stringify(rule)
            }
        }, this.$, {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
                var $tr = null,
                    html = null,
                    control = null;
                this.qid("foot-buttons").removeClass("hidden");
                if (this._options.cate === "MEASURE") {
                    this._denyModify = this._denyModify || response.data.editable === false;
                }
                if (this._denyModify === true) {
                    this.qid("btn_addactionitem").remove();
                    this.$.find(".change-multi-actionitem").remove();
                }
                this.qid("actionitemcontainer").empty();
                $.each(response.data.aaData, this.proxy(function(idx, actionItem) {
                    this._drawActionItem(actionItem);
                }));
                this._resizeGadget();
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title 加载当前用户的待办行动项
     * @return void
     */
    reloadByUser: function() {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "getActionItemByUser"
            },
            dataType: "json"
        }, this.$, {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
                var $tr = null,
                    html = null,
                    control = null;
                if (response.data.length > 0) {
                    $.each(response.data, this.proxy(function(idx, actionItem) {
                        this._drawActionItem(actionItem);
                    }));
                } else {
                    $("<tr><td colspan='5' align='center'>暂无行动项</td></tr>").appendTo(this.actionItemContainer);
                }
                this._resizeGadget();
                window.top && window.top.goHash(); /* 在DashBoard中辅助定位hash,在resizeGadget之后调用 */
            }
        })).fail(this.proxy(function(jqXHR, errotStatus, errorThrown) {

        }));
    },
    /**
     * @title 清空
     * @return void
     */
    empty: function() {
        this.actionItemContainer.find("tr.warning .text-actionitem-completionDeadLine").datepicker("destroy");
        this.actionItemContainer.empty();
    },
    /**
     * @title 树异步获取数据之前执行
     * @return void
     */
    on_tree_beforeAsync: function() {
        this.unitTreeContainer.block({
            "message": "数据加载中...",
            "overlayCSS": {
                "backgroundColor": "#fff"
            },
            "css": {
                "background": "transparent",
                "border": "none"
            }
        });
    },
    /**
     * @title 节点选中事件
     * @param treeId {string} 树的treeId
     * @param treeNode {object} 节点数据对象
     * @return bool 
     */
    on_tree_check: function(e, treeId, treeNode) {
        var checkedNodes = [];
        this.unitTree.invokeTreeMethod(treeNode.checked ? "selectNode" : "cancelSelectedNode", treeNode);
        checkedNodes = this.unitTree.invokeTreeMethod("getCheckedNodes", true);
        this.currTr.find(".text-actionitem-org").val($.map(checkedNodes, function(node, idx) {
            return node.name;
        }).join(","));
        this.currTr.find(".hidden-actionitem-org").val(JSON.stringify($.map(checkedNodes, function(node, idx) {
            return node.id;
        })));
    },
    /**
     * @title 节点点击事件
     * @param treeId {string} 节点编号
     * @param treeNode {object} 节点数据对象
     * @param clickFlag {int} 点被点击后的选中操作类型
     * @return bool 
     */
    on_tree_click: function(e, treeId, treeNode, clickFlag) {
        var checkedNodes = [];
        this.unitTree.invokeTreeMethod("checkNode", treeNode, !treeNode.checked, false);
        checkedNodes = this.unitTree.invokeTreeMethod("getCheckedNodes", true);
        this.currTr.find(".text-actionitem-org").val($.map(checkedNodes, function(node, idx) {
            return node.name;
        }).join(","));
        this.currTr.find(".hidden-actionitem-org").val(JSON.stringify($.map(checkedNodes, function(node, idx) {
            return node.id;
        })));
    },
    /**
     * @title 加载备注信息
     * @param actionItemId {int} actionitem id
     * @param commentTr {jQuery Object} actionitem tr
     * @return void
     */
    _reloadComment: function(actionItemId, commentTr) {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "actionItemComment",
                "rule": JSON.stringify([
                    [{
                        "key": "actionItem",
                        "value": actionItemId
                    }]
                ])
            }
        }, this.$, {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
                var $commentContainer = commentTr.find(".commentlist");
                $commentContainer.empty();
                $.each(response.data.aaData, this.proxy(function(idx, comment) {
                    this._drawComment(comment, $commentContainer);
                }));
                this._resizeGadget();
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title draw actionitem tr
     * @param actionItem {object} action item data
     * @return void
     */
    _drawActionItem: function(actionItem) {
        var orgUl = [];
        if (actionItem && actionItem.organizations && actionItem.organizations.length > 0) {
            orgUl.push("<ul style='padding-left: 20px; margin-bottom: 0px;'>");
            $.each(actionItem.organizations || [], function(idx, org) {
                orgUl.push("<li>" + org.name + "</li>");
            });
            orgUl.push("</ul>");
        }

        var html = this.actionItemTemplate.replace(/#\{id}/g, actionItem ? actionItem.id : "")
            .replace(/#\{orgName}/g, orgUl.join(""))
            .replace(/#\{orgTextName}/g, actionItem && $.isArray(actionItem.organizations) ? $.map(actionItem.organizations, function(org, idx) {
                return org.name;
            }).join(",") : "")
            .replace(/#\{orgId}/g, actionItem ? JSON.stringify($.map(actionItem.organizations || [], function(org, idx) {
                return org.id;
            })) : "")
            .replace(/#\{description}/g, actionItem ? actionItem.description : "")
            .replace(/#\{confirmMan}/g, actionItem ? $.map(actionItem.confirmMan || [], function(item, idx) {
                return item.displayName;
            }).join(',') : "")
            .replace(/#\{completionDeadLine}/g, actionItem ? actionItem.completionDeadLine : "")
            .replace(/#\{status}/g, actionItem && actionItem.status ? this._getStatusText(actionItem.status) : "")
            .replace(/#\{data-status}/g, actionItem && actionItem.status ? actionItem.status : "");
        // .replace(/#\{changestatusBtn}/g, actionItem && actionItem.status ? this._getStatusButtonText(actionItem.status) : "");
        var $tr = $(html).appendTo(this.actionItemContainer).data('data', actionItem);
        if (!actionItem) { // add
            this.on_editActionItem_click(null, $tr);
        }
        if (actionItem && actionItem.status !== this._ACTIONITEM_STATUS.DRAFT) {
            $tr.find(".edit,.remove").addClass("hidden");
        }
        // if (this._denyModify === true) {
        //     $tr.find("span.comment,span.edit,span.remove,span.changestatus").remove();
        // }
    },
    /**
     * @title 绘制备注信息
     * @param comment {object} comment data
     * @param container {jquery object} to be append
     */
    _drawComment: function(comment, container) {
        var isCurrUser = this.CURRUSER.username == comment.fullname;
        var html = this.commentTemplate.replace(/#\{fullname}/g, comment.fullname)
            .replace(/#\{comment}/g, comment.comment)
            .replace(/#\{img}/g, comment.avatar)
            .replace(/#\{time}/g, comment.created);
        var $tr = $(html).appendTo(container);
    },
    /**
     * @title 获取状态显示文本
     * @param {string} status - 状态
     * @return {string} - 状态显示的文本
     */
    _getStatusText: function(status) {
        return status;
    },
    /**
     * @title 获取当前状态下操作按钮显示的文本
     * @param {string} currStatus - 当前状态
     * @return {string} - 按钮文本信息
     */
    _getStatusButtonText: function(currStatus) {
        var result = "";
        switch (currStatus) {
            case this._ACTIONITEM_STATUS.DRAFT:
                result = this.i18n.buttons.release;
                break;
                // no default
        }
        return result;
    },
    /**
     * @title 控制行动项看板的iframe高度
     */
    _resizeGadget: function() {
        if (window.parent) {
            var params = $.urlParam();
            window.parent.resizeGadget && window.parent.resizeGadget(parseInt(params.gadgetsinstance), ($("body").outerHeight(true)) + 1 + "px");
        }
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.detailmodule.riskAnalysis.actionItem.widgetjs = [
    '../../../../uui/widget/jqurl/jqurl.js',
    "../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.min.js",
    "../../../../uui/widget/spin/spin.js",
    "../../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../../uui/widget/ajax/layoutajax.js"
];
com.sms.detailmodule.riskAnalysis.actionItem.widgetcss = [{
    id: "ztreestyle",
    path: "../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"
}];