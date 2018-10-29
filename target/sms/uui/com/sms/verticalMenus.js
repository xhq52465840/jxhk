//@ sourceURL=com.sms.verticalMenus
$.u.define('com.sms.verticalMenus', null, {
    init: function(options) {
        /*
         * {
         * 	urlparams:true // 菜单url是否添加当前url参数
         *  postUrlparams:{}
         * }
         */
        this._options = options || {};
    },
    afterrender: function(bodystr) {
        this.resetOptions(this._options.postUrlparams || {});
    },
    /*
     * 渲染处理配置信息
     * @params options 模块配置参数
     */
    resetOptions: function(param) {
        $.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: $.extend({
                "tokenid": $.cookie("tokenid"),
                "method": "getmenu",
                "pid": this._options.menuId
            }, param)
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.renderMenus(this.$, response.data || []);
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /*
     * 渲染菜单
     */
    renderMenus: function($container, menus) {
        var params = "";
        $container.empty();
        if (this._options.urlparams) {
            var href = window.location.href;
            params = href.substring(href.indexOf("?"), href.length)
        }

        $.each(menus, this.proxy(function(idx, menu) {
            var $ul = null,
                $li = null;
            menu.url == "#showtitle" ? $("<div class='nav-heading style_css' style='margin-top:-1px;margin-bottom:11px;'>" + menu.name + "</div>").appendTo($container) : null;
            $ul = $("<ul class='nav'></ul>").appendTo($container);
            if (menu.children && menu.children.length > 0) {
                $.each(menu.children, this.proxy(function(idx, childmenu) {
                    $li = $("<li class='" + ((this._options.selectedId ? (childmenu.name == this._options.selected && childmenu.id === this._options.selectedId) : childmenu.name == this._options.selected) ? "nav-selected" : "") + "'><a href='" + (childmenu.url ? childmenu.url + params : "#") + "' title='" + childmenu.name + "'>" + childmenu.name + "</a></li>").appendTo($ul);
                    if (childmenu.children && childmenu.children.length > 0) {
                        var $activityUl = $("<ul class='unit-acitivitytypes nav'/>").appendTo($li);
                        var addUrl = $.urlParam().id;
                        $.each(childmenu.children, this.proxy(function(k, v) {
                            if (v.type === "dt") {
                                $("<li class='" + ((this._options.selectedId ? (v.name == this._options.selected && v.id === this._options.selectedId) : v.name == this._options.selected) ? "nav-selected" : "") + "'><a href='" + (v.url ? v.url : "") + "' title='" + v.name + "'>" + v.name + "</a></li>").appendTo($activityUl);
                            } else {
                                $("<li class='" + ((this._options.selectedId ? (v.name == this._options.selected && v.id === this._options.selectedId) : v.name == this._options.selected) ? "nav-selected" : "") + "'><a qid='type" + v.type + "' href='" + (v.url ? v.url + "&id=" + addUrl : "#") + "' title='" + v.name + "'>" + v.name + "</a></li>").appendTo($activityUl);
                            }

                        }));
                    }
                }));
            } else {
                $li = $("<li class='" + ((this._options.selectedId ? (menu.name == this._options.selected && menu.id === this._options.selectedId) : menu.name == this._options.selected) ? "nav-selected" : "") + "'><a href='" + (menu.url ? menu.url + params : "#") + "' title='" + menu.name + "'>" + menu.name + "</a></li>").appendTo($ul);
            }

        }));

    },
    destroy: function() {
        this._super();
        this.$.remove();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.verticalMenus.widgetjs = ["../../uui/widget/jqurl/jqurl.js",
    "../../uui/widget/spin/spin.js",
    "../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../uui/widget/ajax/layoutajax.js"
];
com.sms.verticalMenus.widgetcss = [{
    path: ''
}];