//@ sourceURL=uui.ide.myide.centermodule
$.u.define('uui.ide.myide.centermodule', null, {
    init: function (treeNode) {
        this.treeNode = treeNode;
        this.isloaded = false;
        this.loadedjsstring = "";
        this.loadedhtmstring = "";
        this.updatesource = "htm";

        this.__jswidgets = [];        

        this.jshintwaiting = null;
        this.htmhintwaiting = null;
        this.updatejswaiting = null;
        this.updatehtmwaiting = null;
    },
    afterrender: function (treeNode) {
        this.$.height(this.$.parent().height() - 5); // 设置本体的高度
        this.$.children(".ui-tabs-bottom").tabs({
            heightStyle: "fill", activate: this.proxy(function (e, ui) {
                setTimeout(this.proxy(this.resize), 500);
            })
        });
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        this.parent().setTabLiTitle(this.$, filepath);
        $.when(
            $.u.ajax({
                url: $.u.config.constant.getfile,
                type: "post",
                dataType: "json",
                data: {
                    "filepath": filepath + ".js"
                },
                cache: false
            }, this.$),
            $.u.ajax({
                url: $.u.config.constant.getfile,
                type: "post",
                dataType: "json",
                data: {
                    "filepath": filepath + ".htm"
                },
                cache: false
            }, this.$)
        ).done(this.proxy(function (resp1, resp2) {
            var result1 = resp1[0], result2 = resp2[0];
            if (result1.success && result2.success) {
                // 初始化js的
                this.jseditor = CodeMirror.fromTextArea(this.qid("jseditor")[0], {
                    mode: { name: "javascript" },
                    lineNumbers: true,
                    //theme: "neat",
                    lineWrapping: false,
                    indentLine: true,
                    indentUnit: 4,
                    extraKeys: {
                        "Alt-/": this.proxy(function (cm) { // 提示
                            CodeMirror.showHint(cm, CodeMirror.hint.javascript);
                        }),
                        "Ctrl-Q": function (cm) { // 折叠
                            cm.foldCode(cm.getCursor());
                        },
                        "Ctrl-K": this.proxy(function (cm) {
                            this.jsAutoFormat();
                        }),
                        "F11": function (cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function (cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
                    },
                    highlightSelectionMatches: { showToken: /\w/ },
                    matchBrackets: true,
                    foldGutter: true, // 折叠
                    gutters: ["CodeMirror-foldgutter", "CodeMirror-lint-markers"], // 折叠
                    autoCloseBrackets: true, //自动括号
                    styleActiveLine: true,
                    lint: {
                        async : false,
                        delay: 5000
                    }
                });
                this.jseditor.on("change", this.proxy(function (cm, change) {
                    if (this.isloaded) {
                        if (this.loadedjsstring == cm.getValue()) {
                            this.parent().marksaved(this.$.parent());
                        }
                        else {
                            this.parent().marksavable(this.$.parent());
                        }
                        clearTimeout(this.updatejswaiting);
                        this.updatejswaiting = setTimeout(this.proxy(function () {
                            this.parent().activeTabPreview();
                        }), 500);
                    }
                    else {
                        cm.clearHistory();
                    }
                }));
                this.jseditor.on("keyup", this.proxy(function (cm, keyevent) {
                    if (!keyevent.ctrlKey && !keyevent.altKey && !keyevent.shiftKey) {
                        if ((keyevent.keyCode >= 48 && keyevent.keyCode <= 57) ||
                            (keyevent.keyCode >= 65 && keyevent.keyCode <= 90) ||
                            (keyevent.keyCode >= 189 && keyevent.keyCode <= 190)) { // 数字，字母，点号减号
                            clearTimeout(this.jshintwaiting);
                            this.jshintwaiting = setTimeout(this.proxy(function () {
                                CodeMirror.showHint(cm, CodeMirror.hint.javascript);
                            }), 500);
                        }
                    }
                }));
                this.jseditor.setValue(result1.data);
                this.loadedjsstring = result1.data;
                // 初始化html的
                this.htmeditor = CodeMirror.fromTextArea(this.qid("htmeditor")[0], {
                    mode: { name: "text/html" },
                    lineNumbers: true,
                    lineWrapping: false,
                    indentLine: true,
                    indentUnit: 4,
                    extraKeys: {
                        "Alt-/": this.proxy(function (cm) { // 提示
                            CodeMirror.showHint(cm, CodeMirror.hint.html);
                        }),
                        "Ctrl-Q": function (cm) { // 折叠
                            cm.foldCode(cm.getCursor());
                        },
                        "Ctrl-K": this.proxy(function (cm) {
                            this.htmAutoFormat();
                        }),
                        "F11": function (cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function (cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
                    },
                    matchTags: { bothTags: true },
                    matchBrackets: true,
                    foldGutter: true, // 折叠
                    gutters: ["CodeMirror-foldgutter"], // 折叠
                    autoCloseBrackets: true, //自动括号
                    autoCloseTags: true,
                    styleActiveLine: true
                });
                this.htmeditor.on("change", this.proxy(function (cm, change) {
                    if (this.isloaded) {
                        if (this.loadedhtmstring == cm.getValue()) {
                            this.parent().marksaved(this.$.parent());
                        }
                        else {
                            this.parent().marksavable(this.$.parent());
                        }
                        clearTimeout(this.updatehtmwaiting);
                        this.updatehtmwaiting = setTimeout(this.proxy(function () {
                            if (this.updatesource != "designer") {
                                this.updateDesignerFromHtmEditor();
                            }
                            this.parent().activeTabPreview();
                        }), 500);
                    }
                    else {
                        cm.clearHistory();
                    }
                }));
                this.htmeditor.on("keyup", this.proxy(function (cm, keyevent) {
                    // 字母，或者是<号
                    if ((!keyevent.ctrlKey && !keyevent.altKey && (keyevent.keyCode >= 65 && keyevent.keyCode <= 90)) || (keyevent.shiftKey && keyevent.keyCode == 188)) {
                        clearTimeout(this.htmhintwaiting);
                        this.htmhintwaiting = setTimeout(this.proxy(function () {
                            CodeMirror.showHint(cm, CodeMirror.hint.html);
                        }), 500);
                    }
                }));
                this.htmeditor.setValue(result2.data);
                this.loadedhtmstring = result2.data;
                // 全部加载完成
                this.isloaded = true;
                this.updateDesignerFromHtmEditor();
                setTimeout(this.proxy(this.resize), 500);
            }
            else {
                $.u.alert.error(result1.reason + " || " + result2.reason);
            }
        })).fail(function (f1, f2) {
            if (f1[1]) {
                $.u.alert.error("访问js异常");
            }
            if (f2[1]) {
                $.u.alert.error("访问htm异常");
            }
        });
        this.qid("splitline").css("top", "");
        this.qid("splitline").css("bottom", "40px");
        this.qid("down").unbind("click");
        this.qid("up").unbind("click");
        this.qid("middle").unbind("click");
        this.qid("down").click(this.proxy(function (e) {
            this.qid("designer").show();
            this.qid("htmeditor").parent().hide();
            this.qid("splitline").css("bottom", "40px");
            this.qid("splitline").css("top", "");
            setTimeout(this.proxy(this.resize), 500);
        }));
        this.qid("up").click(this.proxy(function (e) {
            this.qid("designer").hide();
            this.qid("htmeditor").parent().show();
            this.qid("splitline").css("bottom", "");
            this.qid("splitline").css("top", "0px");
            setTimeout(this.proxy(this.resize), 500);
        }));
        this.qid("middle").click(this.proxy(function (e) {
            this.qid("designer").show();
            this.qid("htmeditor").parent().show();
            this.qid("splitline").css("top", this.qid("splitline").parent().height() / 2 + "px");
            this.qid("splitline").css("bottom", "");
            setTimeout(this.proxy(this.resize), 500);
        }));
        this.qid("splitline").draggable({
            axis: "y", start: this.proxy(function () {
            }), stop: this.proxy(function () {
                this.qid("designer").show();
                this.qid("htmeditor").parent().show();
                setTimeout(this.proxy(this.resize), 500);
            })
        });
    },
    resize: function () {
        var moduletab = this.$.children(".ui-tabs-bottom");
        if (moduletab.hasClass("ui-tabs")) {
            var activeidxx = moduletab.tabs("option", "active");
            if (activeidxx > -1) {
                if (activeidxx == 0) {
                    if (this.qid("htmeditor").parent().is(":visible") && this.htmeditor) {
                        // 在代码编辑器界面
                        var toppos = parseInt(this.qid("splitline").css("top"));
                        if (isNaN(toppos)) {
                            toppos = this.qid("htmeditor").parent().parent().height() - 50;
                        }
                        this.qid("htmeditor").parent().height(this.qid("htmeditor").parent().parent().height() - toppos - 50);// 减掉下面的tab
                        this.htmeditor.refresh();
                    }
                    if (this.qid("designer").is(":visible")) {
                        var toppos = parseInt(this.qid("splitline").css("top"));
                        if (isNaN(toppos)) {
                            toppos = this.qid("htmeditor").parent().parent().height() - 50;
                        }
                        // 在图形编辑器界面
                        this.qid("designer").height(toppos - 5);
                        //this.qid("designer").children().first().height(toppos - 10); // 滚动条
                    }
                }
                else {
                    if (this.jseditor) {
                        this.qid("jseditor").parent().height(this.qid("jseditor").parent().parent().height() - 50); // 减掉下面的tab
                        this.jseditor.refresh();
                    }
                }
            }
        }
    },
    reload: function () {
        this.isloaded = false;
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        $.when(
            $.u.ajax({
                url: $.u.config.constant.getfile,
                type: "post",
                dataType: "json",
                data: {
                    "filepath": filepath + ".js"
                },
                cache: false
            }, this.$),
            $.u.ajax({
                url: $.u.config.constant.getfile,
                type: "post",
                dataType: "json",
                data: {
                    "filepath": filepath + ".htm"
                },
                cache: false
            }, this.$)
        ).done(this.proxy(function (resp1, resp2) {
            var result1 = resp1[0], result2 = resp2[0];
            if (result1.success && result2.success) {
                this.jseditor.setValue(result1.data);
                this.loadedjsstring = result1.data;
                this.htmeditor.setValue(result2.data);
                this.loadedhtmstring = result2.data;
                // 全部加载完成
                this.isloaded = true;
                this.updateDesignerFromHtmEditor();
            }
            else {
                $.u.alert.error(result1.reason + " || " + result2.reason);
            }
        })).fail(function (f1, f2) {
            if (f1[1]) {
                $.u.alert.error("访问js异常");
            }
            if (f2[1]) {
                $.u.alert.error("访问htm异常");
            }
        });
    },
    save: function () {
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        $.when(
            $.u.ajax({
                url: $.u.config.constant.updatefile,
                type: "post",
                dataType: "json",
                data: {
                    "filepath": filepath + ".js",
                    "filecontent": this.jseditor.getValue()
                },
                async: false,
                cache: false
            }, this.$),
            $.u.ajax({
                url: $.u.config.constant.updatefile,
                type: "post",
                dataType: "json",
                data: {
                    "filepath": filepath + ".htm",
                    "filecontent": this.htmeditor.getValue()
                },
                async: false,
                cache: false
            }, this.$)
        ).done(this.proxy(function (resp1, resp2) {
            var result1 = resp1[0];
            var result2 = resp2[0];
            if (result1.success && result2.success) {
                this.loadedjsstring = this.jseditor.getValue();
                this.loadedhtmstring = this.htmeditor.getValue();
                return null;
            }
            else {
                return result1.reason + "||" + result2.reason;
            }
        })).fail(function (f1, f2) {
            if (f1[1]) {
                $.u.alert.error("访问js异常");
            }
            if (f2[1]) {
                $.u.alert.error("访问htm异常");
            }
        });
    },
    jsAutoFormat: function () {
        var cursorline = this.jseditor.getCursor(true);
        var range = { from: CodeMirror.Pos(this.jseditor.firstLine(), 0), to: CodeMirror.Pos(this.jseditor.lastLine()) };
        this.jseditor.autoFormatRange(range.from, range.to);
        this.jseditor.setCursor(cursorline);
        if (!this.jseditor.hasFocus())
            this.jseditor.focus();
    },
    htmAutoFormat: function () {
        var cursorline = this.htmeditor.getCursor(true);
        var range = { from: CodeMirror.Pos(this.htmeditor.firstLine(), 0), to: CodeMirror.Pos(this.htmeditor.lastLine()) };
        this.htmeditor.autoFormatRange(range.from, range.to);
        this.htmeditor.setCursor(cursorline);
        if (!this.htmeditor.hasFocus())
            this.htmeditor.focus();
    },
    /**
    *获取center里的htm
    *
    */
    rawhtm: function () {
        var clonecenter = this.qid("designer").clone();
        // 先把组件还原
        $.each($(".__uskymoduleobject.uui-box", clonecenter), function (idx, amodule) {
            var $amodule = $(amodule);
            var moduleinstance = $("#" + $amodule.attr("id")).um(); // 还是得找全局的
            $(moduleinstance.__targethtm).insertAfter($amodule);
            $amodule.remove();
        });
        //再去掉class
        //$.each($("[class*='uui-']", clonecenter), function (idx, acls) {
        //    $(acls).removeClass(function (index, css) {
        //        return (css.match(/\buui-\S+/g) || []).join(' ');
        //    });
        //});
        $(".uui-designmode", clonecenter).removeClass("uui-designmode");
        var clzstr = this.getclazzname();
        //this.qid("designer").children().first().removeClass(this._readableClazzEncode(clzstr));
        clonecenter.removeClass(this._readableClazzEncode(clzstr));
        $(".uui-highlighted", clonecenter).removeClass("uui-highlighted");
        //去掉ui-sortable
        $(".ui-sortable", clonecenter).removeClass("ui-sortable");
        return clonecenter.html();
    },
    initsortable: function () {
        $(".uui-container", this.qid("designer")).sortable({
            connectWith: ".uui-container",
            opacity: .35,
            containment: this.qid("designer"),
            update: this.proxy(function (e, ui) {
                var itm = $(ui.item), itmtmp;
                if (itm.hasClass('lyrow')) {
                    itmtmp = $(".view", itm).children();
                    if (itmtmp.length > 1) {
                        alert("不支持多标签内容，标签将被清除");
                    }
                    else {
                        if (itmtmp.eq(0).hasClass("__uskymoduleobject")) {
                            var leftmenuobj = $("#" + itmtmp.eq(0).attr("id")).um();
                            itmtmp = $("" + leftmenuobj.__targethtm);
                        }
                        itmtmp.insertAfter(itm);
                        var tmstp = new Date().getTime();
                        if (itmtmp.attr("umodule")) {
                            itmtmp.attr("umid", itmtmp.attr("umid") + tmstp);
                            $.um(itmtmp);
                        }
                    }
                    itm.remove();
                    $.each($(".__uskymoduleobject.uui-box", this.qid("designer")), this.proxy(function (idx, aitem) {
                        this.offallevent($(aitem));
                    }));
                    this.initsortable();
                }
                itm = null;
            }),
            start: function (e, ui) {
                var itm = $(ui.helper);
                if (itm.hasClass('lyrow')) {
                    ui.placeholder.height($(".view", itm).outerHeight());
                }
            },
            stop: this.proxy(function (e, ui) {
                this.updateHtmEditorFromDesigner();
                //this.htmAutoFormat();
            })
        }).disableSelection();
        this.qid("designer").off("click", ".uui-container,.uui-box");
        this.qid("designer").on("click", ".uui-container,.uui-box", this.proxy(function (e) {
            e.stopPropagation();
            var $itm = $(e.currentTarget);
            $(".uui-highlighted").removeClass("uui-highlighted");
            $(e.currentTarget).addClass("uui-highlighted");
            var clzstr = this.getclazzname();
            this.qid("designer").children().first().addClass(this._readableClazzEncode(clzstr));
            this.parent().refreshproperty($itm);
            // 加亮
            var fullpath = ($itm).getFullPath("designer");
            var pathitems = fullpath.split(";");
            var htmvalue = this.htmeditor.getValue();
            var tagstart = htmvalue.indexOf("<body");
            var lefthtmvalue = htmvalue.substr(tagstart + 5); // body以后的
            tagstart += 5;
            $.each(pathitems, this.proxy(function (idx, apathitem) {                
                var aitem = apathitem.split(":");
                var tagnm = aitem[0];
                var tagidx = aitem[1];                
                for (var i = 0 ; i <= tagidx; i++) {                    
                    tagstart += lefthtmvalue.indexOf("<" + tagnm);
                    lefthtmvalue = htmvalue.substr(tagstart + tagnm.length + 1);                    
                    if (i == tagidx) {
                        if (idx < pathitems.length - 1) {
                            tagstart += (tagnm.length + 1);
                            tagstart += lefthtmvalue.indexOf(">");
                            lefthtmvalue = htmvalue.substr(tagstart + 1);
                            tagstart += 1;
                            return true; // 继续子的
                        }
                    }
                    else {
                        // 跳过
                        tagmatchinfo = CodeMirror.findMatchingTag(this.htmeditor, this.htmeditor.posFromIndex(tagstart));
                        tagstart = this.htmeditor.indexFromPos(tagmatchinfo.close.to); // 新的地址
                        lefthtmvalue = htmvalue.substr(tagstart);
                    }
                }
            }));
            tagmatchinfo = CodeMirror.findMatchingTag(this.htmeditor, this.htmeditor.posFromIndex(tagstart));
            this.htmeditor.setSelection(tagmatchinfo.open.from, tagmatchinfo.close.to);
        }));
    },
    offallevent: function (sel) {
        sel.find("*").off();
        sel.find("*").bind("click", function (e) {
            e.preventDefault();
        });
    },
    updateHtmEditorFromDesigner: function () {
        var allhtm = this.htmeditor.getValue();
        this.updatesource = "designer";
        this.htmeditor.setValue(allhtm.replace(/(<body[\s\S]*?>)[\s\S]*(<\/body>)/, "$1" + this.rawhtm() + "$2"));
        this.updatesource = "htm";
    },
    updateDesignerFromHtmEditor: function () {
        var loadedjsstring = this.jseditor.getValue();
        var loadedhtmstring = this.htmeditor.getValue();
        var parseresult = esprima.parse(loadedjsstring, { tolerant: true, loc: true, range: true });
        var clzstr = this.getclazzname();
        //var moduleClz = $.u.load(parseresult.body[0].expression.arguments[0].value); // 执行
        //var tempmodule = new moduleClz(); // 执行                
        //tempmodule.target(this.qid("designer").children().first());
        var extcss = [];
        $.each(parseresult.body, this.proxy(function (idx, aseg) {
            if (loadedjsstring.substring(aseg.range[0], aseg.range[1]).indexOf(clzstr + ".widgetcss") == 0) {
                extcss = eval(loadedjsstring.substring(aseg.expression.right.range[0], aseg.expression.right.range[1]));
            }
        }));
        var htmstring = loadedhtmstring;
        htmstring.match(/<head[\s\S]*?>([\s\S]*)<\/head>[\s\S]*?<body[\s\S]*?>([\s\S]*)<\/body>/);
        var headstr = RegExp.$1;
        var bodystr = RegExp.$2;
        // 忽略掉 "<script> code here </script>", these will cause memory leak
        if (headstr && ($.trim(headstr) != "")) {
            $.each($.u.getcsssrcfromhead(headstr), function (idx, src) {
                var cssobj = {};
                cssobj.path = src;
                extcss.push(cssobj);
            });
        }
        $.each(extcss, this.proxy(function (idx, cssobj) {
            if (cssobj == null || cssobj.path == null || cssobj.path == '')
                return true; // continue;
            var absHrefUrl = $.u.absurlbymodulename(cssobj.path, clzstr);
            if ($.inArray(absHrefUrl, this.parent().modulecsses) == -1) {
                var linkstr = '<link  type="text/css" rel="stylesheet"';
                if (cssobj.id && cssobj.id != '') {
                    linkstr += ' id="' + cssobj.id + '" ';
                }
                if (cssobj.disabled && cssobj.disabled == true) {
                    linkstr += ' disabled="disabled" ';
                }
                $("head").append(linkstr + ' href="' + absHrefUrl + '"/>');
            }
        }))
        this.qid("designer").html(this._bodyurlreplace(bodystr, clzstr));
        $.each($("div[umodule]", this.qid("designer")), this.proxy(function (idx , amdiv) {
            var objinstance = $.um($(amdiv));
            $(".uui-container,.uui-box", objinstance.$).removeClass("uui-box").removeClass("uui-container");
            objinstance.$.removeClass("uui-container").addClass("uui-box");
        }));
        $(".uui-container,.uui-box", this.qid("designer")).addClass("uui-designmode");
        this.qid("designer").children().first().addClass(this._readableClazzEncode(clzstr));
        this.parent().redraggable();
        this.initsortable();
    },
    getclazzname: function () {
        //var parseresult = esprima.parse(this.jseditor.getValue(), { tolerant: true, loc: true, range: true });
        //var clzstr = "";
        //$.each(parseresult.body, this.proxy(function (idx, aseg) {
        //    if (loadedjsstring.substring(aseg.range[0], aseg.range[1]).indexOf("$.u.define") == 0) {
        //        clzstr = aseg.expression.arguments[0].value;
        //    }
        //}));
        // return clzstr;
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        if (filepath == "")
            clzstr =  "." + filepath;
        else {
            clzstr = filepath.replace(/\//g, '.');
        }
        return clzstr.substr(1, clzstr.length - 1);
    }
}, { usehtm: true });

uui.ide.myide.centermodule.widgetjs = ["../../../uui/widget/codemirror/lib/codemirror.js"
    , "../../../uui/widget/codemirror/lib/jshint.js"
    , "../../../uui/widget/codemirror/mode/xml/xml.js"
    , "../../../uui/widget/codemirror/mode/css/css.js"
    , "../../../uui/widget/codemirror/mode/javascript/javascript.js"
    , "../../../uui/widget/codemirror/mode/htmlmixed/htmlmixed.js"
    , "../../../uui/widget/codemirror/addon/hint/show-hint.js"
    , "../../../uui/widget/codemirror/addon/hint/xml-hint.js"
    , "../../../uui/widget/codemirror/addon/hint/html-hint.js"
    , "../../../uui/widget/codemirror/addon/hint/javascript-hint.js"
    , "../../../uui/widget/codemirror/addon/fold/foldcode.js"
    , "../../../uui/widget/codemirror/addon/fold/foldgutter.js"
    , "../../../uui/widget/codemirror/addon/fold/brace-fold.js"
    , "../../../uui/widget/codemirror/addon/fold/comment-fold.js"
    , "../../../uui/widget/codemirror/addon/fold/xml-fold.js"
    , "../../../uui/widget/codemirror/addon/edit/closebrackets.js"
    , "../../../uui/widget/codemirror/addon/edit/closetag.js"
    , "../../../uui/widget/codemirror/addon/selection/active-line.js"
    , "../../../uui/widget/codemirror/addon/search/match-highlighter.js"
    , "../../../uui/widget/codemirror/addon/search/searchcursor.js"
    , "../../../uui/widget/codemirror/addon/search/search.js"
    , "../../../uui/widget/codemirror/addon/dialog/dialog.js"
    , "../../../uui/widget/codemirror/addon/search/searchcursor.js"
    , "../../../uui/widget/codemirror/addon/display/fullscreen.js"
    , "../../../uui/widget/codemirror/addon/format/formatting.js"
    , "../../../uui/widget/codemirror/addon/edit/matchbrackets.js"
    , "../../../uui/widget/codemirror/addon/edit/matchtags.js"
    , "../../../uui/widget/esprima/esprima.js"
    , "../../../uui/widget/codemirror/addon/lint/lint.js"
    , "../../../uui/widget/codemirror/addon/lint/javascript-lint.js"
];
uui.ide.myide.centermodule.widgetcss = [{ path: "../../../uui/widget/codemirror/lib/codemirror.css" }
    , { path: "../../../uui/widget/codemirror/addon/hint/show-hint.css" }
    , { path: "../../../uui/widget/codemirror/addon/dialog/dialog.css" }
    , { path: "../../../uui/widget/codemirror/addon/display/fullscreen.css" }
    , { path: "../../../uui/widget/codemirror/addon/lint/lint.css" }];
uui.ide.myide.centermodule.tool = true;
uui.ide.myide.centermodule.property = true;