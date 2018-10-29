//@ sourceURL=com.audit.notice.questionDialog
$.u.define('com.audit.notice.questionDialog', null, {
	//新增问题列表，问题列表单条问题点击弹出的dialog
    init: function (option) {
    	this._option = option || null;
    	this.tempDiv = '<div class="row show-grid"><div class="col-sm-3">#{label}#{require}</div>'+
    				   '<div class="col-sm-9">#{show}</div></div>';
    	$.validator.addMethod( "compareDate", function( value, element, params ){
            var $compare = $(params), compareValue = $.trim($compare.val());
            if(value){
                value = new Date(value);
                if(compareValue){
                    compareValue = new Date(compareValue);
                    if(value - compareValue <= 0){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return true;
                }
            }
            else{
                return false;
            }
        }, "预计完成时间大于整改期限");

        $.validator.addMethod( "compareNowDate", function( value, element, params ){
            if(value){
                value = new Date(value);
            	value= value.getTime()+1000*60*60*24;
            	value = new Date(value);
                now   = new Date();
                return value-now >= 0;
            }
            else{
                return false;
            }
        }, "日期必须晚于今天");
    	
    },
    afterrender: function () {
    	this.form = this.qid("form");
    	this.createform();
    	if(this._option.fields.data){
    		this.fillData();
    		if(this._option.fields.disabled == "disabled"){
    			this.question.find("input,textarea").attr("disabled",true);
    			this.question.find(".select2-container").select2("enable",false);
    			this.question.find("i.glyphicon").addClass("hidden");
    		}
    	}
    	this.on_unitdialog_create();
    	if(this._option.status=="wanCheng" && this._option.canDo=="submit" ){
    		this.qid("uploadify").show();
    	}else{
    		this.qid("uploadify").hide();
    	}
    	this.$.on("click","span.downloadfile",this.proxy(this._download_file));
    //	if ($.browser.msie && '9.0' === $.browser.version) {    //去掉IE9
    		   //Redefining datepicker's getInst function if ie9
    		   $.datepicker._getInst = function(target) {
    		      try { 
    			   if ('object' === target.nodeName.toLowerCase()) {
    			      return false; 
    		           } 
    		      return $.data(target, 'datepicker'); 
    		      } 
    		      catch (err) { 
    		           throw 'Missing instance data for this datepicker'; 
    		      } 
    		   }; 
    	//	}
    },
    createform : function(){
    	this.question = this.qid("question").dialog({
			width: 680,
			modal: true,
			resizable: false,
			autoOpen: false,
			create: this.proxy(this.on_question_create),
			close: this.proxy(this.on_question_close)
    	});
    },
    on_question_create : function(){
    	this.form.find('input.date').datepicker({ dateFormat: "yy-mm-dd" });
    	this.improveUnit = this.qid("improveUnit").select2({
	    	placeholder: "请选择责任单位",
    		multiple : true,
    		minimumResultsForSearch : -1,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: this.proxy(function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"getAddedImproveUnits",
 		    			"improveNoticeType": this._option.fields.dataType,
 		    			"unitId": this._option.fields.unitid,
 		    			"term":term
 	        		};
 	    		}),
 		        results:function(data,page){
 		        	if(data.success){
 		        		return { results: data.data.aaData };
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
    	});
    	
    	this.reasonType=this.qid("reasonType").select2({
	   		 placeholder: "选择原因类型",
	   		 multiple:true,
	         ajax:{
		        	url: $.u.config.constant.smsqueryserver,
		        	type: "post",
		            dataType: "json",
		        	data: function(term, page){
		        		return {
		        			 tokenid: $.cookie("tokenid"),
	 	                     method: "stdcomponent.getbysearch",
	 	                     dataobject:"auditReason"
		        		};
		    		},
			        results:function(data,page){
			        	if(data.success){
			        		return {results:$.map(data.data.aaData,function(item,idx){
			        			return item;
			        		})};
			        	}
			        }
		        },
		        formatResult: function(item){
		        	return  "<b>"+item.name+"</b> : <samp>"+(item.description||"")+"</samp>";      		
		        },
		        formatSelection: this.proxy(function(item){
		        	return item.name;	        	
		        })
	       });
    	
    	
    	
    	var rules = {};
    	if(this._option.fields.required){
    		var required = this._option.fields.required.split(",");
    		required && $.each(required, this.proxy(function(idx,obj){
    			var $obj = $('[qid='+obj+']',this.form);
    			$("<span class='text-danger'>*</span>").appendTo($obj.parent().prev());
    			if(obj=="improveDeadLine"|| obj=="completionDate"){
    				rules[obj] = {
						"required": true,
						"compareNowDate":"",
					    "dateISO": true	
    				}
    			}else if(obj=="expectedCompletedDate"){
    				rules[obj] = {
						"required": true,
						//"compareDate":"#" + this._id + "-improveDeadLine",
						"compareNowDate":"",
					    "dateISO": true	
    				}
    			}else{
    				rules[obj] = "required";
    			}
    		}));
    	}
    	if(this._option.fields.canModify){
    		!$.isArray(this._option.fields.canModify) && (this._option.fields.canModify = this._option.fields.canModify.split(","));
    		this._option.fields.canModify && $.each(this._option.fields.canModify, this.proxy(function(idx,obj){
    			if(obj === "improveUnit"||obj === "reasonType"){
    				this[obj].select2("enable", true);
    			}else{
    				var $obj = $('[qid='+obj+']',this.form);
        			$obj.removeAttr("disabled");
    			}
    		}));
    	}
    	if(this._option.fields.deleted){
    		!$.isArray(this._option.fields.deleted) && (this._option.fields.deleted = this._option.fields.deleted.split(","));
    		this._option.fields.deleted && $.each(this._option.fields.deleted, this.proxy(function(idx,obj){
    			var $obj = $('[qid='+obj+']',this.form),$parent = $obj.parent();
    			if($parent.siblings().length == 1){
    				$parent.parent().remove();
    			}else{
    				$parent.prev().remove();
    				$parent.remove();
    			}
    		}));
    	}
    	this.form.validate({
            rules: rules,
            messages: {
            	issueContent:"问题描述不能为空",improveReason:"分析原因不能为空",improveMeasure:"整改措施不能为空",reasonType:"原因类型不能为空",
            	completionStatus:"完成情况不能为空",improveUnit:"责任单位不能为空",auditOpinion:"审计意见不能为空",
            	completionDate:{
            		"required":"完成时间不能为空",
            		"dateISO":"请输入合法的日期"
            	},
            	expectedCompletedDate:{
            		"required":"预计完成时间不能为空",
            		"dateISO":"请输入合法的日期"
            	},
            	improveDeadLine:{
            		"required":"整改期限不能为空",
            		"dateISO":"请输入合法的日期"
            	}
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
    	this.showfile(this._option.fields);
    	
    },
    
    showfile:function(fieldsdata){
    	if(fieldsdata.flowStatus=="show" ||fieldsdata.data.actions.length == 0 ||this._option.canDo !="baoCun"){
    	}
    	if(fieldsdata.data!="" && fieldsdata.data.actions && fieldsdata.data.actions[0] && fieldsdata.data.actions[0].name && fieldsdata.data.actions[0].name != "提交"){
    		this.filefun(fieldsdata.data.files)
    		if(fieldsdata.data.actions[0].name == "结案"){
    			
    		}
    	}
    	
    },
    
    filefun:function(filedata){/*
    	$.ul=$("<ul/>");
    	this.qid("uploadify").replaceWith($.ul);
    	 $.each(filedata,this.proxy(function(idx,file){
    		$("<li><span class='downloadfile' fileid='"+file.id+"'>"+file.fileName+"</span></li>").appendTo($.ul);
    	}));
    */},
    
    
    on_question_close : function(){
    	this.form.find("textarea,input").val("");
    	this.improveUnit.select2("data","");
    	this.form.validate().resetForm();
//    	window.location.reload();
    },
    fillData : function(){
    	this._option.fields.data && $.each(this._option.fields.data,this.proxy(function(name,value){
    		if(name==="improveUnit" ){
    			var sValue = [];
    			value && $.each(value, this.proxy(function(k,v){
    				sValue.push({
    					id:v.type+v.id,
    					name:v.name
    				});
    			}));
    			this[name].select2("data", sValue);
    		}else if(name==="files" &&  value && value.length > 0){
    			$uploadify=this.question.find("[name=uploadify]");
    			$ul=$("<ol data-id="+value[0].source+">");
  	    		$.each(value,this.proxy(function(idx,item){
  	 	    		$('<li><span class="downloadfile" style="color:#428bca;text-decoration:underline;cursor:pointer;" fileid="'+item.id+'">'+item.fileName+'</span><i class="glyphicon glyphicon-remove" data-id="'+item.id+'" data-name="'+item.fileName+'"></i></li>').appendTo($ul);
  	    		}))
  	    		$ul.insertBefore($uploadify);
  	    		$ul.off("click").on("click","span.downloadfile",this.proxy(this._download_file));
  	    		$ul.find('i.glyphicon-remove').off("click").on("click", this.proxy(this.del_file))
				                              .css({"margin-right":"10px","float":"right ","cursor":"pointer"});
    		}else if(name==="reasonType"){
    			var sValue = [];
    			 $.each(value||[], this.proxy(function(k,v){
    				sValue.push({"id":v.id,"name":v.name});
    			}));
    			this[name].select2("data", sValue);
    		}else{
    			this.form.find("[name='"+name+"']").val((value || ""));
    		}
    	}));
    },
    _download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
    	var directoryId = this.tree.getSelectedNodes()[0].id;
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.encodeURIComponent(window.location.host+window.location.pathname+"?id="+directoryId));
    },
    on_unitdialog_create : function(){
    	 this.qid("uploadify").uploadify({
    		'auto':false,
			'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
	       // 'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=uploadFiles&sourceType=10&source="+this._option.fields.improveNotice,
			'fileTypeDesc':'doc',
			'fileTypeExts':'*.*',
			'removeCompleted': true,
			'buttonText':'选择附件',
			'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 30,
			'width': 160,
			'progressData':'speed',
			'successTimeout': 99999,
			'removeTimeout': 2,	
			'method':'get',
			'multi': true,
			'fileSizeLimit':'10MB',
			'queueSizeLimit':999,
			'requeueErrors' : true,
			 "onSWFReady": this.proxy(function(){
					 if(this._option.fields.disabled === "disabled"){
							this.qid("uploadify").uploadify('disable', true)
			    	 }	
	            }),
			'onQueueComplete':this.proxy(function(queueData){
				if(queueData.uploadsErrored < 1){
					
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
					var data = {
			    			"tokenid":$.cookie("tokenid"),
			    			"method":"uploadFiles",
			    			"source":this.dataId,
			    			"sourceType":10
			    		};
					this.qid("uploadify").uploadify('settings','formData',data);
			}),
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			if(data){
    				data = JSON.parse(data);
        			if(data.success){
        				$.u.alert.success("上传成功");
        				this.filelist(data.data.aaData);
        			}else{
                        $.u.alert.error(data.reason, 1000 * 3);
        			}
    			}
    		}),
    		 'onUploadComplete': this.proxy(function (file) {
	            
	            })
        });
    },
    stratUpload:function(dataId){
    	this.dataId=dataId||this._option.fields.data.id;
		this.qid("uploadify").uploadify('upload','*');
    },
    upload:function(id){
    	if(!this.fileUdp){
    		$.u.load('com.audit.notice.fileUploadTr');
    	}
    	this.fileUdp = new com.audit.notice.fileUploadTr($('div[umid=upload]'),{
    		"source":{
    			"tokenid":$.cookie("tokenid"),
    			"method":"uploadFiles",
    			"source":id.toString(),
    			"sourceType":10
    		},
    		"list":this.proxy(this.filelist)
    	});
    	//this.fileUdp.open();
    },
    filelist:function(data){
    	if(data.length>0){//
    		$uploadify=this.question.find(".uploadify");
    		 var $ul = this.question.find("ul[data-id="+data[0].source+"]");
  	    	if($ul.length==0){
  	    		$ul=$("<ul data-id="+data[0].source+">");
  	    		$.each(data,this.proxy(function(idx,item){
  	 	    		$('<li>'+item.fileName+'<i class="glyphicon glyphicon-remove" data-id="'+item.id+'" data-name="'+item.fileName+'"></i></li>').appendTo($ul);
  	    		}))
  	    		$ul.insertBefore($uploadify);
  	    	}else{
  	    		$.each(data,this.proxy(function(idx,item){
  	 	    		$('<li>'+item.fileName+'<i class="glyphicon glyphicon-remove" data-id="'+item.id+'" data-name="'+item.fileName+'"></i></li>').appendTo($ul);
	    		}))
  	    	}
    		$ul.find('i.glyphicon-remove').off("click").on("click", this.proxy(this.del_file))
    									  .css({"margin-right":"10px","float":"right ","cursor":"pointer"});
    	}
       
    },
    del_file:function(e){
    	try{
    		var id = $(e.currentTarget).attr("data-id");
    		var name = $(e.currentTarget).attr("data-name");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除文件:" + name,
    			dataobject:"file",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
	    			$(e.currentTarget).closest('li').fadeOut(function(){
		    		 	$(this).remove();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    getFormData : function(){
    	var data = {};
    	$.each(this.form.serializeArray(), this.proxy(function(key,value){
    		var disable = this.form.find('[name='+value.name+']').attr("disabled");
    		if(value.name==="reasonType"){
    			value.name="auditReasonId";
    		}
    		if(!disable){
    			data[value.name] = value.value;
    		}
    		
    	}));
    	return data;
    },
    _download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data]));
    },
    open : function(){
    	var buttons = [], canDo = [];
    	if(this._option.canDo){
    		canDo = this._option.canDo.split(",");
    	}
    	canDo.push("close");
		this._option.buttons && $.each(this._option.buttons, function(idx, obj){
    		if($.inArray(obj.name,canDo)>-1){
    			buttons.push(obj);
    		}
    	});
    	this.question.dialog("option",{
    		title:this._option.title,
    		buttons:(buttons.length ? buttons : this._option.buttons)
    	}).dialog("open");
    }
}, { usehtm: true, usei18n: false });

com.audit.notice.questionDialog.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js",
                                             "../../../uui/widget/uploadify/jquery.uploadify.js",
                                             "../../../uui/widget/select2/js/select2.min.js"];
com.audit.notice.questionDialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                             {id:"",path:"../../../uui/widget/uploadify/uploadify.css"},
                                             {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];