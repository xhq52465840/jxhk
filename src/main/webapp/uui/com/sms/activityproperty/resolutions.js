//@ sourceURL=com.sms.activityproperty.resolutions
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.activityproperty.resolutions', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.activityproperty.resolutions.i18n;
    	// ”添加新的解决结果“按钮
    	this.btn_addresolutions=this.qid("btn_addresolutions");
    	
    	//sequence
    	this.sequence = [];
    	
    	this.defaultValueId="";
    	//用于上下移按钮的展示
    	this.count = 0;
    	
    	// “编辑解决结果”组件
    	this.resolutionsDialogEdit = new com.sms.common.stdComponentOperate($("div[umid='resolutionsDialogEdit']",this.$),{
    		"title":this.i18n.addResult,
    		"dataobject":"activityResolution",
    		"fields":[
		          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
		          {name:"description",label:this.i18n.describe,type:"textarea",maxlength:255}
	        ]
    	});
    	
    	// 重写“编辑解决结果”组件的函数
    	this.resolutionsDialogEdit.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    	
    	
    	//取消默认
    	this.btn_cancel = this.qid("btn_cancel");
    	
    	this.btn_cancel.click(this.proxy(function(e){
    		e.preventDefault();
    		if(!this.defaultValueId){
    			return false;
    		}
        	$.ajax({
                url: $.u.config.constant.smsmodifyserver,
                dataType: "json",
                cache: false,
                data: {
                	"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.update",
            		"dataobject":"activityResolution",
	        		"dataobjectid":this.defaultValueId,
	        		"obj":JSON.stringify({
	        			"defaultValue":false
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
    	
    	// 绑定“添加新的解决结果”按钮事件
    	this.btn_addresolutions.click(this.proxy(function(e){
    		e.preventDefault();
    		if(this.sequence.length==0){
    			this.sequence.push(0);
    		}
    		// “编辑解决结果”组件
    		
    		this.resolutionsDialog && this.resolutionsDialog.destroy();
        	this.resolutionsDialog = new com.sms.common.stdComponentOperate({
        		"title":this.i18n.addResult,
        		"dataobject":"activityResolution",
        		"fields":[
        		  {name:"sequence",type:"hidden",dataType:"int",value:Math.max.apply(Math,this.sequence)+1},       
    	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
    	          {name:"description",label:this.i18n.describe,type:"textarea",maxlength:255}
    	        ]
        	});
        	this.resolutionsDialog.target($("div[umid='resolutionsDialog']",this.$));
        	this.resolutionsDialog.parent(this);
        	// 重写“编辑解决结果”组件的函数
        	this.resolutionsDialog.override({
        		refreshDataTable:this.proxy(function(){
        			this.dataTable.fnDraw();
        		})
        	});
    		this.resolutionsDialog.open();
    	}));
    	

    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.describe ,"mData":"description","sWidth":"40%"},
                { "title": this.i18n.order ,"mData":"id","sWidth":100},
                { "title": this.i18n.handle ,"mData":"id","sWidth":170}
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
            		"dataobject":"activityResolution",
            		//"columns":JSON.stringify(aoData.columns),
            		"search":JSON.stringify(aoData.search),
            		"columns":JSON.stringify([{"data":"sequence"}] ),
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
	                    	if(full.defaultValue==true){
	                    		this.defaultValueId = full.id;
	                    	}
	                    	this.sequence.push(full.sequence);
		                    return  '<strong>' + full.name +(full.defaultValue?'('+this.i18n.approve+')':'')+ '</strong>';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                        return '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	return "<span class='glyphicon glyphicon-arrow-up' style='cursor: pointer;' data-data='"+JSON.stringify(full)+"'></span>&nbsp;<span class='glyphicon glyphicon-arrow-down' style='cursor: pointer;' data-data='"+JSON.stringify(full)+"'></span>";
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	var htmls="";
                    	htmls+="<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.resolutions.i18n.edit+"</button>"+
            			"<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.resolutions.i18n.remove+"</button>";
                    	if(!full.defaultValue){
                    		htmls+="<button class='btn btn-link default' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.resolutions.i18n.approve+"</button>";
                    	}
	                	return htmls;
                    }
                }
            ]
        });
    	
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
	        		"dataobject":"activityResolution",
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
		        		"dataobject":"activityResolution",
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
		        		"dataobject":"activityResolution",
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
    	
    	// 编辑界面
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.resolutionsDialogEdit.open({"data":data,"title":this.i18n.editResult+data.name});
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
        			title:this.i18n.removeResult+data.name,
        			dataobject:"activityResolution",
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


com.sms.activityproperty.resolutions.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',"../../../uui/widget/spin/spin.js"
                                                 , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                                 , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.activityproperty.resolutions.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];