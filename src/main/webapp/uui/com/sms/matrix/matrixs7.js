//@ sourceURL=com.sms.matrix.matrixs7
$.u.define('com.sms.matrix.matrixs7', null, {
    init: function (mid) {
        this.__mid = parseInt(mid);
    },
    afterrender: function () {
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
                "subObj": "coefficient",
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
                var colortemplate = "<div class='col-md-1 col-xs-2'><a class='btn btn-xs colorbutton binding-color' style='background-color:#{color};'></a>&nbsp;&nbsp;#{title}</div>";
                var colorhtm = "";
                $.each(result.data.B, this.proxy(function (idx, adata) {
                    colorhtm += colortemplate.replace(/#\{color\}/g, adata.color).replace(/#\{title\}/g, adata.title);
                }));
                this.qid("colorinfo").html(colorhtm);
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
                        htmforrow += "<td style='background-color: " + dt.bandingColor + ";'><div class='row' style='margin : 5px 5px;'><div class='col-sm-12 col-xs-12 valuetd'>" + dt.score + "</div></div></td>";
                    }
                    htmforrow += "</tr>";
                }
                this.qid("editbody").html(htmforrow);
                this.qid("edittable").width(realcols * 150);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixs7.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"
    , "../../../uui/widget/colorpalette/js/colorpalette.js"];
com.sms.matrix.matrixs7.widgetcss = [{ path: "../../../uui/widget/colorpalette/css/colorpalette.css" }];
