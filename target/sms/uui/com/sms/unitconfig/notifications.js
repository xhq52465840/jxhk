//@ sourceURL=com.sms.unitconfig.notifications
$.u.define('com.sms.unitconfig.notifications', null, {
    init: function (options) {
        this._options = options;
        this.unit_id = $.urlParam().id;
        this.unit_id = this.unit_id ? parseInt(this.unit_id) : null;
        this.notificationSchemeData = null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unitconfig.notifications.i18n;
    	this.table=this.qid("table");
    	
    	// 绑定编辑通知设置事件
    	this.qid("button-edit-notification").click(this.proxy(this.editScheme));
    	
    	// 绑定“使用不同方案”事件
    	this.qid("button-change-scheme").click(this.proxy(this.changeScheme));
    	
    	if(this.unit_id){ 
    		this.loadNotifications(this.unit_id);
    	}
    },
    /**
     * @title 加载机构信息
     * @param unit_id 机构id
     */
    loadNotifications:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"getnotificationschemeitems",
				unit:unit_id
	        }
		},this.table).done(this.proxy(function(response){
			if(response.success){
				var $tbody = this.table.find("tbody").empty(),
					$unitContainer=this.qid("units"),
					$tr=null,
					$ul=null;
				this.notificationSchemeData=response.data;
				this.validateOperateButtons(response.data.action);
				this.qid("unit-config-notification-scheme-name").text(response.data.name);
				this.qid("unit-count").text(response.data.units.length);
				$.each(response.data.units,this.proxy(function(idx,unit){
					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo($unitContainer);
				}));
				$.each(response.data.events.aaData,this.proxy(function(idx,notification){
					$tr = $("<tr><td>"+notification.name+(notification.system ? "(系统)" : "")+"</td><td></td></tr>").appendTo($tbody);
					$ul=$("<ul style='padding-left:15px;'/>").appendTo($tr.children("td:eq(1)"));
					notification.items && $.each(notification.items,function(idx,items){
            			$("<li>"+items.type+"("+(items.parameter==undefined?"任何人":items.parameter)+")</li>").appendTo($ul);
            		});
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
    		if($.inArray("编辑通知方案",perms)<0){
    			this.qid("button-edit-notification").remove();
    		}
    		if($.inArray("使用不同的方案",perms)<0){
    			this.qid("button-change-scheme").remove();
    		}
    	}else{
    		this.qid("button-operate").remove();
    	}
    },
    /**
     * @title 编辑通知方案
     * @param e
     */
    editScheme:function(e){
    	window.location.href=this.getabsurl("../secure/editNotificationSchemes.html?id=")+this.notificationSchemeData.id;
    },
    /**
     * @title 使用不同的方案
     * @param e
     */
    changeScheme:function(e){
    	if(!this.changeNotificationScheme){
    		$.u.load('com.sms.common.stdComponentOperate');
    		this.changeNotificationScheme = new com.sms.common.stdComponentOperate($("div[umid='changeNotificationScheme']",this.$),{
        		dataobject:"unitConfig",
        		fields:[{name:"notificationScheme",label:this.i18n.scheme,dataType:"int",type:"select",rule:{required:true},message:this.i18n.schemeNotNull,option:{
        			params:{"dataobject":"notificationScheme"},
        			ajax:{
        				"data":function(term,page){
        					return {
        						"tokenid":$.cookie("tokenid"),
    	        				"method":"stdcomponent.getbysearch",
        						"dataobject":"notificationScheme",
        						"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
        					};
        				}
        			}
        		}}]
        	});
    	}
    	this.changeNotificationScheme.open({
    		data:{id:this.notificationSchemeData.config,notificationScheme:this.notificationSchemeData.id},
    		title:com.sms.unitconfig.notifications.i18n.tip,
    		afterEdit:function(comp,formdata){
    			window.location.reload();
    		}
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.notifications.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',"../../../uui/widget/spin/spin.js"
                                             , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                             , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.notifications.widgetcss = [];