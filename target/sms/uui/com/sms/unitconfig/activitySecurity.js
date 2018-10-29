//@ sourceURL=com.sms.unitconfig.activitySecurity
$.u.define('com.sms.unitconfig.activitySecurity', null, {
    init: function (options) {
        this._options = options;
        this.unit_id = $.urlParam().id ? parseInt($.urlParam().id) : null;
        this.activitySecuritySchemeData=null;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.unitconfig.activitySecurity.i18n;
    	this.table=this.qid("table");
    	
    	// 切换字段配置
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.selectActivitySecurityScheme = new com.sms.common.stdComponentOperate($("div[umid='selectActivitySecurityScheme']",this.$),{
    		title:this.i18n.label1,
    		dataobject:"unitConfig",
    		fields:[{name:"activitySecurityScheme",label:this.i18n.scheme,dataType:"int",type:"select",rule:{required:true},message:this.i18n.schemeNotNull,option:{
    			params:{"dataobject":"activitySecurityScheme"},
    			ajax:{
    				"data":function(term,page){
    					return {
    						"tokenid":$.cookie("tokenid"),
	        				"method":"stdcomponent.getbysearch",
    						"dataobject":"activitySecurityScheme",
    						"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
    					};
    				}
    			}
    		}}]
    	});
    	
    	// 选择一个方案
    	this.qid("button-select-scheme").click(this.proxy(function(){
    		this.selectActivitySecurityScheme.open({
    			data:{id:this.activitySecuritySchemeData.config,activitySecurityScheme:this.activitySecuritySchemeData.id},
        		title:this.i18n.label2,
        		afterEdit:this.proxy(function(comp,formdata,response){
        			window.location.reload();
        		})
    		});
    	}));
    	
    	// 切换方案
    	this.qid("button-change-scheme").click(this.proxy(function(){
    		this.selectActivitySecurityScheme.open({
    			data:{id:this.activitySecuritySchemeData.config,activitySecurityScheme:this.activitySecuritySchemeData.id},
        		title:this.i18n.label3,
        		afterEdit:this.proxy(function(comp,formdata,response){
        			window.location.reload();
        		})
    		});
    	}));

    	// 编辑方案
    	this.qid("button-edit-scheme").click(this.proxy(function(){
    		window.location.href="../secure/configActivitySecurityScheme.html?id="+this.activitySecuritySchemeData.id;
    	}));

    	
    	if(this.unit_id){ 
    		this.loadActivitySecurity(this.unit_id);
    	}
    },
    /**
     * @title 加载安监机构安全方案信息
     * @param unit_id 机构id
     */
    loadActivitySecurity:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				"method":"getactivitysecuritylevels",
        		"unit":this.unit_id
	        }
		},this.$).done(this.proxy(function(response){
			if(response.success){
				var $tbody = this.table.find("tbody").empty(),
					$ulContainer=this.qid("units"),
					$tr=null;
				this.activitySecuritySchemeData = response.data;
				this.qid("unit-config-activity-security-scheme-name").text(this.activitySecuritySchemeData.name);
				this.validateOperateButtons(response.data.action);
				if(response.data.levels && response.data.levels.iTotalRecords>0){
					$.each(response.data.levels.aaData,this.proxy(function(idx,security){
						$tr = $("<tr><td></td><td>"+security.description+"</td><td></td></tr>").appendTo($tbody);
						$ul=$("<ul style='padding-left:20px;'></ul>").appendTo($tr.children(":eq(2)"));
	                	$('<strong data-id="'+security.id+'">' + security.name + (security["default"] ? '&nbsp;<span class="label label-default">默认</span>' : '') + '</strong>').appendTo($tr.children(":eq(0)"))
	                    security.entities && $.each(security.entities,function(idx,entities){
	          			  $("<li>"+entities.type+"("+(entities.parameter==undefined?"任何人":entities.parameter)+")</li>").appendTo($ul);
	              		});
					}));
				}else{
					$("<tr><td colspan='3'>"+this.i18n.remiand+"</td></tr>").appendTo($tbody);
				}
				if(response.data.units){
					this.qid("unit-count").text(response.data.units.length);
					$.each(response.data.units,this.proxy(function(idx,unit){
						$('<li role="presentation"><a role="menuitem" tabindex="-1" href="Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo($ulContainer);
					}));
				}
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
    		if($.inArray("编辑信息安全方案",perms)<0){
    			this.qid("button-edit-scheme").remove();
    		}
    		if($.inArray("使用不同的方案",perms)<0){
    			this.qid("button-change-scheme").remove();
    		}
    		if($.inArray("选择一个方案",perms)<0){
    			this.qid("button-select-scheme").remove();
    		}
    	}else{
    		this.qid("button-operate").remove();
    	}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.activitySecurity.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                                "../../../uui/widget/spin/spin.js",
                                                "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.activitySecurity.widgetcss = [];