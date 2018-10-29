//@ sourceURL=com.sms.search.detail
$.u.define('com.sms.search.detail', null, {
    init: function(option) {
        this._options = option || {};
        this.data = {};
        this.actionTemplate = '<button class="btn btn-default btn-sm" data-action="#{action}" data-review="#{review}" data-screen="#{screen}">#{name}</button>'; // 流程操作按钮模板
        this.urlparam = {};
        this._activity = null;
    },
    afterrender: function(bodystr) {
        this.summary = this.qid("summary"); // 主题
        this.unitAvatar = this.qid("unit-avatar"); // 机构头像
        this.unitName = this.qid("unit-name"); // 机构名称
        this.unitCode = this.qid("unit-code"); // 信息关键字
        this.toolbar = this.qid("toolbar"); // 普通按钮容器
        this.actions = this.qid("toolbar-actions"); // 流程操作容器
        this.leftColumns = this.qid("left-column"); // 左侧组件容器
        this.rightColumns = this.qid("right-column"); // 右侧组件容器
        this.comps = {}; // 当前页面组件容器
        /*this.exportPDF=this.qid("exportPDF");
        this.exportPDF.off("click").on("click",this.proxy(this.exportpdf));*/
        if (this._options.singlePage === true) {
            this.qid("page-header").css({
                "background-color": "#f5f5f5",
                "border-bottom": "1px solid #ccc"
            });
        }

        // 获取数据
        if (window.location.href.indexOf("com/sms/search/activity.html") > -1) {
            this.reloadData();
        }

        // 流程状态切换按钮事件
        this.actions.off("click", "button").on("click", "button", this.proxy(this._on_action_click));

        // 绑定模块的标题点击事件
        this.qid("detail").off("click", "div.module-heading>h2").on("click", "div.module-heading>h2", this.proxy(this._on_moduletitle_click));

        // 绑定模块标题的鼠标移入移出事件
        this.qid("detail").off("mouseenter mouseleave", "div.module-heading>h2").on("mouseenter mouseleave", "div.module-heading>h2", this.proxy(this._on_moduletitle_toggle));

        // 绑定快捷操作事件
        this.toolbar.off("click", "button.quicktrigger").on("click", "button.quicktrigger", this.proxy(this._on_quickTrigger_click));
    },
    exportpdf:function(e){
    	var form = $("<form/>");
 		var actionstr=$.u.config.constant.smsqueryserver+"?method=exportActivityToPdf&tokenid="+$.cookie("tokenid")+"&activity="+this.urlparam.activityId;
    form.attr({
        'style': 'display:none',
        'method': 'post',
        'target': '_blank',
        'action': actionstr
    });  
    form.appendTo('body').submit().remove();
    },
    /**
     * @title 快捷操作按钮
     * @param e {object} 鼠标对象
     * @return void
     */
    _on_quickTrigger_click: function(e) {
        var $this = $(e.currentTarget),
            module = $this.attr("data-module");
        if(module){
        	 if (!this.comps[module]) {
                 var cls = $.u.load(module);
                 this.comps[module] = new cls($("<div umid='" + module + "'/>").prependTo(this.$));
                 this.comps[module].override({
                     "refresh": this.proxy(this.reloadData)
                 });
             }
             this.comps[module].quickTrigger && this.comps[module].quickTrigger(this.urlparam.activityId, this._activity);
        }else{
        	this.exportpdf();
        }
       
    },
    /**
     * @title 流程状态按钮事件
     * @param e {object} 鼠标对象
     * @return void
     */
    _on_action_click: function(e) {
        var $this = $(e.currentTarget),
            action = $this.attr("data-action"),
            screen = $this.attr("data-screen"),
            review = $this.attr("data-review");
        if (!screen) {
            if (!review) {
                var clz = $.u.load("com.sms.common.confirm");
                var confirm = new clz({
                    "buttons": {
                        "ok": {
                            "click": this.proxy(function() {
                                this._doAction(action, confirm.confirmDialog.parent(), null, function() {
                                    confirm.confirmDialog.dialog("close");
                                });
                            })
                        }
                    }
                });
            } else if (review === "true") {
                this.selectAjax(action,review);
            }
        } else if (screen) {
            if (!review) {
                this.workflowform && this.workflowform.destroy && this.workflowform.destroy();
                $.u.load("com.sms.activityinfo.edit");
                this.workflowform = new com.sms.activityinfo.edit($("div[umid=workflowform]",this.$),{"activity":this.urlparam.activityId,"screen":screen});
                this.workflowform.override({"refresh":this.proxy(function(){
                    this._doAction(action,$this);
                })});
                this.workflowform.open();
            } else if (review === "true") {
                this.workflowform && this.workflowform.destroy && this.workflowform.destroy();
                $.u.load("com.sms.activityinfo.edit");
                this.workflowform = new com.sms.activityinfo.edit($("div[umid=workflowform]",this.$),{"activity":this.urlparam.activityId,"screen":screen});
                this.workflowform.override({"refresh":this.proxy(function(){
                    this.selectAjax(action,review);
                    // this._doAction(action,$this);
                })});
                this.workflowform.open();
               

            }
        }
    },
    selectAjax: function(action,review) {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "dataobject": "activity",
                "method": "getNextStepProcessors",
                "action": action
            }
        }, this.$, {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
                var lineMan = {};
                var line = {};
                lineMan.lines = [];
                if(response.data){
                    for (var sProp in response.data){
                    line = {
                                id: sProp,
                                name: response.data[sProp].pathName,
                                man: []
                            };
                        for (var i = 0; i < response.data[sProp].users.length; i++) {
                            line.man.push({
                                id: response.data[sProp].users[i].id,
                                name: response.data[sProp].users[i].fullname
                            });
                        }
                    lineMan.lines.push(line);

                    }

                }
                this.selectManWidget && this.selectManWidget.destroy && this.selectManWidget.destroy();
                $.u.load("com.sms.activityinfo.selectMan");
                this.selectManWidget = new com.sms.activityinfo.selectMan($("div[umid=selectMan]", this.$), {
                    "activity": this.urlparam.activityId,
                    "num": lineMan
                });
                this.selectManWidget.override({
                    "refresh": this.proxy(function(userIds) {
                        var obj = userIds;
                        this._doAction(action, this.e, obj);
                    })
                });
                this.selectManWidget.open(review);
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title 内容块标题点击事件
     * @param e
     * @return void
     */
    _on_moduletitle_click: function(e) {
        var $span = $('span', $(e.currentTarget));
        var $h = $(e.currentTarget);
        if ($span.hasClass("fa-chevron-down")) {
            $span.removeClass("fa-chevron-down").addClass("fa-chevron-right");
        } else {
            $span.removeClass("fa-chevron-right").addClass("fa-chevron-down");
        }
        $h.parent().siblings().toggle();
    },
    /**
     * @title 内容块标题鼠标移入移出事件
     * @param e
     * @return void
     */
    _on_moduletitle_toggle: function(e) {
        var $span = $('span', $(e.currentTarget));
        if (!$span.hasClass("fa-chevron-right")) {
            $span.css("visibility", $span.css("visibility") == "hidden" ? "visible" : "hidden");
        }
    },
    /**
     * @title 通过配置加载对应的module
     * @param {object} config 配置参数
     * @return void
     */
    _drawModule: function(config) {
        var $target = null,
            clazz = null,
            option = {};

        this._destroyModule();
        if (config) {
            config.operations && $.each(config.operations, this.proxy(function(idx, button) {
                if (config.release) {
                    if (button.name !== 'release') {
                        $("<button class='btn btn-default btn-sm quicktrigger' data-module='" + button.module + "'><i class='fa " + button.icon + "'></i>&nbsp;" + com.sms.search.detail.i18n[button.name] + "</button>").appendTo(this.toolbar);
                    }
                } else {
                    if (button.name !== 'unRelease') {
                        $("<button class='btn btn-default btn-sm quicktrigger' data-module='" + button.module + "'><i class='fa " + button.icon + "'></i>&nbsp;" + com.sms.search.detail.i18n[button.name] + "</button>").appendTo(this.toolbar);
                    }
                }
            }));
            config.left && $.each(config.left, this.proxy(function(idx, comp) {
                clazz = $.u.load(comp.key);
                if (comp.key == "com.sms.detailmodule.base") {
                    option = comp;
                    this._activity = comp.activity; // 指定全局activity对象数据
                    this._reloadTopInfo(comp.activity);
                } else {
                    option = $.extend(true, {}, comp, {
                        "activity": this.urlparam.activityId,
                        "statusCategory": config.statusCategory,
                        "editable": comp.editable
                    });
                }
                this.comps[comp.key] = new clazz($("<div umid='leftmodule" + idx + "'/>").appendTo(this.leftColumns), option);
            }));

            config.right && $.each(config.right, this.proxy(function(idx, comp) {
                clazz = $.u.load(comp.key);
                if (comp.key == "com.sms.detailmodule.base") {
                    option = comp;
                    this._reloadTopInfo(comp.activity);
                } else {
                    option = $.extend(true, {}, comp, {
                        "activity": this.urlparam.activityId,
                        "statusCategory": config.statusCategory
                    });
                }
                this.comps[comp.key] = new clazz($("<div umid='rightmodule" + idx + "'/>").appendTo(this.rightColumns), option);
            }));
            config.actions && $.each(config.actions, this.proxy(function(idx, item) {
                $(this.actionTemplate.replace(/#\{name\}/g, item.name).replace(/#\{action\}/g, item.wipId).replace(/#\{review\}/g, item.attributes.review || '').replace(/#\{screen}/g, item.attributes.screen || '')).appendTo(this.actions);
            }));
        }
    },
    /**
     * @title 销毁页面的组件,请空按钮
     */
    _destroyModule: function() {
        this.comps && $.each(this.comps, this.proxy(function(key, comp) {
            comp.destroy();
            delete this.comps[key];
        }));
        this.leftColumns.empty();
        this.rightColumns.empty();
        this.actions.empty();
        this.toolbar.empty();
    },
    /**
     * @title 加载顶部信息
     * @param data {object} 安全信息数据
     * @return void
     */
    _reloadTopInfo: function(data) {
        if (data) {
            this.summary.text(data.summary);
            this.unitName.attr("href", this.getabsurl("../unitbrowse/Summary.html?id=" + data.unit.id)).text(data.unit.name);
            this.unitCode.attr("href", this.getabsurl("activity.html?activityId=" + data.id)).text(data.unit.code + "-" + data.num);
            this.unitAvatar.attr("src", data.unit.avatarUrl);
        }
    },
    /**
     * @title 获取安全信息详细
     * @param activity 安全信息编号
     * @return void
     */
    reloadData: function() {
        this.urlparam = $.urlParam(window.location.seach, "?");
        if (!this.urlparam.activityId) {
            this.urlparam = $.urlParam(); // #支持搜索界面，?支持单页详细界面
            if (!this.urlparam.activityId) {
                return;
            }
        }
        try {
            this.urlparam.activityId = parseInt(this.urlparam.activityId);
        } catch (e) {
            return;
        }
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getactivityviewconfig",
                "activity": this.urlparam.activityId
            }
        }, this.$, {
            size: 2,
            backgroundColor: "#fff"
        }).done(this.proxy(function(response) {
            if (response.success) {
            	if(response.data.statusCategory=="COMPLETE"){
            		for(i in response.data.operations){
            			if(response.data.operations[i].name=="edit"){
            				response.data.operations.splice(i,1);
            			}
            		}
            	}
                this._drawModule(response.data);
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));

    },
    /**
     * @title 工作流切换状态
     * @param action {string} 
     * @param $container {jQuery object}
     * @return void 
     */
    _doAction: function(action, $container, obj, callback) {
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "operate",
                "id": this.urlparam.activityId,
                "dataobject": "activity",
                "action": action,
                "actionUsers": obj ? JSON.stringify(obj) : null
            }
        }, $container, {
            size: 1
        }).done(this.proxy(function(response) {
            if (response.success) {
                if ($.isFunction(callback)) {
                    callback(response);
                }
                $.u.alert.success(this.qid("unit-code").text() + " 已经被更新。");
                this.reloadData();

            }
        }));
    },
    destroy: function() {
        this._super();
        this._destroyModule();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.search.detail.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.search.detail.widgetcss = [];
