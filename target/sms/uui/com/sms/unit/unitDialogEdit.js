//@ sourceURL=com.sms.unit.unitDialogEdit
$.u.define('com.sms.unit.unitDialogEdit', null, {
    init: function (options) {
        this._options = options || {};
        this._options.data = null;
    	this._options.dataobject = "unit";
    	this._avatarIsVisible = false;
    	this._personSelect2Length = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unit.unitDialogEdit.i18n;
    	this.form = this.qid("unit-form");
    	
    	this.formDialog = this.qid("unit-dialog-edit").dialog({
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
            	if(this._avatarIsVisible === false){
	            	this.enableForm();
	            	if(this._options.mode == "EDIT" && this._options.data){
		            	this.fillFormData(this._options.data);
	            	}
            	}
            }),
            close: this.proxy(function(){
            	if(this._avatarIsVisible === false){
            		this.clearFormData();
            	}
            })
        }); 
    	
    	this.form.validate({
            rules: {
                "name": {
                    required:true
                },
                "code":{
                	required:true
                },
                "responsibleUser":{
                	required:true
                },
                "category":{
                	required:true
                }
            },
            messages: {
                "name": this.i18n.nameNotNull,
                "code":this.i18n.keyNotNull,
                "responsibleUser":this.i18n.respUserNotNull,
                "category":this.i18n.categoryNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });
    	
    	this.qid("category").select2({
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data:function(term,page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "stdcomponent.getbysearch",
        				"dataobject": "unitCategory",//professionUser//unit
        				"rule": JSON.stringify([[{"key":"name","op":"like","value":term}]])
	            	};
	            },
		        results:this.proxy(function(response,page){
		        	if (response.success) {
		        		return {results:response.data.aaData};
		        	} 
		        })
	        },
	        formatResult: function(item){
	        	return item.name;      		
	        },
	        formatSelection: function(item){
	        	return item.name;	        	
	        }
		});
    	
    	this.qid("unit-person").select2({
        	ajax:{
	        	url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
        				"tokenid": $.cookie("tokenid"),
        				"method": "stdcomponent.getbysearch",
        				"dataobject": "user",
        				"start": (page - 1) * this._personSelect2Length,
        				"length": this._personSelect2Length,
        				"search": JSON.stringify({"value":term})
	            	};
	            }),
		        results: this.proxy(function(response, page){
		        	if (response.success) {
		        		return {results:response.data.aaData, more: (page * this._personSelect2Length) < response.data.iTotalRecords };
		        	} 
		        })
	        },
	        formatResult: function(item){
	        	return "<img src='" + item.avatarUrl + "' width='16' height='16'/>&nbsp;" + item.fullname + "-" + item.username;      		
	        },
	        formatSelection: function(item){
	        	return item.fullname + "(" + item.username + ")";	        	
	        }
		});
    	
    	
    	this.qid("unit-image").click(this.proxy(function(e){
    		e.preventDefault();
    		try{
	    		this._avatarIsVisible = true;
				this.selectUnitAvatar && this.selectUnitAvatar.destroy();
				$.u.load('com.sms.common.selectAvatar');
	    		this.selectUnitAvatar = new com.sms.common.selectAvatar($("div[umid='select-unit-avatar']", this.$), {
	        		uploadparam: "dataobject=unitAvatar&unit=" + (this._options.data ? this._options.data.id : ""),
	        		save: this.proxy(function(comp, avatar_id, avatar_url){
	        			this.qid("unit-image").attr({"src":avatar_url, "value":avatar_id});
	        			comp.selectAvatarDialog.dialog("close");
	        			this.formDialog.dialog("open");
	        			this._avatarIsVisible = false;
	        		})
	        	});
	    		this.selectUnitAvatar.override({
	    			afterClose: this.proxy(function(){
	    				this.formDialog.dialog("open");
	    				this._avatarIsVisible = false;
	    			})
	    		});
	    		this.formDialog.dialog("close");
	    		this.selectUnitAvatar.open({rule: JSON.stringify([[{key:"system", value:true}, {key:"owner", value:"" + (this._options.data?this._options.data.id:"")}], [{key:"type", value:"unit"}]])}, this._options.data || "");
    		}catch(e){
    			this._avatarIsVisible = false;
    		}
    	}));
    	
    },
    /*
     * 打开模态层
     * @params 参数数据 {data:{},title:"",edit:function(comp,formdata){},afterEdit:function(comp,formdata){}} data:数据，title为编辑时的标题 ，edit为自定义处理事件
     */
    open:function(params){
    	var dialogOptions=null;
        if (params) {
            this._options.mode = "EDIT";
            this._options.data = params.data;
            dialogOptions = {
                title: params.title,
                buttons: [
                    {
                        text: this.i18n.update,
                        click: this.proxy(function (e) {
                        	if(this.form.valid()){
	                            	this._sendModifyAjax({
	                            		"tokenid": $.cookie("tokenid"),
	                            		"method": "stdcomponent.update",
	                            		"dataobject": this._options.dataobject,
	                            		"dataobjectid": this._options.data.id,
	                            		"obj": JSON.stringify(this.getFormData())
		                            },e);
                        		}
                            }
                        )
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
        }else{
        	this._options.mode = "ADD";
            dialogOptions = {
                title: "添加安监机构",
                buttons: [
                    {
                        text: this.i18n.add,
                        click: this.proxy(function (e) {
                        	if(this.form.valid()){
	                            	this._sendModifyAjax({
	                            		"tokenid": $.cookie("tokenid"),
	                            		"method": "stdcomponent.add",
	                            		"dataobject": this._options.dataobject,
	                            		"obj": JSON.stringify(this.getFormData())
		                            },e);
                        		}
                            }
                        )
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
    /*
     * 请求更新数据(新增、修改)
     */
    _sendModifyAjax:function(data,e,func){
    	this.disableForm();
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": data
        },this.qid("unit-dialog-edit").parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
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

    },
    /*
     * 获取表单数据（JSON格式）
     */
    getFormData:function(){
    	var data={};
    	$.each(this.form.serializeArray(), function(idx, field){
    		data[field.name] = field.value;
    	});
    	data["category"] = this.qid("category").select2("data").id;
    	data["responsibleUser"] = this.qid("unit-person").select2("data").id;
    	data["avatar"] = this.qid("unit-image").attr("value") && parseInt(this.qid("unit-image").attr("value"));
    	return data;
    },
    /*
     * 填充表单数据
     */
    fillFormData:function(data){
		$.each(data, this.proxy(function(name, value){
			if (name == "avatarUrl") {
				$("img", this.form).attr("src",value);
			} else {
				$("[name='" + name + "']", this.form).val(value);
			}
    	}));
		this.qid("category").select2("data", {id:data.category, name:data.categoryDisplayName});
		this.qid("unit-person").select2("data", {id:data.responsibleUser, fullname:"", username:data.responsibleUserDisplayName});
		
    },
    /*
     * 清空表单数据和校验错误信息
     */
    clearFormData:function(){
    	$(":text,textarea",this.form).val("");
    	$("img",this.form).attr({"src":"",value:""});
    	this.qid("category").select2("data","");
    	this.qid("unit-person").select2("data","");
    	this.form.validate().resetForm();
    	this.qid("unit-image").attr("src",this.getabsurl("../../../img/unitavatar/unitavatar-default.png"));
    },
    /*
     * 禁用表单元素
     */
    disableForm:function(){
    	$(":text,textarea",this.form).attr("disabled",true);
    	this.formDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
    },
    /*
     * 启用表单元素
     */
    enableForm:function(){
    	$(":text,textarea",this.form).attr("disabled",false);
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


com.sms.unit.unitDialogEdit.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',"../../../uui/widget/spin/spin.js"
                                        , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                        , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unit.unitDialogEdit.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];