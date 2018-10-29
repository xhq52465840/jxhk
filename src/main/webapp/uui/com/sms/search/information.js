//@ sourceURL=com.sms.search.information
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.search.information', null, {
    init: function () {
    },
    
    afterrender: function () {
        this.unitDialog = this.qid("divUnitDialog").dialog({
        	title:"单位",
            width:840,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [
                {
                    text: "添加",
                    "class":"saveunit",
                    click: this.proxy(this.on_dialog_ok)
                },
                {
                    text: "取消",
                    "class": "aui-button-link",
                    click: this.proxy(function(e){
                    	this.unitDialog.dialog("close");
                    })
                }
            ],
            open: this.proxy(),
            close: this.proxy(function () {
            	this.unitDialog.dialog("close");
            	this.tree.destroy();
            	this.tree = null;
            }),
            create: this.proxy(function () {
            })
        }); 
    	this._rebuildtable();
    },
    open:function(){
    	this.unitDialog.dialog("open");
    },
	_rebuildtable:function(){
	   	if ($.fn.DataTable.isDataTable(this.qid("awardReTable"))) {
            this.qid("awardReTable").dataTable().api().destroy();
            this.qid("awardReTable").empty();
        }
	    this.awardReTable=this.qid("awardReTable").dataTable({
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
	           		"rewardType": "",
	           		"personnelCategory": "",		
	           		"name": "",
	           		"flightUnit": "",
	           		"occurredDateStart": "",
	           		"occurredDateEnd": "",
	           		"empDateStart":"",
	           		"empDateEnd":"",
	            	}),this.qid("awardRecordTable").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
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



com.sms.search.information.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       //'../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',\
                                 "../../../uui/widget/select2/js/select2.min.js",
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.search.information.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                {path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                                {id:"", path: "../../../uui/widget/select2/css/select2.css" }, 
                                           {id:"", path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                                        { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];



