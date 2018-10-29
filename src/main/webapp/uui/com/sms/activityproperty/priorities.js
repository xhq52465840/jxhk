//@ sourceURL=com.sms.activityproperty.priorities
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.activityproperty.priorities', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.activityproperty.priorities.i18n;
    	// ”添加新属性“按钮
    	this.btn_addpriorities=this.qid("btn_addpriorities");
    	
    	this.sequence = [];
    	
    	this.count= 0;
        //绑定“添加新属性”按钮事件
    	this.btn_addpriorities.click(this.proxy(function(e){
    		e.preventDefault();
    		if(this.sequence.length==0){
    			this.sequence.push(0);
    		}
    		// “编辑属性”组件    		
    		this.prioritiesDialog && this.prioritiesDialog.destroy();
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
        	this.prioritiesDialog.target($("div[umid='prioritiesDialog']",this.$));
        	this.prioritiesDialog.parent(this);
        	// 重写“编辑属性”组件的函数
        	this.prioritiesDialog.override({
        		refreshDataTable:this.proxy(function(){
        			this.dataTable.fnDraw();
        		})
        	});
    		this.prioritiesDialog.open();
    	}));
    	
    	// “编辑属性”组件
    	this.prioritiesDialogEdit = new com.sms.common.stdComponentOperate($("div[umid='prioritiesDialogEdit']",this.$),{
    		"title":this.i18n.addAttribute,
    		"dataobject":"activityPriority",
    		"fields":[
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
    	
    	// 重写“编辑属性”组件的函数
    	this.prioritiesDialogEdit.override({
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
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.describe ,"mData":"description","sWidth":"25%"},
                { "title": this.i18n.ico ,"mData":"url","sWidth":"10%"},
                { "title": this.i18n.colour ,"mData":"color","sWidth":"10%"},
                { "title": this.i18n.order ,"mData":"id","sWidth":"10%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":150}
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
            		"dataobject":"activityPriority",
            		"search":JSON.stringify(aoData.search),
            		"columns":JSON.stringify([{"data":"sequence"}]),
            		"order":JSON.stringify([{"column":0,"dir":"asc"}])
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
                    	this.sequence = [];
                    	this.count= data.data.aaData.length;
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "fnRowCallback":this.proxy(function(data,full,current,index){
            	if(index==0){
            		$("span.glyphicon-arrow-up",$(data)).hide();
            	}
            	if(index==999 || index==this.count-1){
            		$("span.glyphicon-arrow-down",$(data)).hide();
            	}
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": this.proxy(function (data, type, full) {
                    	this.sequence.push(full.sequence);
	                    return  '<strong>' + full.name +(full.defaultValue?'('+this.i18n.approve+')':'')+ '</strong>';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                        return data;
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	return '<img src="/sms/uui'+full.url+'" width="16px" height="16px"></img>';
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return '<div style="background:'+data+';width:20px;padding:10px;"></div>'
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                    	return "<span class='glyphicon glyphicon-arrow-up' style='cursor: pointer;' data-data='"+JSON.stringify(full)+"'></span>&nbsp;<span class='glyphicon glyphicon-arrow-down' style='cursor: pointer;' data-data='"+JSON.stringify(full)+"'></span>";
                    }
                },
                {
                    "aTargets": 5,
                    "mRender": function (data, type, full) {
	                	var htmls="";
                    	htmls+="<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.priorities.i18n.edit+"</button>"+
            			"<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.priorities.i18n.remove+"</button>";
                    	if(!full.defaultValue){
                    		htmls+="<button class='btn btn-link default' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.priorities.i18n.approve+"</button>";
                    	}
	                	return htmls;
                    }
                }
            ]
        });
    	
    	// 编辑界面
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.prioritiesDialogEdit.open({"data":data,"title":this.i18n.editAttribute+data.name});
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
        				 "</div>",
        			title:this.i18n.removeAttribute+data.name,
        			dataobject:"activityPriority",
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
    	
       	//默认
    	this.dataTable.off("click", "button.default").on("click", "button.default", this.proxy(function (e) {
        	e.preventDefault();
        	var data = JSON.parse($(e.currentTarget).attr("data"));
        	$.ajax({
	            url: $.u.config.constant.smsmodifyserver,
	            dataType: "json",
	            cache: false,
	            data: {
	            	"tokenid":$.cookie("tokenid"),
	        		"method":"stdcomponent.update",
	        		"dataobject":"activityPriority",
	        		"dataobjectid":data.id,
	        		"obj":JSON.stringify({
	        			"defaultValue":true
	        		})
	            }
	        }).done(this.proxy(function (data) {
	            if (data.success) {
	            	this.dataTable.fnDraw();
	            }
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	        })).complete(this.proxy(function(){
	        }));
    	}));
    	
    	//上移
    	this.dataTable.off("click", "span.glyphicon-arrow-up").on("click", "span.glyphicon-arrow-up", this.proxy(function (e) {
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
        		var $tar = $('span.glyphicon-arrow-down',$(e.currentTarget).parent().parent().prev());
        		var tarData = JSON.parse($tar.attr("data-data"));
		    	$.ajax({
		            url: $.u.config.constant.smsmodifyserver,
		            dataType: "json",
		            cache: false,
		            data: {
		            	"tokenid":$.cookie("tokenid"),
		        		"method":"stdcomponent.updateall",
		        		"dataobject":"activityPriority",
		        		"objs":JSON.stringify([{
		        			"id":data.id,
		        			"sequence":tarData.sequence
		        		},{
		        			"id":tarData.id,
		        			"sequence":data.sequence
		        		}])
		            }
		        }).done(this.proxy(function (data) {
		            if (data.success) {
		            	this.dataTable.fnDraw();
		            }
		        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
		
		        })).complete(this.proxy(function(){
		        }));
        	}catch(e){
        		throw new Error(this.i18n.upFail+e.message);
        	}
    	}));
    	
    	//下移
    	this.dataTable.off("click", "span.glyphicon-arrow-down").on("click", "span.glyphicon-arrow-down", this.proxy(function (e) {
           	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
        		var $tar = $('span.glyphicon-arrow-up',$(e.currentTarget).parent().parent().next());
        		var tarData = JSON.parse($tar.attr("data-data"));
		    	$.ajax({
		            url: $.u.config.constant.smsmodifyserver,
		            dataType: "json",
		            cache: false,
		            data: {
		            	"tokenid":$.cookie("tokenid"),
		        		"method":"stdcomponent.updateall",
		        		"dataobject":"activityPriority",
		        		"objs":JSON.stringify([{
		        			"id":data.id,
		        			"sequence":tarData.sequence
		        		},{
		        			"id":tarData.id,
		        			"sequence":data.sequence
		        		}])
		            }
		        }).done(this.proxy(function (data) {
		            if (data.success) {
		            	this.dataTable.fnDraw();
		            }
		        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
		
		        })).complete(this.proxy(function(){
		        }));
        	}catch(e){
        		throw new Error(this.i18n.downFail+e.message);
        	}
    	}));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.activityproperty.priorities.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',"../../../uui/widget/spin/spin.js"
                                                , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                                , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.activityproperty.priorities.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];