//@ sourceURL=com.sms.dash.activitytable
$.u.define('com.sms.dash.activitytable', null, {
    init: function (mode, gadgetsinstanceid) {
    	this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
        this._pageLength = 10;
        this._columns = [
	          {
		        "propid": "type",
		        "propname": "类型",
		        "propvalue": null,
		        "propplugin": "com.sms.plugin.render.activityTypeProp"
		      },
              {
                "propid": "key",
                "propname": "编号",
                "propvalue": null,
                "propplugin": "com.sms.plugin.render.keywordProp",
                "orderable": false
              },
		      {
		        "propid": "summary",
		        "propname": "主题",
		        "propvalue": null,
		        "propplugin": "com.sms.plugin.render.summaryProp"
		      },
		      {
		        "propid": "unit",
		        "propname": "安监机构",
		        "propvalue": null,
		        "propplugin": "com.sms.plugin.render.unitProp"
		      },
		      {
		        "propid": "status",
		        "propname": "状态",
		        "propvalue": null,
		        "propplugin": "com.sms.plugin.render.statusProp"
		      },
		      {
		    	"propid": "creator",
		    	"propname": "创建人",
		    	"propvalue": null,
		    	"propplugin": "com.sms.plugin.render.selectUserProp"
		      }
        ];
    },
    afterrender: function (bodystr) {
    	this.columns = this.qid("columns");
    	this.columns.on("mouseenter mouseleave", "a.list-group-item", this.proxy(this.on_column_enterLeave));
    	this.columns.on("click", ".removecolumn", this.proxy(this.on_removeColumn_click));
    	
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		true,
    		{
    			"method": "stdcomponent.getbyid",
                "dataobject": "gadgetsinstance",
                "dataobjectid": this._gadgetsinstanceid
    		}, 
            this.$, 
            { size:2, backgroundColor:"#fff" },
            this.proxy(function(response){
            	this._gadgetsinstance = response.data;
            	this.dash_options = {};
            	if(this._gadgetsinstance.urlparam){
            		this.dash_options = JSON.parse(this._gadgetsinstance.urlparam);
            		this.dash_options.rule = this.dash_options.rule ? JSON.parse(this.dash_options.rule) : null;
            	}
            	
            	if(this._initmode == "display"){
            		this.qid("viewcontainer").removeClass("hidden");
                	this._rebuildDataTable();
            	}else if(this._initmode == "config"){
            		this.qid("configcontainer").removeClass("hidden");
            		this.qid("btn_save").click(this.proxy(this.on_save_click));
            		this.qid("btn_cancel").click(this.proxy(this.on_cancel_click));
            		this._initConfigForm();
            	}
            })
    	);
    },
    _initConfigForm: function(){
    	this.qid("select_filter").select2({
			width: this.qid("select_filter").outerWidth(true),
			ajax: {
				url: $.u.config.constant.smsqueryserver,
				type: "post",
				dataType: "json",
				data: this.proxy(function(term, page){
					//TODO 搜索等陈栋配合确认参数
					return {
						"tokenid": $.cookie("tokenid"),
						"method": "getFilter",
		                "type": "S",
		                "dataobject": "filtermanager"
					};
				}),
				results: this.proxy(function(response, page, query){
					if(response.success){
						return { results: response.data.aaData };
					}
				})
			},
            formatResult:function(item){
            	return item.name;
            },
            formatSelection:function(item){
            	return item.name;
            }
		}).on("select2-selecting", this.proxy(function(e){
			var data = e.object; //this.qid("select_filter").select2("data");
			try{
				var setting = JSON.parse(data.filterRule);
				if(setting.mydefaultcolumns || !("mydefaultcolumns" in setting)){
	            	
					if($.jStorage.get("userColumns")){
						this._columns = $.extend(true, {}, $.jStorage.get("userColumns"), true);
						this._drawColumns(this._columns);
					}else{	
						this.qid("btn_save").addClass("disabled");
						this._ajax("../search/userfilter.json",true, {}, this.columns,{ size:2, backgroundColor:"#fff" }, this.proxy(function(result){
            				this.qid("btn_save").removeClass("disabled");
    			            this._columns = result.data.columns; 
    			            this._drawColumns(this._columns);
        				}));
					}
				}else{
					this._columns = setting.columns;
					this._drawColumns(this._columns);
				}
                window.parent && window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
			}catch(e){
				
			}
		}));
    	if(this.dash_options.ruleid && this.dash_options.rulename){
    		this.qid("select_filter").select2("data",{ "id": this.dash_options.ruleid, "name": this.dash_options.rulename, "filterRule":JSON.stringify(this.dash_options.rule )});
    		this._drawColumns(this.dash_options.rule.columns);
    	}
    	this.qid("text_pagelength").val(this.dash_options.pageLength || this._pageLength);
        window.parent && window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
    },
    _rebuildDataTable: function(){
    	var columns = this._columns;
    	if(this.dash_options && this.dash_options.rule){
//    		if(this.dash_options.rule.mydefaultcolumns){
//    			this._ajax(
//    				$.u.config.constant.smsqueryserver,
//    				true,
//    				{
//    					"method": "stdcomponent.getbyid",
//    					"dataobject": "user",
//    					"dataobjectid": parseInt($.cookie("userid"))
//    				},
//    	    		this.dataTable,
//    	    		{ size:2, backgroundColor:"#fff" },
//    				this.proxy(function(response){
//    					this._initDataTable($.parseJSON(response.data.columns));
//    				})
//    			);
//    		}else{
    			columns = this.dash_options.rule.columns || this._columns;
    			this._initDataTable(columns);
//    		}
    	}else{
            this.qid('norule-tips').removeClass('hidden');
        }
    },
    _initDataTable: function(columns){
    	var tablecols = [], atbcol = null;
        $.each(columns, this.proxy(function (idx, adata) {
            atbcol = { "data": adata.propid, "title": adata.propname, "class": "field-" + adata.propid };
            if(adata.propplugin){
                var renderclz = $.u.load(adata.propplugin);
                var renderobj = new renderclz();
                atbcol.render =  this.proxy(renderobj.table_html);
                if(adata.propplugin === "com.sms.plugin.render.keywordProp"){
                    atbcol.orderable = false;
                }
            }

            tablecols.push(atbcol);
        })); 
    	this.dataTable = this.qid("datatable").dataTable({
    		"dom": 't<ip>',
    		"pageLength": parseInt(this.dash_options.pageLength || this._pageLength),
            "pagingType": "full_numbers",
            "autoWidth": false,
            "processing": false,
            "serverSide": true,
            "language":{
            	"processing":"数据加载中...",
            	"info": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "zeroRecords":"无搜索结果",
                "infoEmpty": "没有数据",
            	"infoFiltered":"",
            	"paginate": {
                    "first": "",
                    "previous": "<span class='fa fa-caret-left fa-lg'></span>",
                    "next": "<span class='fa fa-caret-right fa-lg'></span>",
                    "last": ""
                }
            },
            "columns": tablecols,
            "ajax": this.proxy(this.on_dataTable_ajax),
            "headerCallback": this.proxy(this.on_dataTable_headerCallback)
    	});
    },
    _drawColumns: function(columns){
    	this.columns.empty();
    	$.each(columns, this.proxy(function(idx, column){
    		$("<a href='#' class='list-group-item'>" + column.propname + "<span class='glyphicon glyphicon-remove pull-right hidden removecolumn'></span></a>").data("data", column).appendTo(this.columns);
    	}));
    },
    on_removeColumn_click: function(e){
    	e.preventDefault();
    	$(e.currentTarget).parent().remove();
    },
    on_column_enterLeave: function(e){ 
    	$(e.currentTarget).children(".removecolumn").toggleClass("hidden");
    },
    on_dataTable_headerCallback:function( tr, data, start, end, display ) {
    	$(tr).children("th").css("padding","5px 0");
    },
    on_dataTable_ajax:function(data,callback,settings){
    	var query = [], filterArray = [];
    	if(this.dash_options.rule){
    		filterArray = filterArray.concat(this.dash_options.rule.staticfilters || []).concat(this.dash_options.rule.dynamicfilters || []);
	    	query = $.map(filterArray, function(filter){
				if(filter.propvalue && filter.propvalue.length>0){
	        		return {id:filter.propid,value:filter.propvalue};
				}
	    	});
    	}
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		true,
    		$.extend({},data,{
    			"method": "stdcomponent.getbysearchex",
         		"core": "activity",
         		"columns": JSON.stringify(data.columns),
         		"order": JSON.stringify(data.order),
         		"sort": data.columns[data.order[0].column].data + " " + data.order[0].dir,
         		"query": JSON.stringify(query)
    		},true),
    		this.dataTable,
    		{ size:2, backgroundColor:"#fff" },
    		this.proxy(function(response){
    			if(response.data){
    				callback({
        				"draw": data.draw,
        				"recordsFiltered": response.data.iTotalRecords,
        				"data": response.data.aaData
        			});
    			}else{
    				callback({
        				"draw": data.draw,
        				"recordsFiltered": 0,
        				"data":[]
        			});
    			}
    			if (window.parent) {
			        window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
			        if(this.dash_options.rulename){
			        	window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "：" + this.dash_options.rulename);
			        }
			    }
    		})
    	);    	
    },
    on_save_click: function(e){
    	var rule = this.qid("select_filter").select2("data"), pageLength = this.qid("text_pagelength").val();
    	pageLength = pageLength.replace("+","");
    	if(!this.isNum(pageLength)){
    		$.u.alert.error("请输入小于1000的正数");
    		return false;
    	}
        if(!rule){
            $.u.alert.error('请选择过滤器');
            this.qid("select_filter").select2("open")
            return false;
        }
    	try{
    		var filterRule = JSON.parse(rule.filterRule);
    		filterRule.columns = $.map(this.columns.children(), this.proxy(function(a, idx){
        		return $(a).data("data");
        	}));
    		rule.filterRule = JSON.stringify(filterRule);
    	}catch(e){
    		
    	}
    	this._ajax(
    		$.u.config.constant.smsmodifyserver,
    		true,
    		{
    			"method": "stdcomponent.update",
	    		"dataobject": "gadgetsinstance",
                "dataobjectid": parseInt(this._gadgetsinstanceid),
                "obj": JSON.stringify({ "urlparam": JSON.stringify({"ruleid":rule.id, "rulename":rule.name, "rule": rule.filterRule, "pageLength":pageLength}) } )
    		},
    		this.qid("btn_save"),
    		{ size:2, backgroundColor:"#fff" },
    		this.proxy(function(response){
    			window.location.href = window.location.href.replace("config","display");
    		})
    	);
    	return false;
    },
    on_cancel_click: function(e){
    	window.location.href = window.location.href.replace("config","display");
    	return false;
    },
    /**
     * @title ajax
     * @param url {string} ajax url
     * @param async {bool} async
     * @param param {object} ajax param
     * @param $container {jQuery object} block
     * @param blockParam {object} block param
     * @param callback {function} callback
     */
    _ajax:function(url,async,param,$container,blockParam,callback){ 
    	$.u.ajax({
			"url": url,
			"datatype": "json",
			"async": async,
			"type": "post",
			"data": $.extend({
				"tokenid": $.cookie("tokenid")
			},param)
		},$container || this.$,$.extend({},blockParam||{})).done(this.proxy(function(response){
			if(response.success){
				callback(response);
			}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
       
		}));
    },
    /**
     * 检测正数
     */
    isNum : function(str){
    	var fullNumber = "^[1-9]\\d{0,2}$";
    	return new RegExp(fullNumber).test(str);
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.dash.activitytable.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                       '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.dash.activitytable.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                        {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                        { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                        { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];