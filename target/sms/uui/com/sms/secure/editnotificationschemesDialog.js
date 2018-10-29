//@ sourceURL=com.sms.secure.editnotificationschemesDialog
$.u.define('com.sms.secure.editnotificationschemesDialog', null, {
    init: function (options) {
		/*{
			title:"",		// 标题
			dataobject:"",	// 数据对象
		}*/
        this._options = options || {};
        this._options.data=null;
        this._options.mode="ADD";
        this._options.id=options.id;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.secure.editnotificationschemesDialog.i18n;
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
        if (params.data) {
	            this._options.mode = "EDIT";
	            this._options.data = params.data;
	            this.events.val(params.data.code);
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
    	var events =[];
    	events =  this.events.val();
    	if(!events){
    		$('<div id="error" style="color:red;"></div>').text(com.sms.secure.editnotificationschemesDialog.i18n.eventNotNull).appendTo(this.events.parent());
    		return false;
    	}
    	var val=$('input:radio[name="type"]:checked').val();
    	switch(val){
    		case "USER":
    			if(!this.qid("user").select2("val")){
    				$('<div id="error" style="color:red;"></div>').text(com.sms.secure.editnotificationschemesDialog.i18n.singleUserNotchoose).appendTo(this.qid("user").parent());
        			return false;
    			}
    			break;
    		case "ROLE":
    			if(!this.qid("role").select2("val")){
    				$('<div id="error" style="color:red;"></div>').text(com.sms.secure.editnotificationschemesDialog.i18n.roleNo).appendTo(this.qid("role").parent());
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
    	//事件
    	this.events = this.qid("event");
    	$.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            async:false,
            data: {
            	"tokenid":$.cookie("tokenid"),
				"method":"getallevents"
            }
        }).done(this.proxy(function (data) {
            if (data.success) {
            	data.data.aaData&&$.each(data.data.aaData,this.proxy(function(k,v){
                	$('<option value="'+v.code+'">'+v.name+'</option>').appendTo(this.events);
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
	            data:function(term,page){
	            	return {
	        				"tokenid":$.cookie("tokenid"),
	        				"method":"stdcomponent.getbysearch",
	        				"dataobject":"userGroup",
	        				"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        			return {results:response.data.aaData};
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
	            data:function(term,page){
	            	return {
	        				"tokenid":$.cookie("tokenid"),
	        				"method":"stdcomponent.getbysearch",
	        				"dataobject":"user",
	        				"rule":JSON.stringify([[{"key":"fullname","op":"like","value":term},{"key":"username","op":"like","value":term}]])
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        			return {results:response.data.aaData};
		        	}
		        })
	        },
	        formatResult:function(item){
	        	return "<img src='"+item.avatarUrl+"' width='16' height='16'/>&nbsp;"+item.fullname+"-"+item.username;
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
	            data:function(term,page){
	            	return {
	        				"tokenid":$.cookie("tokenid"),
	        				"method":"stdcomponent.getbysearch",
	        				"dataobject":"role",
	        				"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if(response.success){
		        			return {results:response.data.aaData};
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
  
    getFormData:function(){
    	var sendData=[];
    	var events=[];
    	events=this.events.val();
    	$.each(events,this.proxy(function(k,v){
    		var data={};
        	var val=$('input:radio[name="type"]:checked').val();
        	switch(val){
        		case "USER_GROUP":
        			data={
        				"type":"USER_GROUP",
        				"parameter":this.qid("usergroup").select2("val"),
        				"scheme":parseInt(this._options.id),
        				"event":v
        			};
        			break;
        		case "USER":
        			data={
        				"type":"USER",
        				"parameter":this.qid("user").select2("val"),
        				"scheme":parseInt(this._options.id),
        				"event":v
        			};
        			break;
        		case "ROLE":
        			data={
        				"type":"ROLE",
        				"parameter":this.qid("role").select2("val"),
        				"scheme":parseInt(this._options.id),
        				"event":v
        			};
        			break;        			
        	}
    		sendData.push(data);
    	}))
    	return sendData;
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$(":text,textarea,select",this.form).val("");
    	$("input:hidden[qid=user]").select2("val","");
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


com.sms.secure.editnotificationschemesDialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js'];
com.sms.secure.editnotificationschemesDialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];