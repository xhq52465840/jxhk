//@ sourceURL=com.sms.customfields.buildform
$.u.define('com.sms.customfields.buildform', null, {
    init: function (options) {
        this._options = options;
        this.fields={}; 	// 存放字段定义集合
    },
    afterrender: function (bodystr) {
    	this.form = this.qid("form"); 
    },
    /**
     * @title 绘制表单
     * @param field {object} 字段集合
     * @param tabs {Array} tab数组
     * @return void
     */
    draw:function(fields,tabs){
    	this.destroyFields(); // 销毁所有自定义字段
    	
    	if(tabs.length == 1){ // 只有1个tab时，不初始化tab组件
        	$.each(tabs[0].fields,this.proxy(function(idx,field){
        		this._buildField(field, this.form);
        	}));
    	}else{
    		var $nav = $('<ul class="nav nav-tabs sms-tabs" role="tablist"></ul>').appendTo(this.form);
    		var $content = $('<div class="tab-content sms-tabs"></div>').appendTo(this.form);
    		var $div=null;
    		$.each(tabs,this.proxy(function(idx,tab){
        		$('<li class="'+(idx == tabs.length-1 ? "active" : "")+'"><a href="#'+tab.name+'" role="tab" data-toggle="tab">'+tab.name+'</a></li>').prependTo($nav);
        		$div = $('<div class="tab-pane '+(idx == tabs.length-1 ? "active" : "")+'" id="'+tab.name+'"></div>').prependTo($content);
        		$.each(tab.fields,this.proxy(function(idx,field){
            		this._buildField(field, $div);
            	}));
        	}));
    	}
    },
    /**
     *  @title 校验必填项
     *  @return isValid {bool} 是否校验通过
     */
    validate:function(){
    	var isValid = true, temp=true;
    	$.each(this.fields,function(idx,item){
    		temp = item.comp.get("edit","valid");
    		if(!temp && isValid === true){
    			isValid = false;
    		}
    	});
    	return isValid;
    },
    /**
     * @title 获取表单数据
     * @return tempData {object} 表单数据
     */
    getData:function(){
    	var tempData = {};
    	$.each(this.fields,function(idx,item){
    		tempData = $.extend({},tempData,item.comp.get("edit","getdata"));
    	});
    	return tempData;
    },
    /**
     * @title 禁用表单字段
     * @return void
     */
    disable:function(){
    	$.each(this.fields,function(idx,item){
    		item.comp.get("edit","disable");
    	});
    },
    /**
     * @title 启用表单字段
     * @return void
     */
    enable:function(){
    	$.each(this.fields,function(idx,item){
    		item.comp.get("edit","enable");
    	});
    },   
    /**
     * @title 销毁所有自定义字段
     * @return void
     */
    destroyFields:function(){
    	this.fields && $.each(this.fields,this.proxy(function(key,item){
    		item.comp.destroy();
    		delete this.fields[key];
    	}));
    	this.form.empty();	 
    },
    /**
     * @title 创建字段
     * @param field {object} 字段定义
     * @param $contianer {jquery object} jquery容器
     * @return void
     */
    _buildField:function(field,$contianer){
    	var inputRenderClazz = null,
			inputRenderObj = null,
			result = null,
			sel = null;
    	
    	inputRenderClazz = $.u.load(field.renderer);
		inputRenderObj = new inputRenderClazz();
		result = inputRenderObj.get("edit", "html",field);
		sel = $(result).appendTo($contianer);
		inputRenderObj.get("edit","render",field,sel);
		this.fields[field.key]={"sel":sel,"comp":inputRenderObj,"field":field};
		if(field.editable){
			inputRenderObj.get("edit","enable");
		}else{
			inputRenderObj.get("edit","disable");
		}
    },
    destroy: function () {
    	this.destroyFields();
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.customfields.buildform.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.customfields.buildform.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];