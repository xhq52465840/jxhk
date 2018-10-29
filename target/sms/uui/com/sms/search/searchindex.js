//@ sourceURL=com.sms.search.searchindex
$.u.define('com.sms.search.searchindex', null, {
    init: function () {
        this._filtertemplate = "<li data-id='#{propid}' class='criteria-item'>" +
                            "<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
                                "<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
                            "</button>" +
                            "<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a></li>";
        this._filterId = null; 			// 默认取1
        this._defaultFilter = null;		// 存取默认userfilter.json数据，切换过滤器时基于此数据设置
        this._userFilter = null;		// 获取userfilter.json的默认过滤器数据，点击过滤器与this._filterData合并
        this._filterData = null;		// 当前收藏过滤器的json数据，用于比较是否修改
        this.IS_MY_FILTER = false;	
        this._exportExcelOptions = {};	
        this._viewDataTable = null;
        this._detailDataTable = null;
    },
    afterrender: function () {
    	/**
    	 * 1. 调用userfilter.json初始化默认设置 this._userFilter
    	 * 2. url参数中指定过滤器，加载过滤器设置覆盖默认设置 this._filterData (保留获取时原始值，不作更改)
    	 * 3. 判断是否更改对比this.-userfilter和this._filterData
    	 */
    	this._ajax("userfilter.json", {}, this.$, {}, this.proxy(function(result){
    		var hashParam = $.urlParam(window.location.href,"#"), normalParam = $.urlParam(window.location.href,"?");
    		this._userFilter = result.data;
            this._defaultFilter = $.extend(true,{},result.data);
            if (!hashParam.filterId && !normalParam.filterId) { // 只处理没有指定过滤器的情况，指定的情况在loadfilterbyurl函数会调用_initfilter函数
            	if($.jStorage.get("userColumns")){
            		this._userFilter.columns = $.extend(true, {}, $.jStorage.get("userColumns"));
            	}
        		if ($.cookie("view") && $.inArray($.cookie("view"), ["list", "detail"]) > -1){
					this._userFilter.view = $.cookie("view");
				}
        		this._initfilter();
                this.columnpanel._loadData($.extend([],this._userFilter.columns), "DEFAULT", "DEFAULT");
            }
    	}));
        this.qid("btn-removefavorites")
        	.add(this.qid("btn-viewchange"))
            .add(this.qid("btn-more"))
            .add(this.qid("btn-search"))
            .add(this.qid("btn-search-advanced"))
            .add(this.qid("btn-advanced"))
            .add(this.qid("btn-basic")).tooltip({
	            "container": "body",
	            "delay": 800
	        });
        /*鼠标悬停事件*/
        this.qid("viewtable").on('mouseover', '.descriptionTitle', this.proxy(this.title_show)).on('mouseout', '.descriptionTitle', this.proxy(this.title_back));
       
        this.columnpanel.override({update:this.proxy(this.on_columnsProp_update), close:this.proxy(this.on_columnsProp_close)}); 		// 数据列组件
        this.orderpanel.override({order:this.proxy(this.on_orderPanel_order)});  														// 选择排序字段组件
        this.qid("search-query").keypress(this.proxy(this.on_searchQuery_enter));
        this.qid("btn-removefavorites").unbind("click").click(this.proxy(this.on_btn_removefavorites_click));
        this.qid("btn-advanced").unbind("click").click(this.proxy(this.on_btn_advanced_click));
        this.qid("btn-basic").unbind("click").click(this.proxy(this.on_btn_basic_click));
        this.qid("btn-search").unbind("click").click(this.proxy(this.on_btn_search_click));
        this.qid("btn-more").unbind("click").click(this.proxy(this.on_btn_more));
        this.qid("btn-search-advanced").unbind("click").click(this.proxy(this.on_btn_search_dvanced_click));
        this.qid("btn-viewchange").next().off("click", "a").on("click", "a", this.proxy(this.on_btn_viewchange));
        this.qid("btn-savefilteras").unbind("click").click(this.proxy(this.on_btn_savefilteras_click));
        this.qid("btn-savefilter").unbind("click").click(this.proxy(this.on_btn_savefilter_click));
        this.qid("btn-columns").unbind("blick").click(this.proxy(this.on_btn_columns_click));
        this.qid("link-savefilteras").unbind("click").click(this.proxy(this.on_btn_savefilteras_click));
        this.qid("link-giveupedit").unbind("click").click(this.proxy(this.on_link_giveupedit_click));
        this.qid("btn-export-excel").unbind("click").click(this.proxy(this.on_exportExcel_click));
        this.qid("result-panel").off("click", "div.listtablerefersh").on("click", "div.listtablerefersh", this.proxy(this.on_listtablerefresh_click));
        this.qid("detailview").off("click","span.order-options").on("click","span.order-options",this.proxy(this.on_order_options_click));
        this.qid("detailview").off("click","span.orderby").on("click","span.orderby",this.proxy(this.on_orderby_click));
        $(".criteria-list",this.$).off("click","li.criteria-item > button").on("click","li.criteria-item > button",this.proxy(this.on_btn_filter_click));  // 绑定筛选按钮事件
        
        $(window).resize(this.proxy(this.on_resize));
        
        this.qid("search-query").val($.urlParam().text || "");
        
    },
    on_exportExcel_click: function(e){
        e.preventDefault();
        var form = $("<form/>");
        var query=null;
        var action=null;
		query = JSON.parse(window.decodeURIComponent(this._exportExcelOptions.columns));
		for(i in query){
			if(query[i].data=="keyword"){
				query.splice(i,1);
			}
		}
		var data_C=[{name:"tokenid",data:$.cookie("tokenid")},
		            {name:"method",data:"exportActivitiesToExcel"},
		            {name:"core",data:"activity"},
		            {name:"url",data:window.location.host + window.location.pathname + window.location.search},
		            {name:"sort",data:this.sort},
		            {name:"query",data:JSON.stringify(this.MYquery)}
		            ];
	
		 var input = document.createElement("input");  
			  input.type = "hidden";  
			  input.name ="columns";  
			  input.value = JSON.stringify(query);  
			  form.append(input); 
		 for(var i in data_C){  
			 var input = document.createElement("input");  
			  input.type = "hidden";  
			  input.name = data_C[i].name;  
			  input.value = data_C[i].data;  
			  form.append(input); 
			 }
        form.attr({
            'style': 'display:none',
            'method': 'post',
            'target': '_blank',
            'action':$.u.config.constant.smsqueryserver
        });  
        form.appendTo('body').submit().remove();
    },
    on_searchQuery_enter:function(e){
    	var which = e.which;
    	if(which == 13){
    		this.qid("btn-search").trigger("click");
    	}
    },
    on_columnsProp_update:function(data, selectedType){
        var newFilter = $.extend(true, {}, this._filterData, {columns: data});        
    	this._userFilter.columns = data; 
    	if($.isNumeric(this._filterId) && selectedType == "FILTER"){
    		this._userFilter.mydefaultcolumns = false;
			this._saveFilter({
				"filterId": this._filterId, 
				"data": {filterRule:JSON.stringify(data)}, 
				"refresh": true, 
				"showMsg": false
			});
    	}else if(selectedType == "DEFAULT"){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			{"method":"stdcomponent.update", "dataobject":"user", "dataobjectid":parseInt($.cookie("userid")), "obj":JSON.stringify({"columns":JSON.stringify(data)})},
    			this.qid("result-panel"),
    			{backgroundColor:'#fff'},
    			this.proxy(function(response){ 
    				if(response && response.success){
	    				$.jStorage.set("userColumns", $.extend(true, {}, data), {TTL: 1000 * 60});
	    				if($.isNumeric(this._filterId)){
	    	    			this._userFilter.mydefaultcolumns = true;
	    	    			this._saveFilter({
	    	    				"filterId": this._filterId, 
	    	    				"data": {filterRule:JSON.stringify(newFilter)}, 
	    	    				"refresh": true, 
	    	    				"showMsg": false
	    	    			});
	    	    		}else{
	    	    			this.qid("btn-search-advanced").trigger("click");
	    	    		}
    				}
    			})
    		);
    	}
		this.qid("btn-columns").removeClass("active");
		this.$.find(".columns-layer").addClass("hidden");
    },
    on_columnsProp_close:function(){
    	this.qid("btn-columns").removeClass("active");
		this.$.find(".columns-layer").addClass("hidden");
    },
    on_orderPanel_order:function(field){
    	var $orderby = this.$.find(".orderby");
		$orderby.data("data",{
			"propid": field.key,
			"propname": field.name,
			"order": "asc"
		}).find("span:eq(0)").text("按 " + field.name + " 排序");
		this.$.find(".order-layer").addClass("hidden");
		$orderby.trigger("click");
    },
    on_listtablerefresh_click: function(e){
    	if( this._userFilter.view == "list" ){
    		this.qid("viewtable").dataTable().fnDraw();
    	}else if( this._userFilter.view == "detail"){
    		this.qid("detailtable").dataTable().fnDraw();
    	}    	
    },
    on_resize:function(e){
    	if(this._userFilter.view == "detail"){
    		var tableHeight = $(window).height() - 20 -$(".com-sms-applicationHeader").outerHeight(true)-$(".com-sms-search-searchindex > .row:eq(0)").outerHeight(true)-$(".com-sms-search-searchindex > .row:eq(1)").outerHeight(true)-$(".dataTables_scrollHead").outerHeight(true)-$(".bottom").outerHeight(true)
    		var detailHeight = $(window).height() - 5 -$(".com-sms-applicationHeader").outerHeight(true)-$(".com-sms-search-searchindex > .row:eq(0)").outerHeight(true)-$(".com-sms-search-searchindex > .row:eq(1)").outerHeight(true);
    		var filterHeight = $(window).height() - 80 
    						   - $(".com-sms-applicationHeader").outerHeight(true)
    						   - $(".com-sms-filter-filterNav .filters-content > .filters-title").outerHeight(true)
    						   - $(".com-sms-filter-filterNav .filters-content .filter-options").outerHeight(true)
    						   - $(".com-sms-filter-filterNav .filters-content .filter-panel-section:eq(0)").outerHeight(true)
    						   - $(".com-sms-filter-filterNav .filters-content .filter-panel-section:eq(1) .filter-title").outerHeight(true);
    		$(".dataTables_scrollBody").height(tableHeight);
    		$(".com-sms-search-detail").height(detailHeight);
    		$(".com-sms-filter-filterNav .favourite-filters").height(filterHeight).css("overflow-y", "auto");
    		$("body").css("overflow-y","hidden");
    		$(".com-sms-search-detail").css("overflow-y","auto");
    	}else{
    		$("body").css("overflow-y","auto");
            $(".com-sms-filter-filterNav .favourite-filters").css("overflow-y", "visible");
    		$(".com-sms-search-detail").css({"height":"auto","overflow-y":"visible"});
    	}
    },
    /**
     * @title 字段排序按钮
     * @param e
     */
    on_orderby_click:function(e){ 
    	var $this = $(e.currentTarget), data=$this.data("data");
    	if(data.order == "asc"){
    		$this.find("i").removeClass("fa-arrow-down").addClass("fa-arrow-up");
    		data.order="desc";
    	}else{
    		$this.find("i").removeClass("fa-arrow-up").addClass("fa-arrow-down");
    		data.order="asc";
    	}
    	this._userFilter.orders = data; 
    	this._showSaveButton(
            this._filterData 
            && (JSON.stringify(this._filterData.orders || {}) != JSON.stringify(this._userFilter.orders)) 
        );
    	this.qid("detailtable").DataTable().draw();
    },
    /**
     * @title 选择排序字段
     * @param e
     */
    on_order_options_click:function(e){
    	var $orderLayer=$(".order-layer",this.$);
	
    	$orderLayer.removeClass("hidden");
		$("body").bind("mousedown",this.proxy(function(e){
			var $target=$(e.target);
			if( !$target.is(".order-layer") && $target.parents(".order-layer").length<1 ){
				$orderLayer.addClass("hidden");
				$("body").unbind("mousedown");
			}
		}));
    },
    /**
     * @title 保存过滤器
     * @param e
     */
    on_btn_savefilter_click:function(e){
    	this.qid("span-editflag").add(this.qid("div-savebuttons")).addClass("hidden");
    	this.qid("btn-savefilteras").removeClass("hidden");
    	this._saveFilter({
			"filterId": this._filterId, 
			"data": {filterRule:JSON.stringify(this._userFilter)}, 
			"refresh": false, 
			"showMsg": true
		});
    },
    /**
     * @title 保存过滤器为
     * @param e
     */
    on_btn_savefilteras_click:function(e){
    	e.preventDefault();
    	if(this.saveFilterDialog && "destroy" in this.saveFilterDialog){
    		this.saveFilterDialog.destroy();
    	}
    	
		$.u.load("com.sms.common.stdComponentOperate");
    	this.saveFilterDialog = new com.sms.common.stdComponentOperate($("div[umid='saveFilterDialog']",this.$),{
        	"title":"保存过滤器",
    		"dataobject":"filtermanager",
    		"fields":[
    		  {name:"charnelThose",type:"hidden",value:","+$.cookie("userid")+","},
    		  {name:"filterRule",type:"hidden",value:JSON.stringify({dynamicfilters:this._userFilter.dynamicfilters,staticfilters:this._userFilter.staticfilters})},
	          {name:"name",label:"过滤器名称",maxlength:50,type:"text",description:"为此过滤器输入一个名称",rule:{required:true},message:"过滤器名称不能为空"}
	        ],
	        "afterAdd":this.proxy(function(comp,formdata,response){
	        	this.refreshFilterList(response.data);
	        })
        });
    	
    	this.saveFilterDialog.open();
    },
    /**
     * @title 放弃修改
     * @param e
     */
    on_link_giveupedit_click:function(e){
    	e.preventDefault();
    	$.extend(this._userFilter,$.extend(true,{},this._filterData));
    	this.qid("div-savebuttons").add(this.qid("span-editflag")).addClass("hidden");
    	this.qid("btn-savefilteras").removeClass("hidden");
    	this._initfilter();
    },
    /**
     * @title 从收藏的过滤器中删除当前过滤器
     * @param e
     */
    on_btn_removefavorites_click:function(e){
    	// TODO 调用服务从当前用户收藏的过滤器中删除当前过滤器
    	this.removeCurrentFilter(this._filterId);
    },
    /**
     * @title 更改列表视图
     * @param e
     */
    on_btn_viewchange: function (e) {
        e.preventDefault();
        var $a = $(e.currentTarget);
        var $span = $a.children().first();
        if ($a.hasClass("list")) {
            this._userFilter.view = "list";
            if (!$span.hasClass("glyphicon-ok")) {
                $span.removeClass("glyphicon-blank").addClass("glyphicon-ok");
                $a.parent().next().children().first().children().first().removeClass("glyphicon-ok").addClass("glyphicon-blank");
            }
            this.qid("btn-viewchange").children().first().removeClass("fa-list-ul").addClass("fa-bars");
            this.qid("detailview").hide();
            this.qid("btn-columns").show();
            this.qid("btn-search-advanced").trigger("click");
            $.cookie("view", "list", {"path":"/"});
        }
        else {
            this._userFilter.view = "detail";
            if (!$span.hasClass("glyphicon-ok")) {
                $span.removeClass("glyphicon-blank").addClass("glyphicon-ok");
                $a.parent().prev().children().first().children().first().removeClass("glyphicon-ok").addClass("glyphicon-blank");
            }
            this.qid("btn-viewchange").children().first().removeClass("fa-bars").addClass("fa-list-ul");
            this.qid("detailview").show();
            this.qid("btn-columns").hide();
            this.qid("btn-search-advanced").trigger("click");
            $.cookie("view", "detail", {"path":"/"});
        }
    },
    /**
     * @title 切换高级筛选模式
     * @param e
     */
    on_btn_advanced_click: function (e) {
        e.preventDefault();
        this._userFilter.mode = "advanced";
        this.qid("search-query-advanced").val(this._userFilter.uql);
        this.qid("search-criteria-advanced").show();
        this.qid("search-criteria").hide();
        this.qid("search-criteria-extended").hide();
    },
    /**
     * @title 切换基本筛选模式
     * @param e
     */
    on_btn_basic_click: function (e) {
        e.preventDefault();
        this._userFilter.mode = "basic";
        this._rebuildstaticfilters();
        this._rebuilddynmaicfilters();
        this.qid("search-criteria-advanced").hide();
        this.qid("search-criteria").show();
        this.qid("search-criteria-extended").show();
    },
    /**
     * @title 数据列按钮
     * @param e
     */
    on_btn_columns_click:function(e){
		var $columnsLayer=$(".columns-layer",this.$),
			$btnColumns=this.qid("btn-columns");
		
		$btnColumns.toggleClass("active");
		$columnsLayer.removeClass("hidden");
    	$("body").bind("mousedown",this.proxy(function(e){
    		var $target=$(e.target);
    		if ( !$target.is("div.columns-layer") && $target.parents(".columns-layer").length < 1 ) {
    			$columnsLayer.addClass("hidden");
    			$btnColumns.removeClass("active");
				$("body").unbind("mousedown");
			}
		}));
    },
    /**
     * @title 搜索按钮事件
     * @param e
     */
    on_btn_search_click: function (e) {
        e.preventDefault();
        if(this._userFilter.view === "list"){
            this._viewDataTable && this._viewDataTable.fnDraw(false);
        }
        else{
            this._detailDataTable && this._detailDataTable.fnDraw(false);
        }
        // this._rebuildTable();
    },
    on_btn_search_dvanced_click: function (e) {
        e.preventDefault();
        this._rebuildTable();
    },
    /**
     * @title 更多
     * @param e
     */
    on_btn_more:function(e){
    	var $button=$(e.currentTarget),
			$allButtons=$(".criteria-list button"),
			offset=$button.offset(),
			setting={
    			"checked":$.extend(true,[],this._userFilter.dynamicfilters),
				"remove":$.map(this._userFilter.staticfilters,function(filter,idx){
					return {"propid":filter.propid,"propname":filter.propname};
				})
    		},
			moreRenderClazz = null,
			moreRenderObj = null,
    		result = null,
    		sel = null;
    	$button.addClass("active");
		moreRenderClazz = $.u.load("com.sms.plugin.search.moreProp");
		moreRenderObj = new moreRenderClazz();
		moreRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
				$allButtons.removeClass("active");
			}),
			"filter_check":this.proxy(function(filter){
				this._userFilter.dynamicfilters.push(filter);
				this._rebuilddynmaicfilters();
				$("button[data-id='"+filter.propid+"']").trigger("click");
			}),
			"filter_uncheck":this.proxy(function(filter){
				this._userFilter.dynamicfilters=$.grep(this._userFilter.dynamicfilters,function(item,idx){
					return item.propid != filter.propid;
				});
		        this._rebuilddynmaicfilters();
				//this._initfilter();
			})
		});
		result = moreRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		moreRenderObj.get("filter","render",setting,sel);
		
    },
    /**
     * @title 筛选器按钮事件
     * @param e
     */
    on_btn_filter_click:function(e){
    	var $button = $(e.currentTarget),
    		$allButtons = $(".criteria-list button"),
    		plugin = $button.attr("data-plugin") || "com.sms.plugin.search.nullProp",
    		offset = $button.offset(),
    		inputRenderClazz = null,
    		inputRenderObj = null,
    		result = null,
    		sel = null;
    	
    	$allButtons.removeClass("active");
    	$button.addClass("active");
    	
        try{
            if(plugin){
        		inputRenderClazz = $.u.load(plugin);
            }
        }catch(e){
            inputRenderClazz = $.u.load("com.sms.plugin.search.nullProp");
        }
		inputRenderObj = new inputRenderClazz();
		inputRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
				$allButtons.removeClass("active");
			}),
			"update": this.proxy(function(value){ 
				$.each(this._userFilter.staticfilters, this.proxy(function(idx,filter){
					if(filter.propid == value.propid){
						this._userFilter.staticfilters.splice(idx, 1, value);
					}
				}));
				$.each(this._userFilter.dynamicfilters, this.proxy(function(idx, filter){ 
					if(filter.propid == value.propid){
						this._userFilter.dynamicfilters.splice(idx, 1, value);
					}				
				}));
				
				this._showSaveButton(
                    this._filterData 
                    && (JSON.stringify(this._filterData.dynamicfilters || []) != JSON.stringify(this._userFilter.dynamicfilters) 
                        || (this._filterData.staticfilters && JSON.stringify(this._filterData.staticfilters) != JSON.stringify(this._userFilter.staticfilters)) )
                );
				this._initfilter(false);
			})
		});
		result = inputRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		inputRenderObj.get("filter","render",$.extend(true,{},$button.parent().data("data-data")),sel); // 采用extend，防止其他函数篡改数据（.data()存的数据是引用对象？？）
		
    },
    _escapeQueryChars: function(q){
        var result = "";
        if (q !== null && q !== undefined && q !== "" && q !=="") {
            for(var i=0;i < q.length;i++){
                var c = q.charAt(i);
                if (c == "\\" || c == "+" || c == "-" || c == "!"  || c == "(" || c == ")" || c == ":"
                    || c == "^" || c == "[" || c == "]" || c == "\"" || c == "{" || c == "}" || c == "~"
                    || c == "*" || c == "?" || c == "|" || c == "&"  || c == ";" || c == "/"
                    || c == " ") {
                    result = result+ "\\";
                  }    
                result = result+ c;
            }
        }
        return result;
    },
    /**
     * @title 重新生成table
     */
    _rebuildTable: function () { 
        if ($.fn.DataTable.isDataTable(this.qid("viewtable"))) {
            this.qid("viewtable").dataTable().api().destroy();
            this.qid("viewtable").empty();
        }
        if ($.fn.DataTable.isDataTable(this.qid("detailtable"))) {
            this.qid("detailtable").dataTable().api().destroy();
            this.qid("detailtable").empty();
        }
        if (this._userFilter.view == "list") {
            if (this.qid("listresultpanel").hasClass("resizable")) {
                this.qid("listresultpanel").resizable("destroy");
                this.qid("listresultpanel").removeClass("resizable").removeClass("resizabletable");
            }
            this.qid("result-panel").css("min-height",620);  
            this.qid("detailview").hide();
            this.qid("btn-viewchange").next().find("a.list span").removeClass("glyphicon-blank").addClass("glyphicon-ok");
            this.qid("btn-viewchange").next().find("a.detail span").removeClass("glyphicon-ok").addClass("glyphicon-blank");
            // table 
            if ($.fn.DataTable.isDataTable(this.qid("viewtable"))) {
                this.qid("viewtable").dataTable().api().destroy();
                this.qid("viewtable").empty();
                this.qid("viewtable").data("tbmappings", null);
            }
            var tablecols = [];
            var tbmappings = {};
            var order = []; 
            $.each(this._userFilter.columns, this.proxy(function (idx, adata) {
                var atbcol = { "data": adata.propid, "title": adata.propname, "name": adata.propname, "class": "field-" + adata.propid};
                if(adata.propplugin === "com.sms.plugin.render.keywordProp"){
                    atbcol.title = "信息编号";
                    atbcol.orderable = false;
                    atbcol.visible=false;
                }
                if (this._userFilter.orders.propid == adata.propid) {
                	order.push([idx, this._userFilter.orders.order]);
                }
                if (adata.propplugin) {
                    try{
                        var renderclz = $.u.load(adata.propplugin);
                        var renderobj = new renderclz();
                        tbmappings[adata.propid] = renderobj;
                        atbcol.render =  this.proxy(renderobj.table_html);
                    }catch(e){
                        atbcol.render = this.proxy(function(data, type, row){
                            return data || "";
                        });
                    }
                }
                else {
                    atbcol.render = this.proxy(function(data, type, row){
                        return data || "";
                    });
                }
                tablecols.push(atbcol);
            })); 
            for(i in tablecols){
            	if(tablecols[i].title=="主题"){
            		tablecols[i].width="200";
            		tablecols[i].render=function(data, type, row){
            			if(data.length>10){
                		  	return "<a class='descriptionTitle' href='/sms/uui/com/sms/search/activity.html?activityId="+ row.id+ "'target=_blank  style='display:inline-block; width:150px;overflow auto;' title='"+row.summary+"'>"+row.summary.substr(0,10)+'....'+"</a>";
            			}else{
                		  	return "<a class='descriptionTitle' href='/sms/uui/com/sms/search/activity.html?activityId="+ row.id+ "'target=_blank  style='display:inline-block; width:150px;overflow auto;' title='"+row.summary+"'>"+row.summary || "" +"</a>";
            			}
            		}
            	};
            	if(tablecols[i].data=='defectAnalysis'){
            		tablecols[i].render=function(data,type,row){
            			if(data && data.length>10){
            				return "<span class='descriptionTitle' title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data=="defectType"){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle' title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data=="consequence"){

            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	
            	};
            	if(tablecols[i].data=='description'){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data== "actionItem"){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data== "measureType"){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data== "threat"){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data== "error"){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data== "severity"){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].data=="insecurity"){
            		tablecols[i].render=function(data,type,row){
            			if(data  && data.length>10){
            				return "<span class='descriptionTitle'  title='"+data+"'>"+data.substr(0,10)+'....' || ""+"</span>";
            			}else{
            				return data || "";
            			}
            			
            		}
            	};
            	if(tablecols[i].title=="信息编号"){
            		tablecols[i].render=function(data, type, row){
            		  	return "<span>"+row.unit.code+"-"+row.num+"</span>";
            		}
            	};
            	if(tablecols[i].data=="deptAirport" ||tablecols[i].data== "arrAirport"){
            		tablecols[i].orderable = false;
            	};
            	if(tablecols[i].data=="aircraftTypeCat"){
            		tablecols[i].orderable = false;
            	};
            };
            this.qid("viewtable").data("tbmappings", tbmappings);
            this._viewDataTable = this.qid("viewtable").dataTable({
                "dom": '<"top"i<"fa fa-refresh fa-1 listtablerefersh"><"btn btn-subtle btn-columns">>rt<"bottom"i<"fa fa-refresh fa-1 listtablerefersh">p><"clear">',
                "pageLength": parseInt($.cookie("pageDisplayNum") || 10),
                "pagingType": "full_numbers",
                "autoWidth": false,
                "processing": false,
                "serverSide": true,
                "order": order,
                "language":{
                	"processing":"数据加载中...",
                	"info": " _START_ - _END_ of _TOTAL_ ",
                    "zeroRecords":"无搜索结果",
                    "sZeroRecords": "没有找到记录",
                    "sInfo": "从" + " _START_ " + "到" + " _END_ /" + "共" + " _TOTAL_ " + "条数据",
                	"infoFiltered":"",
                	"paginate": {
                        "first": "",
                        "previous": "<span class='fa fa-caret-left fa-lg'></span>",
                        "next": "<span class='fa fa-caret-right fa-lg'></span>",
                        "last": ""
                    }
                },
                "columns": tablecols,
                "ajax": this.proxy(function (data, callback, settings) {
                	var query = $.map(this._userFilter.staticfilters.concat(this._userFilter.dynamicfilters),function(filter){
        					if(filter.propvalue && filter.propvalue.length>0){
		                		return {id:filter.propid,value:filter.propvalue};
        					}
	                	}),
	                	sort = data.order.length > 0 ? data.columns[data.order[0].column].data + " " + data.order[0].dir : "",
	                	search = [],
	                	s = this._escapeQueryChars( this.qid("search-query").val() );
                	data.order.length > 0 && $.extend(this._userFilter.orders, { "propid":data.columns[data.order[0].column].data, "propname":data.columns[data.order[0].column].name, "order":data.order[0].dir });
                	search = s ? [{id:"summary",value:[{id:"*" + s +"*",value:s}]}] : []; //,{id:"description",value:[{id:s,value:s}]}
                	
                    delete data.order;
                    delete data.draw;
                    this.sort=sort;
                    this.MYquery=query;
                    this._exportExcelOptions = $.extend({
                        "search": JSON.stringify(search),
                        "sort": sort,
                        "columns":window.encodeURIComponent(JSON.stringify(data.columns)),
                    }, query.length > 0 ? {"query":JSON.stringify(query)} : {});
                	this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
                		"method": "stdcomponent.getbysearchex",
                 		"core": "activity",
                 		"columns": JSON.stringify(data.columns),
                 		"sort": sort,
                 		"search": JSON.stringify(search),
                        "fl":"",
                 	},(query.length > 0 ? {"query":JSON.stringify(query)} : {}) ),this.qid("viewtablearea").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
                 		if(response.data){
                 			if(response.data.iTotalRecords==0){
                 				this.qid("btn-export-excel").attr("disabled","disabled");
                 			};
                        	this._userFilter.uql=response.data.uql;	                    		
                        	this.qid("search-query-advanced").val(response.data.uql);
                        	this.qid("viewtablearea").removeClass("hidden");
                        	this.qid("noresult").addClass("hidden");
                        	callback({
                        		"draw":data.draw,
                        		"recordsFiltered":response.data.iTotalRecords,
                        		"data":response.data.aaData
                        	});
                    	}else{
                        	this.qid("viewtablearea").addClass("hidden");
                        	this.qid("noresult").removeClass("hidden");
                    	}
                	}));
                }),
                "headerCallback": this.proxy(function( thead, data, start, end, display ) {
                	var $thead = $(thead);
                	$.each($.extend(true,[],this._userFilter.columns),this.proxy(function(idx,column){
                		$thead.children("th").eq(idx).data("data-data",column);
                	}));
                	this._showSaveButton(
                        this._filterData 
                        && (JSON.stringify(this._userFilter.orders) != JSON.stringify(this._filterData.orders || {}) 
                            || JSON.stringify(this._filterData.dynamicfilters || []) != JSON.stringify(this._userFilter.dynamicfilters) 
                            || (this._filterData.staticfilters && JSON.stringify(this._filterData.staticfilters) != JSON.stringify(this._userFilter.staticfilters)) ) 
                    );
                 })
            });
            $(".btn-columns", this.qid("listview")).html("选取列<span class='caret' style='margin-left: 10px;'/>");
            this.qid("viewtable").off("click", "tbody tr").on("click", "tbody tr", this.proxy(function (e) {
                var $Row = $(e.currentTarget);
                this.qid("viewtable").find("tr.row-focused").removeClass("row-focused");
                $Row.addClass("row-focused");
            }));
            $("thead tr", this.qid("viewtable")).sortable({
                start: function (e, ui) {
                    ui.placeholder.width(ui.item.outerWidth(true));
                },
                stop: this.proxy(function (e, ui) {
                	var newColumns=[], newFilter = {};
                	this.qid("viewtable").find("thead tr th").each(function(){
                		newColumns.push($(this).data("data-data"));
                	});
                	this._userFilter.columns = newColumns;
                	// 拖拽列的顺序值更新columns属性
                	if(this._userFilter.mydefaultcolumns === true){
                		this._ajax(
                			$.u.config.constant.smsmodifyserver,
                			{"method":"stdcomponent.update", "dataobject":"user", "dataobjectid":parseInt($.cookie("userid")), "obj":JSON.stringify({"columns":JSON.stringify(newColumns)})},
                			this.qid("result-panel"),
                			{backgroundColor:'#fff'},
                			this.proxy(function(response){
                				if(response && response.success){
	                				$.jStorage.set("userColumns", $.extend(true, {}, newColumns), {TTL: 1000 * 60});
	                				this._initfilter();
                				}
                			})
                		);
                	}else{
                		newFilter = $.extend(true, {}, this._filterData, {columns: newColumns});
                    	this._saveFilter({
            				"filterId": this._filterId, 
            				"data": {filterRule:JSON.stringify(newFilter)}, 
            				"refresh": false, 
            				"showMsg": false,
            				"callback": this.proxy(function(){ 
            					this._initfilter();
            				})
            			});
                	}
                })
            }).disableSelection();
            this.qid("viewtable").children("tfoot").hide();

        }
        else {
            if (this.qid("listresultpanel").hasClass("resizable")) {
                this.qid("listresultpanel").resizable("destroy");
            }
            else {
                this.qid("listresultpanel").addClass("resizable").addClass("resizabletable");
            }
            this.qid("result-panel").css("min-height",0);   
            this.qid("btn-viewchange").next().find("a.detail span").removeClass("glyphicon-blank").addClass("glyphicon-ok");
            this.qid("btn-viewchange").next().find("a.list span").removeClass("glyphicon-ok").addClass("glyphicon-blank");
            this.qid("detailview").show(); 
            this.qid("btn-columns").hide();
            this.qid("listresultpanel").resizable(
	            {
	                autoHide: true,
	                handles: 'e',
	                resize: function (e, ui) {
	                    var parent = ui.element.parent();
	                    var remainingSpace = parent.width() - ui.element.outerWidth(),
	                        divTwo = ui.element.next(),
	                        divTwoWidth = (remainingSpace - (divTwo.outerWidth() - divTwo.width())) / parent.width() * 100 + "%";
	                    divTwo.width(divTwoWidth); 
	                },
	                stop: function (e, ui) {
	                    var parent = ui.element.parent();
	                    ui.element.css(
	                    {
	                        width: ui.element.width() / parent.width() * 100 + "%"
	                    });
	                }
            });
            this._detailDataTable = this.qid("detailtable").dataTable({
                "dom": 't<"bottom"<"fa fa-refresh fa-1 listtablerefersh">p><"clear">',
                "pageLength": parseInt($.cookie("pageDisplayNum") || 10),
                "scrollY": "570px",
                "pagingType": "full_numbers",
                "autoWidth": false,
                "processing": false,
                "serverSide": true,
                "language":{
                	"processing":"数据加载中...",
                	"info": " _START_ - _END_ of _TOTAL_ ",
                    "zeroRecords":"无搜索结果",
                    "sZeroRecords": "没有找到记录",
                    "sInfo": "从" + " _START_ " + "到" + " _END_ /" + "共" + " _TOTAL_ " + "条数据",
                	"infoFiltered":"",
                	"paginate": {
                		"first": "",
                        "previous": "<span class='fa fa-caret-left fa-lg'></span>",
                        "next": "<span class='fa fa-caret-right fa-lg'></span>",
                        "last": ""
                    }
                },
                "columns": [{data:"id",width:100,orderable:false,render:function(data,type,row){
                	return "<img width='16' height='16' src='/sms/uui/"+row.type.url+"'/>&nbsp;<a href='#'>"+row.unit.code+"-"+row.num+"</a></br><a href='#'>"+(row.summary || "")+"</a>";
                }}],
                "ajax": this.proxy(function (data, callback, settings) {
                	var query = $.map(this._userFilter.staticfilters.concat(this._userFilter.dynamicfilters),function(filter){
	    					if(filter.propvalue && filter.propvalue.length>0){
		                		return { id:filter.propid, value:filter.propvalue };
	    					}
	                	}),
                		search = [],
	                	s = this._escapeQueryChars( this.qid("search-query").val() );
                	if(s){ 
                		search = [{id:"summary",value:[{id:"*" + s + "*",value:s}]}];
                	}
                	this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
                 		"method": "stdcomponent.getbysearchex",
                 		"core": "activity",
                 		"sort": this._userFilter.orders.propid + " " + this._userFilter.orders.order,
                 		"columns": JSON.stringify(data.columns),
                 		"search": JSON.stringify(search)
                 	},(query.length > 0 ? {"query":JSON.stringify(query)} : {}) ),this.qid("detailview").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
                 		if(response.data){
                    		this._userFilter.uql=response.data.uql;
                        	this.qid("search-query-advanced").val(response.data.uql);
                        	this.qid("detailview").removeClass("hidden");
                        	this.qid("noresult").addClass("hidden");
                        	callback({
                        		"draw":data.draw,
                        		"recordsFiltered":response.data.iTotalRecords,
                        		"data":response.data.aaData,
                        	});
                    	}else{
                        	this.qid("detailview").addClass("hidden");
                        	this.qid("noresult").removeClass("hidden");
                    	}
                	}));
                	
                }),
                "headerCallback": this.proxy(function( tr, data, start, end, display ) {
                	var $tr = $(tr);
                	$tr.children("th:eq(0)").html("<span class='orderby'><span>排序</span> <i class='fa fa-arrow-down'></i></span>| <span class='fa fa-caret-down order-options'></span>");
                	
                    if(this._userFilter.orders){
                    	this.$.find("span.orderby").data("data", $.extend(true, {}, this._userFilter.orders) ).find("span:eq(0)").text("按 " + this._userFilter.orders.propname + " 排序");
                    	if(this._userFilter.orders.order == "asc"){
                    		this.$.find("span.orderby i").removeClass("fa-arrow-down").addClass("fa-arrow-up");
                    	}else{
                    		this.$.find("span.orderby i").removeClass("fa-arrow-up").addClass("fa-arrow-down");
                    	}
                    }
                 }),
                 "drawCallback":this.proxy(function(){
                     this.$.find(".detail-panel").width(this.qid("detailview").width()-240); // 临时处理方式，待更改为resize事件响应
                	 this.qid("detailtable").parent().prev().find("thead tr th").removeAttr("class");
                	 this.qid("detailtable").find("tbody > tr:eq(0)").trigger("click");
                 }),
                 "rowCallback":this.proxy(function(row,data){
                	 $(row).attr("data-id",data.id);
                 })
            });
            
            this.qid("detailtable").off("click", "tbody tr").on("click", "tbody tr", this.proxy(function (e) {
            	e.preventDefault();
                var $Row = $(e.currentTarget), id = $Row.attr("data-id"), hash = $.urlParam(window.location.hash, "#");
                if(hash){
                	hash.activityId = id;
                }
                window.location.hash = $.map(hash, function(value, key){ return key + "=" + value; }).join("&");
            	this.detail.reloadData();
                this.qid("detailtable").find("tr.row-focused").removeClass("row-focused");
                $Row.addClass("row-focused");
            }));
        }
        this.on_resize();
    },
    /**
     * @title 重新生成静态过滤器
     */
    _rebuildstaticfilters: function () {
        var staticfilters = this._userFilter.staticfilters;
        var staticul = this.qid("search-criteria").children().first();
        $(".criteria-item", staticul).remove();
        var staticultext = staticul.children().first();
        if (staticfilters) {
            $.each(staticfilters, this.proxy(function (idx, afilter) {
            	var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.propid)
            								  .replace(/#\{propname\}/g, afilter.propname)
                			  				  .replace(/#\{propshow\}/g, this._transformFlterShow(afilter.propshow) || "全部")
            								  .replace(/#\{propplugin\}/g, afilter.propplugin);
                $(htm).insertBefore(staticultext).data("data-data",afilter); // 将以选中的值存入data，不放如attr中防止特殊符号干预json格式
            }));
        }
        $(".remove-filter", staticul).hide();
    },
    /**
     * @title 重新生成动态过滤器
     */
    _rebuilddynmaicfilters: function () {
        var dynamicfilters = this._userFilter.dynamicfilters;
        var dynamicul = this.qid("search-criteria-extended").children().first();
        dynamicul.empty();
        if (dynamicfilters) {
            $.each(dynamicfilters, this.proxy(function (idx, afilter) {
                var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.propid)
                			  				  .replace(/#\{propname\}/g, afilter.propname)
                			  				  .replace(/#\{propshow\}/g, this._transformFlterShow(afilter.propshow) || "全部")
                			  				  .replace(/#\{propplugin\}/g, afilter.propplugin);
                $(htm).appendTo(dynamicul).data("data-data",afilter); // 将以选中的值存入data，不放如attr中防止特殊符号干预json格式
            }));
        }
        dynamicul.off("click", "a.remove-filter").on("click", "a.remove-filter", this.proxy(function (e) {
        	e.preventDefault(); 
        	var $a = $(e.currentTarget),
        		propid=$a.prev().attr("data-id"),
        		$toggleobjs=this.qid("span-editflag").add(this.qid("div-savebuttons")),
        		$btnsavefilteras=this.qid("btn-savefilteras");
        	
            $a.closest("li").remove();
            this._userFilter.dynamicfilters = $.grep(this._userFilter.dynamicfilters, function(item, idx){
            	return item.propid !== propid;
            });

            this._showSaveButton(
                this._filterData 
                && (JSON.stringify(this._userFilter.orders) != JSON.stringify(this._filterData.orders || {}) 
                    || JSON.stringify(this._filterData.dynamicfilters || []) != JSON.stringify(this._userFilter.dynamicfilters) ) 
            );
			this._initfilter(false);
        }));
    },
    // 初始化filter;
    _initfilter: function (rebuildColumns) {
        if (this._userFilter.mode == "basic") {
            this.qid("btn-basic").trigger("click");
        }
        else {
            this.qid("btn-advanced").trigger("click");
        }
        if(rebuildColumns === false){
            this.qid("btn-search").trigger("click");
        }
        else{
            this.qid("btn-search-advanced").trigger("click");
        }
        
    },
    // 这个方法会执行查询事件，所以要放在最后
    _initview: function () {
        this.qid("btn-viewchange").next().find("li a." + this._userFilter.view).trigger("click");
    },
    /**
     * @title 加载过滤器通过url参数
     */
    loadFilterByUrl:function(){
    	var params = $.urlParam(window.location.hash, "#"), filterRule = $.urlParam().filterRule;
    	if(!params.filterId){	// 支持?号传参
    		params = $.urlParam();
    	}
        if(params.filterId && $.isNumeric(params.filterId)){
    		this._filterId = parseInt(params.filterId);
    		this._ajax($.u.config.constant.smsqueryserver,{
    			"method": "stdcomponent.getbyid",
                "dataobject": "filtermanager",
                "dataobjectid": this._filterId
        	},this.qid("result-panel"),{backgroundColor:'#fff'},this.proxy(function(response){
        		if(response.success){
	        		var filter = response.data;
	        		if(filter){
						this.qid("search-title").attr("title",filter.name).text(filter.name);
						this.qid("btn-savefilteras").add(this.qid("btn-detail")).add(this.qid("btn-removefavorites")).removeClass("hidden");
						this.qid("span-editflag").add(this.qid("div-savebuttons")).addClass("hidden");
						if (this._filterId < 0) {
							this.qid("btn-detail").add(this.qid("btn-removefavorites")).addClass("hidden");
						}else{
							//TODO: 根据是否为我收藏的来控制“星”的样式和功能
							this.IS_MY_FILTER = filter.creator === parseInt($.cookie("userid")) ? true : false;
						}
						try {
		    				this._filterData = JSON.parse(filter.filterRule);
		    				this._userFilter = $.extend(true, {}, this._defaultFilter, this._filterData);
                            if(!this._filterData.staticfilters){
                                this._filterData.staticfilters = this._defaultFilter.staticfilters;
                            }
		
		    				if ($.cookie("view") && $.inArray($.cookie("view"), ["list", "detail"]) > -1){
								this._userFilter.view = $.cookie("view");
							}
		    				if(!this._filterData.orders){
		    					this._filterData.orders = $.extend(true, {}, this._userFilter.orders);
		    				}
		    				if(this._userFilter.mydefaultcolumns === true && $.jStorage.get("userColumns")){ // 列采用“我的默认”获取用户的“默认列”属性信息
		    					this._userFilter.columns = $.extend(true, {}, $.jStorage.get("userColumns"));
		    				}
							this._initfilter();
					        this.columnpanel._loadData($.extend([], this._userFilter.columns), (this._filterId < 0 ? "DEFAULT" : "FILTER"), this._userFilter.mydefaultcolumns === true ? "DEFAULT" : "FILTER");
						} catch(e) {
							console.error("parse JSON failed");
						}
	        		}else{
	        			$.u.alert.error("过滤器:" + params.filterId + "不存在");
	        		}
        		}
				
        	}));
    	}
        else if(filterRule){ 
            var inStaticFilters = false;
            try{
                filterRule = JSON.parse(filterRule);
            }catch(e){
                console.error(e.name + ": " + e.message);
            }
            this._userFilter = $.extend(true, {}, this._defaultFilter);
            if($.jStorage.get("userColumns")){
                this._userFilter.columns = $.extend(true, {}, $.jStorage.get("userColumns"));
            }
            $.each(this._userFilter.staticfilters, this.proxy(function(idx, item){
                if(item.propid === filterRule.propid){
                    this._userFilter.staticfilters.splice(idx, 1, filterRule);
                    inStaticFilters = true;
                }
            }));
            if(!inStaticFilters){
                this._userFilter.dynamicfilters = [filterRule];
            }
            this._initfilter();
            this.columnpanel._loadData($.extend([], this._userFilter.columns), "DEFAULT", "DEFAULT");
        }
    },
    /**
     * @title 鼠标悬停事件处理
     */
    title_show:function(e){
  	//获取当前的x坐标值
  	    function pageX(elem){
  	        return elem.offsetParent?(elem.offsetLeft+pageX(elem.offsetParent)):elem.offsetLeft;
  	    };
  	  //获取当前的Y坐标值
  	    function pageY(elem){
  	        return elem.offsetParent?(elem.offsetTop+pageY(elem.offsetParent)):elem.offsetTop;
  	    };
  	    function split_str(string,words_per_line) { 
  	        var output_string = string.substring(0,1);  //取出i=0时的字，避免for循环里换行时多次判断i是否为0 
  	        for(var i=1;i<string.length;i++) {      
  	            if(i%words_per_line == 0) {         
  	                output_string += "<br/>";       
  	            }       
  	            output_string += string.substring(i,i+1);   
  	        }   
  	        return output_string;
  	    };
  	    this.title_value = ''; 
  	    var span=e.target;
  	    var div=$(".title_show")[0];
  	    this.title_value = span.title;   
  	    div.style.left = pageX(span)+20+'px';
  	    div.style.top = pageY(span)+40+'px';
  	    var words_per_line = 40;     //每行字数 
  	    var title =  split_str(span.title,words_per_line);  //按每行25个字显示标题内容。    
  	    div.innerHTML = title;
  	    div.style.display = ''; 
  	    span.title = '';        //去掉原有title显示。
  	  
    },
    title_back:function(e){
  	  var span=e.target; 
  	    var div=$(".title_show")[0]; 
  	    span.title = this.title_value;   
  	    div.style.display = "none";
  	    
    },
    /**
     * @title 保存过滤器
     * @param args {filterid:"", data:{}, showMsg: true, refresh:true, callback: function(){}}
     * @param data
     */
    _saveFilter:function(args){
    	if(!args.filterId){
    		return;
    	}
    	if(args.filterId < 0){
    		args.refresh && this.qid("btn-search-advanced").trigger("click");//this.refreshFilterList(args.filterId);
    		return;
    	}
    	if(this.IS_MY_FILTER === false){
    		return;
    	}
    	this._ajax($.u.config.constant.smsmodifyserver,{
    		"method": "stdcomponent.update",
            "dataobject":"filtermanager",
            "dataobjectid":args.filterId,
            "obj":JSON.stringify(args.data)    	
        },this.qid("result-panel"),{backgroundColor:'#fff'},this.proxy(function(response){
    		if(response.success){
    			this._filterData = $.extend(true, {}, $.parseJSON(args.data.filterRule) ); // 保持this._filterData数据为最新
    			args.showMsg && $.u.alert.success("过滤器保存成功");
    			args.refresh && this.qid("btn-search-advanced").trigger("click");//this.refreshFilterList(args.filterId);
    			args.callback && $.isFunction(args.callback) && args.callback();
    		}
    	}));
    },
    /**
     * @title 转换过滤器内置表达式
     * @param 
     */
    _transformFlterShow: function(name){
    	var result = name;
    	switch(name) {
    		case "currentUser()": 
    			result = "当前用户";
    			break;
            case "currentSeason()":
                result = "当前季度";
                break;
    	}
    	return result;
    },
    /**
     * @title 显示保存按钮
     * @param show {bool}
     */
    _showSaveButton: function(show){
    	var $toggleobjs = this.qid("span-editflag").add(this.qid("div-savebuttons")), $btnsavefilteras=this.qid("btn-savefilteras");
    	if (show && $.isNumeric(this._filterId)) {
			if (this._filterId < 0) {
				$toggleobjs.addClass("hidden");
				this.qid("span-editflag").removeClass("hidden");
				$btnsavefilteras.removeClass("hidden");
			} else {
				$toggleobjs.removeClass("hidden");
				$btnsavefilteras.addClass("hidden");
				if(this.IS_MY_FILTER === false){
					this.qid("div-savebuttons").addClass("hidden");
					$btnsavefilteras.removeClass("hidden");
				}
			}
		} else {
			$toggleobjs.addClass("hidden");
			$btnsavefilteras.removeClass("hidden");
		}
    	
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
     * @title 重置搜索框（供左侧过滤器列表点击时调用）
     */
    resetSearchBox: function(){
    	this.qid("search-query").val("");
    },
    /**
     * @title 加载左侧过滤器列表（重写）
     */
    refreshFilterList:function(filterid){},
    /**
     * @title 删除当前选中过滤器(重写)
     */
    removeCurrentFilter:function(){},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.search.searchindex.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       //'../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.search.searchindex.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
