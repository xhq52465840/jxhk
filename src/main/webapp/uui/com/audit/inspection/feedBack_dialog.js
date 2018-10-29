//@ sourceURL=com.audit.inspection.feedBack_dialog
$.u.define('com.audit.inspection.feedBack_dialog', null, {
	init: function (options) {
    	this._options = options || {};
	},
	afterrender: function (bodystr) {
    	this.zhuanfa_id = "";
    	this.improve_id = "";
    	this.curr_data;
    	this.ismodify = this._options.id.split(",")[0];
    	this.id = this._options.id.split(",")[1];
    	this.step = this._options.id.split(",")[2];
    	this.improveResponsiblePerson = this.qid("improveResponsiblePerson");
    	if(this.step !== "2"){
			$('.auditOpinion').show();
			this.qid("auditOpinion").attr("readonly","readonly");
		}
    	switch(this.ismodify){
	    	case "0":
	    		this.nomodify_createDialog();
	    		if(this.step === "2"){
	    			$('.auditOpinion').show();
	    			this.qid("auditOpinion").attr("readonly","readonly");
	    		}
	    		this.qid("dialog_reason").attr("readonly","readonly");
	    		this.qid('dialog_measure').attr("readonly","readonly");
				break;
    		case "1":
    			this.improveResponsiblePerson.removeAttr("readonly");
    			this.erji_shenzhuguan_createDialog();
    			break;
    		case "2":
    			this.qid("dialog_reason").attr("readonly","readonly");
	    		this.qid('dialog_measure').attr("readonly","readonly");
	    		$('.auditOpinion').show();
    			this.yiji_shenjiyuan_createDialog();
    			break;
    		case "3":
    			this.erji_shenzhuguan_wancheng_createDialog();
        		$(".info_wacheng").show();
        		$(".completDate").show();
        		this.qid('dialog_measure').attr("readonly","readonly");
        		this.qid('dialog_reason').attr("readonly","readonly");
    			break;
    		case "4":
    			this.nomodify_createDialog();
    			$(".info_wacheng").show();
        		$(".completDate").show();
	    		this.qid("dialog_reason").attr("readonly","readonly");
	    		this.qid('dialog_measure').attr("readonly","readonly");
	    		this.qid('info_wacheng').attr("readonly","readonly");
        		this.qid('completDate').attr("readonly","readonly");
    			break;
    		case "5":
    			this.erji_shenzhuguan_zhenggaiwancheng_createDialog();
        		$(".info_wacheng").show();
        		$(".completDate").show();
        		this.qid('dialog_measure').attr("readonly","readonly");
        		this.qid('dialog_reason').attr("readonly","readonly");
        		this.qid('info_wacheng').attr("readonly","readonly");
        		this.qid('completDate').attr("readonly","readonly");
    			break;
    	}
    	this.qid("add_files").on("click",this.proxy(this._add_file));
    	this.qid("dialog_uploadFile").on("click",".dialog_del-file",this.proxy(this.dialog_delete_file));
    	this.qid("auditFiles").off("click", ".download-file").on("click", ".download-file", this.proxy(this.on_downloadFile_click));
        this.qid("auditFiles").off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
    	this.init_dialog_data();
	},
	on_downloadFile_click: function(e){
		e.preventDefault();
        var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.location.href);
    },
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
                                        if(this.qid("auditFiles").children("tbody").children("tr").length < 1){
                                            this.qid("auditFiles").addClass("hidden");
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
    dialog_delete_file:function(e){
    	var file_id = $(e.currentTarget).attr("name") ;
    	var clz = $.u.load("com.audit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认删除？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	$.u.ajax({   //删除文件
            				url : $.u.config.constant.smsmodifyserver,
            				type:"post",
            	            dataType: "json",
            	            cache: false,
            	            data: {
            	            	"method": "stdcomponent.delete",
            	            	"dataobjectids": JSON.stringify([parseInt(file_id)]),
            	                "tokenid": $.cookie("tokenid"),
            	                "dataobject" : "file"
            	            },
            	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
            	    		if(response.success){
            	    			confirm.confirmDialog.dialog("close");
            	    			this.init_dialog_data();
            	    		}
            	    	}))
                    })
                }
            }
        });
    },
    _add_file:function(){
    	try{
    		if(!this.fileDialog1){
    			var clz = $.u.load("com.audit.comm_file.audit_uploadDialog");
        		this.fileDialog1 = new clz($("div[umid='fileDialog1']",this.$));
        		this.fileDialog1.override({
            		refresh: this.proxy(function(data){
            			this.init_dialog_data();
            		})
            	});
    		}
    		this.fileDialog1.open({
    			"method":"uploadFiles",
    			"source": this.zhuanfa_id,
    			"tokenid":$.cookie("tokenid"),
    			"sourceType":7
    		});
    		
    	}catch(e){
    		$.u.alert.error("上传出错！");
    	}
    },
    init_dialog_data:function(){
		$.u.ajax({ 
			url : $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
            	"method": "getImproveRecordById",
            	"id": this.id,
                "tokenid": $.cookie("tokenid")
            }
    	},this.qid("recordDialog").parent()).done(this.proxy(function(response) {
    		if(response.success){
    			this.curr_data = response;
    			this.zhuanfa_id = response.data.id;
    			this.improve_id = response.data.improve.id;
    			this.qid("improveName").val(response.data.improve.improveName?response.data.improve.improveName:"");//整改反馈名称
    			this.qid("improveNo").val(response.data.improve.improveNo?response.data.improve.improveNo:"");//整改反馈单编号
    			this.qid("auditunit_Name").val(response.data.improve.operator?response.data.improve.operator.name:"");  //审计单位
    			this.qid("improveUnit").val(response.data.improveUnit?response.data.improveUnit.name:"");//主要责任单位
    			this.improveResponsiblePerson.val(response.data.improveResponsiblePerson || '');
    			this.qid("auditOpinion").val(response.data.auditOpinion || "");
    			var itemPoint = "";
    			if(response.data.itemPoint != null){
    				itemPoint = response.data.itemPoint;
    			}
    			var $issue = "检查要点：";
    			$issue += itemPoint + "\n";
    			
    			var auditRecord = "";
    			if(response.data.auditRecord != null){
    				auditRecord = response.data.auditRecord;
    			}
    			$issue += "审计记录：" + auditRecord;
    			this.qid("issues").val($issue);
    			
    			if(response.data.improveReason && response.data.improveReason!=""){
    				this.qid("dialog_reason").val(response.data.improveReason);
    			}
    			if(response.data.improveMeasure && response.data.improveMeasure!=""){
    				this.qid("dialog_measure").val(response.data.improveMeasure);
    			}
    			if(response.data.improveRemark && response.data.improveRemark!=""){
    				this.qid("info_wacheng").val(response.data.improveRemark);
    			}
    			if(response.data.improveDate && response.data.improveDate!=""){
    				this.qid("completDate").val(response.data.improveDate);
    			}
    			if(response.data.improve.startDate && response.data.improve.startDate!=""){
    				this.qid("startDate").val(response.data.improve.startDate);
    			}
    			if(response.data.improve.endDate && response.data.improve.endDate!=""){//整改期限
    				this.qid("endDate").val(response.data.improve.endDate);
    			}
    		}
    		
    		var $tbody = this.qid("auditFiles").children("tbody");
            $tbody.empty();
            if($.isArray(response.data.files) && response.data.files.length > 0){
                this.qid("auditFiles").removeClass("hidden");
                $.each(response.data.files, this.proxy(function(idx, file){
                    $("<tr>"+
                        "<td class='break-word'><a href='#' class='download-file' fileid='" + file.id + "'>" + file.fileName + "</a></td>" +
                        "<td>" + file.size + "</td>" +
                        "<td>" + ((this.ismodify == "cannotmodify" || response.data.improveItemStatus.code == "4") === true ? "" : "<i class='fa fa-trash-o uui-cursor-pointer delete-file'/>") + "</td>" +
                      "</tr>").data("data", file).appendTo($tbody);
                }));
            }
            this.qid("file_upload").uploadify({
	            'auto':true,
	            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
	            'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
	            'fileTypeDesc':'doc',
	            'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
	            'removeCompleted': true,
	            'buttonText': "上传附件",
	            'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
	            'height': 25,   //按钮的高度和宽度
	            'width': 70,
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
	                if(this.ismodify !== "1"){
	                	this.qid("file_upload").uploadify("disable", true);
	                }
	            }),
	            'onUploadStart':this.proxy(function(file) {
	                var data = {
	                    tokenid: $.cookie("tokenid"),
	                    method: "uploadFiles",
	                    sourceType: 7,
	                    source: this.zhuanfa_id
	                };
	                this.qid("file_upload").uploadify('settings', 'formData', data);
	                this.$.find(".uploadify-queue").removeClass("hidden");
	            }),
	            'onUploadSuccess':this.proxy(function(file, data, response) {
	                if(data){
	                    data = JSON.parse(data);
	                    if(data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length > 0){
	                        var $tbody = this.qid("auditFiles").children("tbody");
	                        var file = data.data.aaData[0];
	                        
	                        this.$.find(".uploadify-queue").addClass("hidden");
	                        if(!this.qid("auditFiles").is(":visible")){
	                            this.qid("auditFiles").removeClass("hidden");
	                        }
	                        $("<tr>"+
	                            "<td class='break-word'><a href='#'>" + file.fileName + "</a></td>" +
	                            "<td>" + file.size + "</td>" +
	                            "<td><i class='fa fa-trash-o uui-cursor-pointer delete-file'/></td>" +
	                          "</tr>").data("data", file).appendTo($tbody);
	                    }
	                    else{
	                        $.u.alert.error(data.reason, 1000 * 3);
	                    }
	                }
	            })
	        });
    	}))
    },
    open : function(){
        this.qid("recordDialog").dialog("open");
	},
	/**
	 * 使用
	 */
	nomodify_createDialog:function(){
		this.recordDialog = this.qid("recordDialog").dialog({
        	title:"整改反馈记录",
            width:840,
            height:570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable:true,
            buttons:[
           		  {
           			  "text":"关闭",
           			  "class":"aui-button-link",
           			  "click":this.proxy(this.on_recordDialog_cancel)
           		  }
           	],
        });
	},
	/**
	 * 使用
	 */
	erji_shenzhuguan_createDialog : function(){
		this.recordDialog = this.qid("recordDialog").dialog({
        	title:"整改反馈记录",
            width:840,
            height:570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable:true,
            buttons:[
                  {
    				  "text":"保存",
    				  "class":"btn btn-default btn-sm",
    				  "click":this.proxy(this.on_recordDialog_save)
    			  },
           		  {
           			  "text":"关闭",
           			  "class":"aui-button-link",
           			  "click":this.proxy(this.on_recordDialog_cancel)
           		  }
           	],
        });
	},
	/**
	 * 使用
	 */
	yiji_shenjiyuan_createDialog : function(){
		this.recordDialog = this.qid("recordDialog").dialog({
        	title:"整改反馈记录",
            width:840,
            height:570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable:true,
            buttons:[
				  {
					 "text":"审核通过",
					 "name":"tongguo",
					 "class":"btn btn-default btn-sm",
					 "click":this.proxy(this.shenhe_caozuo)
				  },
                  {
    				  "text":"审核拒绝",
    				  "name":"jujue",
    				  "class":"btn btn-default btn-sm",
    				  "click":this.proxy(this.shenhe_caozuo)
    			  },
    			  {
    				  "text":"暂时无法完成",
    				  "name":"wufa_wancheng",
    				  "class":"btn btn-default btn-sm",
    				  "click":this.proxy(this.shenhe_caozuo)
    			  },
           		  {
           			  "text":"关闭",
           			  "class":"aui-button-link",
           			  "click":this.proxy(this.on_recordDialog_cancel)
           		  }
           	],
        });
	},
	/**
	 * 使用
	 */
	erji_shenzhuguan_wancheng_createDialog:function(){
		this.recordDialog = this.qid("recordDialog").dialog({
        	title:"整改反馈记录",
            width:840,
            height:570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable:true,
            buttons:[
				  {
					 "text":"保存",
					 "name":"erji_save",
					 "class":"btn btn-default btn-sm",
					 "click":this.proxy(this.erjizhuguan_wancheng_save)
				  },
				  {
					  "text":"提交",
					  "name":"erji_commit",
					  "class":"btn btn-default btn-sm",
					  "click":this.proxy(this.erjizhuguan_wancheng_commit)
				  },
           		  {
           			  "text":"关闭",
           			  "class":"aui-button-link",
           			  "click":this.proxy(this.on_recordDialog_cancel)
           		  }
           	],
        });
	},
	/**
	 * 使用
	 */
	erji_shenzhuguan_zhenggaiwancheng_createDialog:function(){
		this.recordDialog = this.qid("recordDialog").dialog({
        	title:"整改反馈记录",
            width:840,
            height:570,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            closable:true,
            buttons:[
           		  {
           			  "text":"关闭",
           			  "class":"aui-button-link",
           			  "click":this.proxy(this.on_recordDialog_cancel)
           		  }
           	],
        });
	},
	zhuanfa_chuli_export:function(){//导出
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportImproveToPdf&tokenid="+$.cookie("tokenid")+"&checkListId="+this.zhuanfa_id+"&improveId="+this.improve_id);
        form.appendTo('body').submit().remove();
	},
	/**
	 * 使用
	 */
	shenhe_caozuo:function(e){
		var auditOpinion = this.qid("auditOpinion").val();
		if(auditOpinion == ""){
			$.u.alert.error("审核意见不能为空");
			this.qid("auditOpinion").focus();
			return;
		}
		var istype = "";//判断操作类型   通过    拒绝    暂时无法完成  
		var name = $(e.currentTarget).attr("name");
		if(name == "tongguo"){
			istype = "pass";
		}else if(name == "jujue"){
			istype = "reject";
		}else if(name == "wufa_wancheng"){
			istype = "uncompleted";
		}
		var clz = $.u.load("com.audit.comm_file.confirm");
		var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
            			$.u.ajax({ //审核通过服务
            				url : $.u.config.constant.smsmodifyserver,
            				type:"post",
            	            dataType: "json",
            	            cache: false,
            	            data: {
            	            	"method": "updateImproveRecordStatus",
            	            	"id": this.id,
            	                "tokenid": $.cookie("tokenid"),
            	                "auditOpinion":auditOpinion,
            	                "operate": istype
            	            }
            	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
            	    		if(response.success){
            	    			$.u.alert.success("操作成功");
            	    			confirm.confirmDialog.dialog("close");
            	    			this.recordDialog.dialog("close");
            	    			this.refresh();
            	    		}else{
            	    			$.u.alert.error(response.reason);
            	    		}
            	    	}));
                    })
                 }
            }
		})
	},
	/**
	 * 使用
	 */
	on_recordDialog_save : function(){
		var dialog_reason = this.qid("dialog_reason").val();
		var dialog_measure = this.qid("dialog_measure").val();
		var improveResponsiblePerson = this.improveResponsiblePerson.val();
		if(dialog_reason == ""){
			$.u.alert.error("产生原因不能为空");
			this.qid("dialog_reason").focus();
			return;
		}
		if(dialog_measure == ""){
			$.u.alert.error("整改措施不能为空");
			this.qid("dialog_measure").focus();
			return;
		}
		if(!$.trim(improveResponsiblePerson)){
			$.u.alert.error("整改责任人不能为空");
			this.improveResponsiblePerson.focus();
			return;
		}
		if(this.zhuanfa_id != ""){
			$.u.ajax({   
				url : $.u.config.constant.smsmodifyserver,
				type:"post",
	            dataType: "json",
	            cache: false,
	            data: {
	            	"method": "updateImproveRecordReasonAndMeasure",
	            	"id":this.zhuanfa_id,
	            	"improveReason":dialog_reason,
	            	"improveMeasure":dialog_measure,
	            	"improveResponsiblePerson":improveResponsiblePerson,
	                "tokenid": $.cookie("tokenid")
	            },
	    	},this.qid("recordDialog").parent()).done(this.proxy(function(response) {
	    		if(response.success){
	    			$.u.alert.success("保存成功");
	    			this.recordDialog.dialog("close");
	    			this.refresh();
	    		}else{
	    			$.u.alert.error(response.reason);
	    		}
	    	}))
		}	
	},
	/**
	 * 使用
	 */
	erjizhuguan_wancheng_save:function(){
		var info_wancheng = this.qid("info_wacheng").val();
		if($.trim(info_wancheng) == ""){
			$.u.alert.error("完成情况不能为空");
			this.qid("info_wacheng").focus();
			return;
		}
		var obj = {improveRemark:info_wancheng};
		if(this.zhuanfa_id != ""){
			$.u.ajax({   
				url : $.u.config.constant.smsmodifyserver,
				type:"post",
	            dataType: "json",
	            cache: false,
	            data: {
	            	"method": "updateImproveRecordCompletion",
	            	"id":this.zhuanfa_id,
	                "tokenid": $.cookie("tokenid"),
	                "obj":JSON.stringify(obj)
	            }
	    	},this.qid("recordDialog").parent()).done(this.proxy(function(response) {
	    		if(response.success){
	    			$.u.alert.success("保存成功");
	    			this.recordDialog.dialog("close");
	    			this.refresh();
	    		}else{
	    			$.u.alert.error(response.reason);
	    		}
	    	}))
		}	
	},
	/**
	 * 使用
	 */
	erjizhuguan_wancheng_commit:function(){
		var info_wancheng = this.qid("info_wacheng").val();
		if($.trim(info_wancheng) == ""){
			$.u.alert.error("完成情况不能为空");
			this.qid("info_wacheng").focus();
			return;
		}
		var obj = {improveRemark:info_wancheng};
		var clz = $.u.load("com.audit.comm_file.confirm");
		var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	if(this.zhuanfa_id != ""){
                			$.u.ajax({   
                				url : $.u.config.constant.smsmodifyserver,
                				type:"post",
                	            dataType: "json",
                	            cache: false,
                	            data: {
                	            	"method": "commitImproveRecordCompletion",
                	            	"id":this.zhuanfa_id,
                	                "tokenid": $.cookie("tokenid"),
                	                "obj":JSON.stringify(obj)
                	            }
                	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                	    		if(response.success){
                	    			var point_content = this.curr_data.data.itemPoint;
                	    			if(point_content.length > 20){
                	    				point_content.substring(0,20);
                	    			}
                	    			point_content = "[" +point_content+ "]已整改完成，请分配验证人员";
                	    			var organizationIds = [];
                	    			var unitIds = [];
                	    			$.u.ajax({//查id
                        				url : $.u.config.constant.smsqueryserver,
                        				type:"post",
                        	            dataType: "json",
                        	            cache: false,
                        	            data: {
                        	                "tokenid": $.cookie("tokenid"),
                        	                "method": "getGradeOneManagerAuditors"
                        	            }
                        	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                        	    		if(response.success){
                        	    			var users_id = [];
                        	    			for(i in response.data.aaData){
                        	    				users_id.push(response.data.aaData[i].id);
                        	    			}
                        	    			if(users_id.length > 0){
                        	    				$.u.ajax({//发通知
                                    				url : $.u.config.constant.smsmodifyserver,
                                    				type:"post",
                                    	            dataType: "json",
                                    	            cache: false,
                                    	            data: {
                										"paramType":"sendMessage",
                                    	            	"method": "modifyMessage",
                                    	            	"title":"待分配验证人员",
                                    	            	"content":point_content,
                                    	            	"link": (this.curr_data.data.improve.id+""),
                                    	            	"sourceType":"TRACE",
                                    	                "tokenid": $.cookie("tokenid"),
                                    	                "userIds":JSON.stringify(users_id),
                                    	                "organizationIds":JSON.stringify(organizationIds),
                                    	                "unitIds":JSON.stringify(unitIds)
                                    	            }
                                    	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                                    	    		if(response.success){
                                    	    			$.u.alert.success("提交成功");
                                    	    			confirm.confirmDialog.dialog("close");
                                    	    			this.recordDialog.dialog("close");
                                    	    			this.refresh();
                                    	    		}
                                    	    	}))
                        	    			}
                        	    		}else{
                        	    			$.u.alert.error(response.reason);
                        	    		}
                        	    	}))
                        	    }
                        	}))
                		}
                    })
                }
            }
		})
	},
	on_recordDialog_cancel : function(){
		this.recordDialog.dialog("close");
	},
	refresh: function(data){
		
	}
}, { usehtm: true, usei18n: false });

com.audit.inspection.feedBack_dialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                        "../../../uui/widget/uploadify/jquery.uploadify.js",
                                        "../../../uui/widget/spin/spin.js",
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js" ];
com.audit.inspection.feedBack_dialog.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                       { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
										 {path:"../../../uui/widget/uploadify/uploadify.css"}];