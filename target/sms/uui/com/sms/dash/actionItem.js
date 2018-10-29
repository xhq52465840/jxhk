//@ sourceURL=com.sms.dash.actionItem
$.u.define('com.sms.dash.actionItem', null, {
    init: function(mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
    },
    afterrender: function(bodystr) {
        var clz = $.u.load("com.sms.detailmodule.actionItem");
        this.actionItem = new clz($("div[umid=actionItem]", this.$), {
            mode: "DASHBOARD"
        });
        this.actionItem.CONTROL_MEASURE_ID = 9524;
        this.actionItem.reloadByUser();
        $("table", this.$).addClass("dashTable");
    },
    destroy: function() {
        return this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.dash.actionItem.widgetjs = [];
com.sms.dash.actionItem.widgetcss = [];