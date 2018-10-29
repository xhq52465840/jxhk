//@ sourceURL=com.sms.dash.watchBoard
$.u.define('com.sms.dash.watchBoard', null, {
    init: function (mode, gadgetsinstanceid) {
    	this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
    },
    afterrender: function (bodystr) {
    	
    	this.dataTable = this.qid("datatable").dataTable({
    		"dom": 'rt<ip>',
            "pageLength": 10,
            "pagingType": "full_numbers",
            "autoWidth": false,
            "processing": true,
            "serverSide": true,
            "language":{
            	"processing":"数据加载中...",
            	"info": " 从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            	"infoEmpty": "",
                "zeroRecords":"无搜索结果",
            	"infoFiltered":"",
            	"paginate": {
                    "first": "",
                    "previous": "<span class='fa fa-caret-left fa-lg'></span>",
                    "next": "<span class='fa fa-caret-right fa-lg'></span>",
                    "last": ""
                }
            },
            "columns": [
                {
                	"data": "type.name",
                	"title": "类型",
                	"class": "field-type",
                	"render": function(data, type,row){
                		return row.type ? "<img src='/sms/uui/"+ row.type.url +"' width='16' height='16''/>&nbsp;"+row.type.name : "";
                	}
                },
                {
                	"data": "unit.code",
                	"title": "编号",
                	"class": "field-key",
                	"render":this.proxy(function(data,type,row){
                		return  row.unit ? "<a target='_top' href='" + this.getabsurl("../search/activity.html?activityId=" + row.id) + "'>" + row.unit.code + "-" + row.num + "</a>" : ""; 
                	}),
                    "orderable": false
                },
                {
                	"data": "priority",
                	"title": "优先级",
                	"class": "field-priority",
                	"render": this.proxy(function(data,type,row){
                		return data ? "<img src='/sms/uui/"+ data.url +"' width='16' height='16''/>&nbsp;" + data.name : ""; 
                	})
                },
                {
                	"data": "summary",
                	"title": "主题",
                	"class": "field-summary",
                	"render": this.proxy(function(data,type,row){
                		return "<a target='_top' href='"+this.getabsurl("../search/activity.html?activityId=" + row.id) + "'>" + data + "</a>";
                	})
                }
            ],
            "ajax": this.proxy(this.on_dataTable_ajax),
            "headerCallback": this.proxy(this.on_dataTable_headerCallback)
    	});
    },
    on_dataTable_headerCallback:function( tr, data, start, end, display ) {
    	$(tr).children("th").css("padding","5px 0");
    },
    on_dataTable_ajax:function(data,callback,settings){
    	$.u.ajax({
    		url: $.u.config.constant.smsqueryserver,
    		type: "post",
    		data: {
    			"tokenid": $.cookie("tokenid"),
    			"method": "getActivityByUser",
    			"start": data.start,
    			"length": data.length,
    			"sort": data.columns[data.order[0].column].data,
    			"order": data.order[0].dir
    		},
    		dataType: "json"
    	},this.dataTable,{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
    		if(response.success){
    			callback({
    				"draw": data.draw,
    				"recordsFiltered": response.data.iTotalRecords,
    				"data":response.data.aaData
    			});
    			if (window.parent) {
			        window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
			    }
    		}
    	}));
    },
    destroy: function () {
        return this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.dash.watchBoard.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                      "../../../uui/widget/spin/spin.js", 
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js"];
com.sms.dash.watchBoard.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];