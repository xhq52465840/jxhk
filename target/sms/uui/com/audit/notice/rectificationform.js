//@ sourceURL=com.audit.notice.rectificationform
$.u.load('com.audit.notice.baseInfo');
$.u.define('com.audit.notice.rectificationform', null, {
    init: function () {
    	
    },
    afterrender: function () {

    	this.pre_status=0;
    	this.save_status=0;
    	this.noticeid = $.urlParam().id;
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
				this.unitid = response.data.improveNotice.operator.id;
				this.isProcessor=response.data.improveNotice.isProcessor;
				this.status=response.data.improveNotice.status||"";
				this.noticeType = response.data.improveNotice.improveNoticeType;
				this.disabled=function(){
					$("input,textarea",this.$).attr("readonly",true);
					$(".select2-container",this.$).select2("enable",false);
					$("i",this.$).addClass("hidden");
					this.statusFlag="disabled";
				}
				this.top_btn.empty();
				if(this.status){
					switch(this.status.id){
					case'NEW'://新建
						if(this.isProcessor){
							this.top_btn.append($('<button class="btn btn-default btn-sm btn-addsave" >保存</button>'
									+'<button class="btn btn-default btn-sm  btn-exp" >导出</button>'));
							if(this.top_btn.children("button.btn_next").length == 0){
								this.top_btn.append($('<button class="btn btn-default btn-sm btn_send">下发</button>'));
								this.$.find('.btn_send').off("click").on("click",this.proxy(this.on_send));
							}
							this.statusFlag="enable";
						}else{
							this.disabled();
						}
						break;
					case"SENT"://下发
						this.disabled();
						break;
					case"COMPLETED"://("完成");
						this.disabled();
						break;
					}
				}
				this.btn_addsave = this.top_btn.children(".btn-addsave");
		    	this.btn_addsave.off("click").on("click",this.proxy(this.on_addsave));
		    	this.btn_exp =this.top_btn.children(".btn-exp");
		    	this.btn_exp.off("click").on("click",this.proxy(this.on_exp_click));
				
		    	this.showBaseInfo(response.data.improveNotice);
				this.showFileInfo(this.noticeid,response.data.improveNotice.improveNoticeSentFiles);
				this.showQuestionInfo(this.noticeid,response.data.improveNotice.improveNoticeIssues);
				this.description.val(response.data.improveNotice.description||'');
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
    		"data":data,
    		"disabled":this.statusFlag//"disabled";
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
    			"show":data,
    			"disabled":this.statusFlag//"disabled";
        	});
    	}
    },
    showQuestionInfo : function(id,data){
    	if(!this.questionInfo){
    		$.u.load('com.audit.notice.questionList');
    		this.questionInfo = new com.audit.notice.questionList($('div[umid=questionInfo]'),{
    			"data":data,
        		"unitid":this.unitid.toString(),
        		"improveNotice":parseInt(this.noticeid),
        		"dataType":this.noticeType,
        		"canModify":"issueContent,improveUnit,improveDeadLine",
    			"required":"issueContent,improveUnit,improveDeadLine",
    			"deleted":"improveReason,improveMeasure,completionStatus,completionDate,expectedCompletedDate",
    			"flowStatus":"show",
    			"disabled":this.statusFlag//"disabled";
        	});
    	}
		
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
    				"obj":JSON.stringify($.extend(this.baseInfo.getFormData(),{'description':$.trim(this.description.val())}))
    			},
    			this.$,
    			this.proxy(function(response){
    				this.getById();
    				$.u.alert.info("保存成功！",3000);
    				this.pre_status=1;
    			})
    		);
    	}
    },
    //下发
    on_send : function(){
    	if(this.questionInfo.questionTable.find("tbody>tr").length){
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
    	                    				"obj":JSON.stringify($.extend(this.baseInfo.getFormData(),{'description':$.trim(this.description.val())}))
    	                    			},
    	                    			confirm.confirmDialog.parent(),
    	                    			this.proxy(function(response){
    	                    				confirm.confirmDialog.dialog("close");
    	                    				this.sendImproveNotice();
    	                    			})
    	                    	);
    	                    })
    	                 }
    	            }
    			})
        	}
    	}else{
    		$.u.alert.error("请问题列表中至少填写一条数据");
    	}
    },
    sendImproveNotice: function(){
    	if(this.baseInfo.baseinfoform.valid()){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			"post",
    			{
    				"method":"sendImproveNotice",
    				"id":this.noticeid.toString()
    			},
    			this.$,
    			this.proxy(function(response){
					$.u.alert.info("下发成功",2000);
					window.location.reload();
    			})
    		);
    	}
    },
    destroy:function(){
    	this._super();
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

com.audit.notice.rectificationform.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                               "../../../uui/widget/spin/spin.js", 
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js",
                                               "../../../uui/widget/select2/js/select2.min.js",
                                               "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"
                                              ];
com.audit.notice.rectificationform.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                                {id:"",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}];