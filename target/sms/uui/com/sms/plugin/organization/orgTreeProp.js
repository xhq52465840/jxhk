//@ sourceURL=com.sms.plugin.organization.orgTreeProp
$.u.define("com.sms.plugin.organization.orgTreeProp", "com.sms.plugin.render.baseprop", {
    // table段
    table_html: function (data, full) { return data; },
    table_render: function (data, full, cellsel) { this.cellsel = cellsel; },
    // edit段
    edit_html: function (setting) { 
    	return "<div class='form-group'>"+
					"<label class='col-sm-2 control-label'>"+setting.name+(setting.required === true ? "<span class='text-danger' style='position:absolute;'>*</span>" : "")+"</label>"+
					"<div class='col-sm-8'>"+
						"<div class='input-group'>"+
							"<input type='text' id='"+this._id+"-unit-text' class='form-control input-sm' name='"+setting.key+"' />"+
							"<input type='hidden' id='"+this._id+"-unit-value' class='form-control input-sm' name='"+setting.key+"' />"+
							"<span class='input-group-btn'>"+
								"<button class='btn btn-default btn-sm' id='"+this._id+"-button-showorg'><span class='glyphicon glyphicon-home'></span></button>"+
							"</span>"+
						"</div>"+
						(setting.description ? "<div class='help-block'><small>"+setting.description+"</small></div>" : "")+
					"</div>"+
				"</div>"; 
    },
    edit_render: function (setting, sel) {
    	this.editSel = sel;
    	this.editSetting = setting;
    	this.$unitText = $("#"+this._id+"-unit-text",this.editSel);
    	this.$unitValue=$("#"+this._id+"-unit-value",this.editSel);
    	this.$showOrgBtn = $("#"+this._id+"-button-showorg",this.editSel);
    	this.$orgMenu = $("<div class='org-menu hidden' id='"+this._id+"-org-menu' style='position:absolute;z-index:9999;background:white;border:1px solid #ddd;border-top:none;max-height:300px;overflow-y:auto;'><ul id='"+this._id+"-org-tree' class='ztree' style='margin-top:0px;width:160px;'></ul></div>").appendTo("body");
    	
    	var offset = this.$unitText.offset();
    	var setting = {
			data: {
				simpleData: {
					enable: true
				}
			},
			async:{
				url:$.u.config.constant.smsqueryserver,
				type:"post",
				enable:true,
				otherParam:{
					"tokenid":$.cookie("tokenid"),
            		"method":"getAllOrganizations"
				},
				dataFilter:function(treeId,parentNode,responseData){
					var nodes=[];
					if(responseData){
						nodes = $.map(responseData.data.aaData,function(perm,idx){
            				return {id:perm.id,pId:perm.parentId,name:perm.name};
            			});
					}
					return nodes;
				}
			},
			callback: {
				onClick: this.proxy(function(event, treeId, treeNode){
					this.$unitText.val(treeNode.name);
					this.$unitValue.val(treeNode.id);
					this.$orgMenu.addClass("hidden");
				})
			}
		};
    	 $.fn.zTree.init($("#"+this._id+"-org-tree"), setting);
    	 
    	 this.$showOrgBtn.click(this.proxy(function(e){
    		 e.preventDefault();
    		 var offset=this.$unitText.offset();
    		 this.$orgMenu.css({
    			"top":offset.top+this.$unitText.outerHeight(true)+"px",
    			"left":offset.left,
    			"width":this.$unitText.parent().outerWidth(true)
    		}).removeClass("hidden"); 
    		$("body").bind("mousedown",this.proxy(function(event){
    			if(!(event.target.id == (this._id+"-button-showorg") || event.target.id == (this._id+"-org-menu") || $(event.target).parents("#"+this._id+"-org-menu").length>0 )){
    				this.$orgMenu.addClass("hidden");
    				$("body").unbind("mousedown");
    			}
    		}));
    	 }));
    },
    edit_getdata: function () {
    	var temp = {};
    	temp[this.editSetting.key]=this.$unitValue.val();
    	return temp;
    },
    edit_disable:function(){
    	this.$unitText.attr("disabled",true);
    	this.$showOrgBtn.addClass("disabled");
    },
    edit_enable:function(){
    	this.$unitText.attr("disabled",false);
    	this.$showOrgBtn.removeClass("disabled");
    },
    edit_valid:function(){
    	var result = true;
    	this.editSel.find(".required-message").remove();
    	if(this.editSetting.required === true && !$.trim(this.$unitText.val())){
    		result = false;
    		$("<div class='required-message text-danger'>"+this.editSetting.name+""+com.sms.plugin.organization.orgTreeProp.i18n.notNull+"</div>").appendTo(this.editSel.find(".col-sm-8"));
    	}
    	return result;
    },
    // read段
    read_html: function (setting) { return data; },
    read_render: function (setting, sel) { },
    destroy:function(){
    	$.fn.zTree.destroy(this._id+"-org-tree");
    	this.$orgMenu.remove();
    	this._super();
    }
}, { usehtm: false, usei18n: true });

com.sms.plugin.organization.orgTreeProp.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                                    "../../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js"];
com.sms.plugin.organization.orgTreeProp.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                                     {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"},
                                                     {id:"ztreestyle",path:"../../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"}]