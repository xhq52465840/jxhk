//@ sourceURL=com.audit.query.checkquery.checksheetindex
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.audit.query.checkquery.checksheetindex', null, {
	//	copy from com.sms.search.searchindex
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
       // this._userFilter ={"staticfilters":[],"dynamicfilters":[]};	
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
    	this.i18n = com.audit.query.checkquery.checksheetindex.i18n;
    	this.btn_addunit=this.qid("btn_addunit");		
    	this.basefilters=[];
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type:"post",
            async:false,
            data: {
        		"tokenid":$.cookie("tokenid"),
    			"method": "getunits"
        	}
        }, this.$, {size: 2, backgroundColor: "#fff"}).done(this.proxy(function (response) {
        	if (response.success) {
        		this.targetIDdata=$.map(response.data,this.proxy(function(item,idx){
        				return item.id;
        		}));
        	}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
 /*   	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
          //  cache: false,
          //  async: false,
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
            	//	this._userFilter.orders= $.extend(true, {}, {key: "type", name: "类型", order: "asc"}, true);
            		this._userFilter.staticfilters = $.extend(true, [], this.basefilters, true);
            		var hashParam = $.urlParam(window.location.href,"#"), normalParam = $.urlParam(window.location.href,"?");
                    this._defaultFilter = $.extend(true,{},data.data);
                
                    if (!hashParam.filterId && !normalParam.filterId) { // 只处理没有指定过滤器的情况，指定的情况在loadfilterbyurl函数会调用_initfilter函数
                    	if(this._userFilter.staticfilters.length > 1){
                    		this._userFilter.columns= $.extend(true, {}, this._userFilter.staticfilters, true);
                    	}
                		if ($.cookie("view") && $.inArray($.cookie("view"), ["list", "detail"]) > -1){
        					this._userFilter.view = $.cookie("view");
        				}
                		this._initfilter();
                		var jslength=0;for(var i in this._userFilter.columns){jslength++;}
                		$.each(this._userFilter.columns,this.proxy(function(idx,item){
                			if(item.key!="point" && item.name!="审计要点"){
                				this._userFilter.columns[jslength]={name: "审计要点", key: "point", object: "item", type: "null", propplugin: "com.audit.plugin.checklist.auditTextProp"};
                			}
                		}));
                       this.columnpanel._loadData($.extend([],this._userFilter.columns,true), "DEFAULT", "DEFAULT");
                    }
            	}
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
       
    	*/
    	
    	this._ajax("checksheetfilter.json", {}, this.$, {}, this.proxy(function(result){
    		var hashParam = $.urlParam(window.location.href,"#"), normalParam = $.urlParam(window.location.href,"?");
    		this._userFilter = result.data;
    		//this._userFilter.mode = "basic";
    		//this._userFilter.orders= $.extend(true, {}, {key: "workName", name: "工作单名称", order: "asc"}, true);
		   // this._userFilter.dynamicfilters= $.extend(true,[],this._userFilter.columns , true);
            this._defaultFilter = $.extend(true,{},result.data);
            this._initfilter();
            var  columnsID =$.map(this._userFilter.columns,this.proxy(function(item,idx){
        	  			return item.propid;
	            }));
            this._userFilter.columnsdata= $.extend(true,[],this._userFilter.columns);
            this._userFilter.columnsdata=$.grep(this._userFilter.columnsdata,function(item,idx){
				return $.inArray(item.propid,["address","record","result","remark"])==-1;
			});
           /* this._userFilter.columnsdata= $.extend(true,[],this._userFilter.columns);
		    $.each( this._userFilter.columnsdata,this.proxy(function(idx,item){
				if($.inArray(item.propid,["address","record","result","remark"])>-1) {
					 this._userFilter.columnsdata.splice(idx,1);
				}
		    }));*/
            if (!hashParam.filterId && !normalParam.filterId) { // 只处理没有指定过滤器的情况，指定的情况在loadfilterbyurl函数会调用_initfilter函数
                this.columnpanel._loadData($.extend([],this._userFilter.columnsdata), "DEFAULT", "DEFAULT");
            }
    	}));
    	
    
    	  $(".startdate").datepicker({ dateFormat: "yy-mm-dd" }); 
          $(".enddate").datepicker({ dateFormat: "yy-mm-dd" });
    	
          
          
       /*   
         	
        	 // // 被审计单位 下拉框初始化
        	this.qid("worksheet-unit").select2({
        		width: "170px",
    		    placeholder: "选择被审计单位",
    		    ajax:{
    	        	url: $.u.config.constant.smsqueryserver,
    	            dataType: "json",
    	            data:function(term,page){
    	            	return {
            				"tokenid": $.cookie("tokenid"),
            				"method": "getunits",
            				"unitName": term
    	            	};
    	            },
    		        results:this.proxy(function(response,page){
    		        	if (response.success) {
    		        		return {results:response.data};
    		        	} 
    		        	
    		        })
    	        },
    	        formatResult: function(item){
    	        	return item.name;      		
    	        },
    	        formatSelection: function(item){
    	        	return item.name;	        	
    	        }
            });
        	
        	
        	
        	

       	 // // 审计类型 下拉框初始化
       	this.qid("worksheet-type").select2({
       		width: "170px",
   		    placeholder: "选择审计类型",
           	ajax:{
    	        	url: $.u.config.constant.smsqueryserver,
    	        	type: "post",
    	            dataType: "json",
    	        	data: function(term, page){
    	        		return {
    		    			"tokenid":$.cookie("tokenid"),
    		    			"method":"getAuditTypes"
    	        		};
    	    		},
    		        results:function(data,page){
    		        	if(data.success){
    		        		return {results:$.map(data.data.aaData,function(item,idx){
    		        			return item;
    		        		})};
    		        	}
    		        }
    	        },
    	        formatResult: function(item){
    	        	return item.name+"("+item.id+")";      		
    	        },
    	        formatSelection: function(item){
    	        	return item.name+"("+item.id+")";	        	
    	        }
           });*/
       /*	
       	this.btnFilter=this.qid("btn_filter");//查询
       	this.btnResetFilter=this.qid("btn_resetfilter");//清除筛选
       	
       	
        // 筛选按钮事件
        this.btnFilter.click(this.proxy(function (e) {
        	e.preventDefault();
        	this.dataTable.fnDraw();
        }));
       	
        // 清除筛选值
        this.btnResetFilter.click(this.proxy(function (e) {
        	e.preventDefault();
            this.qid("worksheet-unit").select2("data","");
            this.qid("worksheet-type").select2("data","");
            this.dataTable.fnDraw();
        }));*/
        
      /*  
        
     
        this.wdataTable = this.qid("worktable").dataTable({
            searching: false,
            serverSide: true,  //指定从服务器端获取数据  
            bProcessing: true,// //加载数据时显示正在加载信息 
            ordering: false,
            bInfo : true,
            iDisplayLength:1,
            pageLength:30,
            sDom: "t<ip>",
            "columns": [
                { "title": this.i18n.no ,"mData":"unit"},
                { "title": this.i18n.name ,"mData":"profession"},
                { "title": this.i18n.id ,"mData":"unit"},
                { "title": this.i18n.date ,"mData":"profession"},       
                { "title": this.i18n.unit ,"mData":"unit"},
                { "title": this.i18n.where ,"mData":"profession"},
                { "title": this.i18n.status ,"mData":"users", "sWidth": "10%" },
                { "title": this.i18n.remark,"mData":"id", "sWidth": 150 }
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu":this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	var unit,profession,name;
            	if($.trim(this.qid("securityagencies").val())){
            		unit=$.trim(this.qid("securityagencies").val());
            	}
            	if($.trim(this.qid("professional").val())){
            		profession=$.trim(this.qid("professional").val());
            	}
            	if($.trim(this.qid("username").val())){
            		name=$.trim(this.qid("username").val())
            	}
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"getProfessionUserBySearch",
            		"unit":unit,
            		"profession":profession,
            		"name":name
            	},true);
            	delete aoData.columns;
            	delete aoData.search;
            	delete aoData.order;
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    async:false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            
            }),
            "aoColumnDefs": [
                       
                 
                 {
                     "aTargets": 1,
                     "mRender": function (data, type, full) {//yonghushu
                         return "<a href='"+data+"' class='btn btn-link viewusers'  data='"+JSON.stringify(full)+"'>"+(data ? data.length : "0")+"</a>";

                     }
                 },          
                             
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {//yonghushu
                        return "<a href='#' class='btn btn-link viewusers'  data='"+JSON.stringify(full)+"'>"+(data ? data.length : "0")+"</a>";

                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {//yonghu
                    	var htmls=["<ul style='padding-left:15px;'>"];
                		full.users && $.each(full.users,function(idx,user){
                			htmls.push("<li userid="+user.userId+">"+user.userFullName+"</li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                    	return  "<button type='button' class='btn btn-link editmembers' data='" + JSON.stringify(full) + "'></button>"; 
      
                    }
                }
            ]
        });
        
        */
        
    
    	this.btn_addunit.click(this.proxy(this.on_addUnit_click));
    	
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

        this.columnpanel.override({update:this.proxy(this.on_columnsProp_update), close:this.proxy(this.on_columnsProp_close)}); 		// 数据列组件
       // this.orderpanel.override({order:this.proxy(this.on_orderPanel_order)});  														// 选择排序字段组件
        this.qid("search-query").keypress(this.proxy(this.on_searchQuery_enter));
        this.qid("btn-removefavorites").unbind("click").click(this.proxy(this.on_btn_removefavorites_click));
        this.qid("btn-advanced").unbind("click").click(this.proxy(this.on_btn_advanced_click));
  
        this.qid("btn-basic").unbind("click").click(this.proxy(this.on_btn_basic_click));
        this.qid("btn-search").unbind("click").click(this.proxy(this.on_btn_search_click));
        this.qid("btn-more").unbind("click").click(this.proxy(this.on_btn_more));
        this.qid("btn-search-advanced").unbind("click").click(this.proxy(this.on_btn_search_click));
        this.qid("btn-viewchange").next().off("click", "a").on("click", "a", this.proxy(this.on_btn_viewchange));
      //  this.qid("btn-savefilteras").unbind("click").click(this.proxy(this.on_btn_savefilteras_click));
     //   this.qid("btn-savefilter").unbind("click").click(this.proxy(this.on_btn_savefilter_click));
        this.qid("btn-columns").unbind("blick").click(this.proxy(this.on_btn_columns_click));
    //    this.qid("link-savefilteras").unbind("click").click(this.proxy(this.on_btn_savefilteras_click));
        this.qid("link-giveupedit").unbind("click").click(this.proxy(this.on_link_giveupedit_click));
        this.qid("result-panel").off("click", "div.listtablerefersh").on("click", "div.listtablerefersh", this.proxy(this.on_listtablerefresh_click));
        this.qid("detailview").off("click","span.order-options").on("click","span.order-options",this.proxy(this.on_order_options_click));
        this.qid("detailview").off("click","span.orderby").on("click","span.orderby",this.proxy(this.on_orderby_click));
        $(".criteria-list",this.$).off("click","li.criteria-item > button").on("click","li.criteria-item > button",this.proxy(this.on_btn_filter_click));  // 绑定筛选按钮事件
        
        $(window).resize(this.proxy(this.on_resize));//当调整浏览器窗口的大小时，发生 resize 事件。
        
        this.qid("search-query").val($.urlParam().text || "");
        
    },
    on_searchQuery_enter:function(e){
    	var which = e.which;
    	if(which == 13){
    		this.qid("btn-search").trigger("click");
    	}
    },
    
    //
    on_columnsProp_update:function(data, selectedType){
    	this._userFilter.columns = data; 
    	this.qid("btn-search").trigger("click");
    	//this.qid("btn-search-advanced").trigger("click");// 重复请求
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
			"key": field.key,
			"name": field.name,
			"order": "asc"
		}).find("span:eq(0)").text("按 " + field.name + " 排序");
		this.$.find(".order-layer").addClass("hidden");
		$orderby.trigger("click");
    },
    on_listtablerefresh_click: function(e){
    	this.qid("viewtable").dataTable().fnDraw();
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
    		$(".com-sms-filter-filterNav .favourite-filters").height(filterHeight);
    		$("body").css("overflow-y","hidden");
    		$(".com-sms-search-detail").css("overflow-y","auto");
    	}else{
    		$("body").css("overflow-y","auto");
    		$(".com-sms-search-detail").css({"height":"auto","overflow-y":"hidden"});
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
            this.qid("btn-search").trigger("click");
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
					return {"key":filter.propid,"name":filter.propname};
				})
    		},
			moreRenderClazz = null,
			moreRenderObj = null,
    		result = null,
    		sel = null;
    	$button.addClass("active");
		moreRenderClazz = $.u.load("com.audit.plugin.checkquery.moreProp");
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
					if(filter.propid == value.propid){
						this._userFilter.staticfilters.splice(idx, 1, value);
					}
				}));
				$.each(this._userFilter.dynamicfilters, this.proxy(function(idx, filter){ 
					if(filter.propid == value.propid){
						this._userFilter.dynamicfilters.splice(idx, 1, value);
					}				
				}));
				
				this._showSaveButton(this._filterData && (JSON.stringify(this._filterData.dynamicfilters) != JSON.stringify(this._userFilter.dynamicfilters) || JSON.stringify(this._filterData.staticfilters) != JSON.stringify(this._userFilter.staticfilters)));
				this._initfilter();
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
        if ($.fn.DataTable.isDataTable(this.qid("detailtable"))) {
            this.qid("detailtable").dataTable().api().destroy();
            this.qid("detailtable").empty();
        }
     
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
            
       
            $.each(this._userFilter.staticfilters.concat(this._userFilter.columns), this.proxy(function (idx, adata) {
                var atbcol = { "data": adata.propid?adata.propid:adata.key, "title": adata.propname?adata.propname:adata.name, "name": adata.propname?adata.propname:adata.name, "class": ("field-" + adata.propid)};
               /* if (this._userFilter.orders.key == adata.key) {
                	order.push([idx, this._userFilter.orders.order]);
                }*/
                if (adata.propplugin) {
                    var renderclz = $.u.load(adata.propplugin);
                    var renderobj = new renderclz();
                    tbmappings[adata.key] = renderobj;
                    atbcol.render =  this.proxy(renderobj.table_html);
                }
                tablecols.push(atbcol);
            })); 
       /*     
            var editcol=  { "data": "", "title": "操作", "name": "", "class": "field-auditEditProp"};
	   		var renderedit = $.u.load("com.audit.checklist.tablehtml");
            var rendereditobj = new renderedit();
            editcol.render =  this.proxy(rendereditobj.table_html);
            tablecols.push(editcol);*/
          this.qid("viewtable").data("tbmappings", tbmappings);//
          this.dataTable=this.qid("viewtable").dataTable({
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
                	"infoFiltered":"",
                	"infoEmpty": "",
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
	                		return {id:filter.key,value:filter.propvalue};
    					}
                	}),
	                	sort = data.order.length > 0 ? data.columns[data.order[0].column].data + " " + data.order[0].dir : "",
	                	search = [],
	                	s = this.qid("search-query").val();
                	data.order.length > 0 && $.extend(this._userFilter.orders, { "key":data.columns[data.order[0].column].data, "name":data.columns[data.order[0].column].name, "order":data.order[0].dir },true);
                	search = s ? [{id:"summary",value:[{id:"*"+s+"*",value:s}]}] : []; //,{id:"description",value:[{id:s,value:s}]}
                	
        		//	{"method":"stdcomponent.getbysearch", "dataobject":"item",	"rule": JSON.stringify([[{"key":"type","value":null}]])},
                	var array_e=sort.split(" ");
                	if(array_e.length>1 && array_e[0]=="planTime"){
                		sort=[];
                	}
          	
                	var querya =[];
                	var queryb =[];
                	var rulecache=[];
                	var query = $.map(this._userFilter.staticfilters.concat(this._userFilter.dynamicfilters),function(filter){
		    					if(filter.propvalue && filter.propvalue.length>0){
		    						   querya.push({"key":filter.propid,"propvalue":filter.propvalue});
		    							return querya;
		    					}});
 //	{checkType:[4128,4130,4129],checkName :"",checkNo :"",startDate: "2015-05-05",record,""}
                	
                	var queryd =[];
                	var queryobj={};
                	$.each(querya,this.proxy(function(idx,item){
                		var propval;
	                	if(propval=item.propvalue){
            				filter=	propval[0].id;
            				filterName = propval[0].name;
                       	 	switch(item.key){
                           	  case "checkType":
                           		  var queryq =[];
                           		  $.each(propval,this.proxy(function(idx,field){
	                				queryq.push(field.id);
		                    	  })); 
	                			  $.extend(true,queryobj,{"checkType":queryq});
                       			  break;	                           	 	
                           	  case "target":
                           		  var queryq =[];
                           		  $.each(propval,this.proxy(function(idx,field){
	                				queryq.push(field.id);
		                    	  })); 
	                			  $.extend(true,queryobj,{"target":queryq});
                       			  break;	                           	 	
                           	  case "planTime":
                           	      $.extend(true,queryobj,{"startDate":propval[0].startDate,"endDate":propval[0].endDate});
                       			  break;
                    		  case "checkName":
                    			  $.extend(true,queryobj,{"checkName":filterName});
                    			  break;
                    		  case "checkNo":
                    			  $.extend(true,queryobj,{"checkNo":filterName});
                    			  break;
                    		  case "target":
                    			  $.extend(true,queryobj,{"target":filter});
                    			  break;
                    		  case "address":
                    			  $.extend(true,queryobj,{"address":filterName});
                    			  break;
                    		  case "remark":
                    			  $.extend(true,queryobj,{"remark":filterName});
                    			  break;
                    		  case "record":
                    			  $.extend(true,queryobj,{"record":filterName});
                    			  break;
                    		  case "flowStatus":
                    			  $.extend(true,queryobj,{"flowStatus":filterName});
                    			  break;
                    		  case "result":
                    			  $.extend(true,queryobj,{"result":filterName});
                    			  break;
                    		}
	                		
	                	}
                	}));
//                	if(!queryobj.target || queryobj.target.length==0){
//                		queryobj.target=[];
//                		queryobj.target=this.targetIDdata;
//                	}
                	  $.extend(true,queryobj,{"planType":["SYS"]});
                	 delete data.order;
                     delete data.draw;
                     delete data.search;
                	delete data.columns;
                	
                	this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
                		"method": "getCheckSheet",
                		"rule":JSON.stringify(queryobj) ,
            	 		"sort": sort
                 	}),this.qid("viewtablearea").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
                 		if(response.data){
                        	this._userFilter.uql=response.data.uql;	                    		
                        	this.qid("search-query-advanced").val(response.data.uql);
                        	this.qid("viewtablearea").removeClass("hidden");
                        	this.qid("noresult").addClass("hidden");
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
                //用于在每次draw发生时，修改table的header
                "headerCallback": this.proxy(function( thead, data, start, end, display ) {
                	var $thead = $(thead);
                	$.each($.extend(true,[],this._userFilter.columns),this.proxy(function(idx,column){
                		$thead.children("th").eq(idx).data("data-data",column);
                	}));  
                	this._showSaveButton(this._filterData && (JSON.stringify(this._userFilter.orders) != JSON.stringify(this._filterData.orders) || JSON.stringify(this._filterData.dynamicfilters || []) != JSON.stringify(this._userFilter.dynamicfilters) ) );
                	$(".results th").css("min-width","80px");
                })
            });
            
         // this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editUnit_click));
        //  this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeUnit_click));
    	
   
            
            $(".btn-columns", this.qid("listview")).html("选取列<span class='caret' style='margin-left: 10px;'/>");
            this.qid("viewtable").off("click", "tbody tr").on("click", "tbody tr", this.proxy(function (e) {
                var $Row = $(e.currentTarget);
                this.qid("viewtable").find("tr.row-focused").removeClass("row-focused");
                $Row.addClass("row-focused");
            }));
        
            this.qid("viewtable").children("tfoot").hide();

     
    },
    
    
   
    
    _initUnitDialog:function(){
    	$.u.load("com.audit.checklist.unitDialogEdit");
    	this.unitDialogEdit = new com.audit.checklist.unitDialogEdit($("div[umid='unitDialogEdit']",this.$),null);
    	this.unitDialogEdit.override({
    		refreshDataTable:this.proxy(function(){
    			//this.dataTable.fnDraw();
    		})
    	});
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
		this.unitDialogEdit.open({"add":true,"data":$.cookie("add_cookie"),"title":com.audit.checklist.checklistindex.i18n.addchecklist});
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
        	this.unitDialogEdit.open({"add":false,"data":data,"title":com.audit.checklist.checklistindex.i18n.editchecklist+" : "+data.type});
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
    			//	this.dataTable.fnDraw();
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
            	return item.propid !== propid;
            });

            this._showSaveButton(this._filterData && (JSON.stringify(this._userFilter.orders) != JSON.stringify(this._filterData.orders) || JSON.stringify(this._filterData.dynamicfilters) != JSON.stringify(this._userFilter.dynamicfilters) ) );
			this._initfilter();
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
        this.qid("btn-search-advanced").trigger("click");
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
		    				/*if(!this._filterData.orders){
		    					this._filterData.orders = $.extend(true, {}, this._userFilter.orders, true);
		    				}*/
		    			/*	if(this._userFilter.mydefaultcolumns === true && $.jStorage.get("userColumns")){ // 列采用“我的默认”获取用户的“默认列”属性信息
		    					this._userFilter.columns = $.extend(true, {}, $.jStorage.get("userColumns"), true);
		    				}*/
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
}, { usehtm: true, usei18n: true });



com.audit.query.checkquery.checksheetindex.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       //'../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                           '../../../../uui/widget/select2/js/select2.min.js',
                                           "../../../../uui/widget/validation/jquery.validate.js", 
                                       "../../../../uui/widget/spin/spin.js", 
                                       "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../../uui/widget/ajax/layoutajax.js"];
com.audit.query.checkquery.checksheetindex.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                        { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                        { path: '../../../../uui/widget/select2/css/select2.css' },
                                        { path: '../../../../uui/widget/select2/css/select2-bootstrap.css' }];

