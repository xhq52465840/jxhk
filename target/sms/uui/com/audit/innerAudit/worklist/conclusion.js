//@ sourceURL=com.audit.innerAudit.worklist.conclusion
$.u.define('com.audit.innerAudit.worklist.conclusion', null, {
    init: function (options) {
    	this._options = options;
    },
    afterrender: function (bodystr) {
		this._createDatatable();
		this._createBtn();
    },
	_createBtn : function(){
		this.save = this.qid("save");
		this.save.off("click").on("click",this.proxy(this._saveData));
        this.scommit = this.qid("commit");
        this.scommit.off("click").on("click",this.proxy(this._commitData));
        this.exportEx = this.qid("exportEx");
        this.exportEx.off("click").on("click",this.proxy(this._exportData));
	},
    _saveData : function(){
        
    },
    _commitData : function(){
        
    },
    _exportData : function(){
        
    },
	_createDatatable : function(){
		this.datatable = this.qid("datatable").dataTable({
			destroy: true,
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:10,
            "sDom":"",
            "columns": [
                { "title": "存在问题汇总" ,"mData":"id","sWidth":"60%"},
                { "title": "责任单位" ,"mData":"id","sWidth":"20%"},
                { "title": "审计结论" ,"mData":"id","sWidth":"10%"},
				{ "title": "整改期限" ,"mData":"id","sWidth":"10%"}
            ],
            "aaData":[

            ],
            "oLanguage": { //语言
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
                "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
                "sProcessing": "检索中...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": "上一页",
                    "sNext": "下一页",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"getDailySafetyWorkStatus",
            		"columns":"",
            		"search":""
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    type:"post",
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
                    	return"<span data-id='"+data+"' class='mouse-cursor modify'>"+data+"</span>";
                    })
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	return "";
                    }
                }
            ]
        });
		this.datatable.find("modify").off("click").on("click",this.proxy(this.modifyRow));
	},
	modifyRow : function(e){
		e.preventDefault();
		var $e = $(e.currentTarget);
		var data = $e.attr("data-id");
        if(!this.recordDiForm){
            $.u.load('com.audit.innerAudit.worklist.dialog');
        }
		this.recordDiForm = new com.audit.worklist.dialog($("div[umid='recordDiForm']",this.$),data);
        this.recordDiForm.open();
	},
	_ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	}
}, { usehtm: true, usei18n: false });
com.audit.innerAudit.worklist.conclusion.widgetjs = ["../../../../uui/widget/select2/js/select2.min.js",
                                        "../../../../uui/widget/spin/spin.js", 
                                        "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../../uui/widget/ajax/layoutajax.js",
										'../../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
										'../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.innerAudit.worklist.conclusion.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                         { path: "../../../../uui/widget/select2/css/select2-bootstrap.css" },
										 { path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
										 { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];