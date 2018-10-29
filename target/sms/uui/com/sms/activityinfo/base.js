//@ sourceURL=com.sms.activityinfo.base
$.u.define('com.sms.activityinfo.base', null, {
    init: function (options) {
        this._options = options || {};
        this._SPECIAL_FIELDS = [];
        this._TITLE = null;
        this._OK_BUTTON_NAME = null;
        this._CANCEL_BUTTON_NAME = null;
        this._GET_CONFIG_METHOD = null;
        this._fields = {};
        this._isFirstLoad=true;
        this._fixedFields = { // 用于覆盖“安监机构”和“类型”字段参数
          unit: {
            renderer: "com.sms.plugin.render.unitProp"
          },
          type: {

          }  
        }
        
        var size = 2 ;
    		this._blockuiopts = {
    		    message: (new Spinner({ radius: 3 * size, width: 1 * size, length: 2 * size , color:"white" }).spin()).el, 
    		    overlayCSS: { 
    		    	backgroundColor: 'transparent' 
    		    },
    		    css:{
    		    	"background": "black", 
    		    	"border": "none",
    		    	"width":40,
    		    	"height":40,
    		    	"border-radius":8,
    		    	"left":"50%"
    		    }
    		};
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    initFieldDialog: function(){
    	this.fieldDialog=this.fieldDialog.dialog({
    		title: this._TITLE,
    		width: 810,
    		modal: true,
    		resizable: false,
    		autoOpen: false,
    		position: ["center",40],
    		create:this.proxy(function(){
    			this.form.unbind("keypress").keypress(this.proxy(function(e){
              if(e.which === 13){
                  this.fieldDialog.parent().find(".ui-dialog-buttonpane button.ok").trigger("click");
                  e.preventDefault();
              }
          }));	
    		}),
    		open: this.proxy(this.on_dialogOpen_click),
    		close:this.proxy(function(){
    			this._isFirstLoad=true; // 将第一次加载标识设置true
    			this.destroyFields(); 
    		}),
    		buttons:[
    		    {
    		    	text: this._OK_BUTTON_NAME,
              "class": "ok",
    		    	click: this.proxy(this.on_dialogcreate_click)
    		    },
    		    {
    		    	text: this._CANCEL_BUTTON_NAME,
    		    	"class":"aui-button-link",
    		    	click: this.proxy(function(){
    		    		this.fieldDialog.dialog("close");
    		    	})
    		    }
    		]
    	});
    },
    open:function(mode){
    	this.type="";
    	if(mode){
    		this.type=mode.type;
    	}
    	this.fieldDialog.dialog("open");
    },
    /**
     * @title 创建安全信息按钮事件
     * @return void
     */
    on_dialogcreate_click:function(){
    	
    },
    on_dialogOpen_click: function(){
    },
    /**
     * @title 加载表单字段
     * @param param
     * @param setDefaultValue 是否设置“安监机构”和“信息类型”的默认值
     * @return void
     */
    reloadFields:function(param, setDefaultValue){
    	this.disable();     	
    	if(this._isFirstLoad){ 
    		this.fieldDialog.parent().addClass("hidden");
    		$.blockUI(this._blockuiopts);
    	}
    	$.u.ajax({
  			  url: $.u.config.constant.smsqueryserver,
          dataType: "json",
          data:$.extend({
    				tokenid: $.cookie("isAnonymityLogin") === "false" ? $.cookie("tokenid") : $.cookie("anonymityTokenid"),
    				method: this._GET_CONFIG_METHOD
  	      },param)
  		},this.fieldDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: this.fieldDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
  			if(this._isFirstLoad){ 
	    		this._isFirstLoad = false;
	    		this.fieldDialog.parent().removeClass("hidden");
	    		$.unblockUI();
	    	}
  			
  			this.enable();
  			this.destroyFields(); 
  			
  			if(response.success){
  				  var unitDefaultValue = null;
  				
  	    		// 特殊处理安监机构和安全信息类型两个字段
  	    		this._options = response.data;
  	    		$.each(this._options.fields,this.proxy(function(idx,field){ 
    	    			if($.inArray(field.key, this._SPECIAL_FIELDS) > -1){
      		    			if(field.key == "unit"){
                        $.extend(true, field, this._fixedFields.unit);
      		    				  unitDefaultValue = JSON.parse(field.defaultValue);
      		    				  this.buildField(field, this.baseArea,this.reloadFields);
      		    			}else if(field.key == "type"){
                        $.extend(true, field, this._fixedFields.type);
      	    	    			field.unit = param.unit || (unitDefaultValue && unitDefaultValue.id); 
      	    	    			field = this.setTypeField(field);
      		    				  this.buildField(field, this.baseArea,this.reloadFields);
      		    			}
    	    			}
      	    }));
            this.baseArea.css({"border-bottom": "1px solid #ddd", "margin-bottom": "15px"});
  	    		this.customfieldform.draw(this._options.fields,this._options.tabs);
      	    // this.qid("field-dialog").css({"maxHeight":$(window).height()*0.8, "overflow-y":"auto"}); 
  			}else{
  				  this.fieldDialog.dialog("close");
  			}
  		})).fail(this.proxy(function(jqXHR, errorText, errorThrown){
  	    	this.enable();
  		}));
    },
    /**
     * @title 创建字段
     * @param field
     * @param $contianer 容器
     * @return void
     */
    buildField:function(field,$contianer,reloadFields){
    	var inputRenderClazz = null,
    			inputRenderObj = null,
    			result = null,
    			sel = null;
    	
    	inputRenderClazz = $.u.load(field.renderer);
  		inputRenderObj = new inputRenderClazz();
  		if($.isFunction(reloadFields)){
  			inputRenderObj.override({
  				reloadFields:this.proxy(function(){
  					reloadFields();
  				})
  			})
  		}
  		result = inputRenderObj.get("edit", "html",field);
  		sel = $(result).appendTo($contianer);
  		inputRenderObj.get("edit","render",field,sel,this.type);
  		this._fields[field.key]={"sel":sel,"comp":inputRenderObj,"field":field};
    },
    /**
     * @title 销毁除安全机构和安全信息类型的自定义字段
     * @return void
     */
    destroyFields:function(){ 
    	$.each(this._fields, this.proxy(function(key, item){
    		item.comp.destroy();
    		delete this._fields[key];
    	})); 
    	this.customfieldform.destroyFields();
    	this.baseArea.empty();
    },
    /**
     * @title 校验表单
     * @return {bool} 校验结果
     */
    valid:function(){
      var isValid = true, temp=true;
      $.each(this._fields, function(idx, item){
        temp = item.comp.get("edit","valid");
        if(!temp && isValid === true){
          isValid = false;
        }
      });
    	return isValid && this.customfieldform.validate();
    },
    /**
     * @title 禁用表单
     * @return void
     */
    disable:function(){
    	this.fieldDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    	$.each(this._fields, function(idx, item){
    		item.comp.get("edit","disable");
    	});
    	this.customfieldform.disable();
    },
    /**
     * @title 启用表单
     * @return void
     */
    enable:function(){
    	this.fieldDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
    	$.each(this._fields,function(idx,item){
    		item.comp.get("edit","enable");
    	});
    	this.customfieldform.enable();
    },
    /**
     * @title 获取数据
     * @returns tempData {object} 表单数据
     */
    getData:function(){ 
    	var tempData = {};
    	$.each(this._fields,function(idx,item){
    		tempData = $.extend({},tempData,item.comp.get("edit","getdata"));
    	});
    	tempData = $.extend({},tempData,this.customfieldform.getData());
    	return tempData;
    },
    setTypeField: function(field){
    	return field;
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.activityinfo.base.widgetjs = [//"../../../uui/widget/select2/js/select2_locale_zh-CN.js",
                                      "../../../uui/widget/spin/spin.js",
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js"];
