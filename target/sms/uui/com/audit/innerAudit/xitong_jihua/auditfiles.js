//@ sourceURL=com.audit.innerAudit.xitong_jihua.auditfiles
$.u.define('com.audit.innerAudit.xitong_jihua.auditfiles', null, {
	//上传签批件
    init: function (options) {
        this._options = options || {};
        this._DATATABE_LANGUAGE =  { //语言
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
        	}
    },
    afterrender: function (bodystr) {
    	
    },
    
  
    
    creat_list:function(reportfiles){
		  if ($.fn.DataTable.isDataTable(this.qid("auditfiles"))) {
			  this.qid("auditfiles").parents(".panel-body").show();
              this.qid("auditfiles").dataTable().api().destroy();
              this.qid("auditfiles").empty();
          }
		  // 签批件
    	this.auditfilesDataTable = this.qid("auditfiles").dataTable({
    		pageLength:50,
            searching: false,
            serverSide: false,//是否启动服务器端数据导入  
            bProcessing: false,
            sDom: "t<f>",
            ordering: false,
            "info":true,
            "loadingRecords": "加载中...",  
            "aaData":reportfiles||[],
            "aoColumns": [
                { "title": "文件名" ,"mData":"fileName","sWidth":""},
                { "title": "大小", "mData":"size","sWidth":"15%" },
                { "title": "上传时间", "mData": "uploadTime", "sWidth": "15%" },
                { "title": "上传用户", "mData":"uploadUser", "sWidth": "15%" },
                { "title": "操作", "mData":"id", "sWidth": "10%" }
            ],
            "oLanguage": this._DATATABE_LANGUAGE,
            "fnServerParams": this.proxy(function (aoData) {}),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {}),
            "aoColumnDefs": [
                 {
                     "aTargets": 0,
                     "orderable":false,
                     "sClass": "tdidy",
                     "sContentPadding": "mmm",
                     "mDataProp": "", 
                     "bVisible" : true,
                     "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                     "mRender": function (data, type, full) {
                    	 return " <a href='#' style='margin-left: 10px;' class='download' fileid='"+full.id+"'>" + (data||"") + "</a>"
                     }
                 },
                 {
                     "aTargets": 1,
                     "sClass": "",
                     "mRender":  this.proxy(function (data, type, full) {
                    	 	return  data||"" 
                     })
                 },
                 {
                     "aTargets": 2,
                     "sClass": "",
                     "mRender":  this.proxy(function (data, type, full) {
                    		 return data||"" 
                     })
                 },
                {
                    "aTargets": 3,
                    "sClass": "",
                    "mRender":  this.proxy(function (data, type, full) {
                    	 return data||""
                    })
                },
                {
                    "aTargets": 4,
                    "sClass": "",
                    "mRender":  this.proxy(function (data, type, full) {
                    	 return  "<i class='fa fa-trash-o uui-cursor-pointer delete-file' style='padding-right: 10px;' fileid='"+full.id+"'/>"
               		
                    })
                }
            ],
            
            "rowCallback": this.proxy(function(row, data, index){
            	/*if(data.improveItemStatus && data.improveItemStatus.description=="措施制定"){
            		$(row).attr("style", "background-color: #dff0d8 !important");
            	}
            	if(data.improveItemStatus && data.improveItemStatus.description=="完成情况"){
            		$(row).attr("style", "background-color: #CFE4D5 !important");
            	}*/
            })
        });
    	this.auditfilesDataTable.off("click", ".download").on("click", ".download", this.proxy(this.on_downloadFile_click));
	},
	

	//下载附件
	 on_downloadFile_click: function(e){
	        var data = parseInt($(e.currentTarget).attr("fileid"));
	        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+
	        		$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.location.href);
	    },
	
	
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.audit.innerAudit.xitong_jihua.auditfiles.widgetjs = ['../../../../uui/widget/jqurl/jqurl.js',
                                                          '../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                          '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.innerAudit.xitong_jihua.auditfiles.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                           { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];