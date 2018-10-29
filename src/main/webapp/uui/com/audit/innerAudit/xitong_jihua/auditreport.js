//@ sourceURL=com.audit.innerAudit.xitong_jihua.auditreport
//$.u.load("com.audit.innerAudit.comm_file.audit_uploadDialog");
$.u.define('com.audit.innerAudit.xitong_jihua.auditreport', null, {
    init: function (options) {
        this._options = options || {};
        this.iscanModify=false;//是否有可填写保存的输入框
        this.editable=false;//是否有操作权限
        this.required=[];//必填字段
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
    	this.initform();
    	this.getAuditReport();
    	this._options.id =this._options.id || $.urlParam().id;
    	this._type = $.urlParam().type;
    	this._type=="erjineishen"?$("[name=anquan]").text("二级内审"):$("[name=anquan]").text("内部安全审核");
    	this.$.off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
    	this.$.off("click","i.glyphicon-btn").on("click","i.glyphicon-btn",this.proxy(function(event){
	    		var $tar=$(event.currentTarget);
	    		var $span="";
	    		if($tar.prop("nodeName")=="I"){
	    			$span=$tar;
	    		}else{
	    			$span=$tar.find("i")||$tar.find(".glyphicon");
	    		}
	    		$tar.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
	    		if($span.hasClass("glyphicon-minus")){
	    			$span.removeClass("glyphicon-minus").addClass("glyphicon-plus");
	    		}else{
	    			$span.removeClass("glyphicon-plus").addClass("glyphicon-minus");
	    		}
	    	}));
    	$("i.glyphicon-btn",this.$).css({"cursor":"pointer"})
    },
    
  
    initform : function(){
    	  this.baseform    = $(".baseInfo").find("form")
		  this.reportName  = $("[name=reportName]");
		  this.workNo      = $("[name=workNo]");
		  this.target 		= $("[name=target]");
		  this.startDate   = $("[name=startDate]");
		  this.endDate     = $("[name=endDate]");
		  this.address     = $("[name=address]"); 
		  this.teamLeader  = $("[name=teamLeader]");
		  this.managers    = $("[name=managers]");
		  this.method      = $("[name=method]");
		  this.members      = $("[name=members]");
		  this.auditItems   =$("[name=auditItems]");
		  this.contact     = $("[name=contact]");
		  this.reportRemark     = $("[name=remark]");
		  this.remark      = $("[name=remark]");
		  this.leftColumns = this.qid("left-column");
		  this.auditresult = this.qid("auditresult");
  },
  getAuditReport :function(){
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
        	},this.$).done(this.proxy(function(response) {
        		if(response.success){
    			  this.curr_data = response.data;
    			  if(response.data.actions.length){
    				  this.editable=true;
    			  }
    			  var flowStatus=response.data.workflowNodeAttributes.flowStatus||"";	
    			  switch(flowStatus){
	    			  case "shenJiBaoGao":
	    				  //审计报告基本信息
	        			  this.fillFormData(response.data.report.task);
	        			  this.show_canModify(response);
	        			  this.show_required(response);
	    	    		   //审计结论
	    	  		  	  this.show_audit_result(response);
	    	  		  	   //审计总结条数
	    	  			  this.show_statistics_total(response);
	    	      		   //不符合项
	    	      		  this.creat_checklist(response.data.report.problems.hasProblems);
	    	      		   //符合项
	    	      		  this.show_audit_noproblem(response.data.report.problems.noProblems)
		            		//备注
			      		  this.show_logArea(response);
		            		//初始隐藏模块
			      		  this.show_hiddenModel(response);
			      		  //右上角按钮
			  			  this.show_action_button(response);
	    				  break;
	    			  case "qianPi":
	    				  //审计报告基本信息
	        			  this.fillFormData(response.data.report.task);
	        			  this.show_canModify(response);
	        			  this.show_required(response);
	    	    		   //审计结论
	    	  		  	  this.show_audit_result(response);
	    	  		  	   //审计总结条数
	    	  			  this.show_statistics_total(response);
	    	      		   //不符合项
	    	      		  this.creat_checklist(response.data.report.problems.hasProblems);
	    	      		  //附件
	    	  			  this.show_audit_auditfiles(response);
		            		//备注
			      		  this.show_logArea(response);
		            		//初始隐藏模块
			      		  this.show_hiddenModel(response);
			      		  if(!this.editable){
			      			  if($("[umid=auditfiles]").length){
			      				$("[umid=auditfiles]").find("i.glyphicon-btn").trigger("click");  
			      			  }
			      		  }
			      		  //右上角按钮
			  			  this.show_action_button(response);
	    				  break; 
	    			  case "wanCheng":
	    				  //审计报告基本信息
	        			  this.fillFormData(response.data.report.task);
	        			  this.show_canModify(response);
	        			  //this.show_required(response);
	    	    		   //审计结论
	    	  		  	  this.show_audit_result(response);
	    	  		  	   //审计总结条数
	    	  			  this.show_statistics_total(response);
	    	      		   //不符合项
	    	      		  this.creat_checklist(response.data.report.problems.hasProblems);
	    	      		  //附件
	    	  			  this.show_audit_auditfiles(response);
		            		//备注
			      		  this.show_logArea(response);
		            		//初始隐藏模块
			      		  this.show_hiddenModel(response);
			      		  //右上角按钮
			  			  this.show_action_button(response);
	    				  break; 
	    			  default:
	    				  //审计报告基本信息
	        			  this.fillFormData(response.data.report.task);
	        			  this.show_canModify(response);
	        			  //this.show_required(response);
	    	    		   //审计结论
	    	  		  	  this.show_audit_result(response);
	    	  		  	   //审计总结条数
	    	  			  this.show_statistics_total(response);
	    	      		   //不符合项
	    	      		  this.creat_checklist(response.data.report.problems.hasProblems);
	    	      		  //附件
	    	  			  this.show_audit_auditfiles(response);
		            		//备注
			      		  this.show_logArea(response);
		            		//初始隐藏模块
			      		  this.show_hiddenModel(response);
			      		  //右上角按钮
			  			  this.show_action_button(response);
	    				
    			  }
    			 
	      		
        		}
        	}));
    	}
    },
  
    show_audit_noproblem:function(noProblemsData){
    	if(!this.auditnoproblem){
			$.u.load('com.audit.innerAudit.xitong_jihua.auditreportnoproblem');
			this.auditnoproblem = new com.audit.innerAudit.xitong_jihua.auditreportnoproblem($('div[umid=auditnoproblem]'),null)
		}
		this.auditnoproblem.creat_list(noProblemsData)
    },
    
    show_audit_auditfiles:function(response){
    	if(!this.auditfiles){
			$.u.load('com.audit.innerAudit.xitong_jihua.auditfiles');
			this.auditfiles = new com.audit.innerAudit.xitong_jihua.auditfiles($('div[umid=auditfiles]'),null)
		}
    	
		this.auditfiles.creat_list(response.data.report.reportFiles);
		this.addfile=$("[qid=add_file]");
    	this.addfile.off("click").on("click",this.proxy(this._add_file));
    	this.$.off("click",".delete-file").on("click",".delete-file",this.proxy(this.delete_file));
    	if(response.data.actions.length===0){
    		this.addfile.addClass("hidden");
    		this.$.find(".delete-file").addClass("hidden");
    	}
    },
    
    
   
  
    
    _add_file:function(){
    	if(!this.fileDialog1){
    		var clz = $.u.load("com.audit.innerAudit.comm_file.audit_uploadDialog");
    		this.fileDialog1 = new clz($("div[umid='fileDialog1']",this.$),null);
    	}
		this.fileDialog1.override({
    		refresh: this.proxy(function(data){
    			this.getAuditReport();
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
    	var file_id = $(e.currentTarget).attr("fileid") ;
    	var clz = $.u.load("com.audit.innerAudit.comm_file.confirm");
    	if(file_id){
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
                	    			this.getAuditReport();
                	    		}
                	    	}))
                        })
                    }
                }
            });
    	}
        
    },
  
  
    
    modifyRow : function(e){
		e.preventDefault();
		var $e = $(e.currentTarget);
		
		var datadata=$e.attr("datadata");
		var targetid=JSON.parse(datadata).improveUnit ? JSON.parse(datadata).improveUnit.id:"";
		var dataid= $e.attr("dataid")
        if(dataid){
            if(!this.recordDiForm){
                $.u.load('com.audit.innerAudit.worklist.dialog');
            }
            this.recordDiForm = new com.audit.innerAudit.worklist.dialog($("div[umid='recordDiForm']",this.$), {editable:this.editable});
            this.recordDiForm.open(dataid, targetid);
    		this.recordDiForm.override({
        		refresh: this.proxy(function(data){
        			this.getAuditReport();
        		})
        	});
        }
        else{
            console.error("未获取到data");
        }
	},
	  
	
    
    on_p_result_click:function(e){
		var $e=$(e.currentTarget);
		if($e.find("textarea").length>0){
			return
		}
		var value=$e.text();
		var $td=$e.closest("td")
		var $tdchild=$td.children().detach();
		var $input=$('<textarea class="form-control" style="resize:none;" rows="3"></textarea>').appendTo($td);
		$input.focus().val(value);
		$input.blur(this.proxy(function(e){
			  var val= $input.val();
			  $input.remove();
			  $tdchild.text(val).appendTo($td)
			  if(value!==val){
				  $("[name=result_save]").trigger("click");
			  }
		  }));
	},
	
	_result_save:function(e){
    	$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
                "method": "stdcomponent.update",
                "tokenid": $.cookie("tokenid"),
                "dataobjectid":this._options.id,
                "dataobject":"task",
                "obj":JSON.stringify({"auditReportSummary":$("p.p_result_textarea").text()||""})
            },
    	}).done(this.proxy(function(response) {
    		if(response.success){
    			$.u.alert.success("保存成功");
    		}else{
    			$.u.alert.error(data.reason+"!保存失败");
    		}
    	}))
    },
    
    
    on_auditresult_click:function(e){
		var $e=$(e.currentTarget);
		if($e.find("textarea").length>0){
			return
		}
		var dataid=$e.attr("dataid");
		var value=$e.text();
		var $td=$e.closest("td")
		var $tdchild=$td.children().detach();
		var $input=$('<textarea class="form-control" style="resize:none;" rows="3"></textarea>').appendTo($td);
    	$input.focus().val(value);
		$input.blur(this.proxy(function(e){
			  var val= $input.val();
			  $input.remove();
			  $tdchild.text(val).appendTo($td)
			  if(value==val){
	  				return false
			  }
			  this.updateInput(dataid,val);
		  }));
	},
    
    
    
    updateInput:function(dataid,content){
		var obj = {"result":content};
    	$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
                "method": "stdcomponent.update",
                "dataobjectid":parseInt(dataid),
                "tokenid": $.cookie("tokenid"),
                "dataobject":"check",
                "obj":JSON.stringify(obj)
            },
    	}).done(this.proxy(function(response) {
    		if(response.success){
        		this.getAuditReport();
    		}
    	}))
    },
    
    fillFormData:function(taskData){ 
		  this.reportName.val(taskData.reportName||"");//审计报告名称
		  this.workNo.val(taskData.workNo||"");//审计编号
		  this.target.val(taskData.target ? taskData.target.targetName : "");//被审计单位
		  this.startDate.val(taskData.startDate||"");
		  this.endDate.val(taskData.endDate||"");
		  this.address.val(taskData.address||"");//审计地点
		  this.teamLeader.val(taskData.teamLeader||"");//审计组长
		  this.method.val(taskData.method||"");//审计方式
		  this.members.val(taskData.members);//审计组员
		  this.contact.val(taskData.contact||"");//经办人联系方式
		  this.reportRemark.val(taskData.reportRemark||"");//备注
		  var items=[];
		  $.each(taskData.auditItems||[],this.proxy(function(k,val){
			  items.push(val.name)
		  }))
		  this.auditItems.val(items.join("、"));//审计范围
		  var managers=[];
		  $.each(taskData.managers||[],this.proxy(function(k,val){
			  managers.push(val.name+"("+val.username+")")
		  }))
		  this.managers.val(managers.join("、"));//经办人
    },
    show_canModify:function(response){
    	//canModify
		 this.form= $(".baseInfo",this.$).find("form");
		 this.form.find("input,textarea").attr("disabled","disabled");
		 if(this.editable){
			 if(response.data.workflowNodeAttributes){
				  if(response.data.workflowNodeAttributes.canModify){
					  $.each(response.data.workflowNodeAttributes.canModify.split(","),this.proxy(function(k,v){
						    if(this[v]){    
						    	this[v].removeAttr("disabled");
						    	this.iscanModify=true;
						    }
					  }))
				  }
				 
			  }
		 }
		
    },
    show_required:function(response){
		//_required
		 if(response.data.workflowNodeAttributes.required){
             var rules = {}, messages ={};
             $.each(response.data.workflowNodeAttributes.required.split(","), this.proxy(function(k,v){
                if(this[v]){ 
                     var $label = $("[data-field=" + v + "]"); 
                     rules[v] = { required: true };
                     messages[v] = { required: "该项不能为空" };
                     if($label.children("span.text-danger").length < 1){
                         $("<span class='text-danger'>&nbsp;&nbsp;*</span>").appendTo($label);
                     }
                 }else{
                	 this.required.push(v);
                 }
             }));
             this.form.validate({
                 rules: rules,
                 messages: messages,
                 errorClass: "text-danger text-validate-element",
                 errorElement:"div"
             });
         }
    },
    
    show_logArea:function(response){
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
    },
    show_hiddenModel:function(response){
    	//hasProblem,noProblem,logs
		if(response.data.workflowNodeAttributes.hiddenModel){
				$.each(response.data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k,v){
					switch(v){
					case "baseInfo":
							$("i.glyphicon-btn",this.$).eq(0).trigger("click");
						break;
					case "result":
							$("i.glyphicon-btn",this.$).eq(1).trigger("click");
						break;
					case "hasProblem":
							$("i.glyphicon-btn",this.$).eq(2).trigger("click");
						break;
					case "noProblem":
							$("i.glyphicon-btn",this.$).eq(3).trigger("click");
						break;
					case "files":
							$("i.glyphicon-btn",this.$).eq(4).trigger("click");
						break;
					case "logs":
						this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
						break;
					}
                }));
			
        }
    },
    creat_checklist:function(hasProblemsData){
		  if ($.fn.DataTable.isDataTable(this.qid("hasProblems"))) {
			  this.qid("hasProblems").parents(".panel-body").show()
              this.qid("hasProblems").dataTable().api().destroy();
              this.qid("hasProblems").empty();
          }
		  // 审计中发现的问题
    	this.hasProblemsDataTable = this.qid("hasProblems").dataTable({
    		pageLength:50,
            searching: false,
            serverSide: false,//是否启动服务器端数据导入  
            bProcessing: false,
            sDom: "t<f>",
            ordering: false,
            "info":true,
            "loadingRecords": "加载中...",  
            "aaData":hasProblemsData||[],
            "aoColumns": [
                { "title": "序号" ,"mData":"id","sWidth":"8%"},
                { "title": "存在问题汇总", "mData":"itemPoint","sWidth":"" },
                { "title": "主要责任单位", "mData": "improveUnit", "sWidth": "15%" },
                { "title": "审计结论", "mData":"auditResult", "sWidth": "15%" },
                { "title": "整改期限", "mData":"improveLastDate", "sWidth": "15%" }
            ],
            "oLanguage": this._DATATABE_LANGUAGE,
            "fnServerParams": this.proxy(function (aoData) {}),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {}),
            "aoColumnDefs": [
                 {
                     "aTargets": 0,
                     "orderable":false,
                     "sClass": "tdidx",
                     "sContentPadding": "mmm",
                     "mDataProp": "", 
                     "bVisible" : true,
                     "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                     "mRender": function (data, type, full) {
                    	 return ""
                     }
                 },
                 {
                     "aTargets": 1,
                     "sClass": "",
                     "mRender":  this.proxy(function (data, type, full) {
                    	return "<div>检查要点：<a href='#' class='rModify' dataid='"+full.id+"' datadata='"+JSON.stringify(full)+"'> "+(full.itemPoint||"")+"</a><br/><div>审计记录："+(full.auditRecord||"")
                     })
                 },
                 {
                     "aTargets": 2,
                     "sClass": "",
                     "mRender":  this.proxy(function (data, type, full) {
                    		 return data && data.name || '' 
                     })
                 },
                {
                    "aTargets": 3,
                    "sClass": "",
                    "mRender":  this.proxy(function (data, type, full) {
                    	 return data||""
                    })
                },
                {
                    "aTargets": 4,
                    "sClass": "",
                    "mRender":  this.proxy(function (data, type, full) {
               		 return data
                    })
                }
            ],
            
            "rowCallback": this.proxy(function(row, data, index){
            	
            })
        });
    	
    	 $(".tdidx").each(function(ids,item){
    		 if(item.tagName=="TD"){
    		 	$(item).text(ids);
    		 }
    	 })
	},
	 
	show_audit_result:function(response){
		this.qid("auditresult").empty();
		var $audit_result_table = $("<table class='uui-table' name='auditresult'></table>");
		var _temp="<tr><td style='width: 10%;'>总结 : </td>" +
				"<td><p class='p_result_textarea' dataid='' style='word-wrap: break-word;border-radius: 10px;margin-bottom: 20px;padding: 20px;'>"+(response.data.report.task.auditReportSummary||"")+"</p></td>" +
				"<td><i class='glyphicon glyphicon-pencil text-right' style='display:block;cursor: pointer;'></i>" +
				"<button name='result_save' type='button' class='btn btn-default btn-sm  result_save hidden' style='margin-top:30px;'>保存</button></td></tr>"
			$audit_result_table.append(_temp);
		$.each(response.data.report.auditResult||[],this.proxy(function(idx,item){
			var temp="<tr><td style='width: 10%;'>"+item.checkType+"  : </td><td><p class='bg-pop' dataid='"+item.id+"' style='word-wrap: break-word;border-radius: 10px;margin-bottom: 20px;padding: 20px;'>"+(item.result||"")+"</p></td><td><i class='glyphicon glyphicon-pencil text-right' style='display:block;cursor: pointer;'></i></td></tr>"
			$audit_result_table.append(temp);
		}))
		
		
			$audit_result_table.appendTo(this.qid("auditresult"))
							   .find("[name=result_save]").off("click").on("click",this.proxy(this._result_save));;

		//不可编辑allResult
		if(response.data.actions.length == 0 ||response.data.workflowNodeAttributes.canDo.indexOf("fanHui") > -1 || response.data.workflowNodeAttributes.canModify.indexOf("allResult") < 0){
			this.qid("auditresult").find("i.glyphicon-pencil").addClass("hidden");
			this.qid("auditresult").find("p.bg-pop").removeClass("bg-pop").addClass("bg-porp");
			this.qid("auditresult").find("p.p_result_textarea").removeClass("p_result_textarea").addClass("bg-porp");
		}
		this.qid("auditresult").find(".glyphicon-pencil").off("click").on("click",this.proxy(function(e){
			$(e.currentTarget).closest("tr").find("p").trigger("click");
		}))
		this.qid("auditresult").off("click",".bg-pop").on("click",".bg-pop",this.proxy(this.on_auditresult_click))
		$("p.p_result_textarea").off("click").on("click",this.proxy(this.on_p_result_click))
	},
	
	show_statistics_total:function(response){
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
	},
	show_action_button:function(response){
		this.qid("top_buttons").html("");
		if(response.data.actions.length){
			if(this.iscanModify){//保存
				this.qid("top_buttons").append("<button type='button' class='btn btn-default  btn-sm save '>保存</button>") ;
			}
			if(response.data.workflowNodeAttributes.canDo.indexOf("daoChu") > -1){//导出
				this.qid("top_buttons").append("<button type='button' class='btn btn-default  btn-sm export_pdf '>导出</button>") ;
			}
			$.each(response.data.actions,this.proxy(function(idx,item){
				if(response.data.workflowNodeAttributes.flowStep == "5"){
					if(response.data.report.problems.hasProblems.length > 0){
	        			if(item.name !== "结案"){
	        				this.qid("top_buttons").append("<button type='button' class='btn btn-default btn-sm workflow ' wipid='"
	    							+item.wipId+"'>"+item.name+"</button>");
	        			}
	        		}else{
	        			if(response.data.actions.length==1 || item.name !== "下发"){
	        				this.qid("top_buttons").append("<button type='button' class='btn btn-default btn-sm workflow ' wipid='"
	    							+item.wipId+"'>"+item.name+"</button>");
	        			}
	        		}
				}else{
					this.qid("top_buttons").append("<button type='button' class='btn btn-default btn-sm workflow ' wipid='"
							+item.wipId+"'>"+item.name+"</button>");
				}
				
			}))
			this.qid("top_buttons").off("click",".save").on("click",".save",this.proxy(this._save));
			this.qid("top_buttons").off("click",".export_pdf").on("click",".export_pdf",this.proxy(this._export));
			this.qid("top_buttons").off("click",".workflow").on("click",".workflow",this.proxy(this._next));
		}
	},

   

	_save:function(e){
    	if(!this.form.valid()){
			return  
		}
    	var obj = {
    				"contact":this.contact.val(),
    				"reportRemark":this.remark.val(),
    				"auditReportSummary":$("p.p_result_textarea").text()||""
    				};
    	
    	$.u.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
                "method": "stdcomponent.update",
                "tokenid": $.cookie("tokenid"),
                "dataobjectid":this._options.id,
                "dataobject":"task",
                "obj":JSON.stringify(obj)
            },
    	}).done(this.proxy(function(response) {
    		if(response.success){
    			$.u.alert.success("保存成功");
    			this.getAuditReport();
    		}else{
    			$.u.alert.error(data.reason+"!保存失败");
    		}
    	}))
    },
  
    //提交，走工作流
    _next:function(e){
    	var wipid = parseInt($(e.currentTarget).attr("wipid"));
    	if(!this.form.valid()){
			return  $.u.alert.info("请完善基本信息！",2000)
		}
    	if($.inArray("allResult",this.required) >-1){
    		if($("p.p_result_textarea").text()===""){
    			return $.u.alert.info("请填写下方的审计总结！",2000)
    		}
    	}
    	// if($("[umid=auditfiles]").children().length>0){
     //     	if($("[umid=auditfiles]").find("tbody").children().length === 0 ||$("[umid=auditfiles]").find("tbody").find(".dataTables_empty").length > 0){
     //     		return $.u.alert.info("请上传签批件！",2000)
     //     	}
     //     }
    	var obj = {
    				"contact":this.contact.val(),
    				"reportRemark":this.remark.val()
    				};
    	
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
                  			cache: false,
                  			data: {
                              "method": "stdcomponent.update",
                              "tokenid": $.cookie("tokenid"),
                              "dataobjectid":this._options.id,
                              "dataobject":"task",
                              "obj":JSON.stringify(obj)
                          },
                      	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                      		if(response.success){
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
                      	    			$.u.alert.success("操作完成");
                      	    			confirm.confirmDialog.dialog("close");
                      	    			//this.getAuditReport();
                      	    			 window.location.reload();
                      	    		}else{
                      	    			$.u.alert.error(response.reason);
                      	    		}
                      	    	}))
                      		}else{
                      			$.u.alert.error(data.reason+"!保存失败");
                      		}
                      	}))
                     })
                  }
             }
    	 })
    },

    _export : function(e){
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportAuditReportToPdf&tokenid="+$.cookie("tokenid")+"&id="+this._options.id);
        form.appendTo('body').submit().remove();
    },
	refresh:function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            cache: false,
            data: {
                "method": "getAuditReport",
                "tokenid": $.cookie("tokenid"),
                "id" : this._options.id
            },
    	}).done(this.proxy(function(response) {
    		if(response.success){
			  this.curr_data = response.data;
		    	//审计结论
		  	  this.show_audit_result(response);
		  	 //审计总结条数
			  this.show_statistics_total(response);
    		 //不符合项
    		 this.creat_checklist(response.data.report.problems.hasProblems);
    		 //符合项
    		 this.show_audit_noproblem(response.data.report.problems.noProblems)
    		  //附件
			 this.show_audit_auditfiles(response)
    		  //右上角按钮
			 this.show_action_button(response);
    		 this.show_hiddenModel(response);
    		}
    	}));
	
	},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.audit.innerAudit.xitong_jihua.auditreport.widgetjs = [
                                                          '../../../../uui/widget/jqurl/jqurl.js',
                                                          '../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                          '../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js',
                                                          '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.innerAudit.xitong_jihua.auditreport.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                           {path:'../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'},
                                                           { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];