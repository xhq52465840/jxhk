//@ sourceURL=com.audit.tracklist.tracklist
$.u.define('com.audit.tracklist.tracklist', null, {
    init: function (options) {
    	this._SELECT2_PAGE_LENGTH = 10;
    	this.i18n = com.audit.tracklist.tracklist.i18n
    	this.temp = "<div class='col-md-6 col-lg-6 professionWidget' style='margin-top: 5px;'>"+
						"<div class='col-sm-4 col-md-4 col-lg-4'><input type='checkbox' data-iid='#{id}' style='margin-right: 2px;'><span class='professionName'>#{labelName}</span></div>"+
						"<div class='col-sm-8 col-md-8 col-lg-8 no-left-right-padding'>"+
						"<input type='text' class='form-control input-sm professionUserSelect2' data-id='#{id}'/>"+
						"</div>"+
					"</div>";
        this._requiredProfessions = false;
        this.isclick = true;
        $.validator.addMethod( "compareDate", function( value, element, params ){
            var $compare = $(params), compareValue = $.trim($compare.val());
            if(value){
                value = new Date(value);
                if(compareValue){
                    compareValue = new Date(compareValue);
                    if(value - compareValue > 0){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return true;
                }
            }
            else{
                return false;
            }
        }, "结束日期小于开始日期");
        
        this._DATATABE_LANGUAGE = { //语言
                "sSearch": this.i18n.search,
                "sZeroRecords": "抱歉未找到记录",
                "sInfoEmpty": "没有数据",
                "sProcessing": ""+this.i18n.searching+"...",
            };
      
    },
    afterrender: function (bodystr) {
    	this.currdata;
    	this.name=JSON.parse($.cookie("uskyuser")).fullname;
    	this.nameid= JSON.parse($.cookie("userid"));
        this._tkid = $.urlParam().id;
    	if(!this._tkid){
    		window.location.href = "../query/workquery/WorkSheet.html";
    	}
        this._tkid = parseInt(this._tkid);
    	this.content = this.qid("content");
    	this.professionContainer = this.qid("professionContainer");
    	this.form = this.qid("form");
        this.baoCun = this.qid("baoCun");
        this.btn_report = this.qid("btn_report");
        this.btn_export = this.qid("export");
    	this.btn_export.off("click").on("click",this.proxy(this._export));
    	this.baoCun.off("click").on("click",this.proxy(this._save));
    	this.btn_report.off("click").on("click",this.proxy(this._report));
        this.professionContainer.off("click", "input:checkbox").on("click", "input:checkbox", this.proxy(this._check));
        
        this.batchAssign=this.qid("batch-assign-btn").off("click").on("click",this.proxy(this.open_batchAssign_dialog));//批量分派
        this.batchConfirm=this.qid("batch-confirm-btn").off("click").on("click",this.proxy(this.open_batchConfirm_dialog));//批量验证
        this._initColumn();
      	this.finish=this.qid("finish").addClass("hidden");
    	this.finish.off("click").on("click",this.proxy(this.finish_btn));
    	 $(".glyphicon-btn").off("click").on("click",this.proxy(function(event){
       		var tar=$(event.currentTarget);
       		tar.closest(".panel-heading").next().slideToggle(600);
       		if(tar.hasClass("glyphicon-minus")){
       			tar.removeClass("glyphicon-minus").addClass("glyphicon-plus");
       		}else{
       			tar.removeClass("glyphicon-plus").addClass("glyphicon-minus");
       		}
       	})).css({"cursor":"pointer"});
    	 
    },
    _check : function(e){
    	var $e = $(e.currentTarget), id = $e.attr("data-iid");
    	if($e.prop("checked")){
    		$('input[data-id='+id+']').select2("enable", true);
    	}
        else{
    		var value = $('input[data-id=' + id + ']').select2("val");
    		var memberV = this.member.select2("val");
            var $label = $e.siblings(".professionName");//获得匹配集合中每个元素的同胞,通过选择器进行筛选是可选的
            if($label.is("a")){
                $label.replaceWith($("<span/>").text($label.text()));
            }
    		$.each(value || [], this.proxy(function(k, v){
    			var index = memberV.indexOf(v);
    			if(index > -1){
    				memberV.splice(index, 1);
    			}
    		}));
    		this.member.select2("val", memberV);
        	$('input[data-id=' + id + ']').select2("val", "").select2("enable", false);
    	}
    },
    _initColumn : function(){
    	this.traceName = this.qid("traceName");
    	this.traceNo = this.qid("traceNo");
    	this.target = this.qid("target");
    	this.address = this.qid("address");
    	this.startDate = this.qid("startDate");
    	this.endDate = this.qid("endDate");
    	this.operator= this.qid("operator");
    	this.method = this.qid("method");
    	this.teamLeader = this.qid("teamLeader");
    	this.standard = this.qid("standard");
    	this.managers = this.qid("managers");
    	this.remark = this.qid("remark");
    	this.member = this.qid("member");
    	this.startDate.add(this.endDate).datepicker({
    		dateFormat:"yy-mm-dd"
    	});
    	this.method.select2({
    		multiple: true,
			data: [{id:'文件审核',text:'文件审核'},{id:'现场检查',text:'现场检查'},{id:'随机提问',text:'随机提问'},{id:'跟班检查',text:'跟班检查'}]
		});
    	this.managers.select2({
    		placeholder: "请选择...",
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getTaskManager",
                        "dataobjectid": this._tkid,
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data,
                            "more": response.data.length > (page * this._SELECT2_PAGE_LENGTH)
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
    	this.member.select2({tags:[]}).on("select2-removing", this.proxy(function(e) {
    		$('input.professionUserSelect2').each(this.proxy(function(k,v){
    			var value = $(v).select2("val");
    			var data = [];
    			if(value.length){
    				var index = value.indexOf(e.val);
    				if(index > -1){
    					value.splice(index,1);
    					value && $.each(value, this.proxy(function(key,item){
    						data.push({"fullname":item});
    					}));
    					$(v).select2("data",data);
    				}
    			}
    		}));
        }));
    	this._loadTask();
    },
    _loadTask : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true, 
			{
				"method" : "getTraceById",
				"id" : this._tkid
			}, 
			this.$, 
			{},
			this.proxy(function(response) {
				if(response.success){
					this.currdata = response.data;
					this._fillFormData(response.data);
				}
			})
		);
    },
    _fillFormData : function(data){
    	if(data){
    		this.content.removeClass("hidden");
    		if(data.flowStatus != "wanCheng"){
    	    	this.btn_report.remove();
    	    }
            this.unitid = parseInt(data.improve.target.id);
            $(".panel-tips").html(data.conclusion);
            if(data.auditScope){
            	$.each(data.auditScope, this.proxy(function(key,item){
            		var $checkbox = $('input[data-iid=' + item.porfessionId + ']');
            		var $member = $('input[data-id=' + item.porfessionId + ']');
            		var $a = $("<a/>").addClass("professionName").text(item.professionName);
                    var data = [];
            		var memberData = [];

                    $checkbox.prop("checked",true);
            		$.each(item.users || [], this.proxy(function(k,v){
            			data.push(v);
            			memberData.push(v.fullname);
            		}));
            		$member.select2("data",data);
                    if(item.checkId){
                        $a.attr("href", this.getabsurl("viewchecklist.html?id=" + item.checkId));
                        $checkbox.siblings(".professionName").replaceWith($a);
                        if(item.checkWorkFlow && item.checkWorkFlow.workflowNodeAttributes && item.checkWorkFlow.workflowNodeAttributes.flowStatus === "cuoShi"){
                            $a.addClass("text-success");
                        }
                    }
            	}));
            }
            if(data.improve.checkLists.displayfield){
        		this.displayfield=data.improve.checkLists.displayfield;
        	}
            this.filltable(data);
        	this._disabledAll();
        	this.finish.addClass("hidden");
    		if(data.actions.length>0 && data.actions[0].wipId){
    			 this.wipId=data.actions[0].wipId;
    		}
        	this._fill(data);
        	
        	this.actions=[];
        	$.each(data.actions,this.proxy(function(idx,item){
        		this.actions.push(item.name);
        	}))
            if(data.workflowNodeAttributes && $.isArray(data.actions) && data.actions.length > 0){
                if(data.workflowNodeAttributes.canDo){
                	$.each(data.workflowNodeAttributes.canDo.split(","), this.proxy(function(k,v){
                        this.canDo(v);
                    }));
                }

                if(data.workflowNodeAttributes.canModify){                  
                    $.each(data.workflowNodeAttributes.canModify.split(","), this.proxy(function(k,v){
                        this.canModify(v);
                    }));
                }

                if(data.workflowNodeAttributes.required){
                    var rules = {}, messages ={};
                    $.each(data.workflowNodeAttributes.required.split(","), this.proxy(function(k,v){
                        if(v === "aCheck"){
                            this._requiredProfessions = true;
                        }
                        else if(this[v]){                        
                            var $label = $("[data-field=" + v + "]"); 
                            rules[v] = { required: true };
                            messages[v] = { required: "该项不能为空" };
                            if(v === "startDate" || v === "endDate"){
                                rules[v] = {
                                    required: true,
                                    date: true,
                                    dateISO: true
                                };
                                messages[v] = {
                                    required: "该项不能为空",
                                    date: "无效日期",
                                    dateISO: "无效日期"
                                }
                                if(v === "endDate"){
                                    rules[v]["compareDate"] = "#" + this._id + "-startDate";
                                    messages[v]["compareDate"] = "结束日期必须大于开始日期";
                                }
                                $label = $("[data-field=startEndDate]");
                            }
                            if($label.children("span.text-danger").length < 1){
                                $("<span class='text-danger'>*</span>").appendTo($label);
                            }
                        }
                    }));
                    this.form.validate({
                        rules: rules,
                        messages: messages,
                        errorClass: "text-danger text-validate-element",
                        errorElement:"div"
                    });
                }
                if(data.workflowNodeAttributes.andor=="OR"){
                	
                }
            }
            
            	
            	this._fillBtn(data.actions);
            	if(data.logArea && data.logArea.key){ 
                var clz = $.u.load(data.logArea.key);
                var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("logsContainer"));
                new clz( target, $.extend(true, data.logArea, {
                	businessUrl: this.getabsurl("TrackList.html?id=#{source}"),                    
                    logRule: [[{"key":"source","value": this._tkid}],[{"key":"sourceType","value":"improve"}]],
                    remarkRule: [[{"key":"source","value": this._tkid}],[{"key":"sourceType","value":"improve"}]],
                    remarkObj: {
                        source: this._tkid,
                        sourceType: "improve"
                    },
                    addable: true,
                    flowid: data.improve.flowId 
                }) );
            }
    	}
        else{
    		this.content.addClass("hidden");
    		$.u.alert.error("没有数据");
    	}
    },
    
    filltable:function(data){
    	var dealdata=data.improve.checkLists.deal;
    	var dealdatact=data.improve.checkLists.dealCanedit;//deal-canedit
    	var hasfinishdata=data.improve.checkLists.hasfinish;
    	var deferfinishdata=data.improve.checkLists.deferfinish;
    	var deferfinishdatact=data.improve.checkLists.deferfinishCanedit;
    	var misleaddata=data.improve.checkLists.mislead; 
    	var misleaddatact=data.improve.checkLists.misleadCanedit; 
    	dealdatact && $.each(dealdatact,this.proxy(function(ids,item){
			 	$.extend(item,{"canedit":true});
		 	}));
    	
    	
    	
    	//待验证的项目  deal
    	 this.dataTable_one = this.qid("completeToDo").dataTable({
             searching: false,
             serverSide: false,
             bProcessing: false,
             ordering: false,
             pageLength : 1000,
             "aaData":dealdatact||[],
             "sDom":"t<i>",
             "columns": [
                 { "title": "<div><span style='padding-left:3px;padding-right:3px'>全选</span><input type='checkbox' name='checkall'/></div>" ,"mData":"id","sWidth":"40px"},
                 { "title": "序号" ,"mData":"id","sWidth":"22px"},
                 { "title": "待验证的项目" ,"mData":"itemPoint","sWidth":"25%"},
                 { "title": "完成情况" ,"mData":"improveRemark","sWidth":"15%"},
                 { "title": "完成日期" ,"mData":"improveDate","sWidth":"60px"},
                 { "title": "验证人员" ,"mData":"confirmMan","sWidth":"60px"},
                 { "title": "截止日期" ,"mData":"confirmLastDate","sWidth":"80px"}
             ],
           
             "bInfo":false,
             "bDeferRender":false,
             "oLanguage": this._DATATABE_LANGUAGE,
             "aoColumnDefs": [
                  {
                      "aTargets": 0,
                      "orderable":false,
                      "sClass": "",
                      "sContentPadding": "mmm",
                      "mDataProp": "engine", 
                      "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                      "mRender": function (data, type, full) {
                    	  	var htmls="<div></span><input type='checkbox' name='checkfliter' data-data='"+JSON.stringify(full)+"'/></div>";
                           return  htmls;
                      }
                  },
                  {
                      "aTargets": 1,
                      "sDefaultContent": "--",//序号
                      "sClass": "tdidx",
                      "orderable":false,
                      "mRender": function (data, type, full) {
                    	  return  "";
                      }
                  },
                 {
                     "aTargets": 2,
                     "sClass": "itemPoint-td",
                     "sDefaultContent": "--",
                     "mRender": function (data, type, full) {
                          return  "<a href='#'  class='itemPoint' data-data='"+JSON.stringify(full)+"'>"+data+"</a>";
                     }
                 },
                 {
                     "aTargets": 3,
                     "mRender": function (data, type, full) {
                    	  return  data||"";
                     }
                 },{
                     "aTargets": 5,
                     "mRender": this.proxy(function (data, type, full) {
        	            	var htmls=["<ul style='padding-left:15px;'>"];
                     		data && $.each(data,function(idx,item){
                              htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"("+item.username+")</span></li>"); 
                            });
                            htmls.push("</ul>");
                            return htmls.join("");
                       ;
                     })
                 },
                 {
                     "aTargets": 6,
                     "mRender": function (data, type, full) {
                    	  return  data||"";
                     }
                 }
             ],
             "rowCallback": this.proxy(function(row, data, index){
            	//C9E5C1 
            	 
            	 if(data.confirmMan && data.confirmMan.length>0){
            		 $(row).attr("style", "background-color: #dff0d8 !important");
            	 }
            	
             })
         });
    	   /* this.dataTable_one.clear();
    	    this.dataTable_one.rows.add(dealdatact).draw();*/
    	 if(dealdata.length>0){
       		 this.dataTable_one.fnAddData(dealdata); 
    	 }
    	 

    	 $(".tdidx").each(function(ids,item){
    		 if(item.tagName=="TD"){
    			// item.innerText=ids;
    		 	$(item).text(ids);
    		 }
    	 })
 
    	 this.checkall=$("input[name=checkall]");
     	 this.checkall.off("click").on("click",this.proxy(this._checkall));
     	 this.offset= this.checkall.position();
     	 this.checkfliter=$("input[name=checkfliter]").css("margin-left",this.offset.left*0.8+"px");
     	 this.checkfliter.off("click").on("click",this.proxy(this._checkfliter))
     	 $(".itemPoint",this.dataTable_one).off("click").on("click",this.proxy(this._detalitem));
    	
     	
         //已验证完成项目  hasfinish
       	 this.dataTable_two = this.qid("completedContainer").dataTable({
                searching: false,
                serverSide: false,
                bProcessing: false,
                ordering: false,
                pageLength : 1000,
                "sDom":"t<i>",
                "columns": [
                    { "title": "序号" ,"mData":"id","sWidth":"30px"},
                    { "title": "已验证完成情况" ,"mData":"itemPoint","sWidth":"140px"},
                    { "title": "验证情况" ,"mData":"improveRemark","sWidth":"60px"},
                    { "title": "验证人员" ,"mData":"confirmMan","sWidth":"60px"},
                    { "title": "验证截止日期" ,"mData":"confirmLastDate","sWidth":"80px"},
                    { "title": "验证完成日期" ,"mData":"confirmDate","sWidth":"80px"},
                    { "title": "验证结论" ,"mData":"confirmResult","sWidth":"60px"}
                ],
                "aaData":hasfinishdata||[],
                "bInfo":false,
                "bDeferRender":false,
                "oLanguage": this._DATATABE_LANGUAGE,
                "fnServerParams": this.proxy(function (aoData) {}),
                "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) { }),
                "aoColumnDefs": [
                     {
                         "aTargets": 0,//序号
                         "orderable":false,
                         "sClass": "ltdidx",
                         "mRender": function (data, type, full) {
                        	 return  "";
                          
                         }
                   
                     },
                     {
                         "aTargets": 1,
                         "orderable":true,
                         "sClass": "",
                         "sContentPadding": "mmm",
                         "mDataProp": "engine", 
                         "sDefaultContent": "Edit",//允许给列值一个默认值，只要发现null值就会显示默认值
                         "mRender": function (data, type, full) {
                        	 var html='';
                        		 html="<a href='#'  class='itemPoint' data-data='"+JSON.stringify(full)+"'>"+data+"</a>";
                              return  html;
                         }
                   
                     },
                    {
                        "aTargets": 2,
                        "orderable":false,
                        "mRender": function (data, type, full) {
                        	  return  data||"";
                        }
                    },
                    {
                        "aTargets": 3,
                        "mRender": function (data, type, full) {
                        	   var htmls=["<ul style='padding-left:15px;'>"];
		                 		data && $.each(data,function(idx,item){
		                          htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"("+item.username+")</span></li>"); 
		                        });
		                        htmls.push("</ul>");
		                        return htmls.join("");
                        }
                    },{
                        "aTargets": 5,
                        "mRender": this.proxy(function (data, type, full) {
                        	  return  data||"";
                        })
                    }
                ]
            });
       	
      
       	 
       	 $(".ltdidx").each(function(ids,item){
    		 if(item.tagName=="TD"){
    			// item.innerText=ids;
    			$(item).text(ids);
    		 }
    	 })
    	 //已验证完成项目  hasfinish
    	  $(".itemPoint",this.dataTable_two).off("click").on("click",this.proxy(this._detail));
    	 
       //未按时完成的项目  deferfinish
    	 deferfinishdatact && $.each(deferfinishdatact,this.proxy(function(ids,item){
    			 	$.extend(item,{"canedit":true});
    		 	}));
      	 this.dataTable_three = this.qid("notInTimeContainer").dataTable({
               searching: false,
               serverSide: false,
               bProcessing: true,
               ordering: false,
               pageLength : 1000,
               "sDom":"t<i>",
               "columns": [
                   { "title": "未按时完成的项目" ,"mData":"itemPoint","sWidth":"40%"},
                   { "title": "验证人员" ,"mData":"confirmMan","sWidth":"20%"},
                   { "title": "审计总结" ,"mData":"auditSummary","sWidth":"30%"}
               ],
               "aaData": deferfinishdatact||[],
               "bInfo":false,
               "bDeferRender":false,
               "oLanguage": this._DATATABE_LANGUAGE,
              
               "aoColumnDefs": [
                    {
                        "aTargets": 0,
                        "sClass": "my_checkbox",
                        "sContentPadding": "mmm",
                        "mDataProp": "engine", 
                        "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                        "mRender": function (data, type, full) {
                        	 var idset=[];
 	                      	full.confirmMan && $.each(full.confirmMan,function(idx,item){
 	                      		idset.push(item.id);
 	                      	})
                        	return	"<span ids="+full.id+" idset="+JSON.stringify(idset)+">"+ data+"</span>";
                        	  
                        }
                  
                    },
                    {
                        "aTargets": 1,
                        "mRender": function (data, type, full) {
                        	   var htmls=["<ul style='padding-left:5px;'>"];
		                 		data && $.each(data,function(idx,item){
		                          htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"("+item.username+")</span></li>"); 
		                        });
		                        htmls.push("</ul>");
		                        return htmls.join("");
                        }
                    },
                   {
                       "aTargets": 2,
                       "sClass": "deferfinish-two",
                       "sDefaultContent": " ",
                       "mRender":this.proxy( function (data, type, full) {
                    	   return   ( data==null ? "":this._forminputva(data))+"<i class='glyphicon glyphicon-pencil text-right' style='display:block;'></i>";
                       })
                   }
               ],
               "rowCallback": this.proxy(function(row, data, index){
               	//C9E5C1 
               	 if(data.confirmMan && data.confirmMan.length>0){
               		// $(row).attr("style", "background-color: #dff0d8 !important");
               	 }
                })
           });
         if(deferfinishdata.length>0){
    		 	this.dataTable_three.fnAddData(deferfinishdata); 
         }
    	
      	 //暂时无法完成的项目  mislead
         
     	misleaddatact && $.each(misleaddatact,this.proxy(function(ids,item){
		 	$.extend(item,{"canedit":true});
	 	}));
    	this.dataTable_four = this.qid("unfinishedContainer").dataTable({
            searching: false,
            serverSide: false,
            bProcessing: true,
            ordering: false,
            pageLength : 10,
            "sDom":"t<i>",
            "columns": [
                { "title": "暂时无法完成的项目" ,"mData":"itemPoint","sWidth":"40%"},
                { "title": "验证人员" ,"mData":"confirmMan","sWidth":"20%", "bVisible": false},
                { "title": "审计总结" ,"mData":"auditSummary","sWidth":"30%"}
            ], 
            "aaData":misleaddatact||[],
            "bInfo":false,
            "bDeferRender":false,
            "oLanguage": this._DATATABE_LANGUAGE,
            "fnServerParams": this.proxy(function (aoData) {}),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
             }),
            "aoColumnDefs": [
                 {
                     "aTargets": 0,
                     "sClass": "my_checkbox",
                     "sContentPadding": "mmm",
                     "mDataProp": "engine", 
                     "sDefaultContent": "--",//允许给列值一个默认值，只要发现null值就会显示默认值
                     "mRender": function (data, type, full) {
	                    	 var idset=[];
	                      	full.confirmMan && $.each(full.confirmMan,function(idx,item){
	                      		idset.push(item.id);
	                      	})
                    	 	return	"<span ids="+full.id+" idset="+JSON.stringify(idset)+">"+ data+"</span>";
                     }
                 },
                 {
                     "aTargets": 1,
                     "mRender": function (data, type, full) {
                    	 var htmls=["<ul style='padding-left:5px;'>"];
		              		data && $.each(data,function(idx,item){
		                       htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"("+item.username+")</span></li>"); 
		                     });
		                     htmls.push("</ul>");
		                     return htmls.join("");
                     }
                 },
                {
                    "aTargets": 2,
                    "sClass": "mislead-two",
                    "mRender":this.proxy( function (data, type, full) {
                    	 return   ( data==null ? "":this._forminputva(data))+"<i class='glyphicon glyphicon-pencil text-right' style='display:block;'></i>";
                    })
                }
            ]
        });
    	//this.dataTable_four.fnAddData(this.dataarray,true);
    
    	
    	if(misleaddata.length>0){
		 	this.dataTable_four.fnAddData(misleaddata); 
          }
	
    	
    	
    	
    	
    	$("td.deferfinish-two",this.dataTable_three)
    	.add($("td.mislead-two",this.dataTable_four))
    	.each(this.proxy(function(ids,item){
    		var idarr=[];
    		var $item=$(item);
    		$item.closest("tr").find(".confirmMan").each(function(k,v){
    			$(v).attr("data-data") && idarr.push(JSON.parse($(v).attr("data-data")).id);
    		});
    		if($.inArray(this.nameid,idarr)>-1){
    			$item.attr("style","cursor: pointer;");
    			$item.addClass("canedit");
    		}else{
    			$item.removeAttr("style");
    			$item.removeClass("canedit");
    			$item.find("i.glyphicon-pencil").remove();
    		}
    	}))
    	
    	if(this.displayfield && this.isclick ){
        	 if(this.displayfield.confirmDate||this.displayfield.confirmDate==="required"){
        		 $(".glyphicon-btn").eq(0)
        		 .add($(".glyphicon-btn").eq(2)).trigger("click");
        	}else{
        		 $(".glyphicon-btn").eq(0)
        	.add($(".glyphicon-btn").eq(2))
        	.add($(".glyphicon-btn").eq(3))
        	.add($(".glyphicon-btn").eq(4)).trigger("click");
        	}
        	 this.isclick=false;
    	}

		$("td.deferfinish-two.canedit",this.dataTable_three)
    	.add($("td.mislead-two.canedit",this.dataTable_four)).off("click").on("click",this.proxy(this._clickinput));
		$("td.deferfinish-two",this.dataTable_three)
    	.add($("td.mislead-two",this.dataTable_four)).off("mouseleave").on("mouseenter",this.proxy(
	    	function(e){
	    	}
    	))
    	
 
    	$("td.deferfinish-two:hover").add($("td.mislead-two:hover")).css({
	    	"background-color": "#fffdf6",	
         	"visibility": "visible"	
    	})
    	
    	
    	$("td.deferfinish-two i.glyphicon-pencil").add($("td.mislead-two i.glyphicon-pencil")).css({
    		"right": "0",
    		"margin-right": "5px",	"padding-right": "5px",
    		"background-color": "transparent",	
	    	"visibility": "visible"	
    	})
    	
    	
    	
    },
    
   
    
	_clickinput : function(e){
		var $e = $(e.currentTarget);
		 tdone = e.currentTarget.parentElement.children[0];
		if(!$e.find('textarea').length){
			var value = $e.text();
			$e.text("");
			var input=$('<textarea class="form-control" style="resize:none;" rows="3">'+value+'</textarea>').appendTo($e);
			input.focus();
			var objid = $(tdone).find("span").attr("ids");
			input.blur(this.proxy(function(e){
					var val= input.val()
				  $e.text(val);
				  var $pencil =$("<i class='glyphicon glyphicon-pencil text-right' style='display:block;'></i>");
				  $pencil.appendTo($e);
				  if(value==val){
		  				return false
				  }
				  var obj = {"itemPoint":tdone.innerText,"auditSummary":val};
				  this._ajaxinput(obj,objid);
			  }));
		}
	},
    _ajaxinput : function(obj,objid){
    	  $.u.ajax({
	            url: $.u.config.constant.smsmodifyserver,
	            type:"post",
	            dataType: "json",
	            data: {
					tokenid:$.cookie("tokenid"),
					method:"stdcomponent.update",
					dataobject: "checkList",
		    		dataobjectid: JSON.stringify(parseInt(objid)),
		    		obj:JSON.stringify(obj)
				}
	        }).done(function (data) {
	        	if(data.success){
	        		
	        	}
	        	
	        }).fail(function (jqXHR, errorText, errorThrown) {

	        });
    },
    
    _forminputva:function(value){
    	if(value){
    		var s="";
        	for(var i=0;i<value.length;i++) { 
        		if(i%60==0){
        		  s+=value.substring(i,i+60)+"\n";
        		}
        	}
        	return s;
    	}
    },
    //
    _clickonblur:function(e){
    	$(e.currentTarget).innerHTML;
    },

    //全选
    _checkall:function(e){
    	if($(e.currentTarget).prop("checked")){
    		$('input[name=checkfliter]').prop("checked", true);
    		/*if($('input[name=checkfliter]').length>1){
        		this.batch.removeClass("hidden");
    		}*/
    	}else{
    		$('input[name=checkfliter]').prop("checked", false);
        	this.batch.addClass("hidden");
    	}
    		
    },
    
    
    
    //已验证完成项目  hasfinish 单个点击查看
    _detail : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		data.itemPoint = data.itemPoint + "\n审计记录：" + data.auditRecord;
    		if(this.itemDialogEditConfirm == null){
    			this._inititemDialogconfirm();
    		}
    		this.itemDialogEditConfirm.open({
    							  "mode":"SHOWDETAIL",
								  "data":data,
								  "title":"验证详情"});
    	}catch(e){
    		throw new Error(com.audit.tracklist.tracklist.i18n.editFail+e.message);
    	}
    },
    //待验证项目详情 Dialog 单个点击查看
    _detalitem:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		data.itemPoint = data.itemPoint + "\n审计记录：" + data.auditRecord;
    		//if(data.canedit){
    			if(this.displayfield.confirmResult||this.displayfield.confirmResult=="required"){
    	    		if(this.itemDialogEditConfirm == null){
    	    			this._inititemDialogconfirm();
    	    		}
    	    		this.itemDialogEditConfirm.open({
    	    			    			  "mode":"EDIT",
    									  "data":$.extend({
	    										  "displayfield":this.displayfield, 
	    										  "tkid": this._tkid,
	    										  "disabled":true,
	    										  },data),
    									  "title":"验证结论"});
    	    	}else{
    	    		if(this.itemDialogEdit == null){
    	    			this._inititemDialog();
    	    		}
    	    		this.itemDialogEdit.open({
		    	    			          "mode":"EDIT",
								           "data":$.extend({
												  "displayfield":this.displayfield, 
												  "tkid": this._tkid,
												  "disabled":true,
												  },data),		
    									  "title":"验证分派"});
    	    	}
    		//}
    	}catch(e){
    		throw new Error(com.audit.tracklist.tracklist.i18n.editFail+e.message);
    	}
  
    },
    _inititemDialog:function(){
    	$.u.load("com.audit.tracklist.itemDialogEdit");
    	this.itemDialogEdit = new com.audit.tracklist.itemDialogEdit($("div[umid='itemDialogEdit']",this.$),null);
    	this.itemDialogEdit.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable_one.fnDraw();
	    		this.dataTable_two.fnDraw();
	    		 this._refresh();
    		})
    	});
    },
    _inititemDialogconfirm:function(){
    	$.u.load("com.audit.tracklist.itemDialogEditConfirm");
    	this.itemDialogEditConfirm = new com.audit.tracklist.itemDialogEditConfirm($("div[umid='itemDialogEditConfirm']",this.$),null);
    	this.itemDialogEditConfirm.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable_one.fnDraw();
	    		this.dataTable_two.fnDraw();
	    		 this._refresh();
    		})
    	});
    },
    
    _refresh:function(){
    	//this.dataTable_one.fnDestroy();
    	/*.add(this.dataTable_two)
    	.add(this.dataTable_three)
    	.add(this.dataTable_four).fnDestroy();*/
    	 if ($.fn.DataTable.isDataTable(this.qid("completeToDo"))) {
             this.qid("completeToDo").dataTable().api().destroy();
             this.qid("completeToDo").empty();
         }
    	 if ($.fn.DataTable.isDataTable(this.qid("completedContainer"))) {
             this.qid("completedContainer").dataTable().api().destroy();
             this.qid("completedContainer").empty();
         }
    	 if ($.fn.DataTable.isDataTable(this.qid("notInTimeContainer"))) {
             this.qid("notInTimeContainer").dataTable().api().destroy();
             this.qid("notInTimeContainer").empty();
         }
    	 if ($.fn.DataTable.isDataTable(this.qid("unfinishedContainer"))) {
             this.qid("unfinishedContainer").dataTable().api().destroy();
             this.qid("unfinishedContainer").empty();
         }
    	this.qid("logsContainer").html("");
    	this._loadTask();
    },
    
    finish_btn : function(e) {
		e.preventDefault();
        var clz = $.u.load("com.audit.comm_file.confirm");
        var confirm = new clz({
            "body": "确认操作？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(e){
                    	e.preventDefault();
                    	if(this.form.valid()){
                    		this._ajax(
                				$.u.config.constant.smsmodifyserver, 
                				true, 
                				{
                					"method" : "operate",
                					"action": this.wipId,
                					"dataobject" :"improve",
                					"id" :this._tkid
                				}, 
                				this.$, 
                				{},
                				this.proxy(function(response) {
                					confirm.confirmDialog.dialog("close");
                					if(response.success){
                						$.u.alert.success("操作成功");
                						 this._refresh();
                					}
                					
                				})
                			);
                    	}        
                    
                    })
                }
            }
        });		
       
	},
    _export: function(e){
    	try{
    		var form = $("<form>");
            form.attr('style', 'display:none');
            form.attr('target', '_blank');
            form.attr('method', 'post');
            form.attr('action', $.u.config.constant.smsqueryserver
                	+"?method=exportTraceToPDF"+"&tokenid="+$.cookie("tokenid")+"&improveId="+this._tkid);
            form.appendTo('body').submit().remove();
    	}catch(e){
    		throw new Error(com.audit.tracklist.tracklist.i18n.exportFail+e.message);
    	}
    	
    
    },
    _fill : function(data){
    	this.traceName.val(data.improve.traceName);
    	this.traceNo.val(data.improve.traceNo);
    	this.target.val(data.improve.target.name);
    	this.operator.val(data.improve.operator.name);
    	this.address.val(data.improve.address);
    	this.startDate.val(data.improve.startDate);
    	this.endDate.val(data.improve.endDate);
    	var v = data.method && data.method.split(",");
    	var d = [];
    	v && $.each(v,function(k,t){
    		d.push({id:t,text:t});
    	});
    	this.method.select2("data",d);
    	this.teamLeader.val(data.teamLeader);
    	this.standard.val(data.standard);
    	this.managers.select2("data",(data.managers ? data.managers[0] : ''));
    	if(data.member){
			var member = data.member.split(",");
		    this.member.select2("val",member);
    	}
    	this.remark.val(data.improve.remark);
    },
    _disabledAll : function(){
    	this.traceName.add(this.traceNo).add(this.target).add(this.address).add(this.startDate).add(this.endDate)
    		.add(this.standard).add(this.teamLeader).add(this.operator).add(this.remark).attr("disabled","disabled");
    	this.member.select2("enable", false);
    	this.managers.select2("enable", false);
    	this.method.select2("enable", false);
    	this.qid("professionContainer").find('input:checkbox').attr("disabled","disabled");
    },
    _validProfession: function(){
        var valid = false; 
        if(this._requiredProfessions === true){
            this.qid("professionContainer").find(":checkbox:checked").each(this.proxy(function(idx, checkbox){
                if($(checkbox).closest(".professionWidget").find("input.professionUserSelect2").select2("data").length > 0){
                    valid = true;
                }
            }));
            if(valid === false){
                $.u.alert.error("审计范围不能为空", 1000 * 3);
            }
        }
        else{
            valid = true;
        }
        return valid;
    },
    canModify : function(data){
    	switch(data){
	    	case "traceName":
	    		this.traceName.removeAttr("disabled");
	    		break;
	    	case "traceNo":
	    		this.traceNo.removeAttr("disabled");
	    		break;
	    	case "target":
	    		this.target.removeAttr("disabled");
	    		break;
	    	case "address":
	    		this.address.removeAttr("disabled");
	    		break;
	    	case "startDate":
	    		this.startDate.removeAttr("disabled");
	    		break;
	    	case "endDate":
	    		this.endDate.removeAttr("disabled");
	    		break;
	    	case "operator":
	    		this.operator.removeAttr("disabled");
	    		break;
	    	case "method":
	    		this.method.select2("enable", true);
	    		break;
	    	case "teamLeader":
	    		this.teamLeader.removeAttr("disabled");
	    		break;
	    	case "standard":
	    		this.standard.removeAttr("disabled");
	    		break;
	    	case "managers":
	    		this.managers.select2("enable", true);
	    		break;
	    	case "member":
	    		this.member.select2("enable", true);
	    		break;
	    	case "remark":
	    		this.remark.removeAttr("disabled");
	    		break;
	    	case "aCheck":
	    		this.qid("professionContainer").find('input:checkbox').removeAttr("disabled").each(this.proxy(function(idx, checkbox){
                    var $checkbox = $(checkbox);
                    if($checkbox.is(":checked")){
                        $checkbox.closest(".professionWidget").find('input.professionUserSelect2').select2("enable",true);
                    }
                }));
	    		break;
    	}
    },
    canDo : function(data){
    	switch(data){
    		case "baoCun":
    			$('button[qid='+data+']').removeClass("hidden");
    			break;
    		case "zhuanFa":
    			$('button[qid='+data+']').removeClass("hidden");
    			break;
    	}
    },
    _fillBtn : function(data){
         $.each(data || [],this.proxy(function(k,v){
              this.baoCun.after('<button class="btn btn-default btn-sm workflow" wipId="'+v.wipId+'">'+v.name+'</button>');
          }));
          $('.workflow').off("click").on("click",this.proxy(this._workflow));
    },
    _workflow : function(e){
        e.preventDefault();
        var data = this._getParam();
        var $e = $(e.currentTarget);
        var id = $e.attr("wipId");
        if(this.form.valid() && this._validProfession()){
            var clz = $.u.load("com.sms.common.confirm");
            var confirm = new clz({
                "body": "确认操作？",
                "buttons": {
                    "ok": {
                        "click": this.proxy(function(){
                            this._ajax(
                                $.u.config.constant.smsmodifyserver, 
                                true, 
                                {
                                    "method" : "updateTask",
                                    "dataobjectid" : this._tkid,
                                    "obj" : JSON.stringify(data)
                                }, 
                                confirm.confirmDialog.parent(), 
                                {},
                                this.proxy(function(response) {
                                    if(response.success){   
                                        this._ajax(
                                            $.u.config.constant.smsmodifyserver, 
                                            true, 
                                            {
                                                "method": "operate",
                                                "tokenid": $.cookie("tokenid"),
                                                "action" : id,
                                                "dataobject" : "task",
                                                "id" : this._tkid
                                            }, 
                                            confirm.confirmDialog.parent(), 
                                            {},
                                            this.proxy(function(response) {
                                                if(response.success){            
                                                    confirm.confirmDialog.dialog("close");            
                                                    $.u.alert.success("操作成功");
                                                    window.location.reload();
                                                }
                                            })
                                        );
                                    }
                                })
                            );
                        })
                    }
                }
            });
    		
    	}
        this.$.find(".select2-container:hidden").show();
    },
    _save : function(e){
    	e.preventDefault();
    	if(this.form.valid() && this._validProfession()){
    		this._ajax(
				$.u.config.constant.smsmodifyserver, 
				true, 
				{
					"method" : "updateTask",
					"dataobjectid" : this._tkid,
					"obj" : JSON.stringify(this._getParam())
				}, 
				this.$, 
				{},
				this.proxy(function(response) {
					if(response.success){
						$.u.alert.success("保存成功");
                        window.location.reload();
					}
				})
			);
    	}        
        this.$.find(".select2-container:hidden").show();
    },
    _report : function(e){
    	e.preventDefault();
    	if(this.form.valid() && this._validProfession()){
    	
    	}        
        this.$.find(".select2-container:hidden").show();
    },
    _getParam : function(){
    	return {
            traceName: this.traceName.val(),
            traceNo: this.traceNo.val(),
            target: this.target.val(),
            address: this.address.val(),
            startDate: this.startDate.val(),
            endDate: this.endDate.val(),
            operator: this.operator.val(),
            method: this.method.val(),
            teamLeader: this.teamLeader.val(),
            standard: this.standard.val(),
            managers: [parseInt(this.managers.select2("val"))],
            remark: this.remark.val(),
            member: this.member.val(),
            auditScope: this._getCheck()
        };
    },
    _getCheck : function(){
      var data = [];
      this.qid("professionContainer").find(':checkbox').each(this.proxy(function(key, item){
          var $e = $(item);
          var id = $e.attr("data-iid");
          var check = $e.prop("checked");
          var $input = $('input[data-id='+id+']');
          var member = $input.select2("val").toString();
          data.push({
              "professionId" : id,
              "checked" : check,
              "member" : member
          });
      }));
      return data;
    },
    
  /*  
   * displayfield
   * sliang:
        confirmDate: "required"验证日期
        verification: "required"验证情况
    	confirmResult: "required"验证结论
    	
    	improveRemark: "readonly"完成情况
    	itemPoint: "readonly"存在问题
    	confirmRemark: "readonly"分派建议
    fhua:
    confirmLastDate: "required"
	confirmMan: "required"
	confirmRemark: ""
	
	itemPoint: "readonly"
    
    
    
    zhanglin:
    confirmDate: "required"
    confirmResult: "required"
	verification: "required"
	
	confirmRemark: "readonly"
	improveRemark: "readonly"
	itemPoint: "readonly"
	
    */
    
    //批量分派
    open_batchAssign_dialog:function(e){
    	e.preventDefault();
    	try{
    		if($('input[name=checkfliter]:checked').length==0){
    			this.alert_warning("请勾选至少一项待分派项目！");
    			return $.u.alert.info("请勾选至少一项待分派项目！",2000)
    		}
    		var itemPointdata="",confirmRemark='',improveRemark="",improveMeasure="";
    		var ids=[];
    		var itemPointdataA=[],confirmRemarkA=[],improveRemarkA=[];
    		$('input[name=checkfliter]:checked').each(this.proxy(function(k,v){
    			var fulldata =JSON.parse($(v).attr("data-data"));
    			if(fulldata.canedit){
    				itemPointdata += k+1+"、"+JSON.stringify(fulldata.itemPoint).replace(/\\n/g," ").replace(/\"/g, "")+"\n"+"审计记录:"+ fulldata.auditRecord+"\n";
    				improveMeasure += k+1+"、"+JSON.stringify(fulldata.improveMeasure).replace(/([1-9]、)/g, "").replace(/\\n/g," ").replace(/\"/g, "")+"\n";
    				if($.trim(fulldata.confirmRemark)){
    	    			confirmRemark += k+1+"、"+JSON.stringify(fulldata.confirmRemark).replace(/\\n/g," ").replace(/\"/g, "")+"\n";// confirmRemark: 分派建议
    				}
    				if($.trim(fulldata.improveRemark)){
        				improveRemark += k+1+"、"+JSON.stringify(fulldata.improveRemark).replace(/\\n/g," ").replace(/\"/g, "")+"\n" ;//improveRemark: 完成情况
    				}
        			ids.push(fulldata.id);
    			}
    		}));
    		var data=null;
    		if(itemPointdata){
    			 data = {"itemPoint":itemPointdata,
    					 "improveMeasure":improveMeasure,
    					 "id":ids,
    					 "confirmRemark":confirmRemark,
    					 "improveRemark":improveRemark
    					 };
    		}
    		if(!data){
    			this.alert_warning("您没有可分派的项目！");
    			return $.u.alert.info("您没有可分派的项目！",2000)
    		}
    		if(!this.displayfield.confirmMan||this.displayfield.confirmMan!="required"){
    			this.alert_warning("您没有可分派的项目！");
    			return $.u.alert.info("您没有可分派的项目！",2000)
    		}
			if(this.itemDialogEdit == null){
    			this._inititemDialog();
    		}
    		this.itemDialogEdit.open({
    						      "mode":"ALL",
								  "data":$.extend({
										  "displayfield":this.displayfield, 
										  "tkid": this._tkid,
										  "disabled":false,
										  },data),
								  "title":"验证分派"});
    		
    	}catch(e){
    		throw new Error("[open_batchAssign_dialog ]"+e.message);
    	}
  
    
    	
    },
    
    //批量验证
    open_batchConfirm_dialog:function(e){
    	e.preventDefault();
    	try{
    		if($('input[name=checkfliter]:checked').length==0){
    			this.alert_warning("请勾选至少一项待验证项目！");
    			return $.u.alert.info("请勾选至少一项待验证项目！",2000)
    		}
    		var itemPointdata="",confirmRemark='',improveRemark="",improveReason="",improveMeasure="";
    		var ids=[];
    		var itemPointdataA=[],confirmRemarkA=[],improveRemarkA=[],confirmManA=[];
    		this.userid=$.cookie("userid");
    		$('input[name=checkfliter]:checked').each(this.proxy(function(k,v){
    			var fulldata =JSON.parse($(v).attr("data-data"));
    			if(fulldata.canedit){
    				var manid=[];
    				$.each(fulldata.confirmMan,this.proxy(function(idy,man){
            			if($.inArray(this.userid,[man.id.toString()]) > -1){
            				manid.push(man.id)
                		}
            		}))
            		if(manid.length==0){
            			return
            		}
    				itemPointdata += k+1+"、"+JSON.stringify(fulldata.itemPoint).replace(/\\n/g," ").replace(/\"/g, "")+"\n"+"审计记录:"+ fulldata.auditRecord+"\n";
    				improveReason += k+1+"、"+JSON.stringify(fulldata.improveReason).replace(/([1-9]、)/g, "").replace(/\\n/g, " ").replace(/\"/g, "")+"\n";
    				improveMeasure += k+1+"、"+JSON.stringify(fulldata.improveMeasure).replace(/([1-9]、)/g, "").replace(/\\n/g, " ").replace(/\"/g, "")+"\n";
    				if($.trim(fulldata.confirmRemark)){
    	    			confirmRemark += k+1+"、"+JSON.stringify(fulldata.confirmRemark).replace(/\\n/g," ").replace(/\"/g, "")+"\n";// confirmRemark: 分派建议
    				}
    				if($.trim(fulldata.improveRemark)){
        				improveRemark += k+1+"、"+JSON.stringify(fulldata.improveRemark).replace(/\\n/g," ").replace(/\"/g, "")+"\n" ;//improveRemark: 完成情况
    				}
        			ids.push(fulldata.id);
    			}
    		}));
    		var data=null;
    		if(itemPointdata){
    			 data = {"itemPoint":itemPointdata,
    					 "improveReason":improveReason,
    					 "improveMeasure":improveMeasure,
    					 "id":ids,
    					 "confirmRemark":confirmRemark,
    					 "improveRemark":improveRemark
    					 };
    		}
    		if(!data){
    			this.alert_warning("您没有可验证的项目！");
    			return $.u.alert.info("您没有可验证的项目！",2000)
    		}
			if(this.itemDialogEditConfirm == null){
    			this._inititemDialogconfirm();
    		}
    		this.itemDialogEditConfirm.open({
    							  "mode":"ALL",
								  "data":$.extend({
										  "displayfield":this.displayfield, 
										  "tkid": this._tkid,
										  "disabled":false,
										  },data),
								  "title":"验证结论"});
    		
    	}catch(e){
    		throw new Error("[open_batchConfirm_dialog] "+e.message);
    	}
    },
    
    
    alert_warning: function(string){
    	$(".alert-warning").find("span").text(string);
		$(".alert-warning").fadeIn("normal").fadeOut(8000);
    },
    
    _ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
			else{
				callback(response);
			}
			

		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
			
		}));
	},
}, { usehtm: true, usei18n: true });

com.audit.tracklist.tracklist.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
                                          "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                    	   "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js"];
com.audit.tracklist.tracklist.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                           { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                           { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
