//@ sourceURL=com.sms.usersetting.usersettingdialog
$.u.define('com.sms.usersetting.usersettingdialog', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.usersetting.usersettingdialog.i18n;
    	this.emailFormat = this.qid("emailFormat");
    	this.pageDisplayNum = this.qid("pageDisplayNum");
    	this.defaultAccess = this.qid("defaultAccess");
    	this.emailUser = this.qid("emailUser");
    	this.autoWatch = this.qid("autoWatch");
    	
    	this.dictionary = {};
    	
    	this.userSettingDialog = this.qid("div_usersetting").dialog({
    	    title: this.i18n.userDefaulted,
    	    width: 540,
    	    modal: true,
    	    draggable: false,
    	    resizable: false,
    	    autoOpen: false,
    	    buttons: [
                {
                    text: this.i18n.update,
                    click: this.proxy(function (e) {
                        var dictionarys = [
                    	                 { "id": this.dictionary.emailFormat, "value": this.emailFormat.val() },
                    	                 { "id": this.dictionary.pageDisplayNum, "value": this.pageDisplayNum.val() },
                    	                 { "id": this.dictionary.defaultAccess, "value": this.defaultAccess.val() },
                    	                 { "id": this.dictionary.emailUser, "value": this.emailUser.is(":checked") ? "Y" : "N" },
                    	                 { "id": this.dictionary.autoWatch, "value": this.autoWatch.is(":checked") ? "Y" : "N" }];
                        this.emailFormat.add(this.defaultAccess).add(this.pageDisplayNum)
                		.add(this.emailUser).add(this.autoWatch).attr("disabled", true);
                        $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
                        $.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            dataType: "json",
                            cache: false,
                            data: {
                                "tokenid": $.cookie("tokenid"),
                                "method": "stdcomponent.updateall",
                                "dataobject": "dictionary",
                                "objs": JSON.stringify(dictionarys)
                            }
                        }).done(this.proxy(function (response) {
                            if (response.success) {
                                this.userSettingDialog.dialog("close");
                                this.refreshDataTable();
                            } 
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        })).complete(this.proxy(function () {
                            this.emailFormat.add(this.defaultAccess).add(this.pageDisplayNum)
                    		.add(this.emailUser).add(this.autoWatch).attr("disabled", false);
                            $(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                        }));
                    })
                },
                {
                    text: this.i18n.cancel,
                    "class": "aui-button-link",
                    click: this.proxy(function () {
                        this.userSettingDialog.dialog("close");
                    })
                }
    	    ],
    	    create: this.proxy(function () {

    	    }),
    	    open: this.proxy(function () {
    	        this.emailFormat.add(this.defaultAccess).add(this.pageDisplayNum)
            		.add(this.emailUser).add(this.autoWatch).attr("disabled", true);
    	        $.ajax({
    	            url: $.u.config.constant.smsqueryserver,
    	            type: "post",
    	            dataType: "json",
    	            cache: false,
    	            data: {
    	                "tokenid": $.cookie("tokenid"),
    	                "method": "stdcomponent.getbysearch",
    	                "dataobject": "dictionary",
    	                "rule": JSON.stringify([[{ "key": "type", "value": "用户缺省设置" }]])
    	            }
    	        }).done(this.proxy(function (response) {
    	            if (response.success) {
    	                $.each(response.data.aaData, this.proxy(function (idx, item) {
    	                    this.dictionary[item.key] = item.id;
    	                    if ($.inArray(item.key, ["emailUser", "autoWatch"]) > -1) {
    	                        this[item.key].prop("checked", item.value == "是");
    	                    } else {
    	                        this[item.key].val(item.value);
    	                    }
    	                }));
    	            } 
    	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

    	        })).complete(this.proxy(function () {
    	            this.emailFormat.add(this.defaultAccess).add(this.pageDisplayNum)
            		.add(this.emailUser).add(this.autoWatch).attr("disabled", false);
    	        }));
    	    }),
    	    close: this.proxy(function () {
    	        this.pageDisplayNum.val("");
    	        this.emailUser.add(this.autoWatch).prop("checked", false);
    	    })
    	});
    },
    open: function (userdata) {
        this.userSettingDialog.dialog("open");
    },
    destroy: function () {
        this._super();
        this.userSettingDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.usersetting.usersettingdialog.widgetjs = [];
com.sms.usersetting.usersettingdialog.widgetcss = [];