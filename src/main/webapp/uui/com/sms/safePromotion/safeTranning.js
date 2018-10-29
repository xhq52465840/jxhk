//@ sourceURL=com.sms.safePromotion.safeTranning
$.u.define('com.sms.safePromotion.safeTranning', null,
{
    init: function(options) {
        this._SELECT2_PAGE_LENGTH = 10;
        this._option = options || {};
    },
    afterrender: function() {
        this.i18n = com.sms.safePromotion.safeTranning.i18n;
        this.addTrain = this.qid("addTrain");
        this.Jurisdiction=this.Jurisdiction();
        this.addTrain.off("click").on("click", this.proxy(this.addTrainning));
        this._export = this.qid("export");
        this._export.off("click").on("click", this.proxy(this._exportExcel));
        this.name = this.qid("name"); //姓名
        this.department = this.qid("department"); //所属部门
        this.quarters = this.qid("quarters"); //岗位
        this.minTime = this.qid("minTime"); //大于天数
        this.maxTime = this.qid("maxTime"); //小于天数
        this.certificate_category = this.qid("certificate_category"); //证书类别
        this.available = this.qid("available"); //证书有效
        this.trainColumns=this.qid("btn_columns");//数据列
        this.trainColumns.on("click",this.proxy(this.columns));
        this.columnsdiv=this.qid("columnsdiv");
        this.colDiv=this.qid("colDiv");//数据列div
        this.colDiv.hide();
        this.update =this.qid("update");//编辑
        this.closed =this.qid("closed");//编辑
        this.update.on("click",this.proxy(this.updating));//更新
        this.closed.on("click",this.proxy(this.closeding));//关闭
        if(this.Jurisdiction){                            //是否有权限上传（删除）证书
        this.qid("trainTable").on('click', '.upload-file', this.proxy(this.upload));//给表格元素获取事件
        this.qid("trainTable").on('click', '.glyphicon-trash', this.proxy(this.deleteFile));//给表格元素获取事件
        }else{
        };
        this._initData();                     //初始化数据
        this.btn_filter = this.qid("btn_filter");
        this.btn_filter.off("click").on("click", this.proxy(function(ent){
            ent.preventDefault();
            this.freshTable();
        })).trigger("click");
    
    },
    //获取权限
    Jurisdiction : function (){
    	var admit="";
        $.u.ajax({
 			url : $.u.config.constant.smsqueryserver,
 			type:"post",
 			async:false,
             dataType: "json",
             data: {
            	 "tokenid":$.cookie("tokenid"),
	       		  "method":"getTrainingRecordPermission"
             }
     	}).done(this.proxy(function(response){
     		   if(response.success){
     			  var planData=response.data.managable;
     			   if(response.data.managable==false){
     				  this.addTrain.hide();
     			   }
     			   admit= planData;
     		   }
     	}));
        return admit;
    
    },
    
    //初始化
    _initData: function() {
    	//姓名
    	var unitId=this.unitId;
    	this.name.select2({
    		multiple: true,
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data:this.proxy(function(term, page){
	            	 var unitIds = [];
	                    this.department.select2("data") && $.each(this.department.select2("data"), function(k, v) {
	                        unitIds.push(v.id);
	                    });
	            	return {
	            		tokenid: $.cookie("tokenid"),
                        method: "getUsersByUnitIds",
                        unitIds: JSON.stringify(unitIds || ''),
                        "term":term,
	    				"start": (page - 1) * this._SELECT2_PAGE_LENGTH,
	    				"length": this._SELECT2_PAGE_LENGTH
	    			};
	            }),
		        results:this.proxy(function(response, page, query){
		        	if(response.success){
		        		return {
		        			 results: response.data.aaData,
		        			 more: response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH) 
		        		};
		        	}
		        	else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        })
    		},
    		formatSelection: function(item) {
    			if(item.username){
    				return item.fullname;
    			}else{
    				return item.fullname || '';
    			}
            },
            formatResult: function(item){
            	
            	if(item.username){
    				return item.fullname;
    			}else{
    				return item.fullname || '';
    			}
	        }
    	});
        //所属部门
        this.department.select2({
            width: '100%',
            multiple: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getunits",
                        "unitName":term,
                       // dataobject:"department",
//                        rule: JSON.stringify([
//                            [{
//                                "key": "name",
//                                "op": "like",
//                                "value": term
//                            }]
//                        ]),
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data,
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.name;
            },
            formatSelection: function(item) {
                return "<img src='" + item.avatarUrl + "' width='16' height='16' />&nbsp;" + item.name;
            }
        }).on("select2-selecting", this.proxy(function(){
        	this.name.select2("data","");
        	}));
        //证书类别
        this.certificate_category.select2({
            width: '100%',
            multiple: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getCertificateType"
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data,
                            more:  response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return item.name;
            },
            formatSelection: function(item) {
                return item.name;
            }
        });
    },
    //获取搜索数据
    getData: function() {
        //姓名
        var nameValue = [];
        this.name.select2("data") && $.each(this.name.select2("data"), function(k, v) {
            nameValue.push(v.id);
        });
        //所属单位
        var departmentValue = [];
        this.department.select2("data") && $.each(this.department.select2("data"), function(k, v) {
        	departmentValue.push(v.id);
        });
        //证书类型
        var certificate_categoryValue = [];
        this.certificate_category.select2("data") && $.each(this.certificate_category.select2("data"), function(k, v) {
        	certificate_categoryValue.push(v.id);
        });
        return obj = {
            "name": nameValue, //姓名
            "department": departmentValue, //所属部门 
            "quarters":this.quarters.val(), //岗位
            "minTime": Number(this.minTime.val()), //最小日期
            "maxTime": Number(this.maxTime.val()), //最大日期
            "available":Number(this.available.val()),//是否有效
            "certificate_category":certificate_categoryValue//证书类型
        }
    },
    //数据列
    columns:function(e){
    	this.colDiv.show();
	      var trainFiled=[
    	                {id:"trainingUnit",text:"培训部门"},
    	                {id:"trainingTarget.sex",text:"性别"},
    	                {id:"trainingTarget.identity",text:"身份证号"},
    	                {id:"trainingTarget.jobName",text:"岗位"},
    	                {id:"trainingTarget.education",text:"学历"},
    	                {id:"trainingTarget.birthDate",text:"出生日期"},
    	                {id:"trainingTarget.school",text:"毕业院校"},
    	                {id:"certificateNo",text:"证书编号"},
    	                {id:"certificationAuthority",text:"发证机构"},
    	                {id:"trainingType.name",text:"培训类型"},
    	                {id:"trainingTarget.onTheJob",text:"是否离职","render":this.getDataTableColumnRender("trainingTarget.onTheJob")}
    	                ];
	      this.columnsdiv.select2({
	    	  multiple:true,
	    	  data:trainFiled,
	      });
    	
    },
    //点击更新
    updating:function(e){
    	var colValue=this.colGetData();
        this.colFreshTable(colValue);
        this.colDiv.hide();
        $(".select2-results").parent().hide();
    },
    //关闭按钮
    closeding:function(){
    	this.colDiv.hide();
    	$(".select2-results").parent().hide();
    },
    //获取数据
    colGetData:function(){
    	var admit=this.Jurisdiction;
		var colValue=[
				{
				    "title": this.i18n.columns.name,
				    "mData": "trainingTarget.displayName",
				    "sWidth": "10%",
				    "class": "left"
				}, {
				    "title": this.i18n.columns.department,
				    "class":"left",
				    "mData": "trainingUnit",
				    "sWidth": "15%"
				}, {
				    "title": this.i18n.columns.updateperson,
				    "class":"left",
				    "mData": "lastUpdater",
				    "sWidth": "10%"
				}, {
				    "title": this.i18n.columns.intelligence,
				    "class":"left",
				    "mData": "qualified",
				    "render": this.getDataTableColumnRender("qualified"),
				    "sWidth": "10%"
				}, {
				    "title": this.i18n.columns.certificate_category,
				    "class":"left",
				    "mData": "certificateType.name",
				    "sWidth": "10%"
				}, {
				    "title": this.i18n.columns.available,
				    "class":"left",
				    "mData": "expiryDate",
				    "sWidth": "10%"
				}, {
				    "title": this.i18n.columns.updateDate,
				    "class":"left",
				    "mData": "lastUpdate",
				    "sWidth": "10%"
				}, {
				    "title": this.i18n.columns.files,
				    "class":"left",
				    "mData": "files",
				    "render": this.getDataTableColumnRender('files'),
				    "sWidth": "10%"
				}
			 ];
    	$.each(this.columnsdiv.select2("data"), this.proxy(function(k, v){
    		colValue.push({"title":v.text,"mData":v.id,"class":"left","sWidth": "13%", "render": this.getDataTableColumnRender(v.id)});
        }));
    	if(admit==true){
    		colValue.push({
                "title": "操作",
                "mData": 'id',
                "class":"center",
                "render": this.getDataTableColumnRender("id"),
                "sWidth": "15%"
               });
    	}
    	
    	return colValue;
    },
    getDataTableColumnRender: function(fieldName){
    	var render = null;
    	switch(fieldName){
	    	case 'trainingTarget.sex':
	    		render = function(data, type, full){
		    		var mapData = {'1':'男','0':'女'};
		    		return mapData[data] || '';
		    	}
	    		break;
	    	case 'files':
	    		render = function(data,type,full){
	    		var btn='<button class="btn btn-success upload-file" data-id='+full.id+'>上传证书</button>';
		    		var htmls = ['<ul style="padding:0px;word-wrap:break-word; width:190px;">'+btn];
		            $.each(data || [], function(idx, files){
				              htmls.push('<li style="list-style-type:none;float: left;width:145px;padding:3px;"><a class="download-file" target="_blank" href="' + $.u.config.constant.smsqueryserver + "?method=downloadFiles&tokenid=" + $.cookie("tokenid") + "&ids=" + JSON.stringify([files.id]) + '">' + files.fileName + '</a><span class="glyphicon glyphicon-trash" fileid='+files.id+' style="margin-left:10px;cursor:pointer;float:right;"></span></li></br>');
		            });
		            htmls.push('</ul>');
		            return htmls.join('');
		    	};
		    	break;
	    	case 'id':
	    		render = function(data,type,full){
                return "<button type='button' style='padding-bottom: 2px; padding-left: 2px;' class='btn btn-link edit' mode='edit' data-id="+ full.id +">" + "修改" + "</button>" + "   " + "<button type='button' style='padding-bottom: 2px; padding-left: 2px;' class='btn btn-link delete' mode='edit' data-id="+ full.id +">" + "删除" + "</button>";
	    	};
		    	break;
	    	case 'qualified':
	    		render = function(data, type, full){
		    		var mapData = {'true':'是','false':'否'};
		    		return mapData[data] || '';
		    	}
	    	   break;
	    	case 'trainingTarget.onTheJob':
	    		render = function(data, type, full){
		    		var mapData = {'true':'是','false':'否'};
		    		return mapData[data] || '';
		    	}
	    	   break;
	    	default:
	    		render = function(data, type, full){
	    			return data || '';
		    	};
		    	break;
    	}
    	return render;
    },
    //刷新列表
    colFreshTable:function(colValue){
    	this._colTrainTable(colValue);
    },
    //创建表格
    _colTrainTable:function(colValue){
    	
        if ($.fn.DataTable.isDataTable(this.qid("trainTable"))) {
            this.qid("trainTable").dataTable().api().destroy();
            this.qid("trainTable").empty();
        }
        this.trainTable = this.qid("trainTable").DataTable({
            "dom": 'tip',
            "loadingRecords": "加载中...",
            "info": true,
            "pageLength": this.i18n.pageLength,
            "sPaginationType": "full_numbers",
            "autoWidth": true,
            "ordering": false,
            "oLanguage": {
                        "sLengthMenu": "每页 _MENU_ 条记录",
                        "sZeroRecords": "没有找到记录",
                        "sInfo": this.i18n.from + " _START_ " + this.i18n.to + " _END_ /" + this.i18n.all + " _TOTAL_ " + this.i18n.allData,
                        //"sInfo": "第 _PAGE_ 页 ( 共 _PAGES_ 页 )",
                        "sInfoEmpty":"",
                        "sInfoFiltered": "(" + this.i18n.fromAll + "_MAX_" + this.i18n.filterRecord + ")",
                    	"oPaginate": {
                            "sFirst": this.i18n.oPaginate.sFirst,
                            "sPrevious": this.i18n.oPaginate.sPrevious,
                            "sNext": this.i18n.oPaginate.sNext,
                            "sLast": this.i18n.oPaginate.sLast
                        }
                    },
            "columns":colValue,
            "ajax": this.proxy(function(data, callback, settings){
                var trainObj = this.getData();
                var rule = [
                            [{
                                "key": "trainingTarget.id",
                                 "op":"in",
                                "value": trainObj.name.length ? trainObj.name:null
                            }],
                            [{
                                "key": "trainingUnit.id",
                                "op":"in",
                                "value": trainObj.department.length ? trainObj.department:null
                            }],
                            [{
                                "key": "trainingTarget.jobName",
                                "op": "like",
                                "value": trainObj.quarters.length ? trainObj.quarters : null
                            }],
                            [{
                                "key": "certificateType",
                                "op":"in",
                                "value": trainObj.certificate_category.length ? trainObj.certificate_category:null
                            }],
                            [{
                                "key": "remainingDays",
                                 "op":">",
                                "value": trainObj.minTime ? trainObj.minTime :null
                            }],
                            [{
                                "key": "remainingDays",
                                 "op":"<",
                                "value": trainObj.maxTime ? trainObj.maxTime : null
                            }]
                            ];
                if(trainObj.available === 0){
                	rule.push([{
                        "key": "remainingDays",
                        "op":"<",
                       "value": 0
                   }]);
                }else if(trainObj.available === 1){
                	rule.push([{
                        "key": "remainingDays",
                        "op":">=",
                       "value": 0
                   },{
                       "key": "remainingDays",
                       "op":"is null"
                  }]);
                }
                this._ajax($.u.config.constant.smsqueryserver, $.extend({}, data, {
                    "method": "stdcomponent.getbysearch",
                    "dataobject":"trainingRecord",
                    "rule": JSON.stringify(rule),
                    "columns":JSON.stringify([{"data":"t.lastUpdate"}]),
        	 		"order":JSON.stringify([{"column":0,"dir":"desc"}])
                }), this.qid("trainTable").parent(), {
                    size: 2,
                    backgroundColor: "#fff"
                }, this.proxy(function(response) {
                    if (response.success) {
                        callback({
                            "recordsFiltered": response.data.iTotalDisplayRecords,
                            "data": response.data.aaData
                        });
                    }
                }));
            }),
            "refresh": function() {
            },
            "headerCallback": this.proxy(function(thead, data, start, end, display) {}),
            "rowCallback": this.proxy(function(row, data, index) {})
        })
    
    },
    //新增
    addTrainning: function(e) {
        var $this = $(e.currentTarget);
        var mode = $this.attr('mode') || '';
    	if (!this.trainDialog) {
            var clz = $.u.load("com.sms.safePromotion.trainDialog");
            this.trainDialog = new clz(this.$.find("div[umid=trainDialog]"), {
                mode: mode
            });
        }
    	this.trainDialog.override({
            "fresh": this.proxy(function(actionItem) {
                $.u.ajax({
                    url: $.u.config.constant.smsmodifyserver,
                    type: "post",
                    data: {
                        tokenid: $.cookie("tokenid"),
                        method: "saveAllTrainingRecords",
                        obj: JSON.stringify(actionItem)
                    },
                    dataType: "json"
                }, this.trainDialog.trainDialog.parent()).done(this.proxy(function(response) {
                    if (response.success) {
                        this.freshTable();
                        this.trainDialog.trainDialog.dialog("close");

                    }
                }));
            })
        });
        this.trainDialog.open(mode);
    },
    freshTable: function() {
        this._trainTable();
    },
    _trainTable: function(e) {
    	var admit= this.Jurisdiction;
        if ($.fn.DataTable.isDataTable(this.qid("trainTable"))) {
            this.qid("trainTable").dataTable().api().destroy();
            this.qid("trainTable").empty();
        }
        this.trainTable = this.qid("trainTable").DataTable({
            "dom": 'tip',
            "loadingRecords": "加载中...",
            "info": true, 
            "pageLength": this.i18n.pageLength,
            "sPaginationType": "full_numbers",
            "autoWidth": true,
            "ordering": false,
            "oLanguage": {
                        "sLengthMenu": "每页 _MENU_ 条记录",
                        "sZeroRecords": "没有找到记录",
                        "sInfo": this.i18n.from + " _START_ " + this.i18n.to + " _END_ /" + this.i18n.all + " _TOTAL_ " + this.i18n.allData,
                       //"sInfo": "第 _PAGE_ 页 ( 共 _PAGES_ 页 )",
                        "sInfoEmpty": "",
                        "sInfoFiltered": "(" + this.i18n.fromAll + "_MAX_" + this.i18n.filterRecord + ")",
                    	"oPaginate": {
                            "sFirst": this.i18n.oPaginate.sFirst,
                            "sPrevious": this.i18n.oPaginate.sPrevious,
                            "sNext": this.i18n.oPaginate.sNext,
                            "sLast": this.i18n.oPaginate.sLast
                        }
                    },
            "columns": [{
			            	"title": this.i18n.columns.name,
						    "mData": "trainingTarget.displayName",
						    "class":"left",
						    "sWidth": "10%",
			            }, {
			                "title": this.i18n.columns.department,
			                "class":"left",
			                "mData": "trainingUnit",
			                "sWidth": "8%"
			            },{
			                "title": this.i18n.columns.certificate_category,
			                "class":"left",
			                "mData": "certificateType.name",
			                "sWidth": "8%"
			            }, {
			                "title": this.i18n.columns.available,
			                "class":"center",
			                "mData": "expiryDate",
			                "sWidth": "8%"
			            },  {
			                "title": this.i18n.columns.intelligence,
			                "class":"center",
			                "mData": "qualified",
			                "render": this.getDataTableColumnRender("qualified"),
			                "sWidth": "8%"
			            },{
			                "title": this.i18n.columns.updateperson,
			                "class":"center",
			                "class":"center",
			                "mData": "lastUpdater",
			                "sWidth": "10%"
			            },  {
			                "title": this.i18n.columns.updateDate,
			                "class":"center",
			                "mData": "lastUpdate",
			                "sWidth": "10%"
			            }, {
			                "title": this.i18n.columns.files,
			                "mData": 'files',
			                "render": this.getDataTableColumnRender("files"),
			                "sWidth": "10%"
			               }
			            , {
		            		"title": "操作",
			                "mData": 'id',
			                "class":"center",
			                "render": this.getDataTableColumnRender("id"),
			                "sWidth": "15%"
			               },
                    ],
                    "columnDefs": [    
                                {   
                                    "targets": [ 8 ], 
                                     "visible":function(){
                                    	 if(admit==false){
                                    	 return false;
                                     }else{
                                    	 return true;
                                     }
                                     }(), 
                                }],
                
            "ajax": this.proxy(function(data, callback, settings) {
                var trainObj = this.getData();
                var rule = [
                            [{
                                "key": "trainingTarget.id",
                                 "op":"in",
                                "value": trainObj.name.length ? trainObj.name:null
                            }],
                            [{
                                "key": "trainingUnit.id",
                                "op":"in",
                                "value": trainObj.department.length ? trainObj.department:null
                            }],
                            [{
                                "key": "trainingTarget.jobName",
                                "op": "like",
                                "value": trainObj.quarters.length ? trainObj.quarters : null
                            }],
                            [{
                                "key": "certificateType",
                                "op":"in",
                                "value": trainObj.certificate_category.length ? trainObj.certificate_category:null
                            }],
                            [{
                                "key": "remainingDays",
                                 "op":">",
                                "value": trainObj.minTime ? trainObj.minTime :null
                            }],
                            [{
                                "key": "remainingDays",
                                 "op":"<",
                                "value": trainObj.maxTime ? trainObj.maxTime : null
                            }]
                            ];
                if(trainObj.available === 0){
                	rule.push([{
                        "key": "remainingDays",
                        "op":"<",
                       "value": 0
                   }]);
                }else if(trainObj.available === 1){
                	rule.push([{
                        "key": "remainingDays",
                        "op":">=",
                       "value": 0
                   },{
                       "key": "remainingDays",
                       "op":"is null"
                  }]);
                };
               
                this._ajax($.u.config.constant.smsqueryserver, $.extend({}, data, {
                    "method": "stdcomponent.getbysearch",
                    "dataobject":"trainingRecord",
                    "rule": JSON.stringify(rule),
                    "columns":JSON.stringify([{"data":"t.lastUpdate"}]),
        	 		"order":JSON.stringify([{"column":0,"dir":"desc"}])
                }), this.qid("trainTable").parent(), {
                    size: 2,
                    backgroundColor: "#fff"
                }, this.proxy(function(response) {
                    if (response.success) {
                        callback({
                            "recordsFiltered": response.data.iTotalDisplayRecords,
                            "data": response.data.aaData
                        });
                    }
                }));
            }),
            "refresh": function() {
            },
            //"headerCallback": this.proxy(function(thead, data, start, end, display) {}),
            //"rowCallback": this.proxy(function(row, data, index) {})
        }),
        //点击修改按钮
        this.trainTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function(e) {
            var $this = $(e.currentTarget),
            id = parseInt($this.attr("data-id"));
            var mode = $this.attr('mode') || '';
            if (!this.trainDialog) {
                var clz = $.u.load("com.sms.safePromotion.trainDialog");
                this.trainDialog = new clz(this.$.find("div[umid=trainDialog]"), {
                    mode: mode
                });
            };
            this.trainDialog.override({
                    "fresh": this.proxy(function(actionItem) {
                    	delete actionItem.trainingTargets;
                        $.u.ajax({
                            url: $.u.config.constant.smsmodifyserver,
                            type: "post",
                            data: {
                                tokenid: $.cookie("tokenid"),
                                method: "stdcomponent.update",
                                dataobject: 'trainingRecord',
                                dataobjectid: JSON.stringify(id),
                                obj: JSON.stringify(actionItem)
                            },
                            dataType: "json"
                        }, this.trainDialog.trainDialog.parent()).done(this.proxy(function(response) {
                            if (response.success) {
                                this.freshTable();
                                this.trainDialog.trainDialog.dialog("close");
                            }
                        }));
                    })
                });
            this.trainDialog.open({mode:mode,id:id});
          
        })),
        this.trainTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function(e) {
            var $this = $(e.currentTarget),
                id = parseInt($this.attr("data-id"));
            $.u.load("com.sms.common.stdcomponentdelete");
            (new com.sms.common.stdcomponentdelete({
                body: "<div>" +
                    "<div class='alert alert-warning'>" +
                    "<span class='glyphicon glyphicon-exclamation-sign'></span>" + this.i18n.dialog.deleteContentPrefix + this.i18n.dialog.deleteContentOver +
                    "</div>" +
                    "</div>",
                title: this.i18n.dialog.deleteTitle,
                dataobject: "trainingRecord",
                dataobjectids: JSON.stringify([id])
            })).override({
                refreshDataTable: this.proxy(function() {
                    this.freshTable();
                })
            });
        }))
    },
   
    _ajax: function(url, param, $container, blockParam, callback) {
        $.u.ajax({
            "url": url,
            "type": url.indexOf(".json") > -1 ? "get" : "post",
            "data": $.cookie("tokenid") ? $.extend({
                "tokenid": $.parseJSON($.cookie("tokenid"))
            }, param) : $.extend({
                "tokenid": $.parseJSON($.cookie("uskyuser")).tokenid
            }, param),
            "dataType": "json"
        }, $container, $.extend({}, blockParam)).done(this.proxy(function(response) {
            if (response.success) {
                callback && callback(response);
            }
        })).fail(this.proxy(function(jqXHR, responseText, responseThrown) {

        }));
    },
    destroy: function() {
        this._super();
    },
    //文件上传
    upload:function(e){    	
        var id = $(e.currentTarget).attr('data-id');
    	if (!this.safeConfirmDialog) {
            var clz = $.u.load("com.sms.safePromotion.safeConfirmDialog");
            this.safeConfirmDialog = new clz(this.$.find("div[umid=safeConfirmDialog]"));
        };
    	this.safeConfirmDialog.override({
            "overTable": this.proxy(function() {
            	 this.freshTable();
            })
        });
        this.safeConfirmDialog.open(id);
    },
    //删除文件
    deleteFile : function(e){
    	var msg = "您真的确定要删除吗？";
    	var fileid=$(e.currentTarget).attr("fileid");
    	 if (confirm(msg)==true){ 
             $.u.ajax({
                 url: $.u.config.constant.smsmodifyserver,
                 type: "post",
                 dataType: "json",
                 data: {
                     tokenid: $.cookie("tokenid"),
                     method: "stdcomponent.delete",
                     dataobject: "file",
                     dataobjectids: JSON.stringify([fileid])
                 }                                
             }).done(this.proxy(function(response){
                 if(response.success){
                	 this.freshTable(); 
                 }
             }));
         
    		 
    	 }else{ 
    	  return false; 
    	 } 
    },
    //文件导出
    _exportExcel: function(ent) {
        var trainObj = this.getData();
        var rule = [
                    [{
                        "key": "trainingTarget.id",
                         "op":"in",
                        "value": trainObj.name.length ? trainObj.name:null
                    }],
                    [{
                        "key": "trainingUnit.id",
                        "op":"in",
                        "value": trainObj.department.length ? trainObj.department:null
                    }],
                    [{
                        "key": "trainingTarget.jobName",
                        "op": "like",
                        "value": trainObj.quarters.length ? trainObj.quarters : null
                    }],
                    [{
                        "key": "certificateType",
                        "op":"in",
                        "value": trainObj.certificate_category.length ? trainObj.certificate_category:null
                    }],
                    [{
                        "key": "remainingDays",
                         "op":">",
                        "value": trainObj.minTime ? trainObj.minTime :null
                    }],
                    [{
                        "key": "remainingDays",
                         "op":"<",
                        "value": trainObj.maxTime ? trainObj.maxTime : null
                    }]
                    ];
		        if(trainObj.available === 0){
		        	rule.push([{
		                "key": "remainingDays",
		                "op":"<",
		               "value": 0
		           }]);
		        }else if(trainObj.available === 1){
		        	rule.push([{
		                "key": "remainingDays",
		                "op":">=",
		               "value": 0
		           },{
		               "key": "remainingDays",
		               "op":"is null"
		          }]);
		        };
        var colGetData=this.colGetData();
            colGetData.pop();
            colGetData.splice(colGetData.length+1,1);
            var a=function(colGetData){
           	 var str=[];
           	 for(var i=0;i< colGetData.length;i++){
           		 str.push(colGetData[i].title);
           	 }
           	 var newstr=str;
           	 return newstr;
            }(colGetData);
            colGetData.splice(colGetData.length-1,1);
            this._exportExcelOptions=$.extend(trainObj, colGetData,{
            method: 'exportTrainingRecordsToExcel',
            tokenid: $.cookie('tokenid'),
            dataobject: 'trainingRecord',
           "rule": JSON.stringify(rule),
	        titles: window.encodeURIComponent(JSON.stringify([
				function(colGetData){
				  	 var str=[];
				  	 for(var i=0;i< colGetData.length;i++){
				  		 if(colGetData[i].title!="安全证书"){
				  		 str.push(colGetData[i].title);
				  		 }
				  	 }
				  	 return str;
				   }(colGetData),
			function(colGetData){
				var strr=[];
				 for(var i=0;i< colGetData.length;i++){
					 if(colGetData[i].mData!="files"){
					 strr.push(colGetData[i].mData);
					 }
				 }
				 return strr;
			}(colGetData)             
	        ]))
        });
            /*   
       var form = $("<form/>", {
        	display:"none",
            target: '_blank',
            method: 'post',
            action: $.u.config.constant.smsqueryserver + "?" +$.param(trainObj)
            
        });
        form.appendTo($("body")).submit().remove();*/
	     var form = $("<form/>"), 
	        action = $.urlBuilder($.u.config.constant.smsqueryserver, $.extend({
	            "tokenid": $.cookie("tokenid"),
	            "method": "exportTrainingRecordsToExcel",
	            "columns":JSON.stringify([{"data":"t.lastUpdate"}]),
    	 		"order":JSON.stringify([{"column":0,"dir":"desc"}]),
    	 		"length":5000,
	            "url": window.encodeURIComponent(window.location.host + window.location.pathname + window.location.search)
	        }, this._exportExcelOptions));   
	    form.attr({
	        'style': 'display:none',
	        'method': 'post',
	        'target': '_blank',
	        'action': action
	    });  
	    form.appendTo('body').submit().remove();
        
    },

}, { usehtm: true, usei18n: true });

com.sms.safePromotion.safeTranning.widgetjs = [
                           "../../../uui/widget/uploadify/jquery.uploadify.js",
                           '../../../uui/widget/jqurl/jqurl.js',
                            "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                            "../../../uui/widget/select2/js/select2.min.js",
                            "../../../uui/widget/spin/spin.js",
                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                            "../../../uui/widget/ajax/layoutajax.js"
                            ];
com.sms.safePromotion.safeTranning.widgetcss = [
                                         { path: "../../../uui/widget/select2/css/select2.css" }, 
                                         { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                         { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                                         { path:"../../../uui/widget/uploadify/uploadify.css"}];

