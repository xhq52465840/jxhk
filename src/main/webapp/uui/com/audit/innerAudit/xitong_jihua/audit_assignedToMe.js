//@ sourceURL=com.audit.innerAudit.xitong_jihua.audit_assignedToMe
$.u.define('com.audit.innerAudit.xitong_jihua.audit_assignedToMe', null, {
    init: function (mode, gadgetsinstanceid) {
    	this.gadgetsinstanceid = gadgetsinstanceid;
    },
    afterrender: function (bodystr) {
    	this.i18n =com.audit.xitong_jihua.audit_assignedToMe.i18n;
        		this.dataTable = this.qid("datatable").dataTable({
                    searching: false,
                    serverSide: true,
                    bProcessing: true,
                    ordering: false,
                    //sScrollY : "470px",
                    //bJQueryUI :true,
                    //sPaginationType :"two_button",
                    
                    pageLength: 10,
                    sDom: "t<ip>",
                    "columns": [
                        { "title": this.i18n.columns.todo_what,"mData":"todoWhat","sWidth":"12%"  },
                        { "title": this.i18n.columns.todo_type_name, "mData": "todoTypeName","sWidth":"5%"  },
                        { "title": this.i18n.columns.todo_title ,"mData":"todoTitle","sWidth":""  },
                        { "title": this.i18n.columns.todo_num,"mData":"todoNum","sWidth":"18%"  },
                        { "title": this.i18n.columns.flow_status,"mData":"flowStatus", "sWidth":"10%" },
                        { "title": this.i18n.columns.last_update,"mData":"lastUpdate","sWidth":"10%"  }
                    ],
                    "aoColumnDefs": [
    					{
    					    "aTargets": 0,
    					    "mRender": function (data, type, full) {
    					    	if(data == null){
                            		data = "";
                            	}
    					    	return "<h5>"+ data + "</h5>";	
    					    }
    					},
                        {
                            "aTargets": 1,
                            "mRender": function (data, type, full) {
                            	if(data == null){
                            		data = "";
                            	}
                            	//return "<a href='#'"+full.todoTypeName+"' class='btn view btn-link' data='"+"'><img src='"+"' width='16' height='16'/>&nbsp;" + data + "</a>";
                            	return "<h5>"+ data + "</h5>";
                            }
                        },
                        {
                            "aTargets": 2,
                            "mRender": function (data, type, full) {
                            	if(data == null){
                            		data = "";
                            	}
                            	if(full.todoName == "check"){//检查单
                            		return "<a href='../worklist/viewchecklist.html?id="+full.id+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            	}else if(full.todoName == "task"){//工作单
                            		if(full.flowStep == "3"){
                            			return "<a href='Xitong_jihua_shengchengshenjibaogao.html?id="+full.id+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}else if(full.flowStep == "4"){
                            			return "<a href='Xitong_jihua_shangchuanshenjibaogao.html?id="+full.id+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}else if(full.flowStep == "5"){
                            			return "<a href='Xitong_jihua_shangchuanshenjibaogao.html?id="+full.id+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}else{
                            			return "<a href='../worklist/viewworklist.html?id="+full.id+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}
                            	}else if(full.todoName == ""){//跟踪表
                            		return "<a href='../tracklist/TrackList.html?id="+full.id+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            	}else if(full.todoName == "plan"){//计划
                            		return "<a href='Xitong_jihua_gongzuotai.html?year="+full.todoNum+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            	}else if(full.todoName == "improve"){//整改单
                            		if(full.flowStep == "1"){
                            			if(full.userType == "transmittedUser"){//三级主管，转发过来的，明细前没有选择框
                            				return "<a href='Xitong_jihua_zhenggaifankui.html?id="+full.id +"&isGroupedByImproveUnit=false&isTransmitted=true"+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            			}else{
                            				return "<a href='Xitong_jihua_zhenggaifankui.html?id="+full.id +"&isGroupedByImproveUnit=true&isTransmitted=false"+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            			}
                            		}else if(full.flowStep == "2"){
                            			return "<a href='Xitong_jihua_zhenggaifankui.html?id="+full.id +"&isGroupedByImproveUnit=false&isTransmitted=false&isDividedByProfession=true"+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}else{
                            			return "<a href='Xitong_jihua_zhenggaifankui.html?id="+full.id +"&isGroupedByImproveUnit=false&isTransmitted=false"+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}
                            		
                            		/*if(full.flowStep == "2"){
                            			return "<a href='Xitong_jihua_zhenggaifankui.html?id="+full.id +"&isDividedByProfession=true"+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}else{
                            			return "<a href='Xitong_jihua_zhenggaifankui.html?id="+full.id +"&isDividedByProfession=false"+"' target='_blank' class='btn view btn-link' data=''/>&nbsp;" + data + "</a>";
                            		}*/
                            	}else if(full.todoName == "subImproveNotice"){
                            		//整改通知单 请不要随便修改
                            		if(full.flowStep == "3"){//填写完成情况时多传一个参数operate
                            			return "<a href='../notice/RectificationFormSubmit.html?operate=completion&id="+full.id +"' target='_blank' style='font-size:15px;'>" + (data||"") + "</a>";
                            		}else{
                            			return "<a href='../notice/RectificationFormSubmit.html?id="+full.id +"' target='_blank' style='font-size:15px;'>" + (data||"") + "</a>";
                            		}
                            	}
                            }
                        },
                        {
                            "aTargets": 3,
                            "mRender": function (data, type, full) {
                            	if(data == null){
                            		data = "";
                            	}
                            	//return "<a href='#'"+full.todoNum+"' class='btn view btn-link' data='"+"'><img src='"+"' width='16' height='16'/>&nbsp;" + data + "</a>";
                            	return "<h5>"+ data + "</h5>";
                            }
                        },{
                            "aTargets": 4,
                            "mRender": function (data, type, full) {
                            	if(data == null){
                            		data = "";
                            	}
                            	//return "<a href='#'"+full.flowStatus+"' class='btn view btn-link' data='"+"'><img src='"+"' width='16' height='16'/>&nbsp;" + data + "</a>";
                            	return "<h5>"+ data + "</h5>";
                            }
                        },
                        {
                            "aTargets": 5,
                            "mRender": this.proxy(function (data, type, full) {
                            	if(data == null){
                            		data = "";
                            	}
                            	//return "<a href='#'"+full.created+"' class='btn view btn-link' data='"+"'><img src='"+"' width='16' height='16'/>&nbsp;" + data + "</a>";
                            	return "<h5>"+ data + "</h5>";
                            })
                        }
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
                        },
                    },
                    "fnServerParams": this.proxy(function (aoData) {
                    	var rule=[];
                    	/*if($.trim(this.usernameContains.val())){
                    		rule.push([{"key":"username","op":"like","value":this.usernameContains.val()}]);
                    	}
                    	if($.trim(this.fullnameContains.val())){
                    		rule.push([{"key":"fullname","op":"like","value":this.fullnameContains.val()}]);
                    	}
                    	if($.trim(this.emailContains.val())){
                    		rule.push([{"key":"email","op":"like","value":this.emailContains.val()}]);
                    	}
                    	if($.trim(this.groupContains.val())){
                    		rule.push([{"key":"userGroup","op":"=","value":parseInt(this.groupContains.val())}]);
                    	}*/
                    	$.extend(aoData,{
                    		"tokenid":$.cookie("tokenid"),
                    		"method":"getTodoList",
                    		"dataobject":"user",
                    		"columns":JSON.stringify(aoData.columns),
                    		"search": JSON.stringify(aoData.search)
                    	},true);
                    }),
                    "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                    	//this.qid("viewcontainer").contents().outerHeight(true);
                    	//this.btnFilter.attr("disabled",true);
                        $.ajax({
                            url: $.u.config.constant.smsqueryserver,
                            type:"post",
                            dataType: "json",
                            cache: false,
                            data: aoData
                        }).done(this.proxy(function (data) {
                            if (data.success) {
                                fnCallBack(data.data);
                                if(window.parent){
                                	try{
                                		window.parent.resizeGadget(this.gadgetsinstanceid, $("body").outerHeight(true));
                                	}catch(e){
                                		throw new Error("invote window.parent.resizeGadget fail");
                                	}
                                }
                            }
                        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                        })).complete(this.proxy(function(){
                        	//this.btnFilter.attr("disabled",false);
                        }));
                    }),
                    "rowCallback": this.proxy(function(row, data, index){
                    	$(row).find("h5").css("font-size","13px");
                        })
                });
        	}
}, { usehtm: true, usei18n: true });
com.audit.innerAudit.xitong_jihua.audit_assignedToMe.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                       '../../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
                                       "../../../../uui/widget/spin/spin.js", 
                                       "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../../uui/widget/ajax/layoutajax.js"];
com.audit.innerAudit.xitong_jihua.audit_assignedToMe.widgetcss = [{id:"",path:"../../../../uui/widget/select2/css/select2.css"},
                                        {id:"",path:"../../../../uui/widget/select2/css/select2-bootstrap.css"},
                                        { path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                        { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];