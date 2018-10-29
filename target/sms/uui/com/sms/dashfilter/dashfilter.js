// @ sourceURL=com.sms.dashfilter.dashfilter
$.u.define('com.sms.dashfilter.dashfilter', null, {
	init : function(options) {
		this._options = options || {};
		this._filtertemplate = "<li data-id='#{propid}' class='criteria-item'>" +
						       	"<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
						            "<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
						        "</button>" +
						        "<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a>" +
						       "</li>";
		this.divTemplate = "<div class='line sav col-md-12'>"+
								"<div class='col-md-12'>"+
									"<button type='button' class='btn btn-subtle btn-sel' title='选择过滤器'>设置</button>"+
								"</div>"+
								"<div class='col-md-12'>" +
									"<div class='search-criteria-extended'><ul class='criteria-list'></ul></div>" +
								"</div>"+
								"<div class='col-md-12'>"+
									"<button qid='filter-other' type='button' class='btn btn-subtle btn-sev' title='选择点击时过滤器'>设置点击过滤器</button>"+
								"</div>"+
								"<div class='col-md-12'>"+
									"<div class='search-criteria-other'><ul class='criteria-list'></ul></div>"+
								"</div>"+
							"</div>";
	},
	afterrender : function(bodystr) {
		this._row = $('.row',this.$);
		$(this.divTemplate).appendTo(this._row);
		$(".btn-sel").off("click").on("click",this.proxy(this.on_btn_more));
		$(".btn-sev").off("click").on("click",this.proxy(this.on_btn_other));
		$(".search-criteria-extended").find(".criteria-list").off("click","li.criteria-item > button")
			.on("click","li.criteria-item > button",this.proxy(this.on_btn_filter_click));
		this.getParam();
	},
	getParam : function(){
		if(this._options.hasOwnProperty("filterParam")){
			this.createFilter();
		}
	},
	createFilter : function(){
		$.each(this._options.filterParam,this.proxy(function(k,v){
			this._rebuildFynmaicFilters(v);
		}));
		$.each(this._options.clickParam,this.proxy(function(k,v){
			this._rebuildOtherFilters(v);
		}));
	},
    _transformFlterShow: function(name){
    	var result = name;
    	switch(name) {
    		case "currentUser()": 
    			result = "当前用户";
    			break;
    	}
    	return result;
    },
    on_btn_more:function(e){
    	var $button=$(e.currentTarget),
			$allButtons=$(".criteria-list button",this.$),
			offset=$button.offset(),
			setting={
    			"checked":[],
    			"remove":[]
    		},
			moreRenderClazz = null,
			moreRenderObj = null,
    		result = null,
    		sel = null;
    	var $extended = $button.parent().parent().find('.search-criteria-extended');
    	$extended.find('.criteria-item').each(function(k,v){
    		setting.checked.push($(v).data("data-data"));
    	})
    	$button.addClass("active");
		moreRenderClazz = $.u.load("com.sms.plugin.search.moreProp");
		moreRenderObj = new moreRenderClazz();
		moreRenderObj.override({
			"afterDestroy": this.proxy(function(){
				$allButtons.removeClass("active");
				$button.removeClass("active");
			}),
			"filter_check":this.proxy(function(filter){
				this._rebuildFynmaicFilters(filter);
				$extended.find("button[data-id='"+filter.propid+"']").trigger("click");
			}),
			"filter_uncheck":this.proxy(function(filter){
				$extended.find("li[data-id='"+filter.propid+"']").remove();
			})
		});
		result = moreRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		moreRenderObj.get("filter","render",setting,sel);
    },
    _rebuildFynmaicFilters : function(filter){
    	var $extended = null;
    	if(this._options.hasOwnProperty("filterParam")){
    		$extended = $('div.sav').find('.search-criteria-extended');
    	}else{
    	    $extended = $("button.active").parent().parent().find('.search-criteria-extended');
			if($extended.length == 0){
				$extended = $("button.active").parent().parent().parent();
			}
    	}
    	var dynamicul = $extended.children().first();
    	var $li = $extended.find("li[data-id='"+filter.propid+"']");
    	var htm = this._filtertemplate.replace(/#\{propid\}/g, filter.propid)
									  .replace(/#\{propname\}/g, filter.propname)
									  .replace(/#\{propshow\}/g, this._transformFlterShow(filter.propshow) || "全部")
									  .replace(/#\{propplugin\}/g, filter.propplugin);
    	if($li.length){
    		$li.find(".fieldValue").text((this._transformFlterShow(filter.propshow) || "全部"));
    		$li.data("data-data",filter);
    	}else{
    		$(htm).appendTo(dynamicul).data("data-data",filter);
    	}
    	dynamicul.off("click", "a.remove-filter").on("click", "a.remove-filter", this.proxy(function (e) {
        	e.preventDefault(); 
        	var $a = $(e.currentTarget);
        	$a.closest("li").remove();
        }));
    },
    on_btn_other : function(e){
    	var $button=$(e.currentTarget),
			offset=$button.offset(),
			setting={
				"checked":[],
				"remove":[]
			},
			moreRenderClazz = null,
			moreRenderObj = null,
			result = null,
			sel = null;
    	var $other = $button.parent().parent().find('.search-criteria-other');
    	$other.find('.criteria-item').each(function(k,v){
			setting.checked.push($(v).data("data-data"));
		})
		$button.addClass("active");
		moreRenderClazz = $.u.load("com.sms.plugin.search.moreProp");
		moreRenderObj = new moreRenderClazz();
		moreRenderObj.override({
			"afterDestroy": this.proxy(function(){
				$button.removeClass("active");
			}),
			"filter_check":this.proxy(function(filter){
				this._rebuildOtherFilters(filter);
			}),
			"filter_uncheck":this.proxy(function(filter){
				$other.find("li[data-id='"+filter.propid+"']").remove();
			})
		});
		result = moreRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		moreRenderObj.get("filter","render",setting,sel);
    },
    _rebuildOtherFilters : function(filter, index){
    	var $other = null;
    	if(this._options.hasOwnProperty("clickParam")){
    		$other = $('div.sav').find('.search-criteria-other');
    	}else{
    		$other = $("button.active").parent().parent().find('.search-criteria-other');
    	}
    	var dynamicul = $other.children().first();
    	var htm = this._filtertemplate.replace(/#\{propid\}/g, filter.propid)
									  .replace(/#\{propname\}：/g, filter.propname)
									  .replace(/#\{propshow\}/g, "")
									  .replace(/#\{propplugin\}/g, filter.propplugin);
    	$(htm).appendTo(dynamicul).data("data-data",filter);
    	dynamicul.off("click", "a.remove-filter").on("click", "a.remove-filter", this.proxy(function (e) {
        	e.preventDefault(); 
        	var $a = $(e.currentTarget);
        	$a.closest("li").remove();
        }));
    },
    on_btn_filter_click:function(e){
    	var $button = $(e.currentTarget),
    		$allButtons = $(".criteria-list button",this.$),
    		plugin = $button.attr("data-plugin"),
    		offset = $button.offset(),
    		inputRenderClazz = null,
    		inputRenderObj = null,
    		result = null,
    		sel = null;
    	
    	$allButtons.removeClass("active");
    	$button.addClass("active");
    	
		inputRenderClazz = $.u.load(plugin);
		inputRenderObj = new inputRenderClazz();
		inputRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
				$allButtons.removeClass("active");
			}),
			"update": this.proxy(function(value){
				this._rebuildFynmaicFilters(value);
			})
		});
		result = inputRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		inputRenderObj.get("filter","render",$.extend(true,{},$button.parent().data("data-data")),sel);
    },
	_ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dashfilter.dashfilter.widgetjs = ['../../../uui/widget/spin/spin.js',
									'../../../uui/widget/jqblockui/jquery.blockUI.js',
									'../../../uui/widget/ajax/layoutajax.js'
									 ];
com.sms.dashfilter.dashfilter.widgetcss = [];