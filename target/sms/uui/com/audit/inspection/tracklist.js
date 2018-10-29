//@ sourceURL=com.audit.inspection.tracklist
$.u.define('com.audit.inspection.tracklist', null, {
    init: function (options) {
    	this._SELECT2_PAGE_LENGTH = 10;
    	this.temp = "<div class='col-md-6 col-lg-6 professionWidget' style='margin-top: 5px;'>"+
						"<div class='col-sm-4 col-md-4 col-lg-4'><input type='checkbox' data-iid='#{id}' style='margin-right: 2px;'><span class='professionName'>#{labelName}</span></div>"+
						"<div class='col-sm-8 col-md-8 col-lg-8 no-left-right-padding'>"+
						"<input type='text' class='form-control input-sm professionUserSelect2' data-id='#{id}'/>"+
						"</div>"+
					"</div>";
        this._requiredProfessions = false;
        this.isclick = true;
        this._DATATABE_LANGUAGE = {
            "sSearch": "搜索:",
            "sZeroRecords": "抱歉未找到记录",
            "sInfoEmpty": "没有数据",
            "sProcessing": "检索中...",
        };
    },
    afterrender: function (bodystr) {
    	this.currdata;
    	this.nameid= JSON.parse($.cookie("userid"));
        this._wkid = $.urlParam().id;
    	if(!this._wkid){
    		window.location.href = "viewSiteInspection.html";
    	}
        this._wkid = parseInt(this._wkid);
    	this.content = this.qid("content");
    	this.form = this.qid("form");
        this.btn_export = this.qid("export");
    	this.btn_export.off("click").on("click",this.proxy(this._export));
        this._initColumn();
    },
    _initColumn : function(){
    	this.traceName = this.qid("traceName");
    	this.traceNo = this.qid("traceNo");
    	this.operator= this.qid("operator");
    	this.address = this.qid("address");
    	this.startDate = this.qid("startDate");
    	this.endDate = this.qid("endDate");
    	this.target = this.qid("target");
    	this.remark = this.qid("remark");
    	this.startDate.add(this.endDate).datepicker({
    		dateFormat:"yy-mm-dd"
    	});
    	this._loadTask();
    },
    _loadTask : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true, 
			{
				"method" : "getTraceById",
				"id" : this._wkid
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
            $(".panel-tips").html(data.conclusion);
            if(data.improve.checkLists.displayfield){
        		this.field=data.improve.checkLists.displayfield;
        	}
            this._disabledAll();
            this._fill(data);
            this.filltable(data);
            if(data.logArea && data.logArea.key){ 
                var clz = $.u.load(data.logArea.key);
                var target = $("<div/>").attr("umid", "logs").appendTo(this.qid("logsContainer"));
                new clz( target, $.extend(true, data.logArea, {
                	businessUrl: this.getabsurl("TrackList.html?id=#{source}"),                    
                    logRule: [[{"key":"source","value": this._wkid}],[{"key":"sourceType","value":"improve"}]],
                    remarkRule: [[{"key":"source","value": this._wkid}],[{"key":"sourceType","value":"improve"}]],
                    remarkObj: {
                        source: this._wkid,
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
    /**
	 * dealCanedit待验证可以编辑 deal待验证不可编辑 hasfinish已完成 deferfinishCanedit未按时完成可编辑
	 * deferfinish未按时完成不可编辑 misleadCanedit暂时无法完成可编辑 mislead暂时无法完成不可编辑
	 */
    filltable:function(data){
    	dealdata=data.improve.checkLists.deal;
    	dealdatact=data.improve.checkLists.dealCanedit;
    	hasfinishdata=data.improve.checkLists.hasfinish;
    	deferfinishdata=data.improve.checkLists.deferfinish;
    	deferfinishdatact=data.improve.checkLists.deferfinishCanedit;
    	misleaddata=data.improve.checkLists.mislead; 
    	misleaddatact=data.improve.checkLists.misleadCanedit; 
    	
    	dealdatact && $.each(dealdatact,this.proxy(function(ids,item){
		 	$.extend(item,{"canedit":true});
	 	}));
    	// 待验证的项目 deal
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
                 { "title": "验证截止日期" ,"mData":"confirmLastDate","sWidth":"80px"}
             ],
           
             "bInfo":false,
             "bDeferRender":false,
             "oLanguage": this._DATATABE_LANGUAGE,
             "aoColumnDefs": [
                  {
                      "aTargets": 0,
                      "orderable":false,
                      "sClass": "checkbox-td",
                      "sContentPadding": "mmm",
                      "mDataProp": "engine", 
                      "sDefaultContent": "--",// 允许给列值一个默认值，只要发现null值就会显示默认值
                      "mRender": function (data, type, full) {
                    	  	var htmls="<div></span><input type='checkbox' name='checkfliter' data-data='"+JSON.stringify(full)+"'/></div>";
                           return  htmls;
                      }
                  },
                  {
                      "aTargets": 1,
                      "sDefaultContent": "--",// 序号
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
                    	 var html='';
                    	 if(full.canedit){
                    		 html="<a href='#'  class='itemPoint' data-data='"+JSON.stringify(full)+"'>"+data+"</a>";
                    	 }else{
                    		 html="<p  class='itemPoint' data-data='"+JSON.stringify(full)+"'>"+data+"</p>";
                    	 }
                          return  html;
                     }
                 },
                 {
                     "aTargets": 3,
                     "mRender": function (data, type, full) {
                    	  return  data;
                     }
                 },{
                     "aTargets": 5,
                     "mRender": this.proxy(function (data, type, full) {
        	            	var htmls=["<ul style='padding-left:15px;'>"];
                     		data && $.each(data,function(idx,item){
                              htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"</span></li>"); 
                            });
                            htmls.push("</ul>");
                            return htmls.join("");
                       ;
                     })
                 },
                 {
                     "aTargets": 6,
                     "mRender": function (data, type, full) {
                    	  return  data;
                     }
                 }
             ],
             "rowCallback": this.proxy(function(row, data, index){
            	 if(data.confirmMan && data.confirmMan.length>0){
            		 $(row).attr("style", "background-color: #dff0d8 !important");
            	 }
            	
             })
         });
    	 if(dealdata.length){
       		 this.dataTable_one.fnAddData(dealdata); 
    	 }
    	 $(".tdidx").each(function(ids,item){
    		 if(item.tagName=="TD"){
    		 	$(item).text(ids);
    		 }
    	 })
    	 this.checkall=$("input[name=checkall]");
     	 this.checkall.off("click").on("click",this.proxy(this._checkall));
     	 this.offset= this.checkall.position();
     	 this.checkfliter=$("input[name=checkfliter]").css("margin-left",this.offset.left*0.8+"px");
     	 this.checkfliter.off("click").on("click",this.proxy(this._checkfliter))
     	 this.batch=this.qid("batch-btn");// 批量修改
    	 this.batch.off("click").on("click",this.proxy(this._detalitemall))
     	 $(".itemPoint",this.dataTable_one).off("click").on("click",this.proxy(this._detalitem));
    	 if(this.field.confirmDate){
			 this.batch.text("批量验证");
		 }else{
			 this.batch.text("批量分配"); 
		 }
    	 // 已验证完成项目 hasfinish
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
                         "aTargets": 0,// 序号
                         "orderable":false,
                         "sClass": "ltdidx",
                         "mRender": function (data, type, full) {
                        	 return  "";
                          
                         }
                   
                     },
                     {
                         "aTargets": 1,
                         "orderable":true,
                         "sClass": "my_checkbox",
                         "sContentPadding": "mmm",
                         "mDataProp": "engine", 
                         "sDefaultContent": "Edit",// 允许给列值一个默认值，只要发现null值就会显示默认值
                         "mRender": function (data, type, full) {
                              return  data;
                          
                         }
                   
                     },
                    {
                        "aTargets": 2,
                        "orderable":false,
                        "mRender": function (data, type, full) {
                             return  data;
                        }
                    },
                    {
                        "aTargets": 3,
                        "mRender": function (data, type, full) {
                        	   var htmls=["<ul style='padding-left:15px;'>"];
		                 		data && $.each(data,function(idx,item){
		                          htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"</span></li>"); 
		                        });
		                        htmls.push("</ul>");
		                        return htmls.join("");
                        }
                    },{
                        "aTargets": 5,
                        "mRender": this.proxy(function (data, type, full) {
                        	  return  data;
                        })
                    }
                ]
            });
		 $(".ltdidx").each(function(ids,item){
			 if(item.tagName=="TD"){
				$(item).text(ids);
			 }
		 })
       // 未按时完成的项目 deferfinish
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
                        "sDefaultContent": "--",// 允许给列值一个默认值，只要发现null值就会显示默认值
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
		                          htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"</span></li>"); 
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
               	// C9E5C1
               	 if(data.confirmMan && data.confirmMan.length>0){
               		// $(row).attr("style", "background-color: #dff0d8
					// !important");
               	 }
                })
           });
         if(deferfinishdata.length){
        	 this.dataTable_three.fnAddData(deferfinishdata); 
         }
    	
      	 // 暂时无法完成的项目 mislead
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
                     "sDefaultContent": "--",// 允许给列值一个默认值，只要发现null值就会显示默认值
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
		                       htmls.push("<li>"+(item.num || "")+" <span class='confirmMan' data-data ='"+JSON.stringify(item)+"'>"+item.name+"</span></li>"); 
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
    	if(misleaddata.length>0){
		 	this.dataTable_four.fnAddData(misleaddata); 
          }
	
    	
    	
    	
    	
    	$("td.deferfinish-two",this.dataTable_three)
    	.add($("td.mislead-two",this.dataTable_four))
    	.each(this.proxy(function(ids,item){
    		idarr=[];
    		$(item).closest("tr").find(".confirmMan").each(function(k,v){
    			$(v).attr("data-data") && idarr.push(JSON.parse($(v).attr("data-data")).id);
    		});
    		if($.inArray(this.nameid,idarr)>-1){
    			$(item).attr("style","cursor: pointer;");
    			$(item).addClass("canedit");
    		}else{
    			$(item).removeAttr("style");
    			$(item).removeClass("canedit");
    			$(item).find("i.glyphicon-pencil").remove();
    		}
    	}))
    	
    	if(this.field && this.isclick ){
        	 if(this.field.confirmDate||this.field.confirmDate=="required"){
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
	    	/*
			 * $e=$(e.currentTarget); $e.css("background-color","#fffdf6");
			 */
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
    	
    /*
	 * $("td.deferfinish-two:hover i.glyphicon").add($("td.mislead-two:hover
	 * i.glyphicon")).css({ "margin": "0", "position": "absolute", "right":
	 * "-44px", "top": "4px", "visibility": "hidden" })
	 * 
	 */
    	
    	
    	
    	
    },
    
    __clickinput:function(e){
    	
    	  tdobj=e.currentTarget;	
    	  if(tdobj.style[0]){
	    	  if(tdobj.tagName!="TD"){
	    		  return false
	    	  }
	    	  tdone = e.currentTarget.parentElement.children[0];
	    	  trwidth= e.currentTarget.parentElement.clientWidth;
	    	  trwidth= trwidth*0.45;
	    	  var val = window.ActiveXObject ? tdobj.innerText : tdobj.textContent;
	    	  var input = document.createElement("TEXTAREA");
			  input.value = val;
			  var $input= $(input);
			  $input.attr("style","resize:none;") ;
			  $input.attr("class","form-control ");
			  $input.attr("rows","3");
			  $input.attr("width","100%");
			  if(e.target.tagName=="TD"){// 防止input 多次点击
				// tdobj.innerHTML = "";
				  $(tdobj).text("");
			  }else{
				  $(e.target).remove();
				  $(tdobj).text("")
			  }
			  tdobj.appendChild(input);
			  input.focus();
			  objid = $(tdone).find("span").attr("ids");
			  $input.bind('keypress',this.proxy(function(event){
		            if(event.keyCode == "13"){
		            	 $tdobj=$(tdobj);
		            	 $tdobj.text(input.value && this._forminputva(input.value)) ;
		            	 $pencil =$("<i class='glyphicon glyphicon-pencil' style='display:block;'></i>");
		            	 $tdobj.append($pencil);
		            	 if(val==input.value){
				  				return false
						  }
						  obj = {"itemPoint":tdone.innerText,"auditSummary":input.value};
						  this._ajaxinput(obj,objid);
		            }}))
			  input.onblur = this.proxy(function(e){
				  $tdobj= $(tdobj);
				 // wid= $tdobj.closest("table").width()*0.45;
				  // $tdobj.text(input.value &&
					// this._forminputva(input.value)).css("width",wid) ;
				  $tdobj.text(input.value);
				  $pencil =$("<i class='glyphicon glyphicon-pencil text-right' style='display:block;'></i>");
				/* $(tdobj).append($pencil); */
				  $pencil.appendTo($tdobj)
				  if(val==input.value){
		  				return false
				  }
				  obj = {"itemPoint":tdone.innerText,"auditSummary":input.value};
				  this._ajaxinput(obj,objid);
			  });
			// input.on("change",this.proxy(this.on_ReadText));
    	  }
    },
    
    on_clickinput : function(e){
		var $e = $(e.currentTarget);// td
		 tdone = e.currentTarget.parentElement.children[0];
		if(!$e.find('textarea').length){
			var value = $e.text();
			
			 var input = document.createElement("TEXTAREA");
			  input.value = value;
			  input.style.rows="3";
			  $(input).attr("class","form-control ");
			  if(e.target.tagName=="TD"){// 防止input 多次点击
				  $e.text("");
				  }else{
					  $(e.target).remove();
					  $e.text("")
				  }
			  e.currentTarget.appendChild(input);
			  input.focus();
			
		/*
		 * $e.text(""); input=$('<textarea class="form-control"
		 * style="resize:none;" rows="3">'+value+'</textarea>');
		 * input.appendTo($e).focus();
		 */
		    objid = $(tdone).find("span").attr("ids");
/*
 * input.blur(this.proxy(function(e){ val=input.val(); if(value==val){ return
 * false } $pencil =$("<i class='glyphicon glyphicon-pencil text-right'></i>");
 * $e.text(val).append($pencil); obj =
 * {"itemPoint":tdone.innerText,"auditSummary":val}; this._ajaxinput(obj,objid);
 * }));
 */
			  input.onblur = this.proxy(function(e){
				  val=input.value;
				  $pencil =$("<i class='glyphicon glyphicon-pencil text-right'></i>");
				  $e.text(val);
				  $pencil.appendTo($e)
				  if(value==val){
		  				return false
				  }
				  obj = {"itemPoint":tdone.innerText,"auditSummary":input.value};
				  this._ajaxinput(obj,objid);
			  })
		}
	},
    
    
	_clickinput : function(e){
		var $e = $(e.currentTarget);
		 tdone = e.currentTarget.parentElement.children[0];
		if(!$e.find('textarea').length){
			var value = $e.text();
			$e.text("");
			input=$('<textarea class="form-control" style="resize:none;" rows="3">'+value+'</textarea>').appendTo($e);
			input.focus();
			objid = $(tdone).find("span").attr("ids");
			input.blur(this.proxy(function(e){
				  val= input.val()
				  $e.text(val);
				  $pencil =$("<i class='glyphicon glyphicon-pencil text-right' style='display:block;'></i>");
				  $pencil.appendTo($e);
				  if(value==val){
		  				return false
				  }
				  obj = {"itemPoint":tdone.innerText,"auditSummary":val};
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
    		s="";
        	for(i=0;i<value.length;i++) { 
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
    // 全选
    _checkall:function(e){
    	if($(e.currentTarget).prop("checked")){
    		$('input[name=checkfliter]').prop("checked", true);
    		if($('input[name=checkfliter]').length){
        		this.batch.removeClass("hidden");
    		}
    	}else{
    		$('input[name=checkfliter]').prop("checked", false);
        	this.batch.addClass("hidden");
    	}
    		
    },
    // 勾选checkbox
    _checkfliter:function(e){
	   	 if($("input[name=checkfliter]:checked").length){
	  		this.batch.removeClass("hidden");
	  	 }else
	  		this.batch.addClass("hidden");
    },
    // 批量详情 Dialog
    _detalitemall:function(e){
    	e.preventDefault();
    	try{
    		var itemPointdata="",confirmRemark='',improveRemark="";
    		var ids=[];
    		var itemPointdataA=[],confirmRemarkA=[],improveRemarkA=[];
    		$('input[name=checkfliter]:checked').each(this.proxy(function(k,v){
    			var fulldata =JSON.parse($(v).attr("data-data"));
    			if(fulldata.canedit){
    				itemPointdata += k+1+"、"+JSON.stringify(fulldata.itemPoint).replace(/\"/g, "")+"\n" ;
    				if($.trim(fulldata.confirmRemark)){
    	    			confirmRemark += k+1+"、"+JSON.stringify(fulldata.confirmRemark).replace(/\"/g, "")+"\n";// confirmRemark:
    				}
    				if($.trim(fulldata.improveRemark)){
        				improveRemark += k+1+"、"+JSON.stringify(fulldata.improveRemark).replace(/\"/g, "")+"\n" ;// improveRemark:
    				}
        			ids.push(fulldata.id);
    			}
    		}));
    		var data=null;
    		if(itemPointdata){
				 data = {"itemPoint":itemPointdata,
						 "id":ids,
						 "confirmRemark":confirmRemark,
						 "improveRemark":improveRemark
						 };
    		}
    		if(!data){
    			return;
    		}
    		if(this.field.confirmDate||this.field.confirmDate=="required"){
    			if(this.itemDialogEditConfirm == null){
        			this._inititemDialogconfirm();
        		}
        		this.itemDialogEditConfirm.open({"all":true,
    								  "data":data,
    								  "filed":this.field,
    								  "wkid": this._wkid,
    								  "title":"验证结论"});
    		}else{
    			if(this.itemDialogEdit == null){
        			this._inititemDialog();
        		}
        		this.itemDialogEdit.open({"all":true,
    								  "data":data,
    								  "filed":this.field,
    								  "wkid": this._wkid,
    								  "title":"验证分派"});
    		}
    	}catch(e){
    		throw new Error("编辑失败[批量详情 Dialog]"+e.message);
    	}
    },
    // 待验证项目详情 Dialog
    _detalitem:function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		if(data.canedit){
    			if(this.field.confirmDate||this.field.confirmDate=="required"){
    	    		if(this.itemDialogEditConfirm == null){
    	    			this._inititemDialogconfirm();
    	    		}
    	    		this.itemDialogEditConfirm.open({
    	    							  "all":false,
    									  "data":data,
    									  "filed":this.field,
    									  "wkid": this._wkid,
    									  "title":"验证结论"});
    	    	}else{
    	    		if(this.itemDialogEdit == null){
    	    			this._inititemDialog();
    	    		}
    	    		this.itemDialogEdit.open({
    	    							  "all":false,
    									  "data":data,
    									  "filed":this.field,
    									  "wkid": this._wkid,
    									  "title":"验证分派"});
    	    	}
    		}
    	}catch(e){
    		throw new Error("编辑失败"+e.message);
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
    	// this.dataTable_one.fnDestroy();
    	/*
		 * .add(this.dataTable_two) .add(this.dataTable_three)
		 * .add(this.dataTable_four).fnDestroy();
		 */
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
    	this._initColumn();
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
                					"id" :this._wkid
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
    		utl=$.u.config.constant.smsqueryserver
        	+"?method=exportTraceToPDF"+"&tokenid="+$.cookie("tokenid")+"&improveId="+this._wkid;
    		var form = $("<form>");
            form.attr('style', 'display:none');
            form.attr('target', '_blank');
            form.attr('method', 'post');
            form.attr('action', utl);
            form.appendTo('body').submit().remove();
    	}catch(e){
    		throw new Error("导出失败"+e.message);
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
    	this.remark.val(data.improve.remark);
    },
    _disabledAll : function(){
    	this.traceName.add(this.traceNo).add(this.target).add(this.address).add(this.startDate).add(this.endDate)
    		.add(this.operator).add(this.remark).attr("disabled","disabled");
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
                                    "dataobjectid" : this._wkid,
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
                                                "id" : this._wkid
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
					"dataobjectid" : this._wkid,
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
}, { usehtm: true, usei18n: false });

com.audit.inspection.tracklist.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
                                          "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                    	   "../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js",
                                        "../../../uui/widget/spin/spin.js", 
                                        "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                        "../../../uui/widget/ajax/layoutajax.js"];
com.audit.inspection.tracklist.widgetcss = [{ path: "../../../uui/widget/select2/css/select2.css" }, 
                                           { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                           { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         { path: "../../../uui/widget/select2/css/select2-bootstrap.css" }];
