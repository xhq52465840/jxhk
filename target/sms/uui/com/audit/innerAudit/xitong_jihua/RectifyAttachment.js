//@ sourceURL=com.audit.innerAudit.xitong_jihua.RectifyAttachment
$.u.define('com.audit.innerAudit.xitong_jihua.RectifyAttachment', null, {
    init: function (options) {
    	//验证签批件
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
    	this.add_attachment=this.qid("add_attachment");//上传验证单
    	this.add_attachment.off("click").on("click",this.proxy(this.on_attachment_open));
    	if(!this._options.editable){
    		this.add_attachment.addClass("hidden");
    	}
    },

    on_attachment_open:function(e){
    	if(!this.attachment){
    		var clz = $.u.load("com.audit.innerAudit.comm_file.audit_uploadDialog");
    		this.attachment = new clz($("div[umid='attachment']",this.$),null);
    	}
		this.attachment.override({
    		refresh: this.proxy(function(data){
    			this.refresh();
    		})
    	});
    	try{
    		this.attachment.open({
    			"method":"uploadFiles",
    			"source": this._options.id,
    			"tokenid":$.cookie("tokenid"),
    			"sourceType":22
    		});
    	}catch(e){
    		$.u.alert.error("上传出错！");
    	}
    },
    
    
    
    
    creat_list:function(auditattachment){
		  if ($.fn.DataTable.isDataTable(this.qid("auditattachment"))) {
			  this.qid("auditattachment").parents(".panel-body").show();
              this.qid("auditattachment").dataTable().api().destroy();
              this.qid("auditattachment").empty();
          }
		  // 验证签批件
    	this.auditattachmentDataTable = this.qid("auditattachment").dataTable({
    		pageLength:50,
            searching: false,
            serverSide: false,//是否启动服务器端数据导入  
            bProcessing: false,
            sDom: "t<f>",
            ordering: false,
            "info":true,
            "loadingRecords": "加载中...",  
            "aaData":auditattachment||[],
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
                     	return  data||"" 

                     }
                 },
                 {
                     "aTargets": 1,
                     "sClass": "",
                     "mRender":  this.proxy(function (data, type, full) {
                    	 return data||"" 
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
            	
            })
        });
    	this.auditattachmentDataTable.off("click",".delete-file").on("click",".delete-file",this.proxy(this.delete_file));
    	if(!this._options.editable){
    		this.auditattachmentDataTable.find(".delete-file").addClass("hidden")
    	}
	},
	refresh: function () {
		
    },
    delete_file:function (e) {
		
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.audit.innerAudit.xitong_jihua.RectifyAttachment.widgetjs = ['../../../../uui/widget/jqurl/jqurl.js',
                                                          '../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                          '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.innerAudit.xitong_jihua.RectifyAttachment.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                           { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];