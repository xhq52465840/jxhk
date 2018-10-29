//@ sourceURL=com.audit.terminal.detailDialog
$.u.define('com.audit.terminal.detailDialog', null, {
	
	//copy from com.sms.unit.unitDialogEdit
    init: function (options) {
        this._options = options || {};
    	this._personSelect2Length = 10;
    	this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.unitform = this.qid("unit-form");
    	this.formDialog = this.qid("detail-dialog-edit").dialog({
            title: this._options.title,
            width: 700,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function(){
            	this.buildForm();
            }),
            open: this.proxy(function(){
            		this.fillFormData(this._options.data)
            		this.disableAll();
            		if(this._options.editable){
                    	 this.canmodify(this._options.canmodify);
            		}
            		
            }),
            close: this.proxy(function(){
            		this.clearFormData();
            })
        }); 

    	Date.prototype.addDays = function (days){
    		var dat = new Date(this.valueOf());
    		dat.setDate(dat.getDate() + days);
    		return dat;
    	}
    	
    	
    	
        this.formatDate = function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? '0' + m : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            return y + '-' + m + '-' + d;
        };
        
        
        this.uiop={
        		canModify:function(data){
        			$.each(data.split(","),this.proxy(function(idx,item){
        				
        			}))
        		},
        		required:function(data){
        			 $.each(data.split(","),this.proxy(function(idx,item){
        				
        			}))
        		},
        		
        }
        
        this.canmodify=function(ret){
        	$.each(ret,this.proxy(function(idx,item){
        		if($("[name="+item+"]").hasClass("select2-offscreen")){
        			$("[name="+item+"]").select2("enable", true);
        		}else if($("[name="+item+"]").hasClass("uploadify")){
        			 this.upload.uploadify("enable", true);
        			 this.unitform.find("i.delete-file").removeClass("hidden");
        		}else{
        			$("[name="+item+"]").removeAttr("disabled");
        		}
        	}))
        	 this.unitform.find("i.delete-file").removeClass("hidden");
        }
        
        
        this.cloneobject=function(obj){
        	var newobj={}; 
        	for(var p in obj) { 
	        	var name=p;//属性名称 
	        	newobj[name]=obj[p]; 
        	} 
        }
    },	
    
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(param,ret,obj){
    	var dialogOptions=null;
    	this._options.data=param;
    	this._options.canmodify=ret;
    	this._options.editable=this._options.editable||obj.editable;
    	var buttons = [];
        if(this._options.editable ){
	         buttons.push({
	             "text":"保存",
	             "click":this.proxy(this.on_recordDialog_save)
	         });
	     }
        
	     buttons.push({
	         "text":"关闭",
	         "class":"aui-button-link",
	         "click":this.proxy(this.on_recordDialog_cancel)
	     });
		
        dialogOptions = {
            title: "审计记录",
            buttons: buttons
    	}
 
       try{
    	   this.formDialog.dialog("option",dialogOptions).dialog("open");
		}catch(e){
			throw new Error("detailDialog.js  this.formDialog :"+e.message);
		}
    	
       
    },
    //agru
    disableAll:function(){
    		$("[name=auditRecord]").attr("disabled",true);
    		$("[name=improveLastDate]").attr("disabled",true);
    		$("[name=termResponsibilityUnit]").attr("disabled",true);
    		$("[name=auditResult]").select2("enable",false);
    		 this.unitform.find("i.delete-file").addClass("hidden");
    },
   
 
    
    
    on_recordDialog_save : function(){
    	var filesArray=[];
    	var $tbody = this.FilesList.children("tbody");
    	$tbody.find("tr").each(this.proxy(function(idx,item){
    		var $item=$(item);
    		filesArray.push({
				fileName: $item.find("td").eq(0).text(),
				id: $item.find("td").eq(0).find("a").attr("fileid"),
				size: $item.find("td").eq(1).text(),
				source: this._options.data.id,
				uploadUser: $item.find("td").eq(2).text(),
    		})
    	}))
    	var auResult = this.qid("auditResult").select2("data");
        if(this.unitform.valid() ){
            var formData =$.extend(true,{},this.getFormData()) ;
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    dataType: "json",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.update",
                        dataobject: "checkList",
                        dataobjectid: this._options.data.id,
                        obj: JSON.stringify(formData)
                    }
                }, this.formDialog.parent()).done(this.proxy(function(response){
                    if(response.success){
                        $.u.alert.success("保存成功");
                        this.formDialog.dialog("close");
                        this.refresh($.extend(true, {}, formData, {
                        	auditResultName: auResult && auResult.name ? auResult.name : "",
                        	files:filesArray	
                        }));
                    }
                }));
          
            
        }
	},
	on_recordDialog_cancel : function(){
		this.formDialog.dialog("close");
	},
	refresh: function(data){},
   
    
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
    


	//上传
	initUpLoad:function(){
		this.FilesList=$("table[qid=fileList]");
		this.FilesList.closest("div.form-group").addClass("hidden");
		this.upload=$("input[qid=upload]");
		this.upload.uploadify({
            'auto':true,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
	        //'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=uploadFiles&sourceType="+sourceType+"&source="+this._wkid,
            'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
            'fileTypeDesc':'doc',
            'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
            'removeCompleted': true,
            'buttonText': '上传附件',
            'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
            'height': 30,   //按钮的高度和宽度
            'width': 100,
            'progressData':'speed',
            'method': 'get',
            'removeTimeout': 3,
            'successTimeout': 99999,
            'multi': true,
            'fileSizeLimit':'10MB',
            'queueSizeLimit':999,
            'simUploadLimit':999,
            'onQueueComplete':this.proxy(function(queueData){
            }),
            "onSWFReady": this.proxy(function(){
            	this.upload.uploadify("disable", this._options.editable === false);
            }), 
            'onUploadStart':this.proxy(function(file) {
                var data = {
                    tokenid: $.cookie("tokenid"),
                    method: "uploadFiles",
                    sourceType: 4,
                    source: this._options.data.id//明细的ID
                };
                this.upload.uploadify('settings', 'formData', data);
                this.$.find(".uploadify-queue").removeClass("hidden");
            }),
            'onUploadSuccess':this.proxy(function(file, data, response) {
                if(data){
                    data = JSON.parse(data);
                    if(data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length > 0){
                    	this.appendToTbody(data.data.aaData);
                    }
                    else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
                }
            })
        });
    
	},
    
	//上传
	appendToTbody:function(files){
    	this.FilesList.closest("div.form-group").removeClass("hidden");
        var $tbody = this.FilesList.children("tbody");
        this.$.find(".uploadify-queue").addClass("hidden");
        if(!this.FilesList.is(":visible")){
        	this.FilesList.removeClass("hidden");
        }
        $.isArray(files) && files.length==0 && this.FilesList.closest("div.form-group").addClass("hidden"); 
        $.each(files||[],this.proxy(function(idx,file){
	        $("<tr>"+
                "<td><a href='#' style='margin-left: 20px;' class='download' fileid='"+file.id+"'>" + file.fileName + "</a></td>" +
	            "<td>" + file.size + "</td>" +
	            "<td>" + file.uploadUser.match(/[\u4e00-\u9fa5]+/g) + "</td>" +
				"<td><i class='fa fa-trash-o uui-cursor-pointer delete-file' style='padding-right: 10px;' fileid='"+file.id+"'/></td>" +
	          "</tr>").data("data", file).appendTo($tbody);
        }))
        $tbody.off("click", ".download").on("click", ".download", this.proxy(this.on_downloadFile_click));
        $tbody.off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
	},
	
	
	/*
	 *  下载附件
	 *
	 */
	 on_downloadFile_click: function(e){
	        var data = parseInt($(e.currentTarget).attr("fileid"));
	        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.location.href);
	    },
	/*
     *	删除附件
	 */    
	on_deleteFile_click: function(e){
        var $this = $(e.currentTarget),
            $tr = $this.closest("tr"),
            data = $(e.currentTarget).closest("tr").data("data");
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
                                        if(this.FilesList.children("tbody").children("tr").length< 1){
                                        	this.FilesList.closest("div.form-group").addClass("hidden");
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
     * 根据设置创建表单
     */
    buildForm:function(){
    	 this.qid("improveLastDate").datepicker( { dateFormat:"yy-mm-dd" } );
    	 this.qid("auditResult").select2({
    		placeholder: "选择...",
    	    allowClear: false,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "dictionary",
                        rule: JSON.stringify([[{"key": "name", "op": "like", "value": term}], [{"key": "type", "value": "审计结论"}]]),
                        start: (page - 1) * this._select2PageLength,
                        length: this._select2PageLength
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.length > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	}).on("select2-selecting", this.proxy(function(e){
            if(e && e.object && (e.object.name === "符合项" || e.object.name === "不适用")){
            	this.qid("auditRecord-tip").addClass("hidden");
            	this.qid("auditRecord").addClass("ignore");
            	this.qid("termResponsibilityUnit-tip").addClass("hidden");
            	this.qid("termResponsibilityUnit").addClass("ignore");
                this.qid("improveLastDate-tip").addClass("hidden");
                this.qid("improveLastDate").addClass("ignore");
            }
            else {
            	this.qid("auditRecord-tip").removeClass("hidden");
            	this.qid("auditRecord").removeClass("ignore");
            	this.qid("termResponsibilityUnit-tip").removeClass("hidden");
            	this.qid("termResponsibilityUnit").removeClass("ignore");
                this.qid("improveLastDate-tip").removeClass("hidden");
                this.qid("improveLastDate").removeClass("ignore");
            }
        }));

    	 this.unitform.validate({
 			rules:{
 				"improveLastDate": {
                     "required": true,
                     "date": true,
                     "dateISO": true
                 },
                 "auditRecord": "required",
 				"termResponsibilityUnit":"required"
 			},
             ignore: ".ignore",
     		messages:{
 				"improveLastDate": {
                     "required":"整改期限不能为空",
                     "date": "日期无效",
                     "dateISO": "日期无效"
                 },
                 "auditRecord": "审计记录不能为空",
 				"termResponsibilityUnit":"航站责任单位不能为空"
 			},
 		   highlight : function(element) {  
               $(element).closest('.form-group').addClass('has-error');  
           },  
 
           success : function(label) {  
               label.closest('.form-group').removeClass('has-error');  
               label.remove();  
           },  
 
           errorPlacement : function(error, element) {  
               element.parent('div').append(error);  
           },
     		errorClass: "text-danger text-validate-element",
            errorElement:"div"
 		});
    	 this.initUpLoad();
    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	//this.form.serializeArray()
    	return {
    		"auditRecord":$("[name=auditRecord]").val(),
    		"improveLastDate":$("[name=improveLastDate]").val(),
    		"termResponsibilityUnit":$("[name=termResponsibilityUnit]").val(),
    		"auditResult":parseInt($("[name=auditResult]").val())
    	}
    	
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
    	this.qid("itemPoint").val(data.itemPoint||'')
    	this.qid("itemAccording").val(data.itemAccording||'')
    	this.qid("itemPrompt").val(data.itemPrompt||'')
    	this.qid("auditRecord").val(data.auditRecord||'')
    	this.qid("termResponsibilityUnit").val(data.termResponsibilityUnit||'')
    	this.qid("auditResult").select2("data", {
            id: data.auditResult,
            name: data.auditResultName||"符合项"
        });
    	  if(data.auditResultName === "符合项" || data.auditResultName === "不适用"){
          	  this.qid("auditRecord-tip").addClass("hidden");
          	  this.qid("auditRecord").addClass("ignore");
          	  this.qid("termResponsibilityUnit-tip").addClass("hidden");
  	  		  this.qid("termResponsibilityUnit").addClass("ignore");
              this.qid("improveLastDate-tip").addClass("hidden");
              this.qid("improveLastDate").addClass("ignore");
          }
    	data.improveLastDate && this.qid("improveLastDate").val(this.formatDate(new Date(data.improveLastDate))||new Date());
    	if(data.files && $.isArray(data.files) && data.files.length >0 ){
    		this.appendToTbody(data.files);
    	}
    	
    },

    
   
    
    
    
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	this.FilesList.closest("div.form-group").addClass("hidden");
    	this.FilesList.find("tbody").empty();
    	this.unitform.validate().resetForm();
    	this.unitform.find("[name=auditResult]").select2("val", '');
    	this.unitform.find("[name=improveLastDate]").val('');
    	//this.form.find("input[type=reset]").trigger("click");
    	/* 	
    	 * 
    	 * $("#e8").select2("open");
    	  $("#e8").select2("close");
 		$("#e8").empty(); 清理已有的Select2的数据：
    	$("#e8").select2("val");
    	$("#e8").select2("val", "CA");
    	$("#e8").select2("val", "");
    	$("#e8").select2("data");
    	$("#e8").select2("data", {id: "CA", text: "California"}); 
    	 $("#e8_2").select2("val", ["CA","MA"]); 
    	 $("#e8_2").select2("data", [{id: "CA", text: "California"},{id:"MA", text: "Massachusetts"}]);
    	 */
    },
    
    _create:function(options){
    	 this._options = options || {};
    	var dlg={};
    	dlg.name="luttnon"
    	dlg.mutton=function(){
    		alert("dmdosn")
    	}
    	return dlg
    	
    },
  
    
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea",this.unitform).attr("disabled",true);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea",this.unitform).attr("disabled",false);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
    },
    /*
     * 用于override
     */
    refreshDataTable:function(){},
    destroy: function () {
	    this.formDialog.removeClass('has-error');  
        this.formDialog.dialog("destroy").remove();
        
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.audit.terminal.detailDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js", 
                                               "../../../uui/widget/validation/jquery.validate.js", 
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.audit.terminal.detailDialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];

