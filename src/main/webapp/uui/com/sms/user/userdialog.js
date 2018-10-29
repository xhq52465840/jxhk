//@ sourceURL=com.sms.user.userdialog
$.u.define('com.sms.user.userdialog', null, {
    init: function (options) {
        this._options = options;
        this.mode = "ADD";
        this.editUserData = {};
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.user.userdialog.i18n;

    	// 账户名
    	this.username = this.qid("username");
    	
    	// 密码
    	this.password = this.qid("password");
    	
    	// 确认密码
    	this.confirmpassword = this.qid("confirmPassword");
    	
    	// 用户名
    	this.fullname = this.qid("fullName");
    	
    	// 邮箱
    	this.email = this.qid("email");
    	
    	// 状态
    	// this.active = this.qid("active");
    	
    	// 表单校验
        this.userForm = this.qid("userform"); 
        this.userForm.validate({
            rules: {
                username: {
                    required:true
                },
                password: {
                    required: true
                },
                confirmPassword: {
                    equalTo:"#"+this._id+"-password"
                },
                fullName: {
                    required: true
                },
                email: {
                    required: true,
                    email:true
                }
            },
            messages: {
                username: this.i18n.messages.accountNotNull,
                password: this.i18n.messages.passwordNotNull,
                confirmPassword: {
                    required: this.i18n.messages.passwordNotNull,
                    equalTo:this.i18n.messages.error
                },
                fullName: this.i18n.messages.userNameNotNull,
                email: {
                    required: this.i18n.messages.mailNotNull,
                    email:this.i18n.messages.mailFormat
                }
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });

        this.userDialog = this.qid("div_user").dialog({
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function () {
                this.username.select2({
                    ajax: {
                        url: $.u.config.constant.smsqueryserver,
                        dataType: "json",
                        type: "post",
                        data: this.proxy(function(term, page){
                            return {
                                tokenid: $.cookie("tokenid"),
                                method: "getYxwUser",
                                username: term,
                                fullname: term
                            };
                        }),
                        results: this.proxy(function(response, page, query){
                            if(response.success){
                                return {
                                    "results": response.data
                                }
                            }
                        })
                    },
                    id: function(item){
                        return item.USERNAME;
                    },
                    formatSelection: function(item){
                        return item.USERFULLNAME + "(" + item.USERNAME + ")";
                    },
                    formatResult: function(item){
                        return item.USERFULLNAME + "(" + item.USERNAME + ")";
                    }
                }).on("select2-selecting", this.proxy(function(e){
                    this.email.val(e.object.USEREMAIL || "");
                    this.fullname.val(e.object.USERFULLNAME || "");
                }));
            }),
            open: this.proxy(function () {
            
            	
                if (this.mode == "ADD") {
                    this.username.select2("enable", true);
                    this.fullname.attr("disabled", true);
                    this.email.attr("disabled", true);
                    $(".control.edit", this.userDialog).hide();
                    $(".control.add", this.userDialog).show();
                } else if (this.mode == "EDIT") {
                	// this.username.val(this.editUserData.username).attr("disabled","disabled");
                    this.editUserData.USERNAME = this.editUserData.username;
                    this.editUserData.USERFULLNAME = this.editUserData.fullname;
                    this.username.select2("data", this.editUserData).select2("enable", false);
                	this.fullname.removeAttr("disabled").val(this.editUserData.fullname);
                	this.email.removeAttr("disabled").val(this.editUserData.email);
                	// this.editUserData.status === "正常" ? this.active.prop("checked",true) : null;
                    $(".control.add", this.userDialog).hide();
                    $(".control.edit", this.userDialog).show();
                }
            }),
            close: this.proxy(function () {
                this.clearForm(this.userForm);
                this.userForm.validate().resetForm();
            })
        }); 
    },
    /*
    * 清空表单
    */
    clearForm: function ($target) {
        this.username.select2("val", null);
        $target.find("input,textarea,select").each(function () {
            switch (this.type) {
                case "password":
                case "text":
                case "textarea":
                case "select-one":
                case "select-multiple":
                    $(this).val("");
                    break;
                case "checkbox":
                case "radio":
                    $(this).prop("checked", false);
                    break;
                    // no default
            }
        });
    },
    open: function (userdata) {
        var dialogOptions=null;
        if (userdata) {
            this.editUserData = userdata;
            this.mode = "EDIT";
            dialogOptions = {
                title: this.i18n.editUser + userdata.fullname,
                buttons: [
                    {
                        text: this.i18n.buttons.update,
                        click: this.proxy(function (e) {
                            if (this.userForm.valid()) {
                                this._sendAjax({
                                	  "tokenid":$.cookie("tokenid"),
		                      		  "method":"stdcomponent.update",
		                      		  "dataobject":"user",
		                      		  "dataobjectid":this.editUserData.id,
		                      		  "obj":JSON.stringify({
		                                   username: this.qid("userName").val(),
		                                   fullname: this.qid("fullName").val(),
		                                   email: this.qid("email").val()
		                                   // status:this.qid("active").prop("checked") ? "正常" : ""
	                                  })
                                }, e);
                            }
                        })
                    },
                    {
                        text: this.i18n.buttons.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.userDialog.dialog("close");
                        })
                    }
                ]
            };
        }else{
            this.mode = "ADD";
        	dialogOptions = {
                title: this.i18n.createUser,
                buttons: [
                    {
                        text: this.i18n.buttons.create,
                        click: this.proxy(function (e) {
                            if (this.userForm.valid()) {
                               //  this._sendAjax({
                               //  	"tokenid":$.cookie("tokenid"),
    	                      		  // "method":"stdcomponent.add",
    	                      		  // "dataobject":"user",
    	                      		  // "obj":JSON.stringify({
    	                          //         username: this.username.val(),
    	                          //         password: this.password.val(),
    	                          //         fullname: this.fullname.val(),
    	                          //         email: this.email.val(),
    	                          //         status: "正常"
    	                          //     })
                               //  }, e);
                                this._sendAjax({
                                    "tokenid": $.cookie("tokenid"),
                                    "method": "saveYxwUser",
                                    "userMap": JSON.stringify(this.username.select2("data"))
                                }, e);
                            }
                        })
                    },
                    {
                        text: this.i18n.buttons.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.userDialog.dialog("close");
                        })
                    }
                ]
            };
        }
        this.userDialog.dialog("option",dialogOptions).dialog("open");
    },
    _sendAjax:function(data,e){
    	this.username.add(this.fullname).add(this.email).add(this.password).add(this.confirmpassword).add(this.qid("notice")).attr("disabled",true);
        $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
        
        $.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
              type:"post",
              dataType: "json",
              cache: false,
               "data": data
        },this.userDialog.parent(),{ size: 1,backgroundColor:'transparent', selector: $(e.currentTarget).parent(), orient: "west" }).done(this.proxy(function(response){
        	if(response.success){
        		this.userDialog.dialog("close");
        		this.refreshDataTable();
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.username.add(this.fullname).add(this.email).add(this.password).add(this.confirmpassword).add(this.qid("notice")).attr("disabled",false);
        	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
        }));
    },
    destroy: function () {
        this._super();
        this.userDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.user.userdialog.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                    "../../../uui/widget/spin/spin.js",
                                    "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                    "../../../uui/widget/ajax/layoutajax.js"];
com.sms.user.userdialog.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                     {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];