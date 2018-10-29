//@ sourceURL=com.sms.matrix.matrixs5
$.u.define('com.sms.matrix.matrixs5', null, {
    init: function (mid) {
        this.__mid = parseInt(mid);
        this._template = "<div class='col-sm-8 bindings-row bindings-data-row' real='#{id}'>" +
                            "<form role='form' class='form-horizontal'>" +
                                "<div class='form-group control' style='margin-top: 10px;'>" +
                                    "<label class='col-sm-2 control-label'>"+com.sms.matrix.matrixs5.i18n.colorLump+"<span class='text-danger'>*</span></label>" +
                                    "<div class='col-sm-5'>" +
                                        "<input type='text' class='form-control input-sm binding-title' placeholder='输入色块名称' name='name' value='#{title}' />" +
                                    "</div>" +
                                    "<label class='col-sm-2 control-label'>"+com.sms.matrix.matrixs5.i18n.color+"</label>" +
                                    "<div class='col-sm-1'>" +
                                        "<a class='btn btn-xs dropdown-toggle colorbutton binding-color' style='background-color:#{color};' real='#{color}' data-toggle='dropdown'></a>" +
                                          "<ul class='dropdown-menu' style='width:150px;'>" +
                                            "<li><div class='colorpalette'></div></li>" +
                                          "</ul>" +
                                    "</div>" +
                                    "<div class='col-sm-2'>" +
                                        "<button class='btn btn-default bindings-btn-del'>"+com.sms.matrix.matrixs5.i18n.remove+"</button>" +
                                    "</div>" +
                                "</div>" +
                                "<div class='form-group control' style='margin-top: 10px;'>" +
                                    "<label class='col-sm-2 control-label'>"+com.sms.matrix.matrixs5.i18n.process+"</label>" +
                                    "<div class='col-sm-8'>" +
                                        "<select class='form-control binding-handle'>" +
                                            "<option value='接受'>"+com.sms.matrix.matrixs5.i18n.accept+"</option>" +
                                            "<option value='减轻'>"+com.sms.matrix.matrixs5.i18n.alleviate+"</option>" +
                                            "<option value='转移'>"+com.sms.matrix.matrixs5.i18n.transfer+"</option>" +
                                            "<option value='避免'>"+com.sms.matrix.matrixs5.i18n.avoid+"</option>" +
                                        "</select>" +
                                    "</div>" +
                                "</div>" +
                                "<div class='form-group control' style='margin-top: 10px;'>" +
                                    "<label class='col-sm-2 control-label'>"+com.sms.matrix.matrixs5.i18n.describute+"</label>" +
                                    "<div class='col-sm-8'>" +
                                        "<textarea class='form-control binding-description' style='height: 80px;'>#{description}</textarea>" +
                                    "</div>" +
                                "</div>" +
                            "</form>" +
                        "</div>";
        this._tmpdel = [];

        //this.__changed = false;
    },
    afterrender: function () {
        this.$.off("click", "button.matrix_btn_next").on("click", "button.matrix_btn_next", this.proxy(this.on_btn_next));
        this.$.off("click", "button.matrix_btn_prev").on("click", "button.matrix_btn_prev", this.proxy(this.on_btn_prev));
        this.qid("btn-add-bindings").unbind("click").click(this.proxy(this.on_btn_add));
        this.$.off("click", "button.bindings-btn-del").on("click", "button.bindings-btn-del", this.proxy(this.on_btn_del));

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
                "dataobject": "banding",
                "rule": JSON.stringify(rule)
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                $.each(result.data.aaData, this.proxy(function (idx, adata) {
                    var $row = $(this._template.replace(/#\{id\}/g, adata.id).replace(/#\{title\}/g, adata.title).replace(/#\{color\}/g, adata.color).replace(/#\{description\}/g, adata.description)).insertBefore(this.qid("btn-add-bindings").closest(".bindings-row"));
                    $(".binding-handle", $row).val(adata.handle);
                    $(".colorpalette", $row).colorPalette().on('selectColor', this.proxy(function (e) {
                        $(e.currentTarget).closest("ul").prev().attr("real", e.color);
                        $(e.currentTarget).closest("ul").prev().css("background-color", e.color);
                        //this.__changed = true;
                    }));
                    //$(".binding-handle", $row).unbind("change").change(this.proxy(function () {
                    //    this.__changed = true;
                    //}));
                    //$(".binding-title", $row).unbind("change").change(this.proxy(function () {
                    //    this.__changed = true;
                    //}));
                    //$(".binding-description", $row).unbind("change").change(this.proxy(function () {
                    //    this.__changed = true;
                    //}));
                }));
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    resize: function () {

    },
    on_btn_next: function (e) {
        e.preventDefault();
        //if (this.__changed) {
            var datum = [];
            $.each($(".bindings-data-row", this.qid("bindings")), this.proxy(function (idx, arow) {
                var $row = $(arow);
                if ($row.attr("real") && $row.attr("real") != "") {
                    // 有id的才做，否则有可能是新增的然后删掉
                    datum.push({ id: parseInt($row.attr("real")), title: $(".binding-title", $row).val(), color: $(".binding-color", $row).attr("real"), handle: $(".binding-handle", $row).val(), description: $(".binding-description", $row).val(), matrix: this.__mid, flag: "U" });
                }
                else {
                    datum.push({ title: $(".binding-title", $row).val(), color: $(".binding-color", $row).attr("real"), handle: $(".binding-handle", $row).val(), description: $(".binding-description", $row).val(), matrix: this.__mid, flag: "A" });
                }
            }));
            if (datum.length == 0) {
                var $alert = $("<div/>").insertBefore(this.qid("btn-add-bindings").closest(".bindings-row"));
                $.u.alert4$.error(com.sms.matrix.matrixs5.i18n.error, $alert);
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
                    "subObj": "banding",
                    "objs": JSON.stringify(datum)
                }
            }, this.qid("bindings")).done(this.proxy(function (result) {
                if (result.success) {
                    this._tmpdel = [];
                    window.location.href = this.getabsurl("./MatrixS6.html?mid=" + this.__mid);
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        //}
        //else {
        //    window.location.href = this.getabsurl("./MatrixS6.html?mid=" + this.__mid);
        //}
    },
    on_btn_prev: function (e) {
        e.preventDefault();
        window.location.href = this.getabsurl("./MatrixS4.html?mid=" + this.__mid);
    },
    on_btn_add: function (e) {
        e.preventDefault();
        //this.__changed = true;
        var $row = $(this._template.replace(/#\{id\}/g, "").replace(/#\{title\}/g, "").replace(/#\{color\}/g, "#FF0000").replace(/#\{description\}/g, "")).insertBefore($(e.currentTarget).closest(".bindings-row"));
        $(".colorpalette", $row).colorPalette().on('selectColor', function (e) {
            $(e.currentTarget).closest("ul").prev().attr("real", e.color);
            $(e.currentTarget).closest("ul").prev().css("background-color", e.color);
            //this.__changed = true;
        });
        //$(".binding-handle", $row).unbind("change").change(this.proxy(function () {
        //    this.__changed = true;
        //}));
        //$(".binding-title", $row).unbind("change").change(this.proxy(function () {
        //    this.__changed = true;
        //}));
        //$(".binding-description", $row).unbind("change").change(this.proxy(function () {
        //    this.__changed = true;
        //}));
    },
    on_btn_del: function (e) {
        e.preventDefault();
        //this.__changed = true;
        var $row = $(e.currentTarget).closest(".bindings-row");
        if ($row.attr("real") && $row.attr("real") != "") {
            // 有id的才做，否则有可能是新增的然后删掉
            this._tmpdel.push({ id: parseInt($row.attr("real")), title: $(".binding-title", $row).val(), color: $(".binding-color", $row).attr("real"), handle: $(".binding-handle", $row).val(), description: $(".binding-description", $row).val(), matrix: this.__mid, flag: "D" });
        }
        $row.remove();
    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixs5.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"
    , "../../../uui/widget/colorpalette/js/colorpalette.js"];
com.sms.matrix.matrixs5.widgetcss = [{ path: "../../../uui/widget/colorpalette/css/colorpalette.css" }];
