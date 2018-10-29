//@ sourceURL=com.sms.detailmodule.threatErrorDialog
$.u.define('com.sms.detailmodule.threatErrorDialog', null, {
    init: function (option) {
    	/*
    	 * {
    	 * 	title: "",
    	 *  temId: "",
    	 *  type: "", ERROR or THREAT
    	 *  insecurityId: "",
    	 *  sysTypeId: ""
    	 * }
    	 */
    	this._options = option;
    	this._tabHeader = '<li>' +
    					 	'<a href="#category-' + this._id + '-#{no}" role="tab" data-name="#{name}" data-toggle="tab">#{name}</a>' +
    					  '</li>';
    	this._tabContent = '<div id="category-' + this._id + '-#{no}" class="tab-pane">' +
    					   '</div>';
    	this._moreBtn = '<div class="text-right"><button class="btn btn-link morechoice" data-name="#{name}" data-target="#{target}">更多</button></div>';
    	this._dl = '<dl class="dl-horizontal" data-name="#{cate}" style="margin-bottom:10px;">' +
    				  '<dt style="width:120px;">#{cate}</dt>' +
    				  '<dd style="margin-left:140px;"></dd>' +
    			   '</dl>';
    	this._item = '<a href="#" data-id="#{id}" class="core" style="margin-right:10px;" >#{name}</a>';
    	this._item = '<div class="checkbox" style="margin-top:0;margin-bottom:5px;display:inline-block;margin-right:10px;"><label><input type="checkbox" name="' + this._id + '" value="#{id}" />#{name}</label></div>';
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.threatErrorDialog.i18n;
    	this.tabHeaderContainer = this.qid("tab");
    	this.tabContentContainer = this.qid("tab-content");
    	
    	this.tabHeaderContainer.on("show.bs.tab", "a[data-toggle=tab]", this.proxy(this.on_tabs_click));
    	this.tabContentContainer.on("click", "button.morechoice", this.proxy(this.on_moreChoice_click));

    	this.formDialog = this.qid("dialog").dialog({
            title: this._options.title, //this.i18n.title
            width: 740,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
                {
                	"text":this.i18n.ok,
                	"click":this.proxy(this.on_formDialogSave_click)
                },
                {
                	"text":this.i18n.cancel,
                	"class":"aui-button-link",
                	"click":this.proxy(this.on_formDialogCancel_click)
                }
            ],
            create:this.proxy(this.on_formDialog_create),
            open:this.proxy(this.on_formDialog_open),
            close:this.proxy(this.on_formDialog_close)
        }); 
    },
    on_moreChoice_click: function(e){
    	var $this = $(e.currentTarget), name = $this.attr("data-name"), $content = $($this.attr("data-target"));
    	this._buildChoiceList({
			params: {
    			type: "O" + this._options.type,
    			category: name
    		},
    		"$content": $content,
    		callback: this.proxy(function(){
    			$this.remove();
    		})
		});
    	$this.remove();
    },
    on_tabs_click: function(e){
    	var $this = $(e.currentTarget), name = $this.attr("data-name"), $content = $($this.attr("href"));
    	if(!$content.children().length){
    		this._buildChoiceList({
    			params: {
	    			type: this._options.type,
	    			category: name
	    		},
	    		"$content": $content,
	    		callback: this.proxy(function(){
	    			$(this._moreBtn.replace(/#\{target\}/g, $this.attr("href")).replace(/#\{name\}/g, name)).appendTo($content);
	    		})
    		});
    	}
    },
    on_formDialogSave_click:function(){
    	var formdata = {tem: this._options.temId}, $selected = this.tabContentContainer.find("[name=" + this._id + "]:checked"), ids = [];
    	if($selected && $selected.length > 0){
    		ids = JSON.stringify($.map($selected, this.proxy(function(checkbox, idx){
    			return parseInt($(checkbox).val());
    		})));
	    	if(this._options.type == "THREAT"){
	    		formdata.threats = ids;
	    	}else if(this._options.type == "ERROR"){
	    		formdata.errors = ids;
	    	}
	    	this.save(this, formdata);
    	}else{
    		$.u.alert.error("请选择"+ (this._options.type == "THREAT" ? "威胁" : "差错"), 1000 * 2);
    	}
    },
    on_formDialogCancel_click:function(){
    	this.formDialog.dialog("close");
    },
    on_formDialog_create:function(){
    	
    },
    on_formDialog_open:function(){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		{
    			tokenid: $.cookie("tokenid"),
    			method: "getTOrRforActivity",
    			object: "tem",
    			type: this._options.type,
    			systemId: this._options.sysTypeId,
    			insecurityId: this._options.insecurityId
    		},
    		this.formDialog.parent(),
    		{},
    		this.proxy(function(response){
    			if(response.data && $.isArray(response.data)){
    				$.each(response.data, this.proxy(function(idx, cate){
    					$(this._tabHeader.replace(/#\{name\}/g, cate).replace(/#\{no\}/g, idx)).appendTo(this.tabHeaderContainer);
    					$(this._tabContent.replace(/#\{no\}/g, idx)).appendTo(this.tabContentContainer);    					
    				}));
    				this.tabHeaderContainer.find("a[role=tab]:first").tab("show");
    			}
    		})
    	);
    },
    on_formDialog_close:function(){
    	
    },
    open:function(data){
    	this.formDialog.dialog("open");
    },
    /**
     * {
     * 	params: {},
     *  $content: (jQuery Object),
     *  callback: function(){}
     * }
     */
    _buildChoiceList: function(args){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		$.extend({
    			tokenid: $.cookie("tokenid"),
    			method: "getTOrRforActivity",
    			object: "tem",
    			systemId: this._options.sysTypeId,
    			insecurityId: this._options.insecurityId
    		}, args.params, true),
    		this.tabHeaderContainer,
    		{},
    		this.proxy(function(response){
    			if(response.data && $.isArray(response.data)){
    				var $dl = null;
    				$.each(response.data, this.proxy(function(idx, item){
    					$dl = this.tabContentContainer.find("dl[data-name='" + item.classification + "']");
    					if(!$dl.length){
    						$dl = $(this._dl.replace(/#\{cate\}/g, item.classification)).appendTo(args.$content);
    					}
    					$(this._item.replace(/#\{name\}/g, item.name).replace(/#\{id\}/g, item.id)).appendTo($dl.children("dd"));
    					
    				}));
    				args.callback && args.callback();
    			}
    		})
    	);
    },
    /**
     * @title ajax
     * @param url {string} url
     * @param param {object} ajax param
     * @param $container {jQuery object} the object for block
     * @param blockParam {object} blockui param
     * @param callback {function} callback
     */
    _ajax:function(url,param,$container,blockParam,callback){
    	$.u.ajax({
    		"url":url,
    		"type": url.indexOf(".json") > -1 ? "get" : "post" ,
    		"data":$.extend({"tokenid":$.cookie("tokenid")},param),
    		"dataType":"json"
    	},$container,$.extend({},blockParam)).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    /**
     * @title 用于重写
     */
    save:function(comp, formData){},
    destroy: function () {
    	this.formDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.threatErrorDialog.widgetjs = [];
com.sms.detailmodule.threatErrorDialog.widgetcss = [];