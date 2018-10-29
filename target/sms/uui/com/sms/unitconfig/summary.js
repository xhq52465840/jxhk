//@ sourceURL=com.sms.unitconfig.summary
$.u.define('com.sms.unitconfig.summary', null, {
    init: function (options) {
        this._options = options;
        this.unit_id = $.urlParam().id ? parseInt($.urlParam().id) : null;
    },
    afterrender: function (bodystr) {
    	if(!this.unit_id){ 
    		window.location.href = "/sms/uui/com/sms/dash/DashBoard.html";
    	}else{
    		this.loadUnitConfigSummary(this.unit_id);
    	}
    },
    /**
     * @title 加载机构概要信息
     * @param unit_id 机构id
     */
    loadUnitConfigSummary:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"getunitconfigsummary",
				unit:unit_id
	        }
		},this.$).done(this.proxy(function(response){
			if(response.success){ 
				this.qid("unit-description").html(response.data.unitDescription);
				this.buildActivityTypeScheme(response.data);
				this.buildWorkflowScheme(response.data);
				this.buildActivityTypeScreenScheme(response.data);
				this.buildFieldConfigScheme(response.data);
				this.buildNotificationScheme(response.data);
				this.buildPermissionScheme(response.data);
				this.buildRoles(response.data);
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		})).complete(this.proxy(function(jqXHR,errorStatus){
			
		}));
    },
    /**
     * 生成安全信息类型
     * @param data 
     */
    buildActivityTypeScheme:function(data){
    	var $ul = this.qid("unit-activitytype-scheme");
    	this.qid("unit-activitytype-scheme-name").text(data.activityTypeSchemeDisplayName).attr("href","ActivityTypes.html?id="+data.unit);
    	data.activityTypeSchemeTypes && $.each(data.activityTypeSchemeTypes,this.proxy(function(idx,activityType){
    		$('<li>'+
				'<span class="unit-config-list-label">'+
					'<img class="unit-config-icon unit-config-icon-activitytype" width="16" height="16" src="../../../'+activityType.url+'"/>'+
					'<span class="unit-config-activitytype-name">'+activityType.name+'</span>'+
				'</span>'+
			  '</li>').appendTo($ul);
    	}));
    },
    /**
     * 生成工作流方案
     * @param data 
     */
    buildWorkflowScheme:function(data){
    	var $ul = this.qid("unit-workflow-scheme");
    	this.qid("unit-workflow-scheme-name").text(data.workflowSchemeDisplayName).attr("href","Workflows.html?id="+data.unit);
    	data.workflows && $.each(data.workflows,this.proxy(function(idx,workflow){
    		$('<li>'+
				'<span class="unit-config-icon unit-config-icon-workflow"></span>'+
				(data.admin ? '<a href="../workflow/WorkflowDesign.html?id=' + workflow.wsd_id + '">' + workflow.name + '</a>' : workflow.name)+
				(workflow['dft'] == 'Y' ? '&nbsp;<span class="label label-default">默认</span>' : '')+
			  '</li>').appendTo($ul);
    	}));
    },
    /**
     * 生成安全信息类型界面方案
     * @param data
     */
    buildActivityTypeScreenScheme:function(data){
    	var $ul = this.qid("unit-activitytype-screen-scheme");
    	this.qid("unit-activitytype-screen-scheme-name").text(data.activityTypeFieldScreenSchemeDisplayName).attr("href","Screen.html?id="+data.unit);
    	data.activityTypeFieldScreenSchemeSchemes && $.each(data.activityTypeFieldScreenSchemeSchemes,this.proxy(function(idx,scheme){
    		$('<li>'+
				'<span class="unit-config-icon unit-config-icon-screen"></span>'+
				(data.admin ? '<a href="../fieldscreen/ConfigureScreenScheme.html?id=' + scheme.id + '">' + scheme.name + '</a>' : scheme.name)+
				(scheme['default'] ? '&nbsp;<span class="label label-default">默认</span>' : '')+
			  '</li>').appendTo($ul);
    	}));
    },
    /**
     * 生成活字段配置方案
     * @param data
     */
    buildFieldConfigScheme:function(data){
    	var $ul = this.qid("unit-activitytype-field-config-scheme");
    	this.qid("unit-activitytype-field-config-scheme-name").text(data.fieldLayoutSchemeDisplayName).attr("href","Fields.html?id="+data.unit);
    	data.fieldLayoutSchemeLayouts && $.each(data.fieldLayoutSchemeLayouts,this.proxy(function(idx,scheme){
    		$('<li>'+
				'<span class="unit-config-icon unit-config-icon-field"></span>'+
				(data.admin ? '<a href="../customfields/ConfigureFieldLayout.html?id=' + scheme.id + '">' + scheme.name + '</a>' : scheme.name) +
				(scheme['default'] ? '&nbsp;<span class="label label-default">默认</span>' : '')+
			  '</li>').appendTo($ul);
    	}));
    },
    /**
     * @title 生成通知方案
     * @param data
     */
    buildNotificationScheme:function(data){
    	this.qid("unit-notification-scheme-name").text(data.notificationSchemeDisplayName).attr("href","../secure/editNotificationSchemes.html?id="+data.notificationScheme);
    },
    /**
     * @title 生成权限方案
     * @param data
     */
    buildPermissionScheme:function(data){
    	this.qid("unit-permission-scheme-name").text(data.permissionSchemeDisplayName).attr("href","Permissions.html?id="+data.unit);
    },
    /**
     * @title 生成角色
     * @param data
     */
    buildRoles:function(data){
    	this.qid("unit-responsibleuser").attr("href", "../ViewProfile.html?id=" + data.unitResponsibleUser).text(data.unitResponsibleUserFullName || "");
    	this.qid("unit-roles").attr("href", "Roles.html?id=" + data.unit)
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.summary.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                       "../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.summary.widgetcss = [];