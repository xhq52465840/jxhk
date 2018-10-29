//@ sourceURL=com.sms.log.activityloggadget
// TODO : 修改的加载有问题
$.u.define('com.sms.log.activityloggadget', null, {
    init: function (mode, gadgetsinstanceid) {
        this._template = "<div class='config-row form-group row'> " +
                            "<div class='col-sm-3 col-xs-3'>" +
                                "<select class='rule form-control'>" +
                                    "<option value='activity.unit.id'>安监机构</option>" +
                                    "<option value='activity.summary'>安全信息关键字</option>" +
                                    "<option value='lastUpdate'>更新日期</option>" +
                                    "<option value='user'>用户名</option>" +
                                "</select>" +
                            "</div>" +
                            "<div class='col-sm-3 col-xs-3'>" +
                                "<select class='operator form-control'>" +
                                    "<option value='=='>是</option>" +
                                    "<option value='!=' class='notdate'>不是</option>" +
                                    "<option value='<=' class='date'>在之前</option>" +
                                    "<option value='>=' class='date'>在之后</option>" +
                                    "<option value='between' class='date'>之间</option>" +
                                "</select>" +
                            "</div>" +
                            "<div class='col-sm-4 col-xs-4'><span>" +
                                "<input class='rowvalue form-control' type='text'/></span>" +
                                "<span class='between'>和<input type='text' class='form-control'/></span>" +
                            "</div>" +
                            "<div class='col-sm-2 col-xs-2'>" +
                                "<span class='add-remove-buttons'>" +
                                    "<button class='add' type='button' title='添加'><span>添加</span></button>" +
                                    "<button class='remove' type='button' title='删除'><span>删除</span></button></span><div class='clearer'></div>" +
                            "</div>" +
                        "</div>";
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
        this._refreshtimer = null;
        this._select2PageLength = 10;
    },
    beforechildrenrender: function () {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            async: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbyid",
                "dataobject": "gadgetsinstance",
                "dataobjectid": this._gadgetsinstanceid
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                this._gadgetsinstance = result.data;
                if (this._gadgetsinstance.urlparam && this._gadgetsinstance.urlparam != "") {
                    var pms = null;
                    try {
                        pms = JSON.parse(this._gadgetsinstance.urlparam);
                        if(pms.title){
                            this.qid("stream-title").text(pms.title);
                        }
                    }
                    catch (e) { }
                    if(pms){
                        this.activitylog._options = pms;
                    }
                }
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    },
    afterrender: function () {
        this.qid("logviews").off("click", "span.activity-stream-view").on("click", "span.activity-stream-view", this.proxy(this.on_logviews_click));
        this.qid("refresh-checkbox").unbind("click").click(this.proxy(this.on_refresh_checkbox_click));
        this.qid("saveconfig").unbind("click").click(this.proxy(this.on_saveconfig_click));
        this.qid("cancelconfig").unbind("click").click(this.proxy(this.on_cancelconfig_click));
        this.qid("add-global-filter").unbind("click").click(this.proxy(this.on_add_global_filter_click));
        this.qid("smartconfig").off("click", "span.add-remove-buttons button.add").on("click", "span.add-remove-buttons button.add", this.proxy(this.on_addfilter_click));
        this.qid("smartconfig").off("click", "span.add-remove-buttons button.remove").on("click", "span.add-remove-buttons button.remove", this.proxy(this.on_removefilter_click));
        if (this.activitylog._options) {
            this.qid("titleedit").val(this.activitylog._options.title);
        }
        if (this._initmode == "config") {
            this.qid("logviews").children().last().trigger("click");
        }
        else {
            this.qid("logviews").children().first().trigger("click");
        }
    },
    on_logviews_click: function (e) {
        var $span = $(e.currentTarget);
        if ($span.hasClass("full-view-icon")) {
            this.$.removeClass("list-view filter-view").addClass("full-view");
            this.resizeGadget($("body").outerHeight(true));
        } else if ($span.hasClass("list-view-icon")) {
            this.$.removeClass("full-view filter-view").addClass("list-view");
            this.resizeGadget($("body").outerHeight(true));
        } else {
            // filter
            this.$.addClass("filter-view");
            this.qid("titleedit").val(this.qid("titleedit").prev().text());
            this.qid("smartconfig").empty();
            this.qid("numofentries").val(20);
            this.qid("refresh-checkbox").prop("checked", false);
            this.qid("refresh-select").hide();
            this.qid("refresh-select").children().first().prop("checked", true);
            if (this._gadgetsinstance.urlparam && this._gadgetsinstance.urlparam != "") {
                var pms = {};
                try {
                    pms = JSON.parse(this._gadgetsinstance.urlparam);
                    if (pms.autorefresh) {
                        this.qid("refresh-checkbox").prop("checked", true);
                        this.qid("refresh-select").show();
                    } else {
                        this.qid("refresh-checkbox").prop("checked", false);
                        this.qid("refresh-select").hide();
                    }
                    if (pms.autorefreshminiute) {
                        this.qid("refresh-select").val(pms.autorefreshminiute);
                    }
                    if (pms.rules) {
                        $.each(pms.rules, this.proxy(function (idx, arule) {
                            var $aconfig = null;
                            if (this.qid("smartconfig").children().length == 0) {
                                $aconfig = $(this._template).appendTo(this.qid("smartconfig"));
                                // 第一个
                                $("select.rule", $aconfig).val(arule.key);
                                $("select.operator", $aconfig).val(arule.op);
                                $("option.date", $aconfig).prop("disabled", true).hide();
                                $("span.between", $aconfig).hide();
                                // $("input.rowvalue", $aconfig)  // 这里是select2
                                this._bindrulechange($aconfig);
                                $("select.rule", $aconfig).val(arule.key);
                                $("select.rule", $aconfig).trigger("change");
                                $("select.operator", $aconfig).val(arule.op);
                                $("select.operator", $aconfig).trigger("change");
                            } else {
                                var $last = this.qid("smartconfig").children().last();
                                $aconfig = $(this._template).appendTo(this.qid("smartconfig"));
                                $("select.rule", $aconfig).html($("select.rule", $last).html());
                                $("select.rule option[value='" + $("select.rule", $last).val() + "']", $aconfig).prop("disabled", true).hide();
                                var chd = this.qid("smartconfig").children();
                                $("select.rule option:not(:disabled)", $aconfig).first().prop("selected", true);                                
                                var cfgval = $("select.rule", $aconfig).val();
                                $.each(chd, function (idx, acfg) {
                                    if (idx < chd.length - 1) {
                                        $("select.rule option[value='" + cfgval + "']", $(acfg)).prop("disabled", true).hide();
                                    }
                                });
                                this._bindrulechange($aconfig);
                                $("select.rule", $aconfig).val(arule.key);
                                $("select.rule", $aconfig).trigger("change");
                                $("select.operator", $aconfig).val(arule.op);
                                $("select.operator", $aconfig).trigger("change");
                                if ($("select.rule option:enabled", $aconfig).length == 1) {
                                    $("span.add-remove-buttons button.add", this.qid("smartconfig")).prop("disabled", true);
                                    $("span.add-remove-buttons button.add", this.qid("smartconfig")).addClass("disabled");
                                }
                            }
                            if (arule.key == "activity.unit.id" || arule.key == "user") {
                                $(".rowvalue", $aconfig).select2("data", arule.value);
                            }
                            else if (arule.key == "lastUpdate") {
                                if (arule.op == "between") {
                                    $(".rowvalue", $aconfig).val(arule.value[0]);
                                    $(".rowvalue", $aconfig).parent().next().children().first().val(arule.value[1]);
                                }
                                else {
                                    $(".rowvalue", $aconfig).val(arule.value);
                                }
                            }
                            else {
                                $(".rowvalue", $aconfig).val(arule.value);
                            }
                        }));
                    }
                }
                catch (e) { }
            }
            if (this.qid("smartconfig").children().length == 0) {
                this.qid("add-global-filter").trigger("click");
            }
            //this.resizeGadget($("body").outerHeight(true) + 20);            
            this.resizeGadget($("body").prop("scrollHeight") + 20);
        }
    },
    on_refresh_checkbox_click: function (e) {
        var $check = $(e.currentTarget);
        if ($check.prop("checked")) {
            this.qid("refresh-select").show();
        }
        else {
            this.qid("refresh-select").hide();
        }
    },
    on_add_global_filter_click: function (e) {
        e.preventDefault();
        if (this.qid("smartconfig").children().length == 0) {
            var $aconfig = $(this._template).appendTo(this.qid("smartconfig"));
            // 第一个
            $("option.date", $aconfig).prop("disabled", true).hide();
            $("span.between", $aconfig).hide();
            // $("input.rowvalue", $aconfig)  // 这里是select2
            this._bindrulechange($aconfig);
        } else {
            var $last = this.qid("smartconfig").children().last();
            if ($("select.rule option:enabled", $last).length == 1) {
                var $alert = $("<div/>").insertAfter($(e.currentTarget).parent());
                $.u.alert4$.error("所有选项都已添加", $alert);
            }
            else {
                var $aconfig = $(this._template).appendTo(this.qid("smartconfig"));
                $("select.rule", $aconfig).html($("select.rule", $last).html());
                $("select.rule option[value='" + $("select.rule", $last).val() + "']", $aconfig).prop("disabled", true).hide();
                var chd = this.qid("smartconfig").children();
                $("select.rule option:not(:disabled)", $aconfig).first().prop("selected", true);
                var cfgval = $("select.rule", $aconfig).val();
                $.each(chd, function (idx, acfg) {
                    if (idx < chd.length - 1) {
                        $("select.rule option[value='" + cfgval + "']", $(acfg)).prop("disabled", true).hide();
                    }
                });
                this._bindrulechange($aconfig);
                if ($("select.rule option:enabled", $aconfig).length == 1) {
                    $("span.add-remove-buttons button.add", this.qid("smartconfig")).prop("disabled", true);
                    $("span.add-remove-buttons button.add", this.qid("smartconfig")).addClass("disabled");
                }
            }
        }        
    },
    on_saveconfig_click: function (e) {
        e.preventDefault();
        pms = {};
        if (this._gadgetsinstance.urlparam && this._gadgetsinstance.urlparam != "") {
            pms = {};
            try {
                pms = JSON.parse(this._gadgetsinstance.urlparam);
            }
            catch (e) { }
        }
        pms.title = this.qid("titleedit").val(); // 头
        pms.count = this.qid("numofentries").val();  //条数
        pms.rules = [];
        $.each(this.qid("smartconfig").children(), this.proxy(function (idx, aconfigrow) {
            var $aconfig = $(aconfigrow);
            var key = $("select.rule", $aconfig).val();
            var op = $("select.operator", $aconfig).val();
            var value = "";
            if (key == "lastUpdate") {
                if (op == "between") {
                    value = [$(".rowvalue", $aconfig).val(), $(".rowvalue", $aconfig).parent().next().children().first().val()];
                }
                else {
                    value = $(".rowvalue", $aconfig).val();
                }
            }
            else if (key == "user" || key == "activity.unit.id") {
                value = $(".rowvalue", $aconfig).select2("data");
            }
            else {
                value = $(".rowvalue", $aconfig).val();
            }
            pms.rules.push([{ key: key, op: op, value: value }]);
        }));
        pms.autorefresh = false;
        if (this.qid("refresh-select").is(":visible")) {
            pms.autorefresh = true;
            pms.autorefreshminiute = this.qid("refresh-select").val();
        } 
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            async: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.update",
                "dataobject": "gadgetsinstance",
                "dataobjectid": this._gadgetsinstanceid,
                "obj": JSON.stringify({ "urlparam": JSON.stringify(pms) })
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                $.u.alert.info("更新插件配置成功");
                window.location.href = window.location.href; // 刷新
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    },
    on_addfilter_click: function (e) {
        e.preventDefault();
        var curconfigrow = $(e.currentTarget).closest(".config-row");
        var $first = this.qid("smartconfig").children().first();

        var $aconfig = $(this._template).insertAfter(curconfigrow);
        $("select.rule", $aconfig).html($("select.rule", $first).html());
        $("select.rule option[value='" + $("select.rule", $first).val() + "']", $aconfig).prop("disabled", true).hide();
        var chd = this.qid("smartconfig").children();
        $("select.rule option:not(:disabled)", $aconfig).first().prop("selected", true);
        var cfgval = $("select.rule", $aconfig).val();
        var idxcfg = chd.index($aconfig);
        $.each(chd, function (idx, acfg) {
            if (idx != idxcfg) {
                $("select.rule option[value='" + cfgval + "']", $(acfg)).prop("disabled", true).hide();
            }
        });
        this._bindrulechange($aconfig);
        if ($("select.rule option:enabled", $aconfig).length == 1) {
            // 要多加一个，因为之后会让第一个取消一个
            $("span.add-remove-buttons button.add", this.qid("smartconfig")).prop("disabled", true);
            $("span.add-remove-buttons button.add", this.qid("smartconfig")).addClass("disabled");
        }
    },
    on_removefilter_click: function (e) {
        e.preventDefault();
        $(e.currentTarget).closest(".config-row").remove();
        this._recalcrule();
        $("span.add-remove-buttons button.add", this.qid("smartconfig")).prop("disabled", false);
        $("span.add-remove-buttons button.add", this.qid("smartconfig")).removeClass("disabled");
    },
    on_cancelconfig_click: function (e) {
        e.preventDefault();
        this.$.removeClass("filter-view");
        this.qid("refresh-select").hide();
    },
    _bindrulechange: function (sel) {
        var $aconfig = sel;
        var selval = $("select.rule", $aconfig).val();

        var $rowvalue = $(".rowvalue", $aconfig);
        if ($rowvalue.hasClass("value-updatedate")) {
            $("input", $(".rowvalue", $aconfig).closest("div")).datepicker("destroy").removeClass("value-updatedate").val("");
        }
        else if ($rowvalue.hasClass("value-key")) {
            $rowvalue.select2("destroy").removeClass("value-key").val("");
        }
        else if ($rowvalue.hasClass("value-user")) {
            $rowvalue.select2("destroy").removeClass("value-user").val("");
        }
        else {
            $rowvalue.removeClass("value-safeinfokey").val("");
        }
        $("select.operator", $aconfig).val("==");
        if (selval == "lastUpdate") {
            $("option.date", $aconfig).prop("disabled", false).show();
            $("span.between", $aconfig).hide();
            $("option.notdate", $aconfig).hide();
            $("select.operator", $aconfig).unbind("change").change(this.proxy(function (e) {
                var $opsel = $(e.currentTarget);
                var $aconfigx = $opsel.closest(".config-row");
                if ($opsel.val() == "between") {
                    $("input", $(".rowvalue", $aconfigx).closest("div")).addClass("half");
                    $("span.between", $aconfigx).show();
                }
                else {
                    $("input", $(".rowvalue", $aconfigx).closest("div")).removeClass("half");
                    $("span.between", $aconfigx).hide();
                }
            }));
            $("input", $(".rowvalue", $aconfig).closest("div")).addClass("value-updatedate").datepicker({
                dateFormat: "yy-mm-dd",
                showWeek: true,
                firstDay: 1
            });
        }
        else {
            $("option.date", $aconfig).prop("disabled", true).hide();
            $("span.between", $aconfig).hide();
            $("option.notdate", $aconfig).show();
            if (selval == "activity.unit.id") {
                // 安监机构
                $rowvalue.addClass("value-key").select2({
                    placeholder: "选取安监机构...",
                    allowClear: true,
                    multiple: true,
                    // data: { results: [{ id: 1, text: '机构1' }, { id: 2, text: '机构2' }, { id: 3, text: '机构3' }, { id: 4, text: '机构4' }, { id: 5, text: '机构5' }] }
                    // 判断是否是xx
                    ajax: {
                       url: $.u.config.constant.smsqueryserver,
                       dataType: "json",
                       data: this.proxy(function (term, page) {
                           return {
                               tokenid: $.cookie("tokenid"),
                               method: "stdcomponent.getbysearch",
                               dataobject: "unit",
                               rule: JSON.stringify([[{ "key": "name", "op":"like", "value": term }]]),
                               start: (page - 1) * this._select2PageLength,
                               length: this._select2PageLength
                           };
                       }),
                       results: this.proxy(function (data, page) {
                           if (data.success) {
                               return {
                                   results: $.map(data.data.aaData, function (unit, idx) {
                                       return {
                                            text: unit.name,
                                            id: unit.id,
                                       };
                                   }),
                                   more: data.data.iTotalRecords > (page * this._select2PageLength)
                               };
                           }
                       })
                    }
                });
            } else if (selval == "safeinfokey") {
                // 啥都不用做
            } else if (selval == "user") {
                $rowvalue.addClass("value-user").select2({
                    placeholder: "选取用户...",
                    allowClear: true,
                    ajax: {
                        url: $.u.config.constant.smsqueryserver,
                        dataType: "json",
                        data: this.proxy(function (term, page) {
                            return {
                                tokenid: $.cookie("tokenid"),
                                method: "stdcomponent.getbysearch",
                                dataobject: "user",
                                rule: JSON.stringify([[{ "key":"username", "op": "like", "value": term },{ "key":"fullname", "op": "like", "value": term }]]),
                                start: (page - 1) * this._select2PageLength,
                                length: this._select2PageLength
                            };
                        }),
                        results: this.proxy(function (data, page) {
                            if (data.success) {
                                return {
                                    results: $.map(data.data.aaData, function (user, idx) {
                                        return {
                                            text: user.username + "(" + user.fullname + ")",
                                            username: user.username,
                                            fullname: user.fullname,
                                            id: user.id
                                        };
                                    }),
                                    more: data.data.iTotalRecords > (page * this._select2PageLength)
                                };
                            }
                        })
                    }
                });
            }
        }
        $("select.rule", $aconfig).unbind("change").change(this.proxy(function (e) {
            this._recalcrule(e);
            var $select = $(e.currentTarget);
            this._bindrulechange($select.closest(".config-row"));
        }));
    },
    _recalcrule: function (e) {
        var allKeys = [];
        var chdx = this.qid("smartconfig").children();
        $.each(chdx, function (idx, acfg) {
            allKeys.push($("select.rule", $(acfg)).val());
        });
        $("select.rule option", this.qid("smartconfig")).prop("disabled", false).show();
        $.each(allKeys, this.proxy(function (idx, akey) {
            $("select.rule option[value='" + akey + "']:not(:selected)", this.qid("smartconfig")).prop("disabled", true).hide();
        }));
    },
    resizeGadget: function (height) {
        if (window.parent.resizeGadget) {
            window.parent.resizeGadget(this._gadgetsinstance.id, height);
        }
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.log.activityloggadget.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'
    , "../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.log.activityloggadget.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
