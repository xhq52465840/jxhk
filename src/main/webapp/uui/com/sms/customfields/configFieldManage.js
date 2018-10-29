//@ sourceURL=com.sms.customfields.configFieldManage
$.u.define('com.sms.customfields.configFieldManage', null, {
    init: function (options) {
		/*{
			title:"",		// 标题
			dataobject:"",	// 数据对象
			fields:[
				{name:"",label:"",type:"",dataType:"int",rule:{requred:true,email:true,date:true},message:"名称不能为空",description:"",ajax:{}}
			]
		}*/
    	
    	/*
    	 * 1.先buildform
    	 * 2.当添加时，去掉unitdata里的安监机构，rodia的选中和展示
    	 * 3.当修改时，去掉unitdata里的安监机构，rodia的选中和展示，本身安监机构的显示
    	 */
        this._options = options || {};
        this._options.data=null;
        this._options.mode="ADD";
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.customfields.configFieldManage.i18n;
    	// 表单
    	this.form=this.qid("form");
    	
    	this.configFieldManage = this.qid("configFieldManage").dialog({
            title:this._options.title,
            width:680,
            height:700,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create:this.proxy(function(){
            	//this.buildForm();
            }),
            open:this.proxy(function(){
            	// 填充表单
            	if(this._options.mode=="EDIT"){
	            	if(this._options.data){
	            		this.fillFormData(this._options.data);
	            	}
            	}else if(this._options.mode=="ADD"){
            		//去掉安监机构
       			 $("input[name=allunit]").parent().show();
       			 $.each(this._options.unitdata,this.proxy(function(k,v){
   						$('option[value='+v+']','select[name=units]').remove();
       				if($.inArray(-1,this._options.unitdata)>-1){
       					$("input[name=allunit][value=all]").attr("checked",false);
           				$("input[name=allunit][value=part]").attr("checked",true);
           				$("input[name=allunit]").parent().parent().hide();
   					}else{
   						$("input[name=allunit][value=all]").attr("checked",false);
           				$("input[name=allunit][value=part]").attr("checked",false);
   					}
       			 }))
            	}
            }),
            close:this.proxy(function(){
            	// 清空表单
            	this.clearFormData();
            	this.form.empty();
            })
        }); 
    	
    },
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:""} data:数据，title为编辑时的标题
     */
    open:function(params){
    	var dialogOptions=null;
    	this._options.fieldname = params.fieldname;
    	this.form.empty();
    	this.buildForm();
        if (params.data) {
        	this._options.unitdata = params.unitdata;
            this._options.mode = "EDIT";
            this._options.data = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.update,
                        click: this.proxy(function (e) {
                        	if(this.valid()){
                            	this._sendModifyAjax({
                            		"tokenid":$.cookie("tokenid"),
                            		"method":"stdcomponent.update",
                            		"dataobject":this._options.dataobject,
                            		"dataobjectid":this._options.data.id,
                            		"obj":JSON.stringify(this.getFormData())
	                            },e);
                            }
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.configFieldManage.dialog("close");
                        })
                    }
                ]
            };
        }else{
        	this._options.unitdata = params.unitdata;
            this._options.mode = "ADD";            
        	dialogOptions = {
                title: this._options.title,
                buttons: [
                    {
                        text: this.i18n.add,
                        click: this.proxy(function (e) {
                            if (this.valid()) {console.log(this.getFormData());
                                this._sendModifyAjax({
                                	  "tokenid":$.cookie("tokenid"),
    	                      		  "method":"stdcomponent.add",
    	                      		  "dataobject":this._options.dataobject,
    	                      		  "obj":JSON.stringify(this.getFormData())
                                },e);
                            }
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.configFieldManage.dialog("close");
                        })
                    }
                ]
            };
        }
        this.configFieldManage.dialog("option",dialogOptions).dialog("open");
    },
    /*
     * 请求更新数据(新增、修改)
     */
    valid:function(){
    	var err = $('input:text',this.form).val();
    	$('div[type=errtype]',this.form).remove();
    	if(!err){
    		$('<div type="errtype" style="color:red;"></div>').text(this.i18n.notNull).appendTo($('input:text',this.form).parent());
    		return false;
    	}
    	var allunit = $("input[name=allunit]:checked").val();
    	if(!allunit){
    		$('<div type="errtype" style="color:red;"></div>').text(this.i18n.mustSelect).appendTo($("input[name=allunit]").parent());
    		return false;
    	}else{
    		//
    		if(allunit=="part"){
    			if(!$("select[name=units]").val()){
    				$('<div type="errtype" style="color:red;"></div>').text(this.i18n.safeNotsel).appendTo($("input[name=allunit]").parent());
    				return false;
    			}
    		}
    	}
    	return true;
    },
    _sendModifyAjax:function(data,e){
    	this.disableForm();
    	$(e.currentTarget).add($(e.currentTarget).next()).button("disable");
    	
    	$.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        }).done(this.proxy(function(response){
        	if(response.success){
                this.configFieldManage.dialog("close");
                this.refreshDataTable();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
        }));
    },

    /*
     * 根据设置创建表单
     */
    buildForm:function(){
    	//生成默认的表单
    	$.each(this._options.fields,this.proxy(function(k,v){
    		  $table = $('<table width="100%" style="font-size:13px;" />').appendTo(this.form);
    		  $.each(v.fields,this.proxy(function(k1,v1){
    			  $this = $('<tr style="height:40px;"/>').appendTo($table);
    				switch(v1.type){
    				  case "title":
    					$('<td colspan="2"><h4 style="border-bottom:1px solid #ddd;padding-bottom:5px;font-weight:bold;">'+v1.label+'</h4><div><small><p>'+v1.description+'</p></small></div></td>').appendTo($this);
    					break;
    				  case "label":
    					$('<td align="right" style="padding-right:10px;"  width="20%">'+v1.label+'</td><td  width="80%"><label name="'+v1.name+'">'+(this._options.fieldname?this._options.fieldname:"")+'</label></td>').appendTo($this);
    					break;
    				  case "text":
    					$('<td align="right" style="padding-right:10px;">'+v1.label+'*</td><td><input type="text" class="form-control input-sm" name="'+v1.name+'" style="width:100%;"/></td>').appendTo($this);
    					break;
    				  case "textarea":
    					$('<td align="right" style="padding-right:10px;">'+v1.label+'</td><td><textarea class="form-control input-sm" style="width: 100%;height: 100px;" name="'+v1.name+'"></textarea></td>').appendTo($this);
    					$('<td></td><td>'+v1.description+'</td>').appendTo($('<tr/>').appendTo($table));
    					break;
    				  case "select":
    					  var $target = null;
    					  $('<td align="right" width="20%" style="padding-right:10px;">'+v1.label+'</td>').appendTo($this);
    					  $target=$('<select size="3" name="'+v1.name+'" style="width: 225px;" class="form-control input-sm" multiple=”multiple”></select>').appendTo($('<td width="80%"></td>').appendTo($this));
    	    			  var field = v1;	
    					  if(field.ajax){
    						  $.ajax({
    							    url: field.ajax.url ? field.ajax.url : $.u.config.constant.smsqueryserver,
    							    type:"post",
      	    				        dataType: "json",
      	    				        async:false,
      	    				        data:$.extend({
    			        				tokenid:$.cookie("tokenid"),
    			        				method:"stdcomponent.getbysearch"
    			        			},field.ajax.data)
    						  }).done(this.proxy(function (data) {
    							  if(data.success){
    								  if(field.ajax.data.dataobject=="activityType"){
    									  $('<option value="" selected="selected">'+this.i18n.anySafeMsg+'</option>').appendTo($target);
    								  }
    								  $.each(data.data.aaData,function(k2,v2){
		        						 $('<option value="'+v2.id+'">'+v2.name+'</option>').appendTo($target);
		        					  })
    							  }
    					      })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

    					      })).complete(this.proxy(function(){
    					      }));
    	    			  }
    					$('<td></td><td>'+v1.description+'</td>').appendTo($('<tr/>').appendTo($table));
    					break;
    				  case "radio":
    					$('<td align="right" width="20%" style="padding-right:10px;"></td><td width="80%"><input type="radio"  name="allunit" value="all">Global context '+this.i18n.allowUse+'。</input><br/><input type="radio" name="allunit" value="part">'+this.i18n.allowSelect+'</input></td>').appendTo($this);
    					$('<td></td><td>'+v1.description+'</td>').appendTo($('<tr/>').appendTo($table));
    					break;
    				}
    			}))
    	}))
    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var data={},intFields=[];
    	$.each(this._options.fields,function(idx,field){
    		$.each(field,function(k,v){
    			$.each(v,function(k1,v1){
        			if(v1.dataType){
        				v1.dataType && v1.dataType == "int" ? intFields.push(v1.name) : null;
        			}
    			})
    		})
    	});
    	$.each(this.form.serializeArray(),function(idx,field){
    		var allunit = "";
    		if($.inArray(field.name,intFields)>-1){
    			if(field.name=="activityTypes"){
    				if($("select[name="+field.name+"]").val()==""){
    					data[field.name] = "";
    				}else{
    					var modify = $.grep($("select[name="+field.name+"]").val(),function(li,idx){
	        				return li!="";
	        			})
	    				data[field.name] = $.map(modify,function(li,idx){
	        				return parseInt(li);
	        			})
        			}
    			}else if(field.name=="units"){
    				allunit = $("input[name=allunit]:checked").val();
    				if(allunit =="all"){
    					data["units"] = [];
    				}else if(allunit =="part"){
    					data["units"] = $.map($("select[name=units]").val(),function(li,idx){
            				return parseInt(li);
            			})
    				}
    			}
    		}else{
    			if(field.name == "allunit"){
    				
    			}else{
    				data[field.name]=field.value;
    			}
    		}
    	});
    	data["field"] = parseInt(this._options.field) || null;
    	return data;
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
    	$.each(data,this.proxy(function(name,value){
    		switch(name){
    			case "activityTypes":
    				var Data =$.map(value,function(item,idx){
        				return item.id;
        			});
    				if(Data.length==0){
    					Data=[""];
    				}
        			$("[name='"+name+"']",this.form).val(Data);
        			break;
    			case "units":
    				$("input[name=allunit]").parent().show();
        			if(value==null){
        				$("input[name=allunit][value=all]").attr("checked",true);
        				$("input[name=allunit][value=part]").attr("checked",false);
        				$.each(this._options.unitdata,function(k,v){
        					$('option[value='+v+']','select[name='+name+']').remove();
        				})
        			}else{
        				var Data =$.map(value,this.proxy(function(item,idx){
        					$.each(this._options.unitdata,function(k,v){
            					$('option[value='+v+']','select[name='+name+']').remove();
            				})
        					$('<option value="'+item.id+'">'+item.name+'</option>').appendTo($("select[name="+name+"]"));
            				return item.id;
            			}));
            			$("[name='"+name+"']",this.form).val(Data);
           				if($.inArray(-1,this._options.unitdata)>-1){
               				$("input[name=allunit]").parent().hide();
       					}
       					$("input[name=allunit][value=all]").attr("checked",false);
           				$("input[name=allunit][value=part]").attr("checked",true);
        			};
        			break;
        		default:
        			$("[name='"+name+"']",this.form).val(value);
        			break;
    		}
    	}));
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$(":text,textarea,select,:radio",this.form).val("");
    	$("label",this.form).first().text("");
    },
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",true);
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",false);
    },
    destroy: function () {
        this._super();
    },
}, { usehtm: true, usei18n: true });

