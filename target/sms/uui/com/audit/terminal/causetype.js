//@ sourceURL=com.audit.terminal.causetype
$.u.define('com.audit.terminal.causetype', null, {
    init: function (options) {
        this._options = options;
        this.i18n=  {
        	title:'原因分类',
        	filterTitle:'筛选字段',
        	addDictionary: '添加字典项',
            name: '名称',
            key:'key',
            nameNotNull : '名称不能为空',
            keyNotNull : 'key不能为空',
            value : '值',
        	valueNotNull : '值不能为空',
            type : '类型',
        	typeNotNull : '类型不能为空',
        	handle : '操作',
        	search : '搜索:',
        	everPage : '每页显示',
        	record : '条记录',
        	message : '抱歉未找到记录',
        	from : '从',
        	to : '到',
        	all : '共',
        	allData : '条数据',
        	withoutData : '没有数据',
        	fromAll : '从总共',
        	filterRecord : '条记录中过滤',
        	searching : '检索中',
        	back : '上一页',
        	next : '下一页',
        	editing : '编辑',
        	remove : '删除',
        	removeFail : '删除操作失败',
        	removeDictionary : '删除该字典项',
        	notice : '',
        	choose : '请确认你要删除这条字典项。',
        	editFail : '编辑操作失败',
        	editDictionary : '编辑字典项',
        	searchButton: '搜索',
        	resetButton: '清除筛选'
        };
    },
    afterrender: function (bodystr) {
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            dom: "tip",
            "columns": [
                { "title": "名称" ,"mData":"name","sWidth":"10%"},
                { "title": "详细描述" ,"mData":"description","sWidth":""},
                { "title": "操作" ,"mData":"id","sWidth":"10%"}
            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+"_MENU_"+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+"_TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": ""+this.i18n.back+"",
                    "sNext": ""+this.i18n.next+"",
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "auditReason"
            	},true);
                delete aoData.search;
                delete aoData.draw;
                delete aoData.columns;
                delete aoData.order;
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type:"post",
                    cache: false,
                    data: aoData
                }).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
	             {
	                 "aTargets": 1,
	                 "mRender": function (data, type, full) {
	                	 return data||""
	                 }
	             },           
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>删除</button>";
                    }
                }
            ]
        });
    	this.qid("btn_addDictionary").click(this.proxy(this.on_addDictionary_click));//新增
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editDictionary_click));
    	this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeDictionary_click));
    	
    },
  
    /**
     * @title 添加字典
     * @param e {object}
     * @return void
     */
    on_addDictionary_click:function(e){
    	if(this.reasonDialog == null){
    		this._addReasonDialog();
    	}
    	this.reasonDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw(true);
    		})
    	});
    	this.reasonDialog.open();
    },
    /**
     * @title 编辑字典
     * @param e {object} 鼠标对象
     * @return void
     */
    on_editDictionary_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		if(this.reasonDialog == null){
        		this._addReasonDialog();
        	}
    		this.reasonDialog.override({
        		refreshDataTable:this.proxy(function(){
        			this.dataTable.fnDraw(true);
        		})
        	});
    		this.reasonDialog.open({"data":data,"title":"编辑原因："+data.name});
    	}catch(e){
    		throw new Error("on_editDictionary_click："+e.message);
    	}
    },
    /**
     * @title 删除字典
     * @param e {object} 鼠标对象
     * @return void
     */
    on_removeDictionary_click:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		$.u.load("com.sms.common.stdcomponentdelete");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>"+this.i18n.choose+"</p>"+
    				 	"<p><span class='text-danger'>"+this.i18n.notice+"</span></p>"+
    				 "</div>",
    			title:""+this.i18n.removeDictionary+"："+data.name,
    			dataobject:"auditReason",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				if(this.dataTable){
    					if(this.dataTable.fnGetData().length > 1 ){//fnGetData()得到页面中所有对象
    						this.dataTable.fnDraw(true);
    					}else{
    						this.dataTable.fnDraw();
    					}
    				}
    			})
    		});
    	}catch(e){
    		throw new Error(""+this.i18n.removeFail+"："+e.message);
    	}
    },
    
    _addReasonDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.reasonDialog = new com.sms.common.stdComponentOperate($("div[umid='reasonDialog']",this.$),{
    		"title":"新建字典项",
    		"dataobject":"auditReason",
    		"fields":[
    		   {name:"name", maxlength:50, label:"名称",type:"text",rule:{required:true},message:"不能为空"},
	           {name:"description", maxlength:2000, label:"详细描述",type:"textarea",rule:{required:true},message:"不能为空"}
	        ]
    	});
    	
    },
    
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.audit.terminal.causetype.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                         '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.terminal.causetype.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                          { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];


