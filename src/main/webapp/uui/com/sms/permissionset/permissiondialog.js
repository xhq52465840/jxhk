//@ sourceURL=com.sms.permissionset.permissiondialog
$.u.define('com.sms.permissionset.permissiondialog', null, {
    init: function (options) {
        this._options = options;
        this.setData=null;
    },
    afterrender: function (bodystr) {
    	this.i18n=com.sms.permissionset.permissiondialog.i18n;
    	this.permissionTree=this.qid("permissionTree");
    	
        this.permissionDialog = this.qid("div_permissiondialog").dialog({
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [
                {
                    text: this.i18n.bound,
                    click: this.proxy(function (e) {
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
                        		"dataobjectid":this.setData.id,
                        		"obj":JSON.stringify({"permissions":$.map(this.permissionTree.getCheckedNodes(),function(permission,idx){
                        			return parseInt(permission.id);
                        		})})
                            }
                        }).done(this.proxy(function(response){
                        	if(response.success){
                        		this.permissionDialog.dialog("close");
                        		this.refreshDataTable();
                        	}
                        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
                        	
                        })).complete(this.proxy(function(jqXHR,errorStatus){
                        	$(e.currentTarget).add($(e.currentTarget).next()).button("enable");
                        }));
                    })
                },
                {
                    text: "取消",
                    "class": "aui-button-link",
                    click: this.proxy(function () {
                        this.permissionDialog.dialog("close");
                    })
                }
            ],
            open: this.proxy(function () {
            	var setting = {
        			data: {
        				simpleData: {
        					enable: true
        				}
        			},
        			check:{
        				enable:true
        			}
        		};
            	
            	this.permissionDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
            	$.ajax({
            		url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: {
                		"tokenid":$.cookie("tokenid"),
                		"method":"stdcomponent.getbysearch",
                		"dataobject":"permission"
                    }
            	}).done(this.proxy(function(response){
            		if(response.success){
            			var currPermissions= [];
            			if(this.setData && this.setData.permissions){
	            			currPermissions=$.map(this.setData.permissions,function(perm,idx){
	            				return perm.id;
	            			});
            			}
            			var zNodes=$.map(response.data.aaData,function(perm,idx){
            				return {id:perm.id,pId:perm.parentId,name:perm.name,checked:$.inArray(perm.id,currPermissions)>-1};
            			});
            			this.permissionTree=$.fn.zTree.init(this.qid("permissionTree"), setting, zNodes);
            		}
            	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
            		
            	})).complete(this.proxy(function(jqXHR,errorStatus){
            		this.permissionDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
            	}));

            }),
            close: this.proxy(function () {
                this.permissionTree.destroy();
            }),
            create: this.proxy(function () {
            	
            })
        }); 
    },
    open: function (setdata) {
    	if(setdata){
    		this.setData=setdata;
	        this.permissionDialog.dialog("option","title",com.sms.permissionset.permissiondialog.i18n.boundPoint+setdata.name).dialog("open");
    	}
    },
    destroy: function () {
        this._super();
        this.permissionDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: true });

com.sms.permissionset.permissiondialog.widgetjs = ["../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"];
com.sms.permissionset.permissiondialog.widgetcss = [{id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}];