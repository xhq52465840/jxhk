//@ sourceURL=com.sms.dash.juneyao.approvalSummary
/**
 * @desc 待处理的统计看板
 * @author tchen@usky.com.cn
 * @date 2016/11/15
 */
$.u.define('com.sms.dash.juneyao.approvalSummary', null, {
    init: function(mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._targetLink = $.u.config.appname + 'com/sms/dash/DashBoard.html?pageId=33312538&scrollTarget='
        this._link = {
            info: this._targetLink + '33511558',
            audit: this._targetLink + '33511557',
            risk: this._targetLink + '33511556',
            actionItem: $.u.config.appname+'com/audit/validate/RiskValidate.html?cmd=dwzx',
            assist: this._targetLink + '33511554',
            review: this._targetLink + '33511559',
        };
    },
    afterrender: function(bodystr) {
        this.$infoWaitForMe = this.qid('infoWaitForMe');
        this.$auditWaitForMe = this.qid('auditWaitForMe');
        this.$riskWaitForMe = this.qid('riskWaitForMe');
        this.$actionItemWaitForMe = this.qid('actionItemWaitForMe');
        this.$assistWaitForMe = this.qid('assistWaitForMe');
        this.$reviewWaitForMe = this.qid('reviewWaitForMe');

        this.qid('link-container').on('click', 'a.link-dashboard', this.proxy(this.on_link_click));

        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "get",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "getToDoStatistics"
            },
            dataType: "json"
        }, this.$).done(this.proxy(function(resp) {
            var data = resp ? (resp.data || {}) : {};
            this.$infoWaitForMe.addClass(data.activityCount === 0 ? 'hidden' : '').text(data.activityCount);
            this.$auditWaitForMe.addClass(data.auditCount === 0 ? 'hidden' : '').text(data.auditCount);
            this.$riskWaitForMe.addClass(data.riskCount === 0 ? 'hidden' : '').text(data.riskCount);
            this.$actionItemWaitForMe.addClass(data.actionItemCount === 0 ? 'hidden' : '').text(data.actionItemCount);
            this.$assistWaitForMe.addClass(data.assistCount === 0 ? 'hidden' : '').text(data.assistCount);
            this.$reviewWaitForMe.addClass(data.methanolCount === 0 ? 'hidden' : '').text(data.methanolCount);
        }));
    },
    /**
     * @title 超链接点击事件
     */
    on_link_click: function(e) {
        e.preventDefault();
        window.top.location.href = $(this).attr('href');
    },
    destroy: function() {
        return this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.dash.juneyao.approvalSummary.widgetjs = [
    "../../../../uui/widget/spin/spin.js",
    "../../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../../uui/widget/ajax/layoutajax.js",
];
com.sms.dash.juneyao.approvalSummary.widgetcss = [];