//@ sourceURL=com.audit.inspection.checkReport
$.u.define('com.audit.inspection.checkReport', null, {
    init: function (options) {
        this._options = options || {};
      //上传：
    	this.uploadtemp =	'<div class="panel panel-sms">'
					+'<div class="panel-heading">'
						+'<h2 class="panel-title">'
						+'<i class="fa fa-minus" style="padding-right: 5px;"' 
							+'></i>上传附件'
						+'</h2>'
			       +'</div>'
			      +'<div class="panel-body">' 
					 // + '<label for="<%= this._id%>-file_upload" class="col-sm-2 control-label">附件</label>' 
					    +'<div class="col-sm-10" style="margin-top:15px;">'
					     + '<input type="file" name="file_upload" qid="file_upload" id="uplooood" />'
					   + '</div>'
					   +'<div >'
							   +'<table name="FilesList" class="table table-condensed hidden">'
						      	+'<thead><tr>'
						      			+'<th style="float:left;padding-left: 30px;">文件名</th>'
						      			+'<th style="width: 15%;">文件大小</th>'
						      			+'<th style="width: 15%;">上传人</th>'
						      			+'<th style="width: 15%;">操作</th>'
						      	+'</tr></thead>'
						      +'<tbody></tbody>'	
						      +'</table>'
					   +'</div>'
					 +'</div>'
    			+'</div>'
    		
    },
    afterrender: function (bodystr) {
    	this._options.id=this._options.id||$.urlParam().id;
    	this.initHtml();
    	this.curr_data;
    	this.get_data();
    	this.comps = {};
    	this.qid("top_buttons").on("click",".info_save",this.proxy(this.info_save));
    	this.qid("top_buttons").on("click",".workflow",this.proxy(this.nextflow_step));
    	this.qid("top_buttons").on("click",".export_pdf",this.proxy(this._pdfData));
    	
    	$(".modify_table").off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
    },
    initHtml : function(){
    	  this.baseform    = $(".baseInfo").find("form")
		  this.reportName  = $("[name=reportName]");
		  this.workNo      = $("[name=workNo]");
		  this.startDate   = $("[name=startDate]");
		  this.endDate     = $("[name=endDate]");
		  this.address     = $("[name=address]"); 
		  this.teamLeader  = $("[name=teamLeader]");
		  this.managers    = $("[name=managers]");
		  this.standard    = $("[name=standard]");
		  this.method      = $("[name=method]");
		  this.members      = $("[name=members]");
		  this.auditItems   =$("[name=auditItems]");
		  this.auditReportTransactor = $("[name=auditReportTransactor]");
		  this.contact     = $("[name=contact]");
		  this.reportRemark     = $("[name=reportRemark]");
		  this.remark      = $("[name=reportRemark]");
		  this.leftColumns = this.qid("left-column");
		  this.auditresult = this.qid("auditresult");
		  this.uploadDiv=$("[name=uploadDiv]");
    },
    _init_glyphicon:function(){
      	 $("i.fa").off("click").on("click",this.proxy(function(event){
   	    		var $tar=$(event.currentTarget);
   	    		var $span=$tar.parent().find("i");
   	    		$tar.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
   	    		if($span.hasClass("fa-minus")){
   	    			$span.removeClass("fa-minus").addClass("fa-plus");
   	    		}else{
   	    			$span.removeClass("fa-plus").addClass("fa-minus");
   	    		}
   	    	})).css({"cursor":"pointer"});
   	},
   	
    get_data :function(arg){
    	var obj = {};
    	var id = this._options.id;
    	if(id){
    		$.u.ajax({
    			url : $.u.config.constant.smsqueryserver,
    			type:"post",
                dataType: "json",
                data: {
                    "method": "getAuditReport",
                    "tokenid": $.cookie("tokenid"),
                    "id" : id
                },
        	},this.$).done(this.proxy(function(response) {
        		if(response.success){
        			this.curr_data = response;
        			this.checktype = response.data.report.task.checkType;
        				//检查报告基本信息
        			this.reportName.val(response.data.report.task.reportName);//检查报告名称
        			this.workNo.val(response.data.report.task.workNo);//检查编号
        			this.address.val(response.data.report.task.address);//检查地点
        			this.startDate.val(response.data.report.task.startDate);
        			this.endDate.val(response.data.report.task.endDate);
        			var auditItems = "";
        			for(var i in response.data.report.task.auditItems){
        				if(i == 0){
        					auditItems += response.data.report.task.auditItems[i].name;
        				}else{
        					auditItems += "、" + response.data.report.task.auditItems[i].name;
        				}
        			}
        			this.auditItems.val(auditItems);//检查范围
        			this.teamLeader.val(response.data.report.task.teamLeader|| '');//检查组长
        			this.members.val(response.data.report.task.members|| '');//检查组员
        			if(arg !=="refresh"){
        				this.auditReportTransactor.val(response.data.report.task.auditReportTransactor || '');
            			this.contact.val(response.data.report.task.contact|| '');//经办人联系方式
        			}
        			this.reportRemark.val(response.data.report.task.reportRemark|| '');//备注
        			this.method.val(response.data.report.task.method|| '');//检查方式
        			this.baseform.find("input,textarea").attr("disabled","disabled");
        			var canModify = [], required = [];
        			response.data.workflowNodeAttributes.canModify && (canModify=response.data.workflowNodeAttributes.canModify.split(","));
        			$.each(canModify,this.proxy(function(k,v){
        				if(this[v]){
        					this[v].removeAttr("disabled");
        				}
        			}));
        			response.data.workflowNodeAttributes.required && (required= response.data.workflowNodeAttributes.required.split(","));
        			$.each(required,this.proxy(function(k,v){
        				 var $label = $("[data-field=" + v + "]"); 
        				 if($label.children("span.text-danger").length < 1){
                             $("<span class='text-danger'>&nbsp;&nbsp;*</span>").appendTo($label);
                         }
        			}));
        			//检查结果
        			var audit_result = "<table class='uui-table'><tbody>";
        			this.text = response.data.report.task.auditReportSummary;
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
            					probody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify notmodify' name='";
            				}else{
            					if(response.data.workflowNodeAttributes.canModify && response.data.workflowNodeAttributes.canModify.indexOf("checkList") < 0){
                					probody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify notmodify' name='";
                    			}else{
                    				probody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify' name='";
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
            		}else{
            			$(".no_thead").hide();
            		}
            		this.qid("pro_tbody").html(probody_html);
            		//检查没有问题的
            		var tbody_html = "";
            		if(response.data.report.problems.noProblems != ""){
            			$(".ok_thead").show();
                		for(i in response.data.report.problems.noProblems){
                			if(response.data.actions.length == 0){
                				tbody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify notmodify' name='";
                			}else{
                				if(response.data.workflowNodeAttributes.canModify && response.data.workflowNodeAttributes.canModify.indexOf("checkList") < 0){
                    				tbody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify notmodify' name='";
                    			}else{
                    				tbody_html += "<tr><td>" + (parseInt(i)+1) + "</td><td style='text-align:left'>检查要点：<a href='#' class='rModify' name='";
                    			}
                			}
                			tbody_html += response.data.report.task.target.targetId + ","+response.data.report.problems.noProblems[i].id + "'>";
                			tbody_html += (response.data.report.problems.noProblems[i].itemPoint ? response.data.report.problems.noProblems[i].itemPoint :"") + "</a><br>";
                			tbody_html += "检查记录："+ (response.data.report.problems.noProblems[i].auditRecord ? response.data.report.problems.noProblems[i].auditRecord :"") +"</td>";
                			tbody_html += "<td>" + (response.data.report.problems.noProblems[i].improveUnit ? response.data.report.problems.noProblems[i].improveUnit.name :"")+"</td>";
                			tbody_html += "<td>"+(response.data.report.problems.noProblems[i].auditResult ? response.data.report.problems.noProblems[i].auditResult :"") +"</td>";
                			tbody_html += "<td>"+(response.data.report.problems.noProblems[i].improveLastDate ? response.data.report.problems.noProblems[i].improveLastDate :"") +"</td>";
                			tbody_html += "</tr>";
                		}
            		}else{
            			$(".ok_thead").hide();
            		}
            		this.qid("nopro_tbody").html(tbody_html);
            		if(this.qid("pro_tbody").find("tr").length<1){
            			$(".question").css({
            				border:"none"
            			})
            		}
            		this.uploadDiv.empty().append(this.uploadtemp);
            		this.initUpLoad("上传签批件",5);
            		this.appendToTbody(response.data.report.reportFiles, !!response.data.actions.length);
            		
            		//控制按钮等操作
            		this.qid("top_buttons").html("");
            		this._options.editable=false; 
            		if(response.data.actions.length){
            			var btn_html = "";
            			btn_html += "<button type='button' class='btn btn-default btn-sm info_save'>保存</button>";
            			if(response.data.workflowNodeAttributes.flowStatus === "shenJiBaoGao"){
            				btn_html += "<button type='button' class='btn btn-default btn-sm export_pdf'>导出</button>";
            			}
            			response.data.actions && $.each(response.data.actions, this.proxy(function(k,v){
            				if(response.data.report.problems.hasProblems.length > 0){
                    			if(v.name !== "结案"){
                    				btn_html += "<button type='button' class='btn btn-default btn-sm workflow' name='";
        	            			btn_html += v.wipId + "'>";
        	            			btn_html += v.name + "</button>";
                    			}
                    		}else{
                    			if(v.name !== "生成整改通知单"){
                    				btn_html += "<button type='button' class='btn btn-default btn-sm workflow' name='";
        	            			btn_html += v.wipId + "'>";
        	            			btn_html += v.name + "</button>";
                    			}
                    		}
            			}));
            			this.qid("top_buttons").html(btn_html);
            			this._options.editable=true;
            		}
            		if(response.data.logArea && response.data.logArea.key){ 
            			var shenjibaogao_id = this.curr_data.data.report.task.id;
                		var flowid = this.curr_data.data.report.task.flowId;
            			var zhenggaidan_id = this.zhenggaidan_id;
                        var clz = $.u.load(response.data.logArea.key);
                        this.qid("left-column").html("");
                        var target = $("<div/>").attr("umid", "logs").appendTo(this.leftColumns);
                        new clz( target, $.extend(true, response.data.logArea, {
                        	businessUrl: this.getabsurl("viewCheckReport.html?id=#{source}"),                    
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
            		this._init_glyphicon();
            		if(response.data.workflowNodeAttributes.hiddenModel){
                        $.each(response.data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k,v){
                            if(v === "baseInfo"){
                                 $("i.fa").eq(0).trigger("click");
                            }else if(v === "jielun_zhankai"){
                            	  $("i.fa").eq(1).trigger("click");
                            }else if(v === "hasProblem"){
                            	  $("i.fa").eq(2).trigger("click");
                            }else if(v === "noProblem"){
                            	  $("i.fa").eq(3).trigger("click");
                            }else if(v === "logs"){
                                this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                            }
                        }));
                    }
        		}else{
        			$.u.alert.error(response.reason);
        		}
        	}))
    	}
    },
    saveorcacel :function(e){
    	var $e = $(e.currentTarget), name = $e.attr("name"),type = $e.attr("data-type"),
    		$tr = $e.parents("tr"), $textarea = $tr.find("textarea"),$label = $tr.find("label"),
    		$span = $tr.find("span"), content1 = $label.text(),
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
	    			$.u.alert.error(rep.reason+"!保存失败");
	    		}
			}))
	    }
    },
    info_save:function(){
    	var obj = {"contact":this.contact.val(),
	    			"reportRemark":this.reportRemark.val(),
	    			"method":this.method.val(),
	    			"auditReportTransactor":this.auditReportTransactor.val()
	    			};
    	if($.trim(obj.auditReportTransactor) === ""){
			if(!$("[name=auditReportTransactor]").parents(".panel-body").is(":visible")){
				$("[name=auditReportTransactor]").parents(".panel-sms").find(".fa").trigger("click");
			}
			this.auditReportTransactor.focus();
			return $.u.alert.error("经办人不能为空",2000);
		}
		if($.trim(obj.contact) === ""){
			if(!$("[name=contact]").parents(".panel-body").is(":visible")){
				$("[name=contact]").parents(".panel-sms").find(".fa").trigger("click");
			}
			this.contact.focus();
			return $.u.alert.error("经办人联系方式不能为空",2000);
		}
    	$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            data: {
                "method": "stdcomponent.update",
                "tokenid": $.cookie("tokenid"),
                "dataobjectid":this._options.id,
                "dataobject":"task",
                "obj":JSON.stringify(obj)
            },
    	}).done(this.proxy(function(response) {
    		if(response.success){
    			$.u.alert.success("保存成功",3000);
    		}
    	}))
    },
    
    
    
    

	//上传
	initUpLoad:function(text,sourceType){
		this.planupload=$("input[name=file_upload]")
		this.planupload.uploadify({
            'auto':true,
            'swf': this.getabsurl('../../../uui/widget/uploadify/uploadify.swf'),
	        'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=uploadFiles&sourceType="+sourceType+"&source="+this._options.id,
            //'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
            'fileTypeDesc':'doc',
            'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
            'removeCompleted': true,
            'buttonText': text,
            'cancelImg':this.getabsurl('../../../uui/widget/uploadify/uploadify-cancel.png'),
            'height': 30,   //按钮的高度和宽度
            'width': 200,
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
            	this.planupload.uploadify("disable", this._options.editable === false)
            }),
            'onUploadStart':this.proxy(function(file) {
             /*   var data = {
                    tokenid: $.cookie("tokenid"),
                    method: "uploadFiles",
                    sourceType: 13,
                    source: this._wkid
                };
        
                $("input[name=plan_upload]").uploadify('settings', 'formData', data);*/
                //this.$.find(".uploadify-queue").removeClass("hidden");
            }),
            'onUploadSuccess':this.proxy(function(file, data, response) {
                if(data){
                    data = JSON.parse(data);
                    if(data.success && data.data && $.isArray(data.data.aaData) && data.data.aaData.length > 0){
                    	this.appendToTbody(data.data.aaData,this._options.editable);
                    }
                    else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
                }
            })
        });
    
	},
	//上传
	appendToTbody:function(files, isaction){
    	this.FilesList=$("[name=FilesList]").removeClass("hidden");
        var $tbody = this.FilesList.children("tbody");
        this.$.find(".uploadify-queue").addClass("hidden");
        if(!this.FilesList.is(":visible")){
        	this.FilesList.removeClass("hidden");
        }
        $.isArray(files) && files.length==0 && this.FilesList.addClass("hidden"); 
        $.each(files||[],this.proxy(function(idx,file){
	        $("<tr>"+
	            "<td><li style='list-style-type:none' class='pull-left'><a href='#' style='list-style-type:none' class='download' fileid='"+file.id+"'>" + file.fileName + "</a></li></td>" +
	            "<td>" + file.size + "</td>" +
	            "<td>" + file.uploadUser + "</td>" +
	            (isaction ? "<td><i class='fa fa-trash-o uui-cursor-pointer delete-file' style='padding-right: 10px;' fileid='"+file.id+"'/></td>" : "<td></td>") +
			"</tr>").data("data", file).appendTo($tbody);
        }))
        
        $tbody.off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
        $tbody.off("click", ".download").on("click", ".download", this.proxy(this.on_downloadFile_click));
	},
	
	//下载附件
	 on_downloadFile_click: function(e){
		 	e.preventDefault();
	        var data = parseInt($(e.currentTarget).attr("fileid"));
	        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.location.href);
	    },
	    //删除附件
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
                                       if($("table[name=FilesList]").children("tbody").children("tr").length< 1){
                                       	$("table[name=FilesList]").addClass("hidden");
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
    _pdfData : function(e){
        window.open($.u.config.constant.smsqueryserver+"?method=exportAuditReportToPdf&tokenid="+$.cookie("tokenid")+"&id="+this._options.id);
    },
    //TODO 提交
    nextflow_step:function(e){
    	var cur_name = $(e.currentTarget).attr("name");
		var wipid = parseInt(cur_name);
    	var obj = {"contact":this.contact.val(),
	    			"reportRemark":this.reportRemark.val(),
	    			"method":this.method.val(),
	    			"auditReportTransactor":this.auditReportTransactor.val()
	    			};
		if($.trim(obj.auditReportTransactor) === ""){
			if(!$("[name=auditReportTransactor]").parents(".panel-body").is(":visible")){
				$("[name=auditReportTransactor]").parents(".panel-sms").find(".fa").trigger("click");
			}
			this.auditReportTransactor.focus();
			return $.u.alert.error("经办人不能为空",2000);
		}
		if($.trim(obj.contact) === ""){
			if(!$("[name=contact]").parents(".panel-body").is(":visible")){
				$("[name=contact]").parents(".panel-sms").find(".fa").trigger("click");
			}
			this.contact.focus();
			return $.u.alert.error("经办人联系方式不能为空",2000);
		}
	    	
    	if(this.uploadDiv.children().length>0){
         	if(this.uploadDiv.find("tbody").children().length==0){
         		return $.u.alert.info("请上传附件！",2000)
         	}
         }
    	
    	var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
    	 var confirm = new clz({
             "body": "确认操作？",
             "buttons": {
                 "ok": {
                     "click": this.proxy(function(){
                    	 $.u.ajax({
                  			url : $.u.config.constant.smsmodifyserver,
                  			type:"post",
                            dataType: "json",
                            data: {
                              "method": "stdcomponent.update",
                              "tokenid": $.cookie("tokenid"),
                              "dataobjectid":this._options.id,
                              "dataobject":"task",
                              "obj":JSON.stringify(obj)
                          }
                      	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                      		if(response.success){
                      			$.u.ajax({//工作流下一步
                      				url : $.u.config.constant.smsmodifyserver,
                      				type:"post",
                      	            dataType: "json",
                      	            data: {
                      	            	"method": "operate",
                      	                "tokenid": $.cookie("tokenid"),
                      	                "action" : wipid,
                      	                "dataobject" : "task",
                      	                "id" : this._options.id
                      	            }
                      	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                      	    		if(response.success){
                      	    			 confirm.confirmDialog.dialog("close");
                      	    			$.u.alert.success("操作完成");
                      	    			this.get_data();
                      	    		}
                      	    	}))
                      		}
                      	}))
                     })
                  }
             }
    	 })
    },
    edit_textarea :function(e){
    	if($(e.currentTarget).is("label")){
    		$(e.currentTarget).hide();
    		$(e.currentTarget).parent().next("td").find("span").addClass("hidden");
    		$(e.currentTarget).parent().find("textarea").show();
    		$(e.currentTarget).parent().css("width","83%");
    		$(e.currentTarget).parent().parent().find("div").show();
    	}else if($(e.currentTarget).is("span")){
    		$(e.currentTarget).parent("td").parent("tr").find("label").hide();
        	$(e.currentTarget).addClass("hidden");
        	$(e.currentTarget).parent().parent().find("textarea").show();
        	$(e.currentTarget).parent().parent().find("td:first").css("width","83%");
        	$(e.currentTarget).parent().parent().find("div").show();
    	}
    },
    modifyRow : function(e){
		e.preventDefault();
		var $e = $(e.currentTarget);
		var isedit = true;
		if($(e.currentTarget).hasClass("notmodify")){
			isedit = false;
		}
		var dataid = $e.attr("name").split(",")[1];
        if(dataid){
            if(!this.recordDiForm){
                $.u.load('com.audit.inspection.dialog');
            }
            this.recordDiForm = new com.audit.inspection.dialog($("div[umid='recordDiForm']",this.$), {
            	editable:isedit,
            	copyedit:false,
    			checkGrade:"",
    			checktype: this.checktype
            	});
            this.recordDiForm.open(dataid);
            this.recordDiForm.override({
        		refresh: this.proxy(function(data){
        			this.get_data("refresh");
        		})
        	});
           /* this.recordDiForm.override({
                refresh: this.proxy(function(formData,newId){
                	$tr=$e.closest("tr");
                	if($tr.length){//直接点击保存,或者第一次点击复制并保存
                		this.checkDataTable.row($tr).data($.extend(true, {}, data, {
                            itemPoint: formData.itemPoint,
                            auditRecord: formData.auditRecord,
                            improveUnit: formData.improveUnit,
                            auditResult: formData.auditResult,
                            improveLastDate: formData.improveLastDate
                        })).draw();
                		if(newId){
                			this.rowId = newId;
                			this.recordDiForm.open(newId);
                		}
                	}else{//点击复制并保存
                		this.rowId && this.$.find('a[data-id='+this.rowId+']').parents('tr').attr("style", "background-color: #dff0d8 !important");
                		var newData = [];
                		newData.push($.extend(true, {}, data, {               
                			 itemPoint: formData.itemPoint,
                             auditRecord: formData.auditRecord,
                             improveUnit: formData.improveUnit,
                             auditResult: formData.auditResult,
                             id: this.rowId,
                             improveLastDate: formData.improveLastDate
                        }));
                		this.checkDataTable.rows.add(newData).draw();
                		if(newId){//第二次,第三次..点击复制并保存 ，返回newId
	                		this.rowId = newId;
	                		this.recordDiForm.open(newId);
	                	}else{//最后点击保存 ，不返回newId
	                	}
                	}
                })
            });
            this.recordDiForm.open(data.id);*/
        }
        else{
            console.error("未获取到data");
        }
	},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });
com.audit.inspection.checkReport.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
                                          "../../../uui/widget/spin/spin.js", 
                                          '../../../uui/widget/uploadify/jquery.uploadify.js',
                                          "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                          "../../../uui/widget/ajax/layoutajax.js"];
com.audit.inspection.checkReport.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                              { path:"../../../uui/widget/uploadify/uploadify.css"},
                                           { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];