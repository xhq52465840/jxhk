//@ sourceURL=com.sms.secure.usergroup
$.u.define('com.sms.secure.usergroup', null, {
    init: function (options) {
		/*{
			title:"",		// 标题
			dataobject:"",	// 数据对象
			fields:[
				{name:"",label:"",type:"",dataType:"int",enums:[],rule:{requred:true,email:true,date:true},message:"名称不能为空",description:"",ajax:{}}
			]
		}*/
        this._options = options || {};
        this._options.data=null;
        this._options.mode="ADD";
        this._select2PageLength = 10;
 
    },
    afterrender: function (bodystr) {
    	this.i18n =com.sms.secure.usergroup.i18n;
    	// 表单
    	this.form=this.qid("form");
    	
    	this.formDialog = this.qid("dialog").dialog({
            title:this._options.title,
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create:this.proxy(function(){
            	this.buildForm();
            }),
            open:this.proxy(function(){
            	this.enableForm();
            }),
            close:this.proxy(function(){
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
    		this._options.id = params.data.id;
            this._options.mode = "ADD";
        	dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.add,
                        click: this.proxy(function (e) {
                            if (this.valid()) {console.log(this.getFormData());
	                                this._sendModifyAjax({
	                                	  "tokenid":$.cookie("tokenid"),
	    	                      		  "method":"stdcomponent.add",
	    	                      		  "dataobject":"activitySecurityLevelEntity",
	    	                      		  "obj":JSON.stringify(this.getFormData())
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
        this.formDialog.dialog("option",dialogOptions).dialog("open");
    },
    valid:function(){
    	$("#error").remove();
    	var val=$('input:radio[name="type"]:checked').val();
    	switch(val){
    		case "USER":
    			if(!this.qid("user").select2("val")){
    				$('<div id="error" style="color:red;"></div>').text(com.sms.secure.usergroup.i18n.single).appendTo(this.qid("user").parent());
        			return false;
    			}
    			break;
    		case "ROLE":
    			if(!this.qid("role").select2("val")){
    				$('<div id="error" style="color:red;"></div>').text(com.sms.secure.usergroup.i18n.roleNo).appendTo(this.qid("role").parent());
        			return false;
    			}
    			break;    			
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
    	this.qid("usergroup").select2({
			width:322,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
        				"tokenid":$.cookie("tokenid"),
        				"method":"stdcomponent.getbysearch",
        				"dataobject":"userGroup",
        				"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]]),
                        "start": (page - 1) * this._select2PageLength,
                        "length": this._select2PageLength
	            	};
	            }),
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        		return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._select2PageLength)
                        };
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
    	
    	this.qid("user").select2({
			width:322,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
        				"tokenid":$.cookie("tokenid"),
        				"method":"stdcomponent.getbysearch",
        				"dataobject":"user",
        				"rule":JSON.stringify([[{"key":"fullname","op":"like","value":term},{"key":"username","op":"like","value":term}]]),
                        "start": (page - 1) * this._select2PageLength,
                        "length": this._select2PageLength
	            	};
	            }),
		        results:this.proxy(function(response,page){
		        	if(response.success){
	        			return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._select2PageLength)
                        };
		        	}
		        })
	        },
	        formatResult:function(item){
	        	return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "(" + item.username + ")";
	        },
	        formatSelection:function(item){
        		return item.fullname;
	        }
		});
    	
    	this.qid("role").select2({
			width:322,
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
        				"tokenid":$.cookie("tokenid"),
        				"method":"stdcomponent.getbysearch",
        				"dataobject":"role",
        				"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]]),
                        "start": (page - 1) * this._select2PageLength,
                        "length": this._select2PageLength
	            	};
	            }),
		        results:this.proxy(function(response,page){
		        	if(response.success){
	        			return {
                            results: response.data.aaData,
                            more: response.data.iTotalRecords > (page * this._select2PageLength)
                        };
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
    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var data={};
    	//用户组被选中，
    	var val=$('input:radio[name="type"]:checked').val();
    	switch(val){
    		case "USER_GROUP":
    			data={
    				"type":"USER_GROUP",
    				"parameter":this.qid("usergroup").select2("val"),
    				"level":parseInt(this._options.id)
    			};
    			break;
    		case "USER":
    			data={
    				"type":"USER",
    				"parameter":this.qid("user").select2("val"),
    				"level":parseInt(this._options.id)
    			};
    			break;
    		case "ROLE":
    			data={
    				"type":"ROLE",
    				"parameter":this.qid("role").select2("val"),
    				"level":parseInt(this._options.id)
    			};
    			break;    			
    	}
    	return data;
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$(":text,textarea,select",this.form).val("");
    	$("input:text.select2").select2("val","");
    	$(":radio[value=USER_GROUP]").prop("checked",true);
    	$("#error").remove();
    },
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",true);
    	$("input:text.select2").select2("enable",false);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea,select",this.form).attr("disabled",false);
    	$("input:text.select2").select2("enable",true);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
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

com.sms.secure.usergroup.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'];
com.sms.secure.usergroup.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];