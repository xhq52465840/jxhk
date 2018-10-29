//@ sourceURL=com.sms.unitconfig.projectconfig
$.u.define('com.sms.unitconfig.projectconfig', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	/*
    	 * 1.fieldscreen > screen //getfieldscreentabs
    	 * 2.com.sms.workflow.workflowDesign > id，model
    	 */
    	this.getWorkflowData();
    	this.getScreenData();
    	this.btn_workflow = this.qid("workflow");
    	this.btn_view = this.qid("view");
    	//显示几个安监机构
        this.units = this.qid("units");
        this.unitsUl = this.qid("units-ul");
        // 绑定方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
    	
    	this.btn_workflow.click(this.proxy(function(e){
    		$(e.currentTarget).addClass("disabled").siblings().removeClass("disabled");
    		$("div[umid=view]",this.$).addClass("hidden");
    		$("div[umid=workflow]",this.$).removeClass("hidden");
    		this.qid("nameWorkflow").removeClass("hidden");
    		this.qid("configWorkflowtext").removeClass("hidden");
    		this.qid("nameView").addClass("hidden");
    		this.qid("configViewtext").addClass("hidden");
    	}));
    	
    	this.btn_view.click(this.proxy(function(e){
    		$(e.currentTarget).addClass("disabled").siblings().removeClass("disabled");
    		$("div[umid=view]",this.$).removeClass("hidden");
    		$("div[umid=workflow]",this.$).addClass("hidden");
    		this.qid("nameWorkflow").addClass("hidden");
    		this.qid("configWorkflowtext").addClass("hidden");
    		this.qid("nameView").removeClass("hidden");
    		this.qid("configViewtext").removeClass("hidden");
    	}));
    	
    	$('button',this.$).each(function(){
    		if($(this).hasClass("disabled")){
    			if($(this).attr("qid") == "workflow" || $(this).attr("qid") == "view"){
    				$(this).click();
    			}
    		}
    	});
    },
    getWorkflowData:function(){
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getworkflowbyunitandtype",
	    		"unit": $.urlParam().id,
	    		"type": $.urlParam().type
	        }
        },this.qid("viewPaent")).done(this.proxy(function(response){
        	if(response.success){    		
            	this.wt_id = response.data;
        		$.u.load("com.sms.workflow.workflowDesign");
        		this.workflowDialog = new com.sms.workflow.workflowDesign($("div[umid=workflow]",this.$),{
                	id: this.wt_id || null,
                	where: "wt_id=",
                	mode: "base",
                	admin: response.admin,
                	workflowMode: "view",
                	save: function(){
                    	window.location.href="../workflow/ListWorkflows.html";
                    },
                    afterLoad: this.proxy(function(response){
                    	if(response.responseData.list && response.responseData.list.length>0){
                    		this.qid("configWorkflowtext").text(response.responseData.list[0]["name"]);
                    	}
                    })
                });
            	
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    getScreenData:function(){
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getfieldscreentabs",
	    		"unit": $.urlParam().id,
	    		"type": $.urlParam().type
	        }
        },this.qid("units-ul").siblings()).done(this.proxy(function(response){
        	if(response.success){
        		$("a[qid=type"+$.urlParam().type+"]").css({"color":"#333","font-weight":"bold"});
        		$.u.load("com.sms.unitconfig.fieldscreen");
        		this.viewDialog && this.viewDialog.destroy();
            	this.viewDialog = new com.sms.unitconfig.fieldscreen($("div[umid=view]",this.$),{
            		screen : response.data || null,
            		afterLoad:this.proxy(function(){
            			this.getScreenData();
            		})
            	});
            	response.data["screen"]&&this.qid("configViewtext").text(response.data["screen"]);
        		this.unitsUl.empty();
        		response.data.units&&$.each(response.data.units,this.proxy(function(idx,unit){
    					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'" title="'+unit.name+'"><img width="16" src="'+unit.avatarUrl+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo(this.unitsUl);
    				}));
    			this.units.text(response.data.units.length);  
    			if($("div[umid=workflow]",this.$).hasClass("hidden")){
    				$("div[umid=view]",this.$).removeClass("hidden");
    			}
    			response.data["type"]&&this.qid("nameView").text("View for  "+response.data["type"]["name"])&&this.qid("nameWorkflow").text("Workflow for  "+response.data["type"]["name"]);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    _toggleScreenScheme:function(e){
    	var $sender = $(e.currentTarget),$prev=$sender.prev();
		$sender.closest("div.unit-config-scheme-item").toggleClass("collapsed");
		if($prev.hasClass("glyphicon-chevron-right")){
			$prev.removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
		}else{
			$prev.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
		}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.unitconfig.projectconfig.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                             "../../../uui/widget/spin/spin.js",
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js"];
com.sms.unitconfig.projectconfig.widgetcss = [];