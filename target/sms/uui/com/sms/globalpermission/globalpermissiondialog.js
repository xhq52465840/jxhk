//@ sourceURL=com.sms.globalpermission.globalpermissiondialog
$.u.define('com.sms.globalpermission.globalpermissiondialog', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.globalpermission.globalpermissiondialog.i18n;
    	// 权限集下拉框
    	this.selPermissionSet=this.qid("permissionsets");
    	
    	// 用户组下拉框
    	this.selUserGroup=this.qid("group");
    	
    	// 校验表单
        this.globalPermissionForm = this.qid("globalpermissionForm");
        this.globalPermissionForm.validate({
            rules: {
                permissions: "required",
                group:"required",
            },
            messages: {
                permissions: this.i18n.PermissionSetNotNull,
                group: this.i18n.userGrouptNotNull
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });

        this.globalPermissionDialog = this.qid("div_addglobalpermission").dialog({
            title:this.i18n.addPermission,
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [
                {
                    text: this.i18n.add,
                    click: this.proxy(function (e) {
                        if (this.globalPermissionForm.valid()) {
                            this.selPermissionSet.add(this.selUserGroup).attr("disabled",true);
                            $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
                            $.ajax({
                            	url: $.u.config.constant.smsqueryserver,
                                type:"post",
                                dataType: "json",
                                cache: false,
                                data: {
                            		"tokenid":$.cookie("tokenid"),
                            		"method":"stdcomponent.getbyid",
                            		"dataobject":"permissionSet",
                            		"dataobjectid":this.selPermissionSet.val()
	                            }
                            }).done(this.proxy(function(response){
                            	if(response.success){
                            		var groups=response.data.userGroups ? $.map(response.data.userGroups,function(group,idx){
                            			return group.id;
                            		}) : [];
                            		groups.push(parseInt(this.selUserGroup.val()));
                                    $.ajax({
                                    	url: $.u.config.constant.smsmodifyserver,
                                        type:"post",
                                        dataType: "json",
                                        cache: false,
                                        data: {
                                    		"tokenid":$.cookie("tokenid"),
                                    		"method":"stdcomponent.update",
                                    		"dataobject":"permissionSet",
                                    		"dataobjectid":this.selPermissionSet.val(),
                                    		"obj":JSON.stringify({"userGroups":groups})
        	                            }
                                    }).done(this.proxy(function(response){
                                    	if(response.success){
                                            this.globalPermissionDialog.dialog("close");
                                            this.refreshDataTable();
                                    	}
                                    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                                    	
                                    })).complete(this.proxy(function(jqXHR,errorStatus){
                                    	this.selPermissionSet.add(this.selUserGroup).attr("disabled",false);
                                    	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                                    }));
                            	}
                            })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                            	
                            }));
                        }
                    })
                },
                {
                    text: this.i18n.cancel,
                    "class": "aui-button-link",
                    click: this.proxy(function () {
                        this.globalPermissionDialog.dialog("close");
                    })
                }
            ],
            create: this.proxy(function () {

            }),
            open: this.proxy(function () {
            	this.selPermissionSet.add(this.selUserGroup).attr("disabled",true);
            	this.globalPermissionDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
            	$.when(
            			$.ajax({
		                    url: $.u.config.constant.smsqueryserver,
		                    dataType: "json",
		                    cache: false,
		                    data: {
			            		"tokenid":$.cookie("tokenid"),
			            		"method":"stdcomponent.getbysearch",
			            		"dataobject":"permissionSet",
			            		"columns": JSON.stringify([{ "data":"weight" } ]), 
			            		"order": JSON.stringify([{ "column":0, "dir":"asc"} ]),
			            		"rule":JSON.stringify([[{"key":"type","value":"global"}]])
			            	}
		                }),
		                $.ajax({
		                    url: $.u.config.constant.smsqueryserver,
		                    dataType: "json",
		                    cache: false,
		                    data: {
			            		"tokenid":$.cookie("tokenid"),
			            		"method":"stdcomponent.getbysearch",
			            		"dataobject":"userGroup"
			            	}
		                })
		        ).done(this.proxy(function(responsePermSets,responseGroups){
		        	if(responsePermSets[0].success){
		        		this.selPermissionSet.children(":not(:first)").remove();
                        $.each(responsePermSets[0].data.aaData,this.proxy(function(idx,set){
                        	$("<option/>").attr("value",set.id).text(set.name).appendTo(this.selPermissionSet);
                        }));
		        	}else{
		        		alert(responsePermSets[0].reason);
		        	}
		        	
		        	if(responseGroups[0].success){
		        		this.selUserGroup.children(":not(:first)").remove();
                        $.each(responseGroups[0].data.aaData,this.proxy(function(idx,set){
                        	$("<option/>").attr("value",set.id).text(set.name).appendTo(this.selUserGroup);
                        }));
		        	}else{
		        		alert(responseGroups[0].reason);
		        	}
		        	this.selPermissionSet.add(this.selUserGroup).attr("disabled",false);
		        	this.globalPermissionDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
		        }));
            }),
            close: this.proxy(function () {
                this.clearForm(this.globalPermissionForm);
                this.globalPermissionForm.validate().resetForm();
            })
        }); 
    },
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
    open: function (groupdata) {

        this.globalPermissionDialog.dialog("open");
    },
    destroy: function () {
        this._super();
        this.globalPermissionDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });



com.sms.globalpermission.globalpermissiondialog.widgetjs = ["../../../uui/widget/spin/spin.js",
                                                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.globalpermission.globalpermissiondialog.widgetcss = [];