//@ sourceURL=com.sms.unit.organizationDialog
$.u.define('com.sms.unit.organizationDialog', null, {
    init: function (options) {
        this._options = options;
        this.setData=null;
    },
    afterrender: function (bodystr) {
    	this.organizationTree=this.qid("organizationTree");
    	
        this.organizationDialog = this.qid("div_organizationdialog").dialog({
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [
                {
                    text: "确定",
                    click: this.proxy(function (e) {
                        $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
                        
                        var objs = [];
                        $.each(this.organizationTree.getCheckedNodes(),this.proxy(function(k,v){
                        	objs.push({
                        		"id":parseInt(v.id)
                        	})
                        }));
                        
                        $.ajax({
                        	url: $.u.config.constant.smsmodifyserver,
                            type:"post",
                            dataType: "json",
                            cache: false,
                            data: {
                        		"tokenid":$.cookie("tokenid"),
                        		"method":"updateAllOrg",
                        		"dataobject":"organization",
                        		"objs":JSON.stringify(objs),
                        		"unitId":this.setData.id
                            }
                        }).done(this.proxy(function(response){
                        	if(response.success){
                        		this.organizationDialog.dialog("close");
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
                        this.organizationDialog.dialog("close");
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
        				enable:true,
        				chkboxType: { "Y": "", "N": "" }
        			}
        		};
            	
            	this.organizationDialog.parent().find(".ui-dialog-buttonpane button").button("disable");
            	$.u.ajax({
            		url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: {
                		"tokenid":$.cookie("tokenid"),
                		"method":"getAllOrganizations"
                    }
            	},this.qid("div_organizationdialog")).done(this.proxy(function(response){
            		if(response.success){
            			var currorganization= [];
            			if(this.setData && this.setData.organization){
	            			currorganization=$.map(this.setData.organization,function(perm,idx){
	            				return perm.id;
	            			});
            			}
            			var zNodes=$.map(response.data.aaData,function(perm,idx){
            				return {id:perm.id,pId:perm.parentId,name:perm.name,checked:$.inArray(perm.id,currorganization)>-1};
            			});
            			this.organizationTree=$.fn.zTree.init(this.qid("organizationTree"), setting, zNodes);
            			this.organizationTree.expandAll(true);
            		}
            	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
            		
            	})).complete(this.proxy(function(jqXHR,errorStatus){
            		this.organizationDialog.parent().find(".ui-dialog-buttonpane button").button("enable");
            	}));

            }),
            close: this.proxy(function () {
                this.organizationTree.destroy();
            }),
            create: this.proxy(function () {
            	
            })
        }); 
    },
    open: function (setdata) {
    	if(setdata){
    		this.setData=setdata;
	        this.organizationDialog.dialog("option","title","维护组织结构："+setdata.name).dialog("open");
    	}
    },
    destroy: function () {
        this._super();
        this.organizationDialog.dialog("destroy").remove();
    }
}, { usehtm: true, usei18n: false });

com.sms.unit.organizationDialog.widgetjs = ["../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"];
com.sms.unit.organizationDialog.widgetcss = [{id:"ztreestyle",path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}];