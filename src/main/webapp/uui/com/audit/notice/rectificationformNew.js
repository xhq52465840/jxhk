//@ sourceURL=com.audit.notice.rectificationformNew
$.u.load('com.audit.notice.baseInfo');
$.u.define('com.audit.notice.rectificationformNew', null, {
    init: function () {
    	
    this.auditopinion='<div class="panel panel-sms">'
							+'<div class="panel-heading">'
								+'<h2 class="panel-title">审核意见</h2>'
							+'</div>'
							+'<div class="panel-body">'
							+	'<div><textarea  class="form-control" rows="5" qid="auditopinion" style="resize:none;"></textarea></div>'
							+'</div>'
						+'</div>';
    },
    afterrender: function () {
    	this.noticeid = $.urlParam().id||"";
    	this.NoticeType = $.urlParam().NoticeType||"";
    	this.improveNoticetype = $.urlParam().improveNoticetype||"";
    	this.form = this.qid("form");
    	this.description = this.qid("description");
    	this.top_btn=this.qid("top_btn");
    	if(this.noticeid){
    		this.baseCommit();
    	}else{
    		window.location.href = "RectificationNoticeList.html";
    	}
    },
    baseCommit : function(){
    	this.getById();
    },
    getById : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
			{
				"method":"getImproveNoticeById",
				"id":this.noticeid
			},
			this.form,
			this.proxy(function(response){
				if(response.data.improveNotice){
					var wans = response.data.improveNotice.source;
					this.unitid = response.data.improveNotice.operator.id;
					this.improveNoticeType=response.data.improveNotice.improveNoticeType;
					this.status=response.data.improveNotice.status||"";
			    	this.showBaseInfo(response.data.improveNotice);
					this.showFileInfo(this.noticeid,response.data.improveNotice.improveNoticeSentFiles);
					this.description.val(response.data.improveNotice.description||'');
					this.isProcessor=response.data.improveNotice.isProcessor;
					this.disabled=function(){
						$("input,textarea",this.$).attr("readonly",true);
						$(".select2-container",this.$).select2("enable",false);
						$("i",this.$).addClass("hidden");
						this.statusFlag="disabled";
					}
					this.top_btn.empty();
					this.auditOpinionDiv=$("[name=auditOpinionDiv]");
					this.auditOpinionDiv.empty();
					if(this.status){
						switch(this.status.id){
						case'NEW'://新建
							if(this.isProcessor){
								this.top_btn.append($('<button class="btn btn-default btn-sm btn-addsave" >保存</button>'
										+'<button class="btn btn-default btn-sm  btn-exp" >导出</button>'));
								if(wans.id === "SPOT" || wans.id === "SPEC"){
									this.top_btn.append($('<button class="btn btn-default btn-sm btn_xiafa">同意并下发</button>'));
									this.$.find('.btn_xiafa').off("click").on("click",this.proxy(this.btn_xiafa));
								}else{
									this.top_btn.append($('<button class="btn btn-default btn-sm btn_next">提交</button>'));
									this.$.find('.btn_next').off("click").on("click",this.proxy(this.btn_next));	
								}
								this.statusFlag="enable";
							}else{
								this.disabled();
							}
							
							break;
						case'AUDIT_WAITING'://待审核
							this.auditOpinionDiv.append(this.auditopinion);
							this.qidauditopinion=this.auditOpinionDiv.find("[qid=auditopinion]");
							this.qidauditopinion.val(response.data.improveNotice.auditOpinion||'');
							if(this.isProcessor){
								this.top_btn.append($('<button class="btn btn-default btn-sm btn-addsave">保存</button>'
										+'<button class="btn btn-default btn-sm  btn-exp">导出</button>'));
								if(this.top_btn.children("button.btn_reject").length == 0){
									this.top_btn.append($('<button class="btn btn-default btn-sm btn_reject">拒绝</button>'));
									this.$.find('.btn_reject').off("click").on("click",this.proxy(this.btn_reject));
								}
								if(this.top_btn.children("button.btn_xiafa").length == 0){
									this.top_btn.append($('<button class="btn btn-default btn-sm btn_xiafa">同意并下发</button>'));
									this.$.find('.btn_xiafa').off("click").on("click",this.proxy(this.btn_xiafa));
								}
								this.qidauditopinion.attr("disabled",false);
								this.statusFlag="enable";
							}else{
								this.qidauditopinion.attr("disabled",true);
								this.disabled();
							}
							
							break;
						case"AUDIT_REJECTED"://被拒绝
							this.auditOpinionDiv.append(this.auditopinion);
							this.qidauditopinion=this.auditOpinionDiv.find("[qid=auditopinion]");
							this.qidauditopinion.val(response.data.improveNotice.auditOpinion||'').attr("disabled",true);
							if(this.isProcessor){
								this.top_btn.append($('<button class="btn btn-default btn-sm btn-addsave">保存</button>'
										+'<button class="btn btn-default btn-sm btn-exp">导出</button>'));
								if(this.top_btn.children("button.btn_next").length == 0){
									this.top_btn.append($('<button class="btn btn-default btn-sm btn_next">提交</button>'));
									this.$.find('.btn_next').off("click").on("click",this.proxy(this.btn_next));
								}
								this.statusFlag="enable";
							}else{
								this.disabled();
							}
							break;
						case"SENT":
							this.auditOpinionDiv.append(this.auditopinion);
							this.qidauditopinion=this.auditOpinionDiv.find("[qid=auditopinion]");
							this.qidauditopinion.val(response.data.improveNotice.auditOpinion||'').attr("disabled",true);
							this.disabled();
							break;
						}
					}
					this.btn_addsave = this.top_btn.children(".btn-addsave");
			    	this.btn_addsave.off("click").on("click",this.proxy(this.on_addsave));
			    	this.btn_exp =this.top_btn.children(".btn-exp");
			    	this.btn_exp.off("click").on("click",this.proxy(this.on_exp_click));
					this.showQuestionInfo(response.data.improveNotice.improveNoticeIssues);
				}
			})
		);
    },
    showBaseInfo : function(data){
	    var canModify = "", required = "";
	    if(data.source && (data.source.id == "SPOT" || data.source.id == "SPEC")){
	    	canModify = "replyDeadLine";
	    	required = "replyDeadLine";
	    }else{
	    	canModify = "source,improveNoticeSourceNo,address,checkStartDate,checkEndDate,replyDeadLine,improveNoticeTransactorTel,description";
	    	required = "source,replyDeadLine,checkStartDate,checkEndDate,improveNoticeTransactorTel";
	    }
    	this.baseInfo = new com.audit.notice.baseInfo($('div[umid=baseInfo]'),{
    		"unitid":this.unitid,
    		"canModify": canModify,
    		"required": required,
    		"deleted":"executive,executiveTel",
    		"data":data
    	});
    },
    showFileInfo : function(id,data){
    	if(!this.fileInfo){
    		$.u.load('com.audit.notice.fileDialog');
    		this.fileInfo = new com.audit.notice.fileDialog($('div[umid=fileInfo]'),{
        		"source":{
    				"tokenid":$.cookie("tokenid"),
    				"method":"uploadFiles",
    				"sourceType":"8",
    				"source":id.toString()
    			},
    			"show":data
        	});
    	}
    },
    showQuestionInfo : function(data){
    	if(!this.questionInfo){
    		$.u.load('com.audit.notice.questionList');
    	}
		this.questionInfo = new com.audit.notice.questionList($('div[umid=questionInfo]'),{
			"dataType": this.improveNoticeType,
			"data":data,
    		"unitid":this.unitid.toString(),
    		"improveNotice":parseInt(this.noticeid),
    		"canModify":"issueContent,improveUnit,improveDeadLine",
			"required":"issueContent,improveUnit,improveDeadLine",
			"deleted":"improveReason,improveMeasure,completionStatus,completionDate,expectedCompletedDate",
			"flowStatus":"show",
			"disabled":this.statusFlag//"disabled";
    	});
    },
	on_exp_click : function(){
		var form = $("<form>"); //定义一个form表单
		form.attr('style', 'display:none'); // 在form表单中添加查询参数
		form.attr('target', '_blank');
		form.attr('method', 'post');
		form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportImproveNoticeToPdf&tokenid="+$.cookie("tokenid")+"&id="+this.noticeid/*+"&url="+window.location.href*/);
		form.appendTo('body').submit().remove();
	},
	//保存
    on_addsave : function(){
    	this.baseEdit();
    },
    baseEdit : function(){
    	if(this.baseInfo.baseinfoform.valid()){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			"post",
    			{
    				"method":"stdcomponent.update",
    				"dataobject":"improveNotice",
    				"dataobjectid":this.noticeid,
    				"obj":JSON.stringify($.extend(this.baseInfo.getFormData(),{
    					'description':$.trim(this.description.val()),
    					'auditOpinion':this.proxy(function(){
    						if(this.qidauditopinion){
    							return $.trim(this.qidauditopinion.val());
    						}
    						return "";
    					})()
    					}))
    			},
    			this.$,
    			this.proxy(function(response){
    				this.getById();
    				$.u.alert.info("保存成功！",3000);
    			})
    		);
    	}
    },
   
   
    //  下发
    btn_xiafa: function(){
		if(this.baseInfo.baseinfoform.valid()){
			var clz = $.u.load("com.audit.comm_file.confirm");
			var confirm = new clz({
	            "body": "确认操作？",
	            "buttons": {
	                "ok": {
	                    "click": this.proxy(function(){
	                    	this._ajax(
	                    			$.u.config.constant.smsmodifyserver,
	                    			"post",
	                    			{
	                    				"method":"stdcomponent.update",
	                    				"dataobject":"improveNotice",
	                    				"dataobjectid":this.noticeid,
	                    				"obj":JSON.stringify($.extend(this.baseInfo.getFormData(),{
	                    					'description':$.trim(this.description.val()),
	                    					"auditOpinion":this.proxy(function(){
	                    						if(this.qidauditopinion){
	                    							return $.trim(this.qidauditopinion.val());
	                    						}
	                    						return "";
	                    					})()
	                    					}))
	                    			},
	                    			confirm.confirmDialog.parent(),
	                    			this.proxy(function(response){
	                    				confirm.confirmDialog.dialog("close");
	    					    		this._ajax(
	    					    			$.u.config.constant.smsmodifyserver,
	    					    			"post",
	    					    			{
	    					    				"method":"sendImproveNotice",
	    					    				"id":this.noticeid.toString()
	    					    			},
	    					    			this.$,
	    					    			this.proxy(function(response){
	    										$.u.alert.info("下发成功",3000);
	    										this.getById();
	    					    			})
	    					    		);
	    	                    	
	                    			})
	                    	);
	                    })
	                 }
	            }
			})
    	}
    },

    //   提交
    btn_next:function(e){
    	e.preventDefault();
    	if(this.questionInfo.questionTable.find("tbody>tr").length){
    		if(this.baseInfo.baseinfoform.valid()){
	    	this.auditorDialog = this.qid("auditorDialog").removeClass("hidden").dialog({
	    		title:"提交",
				width: 620,
				modal: true,
				resizable: false,
				autoOpen: false,
				create: this.proxy(this.getUserIdName),
				buttons: [{
					"text" : "确定",
					"click" : this.proxy(this.btn_dialog_ok)
				},
				{
					"text" : "取消",
					"class" : "aui-button-link",
					"click" : this.proxy(function() {
						this.auditorDialog.dialog("close");
					})
				} ]
	    	
	    	}).dialog("open");
    	}}else{
    		return 	$.u.alert.info("请添加问题列表",2000);
    	}
    },
  
    
    getUserIdName:function(){
    	var filed={
	    		"SYS":{
	    			"method":"getUserIdNameByGroupKey",
	    			"groupKey":"A"
	    		},
		    	"SUB2":{
		    		"method":"getUserIdNameByRoleKey",
		    		"roleKey":"A2.0",
		    		"unitId":this.unitid
		    	}
	    	}
    	var NoticeType=this.improveNoticeType;
    	//选择审核人
   	 	this.auditor=$("input[name=auditor]").select2({
     		placeholder: "选择审核人...",
         	ajax:{
   	        	url: $.u.config.constant.smsqueryserver,
   	        	type: "post",
   	            dataType: "json",
   	        	data: this.proxy(function(term, page){
   	        		return $.extend({
   	        			"tokenid":$.cookie("tokenid"),
   	            		"userName": term
   	        		},filed[this.improveNoticeType||NoticeType]);
   	    		}),
   		        results:function(data,page){
   		        	if(data.success){
   		        		return {results:$.map(data.data.aaData,function(item,idx){
   		        			return item;
   		        		})};
   		        	}else{
   		        		$.u.alert.error(data.reason,5000);
   		        	}
   		        }
   	        },
   	        formatResult: function(item){
   	        	return item.fullname;      		
   	        },
   	        formatSelection: function(item){
   	        	return item.fullname;	        	
   	        }
         });
       
    },

    //   提交后 选择审核人 点击确定后
    btn_dialog_ok:function(e){
    	e.preventDefault();
    	if(this.auditor.val()){
        	this._ajax(
        			$.u.config.constant.smsmodifyserver,
        			"post",
        			{
        				"method":"stdcomponent.update",
        				"dataobject":"improveNotice",
        				"dataobjectid":this.noticeid,
        				"obj":JSON.stringify($.extend(this.baseInfo.getFormData(),
        						{'description':$.trim(this.description.val()),
        					     'flowUsers':[this.auditor.val()-0]}))
        			},
        			this.auditorDialog,
        			this.proxy(function(response){
        	    		this._ajax(
        	        			$.u.config.constant.smsmodifyserver,
        	        			"post",
        	        			{
        	        				"method":"stdcomponent.update",
        	        				"dataobject":"improveNotice",
        	        				"dataobjectid":this.noticeid,
        	        				"obj":JSON.stringify({
        	        		    			"status":"AUDIT_WAITING",
        	        						"improveNoticeAuditUsers":[this.auditor.val()-0]
        	        		    			})
        	        			},
        	        			this.auditorDialog,
        	        			this.proxy(function(response){
        	        				this.auditorDialog.dialog("close");
        	        				$.u.alert.info("提交成功",2000);
        	        				this.getById();
        	        			})
        	        	);
        			})
        	);
        
    	
    	}else{
    		return 	$.u.alert.info("请选择审核人 ",2000);
    	}
    },
    
    
    //审核拒绝
    btn_reject:function(e){
    	e.preventDefault();
    	var clz = $.u.load("com.audit.comm_file.confirm");
    	if(this.qidauditopinion){
    		if(!this.qidauditopinion.val().trim()){
        		this.qidauditopinion.focus();
        		return $.u.alert.info("请填写审核意见 ",2000);
        	}
    	}
		var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
				    	this._ajax(
				    			$.u.config.constant.smsmodifyserver,
				    			"post",
				    			{
				    				"method":"stdcomponent.update",
				    				"dataobject":"improveNotice",
				    				"dataobjectid":this.noticeid,
				    				"obj":JSON.stringify({
				    		    			"status":"AUDIT_REJECTED",
				    		    			"auditOpinion":this.qidauditopinion.val()
				    		    			})
				    			},
				    			confirm.confirmDialog.parent(),
				    			this.proxy(function(response){
				    				confirm.confirmDialog.dialog("close");
				    				$.u.alert.info("提交成功",2000);
				    				this.getById();
				    			})
				    	);
                    })
                    }
	            }
			})
		
    	
    },
    
    
    destroy:function(){
    	alert(1);
    	this._super();
    	$("input,textarea",this.$).removeAttr("readonly");
		$(".select2-container",this.$).select2("enable",true);
		$("i",this.$).addClass("hidden");
    },
    _ajax:function(url,type,param,$container,callback){
    	$.u.ajax({
    		"url":url,
    		"type": type,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    }
}, { usehtm: true, usei18n: false });

com.audit.notice.rectificationformNew.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js",
                                               "../../../uui/widget/select2/js/select2.min.js",
                                               "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"
                                              ];
com.audit.notice.rectificationformNew.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                                {id:"",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}];