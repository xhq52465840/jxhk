//@ sourceURL=com.sms.permissionset.setdialog
$.u.define('com.sms.permissionset.setdialog', null, {
    init: function (options) {
        this._options = options;
        this.mode = "ADD";
        this.editSetData = null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.permissionset.setdialog.i18n;
    	// 名称
    	this.name=this.qid("name");
    	
    	// 描述
    	this.description=this.qid("description");
    	
    	this.isGlobal=this.qid("type");
    	
    	// 表单校验
        this.setForm = this.qid("setForm");
        this.setForm.validate({
            rules: {
                name: "required"
            },
            messages: {
                name: this.i18n.nameNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement: "div"
        });

        this.setDialog = this.qid("div_setdialog").dialog({
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
                if (this.mode == "EDIT" && this.editSetData) {
                    this.name.val(this.editSetData.name);
                    this.description.val(this.editSetData.description);
                    this.isGlobal.prop("checked",(this.editSetData.type == "global"?true:false));
                }
            }),
            close: this.proxy(function () {
                this.editSetData=null;
                this.clearForm(this.setForm);
                this.setForm.validate().resetForm();
            })
        }); 
    },
    /*
    * 清空表单
    */
    clearForm: function ($target) {
        $target.find("input,select,textarea").each(function () {
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
    open: function (setdata) {
        var dialogOptions = {
            title: this.i18n.addpermissionset,
            buttons: [
                {
                    text: this.i18n.add,
                    click: this.proxy(function (e) {
                        if (this.setForm.valid()) {
                            var set = {
                                name: this.name.val(),
                                description:this.description.val(),
                                type:this.isGlobal.is(":checked") ? "global":""
                            };
                            
                            this.name.add(this.description).attr("disabled",true);
                            $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
                            
                            $.ajax({
                            	url: $.u.config.constant.smsmodifyserver,
                                type:"post",
                                dataType: "json",
                                cache: false,
                                data: {
                            		"tokenid":$.cookie("tokenid"),
                            		"method":"stdcomponent.add",
                            		"dataobject":"permissionSet",
                            		"obj":JSON.stringify(set)
	                            }
                            }).done(this.proxy(function(response){
                            	if(response.success){
                            		this.setDialog.dialog("close");
                            		this.refreshDataTable();
                            	}
                            })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                            	
                            })).complete(this.proxy(function(jqXHR,errorStatus){
                            	this.name.add(this.description).attr("disabled",false);
                            	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                            }));
                        }
                    })
                },
                {
                    text: this.i18n.cancel,
                    "class": "aui-button-link",
                    click: this.proxy(function () {
                        this.setDialog.dialog("close");
                    })
                }
            ]
        };
        this.mode = "ADD";
        if (setdata) {
            this.editSetData = setdata;
            dialogOptions = {
                title: this.i18n.editpermissionset + setdata.name,
                buttons: [
                    {
                        text: this.i18n.update,
                        click: this.proxy(function (e) {
                            if (this.setForm.valid()) {
                                var set = {
                                    name: this.name.val(),
                                    description: this.description.val(),
                                    type:this.isGlobal.is(":checked") ? "global":""
                                };
                                
                                this.name.add(this.description).attr("disabled",true);
                                $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
                                
                                $.ajax({
                                	url: $.u.config.constant.smsmodifyserver,
                                    type:"post",
                                    dataType: "json",
                                    cache: false,
                                    data: {
                                		"tokenid":$.cookie("tokenid"),
                                		"method":"stdcomponent.update",
                                		"dataobject":"permissionSet",
                                		"dataobjectid":this.editSetData.id,
                                		"obj":JSON.stringify(set)
    	                            }
                                }).done(this.proxy(function(response){
                                	if(response.success){
                                		this.setDialog.dialog("close");
                                		this.refreshDataTable();
                                	}
                                })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                                	
                                })).complete(this.proxy(function(jqXHR,errorStatus){
                                	this.name.add(this.description).attr("disabled",false);
                                	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                                }));
                            }
                        })
                    },
                    {
                        text: this.i18n.cancel,
                        "class": "aui-button-link",
                        click: this.proxy(function () {
                            this.setDialog.dialog("close");
                        })
                    }
                ]
            };
            this.mode = "EDIT";
        }
        this.setDialog.dialog("option", dialogOptions).dialog("open");
    },
    destroy: function () {
        this._super();
        this.setDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.permissionset.setdialog.widgetjs = [];
com.sms.permissionset.setdialog.widgetcss = [];