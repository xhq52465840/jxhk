//@ sourceURL=com.sms.activityproperty.status
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.activityproperty.status', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.activityproperty.status.i18n;
    	// ”添加状态“按钮
    	this.btn_addstatus=this.qid("btn_addstatus");
    	
    	// 绑定“添加状态”按钮事件
    	this.btn_addstatus.click(this.proxy(function(){
    		this.statusDialog.open();
    	}));
    	
    	// “编辑状态”组件
    	this.statusDialog = new com.sms.common.stdComponentOperate($("div[umid='statusDialog']",this.$),{
    		"title":this.i18n.addStatus,
    		"dataobject":"activityStatus",
    		"fields":[
	          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,maxlength:50},
	          {name:"description",label:this.i18n.describe,type:"textarea","description":this.i18n.status,maxlength:255},
	          {name:"category",label:this.i18n.classify,type:"select",rule:{required:true},message:this.i18n.classifyNotNull,description:this.i18n.explainA+"<br/>"+this.i18n.explainB+"<strong>"+this.i18n.explainC+"</strong>"+this.i18n.explainD+"<strong>"+this.i18n.explainE+"</strong>，"+this.i18n.explainF+"<strong>"+this.i18n.explainG+"</strong>",option:{
	        	  minimumResultsForSearch:-1,
	        	  ajax:{
	        	  	data:{"method":"getactivitystatuscategory"}
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
		        			 "method":"getactivitystatuscategory"
		        		  }
	                  }).done(this.proxy(function (response) {
	                      if (response.success) {
	                          result = {results:response.data.aaData};
	                      }
	                  })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

	                  })).complete(this.proxy(function(){
	                  }));
	        		  return result;
	        	  }),
	        	  id:function(cate){
	        		  return cate.key;
	        	  },
	        	  formatResult:this.proxy(function(cate){
	        		  return "<span class='label "+this.getLabel(cate.key)+"'>&nbsp;</span>&nbsp;"+cate.name;
	        	  }),
	        	  formatSelection:this.proxy(function(cate){
	        		  return "<span class='label "+this.getLabel(cate.key)+"'>&nbsp;</span>&nbsp;"+cate.name;
	        	  })
	          }}
	        ]
    	});
    	
    	// 重写“编辑状态”组件的函数
    	this.statusDialog.override({
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
                { "title": this.i18n.statusMsg ,"mData":"name"},
                { "title": this.i18n.pattern ,"mData":"id","sWidth":100},
                { "title": this.i18n.workflow ,"mData":"workflows","sWidth":"40%"},
                { "title": this.i18n.handle ,"mData":"id","sWidth":100}
            ],
            "aaData":[
                      {id:0,name:"开始",description:"不安全事件",categoryKey:"",categoryValue:"新建",workflows:[{id:0,name:"测试流程"}]},
                      {id:0,name:"进行中",description:"持续监控信息",categoryKey:"",categoryValue:"进行中",workflows:[{id:0,name:"测试流程"},{id:0,name:"测试流程"},{id:0,name:"测试流程"}]},
                      {id:0,name:"已解决",description:"员工安全报告",categoryKey:"",categoryValue:"完成",workflows:[]},
                      {id:0,name:"关闭",description:"员工安全报告",categoryKey:"",categoryValue:"",workflows:[]}
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
            		"dataobject":"activityStatus",
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
                    "mRender": this.proxy(function (data, type, full) {
                    	return  '<p><span class="label '+this.getLabel(full.category)+'"><strong>' + full.name + '</strong></span></p>' +
                                '<p class="text-muted"><small>' + (full.description||'') + '</small></p>';
                    })
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                		return full.workflows && full.workflows.length>0 ? "<span style='color:#006400;'><strong>已生效</strong></span>" : "<span style='color:#c00;'><strong>未生效</strong></span>";
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
	                	var htmls=["<ul style='padding-left:15px;padding-bottom:0;'>"];
	                	full.workflows && $.each(full.workflows,function(idx,wf){
	            			htmls.push("<li><a href='../workflow/WorkflowDesign.html?id="+wf.wsd_id+"'>"+wf.name+"</a></li>");
	            		});
	            		htmls.push("</ul>");
                    	return htmls.join("");
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                		var htmls="<button class='btn btn-link edit' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.status.i18n.edit+"</button>";
                		(full.workflows && full.workflows.length < 1) || !full.workflows ? htmls+="<button class='btn btn-link delete' data='"+JSON.stringify(full)+"'>"+com.sms.activityproperty.status.i18n.remove+"</button>" : null;
	                	return htmls;
                    }
                }
            ]
        });
    	
    	// 编辑状态
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.statusDialog.open({"data":data,"title":this.i18n.editStatus+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	// 删除状态
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.confirm+"</p>"+
        				 "</div>",
        			title:this.i18n.removeStatus+data.name,
        			dataobject:"activityStatus",
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
    getLabel:function(v){
    	var label=null;
    	switch(v){
			case "NEW":
				label="label-primary";
				break;
			case "IN_PROGRESS":
				label="label-warning";
				break;
			case "COMPLETE":
				label="label-success";
				break;
			default:
				label="label-default";
				break;
		}
    	return label;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.activityproperty.status.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',"../../../uui/widget/spin/spin.js"
                                            , "../../../uui/widget/jqblockui/jquery.blockUI.js"
                                            , "../../../uui/widget/ajax/layoutajax.js"];
com.sms.activityproperty.status.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];