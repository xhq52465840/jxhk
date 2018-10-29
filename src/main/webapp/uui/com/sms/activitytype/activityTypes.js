//@ sourceURL=com.sms.activitytype.activityTypes
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.activitytype.activityTypes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.activitytype.activityTypes.i18n;
    	// ”添加安全信息类型“按钮
    	this.btnAddActivityType=this.qid("btn_addActivityType");
    	
    	// 绑定“添加安全信息类型”按钮事件
    	this.btnAddActivityType.click(this.proxy(function(){
    		this.activityTypeDialog.open();
    	}));
    	
    	// “编辑界面”组件
    	this.activityTypeDialog = new com.sms.common.stdComponentOperate($("div[umid='activityTypeDialog']",this.$),{
    		"title":this.i18n.title,
    		"dataobject":"activityType",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:255},
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
	          }}
	        ]
    	});
    	
    	// 重写“编辑界面”组件的函数
    	this.activityTypeDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name",orderable:true},
                { "title": this.i18n.relateScheme ,"mData":"schemes","sWidth":"40%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":100}
            ],
            "aaData":[

            ],
            "oLanguage": { //语言
                "sSearch": this.i18n.search,
                "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                "sZeroRecords": this.i18n.message,
                "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                "sInfoEmpty": this.i18n.withoutData,
                "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                "sProcessing": ""+this.i18n.searching+"...",
                "oPaginate": {
                    "sFirst": "<<",
                    "sPrevious": this.i18n.back,
                    "sNext": this.i18n.next,
                    "sLast": ">>"
                }
            },
            "fnServerParams": this.proxy(function (aoData) {
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"activityType",
            		"columns":JSON.stringify(aoData.columns),
            		"search":JSON.stringify(aoData.search)
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
	                    if(full.url){    
	                    	return  '<img  src="/sms/uui'+full.url+'" width="16px" height="16px" style="margin-right:5px;"/>'+  
	                        		'<strong>' + full.name + '</strong>' +
	                                '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
	                    }else{
	                    	return '';
	                    }
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full.schemes && $.each(full.schemes,function(idx,scheme){
                			htmls.push("<li><a href='ViewActivityTypeSchemes.html'>"+scheme.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.activitytype.activityTypes.i18n.edit+"</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.activitytype.activityTypes.i18n.remove+"</button>";
                    }
                }
            ]
        });
    	
    	// 编辑界面
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.activityTypeDialog.open({"data":data,"title":this.i18n.editSafeMsg+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 删除界面
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.confirm+"</p>"+
        				 	"<p><span class='text-danger'>"+this.i18n.notice+"</span>"+this.i18n.explain+"</p>"+
        				 "</div>",
        			title:this.i18n.removeSafeMsg+data.name,
        			dataobject:"activityType",
        			dataobjectids:JSON.stringify([parseInt(data.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.dataTable.fnDraw();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.removeFail+e.message);
        	}
        }));
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.activitytype.activityTypes.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.activitytype.activityTypes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];