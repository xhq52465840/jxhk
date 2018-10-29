//@ sourceURL=com.audit.xitong_jihua.shangchuan_shenjibaogao
//$.u.load("com.audit.comm_file.audit_uploadDialog");
$.u.define('com.audit.xitong_jihua.shangchuan_shenjibaogao', null, {
    init: function (options) {
        this._options = options || {};
        this._DATATABE_LANGUAGE =  { //语言
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                	  "sFirst": "",
	                   "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
	                   "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
	                   "sLast": ""
                }
        	  }
    },
    afterrender: function (bodystr) {
    	this.curr_data;
    	this.comps = {};
    	this.qid("add_file").off("click").on("click",this.proxy(this._add_file));
    	this.qid("top_buttons").on("click",".export_pdf",this.proxy(this._pdfData));
    	this.qid("top_buttons").on("click",".workflow",this.proxy(this.next_xiafa));
    	$(".modify_table").off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
    	this.leftColumns = this.qid("left-column");
    	this.auditresult = this.qid("auditresult");
    	this.$.find("i.fa").click(this.proxy(this.on_togglePanel_click));
    	this.get_data();
    },
    on_togglePanel_click: function(e){
        var $tar = $(e.currentTarget);
    	var $span="";
		if($tar.prop("nodeName")=="I"){
			$span=$tar;
		}else{
			$span=$tar.find("i")||$tar.find(".fa");
		}
        if($span.hasClass("fa-minus")){
        	$span.removeClass("fa-minus").addClass("fa-plus");
        }
        else{
        	$span.removeClass("fa-plus").addClass("fa-minus");
        }
        $tar.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
    },
    
    get_data :function(){
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
                }
        	}).done(this.proxy(function(response) {
        		if(response.success){
        			this.curr_data = response.data;
        			//审计报告基本信息
        			this.qid("reportName").val(response.data.report.task.reportName);//审计报告名称
        			this.qid("workNo").val(response.data.report.task.workNo);//审计编号
        			this.qid("targetName").val(response.data.report.task.target.targetName);//被审计单位
        			this.qid("address").val(response.data.report.task.address);//审计地点
        			this.qid("startDate").val(response.data.report.task.startDate);
        			this.qid("endDate").val(response.data.report.task.endDate);
        			var auditItems = "";
        			for(i in response.data.report.task.auditItems){
        				if(i == 0){
        					auditItems += response.data.report.task.auditItems[i].name;
        				}else{
        					auditItems += "、" + response.data.report.task.auditItems[i].name;
        				}
        			}
        			this.qid("auditItems").val(auditItems);//审计范围
        			this.qid("teamLeader").val(response.data.report.task.teamLeader);//审计组长
        			
        			this.qid("members").val(response.data.report.task.members);//审计组员
        			var managers = "";
        			for(i in response.data.report.task.managers){
        				if(i == 0){
        					managers += response.data.report.task.managers[i].name;
        				}else{
        					managers += "、" + response.data.report.task.managers[i].name;
        				}
        			}
        			this.qid("managers").val(managers);//经办人
        			
        			this.qid("info_mobilphone").val(response.data.report.task.contact);//经办人联系方式
        			this.qid("info_remark").val(response.data.report.task.reportRemark);//备注
        			this.qid("info_auditstyle").val(response.data.report.task.method);//审计方式
        			//审计结论
        			this.text = response.data.report.task.auditReportSummary;
        			var audit_result = "<table class='uui-table'><tbody>";
        			if(response.data.report.auditResult != ""){
        				if(response.data.actions.length == 0){
        					audit_result += "<tr><td>结论: " + (this.text||"");
                			audit_result += "</td></tr>";
        				}else{
							audit_result += "<tr name='"+this._options.id+"'><td>结论: <label style='width:99%'>" + (this.text||"") + "</label>";
	        				audit_result += "<textarea rows='3' style='display:none;width:100%'>" + (this.text||"") + "</textarea>";
	            			audit_result += "</td><td><span style='visibility:hidden;cursor:pointer' class='glyphicon glyphicon-pencil'></span></td>";
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
                        			audit_result += "</td><td><span style='visibility:hidden;cursor:pointer' class='glyphicon glyphicon-pencil'></span></td>";
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
            		//审计总结条数
            		var $html = "此次共审计检查";
            		$html += response.data.report.problems.statistics.total + "项，其中：";
            		
            		for(var i in response.data.report.problems.statistics){
            			if(i != "total"){
            				$html += i+"为"+response.data.report.problems.statistics[i].num+"项， ";
            			}
            		}
            		$html = $html.substring(0,$html.length-2);
            		$html += "。";
            		$(".info_num").html($html);
            		
            		//审计有问题的
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
                			probody_html += "审计记录："+ (response.data.report.problems.hasProblems[i].auditRecord ? response.data.report.problems.hasProblems[i].auditRecord : "") +"</td>";
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
            		/*for(i in response.data.report.reportFiles){
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
            		*/
            		this.creat_files(response.data);
            		//控制按钮等操作
            		this.qid("top_buttons").html("");
            		if(response.data.actions != ""){
            			var btn_html = "";
            			if(response.data.workflowNodeAttributes.canDo.indexOf("daoChu") > -1){
            				btn_html += "<button type='button' class='btn btn-default btn-link pdf btn-sm export_pdf notfirst_show'>导出</button>";
            			}
            			$.each(response.data.actions,this.proxy(function(idx,item){
                            if(response.data.workflowNodeAttributes.flowStep == "5"){
                                if(response.data.report.problems.hasProblems.length > 0){
                                    if(item.name !== "结案"){
                                        btn_html += "<button type='button' class='btn btn-default btn-sm workflow' name='";
                                        btn_html += response.data.actions[idx].wipId + "'>";
                                        btn_html += response.data.actions[idx].name + "</button>";
                                    }
                                }else{
                                    if(response.data.actions.length==1 || item.name !== "下发"){
                                        btn_html += "<button type='button' class='btn btn-default btn-sm workflow' name='";
                                        btn_html += response.data.actions[idx].wipId + "'>";
                                        btn_html += response.data.actions[idx].name + "</button>";
                                    }
                                };
                            }else{
                                btn_html += "<button type='button' class='btn btn-default btn-sm workflow' name='";
                                btn_html += response.data.actions[idx].wipId + "'>";
                                btn_html += response.data.actions[idx].name + "</button>";
                            }
            			}));
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
        	}));
    	}
    },
    
    edit_baogao_result :function(e){
    	$(e.currentTarget).nextAll('div').eq(0).show();
    	$(e.currentTarget).removeAttr("disabled");
    },
    
    saveorcacel :function(e){
    	var $e = $(e.currentTarget), name = $e.attr("name"),type = $e.attr("data-type"),
    		$tr = $e.parents("tr"), $textarea = $tr.find("textarea"),$label = $tr.find("label"),
    		$span = $tr.find("span"), content1 = $label.text();
    		content = $textarea.val(), checkid = $tr.attr("name"),
    		obj = {},
    		result = function(){
		    	$textarea.hide();
		    	$label.show();
				$e.parent().hide();
				$span.removeClass("hidden");
		    };
	    if(name === "cancel"){
	    	$textarea.val(content1);
	    	result();
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
	    			result();
	    		}else{
	    			$.u.alert.error(data.reason+"!保存失败");
	    		}
			}))
	    }
    },
    
    _pdfData : function(e){
    	//var id = $(e.currentTarget).attr("data");
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportAuditReportToPdf&tokenid="+$.cookie("tokenid")+"&id="+this._options.id);
        form.appendTo('body').submit().remove();
    },
    
    next_xiafa :function(e){
    	var isfanhui = false;
    	if(this.curr_data.workflowNodeAttributes.canDo && this.curr_data.workflowNodeAttributes.canDo.indexOf("fanHui") > -1){
    		isfanhui = true;
    	}
    	//签批件是否上传
		// if(this.curr_data.report.reportFiles.length == 0){
		// 	$.u.alert.error("请先上传签批件");
		// 	return;
		// }
    	var cur_name = $(e.currentTarget).attr("name");
		var wipid = cur_name;
		var clz = $.u.load("com.audit.comm_file.confirm");
		var confirm = new clz({
            "body": "确认操作？",
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
                                "id" : this._options.id
                            },
                    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                    		if(response.success){
                    			confirm.confirmDialog.dialog("close");
                				$.u.alert.success("操作成功");
                				this.get_data();
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
    		var clz = $.u.load("com.audit.comm_file.audit_uploadDialog");
        	//this.fileDialog = new com.audit.comm_file.audit_uploadDialog($("div[umid='fileDialog']",this.$),null);
    		this.fileDialog1 = new clz($("div[umid='fileDialog1']",this.$),null);
    	}
		this.fileDialog1.override({
    		refresh: this.proxy(function(data){
    			//$("<tr/>").appendT
    			this.get_data();
    		})
    	});
    	try{
    		//var nodeid = this.tree.getSelectedNodes()[0].id;
    		this.fileDialog1.open({
    			//"directoryId":nodeid,
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
    	var file_id = $(e.currentTarget).attr("fileid") ;
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
            	    			$.u.alert.success("删除成功");
            	    			confirm.confirmDialog.dialog("close");
            	    			this.get_data();
            	    		}
            	    	}))
                    })
                }
            }
        });
    },
  
    edit_textarea :function(e){
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
		var remove=["termResponsibilityUnit"];
        if(dataid && targetid){
            if(!this.recordDiForm){
                $.u.load('com.audit.worklist.dialog');
            }
            if(ismodify == "cannotmodify"){
            	this.recordDiForm = new com.audit.worklist.dialog($("div[umid='recordDiForm']",this.$), {"editable":false,"remove":remove});
            }else{
            	this.recordDiForm = new com.audit.worklist.dialog($("div[umid='recordDiForm']",this.$), {"editable":true,"remove":remove});
            }
            this.recordDiForm.open(dataid, targetid);
    		this.recordDiForm.override({
        		refresh: this.proxy(function(data){
        			this.get_data();
        		})
        	});
        }
        else{
            console.error("未获取到data");
        }
	},
	
	/**
     * @title 销毁页面的组件,请空按钮
     */
    _destroyModule:function(){
    	this.comps && $.each(this.comps,this.proxy(function(key,comp){
    		comp.destroy();
    		delete this.comps[key];
    	}));
    	this.leftColumns.empty();
    },
    _drawModule:function(config){
    	var $target = null,
    		clazz = null,
    		option = {};
    	var shenjibaogao_id = this.curr_data.report.task.id;
		var flowid = this.curr_data.report.task.flowId;
    	this._destroyModule();
    	if(config){
    		//config.left && $.each(config.left,this.proxy(function(idx,comp){
    			clazz = $.u.load(config.key);
    			option = $.extend(true, {}, config, {
                    logRule: [[{"key":"source","value": parseInt(shenjibaogao_id)}],[{"key":"sourceType","value":"task"}]],
                    remarkRule: [[{"key":"source","value": parseInt(shenjibaogao_id)}],[{"key":"sourceType","value":"task"}]],
                    remarkObj: {
                        source: parseInt(shenjibaogao_id),
                        sourceType: "task"
                    },
                    "addable" : true,
                    flowid :flowid
    			});
    			this.comps[config.key] = new clazz($("<div umid='leftmodule4"+"'/>").appendTo(this.leftColumns),option);
    	}; 
    },
    creat_files:function(Data){
		//上传的签批件
		 if ($.fn.DataTable.isDataTable(this.qid("report_attachment"))) {
             this.qid("report_attachment").dataTable().api().destroy();
             this.qid("report_attachment").empty();
         }
		   	this.reportattachment = this.qid("report_attachment").dataTable({
		   		   pageLength:50,
		           searching: false,
		           serverSide: false,//是否启动服务器端数据导入  
		           bProcessing: false,
		           sDom: "t<f>",
		           ordering: false,
		           "info":true,
		           "loadingRecords": "加载中...",  
		           "aaData":Data.report.reportFiles||[],
		           "aoColumns": [
		               { "title": "文件名" ,"mData":"fileName","sWidth":"40%"},
		               { "title": "大小", "mData":"size","sWidth":"15%" },
		               { "title": "上传时间", "mData": "uploadTime", "sWidth": "15%" },
		               { "title": "上传用户", "mData":"uploadUser", "sWidth": "20%" },
		               { "title": "操作", "mData":"id", "sWidth": "10%" }
		           ],
		           "oLanguage": this._DATATABE_LANGUAGE,
		           "fnServerParams": this.proxy(function (aoData) {}),
		           "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {}),
		           "aoColumnDefs": [
		                {
		                    "aTargets": 0,
		                    "orderable":false,
		                    "sClass": "",
		                    "sContentPadding": "mmm",
		                    "mDataProp": "", 
		                    "bVisible" : true,
		                    "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
		                    "mRender": function (data, type, full) {
		                   	 return data
		                    }
		                },
		                {
		                    "aTargets": 1,
		                    "sClass": "",
		                    "mRender":  this.proxy(function (data, type, full) {
		                   	 return data
		                    })
		                },
		                {
		                    "aTargets": 2,
		                    "sClass": "",
		                    "mRender":  this.proxy(function (data, type, full) {
		                   	 return data
		                    })
		                },
		               {
		                   "aTargets": 3,
		                   "sClass": "",
		                   "mRender":  this.proxy(function (data, type, full) {
		                  	 return data
		                   })
		               },
		               {
		                   "aTargets": 4,
		                   "sClass": "",
		                   "mRender":  this.proxy(function (data, type, full) {
		              		 return "<span class='glyphicon glyphicon-trash del-file' fileid='"+full.id + "' style='cursor: pointer;'></span>"
		                   })
		               }
		           ],
		           
		           "rowCallback": this.proxy(function(row, data, index){
		           	
		           })
		       });
				
		   	this.reportattachment.off("click",".del-file").on("click",".del-file",this.proxy(this.delete_file));
		   	if(Data.actions.length == 0){
		   		this.reportattachment.find(".del-file").addClass("hidden");
		   	}
	},
	
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.audit.xitong_jihua.shangchuan_shenjibaogao.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                      '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                      '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.xitong_jihua.shangchuan_shenjibaogao.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                       { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];