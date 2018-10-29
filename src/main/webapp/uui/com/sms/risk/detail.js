//@ sourceURL=com.sms.risk.detail
$.u.define('com.sms.risk.detail', null, {
    init: function (option) {
    	this._options = option || {};
        /*{
            "mode" : "add", // add or edit or view
            "activityId": 12,
            "riskId": 13
        }*/
        this._urlParam = $.urlParam();
        this._MODE = {
            ADD: "add",
            EDIT: "edit",
            VIEW: "view"
        };
        this._COMPLETE = "完成";
        this._NEW = "新建";
        this._urlParam.mode = this._urlParam.mode || this._MODE.VIEW;
        this._urlParam.riskId = this._urlParam.mode !== this._MODE.ADD ? (this._urlParam.riskId ? parseInt(this._urlParam.riskId) : null) : null;
        this._urlParam.activityId = this._urlParam.activityId ? parseInt(this._urlParam.activityId) : null;
        this._i18n = com.sms.risk.detail.i18n;
    },
    afterrender: function (bodystr) { 			
    	this.riskInformation = null;
        this.riskAnalysis = null;
        this.riskMessage = null;

        this.qid("btn_save").click(this.proxy(this.on_save_click));
        this.qid("btn_submit").click(this.proxy(this.on_submit_click));
        this.qid("btn_assignment").click(this.proxy(this.on_assignment_click));
        this.qid("btn_generateReport").click(this.proxy(this.on_generateReport_click));
        this.qid("btn_back").click(this.proxy(this.on_back_click));

        this._loadRisk();
    },
    on_save_click: function(e){ 
        var formData = this.riskInformation.getFormData();
        /*if(!formData.activity){
            $.u.alert.error(this._i18n.messages.activityIsNull, 1000 * 3);
            return;
        } */
        if(!formData.rsummary){
            $.u.alert.error(this._i18n.messages.summaryIsNull, 1000 * 3);
            return;
        }
        if(!formData.rdescription){
            $.u.alert.error(this._i18n.messages.descriptionIsNull, 1000 * 3);
            return;
        }
        formData.status = this._NEW; 
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.add",
                "dataobject": "risk",
                "obj": JSON.stringify(formData)
            },
            block: this.qid("btn_save"),
            callback: this.proxy(function(response){
                if(response.success){
                    //TODO after save risk exec
                    window.location.href = "RiskDetail.html?mode=edit&riskId=" + response.data;
                }
            })
        });
    },
    on_submit_click: function(e){
        if(this._urlParam.riskId){
            var clz = $.u.load("com.sms.common.confirm");
            var confirm = new clz({
                "body": this._i18n.messages.confirmSubmit,
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                            this._ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                data: {
                                    "method": "stdcomponent.update",
                                    "dataobject": "risk",
                                    "dataobjectid": this._urlParam.riskId,
                                    "obj": JSON.stringify({"status": this._COMPLETE})
                                },
                                block: confirm.confirmDialog.parent(),
                                callback: this.proxy(function(response){
                                    if(response.success){
                                        window.location.reload();
                                    }
                                })
                            });
                        })
                    }
                }
            });
            
        }
    },
    on_assignment_click: function(e){
        if(this._urlParam.riskId){
            if(!this.riskMessage){
                var clz = $.u.load("com.sms.notice.create");
                this.riskMessage = new clz(this.$.find("div[umid=riskMessage]"), { "sourceType": "RISK" });
            }
            this.riskMessage.quickTrigger(this._urlParam.riskId);
        }
    },
    on_generateReport_click: function(e){
        if(this._urlParam.riskId){
            var form = $("<form>");   //定义一个form表单
            form.attr('style', 'display:none');   //在form表单中添加查询参数
            form.attr('target', '');
            form.attr('method', 'post');
            form.attr('action', $.u.config.constant.smsqueryserver + "?method=generateReport&tokenid=" + $.cookie("tokenid") + "&risk=" + this._urlParam.riskId + "&url=" + window.encodeURIComponent(window.location.host + window.location.pathname + window.location.search));
            form.appendTo('body').submit().remove();
        }        
    },
    on_back_click: function(e){
    	window.history.back(); 
       // window.location.href = this.getabsurl("RiskAnalysis.html");
    },
    _loadRisk: function(){
        if(this._urlParam.riskId && this._urlParam.mode !== this._MODE.ADD){
            this._ajax({
                data: {
                    "method": "stdcomponent.getbyid",
                    "dataobject": "risk",
                    "dataobjectid": this._urlParam.riskId 
                },
                block: this.$,
                callback: this.proxy(function(response){
                    if(response.success){ 
                        var opt_riskInformation = $.extend(true, {}, this._urlParam, { "editable": response.data.editable && response.data.status !== this._COMPLETE}),
                            opt_riskAnalysis = $.extend(true, {}, this._urlParam, { "editable": response.data.status !== this._COMPLETE}),
                            clz_riskinformation = null,
                            clz_riskAnalysis = null;
                        clz_riskinformation = new $.u.load("com.sms.detailmodule.riskInformation");
                        this.riskInformation = new clz_riskinformation( this.$.find("div[umid=riskInformation]"), opt_riskInformation );
                        if(this._urlParam.mode !== this._MODE.ADD){ 
                            clz_riskAnalysis = new $.u.load("com.sms.detailmodule.riskAnalysis");
                            this.riskAnalysis = new clz_riskAnalysis( this.$.find("div[umid=riskAnalysis]"), opt_riskAnalysis );
                        }
                        this.riskInformation.fillForm(response.data);
                        this.riskAnalysis && this.riskAnalysis.fillForm(response.data);                        
                        if(response.data.editable === false || response.data.status === this._COMPLETE){
                            this.$.find(".mode-add,.mode-edit").remove();
                        }
                        this._entryMode();
                    }
                })
            });
        }else{
            if(this._urlParam.mode === this._MODE.EDIT && !this._urlParam.riskId){
                return;
            }
            var clz_riskinformation = new $.u.load("com.sms.detailmodule.riskInformation");
            this.riskInformation = new clz_riskinformation( this.$.find("div[umid=riskInformation]"), this._urlParam );
            if(this._urlParam.mode !== this._MODE.ADD){ 
                var clz_riskAnalysis = new $.u.load("com.sms.detailmodule.riskAnalysis");
                this.riskAnalysis = new clz_riskAnalysis( this.$.find("div[umid=riskAnalysis]"), this._urlParam);
            }
            this._entryMode();
        }
    },
    _entryMode: function(){
        this.$.find(".mode-add,.mode-edit").addClass("hidden");
        if(this._urlParam.mode === this._MODE.ADD){
            this.qid("title").text(this._i18n.status.add);
            this.$.find(".mode-add").removeClass("hidden");
        }else if(this._urlParam.mode === this._MODE.EDIT){
            this.qid("title").text(this._i18n.status.edit);
            this.$.find(".mode-edit").removeClass("hidden");
        }else if(this._urlParam.mode === this._MODE.VIEW){
            this.qid("title").text(this._i18n.status.view);
        }
        this.riskInformation.entryMode();
        this.riskAnalysis && this.riskAnalysis.entryMode();
    },
    _ajax: function(param){
        $.u.ajax({
            url: param.url || $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: $.extend(true, {
                "tokenid": $.cookie("tokenid")
            }, (param.data || {}) )
        }, param.block).done(this.proxy(param.callback));
    },    
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.risk.detail.widgetjs = ["../../../uui/widget/jqurl/jqurl.js", 
                                  "../../../uui/widget/spin/spin.js", 
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/widget/ajax/layoutajax.js"];
com.sms.risk.detail.widgetcss = [];