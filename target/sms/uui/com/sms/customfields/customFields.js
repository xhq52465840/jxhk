//@ sourceURL=com.sms.customfields.customFields
$.u.define('com.sms.customfields.customFields', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.customfields.customFields.i18n;
    	
    	this.qid("btn_addfield").click(this.proxy(function(){
    		if(!this.fieldTypeDialog){
        		$.u.load("com.sms.customfields.selectFieldType");
        		this.fieldTypeDialog = new com.sms.customfields.selectFieldType(this.$.find("div[umid=fieldTypeDialog]"));
        		this.fieldTypeDialog.override({
            		refreshDataTable:this.proxy(function(){
            			this.dataTable.fnDraw();
            		})
            	});
        	}
    		this.fieldTypeDialog.open();
    	}));
    	
    	this.qid("btn_seemorefields").click(this.proxy(function(){
    		window.location.href="../upm/Featured.html";
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
                { "title": this.i18n.type ,"mData":"type","sWidth":"20%"},
                { "title": this.i18n.applied ,"mData":"id","sWidth":"20%"},
                { "title": this.i18n.boundary ,"mData":"id","sWidth":"30%"},
                { "title": "" ,"mData":"id","sWidth":20}
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
            		"dataobject":"customField",
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
                        return '<strong>' + full.name + '</strong>' +
                                '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
                       var htmls=["<dl class='apply-context'>"],activityTypeArray={},unitArray={};
                       full.schemes && $.each(full.schemes,function(idx,scheme){
                    	   scheme.activityType && scheme.activityType.length>0 && $.each(scheme.activityType,function(idx,activityType){
                    		   activityTypeArray[activityType.id]=activityType;
                    	   });
                    	   scheme.units && scheme.units.length>0 && $.each(scheme.units,function(idx,unit){
                    		   unitArray[unit.id]=unit;
                    	   });
                       });
                       if(JSON.stringify(activityTypeArray).length>2){
                    	   htmls.push("<dt>"+this.i18n.safeMsgType+"</dt>");
                    	   $.each(activityTypeArray,this.proxy(function(id,activityType){
                    		  htmls.push("<img class='activity-type-icon' src='"+this.getabsurl("../../.."+activityType.url)+"' data='"+JSON.stringify(activityType)+"' style='cursor:pointer;' width='16' height='16'/>&nbsp;"); 
                    	   }));
                       }else{
                    	   htmls.push("<dt>"+this.i18n.safeMsgType+"</dt><dd>"+this.i18n.allType+"</dd>")
                       }
                       if(JSON.stringify(unitArray).length>2){
                    	   htmls.push("<dt>"+this.i18n.SafetyAgencies+"</dt>");
                    	   $.each(unitArray,this.proxy(function(id,unit){
                    		  htmls.push("<dd><a href='../unitconfig/Summary.html?id="+unit.id+"'>"+unit.name+"</a></dd>"); 
                    	   }));
                       }
                       return htmls.join("");
                    })
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                       var htmls=["<ul style='padding-left:15px;'>"];
                       full.screens && $.each(full.screens,function(idx,screen){
                    	  htmls.push("<li><a href='../fieldscreen/ConfigFieldScreen.html?id="+screen.id+"'>"+screen.name+"</a>("+screen.tab+")</li>"); 
                       });
                       htmls.push("</ul>");
                       return htmls.join("");
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": this.proxy(function (data, type, full) {
                        return "<span class='dropdown operate'>" +
                        			"<a href='#' class='dropdown-toggle dropdown-toggle-icon' data-toggle='dropdown'><span class='glyphicon glyphicon-cog'></span><b class='caret'></b></a>"+
                        			"<ul class='dropdown-menu pull-right' >"+
                        				"<li><a href='ConfigureCustomField.html?id="+full.id+"' class='config' data='"+JSON.stringify(full)+"'>" + this.i18n.configButton + "</a></li>"+
                        				"<li><a href='#' class='edit' data='"+JSON.stringify(full)+"'>" + this.i18n.edit + "</a></li>"+
                        				"<li><a href='#' class='delete' data='"+JSON.stringify(full)+"'>" + this.i18n.remove + "</a></li>"+
                        			"</ul>"+
                        	   "</span>";
                    })
                }
            ]
        });
    	
    	// 编辑安全信息类型
    	this.dataTable.off("click","img.activity-type-icon").on("click","img.activity-type-icon",this.proxy(function(e){
    		try{
    			var data = JSON.parse($(e.currentTarget).attr("data"));
    			if(!this.activityTypeDialog){
    	    		$.u.load("com.sms.common.stdComponentOperate");
    	    		this.activityTypeDialog = new com.sms.common.stdComponentOperate($("div[umid='editActivityType']",this.$),{
    	        		"dataobject":"activityType",
    	        		"fields":[
    	    	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:255},
    	    	          {name:"description",label:this.i18n.describute,type:"textarea",maxlength:255},
    	    	          {name:"url",label:this.i18n.icon,type:"text",rule:{required:true},message:this.i18n.iconNotNull,maxlength:255,description:"("+this.i18n.iconDesc+")"}
    	    	        ]
    	        	});
    	    	}
    			this.activityTypeDialog.open({
    				"dataid":data.id,
    				"title":this.i18n.editSafeMsgType+data.name,
    				"afterEdit":this.proxy(function(){
    					window.location.reload();
    				})
    			});
    		}catch(e){
    			throw new Error(this.i18n.editSafeMsgTypeFail+e.message);
    		}
    	}));
    	
    	
    	
    	// 编辑自定义字段
    	this.dataTable.off("click", "a.edit").on("click", "a.edit", this.proxy(function (e) {
        	e.preventDefault();
        	//try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdComponentOperate");
        		this.fieldEditDialog && this.fieldEditDialog.destroy();
        		
        		//初始化“自定义字段编辑”
            	this.fieldEditDialog = new com.sms.common.stdComponentOperate($("div[umid='fieldEditDialog']",this.$),{
            		"dataobject":"customField",
            		"fields":[
        	          {name:"name",label:this.i18n.fieldName,type:"text",rule:{required:true},message:this.i18n.fieldNameNotNull,maxlength:50},
        	          {name:"description",label:this.i18n.describute,type:"textarea","description":""+this.i18n.titleDesc+"<br/> "+this.i18n.explainA+"",maxlength:255},
        	          {name:"config",label:this.i18n.config,type:"textarea",maxlength:255},
        	          {name:"searcher",label:this.i18n.searcher,type:"select",rule:{required:true},message:this.i18n.searcherNotNull,option:{
        	        	  minimumResultsForSearch:-1,
        	        	  ajax:{
        	        	  	data:{"method":"getsearchtemplates"}
        	        	  },
        	        	  data:this.proxy(function(){
        	        		  var result = {};
        	        		  $.ajax({
        	                      url: $.u.config.constant.smsqueryserver,
        	                      dataType: "json",
        	                      cache: false,
        	                      async:false,
        	                      data: {
        		        			 "tokenid":$.cookie("tokenid"),
        		        			 "method":"getsearchtemplates",
        		        			 "key":data.typeKey
        		        		  }
        	                  }).done(this.proxy(function (response) {
        	                      if (response.success) {
        	                          result = {results:response.data};
        	                      }
        	                  }));
        	        		  return result;
        	        	  }),
        	        	  id:function(cate){
        	        		  return cate.key;
        	        	  }
        	          	}
        	          },
        	          {name:"searchable",label:this.i18n.searchable,type:"checkbox"},
        	          {name:"display",label:this.i18n.display,type:"checkbox"}
        	        ]
            	});
            	
            	// 重写“自定义字段编辑”组件的函数
            	this.fieldEditDialog.override({
            		refreshDataTable:this.proxy(function(){
            			this.dataTable.fnDraw();
            		})
            	});
        		this.fieldEditDialog.open({"data":data,"title":this.i18n.editTitle+data.name});
        	/*}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}*/
    	}));
    	
    	// 删除自定义字段
        this.dataTable.off("click", "a.delete").on("click", "a.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var customField = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.affirm+"</p>"+
        				 	"<p><span class='text-danger'>"+this.i18n.notice+"</span>"+this.i18n.noticeDesc+"</p>"+
        				 "</div>",
        			title:this.i18n.removeTitle+customField.name,
        			dataobject:"customField",
        			dataobjectids:JSON.stringify([parseInt(customField.id)])
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


com.sms.customfields.customFields.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                              '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                              "../../../uui/widget/spin/spin.js",
                                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                              "../../../uui/widget/ajax/layoutajax.js"];
com.sms.customfields.customFields.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];