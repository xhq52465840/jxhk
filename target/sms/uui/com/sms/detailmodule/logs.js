//@ sourceURL=com.sms.detailmodule.logs
$.u.load("com.sms.log.activitylog");
$.u.load("com.sms.detailmodule.remark");
$.u.load("com.sms.detailmodule.workflowlog");
$.u.define('com.sms.detailmodule.logs', null, {
    init: function (option) {
    	this._options = option || {};
        this._i18n = com.sms.detailmodule.logs.i18n;
    },  
    afterrender: function (bodystr) {
        this.remarkForm = this.qid("remarkform");
    	this.activityLog = new com.sms.log.activitylog(this.$.find("div[umid='log']"),{
    		"title": "日志",
    		"count": "10",
    		"manual": true, 
    		//"rules":[{"key":"updatedate","op":"between","value":["2014-07-02","2014-12-11"]},{"key":"key","op":"==","value":[{"id":2,"text":"机构2"}]}],
    		"rules":[{"key":"activity","value":this._options.activity}],
    		"autorefresh":true,
    		"autorefreshminiute":"15"
    	});
    	this.remarkList = new com.sms.detailmodule.remark(this.$.find("div[umid=component]"),{"activity":this._options.activity});
    	this.workflowLog = new com.sms.detailmodule.workflowlog(this.$.find("div[umid=workflowlog]"),{data:this._options.workflowLogs});
    	
    	if(this._options.addable !== true){
    		this.qid("addcommentarea").remove();
    	}else{
        	this.mod_footer = this.qid("mod-footer");					// 备注按钮容器
        	this.mod_content = this.qid("mod-content");					// 备注内容容器
        	this.text = this.qid("description");						// 备注内容
            this.remarkForm.validate({
                rules: {
                    description: "required"
                },
                messages: {
                    description: this._i18n.messages.descriptionIsNotNull
                },
                errorClass: "text-danger text-validate-element",
                errorElement:"div"
            });
    		this.qid("remark").on("click",this.proxy(this.on_remark_click));
    		this.qid("cancle_content").on("click",this.proxy(this.on_cancelcontent_click));
        	this.qid("add_content").on("click",this.proxy(this.on_addcontent_click));
    	}
    	this.qid("tabs").find("a[data-toggle=tab]").on("show.bs.tab",this.proxy(this.on_tabs_click));
    	
    	this.qid("tabs").find("a:first").tab("show");
    },
    /**
     * @title 选项卡点击事件
     * @param e {object} 鼠标对象
     * @return void
     */
    on_tabs_click:function(e){
    	var $this = $(e.currentTarget),href = $this.attr("href");
    	switch(href){
	    	case "#all":
	    		break;
	    	case "#component":
	    		this.remarkList && this.remarkList.reload && this.remarkList.reload();
	    		break;
	    	case "#log":
	    		this.activityLog && this.activityLog.reload && this.activityLog.reload();
	    		break;
	    	case "#workflowlog":
	    		break;
	    	// no default
    	}
    },
    /**
     * @title 备注按钮事件
     * @return void
     */
    on_remark_click:function(){
    	this.mod_footer.hide();
		this.mod_content.show();
    	this.text.focus();
    },
    /**
     * @title 取消添加备注
     * @return void
     */
    on_cancelcontent_click:function(){
    	this.text.val(""); 
        this.remarkForm.validate().resetForm();
    	this.mod_footer.show();
		this.mod_content.hide();
    },
    /**
     * @title 确定添加备注
     * @return void
     */
    on_addcontent_click:function(e){
    	e.preventDefault();
    	var $this = $(e.currentTarget), data = $.trim(this.text.val());
		if(this.remarkForm.valid()){
    		$.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                dataType: "json",
                cache: false,
                type:"post",
                data: {
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.add",
            		"dataobject":"action",
            		"obj":JSON.stringify({"activity":this._options.activity,"type":"component","body":data})
            	}
            },$this,{size:2}).done(this.proxy(function (data) {
            	if (data.success) {
            		$("ul.nav-tabs > li:eq(0) > a",this.$).tab("show");
            		this.text.val("");
            		this.mod_footer.show();
            		this.mod_content.hide();
            		this.remarkList.reload();
                }
            }));
        }
        else{
            this.text.focus();
        }
    },
    /**
     * @title 快速启动
     * @return void
     */
    quickTrigger:function(){
    	$("body").scrollTop(this.qid("remark").offset().top - 20);
    	this.qid("remark").trigger("click");
    },
    destroy: function () {
    	//this.remarkList.destroy();
    	//this.workflowLog.destroy();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.logs.widgetjs = ["../../../uui/widget/jqurl/jqurl.js",
                                      "../../../uui/widget/spin/spin.js", 
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js"
                                      ];
com.sms.detailmodule.logs.widgetcss = [];