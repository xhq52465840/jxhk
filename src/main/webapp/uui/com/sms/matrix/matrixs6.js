//@ sourceURL=com.sms.matrix.matrixs6
$.u.define('com.sms.matrix.matrixs6', null, {
    init: function (mid) {
        this.__mid = parseInt(mid);
    },
    afterrender: function () {
        this.$.off("click", "button.matrix_btn_next").on("click", "button.matrix_btn_next", this.proxy(this.on_btn_next));
        this.$.off("click", "button.matrix_btn_prev").on("click", "button.matrix_btn_prev", this.proxy(this.on_btn_prev));
        this.buildtable();
    },
    resize: function () {

    },
    buildtable: function () {
        this.qid("editbody").empty();
        this.qid("editcols").empty();
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getByMatrix",
                "subObj" : "coefficient",
                "matrixId": this.__mid
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                var cols = result.data.P.length;
                var despS = [], stiles = [], despNumS = [];
                $.each(result.data.S, this.proxy(function (idx, adata) {
                    var isnew = false;
                    if ($.inArray(adata.title, stiles) == -1) {
                        stiles.push(adata.title);
                        isnew = true;
                    }
                    if ($.inArray(adata.source, despNumS) == -1) {
                        despNumS.push(adata.source);
                    }
                    if (isnew) {
                        despS.push([]);
                    }
                    despS[stiles.length - 1].push(adata.description);
                }));
                var colss = stiles.length;
                this.qid("editth1").attr("colspan", colss);
                this.qid("editth2").attr("colspan", cols);                
                $.each(stiles, this.proxy(function (idx, atile) {
                    this.qid("editcols").append("<th>" + atile + "</th>");
                }));
                $.each(result.data.P, this.proxy(function (idx, ap) {
                    this.qid("editcols").append("<th>" + ap.source + "</th>");
                }));
                // th构造完毕
                // select构造完毕
                // 构造数据
                var rows = despNumS.length;
                var realcols = colss + cols + 1;
                var i = 0, j = 0;
                var htmforrow = "";
                for (i = 0 ; i < rows; i++) {
                    htmforrow += "<tr><td class='serioustd'>" + despNumS[i] + "</td>";
                    for (j = 0; j < colss ; j++) {
                        htmforrow += "<td>" + despS[j][i] + "</td>";
                    }
                    for (j = 0; j < cols ; j++) {
                        var dt = result.data.C[i * cols + j];
                        var selectstr = "<select class='form-control coefficient-binding'>";
                        $.each(result.data.B, this.proxy(function (idx, adata) {                            
                            if (adata.id == dt.bandingId) {
                                selectstr += "<option real='" + adata.color + "' value='" + adata.id + "' selected='selected'>" + adata.title + "</option>";
                            }
                            else {
                                selectstr += "<option real='" + adata.color + "' value='" + adata.id + "'>" + adata.title + "</option>";
                            }
                        }));
                        selectstr += "</select>";
                        htmforrow += "<td style='background-color: " + dt.bandingColor + ";'><div class='row' style='margin : 5px 5px;'><div class='col-sm-12 col-xs-12'><input style='width: 60%;margin: 0 auto;text-align: center;' real='" + dt.id + "' class='form-control coefficient-score' value='" + dt.score + "' /></div></div><div class='row' style='margin : 5px 5px;'><div class='col-sm-12 col-xs-12'>" + selectstr + "</div></div></td>";
                    }
                    htmforrow += "</tr>";
                }
                this.qid("editbody").html(htmforrow);
                this.qid("edittable").off("change", "select.coefficient-binding").on("change", "select.coefficient-binding", this.proxy(function (e) {
                    var $select = $(e.currentTarget);
                    var $option = $select.children(":selected");
                    $select.closest("td").css("background-color", $option.attr("real"));
                }));
                this.qid("edittable").width(realcols * 150);

            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    on_btn_next: function (e) {
        e.preventDefault();
        var objs = [];
        $.each($(".coefficient-score", this.qid("editbody")), this.proxy(function (idx, aitm) {
            var $aitm = $(aitm);
            objs.push({ id: parseInt($aitm.attr("real")), score: $aitm.val(), banding: parseInt($aitm.parent().parent().next().children().first().children().first().val()) });
        }));
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.updateall",
                "dataobject": "coefficient",
                "objs": JSON.stringify(objs)
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                window.location.href = this.getabsurl("./MatrixS7.html?mid=" + this.__mid);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    on_btn_prev: function (e) {
        e.preventDefault();
        window.location.href = this.getabsurl("./MatrixS5.html?mid=" + this.__mid);
    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixs6.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"
    , "../../../uui/widget/colorpalette/js/colorpalette.js"];
com.sms.matrix.matrixs6.widgetcss = [{ path: "../../../uui/widget/colorpalette/css/colorpalette.css" }];
