//@ sourceURL=com.audit.innerAudit.xitong_jihua.auditreportnoproblem
$.u.define('com.audit.innerAudit.xitong_jihua.auditreportnoproblem', null, {
    init: function (options) {
    	//符合项
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
    
  
    
    creat_list:function(hasProblemsData){
		  if ($.fn.DataTable.isDataTable(this.qid("noProblems"))) {
			  this.qid("noProblems").parents(".panel-body").show();
              this.qid("noProblems").dataTable().api().destroy();
              this.qid("noProblems").empty();
          }
		  // 审计中符合项
    	this.noProblemsDataTable = this.qid("noProblems").dataTable({
    		pageLength:50,
            searching: false,
            serverSide: false,//是否启动服务器端数据导入  
            bProcessing: false,
            sDom: "t<f>",
            ordering: false,
            "info":true,
            "loadingRecords": "加载中...",  
            "aaData":hasProblemsData||[],
            "aoColumns": [
                { "title": "序号" ,"mData":"id","sWidth":"8%"},
                { "title": "存在问题汇总", "mData":"itemPoint","sWidth":"" },
                { "title": "主要责任单位", "mData": "improveUnit", "sWidth": "15%" },
                { "title": "审计结论", "mData":"auditResult", "sWidth": "15%" },
                { "title": "整改期限", "mData":"improveLastDate", "sWidth": "15%" }
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
                    	 return ""
                     }
                 },
                 {
                     "aTargets": 1,
                     "sClass": "",
                     "mRender":  this.proxy(function (data, type, full) {
                    	return "<div>检查要点：<a href='#' class='rModify' dataid='"+full.id+"' datadata='"+JSON.stringify(full)+"'> "+(full.itemPoint||"")+"</a><br/><div>审计记录："+(full.auditRecord||"")
                     })
                 },
                 {
                     "aTargets": 2,
                     "sClass": "",
                     "mRender":  this.proxy(function (data, type, full) {
                    		 return  data ? data.name:"" 
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
                    		return data||""
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
    	
    	 $(".tdidy").each(function(ids,item){
    		 if(item.tagName=="TD"){
    		 	$(item).text(ids);
    		 }
    	 })
	},
	
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.audit.innerAudit.xitong_jihua.auditreportnoproblem.widgetjs = ['../../../../uui/widget/jqurl/jqurl.js',
                                                          '../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                          '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.innerAudit.xitong_jihua.auditreportnoproblem.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                           { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];