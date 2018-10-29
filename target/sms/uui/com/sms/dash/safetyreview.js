//@ sourceURL=com.sms.dash.safetyreview
$.u.define('com.sms.dash.safetyreview', null, {
    init: function (mode, gadgetsinstanceid) {
    	this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
        
    },
    afterrender: function (bodystr) {
    	this._initDataTable();
    },
    _initDataTable: function(){    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:10,
            "sDom":"rt<ip>",
            "columns": [
                { "title": "安监机构" ,"mData":"unit"},
                { "title": "评审年份" ,"mData":"year"},
                { "title": "季度" ,"mData":"season"},
                { "title": "状态" ,"mData":"status"},
                { "title": "操作" ,"mData":"status"}
            ],
            "aaData":[

            ],
            "oLanguage": { //语言
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                	"sFirst": "",
                    "sPrevious": "<span class='fa fa-caret-left fa-lg'></span>",
                    "sNext": "<span class='fa fa-caret-right fa-lg'></span>",
                    "sLast": ""
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"search":"",
            		"columns":"[{'data':'created'}]",
            		"order"  :JSON.stringify([{"column":0,"dir":"desc"}]),
            		"sort":JSON.stringify({"key":"created","value":"desc"}),
            		"method": "stdcomponent.getbysearch",
            		"dataobject":"methanolInst",
            		"rule": JSON.stringify([[{"key":"creator","value":parseInt($.cookie("userid"))}],
            		                        [{"key":"status","value":"NEW"}]])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this._ajax(
            		$.u.config.constant.smsqueryserver,
            		true,
            		aoData,
            		this.qid("datatable"),
            		{ size:2, backgroundColor:"#fff" },
            		this.proxy(function(response){
                        fnCallBack(response.data);
                        if (window.parent.resizeGadget) {
        			        window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
        			    }
            		})
            	);
            }),
            "aoColumnDefs": [
                {
	                "aTargets": 0,
	                "mRender": function (data, type, full) {
	                	 return  full.unit;
	                }
	            },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	 return  data+"年";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	 return "第" + data + "季度";
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": this.proxy(function (data, type, full) {
                    	var retu = null;
                    	if(data=="NEW"){
                    		retu = "新建";
                    	}else if(data=="WAITING"){
                    		retu = "待审核";
                    	}else if(data=="COMPLETE"){
                    		retu = "完成";
                    	}else if(data=="CLOSED"){
                    		retu = "关闭";
                    	}
                    	return retu;
                    })
                },
                {
                    "aTargets": 4,
                    "mRender": this.proxy(function (data, type, full) {
                    	var htmls = "";
                    	htmls += "<a href='../unitbrowse/ViewSingleReview.html?id="+full.id+"' target='_balnk'>查看</a>";
                        return htmls;
                    })
                }
            ],
            "drawCallback": this.proxy(function(){
                window.top && window.top.goHash(this._gadgetsinstanceid);
            })
        });
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
			"data": $.isArray(param) ? param : $.extend({
				"tokenid": $.cookie("tokenid")
			},param)
		},$container || this.$,$.extend({},blockParam||{size:2, backgroundColor:"#fff"})).done(this.proxy(function(response){
			if(response.success){
				callback(response);
			}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
       
		}));
    },
    /**
     * @title 控制行动项看板的iframe高度
     */
    _resizeGadget: function(showDialog){
    	if (window.parent) {
	        if(this.qid("detailDialog").parent().is(":visible")){
	        	window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, (this.qid("detailDialog").parent().outerHeight(true)) + 1 );
	        }else{
	        	window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, ($("body").outerHeight(true))  + 1 );
	        }
	    }
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.dash.safetyreview.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                       '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.dash.safetyreview.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                        {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                        { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                        { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];