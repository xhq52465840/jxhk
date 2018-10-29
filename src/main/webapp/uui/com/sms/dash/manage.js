//@ sourceURL=com.sms.dash.manage
$.u.define('com.sms.dash.manage', null, {
    init: function (managetype) {
        //初始化第一次传入
        this._managetype = managetype || "search";        
    },
    afterrender: function () {
        this.qid("leftnav").off("click", "li");
        this.qid("leftnav").on("click", "li", this.proxy(function (e) {
            var $li = $(e.currentTarget);
            $(".nav-selected", this.qid("leftnav")).removeClass("nav-selected");
            $li.addClass("nav-selected");
            var clazzget = this.getManageClazz($li.attr("real"));
            var clz = $.u.load(clazzget);
            var clzobj = new clz();
            clzobj.target($("div[umid='managecontent']", this.$));
            clzobj.parent(this);
        }));
        // 最先展示最后一个
        this.qid("leftnav").children("li[real='" + this._managetype + "']").trigger("click");
        this.qid("btn_create").unbind("click");
        this.qid("btn_create").click(this.proxy(function (e) {            
            // 新建面板
            var dialog = $.um($("<div umid='" + $.u.uniqid() + "' umodule='com.sms.dash.dashDialog'/>"));//内存创建
            dialog.parent(this.managecontent); // 来自clzobj.target($("div[umid='managecontent']", this.$));
            dialog.override({
                on_submit: this.proxy(function () {
                    this.managecontent.dataTable.fnDraw();
                })
            });
            dialog.open();
        }));
        this.qid("btn_default").unbind("click");
        this.qid("btn_default").click(this.proxy(function (e) {
            // TODO : 默认
        }));
    },
    resize: function () {

    },
    getManageClazz: function (type) {
        var currentManageClz = null;
        // 只是刷新时候的初始化
        if (type == "favourites") {
            currentManageClz = "com.sms.dash.manageFavourites";
        } else if (type == "my") {
            currentManageClz = "com.sms.dash.manageMy";
        } else if (type == "popular") {
            currentManageClz = "com.sms.dash.managePopular";
        } else {
            currentManageClz = "com.sms.dash.manageSearch";
        }
        return currentManageClz;
    }
}, { usehtm: true, usei18n: true });


com.sms.dash.manage.widgetjs = [];
com.sms.dash.manage.widgetcss = [];
