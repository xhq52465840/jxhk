//@ sourceURL=com.sms.plugin.workflow.fieldRequired
$.u.define('com.sms.plugin.workflow.fieldRequired', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	// 系统字段下拉框
    	this.selSystemFields=this.qid("systemFields");
    	
    	// 必输字段下拉框
    	this.selRequiredFields=this.qid("requiredFields");
    	
    	// “添加已选中的字段”按钮
    	this.btnAddSelectedField=this.qid("btn_addSlectedField");
    	
    	// “删除已选中的字段”按钮
    	this.btnRemoveSelectedField=this.qid("btn_removeSelectedField");
    	
    	this.btnAddSelectedField.click(this.proxy(function(){
    		var $selectedFields = this.selSystemFields.children("option:selected");
    		$.each($selectedFields,this.proxy(function(idx,field){
    			if(this.selRequiredFields.find("option[value='"+$(field).attr("value")+"']").length<1){
    				$(field).clone().appendTo(this.selRequiredFields);
    			}
    		}));
    	}));
    	
    	this.btnRemoveSelectedField.click(this.proxy(function(){
    		this.selRequiredFields.children("option:selected").remove();
    	}));
    	
    	this._options.data ? this.fillData(this._options.data) : null;
    },
    fillData:function(data){
    	$.each(data,this.proxy(function(idx,item){
    		$("<option value='"+item.value+"'>"+item.label+"</option>").appendTo(this.selRequiredFields);
    	}))
    },
    getData:function(){
    	var data=[];
    	$.each(this.selRequiredFields.find("option"),this.proxy(function(idx,option){
    		data.push({label:$(option).text(),value:$(option).attr("value")});
    	}));
    	return data;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.workflow.fieldRequired.widgetjs = [];
com.sms.plugin.workflow.fieldRequired.widgetcss = [];