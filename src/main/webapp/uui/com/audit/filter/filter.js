// @ sourceURL=com.audit.filter.filter
$.u.define('com.audit.filter.filter', null, {
	init : function(options) {
		this._options = options || [];
		this._filtertemplate = "<li data-id='#{propid}' class='criteria-item'>" +
						       	"<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
						            "<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
						        "</button>" +
						        "<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a>" +
						       "</li>";
	},
	afterrender : function(bodystr) {
		this.qid("btn-more-1").off("click").on("click",this.proxy(this.on_btn_more));
		this.qid("btn-search-1").off("click").on("click",this.proxy(this.on_btn_search_click));
		$(".criteria-list",this.$).off("click","li.criteria-item > button")
		  						  .on("click","li.criteria-item > button",this.proxy(this.on_btn_filter_click));
	},
	_start : function(){
		this.getParam();
	},
	getParam : function(){
		this.filter = this._options;
		this.createFilter();
	},
	createFilter : function(){
		$(".criteria-item",this.$).remove();
		this.filter = this.filter.reverse();
		this.filter && $.each(this.filter,this.proxy(function(key,item){
			if(item.type === "static"){
				var staticul = $(".search-criteria",this.$).children().first();
		        var staticultext = staticul.children().first();
	        	var htm = this._filtertemplate.replace(/#\{propid\}/g, item.propid)
	        								  .replace(/#\{propname\}/g, item.propname)
	            			  				  .replace(/#\{propshow\}/g, item.propshow || "全部")
	        								  .replace(/#\{propplugin\}/g, item.propplugin);
	            $(htm).insertBefore(staticultext).data("data-data",item);
		        $(".remove-filter", staticul).hide();
			}else{
				 this._rebuildFynmaicFilters(item);
			}
		}));
		this.on_btn_search_click();
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
    	$(".search-criteria",this.$).find('.criteria-item').each(function(k,v){
    		setting.remove.push($(v).data("data-data"));
    	})
    	$(".search-criteria-extended",this.$).find('.criteria-item').each(function(k,v){
    		setting.checked.push($(v).data("data-data"));
    	})
    	$button.addClass("active");
		moreRenderClazz = $.u.load("com.audit.filter.moreProp");
		moreRenderObj = new moreRenderClazz();
		moreRenderObj.override({
			"afterDestroy": this.proxy(function(){
				$allButtons.removeClass("active");
				$button.removeClass("active");
			}),
			"filter_check":this.proxy(function(filter){
				this._rebuildFynmaicFilters(filter);
				$("button[data-id='"+filter.propid+"']",this.$).trigger("click");
			}),
			"filter_uncheck":this.proxy(function(filter){
				$("li[data-id='"+filter.propid+"']",this.$).remove();
			})
		});
		result = moreRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		moreRenderObj.get("filter","render",setting,sel);
    },
    on_btn_search_click: function () {
        var query = [];
        $(".criteria-item",this.$).each(this.proxy(function(k,v){
        	query.push($(v).data("data-data"));
        }));
        this.loadData(query);
    },
    _rebuildFynmaicFilters : function(filter){
    	var dynamicul = $(".search-criteria-extended",this.$).children().first();
    	var $li = $("li[data-id='"+filter.propid+"']",this.$);
    	var htm = this._filtertemplate.replace(/#\{propid\}/g, filter.propid)
									  .replace(/#\{propname\}/g, filter.propname)
									  .replace(/#\{propshow\}/g, filter.propshow || "全部")
									  .replace(/#\{propplugin\}/g, filter.propplugin);
    	if($li.length){
    		$li.find(".fieldValue").text((filter.propshow || "全部"));
    		$li.data("data-data",filter);
    	}else{
    		$(htm).appendTo(dynamicul).data("data-data",filter);
    	}
    	dynamicul.off("click", "a.remove-filter").on("click", "a.remove-filter", this.proxy(function (e) {
        	e.preventDefault(); 
        	var $a = $(e.currentTarget);
        	$a.closest("li").remove();
        	this.on_btn_search_click();
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
				this.on_btn_search_click();
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
	},
	loadData : function(){
		
	}
}, {
	usehtm : true,
	usei18n : false
});

com.audit.filter.filter.widgetjs = ['../../../uui/widget/spin/spin.js',
									'../../../uui/widget/jqblockui/jquery.blockUI.js',
									'../../../uui/widget/ajax/layoutajax.js'
									 ];
com.audit.filter.filter.widgetcss = [];