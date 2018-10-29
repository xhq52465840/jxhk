//@ sourceURL=com.sms.qar.qarQuery
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.qar.qarQuery', null, {
    init: function (options) {
        this._options = options;
        //查询显示条数
        this._select2PageLength = 10;
        this._flightTemplate = '<div class="row">'		                
        					  +		'<div class="col-sm-3">#{flightNO}</div>'
        					  +		'<div class="col-sm-5">'
        					  +			'<div>#{deptAirportName}</div>'
        					  +		'</div>'
        					  +'</div>';
        //页面添加的查询条件
        this._filtertemplate = "<li data-id='#{propid}' qid='#{propid}' class='criteria-item' style='float:left;'>" +
        "<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
            "<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
        "</button>" +
        "<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a></li>";
        this._filterId = null; 			// 默认取1
        this._defaultFilter = null;		// 存取默认userfilter.json数据，切换过滤器时基于此数据设置
        this._userFilter = null;		// 获取userfilter.json的默认过滤器数据，点击过滤器与this._filterData合并
        this._filterData = null;		// 当前收藏过滤器的json数据，用于比较是否修改
 	
    },
    afterrender: function () {
    	
    	/**
    	 * 1. 调用userfilter.json初始化默认设置 this._userFilter
    	 * 2. url参数中指定过滤器，加载过滤器设置覆盖默认设置 this._filterData (保留获取时原始值，不作更改)
    	 * 3. 判断是否更改对比this.-userfilter和this._filterData
    	 */
    	this._ajax("userfilter.json",{},this.$,{},this.proxy(function(result){
    		var hashParam = $.urlParam(window.location.href,"#"), normalParam = $.urlParam(window.location.href,"?");
    		this._userFilter = result.data;
            this._defaultFilter = $.extend(true,{},result.data);
            if (!hashParam.filterId && !normalParam.filterId) { // 只处理没有指定过滤器的情况，指定的情况在loadfilterbyurl函数会调用_initfilter函数
            	this._ajax(
            		$.u.config.constant.smsqueryserver,
            		{"method":"stdcomponent.getbyid","dataobject":"user","dataobjectid":parseInt($.cookie("userid"))},
            		this.$,
            		{},
            		this.proxy(function(response){
            			if(response.data && response.data.columns){
            				try {
            					this._userFilter.columns = $.parseJSON(response.data.columns);
            					if ($.cookie("view") && $.inArray($.cookie("view"), ["list", "detail"]) > -1){
            						this._userFilter.view = $.cookie("view");
            					}
            				} catch(e){ 
            					window.console && console.log && console.log(e);
            				}
            			}
            			this._initfilter();   
            		})
                );
            }
            
    	}));
    	
    	var hashParam = $.urlParam(window.location.href,"#");
    	
    	var flightInfoId = hashParam.flightInfoID;
    	
    	if($.trim(flightInfoId)){
    		
    	}
        
//        this.qid("btn-more").tooltip({
//	            "container": "body",
//	            "delay":800
//	        });
//
//        this.qid("btn-more").unbind("click").click(this.proxy(this.on_btn_more));
//        $(".criteria-list",this.$).off("click","li.criteria-item > button").on("click","li.criteria-item > button",this.proxy(this.on_btn_filter_click));  // 绑定筛选按钮事件

        //对浏览器窗口大小进行调整
        $(window).resize(this.proxy(this.on_resize));
                 	
    	this.i18n =com.sms.qar.qarQuery.i18n;    
    	    	
    	// 机号
    	this.tail_no=this.qid("tail_no");
    	
    	// 航班号
    	this.flight_no=this.qid("flight_no");
    	
    	// 事件描述
    	this.pro_desc=this.qid("pro_desc");
    	
    	//起飞机场
    	this.departure_airport=this.qid("departure_airport");
    	
    	//起飞机场查询框
	    this.departure_airport.select2({
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
    			quietMillis: 250,
	            data:this.proxy(function(term,page){
	            	return {
	            		"tokenid": $.cookie("tokenid"),
	    				"method": "getAirportList",
	    				"dataTime": this.date.val(),
	    				"flightNum": term,
	    				"page": page
	    			};
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){ 
		        		return { "results": response.data, "more": (page * 10) < response.count };
		        	}
		        	else{ }
		        })
    		},
    		id:function(item){ return item.flightInfoID; },
	        formatResult: this.proxy(this._getFlightHtml),
	        formatSelection: function(item){
	        	return item.deptAirportName;
	        }
    	}).on("select2-open", this.proxy(this.on_select2_open));
    	
    	//起飞机场
    	this.arrival_airport=this.qid("arrival_airport");
    	
    	//到达机场选址框
	    this.arrival_airport.select2({
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
    			quietMillis: 250,
	            data:this.proxy(function(term,page){
	            	return {
	            		"tokenid": $.cookie("tokenid"),
	    				"method": "getAirportList",
	    				"dataTime": this.date.val(),
	    				"flightNum": term,
	    				"page": page
	    			};
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){ 
		        		return { "results": response.data, "more": (page * 10) < response.count };
		        	}
		        	else{ }
		        })
    		},
    		id:function(item){ return item.flightInfoID; },
	        formatResult: this.proxy(this._getFlightHtml),
	        formatSelection: function(item){
	        	return item.deptAirportName;
	        }
    	}).on("select2-open", this.proxy(this.on_select2_open));
    	
    	// 工作组筛选
    	this.groupContains=this.qid("groupscontains");    
    	
    	// 筛选按钮
    	this.btnFilter=this.qid("btn_filter");   
    	
    	document.getElementById("inlineCheckbox1").checked=true;
    	
    	document.getElementById("inlineCheckbox2").checked=true;
    	
    	document.getElementById("inlineCheckbox3").checked=true;
    	
    	document.getElementById("inlineCheckbox4").checked=true;
    	  	
    	// 重写“用户组织”组件的函数
        this.qardetail.override({
        	refreshDataTable:this.proxy(function(){
        		this.dataTable.fnDraw(true);
        	})
        });
    	
        var myDate = new Date();
        var nowStr = myDate.format("yyyy-MM-dd"); 
        
        
    	this.date = this.qid("date");
    
    	this.qid("date").val(this.getYesterday());
    	
    	if($.trim(flightInfoId)){
    		//如果用户是通过页面传递参数过来的，隐藏查询条件
    		$('#collapseOne').collapse('hide');
    		this.qid("date").val("");
    	}
    	
    	//如果用户展开折叠框，清空flightInfoId
//    	$('#collapseOne').on('show.bs.collapse', function () {
//            flightInfoId=""; });
   
    	this.date.datepicker({
    		dateFormat:"yy-mm-dd",
    		onSelect: this.proxy(function(dateText, inst){    			
    			this.flightDate = dateText;
    		}),
    		onClose: this.proxy(function(){
    			
    		})
    	});
    	
        this.date1 = this.qid("date1");     

        this.qid("date1").val(nowStr);
             
    	this.date1.datepicker({
    		dateFormat:"yy-mm-dd",
    		onSelect: this.proxy(function(dateText, inst){ 
    			this.flightDate = dateText;
    		}),
    		onClose: this.proxy(function(){
    			
    		})
    	});
    	
//    	$(".collapse").collapse('hide') ;隐藏伸缩框
    	
        // 筛选按钮事件
        this.btnFilter.click(this.proxy(function () {
            this.dataTable.fnDraw();
        }));      

        // 异步加载工作组下拉框后再初始化dataTable，用户组跳转链接到此组件时需设置工作组下拉框后再查询
        this.groupContains.attr("disabled",true);
        $.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"getQarCompany",
	        }
        }).done(this.proxy(function(response){
        	if(response.success){
        		//画下拉选择框
        		$.each(response.data.companyList.aaData,this.proxy(function(idx,group){
        			$("<option/>").attr("value",group.airline_code).text(group.airline_code).appendTo(this.groupContains);
        		}));
        	}
        	//画表格
        	this.dataTable = this.qid("datatable").dataTable({
                searching: false,
                serverSide: true,
                bProcessing:true,
                ordering:false,
                //表头
                "columns": [
                    { "title": this.i18n.company,"mData":"airline_code", "sWidth": 150 },
                    { "title": this.i18n.flightNo, "mData": "flight_no", "sWidth": 150 },
                    { "title": this.i18n.tailNo ,"mData":"ac_tail", "sWidth": 250},
                    { "title": this.i18n.eventLevel,"mData":"severity_class_no", "sWidth": 250,"sClass":"center" },
                    { "title": this.i18n.staPlace,"mData":"departure_airport", "sWidth": 250 ,"sClass":"center"},
                    { "title": this.i18n.arrPlace,"mData":"arrival_airport", "sWidth": 250,"sClass":"center" },
                    { "title": this.i18n.startDate,"mData":"start_date", "sWidth": 350 },
                    { "title": this.i18n.desc,"mData":"pro_desc", "sWidth": 450 }
                ],
                //画表格内容
                "aoColumnDefs": [
					{
					    "aTargets": 0,
					    "mRender": function (data, type, full) {
					        return data;
					    }
					},
                    {
                        "aTargets": 1,
                        "mRender": function (data, type, full) {
                            return data ;
                        }
                    },
                    {
                        "aTargets": 2,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "aTargets": 3,
                        "mRender": function (data, type, full) {                   		
                    		return data;
                        }
                    },{
                        "aTargets": 4,
                        "mRender": function (data, type, full) {                   		
                    		return data;
                        }
                    },
                    {
                        "aTargets": 5,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "aTargets": 6,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "aTargets": 7,
                        "mRender": function (data, type, full) {
                            return "<button type='button' class='btn btn-link detail'  data='"+JSON.stringify(full)+"'>"+data+"</button>";
                        }
                    }
                ],
                //文字转换
                "oLanguage": { //语言
                    "sSearch": this.i18n.search,
                    "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
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
                //设置查询的参数
                "fnServerParams": this.proxy(function (aoData) {
                	var eventlist = "";
                	var list = this._userFilter.dynamicfilters;
                	if(list.length>0){         		
                		for(var i=0 ;i<list.length;i++){
                			var str = list[i].propshow.substring(1,(list[i].propshow.length-1));
                			if($.trim(str)){
                				eventlist = eventlist + " and t."+list[i].propid+ " like '" + str + "' ";
                			}       			
                		}
                	};
                	
                	if($.trim(flightInfoId)){
                		eventlist = " and g.flight_info_id = " + flightInfoId ;
                	}
                	
                	//设置参数值
                	if($.trim(this.tail_no.val())){
                		eventlist = " and t.ac_tail like '%" + this.tail_no.val() + "%'" ;
                	}
                	if($.trim(this.flight_no.val())){
                		eventlist = eventlist + " and t.flight_no like '%" + this.flight_no.val() + "%'" ;
                	}
                	if($.trim(this.pro_desc.val())){
                		eventlist = eventlist + " and s.pro_desc like '%" + this.pro_desc.val() + "%'" ;
                	}
                	if($.trim(this.groupContains.val())){
                		eventlist = eventlist + " and d.company_name like '" + this.groupContains.val() + "'" ;
                	}
                	if($.trim(this.date.val())){
                		eventlist = eventlist + " and t.start_date >= to_date('" + this.date.val()+ " 00:00:00" + "','yyyy-mm-dd HH24:MI:SS')" ;
                	}
                	if($.trim(this.departure_airport.val())){
                		if(this.departure_airport.val()!="AA"){
                			eventlist = eventlist + " and k.iCaoCode like '" + this.departure_airport.val() + "'" ;
                		}               		
                	}
                	if($.trim(this.arrival_airport.val())){
                		if(this.arrival_airport.val()!="AA"){
                		    eventlist = eventlist + " and h.iCaoCode like '" + this.arrival_airport.val() + "'" ;
                		}
                	}
                	if($.trim(this.date1.val())){
                		eventlist = eventlist + " and t.start_date <= to_date('" + this.date1.val() + " 23:59:59" + "','yyyy-mm-dd HH24:MI:SS')" ;
                	}
                	var eventlevel;
                	for(var i= 1;i<=4;i++){
                		if(document.getElementById("inlineCheckbox"+i).checked){
                			if(typeof(eventlevel)!="undefined"){
                				eventlevel = eventlevel + "," + i;
                            }else{
                            	eventlevel = i ;
                            }
                		}
                	}
                	if(typeof(eventlevel)!="undefined"){
                		eventlist = eventlist + " and t.severity_class_no in (" + eventlevel +  ")" ;
                	}
                	//将上面的参数合并到aoData中
                	$.extend(aoData,{
                		"tokenid":$.cookie("tokenid"),
                		"method":"getQarEventList",
                		"qarsql":eventlist,
                		"columns":JSON.stringify(aoData.columns),
                		"search":JSON.stringify(aoData.search)
                	},true);
                }),
                //查询方法
                "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                	this.btnFilter.attr("disabled",true);
                    $.ajax({
                        url: $.u.config.constant.smsqueryserver,
                        type:"post",
                        dataType: "json",
                        cache: false,
                        data: aoData
                    }).done(this.proxy(function (data) {
                        if (data.success) {
                            fnCallBack(data.data.QarEventlist);
                        }
                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                    })).complete(this.proxy(function(){
                    	this.btnFilter.attr("disabled",false);
                    }));
                })
            });
        	
        	// 编辑用户
            this.dataTable.off("click", "button.detail").on("click", "button.detail", this.proxy(function (e) {
                var $this = $(e.currentTarget);
                try{
                    this.qardetail.open(JSON.parse($this.attr("data")));
                } catch (e) {
                    throw new Error(this.i18n.editFail + e.message);
                }
            }));
        	       	
                   
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorText,errorThrown){
        	this.groupContains.attr("disabled",false);
        }));
              
    },
    on_select2_open: function(e){
		
	},	
	_getFlightHtml: function(flight){
    	return this._flightTemplate.replace(/#\{flightNO\}/g, flight.flightNO)
    							   .replace(/#\{deptAirportName\}/g, flight.deptAirportName); 
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
    		$(".com-sms-search-detail,.com-sms-filter-filterNav .favourite-filters").css("overflow-y","auto");
    	}else{
    		$("body").css("overflow-y","auto");
    		$(".com-sms-search-detail,.com-sms-filter-filterNav .favourite-filters").css({"height":"auto","overflow-y":"hidden"});
    	}
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
		moreRenderClazz = $.u.load("com.sms.plugin.search.qarProp");
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
				this._initfilter();
				this._rebuilddynmaicfilters();
				this.dataTable.fnDraw();
			})
		});
		result = inputRenderObj.get("filter", "html");
		sel = $(result).css({top:offset.top+$button.outerHeight(true)-1,left:offset.left}).appendTo("body");
		inputRenderObj.get("filter","render",$.extend(true,{},$button.parent().data("data-data")),sel); // 采用extend，防止其他函数篡改数据（.data()存的数据是引用对象？？）
    },
    /**
     * @title 重新生成动态过滤器---重新生成更多添加的查询条件
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
			if(this._filterData && JSON.stringify(this._filterData.dynamicfilters) != JSON.stringify(this._userFilter.dynamicfilters) ){
				if(this._filterId < 0){
					$toggleobjs.addClass("hidden");
					this.qid("span-editflag").removeClass("hidden");
					$btnsavefilteras.removeClass("hidden");
				}else{
					$toggleobjs.removeClass("hidden");
					$btnsavefilteras.addClass("hidden");
				}
			}else{
				$toggleobjs.addClass("hidden");
			    $btnsavefilteras.removeClass("hidden");
			}
			this.dataTable.fnDraw();
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
    	}
    	return result;
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
     * 获取前一天
     */
    getYesterday:function(){
    	var   today=new   Date();   
		var   yesterday_milliseconds=today.getTime()-1000*60*60*24;   
		var   yesterday=new   Date();   
		yesterday.setTime(yesterday_milliseconds);   
		
		var strYear=yesterday.getFullYear();
		var strDay=yesterday.getDate();
		var strMonth=yesterday.getMonth()+1;
		if(strMonth<10)
		{
			strMonth="0"+strMonth;
		}
		var strYesterday=strYear+"-"+strMonth+"-"+strDay;
		return strYesterday;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.qar.qarQuery.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                 '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                 '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                 '../../../uui/widget/select2/js/select2.min.js',
                                 "../../../uui/widget/spin/spin.js", 
                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                 "../../../uui/widget/ajax/layoutajax.js"];
com.sms.qar.qarQuery.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                  {path:"../../../uui/widget/select2/css/select2.css"},
                                  {path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];