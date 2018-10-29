//@ sourceURL=com.audit.inspection.uploadDocumentsSigned
$.u.define('com.audit.inspection.uploadDocumentsSigned', null, {
    init: function (options) {
        this._options = options || {};
    },
    afterrender: function (bodystr) {
    	this.curr_data;
    	this.get_data();
    	this.comps = {};
    	this.qid("add_file").off("click").on("click",this.proxy(this._add_file));
    	this.qid("top_buttons").on("click",".export_pdf",this.proxy(this._pdfData));
    	this.qid("top_buttons").on("click",".workflow",this.proxy(this.next_xiafa));
    	this.qid("uploadFile").on("click",".glyphicon",this.proxy(this.delete_file));
    	$(".modify_table").off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
    	this.leftColumns = this.qid("left-column");
    	this.auditresult = this.qid("auditresult");
    	this.auditReportTransactor = this.qid("auditReportTransactor");
    },
    getimproveidbytaskid:function(e){
    	var as_name = $(e.currentTarget).attr("name");
    	var improveid = "";
    	var taskid = this.curr_data.report.task.id;
    	if(as_name == "zhenggai" || as_name == "genzong"){
    		if(taskid){
    			$.u.ajax({//有工作单id查询整改单id
	    			url : $.u.config.constant.smsqueryserver,
	    			type:"post",
	                dataType: "json",
	                cache: false,
	                data: {
	                	"method": "getImproveByTaskId",
	                	"taskId": taskid, //工作单ID
	                    "tokenid": $.cookie("tokenid"),
	                },
	        	}).done(this.proxy(function(response) {
	        		if(response.success){
	        			improveid = response.data.id;
	        			var improveflowstep = response.data.flowStep;
	        			this.flow_link(as_name,improveid,improveflowstep);
	        		}
	        	}))
    		}
    	}else{
    		this.flow_link(as_name,taskid,"");
    	}
    },
    get_data :function(is_init){
    	var obj = {};
    	var id = this._options.id;
    	if(id){
    		$.u.ajax({
    			url : $.u.config.constant.smsqueryserver,
    			type:"post",
                dataType: "json",
                cache: false,
                data: {
                    "method": "getAuditReport",
                    "tokenid": $.cookie("tokenid"),
                    "id" : id
                },
        	}).done(this.proxy(function(response) {
        		if(response.success){
        			this.curr_data = response.data;
        			
        			//检查报告基本信息
        			this.qid("reportName").val(response.data.report.task.reportName || '');//检查报告名称
        			this.qid("workNo").val(response.data.report.task.workNo || '');//检查编号
        			this.qid("address").val(response.data.report.task.address || '');//检查地点
        			this.qid("startDate").val(response.data.report.task.startDate || '');
        			this.qid("endDate").val(response.data.report.task.endDate || '');
        			var auditItems = "";
        			for(i in response.data.report.task.auditItems){
        				if(i == 0){
        					auditItems += response.data.report.task.auditItems[i].name;
        				}else{
        					auditItems += "、" + response.data.report.task.auditItems[i].name;
        				}
        			}
        			this.qid("auditItems").val(auditItems);//检查范围
        			this.qid("teamLeader").val(response.data.report.task.teamLeader || '');//检查组长
        			this.qid("members").val(response.data.report.task.members || '');//检查组员
        			
        			this.auditReportTransactor.val(response.data.report.task.auditReportTransactor || '');//经办人
        			this.qid("info_mobilphone").val(response.data.report.task.contact || '');//经办人联系方式
        			this.qid("info_remark").val(response.data.report.task.reportRemark || '');//备注
        			this.qid("info_auditstyle").val(response.data.report.task.method || '');//检查方式
        			//检查结论
        			var audit_result = "<table class='uui-table'><tbody>";
        			this.text = response.data.report.task.auditReportSummary;
        			if(response.data.report.auditResult != ""){
        				if(response.data.actions.length == 0){
        					audit_result += "<tr><td>结论: " + (this.text||"");
                			audit_result += "</td></tr>";
        				}else{
							audit_result += "<tr name='"+this._options.id+"'><td>结论: <label style='width:99%'>" + (this.text||"") + "</label>";
	        				audit_result += "<textarea rows='3' style='display:none;width:100%'>" + (this.text||"") + "</textarea>";
	            			audit_result += "</td><td><span style='cursor:pointer ;visibility:hidden' class='glyphicon glyphicon-pencil'></span></td>";
	            			audit_result += "<td><div class='text-right' style='display:none'><button type='button' class='btn btn-default btn-sm' name='save' data-type='4'>提交修改</button>"+
	        					"<button type='button' class='btn btn-default btn-sm' name='cancel' data-type='4'>取消</button></div>";
	            			audit_result += "</td></tr>";
        				}
            			for(i in response.data.report.auditResult){
            				if(response.data.actions.length == 0){
            					audit_result += "<tr><td>"+response.data.report.auditResult[i].checkType + " : " + (response.data.report.auditResult[i].result ? response.data.report.auditResult[i].result :"");
                    			audit_result += "</td></tr>";
            				}else{
            					if(response.data.workflowNodeAttributes.canModify && response.data.workflowNodeAttributes.canModify.indexOf("allResult") < 0){
            						audit_result += "<tr><td>"+response.data.report.auditResult[i].checkType + " : " + (response.data.report.auditResult[i].result ? response.data.report.auditResult[i].result :"");
                        			audit_result += "</td></tr>";
            					}else{
            						audit_result += "<tr name='"+response.data.report.auditResult[i].id+"'><td>"+response.data.report.auditResult[i].checkType + " : <label style='width:99%'>" + (response.data.report.auditResult[i].result ? response.data.report.auditResult[i].result :"") + "</label>";
                    				audit_result += "<textarea rows='3' style='display:none;width:100%'>" + (response.data.report.auditResult[i].result ? response.data.report.auditResult[i].result :"") + "</textarea>";
                        			audit_result += "</td><td><span style='cursor:pointer ;visibility:hidden' class='glyphicon glyphicon-pencil'></span></td>";
                        			audit_result += "<td><div class='text-right' style='display:none'><button type='button' class='btn btn-default btn-sm' name='save' data-type='1'>提交修改</button>"+
                    					"<button type='button' class='btn btn-default btn-sm' name='cancel' data-type='1'>取消</button></div>";
                        			audit_result += "</td></tr>";
            					}
            				}
                		}
            			audit_result += "</tbody><table>";
            			this.auditresult.html(audit_result);
            			this.auditresult.off("click","table tr span").on("click","table tr span",this.proxy(this.edit_textarea));
            			this.auditresult.off("click","button").on("click","button",this.proxy(this.saveorcacel));
            		}else{
            			this.auditresult.hide();
            		}
            		//检查总结条数
            		var $html = "此次共检查检查";
            		$html += response.data.report.problems.statistics.total + "项，其中：";
            		
            		for(var i in response.data.report.problems.statistics){
            			if(i != "total"){
            				$html += i+"为"+response.data.report.problems.statistics[i].num+"项， ";
            			}
            		}
            		$html = $html.substring(0,$html.length-2);
            		$html += "。";
            		$(".info_num").html($html);
            		
            		//检查有问题的
            		var probody_html = "";
            		if(response.data.report.problems.hasProblems != ""){
            			$(".no_thead").show();
            			for(i in response.data.report.problems.hasProblems){
            				if(response.data.actions.length == 0){
            					probody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify' name='cannotmodify,";
            				}else{
            					if(response.data.workflowNodeAttributes.canDo.indexOf("fanHui") > -1){
            						probody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify' name='cannotmodify,";
            					}else if(response.data.workflowNodeAttributes.canModify && response.data.workflowNodeAttributes.canModify.indexOf("checkList") < 0){
                					probody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify' name='cannotmodify,";
                    			}else{
                    				probody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify' name='canmodify,";
                    			}
            				}
            				probody_html += response.data.report.task.target.targetId + ","+response.data.report.problems.hasProblems[i].id + "'>";
                			probody_html += (response.data.report.problems.hasProblems[i].itemPoint ? response.data.report.problems.hasProblems[i].itemPoint:"") + "</a><br>";
                			probody_html += "检查记录："+ (response.data.report.problems.hasProblems[i].auditRecord ? response.data.report.problems.hasProblems[i].auditRecord : "") +"</td>";
                			probody_html += "<td>" + (response.data.report.problems.hasProblems[i].improveUnit ? response.data.report.problems.hasProblems[i].improveUnit.name : "")+"</td>";
                			probody_html += "<td>"+(response.data.report.problems.hasProblems[i].auditResult ? response.data.report.problems.hasProblems[i].auditResult : "")+"</td>";
                			probody_html += "<td>"+(response.data.report.problems.hasProblems[i].improveLastDate ? response.data.report.problems.hasProblems[i].improveLastDate : "")+"</td>";
                			probody_html += "</tr>";
                		}
                		this.qid("pro_tbody").html(probody_html);
            		}else{
            			$(".no_thead").hide();
            		}
            		var files_html = "";
            		if(response.data.actions.length == 0){
            			this.qid("add_file").hide();
            		}else if(response.data.workflowNodeAttributes.canDo && response.data.workflowNodeAttributes.canDo.indexOf("fanHui") > -1){
            			this.qid("add_file").hide();
            		}else{
            			this.qid("add_file").show();
            		}
            		for(i in response.data.report.reportFiles){
            			files_html += "<tr><td>" + response.data.report.reportFiles[i].fileName + "</td>";
            			files_html += "<td>" + response.data.report.reportFiles[i].size + "</td>";
            			files_html += "<td>" + response.data.report.reportFiles[i].uploadTime + "</td>";
            			files_html += "<td>" + response.data.report.reportFiles[i].uploadUser + "</td>";
            			if(response.data.actions.length == 0 || response.data.workflowNodeAttributes.canDo.indexOf("fanHui") > -1){
            				files_html += "<td></td>";
            			}else{
            				files_html += "<td><span class='glyphicon glyphicon-trash fl-minus del-file' name='"+response.data.report.reportFiles[i].id + "' style='cursor: pointer;'></span></td>";
            			}
            			files_html += "</tr>";
            		}
            		this.qid("uploadFile").html(files_html);
            		
            		//控制按钮等操作
            		this.qid("top_buttons").html("");
            		if(response.data.actions != ""){
            			var btn_html = "";
            			if(response.data.workflowNodeAttributes.canDo.indexOf("daoChu") > -1){
            				btn_html += "<button type='button' class='btn btn-default btn-link pdf btn-sm export_pdf notfirst_show'>导出</button>";
            			}
            			for(i in response.data.actions){
        					btn_html += "<button type='button' class='btn btn-default btn-sm workflow' name='";
            				btn_html += response.data.actions[i].wipId + "'>";
            				btn_html += response.data.actions[i].name + "</button>";
            			}
            			this.qid("top_buttons").html(btn_html);
            		}
            		if(response.data.logArea && response.data.logArea.key){ 
            			var shenjibaogao_id = this.curr_data.report.task.id;
                		var flowid = this.curr_data.report.task.flowId;
                        var clz = $.u.load(response.data.logArea.key);
                        this.qid("left-column").html("");
                        var target = $("<div/>").attr("umid", "logs").appendTo(this.leftColumns);
                        new clz( target, $.extend(true, response.data.logArea, {
                            logRule: [[{"key":"source","value": parseInt(shenjibaogao_id)}],[{"key":"sourceType","value":"task"}]],
                            remarkRule: [[{"key":"source","value": parseInt(shenjibaogao_id)}],[{"key":"sourceType","value":"task"}]],
                            remarkObj: {
                                source: parseInt(shenjibaogao_id),
                                sourceType: "task"
                            },
                            addable: true,
                            flowid: flowid 
                        }) );
                    }
            		if(response.data.workflowNodeAttributes.hiddenModel){
            			if(is_init && is_init == "not_init"){
            			}else{
            				$.each(response.data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k,v){
                                if(v === "baseInfo"){
                                    $(".baseInfo_zhankai").trigger("click");
                                    
                                }else if(v === "result"){
                                	$(".jielun_zhankai").trigger("click");
                                	
                                }else if(v === "hasProblem"){
                                	$(".problem_zhankai").trigger("click");
                                	
                                }else if(v === "files"){
                                	$(".file_zhankai").trigger("click");
                                	
                                }else if(v === "logs"){
                                    this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                                }
                            }));
            			}
                    }
        		}
        	}));
    	}
    },
    edit_baogao_result :function(e){
    	$(e.currentTarget).nextAll('div').eq(0).show();
    	$(e.currentTarget).removeAttr("disabled");
    },
    
    cancel_result:function($tar){
    	var $tr= $tar.parents("tr");
    	$tr.find("textarea").hide();
    	$tr.find("label").show();
    	$tr.find("button").each(this.proxy(function(idx,item){
    		var $parent=$(item).parent();
    		if($parent.is(":visible")){
    			$parent.hide();
    		}
    	}))
    	$tr.find("span").removeClass("hidden");
    },
    saveorcacel :function(e){
    	var $e = $(e.currentTarget), name = $e.attr("name"),type = $e.attr("data-type"),
    		$tr = $e.parents("tr"), $textarea = $tr.find("textarea"),$label = $tr.find("label"),
    		$span = $tr.find("span"), content1 = $label.text(),
    		content = $textarea.val(), checkid = $tr.attr("name"),
    		obj = {};
    	
	    if(name === "cancel"){
	    	$textarea.val(content1);
	    	this.cancel_result($e);
	    }else{
	    	if(type === "4"){
				obj = {
		            "method": "stdcomponent.update",
		            "tokenid": $.cookie("tokenid"),
		            "dataobject":"task",
		            "obj":JSON.stringify({"auditReportSummary":content}),
		            "dataobjectid" : checkid
		        }
	    	}else if(type === "1"){
	    		obj = {
		            "method": "stdcomponent.update",
		            "tokenid": $.cookie("tokenid"),
		            "dataobject":"check",
		            "obj":JSON.stringify({"result":content}),
		            "dataobjectid" : checkid
		        }
	    	}
		    $.u.ajax({
				url : $.u.config.constant.smsmodifyserver,
				type:"post",
		        dataType: "json",
		        data: obj
			},this.auditresult.parent()).done(this.proxy(function(rep){
				if(rep.success){
	    			$.u.alert.success("保存成功");
	    			$label.text(content);
	    			this.cancel_result($e);
	    		}else{
	    			$.u.alert.error(data.reason+"!保存失败");
	    		}
			}))
	    }
    },
    _pdfData : function(e){
        window.open($.u.config.constant.smsqueryserver+"?method=exportAuditReportToPdf&tokenid="+$.cookie("tokenid")+"&id="+this._options.id);
    },
    next_xiafa :function(e){
    	//签批件是否上传
		if(this.curr_data.report.reportFiles.length == 0){
			$.u.alert.error("请先上传签批件");
			return;
		}
    	var cur_name = $(e.currentTarget).attr("name");
		var wipid = cur_name;
		var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
		var text = $(e.currentTarget).text();
		var confirm = new clz({
            "body": text === "生成整改通知单" ? "是否生成整改通知单":"确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	$.u.ajax({//工作流下一步
                			url : $.u.config.constant.smsmodifyserver,
                			type:"post",
                            dataType: "json",
                            cache: false,
                            data: {
                            	"method": "operate",
                                "tokenid": $.cookie("tokenid"),
                                "action" : wipid,
                                "dataobject" : "task",
                                "id" : this._options.id    //planid
                            },
                    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                    		if(response.success){
                    			confirm.confirmDialog.dialog("close");
                				$.u.alert.success("操作成功");
                				if(text === "生成整改通知单"){
                					window.open('../notice/RectificationNoticeList.html');
                				}else{
                					this.get_data("not_init");
                				}
                    		}else{
                    			$.u.alert.error(response.reason);
                    		}
                    	}))
                    })
                 }
            }
		})
    },
    _add_file:function(){
    	if(!this.fileDialog1){
    		var clz = $.u.load("com.audit.innerAudit.comm_file.audit_uploadDialog");
    		this.fileDialog1 = new clz($("div[umid='fileDialog1']",this.$),null);
    	}
		this.fileDialog1.override({
    		refresh: this.proxy(function(data){
    			this.get_data("not_init");
    		})
    	});
    	try{
    		this.fileDialog1.open({
    			"method":"uploadFiles",
    			"source": this._options.id,
    			"tokenid":$.cookie("tokenid"),
    			"sourceType":5
    		});
    	}catch(e){
    		$.u.alert.error("上传出错！");
    	}
    },
    delete_file:function(e){
    	var file_id = $(e.currentTarget).attr("name") ;
    	var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
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
            	    			$.u.alert.success("删除成功");
            	    			confirm.confirmDialog.dialog("close");
            	    			this.get_data("not_init");
            	    		}
            	    	}))
                    })
                }
            }
        });
    },
    edit_textarea :function(e){
    	$(e.currentTarget).parents("tbody").find("span.glyphicon-pencil").each(this.proxy(function(idx,item){
    		this.cancel_result($(item));
    	}))
    	if($(e.currentTarget).is("label")){
    		$(e.currentTarget).hide();
    		$(e.currentTarget).parent().next("td").find("span").addClass("hidden");
    		$(e.currentTarget).parent().find("textarea").show();
    		$(e.currentTarget).parent().css("width","85%");
    		$(e.currentTarget).parent().parent().find("div").show();
    	}else if($(e.currentTarget).is("span")){
    		$(e.currentTarget).parent("td").parent("tr").find("label").hide();
        	$(e.currentTarget).addClass("hidden");
        	$(e.currentTarget).parent().parent().find("textarea").show();
        	$(e.currentTarget).parent().parent().find("td:first").css("width","85%");
        	$(e.currentTarget).parent().parent().find("div").show();
    	}
    },
    modifyRow : function(e){
		e.preventDefault();
		var $e = $(e.currentTarget);
		var ismodify = $e.attr("name").split(",")[0];
		var targetid = $e.attr("name").split(",")[1];
		var dataid = $e.attr("name").split(",")[2];
        if(dataid && targetid){
            if(!this.recordDiForm){
                $.u.load('com.audit.inspection.dialog');
            }
            if(ismodify == "cannotmodify"){
            	this.recordDiForm = new com.audit.inspection.dialog($("div[umid='recordDiForm']",this.$), {editable:false});
            }else{
            	this.recordDiForm = new com.audit.inspection.dialog($("div[umid='recordDiForm']",this.$), {editable:true});
            }
            this.recordDiForm.open(dataid, targetid);
    		this.recordDiForm.override({
        		refresh: this.proxy(function(data){
        			this.get_data("not_init");
        		})
        	});
        }
        else{
            console.error("未获取到data");
        }
	},
    _destroyModule:function(){
    	this.comps && $.each(this.comps,this.proxy(function(key,comp){
    		comp.destroy();
    		delete this.comps[key];
    	}));
    	this.leftColumns.empty();
    }
}, { usehtm: true, usei18n: false });