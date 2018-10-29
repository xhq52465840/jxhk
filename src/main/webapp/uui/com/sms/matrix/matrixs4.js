//@ sourceURL=com.sms.matrix.matrixs4
$.u.define('com.sms.matrix.matrixs4', null, {
    init: function (mid) {
        this.__mid = parseInt(mid);
        this._templatearea = "<div class='form-group control' style='display:inline-block;width:48%;'>" +
            "<label class='col-sm-12 control-label' style='margin-top: 10px;'>"+com.sms.matrix.matrixs4.i18n.severity+"—#{title}</label>" +
            "<div class='col-sm-12' style='margin-top: 10px;'>" +
                "<div class='table-responsive'>" +
                    "<table class='table table-bordered'>" +
                        "<thead>" +
                            "<tr>" +
                                "<th style='width: 30%'>"+com.sms.matrix.matrixs4.i18n.range+"</th>" +
                                "<th>"+com.sms.matrix.matrixs4.i18n.explain+"</th>" +
                            "</tr>" +
                        "</thead>" +
                        "<tbody class='serious-tbody'>" +
                        "</tbody>" +
                    "</table>" +
                "</div>" +
            "</div>" +
        "</div>";
        this._template = "<tr><td class='boldtd'>#{num}</td><td><input real='#{id}' type='text' placeholder='#{placeholder}' class='form-control aid-item' value='#{value}'/></td></tr>";
        this.__changed = false;
    },
    afterrender: function () {
        this.$.off("click", "button.matrix_btn_next").on("click", "button.matrix_btn_next", this.proxy(this.on_btn_next));
        this.$.off("click", "button.matrix_btn_prev").on("click", "button.matrix_btn_prev", this.proxy(this.on_btn_prev));
        this.buildtable();
    },
    resize: function () {

    },
    on_btn_next: function (e) {
        e.preventDefault();
        if (this.__changed) {
            var objs = [];
            $.each($("form .aid-item", this.$), this.proxy(function (idx, aitm) {
                var $aitm = $(aitm);
                objs.push({ id: parseInt($aitm.attr("real")), description: $aitm.val() });
            }));
            $.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "stdcomponent.updateall",
                    "dataobject": "aids",
                    "objs": JSON.stringify(objs)
                }
            }, this.$).done(this.proxy(function (result) {
                if (result.success) {
                    window.location.href = this.getabsurl("./MatrixS5.html?mid=" + this.__mid);
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }
        else {
            window.location.href = this.getabsurl("./MatrixS5.html?mid=" + this.__mid);
        }
    },
    on_btn_prev: function (e) {
        e.preventDefault();
        window.location.href = this.getabsurl("./MatrixS3.html?mid=" + this.__mid);
    },
    buildtable: function () {
        this.qid("possible").empty();
        this.qid("serious-form").empty();
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getByMatrix",
                "subObj": "aids",
                "matrixId": this.__mid
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                $.each(result.data.P, this.proxy(function (idx, adata) {
                    this.qid("possible").append(this._template.replace(/#\{id\}/g, adata.id).replace(/#\{num\}/g, adata.source).replace(/#\{placeholder\}/g, "可能性说明").replace(/#\{value\}/g, adata.description ? adata.description : ""));
                }));
                var stiles = [], tbtbody = null;;
                $.each(result.data.S, this.proxy(function (idx, adata) {
                    var isnew = false;
                    if ($.inArray(adata.title, stiles) == -1) {
                        stiles.push(adata.title);
                        isnew = true;
                    }
                    if (isnew) {
                        var $tb = $(this._templatearea.replace(/#\{title\}/g, adata.title)).appendTo(this.qid("serious-form"));
                        tbtbody = $(".serious-tbody", $tb);
                    }
                    var $row = $(this._template.replace(/#\{id\}/g, adata.id).replace(/#\{num\}/g, adata.source).replace(/#\{placeholder\}/g, "严重性-" + adata.title + "说明").replace(/#\{value\}/g, adata.description ? adata.description : "")).appendTo(tbtbody);
                    $(".aid-item", $row).unbind("change").change(this.proxy(this.on_aid_item_change));
                }));
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    on_aid_item_change: function (e) {
        this.__changed = true;
    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixs4.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.matrix.matrixs4.widgetcss = [];
