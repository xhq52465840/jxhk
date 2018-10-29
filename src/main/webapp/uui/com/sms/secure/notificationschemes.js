//@ sourceURL=com.sms.secure.notificationschemes
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.secure.notificationschemes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.secure.notificationschemes.i18n;
    	// ”添加通知方案“按钮
    	this.btn_addnotificationschemes=this.qid("btn_addnotificationschemes");
    	
    	// 绑定“添加通知方案”按钮事件
    	this.btn_addnotificationschemes.click(this.proxy(function(){
    		this.notificationschemesDialog.open();
    	}));
    	
    	// “编辑界面”组件
    	this.notificationschemesDialog = new com.sms.common.stdComponentOperate($("div[umid='notificationschemesDialog']",this.$),{
    		"title":this.i18n.addtitle,
    		"dataobject":"notificationScheme",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
	          {name:"description",label:this.i18n.describe,type:"textarea",maxlength:255}
	        ]
    	});
    	
    	// 重写“编辑界面”组件的函数
    	this.notificationschemesDialog.override({
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
                { "title": this.i18n.safeagency ,"mData":"id","sWidth":"35%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":200}
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
            		"dataobject":"notificationScheme",
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
	                    	return  '<strong>' + full.name + '</strong>' +
	                                '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	var htmls=["<ul style='padding-left:15px;'>"];
                		if(full.units){
                			$.each(full.units,function(idx,unit){
                				htmls.push("<li><a href='../unitconfig/Summary.html?id="+unit.id+"'>"+unit.name+"</a></li>");
                			});
                		}else{
                			htmls.push("没有安监机构");
                		}
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	var  htmls="";
                    	htmls+= "<a class='btn btn-link notification' href='editNotificationSchemes.html?id=" + full.id + "' >"+com.sms.secure.notificationschemes.i18n.noticeSet+"</a>"+
                		"<button class='btn btn-link copy' data='"+JSON.stringify(full)+"'>"+com.sms.secure.notificationschemes.i18n.copy+"</button>"+
                		"<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.secure.notificationschemes.i18n.edit+"</button>";
                    	if(full.type!="default"){
                    		htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.secure.notificationschemes.i18n.remove+"</button>";
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
        		this.notificationschemesDialog.open({"data":data,"title":this.i18n.editNoticeCase+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 复制界面
    	this.dataTable.off("click", "button.copy").on("click", "button.copy", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.notificationschemesDialog.open({"data":data,"title":this.i18n.	copyNoticeCase+data.name,"operate":"COPY",method:"copynotificationscheme"});
        	}catch(e){
        		throw new Error(this.i18n.copyFail+e.message);
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
        			title:this.i18n.removeNoticeCase+data.name,
        			dataobject:"notificationScheme",
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


com.sms.secure.notificationschemes.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',"../../../uui/widget/spin/spin.js"
                                               , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                               , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.secure.notificationschemes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];