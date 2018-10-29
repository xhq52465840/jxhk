//@ sourceURL=com.sms.detailmodule.selectControl
$.u.define('com.sms.detailmodule.selectControl', null, {
    init: function (option) {
    	this._options = option || {};
        this._PAGE_SIZE = 10;
        this._CURRENT_PAGE = 1;
        this._TR_TEMPLATE = "<tr>" +
                                "<td><input type='checkbox' data-id='#{id}' /></td>" +
                                "<td>#{number}</td>" +
                                "<td style='padding: 5px 5px 5px 0;'>#{title}</td>" +
                            "</tr>";
        this._type = null;
        this._threatOrErrorId = null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.selectControl.i18n;
    	this.tbody = this.qid("tbody");
        this.ads = this.qid("ads");
        this.btnSearch = this.qid("btn_search");
        this.btnReset = this.qid("btn_reset");
        this.btnMore = this.qid("btn_more");
    
        this.btnSearch.click(this.proxy(this.on_search_click));
        this.btnReset.click(this.proxy(this.on_reset_click));
        this.btnMore.click(this.proxy(this.on_more_click));
        this.qid("btn_checkAll").click(this.proxy(this.on_checkAll_click));

        this.controlDialog = this.qid("controlDialog").dialog({
            title: this.i18n.title,
            width: 740,
            modal: true,
            resizable: false,
            autoOpen: false,
            buttons: [
                { text: this.i18n.buttons.ok, click: this.proxy( this.on_ok_click )},
                { text: this.i18n.buttons.cancel, "class": "aui-button-link",click: this.proxy( this.on_cancel_click )}
            ],
            open: this.proxy( this.on_dialog_open ),
            close: this.proxy( this.on_dialog_close )
        });
    },
    on_checkAll_click: function(e){
        var checked = $(e.currentTarget).prop("checked");
        this.tbody.find("input:checkbox").prop("checked", checked);
    },
    on_search_click: function(){
        this._CURRENT_PAGE = 1;
        this._loadData(this.tbody);
    },
    on_reset_click: function(){
        this.ads.val("");
        this.btnSearch.trigger("click");
    },
    on_dialog_open: function(){
        this.btnReset.trigger("click");
    },
    on_dialog_close: function(){
        this.qid("btn_checkAll").prop("checked", false);
    },
    on_ok_click: function(){
        var controlIds = $.map(this.tbody.find(":checkbox:checked"), function(checkbox, idx){
            return parseInt($(checkbox).attr("data-id"));
        });
        if(controlIds.length === 0){
            $.u.alert.error(this.i18n.messages.noselect, 1000 * 3);
            return;
        }
        this.save(controlIds);
    },
    on_cancel_click: function(){
        this.controlDialog.dialog("close");
    },
    on_more_click: function(e){
        this._CURRENT_PAGE ++;
        this._loadData(this.btnMore);
    },
    _loadData: function($block){ 
        if(this._CURRENT_PAGE === 1){
            this.tbody.empty();
        }
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "stdcomponent.getbysearch",
                "dataobject": "control",
                "rule": JSON.stringify([[{ "key": "title", "op": "like", "value": this.ads.val() }, { "key": "number", "op": "like", "value": this.ads.val() }], [{"key": this._type, "value": this._threatOrErrorId}]]),
                "start": (this._CURRENT_PAGE - 1) * this._PAGE_SIZE,
                "length": this._PAGE_SIZE
            }
        },$block).done(this.proxy(function(response){
            if(response.success){
                if(response.data.iTotalRecords > (this._CURRENT_PAGE * this._PAGE_SIZE) ){
                    this.btnMore.removeClass("hidden");
                }else{
                    this.btnMore.addClass("hidden");
                }
                $.each(response.data.aaData, this.proxy(function(idx, item){
                    this._drawTr(item);
                }));
            }
        }));
    },
    _drawTr: function(data){ 
        $(this._TR_TEMPLATE.replace(/#\{id\}/g, data.id).replace(/#\{number\}/g, data.number).replace(/#\{title\}/g, data.title)).appendTo(this.tbody);
    },
    save: function(ids){},
    open: function(param){
        this._type = param.type;
        this._threatOrErrorId = param.threatOrErrorId;
        this.controlDialog.dialog("open");
    },
    destroy: function () {
        
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.selectControl.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js",
                                             "../../../uui/widget/validation/jquery.validate.js"];
com.sms.detailmodule.selectControl.widgetcss = [];