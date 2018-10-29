//@ sourceURL=com.sms.detailmodule.rewardsAndPenalties
$.u.define('com.sms.detailmodule.rewardsAndPenalties', null, {
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
    	if(this._options.rewards.length){
    		var $tbody = this.qid("datatable").find('tbody');
    		$.each(this._options.rewards, this.proxy(function(k,v){
    			var temp = this.temp.replace(/#{itemid}/g,v.id)
					.replace(/#{name}/g,v.name)
					.replace(/#{rewardType}/g,v.rewardType == "R" ? "奖励":"惩罚")
					.replace(/#{conclusion}/g,v.conclusion || "");
    			$tbody.append(temp);
    		}));
        	$tbody.find('.del').off("click").on("click", this.proxy(this.del));
        	$tbody.find('.edit').off("click").on("click", this.proxy(this.edit));
    	}
    },
    initHtml : function(){
    	this.add_record = this.qid("add_record");
    	this.add_record.off("click").on("click", this.proxy(this.addRecord));
    	this.form = this.qid("form");
    	this.createForm();
    	this.add_fly = this.qid("add_fly");
    	this.add_fly.off("click").on("click", this.proxy(this.addFly));
    	this.createDialog();
    },
    addRecord : function(){
    	this._options.mode = "ADD";
    	this.infoDialog.dialog("option",{
    		"title":"新增奖惩记录",
    		"buttons":[{
            	"text":"提交",
                "click":this.proxy(this.on_infoDialog_save)
            },{
                "text":"关闭",
                "class":"aui-button-link",
                "click":this.proxy(this.on_infoDialog_cancel)
            }]
    	}).dialog("open");
    },
    createDialog : function(){
    	this.infoDialog = this.qid("infoDialog").dialog({
        	title:"奖惩记录",
            width:600,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(this.on_infoDialog_open),
            close: this.proxy(this.on_infoDialog_close)
        });
    },
    showM : function(obj, data){
    	var $tbody = this.qid("datatable").find('tbody');
    	var temp = this.temp.replace(/#{itemid}/g,data)
    						.replace(/#{name}/g,obj.name)
    						.replace(/#{rewardType}/g,obj.rewardType == "R" ? "奖励":"惩罚")
    						.replace(/#{conclusion}/g,obj.conclusion || "");
    	$tbody.append(temp);
    	$tbody.find('.del').off("click").on("click", this.proxy(this.del));
    	$tbody.find('.edit').off("click").on("click", this.proxy(this.edit));
    },
    del : function(e){
    	var $e = $(e.currentTarget);
    	var id = parseInt($e.parents('tr').attr("itemid"));
		var clz = $.u.load("com.sms.common.confirm");
		var confirm = new clz({
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	$.u.ajax({
                			url : $.u.config.constant.smsmodifyserver, 
                			datatype : "json",
                			type : 'post',
                			data : $.extend({
                				tokenid : $.cookie("tokenid")
                			}, {
                                "method" : "stdcomponent.delete",
                                "dataobject" : "rewards",
                                "dataobjectids" : JSON.stringify([id])
                            })
                		},  confirm.confirmDialog.parent()).done(this.proxy(function(response) {
                			if (response.success) {
                				confirm.confirmDialog.dialog("close");    
                				$e.parents('tr').fadeOut("fast");
                                $.u.alert.success("操作成功");
                			}
                		}));
                    })
                }
            }
        });
    },
    edit : function(e){
    	var $e = $(e.currentTarget);
    	this._options.mode = "EDIT";
    	this.itemid = parseInt($e.parents('tr').attr("itemid"));
    	this.infoDialog.dialog("option",{
    		"title":"编辑奖惩记录",
    		"buttons":[{
            	"text":"保存",
                "click":this.proxy(this.on_infoDialog_commit)
            },{
                "text":"关闭",
                "class":"aui-button-link",
                "click":this.proxy(this.on_infoDialog_cancel)
            }]
    	}).dialog("open");
    },
    getData : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			{
				 "method": "stdcomponent.getbyid",
                 "dataobject": "rewards",
                 "dataobjectid": this.itemid
			}, 
			this.proxy(function(response) {
				if(response.success){
					this.fillForm(response.data);
				}
			})
		);
    },
    fillForm : function(data){
    	$.each(data, this.proxy(function(k, v){
    		this.form.find('[name='+k+']').val(v);
    	}));
    },
    on_infoDialog_save : function(){
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
					}
				})
			);
    	}
    },
    on_infoDialog_commit : function(){
    	if(this.form.valid()){
    		var obj = this.getParam();
    		var id = this.itemid;
    		this._ajax(
				$.u.config.constant.smsmodifyserver, 
				{
					"method" : "stdcomponent.update",
					"dataobject" : "rewards",
					"dataobjectid" : id,
					"obj" : JSON.stringify(obj)
				}, 
				this.proxy(function(response) {
					if(response.success){
						this.infoDialog.dialog("close");
						this.qid("datatable").find('tr[itemid="'+id+'"]').remove();
						this.showM(obj, id);
						$.u.alert.success("保存成功");
					}
				})
			);
    	}
    },
    on_infoDialog_cancel : function(){
    	this.infoDialog.dialog("close");
    },
    on_infoDialog_create : function(){
    	
    },
    on_infoDialog_open : function(){
    	if(this._options.mode === "ADD"){
    		this.getFlightInfo();
    	}else if(this._options.mode === "EDIT"){
    		this.getData();
    	}
    },
    on_infoDialog_close : function(){
    	this.itemid = "";
    	this.form.find("input").val("");
    	this.form.find("textarea").val("");
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
	getParam : function(){
    	var obj = {};
    	this.form.find('input[type=text]').each(function(k,v){
    		var name = $(v).attr("name");
    		if(name !== "rewardNo"){
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
    },
	createForm : function(){
		this.form.validate({
            rules: {
            	"name":{
            		"required": true
            	},
            	"jobNumber":{
            		"required": true
            	},
            	"flightUnit":{
            		"required": true
            	},
            	"position":{
            		"required": true
            	},
            	"idCard":{
            		"required": true
            	},
            	"flightDate":{
            		 date: true,
                     dateISO: true
            	}
            },
            messages: {
            	"name":{
            		"required": "姓名不能为空"
            	},
            	"jobNumber":{
            		"required": "工号不能为空"
            	},
            	"flightUnit":{
            		"required": "飞行单位不能为空"
            	},
            	"position":{
            		"required": "职位不能为空"
            	},
            	"idCard":{
            		"required": "身份证不能为空"
            	},
            	"flightDate":{
            		"date": "无效日期",
                    "dateISO": "无效日期"
            	}
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
	},
	getFlightInfo : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			datatype : "json",
			async: true,
			type : 'post',
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, {
				"method" : "rewardsGetFlightInfoByActivity",
				"activityId" : this._options.activity
			})
		}, this.$).done(this.proxy(function(response) {
			if (response.success) {
				$.each(response.data, this.proxy(function(key, value){
					$('input[name='+key+']',this.form).val(value);
				}));
			}
		}));
	},
	addFly : function(){
		if(!this.fly){
			var clz = $.u.load("com.sms.detailmodule.rewardsAndPenaltiesFlyDialog");
			this.fly = new clz($("div[umid=fly]",this.$),{"activity":this._options.activity});
		}
		this.fly.override({
			refreshList : this.proxy(function(data){
				$.each(data, this.proxy(function(key, value){
					$('input[name='+key+']',this.form).val(value);
				}));
			})
		});
		this.fly.open();
	}
}, { usehtm: true, usei18n: false });


com.sms.detailmodule.rewardsAndPenalties.widgetjs = [
                                            "../../../uui/widget/spin/spin.js", 
                                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.rewardsAndPenalties.widgetcss = [];