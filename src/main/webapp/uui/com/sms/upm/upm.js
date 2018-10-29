//@ sourceURL=com.sms.upm.upm
$.u.define('com.sms.upm.upm', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	// 插件列表容器
    	this.pluginList=this.qid("pluginlist");

    	// 搜索框
    	this.search=this.qid("text_search");
    	
    	// 搜索按钮
    	this.btnSearch=this.qid("btn_search");
    	
    	// 上传插件按钮
    	this.btnUploadPlugin=this.qid("btn_uploadplugin");
    	
    	// 创建插件按钮
    	this.btnCreatePlugin=this.qid("btn_createplugin");
    	
    	// 搜索事件
    	this.btnSearch.click(this.proxy(function(){
    		var params={rule:[]};
    		if($.trim(this.search.val())){
    			params.rule.push([{"key":"name","op":"like","value":this.search.val()}]);
    			params.rule=JSON.stringify(params.rule);
    			this.refreshPluginList(params);
    		}
    	}));
    	
    	// 绑定插件列表的行记录点击事件
    	$(".upm-plugin-area",this.$).on("click",".upm-plugin-header",this.proxy(function(e){
    		var $sender=$(e.currentTarget);
    		$sender.toggleClass("active");
    		if($("span.glyphicon-chevron-right",$sender).length>0)
    			$("span.glyphicon-chevron-right",$sender).switchClass("glyphicon-chevron-right","glyphicon-chevron-down");
    		else 
    			$("span.glyphicon-chevron-down",$sender).switchClass("glyphicon-chevron-down","glyphicon-chevron-right");
    		$sender.next().toggleClass("hidden"); // .upm-plugin-body
    	}));
    	
    	// 卸载插件
    	$(".upm-plugin-area",this.$).on("click","button.uninstall",this.proxy(function(e){
    		var $sender=$(e.currentTarget);
    		$sender.attr("disabled",true);
    		$.ajax({
    			url: $.u.config.constant.smsqueryserver,
                type:"post",
                dataType: "json",
                data:{
    	        	"tokenid":$.cookie("tokenid"),
    	    		"method":"uninstallplugin",
    	    		"key":$sender.attr("key")
    			}
    		}).done(this.proxy(function(response){
    			if(response.success){
    				window.location.reload();
    			}
    		})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    			
    		})).complete(this.proxy(function(jqXHR,errorStatus){
    			$sender.attr("disabled",false);
    		}));
    	}));
        
    	this.refreshPluginList();
    },
    /*
     * 刷新插件列表
     */
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
	    		"type":"manage"
	        },params||{},true)
        }).done(this.proxy(function(response){
        	if(response.success){
        		if(response.data.aaData.length>0){
	        		$.each(response.data.aaData,this.proxy(function(idx,plugin){
	        			$('<div class="list-group-item" pid="'+plugin.id+'">'+
	        					'<div class="upm-plugin-header container">'+
	    							'<div class="col-sm-4">'+
	    								'<span class="glyphicon glyphicon-chevron-right"></span>'+
				        				'<span class="glyphicon glyphicon-qrcode"></span>'+
				        				'<strong>'+plugin.name+'</strong>'+
	    							'</div>'+
	        					'</div>'+
								'<div class="upm-plugin-body hidden">'+
									'<p class="upm-plugin-summary">' + (plugin.description || '<i>无</i>') + '</p>'+
									'<div class="upm-plugin-actions">'+
					        			'<button class="btn btn-default btn-sm uninstall" key="'+plugin.key+'">' + com.sms.upm.upm.i18n.Uninstall + '</button>'+
					        			'<button class="btn btn-default btn-sm" key="'+plugin.key+'">' + com.sms.upm.upm.i18n.Disable + '</button>'+
					        		'</div>'+
					        		(plugin.details || '<i>无</i>') +
								'</div>'+
	        			  '</div>').prependTo(this.pluginList);
	        		}));
	        		var currPlugin=$.urlParam().plugin_id;
	        		if(currPlugin){
	        			$("div.list-group-item[pid='"+currPlugin+"']").trigger("click");
	        		}
        		}else{
        			$("<div class='list-group-item text-center'>暂无插件</div>").prependTo(this.pluginList);
        		}
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

com.sms.upm.upm.widgetjs = ['../../../uui/widget/jqurl/jqurl.js'];
com.sms.upm.upm.widgetcss = [];