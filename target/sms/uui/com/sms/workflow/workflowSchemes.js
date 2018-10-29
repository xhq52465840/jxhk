//@ sourceURL=com.sms.workflow.workflowSchemes
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.workflow.workflowSchemes', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.workflow.workflowSchemes.i18n;
    	this.validDataTable = this.qid("validdatatable");
    	this.invalidDataTable = this.qid("invaliddatatable");
    	
    	// ”添加工作流方案“按钮
    	this.btnAddWorkflowScheme=this.qid("btn_addWorkflowScheme");
    	
    	// 绑定“添加工作流方案”按钮事件
    	this.btnAddWorkflowScheme.click(this.proxy(function(){
    		this.workflowSchemeDialog.open();
    	}));
    	
    	// “工作流方案模态层”组件
    	this.workflowSchemeDialog = new com.sms.common.stdComponentOperate($("div[umid='workflowSchemeDialog']",this.$),{
    		"title":this.i18n.addworkflowSchem,
    		"dataobject":"workflowScheme",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
	          {name:"description",label:this.i18n.describe,type:"textarea",maxlength:255}
	        ]
    	});
    	
    	// 重写“工作流方案模态层”组件的函数
    	this.workflowSchemeDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this.invalidDataTable.fnClearTable();
    			this.validDataTable.fnDraw();
    		})
    	});
    	
    	this.invalidDataTable = this.qid("invaliddatatable").dataTable({
            searching: false,
            serverSide: false,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.safeAgency ,"mData":"units","sWidth":"20%"},
                { "title": "" ,"mData":"id","sWidth":"40%"},
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
            "data":[],
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                    	var a = '<strong>' + full.name + '</strong>' +
                        '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                        return a; 
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full .units && $.each(full.units,function(idx,unit){
                			htmls.push("<li><a href='../unitconfig/Summary.html?id="+unit.id+"'>"+unit.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul class='item-details'>"];
                		full.entities && $.each(full.entities,function(idx,item){
                			htmls.push("<li><dl><dt><img width='16' src='/sms/uui"+(item.type ? item.type.url : '/img/all_unassigned.png')+"'/>&nbsp;"+(item.type ? item.type.name : '未指派的类型')+"</dt><dd class='rarr'><i class='fa fa-long-arrow-right fa-1'></i></dd><dd><a href='WorkflowDesign.html?id="+item.workflow.wsd_id+"'>"+item.workflow.name+"</a></dd></dl></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>编辑</button>"+
			                	"<button class='btn btn-link copy' data='"+JSON.stringify(full)+"'>复制</button>"+
			             	   "<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>删除</button>";
                    }
                }
            ],
            "headerCallback":function( thead, data, start, end, display ){
            	$(thead).children("th:eq(2)").html("<ul class='item-details'><li><dl><dt>安全信息类型</dt><dd class='rarr'></dd><dd>工作流</dd></dl></li></ul>");
            }
        });
    	
    	this.validDataTable = this.qid("validdatatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.name ,"mData":"name"},
                { "title": this.i18n.safeAgency ,"mData":"units","sWidth":"20%"},
                { "title": "" ,"mData":"activityTypeWorkflows","sWidth":"40%"},
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
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"workflowScheme",
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
                },this.$).done(this.proxy(function (response) {
                    if (response.success) { 
                    	var data = $.grep(response.data.aaData,function(item,idx){
                        	return !item.units;
                        });
       			     	data.length > 0 && this.invalidDataTable.fnAddData(data);
                    	response.data.aaData = $.grep(response.data.aaData,function(item,idx){
                        	return item.units && item.units.length>0;
                        });
                        fnCallBack(response.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                        return '<strong>' + full.name + "</strong>" +
                                '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		var htmls=["<ul style='padding-left:15px;'>"];
                		full .units && $.each(full.units,function(idx,unit){
                			htmls.push("<li><a href='../unitconfig/Summary.html?id="+unit.id+"'>"+unit.name+"</a></li>");
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                	  "aTargets": 2,
                      "mRender": function (data, type, full) {
                  		var htmls=["<ul class='item-details'>"];
                  		full.entities && $.each(full.entities,function(idx,item){
                  			htmls.push("<li><dl><dt><img width='16' src='/sms/uui"+(item.type ? item.type.url : '/img/all_unassigned.png')+"'/>&nbsp;"+(item.type ? item.type.name : '未指派的类型')+"</dt><dd class='rarr'><i class='fa fa-long-arrow-right fa-1'></i></dd><dd><a href='WorkflowDesign.html?id="+item.workflow.wsd_id+"'>"+item.workflow.name+"</a></dd></dl></li>");
                  		});
                  		htmls.push("</ul>");
                          return htmls.join("");
                      }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
	                	return "<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.workflow.workflowSchemes.i18n.edit+"</button>"+
			                	"<button class='btn btn-link copy' data='"+JSON.stringify(full)+"'>"+com.sms.workflow.workflowSchemes.i18n.copy+"</button>";
                    }
                }
            ],
            "headerCallback":function( thead, data, start, end, display ){
            	$(thead).children("th:eq(2)").html("<ul class='item-details'><li><dl><dt>安全信息类型</dt><dd class='rarr'></dd><dd>工作流</dd></dl></li></ul>");
            }
        });

    	//复制方案
    	this.validDataTable.add(this.invalidDataTable).off("click", "button.copy").on("click", "button.copy", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.workflowSchemeDialog.open({"data":data,"title":"复制工作流方案","operate":"COPY",method:"copyworkflowscheme"});
        	}catch(e){
        		throw new Error(this.i18n.copyFail+e.message);
        	}
    	}));
    	
    	// 编辑方案
    	this.validDataTable.add(this.invalidDataTable).off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		window.location.href="EditWorkflowScheme.html?id="+data.id+"&name="+data.name;
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 删除工作流方案
        this.invalidDataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div >"+
        				 	"<div class='alert alert-info' role='alert'><span class='glyphicon glyphicon-info-sign'></span>"+this.i18n.affirm+" <strong>"+data.name+"</strong>?</div>"+
        				 "</div>",
        			title:this.i18n.delWorkflowCase,
        			dataobject:"workflowScheme",
        			dataobjectids:JSON.stringify([parseInt(data.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.invalidDataTable.fnClearTable();
        				this.validDataTable.fnDraw();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.delFail+e.message);
        	}
        }));
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.workflowSchemes.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                             '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                             "../../../uui/widget/spin/spin.js",
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.workflowSchemes.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];