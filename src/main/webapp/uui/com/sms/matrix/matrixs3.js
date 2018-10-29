//@ sourceURL=com.sms.matrix.matrixs3
$.u.define('com.sms.matrix.matrixs3', null, {
    init: function (mid, changesteps) {
        this.__mid = parseInt(mid);
        this._numrange = [1, 5];
        this._charrange = ["A", "E"];

        this.__changesteps = changesteps;
        this.__changed = false;
    },
    afterrender: function () {
        this.$.off("click", "button.matrix_btn_next").on("click", "button.matrix_btn_next", this.proxy(this.on_btn_next));
        this.$.off("click", "button.matrix_btn_prev").on("click", "button.matrix_btn_prev", this.proxy(this.on_btn_prev));
        this.$.off("click", "button.serious-btn").on("click", "button.serious-btn", this.proxy(this.on_btn_serious));
        this.$.off("click", "button.possible-btn").on("click", "button.possible-btn", this.proxy(this.on_btn_possible));
        this.$.off("change", "select.serious-sel").on("change", "select.serious-sel", this.proxy(this.on_sel_serious));
        this.$.off("change", "select.possible-sel").on("change", "select.possible-sel", this.proxy(this.on_sel_possible));
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
                "dataobject": "range",
                "rule": JSON.stringify(rule)
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                var serious_num = true, possible_num = true;
                var serious_val_start = null, serious_val_end = null, possible_val_start = null, possible_val_end = null;
                $.each(result.data.aaData, this.proxy(function (idx, adata) {
                    if (adata.type == "S") {
                        // 严重性
                        if (adata.style == "char") {
                            serious_num = false;
                        }
                        else {
                            serious_num = true;
                        }
                        if (!serious_val_start) {
                            serious_val_start = adata.source;
                            serious_val_end = adata.source;
                        }
                        else {
                            if (serious_val_start > adata.source) {
                                serious_val_start = adata.source;
                            }
                            if (serious_val_end < adata.source) {
                                serious_val_end = adata.source;
                            }
                        }
                    }
                    else {
                        // 可能性
                        // 严重性
                        if (adata.style == "char") {
                            possible_num = false;
                        }
                        else {
                            possible_num = true;
                        }
                        if (!possible_val_start) {
                            possible_val_start = adata.source;
                            possible_val_end = adata.source;
                        }
                        else {
                            if (possible_val_start > adata.source) {
                                possible_val_start = adata.source;
                            }
                            if (possible_val_end < adata.source) {
                                possible_val_end = adata.source;
                            }
                        }
                    }
                }));
                if (serious_num) {
                    this.tonumselect($("select.serious-sel", this.$).first());
                    $("button.serious-btn", this.$).first().addClass("active");
                } else {
                    this.tocharselect($("select.serious-sel", this.$).first());
                    $("button.serious-btn", this.$).last().addClass("active");
                }
                if (possible_num) {
                    this.tonumselect($("select.possible-sel", this.$).first());
                    $("button.possible-btn", this.$).first().addClass("active");
                } else {
                    this.tocharselect($("select.possible-sel", this.$).first());
                    $("button.possible-btn", this.$).last().addClass("active");
                }
                this.buildpreview(serious_val_start, serious_val_end, possible_val_start, possible_val_end);

            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    resize: function () {

    },
    on_btn_next: function (e) {
        e.preventDefault();
        if (this.__changed || (this.__changesteps != null && this.__changesteps.indexOf("S2") > -1)) {
            var serious_num = true, possible_num = true;
            var serious_val_start = null, serious_val_end = null, possible_val_start = null, possible_val_end = null;

            var ssels = $("select.serious-sel", this.$).first();
            serious_val_start = ssels.val();
            var ssele = ssels.next();
            serious_val_end = ssele.val();
            var psels = $("select.possible-sel", this.$).first();
            possible_val_start = psels.val();
            var psele = psels.next();
            possible_val_end = psele.val();

            var btnss = $("button.serious-btn", this.$).first();
            if (btnss.hasClass("active")) {
                serious_num = true;
            }
            else {
                serious_num = false;
            }
            var btnps = $("button.possible-btn", this.$).first();
            if (btnps.hasClass("active")) {
                possible_num = true;
            }
            else {
                possible_num = false;
            }
            var objs = [];
            var i = 0;            
            for (i = serious_val_start.charCodeAt() ; i <= serious_val_end.charCodeAt() ; i++) {
                objs.push({ source: String.fromCharCode(i), type: "S", style: serious_num ? "digit" : "char", matrix: this.__mid });
            }
            for (i = possible_val_start.charCodeAt() ; i <= possible_val_end.charCodeAt() ; i++) {
                objs.push({ source: String.fromCharCode(i), type: "P", style: possible_num ? "digit" : "char", matrix: this.__mid });
            }
            $.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                cache: false,
                data: {
                    "tokenid": $.cookie("tokenid"),
                    "method": "updateAll",
                    "dataobject": "matrix",
                    "subObj": "range",
                    "objs": JSON.stringify(objs)
                }
            }, this.$).done(this.proxy(function (result) {
                if (result.success) {
                    window.location.href = this.getabsurl("./MatrixS4.html?mid=" + this.__mid);
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }
        else {
            window.location.href = this.getabsurl("./MatrixS4.html?mid=" + this.__mid);
        }
    },
    on_btn_prev: function (e) {
        e.preventDefault();
        window.location.href = this.getabsurl("./MatrixS2.html?mid=" + this.__mid);
    },
    on_btn_serious: function (e) {
        e.preventDefault();
        this.__changed = true;
        var $btn = $(e.currentTarget);
        if (!$btn.hasClass("active")) {
            $("button.serious-btn.active", this.$).removeClass("active");
            $btn.addClass("active");
            if ($btn.text() == "123") {
                this.tonumselect($("select.serious-sel", this.$).first());
            }
            else {
                this.tocharselect($("select.serious-sel", this.$).first());
            }
        }
        this.buildpreview();
    },
    on_btn_possible: function (e) {
        e.preventDefault();
        var $btn = $(e.currentTarget);
        this.__changed = true;
        if (!$btn.hasClass("active")) {
            $("button.possible-btn.active", this.$).removeClass("active");
            $btn.addClass("active");
            if ($btn.text() == "123") {
                this.tonumselect($("select.possible-sel", this.$).first());
            }
            else {
                this.tocharselect($("select.possible-sel", this.$).first());
            }
        }
        this.buildpreview();
    },
    on_sel_serious: function (e) {
        var sel = $(e.currentTarget);
        if (sel.hasClass("sel-s")) {
            var selval = sel.val();
            $.each(sel.next().children(), function (idx , achd) {
                if ($(achd).val() < selval) {
                    $(achd).hide();
                }
                else {
                    $(achd).show();
                }
            });            
            sel.next().children().first().prop("selected", true);
        }
        this.__changed = true;
        this.buildpreview();
    },
    on_sel_possible: function (e) {
        var sel = $(e.currentTarget);
        if (sel.hasClass("sel-s")) {
            var selval = sel.val();
            $.each(sel.next().children(), function (idx, achd) {
                if ($(achd).val() < selval) {
                    $(achd).hide();
                }
                else {
                    $(achd).show();
                }
            });
            sel.next().children().first().prop("selected", true);
        }
        this.__changed = true;
        this.buildpreview();
    },
    tonumselect: function (firstselectsel) {
        var i = 0;
        firstselectsel.empty();
        for (i = this._numrange[0]; i <= this._numrange[1]; i++) {
            firstselectsel.append("<option value='" + i + "'>" + i + "</option>");
        }
        firstselectsel.next().empty();
        for (i = this._numrange[1]; i >= this._numrange[0]; i--) {
            firstselectsel.next().append("<option value='" + i + "'>" + i + "</option>");
        }
    },
    tocharselect: function (firstselectsel) {
        var i = 0;
        firstselectsel.empty();
        for (i = this._charrange[0].charCodeAt() ; i <= this._charrange[1].charCodeAt() ; i++) {
            firstselectsel.append("<option value='" + String.fromCharCode(i) + "'>" + String.fromCharCode(i) + "</option>");
        }
        firstselectsel.next().empty();
        for (i = this._charrange[1].charCodeAt() ; i >= this._charrange[0].charCodeAt() ; i--) {
            firstselectsel.next().append("<option value='" + String.fromCharCode(i) + "'>" + String.fromCharCode(i) + "</option>");
        }
    },
    buildpreview: function (serious_val_start, serious_val_end, possible_val_start, possible_val_end) {
        this.qid("perviewcols").empty();
        this.qid("previewbody").empty();
        var i;
        var prevpossible = $("select.possible-sel", this.$).first();
        if (possible_val_start) {
            prevpossible.val(possible_val_start);            
        }
        else {
            this.__changed = true;
        }
        if (possible_val_end) {
            prevpossible.next().val(possible_val_end);
        } else {
            this.__changed = true;
        }
        var ps = prevpossible.val();
        var pe = prevpossible.next().val();
        var cols = pe.charCodeAt() - ps.charCodeAt() + 1;
        if (cols <= 0) {
            cols = 1;
        }
        this.qid("perviewcolnum").attr("colspan", cols);
        for (i = ps.charCodeAt() ; i <= pe.charCodeAt() && ((i - ps.charCodeAt()) < cols) ; i++) {
            this.qid("perviewcols").append("<th>" + String.fromCharCode(i) + "</th>");
        }
        var prevserious = $("select.serious-sel", this.$).first();
        if (serious_val_start) {
            prevserious.val(serious_val_start);
        } else {
            this.__changed = true;
        }
        if (serious_val_end) {
            prevserious.next().val(serious_val_end);
        } else {
            this.__changed = true;
        }
        var rs = prevserious.val();
        var re = prevserious.next().val();
        var htmforrow = "<tr><td class='serioustd'>#{num}</td>";
        for (i = 0; i < cols ; i++) {
            htmforrow += "<td>&nbsp;</td>";
        }
        htmforrow += "</tr>";
        for (i = rs.charCodeAt() ; i <= re.charCodeAt() ; i++) {
            this.qid("previewbody").append(htmforrow.replace(/#\{num\}/g, String.fromCharCode(i)));
        }
        this.qid("previewtable").width((cols + 1) * 100);
    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixs3.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.matrix.matrixs3.widgetcss = [];
