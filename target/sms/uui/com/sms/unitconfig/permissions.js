//@ sourceURL=com.sms.unitconfig.permissions
$.u.define('com.sms.unitconfig.permissions', null, {
    init: function (options) {
        this._options = options;
        this.unit_id = $.urlParam().id ? parseInt($.urlParam().id) : null;
        this.permissionSchemeData=null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unitconfig.permissions.i18n;
    	this.table=this.qid("table");

    	// 编辑当前方案
    	this.qid("button-edit-permissions").click(this.proxy(this.editScheme));
    	
    	// 绑定切换权限方案事件
    	this.qid("button-change-scheme").click(this.proxy(this.changeScheme));
    	
    	if(this.unit_id){ 
    		this.loadPermissions(this.unit_id);
    	}
    },
    /**
     * @title 加载权限方案信息
     * @param unit_id 机构id
     */
    loadPermissions:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"getpermissionschemepermissionset",
				unit:unit_id,
				manage:false
	        }
		},this.$).done(this.proxy(function(response){
			if(response.success){
				var $tbody = this.table.find("tbody").empty(),
					$unitContainer=this.qid("units"),
					$tr=null,
					$ul=null;
				this.permissionSchemeData = response.data;
				this.qid("unit-config-permission-scheme-name").text(response.data.name);
				this.qid("unit-count").text(response.data.units.length);
				this.validateOperateButtons(response.data.action);
				$.each(response.data.units,this.proxy(function(idx,unit){
					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo($unitContainer);
				}));
				$.each(response.data.permissionSets.aaData,this.proxy(function(idx,perm){
					$tr = $("<tr><td>"+perm.name+"</td><td></td></tr>").appendTo($tbody);
					if(perm.items && perm.items.length>0){
						$ul=$("<ul style='padding-left:20px;'/>").appendTo($tr.children("td:last"));
						$.each(perm.items,this.proxy(function(idx,item){
							$("<li>"+item.type+"("+(item.parameter==undefined?"任何人":item.parameter)+")</li>").appendTo($ul);
						}));
					}
				}));
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		})).complete(this.proxy(function(jqXHR,errorStatus){
			
		}));
    },
    /**
     * 权限校验操作按钮
     * @param perms 权限点
     */
    validateOperateButtons:function(perms){
    	if(perms){
    		if($.inArray("修改权限",perms)<0){
    			this.qid("button-edit-permissions").remove();
    		}
    		if($.inArray("使用不同的方案",perms)<0){
    			this.qid("button-change-scheme").remove();
    		}
    	}else{
    		this.qid("button-operate").remove();
    	}
    },
    /**
     * @title 编辑权限方案
     * @param e
     */
    editScheme:function(e){
    	window.location.href=this.getabsurl("../secure/configPermissionSchemes.html?id=")+this.permissionSchemeData.id;
    },
    /**
     * @title 切换不同的方案
     * @param e
     */
    changeScheme:function(e){
    	if(!this.changePermissionScheme){
	    	$.u.load("com.sms.common.stdComponentOperate");
	    	this.changePermissionScheme = new com.sms.common.stdComponentOperate($("div[umid='changePermissionScheme']",this.$),{
	    		title:this.i18n.relate,
	    		dataobject:"unitConfig",
	    		fields:[{name:"permissionScheme",label:this.i18n.scheme,dataType:"int",type:"select",rule:{required:true},message:this.i18n.schemeNotNull,option:{
					params:{"dataobject":"permissionScheme"},
	    			ajax:{
	    				"data":function(term,page){
	    					return {
	    						"tokenid":$.cookie("tokenid"),
		        				"method":"stdcomponent.getbysearch",
	    						"dataobject":"permissionScheme",
	    						"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
	    					};
	    				}
	    			}
	    		}}]
	    	});
    	}
    	this.changePermissionScheme.open({
    		data:{id:this.permissionSchemeData.config,permissionScheme:this.permissionSchemeData.id},
    		title:com.sms.unitconfig.permissions.i18n.relateSafe,
    		afterEdit:function(comp,formdata){
    			window.location.reload();
    		}
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.permissions.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                           "../../../uui/widget/spin/spin.js",
                                           "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                           "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.permissions.widgetcss = [];