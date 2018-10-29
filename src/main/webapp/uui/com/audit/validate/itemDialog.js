//@ sourceURL=com.audit.validate.itemDialog
$.u.define('com.audit.validate.itemDialog', null, {
	
	//分派验证人
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
        this._options.fulldataArray = null;
    	this._options.dataobject = "unit";
    	this._avatarIsVisible = false;
    	this._personSelect2Length = 10;
    	this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this._options.filtername=["validator"]
    	this.form = this.qid("unit-form");
    	
    	this.description=$("[name='description']", this.form);
    	this.actionOrganization=$("[name='actionOrganization']", this.form);
    	this.creatorOrganization=$("[name='creatorOrganization']", this.form);
    	this.validator=this.qid("unit-validator");
    	this.treeContent=this.qid("treeContent");
	    this.$validMsg = this.form.find(".validmsg");
	    this.libTree = this.qid("libTree");
	    this._tree = this.qid("tree");
	     
	    try{
		    	this.formDialog = this.qid("item-dialog-edit").dialog({
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
			            	this.enableForm();
			            	this.fillFormData( this._options.fulldataArray);
		            }),
		            close: this.proxy(function(){
		            		this.clearFormData();
		            })
		        }); 
	    }catch(e){
	    	throw new Error("this.formDialog "+e.message);
	    }
	    
    },

    
    open:function(params){
    	var dialogOptions=null;
        if (!params.all) {
            this._options.mode = "one";
            this._options.fulldataArray = params.fulldataArray;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: "保存",
                        click: this.proxy(function (e) {
	                        	var obj=this.formdata(this.form.serializeArray());//obj 是对象
	                        	if(this.form.valid()){
	                        		this._sendModifyAjax({
	                            		"tokenid": $.cookie("tokenid"),
	                            		"method": "setRiskAuditors",
	                            		"rule":JSON.stringify(obj)
		                            },e);
	                        	}
	                        	}
                        )
                    },
                    {
                        text: "取消",
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.formDialog.dialog("close");
                        })
                    }
                ]
        	}
        }else if(params.all){
        	this._options.mode = "ALL";
            this._options.fulldataArray = params.fulldataArray;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: "保存",
                        click: this.proxy(function (e) {
	                        	var obj=this.formdata(this.form.serializeArray());//obj 是数组
	                         	if(this.form.valid()){
	                         		this._sendModifyAjax({
	                            		"tokenid": $.cookie("tokenid"),
	                            		"method": "saveFenPeiResult",
	                            		"objs":JSON.stringify(obj)
		                            },e);
	                         	}
                        		}
                        )
                    },
                    {
                        text: "取消",
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
     * 提交(编辑 添加)数据 
    */
    formdata:function(form){
	    try{	
	    	var newform = $.grep(form,this.proxy(function(item,idx){
    			return $.inArray(item.name,this._options.filtername) > -1;
	    	}))
	    	newform=JSON.parse(this.transform_data_type(newform));
	    	var boo=[];
	    	$.each(this._options.fulldataArray,this.proxy(function(idx,item){
	    		boo.push($.extend({
	    				"validateRiskId":item.validateRiskId?item.validateRiskId.toString():null,
	    				"actionItemId":item.actionItemId?item.actionItemId.toString():null,
						"description":item.description
	    						},newform));
	    	}));
	    	return boo;
	    }catch(e){
			throw new Error("formdata()   "+e.message);
		} 
    },	
 
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax:function(data,e,func){
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        },this.qid("item-dialog-edit").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
        		this.disableForm();
                this.formDialog.dialog("close");
                this.refreshDataTable();
                $.u.alert.success("操作成功");
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        }));
    },
    
    /*
     * 根据设置创建表单
     */
    buildForm:function(){
    	
    	this.form.find("input,textarea").attr("readonly",true);
    	this.validator.attr("readonly",false);
    	this.validator.select2({
        	placeholder: "选择验证人",
        	multiple: true,
         	ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	            dataType: "json",
 	            type:"post",
 	            data:this.proxy(function(term,page){
         			return {
         				tokenid:$.cookie("tokenid"),
         				method:"stdcomponent.getbysearch",
         				dataobject:"user",
         				search:JSON.stringify({"value":term}),
         				start: (page - 1) * this._select2PageLength,
 	    				length: this._select2PageLength,
         				rule:JSON.stringify([[{"key":"fullname","op":"like","value":term}]])
         			};
 		        }),
 		        results:this.proxy(function(data,page){
 		        	if(data.success){
 		        		return {results:$.map(data.data.aaData,function(user,idx){
 		        					user.fullusername=user.fullname+"("+user.username+")";	
 					        			return user;	
 					        	}),
 					        	more: data.data.iTotalRecords > (page * this._select2PageLength),	
 		        		};
 		        	}
 		        })
 	        },
 	        formatResult: function(item){
	        	return item.fullusername;	 
	        },
	        formatSelection: this.proxy(function(item){
	        	return item.fullusername;	        	
	        })
         })
	
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
    	try{
    		var idsArray=[],
    		descriptionArray=[],//行动项
    		name=[],
    		validator=[],//验证人
    		creatorOrganizationArray=[],//创建人所属责任单位
    		actionOrganizationArray=[];//责任部门
    		$.each(data,this.proxy(function(idx,item){
    			idsArray.push(item.validateRiskId)
    			descriptionArray.push(item.description);
    			actionOrganizationArray.push(item.actionOrganization[0]);
    			creatorOrganizationArray.push(item.creatorOrganization[0]);
    		}))
    		
			this.description.val(descriptionArray.join("\n"));//行动项
    		this.actionOrganization.val(actionOrganizationArray.join("\n"));//责任部门
    		this.creatorOrganization.val(creatorOrganizationArray.join("\n"));//创建人所属责任单位
    		
    		var rules = {}, messages ={};
    		this._options.filtername &&	$.each(this._options.filtername, this.proxy(function(key,item){
				var $item=$("[name='" +item+ "']");
				if($item){
					   if(item=="validate_date"){
							rules[item] = { required: true ,  dateISO: true};
				            messages[item] = { required: "该项不能为空",  dateISO: "无效日期"};
					   }else{
						   rules[item] = { required: true };
			               messages[item] = { required: "该项不能为空"};
					   }
		              var label=$item.closest(".form-group").find("label");
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
    	}catch(e){
    		throw new Error("fillFormData() "+e.message);
    	} 
    },
   
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	this.validator.val("").select2("data","");
    	this.form.validate().resetForm();
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
        $.fn.zTree.destroy("treeDemo");//销毁 id 为 "treeDemo" 的 zTree
        $.fn.zTree.destroy();//2. 销毁全部 的 zTree
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.audit.validate.itemDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js",
                                               '../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.validate.itemDialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                { id:"",path: '../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

