//@ sourceURL=com.audit.comm_file.logs
$.u.load("com.audit.innerAudit.comm_file.activitylog");
$.u.load("com.audit.innerAudit.comm_file.remark");
$.u.load("com.audit.innerAudit.comm_file.workflowlog");
$.u.define('com.audit.innerAudit.comm_file.logs', null, {
    init: function (option) {
    	this._options = option || {};
        this._i18n = com.audit.comm_file.logs.i18n;
    },  
    afterrender: function (bodystr) {
    	if(this._options.flowid != null){
    		$(".diagramview").attr("data-id",this._options.flowid);
    	}
    	this.diagramDialog = null;
    	this.qid("diagramview").on("click","span.diagramview",this.proxy(this.on_diagramview_click));
        this.qid("toggle-panel").click(this.proxy(this.on_togglePanel_click));
    	
        this.remarkForm = this.qid("remarkform");
    	this.activityLog = new com.audit.innerAudit.comm_file.activitylog(this.$.find("div[umid='log']"),{
    		"title": "日志",
    		"count": "10",
    		"manual": true, 
    		//"rules":[{"key":"updatedate","op":"between","value":["2014-07-02","2014-12-11"]},{"key":"key","op":"==","value":[{"id":2,"text":"机构2"}]}],
    		// "rules": [{"key":"activity","value":this._options.planid}],
    		"businessUrl": this._options.businessUrl,
            "rules": this._options.logRule,
    		"autorefresh":true,
    		"autorefreshminiute":"15"
    	});
    	this.remarkList = new com.audit.innerAudit.comm_file.remark(this.$.find("div[umid=component]"),{
    		"rule": this._options.remarkRule
        });
    	this.workflowLog = new com.audit.innerAudit.comm_file.workflowlog(this.$.find("div[umid=workflowlog]"),{data:this._options.workflowLogs});
    	
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
    on_togglePanel_click: function(e){
        if(this.qid("toggle-panel").hasClass("fa-chevron-down")){
            this.qid("toggle-panel").removeClass("fa-chevron-down").addClass("fa-chevron-right");
        }
        else{
            this.qid("toggle-panel").removeClass("fa-chevron-right").addClass("fa-chevron-down");
        }
        this.qid("panel-body").toggleClass("hidden");
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
            		"dataobject":"auditAction",
            		"obj":JSON.stringify( $.extend(true, {
                        "body":data
                    }, this._options.remarkObj || {}) )
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
    
    /**
     * @title 查看工作流事件
     * @param e {object} 鼠标对象
     * @return void
     */
    on_diagramview_click:function(e){
    	e.preventDefault();
    	var $this = $(e.currentTarget),wi_id = JSON.parse($this.attr("data-id"));
    	if(this.diagramDialog == null){
    		$.u.load("com.audit.innerAudit.comm_file.diagramView");
    		this.diagramDialog = new com.audit.innerAudit.comm_file.diagramView($("div[umid=diagramviewdialog]",this.$));
    	}
    	this.diagramDialog.open({"id":wi_id,"title":"###","type":"inst"});
    },
    
    destroy: function () {
    	//this.remarkList.destroy();
    	//this.workflowLog.destroy();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.audit.innerAudit.comm_file.logs.widgetjs = ["../../../../uui/widget/jqurl/jqurl.js",
                                      "../../../../uui/widget/spin/spin.js", 
                                      "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../../uui/widget/ajax/layoutajax.js"
                                      ];
com.audit.innerAudit.comm_file.logs.widgetcss = [];