//@ sourceURL=com.sms.applicationHeader
$.u.define('com.sms.applicationHeader', null, {
    init: function(options) {
        this._options = options || this._options;
        com.sms.applicationHeader.i18n.tag = com.sms.applicationHeader.i18n[$.cookie('locale') || 'zh'];
    },
    afterrender: function(bodystr) {
        // add by wayne in 2015-02-16
        if ($.cookie("mystyle") && $.cookie("mystyle") == 1) {
            $("#main").prop("disabled", true);
        } else {
            $("#main").prop("disabled", false);
        }
        // add end    	
        this.email="";
        this.telephoneNumber="";
        this.activityDialog = null;
        this.unitDialog = null;
        this.logo = this.qid("logo");
        this.noticeLi = this.qid("noticeLi");
        this.noticenum = this.qid("noticenum");
        this.searchAds = this.qid("quicksearch");
        this.menuStruct = {
            //"APP":{items:[],container:this.qid("nav-application")},   // 网站导航容器
            "NAV": {
                items: [],
                container: this.qid("nav-menu")
            }, // 左侧菜单容器
            "HELP": {
                items: [],
                container: this.qid("nav-help")
            }, // 帮助菜单容器
            "SYS": {
                items: [],
                container: this.qid("nav-sys")
            }, // 系统设置菜单容器
            "USER": {
                items: [],
                container: this.qid("nav-user")
            }, // 个人中心菜单容器
        };

        this.noticeLi.on("click", this.proxy(this.on_noticeLi_click));
        this.searchAds.on("keypress", this.proxy(this.on_searchAds_keypress));
        this.qid("button-create-activity").on("click", this.proxy(this.on_createActivityButton_click));
        this.qid("button-navigation").click(this.proxy(this.on_navigationButton_click));
        this.menuStruct.NAV.container.on("click", "a.dropdown-toggle", this.proxy(this.on_rootMenu_click));
        this.qid("dropdown-user").off("click").on("click", this.proxy(this.on_userMenu_click));
        this.qid("dropdown-sys").off("click").on("click", this.proxy(this.on_sysMenu_click));
        this.qid("dataImpt").off("click").on("click", this.proxy(this.dataImpt));
        this.qid("btn_search").unbind("click").click(this.proxy(this.on_btnSearch_click));
        this.qid("nav-language").on("click", ".change-language", this.proxy(this.on_language_click));

        this.navigation();
        this.resetOptions(this._options);
        this.loadUserAvatar($.cookie("userid"));
        /**
         * @title 机长报告
         */
        this.air_report=this.qid("btn_air_report");
        this.air_report.click(this.proxy(this.airReport));
        // add by wayne ,公告
        /*$.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type: "post",
            data: {
                method: "stdcomponent.getbysearch",
                dataobject: "bulletin"
            }
        }).done(this.proxy(function (response) {
            if (response.success) {
                var dt = response.data.aaData[0];
                if(dt != null){
                	if (dt.visibility == "PUBLIC" || ($.cookie("uskyuser") && dt.visibility == "PRIVATE")) {
                		this.qid("bulletin").html(dt.content);
                		this.qid("bulletin").show();
                	}
                }
            } 
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));*/

        // 加载用户默认列
      //  if ($.cookie("userid") && $.cookie("uskyuser") && !$.jStorage.get("userColumns")) {
            $.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: {
                    "method": "stdcomponent.getbyid",
                    "dataobject": "user",
                    "dataobjectid": parseInt($.cookie("userid")),
                    "tokenid": $.cookie("tokenid"),
                },
                dataType: "json"
            }).done(this.proxy(function(response) {
            	this.email=response.data.email;
            	this.telephoneNumber=response.data.telephoneNumber;
                try {
                    var userColumns = $.parseJSON(response.data.columns);
                    if (userColumns.length === 0) {
                        $.jStorage.deleteKey("userColumns");
                    } else {
                        $.jStorage.set("userColumns", userColumns, {
                            TTL: 1000 * 60
                        });
                    }
                } catch (e) {

                }
            }));
       // }

        // 站内通知
        if ($.cookie("tokenid")) {
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                cache: false,
                type: "post",
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "stdcomponent.getbysearch",
                    "dataobject": "message",
                    "rule": JSON.stringify([
                        [{
                            "key": "receiver",
                            "value": parseInt($.cookie("userid"))
                        }],
                        [{
                            "key": "checked",
                            "value": false
                        }]
                    ]),
                    "search": "",
                    "columns": JSON.stringify([{
                        "data": "sendTime"
                    }]),
                    "order": JSON.stringify([{
                        "column": 0,
                        "dir": "desc"
                    }])
                }
            }).done(this.proxy(function(data) {
                if (data.success) {
                    this.noticenum.text(data.data.iTotalDisplayRecords == 0 ? "0" : data.data.iTotalDisplayRecords);
                }
            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

            }));
        }
        // add end
        this.qid("btn_headerAnonymityReport").click(this.proxy(this.on_headerAnonymityReport));
    },
    on_headerAnonymityReport: function(e) {
    	var json=JSON.stringify({email:this.email,telephoneNumber:this.telephoneNumber});
        var url = $.cookie('locale') === 'en' ? 'ViewStaffReport_EN.html' : 'ViewStaffReport.html';
        window.open(this.getabsurl(url + '?time=' + (new Date()).getTime())+'&&json='+json, 'newwindow', 'MultiLine=true,height=650, width=800, top=100, left=100, toolbar=no, menubar=no, scrollbars=yes, resizable=no, location=no, status=yes');
    },
    /**
     * @title 机长报告
     */
    airReport:function(e){
    	e.preventDefault();
    	var json=JSON.stringify({email:this.email,telephoneNumber:this.telephoneNumber});
        var url = $.cookie('locale') === 'en' ? 'captainReport_EN.html' : 'captainReport.html';
        window.open(this.getabsurl(url + '?time=' + (new Date()).getTime())+'&&json='+json, 'newwindow', 'MultiLine=true,height=500, width=800, top=100, left=100, toolbar=no, menubar=no, scrollbars=yes, resizable=no, location=no, status=yes');
    },
    on_noticeLi_click: function(e) {
        e.preventDefault();
        if (this.noDialog == undefined) {
            $.u.load('com.sms.notice.notice');
            this.noDialog = new com.sms.notice.notice($("div[umid='noDialog']", this.$), {
                "after": this.proxy(function(data) {
                    this.noticenum.text(data == 0 ? "0" : data);
                })
            });
        }
        this.noDialog.open();
    },
    on_btnSearch_click: function(e) {
        var ads = $.trim(this.searchAds.val());
        if (ads) {
            window.location.href = this.getabsurl("safelib/ViewSearchList.html?wd=" + escape(ads));
        }
    },
    on_searchAds_keypress: function(e) {
        var $this = $(e.currentTarget);
        if (e.which == 13 && $this.val()) {
            window.location.href = this.getabsurl("safelib/ViewSearchList.html?wd=" + escape($this.val()));
            return false;
        }
    },
    on_createActivityButton_click: function(e) {
        if (this.activityDialog == null) {
            $.u.load("com.sms.activityinfo.create");
            this.activityDialog = new com.sms.activityinfo.create($("div[umid=activityDialog]", this.$));
        }
        this.activityDialog.open();
    },
    on_navigationButton_click: function(e) {
        e.preventDefault();
        var $a = $(e.currentTarget);
        $.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getNavigation"
            }
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.qid("nav-application").empty();
                response.data && $.each(response.data, this.proxy(function(idx, nav) {
                	
                    if (location.href.indexOf(nav.url) > -1) {
                        $('<li><a href="' + nav.url + '"><span class="glyphicon glyphicon-star"></span>' + nav.name + '</a></li>').appendTo(this.qid("nav-application"));
                    } else {
                        $('<li><a href="' + nav.url + '">' + nav.name + '</a></li>').appendTo(this.qid("nav-application"));
                    }
                }));
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    on_rootMenu_click: function(e) {
        e.preventDefault();
        var $a = $(e.currentTarget),
            $ul = $a.next();
        var $parent = $a.parent();
        if (!$ul.is(":visible")) {
            $ul.addClass("hidden");
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getmenu",
                    "pid": $a.attr("mid")
                }
            }, $a, {
                size: 2,
                backgroundColor: "#fff"
            }).done(this.proxy(function(response) {
                if (response.success) {
                    this.renderMenus($a.next(), "childmenu", response.data);
                    if (!$parent.hasClass('open')) {
                        $parent.addClass('open');
                    }
                    $ul.removeClass("hidden");
                }
            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

            }));
        }
    },
    on_userMenu_click: function(e) {
        //    	e.preventDefault();
        var $a = $(e.currentTarget),
            $ul = $a.next();
        var $parent = $a.parent();
        setTimeout(function() {
            if (!$parent.hasClass('open')) {
                $parent.addClass('open');
            }
        }, 100);
    },
    on_sysMenu_click: function(e) {
        //    	e.preventDefault();
        var $a = $(e.currentTarget),
            $ul = $a.next();
        var $parent = $a.parent();
        setTimeout(function() {
            if (!$parent.hasClass('open')) {
                $parent.addClass('open');
            }
        }, 100);
    },
    /*
     * 渲染处理配置信息
     * @params options 模块配置参数
     */
    resetOptions: function(options) {
        if (window.location.href.indexOf("/sms/uui/com/sms/Logout.html") < 0) {
            this._options = options;
            // 渲染Logo数据
            this.renderLogo();

            // if($.cookie("tokenid")){
            $.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getmenu"
                }
            }).done(this.proxy(function(response) {
                if (response.success) {
                    this.qid("top-container").removeClass("hidden");
                    $.each(response.data, this.proxy(function(idx, menu) {
                        if (this.menuStruct[menu.type]) {
                            this.menuStruct[menu.type].items.push(menu);
                        }
                    }));
                    $.each(this.menuStruct, this.proxy(function(idx, menu) {
                        if (menu.items.length > 0) {
                            this.renderMenus(menu.container, "menu", menu.items);
                        } else {
                            menu.container.closest("li.dropdown").remove();
                        }
                    }));
                }
            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

            }));
            // }
        }
    },
    /*
     * 渲染系统logo区域
     */
    renderLogo: function() {
        if ($.cookie("tokenid")) {
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                "data": {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getSiteFlag"
                }
            }).done(this.proxy(function(result) {
                if (result.success) {
                    if (this._options && this._options.logo) {
                        this.logo.addClass("navbar-brand-image")
                            .attr("href", this.getabsurl(this._options.logo.url))
                            .html("<img src='" + this._options.logo.img + "'></img><div style='contet:\"\";display:table;clear:both;'></div>");
                        //.html("<img style='padding:5px 0px;max-height:27px;' src='" + this._options.logo.img + "'></img><span>"+(result.data.flag=="NO"?"":($.u.config.logo?$.u.config.logo:"安全网"))+"</span><div style='contet:\"\";display:table;clear:both;'></div>");

                    }
                }
            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

            }));
        } else {
            if (this._options && this._options.logo) {
                this.logo.addClass("navbar-brand-image")
                    .attr("href", this.getabsurl(this._options.logo.url))
                    .html("<img src='" + this._options.logo.img + "'></img><div style='contet:\"\";display:table;clear:both;'></div>");
            }
        }
    },
    /*
     * 渲染菜单
     * @param $container 容器对象
     * @param type （menu或childmenu）标识根目录或子节点
     * @param menus 菜单数据
     */
    renderMenus: function($container, type, menus) {
        $container.empty();
        if (type == "menu") { // 容器为ul时为迭代根目录(面板、安监机构、安全信息、监控...)
            $.each(menus, this.proxy(function(idx, menu) {
            	    var re=/[\u4e00-\u9fa5]/;
            	    var   fontsize="";
            	 	  if (re.test(menu.name)){
            	 		 fontsize="16px";
            	 	  }else{
            	 		 fontsize="11px";
            	 	  }
                var $li = menu.url == "#divider" ?
                    $("<li class='divider' />").appendTo($container) :
                    $("<li class='dropdown' title=" + menu.name + "><a href='" + (menu.url || "#") + "' mid='" + menu.id + "'style=font-size:"+fontsize+">" + menu.name + "</a></li").appendTo($container),
                    $a = $li.children("a");
                if (menu.url == "#havechild") {
                    $a.attr({
                        "class": "dropdown-toggle",
                        "data-toggle": "dropdown"
                    });
                    $("<b class='caret'></b>").appendTo($a);
                    $("<ul class='dropdown-menu hidden'/>").appendTo($li);
                }
            }));
        } else if (type == "childmenu") { // 容器为li时为迭代子节点
            $.each(menus, this.proxy(function(idx, menu) {
                if (menu.url == "#divider") {
                    $("<li class='divider' />").appendTo($container);
                } else {
                    if (menu.children.length === 0) {
                        $("<li title=" + menu.name + " class='dropdown'><a href='" + (menu.url || "#") + "'>" + menu.name + "</a></li>").appendTo($container);
                    } else {
                        $("<li class='dropdown' title=" + menu.name + " style='margin:0 0;border-top: 1px solid #fff;'><strong style='padding:3px 10px;'>" + menu.name + "</strong></li>").appendTo($container);
                    }
                    menu.children && $.each(menu.children, this.proxy(function(k, v) {
                        var title = "";
                        if (v.type == "unit") {
                            title = v.name + "(" + v.code + ")";
                            $("<li title=" + title + "><a href='" + (v.url || "#") + "'><img src='" + v.avatar + "' width='16px' height='16px'></img>&nbsp;" + title + "</a></li>").appendTo($container);
                        } else if (v.type == "activity") {
                            title = v.code + "-" + v.count + "&nbsp;" + v.name;
                            $("<li title=" + title + "><a href='" + (v.url || "#") + "'><img src='" + this.getabsurl(v.activityTypeUrl) + "' width='16px' height='16px'></img>&nbsp;" + title + "</a></li>").appendTo($container);
                        } else if (v.type == "filtermanager") {
                            title = v.name;
                            $("<li title=" + title + "><a href='" + (v.url || "#") + "'>" + title + "</a></li>").appendTo($container);
                        } else {
                            title = v.name;
                            $("<li title=" + title + "><a href='" + (v.url || "#") + "'>" + title + "</a></li>").appendTo($container);
                        }
                    }));
                }
            }));
            $('li', $container).first().css("margin", "");
        }

    },
    /**
     * @title 加载当前用户图像
     * @params userid 用户id
     * 
     */
    loadUserAvatar: function(userid) {
        if (window.location.href.indexOf("/sms/uui/com/sms/Logout.html") < 0) {
            if ($.cookie("tokenid")) {
                $.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    dataType: "json",
                    cache: false,
                    "data": {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbyid",
                        "dataobject": "user",
                        "dataobjectid": userid
                    }
                }).done(this.proxy(function(response) {
                    if (response.success) {
                        var currUser = {};
                        try{
                            if($.cookie("uskyuser")){
                                currUser = $.parseJSON($.cookie("uskyuser"));
                            }
                        }catch(e){}
                        $.extend(true, currUser, {
                            "avatarUrl": response.data.avatarUrl,
                            "username": response.data.username,
                            "fullname": response.data.fullname
                        });
                        $.cookie("uskyuser", JSON.stringify(currUser), {
                            path: "/"
                        });
                        this.qid("img-user").attr("src", response.data.avatarUrl);
                        this.qid("user_name").text(response.data.fullname);
                    }
                })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(jqXHR, errorStatus) {}));
            } else {
                this.qid("button-create-activity").add(this.qid("nav-sys").closest("li")).remove();
                this.qid("img-user").parent().text("登录").removeClass("dropdown-toggle-img").unbind("click").click(this.proxy(function() {
                    window.location.href = this.getabsurl("Login.html");
                    return false;
                }));
            }
        } else { // 注销界面
            this.qid("button-create-activity").add(this.qid("nav-sys").closest("li")).remove();
            this.qid("img-user").parent().text("登录").removeClass("dropdown-toggle-img").unbind("click").click(this.proxy(function() {
                window.location.href = this.getabsurl("Login.html");
                return false;
            }));
        }
    },
    navigation: function() {
        if ($.cookie("tokenid")) {
            $.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                async: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "getNavigation"
                }
            }).done(this.proxy(function(response) {
                if (response.success) {
                    this.qid("nav-application").empty();
                    response.data && $.each(response.data, this.proxy(function(idx, nav) {
                        var nowUrl = window.location.protocol + "//" + window.location.host + "/";
                        if (nav.url.indexOf(nowUrl) > -1) {
                            $.u.config.logo = nav.name;
                        }
                    }));
                }
            })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

            }));
        }
    },
    dataImpt: function(e) {
        e.preventDefault();
        if (this.imptDialog === undefined) {
            $.u.load('com.sms.safelib.uploadDialog');
            this.imptDialog = new com.sms.safelib.uploadDialog($("div[umid='imptDialog']", this.$));
            this.imptDialog.override({
                refresh: this.proxy(function(data) {
                    if (data.success) {
                        $.u.alert.success("上传成功");
                    } else {
                        $.u.alert.error(data.reason);
                    }
                })
            });
        }
        this.imptDialog.open({
            "tokenid": $.cookie("tokenid"),
            "method": "importActivitiesFromExcel"
        });
    },

    /**
     * @title 切换语言
     * @param {event object} e - 鼠标对象
     */
    on_language_click: function(e){
        e.preventDefault();
        $.cookie('locale', $(e.currentTarget).attr('data-language'), {
            path: '/'
        });
        window.location.reload();
    },
    destroy: function() {
        var retsel = this._super();
        this.$.remove();
        return retsel;
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.applicationHeader.widgetjs = ['../../uui/widget/validation/jquery.validate.js',
    "../../uui/widget/spin/spin.js",
    "../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../uui/widget/ajax/layoutajax.js"
];
com.sms.applicationHeader.widgetcss = [{
    path: ''
}];
com.sms.applicationHeader.moduleconfig = [{
    title: "LOGO属性",
    list: [{
        key: "logo.img",
        title: "logo图片",
        def: "/sms/uui/img/logo/logosafe.png",
        type: "text"
    }, {
        key: "logo.text",
        title: "值",
        def: "上海吉祥航空SMS系统1",
        type: "text"
    }, {
        key: "logo.url",
        title: "路径",
        def: "dash/DashBoard.html",
        type: "text"
    }]
}, {
    title: "检索属性",
    list: [{
        key: "search.title",
        title: "名称",
        def: "快速检索",
        type: "text"
    }]
}];