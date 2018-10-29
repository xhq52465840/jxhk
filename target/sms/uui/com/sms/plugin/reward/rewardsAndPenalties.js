//@ sourceURL=com.sms.plugin.reward.rewardsAndPenalties
$.u.define('com.sms.plugin.reward.rewardsAndPenalties', null, {
    init: function (options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
        this._existActivityTypeArray = [];
    },
    afterrender: function (bodystr) {
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            paging: false,
            dom: "tip",
            "columns": [
                { "title": "安全信息类型" ,"mData":"activityType"},
                { "title": "操作","mData":"id","sWidth":150}
            ],
            "oLanguage": {
                "sSearch": "搜索:",
                "sLengthMenu": "每页显示"+"_MENU_"+"条记录",
                "sZeroRecords": "抱歉未找到记录",
                "sInfo": "从"+" _START_ "+"到"+" _END_ /"+"共"+"_TOTAL_ "+"条数据",
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
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "rewardsActivityTypeEntity",
            		"columns": JSON.stringify(aoData.columns),
            		"search": JSON.stringify(aoData.search),
            		"rule": JSON.stringify([[{"key":"activityType.name","op":"like","value":this.qid("name").val()}]])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                    	this._existActivityTypeArray = $.map(data.data.aaData, function(item, idx){ return item.activityTypeId; }); 
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 1,
                    "mRender": this.proxy(function (data, type, full) {
	                	return "<button class='btn btn-link delete' data='" + JSON.stringify(full) + "'>删除</button>";
                    })
                }
            ]
        });

    	this.qid("btn_addActivityType").click(this.proxy(this.on_addActivityType_click));
    	this.qid("btn_filter").click(this.proxy(this.on_filter_click));
    	this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeActivityType_click));
    	
    },
    /**
     * @title 搜索
     * @return void
     */
    on_filter_click: function(e){
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 重置
     * @return void
     */
    on_reset_click: function(e){
    	this.qid("name").val("");
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 添加安全信息类型
     * @param e {object} 鼠标对象
     * @return void
     */
    on_addActivityType_click:function(e){
    	if(this.activityTypeDialog == null){
    		this._initActivityTypeDialog();
    	}    	
    	this.activityTypeDialog.open();
    },
    /**
     * @title 删除安全信息类型
     * @param e {object} 鼠标对象
     * @return void 
     */
    on_removeActivityType_click:function(e){ 
		var data = JSON.parse($(e.currentTarget).attr("data"));
		$.u.load("com.sms.common.stdcomponentdelete");
		(new com.sms.common.stdcomponentdelete({
			body: "<div>"+
				 	"<p>请确认你要删除这个安全信息类型？/p>"+
				 "</div>",
			title: "删除：" + data.activityType,
			dataobject: "rewardsActivityTypeEntity",
			dataobjectids: JSON.stringify([parseInt(data.id)])
		})).override({
			refreshDataTable:this.proxy(function(){
				this.dataTable.fnDraw();
			})
		});
    },
    /**
     * @title 初始化模态层
     * @return void
     */
    _initActivityTypeDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.activityTypeDialog = new com.sms.common.stdComponentOperate($("div[umid='activityTypeDialog']",this.$),{
    		"title":"添加安全信息类型",
    		"dataobject":"rewardsActivityTypeEntity",
    		"fields":[
	          {name:"activityType", label:"安全信息类型", dataType: "int", type:"select", rule:{required:true}, message:"安全信息类型不能为空",
	        	  option: {
	        		  params: { "dataobject": "activityType" },
	        		  ajax: {
	        			  data: this.proxy(function(term, page){
	        				  return {
	        					  "tokenid": $.cookie("tokenid"),
			        			  "method": "stdcomponent.getbysearch",
			        			  "rule": JSON.stringify([[{"key":"name","op":"like","value":term}]]),
			        			  "start": (page - 1) * this._SELECT2_PAGE_LENGTH,
			        			  "length": this._SELECT2_PAGE_LENGTH,
	        					  "dataobject": "activityType"
	        				  };
	        			  }),
        				  success: this.proxy(function(response, page){
        					  return {
        						  "results": $.grep(response.data.aaData, this.proxy(function(item, idx){
        							  return $.inArray(item.id, this._existActivityTypeArray) === -1;
        						  })),
        						  "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
        					  };
        				  })
	        		  }
	        	  }
	          }
	        ]
    	});
    	this.activityTypeDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.sms.plugin.reward.rewardsAndPenalties.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                               '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.plugin.reward.rewardsAndPenalties.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];