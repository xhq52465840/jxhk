//@ sourceURL=com.sms.fieldscreen.activityTypeScreenSchemes
$.u.define('com.sms.fieldscreen.activityTypeScreenSchemes', null, {
    init: function (options) {
        this._options = options;
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.fieldscreen.activityTypeScreenSchemes.i18n;
    	
    	this.qid("btn_addActivityTypeScreenScheme").click(this.proxy(function(){
    		if(!this.activityTypeScreenSchemeDialog){
        		$.u.load("com.sms.common.stdComponentOperate");
        		this.activityTypeScreenSchemeDialog = new com.sms.common.stdComponentOperate($("div[umid='activityTypeScreenSchemeDialog']",this.$),{
            		"title":this.i18n.addTitle,
            		"dataobject":"activityTypeFieldScreenScheme",
            		"fields":[
        	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
        	          {name:"description",label:this.i18n.describute,type:"textarea",maxlength:255},
        	          {name:"defaultFieldScreenScheme",label:this.i18n.defaultCase,dataType:"int",type:"select",rule:{required:true},message:this.i18n.defaultCaseNotNull,
        		          option:{
        	        		  "ajax":{
        	        			  data: this.proxy(function(term,page){
        	        				 return {
        	        					 method: "stdcomponent.getbysearch",
        	        					 dataobject: "fieldScreenScheme",
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
        		this.activityTypeScreenSchemeDialog.override({
            		refreshDataTable:this.proxy(function(){
            			this.dataTable.fnDraw();
            		})
            	});
        	}
    		this.activityTypeScreenSchemeDialog.open();
    	}));
    	
    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.safeAgency ,"mData":"units","sWidth":"45%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":170}
            ],
            "aaData":[
                      {id:0,name:"默认安全信息类型界面方案",description:"默认安全信息类型界面方案。",units:[{id:0,name:"上海吉祥航空安监部"}]}
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
            		"dataobject":"activityTypeFieldScreenScheme",
            		"search":JSON.stringify(aoData.search),
            		"columns":JSON.stringify([{"data":"type"}]),
            		"order":JSON.stringify([{"column":0,"dir":"desc"}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    cache: false,
                    data: aoData
                },this.qid("datatable"), {size:2, backgroundColor:"#fff"}).done(this.proxy(function (data) {
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
                                '<p class="text-muted"><small>' + (full.description || "") + '</small></p>';
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full.units&&$.each(full.units,function(idx,unit){
                			htmls.push("<li><a href='../unitconfig/Summary.html?id="+unit.id+"'>"+unit.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var htmls = "";
                    	htmls+="<a href='../fieldscreen/ConfigureActivityTypeScreenScheme.html?id="+full.id+"' class='btn btn-link config' style='padding-top: 2px;' >"+com.sms.fieldscreen.activityTypeScreenSchemes.i18n.config+"</a>"+
		              	   "<button class='btn btn-link copy' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.activityTypeScreenSchemes.i18n.copy+"</button>"+
		             	   "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.activityTypeScreenSchemes.i18n.edit+"</button>";
                    	if(full.type!="default"){
                    		htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.activityTypeScreenSchemes.i18n.remove+"</button>";
                    	}
	                	return htmls;
                    }
                }
            ]
        });
    	
    	
    	// 编辑界面方案
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.activityTypeScreenSchemeDialogEdit){
        			this.activityTypeScreenSchemeDialogEdit = this.getActivityTypeScreenDialogEdit();
        		}
        		this.activityTypeScreenSchemeDialogEdit.open({"data":data,"title":this.i18n.editField+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 复制界面方案
    	this.dataTable.off("click", "button.copy").on("click", "button.copy", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.activityTypeScreenSchemeDialogEdit){
        			this.activityTypeScreenSchemeDialogEdit = this.getActivityTypeScreenDialogEdit();
        		}
        		this.activityTypeScreenSchemeDialogEdit.open({"data":data,"title":this.i18n.copyField+data.name,"operate":"COPY",method:"copyactivitytypefieldscreenscheme"});
        	}catch(e){
        		throw new Error(this.i18n.copyFail+e.message);
        	}
    	}));
    	
    	// 删除界面方案
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        					"<p>"+this.i18n.affirm+"<strong>"+data.name+"</strong>?</p>"+
        				 "</div>",
        			title:this.i18n.removeField,
        			dataobject:"activityTypeFieldScreenScheme",
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
    getActivityTypeScreenDialogEdit: function(){
		var clz = $.u.load("com.sms.common.stdComponentOperate");
		var module = new clz($("div[umid='activityTypeScreenSchemeDialogEdit']",this.$),{
    		"title":this.i18n.addTitle,
    		"dataobject":"activityTypeFieldScreenScheme",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
	          {name:"description",label:this.i18n.describute,type:"textarea",maxlength:255}
	        ]
    	});
    	module.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    	return module;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.fieldscreen.activityTypeScreenSchemes.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.fieldscreen.activityTypeScreenSchemes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];