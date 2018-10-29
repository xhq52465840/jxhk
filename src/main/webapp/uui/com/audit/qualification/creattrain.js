//@ sourceURL=com.audit.qualification.creattrain
$.u.define('com.audit.qualification.creattrain', null, {
	
	//copy from com.sms.unit.unitDialogEdit
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
    	this._options.dataobject = "unit";
    	this._avatarIsVisible = false;
    	this._personSelect2Length = 10;
    	
    },
    afterrender: function (bodystr) {
    	this.form = this.qid("unit-form");
    	this.formDialog = this.qid("train-dialog-edit").dialog({
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
            }),
            close: this.proxy(function(){
            	if(this._avatarIsVisible === false){
            		this.clearFormData();
            	}
            })
        }); 
    	
    	
   	 // 验证人下拉框初始化
    	 $("[name=user]").select2({
       		 placeholder: "选择人员",
       		 multiple : true,
       		 allowClear: true,
       		 ajax:{
    	        	url: $.u.config.constant.smsqueryserver,
    	            dataType: "json",
    	            type:"post",
    	        	data: this.proxy(function(term, page){
    	        		return {
             				tokenid:$.cookie("tokenid"),
             				method:"stdcomponent.getbysearch",
             				dataobject:"auditor",
             				search:JSON.stringify({"value":term}),
             				start: (page - 1) * this._personSelect2Length,
     	    				length: this._personSelect2Length,
             				rule:JSON.stringify([[{"key":"user.fullname","op":"like","value":term}]])
             			};
    	    		}),
    		
    		      results:this.proxy(function(data,page){
    		        	if(data.success){
    		        		return {
    		        			results:$.map(data.data.aaData,function(item,idx){
    		        				return item.user;
    		        			}),
    		        			more: data.data.iTotalRecords > (page * this._personSelect2Length)
    		        		};
    		        	}
    		        })
    	        },
    	        formatResult: function(user){
    	        	return user.fullname;	        	
    	        },
    	        formatSelection: function(user){
    	        	return user.fullname;	        	
    	        }
    	        
           });
   
    	 function formatState (state) {
    		  if (!state.id) { return state.text; }
    		  var $state = $(
    		    '<span><img src="vendor/images/flags/' + state.element.value.toLowerCase() + '.png" class="img-flag" /> ' + state.text + '</span>'
    		  );
    		  return $state;
    		};
    		
		function matchStart (term, text) {
			  if (text.toUpperCase().indexOf(term.toUpperCase()) == 0) {
			    return true;
			  }
			  return false;
			}
    },
    onBodyDown:function(e){
    	if (!(e.target.id == (this._id+"-tree") || e.target.id == (this._id+"-treeContent") || $(e.target).parents("#"+this._id+"-treeContent").length>0)) {
			this.treeContent.fadeOut("fast");
			$("body").unbind("mousedown", this.proxy(this.onBodyDown));
		}
    },
   
    
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(param){
    	var dialogOptions=null;
        if (param.title) {
            dialogOptions = {
                title: param.title,
                buttons: [
                    {
                        text: "保存",
                        click: this.proxy(function (e) {
	                        	var obj=this.formdata(this.form.serializeArray());
		                        	if( !this.form.valid()){
		                        		return
		                        	}
		                            	this._sendModifyAjax({
		                            		"tokenid": $.cookie("tokenid"),
		                            		"method": "SaveAuditorTrain",
		                            		"obj":JSON.stringify(obj)
			                            },e);
	                        		})
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
			throw new Error("creattrain.js  this.formDialog :"+e.message);
		}
       $("input[name=startDate]").add($("input[name=endDate]")).datepicker({ dateFormat: "yy-mm-dd" }); 
    },
    
   
    
    /*
     * 提交(编辑 添加)数据
    */
    formdata:function(form){
    	
    	var newform = this.transform_data_type(form);
    	var newformArray = newform.user.split(",");
    	delete newform.user;
    	var userIds=[],fileIds=[];
    	$.each(newformArray,this.proxy(function(idx,item){
    		if(item!=""){
    			userIds.push(parseInt(item));
    		}
    	}))
    	 this.auditFiles.find("tbody tr").each(this.proxy(function(idx,item){
    		 var data= $(item).data("data")
    		 if(data && data.id){
    			 fileIds.push(data.id); 
    		 }
    	 }))
    	$.extend(newform,{"userIds":userIds,"fileIds":fileIds});
    	return newform;
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
    	return JSON.parse(str);
    	//{s: "1", f: "2", v: "3"}
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
        },this.qid("unit-dialog-edit").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
                this.formDialog.dialog("close");
              $.u.alert.success("创建成功！")
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        
        }));
    },
    
    /*
     * 根据设置创建表单
     */
    buildForm:function(){
    	var  ISOdate=["user"];
    	var exrules={},exmessages={};
    	 $.each(ISOdate,this.proxy(function(idx,v){
              if(v === "startDate" || v === "endDate"){
            	     exrules[v] = {
                         date: true,
                         dateISO: true
                     };
                     exmessages[v] = {
                         date: "无效日期",
                         dateISO: "无效日期"
                     };
                        if(v === "endDate"){
                          exrules[v]["compareDate"] = "#" + this._id + "-startDate";
                          exmessages[v]["compareDate"] = "结束日期必须大于开始日期";
                        }
             }else {    
                 var $label = $("[data-field=" + v + "]"); 
                 exrules[v] = { required: true };
                 exmessages[v] = { required: "该项不能为空" };
                 if($label.children("span.text-danger").length < 1){
                     $("<span class='text-danger'>*</span>").appendTo($label);
                 }
             }
         }));
    	 this.form.validate({
             rules: exrules,
             messages: exmessages,
             errorClass: "text-danger text-validate-element",
             errorElement:"div"
         });
    	
    	//上传
    		this.auditFiles= this.qid("auditFiles");
    		$("input[name=file_upload]").uploadify({
                'auto':true,
                'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
    	       // 'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=uploadFiles&sourceType="+sourceType+"&source="+this._wkid,
                'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
                'fileTypeDesc':'doc',
                'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
                'removeCompleted': true,
                'buttonText': "上传课件",
                'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
                'height': 30,   //按钮的高度和宽度
                'width': 80,
                'progressData':'speed',
                'method': 'get',
                'removeTimeout': 3,
                'successTimeout': 99999,
                'multi': true,
                'fileSizeLimit':'10MB',
                'queueSizeLimit':999,
                'simUploadLimit':999,
                'onQueueComplete':this.proxy(function(queueData){
                     if(queueData.uploadsErrored < 1){
                        
                     }else{
                         $.u.alert.error(data.reason, 1000 * 3);
                     }
                }),
                "onSWFReady": this.proxy(function(){
                   // this.qid("file_upload").uploadify("disable", this._options.editable === false)
                }),
                'onUploadStart':this.proxy(function(file) {
                    var data = {
                        tokenid: $.cookie("tokenid"),
                        method: "uploadFiles",
                        sourceType: 19,
                        source: ""
                    };
                    this.qid("file_upload").uploadify('settings', 'formData', data);
                    this.$.find(".uploadify-queue").removeClass("hidden");
                }),
                'onUploadSuccess':this.proxy(function(file, data, response) {
                    if(data){
                        data = JSON.parse(data);
                        if(data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length){
                            var file = data.data.aaData[0];
                            this.$.find(".uploadify-queue").addClass("hidden");
                            this.auditFiles.removeClass("hidden");
                            $("<tr>"+
                                "<td class='break-word'><a href='#'>" + file.fileName + "</a></td>" +
                                "<td>" + file.size + "</td>" +
                                "<td><i class='fa fa-trash-o uui-cursor-pointer delete-file'/></td>" +
                              "</tr>").data("data", file).appendTo(this.qid("dialog_uploadFile"));
                        }
                        else{
                            $.u.alert.error(data.reason, 1000 * 3);
                        }
                    }
                })
            });
            this.auditFiles.off("click",".delete-file").on("click",".delete-file",this.proxy(this.on_deleteFile_click));
    },
    
    
    on_deleteFile_click: function(e){
        var $this = $(e.currentTarget),
            $tr = $this.closest("tr"),
            data = $tr.data("data");
        if(data && data.id){
            var clz = $.u.load("com.audit.comm_file.confirm");          
            var confirm = new clz({
                "body": "确认删除？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                            $.u.ajax({
                                url: $.u.config.constant.smsmodifyserver,
                                type: "post",
                                dataType: "json",
                                data: {
                                    tokenid: $.cookie("tokenid"),
                                    method: "stdcomponent.delete",
                                    dataobject: "file",
                                    dataobjectids: JSON.stringify([data.id])
                                }                                
                            }, confirm.confirmDialog.parent()).done(this.proxy(function(response){
                                if(response.success){
                                    confirm.confirmDialog.dialog("close");
                                    $tr.fadeOut(this.proxy(function(){
                                        $tr.remove();
                                        if(this.auditFiles.children("tbody").children("tr").length < 1){
                                            this.auditFiles.addClass("hidden");
                                        }
                                    })); 
                                }
                            }));
                        })
                    }
                }
            }); 
        }
    },
  
    
    
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$("input.select2",this.formDialog).select2("data","")
    	$("input.select2",this.formDialog).empty();
    	$("input[type=reset]").trigger("click");
    	this.auditFiles.empty();
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
}, { usehtm: true, usei18n: false });


com.audit.qualification.creattrain.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js",
                                               "../../../uui/widget/uploadify/jquery.uploadify.js",
                                               "../../../uui/widget/validation/jquery.validate.js", 
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.qualification.creattrain.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/uploadify/uploadify.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

