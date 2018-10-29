//@ sourceURL=com.sms.dash.library
$.u.define('com.sms.dash.library', null, {
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
                { "title": "名字" ,"mData":"name","sWidth":"70%"},
                { "title": "最后更新时间" ,"mData":"created","sWidth":"30%"}
            ],
            "aaData":[

            ],
            "oLanguage": {
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
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
            		"columns":"",
            		"method": "stdcomponent.getbysearch",
            		"dataobject":"directory",
            		"rule": JSON.stringify([[{"key":"status","value":1}]])
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
	                	 var htmls = "";
                    	htmls += "<a href='libraryDetail.html?treeid="+full.id+"' target='_balnk'>"+data+"</a>";
                        return htmls;
	                }
	            }
            ]
        });
    },
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
    _resizeGadget: function(showDialog){
    	if (window.parent) {
	        window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, ($("body").outerHeight(true))  + 10 + "px");
	    }
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.dash.library.widgetjs = ["../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                 "../../../uui/widget/spin/spin.js", 
                                 "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                 "../../../uui/widget/ajax/layoutajax.js"];
com.sms.dash.library.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];