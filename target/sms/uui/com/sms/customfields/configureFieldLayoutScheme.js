//@ sourceURL=com.sms.customfields.configureFieldLayoutScheme
$.u.define('com.sms.customfields.configureFieldLayoutScheme', null, {
    init: function (options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function (bodystr) {
    	var id = $.urlParam().id;
		if(!id){
			window.location.href="ViewFieldLayoutSchemes.html";
		}

    	this.i18n = com.sms.customfields.configureFieldLayoutScheme.i18n;
    	this.activityTypeArray = [];
    	this.config_h2 = this.qid("config_h2");
        this.units = this.qid("units");
        this.unitsUl = this.qid("units-ul");
        this.btnAddActivityTypeFieldLayout=this.qid("btn_addActivityTypeFieldLayout");

        this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
    	this.btnAddActivityTypeFieldLayout.click(this.proxy(function(){
    		if(!this.configureFieldLayoutSchemeDialog){
        		$.u.load("com.sms.common.stdComponentOperate");
        		this.configureFieldLayoutSchemeDialog = new com.sms.common.stdComponentOperate($("div[umid='configureFieldLayoutSchemeDialog']",this.$),{
            		"title":this.i18n.addSafeMsgConfig,
            		"dataobject":"fieldLayoutSchemeEntity",
            		"fields":[
        	          {name:"type",label:this.i18n.safeType,dataType:"int",type:"select",rule:{required:true},message:this.i18n.safeTypeDesc,
        	        	  option:{
        	        		  ajax:{
        	        			  data: this.proxy(function(term,page){
    		        				 return {
    		        					 method: "stdcomponent.getbysearch",
    		        					 dataobject: "activityType",
    		        					 tokenid: $.cookie("tokenid"),
    		        					 rule: JSON.stringify([[{"key":"name","op":"like","value":term}]]),
    		        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
    		        					 length: this._SELECT2_PAGE_LENGTH
    		        				 };
        	        			  }),
        	        			  success: this.proxy(function(response,page){
	        			        	  return {
	        			        		  results: $.grep(response.data.aaData,this.proxy(function(item,idx){
	        			        			  return $.inArray(item.id,this.activityTypeArray) < 0;
	        			        		  })),
	        			        		  more: (page * this._SELECT2_PAGE_LENGTH) < response.data.iTotalRecords
	        			        	  };
        	        			  })
        		        	  }
        	        	 }
        	          },
        	          {name:"layout",label:this.i18n.fieldConfig,dataType:"int",type:"select",rule:{required:true},message:this.i18n.fieldConfigMsg,
        		          option:{
        	        		  "ajax":{
        	        			  data: this.proxy(function(term,page){
        	        				 return {
        	        					 method:"stdcomponent.getbysearch",
        	        					 dataobject:"fieldLayout",
        	        					 tokenid:$.cookie("tokenid"),
        	        					 rule:JSON.stringify([[{"key":"name","op":"like","value":term}]]),
    		        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
    		        					 length: this._SELECT2_PAGE_LENGTH
        	        				 };
        	        			  })
        	        		  }
        	        	 }
        	          },
        	          {name:"scheme",label:"",type:"hidden",value:id,dataType:"int"}
        	        ]
            	});
        		this.configureFieldLayoutSchemeDialog.override({
            		refreshDataTable:this.proxy(function(){
            			this.dataTable.fnDraw();
            		})
            	});
        	}
    		this.configureFieldLayoutSchemeDialog.open();
    	}));
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength: 1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.safeType ,"mData":"type"},
                { "title": this.i18n.fieldConfig ,"mData":"layout","sWidth":"30%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":120}
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
            		"method":"getfieldlayoutschemeentities",
            		"scheme":id
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
            			this.config_h2.text(this.i18n.title+data.data["layout"]);
            			data.data.aaData = data.data.entities; 
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
                        this.activityTypeArray.push(full.typeId);
                        var typeurl = full.typeUrl?'<img src="/sms/uui'+full.typeUrl+'"/>':"";
                        return typeurl +
                        		'<strong>' + data + '</strong>' +
                                '<p class="text-muted"><small>' + full.typeDescription + '</small></p>';
                    })
                },{
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                        return "<a href='ConfigureFieldLayout.html?id="+full.layoutId+"'>"+data+"</a>";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var htmls = ""
                    	htmls +=	"<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.customfields.configureFieldLayoutScheme.i18n.edit+"</button>";
                    	if(full.type!=com.sms.customfields.configureFieldLayoutScheme.i18n.approve){
                    		htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.customfields.configureFieldLayoutScheme.i18n.remove+"</button>";
                    	}
                        return htmls;
                    }
                }
            ]
        });
    	
    	// 编辑安全信息类型关联字段配置方案
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		data.layout = data.layoutId;
        		if(!this.configureFieldLayoutSchemeDialogEdit){
            		$.u.load("com.sms.common.stdComponentOperate");
            		this.configureFieldLayoutSchemeDialogEdit = new com.sms.common.stdComponentOperate($("div[umid='configureFieldLayoutSchemeDialogEdit']",this.$),{
                		"title":this.i18n.editSafeMsgConfig,
                		"dataobject":"fieldLayoutSchemeEntity",
                		"fields":[
            	          {name:"layout",label:this.i18n.fieldConfig,dataType:"int",type:"select",rule:{required:true},message:this.i18n.fieldConfigMsg,
            		          option:{
            		        	  "params":{dataobject:"fieldLayout"},
            	        		  "ajax":{
            	        			  data: this.proxy(function(term,page){
            	        				 return {
            	        					 method: "stdcomponent.getbysearch",
            	        					 dataobject: "fieldLayout",
            	        					 tokenid: $.cookie("tokenid"),
            	        					 rule: JSON.stringify([[{"key":"name","op":"like","value":term}]]),
        		        					 start: (page - 1) * this._SELECT2_PAGE_LENGTH,
        		        					 length: this._SELECT2_PAGE_LENGTH
            	        				 };
            	        			  })
            	        		  }
            	        	 }
            	          }
            	        ]
                	});
            		this.configureFieldLayoutSchemeDialogEdit.override({
                		refreshDataTable:this.proxy(function(){
                			this.dataTable.fnDraw();
                		})
                	});
            	}
        		this.configureFieldLayoutSchemeDialogEdit.open({"data":data,"title":this.i18n.editSafeMsgConfig+data.type});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 删除安全信息类型关联字段配置方案
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	this.i18n.affirm+"<strong>"+data.type+"</strong>"+this.i18n.relate+"？"+
        				 "</div>",
        			title:this.i18n.removeFiledConfig,
        			dataobject:"fieldLayoutSchemeEntity",
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


com.sms.customfields.configureFieldLayoutScheme.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.customfields.configureFieldLayoutScheme.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];