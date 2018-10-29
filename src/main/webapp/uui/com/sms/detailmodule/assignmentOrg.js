//@ sourceURL=com.sms.detailmodule.assignmentOrg
$.u.define('com.sms.detailmodule.assignmentOrg', null, {
    init: function (option) {
    	this._options = option || {};
    	this._org = {};
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.assignmentOrg.i18n;
    	this.orgDialog = this.qid("orgDialog").dialog({
        	title: this.i18n.title,
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [
                {
                    text: this.i18n.save,
                    "class":"saveorg",
                    click: this.proxy(this.on_dialog_ok)
                },
                {
                    text: this.i18n.cancel,
                    "class": "aui-button-link",
                    click: this.proxy(this.on_dialog_cancel)
                }
            ],
            open: this.proxy(this.on_dialog_open),
            close: this.proxy(function () {
            	this.tree.destroy();
            	this.tree = null;
            })
        }); 
    },
    getName:function(treeNode){
        var parentNode = null;
    	if(!this._org.name){
    		this._org.name = treeNode.name;
    	}else{
    		this._org.name = treeNode.name + "/" + this._org.name;	
    	}
    	if(treeNode.parentTId){
            parentNode = treeNode.getParentNode();
            if(parentNode.getParentNode()){
        		this.getName(parentNode);
            }else{
                this._org.name = "/" + this._org.name;
            }
    	}
    },
    on_dialog_ok:function(){
    	$.each(this.tree.invokeTreeMethod("getSelectedNodes"), this.proxy(function(k, v){
        	this._org.id = v.id;
        	this._org.name = "";
        	this.getName(v);
        }));
    	this.on_afterSave(this._org);
    },
    on_dialog_cancel:function(){
    	this.orgDialog.dialog("close");
    },
    on_dialog_open:function(){
    	if(!this.tree){
    		var clz = $.u.load("com.sms.plugin.organization.orgTree"); 
    		this.tree = new clz(this.orgDialog.parent().find("div[umid=tree]"), {
    			"activity": (this._options.activity || "") + "",
    			"treeOption": {
    				"callback": {
    					"beforeCheck": this.proxy(this.on_tree_beforeCheck),
    					"beforeClick": this.proxy(this.on_tree_beforeClick),
    					"beforeAsync": this.proxy(function(){ 
    						this.orgDialog.parent().block({"message":"数据加载...","overlayCSS":{"backgroundColor":"#fff"},"css":{"background": "transparent", "border": "none"}});
    					}),
    					"onAsyncSuccess": this.proxy(function(){
    						this.orgDialog.parent().unblock();
    					})
    				},
    				"async":{
    					"dataFilter": this.proxy(this.on_tree_datafilter)
    				}
    			}
    		});
    	}
    	this.tree.invokeTreeMethod("expandAll", true);
    	this.orgDialog.parent().find("button.saveorg").button("disable");
    },
    on_tree_datafilter:function(treeId,parentNode,responseData){ 
		var nodes=[];
		if(responseData){ 
			nodes = $.map(responseData.data.aaData, this.proxy(function(perm,idx){
				return {id:perm.id,pId:perm.parentId,name:perm.name};
			}));
		}
		return nodes;
	},
    on_tree_beforeCheck:function(treeId,treeNode){
		this.tree.invokeTreeMethod("selectNode", treeNode);
    	this.orgDialog.parent().find("button.saveorg").button("enable");
    },
    on_tree_beforeClick:function(treeId,treeNode,clickFlag){
		this.tree.invokeTreeMethod("checkNode", treeNode, true, true)
    	this.orgDialog.parent().find("button.saveorg").button("enable");
    },
    open: function (data) { 
    	$.extend(this._options, data||{});
    	this.orgDialog.dialog().dialog("open");
    },
    // for override
    on_afterSave: function(org){},
    destroy: function () {
        this.orgDialog.dialog("destroy").remove();
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.assignmentOrg.widgetjs = [];
com.sms.detailmodule.assignmentOrg.widgetcss = [];