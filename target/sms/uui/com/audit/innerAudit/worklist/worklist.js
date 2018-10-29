//@ sourceURL=com.audit.innerAudit.worklist.worklist
$.u.define('com.audit.innerAudit.worklist.worklist', null, {
    init: function (options) {
    	this._SELECT2_PAGE_LENGTH = 10;
    	this.planTimePro="";
    	this.planTimeA="";
    	this.temp = "<div class='col-md-6 col-lg-6 professionWidget' style='margin-top: 5px;'>"+
						"<div class='col-sm-4 col-md-4 col-lg-4'><input type='checkbox' data-iid='#{id}' style='margin-right: 2px;'><span class='professionName'>#{labelName}</span></div>"+
						"<div class='col-sm-8 col-md-8 col-lg-8 no-left-right-padding'>"+
						"<input type='text' class='form-control input-sm professionUserSelect2' data-id='#{id}'/>"+
						"</div>"+
					"</div>";
    	
	    this.uploadtemp =	'<div class="panel panel-sms">'
					+'<div class="panel-heading">'
					+'<h2 class="panel-title">'
					+'<span class="fa fa-minus uui-cursor-pointer toggle-panel" style="padding-right: 5px;"></span>上传附件'
					+'</h2>'
		       +'</div>'
		      +'<div class="panel-body">' 
				    +'<div class="col-sm-10" style="margin-top:15px;">'
				     + '<input type="file" name="file_upload" qid="file_upload" id="uplooood" />'
				   + '</div>'
				   +'<div >'
						   +'<table name="FilesList" class="table table-condensed hidden">'
					      	+'<thead><tr>'
					      			+'<th style="width: 60%;">文件名</th>'
					      			+'<th>文件大小</th>'
					      			+'<th style="width: 15%;">上传人</th>'
					      			+'<th style="width: 15%;">操作</th>'
					      	+'</tr></thead>'
					      +'<tbody></tbody>'	
					      +'</table>'
				   +'</div>'
				 +'</div>'
			+'</div>';
        this._requiredProfessions = false;
	    $.validator.addMethod( "compareDate", function( value, element, params ){
            var $compare = $(params), compareValue = $.trim($compare.val());
            if(value){
                value = new Date(value);
                if(compareValue){
                    compareValue = new Date(compareValue);
                    if(value - compareValue >= 0){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }, "结束日期小于开始日期");
	    
	    $.validator.addMethod( "comparePlanDate", function( value, element, params ){
            if(value){//planTimePro
            	var now=new Date()
            	now= now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate();
            	var	planTime=planTimePro || $(element).attr("planTime")|| now;
            	value=value.split("-")[1]-0;
            	planTime=planTime.split("-")[1]-0;
            	if(value==planTime){
            		return true
            	}else
            		return false
            }else{
                return true;
            }
        }, "日期必须晚于今天");
	    this.formatDate=function(perm){
        	if(!perm){
        		var now=new Date()
        		return now.getFullYear+"-"+now.getMonth()+"-"+now.getDate();
        	}
        	var year=perm.substring(0,4);
    		var month=perm.substring(4,6);
    		var day=perm.slice(6,8)||"01";
    		return year+"-"+month+"-"+day;
        }
	    /**
	     * @datepicker
	     */
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
    },
    afterrender: function (bodystr) {
    	var planTimePro="";
    	this.curr_data;
    	this.curr_btn;
        this._wkid = $.urlParam().id;
 	 	this._type = $.urlParam().type||"";
    	if(!this._wkid){
    		window.location.href = "../xitong_jihua/Xitong_jihua_gongzuodan.html";
    	}
    
        this._wkid = parseInt(this._wkid);
    	this.content = this.qid("content");
    	this.professionContainer = this.qid("professionContainer");
    	this.form = this.qid("form");
        this.baoCun = this.qid("baoCun");
        this.xiaFa = this.qid("xiaFa");
        this.btn_report = this.qid("btn_report");
        this.xiaFa.off("click").on("click",this.proxy(this._xiafa));
    	this.baoCun.off("click").on("click",this.proxy(this._save));
    	this.btn_report.off("click").on("click",this.proxy(this._report));
        this.professionContainer.off("click", "input:checkbox").on("click", "input:checkbox", this.proxy(this._check));

    	this.loadProfessions();
    	this._type=="erjineishen"?$("[name=anquan]").text("二级内审"):$("[name=anquan]").text("内部安全审核");
    	
    },
    
  
    
    _check : function(e){
    	var $e = $(e.currentTarget), id = $e.attr("data-iid");
    	var $check = this.professionContainer.find("input:checkbox:checked"),$dataField = $('td[data-field=startEndDate]');
		var length = $check.length, $startDate = $('input[qid=startDate]'),$endDate = $('input[qid=endDate]');
    	if($e.prop("checked")){
    		$('input[data-id='+id+']').select2("enable", true);
    		if(length === 1){
                if($dataField.find("span.text-danger").length < 1){
                    $("<span class='text-danger'>*</span>").appendTo($dataField);
                }    			
        		$startDate.rules("add", { required: true, messages: { required: "审计日期不能为空"} });
        		$endDate.rules("add", { required: true,compareDate:"#" + this._id + "-startDate", messages: { required: "审计日期不能为空"} });
    		}
    	}
        else{
        	 if(length === 0){
        		$dataField.find('span').remove();
     			$startDate.rules("remove");
     			$endDate.rules("remove");
     		}
    		var value = $('input[data-id=' + id + ']').select2("data");
    		var memberV = this.member.select2("val");
            var $label = $e.siblings(".professionName");
            if($label.is("a")){
                $label.replaceWith($("<span/>").text($label.text()));
            }
    		$.each(value || [], this.proxy(function(k, v){
                if(v && v.fullname){
        			var index = memberV.indexOf(v.fullname);
        			if(index > -1){
        				memberV.splice(index, 1);
        			}
                }
    		}));
    		this.member.select2("val", memberV);
        	$('input[data-id=' + id + ']').select2("val", "").select2("enable", false);
    	}
    },
    loadProfessions : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true, 
			{
				"method" : "stdcomponent.getbysearch",
				"dataobject" : "dictionary",
				"rule": JSON.stringify([[{"key":"type","value":"系统分类"}]]),
                "columns": JSON.stringify([{"data": "lastUpdate"}]),
                "order": JSON.stringify([{"column": 0, "dir": "desc"}])
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				if(response.success){
					this._drawProfession(response.data.aaData);
				}
			})
		);
    },
    _drawProfession : function(data){
    	data && $.each(data, this.proxy(function(key, item){
    		var temp = this.temp.replace(/#\{id\}/g, item.id)
    							.replace(/#\{iid\}/g, item.id)
    							.replace(/#\{labelName\}/g, item.name);
    		$(temp).appendTo(this.professionContainer);
    	}));
    	this._initColumn();
    	this._initProfessionUserSelect();
    },
    _initColumn : function(){
    	this.workName = this.qid("workName");
    	this.workNo = this.qid("workNo");
    	this.target = this.qid("target");
    	this.address = this.qid("address");
    	this.startDate = this.qid("startDate");
    	this.endDate = this.qid("endDate");
    	this.method = this.qid("method");
    	this.teamLeader = this.qid("teamLeader");
    	this.standard = this.qid("standard");
    	this.managers = this.qid("managers");
    	this.remark = this.qid("remark");
    	this.member = this.qid("member");
    	this.startDate.add(this.endDate).datepicker({
    		dateFormat:"yy-mm-dd"
    	});
    	this.method.select2({
    		multiple: true,
			data: [{id:'文件审核',text:'文件审核'},{id:'现场检查',text:'现场检查'},{id:'随机提问',text:'随机提问'},{id:'跟班检查',text:'跟班检查'}]
		});
    	this.managers.select2({
    		placeholder: "请选择...",
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getTaskManager",
                        "dataobjectid": this._wkid,
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data,
                            "more": response.data.length > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name+"("+item.username+")";
            },
            formatResult: function(item){
                return item.name+"("+item.username+")";
            }
    	});
    	this.member.select2({tags:[]}).on("select2-removing", this.proxy(function(e) {
    		$('input.professionUserSelect2').each(this.proxy(function(k,v){
    			var value = $(v).select2("val");
    			var data = [];
    			if(value.length){
    				var index = value.indexOf(e.val);
    				if(index > -1){
    					value.splice(index,1);
    					value && $.each(value, this.proxy(function(key,item){
    						data.push({"fullname":item});
    					}));
    					$(v).select2("data",data);
    				}
    			}
    		}));
        }));
    	this._loadTask();
    },
    _initProfessionUserSelect : function(){
    	$('input.professionUserSelect2').each(this.proxy(function(k,v){
    		var id = parseInt($(v).attr("data-id"));
    		$(v).select2({
        		placeholder: "请选择...",
        	    allowClear: true,
        	    multiple : true,
                ajax: {
                    url: $.u.config.constant.smsqueryserver,
                    type: "post",
                    data: this.proxy(function(term, page){
                        return {
                            "tokenid": $.cookie("tokenid"),
                            "method": "getGradeOneAuditors",
                            "term": term,
                            "professionId": id,
                            "taskId": this._wkid,
                            "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
                            "length": this._SELECT2_PAGE_LENGTH
                        };
                    }),
                    results: this.proxy(function(response, page){
                        if(response.success){
                            return {
                                "results": response.data.aaData,
                                "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                            };
                        }
                    })
                },
                formatSelection: function(item){
                    return item.fullname+"("+item.username+")";
                },
                formatResult: function(item){
                    return item.fullname+"("+item.username+")";
                }
        	}).on("select2-selecting", this.proxy(function(e) {
        		var value = this.member.select2("val");
        		value.push(e.object.fullname+"("+e.object.username+")");
        		this.member.select2("val",value);
        	}))
            .on("select2-removing", this.proxy(function(e) {
            	var value = this.member.select2("val"),
        		index = value.indexOf(e.choice.fullname),
        		data = false; 
        	if(index > -1){
        		$('input.professionUserSelect2').each(function(k,v){
        			if($(v).attr("data-id")!=$(e.currentTarget).attr("data-id")){
        				$.each($(v).select2("data"),function(idx,item){
        					if(item.fullname === e.choice.fullname){
        						data = true;
        						return false;
        					}
        				});
        			}
        			if(data){
        				return false;
        			}
        		})
        		if(!data){
        			value.splice(index,1);
            		this.member.select2("val",value);
        		}
        	}
            }));
            $(v).select2("enable", false);
    	}));
    },
    _loadTask : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true, 
			{
				"method" : "stdcomponent.getbyid",
				"dataobject" : "task",
				"dataobjectid" : this._wkid
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				if(response.success){
					this._fillFormData(response.data);
				}
			})
		);
    },
    _fillFormData : function(data){
    	if(data){
    		this.content.removeClass("hidden");
    		if(data.flowStatus != "wanCheng"){
    	    	this.btn_report.remove();
    	    }
            this.unitid = parseInt(data.target.targetId);
            this.startDate.add(this.endDate).datepicker('option', 'minDate',this.formatDate(data.planTime));  
            if(data.auditScope){
            	$.each(data.auditScope, this.proxy(function(key,item){
            		var $checkbox = $('input[data-iid=' + item.porfessionId + ']');
            		var $member = $('input[data-id=' + item.porfessionId + ']');
            		var $a = $("<a/>").addClass("professionName").text(item.professionName);
                    var data = [];
            		var memberData = [];
                    $checkbox.prop("checked",true);
            		$.each(item.users || [], this.proxy(function(k,v){
            			data.push(v);
            			memberData.push(v.fullname);
            		}));
            		$member.select2("data",data);
                    if(item.checkId){
                        $a.attr("href", this.getabsurl("viewchecklist.html?id=" + item.checkId+"&type="+this._type));
                        $checkbox.siblings(".professionName").replaceWith($a);
                        if(item.checkWorkFlow && item.checkWorkFlow.workflowNodeAttributes && item.checkWorkFlow.workflowNodeAttributes.flowStatus === "wanCheng"){
                            $a.addClass("text-success");
                            $member.attr("flowstatus", "wanCheng");
                        }
                    }
            	}));
            }
            if(data.logArea && data.logArea.key){ 
                var clz = $.u.load(data.logArea.key);
                var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("logsContainer"));
                new clz( target, $.extend(true, data.logArea, {
                	businessUrl: this.getabsurl("viewworklist.html?id=#{source}"),
                    logRule: [[{"key":"source","value": this._wkid}],[{"key":"sourceType","value":"task"}]],
                    remarkRule: [[{"key":"source","value": this._wkid}],[{"key":"sourceType","value":"task"}]],
                    remarkObj: {
                        source: this._wkid,
                        sourceType: "task"
                    },
                    addable: true,
                    flowid: data.flowId 
                }) );
            }

        	this._disabledAll();
        	this._fill(data);

            if(data.workflowNodeAttributes && $.isArray(data.actions) && data.actions.length > 0){
                if(data.workflowNodeAttributes.canDo){
                	$.each(data.workflowNodeAttributes.canDo.split(","), this.proxy(function(k,v){
                        this.canDo(v);
                    }));
                }
                if(data.workflowNodeAttributes.canModify){                  
                    $.each(data.workflowNodeAttributes.canModify.split(","), this.proxy(function(k,v){
                        this.canModify(v);
                    }));
                }

                if(data.workflowNodeAttributes.hiddenModel){
                    $.each(data.workflowNodeAttributes.hiddenModel.split(","), this.proxy(function(k,v){
                        if(v === "baseInfo"){
                            this.qid("toggle-baseinfo-panel").trigger("click");
                        }
                        else if(v === "logs"){
                            this.$.find("div[umid=logs]").find("[qid=toggle-panel]").trigger("click");
                        }
                        else if(v === "shenJiFanWei"){
                            this.qid("toggle-checkarea-panel").trigger("click");
                        }
                    }));
                }
                if(data.workflowNodeAttributes.required && data.workflowNodeAttributes.required.indexOf("startDate"||"endDate") == -1){
                  	 var exrules = {}, exmessages ={},ignore={};
                       var ISOdate=["startDate","endDate"];//var ISOdate = new Array();
                       $.each(data.workflowNodeAttributes.required.split(","), this.proxy(function(k,val){
                      	 ISOdate.push(val);
                       }))
                       $("[name=startDate]").attr("plantime", this.formatDate(data.planTime));
                       planTimePro= this.formatDate(data.planTime)
                       $.each(ISOdate,this.proxy(function(idx,v){
                           if(v === "aCheck"){
                               this._requiredProfessions = true;
                           }else if(v === "startDate" || v === "endDate"){
                          	     exrules[v] = {
                                       date: true,
                                       dateISO: true
                                   };
                          	        ignore: ".ignore"; 
                                   exmessages[v] = {
                                       date: "无效日期",
                                       dateISO: "无效日期"
                                   };
                                   if(v === "startDate"){
                                   	exrules[v]["comparePlanDate"] = "#" + this._id + "-startDate";//data.planTime
   	                            	exmessages[v]["comparePlanDate"] = "开始日期必须在计划日期的当前月";
                                   }
     	                            if(v === "endDate"){
     	                              exrules[v]["compareDate"] = "#" + this._id + "-startDate";
     	                              exmessages[v]["compareDate"] = "结束日期不得早于开始日期";
     	                            }
                           }else if(this[v]){                        
                               var $label = $("[data-field=" + v + "]"); 
                               exrules[v] = { required: true };
                               exmessages[v] = { required: "该项不能为空" };
                               if($label.children("span.text-danger").length < 1){
                                   $("<span class='text-danger'>&nbsp;&nbsp;*</span>").appendTo($label);
                               }
                           }
                       }));
                       this.form.validate({
                           rules: exrules,
                           messages: exmessages,
                           ignore:ignore,
                           errorClass: "text-danger text-validate-element",
                           errorElement:"div"
                       });
                  }
                if(data.workflowNodeAttributes.required){
                    var rules = {}, messages ={};
                    $("[name=startDate]").attr("plantime", this.formatDate(data.planTime));
                    planTimePro= this.formatDate(data.planTime)
                    $.each(data.workflowNodeAttributes.required.split(","), this.proxy(function(k,v){
                        if(v === "aCheck"){
                            this._requiredProfessions = true;
                        }
                        else if(this[v]){                        
                            var $label = $("[data-field=" + v + "]"); 
                            rules[v] = { required: true };
                            messages[v] = { required: "该项不能为空" };
                            if(v === "startDate" || v === "endDate"){
                                rules[v] = {
                                    required: true,
                                    date: true,
                                    dateISO: true
                                };
                                messages[v] = {
                                    required: "该项不能为空",
                                    date: "无效日期",
                                    dateISO: "无效日期"
                                }
                                if(v === "startDate"){
                                	rules[v]["comparePlanDate"] = "#" + this._id + "-startDate";//data.planTime
                                	messages[v]["comparePlanDate"] = "开始日期必须在计划日期的当前月";
                                }
                                if(v === "endDate"){
                                    rules[v]["compareDate"] = "#" + this._id + "-startDate";
                                    messages[v]["compareDate"] = "结束日期不得小于开始日期";
                                }
                                $label = $("[data-field=startEndDate]");
                            }
                            if($label.children("span.text-danger").length < 1){
                                $("<span class='text-danger'>&nbsp;&nbsp;*</span>").appendTo($label);
                            }
                        }
                    }));
                    this.form.validate({
                        rules: rules,
                        messages: messages,
                        errorClass: "text-danger text-validate-element",
                        errorElement:"div"
                    });
                }
              }
            
            $("div[name=upload]").append(this.uploadtemp);
            this.initUpLoad("上传",18);
            this.appendToTbody(data.taskPreAuditReport||[]);
            this._fillBtn(data.actions);
            if(parseInt(data.workflowNodeAttributes.flowStep) >= 3){ //生成审计报告之后 不能再下发工作单
           	 this.xiaFa.parent().addClass("hidden");
           }
        	this.$.find(".toggle-panel").closest("div.panel-heading").click(this.proxy(this.on_togglePanel_click));

    	}
        else{
    		this.content.addClass("hidden");
    		$.u.alert.error("没有数据");
    	}
    },
    _fill : function(data){
    	this.workName.val(data.workName);
    	this.workNo.val(data.workNo);
    	this.target.val(data.target.targetName);
    	this.address.val(data.address);
    	this.startDate.val(data.startDate);
    	this.endDate.val(data.endDate);
    	var v = data.method && data.method.split(",");
    	var d = [];
    	v && $.each(v,function(k,t){
    		d.push({id:t,text:t});
    	});
    	this.method.select2("data",d);
    	this.teamLeader.val(data.teamLeader);
    	this.standard.val(data.standard);
    	this.managers.select2("data",(data.managers ? data.managers[0] : ''));
    	if(data.member){
			var member = data.member.split(",");
		    this.member.select2("val",member);
    	}
    	this.remark.val(data.remark);
    },
    _disabledAll : function(){
    	this.workName.add(this.workNo).add(this.target).add(this.address).add(this.startDate).add(this.endDate)
    		.add(this.standard).add(this.teamLeader).add(this.remark).attr("disabled","disabled");
    	this.member.select2("enable", false);
    	this.managers.select2("enable", false);
    	this.method.select2("enable", false);
    	this.qid("professionContainer").find('input:checkbox').attr("disabled","disabled");
    },
    _validProfession: function(){
        var valid = false; 
        if(this._requiredProfessions === true){
            this.qid("professionContainer").find(":checkbox:checked").each(this.proxy(function(idx, checkbox){
                if($(checkbox).closest(".professionWidget").find("input.professionUserSelect2").select2("data").length > 0){
                    valid = true;
                }
            }));
            if(valid === false){
                $.u.alert.error("审计范围不能为空", 1000 * 3);
            }
        }
        else{
            valid = true;
        }
        return valid;
    },
    canModify : function(data){
    	switch(data){
	    	case "workName":
	    		this.workName.removeAttr("disabled");
	    		break;
	    	case "workNo":
	    		this.workNo.removeAttr("disabled");
	    		break;
	    	case "target":
	    		this.target.removeAttr("disabled");
	    		break;
	    	case "address":
	    		this.address.removeAttr("disabled");
	    		break;
	    	case "startDate":
	    		this.startDate.removeAttr("disabled");
	    		break;
	    	case "endDate":
	    		this.endDate.removeAttr("disabled");
	    		break;
	    	case "method":
	    		this.method.select2("enable", true);
	    		break;
	    	case "teamLeader":
	    		this.teamLeader.removeAttr("disabled");
	    		break;
	    	case "standard":
	    		this.standard.removeAttr("disabled");
	    		break;
	    	case "managers":
	    		this.managers.select2("enable", true);
	    		break;
	    	case "member":
	    		this.member.select2("enable", true);
	    		break;
	    	case "remark":
	    		this.remark.removeAttr("disabled");
	    		break;
	    	case "aCheck":
	    		this.qid("professionContainer").find('input:checkbox').removeAttr("disabled").each(this.proxy(function(idx, checkbox){
                    var $checkbox = $(checkbox), $input = $checkbox.closest(".professionWidget").find('input.professionUserSelect2');
                    if($input.attr("flowstatus") === "wanCheng"){
                        $input.select2("enable",false);
                        $checkbox.attr("disabled", "disabled");
                    }
                    else{
                        $input.select2("enable",$checkbox.is(":checked"));
                    }
                }));
	    		break;
    	}
    },
    canDo : function(data){
    	switch(data){
    		case "baoCun":
    			$('button[qid='+data+']').removeClass("hidden");
    			break;
    		case "xiaFa":
    			$('button[qid='+data+']').removeClass("hidden");
    			break;	
    	}
    },
    _fillBtn : function(data){
    	 $.each(data || [],this.proxy(function(k,v){
        	 if(data[k].attributes.checkStatus == "3" || data[k].attributes.checkStatus == "2"){
        		 this.baoCun.after('<button class="btn btn-default btn-sm workflow" name="'+data[k].attributes.checkStatus+ '" wipId="'+v.wipId+'">'+v.name+'</button>'); 
        	 }else{
        		 this.baoCun.after('<button class="btn btn-default btn-sm workflow" wipId="'+v.wipId+'">'+v.name+'</button>');
        	 }
          }));
          $('.workflow').off("click").on("click",this.proxy(this._workflow));
    },
    _workflow : function(e){
    	this.curr_btn  = $(e.currentTarget).attr("name");
        e.preventDefault();
        var data = this._getParam();

        if( this.curr_btn == "2"){//点击下一步，得到生成审计报告时间
    	   data.generateReportDate = true;
    	   var id = $(e.currentTarget).attr("wipId");
           if(this.form.valid() && this._validProfession()){
               var clz = $.u.load("com.sms.common.confirm");
               var confirm = new clz({
                   "body": "确认操作？",
                   "buttons": {
                       "ok": {
                           "click": this.proxy(function(){
                               this._ajax(
                                   $.u.config.constant.smsmodifyserver, 
                                   true, 
                                   {
                                       "method" : "updateTask",
                                       "dataobjectid" : this._wkid,
                                       "obj" : JSON.stringify(data)
                                   }, 
                                   confirm.confirmDialog.parent(), 
                                   {},
                                   this.proxy(function(response) {
                                       if(response.success){   
                                           this._ajax(
                                               $.u.config.constant.smsmodifyserver, 
                                               true, 
                                               {
                                                   "method": "operate",
                                                   "tokenid": $.cookie("tokenid"),
                                                   "action" : id,
                                                   "dataobject" : "task",
                                                   "id" : this._wkid,
                                               }, 
                                               confirm.confirmDialog.parent(), 
                                               {},
                                               this.proxy(function(response) {
                                                   if(response.success){            
                                                       confirm.confirmDialog.dialog("close");            
                                                       $.u.alert.success("操作成功");
                                                       if(this.curr_btn == "3"){
                                                       	window.location.href = "../xitong_jihua/AuditReport.html?id="+this._wkid+"&type="+this._type;
                                                       }else{
                                                       	window.location.reload();
                                                       }
                                                   }
                                               })
                                           );
                                      }else{
                                       	 confirm.confirmDialog.dialog("close");       
                                       }
                                       	 
                                   })
                               );
                           })
                       }
                   }
               });
       	}
        }else{
            var id = $(e.currentTarget).attr("wipId");
            if(this.form.valid() && this._validProfession()){
                var clz = $.u.load("com.sms.common.confirm");
                var confirm = new clz({
                    "body": "确认操作？",
                    "buttons": {
                        "ok": {
                            "click": this.proxy(function(){
                                            this._ajax(
                                                $.u.config.constant.smsmodifyserver, 
                                                true, 
                                                {
                                                    "method": "operate",
                                                    "tokenid": $.cookie("tokenid"),
                                                    "action" : id,
                                                    "dataobject" : "task",
                                                    "id" : this._wkid,
                                                }, 
                                                confirm.confirmDialog.parent(), 
                                                {},
                                                this.proxy(function(response) {
                                                    if(response.success){            
                                                        confirm.confirmDialog.dialog("close");            
                                                        $.u.alert.success("操作成功");
                                                        if(this.curr_btn == "3"){
                                                        	window.location.href = "../xitong_jihua/AuditReport.html?id="+this._wkid+"&type="+this._type;
                                                        }else{
                                                        	window.location.reload();
                                                        }
                                                    }
                                                })
                                            );
                            })
                        }
                    }
                });
        		
        	}
        }
        this.$.find(".select2-container:hidden").show();
    },
    
    _xiafa:function(e){
    	//
        e.preventDefault();
        var data = this._getParam();
        var $e = $(e.currentTarget);
        var id = $e.attr("wipId");
        if(this.form.valid() && this._validProfession()){
            var clz = $.u.load("com.sms.common.confirm");
            var confirm = new clz({
                "body": "确认操作？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                            this._ajax(
                                $.u.config.constant.smsmodifyserver, 
                                true, 
                                {
                                    "method" : "updateTask",
                                    "dataobjectid" : this._wkid,
                                    "isInstance":"instance",
                                    "obj" : JSON.stringify(data)
                                }, 
                                confirm.confirmDialog.parent(), 
                                {},
                                this.proxy(function(response) {
                                    if(response.success){            
                                      confirm.confirmDialog.dialog("close");            
                                      $.u.alert.success("下发成功");
                                      window.location.reload();
                                    }
                                })
                            );
                        })
                    }
                }
            });
    		
    	}
    
    },
    
    
    
    _save : function(e){
    	e.preventDefault();
    	var getParam = this._getParam();
 
    	if(this.form.valid() && this._validProfession()){
    		this._ajax(
				$.u.config.constant.smsmodifyserver, 
				true, 
				{
					"method" : "updateTask",
					"dataobjectid" : this._wkid,
					"obj" : JSON.stringify(getParam)
				}, 
				this.$, 
				{},
				this.proxy(function(response) {
					if(response.success){
						$.u.alert.success("保存成功");
                        window.location.reload();
					}
				})
			);
    	}        
        this.$.find(".select2-container:hidden").show();
    },
    _report : function(e){
    	e.preventDefault();
    	if(this.form.valid() && this._validProfession()){
    	
    	}        
        this.$.find(".select2-container:hidden").show();
    },
    _getParam : function(){
    	return {
            workName: this.workName.val(),
            workNo: this.workNo.val(),
            target: this.target.val(),
            address: this.address.val(),
            startDate: this.startDate.val(),
            endDate: this.endDate.val(),
            method: this.method.val(),
            teamLeader: this.teamLeader.val(),
            standard: this.standard.val(),
            managers: [parseInt(this.managers.select2("val"))],
            remark: this.remark.val(),
            member: this.member.val(),
            auditScope: this._getCheck()
        };
    },
    _getCheck : function(){
      var data = [];
      this.qid("professionContainer").find(':checkbox').each(this.proxy(function(key, item){
          var $e = $(item);
          var id = $e.attr("data-iid");
          var check = $e.prop("checked");
          var $input = $('input[data-id='+id+']');
          var member = $input.select2("val").toString();
          data.push({
              "professionId" : id,
              "checked" : check,
              "member" : member
          });
      }));
      return data;
    },
    on_togglePanel_click: function(e){
        var $this = $(e.currentTarget);
    	var $span=$this.find("span")
        if($span.hasClass("fa-minus")){
        	$span.removeClass("fa-minus").addClass("fa-plus");
        }
        else{
        	$span.removeClass("fa-plus").addClass("fa-minus");
        }
        $this.closest(".panel-heading").siblings(".panel-body").slideToggle(600);
    },
  
   

  //上传
	initUpLoad:function(text,sourceType){
		this.fileupload=$("input[name=file_upload]")
		this.fileupload.uploadify({
            'auto':true,
            'swf': this.getabsurl('../../../../uui/widget/uploadify/uploadify.swf'),
	        'uploader': $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+"&method=uploadFiles&sourceType="+sourceType+"&source="+this._wkid,
            //'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
            'fileTypeDesc':'doc',
            'fileTypeExts':'*.*',//可上传文件格式 *.doc;*.docx;*.rar;*.xls;*.ppt;*.ppt;*.pdf;*.jpg;*.bmp;*.png;*.xlsx;*.pptx;
            'removeCompleted': true,
            'buttonText': text,
            'cancelImg':this.getabsurl('../../../../uui/widget/uploadify/uploadify-cancel.png'),
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
                // if(queueData.uploadsErrored < 1){
                    
                // }else{
                //     $.u.alert.error(data.reason, 1000 * 3);
                // }
            }),
            "onSWFReady": this.proxy(function(){
               // this.qid("file_upload").uploadify("disable", this._options.editable === false)
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
                    	this.appendToTbody(data.data.aaData);
                    }
                    else{
                        $.u.alert.error(data.reason, 1000 * 3);
                    }
                }
            })
        });
    
	},
	//上传的文件
	appendToTbody:function(files){
    	this.FilesList=$("[name=FilesList]").removeClass("hidden");
        var $tbody = this.FilesList.children("tbody");
        var num= $tbody.find("tr").length;
        this.$.find(".uploadify-queue").addClass("hidden");
        if(!this.FilesList.is(":visible")){
        	this.FilesList.removeClass("hidden");
        }
        $.isArray(files) && files.length==0 && this.FilesList.addClass("hidden"); 
        $.each(files||[],this.proxy(function(idx,file){
        	var index=idx+num+1;
	        $("<tr>"+
                "<td>"+index+".<a href='#' style='margin-left: 20px;' class='download-file' fileid='"+file.id+"'>" + file.fileName + "</a></td>" +
	            "<td>" + file.size + "</td>" +
	            "<td>" + file.uploadUser + "</td>" +
				"<td><i class='fa fa-trash-o uui-cursor-pointer delete-file' style='padding-right: 10px;' fileid='"+file.id+"'/></td>" +
	          "</tr>").data("data", file).appendTo($tbody);
        }))
        
        $tbody.off("click", ".delete-file").on("click", ".delete-file", this.proxy(this.on_deleteFile_click));
        $tbody.off("click", ".download-file").on("click", ".download-file", this.proxy(this.on_downloadFile_click));
	},
	

	//下载附件
	 on_downloadFile_click: function(e){
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
                                        if($("table[name=FilesList]",this.form).children("tbody").children("tr").length< 1){
                                        	$("table[name=FilesList]",this.form).addClass("hidden");
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
    _ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
				callback(response);
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
}, { usehtm: true, usei18n: false });

com.audit.innerAudit.worklist.worklist.widgetjs = ["../../../../uui/widget/select2/js/select2.min.js",
                                        "../../../../uui/widget/spin/spin.js", 
                                        "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../../uui/widget/ajax/layoutajax.js",
                                        "../../../../uui/widget/uploadify/jquery.uploadify.js",];
com.audit.innerAudit.worklist.worklist.widgetcss = [{ path: "../../../../uui/widget/select2/css/select2.css" }, 
                                         { path: "../../../../uui/widget/select2/css/select2-bootstrap.css" },
                                         {path:"../../../../uui/widget/uploadify/uploadify.css"}];
