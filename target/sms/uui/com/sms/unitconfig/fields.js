//@ sourceURL=com.sms.unitconfig.fields
$.u.define('com.sms.unitconfig.fields', null, {
    init: function (options) {
        this._options = options;
        this.unitFieldScheme=null;
        this.unit_id = $.urlParam().id;
        this.unit_id = this.unit_id ? parseInt(this.unit_id) : null;
    },
    afterrender: function (bodystr) {
    	// 使用不同的方案
    	this.qid("change-scheme").click(this.proxy(this._changeScheme));
    	
    	// 绑定方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
    	
    	// 绑定修改方案的点击事件
    	this.$.on("click",".edit-screen-scheme",this.proxy(this._editScreenScheme));
    	
    	if(this.unit_id){ 
    		this._loadUnitFieldsScheme(this.unit_id);
    	}else{
    		window.location.href="../dash/DashBoard.html";
    	}
    },
    /**
     * @title 加载机构信息
     * @param unit_id 机构id
     */
    _loadUnitFieldsScheme:function(unit_id){
    	$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type:"post",
            dataType: "json",
            data:{
				tokenid:$.cookie("tokenid"),
				method:"getunitfieldscheme",
				unit:unit_id
	        }
		},this.$).done(this.proxy(function(response){
			if(response.success){
				this.unitFieldScheme = response.data;
				var $container = null;
				this._validateButtons(response.data.action); // 校验按钮权限
				this.qid("unit-config-fields").text(response.data.name);
				this.qid("scheme-count").text(response.data.schemes.length);
				this.qid("edit-scheme").attr("href",this.getabsurl("../customfields/ConfigureFieldLayoutScheme.html?id="+response.data.id));//修改栏目
				this.qid("change-scheme").attr("data-id",response.data.id);
				response.data.schemes&&$.each(response.data.schemes,this.proxy(function(idx,scheme){
					$container = $('<div class="unit-config-scheme-item unit-config-screenScheme">'+
									 '<div class="unit-config-scheme-item-header">'+
										 '<div class="pull-left">'+
										   	'<h4><span class="glyphicon glyphicon-chevron-down"></span><strong class="unit-config-scheme-name" style="cursor:pointer;">'+scheme.name+'</strong></h4>&nbsp;'+
										   	(scheme["default"] ? '<span class="label label-default">默认</span>&nbsp;' : '&nbsp')+
										   	'&nbsp;<div class="dropdown" style="display:inline-block;"><span class="label label-success dropdown-toggle" data-toggle="dropdown" style="cursor:pointer;">被应用于'+scheme.units.length+'个安监机构</span>'+
										   		'<ul class="dropdown-menu units" style="max-height:300px;overflow:auto;" role="menu"></ul>'+
										   	'</div>'+
										 '</div>'+
										 (this.unitFieldScheme.admin ? '<div class="pull-right"><span class="glyphicon glyphicon-pencil edit-screen-scheme" data-id="'+scheme.id+'"></span></div>' : '')+
									 '</div>'+
									 '<div class="unit-config-scheme-item-content unit-config-split-panel">'+
									 	'<div class="unit-config-split-panel-nav">'+
										 	'<h4>这'+scheme.activityTypes.length+'个安全信息类型</h4>'+
											'<ul class="unit-config-list"></ul>'+
										'</div>'+
										'<div class="unit-config-split-panel-content">'+
											'<h4>…使用 这个字段配置</h4>'+
											'<table class="table unit-config-datatable">'+
												'<thead>'+
													'<tr><th width="35%">名称</th><th width="70">必选项</th><th >渲染器</th><th width="130">界面</th></tr>'+
												'</thead>'+
												'<tbody></tbody>'+
											'</table>'+
										'</div>'+
									 '</div>'+
								  '</div>').appendTo(this.$);
					scheme.activityTypes&&$.each(scheme.activityTypes,this.proxy(function(idx,activityType){
						$("<li><img width='16' src='../../../"+activityType.url+"' height='16'/>&nbsp;<span>"+activityType.name+"</span>"+(activityType["default"] ? "<span class='label label-default'>默认</span>" : ""  )+"</li>").appendTo($container.find("ul.unit-config-list"));
					}));					
					scheme.scheme&&$.each(scheme.scheme,this.proxy(function(idx,scheme){
						var $tr=$("<tr><td>"+scheme.name+"</td><td>"+(scheme.required?"是":"")+"</td><td>"+scheme.rendererName+"</td><td><span class='unit-config-icon unit-config-icon-screen'></span>" +
								"<div class='dropdown' style='display:inline-block;'><span class='label label-success dropdown-toggle' data-toggle='dropdown' style='cursor:pointer;'>"+(scheme.screens?scheme.screens.length+"个界面":"没有界面配置")+
								"</span><ul class='dropdown-menu field' role='menu'></ul>"+
								"</td></tr>").appendTo($container.find(".unit-config-datatable tbody"));
						scheme.screens&&$.each(scheme.screens,this.proxy(function(k,v){
							$('<li role="presentation">'+
								(this.unitFieldScheme.admin ? '<a role="menuitem" tabindex="-1" href=' + this.getabsurl("../fieldscreen/ConfigFieldScreen.html?id=" + v.id) + '>' + v.name + '</a>' : "<a role='menuitem'>" + v.name + "</a>")+
							  '</li>').appendTo($tr.find("ul.field"));
						}))
					}));

					scheme.units&&$.each(scheme.units,this.proxy(function(idx,unit){
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
    	if(!this.changeFieldScheme){
    		$.u.load("com.sms.common.stdComponentOperate");
    		this.changeFieldScheme = new com.sms.common.stdComponentOperate($("div[umid='changeFieldScheme']",this.$),{
        		title:"关联字段配置方案",
        		dataobject:"unitConfig",
        		fields:[{name:"fieldLayoutScheme",label:"方案",dataType:"int",type:"select",rule:{required:true},message:"方案不能为空",option:{
        			params:{"dataobject":"fieldLayoutScheme"},
        			ajax:{
        				"data":function(term,page){
        					return {
        						"tokenid":$.cookie("tokenid"),
    	        				"method":"stdcomponent.getbysearch",
        						"dataobject":"fieldLayoutScheme",
        						"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
        					};
        				}
        			}
        		}}]
        	});
    	}
    	this.changeFieldScheme.open({
    		data:{id:this.unitFieldScheme.config,fieldLayoutScheme:this.unitFieldScheme.id},
    		title:"关联字段配置方案",
    		afterEdit:this.proxy(function(comp,formdata,response){
    			window.location.reload();
    		})
    	});
    },
    /**
     * @title 方案标题点击事件
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
     * @title 修改方案
     * @param e
     */
    _editScreenScheme:function(e){
    	e.preventDefault();
    	var schemeId=$(e.currentTarget).attr("data-id");
    	window.location.href=this.getabsurl("../customfields/ConfigureFieldLayout.html?id="+schemeId);
    },
    /**
     * @title 校验行为按钮权限
     * @param action
     */
    _validateButtons:function(action){
    	if(action && action.length > 0){
    		$.inArray("修改栏目",action)==-1 && this.qid("edit-scheme").remove();
    		$.inArray("使用不同的方案",action)==-1 && this.qid("change-scheme").remove();
    	}else{
    		this.qid("button-group-operate").remove();
    	}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.unitconfig.fields.widgetjs = [ "../../../uui/widget/jqurl/jqurl.js","../../../uui/widget/spin/spin.js"
                                      , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                      , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.fields.widgetcss = [];