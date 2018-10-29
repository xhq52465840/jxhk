//@ sourceURL=com.sms.dash.juneyao.carousel
/**
 * @desc 安全动态
 * @author tchen@usky.com.cn
 * @date 2016/11/15
 */
$.u.define('com.sms.dash.juneyao.carousel', null, {
    init: function(mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
    },
    afterrender: function(bodystr) {
        
    },
    destroy: function() {
        return this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.dash.juneyao.carousel.widgetjs = [];
com.sms.dash.juneyao.carousel.widgetcss = [];