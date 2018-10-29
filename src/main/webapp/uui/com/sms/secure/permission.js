//@ sourceURL=com.sms.secure.permission
$.u.define('com.sms.secure.permission', null, {
    init: function (options) {
		/*{
			title:"",		// 标题
			dataobject:"",	// 数据对象
		}*/
        this._options = options || {};
        this._options.data = null;
        this._options.mode = "ADD";
        this._options.id = options.id;
        this._select2UserGroupPageLength = 10;
        this._select2RolePageLength = 10;
        this._select2UserPageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.secure.permission.i18n;
    	this.form=this.qid("form");
    	
    	this.formDialog = this.qid("dialog").dialog({
            title: this._options.title,
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function(){
            	this.buildForm();
            }),
            open: this.proxy(function(){
            	this.enableForm();
            }),
            close: this.proxy(function(){
            	// 清空表单
            	this.clearFormData();
            })
        }); 
    	
    },
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(params){
    	var dialogOptions=null;
        if (params.data) {
	            this._options.mode = "EDIT";
	            this._options.data = params.data;
	            this.permission.val(params.data.id);
	            dialogOptions = {
	                title: params.title,
	                buttons: [
	                    {
	                        text: this.i18n.add,
	                        click: this.proxy(function (e) {
	                        	if(this.valid()){
		                            	this._sendModifyAjax({
	  	                                	  "tokenid":$.cookie("tokenid"),
	  	    	                      		  "method":"stdcomponent.addall",
	  	    	                      		  "dataobject":this._options.dataobject,
	  	    	                      		  "objs":JSON.stringify(this.getFormData())
			                            },e); 
	                            }
	                        })
	                    },
	                    {
	                        text: this.i18n.cancel,
	                        "class": "aui-button-link",
	                        click: this.proxy(function () {
	                            this.formDialog.dialog("close");
	                        })
	                    }
	                ]
	            };
        }else{
        	//
        	this._options.mode = "ADD";
        	dialogOptions = {
    			title: params.title,
    			buttons: [
					{
					    text: this.i18n.add,
					    click: this.proxy(function (e) {
					    	if(this.valid()){
					    		this._sendModifyAjax({
                            	  "tokenid":$.cookie("tokenid"),
	                      		  "method":"stdcomponent.addall",
	                      		  "dataobject":this._options.dataobject,
	                      		  "objs":JSON.stringify(this.getFormData())
					    		},e);
					        }
					    })
					},
					{
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.formDialog.dialog("close");
                        })
                    }
    			]
        	}
        }
        this.formDialog.dialog("option",dialogOptions).dialog("open");
    },
    valid:function(){
    	$("#error").remove();
    	var permission =[];
    	permission =  this.permission.val();
    	if(!permission){
    		$('<div id="error" style="color:red;"></div>').text(com.sms.secure.permission.i18n.grantNotNull).appendTo(this.permission.parent());
    		return false;
    	}
    	var val=$('input:radio[name="type"]:checked').val();
    	switch(val){
    		case "USER":
    			if(!this.qid("user").select2("val")){
    				$('<div id="error" style="color:red;"></div>').text(com.sms.secure.permission.i18n.singleUserNotchoose).appendTo(this.qid("user").parent());
        			return false;
    			}
    			break;
    		case "ROLE":
    			if(!this.qid("role").select2("val")){
    				$('<div id="error" style="color:red;"></div>').text(com.sms.secure.permission.i18n.roleNotchoose).appendTo(this.qid("role").parent());
        			return false;
    			}
    	}
    	return true;
    },
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax:function(data,e){
    	this.disableForm();
    	$.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        }).done(this.proxy(function(response){
        	if(response.success){
                this.formDialog.dialog("close");
                this.refreshDataTable();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.enableForm();
        }));
    },
    /*
     * 根据设置创建表单 
     */
    buildForm:function(){
    	//权限：dataobject:permissionSet
    	this.permission = this.qid("permission");
    	$.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            async:false,
            data: {
            	"tokenid": $.cookie("tokenid"),
				"method": "stdcomponent.getbysearch",
				"dataobject": "permissionSet",
				"columns": JSON.stringify([{ "data":"weight" }]), 
        		"order": JSON.stringify([{ "column":0, "dir":"desc"}]),
				"rule": JSON.stringify([[{"key":"type","value":"","op":"is null"},{"key":"type","value":"global","op":"<>"}]])
            }
        }).done(this.proxy(function (data) {
            if (data.success) {
                $.each(data.data.aaData,this.proxy(function(k,v){
                	$('<option value="'+v.id+'">'+v.name+'</option>').appendTo(this.permission);
                }))
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));
    	
    	this.qid("usergroup").select2({
			width:322,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "stdcomponent.getbysearch",
        				"dataobject": "userGroup",
        				"start": (page - 1) * this._select2UserGroupPageLength,
        				"length": this._select2UserGroupPageLength,
        				"rule": JSON.stringify([[{"key":"name", "op":"like", "value":term}]])
	            	};
	            }),
		        results: this.proxy(function(response,page){
		        	if(response.success){
		        		return {results: response.data.aaData, more: response.data.iTotalRecords > (page * this._select2UserGroupPageLength)};
		        	}
		        })
	        },
	        formatResult:function(item){
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
		}).select2("data",{"id":null,"name":"任何人"});
    	
    	this.qid("role").select2({
			width:322,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "stdcomponent.getbysearch",
        				"dataobject": "role",
        				"start": (page - 1) * this._select2RolePageLength,
        				"length": this._select2RolePageLength,
        				"rule": JSON.stringify([[{"key":"name","op":"like","value":term}]])
	            	};
	            }),
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        		return {results: response.data.aaData, more: response.data.iTotalRecords > (page * this._select2RolePageLength)};
		        	}
		        })
	        },
	        formatResult:function(item){
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
		}).select2("data",{"id":null,"name":"选择一个角色"});
    	
    	this.qid("user").select2({
			width:322,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "stdcomponent.getbysearch",
        				"dataobject": "user",
        				"start": (page - 1) * this._select2UserPageLength,
        				"length": this._select2UserPageLength,
        				"rule":JSON.stringify([[{"key":"fullname","op":"like","value":term},{"key":"username","op":"like","value":term}]])
	            	};
	            }),
		        results: this.proxy(function(response,page){
		        	if(response.success){
		        		return {results: response.data.aaData, more: response.data.iTotalRecords > (page * this._select2UserPageLength)};
		        	}
		        })
	        },
	        formatResult:function(item){
	        	return "<img src='"+item.avatarUrl+"' width='16' height='16'/>&nbsp;"+item.fullname+"("+item.username+")";
	        },
	        formatSelection:function(item){
	        	return item.fullname;
	        }
		});
    },
    /*
     * 获取表单数据（JSON格式）
	 */
    getFormData:function(){	    	
    	var sendData = [];
    	var permission = [];
    	permission = this.permission.val();
    	$.each(permission, this.proxy(function(k, v){
    		var data={};
    		//用户组被选中，
        	var val=$('input:radio[name="type"]:checked').val();
        	switch(val){
        		case "USER_GROUP":
        			data = {
        				"type": "USER_GROUP",
        				"parameter": this.qid("usergroup").select2("val"),
        				"scheme": parseInt(this._options.id)
        			};
        			break;
        		case "USER":
        			data = {
        				"type": "USER",
        				"parameter": this.qid("user").select2("val"),
        				"scheme": parseInt(this._options.id)
        			};
        			break;
        		case "ROLE":
        			data = {
        				"type": "ROLE",
        				"parameter": this.qid("role").select2("val"),
        				"scheme": parseInt(this._options.id)
        			};
        			break;
        		case "REPORTER":
        			data = {
	        			"type": "REPORTER",
	        			"scheme": parseInt(this._options.id)
	        		};
        			break;
        		case "PROCESSOR":
        			data = {
	        			"type": "PROCESSOR",
	        			"scheme": parseInt(this._options.id)
	        		};
        			break;
        		case "UNIT_RESPONSIBLE_USER":
        			data = {
	        			"type": "UNIT_RESPONSIBLE_USER",
	        			"scheme": parseInt(this._options.id)
	        		};
        			break;
        	}
    		data.permissionSet=parseInt(v);
    		sendData.push(data);
    	}))
    	return sendData;
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$(":text,textarea,select",this.form).val("");
    	this.qid("usergroup").select2("data",{"id":null,"name":"任何人"});
    	this.qid("role").select2("data",{"id":null,"name":"选择一个角色"});
    	this.qid("user").select2("val","");
    	$(":radio[value=USER_GROUP]").prop("checked",true);
    	$("#error").remove();
    },
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",true);
    	$("input:hidden.select2").select2("enable",false);
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",false);
    	$("input:hidden.select2").select2("enable",true);
    },
    /*
     * 用于override
     */
    refreshDataTable:function(){},
    destroy: function () {
        this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.secure.permission.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'];
com.sms.secure.permission.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];