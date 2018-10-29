//@ sourceURL=com.sms.activityinfo.delete
$.u.load("com.sms.common.confirm");
$.u.define('com.sms.activityinfo.delete', null, {
    init: function (options) {
        this._options = options || {};
        this._i18n = com.sms.activityinfo.delete.i18n;
        this.confirmDialog = null;
    },
    afterrender: function (bodystr) {
    },
    on_ok_click:function(){        
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.delete",
                "dataobject": "activity",
                "dataobjectids": JSON.stringify([this.activityId])
            }
        }, this.confirmDialog.confirmDialog.parent(),{ size: 1}).done(this.proxy(function(response){
            if(response.success){
                window.location.href = this.getabsurl("../search/Search.html");
            }
        }));
    },
    /**
     * @title quick trigger used by detail.html
     * @param activityid {id}
     * @return void
     */
    quickTrigger:function(activityid){
        this.activityId = activityid;
        if(this.activityId){
            this.confirmDialog = new com.sms.common.confirm({
                "title": this._i18n.title,
                "body": this._i18n.body,
                "buttons":{
                    "ok": {
                        "text": this._i18n.buttons.ok,
                        "click": this.proxy(this.on_ok_click)
                    },
                    "cancel": {
                        "text": this._i18n.buttons.cancel
                    }
                }
            });
        }
    },
    /**
     * @title used by overload
     */
    refresh:function(){},
    destroy: function () {
        this._super();
    }
}, { usehtm: false, usei18n: true });


com.sms.activityinfo.delete.widgetjs = ["../../../uui/widget/spin/spin.js",
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js"];
