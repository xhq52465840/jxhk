//@ sourceURL=com.sms.activitytype.activityTypeSchemes
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.activitytype.activityTypeSchemes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.activitytype.activityTypeSchemes.i18n;
    	// ”添加安全信息类型“按钮
    	this.btnAddActivityTypeScheme=this.qid("btn_addActivityTypeScheme");
    	
    	// 绑定“添加安全信息类型”按钮事件
    	this.btnAddActivityTypeScheme.click(this.proxy(function(){
    		this.activityTypeSchemeDialog.open();
    	}));
    	
    	// 重写“安全信息类型”组件的函数
    	this.activityTypeSchemeDialog.override({
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
                { "title": this.i18n.option ,"mData":"types","sWidth":"20%"},
                { "title": this.i18n.SafetyAgencies ,"mData":"units","sWidth":"30%"},
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
            		"dataobject":"activityTypeScheme",
            		"search":JSON.stringify(aoData.search),
            		"columns":JSON.stringify([{"data":"type"}]),
            		"order":JSON.stringify([{"column":0,"dir":"desc"}])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type: "post",
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
                                '<p class="text-muted"><small>' + (full.description||"") + '</small></p>';
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full.types && $.each(full.types,function(idx,type){
                			if(type.id==full.defaultTypeId){
                				type.url && htmls.push('<li><img  src="/sms/uui'+type.url+'" width="16px" height="16px" style="margin-right:5px;"/>'+type.name+'('+com.sms.activitytype.activityTypeSchemes.i18n.approve+')</li>');
                			}else{
                				type.url && htmls.push('<li><img  src="/sms/uui'+type.url+'" width="16px" height="16px" style="margin-right:5px;"/>'+type.name+'</li>');
                			}
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		if(full.units){
                			$.each(full.units,function(idx,unit){
                				htmls.push("<li><a href='../unitconfig/Summary.html?id="+unit.id+"'>"+unit.name+"</a></li>");
                			});
                		}else{
                			htmls.push(com.sms.activitytype.activityTypeSchemes.i18n.noSafetyAgencies);
                		}
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	var htmls = "";
                    	var sendData = {
                    			"id":full.id,
                    			"name":full.name
                    	};
                    	htmls+="<button class='btn btn-link edit' data='"+JSON.stringify(sendData)+"'>"+com.sms.activitytype.activityTypeSchemes.i18n.edit+"</button>"+
	                	"<button class='btn btn-link copy' data='"+JSON.stringify(sendData)+"'>"+com.sms.activitytype.activityTypeSchemes.i18n.copy+"</button>";
                    	if(full.type!="default"){
                    		htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(sendData)+"'>"+com.sms.activitytype.activityTypeSchemes.i18n.remove+"</button>";
                    	}
	                	return  htmls;  
                    }
                }
            ]
        });
    	
    	// 编辑安全信息类型方案
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.activityTypeSchemeDialog.open({"data":data,"title":this.i18n.editSafeMsg+data.name,"operate":"EDIT"});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	//复制安全信息类型方案
    	this.dataTable.off("click", "button.copy").on("click", "button.copy", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.activityTypeSchemeDialog.open({"data":data,"title":this.i18n.addSafeCase,"operate":"COPY"});
        	}catch(e){
        		throw new Error(this.i18n.copyFail+e.message);
        	}
    	}));
    	
    	// 删除安全信息类型方案
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.confirm+"&nbsp;&nbsp;<strong>"+data.name+"</strong>?</p>"+
        				 "</div>",
        			title:this.i18n.removeSafeMsg+data.name,
        			dataobject:"activityTypeScheme",
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


com.sms.activitytype.activityTypeSchemes.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.activitytype.activityTypeSchemes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];