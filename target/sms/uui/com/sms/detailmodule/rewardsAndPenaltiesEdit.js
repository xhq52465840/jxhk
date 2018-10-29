//@ sourceURL=com.sms.detailmodule.rewardsAndPenaltiesEdit
$.u.define('com.sms.detailmodule.rewardsAndPenaltiesEdit', null, {
    init: function (option) {
    	this._options = option || {};
    	this.temp = "<tr itemid='#{itemid}'>"
					+	"<td class='edit'>#{name}</td>"
					+	"<td>#{rewardType}</td>"
					+	"<td>#{conclusion}</td>"
					+	"<td class='operate-tool'><span class='glyphicon glyphicon glyphicon-trash fl-minus del' style='cursor: pointer;'></span></td>"
					+"</tr>";
    },
    afterrender: function (bodystr) {
    	this.initHtml();
    },
    initHtml : function(){
    	this.form = this.qid("form");
    	this.createForm();
    	this.initSelect();
    	$("#commitReward").off("click").on("click",this.proxy(this.on_infoDialog_save));
    	$("#rewardType").off("change").on("change",this.proxy(this.on_rewardType_change));
    	$("#name").off("click").on("click",this.proxy(this.on_name_click));
    	$("#economyCheck").off("change").on("change",this.proxy(this.on_economyCheck_change));
    },
    on_infoDialog_save : function(index){
    	if(this.form.valid()){
    		var obj = this.getParam();
    		obj.activity = parseInt(this._options.activity);
    		this._ajax(
				$.u.config.constant.smsmodifyserver, 
				{
					"method" : "stdcomponent.add",
					"dataobject" : "rewards",
					"obj" : JSON.stringify(obj)
				}, 
				this.proxy(function(response) {
					if(response.success){
						this.infoDialog.dialog("close");
						this.showM(obj, response.data);
						$.u.alert.success("提交成功");
						if(index != undefined && index != null && index != ''){
							var index1 = parent.layer.getFrameIndex(window.name);
							parent.layer.close(index1);
						}
					}
				})
			);
    	}
    },
    on_rewardType_change:function(e){
    	var rewardTypeVal = $("#rewardType").val();
    	$("#rewardType1").val(rewardTypeVal)
    	$("#rewardType2").val(rewardTypeVal)
    },
    //选择飞行员姓名
    on_name_click:function(e){
    	var data = {
    			"method" : "queryFightInfo",
    			"dictType" : selectQueryKey,
    			"tokenid":$.cookie("tokenid")
    		};
        	var url = $.u.config.constant.smsqueryserver;
        	jQuery.ajax({
     		   type: "POST",
     		   url: url,
     		   data: data,
     		   global:false,
     		   success:function(response){
     			   if(response.success){
     				   var responseData = response.data;
     			   }
     		   }
     		});
    },
    on_economyCheck_change:function(e){
    	if($("#economyCheck").is(":checked")){
    		$("#economySource").removeAttr("disabled");
    	}else{
    		$("#economySource").attr("disabled","disabled");
    	}
    },
    initSelect:function(){
    	//处理类型,人员类别,所属系统,聘用标准,驾驶舱角色,安全考核扣分
    	var selectQueryKey = "rewardType,personnel,systemC,empStand,control,economy";
    	var data = {
			"method" : "queryRewardsDictNames",
			"dictType" : selectQueryKey,
			"tokenid":$.cookie("tokenid")
		};
    	var url = $.u.config.constant.smsqueryserver;
    	jQuery.ajax({
 		   type: "POST",
 		   url: url,
 		   data: data,
 		   global:false,
 		   success:function(response){
 			   if(response.success){
 				   var responseData = response.data;
 				   if(responseData != null && responseData != undefined && responseData != ''){
 					   //处理类型
 					   if(responseData["rewardType"] != undefined 
 							   && responseData["rewardType"] != null && responseData["rewardType"].length >0){
 						  $("#rewardType").append($("<option>",{text:"请选择",value:""}));
 						  $("#rewardType1").append($("<option>",{text:"请选择",value:""}));
 						  $("#rewardType2").append($("<option>",{text:"请选择",value:""}));
 						   for(var i=0;i<responseData["rewardType"].length;i++){
 							  $("#rewardType").append($("<option>",{"text":responseData["rewardType"][i].name,
 								  "value":responseData["rewardType"][i].value}));
 							  $("#rewardType1").append($("<option>",{text:responseData["rewardType"][i].name,
 								  value:responseData["rewardType"][i].value}));
 							  $("#rewardType2").append($("<option>",{text:responseData["rewardType"][i].name,
 								  value:responseData["rewardType"][i].value}));
 						   }
 					   }
 					   //人员类别
 					   if(responseData["personnel"] != undefined 
							   && responseData["personnel"] != null && responseData["personnel"].length >0){
						  $("#personnelCategory").append($("<option>",{text:"请选择",value:""}));
						   for(var i=0;i<responseData["personnel"].length;i++){
							  $("#personnelCategory").append($("<option>",{"text":responseData["personnel"][i].name,
								  "value":responseData["personnel"][i].value}));
						   }
					   }
 					   //所属系统
 					   if(responseData["systemC"] != undefined 
							   && responseData["systemC"] != null && responseData["systemC"].length >0){
						  $("#systemCategory").append($("<option>",{text:"请选择",value:""}));
						   for(var i=0;i<responseData["systemC"].length;i++){
							  $("#systemCategory").append($("<option>",{"text":responseData["systemC"][i].name,
								  "value":responseData["systemC"][i].value}));
						   }
					   }
 					   //聘用标准
 					   if(responseData["empStand"] != undefined 
							   && responseData["empStand"] != null && responseData["empStand"].length >0){
						  $("#empStandard").append($("<option>",{text:"请选择",value:""}));
						   for(var i=0;i<responseData["empStand"].length;i++){
							  $("#empStandard").append($("<option>",{"text":responseData["empStand"][i].name,
								  "value":responseData["empStand"][i].value}));
						   }
					   }
 					   //驾驶舱角色
 					   if(responseData["control"] != undefined 
							   && responseData["control"] != null && responseData["control"].length >0){
						  $("#cockpitRole").append($("<option>",{text:"请选择",value:""}));
						   for(var i=0;i<responseData["control"].length;i++){
							  $("#cockpitRole").append($("<option>",{"text":responseData["control"][i].name,
								  "value":responseData["control"][i].value}));
						   }
					   }
 					   //安全考核扣分
 					   if(responseData["economy"] != undefined 
							   && responseData["economy"] != null && responseData["economy"].length >0){
						  $("#economySource").append($("<option>",{text:"请选择",value:""}));
						   for(var i=0;i<responseData["economy"].length;i++){
							  $("#economySource").append($("<option>",{"text":responseData["economy"][i].name,
								  "value":responseData["economy"][i].value}));
						   }
					   }
 				   }
 			   }
 		   }
 		});
    },
    _ajax : function(url, param, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, this.$).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		}));
	},
	createForm : function(){
		$.validator.addMethod("isAdminStop",function(value, element){
			var returnResult = true;
			if($(element).prop("checked")){
				if($("#adminStartDate").val() == "" || $("#adminEndDate").val() == ""){
					returnResult = false;
				}
			}
			return returnResult;
		},"选中停飞后，停飞起始时间和结束时间不能为空");
		$.validator.addMethod("isTechnologyDegrade",function(value, element){
			var returnResult = true;
			if($(element).prop("checked")){
				if($("#technologyStartDate").val() == "" || $("#technologyEndDate").val() == ""){
					returnResult = false;
				}
			}
			return returnResult;
		},"选中降级后，降级的起始时间和结束时间不能为空");
		//economyCheck
		$.validator.addMethod("isEconomyCheck",function(value, element){
			var returnResult = true;
			if($(element).prop("checked")){
				if($("#economySource").val() == ""){
					returnResult = false;
				}
			}
			return returnResult;
		},"选中安全考核扣分后，分数不能为空");
		//economyPunish
		$.validator.addMethod("isEconomyPunish",function(value, element){
			var returnResult = true;
			if($(element).prop("checked")){
				if($("#economyRMB").val() == ""){
					returnResult = false;
				}
			}
			return returnResult;
		},"选中奖惩复选框后，奖惩金额不能为空");
		this.form.validate({
            rules: {
            	"rewardType":{
            		"required": true
            	},
            	"personnelCategory":{
            		"required": true
            	},
            	"systemCategory":{
            		"required": true
            	},
            	"empStandard":{
            		"required": true
            	},
            	"empDate":{
            		"required": true
            	},
            	"localFlightTime":{
            		"required": true
            	},
            	"sumFlightTime":{
            		"required": true
            	},
            	"cockpitRole":{
            		"required": true
            	},
            	"adminPost":{
            		"required": true
            	},
            	"adminStop":{
            		isAdminStop:[]
            	},
            	"adminDesc":{
            		"required": true
            	},
            	"technologyDegrade":{
            		isTechnologyDegrade:[]
            	},
            	"technologyDesc":{
            		"required": true
            	},
            	"economyCheck":{
            		isEconomyCheck:[]
            	},
            	"economyPunish":{
            		isEconomyPunish:[]
            	},
            	"economyDesc":{
            		"required": true
            	},
            	"starlevelSource":{
            		"required": true
            	},
            	"starlevelDesc":{
            		"required": true
            	},
            	"name":{
            		"required": true
            	},
            	"jobNumber":{
            		"required": true
            	},
            	"flightUnit":{
            		"required": true
            	},
            	"idCard":{
            		"required": true
            	}
            },
            messages: {
            	"rewardType":{
            		"required": "处理类型不能为空"
            	},
            	"personnelCategory":{
            		"required": "人员类别不能为空"
            	},
            	"systemCategory":{
            		"required": "所属系统不能为空"
            	},
            	"empStandard":{
            		"required": "聘用标准不能为空"
            	},
            	"empDate":{
            		"required": "聘用时间不能为空"
            	},
            	"localFlightTime":{
            		"required": "本机型飞行时间不能为空"
            	},
            	"sumFlightTime":{
            		"required": "总飞行时间不能为空"
            	},
            	"cockpitRole":{
            		"required": "驾驶舱角色不能为空"
            	},
            	"adminPost":{
            		"required": "行政职务不能为空"
            	},
            	"adminDesc":{
            		"required": "行政处理说明不能为空"
            	},
            	"technologyDesc":{
            		"required": "技术处理说明不能为空"
            	},
            	"economyDesc":{
            		"required": "经济处理说明不能为空"
            	},
            	"starlevelSource":{
            		"required": "星级分数不能为空"
            	},
            	"starlevelDesc":{
            		"required": "星级人员扣分说明不能为空"
            	},
            	"name":{
            		"required": "姓名不能为空"
            	},
            	"jobNumber":{
            		"required": "工号不能为空"
            	},
            	"flightUnit":{
            		"required": "飞行单位不能为空"
            	},
            	"idCard":{
            		"required": "身份证不能为空"
            	}
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
	},
	getParam : function(){
    	var obj = {};
    	this.form.find('input[type=text]').each(function(k,v){
    		var name = $(v).attr("name");
    		if(name !== "rewardNo" && name !== "rewardType1" && name!== "rewardType2"){
    			obj[name] = $(v).val();
    		}
    	});
    	this.form.find('select').each(function(k,v){
    		obj[$(v).attr("name")] = $(v).val();
    	});
    	this.form.find('textarea').each(function(k,v){
    		obj[$(v).attr("name")] = $(v).val();
    	});
    	return obj;
    }
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.rewardsAndPenaltiesEdit.widgetjs = [
                                            "../../../uui/widget/spin/spin.js", 
                                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.rewardsAndPenaltiesEdit.widgetcss = [];