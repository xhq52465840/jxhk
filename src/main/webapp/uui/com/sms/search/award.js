//@ sourceURL=com.sms.search.award
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.search.award', null, {
	//	copy from com.sms.search.searchindex
    init: function () {
    	  this._filtertemplate = "<li data-id='#{propid}' class='criteria-item'>" +
    	  						"<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
	  							"<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
	  							"</button>" +
	  							"<a href='#' class='remove-filter' title='移除条件' tabindex='-1'><span class='glyphicon glyphicon-remove-sign criteria-close'></span></a></li>";

    	  this._btn_template = 
			"<button type='button' data-id='#{propid}' data-plugin='#{propplugin}' class='criteria-selector btn btn-subtle'>" +
			"<span class='criteria-wrap'><span class='fieldLabel'>#{propname}：</span><span class='fieldValue'>#{propshow}</span><span class='caret' style='margin-left: 5px;'></span></span>" +
			"</button>" ;

        this._userFilter ={"staticfilters":[],"dynamicfilters":[]};	
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
        this.awardFilter=[
            {
	        	"id":"",
	        	"name":"处理类型",
	        	"umodule":"com.sms.search.awardType",
	        	"showvalue":""
	        },
	        {
		        "id":"",
		    	"name":"姓名",
		    	"umodule":"com.sms.search.awardName",
		    	"showvalue":""
	        }]
           
    },
    
    afterrender: function () {
    	
    	this.rewardType=$("[name=rewardType]");
    	this.name=$("[name=name]");
    	this.flightUnit=$("[name=flightUnit]");
    	this.personnelCategory=$("[name=personnelCategory]");
    	this.occurredDateStart=$("[name=occurredDateStart]");
    	this.occurredDateEnd=$("[name=occurredDateEnd]");
    	this.empDateStart=$("[name=empDateStart]");
    	this.empDateEnd=$("[name=empDateEnd]");
    	this.fliter=$("[name=fliter]").off("click").on("click",this.proxy(this.on_click_fliter))
    	this._initinput();
    	this.fliter.trigger("click");
    	/*$("<div class='plugin-progress'>"+
				"<div class='progress'>"+
					"<div class='progress-bar' role='progressbar' aria-valuenow='30' aria-valuemin='0' aria-valuemax='100' style='width: 30%;'>30%</div>"+
				"</div>"+
		  "</div>").dialog({
			title:"系统更新中",
			width:540,
			resizable:false,
			draggable: false,
			modal:true
		});*/
    	
    	
    },
    
    on_click_fliter:function(e){
    	e.preventDefault();
    	this._rebuildtable();
    },
    _initinput:function(){
    	this.rewardType.select2({
    		placeholder: "选择...",
    		multiple:true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getRewardsType",
                        "category":"rewardType",
                        "term": term,
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	});
    	this.personnelCategory.select2({
    		placeholder: "选择...",
    		multiple:true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getRewardsType",
                        "category":"personnelCategory",
                        "term": term,
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	});
    	this.occurredDateStart.add(this.occurredDateEnd)
						      .add(this.empDateStart)
						      .add(this.empDateEnd).datepicker({dateFormat:"yy-mm-dd"});
    },

	_rebuildtable:function(){
	   	if ($.fn.DataTable.isDataTable(this.qid("awardtable"))) {
            this.qid("awardtable").dataTable().api().destroy();
            this.qid("awardtable").empty();
        }
	    this.awardTable=this.qid("awardtable").dataTable({
           "dom": 'tip',
           "loadingRecords": "加载中...",  
           "info":true,
           "pageLength": parseInt(10),
           "pagingType": "full_numbers",
           "autoWidth": true,
           "processing": false,
           "serverSide": true,
           "bRetrieve": true,
           "ordering": false,
           "language":{
	           	"processing":"数据加载中...",
	           	"info": " _START_ - _END_ of _TOTAL_ ",
	             "zeroRecords":"无搜索结果",
	           	"infoFiltered":"",
	           	"infoEmpty":"",
	           	"paginate": {
	                   "first": "",
	                   "previous": "<span class='fa fa-caret-left fa-lg'></span>",
	                   "next": "<span class='fa fa-caret-right fa-lg'></span>",
	                   "last": ""
	               }
           },
           "columns":  [
		                 { "title": "处理类型" ,"mData":"rewardType", "sWidth": "10%" },
		                 { "title": "人员类别" ,"mData":"personnelCategory", "sWidth": "10%" },
		                 { "title": "姓名" ,"mData":"name", "sWidth": "10%" },
		                 { "title": "单位" ,"mData":"flightUnit", "sWidth": "10%"},
		                 { "title": "事件","mData":"description", "sWidth": "10%" },
		                 { "title": "事件时间" ,"mData":"occurredDate", "sWidth": "10%"},
		                 { "title": "录入时间" ,"mData":"lastUpdate", "sWidth": "10%"},
		                 { "title": "经济" ,"mData":"economyRMB", "sWidth": "10%"},
		                 { "title": "星级" ,"mData":"starlevelSource", "sWidth": "10%"},
		                 { "title": "操作" ,"mData":"id", "sWidth": "10%"}
		             ],
           "aoColumnDefs": [{
                                "aTargets": 2,
                                "mRender": function (data, type, full) {
                                	return data||""
                                }
                            },
                            {
                                "aTargets": 3,
                                "mRender": function (data, type, full) {
                                	return data||""
                                }
                            },
                            {
                                "aTargets": 4,
                                "mRender": function (data, type, full) {
                                	return data||""
                                }
                            },
                            {
                                "aTargets": 5,
                                "mRender": function (data, type, full) {
                                	return data||""
                                }
                            },
                            {
                                "aTargets": 6,
                                "mRender": function (data, type, full) {
                                	return data||""
                                }
                            },
                            {
                                "aTargets": 9,
                                "mRender": function (data, type, full) {
                                	return "<button type='button' fullid='"+full.id+"' class='btn btn-link editdetail' data='"+JSON.stringify(full)+"'>编辑</button>";
       	             	
                                }
                            }],
           "ajax": this.proxy(function (data, callback, settings) {
		        	   delete data.order;
		               delete data.draw;
		               delete data.search;  
		          	   delete data.columns;
	        	   this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
	           		"method": "getRewardsList",
	           		"rewardType": this.rewardType.val(),
	           		"personnelCategory": this.personnelCategory.val(),		
	           		"name": this.name.val(),
	           		"flightUnit": this.flightUnit.val(),
	           		"occurredDateStart": this.occurredDateStart.val(),
	           		"occurredDateEnd": this.occurredDateEnd.val(),
	           		"empDateStart":this.empDateStart.val(),
	           		"empDateEnd":this.empDateEnd.val(),
	            	}),this.qid("awardtable").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
	            			if(response.success){
	                      		 callback({
	 	                      		"recordsFiltered":response.data.iTotalDisplayRecords,
	 	                      		"data":response.data.aaData
	 	                      	});
	                       	}
	           	}));
        	  }),
           "headerCallback": this.proxy(function( thead, data, start, end, display ) {
           }),
            "rowCallback": this.proxy(function(row, data, index){
         })
       });
	  
	    this.awardTable.off("click",".editdetail").on("click",".editdetail",this.proxy(function(e){
	    	var fullid=$(e.currentTarget).attr("fullid");
	    	window.open("AwardDetail.html?awardId="+fullid,"_blank")
	    }))  
	},
	
   
    
    
    
    
    /**
     * @title 切换基本筛选模式
     * @param e
     */
    on_btn_basic_click: function (e) { 
        e.preventDefault();
        this._userFilter.mode = "basic";
        this._rebuildstaticfilters();
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
				this.returndata=data;
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
            if ($.fn.DataTable.isDataTable(this.qid("viewtable"))) {
                this.qid("viewtable").dataTable().api().destroy();
                this.qid("viewtable").empty();
            }
            var tablecols = [];
            var tbmappings = {};
            var order = [];
            
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
          this.dataTable=this.qid("viewtable").dataTable({
                "dom": 'tip',
                "pageLength": parseInt($.cookie("pageDisplayNum") || 10),
                "pagingType": "full_numbers",
                "autoWidth": true,
                "processing": false,
                "serverSide": true,
                "order": order,
                "language":{ 
			            "sSearch": "搜索:",
			            "sLengthMenu": "每页显示 _MENU_ 条记录",
			            "sZeroRecords": "抱歉未找到记录",
			            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
			            "sInfoEmpty": "没有数据",
			            "sInfoFiltered": "",
			            "sProcessing": "检索中...",
			            "oPaginate": {
			                "sFirst": "",
			                "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
			                "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
			                "sLast": ">>"
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
		    					if(filter.propvalue && filter.propvalue.length>0){
		    						   querya.push({"key":filter.key,"propvalue":filter.propvalue});
		    							return querya;
		    					}});
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
	                			}
	                			else
	                				queryd.push({"key":item.key,"op":"like","value":field.id});
	                			
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
                	 rulecache.push([{"key":"profession","op":"is not null"}]);
                	this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
                		"method": "stdcomponent.getbysearch",
                		"rule":JSON.stringify(rulecache) ,//JSON.stringify([[{key:"unit",op:in,"value":[9,8]}]]),
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
                               
                })
            });
  

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


    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });



com.sms.search.award.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       //'../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',\
                                 "../../../uui/widget/select2/js/select2.min.js",
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.search.award.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                {path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                                {id:"", path: "../../../uui/widget/select2/css/select2.css" }, 
                                           {id:"", path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                                        { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];


com.sms.search.award.ad=[{id:90,name:"df"},{}];
