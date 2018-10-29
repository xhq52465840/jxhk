// @ sourceURL=com.sms.dash.aviationSafetyInfo
$.u.define('com.sms.dash.aviationSafetyInfo', null, {
	init : function(options) {
		this._options = options||{};
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("chrome") > 0){
		}else if(agent.indexOf("msie") > 0){
			query=JSON.parse(this._options.filter);
			}
		this._filtertemplate = "<li data-id='#{propid}' class='criteria-item'>" +
	       	"<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
	            "<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
	        "</button>" +
	        "<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a>" +
	       "</li>";
	},
	afterrender : function(bodystr) {
		this._options.filter = window.decodeURIComponent(window.decodeURIComponent(this._options.filter));
		$(".criteria-list",this.$).off("click","li.criteria-item > button")
		  .on("click","li.criteria-item > button",this.proxy(this.on_btn_filter_click));
		this.qid("btn-more-1").off("click").on("click",this.proxy(this.on_btn_more));
		this.qid("btn-search-1").off("click").on("click",this.proxy(this.on_btn_search_click));
		this.createFilter();
		this.dataTable = this.qid("datatable").dataTable({
	        "searching": false,
	        "serverSide": true,
	        "bProcessing": true,
	        "ordering": false,
	        "pageLength": 10,
	        "dom":"tip",
	        "columns": [
	            { "title": "#", "data": "num", "width": "1%" },
	            { "title": "类型", "mData": "type", "width": "15%" },
	            { "title": "关键字", "mData": "num", "width": "10%" },
	            { "title": "主题", "mData": "summary", "width": "64%" },
	            { "title": "安监机构", "mData": "unit", "width": "10%" }
	        ],
	        "aoColumnDefs": [
				{
				    "aTargets": 1,
				    "mRender": function (data, type, full) {
				    	return data.name;
				    }
				},
				{
				    "aTargets": 2,
				    "mRender": function (data, type, full) {
				    	return '<a href="../search/activity.html?activityId=' + full.id + '" target="_blank">' + full.unit.code + "-" + full.num + '</a>'
				    }
				},
				{
				    "aTargets": 3,
				    "mRender": function (data, type, full) {
				    	return '<a href="../search/activity.html?activityId=' + full.id + '" target="_blank">' + data + '</a>'
				    }
				},
				{
				    "aTargets": 4,
				    "mRender": function (data, type, full) {
				    	return data.name;
				    }
				}
	        ],
	        "language": { //语言
	            "sSearch": "搜索：",
	            "sLengthMenu": "每页显示 _MENU_ 条记录",
	            "sZeroRecords": "抱歉未找到记录",
	            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
	            "sInfoEmpty": "没有数据",
	            "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
	            "sProcessing": "检索中...",
	            "oPaginate": {
	                "sFirst": "<<",
	                "sPrevious": "<",
	                "sNext": ">",
	                "sLast": ">>"
	            }
	        },
	        "ajax": this.proxy(this.ajax),
	        "createdRow": this.proxy(this.createRow)
	    });
	},
	createRow: function (row, data, dataIndex) {
	    $(row).children("td:first").text(dataIndex + 1);
	},
	ajax: function (data, callback, settings) {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
			data : $.extend({},data,{"columns":"",search:""},{
        		"tokenid":$.cookie("tokenid"),
        		"method": "stdcomponent.getbysearchex",
         		"core": "activity"
			},this._getSearchData(),true)
        }, this.qid("datatable").parent(), { size: 2 ,backgroundColor:"#fff"}).done(this.proxy(function (response) {
        	if (response.success) {
        		if(response.data){
        			response.data.iTotalDisplayRecords = response.data.iTotalRecords;
        			callback(response.data);
        		}else{
        			response.data = {};
        			response.data.aaData = [];
        			response.data.iTotalDisplayRecords = 0;
        			response.data.iTotalRecords = 0;
        			callback(response.data);
        		}
        		
            } else {
                $.u.alert.error(response.reason);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
	},
	_getSearchData : function(){
		var query = [];
		$(".criteria-item").each(this.proxy(function(k,v){
        	query.push($(v).data("data-data"));
        }))
        var query = $.map(query,function(filter){
			if(filter.propvalue && filter.propvalue.length>0){
        		return {id:filter.propid,value:filter.propvalue};
			}
    	});
        return {
     		"query":JSON.stringify(query)
		};
	},
	createFilter : function(){
		$(".criteria-item").remove();
		var query = $.parseJSON(this._options.filter).reverse();
		query && $.each(query,this.proxy(function(key,item){
			if(item.type === "static"){
				var staticul = $(".search-criteria").children().first();
		        var staticultext = staticul.children().first();
	        	var htm = this._filtertemplate.replace(/#\{propid\}/g, item.propid)
	        								  .replace(/#\{propname\}/g, item.propname)
	            			  				  .replace(/#\{propshow\}/g, this._transformFlterShow(item.propshow) || "全部")
	        								  .replace(/#\{propplugin\}/g, item.propplugin);
	            $(htm).insertBefore(staticultext).data("data-data",item);
		        $(".remove-filter", staticul).hide();
			}else{
				 this._rebuildFynmaicFilters(item);
			}
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
    on_btn_filter_click:function(e){
    	var $button = $(e.currentTarget),
    		$allButtons = $(".criteria-list button"),
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
				this.on_btn_search_click(e);
			})
		});
		result = inputRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		inputRenderObj.get("filter","render",$.extend(true,{},$button.parent().data("data-data")),sel);
		
    },
    on_btn_more:function(e){
    	var $button=$(e.currentTarget),
			$allButtons=$(".criteria-list button"),
			offset=$button.offset(),
			setting={
    			"checked":[],
    			"remove":[]
    		},
			moreRenderClazz = null,
			moreRenderObj = null,
    		result = null,
    		sel = null;
    	$(".search-criteria").find('.criteria-item').each(function(k,v){
    		setting.remove.push($(v).data("data-data"));
    	})
    	$(".search-criteria-extended").find('.criteria-item').each(function(k,v){
    		setting.checked.push($(v).data("data-data"));
    	})
    	$button.addClass("active");
		moreRenderClazz = $.u.load("com.sms.plugin.search.moreProp");
		moreRenderObj = new moreRenderClazz();
		moreRenderObj.override({
			"afterDestroy": this.proxy(function(){
				$allButtons.removeClass("active");
			}),
			"filter_check":this.proxy(function(filter){
				this._rebuildFynmaicFilters(filter);
				$("button[data-id='"+filter.propid+"']").trigger("click");
			}),
			"filter_uncheck":this.proxy(function(filter){
				$("li[data-id='"+filter.propid+"']").remove();
			})
		});
		result = moreRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		moreRenderObj.get("filter","render",setting,sel);
    },
    _rebuildFynmaicFilters : function(filter){
    	var dynamicul = $(".search-criteria-extended").children().first();
    	var $li = $("li[data-id='"+filter.propid+"']");
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
        	var $a = $(e.currentTarget),
        		propid=$a.prev().attr("data-id");
        	$a.closest("li").remove();
        	this.on_btn_search_click(e);
        }));
    },
    on_btn_search_click: function (e) {
        e.preventDefault();
        this.dataTable.fnDraw();
    },
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.aviationSafetyInfo.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                            '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                            '../../../uui/widget/spin/spin.js',
              							  	'../../../uui/widget/jqblockui/jquery.blockUI.js',
              							  	'../../../uui/widget/ajax/layoutajax.js'];
com.sms.dash.aviationSafetyInfo.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                      { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];