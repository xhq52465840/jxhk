//@ sourceURL=com.audit.notice.rectificationformsubmit
$.u.load('com.audit.notice.baseInfo');
$.u.define('com.audit.notice.rectificationformsubmit', null, {
    init: function () {
    },
    afterrender: function () {
    	this.noticeid = $.urlParam().id;
    	if(!this.noticeid){
    		window.location.href = "RectificationNoticeList.html";
    	}
    	this.description = this.qid("description");
    	this.form = this.qid("form");
    	this.button = this.qid("button");
    	this.btn_addsave = this.qid("baoCun");
    	this.btn_addsave.off("click").on("click",this.proxy(this.on_addsave));
    	this.btn_export = this.qid("daoChu");
    	this.btn_export.off("click").on("click",this.proxy(this.on_export));
    	this.showLog = this.qid("log_show");
    	this.showData();
    },
    showData : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"post",
			{
				"method":"getSubImproveNoticeById",
				"id":this.noticeid.toString(),
				"operate":($.urlParam().operate || "")
			},
			this.form,
			this.proxy(function(response){
				response.data.subImproveNotice.improveNotice.executive = response.data.subImproveNotice.executive;
				response.data.subImproveNotice.improveNotice.executiveTel = response.data.subImproveNotice.executiveTel;
				if(response.data.actions.length === 0){
					this.button.empty();
					response.data.workflowNodeAttributes.canModify = '';
					response.data.workflowNodeAttributes.required = '';
				}
				this.showBaseInfo(response.data.subImproveNotice.improveNotice,response.data.workflowNodeAttributes.canModify||'',
						response.data.workflowNodeAttributes.required||'',response.data.workflowNodeAttributes);
			   	this.showRejectedFile(response.data.subImproveNotice.improveNotice.improveNoticeRejectedFiles)
				this.showFileInfo(response.data.subImproveNotice.improveNotice,'');
				this.description.val(response.data.subImproveNotice.improveNotice.description||'');
				this.showQuestionInfo(response.data.subImproveNotice.improveNoticeIssues,
						response.data.workflowNodeAttributes.canDo1||'',response.data.workflowNodeAttributes.canModify1||'',
						response.data.workflowNodeAttributes.required1||'',response.data.workflowNodeAttributes.deleted1||''
						,response.data.workflowNodeAttributes.flowStatus||'',response.data.actions);
				var flowStatus = response.data.workflowNodeAttributes.flowStatus;
				var improveNoticeIssues = response.data.subImproveNotice.improveNoticeIssues;
				var gothrough = false;//存在审核通过的
				var notthrough = false;//存在审核拒绝的
				var notchuli = false;  //false代表存在明细都没有审核，此时灰掉通过和拒绝按钮
				$.each(improveNoticeIssues,function(k,data){
					if(data.status != null){
						if(data.status.id == "AUDIT_REJECTED" || data.status.id == "AUDIT_UN_COMPLETED_TEMPORARILY"){//代表存在审核拒绝的明细
							notthrough = true;
						}else if(data.status.id == "AUDIT_PASSED"){//代表存在审核通过的明细
							gothrough = true;
						}
					}else{
						notchuli = true;
					}
				})
				if(flowStatus == "shenHe"){
					this.button.html("");
				}
				response.data.actions && $.each(response.data.actions, this.proxy(function(idx,obj){
					if(flowStatus == "shenHe"){
						if(notchuli){
							$('<button class="btn btn-default btn-sm disabled" data-wipId="'
									+obj.wipId+'">'+obj.name+'</button>').appendTo(this.button);
						}else{
							if(notthrough){
								if(obj.attributes.type == "gothrough"){
									$('<button class="btn btn-default btn-sm disabled" data-wipId="'
											+obj.wipId+'">'+obj.name+'</button>').appendTo(this.button);
								}else{
									$('<button class="btn btn-default btn-sm workflow" data-wipId="'
											+obj.wipId+'">'+obj.name+'</button>').appendTo(this.button);
								}
							}else{
								if(obj.attributes.type == "gothrough"){
									$('<button class="btn btn-default btn-sm workflow" data-wipId="'
											+obj.wipId+'">'+obj.name+'</button>').appendTo(this.button);
								}else{
									$('<button class="btn btn-default btn-sm disabled" data-wipId="'
											+obj.wipId+'">'+obj.name+'</button>').appendTo(this.button);
								}
							}
						}
					}else{
						$('<button class="btn btn-default btn-sm workflow" data-wipId="'
								+obj.wipId+'">'+obj.name+'</button>').appendTo(this.button);
					}
    		    	this.$.find('.workflow').off("click").on("click",this.proxy(this.on_workflow));
				}));
				var cando = "";
				if(response.data.workflowNodeAttributes.canDo){
					cando = response.data.workflowNodeAttributes.canDo.split(",");
				}
				cando && $.each(cando, this.proxy(function(k,v){
					this.button.find('button[qid='+v+']').removeClass("hidden");
				}));
				this.button.find('button.hidden').remove();
				nameArray=[];
				$.each(improveNoticeIssues,function(idx,item){
					item.status && item.status.name && nameArray.push(item.status.name);
				})
				nameStr=nameArray.join("");
				 if(nameStr.length > 0 && nameStr.indexOf("拒绝") > -1){
					this.button.find("button").each(this.proxy(function(idx,item){
						text=$(item).text();
						if(text =="拒绝"){
							$(item).off("click").on("click",this.proxy(this.on_workflow));
							!$(item).hasClass("workflow") && $(item).addClass("workflow") ;
							$(item).hasClass("disabled") && $(item).removeClass("disabled");
						}else if(text =="通过"){
							!$(item).hasClass("disabled") && $(item).addClass("disabled");
						}
					}))
				}else {
					this.button.find("button").each(this.proxy(function(idx,item){
						text=$(item).text();
						if(text =="通过"){
							$(item).off("click").on("click",this.proxy(this.on_workflow));
							!$(item).hasClass("workflow") && $(item).addClass("workflow") ;
                            $(item).hasClass("disabled") && $(item).removeClass("disabled") ;
						}else if(text =="拒绝"){
                            if(response.data.workflowNodeAttributes && response.data.workflowNodeAttributes.flowStatus == 'shenHe'){
                                !$(item).hasClass("disabled") && $(item).addClass("disabled");
                            }
						}
					}))
				}
				//显示流程图
				 if(response.data.logArea && response.data.logArea.key){
         			var id = response.data.subImproveNotice.improveNotice.id;
             		var flowid = response.data.subImproveNotice.flowId;
                     var clz = $.u.load(response.data.logArea.key);
                     this.showLog.html("");
                     var target = $("<div/>").attr("umid", "logs").appendTo(this.showLog);
                     new clz( target, $.extend(true, response.data.logArea, {
                     	businessUrl: this.getabsurl("RectificationFormSubmit.html?id="+this.noticeid),                    
                         logRule: [[{"key":"source","value": parseInt(id)}],[{"key":"sourceType","value":"improveNotice"}]],
                         remarkRule: [[{"key":"source","value": parseInt(id)}],[{"key":"sourceType","value":"subImproveNotice"}]],
                         remarkObj: {
                             source: parseInt(id),
                             sourceType: "subImproveNotice"
                         },
                         addable: true,
                         flowid: flowid 
                     }) );
                 }
			})
		);
    },
    showBaseInfo : function(data,canModify,required,workflowNodeAttributes){
    	this.baseInfo = new com.audit.notice.baseInfo($('div[umid=baseInfo]'),{
    		"workflowNodeAttributes":workflowNodeAttributes,
    		"canModify":canModify,
			"required":required,
			"data":data
    	});
    },
    showRejectedFile : function(data){
    	if(!this.RejectedFile){
    		$.u.load('com.audit.notice.rejectedFile');
    		this.RejectedFile = new com.audit.notice.rejectedFile($('div[umid=rejectedFile]'),{
    			"data":data
        	});
    	}
    },
    showFileInfo : function(data,btn){
    	if(!this.fileInfo){
    		$.u.load('com.audit.notice.fileDialog');
    		this.fileInfo = new com.audit.notice.fileDialog($('div[umid=fileInfo]'),{
    			"file":data,
    			"btn":btn || '',
    			"source":{
    				"tokenid":$.cookie("tokenid"),
    				"method":"uploadFiles",
    				"sourceType":"9",
    				"source":this.noticeid.toString()
    			}
        	});
    	}
    },
    showQuestionInfo : function(data,canDo,canModify,required,deleted,flowStatus,actions){
    	if(!this.questionInfo){
    		$.u.load('com.audit.notice.questionList');
    	}
		this.questionInfo = new com.audit.notice.questionList($('div[umid=questionInfo]'),{
    		"data":data,
    		"canDo":canDo,
    		"canModify":canModify,
			"required":required,
			"deleted":deleted,
			"flowStatus":flowStatus,
			"actions":actions
    	});
		this.questionInfo.override({
    		refresh: this.proxy(function(data){
    			this.showData();
    		})
    	});
    },
    on_workflow : function(e){
    	var wipId = $(e.currentTarget).attr("data-wipid");
    	// var len = this.fileInfo.$.find('tbody tr.comp').length;
    	if(this.baseInfo.baseinfoform.valid()){
            if(this.questionInfo._option && this.questionInfo._option.flowStatus == 'buMenShenHe'){
                this.workflow_confirm(wipId);
            }else{
                if(this.questionInfo.trStatus()){
                    this.workflow_confirm(wipId);
                }else{
                    $.u.alert.error("请将问题列表下的内容填写完整",3000);
                }

            }
			
    	}
    },
    workflow_confirm : function(wipId){
        var wipId = wipId;
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
                                    "dataobject":"subImproveNotice",
                                    "dataobjectid":this.noticeid,
                                    "obj":JSON.stringify(this.baseInfo.getFormData())
                                },
                                confirm.confirmDialog.parent(),
                                this.proxy(function(response){
                                    confirm.confirmDialog.dialog("close");
                                    this.workflow_next(wipId);
                                })
                        );
                    })
                }
            }
        })
    },
    workflow_next : function(id){
    	this._ajax(
			$.u.config.constant.smsmodifyserver,
			"post",
			{
				"method":"operate",
				"dataobject":"subImproveNotice",
				"id":this.noticeid.toString(),
				"action":id.toString()
			},
			this.$,
			this.proxy(function(response){
				$.u.alert.info("成功！",3000);
				window.location.href = "RectificationNoticeList.html";
			})
		);
    },
    on_addsave : function(){
    	this.baseEdit();
    },
    on_export : function(){
    	var form = $("<form>"); //定义一个form表单
		form.attr('style', 'display:none'); // 在form表单中添加查询参数
		form.attr('target', '_blank');
		form.attr('method', 'post');
		form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportSubImproveNoticeToPdf&tokenid="+$.cookie("tokenid")+"&id="+this.noticeid/*+"&url="+window.location.href*/);
		form.appendTo('body').submit().remove();
    },
    baseEdit : function(){
    	if(this.baseInfo.baseinfoform.valid()){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			"post",
    			{
    				"method":"stdcomponent.update",
    				"dataobject":"subImproveNotice",
    				"dataobjectid":this.noticeid,
    				"obj":JSON.stringify(this.baseInfo.getFormData())
    			},
    			this.$,
    			this.proxy(function(response){
    				$.u.alert.info("保存成功！",3000);
    			})
    		);
    	}
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

com.audit.notice.rectificationformsubmit.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js",
                                               "../../../uui/widget/select2/js/select2.min.js"
                                              ];
com.audit.notice.rectificationformsubmit.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];