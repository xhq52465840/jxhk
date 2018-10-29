//@ sourceURL=com.sms.detailmodule.assignmentPublish
/**
 * 指定具体发布处理人进行发布任务
 * @author tchen@usky.com.cn
 * @date 2016/11/21
 */
$.u.define('com.sms.detailmodule.assignmentPublish', null, {
    init: function(option) {
        /**
         ** {
         **     activity: '',   // 安全信息ID
         **     orgId: ''       // 组织ID
         ** }
         **/
        this._options = option || {};
    },
    afterrender: function(bodystr) {
        this.i18n = com.sms.detailmodule.assignmentPublish.i18n;
        this.$handlePeople = this.qid('handlePeople');

        this.publishDialog = this.qid("publishDialog").dialog({
            title: this.i18n.title,
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                text: this.i18n.buttons.publish,
                "class": "publish-task",
                click: this.proxy(this.on_dialog_ok)
            }, {
                text: this.i18n.buttons.cancel,
                "class": "aui-button-link",
                click: this.proxy(this.on_dialog_cancel)
            }],
            create: this.proxy(this.on_dialog_create),
            open: this.proxy(this.on_dialog_open),
            close: this.proxy(this.on_dialog_close)
        });
    },
    /**
     * @title 发布
     */
    on_dialog_ok: function() {
        this.on_after_publish([this.$handlePeople.select2('val')]);
    },
    /**
     * @title 取消
     */
    on_dialog_cancel: function() {
        this.publishDialog.dialog("close");
    },
    /**
     * @title 模态层创建时执行
     */
    on_dialog_create: function() {
        var searchTerm = '';
        this.$handlePeople.select2({
            width: '100%',
            placeholder: this.i18n.selectHandlePeople,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                data: this.proxy(function(term, page) {
                    searchTerm = term;
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getRiskAnalysisPerson",
                        organization: this._options.orgId
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: $.grep(response.data, function(item, idx){
                                return item.displayName.indexOf(searchTerm) > -1;
                            })
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item) {
                return '<img src="'+item.avatarUrl+'" width="16" height="16" />' + '&nbsp;'+item.displayName;
            },
            formatResult: function(item) {
                return '<img src="'+item.avatarUrl+'" width="16" height="16" />' + '&nbsp;'+item.displayName;
            }
        }).on('select2-removed', this.proxy(function(){
            var data = this.$handlePeople.select2('data');
            if(!data || ($.isArray(data) && data.length === 0)){
                 this.publishDialog.parent().find("button.publish-task").button("disable");
            }
        })).on('select2-selecting', this.proxy(function(){
            this.publishDialog.parent().find("button.publish-task").button("enable");
        }));
    },
    /**
     * @title 模态层打开时执行
     */
    on_dialog_open: function() {
        this.publishDialog.parent().find("button.publish-task").button("disable");
    },
    /**
     * @title 模态层关闭时执行
     */
    on_dialog_close: function() {
        this.$handlePeople.select2('val', null);
        this.on_after_cancel();
    },
    /**
     * @title 打开组件
     * @params {object} data - 参数信息，包含组织
     */
    open: function(data) {
        $.extend(this._options, data || {});
        this.publishDialog.dialog().dialog("open");
    },
    /**
     * @title “发布”后调用，用于重载
     * @params {Array} userIds - 用户ID集合
     */
    on_after_publish: function(userIds) {

    },
    /**
     * @title “取消”后调用，用于重载
     */
    on_after_cancel: function() {

    },
    destroy: function() {
        this.publishDialog.dialog("destroy").remove();
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});


com.sms.detailmodule.assignmentPublish.widgetjs = [];
com.sms.detailmodule.assignmentPublish.widgetcss = [];