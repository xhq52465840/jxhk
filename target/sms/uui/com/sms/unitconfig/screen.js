//@ sourceURL=com.sms.unitconfig.screen
$.u.define('com.sms.unitconfig.screen', null, {
    init: function (options) {
        this._options = options;
        this.unitActivityTypeScreenScheme = null;
        this.unit_id = $.urlParam().id ? parseInt($.urlParam().id) : null;
    },
    afterrender: function (bodystr) {
    	this.i18n=com.sms.unitconfig.screen.i18n;
    	
    	// 切换不同的安全信息类型界面方案事件
    	this.qid("change-scheme").click(this.proxy(this._changeScheme));
    	
    	// 绑定界面方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
    	
    	// 绑定修改界面方案的点击事件
    	this.$.on("click",".edit-screen-scheme",this.proxy(this._editScreenScheme));
    	
    	if(this.unit_id){ 
    		this._loadUnitScreenScheme(this.unit_id);
    	}
    },
    /**
     * @title 加载机构信息
     * @param unit_id 机构id
     */
    _loadUnitScreenScheme:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"getunitscreenscheme",
				unit:unit_id
	        }
		},this.$).done(this.proxy(function(response){
			if(response.success){
				this.unitActivityTypeScreenScheme = response.data;
				var $container = null;
				this._validateButtons(response.data); // 校验按钮权限
				this.qid("unit-config-screens-scheme-name").text(response.data.name);
				this.qid("scheme-count").text(response.data.schemes.length);
				this.qid("edit-scheme").attr("href",this.getabsurl("../fieldscreen/ConfigureActivityTypeScreenScheme.html?id="+response.data.id));//修改界面
				this.qid("change-scheme").attr("data-id",response.data.id);
				$.each(response.data.schemes,this.proxy(function(idx,scheme){
					$container = $('<div class="unit-config-scheme-item unit-config-screenScheme">'+
									 '<div class="unit-config-scheme-item-header">'+
										 '<div class="pull-left">'+
										   	'<h4><span class="glyphicon glyphicon-chevron-down"></span><strong class="unit-config-scheme-name" style="cursor:pointer;">'+scheme.name+'</strong></h4>&nbsp;'+
										   	(scheme["default"] ? '<span class="label label-default">'+this.i18n.approve+'</span>&nbsp;' : '&nbsp')+
										   	'&nbsp;<div class="dropdown" style="display:inline-block;"><span class="label label-success dropdown-toggle" data-toggle="dropdown" style="cursor:pointer;">'+this.i18n.applied+scheme.units.length+this.i18n.safeAgency+'</span>'+
										   		'<ul class="dropdown-menu units" role="menu"></ul>'+
										   	'</div>'+
										 '</div>'+
										 (this.unitActivityTypeScreenScheme.admin ? '<div class="pull-right"><span class="glyphicon glyphicon-pencil edit-screen-scheme" data-id="'+scheme.id+'"></span></div>' : '')+
									 '</div>'+
									 '<div class="unit-config-scheme-item-content unit-config-split-panel">'+
									 	'<div class="unit-config-split-panel-nav">'+
										 	'<h4>'+this.i18n.z+scheme.activityTypes.length+this.i18n.gSafeType+'</h4>'+
											'<ul class="unit-config-list"></ul>'+
										'</div>'+
										'<div class="unit-config-split-panel-content">'+
											'<h4>…'+this.i18n.usesurface+'</h4>'+
											'<table class="table unit-config-datatable">'+
												'<thead>'+
													'<tr><th width="300">'+this.i18n.handle+'</th><th>'+this.i18n.title+'</th></tr>'+
												'</thead>'+
												'<tbody></tbody>'+
											'</table>'+
										'</div>'+
									 '</div>'+
								  '</div>').appendTo(this.$);
					$.each(scheme.activityTypes,this.proxy(function(idx,activityType){
						$("<li><img width='16' src='../../../"+activityType.url+"' height='16'/>&nbsp;<span>"+activityType.name+"</span>"+(activityType["default"] ? "<span class='label label-default'>默认</span>" : ""  )+"</li>").appendTo($container.find("ul.unit-config-list"));
					}));
					$.each(scheme.scheme,this.proxy(function(idx,scheme){
						$("<tr><td>"+scheme.name+"</td><td><span class='unit-config-icon unit-config-icon-screen'></span>"+
								(this.unitActivityTypeScreenScheme.admin ? "<a href='"+this.getabsurl("../fieldscreen/ConfigFieldScreen.html?id="+scheme.screenId)+"'>"+scheme.screenName+"</a>" : scheme.screenName )+
						  "</td></tr>").appendTo($container.find(".unit-config-datatable tbody"));
					}));
					$.each(scheme.units,this.proxy(function(idx,unit){
						$('<li role="presentation"><a role="menuitem" tabindex="-1" href="Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatar+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo($container.find("ul.units"));
					}));
				}));
			}
		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
			
		})).complete(this.proxy(function(jqXHR,errorStatus){
			
		}));
    },
    /**
     * @title 切换不同的方案
     * @param e
     */
    _changeScheme:function(e){
    	e.preventDefault();
    	if(!this.changeActivityTypeScreenScheme){
    		$.u.load("com.sms.common.stdComponentOperate");
    		this.changeActivityTypeScreenScheme = new com.sms.common.stdComponentOperate($("div[umid='changeActivityTypeScreenScheme']",this.$),{
        		title:this.i18n.label1,
        		dataobject:"unitConfig",
        		fields:[{name:"activityTypeFieldScreenScheme",dataType:"int",label:this.i18n.scheme,type:"select",rule:{required:true},message:this.i18n.schemeNotnull,option:{
        			params:{"dataobject":"activityTypeFieldScreenScheme"},
        			ajax:{
        				"data":function(term,page){
        					return {
        						"tokenid": $.cookie("tokenid"),
    	        				"method": "stdcomponent.getbysearch",
        						"dataobject": "activityTypeFieldScreenScheme",
        						"rule": JSON.stringify([[{"key":"name","op":"like","value":term}]])
        					};
        				}
        			}
        		}}]
        	});
    	}
    	this.changeActivityTypeScreenScheme.open({
    		data:{id:this.unitActivityTypeScreenScheme.config,activityTypeFieldScreenScheme:this.unitActivityTypeScreenScheme.id},
    		title:com.sms.unitconfig.screen.i18n.label1,
    		afterEdit:this.proxy(function(comp,formdata,response){
    			window.location.reload();
    		})
    	});
    },
    /**
     * @title 界面方案标题点击事件
     * @param e 
     */
    _toggleScreenScheme:function(e){
    	var $sender = $(e.currentTarget),$prev=$sender.prev();
		$sender.closest("div.unit-config-scheme-item").toggleClass("collapsed");
		if($prev.hasClass("glyphicon-chevron-right")){
			$prev.removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
		}else{
			$prev.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
		}
    },
    /**
     * @title 修改界面方案
     * @param e
     */
    _editScreenScheme:function(e){
    	e.preventDefault();
    	var schemeId=$(e.currentTarget).attr("data-id");
    	window.location.href=this.getabsurl("../fieldscreen/ConfigureScreenScheme.html?id="+schemeId);
    },
    /**
     * @title 校验行为按钮权限
     * @param action
     */
    _validateButtons:function(data){
    	if(data && data.action && data.action.length > 0){
    		$.inArray("修改界面", data.action) == -1 && this.qid("edit-scheme").remove();
    		$.inArray("使用不同的方案", data.action) == -1 && this.qid("change-scheme").remove();
    	}else{
    		this.qid("button-group-operate").remove();
    	}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.screen.widgetjs = [ "../../../uui/widget/jqurl/jqurl.js",
                                       "../../../uui/widget/spin/spin.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.screen.widgetcss = [];