//@ sourceURL=com.audit.xitong_jihua.shengcheng_shenjibaogao
$.u.define('com.audit.xitong_jihua.shengcheng_shenjibaogao', null, {
    init: function (options) {
        this._options = options || {};//工作单id
    },
    afterrender: function (bodystr) {
    	this.curr_data;
    	this._init_form();
    	this.modify_url= "$.u.config.constant.smsmodifyserver";
    	this.comps = {};
    	this.qid("top_buttons").on("click",".info_save",this.proxy(this.info_save));
    	this.qid("top_buttons").on("click",".workflow",this.proxy(this.nextflow_step));
    	this.qid("top_buttons").on("click",".export_pdf",this.proxy(this._pdfData));
    	$(".modify_table").off("click", ".rModify").on("click", ".rModify", this.proxy(this.modifyRow));
    	this.$.find("i.fa").closest("div.panel-heading").click(this.proxy(this.on_togglePanel_click));
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
    
    _init_form:function(){
    	this.leftColumns  = this.qid("left-column");
    	this.auditresult  = this.qid("auditresult");
    	this.form         =$(".baseInfo").find("form");
    	this.reportName   =$("[name=reportName]");//审计报告名称
    	this.workNo       =$("[name=workNo]");//审计编号
		this.target       =$("[name=target]");//被审计单位
		this.address      =$("[name=address]");//审计地点
		this.startDate    =$("[name=startDate]");//审计日期
		this.endDate      =$("[name=endDate]")
		this.auditItems   =$("[name=auditItems]");//审计范围
		this.teamLeader   =$("[name=teamLeader]");//审计组长
		this.members      =$("[name=members]");//审计组员
		this.managers     =$("[name=managers]");//经办人
		this.contact      =$("[name=contact]");//经办人联系方式
		this.method       =$("[name=method]");//审计方式
		this.remark       =$("[name=remark]");//备注
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
        	},this.$).done(this.proxy(function(response) {
        		if(response.success){
        			this.curr_data = response;
        				//审计报告基本信息
            			this.reportName.val(response.data.report.task.reportName);//审计报告名称
            			this.workNo.val(response.data.report.task.workNo);//审计编号
            			this.target.val(response.data.report.task.target.targetName);//被审计单位
            			this.address.val(response.data.report.task.address);//审计地点
            			this.startDate.val(response.data.report.task.startDate);
            			this.endDate.val(response.data.report.task.endDate);
            			var auditItems = "";
            			for(i in response.data.report.task.auditItems){
            				if(i == 0){
            					auditItems += response.data.report.task.auditItems[i].name;
            				}else{
            					auditItems += "、" + response.data.report.task.auditItems[i].name;
            				}
            			}
            			this.auditItems.val(auditItems);//审计范围
            			this.teamLeader.val(response.data.report.task.teamLeader);//审计组长
            			this.members.val(response.data.report.task.members);//审计组员
            			var managers = "";
            			$.each(response.data.report.task.managers, function(k, v){
            				managers += (( k === 0 ? '' : '、') + v.name + '(' + v.username + ')' );
            			});
            			this.managers.val(managers);//经办人
            			this.contact.val(response.data.report.task.contact);//经办人联系方式
            			this.remark.val(response.data.report.task.reportRemark);//备注
            			this.method.val(response.data.report.task.method);//审计方式
        			
        			this.reportName.add(this.workNo)
				        			.add(this.target )
				        			.add(this.address )
				        			.add(this.startDate)
				        			.add(this.endDate)
				        			.add(this.auditItems)
				        			.add(this.teamLeader)
				        			.add(this.members)
				        			.add(this.managers)
				        			.add(this.contact)
				        			.add(this.method )
				        			.add(this.remark).attr("readonly",true);

					if(response.data.actions.length >0){
						if(response.data.workflowNodeAttributes && response.data.workflowNodeAttributes.canModify ){
							$.each(response.data.workflowNodeAttributes.canModify.split(","),this.proxy(function(idx,item){
								$("[name="+item+"]").removeAttr("readonly");
							}))
						}
					}
					
					this.qid("auditresult").empty();
					var $audit_result_table = $("<table class='uui-table' name='auditresult'></table>");
					var _temp="<tr><td style='width: 10%;'>总结 : </td>" +
							"<td><p class='p_result_textarea' dataid='' style='word-wrap: break-word;border-radius: 10px;margin-bottom: 20px;padding: 20px;'>"+(response.data.report.task.auditReportSummary||"")+"</p></td>" +
							"<td><i class='glyphicon glyphicon-pencil text-right' style='display:block;cursor: pointer;'></i>" +
							"<button name='result_save' type='button' class='btn btn-default btn-sm  result_save hidden' style='margin-top:30px;'>保存</button></td></tr>"
						$audit_result_table.append(_temp);
					$.each(response.data.report.auditResult||[],this.proxy(function(idx,item){
						var temp="<tr><td style='width: 10%;'>"+item.checkType+"  : </td><td><p class='bg-pop' dataid='"+item.id+"' style='word-wrap: break-word;border-radius: 10px;margin-bottom: 20px;padding: 20px;'>"+item.result+"</p></td><td><i class='glyphicon glyphicon-pencil text-right' style='display:block;cursor: pointer;'></i></td></tr>"
						$audit_result_table.append(temp);
					}))
						$audit_result_table.appendTo(this.qid("auditresult"))
										   .find("[name=result_save]").off("click").on("click",this.proxy(this._result_save));;
					
					//不可编辑allResult
					if(response.data.actions.length == 0 ||response.data.workflowNodeAttributes.canDo.indexOf("fanHui") > -1 ){
						if(response.data.workflowNodeAttributes.canModify.indexOf("allResult") < 0){
							this.qid("auditresult").find("i.glyphicon-pencil").addClass("hidden");
							this.qid("auditresult").find("p.bg-pop").removeClass("bg-pop").addClass("bg-porp");
							this.qid("auditresult").find("p.p_result_textarea").removeClass("p_result_textarea").addClass("bg-porp");
						}
					}
					this.qid("auditresult").find(".glyphicon-pencil").off("click").on("click",this.proxy(function(e){
						$(e.currentTarget).closest("tr").find("p").trigger("click");
					}))
					
					
					this.qid("auditresult").find(".bg-pop").off("click").on("click",this.proxy(function(e){
						$e=$(e.currentTarget);
						if($e.find("textarea").length>0){
							return
						}
						var dataid=$e.attr("dataid");
						var value=$e.text();
						var $td=$e.closest("td")
						var $tdchild=$td.children().detach();
						$input=$('<textarea class="form-control" style="resize:none;" rows="3"></textarea>').appendTo($td);
						$input.focus().val(value);
						$input.blur(this.proxy(function(e){
							  val= $input.val();
							  $input.remove();
							  $tdchild.text(val).appendTo($td)
							  if(value==val){
					  				return false
							  }
							  this.updateInput(dataid,val);
						  }));
					}))
					
					$("p.p_result_textarea").off("click").on("click",this.proxy(function(e){
						$e=$(e.currentTarget);
						if($e.find("textarea").length>0){
							return
						}
						var value=$e.text();
						var $td=$e.closest("td")
						var $tdchild=$td.children().detach();
						$input=$('<textarea class="form-control" style="resize:none;" rows="3"></textarea>').appendTo($td);
						$input.focus().val(value);
						$input.blur(this.proxy(function(e){
							  val= $input.val();
							  $input.remove();
							  $tdchild.text(val).appendTo($td)
							  if(value!=val){
								  $("[name=result_save]").trigger("click");
							  }
						  }));
					}))
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
                			probody_html += "审计记录："+ (response.data.report.problems.hasProblems[i].auditRecord ? response.data.report.problems.hasProblems[i].auditRecord : "") +"</td>";
                			probody_html += "<td>" + (response.data.report.problems.hasProblems[i].improveUnit ? response.data.report.problems.hasProblems[i].improveUnit.name : "")+"</td>";
                			probody_html += "<td>"+(response.data.report.problems.hasProblems[i].auditResult ? response.data.report.problems.hasProblems[i].auditResult : "")+"</td>";
                			probody_html += "<td>"+(response.data.report.problems.hasProblems[i].improveLastDate ? response.data.report.problems.hasProblems[i].improveLastDate : "")+"</td>";
                			probody_html += "</tr>";
                		}
            		}else{
            			$(".no_thead").hide();
            		}
            		this.qid("pro_tbody").html(probody_html);
            		//审计没有问题的
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
                			tbody_html += "审计记录："+ (response.data.report.problems.noProblems[i].auditRecord ? response.data.report.problems.noProblems[i].auditRecord :"") +"</td>";
                			tbody_html += "<td>" + (response.data.report.problems.noProblems[i].improveUnit ? response.data.report.problems.noProblems[i].improveUnit.name :"")+"</td>";
                			tbody_html += "<td>"+(response.data.report.problems.noProblems[i].auditResult ? response.data.report.problems.noProblems[i].auditResult :"") +"</td>";
                			tbody_html += "<td>"+(response.data.report.problems.noProblems[i].improveLastDate ? response.data.report.problems.noProblems[i].improveLastDate :"") +"</td>";
                			tbody_html += "</tr>";
                		}
            		}else{
            			$(".ok_thead").hide();
            		}
            		this.qid("nopro_tbody").html(tbody_html);
            		
            		//控制按钮等操作
            		this.qid("top_buttons").html("");
            		if(response.data.actions != ""){
            			var btn_html = "";
            			btn_html += "<button type='button' class='btn btn-default btn-sm info_save notfirst_show'>保存</button>";
            			for(i in response.data.actions){
        					btn_html += "<button type='button' class='btn btn-default btn-sm workflow' name='";
            				btn_html += response.data.actions[i].wipId + "'>";
            				btn_html += response.data.actions[i].name + "</button>";
            			}
            			this.qid("top_buttons").html(btn_html);
            		}
            		if(response.data.logArea && response.data.logArea.key){ 
            			var shenjibaogao_id = this.curr_data.data.report.task.id;
                		var flowid = this.curr_data.data.report.task.flowId;
            			var zhenggaidan_id = this.zhenggaidan_id;
                        var clz = $.u.load(response.data.logArea.key);
                        this.qid("left-column").html("");
                        var target = $("<div/>").attr("umid", "logs").appendTo(this.leftColumns);
                        new clz( target, $.extend(true, response.data.logArea, {
                        	businessUrl: this.getabsurl("Xitong_jihua_shengchengshenjibaogao.html?id=#{source}"),                    
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
                                
                            }else if(v === "jielun_zhankai"){
                            	$(".jielun_zhankai").trigger("click");
                            	
                            }else if(v === "hasProblem"){
                            	$(".problem_zhankai").trigger("click");
                            	
                            }else if(v === "noProblem"){
                            	$(".noproblem_zhankai").trigger("click");
                            	
                            }else if(v === "logs"){
                                this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                            }
                        }));
                    }
            		
            		var newstr="contact";
            		if(response.data.workflowNodeAttributes.required){
        	    		var rules=[], messages=[];
        	    		var requiredArray=response.data.workflowNodeAttributes.required.split(",");
        	    		$.each(requiredArray.concat(newstr.split(",")),this.proxy(function(idx,item){
        	                var $lable = $("[data-field="+item+"]",this.form); 
        	                rules[item] = { required: true };
        	                messages[item] = { required: "该项不能为空" };
        	                if($lable.find("span.text-danger").length < 1){
        	                    $("<span class='text-danger'>*</span>").appendTo($lable);
        	                }
        	        	}))
        	        	 this.form.validate({
        	                 rules: rules,
        	                 messages: messages,
        	                 errorClass: "text-danger text-validate-element",
        	                 errorElement:"div"
        	             });
        	    	}
        		}else{
        			$.u.alert.error(response.reason);
        		}
        	}))
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
    			this.get_data();
    		}
    	}))
    },
	getParm:function(){
		return {
			  "contact":this.contact.val(),
			  "reportRemark":this.remark.val()
			  }
	},
    info_save:function(){
    	/*var info_mobilphone = this.qid("info_mobilphone").val();
    	var info_remark = this.qid("info_remark").val();
    	var info_auditstyle = this.qid("info_auditstyle").val();
    	var obj = {contact:info_mobilphone,reportRemark:info_remark,method:info_auditstyle};
    	if($.trim(info_mobilphone) == ""){
    		$.u.alert.error("经办人联系方式不能为空");
			this.qid("info_mobilphone").focus();
			return;
    	}*/
    	if(!this.form.valid()){
			return 
		}
    	var obj=this.getParm();
    	
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
            }
    	}).done(this.proxy(function(response) {
    		if(response.success){
    			$.u.alert.success("保存成功");
    			this.get_data();
    		}else{
    			$.u.alert.error(data.reason+"!保存失败");
    		}
    	}))
    },
    info_edit:function(){
    	this.qid("info_mobilphone").removeAttr("disabled");
		this.qid("info_remark").removeAttr("disabled");
		this.qid("info_auditstyle").removeAttr("disabled");
		this.qid("info_edit").addClass("disnone");
		this.qid("info_save").removeClass("disnone");
    },
    
    _pdfData : function(e){
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', $.u.config.constant.smsqueryserver+"?method=exportAuditReportToPdf&tokenid="+$.cookie("tokenid")+"&id="+this._options.id);
        form.appendTo('body').submit().remove();
    },
    
    //提交，走工作流
    nextflow_step:function(e){
    	var cur_name = $(e.currentTarget).attr("name");
		var wipid = parseInt(cur_name);
		if(!this.form.valid()){
			return 
		}
    	var obj=this.getParm();
    	var clz = $.u.load("com.audit.comm_file.confirm");
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
                              }
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
                      	                "id" : this._options.id    //planid
                      	            }
                      	    	},confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                      	    		if(response.success){
                      	    			$.u.alert.success("操作完成");
                      	    			window.location.href = "../xitong_jihua/Xitong_jihua_shangchuanshenjibaogao.html?id="+this._options.id;
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
    	 });
    	
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
		var targetid = $e.attr("name").split(",")[0];
		var dataid = $e.attr("name").split(",")[1];
		var remove=["termResponsibilityUnit"];
        if(dataid && targetid){
            if(!this.recordDiForm){
                $.u.load('com.audit.worklist.dialog');
            }
            this.recordDiForm = new com.audit.worklist.dialog($("div[umid='recordDiForm']",this.$), {"editable":isedit,"remove":remove});
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
    	var shenjibaogao_id = this.curr_data.data.report.task.id;
		var flowid = this.curr_data.data.report.task.flowId;
    	this._destroyModule();
    	if(config){
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
    
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });