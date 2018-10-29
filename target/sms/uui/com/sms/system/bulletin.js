//@ sourceURL=com.sms.system.bulletin
$.u.define('com.sms.system.bulletin', null, {
    init: function () {
    },
    afterrender: function () {
        this.qid("btn_save").unbind("click").click(this.proxy(this.on_btn_save_click));
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type: "post",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "stdcomponent.getbysearch",
                dataobject: "bulletin"
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                var dt = result.data.aaData[0];
                this.qid("content").val(dt.content);
                this.qid(dt.visibility).prop("checked", true);
                this.qid("form").attr("real", dt.id);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    on_btn_save_click: function (e) {
        e.preventDefault();
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            dataType: "json",
            type: "post",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "stdcomponent.update",
                dataobject: "bulletin",
                dataobjectid: parseInt(this.qid("form").attr("real")),
                obj: JSON.stringify({ content: this.qid("content").val(), visibility: (this.qid("PUBLIC").prop("checked") ? "PUBLIC" : "PRIVATE") })
            }
        }, this.$).done(this.proxy(function (result) {
            if (result.success) {
                $.u.alert.info(com.sms.system.bulletin.i18n.succeed);
            } 
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    }
}, { usehtm: true, usei18n: true });


com.sms.system.bulletin.widgetjs = [];
com.sms.system.bulletin.widgetcss = [];