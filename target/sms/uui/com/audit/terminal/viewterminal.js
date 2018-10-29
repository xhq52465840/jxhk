//@ sourceURL=com.audit.terminal.viewterminal
$.u.define('com.audit.terminal.viewterminal', null, {
    init: function (options) {
        this._options = options;
        
        
        this.i18n=  {
        	title:'航站管理',
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
        	removeDictionary : '删除航站项',
        	notice : '',
        	choose : '请确认你要删除这个航站项。',
        	editFail : '编辑操作失败',
        	editDictionary : '编辑字典项',
        	searchButton: '搜索',
        	resetButton: '清除筛选'
        };
        this.enums=[{name:"国内",value:"1"},
        			{name:"国际",value:"2"}
        			 ];
    },
    afterrender: function (bodystr) {
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            dom: "tip",
            "columns": [
                { "title": "序号" ,"mData":"num","sWidth":"10%"},
                { "title": "归属地" ,"mData":"attribution","sWidth":"15%"},
                { "title": "城市" ,"mData":"city","sWidth":"15%"},
                { "title": "机场" ,"mData":"airport","sWidth":"15%"},
                { "title": "三字码","mData":"iatacode","sWidth":100, "orderable": false},
                { "title": "国内/国际" ,"mData":"type","sWidth":"15%"},
                { "title": "操作" ,"mData":"type","sWidth":"15%"}
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
            	var rule = [];
            	if($("[name=attribution]").val()){
            		rule.push([{"key":"attribution", "op":"like","value":$("[name=attribution]").val()}]);
            	}
            	if($("[name=city]").val()){
            		rule.push([{"key":"city", "op":"like","value":$("[name=city]").val()}]);
            	}
            	if($("[name=airport]").val()){
            		rule.push([{"key":"airport","op":"like","value":$("[name=airport]").val()}]);
            	}
            	if($("[name=iatacode]").val()){
            		var val=$("[name=iatacode]").val();
            		if (/^[a-z]+$/.test( val )){
            			val=val.toUpperCase();
            		}   
            		rule.push([{"key":"iatacode", "op":"like","value":val}]);
            	}
               // aoData.columns.push({"data":"created"});
               // aoData.order.push({"column":aoData.columns.length - 1, "dir": "desc"});
                // aoData.order.splice(0, 0, {"column":aoData.columns.length - 1, "dir": "desc"});
       
            	//"columns":JSON.stringify([{"data":"num"}]),
            	//"order":JSON.stringify([{"column":0,"dir":"asc"}])
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "stdcomponent.getbysearch",
            		"dataobject": "terminal",
            		"columns":JSON.stringify([{"data":"num"}]),
            		"order":JSON.stringify([{"column":0,"dir":"asc"}]),
            		"rule": JSON.stringify(rule)
            	},true);
                delete aoData.search;
            
                delete aoData.draw;
               
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
	                 "aTargets": 5,
	                 "mRender": function (data, type, full) {
	                	 var redata="国内";
	                	 if(data=="2"){
	                		 redata="国际";
	                	 }
	                	 return redata
	                 }
	             },           
                {
                    "aTargets": 6,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>删除</button>";
                    }
                }
            ]
        });
    	
    	this.qid("btn_addDictionary").click(this.proxy(this.on_addDictionary_click));
    	this.qid("btn_filter").click(this.proxy(this.on_filter_click));
    	this.qid("btn_resetfilter").click(this.proxy(this.on_reset_click));
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(this.on_editDictionary_click));
    	this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(this.on_removeDictionary_click));
    	
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
    	$("[name=attribution]").val("");
    	$("[name=city]").val("");
    	$("[name=airport]").val("");
    	$("[name=iatacode]").val("");
    	this.dataTable.fnDraw(false);
    },
    /**
     * @title 添加字典
     * @param e {object}
     * @return void
     */
    on_addDictionary_click:function(e){
    	if(this.terminalDialog == null){
    		//this._initDictionaryDialog();
    		this._addTerminalDialog();
    	}
    	this.terminalDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw(true);
    		})
    	});
    	this.terminalDialog.open();
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
    		if(this.terminalDialog == null){
        		this._addTerminalDialog();
        	}
    		this.terminalDialog.override({
        		refreshDataTable:this.proxy(function(){
        			this.dataTable.fnDraw(true);
        		})
        	});
    		this.terminalDialog.open({"data":data,"title":"编辑航站项："+data.attribution});
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
    			title:""+this.i18n.removeDictionary+"："+data.attribution,
    			dataobject:"terminal",
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
    /**
     * @title 初始化字典组件
     * @return void
     */
    _initDictionaryDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.dictionaryDialog = new com.sms.common.stdComponentOperate($("div[umid='dictionaryDialog']",this.$),{
    		"title":com.sms.system.dictionary.i18n.addDictionary,
    		"dataobject":"dictionary",
    		"fields":[
	          {name:"name", maxlength:50, label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull},
	          {name:"value", maxlength:50, label:this.i18n.value,type:"text",rule:{required:true},message:this.i18n.valueNotNull},
	          {name:"type", maxlength:10, label:this.i18n.type,type:"text",rule:{required:true},message:this.i18n.typeNotNull},
	          {name:"key", maxlength:50, label:this.i18n.key,type:"text",rule:{required:true},message:this.i18n.keyNotNull}
	        ]
    	});
    	
    },
    
    
    _addTerminalDialog:function(){
    	$.u.load("com.sms.common.stdComponentOperate");
    	this.terminalDialog = new com.sms.common.stdComponentOperate($("div[umid='terminalDialog']",this.$),{
    		"title":"新建航站项",
    		"dataobject":"terminal",
    		"fields":[
    		   {name:"num", maxlength:50, label:"序号",type:"text"/*,description:"为此过滤器输入一个名称"*/,rule:{required:true},message:"不能为空"/*,dataType:"int"*/},
	          {name:"attribution", maxlength:50, label:"归属地",type:"text",rule:{required:true},message:"不能为空"/*,"value":"4444"*/},
	          {name:"city", maxlength:50, label:"城市",type:"text",rule:{required:true},message:"不能为空"/*,dataType:"int"*/},
	          {name:"airport", maxlength:10, label:"机场",type:"text",rule:{required:true},message:"不能为空"/*,dataType:"string"*/},
	          {name:"iatacode", maxlength:50, label:"三字码",type:"text",rule:{required:true},message:"不能为空"},
	          {name:"type", maxlength:50, label:"国内/国际",type:"enum",rule:{required:true},message:"不能为空",enums:this.enums}

	        ]
    	});
    	
    },
    _createDialog : function(){
	    this.primaryDialog= this.qid("primaryDialog").removeClass("hidden").dialog({
	    	title:"新建",
	        width:840,
	        modal: true,
	        draggable: false,
	        resizable: false,
	        autoOpen: false,
	        buttons:[{
				  "text":"保存",
				  "class":"btn-block",
				  "click":this.proxy(this.on_addDialog_save)
			  },
	   		  {
	   			  "text":"取消",
	   			  "class":"aui-button-link",
	   			  "click":this.proxy(this.on_primaryDialog_cancel)
	   		  }
	   		],
	        close: this.proxy(this.on_primaryDialog_close),
	        open: this.proxy(this.on_primaryDialog_open)
	    });
    
    },
    
   eew :function(){
	   this.prioritiesDialog = new com.sms.common.stdComponentOperate({
			"title":this.i18n.addAttribute,
			"dataobject":"activityPriority",
			"fields":[
			  {name:"sequence",type:"hidden",dataType:"int",value:Math.max.apply(Math,this.sequence)+1},       
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
	          {name:"description",label:this.i18n.describe,type:"textarea",maxlength:255},
	          {name:"url",label:this.i18n.icon,type:"select",rule:{required:true},message:this.i18n.iconNotNull,option:{
	        	  data:[
	        	        {"id":"/img/icons/blocker.png","name":"/img/icons/blocker.png"},
	        	        {"id":"/img/icons/bug.png","name":"/img/icons/bug.png"},
	        	        {"id":"/img/icons/critical.png","name":"/img/icons/critical.png"},
	        	        {"id":"/img/icons/ico_epic.png","name":"/img/icons/ico_epic.png"},
	        	        {"id":"/img/icons/ico_story.png","name":"/img/icons/ico_story.png"},
	        	        {"id":"/img/icons/major.png","name":"/img/icons/major.png"},
	        	        {"id":"/img/icons/minor.png","name":"/img/icons/minor.png"},
	        	        {"id":"/img/icons/newfeature.png","name":"/img/icons/newfeature.png"},
	        	        {"id":"/img/icons/trivial.png","name":"/img/icons/trivial.png"}
	        	  ],
	        	  minimumResultsForSearch:-1,
	        	  formatResult:function(item){
	        		  return "<img style='margin-right:5px;width:16px;height:16px;' src='/sms/uui"+item.name+"' />"+item.name;
	        	  },
	        	  formatSelection:function(item){
	        		  return "<img style='margin-right:5px;width:16px;height:16px;' src='/sms/uui"+item.name+"' />"+item.name;
	        	  }
	          }},
	          {name:"color",label:this.i18n.priorityColor,type:"colorpicker",rule:{required:true},message:this.i18n.priorityColorNotNull}
	        ]
		});
   } ,
	
    
    
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });


com.audit.terminal.viewterminal.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.audit.terminal.viewterminal.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];