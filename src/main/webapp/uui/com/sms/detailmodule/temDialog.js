//@ sourceURL=com.sms.detailmodule.temDialog
$.u.define('com.sms.detailmodule.temDialog', null, {
    init: function (option) {
    	this._options = option;
    	this._select2PageLength = 10;
    	this.data = null; 				// 当前TEM数据
    	this.currSeverity = null;		// 当前严重程度
    	this.currInsecurity = null;		// 当前不安全状态
    	this.currConsequence = null;	// 当前重大风险
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.temDialog.i18n;
    	this.form=this.qid("form"); 				  			// 表单
    	this.severity = this.qid("severity");					// 严重程度
    	this.provision = this.qid("provision");					// 对应条款
    	this.insecurity = this.qid("insecurity");               // 不安全状态
    	this.consequence = this.qid("consequence");             // 重大风险
    	
    	this.form.validate({
    		rules:{
    			"severity":"required",
    			"provision":"required",
    			"insecurity":"required",
    			"consequence":"required"
    		},
    		messages:{
    			"severity":"严重程度不能为空",
    			"provision":"对应条款不能为空",
    			"insecurity":"不安全状态不能为空",
    			"consequence":"重大风险不能为空"
    		},
    		errorClass: "text-danger text-validate-element",
            errorElement:"div"
    	});
    	
    	this.formDialog = this.qid("dialog").dialog({
            title:this.i18n.title,
            width:740,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
                {
                	"text":this.i18n.ok,
                	"click":this.proxy(this.on_formDialogSave_click)
                },
                {
                	"text":this.i18n.cancel,
                	"class":"aui-button-link",
                	"click":this.proxy(this.on_formDialogCancel_click)
                }
            ],
            create:this.proxy(this.on_formDialog_create),
            open:this.proxy(this.on_formDialog_open),
            close:this.proxy(this.on_formDialog_close)
        }); 
    	
    },
    /**
     * @title 保存
     * @return void
     */
    on_formDialogSave_click:function(){
    	var params = {
            "tokenid": $.cookie("tokenid"),
    		"dataobject": "tem"
        };
    	if(this.data && this.data.id){
    		params.method = "stdcomponent.update";
    		params.dataobjectid = this.data.id;
    		params.obj = JSON.stringify(this._getData());
    	}
    	if(this._validForm()){
    		$.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                data: params
            }, this.formDialog.parent(),{size:2}).done(this.proxy(function (response) {
                if (response.success) { 
                    this.refreshDataTable(this._getData("json"));
                	this.formDialog.dialog("close");
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
            	
            }));
    	}
    },
    /**
     * @title 取消
     * @return void
     */
    on_formDialogCancel_click:function(){
    	this.formDialog.dialog("close");
    },
    /**
     * @title 模态层创建时执行
     * @returns void
     */
    on_formDialog_create:function(){
    	this.severity.select2(this._getSelect2Config({
    		"dataobject": "severity"
    	})).on("select2-selecting", this.proxy(this.on_select2_selecting));
    	this.provision.select2(this._getSelect2Config({
    		"dataobject": "provision"
    	})).on("select2-selecting", this.proxy(this.on_select2_selecting));
    	this.insecurity.select2($.extend(this._getSelect2Config({
    		"dataobject": "insecurity"
    	}),{"allowClear":true,"placeholder":"请选择不安全状态"})).on("select2-selecting", this.proxy(this.on_select2_selecting)).on("select2-clearing",this.proxy(this.on_select2_clearing));
    	this.consequence.select2($.extend(this._getSelect2Config({
    		"dataobject":"consequence"
    	}),{"allowClear":true,"placeholder":"请选择重大风险"})).on("select2-selecting", this.proxy(this.on_select2_selecting)).on("select2-clearing",this.proxy(this.on_select2_clearing));
    	
    },
    /**
     * @title 模态层中打开执行
     * @return void 
     */
    on_formDialog_open:function(){
    	this._fillForm(this.data);
    },
    /**
     * @title 模态层关闭执行
     * @return void
     */
    on_formDialog_close:function(){
    	this._clearForm();
    },
    /**
     * @title 填充表单
     * @param {object} data 备注json数据
     * @return void
     */
    _fillForm:function(data){
    	if(data){
    		this.severity.select2("data",data.severity);
        	this.provision.select2("data",data.provision);
        	this.insecurity.select2("data",data.insecurity);
        	this.consequence.select2("data",data.consequence);
        	this.currSeverity = data.severity ? data.severity.id : null;
        	this.currInsecurity = data.insecurity ? data.insecurity.id : null;
        	this.currConsequence = data.consequence ? data.consequence.id : null;
    	}
    },
    /**
     * @title 清空表单
     * @return void
     */
    _clearForm:function(){
    	this.severity.select2("val","");
    	this.provision.select2("val","");
    	this.insecurity.select2("val","");
    	this.consequence.select2("val","");
    	this.form.validate().resetForm();
    },
    /**
     * @title 获取表单数据
     * @param format {string} 数据格式
     * @return {object} 表单json数据
     */
    _getData:function(format){
    	var data = null;
    	if (format == "json"){
	    	data = {
				severity : this.severity.select2("data"),
		    	provision : this.provision.select2("data"),
		    	insecurity : this.insecurity.select2("data"),
		    	consequence : this.consequence.select2("data")
	    	};
    	}else{
	    	data = {
				severity : parseInt(this.severity.select2("val")),
		    	provision : parseInt(this.provision.select2("val")),
		    	insecurity : parseInt(this.insecurity.select2("val")),
		    	consequence : parseInt(this.consequence.select2("val"))
	    	};
    	}
    	return data;
    },
    /**
     * @title 验证表单必输项
     * @retur {bool} 表单验证合格为true
     */
    _validForm:function(){
    	return this.form.valid();
    },
    /**
     * @title select2的选中事件
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_select2_selecting:function(e){
    	var $this = $(e.target),qid=$this.attr("qid"),object = e.object;
    	switch(qid){
    		case "severity":
    			this.currSeverity = object.id;
    			this.provision.select2("val","");
    			break;
    		case "insecurity":
    			this.currInsecurity = object.id;
    			break;
    		case "consequence":
    			this.currConsequence = object.id;
    			break;
    		// no default
    	}
    },
    /**
     * @title select2的清空事件
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_select2_clearing:function(e){
    	var $this = $(e.target),qid=$this.attr("qid"),object = e.object;
    	switch(qid){
    		case "severity":
    			this.currSeverity = null;
    			break;
    		case "insecurity":
    			this.currInsecurity = null;
    			break;
    		case "consequence":
    			this.currConsequence = null;
    			break;
    		// no default
    	}
    },
    /**
     * @title 获取select2的配置参数
     * @param params {object} ajax的参数
     */
    _getSelect2Config:function(params){
    	var config = {
	    	ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data:this.proxy(function(term, page){
	            	var rule = [[{"key":"name","op":"like","value":term}]];
	            	switch(params.dataobject){
		            	case "provision":
		        			this.currSeverity && rule.push([{"key":"severity","value":this.currSeverity}]);
		        			break;
		            	case "insecurity":
		            		this.currConsequence && rule.push([{"key":"consequence","value":this.currConsequence}]);
		            		rule.push([{"key": "system", "value": this.data && this.data.sysTypeId}]);
		        			break;
		            	case "consequence":
		            		this.currInsecurity && rule.push([{"key":"insecurity","value":this.currInsecurity}]);
		            		rule.push([{"key": "system", "value": this.data && this.data.sysTypeId}]);
		        			break;
		        		// no default
	            	}
	            	return $.extend({
	            		"tokenid": $.cookie("tokenid"),
	            		"method": "stdcomponent.getbysearch"	       
	    			},params,{"rule":JSON.stringify(rule)});
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){
		        		return {
		        			results:response.data.aaData
		        		};
		        	}
		        })
    		},
    		formatResult:function(item){
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
    	};
    	return config;
    },
    /**
     * @title 打开模态层
     * @param {object} data 备注json数据
     * @return void
     */
    open:function(data){
    	this.data = data;
    	this.formDialog.dialog("open");
    },
    /**
     * @title 用于重写
     */
    refreshDataTable:function(dataid, data){},
    destroy: function () {
    	this.form.validate("destroy");
    	this.severity.select2("destroy");
    	this.provision.select2("destroy");
    	this.insecurity.select2("destroy");
    	this.consequence.select2("destroy");
    	this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.temDialog.widgetjs = ['../../../uui/widget/validation/jquery.validate.js','../../../uui/widget/jqurl/jqurl.js'];
com.sms.detailmodule.temDialog.widgetcss = [];