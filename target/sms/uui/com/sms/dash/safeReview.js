//@ sourceURL=com.sms.dash.safeReview
$.u.define('com.sms.dash.safeReview', null, {
    init: function(options) {
        this._options = options || {};
    },
    afterrender: function(bodystr) {
        var id = $.urlParam().id;
        var s = window.decodeURIComponent(window.decodeURIComponent($.urlParam().s));
        if (!id || !s) {
            window.location.href = "DashBoard.html";
        }
        this.score = this.qid("score");
        this.unitReview = this.qid("unitReview");
        this.subTitle = this.qid("subTitle");
        this.countScore = this.qid("countScore");
        this.remark_v = this.qid("remark_v");
        this.otherChart(id, s);
    },
    otherChart: function(id, s) {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type: "post",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getMethanolById",
                "id": id
            }
        }, this.scoreDiv).done(this.proxy(function(data) {
            if (data.success) {
                if (data.data) {
                    this._table(data.data);
                }
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    _table: function(data) {
        this.unitReview.text(data.unitDisplayName + "安全工作评审表");
        var season = "";
        if (data.season == 1) {
            season = "一";
        } else if (data.season == 2) {
            season = "二";
        } else if (data.season == 3) {
            season = "三";
        } else if (data.season == 4) {
            season = "四";
        }
        this.subTitle.text(data.created + "|" + data.year + "年第" + season + "季度的报表");
        this.remark_v.val(data.remark);
        var $tbody = $('table>tbody', this.scoreDiv);
        $tbody.empty();
        var score = 0;
        data.assessmentProjectInsts && $.each(data.assessmentProjectInsts, this.proxy(function(index, item) {
            var length = item.assessmentCommentInsts.length;
            item.assessmentCommentInsts && $.each(item.assessmentCommentInsts, this.proxy(function(key, value) {
                score += value.completion.score;
                var tr = '<tr>';
                if (key == 0) {
                    tr += '<td rowspan="' + length + '" class="td-color">' + item.name + '</td>';
                }
                var oper = '';
                if (value.type == "R") {
                    oper = '<a href="../safelib/ViewSafeReview.html?id=' + value.assessmentCommentTemplateId + '" target="_blank">查看详情</a>';
                } else if (value.type == "A") {
                    oper = '<a href="../search/Search.html?filterId=' + value.filterId + '" target="_blank">查看详情</a>';
                } else {
                    oper = '';
                }
                tr += '<td>' + (value.description || '') + '</td>' +
                    '<td class="td-color">' + ((value.completion && (value.completion.complete || '')) || '') + '</td>' +
                    '<td>' + (((value.completion && (value.completion.score || '')) || '') == '' ? 0 : ((value.completion && (value.completion.score || '')) || '')) + '</td>' +
                    '<td class="td-color">' + oper + '</td>' +
                    '</tr>';
                $(tr).appendTo($tbody);
            }))
        }))
        this.countScore.text(score);
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});

com.sms.dash.safeReview.widgetjs = ['../../../uui/widget/spin/spin.js',
    '../../../uui/widget/jqblockui/jquery.blockUI.js',
    '../../../uui/widget/ajax/layoutajax.js',
    '../../../uui/widget/jqurl/jqurl.js'
];
com.sms.dash.safeReview.widgetcss = [];