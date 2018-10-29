//@ sourceURL=com.audit.tracklist.itemDialogEdit
$.u.define('com.audit.tracklist.itemDialogEdit', null, {
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
    	this._options.dataobject = "unit";
    	this._avatarIsVisible = false;
    	this._personSelect2Length = 10;
    	this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.qid("unit-confirmMan").bind("keyup", this.proxy(this.onBodyDown));
    	this.i18n = com.audit.tracklist.itemDialogEdit.i18n;
    	this.form = this.qid("unit-form");
    	this.unitconfirmMan=this.qid("unit-confirmMan");
    	this.pfather =this.qid("unit-pointchapter");
    	this.treeContent=this.qid("treeContent");
	    this.$validMsg = this.form.find(".validmsg");
	    this.qid("treeContent").on("click",".chk",this.proxy(this.checkbox_click));
	    
        this.libTree = this.qid("libTree");
        this._tree = this.qid("tree");
        this._getOrgTree();
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
		            	this.fillFormData(this._options.data);
		            	if(this._options.data.disabled){
		            		$(":text,textarea",this.form).attr("disabled",true);
		            	}
	            }),
	            close: this.proxy(function(){
	            		this.clearFormData();  
	            })
	    	}); 
	    }catch(e){
	    	throw new Error("this.formDialog"+e.message);
	    }
	 
	    this.unitconfirmMan.off("click").on("click",this.proxy(function(e){
 			this._pgetTree(this.qid("unit-confirmMan").val());
 			var offset = $(e.target).offset();
 			var width=this.unitconfirmMan.width();
 			this.treeContent.css("width",width+"px");
 			this._tree.css("width",width+"px");
 			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
			this.tree.expandAll(false);
			$(document).bind('click', this.proxy(this.onBody_click));
	    }));
   	
    },
    checkbox_click:function(e){
    	$(e.currentTarget)
    	this.checkedNode = this.tree.getCheckedNodes(true);
		var arry=[],idxyz=[];
		$.each(this.checkedNode,function(idx,item){
			arry.push(item.name);
			idxyz.push(item.id);
		})
		this.unitconfirmMan.val(arry.join(","));
		this.unitconfirmMan.attr("value",idxyz.join(","));
    },
    
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    onBody_click:function(e){
    	if($(e.target).closest("div").attr("qid") != "treeContent" && $(e.target).attr("qid") != "unit-confirmMan"){
    		this.treeContent.fadeOut("fast");
    		$(document).unbind('click', this.proxy(this.onBody_click));
    	}
    },
    
    open:function(params){
    	var dialogOptions=null;
        if ( params.mode == "EDIT") {//单个点击查看
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
                    text: this.i18n.savebtn,
                    click: this.proxy(function (e) {
                        	var obj=this.formdata(this.form.serializeArray());//obj 是对象
                        	if(this.form.valid()){
                        		this._sendModifyAjax({
                            		"tokenid": $.cookie("tokenid"),
                            		"method": "stdcomponent.update",
                            		"dataobject": "checkList",
                            		"dataobjectid": JSON.stringify(parseInt(params.data.id)),
                            		"obj":JSON.stringify(obj)
	                            },e);
                        		  this.formDialog.dialog("close");
                        	}
                        	}
                    )
                });
            }
            dialogOptions = {
                title: params.title,
                buttons: buttonArray
        	}
        }else if(params.mode == "ALL"){
        	this._options.mode  = params.mode;
            this._options.data  = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.savebtn,
                        click: this.proxy(function (e) {
	                        	var obj=this.formalldata(this.form.serializeArray());//obj 是数组
	                         	if(this.form.valid()){
	                         		this._sendModifyAjax({
	                            		"tokenid": $.cookie("tokenid"),
	                            		"method": "stdcomponent.updateall",
	                            		"dataobject":"checkList",
	                            		"objs":JSON.stringify(obj)  
		                            },e);
	                         		  this.formDialog.dialog("close");
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
       $(".confirmLastDate").datepicker({ dateFormat: "yy-mm-dd"});
    },
    
    transform_data_type:function(data){
    	//uuu=[{id:"1",name:"s"},{id:"2",name:"f"},{id:"3",name:"v"}]
    	uuu=data;
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
	    	var result='';
	    	var userid=	$("[name=confirmMan]").attr("value");
	    	var newform= $.grep(form,this.proxy(function(item,idx){
	    			return $.inArray(item.name,["itemPoint"]) < 0;
		    	}))
	    	$.each(newform,this.proxy(function(idx,item){
    			if($.inArray(item.name,["confirmMan"]) > -1){
    				item.value=userid;
    			}
	    	}))
	    	var point= $.grep(form,this.proxy(function(item,idx){
	    			return $.inArray(item.name,["itemPoint"]) > -1 ;
		    	}))
	    	newform.push({name:"improveItemStatus",value:"9"});//9:已指派，
	    	//result=this.transform_data_type(newform);
	      	var tt=this.transform_data_type(newform);//字符串
	      	var	uu =tt.replace(/[\r\n]+/g, '\\n');
	      	var	result=JSON.parse(uu);
	    	this._sendmessage(result.confirmMan,point[0].value);//接收人id ,存在问题
		    return result;
	    }catch(e){
			throw new Error("formdata()"+e.message);
		} 
    },	
    /*
     * 批量提交[{"id":"","confirmRemark"："fg","confirmMan"："10960,13685","confirmLastDate":"2015-07-28"},{"id":"","字段名"："值","字段名"："值"}]
    */
    formalldata:function(allform){
      try{
    	var userid=	$("[name=confirmMan]").attr("value");
    	var newallform= $.grep(allform,this.proxy(function(item,idx){
			return $.inArray(item.name,["itemPoint","improveMeasure"]) < 0;
    	    }))
	     newallform= $.grep(newallform,this.proxy(function(item,idx){
	    	 return  $("[name="+item.name+"]:visible:not([readonly])");
	    }))
    	$.each(newallform,this.proxy(function(idx,item){
			if($.inArray(item.name,["confirmMan"]) > -1){
				item.value=userid;
			}
    	}))
    	var point= $.grep(allform,this.proxy(function(item,idx){
	    			return $.inArray(item.name,["itemPoint"]) > -1 ;
		    }))
    	newallform.push({name:"improveItemStatus",value:"9"});
    	var tt=this.transform_data_type(newallform);//字符串
    	//var uu = tt.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\r\n]+/g, '\\n');
    	var uu =tt.replace(/[\r\n]+/g, '\\n');
        var	result=JSON.parse(uu);
    	//this._sendmessage(result.confirmMan,point[0].value);//接收人id ,存在问题
    	this._send_message(result.confirmMan,point[0].value);//接收人id ,存在问题
    	
    	var boo=[];
    	$.each(this._options.data.id,this.proxy(function(idx,item){
    		boo.push($.extend({"id":item},result));
    	}));
    	return boo;
    	/*$.parseJSON('{"name": "Code\tPlayer\n"}'); // 多数情况下，它会抛出一个错误，因为JS解析器会将字符串中的\t或\n等转义直接视作字面值，起到Tab或换行的效果。
    	//正确写法应该如下(使用两个反斜杠，以免被JS解析器直接转义\t或\n)：
    	$.parseJSON('{"name": "Code\\tPlayer\\n"}');*/
    	//[{"id":"","字段名"："值","字段名"："值"},{"id":"","字段名"："值","字段名"："值"}]
    }catch(e){
		throw new Error("formalldata"+e.message);
	} 
    },
    
    onBodyDown:function(e){
    	this.unitconfirmMan.trigger("click");
    	/*if (!(e.target.id == (this._id+"-tree") || e.target.id == (this._id+"-treeContent") || $(e.target).parents("#"+this._id+"-treeContent").length>0)) {
			this.treeContent.fadeOut("fast");
			//$("body").unbind("mousedown", this.proxy(this.onBodyDown));
		}*/
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
        },this.qid("item-dialog-edit").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
                this.refreshDataTable();
                $.u.alert.success("操作成功");
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        }));
    },
    

    //分配验证人,发消息给验证人
    _sendmessage:function(idxy,itemPoint){
    	var aa=itemPoint.split('\n');
    	aa.length>1 &&aa.pop();
    	var point=aa.join('】,【');
	    if(idxy){
			  $.u.ajax({
		            url: $.u.config.constant.smsmodifyserver,
		            type:"post",
		            dataType: "json",
		            data: {
						tokenid:$.cookie("tokenid"),
						method:"modifyMessage",
						paramType:"sendMessage",
						title:"待验证检查要点",
						content:"请尽量按时完成【"+point+"】检查，辛苦了！",
						link:  this._options.data.tkid,
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
    
    _send_message:function(idxy,itemPoint){
    	if(itemPoint.indexOf('\n')){
    		var aa=itemPoint.split('\n');
        	aa.length>1 && aa.pop();
        	var bb=[];
        	for(var i=0;i<aa.length;i++){
        		if(aa[2*i]){
        			bb.push(aa[2*i]);
        		}
        	}
        	 $.u.ajax({
 	            url: $.u.config.constant.smsmodifyserver,
 	            type:"post",
 	            dataType: "json",
 	            data: {
 					tokenid:$.cookie("tokenid"),
 					method:"sendMessageToYanZhengRen",
 					improveId: this._options.data.tkid,//跟踪表id
 					itemPoints:JSON.stringify(bb),//[String,String]
 					userIds:"["+idxy+"]",//[Integer,Integer]
 				}
 	        }).done(this.proxy(function (data) {
 	        	if(data.success){
 	        	
 	        	}
 	        	
 	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

 	        }));
    	}
    	 
    },
    
    cookie_back:function(backID){
    	  if(backID){
    		  $.u.ajax({
    	            url: $.u.config.constant.smsqueryserver,
    	            type:"post",
    	            dataType: "json",
    	            data: {
    					tokenid:$.cookie("tokenid"),
    					method:"stdcomponent.getbyid",
    					dataobject: "item",
    		    		dataobjectid: parseInt(backID),
    				}
    	        }).done(this.proxy(function (data) {
    	        	if(data.success){
    	        		$.cookie("add_cookie",JSON.stringify(data.data),{expires:7});
    	        	}
    	        	
    	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

    	        }));
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
    		data.improveMeasure && $("[name='improveMeasure']", this.form).val(data.improveMeasure || '');
	    	data.confirmLastDate && $("[name='confirmLastDate']", this.form).val(data.confirmLastDate || '');
	    	data.confirmRemark && $("[name='confirmRemark']", this.form).val(data.confirmRemark || '');
	    	
		    var d = [];
	    	data.confirmMan && $.each(data.confirmMan,function(k,t){
	    		d.push({id:t.id,fullname:t.name});
	    	});
	    	
	    	var confirmManarry=[],IDarry=[];
	    	if(data.confirmMan && data.confirmMan.length>0 ){
	    		$.each(data.confirmMan,this.proxy(function(itd,user){
	    			confirmManarry.push(user.name);
	    			IDarry.push(user.id);
	    		}))
	    	}
		   	 this.qid("unit-confirmMan").val(confirmManarry.join(",")).attr("value",IDarry.join(","))
	    	
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
			
    	}catch(e){
    		throw new Error("fillFormData() "+e.message);
    	} 
    },
   
    /*
     * 填充表单数据
     */
    cookieFormData:function(data){
    	var DATA_TYPE={
        		"系统级检查项":"SYS",
        		"临时检查项":"TMP",
        		"时限检查项":"TME"
        };
    	data =$.parseJSON(data);
    	var cp=data.pointType==="point"||"chapter"? data.pointType:"";
    	if(cp){
			this.qid("unit-"+cp+"type").select2("data", {id:DATA_TYPE[data.type], name:data.type});
			this.qid("unit-"+cp+"version").select2("data", {id:data.versionId, name:data.versionDisplayName});
			this.qid("unit-"+cp+"profession").select2("data", {id:data.professionId, name:data.professionDisplayName});
		//	this.qid("unit-"+cp+"chapter").select2("data", {id:data.parentId, name:data.parent});
			var ver_div=$("[name='" +cp+ "version']",this.form).parent().parent();
			var date_div=$("[name='" +cp+ "startdate']",this.form).parent().parent();
			
			if(DATA_TYPE[data.type]=="TME"){
				if(cp=="point"){
					date_div.removeClass("hidden");
				}
				ver_div.addClass("hidden");
			}
			if(DATA_TYPE[data.type]=="SYS"){
				ver_div.removeClass("hidden");
				date_div.addClass("hidden");
			}
			if(cp=="chapter"){
				date_div.addClass("hidden");
			}
    	}
    },
    
    _valid:function(){
    	 
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
	    result = dateRenderObj.get("filter", "html");
		sel = $(result).appendTo($(".form-groups .form-group:last",this.form));
		dateRenderObj.get("filter","render","",sel); 

    },
    
	
    
	
	
    filter_valid: function(obj){
    	var startDate = $.trim(obj.startDate), 
    		endDate = $.trim(obj.endDate), 
    		result = true, 
    		msg = [];
    	if(startDate && (new Date(startDate)) == "Invalid Date"){
    		result = false;
    		msg.push(com.audit.tracklist.itemDialogEdit.i18n.startDateFormat);
    	}else{
    		startDate = new Date(startDate);
    	}
    	
    	if(endDate && (new Date(endDate)) == "Invalid Date"){
    		result = false;
    		msg.push(com.audit.tracklist.itemDialogEdit.i18n.endDateFormat);
    	}else{
    		endDate = new Date(endDate);
    	}
    	
    	if(startDate && endDate && (startDate - endDate > 0)){
    		result = false;
    		msg.push(com.audit.tracklist.itemDialogEdit.i18n.startBigThanEnd);
    	}
    	if(result){
    		this.$validMsg.addClass("hidden").text("");
    	}else{
    		this.$validMsg.removeClass("hidden").text(msg.join(" ")).css("display","block");
    	}
    	return result;
    },

    _pgetTree:function(term){
    	var treeNodes=[];
	    $.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:false,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getFirstAuditors",
	    		"term":term
	        }
	    }).done(this.proxy(function(data){
	    	if(data.success){
	    		if(data.data){
					treeNodes = $.map(data.data,this.proxy(function(perm,idx){
							return {id:perm.unitId||perm.userId,
									pId:perm.parentId, 
									name:perm.unitName||(perm.userfullname+"("+perm.username+")"),
									chkDisabled:perm.unitId?true:false, 
									open: perm.unitId?true:false, 
									noselect: perm.unitId?true:false
									//checked: $.inArray(perm.id, checkArray) > -1,
						           // chkDisabled: $.inArray(perm.id, checkArray) > -1
								};
					}));
				}
	    	}
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
    	var setting = {
    			check: {  
   				 	enable: true,  
   				 	chkstyle:"checkbox",
   				 	chkboxType : { "Y" : "ps", "N" : "ps" },
   				 	selectdMulti : true  
   	            	},
    			 view: {  
    			    showLine : true,                  //是否显示节点间的连线  
        			checkable : true,                  //每个节点上是否显示 CheckBox  
   	               // showIcon: showIconForTree,  
    	            dblClickExpand: true  
    	            },
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				onClick : this.proxy(function(treeId, treeNode, clickFlag){
       				}),
    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
    					this.checkedNode = this.tree.getCheckedNodes(true);
    					var arry=[],idxyz=[];
    					$.each(this.checkedNode,function(idx,item){
    						arry.push(item.name);
    						idxyz.push(item.id);
    					})
    					this.unitconfirmMan.val(arry.join(","));
    					this.unitconfirmMan.attr("value",idxyz.join(","));
						this.treeContent.fadeOut("fast");
						
    				})
    			},
    		};
    	this.tree = $.fn.zTree.init(this.qid("tree"), setting,treeNodes);
    	var nodes = this.tree.getNodes();
    	$.each(nodes,this.proxy(function(idx,node){
    		if(node.parentTId==null){
    			this.tree.expandNode(node, true, false, true);
    		}
    	}));
    
    },
    
    
    
    
    /**
     * 生成树
     */
    _getOrgTree:function(){
    	var setting = {
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onClick:this.proxy(this.on_orgTree_click)
			}
		};
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid": $.cookie("tokenid"),
        		"method": "getByUnit",
                "dataobject": "organization",
                "unitId": 21022
            }
    	},this.libTree).done(this.proxy(function(response){
    		if(response.success && response.data){
                this._managable = response.managable;
                if(this._managable !== true){
                    this.qid("btn_adduser").remove();
                }
    			var zNodes = $.map(response.data || [], this.proxy(function(org,idx){
    				return {id:org.id, pId:org.parentId, name:org.name};
    			}));
    			//左边树
    			this.organizationTree=$.fn.zTree.init(this.libTree, setting, zNodes);
    			var sNodes = this.organizationTree.getNodes();
    			if (sNodes.length) {
    				this.organizationTree.expandNode(sNodes[0], true, false, true);
    			}
    			
    		}
    	}));
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


com.audit.tracklist.itemDialogEdit.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js",
                                               '../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.tracklist.itemDialogEdit.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                { id:"",path: '../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

