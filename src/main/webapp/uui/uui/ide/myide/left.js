//@ sourceURL=uui.ide.myide.left
$.u.define('uui.ide.myide.left', null, {
    init: function () {
        this._tempidforadd = null;
    },
    afterrender: function () {
        this.$.tabs();
        this.filetreesetting = {
            async: {
                enable: true,
                otherParam: {},
                url: $.u.config.constant.listfolder,
                dataFilter: function filter(treeId, parentNode, childNodes) {
                    if (!childNodes)
                        return null;
                    return childNodes.data;
                }
            }
            , data: {
                keep: {
                    leaf: true,
                    parent: true
                }
            }
            , edit: {
                enable: true,
                removeTitle: "删除",
                renameTitle: "重命名",
                showRenameBtn: this.proxy(function (treeId, treeNode) {
                    if (treeNode.id == "0")
                        return false;
                    else
                        return true;
                }),
                showRemoveBtn: this.proxy(function (treeId, treeNode) {
                    if (treeNode.id == "0")
                        return false;
                    else
                        return true;
                }),
                drag: {
                    isCopy: false,
                    isMove: true
                }
            }
            , view: {
                dblClickExpand: true,
                selectedMulti: true,
                addHoverDom: this.proxy(function (treeId, treeNode) {
                    if (treeNode.isParent) {
                        var sObj = $("#" + treeNode.tId + "_span");
                        if ($("#addBtn-" + treeNode.id).length > 0)
                            return;
                        var addStr = "<span class='button add' id='addBtn-" + treeNode.id
                            + "' title='新增子节点' onfocus='this.blur();'></span>";
                        var $addBtn = $(addStr).insertAfter(sObj);
                        $addBtn.unbind("click");
                        $addBtn.click(this.proxy(function (treeNodeX, e) {                            
                            // 名称、类型（服务器校验名称重复）
                            var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='uui.ide.myide.typedialog'/>"), treeNodeX[0], "ADD");//内存创建
                            dialog.parent(this); 
                            dialog.override({
                                on_submit: this.proxy(function (fileid) {
                                    this._tempidforadd = fileid;
                                    $.fn.zTree.getZTreeObj(this.qid("foldertree").attr("id")).reAsyncChildNodes(treeNodeX[0], "refresh");
                                })
                            });
                            dialog.open();
                        }, treeNode));
                    }
                }),
                removeHoverDom: this.proxy(function (treeId, treeNode) {
                    $("#addBtn-" + treeNode.id).unbind().remove();
                })
            }
            , callback: {
                beforeAsync: this.proxy(function (treeId, treeNode) {
                    var treeObj = $.fn.zTree.getZTreeObj(treeId);
                    var dirs = null;
                    if (treeNode) {
                        dirs = $.u.ide_getFolderPath(treeNode);
                    }
                    if (dirs) {
                        treeObj.setting.async.otherParam["dirname"] = dirs;
                    }
                    return true;
                }),
                onAsyncSuccess: this.proxy(function (e, treeId, treeNode, msg) {
                    if (this._tempidforadd && treeNode.children) {
                        var nodesget = $.grep(treeNode.children, this.proxy(function (value) {
                            return value.id.indexOf("-" + this._tempidforadd) > -1;
                        }));
                        if (nodesget.length > 0) {
                            var treeObj = $.fn.zTree.getZTreeObj(treeId);
                            var nodeclick = nodesget[0];
                            $('#' + nodeclick.tId + '_a').trigger('dblclick');
                            this._tempidforadd = null;
                        }
                    }
                }),
                onDblClick: this.proxy(function (e, treeId, treeNode) {
                    if (treeNode && !treeNode.isParent) {
                        if (treeNode.iconSkin) {
                            this.parent().center.opentab(treeNode.id.replace(".", "_"), treeNode.name, "uui.ide.myide.center" + treeNode.iconSkin, treeNode);
                        }
                        else {
                            $.u.alert.warn("不支持的类型");
                        }
                    }
                }),
                beforeRename: function (treeId, treeNode, newName) {
                    $("#addBtn-" + treeNode.id).unbind().remove();
                    if (newName.length == 0) {
                        $.u.alert.error("节点名称不能为空!");
                        return false;
                    }
                    var retflag = false;
                    var obj = {};
                    obj.Id = treeNode.Id;
                    obj.Val = newName;
                    obj.PId = treeNode.PId;
                    obj.Tp = treeNode.Tp;
                    $.u.ajax({
                        type: "post",
                        dataType: "json",
                        url: "/server/access.ashx?tokenid=" + $.cookie("tokenid") + "&uid=" + $.cookie("uid") + "&method=basic.dictmanage",
                        data: {
                            "action": "update",
                            "obj": JSON.stringify(obj)
                        },
                        async: false, // 修改应该很快，所以同步进行
                        cache: false,
                        success: function (result, textStatus, jqXHR) {
                            if (result.success) {
                                $.u.alert.info("修改成功");
                                retflag = true;
                            }
                        }
                    });
                    return retflag;
                },
                beforeRemove: this.proxy(function (treeId, treeNode) {
                    if (confirm("确认删除" + treeNode.name + "？")) {
                        var filepath = $.u.ide_getFolderPath(treeNode);
                        var suc = true;
                        $.u.ajax({
                            url: $.u.config.constant.delfile,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            async: false,
                            data: {
                                "filepath": filepath,
                                "typeradio": treeNode.isParent ? "folder" : treeNode.iconSkin
                            }
                        }, this.qid("foldertree")).done(this.proxy(function (result) {
                            if (result.success) {
                                $.fn.zTree.getZTreeObj(this.qid("foldertree").attr("id")).reAsyncChildNodes(treeNode.getParentNode(), "refresh");
                                if (treeNode.isParent) {
                                    var $liget = this.parent().center.getlibytitleprefix(filepath);
                                    $.each($liget, this.proxy(function (idx, aliget) {
                                        if (idx == $liget.length - 1) {
                                            this.parent().center.deletetab($(aliget), null, true);
                                        }
                                        else {
                                            this.parent().center.deletetab($(aliget), null, false);
                                        }
                                    }))
                                }
                                else {
                                    var aliget = this.parent().center.getlibyfileid(treeNode.id);
                                    if (aliget) {
                                        this.parent().center.deletetab(aliget, null, true);
                                    }
                                }
                            } else {
                                $.u.alert.error(result.reason);
                                suc = false;
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
                            suc = false;
                        }));
                        return suc;
                    }
                    else {
                        return false;
                    }
                })
            }
        };
        var treeObj = $.fn.zTree.init(this.qid("foldertree"), this.filetreesetting, [{ id: "0", pId: "-1", name: "WEBROOT", open: false, isParent: true }]);
        treeObj.expandNode(treeObj.getNodes()[0]);
        this.qid("toolaccordion").accordion({ heightStyle: "content", collapsible: false, active: 0 });
        this.qid("toolaccordion").hide();
        this.qid("refreshfile").unbind("click");
        this.qid("refreshfile").click(this.proxy(function (e) {
            var treeObjex = $.fn.zTree.init(this.qid("foldertree"), this.filetreesetting, [{ id: "0", pId: "-1", name: "WEBROOT", open: false, isParent: true }]);
            treeObjex.expandNode(treeObj.getNodes()[0]);
        }));
    },
    resize: function () {
        this.qid("toolaccordion").accordion("refresh");
    }
}, { usehtm: true });

uui.ide.myide.left.widgetjs = ['../../widget/jqztree/js/jquery.ztree.all-3.5.js'];
uui.ide.myide.left.widgetcss = [{ path: '../../widget/jqztree/css/zTreeStyle/zTreeStyle.css' }];