//@ sourceURL=uui.ide.myide.centerhtml
$.u.define('uui.ide.myide.centerhtml', null, {
    init: function (treeNode) {
        this.treeNode = treeNode;
        this.isloaded = false;
        this.loadedstring = "";
    },
    afterrender: function () {
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        this.parent().setTabLiTitle(this.$, filepath);
        $.u.ajax({
            url: $.u.config.constant.getfile,
            type: "post",
            dataType: "json",
            data: {
                "filepath": filepath
            },
            cache: false
        }, this.$).done(this.proxy(function (result, textStatus, jqXHR) {
            if (result.success) {
                this.editor = CodeMirror.fromTextArea(this.qid("editor")[0], {
                    mode: { name: "htmlmixed" },
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
                            this.autoFormat();
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
                this.editor.on("change", this.proxy(function (cm, change) {
                    if (this.isloaded) {
                        if (this.loadedstring == cm.getValue()) {
                            this._parentmodule.marksaved(this.$.parent());
                        }
                        else {
                            this._parentmodule.marksavable(this.$.parent());
                        }
                    }
                    else {
                        cm.clearHistory();
                    }
                }));
                this.editor.on("keyup", this.proxy(function (cm, keyevent) {
                    // 字母，或者是<号
                    if ((!keyevent.ctrlKey && !keyevent.altKey && (keyevent.keyCode >= 65 && keyevent.keyCode <= 90)) || (keyevent.shiftKey && keyevent.keyCode == 188)) {
                        clearTimeout(this.hintwaiting);
                        this.hintwaiting = setTimeout(this.proxy(function () {
                            CodeMirror.showHint(cm, CodeMirror.hint.html);
                        }), 500);
                    }
                }));
                this.editor.setValue(result.data);
                this.isloaded = true;
                this.loadedstring = result.data;
                setTimeout(this.proxy(this.resize), 500);
            }
            else {
                $.u.alert.error(result.reason);
            }
        })).fail(function () {
            $.u.alert.error("访问异常");
        });
    },
    resize: function () {
        if (this.editor) {
            this.editor.refresh();
        }
    },
    reload: function () {
        this.isloaded = false;
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        $.u.ajax({
            url: $.u.config.constant.getfile,
            type: "post",
            dataType: "json",
            data: {
                "filepath": filepath
            },
            cache: false
        }, this.$).done(this.proxy(function (result, textStatus, jqXHR) {
            if (result.success) {
                this.editor.setValue(result.data);
                this.isloaded = true;
                this.loadedstring = result.data;
            }
            else {
                $.u.alert.error(result.reason);
            }
        })).fail(function () {
            $.u.alert.error("访问异常");
        });
    },
    save: function () {
        var filepath = $.u.ide_getFolderPath(this.treeNode);
        $.u.ajax({
            url: $.u.config.constant.updatefile,
            type: "post",
            dataType: "json",
            data: {
                "filepath": filepath,
                "filecontent": this.editor.getValue()
            },
            async: false,
            cache: false
        }, this.$).done(this.proxy(function (result, textStatus, jqXHR) {
            if (result.success) {
                this.loadedstring = this.editor.getValue();
                return null;
            }
            else {
                return result.reason;
            }
        })).fail(function () {
            return "访问异常";
        });
    },
    autoFormat: function () {
        var cursorline = this.editor.getCursor(true);
        var range = { from: CodeMirror.Pos(this.editor.firstLine(), 0), to: CodeMirror.Pos(this.editor.lastLine()) };
        this.editor.autoFormatRange(range.from, range.to);
        this.editor.setCursor(cursorline);
        if (!this.editor.hasFocus())
            this.editor.focus();
    }
}, { usehtm: true });

uui.ide.myide.centerhtml.widgetjs = ["../../../uui/widget/codemirror/lib/codemirror.js"
    , "../../../uui/widget/codemirror/mode/xml/xml.js"
    , "../../../uui/widget/codemirror/mode/css/css.js"
    , "../../../uui/widget/codemirror/mode/javascript/javascript.js"
    , "../../../uui/widget/codemirror/mode/htmlmixed/htmlmixed.js"
    , "../../../uui/widget/codemirror/addon/hint/show-hint.js"
    , "../../../uui/widget/codemirror/addon/hint/xml-hint.js"
    , "../../../uui/widget/codemirror/addon/hint/html-hint.js"
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
    , "../../../uui/widget/codemirror/addon/edit/matchtags.js" ];
uui.ide.myide.centerhtml.widgetcss = [{ path: "../../../uui/widget/codemirror/lib/codemirror.css" }
    , { path: "../../../uui/widget/codemirror/addon/hint/show-hint.css" }
    , { path: "../../../uui/widget/codemirror/addon/dialog/dialog.css" }
    , { path: "../../../uui/widget/codemirror/addon/display/fullscreen.css" }];