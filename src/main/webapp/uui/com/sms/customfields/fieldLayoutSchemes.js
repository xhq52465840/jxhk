//@ sourceURL=com.sms.customfields.fieldLayoutSchemes
$.u.define('com.sms.customfields.fieldLayoutSchemes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.customfields.fieldLayoutSchemes.i18n;
    	
    	this.qid("btn_addFieldConfigScheme").click(this.proxy(function(){
    		if(!this.fieldLayoutSchemeDialog){
    			this.fieldLayoutSchemeDialog = this.getFieldLayoutScheme();
    		}
    		this.fieldLayoutSchemeDialog.open();
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
                { "title": this.i18n.SafetyAgencies ,"mData":"units","sWidth":"40%"},
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
            		"dataobject":"fieldLayoutScheme",
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
                                '<p class="text-muted"><small>' + full.description + '</small></p>';
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full.units && $.each(full.units,function(idx,unit){
                			htmls.push("<li><a href='../unitconfig/Summary.html?id="+unit.id+"'>"+unit.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var sendData  = JSON.stringify(full);
                    	sendData = sendData.replace(/'/g,"");
                    	var htmls = "";
                    	htmls+= "<a class='btn btn-link config' href='../customfields/ConfigureFieldLayoutScheme.html?id=" + full.id + "' >"+com.sms.customfields.fieldLayoutSchemes.i18n.config+"</a>"+
	                 	   "<button class='btn btn-link copy' data='"+sendData+"'>"+com.sms.customfields.fieldLayoutSchemes.i18n.copy+"</button>"+
	                	   "<button class='btn btn-link edit' data='"+sendData+"'>"+com.sms.customfields.fieldLayoutSchemes.i18n.edit+"</button>";
                    	if(full.type!="default"){
                    		htmls+="<button class='btn btn-link delete' data='"+sendData+"'>"+com.sms.customfields.fieldLayoutSchemes.i18n.remove+"</button>";
                    	}
                        return htmls;
                    }
                }
            ]
        });
    	
    	
    	//复制
    	this.dataTable.off("click", "button.copy").on("click", "button.copy", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.fieldLayoutSchemeDialog){
        			this.fieldLayoutSchemeDialog = this.getFieldLayoutScheme();
        		}
        		this.fieldLayoutSchemeDialog.open({"data":data,"title":this.i18n.copyField+data.name,"operate":"COPY",method:"copyfieldlayoutscheme"});
        	}catch(e){
        		throw new Error(this.i18n.copyFail+e.message);
        	}
    	}));
    	
    	// 编辑字段配置方案
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.fieldLayoutSchemeDialog){
        			this.fieldLayoutSchemeDialog = this.getFieldLayoutScheme();
        		}
        		this.fieldLayoutSchemeDialog.open({"data":data,"title":this.i18n.editField+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	
    	
    	// 删除字段配置方案
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<div class='alert alert-warning' role='alert'><span class='glyphicon glyphicon-warning-sign'></span>"+this.i18n.affirm+"<strong>"+data.name+"</strong>?</div>"+
        				 "</div>",
        			title:this.i18n.removeField,
        			dataobject:"fieldLayoutScheme",
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
    getFieldLayoutScheme: function(){
		var clz = $.u.load("com.sms.common.stdComponentOperate");
		var module = new clz($("div[umid='fieldLayoutSchemeDialog']", this.$),{
    		"title": this.i18n.addFieleConfig,
    		"dataobject": "fieldLayoutScheme",
    		"fields": [
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


com.sms.customfields.fieldLayoutSchemes.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',"../../../uui/widget/spin/spin.js"
                                                    , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                                    , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.customfields.fieldLayoutSchemes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];