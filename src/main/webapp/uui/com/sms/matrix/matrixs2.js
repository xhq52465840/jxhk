//@ sourceURL=com.sms.matrix.matrixs2
$.u.define('com.sms.matrix.matrixs2', null, {
    init: function (mid) {
        this.__mid = parseInt(mid);
        this._template = "<div real='#{id}' class='col-sm-7 perspectives-row perspectives-data-row'><div class='col-sm-10 col-xs-10'><input type='text' class='form-control perspectives-value' placeholder='输入视角' value='#{value}'/></div><div class='col-sm-2 col-xs-2'><button class='btn btn-default perspectives-btn-del'>"+com.sms.matrix.matrixs2.i18n.remove+"</button></div></div>";
        this._tmpdel = [];

        this.__changed = false;
        this.__changesteps = false;
    },
    afterrender: function () {
        this.$.off("click", "button.matrix_btn_next").on("click", "button.matrix_btn_next", this.proxy(this.on_btn_next));
        this.$.off("click", "button.matrix_btn_prev").on("click", "button.matrix_btn_prev", this.proxy(this.on_btn_prev));
        this.qid("btn-add-perspectives").unbind("click").click(this.proxy(this.on_btn_add));
        this.$.off("click", "button.perspectives-btn-del").on("click", "button.perspectives-btn-del", this.proxy(this.on_btn_del));

        var rule = [];
        rule.push([{ key: "matrix", op: "==", value: this.__mid }]);
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "perspectives",
                "rule": JSON.stringify(rule)
            }
        }, this.qid("perspectives")).done(this.proxy(function (result) {
            if (result.success) {
                $.each(result.data.aaData, this.proxy(function (idx, adata) {
                    var $row = $(this._template.replace(/#\{id\}/g, adata.id).replace(/#\{value\}/g, adata.title)).insertBefore(this.qid("btn-add-perspectives").closest(".perspectives-row"));
                    $(".perspectives-value", $row).unbind("change").change(this.proxy(this.on_perspectives_value_change));
                }));
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    resize: function () {

    },
    on_btn_next: function (e) {
        e.preventDefault();
        if (this.__changed) {
            var datum = [];
            var nonull = true;
            $.each($(".perspectives-data-row", this.qid("perspectives")), this.proxy(function (idx, arow) {
                var $row = $(arow);
                if ($(".perspectives-value", $row).val() == "" || $(".perspectives-value", $row).val().trim() == "") {
                    nonull = false;
                    var $alert = $("<div/>").insertAfter($(".perspectives-value", $row));
                    $.u.alert4$.error(com.sms.matrix.matrixs2.i18n.observenotNull, $alert);
                    return;
                }
                if ($row.attr("real") && $row.attr("real") != "") {
                    // 有id的才做，否则有可能是新增的然后删掉
                    datum.push({ id: parseInt($row.attr("real")), title: $(".perspectives-value", $row).val(), matrix: this.__mid, flag: "U" });
                }
                else {
                    datum.push({ title: $(".perspectives-value", $row).val(), matrix: this.__mid, flag: "A" });
                }
            }));
            if (!nonull) {
                return;
            }
            if (datum.length == 0) {
                var $alert = $("<div/>").insertBefore(this.qid("btn-add-perspectives").closest(".perspectives-row"));
                $.u.alert4$.error(com.sms.matrix.matrixs2.i18n.observenotNull, $alert);
                return;
            }
            datum = datum.concat(this._tmpdel);
            $.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "updateAll",
                    "dataobject": "matrix",
                    "subObj": "perspectives",
                    "objs": JSON.stringify(datum)
                }
            }, this.qid("perspectives")).done(this.proxy(function (result) {
                if (result.success) {
                    this._tmpdel = [];
                    if (this.__changesteps) {
                        window.location.href = this.getabsurl("./MatrixS3.html?mid=" + this.__mid + "&changesteps=S2");
                    }
                    else {
                        window.location.href = this.getabsurl("./MatrixS3.html?mid=" + this.__mid );
                    }
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }
        else {
            window.location.href = this.getabsurl("./MatrixS3.html?mid=" + this.__mid);
        }
    },
    on_btn_prev: function (e) {
        e.preventDefault();
        window.location.href = this.getabsurl("./MatrixS1.html?mid=" + this.__mid);
    },
    on_btn_add: function (e) {
        e.preventDefault();
        this.__changed = true;
        this.__changesteps = true;
        var $row = $(this._template.replace(/#\{id\}/g, "").replace(/#\{value\}/g, "")).insertBefore($(e.currentTarget).closest(".perspectives-row"));
        $(".perspectives-value", $row).unbind("change").change(this.proxy(this.on_perspectives_value_change));
    },
    on_btn_del: function (e) {
        e.preventDefault();
        this.__changed = true;
        this.__changesteps = true;
        var $row = $(e.currentTarget).closest(".perspectives-row");
        if ($row.attr("real") && $row.attr("real") != "") {
            // 有id的才做，否则有可能是新增的然后删掉
            this._tmpdel.push({ id: parseInt($row.attr("real")), title: $(".perspectives-value", $row).val(), matrix: this.__mid, flag: "D" });
        }
        $row.closest(".perspectives-row").remove();
    },
    on_perspectives_value_change: function (e) {
        this.__changed = true;
    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixs2.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.matrix.matrixs2.widgetcss = [];
