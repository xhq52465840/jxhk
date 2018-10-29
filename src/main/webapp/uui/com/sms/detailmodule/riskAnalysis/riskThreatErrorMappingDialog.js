//@ sourceURL=com.sms.detailmodule.riskAnalysis.riskThreatErrorMappingDialog
$.u.define('com.sms.detailmodule.riskAnalysis.riskThreatErrorMappingDialog', null, {
    init: function (option) {
    	/*
    	 * {
    	 *  type: "", // error or threat
         *  sysTypeId: "",
         *  checkedArray: [] // checked threats or errors 
    	 * }
    	 */
    	this._options = option;
    	this._tabHeader = '<li>' +
    					 	'<a href="#category-' + this._id + '-#{no}" role="tab" data-name="#{name}" data-toggle="tab">#{name}</a>' +
    					  '</li>';
    	this._tabContent = '<div id="category-' + this._id + '-#{no}" class="tab-pane">' +
    					   '</div>';
    	this._dl = '<dl class="dl-horizontal" data-name="#{cate}" style="margin-bottom:10px;">' +
    				  '<dt style="width:120px;">#{cate}</dt>' +
    				  '<dd style="margin-left:140px;"></dd>' +
    			   '</dl>';
    	this._item = '<a href="#" data-id="#{id}" class="core" style="margin-right:10px;" >#{name}</a>';
    	this._item = '<div class="checkbox" style="margin-top:0;margin-bottom:5px;display:inline-block;margin-right:10px;"><label><input type="checkbox" data-name="#{name}" name="' + this._id + '" value="#{id}" />#{name}</label></div>';
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.detailmodule.riskAnalysis.riskThreatErrorMappingDialog.i18n;
    	this.tabHeaderContainer = this.qid("tab");
    	this.tabContentContainer = this.qid("tab-content");
    	
    	this.tabHeaderContainer.on("show.bs.tab", "a[data-toggle=tab]", this.proxy(this.on_tabs_click));

    	this.formDialog = this.qid("dialog").dialog({
            title: this.i18n.title[this._options.type], //this.i18n.title
            width: 740,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
                {
                	"text":this.i18n.buttons.ok,
                	"click":this.proxy(this.on_formDialogSave_click)
                },
                {
                	"text":this.i18n.buttons.cancel,
                	"class":"aui-button-link",
                	"click":this.proxy(this.on_formDialogCancel_click)
                }
            ],
            create:this.proxy(this.on_formDialog_create),
            open:this.proxy(this.on_formDialog_open),
            close:this.proxy(this.on_formDialog_close)
        }); 
    },
    on_tabs_click: function(e){
    	var $this = $(e.currentTarget), name = $this.attr("data-name"), $content = $($this.attr("href"));
    	if(!$content.children().length){
    		this._buildChoiceList({
    			params: {
	    			"method": "stdcomponent.getbysearch",
                    "dataobject": this._options.type,
                    "rule": JSON.stringify([[{"key":"category", "value": name}],[{"key":"system", "value": this._options.sysTypeId}]])
	    		},
	    		"$content": $content,
	    		callback: this.proxy(function(){
	    			
                })
    		});
    	}
    },
    on_formDialogSave_click:function(){
    	var formdata = {}, $selected = this.tabContentContainer.find("[name=" + this._id + "]:checked:not([disabled])"), objs = [];
    	if($selected && $selected.length > 0){
    		objs = $.map($selected, this.proxy(function(checkbox, idx){
    			return { 
                    "id": parseInt($(checkbox).val()),
                    "name": $(checkbox).attr("data-name")
                }
    		}));
	    	if(this._options.type == "threat"){
	    		formdata.threats = objs;
	    	}else if(this._options.type == "error"){
	    		formdata.errors = objs;
	    	}
	    	this.save(this, formdata);
    	}else{
    		$.u.alert.error("请选择"+ (this._options.type == "threat" ? "威胁" : "差错"), 1000 * 2);
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
    			"tokenid": $.cookie("tokenid"),
    			"method": "getTOrRforActivity",
    			"object": "tem",
    			"type": this._options.type.toUpperCase(),
                "systemId": this._options.sysTypeId,
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
    		}, args.params, true),
    		this.tabHeaderContainer,
    		{},
    		this.proxy(function(response){
    			if(response.success){
    				var $dl = null, $checkbox;
    				$.each(response.data.aaData, this.proxy(function(idx, item){
    					$dl = this.tabContentContainer.find("dl[data-name=" + item.classification + "]");
    					if(!$dl.length){
    						$dl = $(this._dl.replace(/#\{cate\}/g, item.classification)).appendTo(args.$content);
    					}
    					$checkbox = $(this._item.replace(/#\{title\}/g, item.name).replace(/#\{name\}/g, item.name).replace(/#\{id\}/g, item.id)).appendTo($dl.children("dd"));
                        if($.inArray(item.id, this._options.checkedArray || []) > -1){
                            $checkbox.find("input:checkbox").prop({"checked":true, "disabled":true});
                        }
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


com.sms.detailmodule.riskAnalysis.riskThreatErrorMappingDialog.widgetjs = [];
com.sms.detailmodule.riskAnalysis.riskThreatErrorMappingDialog.widgetcss = [];