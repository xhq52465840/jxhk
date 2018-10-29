//@ sourceURL=com.audit.inspection.worklist
$.u.define('com.audit.inspection.worklist', null, {
    init: function (options) {
    	this._SELECT2_PAGE_LENGTH = 10;
    	this.temp = "<div class='col-md-6 col-lg-6 professionWidget' style='margin-top: 5px;'>"+
						"<label><input type='checkbox' data-iid='#{id}' style='margin-right: 2px;'><span class='professionName'>#{labelName}</span></label>" +
					"</div>";
        this._requiredProfessions = false;
        $.validator.addMethod( "compareDate", function( value, element, params ){
            var $compare = $(params), compareValue = $.trim($compare.val());
            if(value){
                value = new Date(value);
                if(compareValue){
                    compareValue = new Date(compareValue);
                    if(value - compareValue >= 0){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return true;
                }
            }
            else{
                return true;
            }
        }, "结束日期小于开始日期");
        $.validator.addMethod( "comparePlanDate", function( value, element, params ){
            if(value){//planTimePro
            	var now=new Date();
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
        }, "开始日期必须在计划日期的当前月");
        $.validator.addMethod( "comparePlanZhiDate", function( value, element, params ){
            if(value){
        		  var planTimeArray=planTimePro || $(element).attr("planTimeArray");
        	 	  planTimeArray=planTimeArray.split(",");
        	      value = new Date(value);
            	  var  compareValue = new Date(planTimeArray[1]);
            	  if(value - compareValue >= 0){
                      return true;
                  }
                  else{
                      return false;
                  }
            	 
            }else{
                return true;
            }
        }, "所选日期必须在截止日期以内");
	    this.formatDate=function(perm){
	    	if(perm.indexOf("-") == -1){
	    		if(!perm){
	        		var now=new Date()
	        		return now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate();
	        	}
	        	var year=perm.substring(0,4);
	    		var month=perm.substring(4,6);
	    		var day=perm.slice(6,8)||"01";
	    		return year+"-"+month+"-"+day;
	    	}else{
	    		return perm
	    	}
        	
        }
	    
    },
    afterrender: function (bodystr) {
    	this.curr_data;
    	this.curr_btn;
    	var planTimePro
        this._wkid = $.urlParam().id;
    	if(!this._wkid){
    		window.location.href = "viewSiteInspection.html";
    	}
        this._wkid = parseInt(this._wkid);
    	this.content = this.qid("content");
    	this.professionContainer = this.qid("professionContainer");
    	this.form = this.qid("form");
        this.baoCun = this.qid("baoCun");
    	this.baoCun.off("click").on("click",this.proxy(this._save));
        this.$.find(".toggle-panel").click(this.proxy(this.on_togglePanel_click));
    	this.loadProfessions();
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
    							.replace(/#\{labelName\}/g, item.name || '');
    		$(temp).appendTo(this.professionContainer);
    	}));
    	this._initColumn();
    },
    _initColumn : function(){
    	this.workName = $("[name=workName]");
    	this.workNo =$("[name=workNo]");
    	this.address = $("[name=address]");
    	this.startDate = $("[name=startDate]");
    	this.endDate = $("[name=endDate]");
    	this.method = $("[name=method]");
    	this.teamLeader =$("[name=teamLeader]");
    	this.standard = $("[name=standard]");
    	this.remark = $("[name=remark]");
    	this.member = $("[name=member]");
    	this.startDate.add(this.endDate).datepicker({
    		dateFormat:"yy-mm-dd"
    	});
    	this.method.select2({
    		multiple: true,
			data: [{id:'文件审核',text:'文件审核'},{id:'现场检查',text:'现场检查'},{id:'随机提问',text:'随机提问'},{id:'跟班检查',text:'跟班检查'}]
		});
    	this._loadTask();
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
					this.curr_data = response.data;
					this._fillFormData(response.data);
				}
			})
		);
    },
    _fillFormData : function(data){
    	if(data){
    		this.content.removeClass("hidden");
    		var planTime,planTimezhi,planTimeArray;
    		if(data.planTime.indexOf("至") > -1){
    			planTimezhi=data.planTime.split("至")[0];
    			planTimeArray=data.planTime.split("至");
    			this.startDate.datepicker('option', 'minDate',planTimeArray[0]).datepicker('option', 'maxDate',planTimeArray[1]);  
    			this.endDate.datepicker('option', 'minDate',planTimeArray[0]).datepicker('option', 'maxDate',planTimeArray[1]);  
    		}else{
    			planTime=this.formatDate(data.planTime);
    			this.startDate.add(this.endDate).datepicker('option', 'minDate',planTime);  
    		}
    		
    		
    		// 检查范围
        	data.auditScope && $.each(data.auditScope, this.proxy(function(key,item){
        		var $a = $("<a/>").addClass("professionName").text(item.professionName);
        		var $checkbox = $('input[data-iid=' + item.porfessionId + ']');
        		$checkbox.prop("checked",true);
                if(item.checkId){
                    $a.attr("href", this.getabsurl("viewchecklist.html?id=" + item.checkId)).attr("target","_blank");
                    $checkbox.next(".professionName").replaceWith($a);
                    if(item.checkWorkFlow && item.checkWorkFlow.workflowNodeAttributes && item.checkWorkFlow.workflowNodeAttributes.flowStatus === "wanCheng"){
                        $a.addClass("text-success");
                    }
                }
        	}));
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
                !data.workflowNodeAttributes.required && (data.workflowNodeAttributes.required = "");
                if(data.workflowNodeAttributes.required.indexOf("startDate"||"endDate") == -1){
               	 var exrules = {},
	               	 exmessages ={},
	               	 ISOdate=["startDate","endDate"];
                    $.each(data.workflowNodeAttributes.required.split(","), this.proxy(function(k,val){
                   	 ISOdate.push(val);
                    }))
                    if(planTime){
                    	 $("[name=startDate]").attr("plantime", planTime);
                         planTimePro = planTime;
                    }
                    $.each(ISOdate,this.proxy(function(idx,v){
                        if(v === "aCheck"){
                            this._requiredProfessions = true;
                        }else if(v === "startDate" || v === "endDate"){
                        		exrules[v] = {
                                    date: true,
                                    dateISO: true
                                };
                                exmessages[v] = {
                                    date: "无效日期",
                                    dateISO: "无效日期"
                                };
                              
                            	if(v === "startDate"){
                        		  if(planTimezhi && planTimeArray){
                        			  
                                   }else{
                                		exrules[v]["comparePlanDate"] = "#" + this._id + "-startDate";//data.planTime
       	                            	exmessages[v]["comparePlanDate"] = "开始日期必须在计划日期的当前月";
                                   }
                                }
                                
  	                            if(v === "endDate"){
  	                              exrules[v]["compareDate"] = "#" + this._id + "-startDate";
  	                              exmessages[v]["compareDate"] = "结束日期不得小于开始日期";
  	                            }
                        }else if(this[v]){                        
                            var $label = $("[data-field=" + v + "]"); 
                            exrules[v] = { required: true };
                            exmessages[v] = { required: "该项不能为空" };
                            if($label.children("span.text-danger").length < 1){
                                $("<span class='text-danger'>*</span>").appendTo($label);
                            }
                        }
                    }));
                    this.form.validate({
                        rules: exrules,
                        messages: exmessages,
                        errorClass: "text-danger text-validate-element",
                        errorElement:"div"
                    });
               }
                if(data.workflowNodeAttributes.required){
                    var rules = {}, messages ={};
                    if(planTime){
                    	  $("[name=startDate]").attr("plantime", planTime);
                          planTimePro= planTime;
                    }
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
                                	 if(planTimezhi && planTimeArray){
                           			  
                                     }else{
                                    	 rules[v]["comparePlanDate"] = "#" + this._id + "-startDate";//data.planTime
                                    	 messages[v]["comparePlanDate"] = "开始日期必须在计划日期的当前月";
                                     }
                                   }
                                if(v === "endDate"){
                                    rules[v]["compareDate"] = "#" + this._id + "-startDate";
                                    messages[v]["compareDate"] = "结束日期不得小于开始日期";
                                }
                                $label = $("[data-field=startEndDate]");
                            }
                            if($label.children("span.text-danger").length < 1){
                                $("<span class='text-danger'>*</span>").appendTo($label);
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
            if(data.flowStep && parseInt(data.flowStep) < 3 ){
            	 this._fillBtn(data.actions);
            }
    	}
        else{
    		this.content.addClass("hidden");
    		$.u.alert.error("没有数据");
    	}
    },
    _fill : function(data){
    	this.workName.val(data.workName);
    	this.workNo.val(data.workNo);
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
		this.member.val(data.member);
    	this.remark.val(data.remark);
    },
    _disabledAll : function(){
    	this.workName.add(this.workNo).add(this.address).add(this.startDate).add(this.endDate)
    		.add(this.standard).add(this.teamLeader).add(this.remark).add(this.member).attr("disabled","disabled");
    	this.method.select2("enable", false);
    },
    _validProfession: function(){
        var valid = false; 
        if(this._requiredProfessions === true){
        	var length = this.qid("professionContainer").find(":checkbox:checked").length;
        	length ? valid = true : $.u.alert.error("检查范围不能为空", 1000 * 3);
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
	    	case "member":
	    		this.member.removeAttr("disabled");
	    		break;
	    	case "remark":
	    		this.remark.removeAttr("disabled");
	    		break;
	    	case "aCheck":
	    		this.qid("professionContainer").find('input:checkbox').removeAttr("disabled");
	    		break;
    	}
    },
    canDo : function(data){
    	switch(data){
    		case "baoCun":
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
        var $e = $(e.currentTarget);
        var id = $e.attr("wipId");
        if(this.form.valid() && this._validProfession()){
        	data.generateReportDate = true;
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
                                                "id" : this._wkid
                                            }, 
                                            confirm.confirmDialog.parent(), 
                                            {},
                                            this.proxy(function(response) {
                                                if(response.success){            
                                                    confirm.confirmDialog.dialog("close");            
                                                    $.u.alert.success("操作成功");
                                                    if(this.curr_btn == "3"){
                                                    	window.location.href = "viewCheckReport.html?id="+this._wkid;
                                                    }else{
                                                    	window.location.reload();
                                                    }
                                                }
                                            })
                                        );
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
						//this._loadTask();
					}
				})
			);
    	}        
    },
    _getParam : function(){
    	return {
            workName: this.workName.val(),
            workNo: this.workNo.val(),
            address: this.address.val(),
            startDate: this.startDate.val(),
            endDate: this.endDate.val(),
            method: this.method.val(),
            teamLeader: this.teamLeader.val(),
            standard: this.standard.val(),
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
          data.push({
              "professionId" : id,
              "checked" : check
          });
      }));
      return data;
    },
    on_togglePanel_click: function(e){
        var $this = $(e.currentTarget);
        if($this.hasClass("fa-minus")){
            $this.removeClass("fa-minus").addClass("fa-plus");
        }
        else{
            $this.removeClass("fa-plus").addClass("fa-minus");
        }
        $this.closest(".panel-heading").next().slideToggle(600);
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
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	}
}, { usehtm: true, usei18n: false });

com.audit.inspection.worklist.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js"];
com.audit.inspection.worklist.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
