//@ sourceURL=com.sms.unitconfig.roles
$.u.define('com.sms.unitconfig.roles', null, {
    init: function (options) {
        this._options = options;
        this.unit_id = $.urlParam().id ? parseInt($.urlParam().id) : null;
        this._select2PageLength = 10;
    },
    afterrender: function (bodystr) { 
    	this.i18n = com.sms.unitconfig.roles.i18n; 
    	this.table = this.$.find(".table"); 
    	if(this.unit_id){ 
    		this.loadUnitInfo(this.unit_id); 
    	} 
    	
    	// 绑定点击用户或用户组进入编辑模式事件
    	this.table.on("click",".editable",this.proxy(this.changeEditMode)); 

    	// 更新当前行编辑
    	this.table.on("click",".save-edit",this.proxy(this.saveEditResult));
    	
    	// 取消当前行编辑
    	this.table.on("click",".cancel-edit",this.proxy(this.exitEditMode));
    },
    /**
     * @title 加载机构信息
     * @param unit_id 机构id
     */
    loadUnitInfo:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"getunitroles",
				unit:unit_id
	        }
		},this.table).done(this.proxy(function(response){
			if(response.success){
				var $tbody=this.table.find("tbody").empty();
		    	$.each(response.data,this.proxy(function(idx,role){
		    		this.buildTr(role,$tbody);
		    	}));
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		})).complete(this.proxy(function(jqXHR,errorStatus){
			
		}));
    	
    },
    /**
     * @title 创建表格行
     * @param role 角色数据
     * @param $container 父节点
     * @return 新增加的行对象
     */
    buildTr:function(role,$container){
    	if(!role) return;
    	role.users = role.users || [];
    	role.userGroups = role.userGroups || [];
    	var $tr = $('<tr>'+
						'<td calss="unit-config-role-name">'+role.name+'</td>'+
						'<td class="unit-config-role-users">'+
							'<span class="editable">'+
								(role.users && role.users.length > 0 ? '<ul class="list-unstyled list-inline"></ul><span class="glyphicon glyphicon-pencil"></span>' : '<em>'+this.i18n.addUser+'</em>')+
							'</span>'+
							'<span class="edit-mode hidden">'+
								'<input type="hidden" class="select2 select2-users form-control" style="display:block;"/>'+
								'<div class="block-help"><small>'+this.i18n.enterNum+'</small></div>'+
							'</span>'+
						'</td>'+
						'<td style="display:none">'+
							'<span class="editable">'+
							(role.userGroups && role.userGroups.length > 0 ? '<ul class="list-unstyled list-inline"></ul><span class="glyphicon glyphicon-pencil"></span>' : '<em>'+this.i18n.addUserGroup+'</em>')+
							'</span>'+
							'<span class="edit-mode hidden">'+
								 '<input type="hidden" class="select2 select2-groups form-control" style="display:block;"/><div class="block-help"><small>'+this.i18n.enterUserGroupName+'</small></div>'+
							'</span>'+
						'</td>'+
						'<td class="restfultable-operations">'+
							'<span class="edit-mode hidden">'+
							'<button class="btn btn-default btn-sm save-edit">'+this.i18n.update+'</button><button class="btn btn-link cancel-edit">'+this.i18n.cancel+'</button>'+
							'</span>'+
						'</td>'+
					'</tr>');
    	$container && $tr.appendTo($container);
		$tr.data("data",role);
		role.users && role.users.length<1 && $tr.find("td.unit-config-role-users").addClass("no-value");
		role.users && $.each(role.users,this.proxy(function(idx,user){
			$('<li><img src="'+user.avatarUrl+'" height="16" width="16"/>&nbsp;<small>'+user.fullname+'</small></li>').appendTo($tr.find(".unit-config-role-users ul"));
		}));
		role.userGroups && role.userGroups.length<1 && $tr.find("td.unit-config-role-groups").addClass("no-value");
		role.userGroups && $.each(role.userGroups,this.proxy(function(idx,group){
			$('<li><span class="unit-config-icon unit-config-icon-person"></span><small>'+group.name+'</small></li>').appendTo($tr.find(".unit-config-role-groups ul"));
		}));
		return $tr;
    },
    /**
     * @title 切入编辑模式
     * @param e
     */
    changeEditMode:function(e){
    	var $tr = $(e.currentTarget).closest("tr"),
    		$oldSelectedTr = this.table.find("tr.focused"),
    		data=$tr.data("data");
    	if($oldSelectedTr.length > 0){
    		$oldSelectedTr.find(":hidden.select2").select2("destroy");
    	}
    	
    	$tr.find(".select2-users").select2({
    		width:$tr.children(".unit-config-role-users").width(),
    		multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
	            data: this.proxy(function(term, page){
	            	return {
	            		"tokenid": $.cookie("tokenid"),
	    				"method": "stdcomponent.getbysearch",
	    				"dataobject": "user",
	    				"start": (page - 1) * this._select2PageLength,
	    				"length": this._select2PageLength,
	    				"rule": JSON.stringify([[{"key":"username", "op":"like", "value":term}, {"key":"fullname", "op":"like", "value":term}]])
	    			};
	            }),
		        results:this.proxy(function(response,page,query){ 
		        	if(response.success){
		        		return {results:response.data.aaData, more: (page * this._select2PageLength) < response.data.iTotalRecords };
		        	}
		        })
    		},
	        formatResult:function(item){
	        	return "<img src='"+item.avatarUrl+"' width='16' height='16'/>&nbsp;"+item.fullname+"-"+item.username;
	        },
	        formatSelection:function(item){
	        	return item.fullname;
	        }
    	}).select2("data",data.users);
    	
    	$tr.find(".select2-groups").select2({
    		width:$tr.children(".unit-config-role-groups").width(),
    		multiple:true,
    		ajax:{
    			url:$.u.config.constant.smsqueryserver,
    			dataType: "json",
	            data: this.proxy(function(term,page){
	            	return {
	            		tokenid:$.cookie("tokenid"),
	    				method:"stdcomponent.getbysearch",
	    				dataobject:"userGroup",
	    				start: (page - 1) * this._select2PageLength,
	    				length: this._select2PageLength,
	    				rule:JSON.stringify([[{key:"name",op:"like","value":term}]])
	    			};
	            }),
		        results:this.proxy(function(response,page,query){ 
		        	if(response.success){
		        		return {results:response.data.aaData, more: (page * this._select2PageLength) < response.data.iTotalRecords};
		        	}
		        })
    		},
	        formatResult:function(item){
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
    	}).select2("data",data.userGroups);
    	
    	this.table.find("tr").removeClass("focused");
    	this.table.find(".editable").removeClass("hidden");
    	this.table.find(".edit-mode").addClass("hidden");
    	$tr.addClass("focused");
    	$tr.find(".editable").addClass("hidden");
    	$tr.find(".edit-mode").removeClass("hidden");
    },
    /**
     * @title 保存编辑信息
     * @param e
     */
    saveEditResult:function(e){
    	var $tr=$(e.currentTarget).closest("tr"),
    		role = $tr.data("data"),
    		users=$tr.find(":hidden.select2-users").select2("data"),
    		userGroups=$tr.find(":hidden.select2-groups").select2("data");
    	$.u.ajax({
			url: $.u.config.constant.smsmodifyserver,
			type: "post",
            dataType: "json",
            data:{
				tokenid: $.cookie("tokenid"),
				method: "setunitroles",
				obj: JSON.stringify({
					unit: this.unit_id,
					role: role.id,
					users: $.map(users, function(user, idx){ return user.id; }),
					userGroups: $.map(userGroups, function(group, idx){ return group.id; })
				})
	        }
		},$tr).done(this.proxy(function(response){
			if(response.success){ 
				role.users=users;
		    	role.userGroups=userGroups;
		    	$tr.replaceWith(this.buildTr(role));
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		})).complete(this.proxy(function(jqXHR,errorStatus){
			
		}));
    	
    },
    /**
     * @title 取消当前行编辑模式
     * @param e
     */
    exitEditMode:function(e){
    	var $tr=$(e.currentTarget).closest("tr");
    	$tr.removeClass("focused").find(".editable").removeClass("hidden");
    	$tr.find(".edit-mode").addClass("hidden");
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.roles.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                     '../../../uui/widget/select2/js/select2.min.js',
                                     "../../../uui/widget/spin/spin.js",
                                     "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                     "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.roles.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];