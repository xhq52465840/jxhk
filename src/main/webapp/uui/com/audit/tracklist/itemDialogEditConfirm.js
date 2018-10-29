//@ sourceURL=com.audit.tracklist.itemDialogEditConfirm
$.u.define('com.audit.tracklist.itemDialogEditConfirm', null, {
	
	
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
    	this._options.dataobject = "unit";
    	this._avatarIsVisible = false;
    	this._personSelect2Length = 10;
    	this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	var verarry=[];
    	var	parryid=[];//JSON.stringify([[{"key":"type","value":arryid.type}],[{"key":"version","value":arryid.version}],[{"key":"profession","value":arryid.profession}]])
    	var	carryid=[];
    	var	verarrya=[];
    	
    	this.i18n = com.audit.tracklist.itemDialogEditConfirm.i18n;
    	this.form = this.qid("unit-form");
	    this.$validMsg = this.form.find(".validmsg");
    	this.formDialog = this.qid("item-dialog-edit-confirm").dialog({
            title: this._options.title,
            width: 740,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function(){
            	this.buildForm();
            }),
            open: this.proxy(function(){
	            	this.fillFormData(this._options.data);
	            	if(this._options.data.disabled){
	            		$(":text,textarea",this.form).attr("disabled",true);
	            	}
	            	
            }),
            close: this.proxy(function(){
            		this.clearFormData();
            })
        }); 
    	

 	 // // 验证结论下拉框初始化
   	this.qid("unit-confirmResult").select2({
   		placeholder: "选择验证结论",
		data: [{id:'通过',text:'通过'},{id:'未通过',text:'未通过'},{id:'暂时无法完成',text:'暂时无法完成'}]
   	});
   	
   },
    
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(params){
    	var dialogOptions=null;
    	if(params.mode=="SHOWDETAIL"){
    		this._options.mode = params.mode;
            this._options.data = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: "关闭",
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.formDialog.dialog("close");
                        })
                    }
                ]
        	}
    	}else if (params.mode=="EDIT") {
            this._options.mode = params.mode;
            this._options.data = params.data;
            var buttonArray=[{
            				text: this.i18n.cancel,
			                "class": "aui-button-link",
			                 click: this.proxy(function () {
			                    this.formDialog.dialog("close");
			                })
		                }]
            
            if(!this._options.data.disabled){
            	buttonArray.push({
	            		 text:  this.i18n.savebtn,
	                     click: this.proxy(function (e) {
		                        	var obj=this.formdata(this.form.serializeArray());
		                        	if(this.form.valid()){
		                        		this._sendModifyAjax({
		                            		"tokenid": $.cookie("tokenid"),
		                            		"method": "stdcomponent.update",
		                            		"dataobject": "checkList",
		                            		"dataobjectid": JSON.stringify(parseInt(params.data.id)),
		                            		"obj":obj
			                            },e);
		                        	}
		                        	}
	                     		 )
            		
            	   });
            }
            	
            dialogOptions = {
                title: params.title,
                buttons: buttonArray
        	}
        }else if(params.mode=="ALL"){
        	this._options.mode  = params.mode;
            this._options.data  = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.savebtn,
                        click: this.proxy(function (e) {
	                        	var obj=this.formalldata(this.form.serializeArray());
	                         	if(this.form.valid()){
	                         		this._sendModifyAjax({
	                            		"tokenid": $.cookie("tokenid"),
	                            		"method": "stdcomponent.updateall",
	                            		"dataobject":"checkList",
	                            		"objs":JSON.stringify(obj)  
		                            },e);
	                         	}
                        		}
                        )
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.formDialog.dialog("close");
                        })
                    }
                ]
        	}
        }
     try{   
        this.formDialog.dialog("option",dialogOptions).dialog("open");
    }catch(e){
		throw new Error("dialog(open)"+e.message);
	}
       $(".confirmDate").datepicker({ dateFormat: "yy-mm-dd" });
    },
    
    transform_data_type:function(data){
    	//uuu=[{id:"1",name:"s"},{id:"2",name:"f"},{id:"3",name:"v"}]
    	var uuu=data;
    	var str = "{";
    	for(i in uuu){
    		if(parseInt(i)+1 != uuu.length){
    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '",';
    		}else{
    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '"';
    		}
    	}
    	str += "}";
    //	return JSON.parse(str);
    	//{s: "1", f: "2", v: "3"}
    	return str
    },
    
    /*
     * 提交(编辑 添加)数据 {"confirmRemark":"fg","confirmMan":"10960,13685","confirmLastDate":"2015-07-28"}
    */
    formdata:function(form){
    	try{
	    	var traceItemStatus="";
	    	var improveItemStatus="";
	    	var point= $.grep(form,this.proxy(function(item,idx){
    			return $.inArray(item.name,["itemPoint"]) > -1 ;
	    	}))
	    	$.each(form,this.proxy(function(idx,value){
	    		if(value.name=="confirmResult"){
	    			switch(value.value){
	    				case "通过":
	    					traceItemStatus="1";
	    					improveItemStatus="10";
	    					break;
	    				case "未通过":
		    				//traceItemStatus="2";
	    					traceItemStatus="";
		    				improveItemStatus="7";
		    				this._sendnomessage(point[0].value);
	    					break;
	    				case "暂时无法完成":
		    				traceItemStatus="3";
		    				improveItemStatus="10";
	    					break;
	    			}
	    		}
	    	}));
	    	
	    	form = $.grep(form,this.proxy(function(item,idx){
	    			return $.inArray(item.name,["confirmDate","verification","confirmResult"]) > -1;
		    	}))
		    	
	    	form.push({name:"traceItemStatus",value:traceItemStatus});
	    	improveItemStatus && form.push({name:"improveItemStatus",value:improveItemStatus});
		   return this.transform_data_type(form);
	    }catch(e){
			throw new Error("formdata"+e.message);
		}
    },	
    /*
     * 批量提交[{"id":"","confirmRemark"："fg","confirmMan"："10960,13685","confirmLastDate":"2015-07-28"},{"id":"","字段名"："值","字段名"："值"}]
    */
    formalldata:function(allform){
    	try{
	    	var traceItemStatus="";
			var improveItemStatus="";
			var point= $.grep(allform,this.proxy(function(item,idx){
    			return $.inArray(item.name,["itemPoint"]) > -1 ;
	    	}))
	    	$.each(allform,this.proxy(function(idx,value){
	    		if(value.name=="confirmResult"){
	    			switch(value.value){
	    				case "通过":
	    					traceItemStatus="1";
	    					improveItemStatus="10";//10:通过
	    					break;
	    				case "未通过":
	    					traceItemStatus="";
		    				improveItemStatus="7";//7:完成情况，
		    				this._sendnomessage(point[0].value);
	    					break;
	    				case "暂时无法完成":
		    				traceItemStatus="3";
		    				improveItemStatus="10";//10:通过
	    					break;
	    			}
	    			
	    		}
	    	}));
	    	
	    	allform= $.grep(allform,this.proxy(function(item,idx){
	    		return $.inArray(item.name,["confirmDate","verification","confirmResult"]) > -1;
	    	}))
	    	 allform.push({name:"traceItemStatus",value:traceItemStatus});
	    	improveItemStatus && allform.push({name:"improveItemStatus",value:improveItemStatus});
	    	var newform=JSON.parse(this.transform_data_type(allform));
	    	var boo=[];
	    	$.each(this._options.data.id,this.proxy(function(idx,item){
	    		boo.push($.extend({"id":item},newform));
	    	}));
	    	return boo;
	    }catch(e){
			throw new Error("formalldata"+e.message);
		}
    	//[{"id":"","字段名"："值","字段名"："值"},{"id":"","字段名"："值","字段名"："值"}]
    },
    
    
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax:function(data,e,func){
    	this.disableForm();
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        },this.qid("item-dialog-edit-confirm").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
                this.formDialog.dialog("close");
                this.refreshDataTable();
                $.u.alert.success("操作成功");
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        }));
    },
    
    //验证人 验证通过 给分配人发消息
    _sendyesmessage:function(idxy,itemPoint){
    	var aa=itemPoint.split('\n');
    	aa.length>1 && aa.pop();
	    if(idxy){
			  $.u.ajax({
		            url: $.u.config.constant.smsmodifyserver,
		            type:"post",
		            dataType: "json",
		            data: {
						tokenid:$.cookie("tokenid"),
						method:"modifyMessage",
						paramType:"sendMessage",
						title:"完成验证通知",
						content:"【"+(aa.join('】,【'))+"】要点已完成验证！",//【point】+要点已完成验证！
						link:  this._options.data.wkid,
						sourceType:"TRACE",
			    		userIds:"["+idxy+"]",
			    		organizationIds:"[]",
			    		unitIds:"[]"
					}
		        }).done(this.proxy(function (data) {
		        	if(data.success){
		        	
		        	}
		        	
		        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
		        }));
		  }
    },
  //验证不通过发通知
    _sendnomessage:function(itemPoint){
    	var aa=itemPoint.split('\n');
    	aa.length>1 && aa.pop();
    	var point=aa.join('】,【');
    	var idxy =this._getGrade(this._options.data.wkid);
	    if(idxy){
			  $.u.ajax({
		            url: $.u.config.constant.smsmodifyserver,
		            type:"post",
		            dataType: "json",
		            data: {
						tokenid:$.cookie("tokenid"),
						method:"modifyMessage",
						paramType:"sendMessage",
						title:"要点验证未通过通知",
						content:"【"+point+"】要点跟现实不符，请重新填写完成情况!",//【point】+要点已完成验证！
						link:  this._options.wkid,
						sourceType:"IMPROVE",
			    		userIds:"["+idxy+"]",
			    		organizationIds:"[]",
			    		unitIds:"[]"
			    			
					}
		        }).done(this.proxy(function (data) {
		        	if(data.success){
		        	}
		        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
		        }));
		  }
    },
    
    
    _getGrade:function(improveId){
    	var idxy=[];
    	if(improveId){
    		 $.u.ajax({
 	            url: $.u.config.constant.smsqueryserver,
 	            type:"post",
 	            dataType: "json",
 	            async:false,
 	            data: {
 					tokenid:$.cookie("tokenid"),
 					method:"getGradeTwoAuditors",
 					improveId: improveId
 				}
 	        }).done(this.proxy(function (data) {
 	        	if(data.success){
 	        		data.data.aaData && $.each(data.data.aaData,this.proxy(function(idx,item){
 	        			idxy.push(item.id);
 	        		}))
 	        	}
 	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

 	        }));
    	return idxy.join(",");
    	}
    },
    
    /*
     * 根据设置创建表单
     */
    buildForm:function(){

    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var data={};
    	$.each(this.form.serializeArray(), function(idx, field){
    		data[field.name] = field.value;
    	});
    	data["category"] = this.qid("category").select2("data").id;
    	data["responsibleUser"] = this.qid("unit-person").select2("data").id;
    	data["avatar"] = this.qid("unit-image").attr("value") && parseInt(this.qid("unit-image").attr("value"));
    	return data;
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
    	try{
	    	data.itemPoint && $("[name='itemPoint']", this.form).val(data.itemPoint || '');
	    	data.improveReason && $("[name='improveReason']", this.form).val(data.improveReason || '');
    		data.improveMeasure && $("[name='improveMeasure']", this.form).val(data.improveMeasure || '');
	    	data.confirmRemark && $("[name='confirmRemark']", this.form).val(data.confirmRemark || '');
	    	data.improveRemark && $("[name='improveRemark']", this.form).val(data.improveRemark || '');
	    	if(this._options.mode === "SHOWDETAIL"){
	    		data.verification && $("[name='verification']", this.form).val(data.verification || '');
	    		this.qid("unit-confirmResult").select2("data",{id:data.confirmResult||"",text:data.confirmResult||""})
	    		.select2("enable", false);
	    		$("[name='itemPoint']", this.form)
	    		.add($("[name='confirmRemark']", this.form))
	    		.add($("[name='improveRemark']", this.form))
	    		.add($("[name='verification']", this.form))
	    		.attr("readonly","readonly");
	    	}else{
	    		this.qid("unit-confirmResult").select2("enable", true);
	    		$("[name='itemPoint']", this.form)
	    		.add($("[name='confirmRemark']", this.form))
	    		.add($("[name='improveRemark']", this.form))
	    		.add($("[name='verification']", this.form))
	    		.removeAttr("readonly");
	    		var rules = {}, messages ={};
				this._options.data.displayfield &&	$.each(this._options.data.displayfield, this.proxy(function(key,item){
					!!item && $("[name='" +key+ "']").attr(item,true);
					if(item=="required"){
					   var label=$("[name='" +key+ "']").closest(".form-group").find("label");
					   rules[key] = { required: true ,maxlength:200};
		               messages[key] = { required: "该项不能为空",maxlength:"请输入不超过200个字符" };
					  if($(label).children("span.text-danger").length < 1){
					      $("<span class='text-danger'>&nbsp;*</span>").appendTo($(label));
					   }
					}
		        }));
			    this.form.validate({
			            rules: rules,
			            messages: messages,
			            errorClass: "text-danger text-validate-element",
			            errorElement:"div"
		        });
	    	}
	    }catch(e){
			throw new Error("fillFormData"+e.message);
		}	
	    
    },
   
   
    
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$(":text,textarea",this.form).attr("disabled",false);
    	$(":text,textarea",this.form).val("").text("");
    	$("input.select2",this.form).select2("data","");
    	$(".startdate").val("");
       	$(".enddate").val("");
    	this.form.validate().resetForm();
    },
    
    
    display_date:function(){
		var dateRenderClazz = $.u.load("com.audit.checklist.DateProp");
		var dateRenderObj = new dateRenderClazz();
		dateRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
			}),});
	    var result = dateRenderObj.get("filter", "html");
		var sel = $(result).appendTo($(".form-groups .form-group:last",this.form));
		dateRenderObj.get("filter","render","",sel); 

    },
    
	
    formDisabled:function(flag){
    	if(flag){
    		$(":text,textarea",this.form).attr("disabled",true);
    	}
    },
    
  
    
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea",this.form).attr("disabled",true);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea",this.form).attr("disabled",false);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
    },
    /*
     * 用于override
     */
    refreshDataTable:function(){},
    destroy: function () {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.audit.tracklist.itemDialogEditConfirm.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js", 
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.tracklist.itemDialogEditConfirm.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

