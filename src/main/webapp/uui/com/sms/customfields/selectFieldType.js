//@ sourceURL=com.sms.customfields.selectFieldType
$.u.define('com.sms.customfields.selectFieldType', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.customfields.selectFieldType.i18n;
    	this.fieldTypesContainer = this.qid("fieldtypes");
    	this.customFieldForm = this.qid("custom-field-form");
    	this.customFieldName = this.qid("custom-field-name");
    	this.customFieldDescription = this.qid("custom-field-description");
    	this.customFieldConfig = this.qid("custom-field-config");
    	this.searchOrNot = this.qid("searchOrNot");
        this.dataColOrNot = this.qid("dataColOrNot");
    	this.customFieldForm.validate({
            rules: {
                "custom-field-name": {
                    required:true
                }
            },
            messages: {
                "custom-field-name": this.i18n.nameNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
    	
    	this.fieldTypeDialog = this.qid("fieldtype-dialog").dialog({
    		width: 840,
    		height: 530,
    		title: this.i18n.selectField,
    		autoOpen: false,
    		modal: true,
    		resizable: false,
    		draggable: false,
    		create: this.proxy(function(){
    			$("<div class='col-sm-4 pull-right searchbox' style='padding-top:10px;'>"+
	    				"<input type='text' class='form-control input-sm search-text' placeholder='"+this.i18n.seacrch+"'/>"+
    			  "</div>").appendTo($(".ui-dialog-titlebar", this.fieldTypeDialog)).find(".search-text").delayedkeyup({
    				  handler: this.proxy(function(e){
    					  var val = $(".ui-dialog-titlebar div.pull-right input.search-text", this.fieldTypeDialog.parent()).val();
    					  this.loadFieldTypes([[{"key": "name","op": "like","value": val}]]);
    				  })
    			  });
    			
    		}),
    		open: this.proxy(function(){
    			this.loadFieldTypes();
    		}),
    		close: this.proxy(function(){
    			this.clearFieldForm();
    			this.fieldTypeDialog.dialog("option",{"width":840,"height":530});
    			$(".firststep-page,.firststep-button,.searchbox", this.fieldTypeDialog.parent()).removeClass("hidden");
    			$(".secondstep-page,.secondstep-button", this.fieldTypeDialog.parent()).addClass("hidden");
    		}),
    		buttons: [
		         {
		        	 "text": this.i18n.nextPage,
		        	 "class": "firststep-button ui-button-primary",
		        	 "click": this.proxy(function(e){
		        		 var $sender=$(e.currentTarget),
		        		 	 typeName=$("li.selected > .field-name",this.fieldTypesContainer).text();
		        		 $sender.add($sender.siblings(":not(.aui-button-link)"))	// 按钮平级元素除.aui-button-link外
		        		 		.add($(".firststep-page,.secondstep-page,.searchbox",this.fieldTypeDialog.parent()))
		        		 		.toggleClass("hidden");
		        		 this.customFieldName.focus();
		        		 this.fieldTypeDialog.dialog("option",{"title":""+this.i18n.config+"“"+typeName+"”"+this.i18n.field+"","width":600,"height":"auto"});
		        		 this.$.find(".field-panel > div:last").css("height","auto");
		        	 })
		         },
		         {
		        	 "text": this.i18n.backPage,
		        	 "class": "secondstep-button hidden",
		        	 "click": this.proxy(function(e){
		        		 var $sender=$(e.currentTarget);
		        		 $sender.add($sender.siblings(":not(.aui-button-link)"))		// 第一页的按钮
		        		 		.add($(".firststep-page,.secondstep-page,.searchbox",this.fieldTypeDialog.parent()))
		        		 		.toggleClass("hidden");
		        		 this.clearFieldForm();
		        		 this.fieldTypeDialog.dialog("option",{"title":this.i18n.selectField,"width":840,"height":530});
		        		 this.$.find(".field-panel > div:last").css("height",417);
		        	 })
		         },
		         {
		        	 "text": this.i18n.create,
		        	 "class": "secondstep-button ui-button-primary hidden",
		        	 "click": this.proxy(function(e){
		        		 if(this.customFieldForm.valid()){
		        			 this.addCustomField({
	        					 type:parseInt($("li.selected",this.fieldTypesContainer).attr("id")),
	        					 name:this.customFieldName.val(),
	        					 description:this.customFieldDescription.val(),
	        					 config:this.customFieldConfig.val(),
	        					 searchable: this.searchOrNot.prop('checked'),
                                 display: this.dataColOrNot.prop('checked')
	        			 	 });
		        		 }
		        	 })
		         },
		         {
		        	 "text": this.i18n.cancel,
		        	 "class": "aui-button-link",
		        	 "click": this.proxy(function(){
		        		 this.fieldTypeDialog.dialog("close");
		        	 })
		         }
    		]
    	});
    	
    	// 字段类型列表的选中事件
    	this.fieldTypeDialog.on("click",".customfields-types > .item",this.proxy(function(e){
    		$(e.currentTarget).addClass("selected");
    		$(e.currentTarget).siblings().removeClass("selected");
    	}));
    	
    },
    /*
     * 添加自定义字段
     * @params field JSON格式自定义字段数据
     */
    addCustomField:function(field){
    	this.disableFieldForm();
    	$.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.add",
        		"dataobject":"customField",
        		"obj":JSON.stringify(field||[])
            }
        }).done(this.proxy(function(response){
        	if(response && response.success){
        		this.fieldTypeDialog.dialog("close");
        		this.refreshDataTable();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableFieldForm();
        }));
    },
    /*
     * 加载字段类型
     */
    loadFieldTypes:function(rules){
    	this.disableFieldForm();
    	$.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid": $.cookie("tokenid"),
        		"method": "stdcomponent.getbysearch",
        		"dataobject": "customFieldType",
        		"rule": JSON.stringify(rules)
            }
        }).done(this.proxy(function(response){
        	if(response && response.success){
        		this.fieldTypesContainer.empty();
        		if(response.data.aaData.length>0){
	        		$.each(response.data.aaData,this.proxy(function(idx,fieldType){
	        			$('<li class="item '+(idx===0?'selected':'')+'" id="'+fieldType.id+'">'+
	        					'<img class="field-preview" src="' + this.getabsurl("../../../img/customFieldThumb/" + fieldType.url) + '" width="120" height="60" />'+
	        					'<h4 class="field-name">'+fieldType.name+'</h4>'+
	        					'<p class="field-description">'+fieldType.description+'</p>'+
	        			  '</li>').appendTo(this.fieldTypesContainer);
	        		}));
        		}else{
        			$("<li><div class='alert alert-info' role='alert'><strong>"+this.i18n.reminder+"</strong><p>"+this.i18n.reminderA+" <a href='../upm/Featured.html'>"+this.i18n.reminderB+"</a> "+this.i18n.reminderC+"</p></div></li>").appendTo(this.fieldTypesContainer);
        			setTimeout(this.proxy(function(){
        				$(".firststep-button",this.fieldTypeDialog.parent()).button("disable");
        			}),100);
        		}
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableFieldForm();
        	$(".ui-dialog-titlebar div.pull-right input.search-text", this.fieldTypeDialog.parent()).focus();
        }));
    },
    /*
     * 清空字段类型表单信息
     */
    clearFieldForm:function(){
    	$("input:text,textarea",this.fieldTypeDialog.parent()).val("");
    	this.customFieldForm.validate().resetForm();
    },
    /*
     * 禁用字段类型表单元素
     */
    disableFieldForm:function(){
    	$("input:text,textarea,.ui-dialog-titlebar button",this.fieldTypeDialog.parent()).attr("disabled",true);
		$(".ui-dialog-buttonpane button:not(.aui-button-link)",this.fieldTypeDialog.parent()).button("disable");
    },
    /*
     * 启用字段类型表单元素
     */
    enableFieldForm:function(){
    	$("input:text,textarea,.ui-dialog-titlebar button",this.fieldTypeDialog.parent()).attr("disabled",false);
		$(".ui-dialog-buttonpane button:not(.aui-button-link)",this.fieldTypeDialog.parent()).button("enable");
    },
    open:function(){
    	this.fieldTypeDialog.dialog("open");
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.customfields.selectFieldType.widgetjs = ["../../../uui/widget/jqdelayedkeyup/delayedkeyup.js"];
com.sms.customfields.selectFieldType.widgetcss = [];