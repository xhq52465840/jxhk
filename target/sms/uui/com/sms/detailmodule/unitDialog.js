//@ sourceURL=com.sms.detailmodule.unitDialog
$.u.define('com.sms.detailmodule.unitDialog', null, {
    init: function (options) {
        this._options = options||{};
        this.objs = {};
    },
    afterrender: function (bodystr) {
        this.unitDialog = this.qid("div_unitDialog").dialog({
        	title:"单位",
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [
                {
                    text: "添加",
                    "class":"saveunit",
                    click: this.proxy(this.on_dialog_ok)
                },
                {
                    text: "取消",
                    "class": "aui-button-link",
                    click: this.proxy(this.on_dialog_cancel)
                }
            ],
            open: this.proxy(this.on_dialog_open),
            close: this.proxy(function () {
            	this.tree.destroy();
            	this.tree = null;
            }),
            create: this.proxy(function () {
            })
        }); 
    },
    /**
     * @title 获取节点名称
     * @param treeNode {object} 节点数据对象
     * @return void
     */
    getName:function(treeNode){
        var parentNode = null;
    	if(!this.objs.name){
    		this.objs.name = treeNode.name;
    	}else{
    		this.objs.name = treeNode.name + "/" + this.objs.name;	
    	}
    	if(treeNode.parentTId){
            parentNode = treeNode.getParentNode();
            if(parentNode.getParentNode()){
                this.getName(parentNode);
            }else{
                this.objs.name = "/" + this.objs.name;
            }
    	}
    },
    /**
     * @title 保存
     * @return void
     */
    on_dialog_ok:function(){
    	$.each(this.tree.invokeTreeMethod("getSelectedNodes"), this.proxy(function(k, v){
        	this.objs.id = v.id;
        	this.objs.name = "";
        	this.getName(v);
        }));
        this._options && this._options.funCall && typeof this._options.funCall=="function"?this._options.funCall(this.objs):null;
        this.unitDialog.dialog("close");
    },
    /**
     * @title 取消
     * @return void
     */
    on_dialog_cancel:function(){
    	this.unitDialog.dialog("close");
    },
    /**
     * @title 模态层打开时执行
     * @return void
     */
    on_dialog_open:function(){
    	if(!this.tree){
    		var clz = $.u.load("com.sms.plugin.organization.orgTree"); 
    		this.tree = new clz(this.unitDialog.parent().find("div[umid=tree]"), {
    			"activity": (this._options.activity || "") + "",
    			"treeOption": {
    				"callback": {
    					"beforeCheck": this.proxy(this.on_tree_beforeCheck),
    					"beforeClick": this.proxy(this.on_tree_beforeClick),
    					"beforeAsync": this.proxy(function(){ 
    						this.unitDialog.parent().block({"message":"数据加载...","overlayCSS":{"backgroundColor":"#fff"},"css":{"background": "transparent", "border": "none"}});
    					}),
    					"onAsyncSuccess": this.proxy(function(){
    						this.unitDialog.parent().unblock();
    					})
    				},
    				"async":{
    					"dataFilter": this.proxy(this.on_tree_datafilter)
    				}
    			}
    		});
    	}
    	this.tree.invokeTreeMethod("expandAll", true);
    	this.unitDialog.parent().find("button.saveunit").button("disable");
    },
    /**
     * @title ajax后数据处理事件
     * @param treeId {string} 树的treeId
     * @param parentNode {object} 父节点
     * @param responseData {object} 后台返回的数据
     * @return {Array} 节点集合
     */
    on_tree_datafilter:function(treeId,parentNode,responseData){ 
		var nodes=[];
		if(responseData){ 
			nodes = $.map(responseData.data.aaData, this.proxy(function(perm,idx){
				// if($.inArray(perm.id, this._options.orgIds) === -1){
					return {id:perm.id,pId:perm.parentId,name:perm.name};
				// }
			}));
		}
		return nodes;
	},
    /**
     * @title 节点选中前事件
     * @param treeId {string} 树的treeId
     * @param treeNode {object} 节点数据对象
     * @return bool 为父节点返回true
     */
    on_tree_beforeCheck:function(treeId,treeNode){
//    	if(!treeNode.isParent){
			this.tree.invokeTreeMethod("selectNode", treeNode);
	    	this.unitDialog.parent().find("button.saveunit").button("enable");
//		}
//		return treeNode.isParent?false:true;
    },
    /**
     * @title 节点点击前事件
     * @param treeId {string} 节点编号
     * @param treeNode {object} 节点数据对象
     * @param clickFlag {int} 点被点击后的选中操作类型
     * @return bool 为父节点返回true
     */
    on_tree_beforeClick:function(treeId,treeNode,clickFlag){
//    	if(!treeNode.isParent){
			this.tree.invokeTreeMethod("checkNode", treeNode, true, true)
	    	this.unitDialog.parent().find("button.saveunit").button("enable");
//		}
//		return treeNode.isParent?false:true;
    },
    open: function (data) { 
    	$.extend(this._options, data||{});
    	this.unitDialog.dialog().dialog("open");
    },
    destroy: function () {
        this.unitDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.detailmodule.unitDialog.widgetjs = ["../../../uui/widget/jqblockui/jquery.blockUI.js"];
com.sms.detailmodule.unitDialog.widgetcss = [];