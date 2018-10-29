//@ sourceURL=com.sms.review.setReviewUnit
$.u.define('com.sms.review.setReviewUnit', null, {
    init: function (options) {
        this._options = options;
        this.userdat=null;
    },
    afterrender: function (bodystr) {
    	this.i18n =com.sms.review.setReviewUnit.i18n;
    	
    	this.selUnits=this.qid("availableunits");
    	
    	this.selCurrUnits=this.qid("currentunits");
    	
    	this.btnJoinSelectedUnits=this.qid("btn_joinselectedunits");
    	
    	this.btnLeaveSelectedUnits=this.qid("btn_leaveselectedunits");
    	
    	// 添加以选中的安监机构的按钮事件
        this.btnJoinSelectedUnits.button().click(this.proxy(function(e){
        	e.preventDefault();
            var unitIds = [], selectedOptions = [];
        	$.each(this.selUnits.children("option:selected"),this.proxy(function(idx,obj){
        		var $option=$(obj);
                if(this.selCurrUnits.find("option[name='"+$option.text()+"']").length < 1){
                    unitIds.push({"unit": parseInt($option.val())});
                    selectedOptions.push($option);
                }
        	}));
            if(unitIds.length === 0){
                $.u.alert.error(this.i18n.messages.selectedUnit);
                return;
            }
            $.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                data: {
                    tokenid: $.cookie("tokenid"),
                    method: "stdcomponent.addall",
                    dataobject: "assessmentUnit",
                    objs: JSON.stringify(unitIds)
                }
            }, this.selUnits.parent()).done(this.proxy(function(response){
                if(response.success){
                    $.each(selectedOptions, function(idx, item){
                        item.remove();
                    });
                    this._loadReviewUnits();
                }
            }));
        }));
        
        // 移除选中的安监机构的按钮事件
        this.btnLeaveSelectedUnits.button().click(this.proxy(function(e){
        	e.preventDefault();
            var ids = [], selectedOptions = [];
            $.each(this.selCurrUnits.children("option:selected"),this.proxy(function(idx,obj){
                var $option=$(obj);
                ids.push(parseInt($option.val()));
                selectedOptions.push($option);
            }));
            if(ids.length === 0){
                $.u.alert.error(this.i18n.messages.selectedUnit);
                return;
            }
            var clz = $.u.load("com.sms.common.confirm");
            var confirm = new clz({
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                            $.u.ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                type: "post",
                                dataType: "json",
                                data: {
                                    tokenid: $.cookie("tokenid"),
                                    method: "stdcomponent.delete",
                                    dataobject: "assessmentUnit",
                                    dataobjectids: JSON.stringify(ids)
                                }
                            }, this.selCurrUnits.parent()).done(this.proxy(function(response){
                                if(response.success){
                                    confirm.confirmDialog.dialog("close");
                                    this._loadReviewUnits();
                                }
                            }));
                        })
                    }
                }
            });
            
        }));

        this.userGroupDialog = this.qid("div_usergroup").dialog({
            title: this.i18n.title,
            width:540,
            modal: true,
            draggable:false,
            resizable: false,
            autoOpen: false,
            buttons: [
                {
                    text: this.i18n.close,
                    "class": "aui-button-link",
                    click: this.proxy(function () {
                        this.userGroupDialog.dialog("close");
                    })
                }
            ],
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
                this._loadReviewUnits();
            }),
            close:this.proxy(function(){
            	this.selCurrUnits.empty();
            })
        }); 
    },
    _loadUnits: function(){
        this.selUnits.attr("disabled",true);
        this.btnJoinSelectedUnits.button("disable");
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid":$.cookie("tokenid"),
                "method":"stdcomponent.getbysearch",
                "dataobject":"unit"
            }
        }, this.selUnits.parent()).done(this.proxy(function(response){
            if(response.success){
                this.selUnits.empty();
                $.each(response.data.aaData,this.proxy(function(idx, unit){
                    if(this.selCurrUnits.children("option[label=" + '"'+ unit.name +'"' + "]").length === 0){
                        $("<option/>").attr("value",unit.id).text(unit.name).appendTo(this.selUnits);
                    }
                }));
            }
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
            
        })).complete(this.proxy(function(jqXHR,errorStatus){
            this.selUnits.attr("disabled",false);
            this.btnJoinSelectedUnits.button("enable");
        }));
    },
    _loadReviewUnits: function(){
        this.selCurrUnits.attr("disabled",true);
        this.btnLeaveSelectedUnits.button("disable");
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
                "tokenid":$.cookie("tokenid"),
                "method":"stdcomponent.getbysearch",
                "dataobject":"assessmentUnit"
            }
        }, this.selCurrUnits.parent()).done(this.proxy(function(response){
            if(response.success){
                this.selCurrUnits.empty();
                $.each(response.data.aaData, this.proxy(function(idx,item){
                    $("<option/>").attr({"value": item.id, "label": item.unit}).text(item.unit).appendTo(this.selCurrUnits);
                }));
                this._loadUnits();
            }
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
            
        })).complete(this.proxy(function(jqXHR,errorStatus){
            this.selCurrUnits.attr("disabled",false);
            this.btnLeaveSelectedUnits.button("enable");
        }));
    },
    open: function (userdata) {
	    this.userGroupDialog.dialog("open");
    },
    destroy: function () {
        this._super();
        this.userGroupDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.review.setReviewUnit.widgetjs = [];
com.sms.review.setReviewUnit.widgetcss = [];