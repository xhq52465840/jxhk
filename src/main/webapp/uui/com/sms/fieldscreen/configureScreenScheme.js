//@ sourceURL=com.sms.fieldscreen.configureScreenScheme
$.u.define('com.sms.fieldscreen.configureScreenScheme', null, {
    init: function (options) {
        this._options = options;
        this.currOperateArray=[];
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.fieldscreen.configureScreenScheme.i18n;
    	/*
    	 * 1.获取id
    	 * 2.根据id找到相关的数据
    	 */
    	
    	//id
    	this.configScreenSchemeId = $.urlParam().id;
    	
		if(!this.configScreenSchemeId){
			window.location.href="ViewFieldScreenSchemes.html";
		}
		
        //显示几个安监机构
        this.units = this.qid("units");
        this.unitsUl = this.qid("units-ul");
        // 绑定方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
    	
    	//显示标题
    	this.configPlan = this.qid("configPlan");
    	
    	this.qid("btn_addActivityOperateScreen").click(this.proxy(function(){
    		if(!this.configureScreenSchemeDialog){
        		$.u.load("com.sms.common.stdComponentOperate");
        		this.configureScreenSchemeDialog = new com.sms.common.stdComponentOperate($("div[umid='configureScreenSchemeDialog']",this.$),{
            		"title":this.i18n.explainB,
            		"dataobject":"fieldScreenSchemeItem",
            		"fields":[
            		  {name:"scheme",label:"",type:"hidden",value:this.configScreenSchemeId,dataType:"int"},
        	          {name:"operation",label:this.i18n.safeHandle,type:"select",rule:{required:true},message:this.i18n.safeHandleNotNull,
            			  option:{
            				  data:this.proxy(function(){
            					  var result = {};
            	        		  $.ajax({
            	                      url: $.u.config.constant.smsqueryserver,
            	                      dataType: "json",
            	                      cache: false,
            	                      async:false,
            	                      data: {
            		        			 "tokenid":$.cookie("tokenid"),
            		        			 "method":"getactivityoperation"
            		        		  }
            	                  }).done(this.proxy(function (response) {
            	                      if (response.success) {
            	                          result = {text:'name',results:$.map(response.data.aaData,this.proxy(function(v,idx){
            	                        	  if($.inArray(v.name,this.currOperateArray)<0) 
            	                        		  return {id:v.key,name:v.name};
            	                          }))};
            	                      }
            	                  })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            	                  }));
            	        		  return result;
            				  })
            			  }},
        	          {name:"screen",label:this.i18n.surface,dataType:"int",type:"select",rule:{required:true},message:this.i18n.surfaceNotNull,
        		          option:{
        	        		  "ajax":{
        	        			  data: this.proxy(function(term,page){
        	        				 return {
        	        					 method:"stdcomponent.getbysearch",
        	        					 dataobject:"fieldScreen",
        	        					 tokenid:$.cookie("tokenid"),
        	        					 rule:JSON.stringify([[{"key":"name","op":"like","value":term}]]),
        	        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
        	        					 length: this._SELECT2_PAGE_LENGTH
        	        				 };
        	        			 })
        	        		  }
        	        	 }
        	          }
        	        ]
            	});
            	this.configureScreenSchemeDialog.override({
            		refreshDataTable:this.proxy(function(){
            			this.dataTable.fnDraw();
            		})
            	});
        	}
    		this.configureScreenSchemeDialog.open();
    	}));
    	
    	
    	
    	
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.msgHandle ,"mData":"operation"},
                { "title": this.i18n.surface ,"mData":"screen","sWidth":"40%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":120}
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
            		"method":"getfieldscreenschemeitems",
            		"scheme":this.configScreenSchemeId
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
                    	this.unitsUl.empty();
                    	data.data.units&&$.each(data.data.units,this.proxy(function(idx,unit){
        					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatarUrl+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo(this.unitsUl);
        				}));
            			this.units.text(data.data.units.length);
                    	this.configPlan.text(data.data["scheme"]);
            			data.data.aaData = data.data.tabs;
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
 				{
				    "aTargets": 0,
				    "mRender": this.proxy(function (data, type, full) {
				    	this.currOperateArray.push(full.operation);
				        return '<strong>' + data + '</strong>' +
                        '<p class="text-muted"><small>' + (full.operationDescription || "") + '</small></p>';
				    })
				},
				{
				    "aTargets": 1,
				    "mRender": function (data, type, full) {
				        return "<a href='ConfigFieldScreen.html?id="+full.screenId+"'>"+data+"</a>";
				    }
				},
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var htmls = "";
                    	htmls += "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.configureScreenScheme.i18n.edit+"</button>";
                    	if(full.operation!=com.sms.fieldscreen.configureScreenScheme.i18n.approve){
                    		htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.configureScreenScheme.i18n.remove+"</button>";
                    	}
                        return htmls;
                    }
                }
            ]
        });
    	
    	// 编辑安全信息操作关联界面
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		data.screen = data.screenId;
        		if(!this.configureScreenSchemeDialogEdit){
            		$.u.load("com.sms.common.stdComponentOperate");
            		this.configureScreenSchemeDialogEdit = new com.sms.common.stdComponentOperate($("div[umid='configureScreenSchemeDialogEdit']",this.$),{
                		"title":this.i18n.editSurface,
                		"dataobject":"fieldScreenSchemeItem",
                		"fields":[
            	          {name:"screen",label:this.i18n.surface,dataType:"int",type:"select",rule:{required:true},message:this.i18n.surfaceNotNull,
            	        	  option:{
            	        		  "params":{dataobject:"fieldScreen"},
            	        		  "ajax":{
            	        			  data: this.proxy(function(term,page){
            	        				 return {
            	        					 method:"stdcomponent.getbysearch",
            	        					 dataobject:"fieldScreen",
            	        					 tokenid:$.cookie("tokenid"),
            	        					 rule:JSON.stringify([[{"key":"name","op":"like","value":term}]]),
            	        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
            	        					 length: this._SELECT2_PAGE_LENGTH
            	        				 };
            	        			 })
            	        		  }
            	        	 }
            	          }
            	        ]
                	});
            		this.configureScreenSchemeDialogEdit.override({
                		refreshDataTable:this.proxy(function(){
                			this.dataTable.fnDraw();
                		})
                	});
            	}
        		this.configureScreenSchemeDialogEdit.open({"data":data,"title":this.i18n.editSurface+":"+data.operation});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 删除安全信息操作关联界面
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	this.i18n.affirm+"<strong>"+data.operation+"</strong>"+this.i18n.relate+"？"+
        				 "</div>",
        			title:this.i18n.removeSafeMsg,
        			dataobject:"fieldScreenSchemeItem",
        			dataobjectids:JSON.stringify([parseInt(data.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.currOperateArray=[];
        				this.dataTable.fnDraw();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.removeFail+e.message);
        	}
        }));
    	
    },
    _toggleScreenScheme:function(e){
    	var $sender = $(e.currentTarget),$prev=$sender.prev();
		$sender.closest("div.unit-config-scheme-item").toggleClass("collapsed");
		if($prev.hasClass("glyphicon-chevron-right")){
			$prev.removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
		}else{
			$prev.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
		}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.fieldscreen.configureScreenScheme.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.fieldscreen.configureScreenScheme.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];