"use strict";
//@ sourceURL=com.sms.plugin.organization.orgTree
/**
 * @desc 下拉组织树，options中指定activity则下拉关联过该activity的机构的组织，否则下拉整个组织树
 * @author tchen@usky.com.cn
 * @date 2016/11/11
 */
$.u.define('com.sms.plugin.organization.orgTree', null, {
	init: function(options) {
		/** options结构
		 ** {
		 **		activity:'',		 信息id
		 **		treeOption:{} 	 zTree的option，可以覆盖zTree的option定义，也支持override指定的方法来重写zTree的option
		 **	}
		 **/
		this._options = options || {};
	},
	afterrender: function(bodystr) {
		this.treeSetting = $.extend(true, {
			data: {
				simpleData: {
					enable: true
				}
			},
			check: {
				enable: true,
				chkStyle: "radio",
				radioType: "all",
				chkboxType: {
					"Y": "",
					"N": ""
				}
			},
			async: {
				url: $.u.config.constant.smsqueryserver,
				type: "post",
				enable: true,
				otherParam: {
					"tokenid": $.cookie("tokenid"),
					"method": "getAllOrganizations",
					"activity": (this._options.type == "tem" ? "" : this._options.activity || "") + ""
				},
				dataFilter: this.on_tree_datafilter
			},
			callback: {
				beforeCheck: this.on_tree_beforeCheck,
				beforeClick: this.on_tree_beforeClick,
				beforeAsync: this.on_tree_beforeAsync,
				onAsyncSuccess: this.on_tree_onAsyncSuccess
			},
			view: {
				selectedMulti: false
			}
		}, this._options.treeOption || {});
		this.tree = $.fn.zTree.init(this.qid("tree"), this.treeSetting);
	},
	// for invoke ztree's function
	invokeTreeMethod: function(method) {
		var result = null;
		if (this.tree[method]) {
			var args = $.grep(arguments, function(item, idx) {
				return idx > 0;
			});
			result = this.tree[method].apply(this.tree, args);
		} else {
			throw new Error(method + " is not function");
		}
		return result;
	},
	on_tree_datafilter: function(treeId, parentNode, responseData) {
		var nodes = [];
		if (responseData) {
			nodes = $.map(responseData.data.aaData, function(perm, idx) {
				return {
					"id": perm.id,
					"pId": perm.parentId,
					"name": perm.name
				};
			});
		}
		return nodes;
	},
	// for ztree default method
	on_tree_beforeCheck: function(treeId, treeNode) {},
	// for ztree default method
	on_tree_beforeClick: function(treeId, treeNode, clickFlag) {},
	// for ztree default method
	on_tree_beforeAsync: function() {},
	// for ztree default method
	on_tree_onAsyncSuccess: function() {},
	destroy: function() {
		this.tree.destroy();
		this._super();
	}
}, {
	usehtm: true,
	usei18n: false
});


com.sms.plugin.organization.orgTree.widgetjs = ['../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js'];
com.sms.plugin.organization.orgTree.widgetcss = [{
	path: '../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css'
}];