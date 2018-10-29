//@ sourceURL=com.sms.customfields.fieldLayouts
$.u.define('com.sms.customfields.fieldLayouts', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.customfields.fieldLayouts.i18n;
    	// ”添加字段配置“按钮
    	this.btnAddFieldConfig=this.qid("btn_addFieldConfiguration");
    	
    	// 绑定“添加字段配置”按钮事件
    	this.btnAddFieldConfig.click(this.proxy(function(){ 
    		if(!this.fieldLayoutDialog){
    			this.fieldLayoutDialog = this.getFieldLayoutDialog();
    		}
    		this.fieldLayoutDialog.open();
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
                { "title": this.i18n.explainC ,"mData":"schemes","sWidth":"40%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":150}
            ],
            "aaData":[
                      {id:0,name:"默认字段配置",description:"默认字段配置",schemes:[{id:0,name:"默认字段配置方案"}]}
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
            		"dataobject":"fieldLayout",
            		//"columns":JSON.stringify(aoData.columns),
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
                		full.schemes && $.each(full.schemes,function(idx,scheme){
                			htmls.push("<li><a href='ConfigureFieldLayoutScheme.html?id="+scheme.id+"'>"+scheme.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var htmls = "";
                    	htmls+="<a class='btn btn-link config' href='../customfields/ConfigureFieldLayout.html?id=" + full.id + "' >"+com.sms.customfields.fieldLayouts.i18n.config+"</a>"+
                 	   "<button class='btn btn-link copy' data='"+JSON.stringify(full)+"'>"+com.sms.customfields.fieldLayouts.i18n.copy+"</button>";
                    	if(full.type!="default"){
                    		htmls+="<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.customfields.fieldLayouts.i18n.edit+"</button>";
                    	}
                    	if(!full.schemes){
                    		htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.customfields.fieldLayouts.i18n.remove+"</button>";
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
        		if(!this.fieldLayoutDialog){
        			this.fieldLayoutDialog = this.getFieldLayoutDialog();
        		}
        		this.fieldLayoutDialog.open({"data":data,"title":this.i18n.copyFieldFail+data.name,"operate":"COPY",method:"copyfieldlayout"});
        	}catch(e){
        		throw new Error(this.i18n.copyFail+e.message);
        	}
    	}));
    	
    	// 编辑字段配置
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.fieldLayoutDialog){
        			this.fieldLayoutDialog = this.getFieldLayoutDialog();
        		}
        		this.fieldLayoutDialog.open({"data":data,"title":this.i18n.editField+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 删除字段配置
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
        			dataobject:"fieldLayout",
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
    getFieldLayoutDialog: function(){
		var clz = $.u.load("com.sms.common.stdComponentOperate");
		var module = new clz($("div[umid='fieldLayoutDialog']", this.$), {
    		"title":this.i18n.addFieleConfig,
    		"dataobject":"fieldLayout",
    		"fields":[
	          {name:"name",label:"名称",type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:255},
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


com.sms.customfields.fieldLayouts.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.customfields.fieldLayouts.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];