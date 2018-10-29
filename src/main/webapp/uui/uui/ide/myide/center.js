//@ sourceURL=uui.ide.myide.center
$.u.define('uui.ide.myide.center', null, {
    init: function () {
        this.modulecsses = [];

        this.previewWin = null;
    },
    afterrender: function () {
        this.tabLiTemplate = "<li view='false' tabid='#{tabid}' tabname='#{tabname}'><a href='#{tabdivid}' title='#{tabname}'>#{tabname}</a><span class='ui-icon ui-icon-arrowstop-1-s' role='presentation'></span><span class='ui-icon ui-icon-close' role='presentation'></span></li>";
        this.tabDivTemplate = "<div id='#{tabdivid}' tabid='#{tabid}' tabname='#{tabname}'><div umid='#{tabid}'></div></div>";
        this.tabOtherLiTemplate = "<li class=\"ui-menu-item\" tabid='#{tabid}'><a href=\"#\" tabid='#{tabid}' title='#{tabname}' class=\"ui-corner-all\">#{tabname}</a><span class='ui-icon ui-icon-close' role='presentation'></span></li>";
        this.qid("tabcontents").tabs({
            heightStyle: "fill", activate: this.proxy(function (e, ui) {
                var newTabLi = $(ui.newTab);
                var activeidxx = this.qid("tabcontents").children().first().children().index(newTabLi);
                var umdiv = this.qid("tabcontents").children().eq(activeidxx + 1).children().first();
                if (umdiv.isUm()) {
                    var moduleClz = umdiv.um().getclazz();
                    if (moduleClz.tool) {
                        this.showtool();
                    }
                    else {
                        this.hidetool();
                    }
                    if (moduleClz.property) {
                        this.showproperty();
                    }
                    else {
                        this.hideproperty();
                    }
                    umdiv.um().resize();
                }
                else {
                    this.hidetool();
                    this.hideproperty();
                }
            })
        });
        this.qid("tabcontents").children().first().off("click", ".ui-icon-close");
        this.qid("tabcontents").children().first().on("click", ".ui-icon-close", this.proxy(function (e) {
            // 拿到要删除的
            var $li = $(e.currentTarget).parent();
            this.deletetab($li);
        }));
        this.qid("tabcontents").children().first().off("click", ".ui-icon-arrowstop-1-s").on("click", ".ui-icon-arrowstop-1-s", this.proxy(function (e) {
            // 拿到要刷新的
            var $li = $(e.currentTarget).parent();
            var idxx = this.qid("tabcontents").children().first().children().index($li);
            var $tabdiv = this.qid("tabcontents").children().eq(idxx + 1);
            var obj = $tabdiv.children().first().um();
            if (obj.reload) {
                obj.reload();
            }
            if ($li.hasClass("uui-savable")) {
                $li.removeClass("uui-savable");
            }
        }));
        this.qid("tabotherlist").off('click', 'span span');
        this.qid("tabotherlist").on('click', 'span span', this.proxy(function (e) {
            var menu = $(e.currentTarget).parent().next();
            menu.show();
            $('body').bind('mousedown', this.proxy(function (eb) {
                var $et = $(eb.target);
                // $et是a标签，这样判断是在otherlist下，并且是li下，而且不是listclose的
                if (($et.is("a") || ($et.is("span") && $et.hasClass("ui-icon-close"))) && $et.parent().is('li') && $et.parent().hasClass('ui-menu-item') && $et.parent().parent().hasClass('ui-menu')) {
                    if ($et.is("a")) {
                        if (!$et.parent().hasClass("listclose")) {
                            //加亮某个tab
                            this.opentab($et.attr('tabid'));
                        }
                        else {
                            //全部或者其他关闭
                            var allli = this.qid("tabcontents").children().first().children();
                            var alllilen = allli.length;
                            var ettype = $et.parent().attr("value");
                            if (ettype == "closeall") {
                                $.each(allli, this.proxy(function (idx, ali) {
                                    this.deletetab($(ali), alllilen == idx + 1);
                                }))
                            } else if (ettype == "closeother") {
                                var activeidxx = this.qid("tabcontents").tabs("option", "active");
                                if (activeidxx + 1 == alllilen) {
                                    // 激活的是最后一个
                                    $.each(allli, this.proxy(function (idx, ali) {
                                        if (idx + 1 == alllilen)
                                            return false;
                                        this.deletetab($(ali), alllilen == idx + 2);
                                    }))
                                } else {
                                    $.each(allli, this.proxy(function (idx, ali) {
                                        if (idx == activeidxx) // 是加亮的跳过
                                            return true;
                                        this.deletetab($(ali), alllilen == idx + 1);
                                    }))
                                }
                            }
                        }
                    }
                    else {
                        // ui-icon-close
                        // 删除tab的动作
                        this.deletetab(this.qid("tabcontents").children().first().children("li[tabid='" + $et.prev().attr("tabid") + "']"));
                    }
                }
                menu.hide();
                $('body').unbind('mousedown');
            }));
        }));
        this.qid("tabotherlist").off('mouseenter mouseleave', 'li.ui-menu-item');
        this.qid("tabotherlist").on('mouseenter mouseleave', 'li.ui-menu-item', function () {
            $(this).children().first().toggleClass('ui-state-focus');
        });

    },
    resize: function () {
        this.fittabline();
        this.qid("tabcontents").tabs("refresh");
        // resize当前加亮的
        var activeidxx = this.qid("tabcontents").tabs("option", "active");
        if (activeidxx > -1) {
            var umdiv = this.qid("tabcontents").children().eq(activeidxx + 1).children().first();
            if (umdiv.isUm()) {
                umdiv.um().resize();
            }
        }
    },
    opentab: function (tabid, tabname, modulename, treeNode) {
        var idxx = 0;
        var queryhasli = this.qid("tabcontents").children().first().children("li[tabid=\"" + tabid + "\"]");
        if (queryhasli.length > 0) {
            queryhasli.show();
            idxx = this.qid("tabcontents").children().first().children().index(queryhasli);
        }
        else {
            if (!modulename) {
                throw new Exception("必须要有modulename参数");
            }
            var tabuniqid = $.u.uniqid();
            var tabli = $(this.tabLiTemplate.replace(/#\{tabdivid\}/g, "#" + tabuniqid).replace(/#\{tabname\}/g, tabname).replace(/#\{tabid\}/g, tabid));
            var tabdiv = $(this.tabDivTemplate.replace(/#\{tabdivid\}/g, tabuniqid).replace(/#\{tabname\}/g, tabname).replace(/#\{tabid\}/g, tabid));
            var tabotherli = $(this.tabOtherLiTemplate.replace(/#\{tabname\}/g, tabname).replace(/#\{tabid\}/g, tabid));
            this.qid("tabcontents").children().first().append(tabli);
            this.qid("tabcontents").append(tabdiv);
            this.qid("tabcontents").tabs("refresh");
            idxx = this.qid("tabcontents").children().first().children().length - 1;
            this.qid("tabotherlist").children().last().append(tabotherli);// 追加到最后
            var moduleClz = $.u.load(modulename);
            if (moduleClz.tool) {
                this.showtool();
            }
            else {
                this.hidetool();
            }
            if (moduleClz.property) {
                this.showproperty();
            }
            else {
                this.hideproperty();
            }
            var moduleobj = new moduleClz(treeNode);
            moduleobj.parent(this);
            moduleobj.target(tabdiv.children().first());
        }
        this.qid("tabcontents").tabs({ active: idxx });
        this.fittabline(true);
    },
    deletetab: function ($li, disablefit, skipsave) {
        if ($li.hasClass("uui-savable")) {
            if (!skipsave && confirm("是否保存" + $li.children().first().text() + "？")) {
                this.save($li);
            }
        }
        var only1flag = false;
        // 拿到加亮的
        var activeidxx = this.qid("tabcontents").tabs("option", "active");
        var liindex = this.qid("tabcontents").children().first().children().index($li);
        if (activeidxx == liindex) {
            // 相等，表示加亮的删除
            if (activeidxx > 0) {
                this.qid("tabcontents").tabs({ active: activeidxx - 1 });
            }
            else {
                if (this.qid("tabcontents").children().length == 2) {
                    // 只剩下ul和一个div了
                    only1flag = true;
                    this.hidetool();
                    this.hideproperty();
                }
                else {
                    this.qid("tabcontents").tabs({ active: activeidxx + 1 });
                }
            }
        }
        else {
            // 不等，直接删除
        }
        var $divget = this.qid("tabcontents").children().eq(liindex + 1); // 直接取div
        // 析构module
        if ($divget.children().first().isUm()) {
            $divget.children().first().um().destroy();
        }
        $divget.remove();
        this.qid("tabotherlist").children().last().children("li[tabid='" + $li.attr("tabid") + "']").remove();
        $li.remove();
        if (!disablefit) {
            this.qid("tabcontents").tabs("refresh");
        }
        if (!only1flag && !disablefit) {
            // 只剩一个，不刷新
            this.fittabline();
        }
    },
    getlibyfileid: function (fileid) {
        var tabid = fileid.replace(".", "_");
        var $liget = this.qid("tabcontents").children().first().children("li[tabid='" + tabid + "']");
        if ($liget.length > 0) {
            return $liget;
        }
        else {
            return null;
        }
    },
    getlibytitleprefix: function (title) {
        var $lis = [];
        $.each(this.qid("tabcontents").children().first().children(), this.proxy(function (idx, ali) {
            if ($(ali).children().first().attr("title").indexOf(title) > -1) {
                $lis.push($(ali));
            }
        }))
        return $lis;
    },
    fittabline: function (isnew) {
        var ulwidth = this.qid("tabcontents").children().first().width() - 20; //下拉15的去掉，多5个余量
        var liwidth = 0;
        var activeidxx = this.qid("tabcontents").tabs("option", "active");
        var allv = this.qid("tabcontents").children().first().children("li:visible");
        var allh = this.qid("tabcontents").children().first().children("li:hidden");
        var allchd = this.qid("tabcontents").children().first().children();
        $.each(allv, function (idx, avli) {
            liwidth += $(avli).outerWidth(true);
        });
        if (ulwidth > liwidth) {
            if (allh.length > 0 && !isnew) {
                // 有隐藏的，得把隐藏的放出来
                var diff = ulwidth - liwidth;
                $.each(allh.get().reverse(), function (idx, ahli) {
                    $(ahli).show();
                    diff -= $(ahli).outerWidth(true);
                    if (diff < 0) {
                        $(ahli).hide();
                        return false;
                    }
                });
            }
        }
        else {
            // 要隐藏掉几个
            var diff = liwidth - ulwidth; // 偏移量
            $.each(allv, function (idx, avli) {
                if (diff > 0) {
                    if (allchd.index($(avli)) != activeidxx) { // 已经加亮的不能隐藏，取下一个
                        $(avli).hide();
                        diff -= $(avli).outerWidth(true);
                    }
                }
                else {
                    // 隐藏够了，break出去
                    return false;
                }
            });
        }
    },
    /**
    * 标记为改变
    */
    marksavable: function ($tabdiv) {
        var idxx = this.qid("tabcontents").children().index($tabdiv);
        var $tabli = this.qid("tabcontents").children().first().children().eq(idxx - 1);
        if (!$tabli.hasClass("uui-savable")) {
            $tabli.addClass("uui-savable");
            this.qid("tabotherlist").children().last().children("li[tabid='" + $tabli.attr('tabid') + "']").addClass("uui-savable");
        }
    },
    marksaved: function ($tabdiv) {
        var idxx = this.qid("tabcontents").children().index($tabdiv);
        var $tabli = this.qid("tabcontents").children().first().children().eq(idxx - 1);
        if ($tabli.hasClass("uui-savable")) {
            $tabli.removeClass("uui-savable");
            this.qid("tabotherlist").children().last().children("li[tabid='" + $tabli.attr('tabid') + "']").removeClass("uui-savable");
        }
    },
    save: function ($tabli) {
        var activeidxx = -1;
        if (!$tabli) {
            activeidxx = this.qid("tabcontents").tabs("option", "active");
            $tabli = this.qid("tabcontents").children().first().children().eq(activeidxx);
        }
        else {
            activeidxx = this.qid("tabcontents").children().first().children().index($tabli);
        }
        if ($tabli.hasClass("uui-savable")) {
            var umdiv = this.qid("tabcontents").children().eq(activeidxx + 1).children().first();
            if (umdiv.isUm()) {
                var errdesc = umdiv.um().save();
                if (!errdesc || errdesc == "") {
                    this.marksaved(umdiv.parent());
                }
                else {
                    $.u.alert.error(errdesc);
                }
            }
        }
    },
    saveall: function () {
        $.each(this.qid("tabcontents").children().first().children(".uui-savable"), this.proxy(function (idx, atabli) {
            var $tabli = $(atabli);
            this.save($tabli);
        }));
    },
    redraggable: function () {
        $(".lyrow", this.parent().left.qid("toolaccordion")).draggable({
            connectToSortable: $(".uui-ide-myide-centermodule .uui-designer > .uui-container", this.$),
            helper: "clone",
            appendTo: "body",
            iframeFix: true,
            handle: ".drag",
            start: function (e, ui) {
                $(".view", ui.helper).show();
                $(".preview", ui.helper).hide();
                ui.helper.css("opacity", ".35");
            },
            drag: function (e, ui) {
                ui.helper.width(400);
            },
            stop: this.proxy(function (e, ui) {
                //this._parentmodule.initsortable();
            })
        });
    },
    showtool: function () {
        this.parent().left.qid("toolaccordion").show();
    },
    hidetool: function () {
        this.parent().left.qid("toolaccordion").hide();
    },
    showproperty: function () {
        this.parent().right.$.show();
    },
    hideproperty: function () {
        this.parent().right.$.hide();
    },
    /**
    * 更新右面的property显示
    * 传入参数是当前选中的元素
    */
    refreshproperty: function (centerboxsel) {
        this.parent().right.showpanel(centerboxsel);
    },
    setTabLiTitle: function (childmodule$, title) {
        var idxx = this.qid("tabcontents").children().index(childmodule$.parent());
        var $tabli = this.qid("tabcontents").children().first().children().eq(idxx - 1);
        $tabli.children().first().attr("title", title);
    },
    activeTabPreview: function (isclicked) {
        if (isclicked || (this.previewWin && !this.previewWin.closed)) {
            var activeidxx = this.qid("tabcontents").tabs("option", "active");
            if (activeidxx > -1) {
                var $tabli = this.qid("tabcontents").children().first().children().eq(activeidxx);
                var umdiv = this.qid("tabcontents").children().eq(activeidxx + 1).children().first();
                if (umdiv.isUm()) {
                    var clzobj = umdiv.um();
                    if (clzobj.getclazz().clazzname == "uui.ide.myide.centermodule") {
                        var sData = "<!DOCTYPE html>";
                        sData += "<html>";
                        sData += "<head>";
                        sData += "<meta charset=\"utf-8\">";
                        sData += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">";
                        sData += "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">";
                        sData += "<meta name=\"title\" content=\"即时窗口\">";
                        sData += "<title>即时窗口</title>";
                        sData += "<script type=\"text/javascript\" src=\"../../../uui/jquery.min.js\"></script>";
                        sData += "<script type=\"text/javascript\" src=\"../../../uui/uui-loader.js\"></script>";
                        sData += "<link href=\"../../../main.css?_t=" + (new Date().getTime()) + "\" rel=\"stylesheet\">";
                        sData += "<script type=\"text/javascript\">";
                        sData += "window.console = window.console || {};\n";
                        sData += "console.log || (console.log = function () { return false; });\n";
                        sData += "$.u.inituui();\n";                        
                        sData += clzobj.jseditor.getValue() + "\n";
                        var rh = clzobj.rawhtm();
                        rh = rh.replace(/[\f\n\r\t\v]/g, "");
                        rh = rh.replace(/(>)( )+?(<)/g, "><");
                        sData += clzobj.getclazzname() + ".htm = \"" + rh.replace(/\\/g, "\\\\").replace(/'/g, "\\\'").replace(/"/g, "\\\"") + "\";\n";
                        sData += "</scri" + "pt>";
                        sData += "</head><body>";
                        sData += "<div umid='preview' umodule='" + clzobj.getclazzname() + "'></div>";
                        sData += "<script type=\"text/javascript\">";
                        sData += "$(function () {\n";
                        sData += "$.um($(\"div[umid='preview']\"));\n";
                        sData += "});\n";
                        sData += "</scri" + "pt>";
                        sData += "</body>";
                        sData += "</html>";
                        this.previewWin = window.open("", "inwtancewindow", "fullscreen=yes;");
                        this.previewWin.document.write(sData);
                        this.previewWin.document.close();
                    } else {
                        this.previewWin = window.open($tabli.children().first().attr("title"), "inwtancewindow", "fullscreen=yes;");
                    }
                }
            }
        }
    },
    HTMLEnCode: function (str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&/g, "&gt;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/    /g, "&nbsp;");
        s = s.replace(/\'/g, "'");
        s = s.replace(/\"/g, "&quot;");
        s = s.replace(/\n/g, "<br>");
        return s;
    },
    HTMLDeCode: function (str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&gt;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, "    ");
        s = s.replace(/'/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        s = s.replace(/<br>/g, "\n");
        return s;
    }
}, { usehtm: true });

uui.ide.myide.center.widgetjs = [];
uui.ide.myide.center.widgetcss = [];