//@ sourceURL=com.sms.detailmodule.base
$.u.define('com.sms.detailmodule.base', null, {
    init: function (option) {
    	this._options = option;
    	this.tabLiTemplate = '<li class="#{class}"><a href="##{name}" role="tab" data-toggle="tab">#{name}</a></li>';
    	this.tabDivTemplate = '<div class="tab-pane #{class}" id="#{name}"><table class="uui-table table-fixed"><tbody></tbody></table></div>';
    	this.staticFields = [
	      {
	        "name": "信息类型",
	        "required": true,
	        "renderer": "com.sms.plugin.render.activityTypeProp",
	        "key": "type",
	        "value":this._options.activity
	      },
	      /**
	       * @title 添加创建人
	       */
	      {
	        "description": null,
	        "name": "状态",
	        "required": true,
	        "renderer": "com.sms.plugin.render.statusProp",
	        "key": "status",
	        "value":this._options.activity
	      },
	      {
	        "description": null,
	        "name": "优先级",
	        "required": true,
	        "renderer": "com.sms.plugin.render.priorityProp",
	        "key": "priority",
	        "value":this._options.activity
	      },
	      {
		        "description": null,
		        "name": "标签",
		        "required": true,
		        "renderer": "com.sms.plugin.render.tagProp",
		        "key": "label",
		        "value":this._options.activity
		      },
	      {
	        "description": null,
	        "name": "详细描述",
	        "required": true,
	        "renderer": "com.sms.plugin.render.multiTextProp",
	        "key": "description",
	        "value":this._options.activity && this._options.activity.description
	      }
	    ];
    },
    afterrender: function (bodystr) { 
    	this.originalReport=this.qid("originalReport");
    	this.staticFieldContainer = this.qid("staticfields");	// 静态字段容器
    	this.tabList=this.qid("tab-list");						// tab头部容器
    	this.tabContent = this.qid("tab-content");				// tab的内容容器
    	this.diagramDialog = null;								// 工作流程图组件
    	this.originalReport.css({
    		"float":"right",
    		"margin-right":"20px",
    	});
    	if(this._options.activity.originActivityId){
    		this.originalReport.html("<a href='activity.html?activityId="+this._options.activity.originActivityId+"' target='_blank' style='color:#fff'>查看原始报告</a>");
    	}
    	this.staticFieldContainer.on("click","a.diagramview",this.proxy(this.on_diagramview_click));
    	this._draw();
    	
    },
    /**
     * @title 查看工作流事件
     * @param e {object} 鼠标对象
     * @return void
     */
    on_diagramview_click:function(e){
    	e.preventDefault();
    	var $this = $(e.currentTarget),wi_id = JSON.parse($this.attr("data-id"));
    	if(this.diagramDialog == null){
    		$.u.load("com.sms.workflow.diagramView");
    		this.diagramDialog = new com.sms.workflow.diagramView($("div[umid=diagramviewdialog]",this.$));
    	}
    	this.diagramDialog.open({"id":wi_id,"title":"###","type":"inst"});
    },
    /**
     * @title 绘制表单
     */
    _draw:function(){
    	var tabLi = null,
    		tabDiv = null,
            counter = 0,
    		$tabContent = null,
            $tr = null;
    	
    	$.each(this.staticFields,this.proxy(function(idx,field){
            if(field.renderer === "com.sms.plugin.render.multiTextProp"){
                if(counter % 2 !==0 && $tr && $tr.children("td.value").length === 1){
                    $tr.children("td.value").attr("colspan", 3).addClass("word-break","break-all");
                }
                $tr = $("<tr/>").appendTo(this.staticFieldContainer);
                this._buildField(field, $tr);
                $tr.children("td.value").attr("colspan", 3).attr("style","word-break:break-all");
                counter = 0;    
            }
            else{
                if(counter % 2 === 0){
                    $tr = $("<tr/>").appendTo(this.staticFieldContainer);
                }
                this._buildField(field, $tr);
                counter ++;
            }
    	}));

    	$tr = null;
        counter = 0;

    	if(this._options.tabs && this._options.tabs.length>1){
    		var isRight = false;
    		$.each(this._options.tabs, this.proxy(function(idx,tab){
    			tabLi = this.tabLiTemplate.replace(/#\{class}/g,idx == this._options.tabs.length-1 ? "active" : "").replace(/#\{name}/g,tab.name);
    			$(tabLi).prependTo(this.tabList);
        		$tabContent = this.tabDivTemplate.replace(/#\{class}/g,idx == this._options.tabs.length-1 ? "active" : "").replace(/#\{name}/g,tab.name);
        		$tabContent = $($tabContent).appendTo(this.tabContent);
        		$.each(tab.fields, this.proxy(function(idx, field){
        			if(field.renderer === "com.sms.plugin.render.multiTextProp" || field.renderer === "com.sms.plugin.render.controlProp"){
                        if(counter % 2 !==0 && $tr && $tr.children("td.value").length === 1){
                            $tr.children("td.value").attr("colspan", 3).attr("style","word-break:break-all");
                        }
                        $tr = $("<tr/>").appendTo($tabContent.find("tbody"));
                        this._buildField(field, $tr);
                        $tr.children("td.value").attr("colspan", 3).attr("style","word-break:break-all");
                        counter = 0;    
                    }
                    else{
                        if(counter % 2 === 0){
                            $tr = $("<tr/>").appendTo($tabContent.find("tbody"));
                        }
                        this._buildField(field, $tr);
                        counter ++;
                    }
        		}));
                counter = 0;
        	}));
    	}
        else if(this._options.tabs && this._options.tabs.length == 1){
    		this.tabList.hide();
    		this.tabContent.hide();
    		$.each(this._options.tabs[0].fields, this.proxy(function(idx, field){ 
                if(field.renderer === "com.sms.plugin.render.multiTextProp" || field.renderer === "com.sms.plugin.render.controlProp"){
                    if(counter % 2 !==0 && $tr && $tr.children("td.value").length === 1){
                        $tr.children("td.value").attr("colspan", 3).attr("style","word-break:break-all");
                    }
                    $tr = $("<tr/>").appendTo(this.staticFieldContainer);
                    this._buildField(field, $tr);
                    $tr.children("td.value").attr("colspan", 3).attr("style","word-break:break-all");
                    counter = 0;    
                }
                else{
                    if(counter % 2 === 0){
                        $tr = $("<tr/>").appendTo(this.staticFieldContainer);
                    }
                    this._buildField(field, $tr);
                    counter ++;
                }
    		}));
    	}
        else{
    		this.tabList.hide();
    		this.tabContent.hide();
    	}
    },
    /**
     * @title 创建字段
     * @param field {object} 字段定义
     * @param $contianer {jquery object} jquery容器
     */
    _buildField:function(field, $contianer){
    	var inputRenderClazz = null,
			inputRenderObj = null,
            $sel = null;
    	
        if(field && field.renderer){
            try{
            	inputRenderClazz = $.u.load(field.renderer);
        		inputRenderObj = new inputRenderClazz();
        		result = inputRenderObj.get("read", "html",field);
        		$sel = $(result).appendTo($contianer); 
        		inputRenderObj.get("read", "render", field, $sel);
            }catch(e){
                console.error("init [" + field.renderer + "] renderer failed : " + e.message);
            }
        }
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.base.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.base.widgetcss = [];