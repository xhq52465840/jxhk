//@ sourceURL=com.audit.checklist.unitDialogEdit
$.u.define('com.audit.checklist.unitDialogEdit', null, {
	
	//copy from com.sms.unit.unitDialogEdit
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
    	this._options.dataobject = "unit";
    	this._avatarIsVisible = false;
    	this._personSelect2Length = 10;
    },
    afterrender: function (bodystr) {
    	var verarry=[];
    	var	parryid=[];
    	var	carryid=[];
    	var	verarrya=[];
    	this.DATA_TYPE={};
    	
    	this.i18n = com.audit.checklist.unitDialogEdit.i18n;
    	this.form = this.qid("unit-form");
    	this.cfather =this.qid("unit-chapterchapter");
    	this.pfather =this.qid("unit-pointchapter");
    	this.treeContent=this.qid("treeContent");
	    this.$validMsg = this.form.find(".validmsg");
    	this.formDialog = this.qid("unit-dialog-edit").dialog({
            title: this._options.title,
            width: 600,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function(){
            	this.buildForm();
            }),
            open: this.proxy(function(){
            	if(this._avatarIsVisible === false){
	            	this.enableForm();
	            	if(this._options.mode == "EDIT" && this._options.data){
		            	this.fillFormData(this._options.data);
	            	}
	            	if(this._options.mode == "ADD" && this._options.data){
		            	this.cookieFormData(this._options.data);
	            	}
            	}
            }),
            close: this.proxy(function(){
            	if(this._avatarIsVisible === false){
            		this.clearFormData();
            	}
            	this.qid("unit-chapterunit").closest(".form-group")
        		.add(this.qid("unit-pointunit").closest(".form-group")).removeClass("hidden");
            })
        }); 
    	

    	this.form.off("click", "input:radio").on("click", "input:radio", this.proxy(this.on_radioSwitch));


    	this.form.validate({
            rules: {
                "chaptertype": {
                    required:true
                },
                "chapterunit":{
                	required:true
                },
                "chapterversion":{
                	required:true
                },
                "chapterprofession":{
                	required:true
                },
                "chapterchapter":{
                	required:true
                },
                "chapterpoint":{
                	required:true
                },
               /* "chapterstartdate":{
                	required:true
                },*/
                "chapterenddate":{
                	required:true
                },
                "pointunit":{
                	required:true
                },
                "pointtype":{
                	required:true
                },
                "pointversion":{
                	required:true
                },
                "pointprofession":{
                	required:true
                },
                "pointchapter":{
                	required:true
                },
                "pointpoint":{
                	required:true
                },
                "pointaccording":{
                	required:true
                },
                "pointprompt":{
                	required:true
                },
              /*  "pointstartdate":{
                	required:true
                },*/
                "pointvalue":{
                	digits:true
                },
                "pointenddate":{
                	required:true
                }
            },
            messages: {
                "chaptertype": this.i18n.typeNotNull,
                "chapterunit": "安监机构不能为空",
                "chapterversion":this.i18n.versionNotNull,
                "chapterprofession":this.i18n.professionNotNull,
                "chapterchapter":this.i18n.chapterNotNull,
                "chapterpoint":this.i18n.pointNotNull,
                "chapterstartdate":this.i18n.limitdateNotNull,
                "chapterenddate":this.i18n.limitdateNotNull,
                "pointtype": this.i18n.typeNotNull,
                "pointunit": "安监机构不能为空",
                "pointversion":this.i18n.versionNotNull,
                "pointprofession":this.i18n.professionNotNull,
                "pointchapter":this.i18n.chapterNotNull,
                "pointpoint":this.i18n.pointNotNull,
                "pointaccording":this.i18n.accordingNotNull,
                "pointprompt":this.i18n.promptNotNull,
                "pointvalue":this.i18n.onlynum,
                "pointstartdate":this.i18n.limitdateNotNull,
                "pointenddate":this.i18n.limitdateNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
    	
    	
    	
   	 // // 类型 下拉框初始化
   	this.qid("unit-chaptertype").select2({
   		 placeholder: "选择类型",
       	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	        	type: "post",
	            dataType: "json",
	        	data: function(term, page){
	        		return {
		    			"tokenid":$.cookie("tokenid"),
		    			"method":"getItemFieldsData",
		    			"field":false
	        		};
	    		},
		        results:function(data,page){
		        	if(data.success){
		        		return {results:$.map(data.data.aaData,function(item,idx){
		        			return item;
		        		})};
		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
		        }
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        		carryid.type=item.id||"";//
	        	return item.name;	        	
	        }
       });
   	
   	
    	
    	 // // 类型 下拉框初始化
    	this.qid("unit-pointtype").select2({
    		placeholder: "选择类型",
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	        	type: "post",
	            dataType: "json",
	        	data: function(term, page){
	        		return {
		    			"tokenid":$.cookie("tokenid"),
		    			"method":"getItemFieldsData",
		    			"field":"type"
	        		};
	    		},
		        results:function(data,page){
		        	if(data.success){
		        		return {results:$.map(data.data.aaData,function(item,idx){
		        			return item;
		        		})};
		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
		        }
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	parryid.type=item.id||"";//
	        	return item.name;	        	
	        }
        });
    	
    	
   	  // 类型下拉框
    	this.qid("unit-chaptertype").add(this.qid("unit-pointtype")).on("select2-selecting",this.proxy(function(e){
    		var form_date=$(".startdate" ,e.target.parentNode.parentElement.parentElement).parent().parent();
    		var ver_div=$(".version" ,e.target.parentNode.parentElement.parentElement).parent().parent();
    		var unit_div=$(".unit" ,e.target.parentNode.parentElement.parentElement).parent().parent()
        	var radio_val =$("input:checked" ,e.target.parentNode.parentElement.parentElement.parentElement).val()
    		if(e.object.id=="TME"){
        		if(radio_val=="point"){
        			form_date.removeClass("hidden");
        		}
        		ver_div.add(unit_div).addClass("hidden");
        	}
        	if(e.object.id=="SYS"){
        		ver_div.removeClass("hidden");
        		form_date.addClass("hidden");
        	}
        	if(radio_val=="chapter"){
    			form_date.addClass("hidden");
    		}
        	
        	if(e.object.id=="SUB"){
        		ver_div.removeClass("hidden");
        		this.qid("unit-chapterunit").closest(".form-group")
        		.add(this.qid("unit-pointunit").closest(".form-group")).removeClass("hidden");
        	}
        	
        	
        	//清空其他选项
        	this.qid("unit-chapterversion")
        		.add(this.qid("unit-pointversion"))
        		.add(this.qid("unit-chapterprofession"))
        		.add(this.qid("unit-pointprofession"))
        		.add(this.qid("unit-chapterunit"))
        		.add(this.qid("unit-pointunit"))
        		.select2("data","");
        	this.cfather.add(this.pfather).val("");
    		})
    	);
    	

    	
    	
    	  // 安监机构  下拉框初始化
    	this.qid("unit-chapterunit").select2({
    		placeholder: "选择所属安监机构",
        	ajax:{
  	        	url: $.u.config.constant.smsqueryserver,
  	        	type: "post",
  	            dataType: "json",
  	        	data: function(term, page){
  	        		return {
  		    			"tokenid":$.cookie("tokenid"),
  		    			"method":"getunits",
  		    			"unitName": term
  	        		};
  	    		},
  		        results:function(data,page){
  		        	if(data.success){
  		        		return {results:$.map(data.data,function(item,idx){
  		        			return item;
  		        		})};
  		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
  		        }
  	        },
  	        formatResult: function(item){
  	        	return item.name;      		
  	        },
  	        formatSelection: function(item){
  	        	carryid.unit = item.id;//20160309修改
  	        	return item.name;	        	
  	        }
        });
    	
    	
  	  // 安监机构  下拉框初始化
    	this.qid("unit-pointunit").select2({
    		placeholder: "选择所属安监机构",
        	ajax:{
  	        	url: $.u.config.constant.smsqueryserver,
  	        	type: "post",
  	            dataType: "json",
  	        	data: function(term, page){
  	        		return {
  		    			"tokenid":$.cookie("tokenid"),
  		    			"method":"getunits",
  		    			"unitName": term
  	        		};
  	    		},
  		        results:function(data,page){
  		        	if(data.success){
  		        		return {results:$.map(data.data,function(item,idx){
  		        			return item;
  		        		})};
  		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
  		        }
  	        },
  	        formatResult: function(item){
  	        	return item.name;      		
  	        },
  	        formatSelection: function(item){
  	        	parryid.unit = item.id;//20160309修改
  	        	return item.name;	        	
  	        }
        });
    	
    	
    	
    	
  	  // 版本号 下拉框初始化
  	this.qid("unit-chapterversion").select2({
  		placeholder: "选择版本号",
      	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	        	type: "post",
	            dataType: "json",
	        	data: function(term, page){
	        		return {
		    			"tokenid":$.cookie("tokenid"),
		    			"method":"stdcomponent.getbysearch",
		    			"dataobject":"dictionary",
		    			"rule":JSON.stringify([[{"key":"type","value":"审计库版本"}]])
	        		};
	    		},
		        results:function(data,page){
		        	if(data.success){
		        		return {results:$.map(data.data.aaData,function(item,idx){
		        			return item;
		        		})};
		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
		        }
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	carryid.version=item.id||"";
	        	return item.name;	        	
	        }
      });
  	
    	  // 版本号 下拉框初始化
    	this.qid("unit-pointversion").select2({
    		placeholder: "选择版本号",
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	        	type: "post",
	            dataType: "json",
	        	data: function(term, page){
	        		return {
		    			"tokenid":$.cookie("tokenid"),
		    			"method":"stdcomponent.getbysearch",
		    			"dataobject":"dictionary",
		    			"rule":JSON.stringify([[{"key":"type","value":"审计库版本"}]])
	        		};
	    		},
		        results:function(data,page){
		        	if(data.success){
		        		return {results:$.map(data.data.aaData,function(item,idx){
		        			return item;
		        		})};
		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
		        }
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	parryid.version=item.id||"";
	        	return item.name;	        	
	        }
        });
    	
    	
    	//   // //专业下拉框初始化
    	this.qid("unit-chapterprofession").select2({
    		placeholder: "选择所属专业",
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	        	type: "post",
	            dataType: "json",
	        	data: function(term, page){
	        		return {
		    			"tokenid":$.cookie("tokenid"),
		    			"method":"stdcomponent.getbysearch",
		    			"dataobject":"dictionary",
		    			"rule":JSON.stringify([[{"key":"type","value":"系统分类"}]])
	        		};
	    		},
		        results:function(data,page){
		        	if(data.success){
		        		return {results:$.map(data.data.aaData,function(item,idx){
		        			return item;
		        		})};
		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
		        }
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	carryid.profession=item.id||"";
	        	return item.name;	        	
	        }
        });

    	//   // //专业下拉框初始化
    	this.qid("unit-pointprofession").select2({
    		 placeholder: "选择所属专业",
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	        	type: "post",
	            dataType: "json",
	        	data: function(term, page){
	        		return {
		    			"tokenid":$.cookie("tokenid"),
		    			"method":"stdcomponent.getbysearch",
		    			"dataobject":"dictionary",
		    			"rule":JSON.stringify([[{"key":"type","value":"系统分类"}]])
	        		};
	    		},
		        results:function(data,page){
		        	if(data.success){
		        		return {results:$.map(data.data.aaData,function(item,idx){
		        			return item;
		        		})};
		        	}else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
		        }
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	parryid.profession=item.id||"";
	        	return item.name;	        	
	        }
        });
  
    	
    	//生成tree  查询章节
    	this.cfather.on("click",this.proxy(function(e){
    		var dataid=[];
    		if(carryid.profession && carryid.type && carryid.unit){
        		dataid.push([{"key":"profession","value":carryid.profession}],[{"key":"type","value":carryid.type}],[{"key":"pointType","value":"chapter"}]);
        		dataid.push([{"key" : "unit", "value" : carryid.unit}]); //20160309修改
        		if(carryid.type=="SYS"){
        			dataid.push([{"key":"version","value":carryid.version}]);
        		}
        	}else 
        		$.u.alert.info("请选择专业、类型和安监机构",5000);
    		if(dataid.length>1){
    			this._cgetTree(dataid);
    			var offset = $(e.target).offset();
    			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
    		}
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
    	}));
    	//查询要点
    	this.pfather.on("click",this.proxy(function(e){
    		var dataid=[];
    		 if(parryid.profession && parryid.type && parryid.unit){
        		dataid.push([{"key":"profession","value":parryid.profession}],[{"key":"type","value":parryid.type}],[{"key":"pointType","value":"point"}]);
        		dataid.push([{"key" : "unit", "value" : parryid.unit}]); //20160309修改
        		if(parryid.type=="SYS"){
        			dataid.push([{"key":"version","value":parryid.version}]);
        		}
        	}else 
        		$.u.alert.info("请选择专业、类型和安监机构",5000);
    		if(dataid.length>1){
    			this._pgetTree(dataid);
    			var offset = $(e.target).offset();
    			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
    		}
			$("body").bind("mousedown", this.proxy(this.onBodyDown));
    	}));
    },
    
    _cgetTree:function(dataid){
    	var treeNodes=[];
	    $.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:false,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getItemTreeNode",
	    		"dataobject":"item",
	    		"rule":JSON.stringify(dataid)
	        }
	    }).done(this.proxy(function(data){
	    	if(data.success){
				if(data.data.aaData){
					treeNodes = $.map(data.data.aaData,function(perm,idx){
							return {id:perm.id, pId:perm.parentId, name:perm.name};
        			});
				}
	    	}else{
                $.u.alert.error(data.reason, 1000 * 3);
            }
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
    	var setting = {
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
						this.cfather.val(treeNode.name);
						this.cfather.attr("value",treeNode.id);
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
    _pgetTree:function(dataid){
    	var treeNodes=[];
	    $.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:false,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getItemTreeNode",
	    		"dataobject":"item",
	    		"rule":JSON.stringify(dataid)
	        }
	    }).done(this.proxy(function(data){
	    	if(data.success){
				if(data.data.aaData){
					treeNodes = $.map(data.data.aaData,function(perm,idx){
							return {id:perm.id, pId:perm.parentId, name:perm.name};
        			});
				}
	    	}else{
                $.u.alert.error(data.reason, 1000 * 3);
            }
	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	    	
	    }));
    	var setting = {
    			data: {
    				simpleData: {
    					enable: true
    				}
    			},
    			callback: {
    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
						this.pfather.val(treeNode.name);
						this.pfather.attr("value",treeNode.id);
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
    onBodyDown:function(e){
    	if (!(e.target.id == (this._id+"-tree") || e.target.id == (this._id+"-treeContent") || $(e.target).parents("#"+this._id+"-treeContent").length>0)) {
			this.treeContent.fadeOut("fast");
			$("body").unbind("mousedown", this.proxy(this.onBodyDown));
		}
    },
    transform_data_type:function(data){
    	//uuu=[{id:"1",name:"s"},{id:"2",name:"f"},{id:"3",name:"v"}]
    	var uuu=data;
    	var str = "{";
    	for(i in uuu){
    		if(parseInt(i)+1 != uuu.length){
    			str += '"' + uuu[i].name + '":"' +uuu[i].id + '",';
    		}else{
    			str += '"' + uuu[i].name + '":"' +uuu[i].id + '"';
    		}
    	}
    	str += "}";
    	return JSON.parse(str);
    	//{s: "1", f: "2", v: "3"}
    },
    
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(params){
    	var dialogOptions=null;
    	this.issub=params.sub;
    	this._options.datatype=this.getDataType();
        if (!params.add) {
            this._options.mode = "EDIT";
            this._options.data = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.update,
                        click: this.proxy(function (e) {
                        	if(this.form.valid()){
	                        	var obj=this.formdata(this.form.serializeArray());
	                        	if(this.filter_valid(obj)){
		                            	this._sendModifyAjax({
		                            		"tokenid": $.cookie("tokenid"),
		                            		"method": "stdcomponent.update",
		                            		"dataobject": "item",
		                            		"dataobjectid": JSON.stringify(parseInt(params.data.id)),
		                            		 "obj":JSON.stringify(obj)
			                            },e);
	                        		}
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
        }else if(params.add){
        	this._options.mode = "ADD";
            this._options.data = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.add,
                        click: this.proxy(function (e) {
                        	if(this.form.valid()){
	                        	var obj=this.formdata(this.form.serializeArray());
	                        	if(this.filter_valid(obj)){
		                            	this._sendModifyAjax({
		                            		"tokenid": $.cookie("tokenid"),
		                            		"method": "stdcomponent.add",
		                            		"dataobject":"item",
		                            		 "obj":JSON.stringify(obj)  
			                            },e);
	                        		}
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
        this.formDialog.dialog("option",dialogOptions).dialog("open");
       $(".startdate").datepicker({ dateFormat: "yy-mm-dd" }); 
       $(".enddate").datepicker({ dateFormat: "yy-mm-dd" });
    },
    
   getDataType:function(){
	   var getDataTypedata="";
	   $.u.ajax({
           url: $.u.config.constant.smsqueryserver,
           dataType: "json",
           async:false,
           data: {
       		"tokenid":$.cookie("tokenid"),
       		"method": "getItemFieldsData",
       		"field":true
       	}
       }, this.filtersel, {size: 2, backgroundColor: "#fff"}).done(this.proxy(function (response) {
       	if (response.success) {    
       		getDataTypedata=$.map(response.data.aaData, this.proxy(function(item, idx){
       			return { "id": item.id, "name": item.name };
       		}));
       	}
       })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

       }));
	   if(getDataTypedata){
		   return getDataTypedata
	   }
   },
    
    /*
     * 提交(编辑 添加)数据
    */
    formdata:function(form){
	    var data={};
	    $.each(form, function(idx, field){
	    	data[field.name] = field.value;
		}); 
	   if(data.optionsRadios==""||!data.optionsRadios){
		 data.optionsRadios= $("[name=optionsRadios]:checked").val();  
	   }
	   var  dataresult={
	    		"point":data[data.optionsRadios+"point"],//审计要点
	    		"according":data[data.optionsRadios+"according"],//审计依据
	    		"prompt":data[data.optionsRadios+"prompt"],//审计提示
	    		"value":parseInt(data[data.optionsRadios+"value"]),//分值
	    		//"orderNo":parseInt(data[data.optionsRadios+"orderNo"]),//排序号
	    		"pointType":data.optionsRadios,//章节OR 要点
	    };
		
	  dataresult["startDate"]= $("[name='" +data.optionsRadios+ "startdate']").datepicker({ dateFormat: 'dd-mm-yy' }).val() ;
	  dataresult["endDate"]= $("[name='" +data.optionsRadios+ "enddate']").datepicker({ dateFormat: 'dd-mm-yy' }).val();
	
	  var type_id =this.qid("unit-"+data.optionsRadios+"type").select2("data");
		  dataresult["type"] =type_id?type_id.id:"";
	  var unit_id =this.qid("unit-"+data.optionsRadios+"unit").select2("data");
		  dataresult["unit"] =unit_id?unit_id.id:"";
	  var version_id = this.qid("unit-"+data.optionsRadios+"version").select2("data");
	  	  dataresult["version"]=version_id?version_id.id:"";
	  var profession_id= this.qid("unit-"+data.optionsRadios+"profession").select2("data"); 
	  	  dataresult["profession"] =profession_id?profession_id.id:"";
	  	  dataresult["parent"] =parseInt( this.qid("unit-"+data.optionsRadios+"chapter").attr("value"));
	    return dataresult;
    },	
    
    
    /*
     * 章节要点切换
     */
    on_radioSwitch:function(){
	    if(this.qid("Radiochapter").prop("checked")){
	    	$(".form-point", this.form).addClass("hidden");
	    	$(".form-chapter", this.form).removeClass("hidden");
		}else  if(this.qid("Radiopoint").prop("checked")) {
			$(".form-point", this.form).removeClass("hidden");
	    	$(".form-chapter", this.form).addClass("hidden");
		}
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
        },this.qid("unit-dialog-edit").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
                this.formDialog.dialog("close");
                this.refreshDataTable();
                $.u.alert.success("操作成功",2000);
        	}
        	if(response.data){
        		this.cookie_back(response.data);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        }));
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
    	var dataType=this.transform_data_type(this._options.datatype);
    	var cp=data.pointType==="point"||"chapter"? data.pointType:"";
    	if(cp){
    		$.each(data, this.proxy(function(name, value){
    			$("[name='" +cp+ name + "']", this.form).val(value);//
        	}));
    	
			if(data.startDate){
				$("[name='" +cp+ "startdate']").val(data.startDate);
			}
			if(data.endDate){
				$("[name='" +cp+ "enddate']").val(data.endDate);
			}
			
			this.qid("unit-"+cp+"type").select2("data", {id:dataType[data.type], name:data.type});
			this.qid("unit-"+cp+"unit").select2("data", {id:data.unitId, name:data.unit});
			this.qid("unit-"+cp+"version").select2("data", {id:data.versionId, name:data.version});
			this.qid("unit-"+cp+"profession").select2("data", {id:data.professionId, name:data.profession});
		//	this.qid("unit-"+cp+"chapter").select2("data", {id:data.parentId, name:data.parent});
			this.qid("unit-"+cp+"chapter").attr("value",data.parentId).val(data.parent);
			var ver_div=$("[name='" +cp+ "version']",this.form).parent().parent();
			var date_div=$("[name='" +cp+ "startdate']",this.form).parent().parent();
			
		
			if(dataType[data.type]=="TME"){
				if(cp=="point"){
					date_div.removeClass("hidden");
				}
				ver_div.addClass("hidden");
			}
			if(dataType[data.type]=="SYS"){
				ver_div.removeClass("hidden");
				date_div.addClass("hidden");
			}
    	
			if(cp=="chapter"){
				date_div.addClass("hidden");
			}
			
			if(dataType[data.type]=="SUB" ||dataType[data.type].indexOf("SUB") >-1||data.type=="SUB" /*&& this.issub*/){
				ver_div.removeClass("hidden");//显示版本
				this.qid("unit-"+cp+"unit").closest(".form-group")
				.add(this.qid("unit-"+cp+"unit").closest(".form-group"))
				.removeClass("hidden");//显示安检机构
        	}else
        		this.qid("unit-"+cp+"unit").closest(".form-group")
        		.add(this.qid("unit-"+cp+"unit").closest(".form-group"))
        		.addClass("hidden");
        	
			this.Radio_disabled(cp);
    	}
		
    },
  
    
    /*
     * 填充表单数据
     */
    cookieFormData:function(data){
    	var dataType=this.transform_data_type(this._options.datatype);
    	
    	data =$.parseJSON(data);
    	var cp=data.pointType==="point"||"chapter"? data.pointType:"";
    	if(cp){
			this.qid("unit-"+cp+"type").select2("data", {id:dataType[data.type], name:data.type});
			this.qid("unit-"+cp+"unit").select2("data", {id:data.unit, name:data.unitDisplayName});
			this.qid("unit-"+cp+"version").select2("data", {id:data.versionId, name:data.versionDisplayName});
			this.qid("unit-"+cp+"profession").select2("data", {id:data.professionId, name:data.professionDisplayName});
		//	this.qid("unit-"+cp+"chapter").select2("data", {id:data.parentId, name:data.parent});
			var ver_div=$("[name='" +cp+ "version']",this.form).parent().parent();
			var date_div=$("[name='" +cp+ "startdate']",this.form).parent().parent();
			
			if(dataType[data.type]=="TME"){
				if(cp=="point"){
					date_div.removeClass("hidden");
				}
				ver_div.addClass("hidden");
			}
			if(dataType[data.type]=="SYS"){
				ver_div.removeClass("hidden");
				date_div.addClass("hidden");
			}
			if(cp=="chapter"){
				date_div.addClass("hidden");
			}
			if(dataType[data.type]=="SUB"||dataType[data.type].indexOf("SUB") >-1||data.type=="SUB" /*&& this.issub*/){
				ver_div.removeClass("hidden");//显示版本
				this.qid("unit-"+cp+"unit").closest(".form-group")
        		.add(this.qid("unit-"+cp+"unit").closest(".form-group")).removeClass("hidden");
        	}
    	}
    },
    
    Radio_disabled:function(cp){
    	this.qid("Radio"+cp,this.form).trigger("click").trigger("click");
    	$("[name=optionsRadios]",this.form).attr("disabled","disabled");
    },
    
   
    
    
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$(":text,textarea",this.form).val("").text("");
    	$("input.select2",this.formDialog).select2("data","");
    	$(".startdate").val("");
       	$(".enddate").val("");
        var cdate =$(".startdate",this.form).parent().parent();
        cdate.is(":hidden")?"":cdate.addClass("hidden");
        var cver =$(".version",this.form).parent().parent();
        cver.is(":hidden")?cver.removeClass("hidden"):cver.addClass("hidden");
        cver.hasClass("hidden");
        $("[name=optionsRadios]",this.form).removeAttr("disabled");
        var backID=[], carryid=[] ,parryid=[];
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
    
	
    
	
	
    filter_valid: function(obj){
    	var startDate = $.trim(obj.startDate), 
    		endDate = $.trim(obj.endDate), 
    		result = true, 
    		msg = [];
    	if(startDate && (new Date(startDate)) == "Invalid Date"){
    		result = false;
    		msg.push(com.audit.checklist.unitDialogEdit.i18n.startDateFormat);
    	}else{
    		startDate = new Date(startDate);
    	}
    	
    	if(endDate && (new Date(endDate)) == "Invalid Date"){
    		result = false;
    		msg.push(com.audit.checklist.unitDialogEdit.i18n.endDateFormat);
    	}else{
    		endDate = new Date(endDate);
    	}
    	
    	if(startDate && endDate && (startDate - endDate > 0)){
    		result = false;
    		msg.push(com.audit.checklist.unitDialogEdit.i18n.startBigThanEnd);
    	}
    	if(result){
    		this.$validMsg.addClass("hidden").text("");
    	}else{
    		this.$validMsg.removeClass("hidden").text(msg.join(" ")).css("display","block");
    	}
    	return result;
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


com.audit.checklist.unitDialogEdit.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js", 
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.checklist.unitDialogEdit.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

