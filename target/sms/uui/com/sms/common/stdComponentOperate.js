//@ sourceURL=com.sms.common.stdComponentOperate
$.u.define('com.sms.common.stdComponentOperate', null, {
    init: function (options,params) {
    	this._options=options;
    	this._attachmentIds = []; // 上传附件的id集合
    	this.actionItemId="";
		/*{
			title:"",		// 标题
			dataobject:"",	// 数据对象
			fields:[
				{name:"",label:"",type:"",dataType:"int",enums:[],rule:{required:true,email:true,date:true},message:"名称不能为空",description:"",
					option:{ // 推荐使用此种配置
						params:{},
						id:function(item){},
						data:[],
						formatSelection:function(item){},
						formatResult:function(item){},
						minimumResultsForSearch:0,
						ajax:{
							url:"",
							data:{},
							success:function(comp,formdata,response){}
						}
					},
					ajax:{ // 日后取消
						id:function(item){},
						url:"",
						data:{},
						formatSelection:function(item){},
						formatResult:function(item){},
						minimumResultsForSearch:0,
						success:function(comp,formdata,response){}
					}
				}
			],
			add:function(comp,formdata){},
			afterAdd:function(comp,formdata){},
			edit:function(comp,formdata){},
			afterEdit:function(comp,formdata){}
		}*/
        this._options = options || {};
        this._options.data=null;
        this._options.mode="ADD";
        
        this.fieldMap={};
        $.each(this._options.fields,this.proxy(function(idx,field){
        	this.fieldMap[field.name]=field;
        }));
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.common.stdComponentOperate.i18n;
    	// 表单
    	this.form=this.qid("form");
    	this.formDialog = this.qid("dialog").dialog({
            title:this._options.title,
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            focus: this.proxy(function(){
            	this.formDialog.parent().find("button").focus();
            }),
            create:this.proxy(function(){
            	this.buildForm();
                $(this.qid("form")).unbind("keypress").keypress(this.proxy(function(e){
//                    if(e.which === 13){ 
//                        this.formDialog.parent().find(".ui-dialog-buttonpane button.ok").trigger("click");
//                        e.preventDefault();
//                    }
                }));
            }),
            open:this.proxy(function(){
            	this._attachmentIds = [];
            	if(this._options.mode=="EDIT" || this._options.mode=="COPY"){
	            	if(this._options.data){
	            		this.fillFormData(this._options.data);
	            	}
            	}                
            }),
            close:this.proxy(function(){
            	this.clearFormData();
            })
        }); 
    	
    },
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(params,data_id){
    	var dialogOptions=null;
    	this.actionItemId=Number(data_id);
        if (params) {
        	if(params.operate=="COPY"){
        		this._options.mode = "COPY";
	            this._options.data = params.data;
	            this._options.method = params.method,
	            dialogOptions = {
	                title: params.title,
	                buttons: [
	                    {
	                        text: this.i18n.copy,
                            "class": "ok",
	                        click: this.proxy(function (e) {
	                        	if(this.form.valid()){
	                        			var copyData = this.getFormData();
	                        			var afterCopy = params && params.afterCopy && typeof params.afterCopy == "function"
                							? params.afterCopy
                							: (this._options.afterCopy && typeof this._options.afterCopy == "function"
                								? this._options.afterCopy
                								:null);
		                            	this._sendModifyAjax({
		                            		"tokenid":$.cookie("tokenid"),
		                            		"method":this._options.method,
		                            		"dataobject":this._options.dataobject,
		    	                      		"fieldLayout":this._options.data.id,
		    	                      		"fieldLayoutScheme":this._options.data.id,
		    	                      		"fieldScreenScheme":this._options.data.id,
		    	                      		"fieldScreen":this._options.data.id,
		    	                      		"activityTypeFieldScreenScheme":this._options.data.id,
		    	                      		"activitySecurityScheme":this._options.data.id,
		    	                      		"permissionScheme":this._options.data.id,
		    	                      		"notificationScheme":this._options.data.id,
		    	                      		"workflowScheme":this._options.data.id,
		    	                      		"filtermanagerId":this._options.data.id,
		    	                      		"filtermanagerName":copyData["name"],
		    	                      		"name":copyData["name"],
		    	                      		"description":copyData["description"],
		    	                      		"obj":JSON.stringify(copyData)
			                            },e,afterCopy);
	                            }
	                        })
	                    },
	                    {
	                        text: this.i18n.cancel,
	                        "class": "aui-button-link",
	                        click: this.proxy(function () {
	                            this.formDialog.dialog("close");
	                        })
	                    }
	                ]
	            };
	            this.formDialog.dialog("option",dialogOptions).dialog("open");
        	}else{
	            this._options.mode = "EDIT";
	            if(params.data){ // 参数传入编辑数据
	            	this._options.data = params.data;
	            	dialogOptions = {
    	                title: params.title,
    	                buttons: [
    	                    {
    	                        text: this.i18n.update,
                                "class": "ok",
    	                        click: this.proxy(function (e) {
    	                        	if(this.form.valid()){
    	                        		if(params.edit && typeof params.edit == "function"){
    	                        			params.edit(this,this.getFormData());
    	                        		}else if(this._options.edit && typeof this._options.edit == "function"){
    	                        			this._options.edit(this,this.getFormData(),params.data.id);
    	                        		}else{
    	                        			var afterEdit = params && params.afterEdit && typeof params.afterEdit == "function"
    	                        							? params.afterEdit
    	                        							: (this._options.afterEdit && typeof this._options.afterEdit == "function"
    	                        								? this._options.afterEdit
    	                        								:null);
    		                            	this._sendModifyAjax({
    		                            		"tokenid":$.cookie("tokenid"),
    		                            		"method":"stdcomponent.update",
    		                            		"dataobject":this._options.dataobject,
    		                            		"dataobjectid":this._options.data.id,
    		                            		"obj":JSON.stringify(this.getFormData())
    			                            },e,afterEdit);
    	                        		}
    	                            }
    	                        })
    	                    },
    	                    {
    	                        text: this.i18n.cancel,
    	                        "class": "aui-button-link",
    	                        click: this.proxy(function () {
    	                            this.formDialog.dialog("close");
    	                        })
    	                    }
    	                ]
    	            };
	                this.formDialog.dialog("option",dialogOptions).dialog("open");
	            }else if(params.dataid){ // 参数传入待编辑 
	            	$.u.ajax({
	                	url: $.u.config.constant.smsqueryserver,
	                    type:"post",
	                    dataType: "json",
	                    cache: false,
	                    "data": {
	                    	"tokenid":$.cookie("tokenid"),
                    		"method":"stdcomponent.getbyid",
                    		"dataobject":this._options.dataobject,
                    		"dataobjectid":params.dataid,
	                    }
	                },this.formDialog.parent()).done(this.proxy(function(response){
	                	if(response.success){
	                		this._options.data=response.data;
	                		dialogOptions = {
            	                title: params.title,
            	                buttons: [
            	                    {
            	                        text: this.i18n.update,
                                        "class": "ok",
            	                        click: this.proxy(function (e) {
            	                        	if(this.form.valid()){
            	
            	                        		if(params.edit && typeof params.edit == "function"){
            	                        			params.edit(this,this.getFormData());
            	                        		}else if(this._options.edit && typeof this._options.edit == "function"){
            	                        			this._options.edit(this,this.getFormData());
            	                        		}else{
            	                        			var afterEdit = params && params.afterEdit && typeof params.afterEdit == "function"
            	                        							? params.afterEdit
            	                        							: (this._options.afterEdit && typeof this._options.afterEdit == "function"
            	                        								? this._options.afterEdit
            	                        								:null);
            		                            	this._sendModifyAjax({
            		                            		"tokenid":$.cookie("tokenid"),
            		                            		"method":"stdcomponent.update",
            		                            		"dataobject":this._options.dataobject,
            		                            		"dataobjectid":this._options.data.id,
            		                            		"obj":JSON.stringify(this.getFormData())
            			                            },e,afterEdit);
            	                        		}
            	                            }
            	                        })
            	                    },
            	                    {
            	                        text: this.i18n.cancel,
            	                        "class": "aui-button-link",
            	                        click: this.proxy(function () {
            	                            this.formDialog.dialog("close");
            	                        })
            	                    }
            	                ]
            	            };
	                        this.formDialog.dialog("option",dialogOptions).dialog("open");
	                	}
	                })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	                	
	                })).complete(this.proxy(function(jqXHR,errorStatus){
	                	
	                }));
	            }
        	}
        }else{
            this._options.mode = "ADD";
        	dialogOptions = {
                title: this._options.title,
                buttons: [
                    {
                        text: this.i18n.add,
                        "class": "ok",
                        click: this.proxy(function (e) {
                            if (this.form.valid()) {
                            	if(this._options.fields){
                            		for(i in this._options.fields){
                            			if(this._options.fields[i].type=="file"){
                            				var rendyOn=this._options.fields[i].rule.required;
                            			}
                            		}
                            		if(rendyOn==true){
                    					if (this.$attachment.data('uploadify').queueData.queueLength > 0) {
                                            this.$attachment.uploadify('upload', '*');
                                          }else{
                                    	    $.u.alert.error("请选择附件");
                                         }
                    				}else{
                                		if(this._options.add && typeof this._options.add == "function"){
        	                    			this._options.add(this,this.getFormData());
        	                    		}else{
        	                    			var afterAdd = params && params.afterAdd && typeof params.afterAdd == "function"
                    							? params.afterAdd
                    							: (this._options.afterAdd && typeof this._options.afterAdd == "function"
                    								? this._options.afterAdd
                    								:null);
        	                                this._sendModifyAjax({
        	                                	  "tokenid":$.cookie("tokenid"),
        	    	                      		  "method":"stdcomponent.add",
        	    	                      		  "dataobject":this._options.dataobject,
        	    	                      		  "obj":JSON.stringify(this.getFormData())
        	                                },e,afterAdd);
        	                    		}	
                                	}
                            	}
	                            
                            }
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.formDialog.dialog("close");
                        })
                    }
                ]
            };
            this.formDialog.dialog("option",dialogOptions).dialog("open");
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
        },this.formDialog.parent(),{ size: 1,backgroundColor:'transparent', orient: "west" }).done(this.proxy(function(response){
        	if(response.success){
        		func && typeof func == "function" && func(this,JSON.parse(data.obj),response);
                this.formDialog.dialog("close");
                this.refreshDataTable();
                $.u.alert.success("操作成功。");
                
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
    	var $div = null,
    		$label = null,
    		$container = null,
    		$target = null,
    		rules = {},
    		messages = {};
    	$.each(this._options.fields,this.proxy(function(idx,field){
    		$div = $("<div/>").addClass("form-group").appendTo(this.form);
    		$label = $("<label/>").addClass("col-sm-3 control-label").attr("for",this._id+"-"+field.name).html(field.label+"<span class='text-danger'>&nbsp;</span>").appendTo($div);
    		$container = $("<div style='padding-left:0px;'/>").addClass("col-sm-9").appendTo($div);
    		switch(field.type){
    			case "text":
    				$target=$("<input maxlength='" + (field.maxlength || "") + "' type='text'/>").val(field.value).appendTo($container);
    				break;
    			case "checkbox":
    				$target=$("<input type='checkbox'/>").appendTo($container);
    				break;
    			case "colorpicker":
    				$target=$("<input type='text' readonly='readonly'/>").val(field.value).appendTo($container);
    				var $colorDiv = $("<div style='padding:15px;position:absolute;right:-20px;top:0;background-color: black;'/>").insertAfter($target);
    				$colorDiv.ColorPicker({
    					color: '#0000ff',
    					onShow: function (colpkr) {
    						$(colpkr).fadeIn(500);
    						return false;
    					},
    					onHide: function (colpkr) {
    						$(colpkr).fadeOut(500);
    						return false;
    					},
    					onChange: function (hsb, hex, rgb) {
    						$target.val('#'+hex);
    						$colorDiv.css('backgroundColor', '#' + hex);
    					}
    				});
    				break;
    			case "textarea":
    				$textarea = $("<textarea maxlength='" + (field.maxlength || "") + "' style='height:250px;resize:none;'/>");
    				$target=$textarea.appendTo($container);
    				$textarea.on("blur",function(){
   	    					   var val=$textarea.val();
   	    					   val=val.replace(/\n/g,'<br>');
   	    					  $textarea.val(val);
    				});
    				break;
    			case "file":
    				$target=$("<input type='text' id='attachment' />").appendTo($container);
    				this.$attachment=$container.find("#attachment");
    				this.$attachment.uploadify({
    		            'auto': false,
    		            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
    		            'uploader': $.u.config.constant.smsmodifyserver + ";jsessionid=" + $.cookie("sessionid"),
    		            'fileTypeDesc': 'doc', //文件类型描述
    		            'fileTypeExts': '*.*', //可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
    		            'removeCompleted': true,
    		            'buttonText': '选择附件', //按钮上的字
    		            'cancelImg': this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
    		            'height': 25, //按钮的高度和宽度
    		            'width': 140,
    		            'progressData': 'speed',
    		            'method': 'get',
    		            'removeTimeout': 3,
    		            'successTimeout': 99999,
    		            'multi': true,
    		            'fileSizeLimit': '10MB',
    		            'queueSizeLimit': 999,
    		            'simUploadLimit': 999,
    		            'onQueueComplete': this.proxy(function(queueData) {
    		                if (queueData.uploadsErrored > 0) {
    		                    $.u.alert.error("上传失败：" + data.reason, 3000);
    		                } else {
    		                    this._sendModifyAjax({
    		                        "tokenid": $.cookie("tokenid"),
    		                        "method": "executeActionItem",
    		                        "fileIds": JSON.stringify(this._attachmentIds),
    		                        "actionItemId": this.actionItemId,
    		                        "completionStatus":$textarea.val(),
    		                    });
    		                }
    		            }),
    		            'onUploadStart': this.proxy(function(file) {
    		                this.$attachment.uploadify('settings', 'formData', {
    		                    method: 'uploadFiles',
    		                    tokenid: $.cookie("tokenid"),
    		                    sourceType: 28
    		                });
    		            }),
    		            'onUploadSuccess': this.proxy(function(file, data, response) {
    		                if (data) {
    		                    data = JSON.parse(data);
    		                    if (data.success) {
    		                        this._attachmentIds = this._attachmentIds.concat($.map(data.data.aaData, function(item, idx) {
    		                            return item.id;
    		                        }));
    		                    } else {
    		                        $.u.alert.error("上传失败：" + data.reason, 3000);
    		                    }
    		                }
    		            })
    		        });
    				break;
    			case "render":
    				$target=$("<select/>").appendTo($container);
    				if(field.ajax){
    					$.ajax({
    	                    url: $.u.config.constant.smsqueryserver,
    	                    dataType: "json",
    	                    cache: false,
    	                    async:false,
    	                    data: {
    	                    	tokenid:$.cookie("tokenid"),
		        				method:field.ajax.data.method,
		        				fieldLayoutItem:field.ajax.data.fieldlayouyitem
    	                    }
    	                }).done(this.proxy(function (response) {
    	                    if (response.success) {
    	                    	response.data&&$.each(response.data,function(k,v){
    	                    	   $('<option value="'+v.key+'">'+v.name+'</option>').appendTo($target);
    	                       })
    	                    }
    	                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

    	                })).complete(this.proxy(function(){
    	                }));
    				}
    				break;
    			case "enum":
    				$target=$("<select/>").appendTo($container);
    				field.enums && $.each(field.enums,function(idx,item){
    					$("<option/>").attr("value",item.value).text(item.name).appendTo($target);
    				});
    				break;
    			case "hidden":
    				$target=$("<input type='hidden'/>").val(field.value).appendTo($container);
    				$target.parent().parent().hide();
    				break;
    			case "date":
    				$target = $('<span class="ui-helper-hidden-accessible"><input type="text"/></span>'+ // 解决dialog默认focus第一个元素
    							'<input type="text"  class="form-control input-sm"/>'+
								'<span class="glyphicon glyphicon-calendar form-control-feedback"></span>').appendTo($container.addClass("has-feedback"));
					$target = $target.eq(1);
					$target.val(field.value);
    				setTimeout(function(){ $target.datepicker({
                        dateFormat:"yy-mm-dd", 
                        changeMonth: true, 
                        changeYear: true,
                        onClose: function(dateText, inst){
                            $target.blur();
                        }
                    }); },100);
					break;
    			case "datetime":
    				$target = $('<span class="ui-helper-hidden-accessible"><input type="text"/></span>'+ // 解决dialog默认focus第一个元素
								'<input type="text"  class="form-control input-sm"/>'+
    							'<span class="glyphicon glyphicon-calendar form-control-feedback"></span>').appendTo($container.addClass("has-feedback"));
    				$target = $target.eq(1);
					$target.val(field.value);
    				setTimeout(function(){ $target.datetimepicker({
                        dateFormat:"yy-mm-dd",
                        timeFormat:"HH:mm:ss", 
                        changeMonth: false, 
                        maxDate: 0,
                        changeYear: false,
                        onClose: function(dateText, inst){
                            $target.blur();
                        }
                    });},100);
    				break;
    			case "select":
    				var s = null,
    					setting={
    						width: "100%",
    						minimumResultsForSearch: field.option && field.option.minimumResultsForSearch || 0, 
	    					id:function(item){
					        	if(field.option && field.option.id && typeof field.option.id == "function"){
					        		return field.option.id(item);
					        	}else{
					        		return item.id;
					        	}
					        },
					        formatResult:function(item){
					        	if(field.option && field.option.formatResult && typeof field.option.formatResult == "function"){
					        		return field.option.formatResult(item);
					        	}else{
					        		return item.name;
					        	}
					        },
					        formatSelection:function(item){
					        	if(field.option && field.option.formatSelection && typeof field.option.formatSelection == "function"){
					        		return field.option.formatSelection(item);
					        	}else{
					        		return item.name;
					        	}
					        }
					    };
    				if(field.option && field.option.placeholder){
    					setting.placeholder = field.option.placeholder;
    				}
    				if(field.option && typeof field.option.allowClear === 'boolean'){
    					setting.allowClear = field.option.allowClear;
    				}
    				if(field.option&&field.option.multiple){
    					setting.multiple = true;
    				}
    				if(field.option&&field.option.tags){
    					setting.tags = field.option.tags;
    				}
    				if( field.option && field.option.data){ // select2的数据源为array
    					setting.data= field.option.data;
    				}else if(field.option && field.option.ajax){ // select2的数据源为异步加载
    					var pageLength = 10;
    					setting.ajax={
				        	url: field.option.ajax.url ? field.option.ajax.url : $.u.config.constant.smsqueryserver,
				            dataType: "json",
				            type: "post",
				            data: function(term, page){
			            		var data = "";
								s=term;
    							if ($.isFunction(field.option.ajax.data)){ // option.ajax.data配置的为function
    								data = field.option.ajax.data(term,page);
    							} else {	// option.ajax.data配置的为json
				            		data = $.extend({
				        				"tokenid": $.cookie("tokenid"),
				        				"method": "stdcomponent.getbysearch",
				        				"rule": JSON.stringify([[{"key":"name","op":"like","value":term}]]),
				        				"start": (page - 1) * pageLength,
				        				"length": pageLength
				        				
				        			},field.option.ajax.data);
    							}
			        			return data;
					        },
					        results: this.proxy(function(response, page, query){ 
					        	if(response.success){
					        		if (field.option.ajax.success && typeof field.option.ajax.success == "function"){
					        			return field.option.ajax.success(response,page,s);
					        		} else {
					        			var more = page * pageLength < response.data.iTotalRecords;
					        			return {"results":response.data.aaData, "more":more};
					        		}
					        	}else{
                                    $.u.alert.error(response.reason, 1000 * 3);
                                }
					        })
    					};
    				}
    				if(field.option && field.option.tags){
    					setting = field.option;
    				}
    				$target=$("<input type='text' class='select2 form-control'/>").appendTo($container).select2(setting);
    				break;
    			// no default
    		};
    		if(field.type !== "checkbox"){
    			$target.addClass("form-control input-sm").attr({"id":this._id+"-"+field.name,"name":field.name});
    		}else{
    			$target.attr({"id":this._id+"-"+field.name,"name":field.name});
    		}
    		if(field.description){
    			$("<div class='help-block'><small>"+field.description+"</small></div>").appendTo($container);
    		}
    		
    		if(field.rule){
    			if(field.rule == "required" || field.rule.required){
    				$label.html(field.label+"<span class='text-danger'>*</span>");
    			}
    			rules[field.name]=field.rule;
    		}
    		
    		if(field.message){
    			messages[field.name]=field.message;
    		}
    	}));
    	
    	this.form.validate({
            rules: rules,
            messages: messages,
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var formData = this.form.serializeArray(), data = {}, intFields = [], mult = [],array=[],str = [], type= [];
    	$.each(this._options.fields,this.proxy(function(idx,field){
    		field.dataType && field.dataType == "int" ? intFields.push(field.name) : null;
    		field.dataType && field.dataType == "string" ? str.push(field.name) : null;
    		field.dataType && field.dataType == "array" ? array.push(field.name) : null;
    		field.option && field.option.multiple && mult.push(field.name);
    		if(field.type === "checkbox"){
    			data[field.name] = $("[name='"+field.name+"']",this.form).prop("checked");
    			type.push(field.name);
    		}
    	}));
    	$.each(this.form.serializeArray(), this.proxy(function(idx, field){
    		if ($.inArray(field.name, mult) > -1) {
    			data[field.name] = field.value ? $.map(field.value.split(","), this.proxy(function(n){
    				if($.inArray(field.name, str) > -1){
    					return n;
    				}else{
    					return parseInt(n);
    				}
    			})) : null;
    		} else if ($.inArray(field.name, intFields) > -1) {
    			data[field.name] = parseInt(field.value);
    		} else if($.inArray(field.name, type) > -1){
    			
    		}else if ($.inArray(field.name, array) > -1){
    			data[field.name] = [parseInt(field.value)];
    		}else {
    			data[field.name] = field.value;
    		}
    	}));
    	return data;
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
    	if(this._options.mode=="COPY"){
    		$.each(data,this.proxy(function(name,value){
	    		$("[name='"+name+"']",this.form).val((value || "") + this.i18n.transcript);
	    	}));
    	}else{
    		$.each(data,this.proxy(function(name,value){
    			value = typeof value === 'undefined' || value === null ? '' : value;
        		if(this.fieldMap[name] && this.fieldMap[name]["type"] == "select" && $.trim(value)){ // select2
        			var tempData = null;
        			try{
        				if($.isArray(value) || $.isPlainObject(value)){
        					tempData = value;
        				}else{
        					tempData = JSON.parse(value) && value.indexOf("{") > -1 && value.indexOf("}") > -1;
        				}
        			}catch(e){}
        			if(this.fieldMap[name].option && this.fieldMap[name].option.tags){
        				$("[name='"+name+"']",this.form).select2("val",[value]);
        			}else if(this.fieldMap[name].option && this.fieldMap[name].option.data){ // select2的数据源为array
        				$("[name='"+name+"']",this.form).select2("val",value);
        			}else if(tempData){ // value已经是json格式的数据
        				$("[name='"+name+"']",this.form).select2("data",value); 
        			}else{ // 异步请求json数据赋值
        				this.disableForm();
	        			$.u.ajax({
	        				url: this.fieldMap[name].option && this.fieldMap[name].option.ajax && this.fieldMap[name].option.ajax.url
	        					? this.fieldMap[name].option.ajax.url 
	        					: $.u.config.constant.smsqueryserver,
	    		            dataType: "json",
	    		            type:"post",
	    		            data:$.extend({
	    	    				tokenid:$.cookie("tokenid"),
	    	    				method:"stdcomponent.getbyid",
	    	    				dataobjectid:parseInt($.trim(value))
	    			        },this.fieldMap[name].option && this.fieldMap[name].option.params ? this.fieldMap[name].option.params : {},true),
	        			},$("[name='"+name+"']",this.form).parent()).done(this.proxy(function(response){
	        				if(response.success && response.data){
	        					$("[name='"+name+"']",this.form).select2("data",response.data);
	        				}
	        			})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	        				
	        			})).complete(this.proxy(function(jqXHR,errorStatus){
	        				this.enableForm();
	        			}));
        			}
        		}else if(this.fieldMap[name] && this.fieldMap[name]["type"] == "colorpicker" && $.trim(value)){
        			$("[name='"+name+"']",this.form).val(value).next().css("backgroundColor",value);
        		}else if(this.fieldMap[name] && this.fieldMap[name]["type"] == "checkbox"){
        			$("[name='"+name+"']",this.form).prop("checked", value);
        		}else if(this.fieldMap[name] && this.fieldMap[name]["type"] == "textarea"){
        			$("[name='"+name+"']",this.form).val(value.replace(/<br>/g,'\n'));
        		}else{
        			$("[name='"+name+"']",this.form).val(value);
        		}
        	}));
    	}
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	this.$attachment && this.$attachment.uploadify('cancel', '*');
    	$(":text,textarea,select",this.form).val("");
    	$("input:text.select2").select2("val","");
    	this.form.validate().resetForm();
    },
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",true);
    	$("input:text.select2").select2("enable",false);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",false);
    	$("input:text.select2").select2("enable",true);
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


com.sms.common.stdComponentOperate.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js",
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js",
                                               "../../../uui/widget/colortools/js/colorpicker.js",
                                               "../../../uui/widget/colortools/js/eye.js",
                                               "../../../uui/widget/colortools/js/utils.js",
                                               '../../../uui/widget/jqtimepicker/jquery-ui-timepicker-addon.js',
                                               '../../../uui/widget/jqtimepicker/i18n/jquery-ui-timepicker-zh-CN.js',
                                               '../../../uui/widget/jqtimepicker/jquery-ui-sliderAccess.js',
                                               "../../../uui/widget/uploadify/jquery.uploadify.js"
                                               ];
com.sms.common.stdComponentOperate.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                                {path:"../../../uui/widget/colortools/css/colorpicker.css"},
                                                {id:"",path:"../../../uui/widget/jqtimepicker/jquery-ui-timepicker-addon.css"},
                                                {
                                                    id: "",
                                                    path: "../../../uui/widget/uploadify/uploadify.css"
                                                }
                                                ];