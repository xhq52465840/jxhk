//@ sourceURL=com.sms.permissionset.viewPermission
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.permissionset.viewPermission', null, {
    init: function (options) {
        this._options = options;
        this._select2PageLength=10;
        this.i18n= {
        		search : '搜索:',
        		everPage : '每页显示',
        		record : '个用户',
        		message : '抱歉未找到记录',
        		from : '从',
        		to : '到',
        		all : '共',
        		allData : '条数据',
        		withoutData : '没有数据',
        		fromAll : '从总共',
        		filterRecord : '条记录中过滤',
        		searching : '检索中',
        		back : '上一页',
        		next : '下一页',
           }
        this.other=[{"id":"处理人","name":"处理人"},{"id":"机构负责人","name":"机构负责人"},{"id":"任何人","name":"任何人"}]
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.permissionset.viewPermission.i18n;
    	// 筛选按钮
    	this.btnFilter=this.qid("btn_filter");
    	    	
    	// 请出筛选值
    	this.btnResetFilter=this.qid("btn_resetfilter");
    	
        // 筛选按钮事件
        this.btnFilter.click(this.proxy(function () {
            this.dataTable.fnDraw();
        }));
                
        // 清除筛选值
        this.btnResetFilter.click(this.proxy(function () {
          //  this.clearForm(this.qid("filter"));
            this.dataTable.fnDraw();
        }));

        this.groupMembers.override({
            refreshDataTable: this.proxy(function () {
                this.dataTable.fnDraw(true);
            })
        });
        this.name = this.qid("name");//名称中有
        this.pname= this.qid("pname");//权限名称中有
        var resultsterm='';
        this.name.select2({
    		placeholder: "选择...",
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var reother=[];
                	resultsterm=term;
                	var aoop={
                    		"USER_GROUP":{
                    			"dataobject":"userGroup",
                    			"rule": [{"key": "name", "op": "like", "value": term}]
                    		},
                    		"ROLE":{
                    			"dataobject":"role",
                    			"rule":[{"key": "name", "op": "like", "value": term}] 
                    		},
                    		"USER":{
                    			"dataobject":"user",
                    			"rule":[{"key": "fullname", "op": "like", "value": term}, {"key": "username", "op": "like", "value": term}] 
                    		},
                    		"OTHER":{
                    			"dataobject":"role",
                    			"rule":[{"key": "name", "op": "like", "value": term}] 
                    		}
                    	}
                        return {
                            tokenid: $.cookie("tokenid"),
                            method: "stdcomponent.getbysearch",
                            dataobject: aoop[this.type.val()].dataobject,
                            rule:JSON.stringify( [aoop[this.type.val()].rule]),
                            start: (page - 1) * this._select2PageLength,
                            length: this._select2PageLength
                        };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                    	if(this.type.val()=="OTHER"){
                    		return {
                                "results": resultsterm ? ($.grep(this.other,this.proxy(function(v,k){
                        			return v.name.indexOf(resultsterm)>-1
                        		}))):this.other
                            };
                    	}
                		return {
                            "results": response.data.aaData,
                            "more":  response.data.iTotalRecords > (page * this._select2PageLength)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name||item.fullname+"("+item.username+")";
            },
            formatResult: function(item){
                return item.name||item.fullname+"("+item.username+")";
            }
    	});
        this.pname.select2({
    		placeholder: "选择...",
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "stdcomponent.getbysearch",
                        dataobject: "permissionSet",
                        rule: JSON.stringify([[{"key": "name", "op": "like", "value": term}]]),
                        start: (page - 1) * this._select2PageLength,
                        length: this._select2PageLength
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more":  response.data.iTotalRecords > (page * this._select2PageLength)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	});
        this.type = this.qid("type");
        this.type.off("change").on("change",this.proxy(this.typeClick));
        
        this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            sDom: "",
            "columns": [
                { "title": this.i18n.columns.name,"mData":"NAME"},
                { "title": this.i18n.columns.permission,"mData":"PERMISSION", "sWidth": "50%" },
                { "title": this.i18n.columns.handle,"mData":"NAME", "sWidth": 150 }
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
            	var nameval= this.name.select2("data")? this.name.select2("data").name||this.name.select2("data").fullname:this.name.val();
             	var pnameval= this.pname.select2("data")? this.pname.select2("data").name:this.pname.val();	
            	$.extend(aoData,{
            		"tokenid": $.cookie("tokenid"),
            		"method": "getURGP",
                    "type": this.qid("type").val(),
                    "name": nameval,
                    "pname": pnameval
            	},true);
                delete aoData.columns;
                delete aoData.order;
                delete aoData.search;
                delete aoData.start;
                delete aoData.length;
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	this.btnFilter.attr("disabled",true);
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type:"post",
                    cache: false,
                    data: aoData
                }, this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack({
                            "aaData": data.data,
                            "iTotalRecords": data.data.length
                        });
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                	this.btnFilter.attr("disabled",false);
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                        return data;
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	var htmls=["<ul style='padding-left:15px;'>"];
                		full.PERMISSION && $.each(full.PERMISSION,function(idx,permission){
                			if(permission.PNAME.toString()==="null" ||permission.SCOPE.toString()==="null"){
                				htmls.push("<li></li>");
                			}else{
                				htmls.push("<li>"+permission.PNAME+"("+permission.SCOPE+")"+"</li>");
                			}
                		});
                		htmls.push("</ul>");
                        return htmls.join("");
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": this.proxy(function (data, type, full) {
                        var htmls = [];
                        if(this.qid("type").val() == "USER_GROUP"){
                            htmls.push("<button type='button' class='btn btn-link viewuser' data-id='"+full.ID+"'>" + com.sms.permissionset.viewPermission.i18n.buttons.viewuser + "</button>");
                        }
                        if(this.qid("type").val() == "ROLE"){
                            htmls.push("<button type='button' class='btn btn-link viewrole' data-id='"+full.ID+"'> 查看</button>");
                        }
                    	return htmls.join("");
                                
                    })
                }
            ],
            "rowCallback": function(row, data, index){
                $(row).data("data", index);
            }
        });

        this.dataTable.on("click", "button.viewuser", this.proxy(this.on_viewGroupUser_click));
        this.dataTable.on("click", "button.viewrole", this.proxy(this.on_viewRole_click));
        
        
    },
    on_viewGroupUser_click: function(e){
        var id = $(e.currentTarget).attr("data-id");
        try{
        	this._ajax({
                data: {
                    "method": "getUserIdNameByGroupId",
                    "groupId":id
                },
                block: this.dataTable,
                callback: this.proxy(function(response){
                    if(response.success){
                    	var data = {"name":"","users":[],"id":id};
                    	response.data && $.each(response.data, function(idx,value){
                    		data.users.push({
                    			id:value[0],
                    			name:value[2]+"("+value[1]+")"
                    		});
                    	});
                    	this.groupMembers.open(data);
                    }
                })
            });
    	}catch(e){
    		throw new Error(e.message);
    	}
    },
    
    
    on_viewRole_click:function(e){
    	var temp=' <div class="form " name="companyrole" >'
		            +'<h3 class="uui-module-h3" style="margin-bottom:10px;"></h3>'
		            +'<div class="row">'
		               +'<div class="form-group col-md-3 ">' 
		                  + '<label for="<%=this._id%>-unit">安监机构</label>' 
		                    +'<input type="text" class="form-control input-sm" name="unit" />'
		                +'</div>'
		              + '<div class="form-group col-md-3 ">'
		                   + '<label for="<%=this._id%>-user">用户名</label>'
		                    +'<input type="text" class="form-control input-sm" name="user" />'
		               + '</div>'
		               + '<div class="form-group col-md-3 ">'
		               + '</div>'
		              + '<div class="form-group col-md-3 " style="line-height:4.5em;">'
			               +'<button class="btn btn-default " qid="role_filter">筛选</button>' 
				            +'<button class="btn btn-link" qid="role_resetfilter">清除筛选</button>'
			           +'</div>' 
		            +'</div>'
		        +' <table qid="viewtable" class="table table-striped table-bordered" cellspacing="0" width="100%"> </table>'
		  + '</div> '
        var id = $(e.currentTarget).attr("data-id");
        try{
        	  var $temp=$(temp);
        	  this.role_filter= $("[qid=role_filter]",$temp);
        	  this.role_resetfilter=$("[qid=role_resetfilter]",$temp);;
        	  // 筛选按钮事件
              this.role_filter.click(this.proxy(function () {
            	  this.viewTable.fnDraw();
              }));
              
              // 清除筛选按钮事件
              this.role_resetfilter.click(this.proxy(function () {
                  this.clearForm($temp);
                  this.viewTable.fnDraw();
              }));
             this.viewTable = $temp.find("table").dataTable({
                  "dom": 'tip',
                  "loadingRecords": "加载中...",  
                  "info":true,
                  "pageLength": parseInt(8||$.cookie("pageDisplayNum") || 10),
                  "pagingType": "full_numbers",
                  "autoWidth": true,
                  "processing": false,
                  "serverSide": true,
                  "bRetrieve": true,
                  "ordering": false,
                  "language":{
       	           	"processing":"数据加载中...",
       	           	"info": " _START_ - _END_ of _TOTAL_ ",
       	           	"infoEmpty": "0 - 0 of 0 ",
       	            "zeroRecords":"无搜索结果",
       	           	"infoFiltered":"",
       	           	"paginate": {
       	                   "first": "",
       	                   "previous": "<span class='fa fa-caret-left fa-lg'></span>",
       	                   "next": "<span class='fa fa-caret-right fa-lg'></span>",
       	                   "last": ""
       	               }
                  },
                  "columns":[
                             { "title": "单位", "mData":"unitname","sWidth":"20%" },
                             { "title": "用户名", "mData": "fullname", "sWidth": "20%" },
                             { "title": "账号", "mData":"username", "sWidth": "20%" },
                             { "title": "是否有效", "mData":"status", "sWidth": "20%" }
                         ]  ,
              	  "fnServerParams": this.proxy(function (aoData) {
               		   delete aoData.order;
 		               delete aoData.draw;
 		               delete aoData.search; 
 		          	   delete aoData.columns;
 		       	   var unitval=$("[name=unit]",$temp).val();
           	       var userval=$("[name=user]",$temp).val();
                  	$.extend(aoData,{
                  		"tokenid": $.cookie("tokenid"),
                  		"method":"getUserByRoleN",
                   		"role":id,
                   		"unit":unitval,
                   		"user":userval
                  	},true);
                  }),
                  "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
	                      $.u.ajax({
	                          url: $.u.config.constant.smsqueryserver,
	                          type:"post",
	                          dataType: "json",
	                          cache: false,
	                          data: aoData
	                      }, $temp).done(this.proxy(function (data) {
	                          if (data.success) {
	                        	/*  fnCallBack({
	                                  "aaData": data.data.aaData,
	                                  "iTotalRecords": data.data.iTotalRecords
	                              });*/
		                          fnCallBack({
		 	                      		"recordsFiltered":data.data.iTotalRecords,
		 	                      		"data":data.data.aaData
		 	                      	});
	                          }
	                      })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	
	                      })).complete(this.proxy(function(){
	                      }));
                  })
                  });
          
        	  this.role = $("<div/>").append($temp).dialog({
              	  title:"用户角色：",
                  width:780,
                  modal: true,
                  draggable: false,
                  resizable: false,
                  autoOpen: true,
                  open: this.proxy(this.on_infoDialog_open),
                  close: this.proxy(this.on_infoDialog_close),
                  buttons:[{
                      "text":"关闭",
                      "class":"aui-button-link",
                      "click":this.proxy(function(){
                      	this.role.dialog("close");
                      })
              	}]
              }).dialog("open");
        	
        	  $("[name=unit]",$temp).select2({
	           		placeholder: "选择",
	         		allowClear:true,
	             	ajax:{
	     	        	url: $.u.config.constant.smsqueryserver,
	     	        	type: "post",
	     	            dataType: "json",
	     	        	data: this.proxy(function(term, page){
	     	        		return {
	     	        			"tokenid":$.cookie("tokenid"),
	     	        			"method":"getunits",
	     	        			"unitName":term,
		        				"start": (page - 1) * 5,
			    				"length": 5	  
	     	        		};
	     	    		}),
	     		        results:this.proxy(function(data,page){
	     		        	if(data.success){
	     		        		return {results:$.map(data.data,function(item,idx){
	     		        			return item;
	     		        		})};
	     		        	}
	     		        })
	     	        },
	     	        formatResult: function(item){
	     	        	return item.name;      		
	     	        },
	     	        formatSelection: function(item){
	     	        	return item.name;	        	
	     	        }
             });
    	}catch(e){
    		throw new Error("on_viewRole_click :"+e.message);
    	}
        
    },
    _ajax: function(param){
        $.u.ajax({
            url: param.url || $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: $.extend(true, {
                "tokenid": $.cookie("tokenid")
            }, (param.data || {}) )
        }, param.block).done(this.proxy(param.callback));
    },
    typeClick : function(e){
    	this.name.select2("val",'');
        this.pname.select2("val",'');
        this.dataTable.fnDraw(true);
    },
    clearForm: function ($target) {
        $target.find("input,select,textarea").each(function () {
            switch (this.type) {
                case "password":
                case "text":
                case "textarea":
                	$(this).val("");
                	$(this).select2("val","");
                	break;
                case "select-one":
                case "select-multiple":
                	$(this).val("");
                    break;
                case "checkbox":
                case "radio":
                    $(this).prop("checked", false);
                    break;
                    // no default
            }
        });
    },
    
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.permissionset.viewPermission.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                                 '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                                 '../../../uui/widget/select2/js/select2.min.js'];
com.sms.permissionset.viewPermission.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                                  { path: '../../../uui/widget/select2/css/select2.css'},
                                                  { path: '../../../uui/widget/select2/css/select2-bootstrap.css' },
                                                  { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];


