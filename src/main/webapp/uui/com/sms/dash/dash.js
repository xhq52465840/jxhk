//@ sourceURL=com.sms.dash.dash
/**
 * @title DashBoard组件
 * @desc 按照保存的模板布局显示【com.sms.dash.gadget】组件块
 * @author tchen@usky.com.cn
 * @date 2016/11/30
 */
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.dash.dash', null, {
    /**
     * @title 构造函数
     * @param {object} dashobj - DashBoard的数据对象，如果当前DashBoard存在于当前用户收藏的DashBoard列表中则会传此对象，否则为null，需要通过dashid获取DashBoard对象
     * @param {number} dashid - DashBoard的id
     * @param {bool} isAdminPage - 是否管理员的页面
     */
    init: function(dashobj, dashid, isAdminPage) {
        this._layoutdialog = null;
        this._gadgetdialog = null;
        this._currentgadgetline = null;
        this._currentobj = dashobj;
        this._maybenewid = dashid;
        // 防止双击
        this._chooseclicked = false;
        // 来自管理员的模块
        this._isAdminPage = isAdminPage ? isAdminPage : false;
    },
    afterrender: function() {
        this.i18n = com.sms.dash.dash.i18n;
        if (!this._currentobj) {
            if (!this._maybenewid)
                return;
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                async: true,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "stdcomponent.getbyid",
                    "dataobject": "dashboard",
                    "dataobjectid": this._maybenewid
                }
            }).done(this.proxy(function(result) {
                if (result.success) {
                    this._currentobj = result.data;
                    this._currentobj.creatorId = this._currentobj.creator;

                    var panellayout = this._currentobj.layout;
                    this.qid("dashlayout").removeClass(function(index, css) {
                        return (css.match(/\bdash-layout-\S+/g) || []).join(' ');
                    });
                    this.qid("dashlayout").addClass("dash-" + panellayout);
                    this.qid("dashname").text(this._currentobj.name);
                    var myedit = true;

                    if (!this._isAdminPage) {
                        this.qid("allalert").show();
                        this.qid("allalertfav").unbind("click");
                        this.qid("allalertfav").click(this.proxy(function(e) {
                            $.u.ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                type: "post",
                                dataType: "json",
                                cache: false,
                                data: {
                                    "tokenid": $.cookie("tokenid"),
                                    "method": "favorDashBoard",
                                    "dashBoardId": this._maybenewid,
                                    "charnelThose": "1"
                                }
                            }, this.$).done(this.proxy(function(response) {
                                if (response.success) {
                                    window.location.href = "./DashBoard.html?pageId=" + this._maybenewid;
                                }
                            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                            }));
                        }));
                        if (this._currentobj.creatorId != parseInt($.cookie("userid"))) {
                            myedit = false;
                        }
                        if (!myedit) {
                            $(".myedit", this.$).hide();
                        } else {
                            $(".myedit", this.$).show();
                        }
                    } else {
                        $(".notadmin", this.$).hide();
                    }
                    $.u.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        data: {
                            "tokenid": $.cookie("tokenid"),
                            "method": "getDashboardDetail",
                            "objId": this._currentobj.id
                        }
                    }, this.qid("dashlayout")).done(this.proxy(function(result) {
                        if (result.success) {
                            $.each(result.data, this.proxy(function(idx, agadget) {
                                var posinfo = agadget.position.split("-");
                                var line = posinfo[0];
                                var row = posinfo[1];
                                var $dashcol = $($("ul.dash-column", this.qid("dashlayout"))[line - 1]);
                                var nextgadget = null;
                                $.each($dashcol.children(), this.proxy(function(idx, ali) {
                                    var $li = $(ali);
                                    if ($li.hasClass("gadget")) {
                                        var gadgetdata = $li.data("gadgetdata");
                                        if (parseInt(gadgetdata.position.split("-")[1]) > row) {
                                            nextgadget = $li;
                                            return true;
                                        }
                                    }
                                }));
                                var $linew = null;
                                var umid = $.u.uniqid();
                                if (nextgadget) {
                                    $linew = $("<li class='gadget' id='" + agadget.id + "' style='min-height: 100px;'><div umid='" + umid + "' umodule='com.sms.dash.gadget'/></li>").insertBefore(nextgadget);
                                } else {
                                    $linew = $("<li class='gadget' id='" + agadget.id + "' style='min-height: 100px;'><div umid='" + umid + "' umodule='com.sms.dash.gadget'/></li>").appendTo($dashcol);
                                }
                                $linew.data("gadgetdata", agadget);
                                var moduleobj = $.um($linew.children().first(), agadget, !myedit, true);
                                moduleobj.parent(this);
                                // 回到第一个
                            }));
                            this.qid("btn_layout").unbind("click");
                            this.qid("btn_layout").click(this.proxy(function() {
                                var classList = this.qid("dashlayout").attr("class").split(/\s+/);
                                $.each(classList, function(idx, aclass) {
                                    if (aclass.indexOf("dash-layout-") == 0) {
                                        panellayout = aclass.substr(5);
                                    }
                                });
                                this.open_layoutdialog(panellayout);
                            }));
                            this.qid("btn_gadget").unbind("click");
                            this.qid("btn_gadget").click(this.proxy(function() {
                                $.u.ajax({
                                    url: $.u.config.constant.smsqueryserver,
                                    type: "post",
                                    dataType: "json",
                                    cache: false,
                                    data: {
                                        "tokenid": $.cookie("tokenid"),
                                        "method": "stdcomponent.getbysearch",
                                        "dataobject": "gadgets"
                                    }
                                }).done(this.proxy(function(result) {
                                    if (result.success) {
                                        // 继续做                    
                                        this.open_gadgetdialog(result.data.aaData);
                                    }
                                })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                                }));
                            }));
                            this.qid("btn_restore").unbind("click");
                            this.qid("btn_restore").click(this.proxy(function() {
                                this.restore();
                            }));
                            this.qid("dashlayout").off("click", "a.add-gadget-link");
                            this.qid("dashlayout").on("click", "a.add-gadget-link", this.proxy(function(e) {
                                e.preventDefault();
                                this._currentgadgetline = $(e.currentTarget).closest("ul");
                                this.qid("btn_gadget").trigger("click");
                            }));
                            //看板头部右侧下拉
                            this.qid("btn_layouttools").off("click", "a");
                            this.qid("btn_layouttools").on("click", "a", this.proxy(function(a) {
                                var $a = $(a.currentTarget);
                                var btnname = $a.text();
                                do {
                                    if (btnname == this.i18n.copyPanel) {
                                        var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                        dialog.parent(this);
                                        dialog.override({
                                            on_submit: this.proxy(function(dashid) {
                                                window.location.href = "./DashBoard.html?pageId=" + dashid;
                                            })
                                        });
                                        dialog.open({
                                            copyFrom: this._currentobj.id
                                        });
                                        break;
                                    }
                                    if (btnname == this.i18n.editPanel) {
                                        var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                        dialog.parent(this);
                                        dialog.override({
                                            on_submit: this.proxy(function(dashid) {
                                                window.location.href = "./DashBoard.html?pageId=" + dashid;
                                            })
                                        });
                                        dialog.open(this._currentobj);
                                        break;
                                    }
                                    if (btnname == this.i18n.sharePanel) {
                                        var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                        dialog.parent(this);
                                        dialog.override({
                                            on_submit: this.proxy(function(dashid) {
                                                window.location.href = "./DashBoard.html?pageId=" + dashid;
                                            })
                                        });
                                        dialog.open(this._currentobj);
                                        break;
                                    }
                                    if (btnname == com.sms.dash.dash.i18n.deletePanel) {
                                        try {
                                            var boarddata = this._currentobj;
                                            (new com.sms.common.stdcomponentdelete({
                                                body: "<div>" +
                                                    "<p>" + this.i18n.affirm + "</p>" +
                                                    "</div>",
                                                title: com.sms.dash.dash.i18n.deletePanel + "：" + boarddata.name,
                                                dataobject: "dashboard",
                                                dataobjectids: JSON.stringify([parseInt(boarddata.id)])
                                            })).override({
                                                refreshDataTable: this.proxy(function() {
                                                    window.location.href = "./DashBoard.html";
                                                })
                                            });
                                        } catch (e) {
                                            throw new Error(com.sms.dash.dash.i18n.deleteFail + e.message);
                                        }
                                        break;
                                    }
                                    if (btnname == this.i18n.findPanel) {
                                        window.location.href = "./ManageBoard.html#view=search";
                                        $.jStorage.set("dashfrom", window.location.href);
                                        break;
                                    }
                                    if (btnname == this.i18n.createPanel) {
                                        var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                        dialog.parent(this);
                                        dialog.override({
                                            on_submit: this.proxy(function(dashid) {
                                                window.location.href = "./DashBoard.html?pageId=" + dashid;
                                            })
                                        });
                                        dialog.open();
                                        break;
                                    }
                                }
                                while (false);
                            }));
                            this.checkdashempty();
                            this.initsortable();
                        }
                    })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                    }));
                } else {
                    return;
                }
            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
                return;
            }));
        } else {
            var panellayout = this._currentobj.layout;
            this.qid("dashlayout").removeClass(function(index, css) {
                return (css.match(/\bdash-layout-\S+/g) || []).join(' ');
            });
            this.qid("dashlayout").addClass("dash-" + panellayout);
            this.qid("dashname").text(this._currentobj.name);
            var myedit = true;
            if (!this._isAdminPage) {
                if (this._currentobj.creatorId != parseInt($.cookie("userid"))) {
                    myedit = false;
                }
                if (!myedit) {
                    $(".myedit", this.$).hide();
                } else {
                    $(".myedit", this.$).show();
                }
            } else {
                $(".notadmin", this.$).hide();
            }
            //获取选中看板中的看板
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getDashboardDetail",
                    "objId": this._currentobj.id
                }
            }, this.qid("dashlayout")).done(this.proxy(function(result) {
                if (result.success) {
                    $.each(result.data, this.proxy(function(idx, agadget) {
                        var posinfo = agadget.position.split("-");
                        var line = posinfo[0];
                        var row = posinfo[1];
                        var $dashcol = $($("ul.dash-column", this.qid("dashlayout"))[line - 1]);
                        var nextgadget = null;
                        $.each($dashcol.children(), this.proxy(function(idx, ali) {
                            var $li = $(ali);
                            if ($li.hasClass("gadget")) {
                                var gadgetdata = $li.data("gadgetdata");
                                if (parseInt(gadgetdata.position.split("-")[1]) > row) {
                                    nextgadget = $li;
                                    return true;
                                }
                            }
                        }));
                        var $linew = null;
                        var umid = $.u.uniqid();
                        if (nextgadget) {
                            $linew = $("<li class='gadget' id='" + agadget.id + "' style='min-height: 100px;'><div umid='" + umid + "' umodule='com.sms.dash.gadget'/></li>").insertBefore(nextgadget);
                        } else {
                            $linew = $("<li class='gadget' id='" + agadget.id + "' style='min-height: 100px;'><div umid='" + umid + "' umodule='com.sms.dash.gadget'/></li>").appendTo($dashcol);
                        }
                        $linew.data("gadgetdata", agadget);
                        var moduleobj = $.um($linew.children().first(), agadget, !myedit, true);
                        moduleobj.parent(this);
                        // 回到第一个
                    }));
                    //版式布局的点击事件
                    this.qid("btn_layout").unbind("click");
                    this.qid("btn_layout").click(this.proxy(function() {
                        var classList = this.qid("dashlayout").attr("class").split(/\s+/);
                        $.each(classList, function(idx, aclass) {
                            if (aclass.indexOf("dash-layout-") == 0) {
                                panellayout = aclass.substr(5);
                            }
                        });
                        this.open_layoutdialog(panellayout);
                    }));
                    //添加图标看板的点击事件
                    this.qid("btn_gadget").unbind("click");
                    this.qid("btn_gadget").click(this.proxy(function() {
                        $.u.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid": $.cookie("tokenid"),
                                "method": "stdcomponent.getbysearch",
                                "dataobject": "gadgets"
                            }
                        }).done(this.proxy(function(result) {
                            if (result.success) {
                                // 继续做        
                                this.open_gadgetdialog(result.data.aaData);
                            }
                        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                        }));
                    }));
                    //恢复按钮，默认隐藏，当图表最大化时，恢复按钮出现
                    this.qid("btn_restore").unbind("click");
                    this.qid("btn_restore").click(this.proxy(function() {
                        this.restore();
                    }));
                    //整个右侧，系统看板里添加小工具
                    this.qid("dashlayout").off("click", "a.add-gadget-link");
                    this.qid("dashlayout").on("click", "a.add-gadget-link", this.proxy(function(e) {
                        e.preventDefault();
                        this._currentgadgetline = $(e.currentTarget).closest("ul");
                        this.qid("btn_gadget").trigger("click");
                    }));
                    //工具按钮
                    this.qid("btn_layouttools").off("click", "a");
                    this.qid("btn_layouttools").on("click", "a", this.proxy(function(a) {
                        var $a = $(a.currentTarget);
                        var btnname = $a.text();
                        do {
                            if (btnname == this.i18n.copyPanel) {
                                var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                dialog.parent(this);
                                dialog.override({
                                    on_submit: this.proxy(function(dashid) {
                                        window.location.href = "./DashBoard.html?pageId=" + dashid;
                                    })
                                });
                                dialog.open({
                                    copyFrom: this._currentobj.id
                                });
                                break;
                            }
                            if (btnname == this.i18n.editPanel) {
                                var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                dialog.parent(this);
                                dialog.override({
                                    on_submit: this.proxy(function(dashid) {
                                        window.location.href = "./DashBoard.html?pageId=" + dashid;
                                    })
                                });
                                dialog.open(this._currentobj);
                                break;
                            }
                            if (btnname == this.i18n.sharePanel) {
                                var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                dialog.parent(this);
                                dialog.override({
                                    on_submit: this.proxy(function(dashid) {
                                        window.location.href = "./DashBoard.html?pageId=" + dashid;
                                    })
                                });
                                dialog.open(this._currentobj);
                                break;
                            }
                            if (btnname == com.sms.dash.dash.i18n.deletePanel) {
                                try {
                                    var boarddata = this._currentobj;
                                    (new com.sms.common.stdcomponentdelete({
                                        body: "<div>" +
                                            "<p>" + this.i18n.affirm + "</p>" +
                                            "</div>",
                                        title: com.sms.dash.dash.i18n.deletePanel + "：" + boarddata.name,
                                        dataobject: "dashboard",
                                        dataobjectids: JSON.stringify([parseInt(boarddata.id)])
                                    })).override({
                                        refreshDataTable: this.proxy(function() {
                                            window.location.href = "./DashBoard.html";
                                        })
                                    });
                                } catch (e) {
                                    throw new Error(com.sms.dash.dash.i18n.deleteFail + e.message);
                                }
                                break;
                            }
                            if (btnname == this.i18n.findPanel) {
                                window.location.href = "./ManageBoard.html#view=search";
                                $.jStorage.set("dashfrom", window.location.href);
                                break;
                            }
                            if (btnname == this.i18n.createPanel) {
                                var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>")); //内存创建
                                dialog.parent(this);
                                dialog.override({
                                    on_submit: this.proxy(function(dashid) {
                                        window.location.href = "./DashBoard.html?pageId=" + dashid;
                                    })
                                });
                                dialog.open();
                                break;
                            }
                        }
                        while (false);
                    }));
                    this.checkdashempty();
                    this.initsortable();
                }
            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

            }));
        }
    },
    /**
     * @title 检查显示“空盒”占位
     * @desc 最多3列，如果列中没有对象，则显示“空盒”
     */
    checkdashempty: function() {
        if ($(".dash-first .gadget", this.qid("dashlayout")).length > 0) {
            $(".dash-first .empty-text", this.qid("dashlayout")).hide();
        } else {
            $(".dash-first .empty-text", this.qid("dashlayout")).show();
        }
        if ($(".dash-second .gadget", this.qid("dashlayout")).length > 0) {
            $(".dash-second .empty-text", this.qid("dashlayout")).hide();
        } else {
            $(".dash-second .empty-text", this.qid("dashlayout")).show();
        }
        if ($(".dash-third .gadget", this.qid("dashlayout")).length > 0) {
            $(".dash-third .empty-text", this.qid("dashlayout")).hide();
        } else {
            $(".dash-third .empty-text", this.qid("dashlayout")).show();
        }
    },
    /**
     * @title 初始化排序事件
     */
    initsortable: function() {
        if (this._isAdminPage || this._currentobj.creatorId == parseInt($.cookie("userid"))) {
            $("ul.dash-column:visible").sortable({
                connectWith: "ul.dash-column:visible",
                items: "li.gadget", 
                handle: "div.dashboard-item-header",
                placeholder: "placeholder",
                opacity: 1,
                start: this.proxy(function(e, ui) {
                    ui.placeholder.css("height", ui.item.outerHeight(true));
                    this.qid("dashlayout").addClass("dragging");
                }),
                stop: this.proxy(function(e, ui) {
                    var objs = [];
                    $.each($(".dash-first .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                        var $lineli = $(alineli);
                        var gdata = $lineli.data("gadgetdata");
                        objs.push({
                            id: gdata.id,
                            position: "1-" + (idx + 1)
                        });
                    }));
                    $.each($(".dash-second .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                        var $lineli = $(alineli);
                        var gdata = $lineli.data("gadgetdata");
                        objs.push({
                            id: gdata.id,
                            position: "2-" + (idx + 1)
                        });
                    }));
                    $.each($(".dash-third .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                        var $lineli = $(alineli);
                        var gdata = $lineli.data("gadgetdata");
                        objs.push({
                            id: gdata.id,
                            position: "3-" + (idx + 1)
                        });
                    }));
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        data: {
                            "tokenid": $.cookie("tokenid"),
                            "method": "stdcomponent.updateall",
                            "dataobject": "gadgetsinstance",
                            "objs": JSON.stringify(objs)
                        }
                    }, this.qid("dashlayout")).done(this.proxy(function(result) {
                        if (result.success) {
                            $.each($(".dash-first .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                                var $lineli = $(alineli);
                                var gdata = $lineli.data("gadgetdata");
                                gdata.position = "1-" + (idx + 1);
                                $lineli.data("gadgetdata", gdata);
                            }));
                            $.each($(".dash-second .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                                var $lineli = $(alineli);
                                var gdata = $lineli.data("gadgetdata");
                                gdata.position = "2-" + (idx + 1);
                                $lineli.data("gadgetdata", gdata);
                            }));
                            $.each($(".dash-third .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                                var $lineli = $(alineli);
                                var gdata = $lineli.data("gadgetdata");
                                gdata.position = "3-" + (idx + 1);
                                $lineli.data("gadgetdata", gdata);
                            }));
                            this.checkdashempty();
                            this.qid("dashlayout").removeClass("dragging");
                        } else {
                            $(".dash-column").sortable("cancel");
                        }
                    })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
                        $(".dash-column").sortable("cancel");
                    }));
                })
            }).disableSelection();
        }
    },
    resize: function() {

    },
    /**
     * @title 打开“板式布局”模态层
     * @param {string} layouttype - 布局类型(dash-layout-a、dash-layout-aa、dash-layout-ba、dash-layout-ab、dash-layout-aaa)
     */
    open_layoutdialog: function(layouttype) {
        this._layoutdialog = $("<div/>").dialog({
            title: this.i18n.layout,
            modal: true,
            minWidth: 550,
            resizable: false,
            draggable: false,
            create: this.proxy(function(e) {
                var dialog = $(e.target);
                $("<div class='com-sms-dash-dash-layout-dialog'><div class='panel-body " + layouttype + "'><p><strong>" + this.i18n.selectPanel + "</strong></p><ul>" +
                    "<li><a href='#' class='dialog-layout-a' real='dash-layout-a'><strong>A</strong></a></li>" +
                    "<li><a href='#' class='dialog-layout-aa' real='dash-layout-aa'><strong>AA</strong></a></li>" +
                    "<li><a href='#' class='dialog-layout-ba' real='dash-layout-ba'><strong>BA</strong></a></li>" +
                    "<li><a href='#' class='dialog-layout-ab' real='dash-layout-ab'><strong>AB</strong></a></li>" +
                    "<li><a href='#' class='dialog-layout-aaa' real='dash-layout-aaa'><strong>AAA</strong></a></li>" +
                    "</ul></div></div>").appendTo(dialog);
                dialog.off("click", "a");
                dialog.on("click", "a", this.proxy(function(e) {
                    e.preventDefault();
                    var $a = $(e.currentTarget);
                    this.on_layoutdialog_choose($a.attr("real"));
                }));
            }),
            close: this.proxy(function(e) {
                this._layoutdialog.dialog("destroy").remove();
                this._layoutdialog = null;
            }),
            buttons: [{
                text: this.i18n.cancel,
                click: this.proxy(function() {
                    this._layoutdialog.dialog("close");
                })
            }]
        });
    },
    /**
     * @title 选取“板式布局”的事件
     * @param {string} layouttype - 布局类型(dash-layout-a、dash-layout-aa、dash-layout-ba、dash-layout-ab、dash-layout-aaa)
     */
    on_layoutdialog_choose: function(layouttype) {
        if (this._chooseclicked)
            return;
        this._chooseclicked = true;
        var backlayoutype = null;
        this.qid("dashlayout").removeClass(function(index, css) {
            backlayoutype = (css.match(/\bdash-layout-\S+/g) || []).join(' ');
            return backlayoutype;
        });
        this.qid("dashlayout").addClass(layouttype);
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.update",
                "dataobject": "dashboard",
                "dataobjectid": this._currentobj.id,
                "obj": JSON.stringify({
                    "layout": layouttype.substr(5)
                })
            }
        }, this.qid("dashlayout")).done(this.proxy(function(result) {
            if (result.success) {
                this._currentobj.layout = layouttype;
                var objs = [];
                if (!$("ul.dash-second", this.qid("dashlayout")).is(":visible")) {
                    // 第二第三列都隐藏了，就剩下第一列了
                    var idxstart = 1;
                    if ($(".dash-first .gadget", this.qid("dashlayout")).length > 0) {
                        var firstlinelastdata = $(".dash-first .gadget", this.qid("dashlayout")).last().data("gadgetdata");
                        var lastidxinfo = firstlinelastdata.position.split("-");
                        idxstart = parseInt(lastidxinfo[1]);
                    }
                    $.each($(".dash-second .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                        var $lineli = $(alineli);
                        var gdata = $lineli.data("gadgetdata");
                        objs.push({
                            id: gdata.id,
                            position: "1-" + (++idxstart)
                        });
                    }));
                    $.each($(".dash-third .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                        var $lineli = $(alineli);
                        var gdata = $lineli.data("gadgetdata");
                        objs.push({
                            id: gdata.id,
                            position: "1-" + (++idxstart)
                        });
                    }));
                } else {
                    // 第三列隐藏了，第二列没隐藏
                    var idxstart = 1;
                    if ($(".dash-second .gadget", this.qid("dashlayout")).length > 0) {
                        var secondlinelastdata = $(".dash-second .gadget", this.qid("dashlayout")).last().data("gadgetdata");
                        var lastidxinfo = secondlinelastdata.position.split("-");
                        idxstart = parseInt(lastidxinfo[1]);
                    }
                    $.each($(".dash-third .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                        var $lineli = $(alineli);
                        var gdata = $lineli.data("gadgetdata");
                        objs.push({
                            id: gdata.id,
                            position: "2-" + (++idxstart)
                        });
                    }));
                }
                if (objs.length > 0) {
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        data: {
                            "tokenid": $.cookie("tokenid"),
                            "method": "stdcomponent.updateall",
                            "dataobject": "gadgetsinstance",
                            "objs": JSON.stringify(objs)
                        }
                    }, this.qid("dashlayout")).done(this.proxy(function(result1) {
                        if (result1.success) {
                            if (!$("ul.dash-second", this.qid("dashlayout")).is(":visible")) {
                                // 第二第三列都隐藏了，就剩下第一列了
                                var idxstart = 1;
                                if ($(".dash-first .gadget", this.qid("dashlayout")).children().length > 0) {
                                    var firstlinelastdata = $(".dash-first .gadget", this.qid("dashlayout")).last().data("gadgetdata");
                                    var lastidxinfo = firstlinelastdata.position.split("-");
                                    idxstart = parseInt(lastidxinfo[1]);
                                }
                                $.each($(".dash-second .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                                    var $lineli = $(alineli);
                                    var gdata = $lineli.data("gadgetdata");
                                    gdata.position = "1-" + (++idxstart);
                                    $lineli.data("gadgetdata", gdata);
                                }));
                                $.each($(".dash-third .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                                    var $lineli = $(alineli);
                                    var gdata = $lineli.data("gadgetdata");
                                    gdata.position = "1-" + (++idxstart);
                                    $lineli.data("gadgetdata", gdata);
                                }));
                            } else {
                                // 第三列隐藏了，第二列没隐藏
                                var idxstart = 1;
                                if ($(".dash-second .gadget", this.qid("dashlayout")).length > 0) {
                                    var secondlinelastdata = $(".dash-second .gadget", this.qid("dashlayout")).last().data("gadgetdata");
                                    var lastidxinfo = secondlinelastdata.position.split("-");
                                    idxstart = parseInt(lastidxinfo[1]);
                                }
                                $.each($(".dash-third .gadget", this.qid("dashlayout")), this.proxy(function(idx, alineli) {
                                    var $lineli = $(alineli);
                                    var gdata = $lineli.data("gadgetdata");
                                    gdata.position = "2-" + (++idxstart);
                                    $lineli.data("gadgetdata", gdata);
                                }));
                            }
                            if (!$("ul.dash-third", this.qid("dashlayout")).is(":visible")) {
                                if ($("ul.dash-third li.gadget", this.qid("dashlayout")).length > 0) {
                                    $("ul.dash-third li.gadget", this.qid("dashlayout")).detach().appendTo($("ul.dash-second", this.qid("dashlayout")));
                                }
                            }
                            if (!$("ul.dash-second", this.qid("dashlayout")).is(":visible")) {
                                if ($("ul.dash-second li.gadget", this.qid("dashlayout")).length > 0) {
                                    $("ul.dash-second li.gadget", this.qid("dashlayout")).detach().appendTo($("ul.dash-first", this.qid("dashlayout")));
                                }
                            }
                            this.checkdashempty();
                            this.initsortable();
                            this._layoutdialog.dialog("close");
                            this._chooseclicked = false;
                        }
                    })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                    }));
                } else {
                    if (!$("ul.dash-third", this.qid("dashlayout")).is(":visible")) {
                        if ($("ul.dash-third li.gadget", this.qid("dashlayout")).length > 0) {
                            $("ul.dash-third li.gadget", this.qid("dashlayout")).detach().appendTo($("ul.dash-second", this.qid("dashlayout")));
                        }
                    }
                    if (!$("ul.dash-second", this.qid("dashlayout")).is(":visible")) {
                        if ($("ul.dash-second li.gadget", this.qid("dashlayout")).length > 0) {
                            $("ul.dash-second li.gadget", this.qid("dashlayout")).detach().appendTo($("ul.dash-first", this.qid("dashlayout")));
                        }
                    }
                    this.checkdashempty();
                    this.initsortable();
                    this._layoutdialog.dialog("close");
                    this._chooseclicked = false;
                }
            } else {
                this.qid("dashlayout").removeClass(function(index, css) {
                    return (css.match(/\bdash-layout-\S+/g) || []).join(' ');
                });
                this.qid("dashlayout").addClass(backlayoutype);
                this._chooseclicked = false;
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
            this.qid("dashlayout").removeClass(function(index, css) {
                return (css.match(/\bdash-layout-\S+/g) || []).join(' ');
            });
            this.qid("dashlayout").addClass(backlayoutype);
            this._chooseclicked = false;
        }));
    },
    ///////////////////////////////////////////////gadget////////////////
    /**
     * @title 创建单个面板
     * @param {object} adata 
     */
    _buildlistitem: function(adata) {
        var htm = "";
        htm += "<li class='macro-list-item'><img src='" + adata.thumbnail + "' alt='' width='120' height='60'>";
        htm += "<div class='add-button'>";
        htm += "<input class='macro-button-add aui-button' type='button' value='" + this.i18n.promptlyAdd + "'/>";
        htm += "</div>";
        htm += "<div class='macro-details' real='" + adata.id + "'>";
        htm += "<h3 class='macro-title'><a href=''>" + adata.title + "</a></h3>";
        htm += "<p class='macro-author'>" + adata.creator + "</p>";
        htm += "<p class='macro-desc' title='" + adata.description + "' >" + adata.description + "</p>";
        /*htm += "<p class='macro-uri-wrapper'><a href='" + adata.url + "' class='macro-uri' target='_blank' title='adata.url'>" + adata.url + "</a></p>";*/
        htm += "<p class='macro-uri-wrapper'>" + adata.url + "</p>";
        htm += "</div>";
        htm += "</li>";
        return htm;
    },
    /**
     * @title 开启gadget时候调用
     * @param {array<object>} gadgetdata
     */
    open_gadgetdialog: function(gadgetdata) {
     $.each(gadgetdata,function(idx,item){
    	if(item && item.title=="审计地图看板"){
    		gadgetdata.splice(idx,1);
    	} 
     });
        var total = 0,
            classify = [{
                name: this.i18n.all,
                count: gadgetdata.length
            }];
        $.each(gadgetdata, function(idx, adata) {
            if (adata.type) {
                $.each(classify, function() {

                });
                var aclassget = $.grep(classify, function(aclass) {
                    return aclass.name == adata.type;
                });
                if (aclassget.length > 0) {
                    aclassget[0].count++;
                } else {
                    classify.push({
                        name: adata.type,
                        count: 1
                    });
                }
            }
        });
        this._gadgetdialog = $("<div/>").dialog({
            title: this.i18n.toolDireetory,
            modal: true,
            minWidth: 870,
            minHeight: 550,
            resizable: false,
            draggable: false,
            create: this.proxy(function(e) {
                var dialog = $(e.target);
                var htm = "<div class='com-sms-dash-dash-gadget-dialog'><ul class='dialog-page-menu' style='height: 423px;'>";
                $.each(classify, function(idx, aitem) {
                    htm += "<li class='page-menu-item " + (idx == 0 ? "selected" : "") + "'><button class='item-button'><span>" + aitem.name + "</span><span style='margin-left:10px;'>(" + aitem.count + ")</span></button></li>";
                });
                htm += "</ul>";
                htm += "<div class='dialog-page-body'><div class='dialog-panel-body' style='height: 423px;display:block;'>";
                htm += "<ol class='macro-list'>";
                $.each(gadgetdata, this.proxy(function(idx, adata) {
                    htm += this._buildlistitem(adata);
                }));
                htm += "</ol>";
                htm += "</div></div></div>";
                $(htm).appendTo(dialog);
                var $search = $("<div class='pull-right' style='padding-top:10px;'><div class='input-group'><input type='text' class='form-control input-sm search-text' placeholder='搜索'/></div></div>").appendTo($(".ui-dialog-titlebar", dialog.parent()));
                $("input", $search).delayedkeyup({
                    handler: this.proxy(function(e) {
                        var vle = $(".ui-dialog-titlebar div.pull-right input", dialog.parent()).val();
                        var $btn = $(".selected button", this._gadgetdialog);
                        $("div.com-sms-dash-dash-gadget-dialog>div.dialog-page-body ol.macro-list", this._gadgetdialog).empty();
                        var htm = "";
                        if ($btn.children().first().text() == this.i18n.all) {
                            $.each(gadgetdata, this.proxy(function(idx, adata) {
                                if (vle == "" || (adata.title && adata.title.indexOf(vle) > -1) || (adata.description && adata.description.indexOf(vle) > -1) || (adata.creator && adata.creator.indexOf(vle) > -1)) {
                                    htm += this._buildlistitem(adata);
                                }
                            }));
                        } else {
                            $.each(gadgetdata, this.proxy(function(idx, adata) {
                                if (adata.type == $btn.children().first().text()) {
                                    if (vle == "" || (adata.title && adata.title.indexOf(vle) > -1) || (adata.description && adata.description.indexOf(vle) > -1) || (adata.creator && adata.creator.indexOf(vle) > -1)) {
                                        htm += this._buildlistitem(adata);
                                    }
                                }
                            }));
                        }
                        $("div.com-sms-dash-dash-gadget-dialog>div.dialog-page-body ol.macro-list", this._gadgetdialog).html(htm);
                    })
                });
                dialog.off("click", ".page-menu-item button");
                dialog.on("click", ".page-menu-item button", this.proxy(function(e) {
                    var vle = $(".ui-dialog-titlebar div.pull-right input", dialog.parent()).val();
                    var $btn = $(e.currentTarget);
                    $(".selected", this._gadgetdialog).removeClass("selected");
                    $btn.parent().addClass("selected");
                    $("div.com-sms-dash-dash-gadget-dialog>div.dialog-page-body ol.macro-list", this._gadgetdialog).empty();
                    var htm = "";
                    if ($btn.children().first().text() == this.i18n.all) {
                        $.each(gadgetdata, this.proxy(function(idx, adata) {
                            if (vle == "" || (adata.title && adata.title.indexOf(vle) > -1) || (adata.description && adata.description.indexOf(vle) > -1) || (adata.creator && adata.creator.indexOf(vle) > -1)) {
                                htm += this._buildlistitem(adata);
                            }
                        }));
                    } else {
                        $.each(gadgetdata, this.proxy(function(idx, adata) {
                            if (adata.type == $btn.children().first().text()) {
                                if (vle == "" || (adata.title && adata.title.indexOf(vle) > -1) || (adata.description && adata.description.indexOf(vle) > -1) || (adata.creator && adata.creator.indexOf(vle) > -1)) {
                                    htm += this._buildlistitem(adata);
                                }
                            }
                        }));
                    }
                    $("div.com-sms-dash-dash-gadget-dialog>div.dialog-page-body ol.macro-list", this._gadgetdialog).html(htm);
                }));
                dialog.off("click", "ol.macro-list>li.macro-list-item>div.add-button>input.macro-button-add,ol.macro-list>li.macro-list-item>div.macro-details>h3.macro-title>a");
                dialog.on("click", "ol.macro-list>li.macro-list-item>div.add-button>input.macro-button-add,ol.macro-list>li.macro-list-item>div.macro-details>h3.macro-title>a", this.proxy(function(e) {
                    e.preventDefault();
                    var $detaildiv = $(e.currentTarget).closest(".macro-list-item").children(".macro-details");
                    this.on_gadgetdialog_choose(parseInt($detaildiv.attr("real")));
                }));
            }),
            close: this.proxy(function(e) {
                this._gadgetdialog.dialog("destroy").remove();
                this._gadgetdialog = null;
            }),
            buttons: [{
                text: this.i18n.cancel,
                click: this.proxy(function() {
                    this._gadgetdialog.dialog("close");
                })
            }]
        });
    },
    /**
     * @title 选取gadget时候调用
     * @param {number} gadgetid
     */
    on_gadgetdialog_choose: function(gadgetid) {
        if (!this._currentgadgetline) {
            this._currentgadgetline = $("ul.dash-first", this.qid("dashlayout"));
        }
        var posi = "-1";
        if (this._currentgadgetline.hasClass("dash-first")) {
            posi = "1" + posi;
        } else if (this._currentgadgetline.hasClass("dash-second")) {
            posi = "2" + posi;
        } else if (this._currentgadgetline.hasClass("dash-third")) {
            posi = "3" + posi;
        }
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.add",
                "dataobject": "gadgetsinstance",
                "obj": JSON.stringify({
                    gadgets: gadgetid,
                    position: posi,
                    urlparam: "",
                    dashboard: this._currentobj.id,
                    creator: $.cookie("userid")
                })
            }
        }, this._currentgadgetline).done(this.proxy(function(result) {
            if (result.success) {
                var objs = [];
                $.each(this._currentgadgetline.children(".gadget"), this.proxy(function(idx, alineli) {
                    var $lineli = $(alineli);
                    var gdata = $lineli.data("gadgetdata");
                    var p = gdata.position.split("-");
                    objs.push({
                        id: gdata.id,
                        position: p[0] + "-" + (parseInt(p[1]) + 1)
                    });
                }));
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    dataType: "json",
                    cache: false,
                    data: {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.updateall",
                        "dataobject": "gadgetsinstance",
                        "objs": JSON.stringify(objs)
                    }
                }, this._currentgadgetline).done(this.proxy(function(result1) {
                    if (result1.success) {
                        $.each(this._currentgadgetline.children(".gadget"), this.proxy(function(idx, alineli) {
                            var $lineli = $(alineli);
                            var gdata = $lineli.data("gadgetdata");
                            var p = gdata.position.split("-");
                            gdata.position = p[0] + "-" + (parseInt(p[1]) + 1);
                            $lineli.data("gadgetdata", gdata);
                        }));
                        var gadgetdata = {
                            id: result.data,
                            position: posi,
                            urlparam: "",
                            dashboard: this._currentobj.id,
                            creator: $.cookie("userid"),
                            gadgetsId: gadgetid
                        };
                        var umid = $.u.uniqid();
                        var $li = $("<li class='gadget' id='"+result.data+"' style='min-height: 200px;'><div umid='" + umid + "' umodule='com.sms.dash.gadget'/></li>").insertBefore(this._currentgadgetline.children().first());
                        $li.data("gadgetdata", gadgetdata);
                        var moduleobj = $.um($li.children().first(), gadgetdata); // 肯定是可读并且是需要配置的
                        moduleobj.parent(this);
                        // 回到第一个
                        this._currentgadgetline = $("ul.dash-first", this.qid("dashlayout"));
                        this.checkdashempty();
                        this._gadgetdialog.dialog("close");
                    }
                })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                }));
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title 最大化gadget
     * @param {jQuery object} modulesel - gadget面板
     */
    maximize: function(modulesel) {
        $(".gadget", this.qid("dashlayout")).hide();
        $("ul.dash-column", this.qid("dashlayout")).hide();
        modulesel.closest("ul.dash-column").addClass("maximized");
        modulesel.closest("ul.dash-column").css("min-height", "");
        modulesel.parent().show();
        modulesel.addClass("maxedmodule");
        this.qid("btn_restore").parent().children().hide();
        this.qid("btn_restore").show();
        if (modulesel.closest("ul.dash-column").hasClass("ui-sortable")) {
            $("ul.dash-column:visible").sortable("destroy");
        }
    },
    /**
     * @title 还原大小
     */
    restore: function() {
        this.initsortable();
        $(".maximized", this.qid("dashlayout")).css("min-height", "840px");
        $(".maximized", this.qid("dashlayout")).removeClass("maximized");
        $(".gadget", this.qid("dashlayout")).show();
        $("ul.dash-column", this.qid("dashlayout")).show(); // 只显示sortable的ul
        $(".maxedmodule", this.qid("dashlayout")).um().restore();
        $(".maxedmodule", this.qid("dashlayout")).removeClass("maxedmodule");
        this.qid("btn_restore").parent().children().show();
        this.qid("btn_restore").hide();
    },
    changexx: function(styleidx) {
        this.children();
        $.each();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.dash.dash.widgetjs = [
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js",
    "../../../uui/widget/jqdelayedkeyup/delayedkeyup.js"
];
com.sms.dash.dash.widgetcss = [{
    id: "",
    name: "dash1.css",
    disabled: false
}, {
    id: "",
    name: "dash2.css",
    disabled: true
}];
