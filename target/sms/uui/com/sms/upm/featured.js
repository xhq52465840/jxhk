//@ sourceURL=com.sms.upm.featured
$.u.define('com.sms.upm.featured', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.pluginList=this.qid("pluginlist");
    	
    	// 搜索框
    	this.search=this.qid("text_search");
    	
    	// 搜索按钮
    	this.btnSearch=this.qid("btn_search");
    	
    	// 搜索事件
    	this.btnSearch.click(this.proxy(function(){
    		var params={rule:[]};
    		if($.trim(this.search.val())){
    			params.rule.push([{"key":"name","op":"like","value":this.search.val()}]);
    			params.rule=JSON.stringify(params.rule);
    			this.refreshPluginList(params);
    		}
    	}));
    	
    	// 插件列表行记录的点击事件
    	$(".upm-plugin-area",this.$).on("click",".list-group-item",this.proxy(function(e){
    		var $sender=$(e.currentTarget);
    		$(".upm-plugin-header",$sender).toggleClass("active");
    		if($(".upm-plugin-header span.glyphicon-chevron-right",$sender).length>0)
    			$(".upm-plugin-header span.glyphicon-chevron-right",$sender).switchClass("glyphicon-chevron-right","glyphicon-chevron-down");
    		else 
    			$(".upm-plugin-header span.glyphicon-chevron-down",$sender).switchClass("glyphicon-chevron-down","glyphicon-chevron-right");
    		$(".upm-plugin-body",$sender).toggleClass("hidden");
    	}));
    	
    	// ”管理“事件
    	$(".upm-plugin-area",this.$).on("click","button.manage",this.proxy(function(e){
    		var id = $(e.currentTarget).attr("pid");
    		window.location.href="../upm/PluginManage.html?plugin_id="+id;
    	}));
    	
    	// ”安装“事件
    	$(".upm-plugin-area",this.$).on("click","button.install",this.proxy(function(e){
    		var $sender = $(e.currentTarget);
    		$sender.attr("disabled",true);
    		$.ajax({
    			url: $.u.config.constant.smsqueryserver,
                type:"post",
                dataType: "json",
                data:{
    	        	"tokenid":$.cookie("tokenid"),
    	    		"method":"installplugin",
    	    		"key":$sender.attr("key")
    			}
    		}).done(this.proxy(function(response){
    			if(response.success){
    				showPluginProgress();
    			}
    		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    			
    		})).complete(this.proxy(function(jqXHR,errorStatus){
    			$sender.attr("disabled",false);
    		}));
    	}));
    	
    	this.refreshPluginList();
    },
    refreshPluginList:function(params){
    	this.btnSearch.attr("disabled",true);
    	$.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: $.extend({
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getplugins",
	    		"type":"market"
	        },params||{},true)
        }).done(this.proxy(function(response){
        	if(response.success){
        		this.pluginList.children(":not(:last)").remove();
        		$.each(response.data.aaData,this.proxy(function(idx,plugin){
        			$('<div class="list-group-item">'+
        					'<div class="upm-plugin-header">'+
        						'<div class="container">'+
        							'<div class="col-sm-1 text-left"><img src="https://marketplace-cdn.atlassian.com/files/com.greffon.folio/icons/default/af529c1c-f1fb-439f-a4b1-bd09edab6625.png" alt=""  width="72"></div>'+
        							'<div class="col-sm-7 text-left upm-section">'+
        								'<strong>'+plugin.name+'</strong>'+
        								'<div>'+
				        					'<span class="upm-plugin-vendor">'+
				        						'usky'+
				        					'</span>'+
				        					'<span class="upm-plugin-support"><span class="glyphicon glyphicon-ok-sign"></span>Usky 认证</span>'+
				        				'</div>'+
				        				'<div class="upm-plugin-categories">'+
			        						'<label class="label label-default">暂无</label>'+
			        					'</div>'+
        							'</div>'+
        							'<div class="col-sm-3 text-left upm-section">'+
				        				'<div><p>0 downloads</p></div>'+
				        			'</div>'+
				        			'<div class="col-sm-1 text-right">'+
				        				'<button class="btn btn-sm '+(plugin.status?"manage btn-default":"install btn-primary")+'" pid="'+plugin.id+'" key="'+plugin.key+'">'+(plugin.status?"管理":"安装")+'</button>'+
				        			'</div>'+
        						'</div>'+
            					'<p class="upm-plugin-summary">'+plugin.description+'</p>'+
        					'</div>'+
        			  '</div>').prependTo(this.pluginList);
        		}));
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	this.btnSearch.attr("disabled",false);
        }));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.upm.featured.widgetjs = [];
com.sms.upm.featured.widgetcss = [];