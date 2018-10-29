//@ sourceURL=com.sms.pwdpolicy.pwdpolicy
$.u.define('com.sms.pwdpolicy.pwdpolicy', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	// 自定义密码策略区域
        this.customSettingArea = this.qid("div_custompolicy");
        
        // “更新”按钮
        this.btnUpdate=this.qid("btn_update");
        
        // 点击“自定义密码策略”时显示自定义密码策略的区域
        $(":radio[name='pwdpolicy']",this.$).unbind("click").click(this.proxy(function (e) {
            var $this = $(e.currentTarget);
            if ($this.val() == "custom") {
                this.customSettingArea.show();
            } else {
                this.customSettingArea.hide();
            }
        }));

    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.pwdpolicy.pwdpolicy.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.pwdpolicy.pwdpolicy.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];