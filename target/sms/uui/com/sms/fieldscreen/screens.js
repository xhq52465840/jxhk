//@ sourceURL=com.sms.fieldscreen.screens
$.u.define('com.sms.fieldscreen.screens', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.fieldscreen.screens.i18n;

    	this.qid("btn_addfieldscreen").click(this.proxy(function(){
    		if(!this.fieldScreenDialog){
    			this.fieldScreenDialog = this.getFieldScreen();
    		}
    		this.fieldScreenDialog.open();
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
                { "title": this.i18n.surfaceCase ,"mData":"schemes","sWidth":"25%"},
                { "title": this.i18n.workflow ,"mData":"id","sWidth":"25%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":170}
            ],
            "aaData":[
                      {id:0,name:this.i18n.surfaceCase,description:this.i18n.allowUpdate,schemes:[{id:0,name:this.i18n.approveCase}]},
                      {id:0,name:this.i18n.workflowSurface,description:this.i18n.workflowSurfaceDesc,schemes:[]}
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
            		"dataobject":"fieldScreen",
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
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full.schemes && $.each(full.schemes,function(idx,scheme){
                			htmls.push("<li><a href='ConfigureScreenScheme.html?id="+scheme.id+"' >"+scheme.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full.workflows && $.each(full.workflows,function(idx,workflows){
                			htmls.push("<li><a href='#' >"+workflows.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	var htmls="";
                    	htmls+="<a href='../fieldscreen/ConfigFieldScreen.html?id=" + full.id + "' class='btn btn-link config' >"+com.sms.fieldscreen.screens.i18n.config+"</a>"+
		              	   "<button class='btn btn-link copy' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.screens.i18n.copy+"</button>"+
		              	 "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.screens.i18n.edit+"</button>";
                    	if(!full.schemes&&!full.workflows){
                    		htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.fieldscreen.screens.i18n.remove+"</button>";
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
        		if(!this.fieldScreenDialog){
        			this.fieldScreenDialog = this.getFieldScreen();
        		}
        		this.fieldScreenDialog.open({"data":data,"title":this.i18n.editsurface+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 删除界面
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.affirm+"&nbsp;<strong>"+data.name+"</strong>?</p>"+
        				 "</div>",
        			title:this.i18n.removeSurface,
        			dataobject:"fieldScreen",
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
        
        //复制界面
        this.dataTable.off("click", "button.copy").on("click", "button.copy", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		if(!this.fieldScreenDialog){
        			this.fieldScreenDialog = this.getFieldScreen();
        		}
        		this.fieldScreenDialog.open({"data":data,"title":this.i18n.copySurface+data.name,"operate":"COPY",method:"copyfieldscreen"});
        	}catch(e){
        		throw new Error(this.i18n.copyFail+e.message);
        	}
    	}));
    },
    getFieldScreen: function(){
		var clz = $.u.load("com.sms.common.stdComponentOperate");
		var module = new clz($("div[umid='fieldScreenDialog']",this.$),{
    		"title": this.i18n.addSurface,
    		"dataobject": "fieldScreen",
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


com.sms.fieldscreen.screens.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.fieldscreen.screens.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];