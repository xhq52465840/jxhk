//@ sourceURL=com.audit.checklist.checklistindex
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.audit.checklist.checklistindex', null, 
		
{
	//	copy from com.sms.search.searchindex
    init: function () {
    	  this._filtertemplate = "<li data-id='#{propid}' class='criteria-item'>" +
    	  						"<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
	  							"<span class='criteria-wrap'   title='#{propshow}'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
	  							"</button>" +
	  							"<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a></li>";

    	  this._btn_template = 
			"<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
			"<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
			"</button>" ;

    	  
    	  
        this._filterId = null; 			
        this._defaultFilter = null;		
        this._filterData = null;		
        this.IS_MY_FILTER = false;
        this._userFilter ={"staticfilters":[],"dynamicfilters":[]};	
        this.issub=false;
        this.display=false;
        this.i18n= {
        		search : '搜索:',
        		everPage : '每页显示',
        		record : '个用户',
        		message : '抱歉未找到记录',
        		from : '从',
        		to : '到',
        		all : '共',
        		allData : '条数据',
        		withoutData : '没有数据',
        		fromAll : '从总共',
        		filterRecord : '条记录中过滤',
        		searching : '检索中',
        		back : '上一页',
        		next : '下一页',
           }
       
    },
    
    afterrender: function () {
    	/**
    	 * 1. 调用userfilter.json初始化默认设置 this._userFilter
    	 * 2. url参数中指定过滤器，加载过滤器设置覆盖默认设置 this._filterData (保留获取时原始值，不作更改)
    	 * 3. 判断是否更改对比this.-userfilter和this._filterData
    	 *  cache: false,true,
    	 * true的话会读缓存，可能真的到服务器上。假如上次访问了a.html，第二次的时候得到的是上次访问的a.html的结果，
    	 * 而不是重新到服务器获取。false的话会在url后面加一个时间缀，让它跑到服务器获取结果。cache只有GET方式的时候有效。
    	 * async默认的设置值为true，这种情况为异步方式，就是说当ajax发送请求后，在等待server端返回的这个过程中，
    	 * 前台会继续 执行ajax块后面的脚本，直到server端返回正确的结果才会去执行success，也就是说这时候执行的是两个线程，
    	 * ajax块发出请求后一个线程 和ajax块后面的脚本（另一个线程）
    	 */
    	//
    	this.tbody= this.qid("tbody");
    	this.basefilters=[];
    	this.subdata=[{
			"key":"SUB",
			"name":"安监机构",
			"propplugin":"com.audit.plugin.checklist.auditSubProp",
			"propvalue":""
		}];
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            data: {
				tokenid:$.cookie("tokenid"),
				method:"getMarkByUser",
			}
        }).done(this.proxy(function (data) {
            if (data.success) {
            	if(data.data==="DISPLAY"){//显示版本，创建版本，导入三个功能按钮
            		this.display=true;
            	}else if(this.uuiIsArray(data.data)){
            		this.returnunit=data.data;
            	}
            	this.get_menu_all();
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    	
    	
    },
    uuiIsArray :function(obj) {  
	  return Object.prototype.toString.call(obj) === '[object Array]';   
	},
    
    get_menu_all:function(){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            data: {
				tokenid:$.cookie("tokenid"),
				method:"getItemFields",
			}
        }).done(this.proxy(function (data) {
            if (data.success) {
            	if(data.data&&data.data.aaData){
            		$.each(data.data.aaData, this.proxy(function(idx,item){
    					if(item.type == "static"){
    						this.basefilters.push($.extend(true, item, {"propvalue": [], "propshow": ""}, true));
    					}
    				}));
            		this._userFilter.mode = "basic";
            		this._userFilter.view = "list";
            		this._userFilter.orders= $.extend(true, {}, {key: "type", name: "类型", order: "asc"}, true);
            		this._userFilter.staticfilters = $.extend(true, [], this.basefilters, true);
            		var hashParam = $.urlParam(window.location.href,"#"), normalParam = $.urlParam(window.location.href,"?");
                    this._defaultFilter = $.extend(true,{},data.data);
                
                    if (!hashParam.filterId && !normalParam.filterId) { // 只处理没有指定过滤器的情况，指定的情况在loadfilterbyurl函数会调用_initfilter函数
                    	if(this._userFilter.staticfilters.length > 1){
                    		this._userFilter.columns= $.extend(true, [], this._userFilter.staticfilters, true);
                    	}
                		if ($.cookie("view") && $.inArray($.cookie("view"), ["list", "detail"]) > -1){
        					this._userFilter.view = $.cookie("view");
        				}
                		this._initfilter();
        				this._userFilter.columns.push({name: "审计要点",
							        					key: "point",
							        					object: "item",
							        					type: "null",
							        					propplugin: "com.audit.plugin.checklist.auditTextProp"
        						});
        				//this._userFilter.columns.push({name: "权重", key: "weightType", object: "item", type: "null", propplugin: "com.audit.plugin.checklist.auditWeightProp"});

                        this.columnpanel._loadData($.extend([],this._userFilter.columns,true), "DEFAULT", "DEFAULT");
                        var cpdata=[{key: "pointType",
		                        	name: "章节/要点",
		                        	object: "null",
		                        	propplugin: "com.audit.plugin.checklist.pointTypeProp"
                        		}];
                        this.qid("btn-upload-excel").data("data-data",cpdata.concat(data.data.aaData));
                    }
            	}
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    	
    	this.btn_addunit= this.qid("btn_addunit");	
    	this.btn_addunit.click(this.proxy(this.on_addUnit_click));
    	this.btn_addver=this.qid("btn_addver").click(this.proxy(this.on_addVersion_click))//创建版本	
    	this.btn_upload_excel= this.qid("btn-upload-excel");
    	this.btn_upload_excel.click(this.proxy(this.on_upload_click));
    	if(!this.display){
    		this.btn_upload_excel.add(this.btn_addver).addClass("hidden");
    	}
    	
        this.qid("btn-removefavorites")
        	.add(this.qid("btn-viewchange"))
            .add(this.qid("btn-more"))
            .add(this.qid("btn-search"))
            .add(this.qid("btn-search-advanced"))
            .add(this.qid("btn-advanced"))
            .add($(".alert-danger"))
            .add(this.qid("btn-basic")).tooltip({
	            "container": "body",
	            "delay": 800
	        });
        
        this.columnpanel.override({update:this.proxy(this.on_columnsProp_update), close:this.proxy(this.on_columnsProp_close)}); 		// 数据列组件
        this.qid("search-query").keypress(this.proxy(this.on_searchQuery_enter));
        this.qid("btn-removefavorites").unbind("click").click(this.proxy(this.on_btn_removefavorites_click));
  
        this.qid("btn-basic").unbind("click").click(this.proxy(this.on_btn_basic_click));
        this.qid("btn-search").unbind("click").click(this.proxy(this.on_btn_search_click));
        this.qid("btn-more").unbind("click").click(this.proxy(this.on_btn_more));
        this.qid("btn-search-advanced").unbind("click").click(this.proxy(this.on_btn_search_click));
        this.qid("btn-columns").unbind("blick").click(this.proxy(this.on_btn_columns_click));
        this.qid("result-panel").off("click", "div.listtablerefersh").on("click", "div.listtablerefersh", this.proxy(this.on_listtablerefresh_click));
        this.qid("detailview").off("click","span.order-options").on("click","span.order-options",this.proxy(this.on_order_options_click));
        this.qid("detailview").off("click","span.orderby").on("click","span.orderby",this.proxy(this.on_orderby_click));
        $(".criteria-list",this.$).off("click","li.criteria-item > button").on("click","li.criteria-item > button",this.proxy(this.on_btn_filter_click));  // 绑定筛选按钮事件
        this.rebuild_current();
        this._initAddVer();
    },
   
    
    draw_sub:function(){
    	var firstfilterlist=this.qid("search-criteria").children().first();
    	var firstfilter=firstfilterlist.children().first();
        $.each(this.subdata, this.proxy(function (idx, afilter) {
        	var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.key)
        								  .replace(/#\{propname\}/g, afilter.name)
            			  				  .replace(/#\{propshow\}/g, afilter.propshow || "全部")
        								  .replace(/#\{propplugin\}/g, afilter.propplugin);
        	
        	$(htm).insertBefore(firstfilter).data("data-data",afilter); 
        }));
        $(".remove-filter", firstfilterlist).hide();
    },
    
     //上传 导入
    on_upload_click:function(e){
		try{
			var data =$(e.currentTarget).data("data-data");
			this.textView.open({data:data, title:com.audit.checklist.checklistindex.i18n.textviewtitle});
			this.textView.override({
	    		refreshDataTable:this.proxy(function(){
	    			this.dataTable.fnDraw();
	    		})
	    	});
		}catch(e){
			throw new Error("出错:"+e.message);
		}
    },
  
    

    //当前版本
    on_btn_click:function(e){
    	var $button = $(e.currentTarget),
    		//$allButtons = $(".criteria-list button"),
    		plugin = $button.attr("data-plugin"),
    		offset = $button.offset(),
    		inputRenderClazz = null,
    		inputRenderObj = null,
    		result = null,
    		sel = null;
    	
    	//$allButtons.removeClass("active");
    	$button.addClass("active");
    	
		inputRenderClazz = $.u.load(plugin);
		inputRenderObj = new inputRenderClazz();
		inputRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
				$button.removeClass("active");
				//$allButtons.removeClass("active");
			}),
			"update": this.proxy(function(value){ 
				this._update_ver(value);
				this.rebuild_current(value);
			})
		});
		result = inputRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		inputRenderObj.get("filter","render",$.extend(true,{},$button.data("data-data")),sel); // 采用extend，防止其他函数篡改数据（.data()存的数据是引用对象？？）
		
    },
    
    
    
    rebuild_current:function(data){
    	this.btnfilter={};
    	this.name;
    	this.id;
    	if(!this.display){
    		return 
    	}
        if(data){
     	   this.btnfilter=data;
     	  $.extend(true,this.btnfilter,{"curqid":"curqid"});
          $("button[data-id=curversion]").remove();
          var buttondiv = $(".add-button-btn").children().first();
         	var _htm = this._btn_template.replace(/#\{propid\}/g, this.btnfilter.propid)
    								  .replace(/#\{propname\}/g, this.btnfilter.propname)//
    								  .replace(/#\{propshow\}/g, this.btnfilter.propshow!=""?"当前版本："+this.btnfilter.propshow:"")//选中的版本
    								  .replace(/#\{propplugin\}/g, this.btnfilter.propplugin);
          $(_htm).insertBefore(buttondiv).data("data-data",this.btnfilter);
          $(".add-button-btn .glyphicon-upload").css("font-size","larger");
          $(".add-button-btn").css("display", "inline-block");
          $(".add-button-btn",this.$).off("click","[data-id=curversion]").on("click","[data-id=curversion]",this.proxy(this.on_btn_click));  // 绑定筛选按钮事件
          
        }
        else{
        	$.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type:"post",
                data: {
            		"tokenid":$.cookie("tokenid"),
        			"method": "stdcomponent.getbysearch",
            		"rule": JSON.stringify([[{"key":"type","value":"审计库版本"}],[{"key":"key","value":"当前审计库版本"}]]),//R9 R10
            		"dataobject": "dictionary"
            	}
            }, this.filtersel, {size: 2, backgroundColor: "#fff"}).done(this.proxy(function (response) {
            	if (response.success) {
            		if(response.data.aaData.length > 0){
                  	  	this.btnfilter={
                          		"propid":"curversion",
                          		"propname":"选择当前版本",
                          		"propshow":response.data.aaData[0].name,//"R10",
                          		"propvalue":[{id:response.data.aaData[0].id,name: response.data.aaData[0].name}],
                          	    "propplugin":"com.audit.plugin.checklist.addbtnProp"
                              };
                  	  $.extend(true,this.btnfilter,{"curqid":"curqid"});
                      $("button[data-id=curversion]").remove();
                      var buttondiv = $(".add-button-btn").children().first();
                      var _htm = this._btn_template.replace(/#\{propid\}/g, this.btnfilter.propid)
                								  .replace(/#\{propname\}/g, this.btnfilter.propname)//
                								  .replace(/#\{propshow\}/g, this.btnfilter.propshow!=""?"当前版本："+this.btnfilter.propshow:"")//选中的版本
                								  .replace(/#\{propplugin\}/g, this.btnfilter.propplugin);
                      $(_htm).insertBefore(buttondiv).data("data-data",this.btnfilter);
                      $(".add-button-btn .glyphicon-upload").css("font-size","larger");
                      $(".add-button-btn").css("display", "inline-block");
                      $(".add-button-btn",this.$).off("click","[data-id=curversion]").on("click","[data-id=curversion]",this.proxy(this.on_btn_click));  // 绑定筛选按钮事件
                      
            		}
            	}
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            }));
        }
    },
    
    
    _update_ver:function(value){
    	if(value.unchecked){
    		$.ajax({
    	    	url:$.u.config.constant.smsmodifyserver,
    	        type:"post",
    	        dataType: "json",
    	        cache: false,
    	        async:false,
    	        data: {
    	        	"tokenid":$.cookie("tokenid"),
    	    		"method":"stdcomponent.update",
    	    		"dataobject":"dictionary",
    	    		"dataobjectid":value.unchecked.id,
    	    		"obj":JSON.stringify({ "name":value.unchecked.name,
				    	    			   "value":value.unchecked.name,
				    	    			   "type":"审计库版本",
				    	    			   "key":"审计库版本"
				    	    				})
    	        }
    	    }).done(this.proxy(function(data){
    	    	if(data.success){
    	    	}
    	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    	    	
    	    }));
    	}
    	
    	if(value.checked){
    		$.ajax({
    	    	url:$.u.config.constant.smsmodifyserver,
    	        type:"post",
    	        dataType: "json",
    	        cache: false,
    	        async:false,
    	        data: {
    	        	"tokenid":$.cookie("tokenid"),
    	    		"method":"stdcomponent.update",
    	    		"dataobject":"dictionary",
    	    		"dataobjectid":value.checked.id,
    	    		"obj":JSON.stringify({ "name":value.checked.name,
				    	    				"value":value.checked.name,
				    	    				"type":"审计库版本",
				    	    				"key":"当前审计库版本"
				    	    				})
    	        }
    	    }).done(this.proxy(function(data){
    	    	if(data.success){
    	    	}
    	    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    	    	
    	    }));
    	}
    },
    
  
    
    
    on_searchQuery_enter:function(e){
    	var which = e.which;
    	if(which == 13){
    		this.qid("btn-search").trigger("click");
    	}
    },
    
    // this.update(this.checkedArray, this._selectedType);
    on_columnsProp_update:function(data, selectedType){
    	this._userFilter.columns = data; 
    	this.qid("btn-search").trigger("click");
		this.qid("btn-columns").removeClass("active");
		this.$.find(".columns-layer").addClass("hidden");
    },
    on_columnsProp_close:function(){
    	this.qid("btn-columns").removeClass("active");
		this.$.find(".columns-layer").addClass("hidden");
    },
  
    on_listtablerefresh_click: function(e){
    	this.qid("viewtable").dataTable().fnDraw();
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
    	this._showSaveButton(this._filterData && (JSON.stringify(this._filterData.orders) != JSON.stringify(this._userFilter.orders)) );
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
     * @title 切换基本筛选模式
     * @param e
     */
    on_btn_basic_click: function (e) { 
        e.preventDefault();
        this._userFilter.mode = "basic";
        this._rebuildstaticfilters();
        this._rebuilddynmaicfilters();
        this.issub==true ?this.draw_sub():"";
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
					return {"key":filter.key,"name":filter.name};
				})
    		},
			moreRenderClazz = null,
			moreRenderObj = null,
    		result = null,
    		sel = null;
    	$button.addClass("active");
		moreRenderClazz = $.u.load("com.audit.plugin.checklist.moreProp");
		moreRenderObj = new moreRenderClazz();
		moreRenderObj.override({
			"afterDestroy": this.proxy(function(){ 
				$allButtons.removeClass("active");
			}),
			"filter_check":this.proxy(function(filter){
				this._userFilter.dynamicfilters.push(filter);
				this._rebuilddynmaicfilters();
				$("button[data-id='"+filter.key+"']").trigger("click");
			}),
			"filter_uncheck":this.proxy(function(filter){
				this._userFilter.dynamicfilters=$.grep(this._userFilter.dynamicfilters,function(item,idx){
					return item.key != filter.key;
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
				$.each(this._userFilter.staticfilters, this.proxy(function(idx,filter){
					if(filter.key == value.key){
						this._userFilter.staticfilters.splice(idx, 1, value);
					}
				}));
				$.each(this._userFilter.dynamicfilters, this.proxy(function(idx, filter){ 
					if(filter.key == value.key){
						this._userFilter.dynamicfilters.splice(idx, 1, value);
					}				
				}));
				$.each(	this.subdata, this.proxy(function(idx, filter){ 
					if(filter.key == value.key){
						this.subdata.splice(idx, 1, value);
					}				
				}));
				this._showSaveButton(this._filterData && (JSON.stringify(this._filterData.dynamicfilters) != JSON.stringify(this._userFilter.dynamicfilters) || JSON.stringify(this._filterData.staticfilters) != JSON.stringify(this._userFilter.staticfilters)));
				this._initfilter();
				this._rebuildTable();
			}),
			"filter_type":this.proxy(function(data){ 
				
			})
		});
	
		result = inputRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		inputRenderObj.get("filter","render",$.extend(true,{},$button.parent().data("data-data")),sel); // 采用extend，防止其他函数篡改数据（.data()存的数据是引用对象？？）
		
    },
    /**
     * @title 重新生成table
     */
    _rebuildTable: function () { 
        if ($.fn.DataTable.isDataTable(this.qid("viewtable"))) {
            this.qid("viewtable").dataTable().api().destroy();
            this.qid("viewtable").empty();
        }
       
        if (this._userFilter.view == "list") {
            if (this.qid("listresultpanel").hasClass("resizable")) {
                this.qid("listresultpanel").resizable("destroy");
                this.qid("listresultpanel").removeClass("resizable").removeClass("resizabletable");
            }
            this.qid("result-panel").css("min-height",620);
            this.qid("detailview").hide();
         
            var tablecols = [];
            var tbmappings = {};
            var order = [];
            
            var cpcol=  { "data": "", "title": "章节/要点", "name": "", "class": "field-pointType"};
	   		var render_cp = $.u.load("com.audit.plugin.checklist.pointTypeProp");
            var render_cp_obj = new render_cp();
            cpcol.render =  this.proxy(render_cp_obj.table_html);
            tablecols.push(cpcol);
            $.each(this._userFilter.columns, this.proxy(function (idx, adata) {
                var atbcol = { "data": adata.key, "title": adata.name, "name": adata.name, "class": "field-" + adata.key};
                if (this._userFilter.orders.key == adata.key) {
                	order.push([idx, this._userFilter.orders.order]);
                }
                if (adata.propplugin) {
                    var renderclz = $.u.load(adata.propplugin);
                    var renderobj = new renderclz();
                    tbmappings[adata.key] = renderobj;
                    atbcol.render =  this.proxy(renderobj.table_html);
                }
                tablecols.push(atbcol);
            })); 
            
            var editcol=  { "data": "", "title": "操作", "name": "", "class": "field-auditEdit"};
	   		var renderedit = $.u.load("com.audit.checklist.tablehtml");
            var rendereditobj = new renderedit();
            editcol.render =  this.proxy(rendereditobj.table_html);
            tablecols.push(editcol);
          this.qid("viewtable").data("tbmappings", tbmappings);//
          this.dataTable=this.qid("viewtable").dataTable({
                "dom": '<"top"i<"fa fa-refresh fa-1 listtablerefersh"><"btn btn-subtle btn-columns">>rt<"bottom"i<"fa fa-refresh fa-1 listtablerefersh">p><"clear">',
                "pageLength": parseInt($.cookie("pageDisplayNum") || 10),
                "pagingType": "full_numbers",
                "autoWidth": true,
                "processing": false,
                "serverSide": true,
                "order": order,
                "language":
                { //语言
                    "sSearch": this.i18n.search,
                    "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                    "sZeroRecords": this.i18n.message,
                    "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                    "sInfoEmpty": "",//this.i18n.withoutData,
                    "sInfoFiltered": "",//"("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                    "sProcessing": ""+this.i18n.searching+"...",
                    "oPaginate": {
                    	  "sFirst": "",
    	                   "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
    	                   "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
    	                   "sLast": ""
                    }
                },
                "columns": tablecols,
                "ajax": this.proxy(function (data, callback, settings) {
                	var query = $.map(this._userFilter.staticfilters.concat(this._userFilter.dynamicfilters),function(filter){
    					if(filter.propvalue && filter.propvalue.length>0){
	                		return {id:filter.key,value:filter.propvalue};
    					}
                	}),
	                	sort = data.order.length > 0 ? data.columns[data.order[0].column].data + " " + data.order[0].dir : "",
	                	search = [],
	                	s = this.qid("search-query").val();
                	data.order.length > 0 && $.extend(this._userFilter.orders, { "key":data.columns[data.order[0].column].data, "name":data.columns[data.order[0].column].name, "order":data.order[0].dir },true);
                	search = s ? [{id:"summary",value:[{id:"*"+s+"*",value:s}]}] : []; //,{id:"description",value:[{id:s,value:s}]}
                	
                	var array_s=sort.split(" ");
                	if(array_s.length>1 && array_s[0]=="limitDate"){
                		 array_s[0]="orderNo";
                	}
                	
                	var querya =[];
                	var queryb =[];
                	var queryc =[];
                	var rulecache=[];
                	var query = $.map(this._userFilter.staticfilters.concat(this._userFilter.dynamicfilters),function(filter){
		    					if(filter.propvalue && filter.propvalue.length>-1){
		    						   querya.push({"key":filter.key,"propvalue":filter.propvalue});
		    							return querya;
		    					}});
                	
                	if(querya.length==0){
                	    this.qid("viewtable").show();
                		return $.u.alert.info("至少勾选一条筛选项",2000);
                	}
                	var isintype=$.grep(querya,this.proxy(function(m,n){
                		return m.key.indexOf("type")>-1;
                	}))
                	if(isintype.length==0){
                	    this.qid("viewtable").hide();
                		return $.u.alert.info("请选择类型",2000);
                	}
                	
                	$.each(querya,this.proxy(function(idx,item){
                		var queryd =[];
	                	if(item.propvalue){//item={key: "type",propvalue: Array[3]}
	                		$.each(item.propvalue,this.proxy(function(idx,field){
	                			if(item.key=="limitDate"&&field.type=="dateRange"){
	                				queryb.push({"key":"startDate","value":field.startDate});
	                				queryb.push({"key":"endDate","value":field.endDate});
	                				rulecache.push(queryb);
	                			}else if(item.key=="version"||item.key=="profession"){
	                				queryd.push({"key":item.key+".name","op":"like","value":field.name});
	                			}else if(item.key=="weightType"){
	                				queryd.push({"key":item.key,"value":field.id});
	                			}else if(item.key == "point"){
	                				queryd.push({"key":item.key,"op":"like","value":field.name});
	                			}else if(item.key=="parent"){
	                				queryd.push({"key":item.key+".point","op":"like","value":field.name});
	                			}else if(item.key=="value"){
	                				if(Number(field.name) > -1 == false){
	                				$.u.alert.error('分值必须是数值,请重新输入');	
                				}else{
                					queryd.push({"key":item.key,"value":typeof(Number(field.id)) == 'number' ? Number(field.name) : ""});
                				}
	                				}else if(item.key=="according" || item.key=="prompt"){
	                					queryd.push({"key":item.key,"op":"like","value":field.name});
	                				}else{
	                				queryd.push({"key":item.key,"op":"like","value":field.id});
	                			}
	                    	})); 
	                	}
	                	queryd.length>0?(rulecache.push(queryd)):"";
                	}));
                	 delete data.order;
                     delete data.draw;
                     delete data.search; 
                	 delete data.columns;
                	 var subarray=[];
                	 $.each(this.subdata,this.proxy(function(idx,item){
                		 $.each(item.propvalue,this.proxy(function(idy,atom){
                			 subarray.push(parseInt(atom.id));
                    	 }))
                	 }))
                	 if(subarray.length>0){
                		 rulecache.push([{"key":"unit.id","op":"in","value":subarray}]);
                	 }
//                	 rulecache.push([{"key":"profession","op":"is not null"}]);
                	 if(this.returnunit && this.returnunit.length){
                		 rulecache.push([{"key":"unit.id","op":"in","value":this.returnunit}]);
                	 }
                	 
                	this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
                		"method": "stdcomponent.getbysearch",
                		"rule":JSON.stringify(rulecache) ,
                		"dataobject": "item",
                		//"sort": sort,
                		"columns":JSON.stringify([{"data":array_s[0]?array_s[0]:"orderNo"}]),
                   	 	"order":JSON.stringify([{"column":0,"dir":array_s[1]?array_s[1]:"asc"}])
                 	}),this.qid("viewtablearea").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
                 		if(response.data){
                        	this._userFilter.uql=response.data.uql;	                    		
                        	this.qid("search-query-advanced").val(response.data.uql);
                        	this.qid("viewtablearea").removeClass("hidden");
                        	this.qid("noresult").addClass("hidden");
                        	this.qid("viewtable").show();
                        	callback({//?callback?
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
                	this._showSaveButton(this._filterData && (JSON.stringify(this._userFilter.orders) != JSON.stringify(this._filterData.orders) || JSON.stringify(this._filterData.dynamicfilters || []) != JSON.stringify(this._userFilter.dynamicfilters) ) );
                	$(".results th").css("min-width","100px");
                })
            });
            
          this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editUnit_click));
          this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeUnit_click));
    
         
            $(".btn-columns", this.qid("listview")).html("选取列<span class='caret' style='margin-left: 10px;'/>");
            this.qid("viewtable").off("click", "tbody tr").on("click", "tbody tr", this.proxy(function (e) {
                var $Row = $(e.currentTarget);
                this.qid("viewtable").find("tr.row-focused").removeClass("row-focused");
                $Row.addClass("row-focused");
            }));
        
            this.qid("viewtable").children("tfoot").hide();

        }
       
    },
    
    
   
    
    /**
     * @title 添加 创建
     * @return void
     */
    on_addUnit_click:function(e){
		e.preventDefault();
		if(this.unitDialogEdit == null){
			this._initUnitDialog();
		}
		this.unitDialogEdit.open({"add":true,
								  "data":$.cookie("add_cookie"),
								  "sub":this.issub,
								  "title":com.audit.checklist.checklistindex.i18n.addchecklist});
    },

    _initUnitDialog:function(){
    	$.u.load("com.audit.checklist.unitDialogEdit");
    	this.unitDialogEdit = new com.audit.checklist.unitDialogEdit($("div[umid='unitDialogEdit']",this.$),null);
    	this.unitDialogEdit.override({
    		refreshDataTable:this.proxy(function(){
    				this._rebuildTable();
    		})
    	});
    },
    /**
     * @title 编辑
     * @return void
     */
    on_editUnit_click: function (e) {
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		data.tosubject = data.profession;
    		if(this.unitDialogEdit == null){
    			this._initUnitDialog();
    		}
        	this.unitDialogEdit.open({"add":false,
					        		 "data":data,
					        		 "sub":this.issub,
					        		 "title":com.audit.checklist.checklistindex.i18n.editchecklist+" : "+data.type});
    	}catch(e){
    		throw new Error(com.audit.checklist.checklistindex.i18n.editFail+e.message);
    	}
    },

    /**
     * @title 删除
     * @return void
     */
    on_removeUnit_click: function (e) {
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p> "+com.audit.checklist.checklistindex.i18n.removedis+"</p>"+
    				 "</div>",
    			title:com.audit.checklist.checklistindex.i18n.removechecklist+" : "+data.type,
    			dataobject:"item",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this.dataTable.fnDraw();
    			})
    		});
    	}catch(e){
    		throw new Error(com.audit.checklist.ChecklistEdit.i18n.removeFail+e.message);
    	}
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
            	var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.key)
            								  .replace(/#\{propname\}/g, afilter.name)
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
                var htm = this._filtertemplate.replace(/#\{propid\}/g, afilter.key)
                			  				  .replace(/#\{propname\}/g, afilter.name)
                			  				  .replace(/#\{propshow\}/g, this._transformFlterShow(afilter.propshow) || "全部")
                			  				  .replace(/#\{propplugin\}/g, afilter.propplugin);
                $(htm).appendTo(dynamicul).data("data-data",afilter); 
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
            	return item.key !== propid;
            });

            this._showSaveButton(this._filterData && (JSON.stringify(this._userFilter.orders) != JSON.stringify(this._filterData.orders) || JSON.stringify(this._filterData.dynamicfilters) != JSON.stringify(this._userFilter.dynamicfilters) ) );
			this._initfilter();
			this._rebuildTable();
        }));
    },
    // 初始化filter;
    _initfilter: function () {
        if (this._userFilter.mode == "basic") {
            this.qid("btn-basic").trigger("click");
        }
        else {
            this.qid("btn-advanced").trigger("click");
        }
    },
    // 这个方法会执行查询事件，
    _initview: function () {
        this.qid("btn-viewchange").next().find("li a." + this._userFilter.view).trigger("click");
    },
    /**
     * @title 加载过滤器通过url参数
     */
    loadFilterByUrl:function(){
    	var params = $.urlParam(window.location.hash, "#");
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
		    				this._userFilter = $.extend(true, {}, this._defaultFilter, this._filterData, true);//
		    		
		    				if ($.cookie("view") && $.inArray($.cookie("view"), ["list", "detail"]) > -1){
								this._userFilter.view = $.cookie("view");
							}
							this._initfilter();
					        this.columnpanel._loadData($.extend([], this._userFilter.columns, true), (!this._filterId  ? "DEFAULT" : "FILTER"), this._userFilter.mydefaultcolumns === true ? "DEFAULT" : "FILTER");
						} catch(e) {
							console && console.log && console.log("转换过滤器规则为JSON格式失败");
						}
	        		}else{
	        			$.u.alert.error("过滤器:" + params.filterId + "不存在");
	        		}
        		}
				
        	}));
    	}
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
    		args.refresh && this.refreshFilterList(args.filterId);
    		return;
    	}
    	if(this.IS_MY_FILTER === false){
    		return;
    	}
    	this._ajax($.u.config.constant.smsmodifyserver,
    		{
    		"method": "stdcomponent.update",
            "dataobject":"filtermanager",
            "dataobjectid":args.filterId,
            "obj":JSON.stringify(args.data)   
            },
            this.qid("result-panel"),
            {backgroundColor:'#fff'},
            this.proxy(function(response){
            
            	if(response.success){
    			this._filterData = $.extend(true, {}, $.parseJSON(args.data.filterRule), true ); // 保持this._filterData数据为最新
    			args.showMsg && $.u.alert.success("过滤器保存成功");
    			args.refresh && this.refreshFilterList(args.filterId);
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
    	if (show && this._filterId != null) {
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
    
    enableForm:function(){
    	
    },
  
    
    

	on_addVersion_click : function(e){
		e.preventDefault();
		this.addVersion.dialog("open");
	},
	
	
    //创建版本事件
   _initAddVer:function(){
    	this.addVersion = this.qid("addVersion").removeClass("hidden").dialog({
        	title:"创建版本",
            width:640,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[{
				  "text":"创建",
				  "click":this.proxy(this.on_addVersion)
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(this.on_addVersion_cancel)
       		  }
       		],
            close: this.proxy(this.on_addVersion_close),
            open: this.proxy(this.on_addVersion_open)
        });
	
    },
    
    
    on_addVersion:function(e){
    	if(this.qid("addversion").val().trim()==""){
    		$.u.alert.error("请输入版本");
    		return false;
    	}
    	e.preventDefault();
    	var ver=$("[name=addversion]").val();
    	$.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            dataType: "json",
            type:"post",
            data: {
        		"tokenid":$.cookie("tokenid"),
    			"method": "stdcomponent.add",
        		"obj": JSON.stringify({"name":ver,"value":ver,"type":"审计库版本","key":"审计库版本"}),
        		"dataobject": "dictionary"
        	}
        }, this.filtersel, {size: 2, backgroundColor: "#fff"}).done(this.proxy(function (response) {
        	if (response.success) {
        			this.addVersion.dialog("close");
        			$.u.alert.success("版本创建成功！",2000)
        	}else{
                $.u.alert.error(response.reason, 1000 * 3);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    	
    },
    
    on_addVersion_cancel : function(event){
		this.addVersion.dialog("close");
	},
	
	on_addVersion_close: function(){
		this.addVersion.find("input").val("");
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
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
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
},
{ usehtm: true, usei18n: true });



com.audit.checklist.checklistindex.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       //'../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.audit.checklist.checklistindex.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                {path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                                { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
