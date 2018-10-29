//@ sourceURL=com.sms.safePromotion.rewardDialog
/**
 * 增加/编辑奖惩记录对话框
 * @author wans
 */
$.u.define('com.sms.safePromotion.rewardDialog', null, {
    init: function(options) {
        this._options = options || {};
        this._SELECT2_PAGE_LENGTH = 10;
        
    },
    afterrender: function() {
    	this.i18n = com.sms.safePromotion.rewardDialog.i18n;
        this.rewardUnit = this.qid("rewardUnit");
        this.rewardUserName = this.qid("rewardUserName");
        this.rewardType = this.qid("rewardType");
        this.rewardGrade = this.qid("eventGrade");
        this.rewardDate = this.qid("eventDate");
        this.rewardAmmount = this.qid("rewardAmmount");
        this.rewardReason = this.qid("rewardReason");
        this.rewardContent = this.qid("rewardContent");
        this.rewardRemark = this.qid("rewardRemark");
        this.form = this.qid("form");
        this.rewardType.on("change",this.proxy(function(){
        	this.rewardGrade.select2("data","");
        	if(this.rewardType.val()=="R"){
        		this.rewardGrade.select2("enable",false);
        	}else if(this.rewardType.val()=="P"){
        		this.rewardGrade.select2("enable",true);
        	}
        }));
        this.rewardUnit.on("change",this.proxy(function(){
            this.rewardUserName.select2('val',null);
        }));
        this.rewardDialog = this.qid("rewardDialog").dialog({
            title: this.i18n.title,
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text": this.i18n.buttons.confirm,
                "click": this.proxy(this.on_ok_click)
            }, {
                "text": this.i18n.buttons.cancel,
                "class": "aui-button-link",
                "click": this.proxy(this.on_cancel_click)
            }],
            create:this.proxy(this.on_dialog_create),
            open:this.proxy(this.on_dialog_open),
            close: this.proxy(this.on_dialog_close)
        });
        
        
        

    },
    /**
     * @title 模态层创建时执行
     */
    on_dialog_create: function() {
        this.rewardUnit.select2({
            width: '100%',
            multiple: false,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getunits",
                        dataobject: "unit",
                        unitName:term
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data,
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }

                })
            },
            formatResult: function(item) {
                return item.name;
            },
            formatSelection: function(item) {
                return item.name;
            }
        })
        //姓名
        this.rewardUserName.select2({
            width: '100%',
            multiple: false,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                	 var rewardUnitId = parseInt(this.rewardUnit.select2('val')); 
                     return {
                         tokenid: $.cookie("tokenid"),
                         method: "getUsersByUnitIds",
                         unitIds: JSON.stringify([rewardUnitId]),
                         term: term.toString(),
                         start: (page - 1) * this._SELECT2_PAGE_LENGTH,
                         length: this._SELECT2_PAGE_LENGTH
                     };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return item.displayName;
                // return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.fullname;
            },
            formatSelection: function(item) {
                return item.displayName;
                // return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.fullname;
            }
        }).on('select2-opening', this.proxy(function(e){
        	if(!this.rewardUnit.select2('val')){
        		$.u.alert.error('请选择所属部门');
        		this.rewardUnit.select2('open');
        		e.preventDefault();
        	}
        }));
        /**
         * @title 事件等级
         */
        this.rewardGrade.select2({
            width: '100%',
            multiple: false,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                     return {
                         tokenid: $.cookie("tokenid"),
                         method: "stdcomponent.getbysearch",
                         dataobject:"dictionary",
                         rule: JSON.stringify([[{"key":"type","value":"事件等级"}], [{key:"name",op:"like",value:term}]]),
                         "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
 	    				"length": this._SELECT2_PAGE_LENGTH
                     };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return item.name;
                // return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.fullname;
            },
            formatSelection: function(item) {
                return item.name;
                // return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.fullname;
            }
        });
      /**
       * @title 事发时间
       */
        this.rewardDate.datepicker({
            "dateFormat": "yy-mm-dd"
        });
        this.form = this.qid("form").validate({
            rules: {
                rewardUnit: "required",
                rewardUserName: "required",
                rewardType: "required",
                eventDate: "required",
                rewardAmmount: {
                    required: true,
                    number: true,
                    max: 99999999.99,
                    min:-99999999.99
                },
                rewardReason: "required",
                rewardContent: "required",
            },
            messages: {
                rewardUnit: "请选择所属部门",
                rewardUserName: "请选择被奖惩人",
                rewardType: "请选择奖惩类别",
                eventDate: "请选择事发时间",
                rewardAmmount: {
                    required: "请输入奖惩金额",
                    number: "请输入数字"
                },
                rewardReason: "请输入奖惩原因",
                rewardContent: "请输入奖惩内容",
            },
            errorClass: 'text-danger',
            errorElement: 'div'
        });
        
    },
    /**
     * @title 模态层打开时执行
     */
    on_dialog_open: function() {
    	
    },
    /**
     * @title 模态层关闭时执行
     */
    on_dialog_close: function() {
        this.clearFormData();
        this.qid("form").validate().resetForm(); 
    },
        
    
    on_ok_click:function(){
    	this.form = this.qid("form");
    	if(this.rewardType.val()=="P" && this.rewardGrade.select2("val")==""){
    		$.u.alert.error("请选择事件等级");
    	}else{
    		if(this.form.valid()){
            	this.fresh(this.getFormData());
            };
    	}
    },
    fresh:function(param){
    	
    },
    on_cancel_click:function(){
    	this.rewardDialog.dialog("close");
    },
 
    open: function(param) {
        if(param.mode=='edit'){
             this.rewardDialog.dialog("option", {title:"编辑奖惩记录"});
            $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "stdcomponent.getbyid",
                dataobject: 'rewards',
                dataobjectid: param.id
            },
            dataType: "json"
        }, this.$analysisContainer).done(this.proxy(function(response) {
            if (response.success && response.data) {
                this.rewardUnit.select2('data', {id:response.data.rewardUnit,name:response.data.rewardUnitDisplayName});
                this.rewardUserName.select2('data', {id:response.data.rewardTarget,displayName:response.data.rewardTargetDisplayName});
                this.rewardGrade.select2('data', {id:response.data.eventLevel,
                	                              name:response.data.eventLevelDisplayName,
                	                              text:response.data.eventLevelDisplayName
                	                               });                
                this.rewardDate.val(response.data.occurDate);
                this.rewardType.val(response.data.rewardType.code);  
                this.rewardAmmount.val(response.data.rewardAmount);                        //奖惩类别
                this.rewardReason.val(response.data.rewardReason);                  //原因
                this.rewardContent.val(response.data.rewardContent);                   //内容
                this.rewardRemark.val(response.data.remark); 
                if(this.rewardType.val()=="R"){
                	this.rewardGrade.select2("enable",false);
                }else if(this.rewardType.val()=="P"){
                	this.rewardGrade.select2("enable",true);
                }
            }
        }));
        };
        this.rewardDialog.dialog("open");
    },
    getFormData: function() {
    	var rewardAmount = this.rewardAmmount.val();
		var fixNum = new Number(parseFloat(rewardAmount)+1).toFixed(2);   //四舍五入之前加1  
		var rewardNum = new Number(fixNum - 1).toFixed(2);                //四舍五入之后减1，再四舍五入一下  
        return {
                 rewardUnit: parseInt(this.rewardUnit.select2('val')), 		//所属单位 
                 rewardTarget: parseInt(this.rewardUserName.select2('val')),  //姓名
                 eventLevel: parseInt(this.rewardGrade.select2('val')),  //姓名                
                 rewardType: this.rewardType.val(), //奖惩类别
                 occurDate: this.rewardDate.val(),
                 rewardAmount: isNaN(rewardNum)?'':parseFloat(rewardNum),    //金额
                 rewardReason: this.rewardReason.val(),   					//原因
                 rewardContent: this.rewardContent.val(), 					//内容
                 remark: this.rewardRemark.val(), 							//备注
             };
        },
    clearFormData: function() {
        this.rewardUnit.select2('val',null),
        this.rewardUserName.select2('val',null),
        this.rewardGrade.select2('val',null),
        this.rewardType.val(null),                          /*事件等级*/
        this.rewardGrade.select2("enable",false);
        this.rewardDate.val(null),                          /*事发时间*/
        this.rewardAmmount.val(null),                       /*奖惩类别*/
        this.rewardReason.val(null),                        /*原因*/
        this.rewardContent.val(null),                      /*内容*/
        this.rewardRemark.val(null)                         /*备注*/
     },
    _ajax: function(url, param, $container, blockParam, callback) {
        $.u.ajax({
            "url": url,
            "type": url.indexOf(".json") > -1 ? "get" : "post",
            "data": $.cookie("tokenid") ? $.extend({
                "tokenid": $.parseJSON($.cookie("tokenid"))
            }, param) : $.extend({
                "tokenid": $.parseJSON($.cookie("uskyuser")).tokenid
            }, param),
            "dataType": "json"
        }, $container, $.extend({}, blockParam)).done(this.proxy(function(response) {
            if (response.success) {
                callback && callback(response);
            }
        })).fail(this.proxy(function(jqXHR, responseText, responseThrown) {

        }));
    },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: true
});

com.sms.safePromotion.rewardDialog.widgetjs = [
    "../../../uui/widget/jqurl/jqurl.js",
    "../../../uui/widget/select2/js/select2.min.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.safePromotion.rewardDialog.widgetcss = [{
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}];