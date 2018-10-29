//@ sourceURL=com.sms.matrix.matrixlist
$.u.define('com.sms.matrix.matrixlist', null, {
    init: function () {
    	this.i18n = com.sms.matrix.matrixlist.i18n;
        this._matrixtemplate = "<div class='row'>" +
                    "<div class='col-md-12 matrix-row'>" +
                        "<span class='matrix-rowicon'>" +
                            "<img src='" + this.getabsurl("../../../img/sms/matrix-view-80-70.png") + "' /></span>" +
                        "<div class='matrix-info'>" +
                            "<div class='matrix-title'><a href='" + this.getabsurl("MatrixS7.html") + "?mid=#{id}'>#{name}</a></div>" +
                            "<div class='matrix-update'><small>"+com.sms.matrix.matrixlist.i18n.updateTime+"<span>#{lastUpdate}</span><span class='matrix-split'>|</span>  "+com.sms.matrix.matrixlist.i18n.updater+"<span>#{lastUpdater}</span></small></div>" +
                            "<div class='matrix-description'><small>#{description}</small></div>" +
                        "</div>" +
                        "<span class='matrix-actions'>" +
                            "<a href='" + this.getabsurl("MatrixS1.html") + "?mid=#{id}' class='btn btn-default'>"+com.sms.matrix.matrixlist.i18n.modify+"</a>" +
                            "<button class='btn btn-default matrix-publish #{publish}' real='#{id}'>"+com.sms.matrix.matrixlist.i18n.publish+"</button>" +
                            "<button class='btn btn-default matrix-disable #{status}' real='#{id}'>"+com.sms.matrix.matrixlist.i18n.forbidden+"</button></span>" +
                    "</div>" +
                "</div>";
    },
    afterrender: function () {
    	this.i18n = com.sms.matrix.matrixlist.i18n;
        this.qid("btn_create").unbind("click").click(this.proxy(this.on_btn_create))
        this.qid("matrix-container").off("click", "button.matrix-publish").on("click", "button.matrix-publish", this.proxy(this.on_matrix_publish));
        this.qid("matrix-container").off("click", "button.matrix-disable").on("click", "button.matrix-disable", this.proxy(this.on_matrix_disable));
        
        this.qid("btn_filter").unbind("click").click(this.proxy(function (e) {
            this.lookupmatrix();
        }));
        this.qid("btn_resetfilter").unbind("click").click(this.proxy(function (e) {
            this.qid("publish").val("");
            this.qid("status").val("");
        }));
        this.lookupmatrix();
    },
    lookupmatrix: function () {
        this.qid("matrix-container").empty();
        var rule = [];
        rule.push([{ key: "publish", op: "==", value: this.qid("publish").val() }, { key: "status", op: "==", value: this.qid("status").val() }]);
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "matrix",
                "rule" : JSON.stringify(rule)
            }
        }).done(this.proxy(function (result) {
            if (result.success) {
                $.each(result.data.aaData, this.proxy(function (idx, adata) {
                    this.qid("matrix-container").append(this._matrixtemplate.replace(/#\{id\}/g, adata.id).replace(/#\{name\}/g, adata.name).replace(/#\{lastUpdate\}/g, adata.lastUpdate).replace(/#\{lastUpdater\}/g, adata.lastUpdater).replace(/#\{description\}/g, adata.description).replace(/#\{publish\}/g, ((adata.publish == "N" && adata.status == "Y") ? "" : "disabled")).replace(/#\{status\}/g, (adata.status == "Y" ? "" : "disabled")));
                }));
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    resize: function () {

    },
    on_btn_create: function (e) {
        e.preventDefault();
        window.location.href = this.getabsurl("MatrixS1.html");
    },
    on_matrix_publish: function (e) {
        e.preventDefault();
        var btn = $(e.currentTarget);
        var matrixid = parseInt(btn.attr("real"));
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.update",
                "dataobject": "matrix",
                "dataobjectid": matrixid,
                "obj": JSON.stringify({ "publish": "Y" })
            }
        }, btn.closest(".row")).done(this.proxy(function (result) {
            if (result.success) {
                $.u.alert.info(this.i18n.succeedPublish);
                btn.addClass("disabled");
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    },
    on_matrix_disable: function (e) {
        e.preventDefault();
        var btn = $(e.currentTarget);
        var matrixid = parseInt(btn.attr("real"));
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.update",
                "dataobject": "matrix",
                "dataobjectid": matrixid,
                "obj": JSON.stringify({ "status": "N" })
            }
        }, btn.closest(".row")).done(this.proxy(function (result) {
            if (result.success) {
                $.u.alert.info(this.i18n.succeedforbidden);
                btn.addClass("disabled");
                btn.prev().addClass("disabled");
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixlist.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.matrix.matrixlist.widgetcss = [];
