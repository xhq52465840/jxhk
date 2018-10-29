//@ sourceURL=com.sms.dash.gadget
/**
 * @title DashBoard中的块组件
 * @author tchen@usky.com.cn
 * @date 2016/11/30
 */
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.dash.gadget', null, {
    /**
     * @title 构造函数
     * @param {object} gadgetinstance - gadget的数据对象
     * @param {bool} readonly - 只读
     * @param {bool} configed - 可配置
     */
    init: function(gadgetinstance, readonly, configed) {
        // TODO: 少最大最小化参数，高度参数
        this._gadgetinstance = gadgetinstance;
        this._readonly = readonly ? true : false;
        this._configed = configed ? true : false;
        this._gadget = null;
    },
    afterrender: function() {
        this.i18n = com.sms.dash.gadget.i18n;
        $.u.ajaxp({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbyid",
                "dataobject": "gadgets",
                "dataobjectid": this._gadgetinstance.gadgetsId
            }
        }, this.$, {
            height: "20px",
            width: "150px"
        }).done(this.proxy(function(result) {
            if (result.success) {
                this._gadget = result.data;
                this.qid("dashname").text(this._gadget.title);
                this.$.unbind('mouseenter mouseleave');
                this.$.mouseenter(this.proxy(function(e) {
                    this.$.addClass("gadget-hover");
                }));
                this.$.mouseleave(this.proxy(function(e) {
                    // 不能删，要用
                    $(".dashboard-item-header .btn-group", this.$).removeClass("open");
                    this.$.removeClass("gadget-hover");
                }));
                this.qid("btn_max").unbind("click");
                this.qid("btn_max").click(this.proxy(function(e) {
                    this.qid("btn_restore").show();
                    this.qid("btn_max").hide();
                    this.parent().maximize(this.$);
                }));
                this.qid("btn_restore").unbind("click");
                this.qid("btn_restore").click(this.proxy(function(e) {
                    this.qid("btn_restore").hide();
                    this.qid("btn_max").show();
                    this.parent().restore();
                }));
                this.qid("gadgetmenus").off("click", "li");
                this.qid("gadgetmenus").on("click", "li", this.proxy(function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $li = $(e.currentTarget);
                    do {
                        if ($li.hasClass("minimization")) {
                            //最小化
                            $li.hide();
                            $li.next().show();
                            $li.closest("div.dashboard-item-header").next().hide();
                            this.$.parent().css("min-height", "");
                            break;
                        }
                        if ($li.hasClass("maximization")) {
                            //展开
                            $li.hide();
                            $li.prev().show();
                            $li.closest("div.dashboard-item-header").next().show();
                            this.$.parent().css("min-height", "100px"); /* 去掉最小高度设置 200px */
                            break;
                        }
                        if ($li.hasClass("color1")) {
                            this._changecolor("color1");
                            break;
                        }
                        if ($li.hasClass("color2")) {
                            this._changecolor("color2");
                            break;
                        }
                        if ($li.hasClass("color3")) {
                            this._changecolor("color3");
                            break;
                        }
                        if ($li.hasClass("color4")) {
                            this._changecolor("color4");
                            break;
                        }
                        if ($li.hasClass("color5")) {
                            this._changecolor("color5");
                            break;
                        }
                        if ($li.hasClass("color6")) {
                            this._changecolor("color6");
                            break;
                        }
                        if ($li.hasClass("color7")) {
                            //色彩7
                            this._changecolor("color7");
                            break;
                        }
                        if ($li.hasClass("color8")) {
                            //色彩8
                            this._changecolor("color8");
                            break;
                        }
                        if ($li.hasClass("configure")) {
                            //配置
                            this.showconfig();
                            $(".mygadget").hide();
                            break;
                        }
                        if ($li.hasClass("reload")) {
                            this.showdisplay();
                            break;
                        }
                        if ($li.hasClass("delete")) {
                            if (confirm(this.i18n.affirm + this._gadget.title + this.i18n.tool)) {
                                // 删除不需要重新排序了
                                $.u.ajax({
                                    url: $.u.config.constant.smsmodifyserver,
                                    type: "post",
                                    dataType: "json",
                                    cache: false,
                                    data: {
                                        "tokenid": $.cookie("tokenid"),
                                        "method": "stdcomponent.delete",
                                        "dataobject": "gadgetsinstance",
                                        "dataobjectids": JSON.stringify([this._gadgetinstance.id])
                                    }
                                }, this._currentgadgetline).done(this.proxy(function(result) {
                                    if (result.success) {
                                        this.$.parent().remove();
                                        this.parent().checkdashempty();
                                    }
                                })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

                                }));
                            }
                            break;
                        }
                    } while (false);
                    $(".dashboard-item-header .btn-group", this.$).removeClass("open");
                }));
                if (this._gadgetinstance.urlparam != "" && this._gadgetinstance.urlparam != null) {
                    try {
                        this._gadgetinstance.urlparam = JSON.parse(this._gadgetinstance.urlparam);
                    } catch (e) {}
                }
                if (this._configed) {
                    this.showdisplay();
                } else {
                    this.showconfig();
                    $(".mygadget").hide();
                }
                if (this._readonly) {
                    $(".mygadget", this.$).hide();
                } else {
                    $(".mygadget", this.$).show();
                }
                this.qid("gadgetframe").on("load", this.proxy(function() {
                    this.qid("gadgetframe").css("height", this.qid("gadgetframe").contents().find("body").outerHeight(true)); /* + 160 */
                }));
                if (this._gadgetinstance.urlparam) {
                    var pms = this._gadgetinstance.urlparam;
                    if (pms.color && pms.color != null) {
                        this.$.removeClass(function(index, css) {
                            return (css.match(/\bcolor\d{1}/g) || []).join(' ');
                        });
                        this.$.addClass(pms.color);
                    }
                }
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    /**
     * @title 切换gadget颜色
     * @param {string} newcolor - class name
     */
    _changecolor: function(newcolor) {
        var params = this._gadgetinstance.urlparam;
        if (!params || params == "") {
            params = "{}";
        }
        try {
            if(typeof params === 'string'){
                params = JSON.parse(params);
            }
        } catch (e) {
            params = {};
        }
        params.color = newcolor;
        params = JSON.stringify(params);
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.update",
                "dataobject": "gadgetsinstance",
                "dataobjectid": this._gadgetinstance.id,
                "obj": JSON.stringify({
                    "urlparam": params
                })
            }
        }, this.qid("dashlayout")).done(this.proxy(function(result) {
            if (result.success) {
                this._gadgetinstance.urlparam = params;
                this.$.removeClass(function(index, css) {
                    return (css.match(/\bcolor\d{1}/g) || []).join(' ');
                });
                this.$.addClass(newcolor);
                document.cookie="color="+newcolor;
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {}));
    },
    /**
     * @title 还原原始大小
     */
    restore: function() {
        this.qid("btn_restore").hide();
        this.qid("btn_max").show();
    },
    resize: function() {

    },
    /**
     * @title 配置模式
     */
    showconfig: function() {
        var tempGadgetIds = [7, 9, 13, 14, 23,24, 26, 32, 33, 34, 35, 36, 37, 38, 39, 42, 54, 56, 57, 58,59, 60, 61, 62];
        var tempGadgetMap = {
            7: 'com.sms.dash.line',
            9: 'com.sms.dash.threat_pie',
            13: 'com.sms.dash.insecurityLine',
            14: 'com.sms.dash.error_pie',
            23: 'com.sms.dash.noticetable',
            24: 'com.sms.dash.activityNoticeTable',
            26: 'com.sms.dash.actionItem',
            32: 'com.sms.dash.tem',
            33: 'com.sms.dash.unsafeIncidents',
            34: 'com.sms.dash.staffReport',
            35: 'com.sms.dash.riskTaskNoticeTable',
            36: 'com.sms.dash.safetyreview',
            37: 'com.sms.dash.assignedToMe',
            38: 'com.sms.dash.library',
            39: 'com.sms.dash.slibrary',
            42: 'com.sms.dash.libraryFile',
            54: 'com.audit.dash.subCompany',
            56: 'com.audit.dash.auditProfession',
            57: 'com.audit.xitong_jihua.audit_assignedToMe',
            58: 'com.sms.dash.sentAssistNoticeTable',
            59: 'com.sms.dash.publicReport',
            60: 'com.sms.dash.juneyao.approvalSummary',
            61: 'com.sms.dash.juneyao.securityDynamic',
            62: 'com.sms.dash.juneyao.carousel'
        };

        if ($.inArray(this._gadget.id, tempGadgetIds) > -1) {
            this._gadget.url = tempGadgetMap[this._gadget.id]
        }

        /////////////////测试调试用//////////////////

        var widgetType = this.qid('gadget-widget-container').attr('data-widget-type');
        if (this.isHttpUrl(this._gadget.url)) {
            this.qid('gadget-widget-container').attr('data-widget-type', 'iframe');
            this.qid("gadgetframe").removeClass('hidden').attr("src", $.urlBuilder(this._gadget.url, {
                "mode": "config",
                "gadgetid": this._gadget.id,
                "dashboardid": this._gadgetinstance.dashboardId,
                "gadgetsinstance": this._gadgetinstance.id
            }));
        } else{
            var clz = $.u.load(this._gadget.url);
            this.qid('gadget-widget-container').attr('data-widget-type', 'comp');
            this.gadgetWidget && this.gadgetWidget.destroy();
            this.gadgetWidget = new clz($('div[umid=' + this._gadgetinstance.id + '-gadget]').removeClass('hidden'), "config", this._gadgetinstance.id, this._gadgetinstance.urlparam || {});
        }
    },
    /**
     * @title 显示模式
     */
    showdisplay: function() {
        var tempGadgetIds = [7, 9, 13, 14,23, 24, 26, 32, 33, 34, 35, 36, 37, 38, 39, 42, 54, 56, 57,58, 59, 60, 61, 62];
        var tempGadgetMap = {
            7: 'com.sms.dash.line',
            9: 'com.sms.dash.threat_pie',
            13: 'com.sms.dash.insecurityLine',
            14: 'com.sms.dash.error_pie',
            23: 'com.sms.dash.noticetable',
            24: 'com.sms.dash.activityNoticeTable',
            26: 'com.sms.dash.actionItem',
            32: 'com.sms.dash.tem',
            33: 'com.sms.dash.unsafeIncidents',
            34: 'com.sms.dash.staffReport',
            35: 'com.sms.dash.riskTaskNoticeTable',
            36: 'com.sms.dash.safetyreview',
            37: 'com.sms.dash.assignedToMe',
            38: 'com.sms.dash.library',
            39: 'com.sms.dash.slibrary',
            42: 'com.sms.dash.libraryFile',
            54: 'com.audit.dash.subCompany',
            56: 'com.audit.dash.auditProfession',
            57: 'com.audit.xitong_jihua.audit_assignedToMe',
            58: 'com.sms.dash.sentAssistNoticeTable',
            59: 'com.sms.dash.publicReport',
            60: 'com.sms.dash.juneyao.approvalSummary',
            61: 'com.sms.dash.juneyao.securityDynamic',
            62: 'com.sms.dash.juneyao.carousel'
        };

        if ($.inArray(this._gadget.id, tempGadgetIds) > -1) {
            this._gadget.url = tempGadgetMap[this._gadget.id]
        }
        /////////////////测试调试用//////////////////

        if (this.isHttpUrl(this._gadget.url)) {
            this.qid('gadget-widget-container').attr('data-widget-type', 'iframe');
            this.qid("gadgetframe").removeClass('hidden').attr("src", $.urlBuilder(this._gadget.url, {
                "mode": "display",
                "gadgetid": this._gadget.id,
                "dashboardid": this._gadgetinstance.dashboardId,
                "gadgetsinstance": this._gadgetinstance.id
            }));
        } else {
            var clz = $.u.load(this._gadget.url);
            this.qid('gadget-widget-container').attr('data-widget-type', 'comp');
            this.gadgetWidget && this.gadgetWidget.destroy();
            this.gadgetWidget = new clz($('div[umid=' + this._gadgetinstance.id + '-gadget]').removeClass('hidden'), "display", this._gadgetinstance.id, this._gadgetinstance.urlparam || {});
        }
    },
    /**
     * @title 是否为http的url
     * @desc 如果以（http://或http://或ftp://）开始，或者以（.html或.htm）结束，都视为http的Url
     * @param {string} oriUrl - 待检测的字符串
     * @return {bool} - 是否为http的url
     */
    isHttpUrl: function(oriUrl) {
        oriUrl = $.trim(oriUrl);
        return /^(http|https|ftp)\:\/\//.test(oriUrl) || /(\.html|\.htm)$/.test(oriUrl);
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.dash.gadget.widgetjs = [
    "../../../uui/widget/jqurl/jqurl.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.dash.gadget.widgetcss = [];