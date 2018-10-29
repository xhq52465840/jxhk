//@ sourceURL=com.sms.plugin.organization.orgUserRole
$.u.define('com.sms.plugin.organization.orgUserRole', null, {
    init: function(options) {
        this._options = options || {};
        this._select2PageLength = 10;
        this._unitId = $.urlParam().id;
        this.managable = false;
    },
    afterrender: function(bodystr) {
        this.i18n = com.sms.plugin.organization.orgUserRole.i18n;
        if (!this._unitId) {
            this.$.addClass("hidden");
            return;
        }
        this._unitId = parseInt(this._unitId);

        this.addMebDialog = null;
        this.editRoleDialog = null;
        this.orgName = this.qid("orgName");
        this.orgSystem = this.qid("orgSystem");
        this.orgDeptCode = this.qid("orgDeptCode");
        this.orgDeptCodeDesc = this.qid("orgDeptCodeDesc");
        this.libTree = this.qid("libTree");

        this._getOrgTree();

        // 成员
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            paging: false,
            data: [],
            dom: "",
            "columns": [{
                "title": this.i18n.columns.user,
                "mData": "username",
                "width": "30%"
            }, {
                "title": this.i18n.columns.role,
                "mData": "roles"
            }, {
                "title": this.i18n.columns.handle,
                "mData": "id",
                "width": "20%"
            }],
            "oLanguage": { //语言
                "sZeroRecords": this.i18n.messages.notRecords
            },
            "aoColumnDefs": [{
                "aTargets": 0,
                "mRender": this.proxy(function(data, type, full) {
                    var htmls = [];
                    if (full.deleted === true) {
                        htmls.push("<del>");
                    }
                    if (full.avatarUrl) {
                        htmls.push("<img src=" + full.avatarUrl + " width='16' height='16' />&nbsp;")
                    }
                    alink = '<a href="../../ViewProfile.html?id=' + full.id + '" class="btn view btn-link" data="">' + full.fullname + "(" + full.username + ")" + '</a>';
                    htmls.push(alink);
                    if (full.deleted === true) {
                        htmls.push("</del>");
                    }
                    return htmls.join("");
                })
            }, {
                "aTargets": 1,
                "mRender": function(data, type, full) {
                    var htmls = [];
                    htmls = $.map(data || [], function(item, idx) {
                        return item && item.role ? (item.role.name || "") : "";
                    })
                    return htmls.join("&nbsp;,&nbsp;");
                }
            }, {
                "aTargets": 2,
                "mRender": this.proxy(function(data, type, full) {
                    var htmls = [];
                    if (this._managable === true) {
                        htmls.push("<button type='button' class='btn btn-link deleteUser'>" + this.i18n.buttons.remove + "</button>");
                        if (full.deleted !== true) {
                            htmls.push("<button type='button' class='btn btn-link editRole'>" + this.i18n.buttons.role + "</button>");
                        }
                    }
                    return htmls.join("");
                })
            }],
            "fnServerData": this.proxy(function(sSource, aoData, fnCallBack, oSettings) {
                var selectTreeNode = this.organizationTree && this.organizationTree.getSelectedNodes(),
                    orgid = null;
                if (selectTreeNode && selectTreeNode.length > 0) {
                    orgid = selectTreeNode[0].id;
                    $.u.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type: "post",
                        dataType: "json",
                        data: {
                            "tokenid": $.cookie("tokenid"),
                            "method": "getOrganizationMembers",
                            "organization": orgid
                        }
                    }, this.dataTable).done(this.proxy(function(response) {
                        if (response.success) {
                            fnCallBack({
                                aaData: response.data || []
                            });
                        }
                    }));
                }
            }),
            "fnRowCallback": function(nRow, aData, iDisplayIndex) {
                $(nRow).data("data", aData);
                return nRow;
            },
        });

        this.dataTable.on("click", "button.deleteUser", this.proxy(this.on_deleteUser_click));
        this.dataTable.on("click", "button.editRole", this.proxy(this.on_editRole_click));
        this.qid("btn_adduser").off("click").on("click", this.proxy(this.on_addUser_click));
    },
    /**
     * 生成树
     */
    _getOrgTree: function() {
        var setting = {
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onClick: this.proxy(this.on_orgTree_click)
            }
        };
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getByUnit",
                "dataobject": "organization",
                "unitId": this._unitId
            }
        }, this.libTree).done(this.proxy(function(response) {
            if (response.success && response.data) {
                this._managable = response.managable;
                if (this._managable !== true) {
                    this.qid("btn_adduser").remove();
                }
                var zNodes = $.map(response.data || [], this.proxy(function(org, idx) {
                    return {
                        id: org.id,
                        pId: org.parentId,
                        name: org.name
                    };
                }));
                //左边树
                this.organizationTree = $.fn.zTree.init(this.libTree, setting, zNodes);
                var sNodes = this.organizationTree.getNodes();
                if (sNodes.length) {
                    this.organizationTree.expandNode(sNodes[0], true, false, true);
                }

            }
        }));
    },
    /**
     * 树节点的点击事件
     */
    on_orgTree_click: function(event, treeId, treeNode) {
        // this.dataTable.fnClearTable();
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbyid",
                "dataobject": "organization",
                "dataobjectid": treeNode.id
            }
        }, this.qid("main")).done(this.proxy(function(response) {
            if (response.success) {
                var system = "";
                response.data.systems && $.each(response.data.systems, function(k, v) {
                    system += v.name + "<br/>";
                });
                this.orgSystem.html(system);
                this.orgName.text(response.data.name);
                this.orgDeptCode.text(response.data.deptCode || '');
                this.orgDeptCodeDesc.text(response.data.deptCodeDesc || '');
                this.dataTable.fnDraw();
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorTHrown) {

        }))
    },
    /**
     *  添加成员
     */
    on_addUser_click: function(e) {
        if (this.organizationTree.getSelectedNodes().length > 0) {
            if (!this.addMemberDialog) {
                var clz = $.u.load("com.sms.common.stdComponentOperate");
                this.addMemberDialog = new clz(this.$.find("div[umid=addMemberDialog]"), {
                    title: this.i18n.addMemberDialog.title,
                    fields: [{
                        "name": "members",
                        "label": this.i18n.columns.member,
                        "type": "select",
                        "rule": {
                            required: false
                        },
                        "message": this.i18n.messages.userIsNull,
                        "option": {
                            multiple: true,
                            ajax: {
                                data: this.proxy(function(term, page) {
                                    var selectTreeNode = this.organizationTree && this.organizationTree.getSelectedNodes(),
                                        orgid = null;
                                    if (selectTreeNode && selectTreeNode.length > 0) {
                                        orgid = selectTreeNode[0].id;
                                    }
                                    return {
                                        // method: "getAddableUsersForOrganization",
                                        // organizationId: orgid,
                                        // userName: term,
                                        tokenid: $.cookie("tokenid"),
                                        method: "stdcomponent.getbysearch",
                                        dataobject: "user",
                                        start: (page - 1) * this._select2PageLength,
                                        length: this._select2PageLength,
                                        rule: JSON.stringify([
                                            [{
                                                "key": "fullname",
                                                "op": "like",
                                                "value": term
                                            }]
                                        ])
                                    };
                                }),
                                success: this.proxy(function(response, page) {
                                    if (response.success) {
                                        return {
                                            results: response.data.aaData
                                        }
                                    } else {
                                        $.u.alert.error(response.reason, 1000 * 3);
                                    }
                                })
                            },
                            id: function(item) {
                                return item.id;
                            },
                            formatSelection: function(item) {
                                return item.fullname + "(" + item.username + ")";
                            },
                            formatResult: function(item) {
                                return item.fullname + "(" + item.username + ")";
                            }
                        }
                    }],
                    add: this.proxy(function(comp, formdata) {
                        var nodes = this.organizationTree.getSelectedNodes();
                        if (nodes.length > 0) {
                            var $userName = this.addMemberDialog.formDialog.parent().find("[name=members]").select2("data");
                            var userNameLength = $userName.length;
                            var userIds = [];
                            for (var i = 0; i < userNameLength; i++) {
                                userIds.push($userName[i].id);
                            }
                            this._sendModifyAjax({
                                "tokenid": $.cookie("tokenid"),
                                "method": "modifyOrganization",
                                "paramType": "updateOrganization",
                                "operate": "addUsers",
                                "dataobjectid": nodes[0].id,
                                "obj": JSON.stringify({
                                    "users": userIds
                                })
                            }, comp.formDialog.parent(), this.proxy(function(response) {
                                comp.formDialog.dialog("close");
                                this.dataTable.fnDraw();
                            }))
                        } else {
                            $.u.alert.error(this.i18n.messages.notSelectedOrg, 1000 * 3);
                        }
                    })
                });
            }
            this.addMemberDialog.open();
        } else {
            $.u.alert.error(this.i18n.messages.notSelectedOrg, 1000 * 3);
        }
    },
    on_deleteUser_click: function(e) {
        e.preventDefault();
        try {
            var data = $(e.currentTarget).closest("tr").data("data");
            var nodes = this.organizationTree.getSelectedNodes();
            var tips = this.i18n.messages.confirmRemoveUser;
            if (nodes.length > 0) {
                var clz = $.u.load("com.sms.common.confirm");
                var confirm = new clz({
                    "body": tips[0] + "&nbsp;" + nodes[0].name + "&nbsp;" + tips[1] + "&nbsp;" + data.fullname + "&nbsp;" + tips[2],
                    "buttons": {
                        "ok": {
                            "click": this.proxy(function() {
                                this._sendModifyAjax({
                                    "tokenid": $.cookie("tokenid"),
                                    "method": "modifyOrganization",
                                    "paramType": "updateOrganization",
                                    "operate": "deleteUsers",
                                    "dataobjectid": nodes[0].id,
                                    "obj": JSON.stringify({
                                        "users": [data.id]
                                    })
                                }, confirm.confirmDialog.parent(), this.proxy(function(response) {
                                    confirm.confirmDialog.dialog("close");
                                    this.dataTable.fnDraw();
                                }));
                            })
                        }
                    }
                });
            } else {
                $.u.alert.error(this.i18n.messages.notSelectedOrg, 1000 * 3);
            }
        } catch (e) {
            throw new Error("remove failed " + e.message);
        }
    },
    on_editRole_click: function(e) {
        var data = $(e.currentTarget).closest("tr").data("data");
        var clz = $.u.load("com.sms.common.stdComponentOperate");
        this.editRoleDialog && this.editRoleDialog.destroy();
        this.editRoleDialog = new clz(this.$.find("div[umid=editRoleDialog]"), {
            title: this.i18n.editRoleDialog.title,
            fields: [{
                "name": "roles",
                "label": this.i18n.columns.role,
                "type": "select",
                "rule": {
                    required: false
                },
                "message": this.i18n.messages.roleIsNull,
                "option": {
                    multiple: true,
                    params: {
                        "dataobject": "role"
                    },
                    ajax: {
                        data: {
                            "dataobject": "role"
                        }
                    }
                }
            }],
            edit: this.proxy(function(comp, formdata) {
                var nodes = this.organizationTree.getSelectedNodes();
                if (nodes.length > 0) {
                    this._sendModifyAjax({
                        "tokenid": $.cookie("tokenid"),
                        "method": "setunitroles",
                        "obj": JSON.stringify({
                            unit: this._unitId,
                            roles: formdata.roles,
                            user: data.id
                        })
                    }, comp.formDialog.parent(), this.proxy(function(response) {
                        comp.formDialog.dialog("close");
                        this.dataTable.fnDraw();
                    }))
                } else {
                    $.u.alert.error(this.i18n.messages.notSelectedOrg, 1000 * 3);
                }
            })
        });

        this.editRoleDialog.open({
            "title": this.i18n.editRoleDialog.title,
            "data": {
                "roles": $.map(data.roles || [], function(item, idx) {
                    return item.role ? {
                        id: item.role.id,
                        name: item.role.name
                    } : null;
                })
            }
        });
    },
    /**
     * 添加 编辑请求
     * 1.添加组织：当添加时已选定组织，添加之后继续选定，右侧数据更新；未选定，不做操作，右侧数据清空
     * 2.编辑组织：一定选定组织，右侧数据更新
     * 
     */
    _sendModifyAjax: function(data, block, callback) {
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            data: data,
            dataType: "JSON"
        }, block).done(this.proxy(function(response) {
            if (response.success) {
                callback(response);
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorTHrown) {

        }))
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.plugin.organization.orgUserRole.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
    '../../../../uui/widget/jqurl/jqurl.js',
    '../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
    '../../../../uui/widget/select2/js/select2.min.js',
];
com.sms.plugin.organization.orgUserRole.widgetcss = [{
    path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}, {
    path: '../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'
}, {
    path: '../../../../uui/widget/select2/css/select2.css'
}, {
    path: '../../../../uui/widget/select2/css/select2-bootstrap.css'
}];