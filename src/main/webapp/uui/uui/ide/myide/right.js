//@ sourceURL=uui.ide.myide.right
$.u.define('uui.ide.myide.right', null, {
    afterrender: function () {
        this.qid("properties").hide();
        this.qid("info").hide();
        this.qid("update").hide();
        this.qid("del").hide();
        this.qid("info").text("");
        this.__temphtml = this.qid("properties").html();
        this.__currenttype = null;
        this.__currentsel = null;

        this.qid("update").unbind("click");
        this.qid("update").click(this.proxy(this.on_update_click));
        this.qid("del").unbind("click");
        this.qid("del").click(this.proxy(this.on_del_click));
    },
    /**
    * sel :选择器
    * config : [{ title : "组1", list : [{key:"v1.v2", title:"属性1", def:"1234", type:"text"},{}]},{}]
    */
    showpanel: function (sel) {
        var config = null, option = null;
        if (this.qid("properties").hasClass("ui-accordion")) {
            this.qid("properties").accordion("destroy");
            this.qid("properties").html(this.__temphtml);
            this.qid("info").text("");
        }
        var infotagname = "[" + sel.prop("tagName") + "]";
        // 这段是样式的
        this.__currentsel = sel;
        var selstyle = this.__currentsel.attr("style");
        if (selstyle && selstyle != "") {
            $(".uui-htmlstyle textarea", this.qid("properties")).val(selstyle.replace(/;/g, ";\n"));
        }
        var selclass = this.__currentsel.attr("class");
        if (selclass && selclass != "") {
            $(".uui-htmlclass textarea", this.qid("properties")).val(selclass.replace(/ /g, "\n"));
        }
        // 这段判断是那种类型构造config
        this.__currenttype = "default";
        if (this.__currentsel.hasClass("uui-header")) {
            this.__currenttype = "header";
            config = [{ "title": "内容属性", "list": [{ "key": "", "title": "显示文本", "type": "text", "def": this.__currentsel.text() }] }];
            this.qid("info").text("标题" + infotagname);
        } else if (this.__currentsel.hasClass("__uskymoduleobject")) {
            this.__currenttype = "module";
            config = this.__currentsel.um().getclazz().moduleconfig || [];
            option = this.__currentsel.um()._options || {};
            var confignew = [{ "title": "通用模块属性", "list": [{ "key": "", "title": "umid", "type": "text", "def": this.__currentsel.attr("umid") }] }];
            config = confignew.concat(config);
            this.qid("info").text("模块" + infotagname);
        } else {
            this.qid("info").text(infotagname);
        }
        this.qid("info").show();
        this.qid("update").show();
        this.qid("del").show();
        this.qid("properties").show();
        if (config) {
            option = option || {};
            $.each(config, this.proxy(function (idx, acfg) {
                this.qid("properties").append("<h3><a href='#'>" + acfg.title + "</a></h3><div></div>");
                var $divitems = this.qid("properties").children().last();
                $.each(acfg.list, this.proxy(function (idx1, aitem) {
                    var realvalue = null;
                    try {
                        if (aitem.key && aitem.key != "") {
                            eval("realvalue = option." + aitem.key);
                        }
                    }
                    catch (e) { };
                    if (!realvalue) {
                        realvalue = aitem.def;
                    }
                    var adivitem = null;
                    // TODO : 类型分类判断
                    if (aitem.type == "text") {
                        adivitem = $("<div><span class='uui-propertylabel'>" + aitem.title + "：</span><span class='uui-propertyvalue'><input type='text' value='" + realvalue + "'/></span></div>").appendTo($divitems);
                    } else if (aitem.type == "textarea") {
                        adivitem = $("<div><div class='uui-propertylabel'>" + aitem.title + "：</div><div class='uui-propertyvalue'><textarea>" + realvalue + "</textarea></div></div>").appendTo($divitems);
                    } else if (aitem.type == "function") {
                        adivitem = $("<div><div class='uui-propertylabel'>" + aitem.title + "（\"this.\"前缀--对象方法/无--全局方法）：</div><div class='uui-propertyvalue'><input type='text' value='" + realvalue + "'/></div></div>").appendTo($divitems);
                    } else if (aitem.type == "script") {
                        adivitem = $("<div><div class='uui-propertylabel'>" + aitem.title + "（慎重！必须很了解本对象）：</div><div class='uui-propertyvalue'><textarea>" + realvalue + "</textarea></div></div>").appendTo($divitems);
                    }
                    if (adivitem) {
                        $(".uui-propertyvalue", adivitem).data("uui-property", aitem);
                    }
                }));
            }));
        }
        this.qid("properties").accordion({ heightStyle: "content", collapsible: false, active: 0 });
    },
    on_update_click: function (e) {
        // 先是styles里的
        var selstyle = $(".uui-htmlstyle textarea", this.qid("properties")).val().replace(/;\n/g, ";");
        if (selstyle && selstyle != "") {
            this.__currentsel.attr("style", selstyle);
        }
        var selclass = $(".uui-htmlclass textarea", this.qid("properties")).val().replace(/\n/g, " ");
        if (selclass && selclass != "") {
            this.__currentsel.attr("class", selclass);
        }
        // TODO : 再是其他类型的
        if (this.__currenttype == "header") {
            this.__currentsel.text($(".uui-propertyvalue input", this.qid("properties")).val());
        } else if (this.__currenttype == "module") {
            var optionsnew = {}, newumid = null;
            $.each($(".uui-propertyvalue", this.qid("properties")), function (idx, aprop) {
                var $aprop = $(aprop);
                if (!$aprop.hasClass("uui-htmlstyle") && !$aprop.hasClass("uui-htmlclass")) {                    
                    var propsprop = $aprop.data("uui-property");
                    if (propsprop.title == "umid") {
                        newumid = $("input", $aprop).val();
                    }
                    else {
                        var valtmp = null;
                        // TODO: 类型分类判断
                        if (propsprop.type == "text") {
                            valtmp = $("input", $aprop).val();
                        } else if (propsprop.type == "textarea") {
                            valtmp = $("textarea", $aprop).val();
                        } else if (propsprop.type == "function") {
                            valtmp = $("input", $aprop).val();
                        } else if (propsprop.type == "script") {
                            valtmp = $("textarea", $aprop).val();
                        }
                        $.u.assign(optionsnew, propsprop.key, valtmp);
                    }
                }
            });
            if ($("div[umid=" + newumid + "]", this._parentmodule.qid("center")).length > 1) {
                alert("umid[" + newumid + "]已被占用");
                return false;
            }
            var selraw = this.__currentsel.um().destroy();
            selraw.attr("umid", newumid);
            this.__currentsel = $.um(selraw, optionsnew).$;
            this._parentmodule.initsortable();
            this.__currentsel.addClass("uui-heighlighted");
        }
        //this._parentmodule.qid("instance").trigger("click");
        this.parent().center.activeTabPreview();
    },
    on_del_click: function (e) {
        if (this.qid("properties").hasClass("ui-accordion")) {
            this.qid("properties").accordion("destroy");
            this.qid("properties").html(this.__temphtml);
        }
        this.qid("properties").hide();
        this.qid("info").hide();
        this.qid("update").hide();
        this.qid("del").hide();
        this.qid("info").text("");

        if (this.__currentsel.hasClass("__uskymoduleobject")) {
            var selraw = this.__currentsel.um().destroy();
            selraw.remove();
        }
        else {
            if (this.__currentsel.hasClass("uui-container")) {
                this.__currentsel = this.__currentsel.closest("div.row");
            }
            $.each($(".__uskymoduleobject.uui-box", this.__currentsel), function (idx, amodulesel) {
                $(amodulesel).um().destroy();
            });
            this.__currentsel.remove();
        }
        this.__currenttype = "default";
        this.__currentsel = null;
        //this._parentmodule.qid("instance").trigger("click");
        this.parent().center.activeTabPreview();
    }
}, { usehtm: true });

uui.ide.myide.right.widgetjs = [];
uui.ide.myide.right.widgetcss = [];