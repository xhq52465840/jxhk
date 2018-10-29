//@ sourceURL=com.sms.matrix.matrixs1
$.u.define('com.sms.matrix.matrixs1', null, {
    init: function (mid) {
        this.__mid = mid;
        this.__addmode = mid ? false : true;

        this.__changed = false;
    },
    afterrender: function () {
    	this.i18n = com.sms.matrix.matrixs1.i18n;
    	
        this.qid("btn_upload").unbind("click").click(this.proxy(this.on_btn_upload))
        this.$.off("click", "button.matrix_btn_next").on("click", "button.matrix_btn_next", this.proxy(this.on_btn_next));
        this.qid("name").unbind("change").change(this.proxy(function () {
            this.__changed = true;
        }));
        this.qid("description").unbind("change").change(this.proxy(function () {
            this.__changed = true;
        }));
        this.qid("form").validate({
            rules: {
                name: "required"
            },
            messages: {
                name: this.i18n.titleNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        })
        if (!this.__addmode) {
            $("button.matrix_btn_next", this.$).text(this.i18n.commitNext);
            $.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                cache: false,
                async: false,
                "data": {
                    "tokenid": $.cookie("tokenid"),
                    "method": "stdcomponent.getbyid",
                    "dataobject": "matrix",
                    "dataobjectid": this.__mid
                }
            }).done(this.proxy(function (result) {
                if (result.success) {
                    this.qid("name").val(result.data.name);
                    this.qid("description").val(result.data.description);
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }
    },
    resize: function () {

    },
    on_btn_next: function (e) {
        e.preventDefault();
        if (this.__changed) {
            if (this.qid("form").valid()) {
                if (this.__addmode) {
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        async: false,
                        "data": {
                            "tokenid": $.cookie("tokenid"),
                            "method": "stdcomponent.add",
                            "dataobject": "matrix",
                            "obj": JSON.stringify({ "name": this.qid("name").val().trim(), "description": this.qid("description").val(), "publish": "N", "status": "Y", "creator": parseInt($.cookie("userid")), "lastUpdater": parseInt($.cookie("userid")) })
                        }
                    }).done(this.proxy(function (result) {
                        if (result.success) {
                            this.__mid = result.data;
                            window.location.href = this.getabsurl("./MatrixS2.html?mid=" + this.__mid);
                        }
                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                    }));
                } else {
                    $.u.ajax({
                        url: $.u.config.constant.smsmodifyserver,
                        type: "post",
                        dataType: "json",
                        cache: false,
                        async: false,
                        "data": {
                            "tokenid": $.cookie("tokenid"),
                            "method": "stdcomponent.update",
                            "dataobject": "matrix",
                            "dataobjectid": this.__mid,
                            "obj": JSON.stringify({ "name": this.qid("name").val().trim(), "description": this.qid("description").val(), "lastUpdater": parseInt($.cookie("userid")) })
                        }
                    }).done(this.proxy(function (result) {
                        if (result.success) {
                            window.location.href = this.getabsurl("./MatrixS2.html?mid=" + this.__mid);
                        }
                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                    }));
                }
            }
        }
        else {
            window.location.href = this.getabsurl("./MatrixS2.html?mid=" + this.__mid);
        }
    },
    on_btn_upload: function (e) {
        e.preventDefault();

    }
}, { usehtm: true, usei18n: true });


com.sms.matrix.matrixs1.widgetjs = ["../../../uui/widget/spin/spin.js"
    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
    , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.matrix.matrixs1.widgetcss = [];
