//@ sourceURL=com.sms.filter.manage
$.u.define('com.sms.filter.manage', null, {
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

    },
    resize: function () {

    },
    getManageClazz: function (type) {
        var currentManageClz = null;
        // 只是刷新时候的初始化
        if (type == "favourites") {
            currentManageClz = "com.sms.filter.manageFavourites";
        } else if (type == "my") {
            currentManageClz = "com.sms.filter.manageMy";
        } else if (type == "popular") {
            currentManageClz = "com.sms.filter.managePopular";
        } else {
            currentManageClz = "com.sms.filter.manageSearch";
        }
        return currentManageClz;
    }
}, { usehtm: true, usei18n: true });


com.sms.filter.manage.widgetjs = [];
com.sms.filter.manage.widgetcss = [];
