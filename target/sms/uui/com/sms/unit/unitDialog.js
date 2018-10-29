//@ sourceURL=com.sms.unit.unitDialog
$.u.define('com.sms.unit.unitDialog', null, {
    init: function (options) {
        this._options = options;
        this._select2UserPageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n =com.sms.unit.unitDialog.i18n;
    	// 容器
    	this.unitdialog=this.qid("unit-dialog");
    	
    	// 第一页
    	this.unitrow=this.qid("unit-row");
    	
    	// 第二页-表单
    	this.unitform=this.qid("unit-form");
   	
    	// 名称
    	this.unitname=this.qid("unit-name");
    	
    	// 键值
    	this.unitkey=this.qid("unit-key");
    	
    	this.qid("unit-person").select2({
			width:290,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term, page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "stdcomponent.getbysearch",
        				"dataobject": "user",
        				"search": JSON.stringify({"value":term}),
        				"start": (page - 1) * this._select2UserPageLength,
        				"length": this._select2UserPageLength
	            	};
	            }),
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        		return {results:response.data.aaData, more: page * this._select2UserPageLength < response.data.iTotalRecords};
		        	}
		        })
	        },
	        formatResult:function(item){
	        	return "<img src='"+item.avatarUrl+"' width='16' height='16'/>&nbsp;"+item.fullname+"-"+item.username;      		
	        },
	        formatSelection:function(item){
	        	return item.fullname+"("+item.username+")";	        	
	        }
		});
    	
    	// 初始化表单校验组件
    	this.unitform.validate({
            rules: {
                "unit-name": {
                    required:true
                },
                "unit-key":{
                	required:true
                },
                "unit-person":{
                	required:true
                }
            },
            messages: {
                "unit-name": this.i18n.nameNotNull,
                "unit-key":this.i18n.keyNotNull,
                "unit-person":this.i18n.agencyNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
    	
    	// 初始化弹出窗口
    	this.unitdialog=this.$.dialog({
    		width:840,
    		title:this.i18n.selectSafeAgency,
    		autoOpen:false,
    		modal:true,
    		resizable:false,
    		draggable: false,
    		create:this.proxy(function(){
//    			$("<div class='col-sm-4 pull-right' style='padding-top:10px;'><div class='input-group'>"+
//    					"<input type='text' class='form-control input-sm search-text' placeholder='搜索'/>"+
//    					"<span class='input-group-btn'>"+
//    						"<button class='btn btn-default search-button' style='font-size:14px;'><span class='glyphicon glyphicon-search'></span></button>"+
//    					"</span>"+
//    			  "</div></div>").appendTo($(".ui-dialog-titlebar",this.fieldTypeDialog));
    		}),
    		open:this.proxy(function(){
    			this.loadRow();
    		}),
    		close:this.proxy(function(){
    			this.clearFieldForm();
    			$(".firststep-page,.firststep-button",this.unitdialog.parent()).removeClass("hidden");
    			$(".secondstep-page,.secondstep-button",this.unitdialog.parent()).addClass("hidden");
    		}),
    		buttons:[
		         {
		        	 "text":"下一步",
		        	 "class":"firststep-button ui-button-primary",
		        	 "click":this.proxy(function(e){
		        		 var $sender=$(e.currentTarget),
		        		 	 //typeName=$("li.selected > .field-name",this.unitrow).text();
		        		 typeName=this.i18n.createSafeAgency;
		        		 $sender.add($sender.siblings(":not(.aui-button-link)"))	// 按钮平级元素除.aui-button-link外
		        		 		.add($(".firststep-page,.secondstep-page",this.unitdialog))
		        		 		.toggleClass("hidden");
		        		 this.unitname.focus();
		        		 this.unitdialog.dialog("option","title",typeName);
		        	 })
		         },
		         {
		        	 "text":this.i18n.back,
		        	 "class":"secondstep-button hidden",
		        	 "click":this.proxy(function(e){
		        		 var $sender=$(e.currentTarget);
		        		 $sender.add($sender.siblings(":not(.aui-button-link)"))		// 第一页的按钮
		        		 		.add($(".firststep-page,.secondstep-page",this.unitdialog))
		        		 		.toggleClass("hidden");
		        		 this.clearFieldForm();
		        		 this.unitdialog.dialog("option","title",this.i18n.selectSafeAgency);
		        	 })
		         },
		         {
		        	 "text":this.i18n.commit,
		        	 "class":"secondstep-button ui-button-primary hidden",
		        	 "click":this.proxy(function(e){
		        		 if(this.unitform.valid()){
		        			 this.addUnit({
	        					 name:this.unitname.val(),
	        					 code:this.unitkey.val(),
	        					 responsibleUser:parseInt(this.qid("unit-person").select2("val"))
	        			 	 });
		        		 }
		        	 })
		         },
		         {
		        	 "text":this.i18n.cancel,
		        	 "class":"aui-button-link",
		        	 "click":this.proxy(function(){
		        		 this.unitdialog.dialog("close");
		        	 })
		         }
    		]
    	});
    	
    	// 第一页列表的选中事件
    	this.unitdialog.on("click",".customfields-types > .item",this.proxy(function(e){
    		$(e.currentTarget).addClass("selected");
    		$(e.currentTarget).siblings().removeClass("selected");
    	}));
    },
    /*
     * 添加自定义字段
     * @params field JSON格式自定义字段数据
     */
    addUnit:function(field){
    	this.disableFieldForm();
    	$.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.add",
        		"dataobject":"unit",
        		"obj":JSON.stringify(field||[])
            }
        }).done(this.proxy(function(response){
        	if(response.success){
        		this.unitdialog.dialog("close");
        		this.refreshDataTable(response.data);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableFieldForm();
        }));
    },
    /*
     * 加载安监机构类型
     */
    loadRow:function(rules){
    	this.disableFieldForm();
    	$.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbysearch",
        		"dataobject":"customFieldType",
        		"rule":JSON.stringify(rules)
            }
        }).done(this.proxy(function(response){
//        	if(response && response.success){
//        		this.unitrow.empty();
//        		if(response.data.aaData.length>0){
//	        		$.each(response.data.aaData,this.proxy(function(idx,fieldType){
//	        			$row=$('<div class="row"></div>').appendTo(this.unitrow);
//	        			$('<li class="item '+(idx===0?'selected':'')+'" id="'+fieldType.id+'">'+
//	        					'<img class="field-preview" src="'+fieldType.url+'" width="120" height="60" />'+
//	        					'<h4 class="field-name">'+fieldType.name+'</h4>'+
//	        					'<p class="field-description">'+fieldType.description+'</p>'+
//	        			  '</li>').appendTo($row);
//	        		}));
//        		}else{
//        			$("<li><div class='alert alert-info' role='alert'><strong>无相关自定义字段类型。</strong><p>尝试去 <a href='../upm/Featured.html'>应用商店</a> 搜索其他自定义字段类型。</p></div></li>").appendTo(this.fieldTypesContainer);
//        			setTimeout(this.proxy(function(){
//        				$(".firststep-button",this.fieldTypeDialog.parent()).button("disable");
//        			}),100);
//        		}
//        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableFieldForm();
        }));
    },
    /*
     * 清空字段类型表单信息
     */
    clearFieldForm:function(){
    	$("input:text",this.unitdialog).val("");
    	this.unitform.validate().resetForm();
    },
    /*
     * 禁用字段类型表单元素
     */
    disableFieldForm:function(){
    	$("input:text,textarea,.ui-dialog-titlebar button",this.unitdialog).attr("disabled",true);
		$(".ui-dialog-buttonpane button:not(.aui-button-link)",this.unitdialog).button("disable");
    },
    /*
     * 启用字段类型表单元素
     */
    enableFieldForm:function(){
    	$("input:text,textarea,.ui-dialog-titlebar button",this.unitdialog).attr("disabled",false);
		$(".ui-dialog-buttonpane button:not(.aui-button-link)",this.unitdialog).button("enable");
    },
    open:function(){
    	this.unitdialog.dialog("open");
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unit.unitDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'];
com.sms.unit.unitDialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];