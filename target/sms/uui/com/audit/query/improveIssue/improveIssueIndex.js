//@ sourceURL=com.audit.query.improveIssue.improveIssueIndex
$.u.load("com.sms.common.confirm");
$.u.define('com.audit.query.improveIssue.improveIssueIndex', null,
{
    init: function (options) {
    	this._SELECT2_PAGE_LENGTH=10;
    	this._DATATABE_LANGUAGE =  { //语言
            "sSearch": "搜索:",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉未找到记录",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
            "sProcessing": "检索中...",
            "oPaginate": {
                "sFirst": "<<",
                "sPrevious": "上一页",
                "sNext": "下一页",
                "sLast": ">>"
            }
    	  }

	    this._LANGUAGE = {
		           	"processing":"数据加载中...",
		           	"info": " _START_ - _END_ of _TOTAL_ ",
		        	"infoEmpty": "0 - 0 of 0 ",
		            "zeroRecords":"无搜索结果",
		           	"infoFiltered":"",
		           	"infoEmpty":"",
		           	"paginate": {
		                   "first": "",
		                   "previous": "<span class='fa fa-caret-left fa-lg'></span>",
		                   "next": "<span class='fa fa-caret-right fa-lg'></span>",
		                   "last": ""
		               }
	           }
  
    },
    afterrender: function () {
    	 this.columnsA=[
                        { "title": "<input type='checkbox' class='all' />" ,"mData":"checkType", "sWidth": "4%", "orderable": false},
                        { "title": "执行单位" ,"mData":"operator", "sWidth": "6%" },
		                 { "title": "责任单位" ,"mData":"improveUnit", "sWidth": "6%" },
		                 { "title": "存在问题" ,"mData":"itemPoint", "sWidth": "7%" },
		                 { "title": "原因类型" ,"mData":"auditReason", "sWidth": "6%" },
		                 { "title": "整改原因" ,"mData":"improveReason", "sWidth": "6%" },
		                 { "title": "整改措施" ,"mData":"improveMeasure", "sWidth": "7%" },
		                 { "title": "验证状态" ,"mData":"confirmResult", "sWidth": "6%"},
		                 { "title": "整改期限" ,"mData":"improveLastDate", "sWidth": "7%" },
		                 { "title": "完成情况" ,"mData":"improveRemark", "sWidth": "7%"},
		                 { "title": "完成日期" ,"mData":"improveDate", "sWidth": "7%"},
		                 { "title": "超期天数" ,"mData":"overdueDays", "sWidth": "6%"},
		                 { "title": "检查状态" ,"mData":"improveItemStatus", "sWidth": "6%"},
		                 { "title": "附件" ,"mData":"files", "sWidth": "6%"},
		                 { "title": "下发日期" ,"mData":"checkStartDate", "sWidth": "7%" }
		             ];
    	 this.columnsB=[//整改原因、措施、验证状态          
                        { "title": "<input type='checkbox' class='all' />" ,"mData":"checkType", "sWidth": "4%", "orderable": false},
                        { "title": "系统分类" ,"mData":"checkType", "sWidth": "6%" },
		                 { "title": "执行单位" ,"mData":"operator", "sWidth": "6%" },
		                 { "title": "被审计单位" ,"mData":"target", "sWidth": "6%" },
		                 { "title": "主要责任单位" ,"mData":"improveUnit", "sWidth": "6%" },
		                 { "title": "存在问题" ,"mData":"itemPoint", "sWidth": "6%" },
		                 { "title": "原因类型" ,"mData":"auditReason", "sWidth": "6%" },
		                 { "title": "整改原因" ,"mData":"improveReason", "sWidth": "6%" },
		                 { "title": "整改措施" ,"mData":"improveMeasure", "sWidth": "6%" },
		                 { "title": "审计结论" ,"mData":"auditResult", "sWidth": "6%"},
		                 { "title": "验证状态" ,"mData":"confirmResult", "sWidth": "6%"},
		                 { "title": "整改期限" ,"mData":"improveLastDate", "sWidth": "6%" },
		                 { "title": "完成情况" ,"mData":"improveRemark", "sWidth": "6%"},
		                 { "title": "完成日期" ,"mData":"improveDate", "sWidth": "6%"},
		                 { "title": "超期天数" ,"mData":"overdueDays", "sWidth": "6%"},
		                 { "title": "审计状态" ,"mData":"improveItemStatus", "sWidth": "6%"},
		                 { "title": "附件" ,"mData":"files", "sWidth": "6%"},
		                 { "title": "下发日期" ,"mData":"auditStartDate", "sWidth": "7%" }
		             ];
    	 this.columnsC=[
                        { "title": "<input type='checkbox' class='all' />" ,"mData":"checkType", "sWidth": "2%", "orderable": false},
                        { "title": "系统分类" ,"mData":"checkType", "sWidth": "8%" },
                        { "title": "执行单位" ,"mData":"operator", "sWidth": "6%" },
		                 { "title": "责任单位" ,"mData":"improveUnit", "sWidth": "7%" },
		                 { "title": "存在问题" ,"mData":"itemPoint", "sWidth": "6%" },
		                 { "title": "原因类型" ,"mData":"auditReason", "sWidth": "6%" },
		                 { "title": "整改原因" ,"mData":"improveReason", "sWidth": "6%" },
		                 { "title": "整改措施" ,"mData":"improveMeasure", "sWidth": "7%" },
		                 { "title": "检查结论" ,"mData":"auditResult", "sWidth": "8%"},
		                 { "title": "验证状态" ,"mData":"confirmResult", "sWidth": "7%"},
		                 { "title": "整改期限" ,"mData":"improveLastDate", "sWidth": "6%" },
		                 { "title": "完成情况" ,"mData":"improveRemark", "sWidth": "7%"},
		                 { "title": "完成日期" ,"mData":"improveDate", "sWidth": "6%"},
		                 { "title": "超期天数" ,"mData":"overdueDays", "sWidth": "6%"},
		                 { "title": "检查状态" ,"mData":"improveItemStatus", "sWidth": "6%"},
		                 { "title": "附件" ,"mData":"files", "sWidth": "6%"},
		                 { "title": "下发日期" ,"mData":"checkStartDate", "sWidth": "7%" }
		             ];
    	 this.columnsD=[
                      	{ "title": "<input type='checkbox' class='all' />" ,"mData":"id", "sWidth": "6%", "orderable": false},
                      	{ "title": "执行单位" ,"mData":"operator", "sWidth": "6%" },
		                { "title": "责任单位" ,"mData":"target", "sWidth": "6%" },
		                { "title": "存在问题" ,"mData":"itemPoint", "sWidth": "8%" },
		                { "title": "整改原因" ,"mData":"improveReason", "sWidth": "6%" },
		                { "title": "整改措施" ,"mData":"improveMeasure", "sWidth": "8%" },
		                { "title": "检查结论" ,"mData":"auditResult", "sWidth": "6%"},
		                { "title": "整改期限" ,"mData":"improveLastDate", "sWidth": "6%" },
		                { "title": "超期天数" ,"mData":"overdueDays", "sWidth": "6%"},
		                /*{ "title": "下发日期" ,"mData":"checkStartDate", "sWidth": "7%" }*/
		             ];
    	$("#navtabs").off("click","a").on("click","a",this.proxy(function(e){
    		var $tar=$(e.target);
    		$tar.attr("style","background-color:#F5F5F5");
    		$tar.parent().siblings().find("a").attr("style","background-color:#fff");
    	}));
    	this.fileList = this.qid("fileList");
    	this.fileUpload = this.qid("fileUpload");
    	this._initofficial();
    	this._initAudit();
    	this._initCheck();
    	this._initTerminal();
    	this._initFileUpload();
    	this._export=$("[name=export]");
		this._export.off("click").on("click",this.proxy(this._exportExcel));
		this.btn_verify = this.qid("btn_verify");
		this.btn_verify.on("click", this.proxy(this._verify));
		this.$.on("click","span.downloadfile",this.proxy(this._download_file));
		this.$.find('.exp-check').off("click").on("click", this.proxy(this._exp_check_excel));
		$("#navtabs").find("a:first").trigger("click");
    },
    //局方
    _initofficial:function(){
    	this.officialpanel            =$("#official");
		this.officialaudittype        =$("[name=audittypeOfficial]",this.officialpanel); //检查类型
		this.officialoperators        =$("[name=operatorsOfficial]",this.officialpanel);//执行单位
		this.officialimproveUnit      =$("[name=improveUnitOfficial]",this.officialpanel);//责任单位
		this.officialimproveItemStatus=$("[name=improveItemStatusOfficial]",this.officialpanel);//检查状态
		this.officialimproveStartDate =$("[name=improveStartDateOfficial]",this.officialpanel);//整改期限
		this.officialimproveEndDate   =$("[name=improveEndDateOfficial]",this.officialpanel);//整改期限
		this.officialcompleteStartDate=$("[name=completeStartDateOfficial]",this.officialpanel);//完成日期
		this.officialcompleteEndDate  =$("[name=completeEndDateOfficial]",this.officialpanel);//完成日期
		this.officialconfirmResult    =$("[name=confirmResultOfficial]",this.officialpanel);//验证状态
		this.officialauditReason 	   =$("[name=auditReasonOfficial]",this.officialpanel);//原因类型
		this._initofficialselect();
		this.btnofficialfilter=this.qid("btn_official_filter");
		this.btnofficialfilter.off("click").on("click",this.proxy(function(ent){
			ent.preventDefault();
			this.freshOfficialTable();
		})).trigger("click");
    },
    //审计
    _initAudit:function(){
    	this.auditpanel            =$("#audit");    //审计
		this.audittype             =$("[name=audittype]",this.auditpanel);  //审计类型
		this.operators             =$("[name=operators]",this.auditpanel);//执行单位
		this.target                =$("[name=target]",this.auditpanel);//被审计单位
		this.auditversion          =$("[name=version]",this.auditpanel);    //审计版本
		this.auditprofession       =$("[name=profession]",this.auditpanel);  //审计专业
		this.auditimproveUnit      =$("[name=improveUnit]",this.auditpanel);//主要责任单位
		this.auditResult           =$("[name=auditResult]",this.auditpanel);//审计结论
		this.auditimproveItemStatus=$("[name=improveItemStatus]",this.auditpanel);//审计状态
		this.auditimproveStartDate =$("[name=improveStartDate]",this.auditpanel);//整改期限
		this.auditimproveEndDate   =$("[name=improveEndDate]",this.auditpanel);//整改期限
		this.auditcompleteStartDate=$("[name=completeStartDate]",this.auditpanel);//完成日期
		this.auditcompleteEndDate  =$("[name=completeEndDate]",this.auditpanel);//完成日期
		this.auditconfirmResult    =$("[name=confirmResult]",this.auditpanel);//验证状态
		this.auditReason 		   =$("[name=auditReason]",this.auditpanel);//原因类型
		this._initauditselect();
		this.btnauditfilter=this.qid("btn_audit_filter");
		this.btnauditfilter.off("click").on("click",this.proxy(function(ent){
			ent.preventDefault();
			this.freshAuditTable();
		})).trigger("click");
    },
    //检查
    _initCheck:function(){
    	this.checkpanel            =$("#check");
		this.checkaudittype        =$("[name=audittype]",this.checkpanel); //检查类型
		this.checkversion          =$("[name=version]",this.checkpanel);//检查版本
		this.checkoperators        =$("[name=operators]",this.checkpanel);//执行单位
		this.checkprofession       =$("[name=profession]",this.checkpanel);//检查专业
		this.checkimproveUnit      =$("[name=improveUnit]",this.checkpanel);//责任单位
		this.checkauditResult      =$("[name=auditResult]",this.checkpanel);//检查结论
		this.checkimproveItemStatus=$("[name=improveItemStatus]",this.checkpanel);//检查状态
		this.checkimproveStartDate =$("[name=improveStartDate]",this.checkpanel);//整改期限
		this.checkimproveEndDate   =$("[name=improveEndDate]",this.checkpanel);//整改期限
		this.checkcompleteStartDate=$("[name=completeStartDate]",this.checkpanel);//完成日期
		this.checkcompleteEndDate  =$("[name=completeEndDate]",this.checkpanel);//完成日期
		this.checkconfirmResult    =$("[name=confirmResult]",this.checkpanel);//验证状态
		this.checkauditReason 	   =$("[name=auditReason]",this.checkpanel);//原因类型
		this._initcheckselect();
		this.btncheckfilter=this.qid("btn_check_filter");
		this.btncheckfilter.off("click").on("click",this.proxy(function(ent){
			ent.preventDefault();
			this.freshCheckTable();
		})).trigger("click");
    },
    //航站审计
    _initTerminal:function(){
    	this.Terminal            =$("#terminal");
		this.$checkversion          =$("[name=version]",this.Terminal);//检查版本
		this.$checkoperators        =$("[name=operators]",this.Terminal);//执行单位
		this.$checkimproveUnit      =$("[name=improveUnit]",this.Terminal);//责任单位
		this.$checkResult      =$("[name=auditResult]",this.Terminal);//检查结论
		this.$checkimproveStartDate =$("[name=improveStartDate]",this.Terminal);//整改期限
		this.$checkimproveEndDate   =$("[name=improveEndDate]",this.Terminal);//整改期限
		this._initterminalselect();
		this.btnterminalfilter=this.qid("btn_terminal_filter");
		this.btnterminalfilter.off("click").on("click",this.proxy(function(ent){
			ent.preventDefault();
			this.freshTerminalTable();
		}));
    },
    //导出验证单
	_exp_check_excel:function(ent){
		var type=$("#navtabs").find("li.active>a").attr("href");
 		var auditType=function(){
			 if(type.indexOf("#") > -1){
				return	type.split("#")[1];
			 }
			 return type||"";
		}();
		var obj = {};
		if(type == '#audit'){
			obj = this.getAuditData();
		}else if (type == '#check'){
			obj = this.getCheckData();
		}else if(type == '#official'){
			obj = this.getOfficialData();
		}else if(type == "#terminal"){
			obj = this.getTerminalData();
		}
		
 		var obj2 = $.param(obj);
 		var actionstr=$.u.config.constant.smsqueryserver+"?method=exportImproveIssueToPdf&tokenid="+
		$.cookie("tokenid") + "&exportType=" + auditType + "&" + obj2+"&order="+JSON.stringify({"checkType":"asc"});
    	var form = $("<form>");
        form.attr('style', 'display:none');
        form.attr('target', '_blank');
        form.attr('method', 'post');
        form.attr('action', actionstr);
        form.appendTo('body').submit().remove();

	},
	//获取局方搜索框数据
	getOfficialData:function(){

		//检查类型
		var audittypevalue=[];
			$.each(this.officialaudittype.val().split(",")||[],this.proxy(function(k,v){
				v && audittypevalue.push(v)
			}))
	  	//执行单位
		var operatorsData = [];
		this.officialoperators.select2("data") && $.each(this.officialoperators.select2("data"), function(k, v){
			operatorsData.push(v.id);
		});
	
		//主要责任单位
	 	var officialimproveUnitValue=[];
		if(this.officialimproveUnit.select2("data")){
			$.each(this.officialimproveUnit.select2("data"),this.proxy(function(idx,item){
				officialimproveUnitValue.push(item.type+item.id)
			}))
		}
	  	//检查状态
	  	var officialimproveItemStatusvalue=[];
		$.each(this.officialimproveItemStatus.val().split(",")||[],this.proxy(function(n,m){
			m && officialimproveItemStatusvalue.push(m)
	  	}));
		//验证状态
		var officialconfirmResultValue=[];
		$.each(this.officialconfirmResult.val().split(",")||[],this.proxy(function(n,m){
			m && officialconfirmResultValue.push(m)
	  	}));
		//原因类型
	  	var auditReasonValue=[];
		$.each(this.officialauditReason.val().split(",")||[],this.proxy(function(n,m){
			m && auditReasonValue.push(m);
	  	}))
	    return obj = {
	    		"issueType":"check",
	    		"littleSource":"["+"BUREAU"+"]",
	    		"auditType": JSON.stringify(audittypevalue),        //检查类型
	    		"operators": JSON.stringify(operatorsData),        //执行单位
	    		"targets": JSON.stringify(officialimproveUnitValue),   //责任单位
	    		"improveItemStatus":JSON.stringify(officialimproveItemStatusvalue),   //检查状态
	    		"improveStartDate":this.officialimproveStartDate.val(),    //整改开始日期
	            "improveEndDate":this.officialimproveEndDate.val(),        //整改结束日期
	            "confirmResult":JSON.stringify(officialconfirmResultValue),     //验证状态    
	            "completeStartDate":this.officialcompleteStartDate.val(),  //完成开始日期
                "completeEndDate":this.officialcompleteEndDate.val(),      //完成结束日期
	    		"auditReason":JSON.stringify(auditReasonValue),          //原因类型
		};
	
	},
	//获取审计搜索框的数据
	getAuditData: function(){
		//审计类型
		var audittypevalue=[];
			$.each(this.audittype.val().split(",")||[],this.proxy(function(k,v){
				v && audittypevalue.push(v)
			}));
		//执行单位
		var operatorsData = [];
		this.operators.select2("data") && $.each(this.operators.select2("data"), function(k, v){
			operatorsData.push(v.id);
		});
		//被审计单位
		var targetData = [];
		this.target.select2("data") && $.each(this.target.select2("data"), function(k, v){
			targetData.push(v.id);
		});
		//版本
		var auditversionvalue=[];
		$.each(this.auditversion.val().split(",")||[],this.proxy(function(n,m){
			m && auditversionvalue.push(parseInt(m))
	  	}))
	  	//审计专业
	  	var professionvalue=[];
		$.each(this.auditprofession.val().split(",")||[],this.proxy(function(n,m){
			m && professionvalue.push(parseInt(m))
	  	}))
	  	//主要责任单位
	  	var improveUnitvalue=[];
		if(this.auditimproveUnit.select2("data")){
			$.each(this.auditimproveUnit.select2("data"),this.proxy(function(idx,item){
				improveUnitvalue.push(item.type+item.id)
			}))
		}
		//审计结论
		var auditResultvalue=[];
		$.each(this.auditResult.val().split(",")||[],this.proxy(function(n,m){
			m && auditResultvalue.push(parseInt(m))
	  	}))
	  	//审计状态
		var auditimproveItemStatusvalue=[];
		$.each(this.auditimproveItemStatus.val().split(",")||[],this.proxy(function(n,m){
			m && auditimproveItemStatusvalue.push(m)
	  	}))
	  	//验证状态
	  	var confirmResultvalue=[];
		$.each(this.auditconfirmResult.val().split(",")||[],this.proxy(function(n,m){
			m && confirmResultvalue.push(m);
	  	}))
	  	//原因类型
	  	var auditReason=[];
		$.each(this.auditReason.val().split(",")||[],this.proxy(function(n,m){
			m && auditReason.push(m);
	  	}))
	  	return obj = {
			    "issueType":"audit",
           		"auditType": JSON.stringify(audittypevalue),      //审计类型
           		"operators": JSON.stringify(operatorsData),       //执行单位
           		"targets": JSON.stringify(targetData),            //被审计单位
                "version":  JSON.stringify(auditversionvalue),     //审计版本
                "profession":JSON.stringify(professionvalue),     //审计专业
        		"improveUnit": JSON.stringify(improveUnitvalue),   //主要责任单位
                "auditResult":JSON.stringify(auditResultvalue),           //审计结论
                "improveItemStatus":JSON.stringify(auditimproveItemStatusvalue),//审计状态
                "improveStartDate":this.auditimproveStartDate.val(),            //整改期限
                "improveEndDate":this.auditimproveEndDate.val(),               	//整改期限
        		"confirmResult":JSON.stringify(confirmResultvalue),             //验证状态
                "completeStartDate":this.auditcompleteStartDate.val(),         //完成开始日期
                "completeEndDate":this.auditcompleteEndDate.val(),              //完成结束日期
                "auditReason":JSON.stringify(auditReason)                      //原因类型
			}
	},
	/**
	 * @ title 获取检查数据
	 */
	getCheckData: function(){
		//检查类型
		var audittypevalue=[];
			$.each(this.checkaudittype.val().split(",")||[],this.proxy(function(k,v){
				v && audittypevalue.push(v)
			}))
		//检查版本
	  	var checkversionvalue=[];
		$.each(this.checkversion.val().split(",")||[],this.proxy(function(n,m){
			m && checkversionvalue.push(parseInt(m))
	  	}))
	  	//执行单位
		var operatorsData = [];
		this.checkoperators.select2("data") && $.each(this.checkoperators.select2("data"), function(k, v){
			operatorsData.push(v.id);
		});
		//检查专业	
	  	var professionvalue=[];
		$.each(this.checkprofession.val().split(",")||[],this.proxy(function(n,m){
			m && professionvalue.push(parseInt(m))
	  	}))
	  	//责任单位	
	  	var checkimproveUnitValue=[];
		/*$.each(this.checkimproveUnit.val().split(",")||[],this.proxy(function(n,m){
			m && checkimproveUnitValue.push(parseInt(m))
	  	}))*/
	  	if(this.checkimproveUnit.select2("data")){
			$.each(this.checkimproveUnit.select2("data"),this.proxy(function(idx,item){
				checkimproveUnitValue.push(item.type+item.id)
			}))
		}
  		//检查结论
	  	var checkauditResultvalue=[];
		$.each(this.checkauditResult.val().split(",")||[],this.proxy(function(n,m){
			m && checkauditResultvalue.push(parseInt(m))
	  	}))
	  	//检查状态
	  	var checkimproveItemStatusvalue=[];
		$.each(this.checkimproveItemStatus.val().split(",")||[],this.proxy(function(n,m){
			m && checkimproveItemStatusvalue.push(m)
	  	}));
		//验证状态
		var checkconfirmResultValue=[];
		$.each(this.checkconfirmResult.val().split(",")||[],this.proxy(function(n,m){
			m && checkconfirmResultValue.push(m)
	  	}));
		//原因类型
	  	var auditReasonValue=[];
		$.each(this.checkauditReason.val().split(",")||[],this.proxy(function(n,m){
			m && auditReasonValue.push(m);
	  	}))
	    return obj = {
	    		"issueType":"check",
	    		"auditType": JSON.stringify(audittypevalue),        //检查类型
	    		"version":  JSON.stringify(checkversionvalue),           //检查版本
	    		"operators": JSON.stringify(operatorsData),        //执行单位
	    		"profession":JSON.stringify(professionvalue),       //检查专业
	    		"targets": JSON.stringify(checkimproveUnitValue),   //责任单位
	    		"auditResult":JSON.stringify(checkauditResultvalue),     //检查结论
	    		"improveItemStatus":JSON.stringify(checkimproveItemStatusvalue),   //检查状态
	    		"improveStartDate":this.checkimproveStartDate.val(),    //整改开始日期
	            "improveEndDate":this.checkimproveEndDate.val(),        //整改结束日期
	            "confirmResult":JSON.stringify(checkconfirmResultValue),     //验证状态    
	            "completeStartDate":this.checkcompleteStartDate.val(),  //完成开始日期
                "completeEndDate":this.checkcompleteEndDate.val(),      //完成结束日期
	    		"auditReason":JSON.stringify(auditReasonValue),          //原因类型
		};
	},
	/**
	 * @title 獲取航站審計數據
	 */
	 getTerminalData:function(){
			//检查版本
		  	var checkversionvalue=[];
			$.each(this.$checkversion.val().split(",")||[],this.proxy(function(n,m){
				m && checkversionvalue.push(parseInt(m))
		  	}))
		  	//执行单位
			var operatorsData = [];
			this.$checkoperators.select2("data") && $.each(this.checkoperators.select2("data"), function(k, v){
				operatorsData.push(v.id);
			});
		  	//责任单位(审计)	
		  	var checkimproveUnitValue=[];
			if(this.$checkimproveUnit.select2("data")){
				$.each(this.$checkimproveUnit.select2("data"),this.proxy(function(idx,item){
					checkimproveUnitValue.push(item.type+item.id)
				}))
			}
		    return obj = {
		    		"issueType":"term",
		    		"version":  JSON.stringify(checkversionvalue),           //检查版本
		    		"operators": JSON.stringify(operatorsData),        //执行单位
		    		"targets": JSON.stringify(checkimproveUnitValue),   //责任单位
		    		"improveStartDate":this.$checkimproveStartDate.val(),    //整改开始日期
		            "improveEndDate":this.$checkimproveEndDate.val(),        //整改结束日期
			};
		
	 },
    _initFileUpload: function () {
    	this.dialog = this.qid("dialog").dialog({
        	title:"批量验证",
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons:[
              {
				  "text":"确认",
				  "click":this.proxy(function(){
					  if(this.fileUpload.data('uploadify').queueData.queueLength){
						  this.fileUpload.uploadify('upload','*');
					  }else{
						 $.u.ajax({
			        		url: $.u.config.constant.smsmodifyserver+"?tokenid="+$.cookie("tokenid")+
			        		"&method=confirmImproveIssue&issueType="+this.issuestype.substring(1)+"&objs="+
			        		JSON.stringify(this.issuesIds),
			                type:"get",
			                dataType: "json",
			                contentType:"multipart/form-data;boundary=1",
			        	}).done(this.proxy(function(response){
			        		if(response.success){

		        				$.u.alert.success("验证成功");
		        				if(this.issuestype === "#audit"){
			        				this.issueaudittable && this.issueaudittable.fnDraw();
			        			}else if(this.issuestype === "#check"){
			        				this.issuechecktable && this.issuechecktable.fnDraw();
			        			}else if(this.issuestype==="#official"){
			        				this.issueofficialtable && this.issueofficialtable.fnDraw();
			        			}else if(this.issuestype==="#terminal"){
			        				this.issueterminaltable && this.issueterminaltable.fnDraw();
			        			}
		        			
			        		    this.dialog.dialog("close");
			        		}
			        	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
			        		
			        	})).complete(this.proxy(function(jqXHR,errorStatus){

			        	}));
					  };
				  })
			  },
       		  {
       			  "text":"取消",
       			  "class":"aui-button-link",
       			  "click":this.proxy(function(){
       				  this.fileUpload.uploadify('cancel', '*');
       				  this.dialog.dialog("close");
       			  })
       		  }
       		],
            open: this.proxy(function () {

            }),
            close: this.proxy(function () {

            }),
            create: this.proxy(function () {
            	this.buildForm();
            })
        });
    },
    buildForm:function(){
    	this.fileUpload.uploadify({
			'auto':false,
			'swf': this.getabsurl('../../../../uui/widget/uploadify/uploadify.swf'),
			'uploader': $.u.config.constant.smsmodifyserver+";jsessionid="+$.cookie("sessionid"),
			'fileTypeDesc':'doc', //文件类型描述
			'fileTypeExts':'*.*',//可上传文件格式 
			'removeCompleted': true,
			'buttonText':'选择附件', //按钮上的字
			'cancelImg':this.getabsurl('../../../../uui/widget/uploadify/uploadify-cancel.png'),
			'height': 25,	//按钮的高度和宽度
			'width': 140,
			'progressData':'speed',
			'method': 'get',
			'removeTimeout': 3,
			'successTimeout': 99999,
			'multi': true, 
			'fileSizeLimit':'10MB',
			'queueSizeLimit':999,
			'simUploadLimit':999,
			'onQueueComplete':this.proxy(function(queueData){
				if(queueData.uploadsErrored < 1){
					this.dialog.dialog("close");
				}else{
					$.u.alert.error(data.reason+"!上传失败", 1000 * 3);
				}
			}),
			'onUploadStart':this.proxy(function(file) {
				var data = {};
				data.method = "confirmImproveIssue";
				data.tokenid = $.cookie("tokenid");
				data.issueType = this.issuestype.substring(1);
				data.objs = JSON.stringify(this.issuesIds);
				this.fileUpload.uploadify('settings','formData',data);
			}),
    		'onUploadSuccess':this.proxy(function(file, data, response) {
    			if(data){
    				data = JSON.parse(data);
        			if(data.success){
        				$.u.alert.success("验证成功");
        				if(this.issuestype === "#audit"){
	        				this.issueaudittable && this.issueaudittable.fnDraw();
	        			}else if(this.issuestype === "#check"){
	        				this.issuechecktable && this.issuechecktable.fnDraw();
	        			}else if(this.issuestype==="#official"){
	        				this.issueofficialtable && this.issueofficialtable.fnDraw();
	        			}else if(this.issuestype==="#terminal"){
	        				this.issueterminaltable && this.issueterminaltable.fnDraw();
	        			}
        			}else{
        				$.u.alert.error(data.reason+"!验证失败", 1000 * 3);
        			}
    			}
    		})
        });
    },
    isNum : function(str){
    	var reg = "^([+-]?)\\d*\\.?\\d+$";
    	return new RegExp(reg).test(str);
    },
    //初始化局方筛选框
    _initofficialselect:function(){

    	var termval="";
    	//检查类型
    	this.officialaudittype.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getCheckGradeForImproveIssue",
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                    	return {
                            "results": termval ? ($.grep(response.data.aaData||[],this.proxy(function(item,idx){
  		                        	return item.name.indexOf(termval) > -1
  		                    	}))):response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	}).on("change",this.proxy(function(){
    		this.officialoperators.select2("data","");
    	}))
    	//执行单位
    	this.officialoperators.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var officialtypeData = this.officialaudittype.select2("data"),
                	arr = [];
                	officialtypeData && $.each(officialtypeData, function(k, v){
                		arr.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getOperatorForImproveIssue",
                        "term": term,
                        "auditType": JSON.stringify(arr),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	this.officialcompleteStartDate
    	.add(this.officialcompleteEndDate)
    	.add(this.officialimproveStartDate)
    	.add(this.officialimproveEndDate).datepicker({"dateFormat":"yy-mm-dd"});
    	//责任单位
    	this.officialimproveUnit.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var audittypeData = this.officialaudittype.select2("data"),
                	operatorsData = this.officialoperators.select2("data"),
                	arr1 = [], arr2 = [];
                	audittypeData && $.each(audittypeData, function(k, v){
                		arr1.push(v.id);
                	});
                	operatorsData && $.each(operatorsData, function(k, v){
                		arr2.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getResponsibilityUnits",
                        "term": term,
                        "auditType": JSON.stringify(arr1),
                        "operators": JSON.stringify(arr2),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	//检查状态
		this.officialimproveItemStatus.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumImproveItemStatus",
                        "term": term,
                        "type":"check",
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
    	})

    	//验证状态:
    	this.officialconfirmResult.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumTraceItemStatus",
                        "term": term,
                        "type":"check",
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
    	})
    	
    	//原因类型
    	this.officialauditReason.select2({
	   		 placeholder: "选择原因类型",
	   		 multiple:true,
	         ajax:{
		        	url: $.u.config.constant.smsqueryserver,
		        	type: "post",
		            dataType: "json",
		        	data: function(term, page){
		        		return {
		        			 tokenid: $.cookie("tokenid"),
	 	                     method: "stdcomponent.getbysearch",
	 	                     dataobject:"auditReason"
		        		};
		    		},
			        results:function(data,page){
			        	if(data.success){
			        		return {results:$.map(data.data.aaData,function(item,idx){
			        			return item;
			        		})};
			        	}
			        }
		        },
		        formatResult: function(item){
		        	return  "<b>"+item.name+"</b> : <samp>"+(item.description||"")+"</samp>";      		
		        },
		        formatSelection: this.proxy(function(item){
		        	return item.name;	        	
		        })
	       
    	})
    
    },
    //初始化审计筛选框
    _initauditselect:function(){
    	var termval="";
    	//审计类型
    	this.audittype.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getPlanTypeForImproveIssue",
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": termval ? ($.grep(response.data.aaData||[],this.proxy(function(item,idx){
  		                        	return item.name.indexOf(termval) > -1
  		                    	}))):response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	}).on("change",this.proxy(function(){
    		this.operators.select2("data","");
    	}));
    	//执行单位
    	this.operators.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var audittypeData = this.audittype.select2("data"),
                	arr = [];
                	audittypeData && $.each(audittypeData, function(k, v){
                		arr.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getOperatorForImproveIssue",
                        "auditType": JSON.stringify(arr),
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	//被审计单位
    	this.target.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                	var audittypeData = this.audittype.select2("data"),
                	operatorsData = this.operators.select2("data"),
                	arr1 = [], arr2 = [];
                	audittypeData && $.each(audittypeData, function(k, v){
                		arr1.push(v.id);
                	});
                	operatorsData && $.each(operatorsData, function(k, v){
                		arr2.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getTargetForImproveIssue",
                        "term": term,
                        "auditType": JSON.stringify(arr1),
                        "operators": JSON.stringify(arr2),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                    	 return {
                             "results": response.data.aaData,
                             "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	//审计版本
    	this.auditversion.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
                        "rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"审计库版本"}],[{"key":"key","value":"当前审计库版本"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                       
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	//审计专业
    	this.auditprofession.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	this.auditcompleteStartDate
    	.add(this.auditcompleteEndDate)
    	.add(this.auditimproveStartDate)
    	.add(this.auditimproveEndDate).datepicker({"dateFormat":"yy-mm-dd"});
    	//主要责任单位
    	this.auditimproveUnit.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getResponsibilityUnits",
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	//审计结论
    	this.auditResult.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"审计结论"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	//审计状态
		this.auditimproveItemStatus.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumImproveItemStatus",
                        "term": term,
                        "type":"audit",
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
    	})
    	
    	
    	//验证状态:
    	this.auditconfirmResult.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumTraceItemStatus",
                        "term": term,
                        "type":"audit",
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
    	})
    	//原因类型
    	this.auditReason.select2({
	   		 placeholder: "选择原因类型",
	   		 multiple:true,
	         ajax:{
		        	url: $.u.config.constant.smsqueryserver,
		        	type: "post",
		            dataType: "json",
		        	data: function(term, page){
		        		return {
		        			 tokenid: $.cookie("tokenid"),
	 	                     method: "stdcomponent.getbysearch",
	 	                     dataobject:"auditReason"
		        		};
		    		},
			        results:function(data,page){
			        	if(data.success){
			        		return {results:$.map(data.data.aaData,function(item,idx){
			        			return item;
			        		})};
			        	}
			        }
		        },
		        formatResult: function(item){
		        	return  "<b>"+item.name+"</b> : <samp>"+(item.description||"")+"</samp>";      		
		        },
		        formatSelection: this.proxy(function(item){
		        	return item.name;	        	
		        })
	       
    	})
    	
    },
    
    
    //初始化检查筛选框
    _initcheckselect:function(){
    	var termval="";
    	//检查类型
    	this.checkaudittype.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getCheckGradeForImproveIssue",
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                    	return {
                            "results": termval ? ($.grep(response.data.aaData||[],this.proxy(function(item,idx){
  		                        	return item.name.indexOf(termval) > -1
  		                    	}))):response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	}).on("change",this.proxy(function(){
    		this.checkoperators.select2("data","");
    	}))
    	//审计版本
    	this.checkversion.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
                        "rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"审计库版本"}],[{"key":"key","value":"当前审计库版本"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                       
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	//
    	this.checkoperators.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var checktypeData = this.checkaudittype.select2("data"),
                	arr = [];
                	checktypeData && $.each(checktypeData, function(k, v){
                		arr.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getOperatorForImproveIssue",
                        "term": term,
                        "auditType": JSON.stringify(arr),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	//审计专业
    	this.checkprofession.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	this.checkcompleteStartDate
    	.add(this.checkcompleteEndDate)
    	.add(this.checkimproveStartDate)
    	.add(this.checkimproveEndDate).datepicker({"dateFormat":"yy-mm-dd"});
    	//责任单位
    	this.checkimproveUnit.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getResponsibilityUnits",
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	//审计结论
    	this.checkauditResult.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"审计结论"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	//检查状态
		this.checkimproveItemStatus.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumImproveItemStatus",
                        "term": term,
                        "type":"check",
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
    	})

    	//验证状态:
    	this.checkconfirmResult.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumTraceItemStatus",
                        "term": term,
                        "type":"check",
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
    	})
    	
    	//原因类型
    	this.checkauditReason.select2({
	   		 placeholder: "选择原因类型",
	   		 multiple:true,
	         ajax:{
		        	url: $.u.config.constant.smsqueryserver,
		        	type: "post",
		            dataType: "json",
		        	data: function(term, page){
		        		return {
		        			 tokenid: $.cookie("tokenid"),
	 	                     method: "stdcomponent.getbysearch",
	 	                     dataobject:"auditReason"
		        		};
		    		},
			        results:function(data,page){
			        	if(data.success){
			        		return {results:$.map(data.data.aaData,function(item,idx){
			        			return item;
			        		})};
			        	}
			        }
		        },
		        formatResult: function(item){
		        	return  "<b>"+item.name+"</b> : <samp>"+(item.description||"")+"</samp>";      		
		        },
		        formatSelection: this.proxy(function(item){
		        	return item.name;	        	
		        })
	       
    	})
    },
    //初始化航站审计筛选框
    _initterminalselect:function(){
    	var termval="";
    	//审计类型
    	this.audittype.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getPlanTypeForImproveIssue",
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": termval ? ($.grep(response.data.aaData||[],this.proxy(function(item,idx){
  		                        	return item.name.indexOf(termval) > -1
  		                    	}))):response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	}).on("change",this.proxy(function(){
    		this.$checkoperators.select2("data","");
    	}));
    	//执行单位
    	this.$checkoperators.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var audittypeData = this.audittype.select2("data"),
                	arr = [];
                	audittypeData && $.each(audittypeData, function(k, v){
                		arr.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getOperatorForImproveIssue",
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	//被审计单位
    	this.target.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                	var audittypeData = this.audittype.select2("data"),
                	operatorsData = this.operators.select2("data"),
                	arr1 = [], arr2 = [];
                	audittypeData && $.each(audittypeData, function(k, v){
                		arr1.push(v.id);
                	});
                	audittypeData && $.each(operatorsData, function(k, v){
                		arr2.push(v.id);
                	});
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getTargetForImproveIssue",
                        "term": term,
                        "auditType": JSON.stringify(arr1),
                        "operators": JSON.stringify(arr2),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                    	 return {
                             "results": response.data.aaData,
                             "more": response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	//审计版本
    	this.$checkversion.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
                        "rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"审计库版本"}],[{"key":"key","value":"当前审计库版本"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                       
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	//审计专业
    	this.auditprofession.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	this.auditcompleteStartDate
    	.add(this.checkcompleteEndDate)
    	.add(this.checkimproveStartDate)
    	.add(this.checkimproveEndDate).datepicker({"dateFormat":"yy-mm-dd"});
    	//主要责任单位
    	this.$checkimproveUnit.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getResponsibilityUnits",
                        "term": term,
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	//审计结论
    	this.$checkResult.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"审计结论"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.iTotalDisplayRecords > (page * this._SELECT2_PAGE_LENGTH)
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
    	})
    	
    	//审计状态
		this.auditimproveItemStatus.select2({
    		placeholder: "选择...",
    		multiple: true,
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	"tokenid": $.cookie("tokenid"),
                        "method": "getEnumImproveItemStatus",
                        "term": term,
                        "type":"audit",
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
    	})
    	
    },
    /**
     * @title 渲染表格
     * @item 局方审计 Official
     */
	 freshOfficialTable:function(){
	    	this._Officialtable();
	    },
   _Officialtable:function(){
	   	if ($.fn.DataTable.isDataTable(this.qid("issueofficialtable"))) {
           this.qid("issueofficialtable").dataTable().api().destroy();
           this.qid("issueofficialtable").empty();
          
       }
	    this.issueofficialtable=this.qid("issueofficialtable").dataTable({
          "dom": 'tip',
          "loadingRecords": "加载中...",  
          "info":true,
          "pageLength": 50,
          "pagingType": "full_numbers",
          "autoWidth": true,
          "processing": false,
          "serverSide": true,
          "bRetrieve": true,
          "ordering": true,
          "language":this._LANGUAGE,
          "columns": this.columnsA,
          "aoColumnDefs": [
							{
							    "aTargets": 0,
							    "mRender": function (data, type, full) {
							    	if(full.confirmResult== "未验证" && full.improveItemStatus== "整改完成"){
							    		return full.editable ? '<input type="checkbox" class="single" data-id="'+full.id+'"/>' : '';
							    	}else{
							    		return  '';
							    	}
							    	
							    }
							},
							{
							    "aTargets": 3,
							    "mRender": function (data, type, full) {
							    	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data||"")+"</div>"
							    }
							},
                           {
                               "aTargets": 4,
                               "mRender": function (data, type, full) {

                               	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-placement='right' >"+(data||"")+"</div>"

                               	//return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(popo||"")+"'  >"+(data||"")+"</div>"

                               }
                           },
                           {
                               "aTargets": 5,
                               "mRender": function (data, type, full) {
                               	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data||"")+"</div>"

                               }
                           },
                           {
                               "aTargets": 6,
                               "mRender": function (data, type, full) {
                               	return "<div style='overflow: hidden; white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"
                               }
                           },
                           {
                               "aTargets": 7,
                               "mRender": function (data, type, full) {
                               	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                               }
                           },
                           {
                               "aTargets": 9,
                               "mRender": function (data, type, full) {
                               	  return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data||"")+"</div>"
                               }
                           },
                           {
                               "aTargets": 11,
                               "bSortable": false,
                               "mRender": function (data, type, full) {
                               	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;color:red;text-align:center' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                               }
                           },
                           {
                               "aTargets": 12,
                               "mRender": function (data, type, full) {
                               	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                               }
                           },
                           {
                               "aTargets": 13,
                               "bSortable": false,
                               "mRender": function (data, type, full) {
                               	var arr = ['<ul>'];
                               	data && $.each(data, function(k, v){
                               		arr.push('<li>'+
                               				"<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(v.fileName||"")+"'  >"+
                               				'<span class="downloadfile" fileid="'+v.id+'" >'+v.fileName.substring(0,4)+'...</span></div></li>');
                               	});
                               	arr.push('</ul>');
                               	return arr.join('');
                               }
                           }
                       ],
          "ajax": this.proxy(function (data, callback, settings) {
		        	   var order = {}, oorder={}, column = '', dir = '';
		               if(data.order.length){
		            	   order = data.order[0];
		            	   column = data.columns[order['column']]['data'];
		            	   dir = order.dir;
		            	   oorder[column]= dir;
		               }
		               delete data.order;
		               delete data.columns;
		               delete data.draw;
		               delete data.search;  
		               var officialObj = this.getOfficialData();
		               console.log(officialObj);
		          	 this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
	        		 "order":JSON.stringify(oorder),
	           		"method": "getImproveIssueList"
	            	},officialObj),this.qid("issueofficialtable").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
	            			if(response.success){
	                      		 callback({
	 	                      		"recordsFiltered":response.data.iTotalDisplayRecords,
	 	                      		"data":response.data.aaData
	 	                      	});
	                       	}
	           	}));
       	  }),
          "headerCallback": this.proxy(function( thead, data, start, end, display ) {
          }),
           "rowCallback": this.proxy(function(row, data, index){
           	$(row).data("all_data", [data.checkType, data.operator, data.improveUnit, data.itemPoint,
           	                    	 data.auditReason, data.improveReason, data.improveMeasure, data.auditResult, data.confirmResult,
           	                    	 data.improveLastDate, data.improveRemark, data.improveDate, data.improveItemStatus]);
          	$('[data-toggle="popover"]',$(row)).popover({
             html: 'true',
             trigger: 'hover',
             content: function(){
		            	  var  popo=data.itemPoint;
		            	  if(data.itemPoint.indexOf("\n检查记录")>-1){
		          	   			var ind=data.itemPoint.indexOf("\n检查记录");
		          	   			popo=data.itemPoint.slice(0,ind) + "<br>"+data.itemPoint.slice(ind);
		            	  }
		            	  return popo;
		              },
          		});
        })
      });
	    this.issueofficialtable.off("click", "input.all").on("click", "input.all", this.proxy(function(e){
	    	var $e = $(e.currentTarget), check = $e.prop("checked");
	    	this.issueofficialtable.find('input.single').prop("checked", check);
	    	return ;
	    }));
   },
   
    //审计
    freshAuditTable:function(){
    	this._Audittable();
    },
	_Audittable:function(e){
	   	if ($.fn.DataTable.isDataTable(this.qid("issueaudittable"))) {
            this.qid("issueaudittable").dataTable().api().destroy();
            this.qid("issueaudittable").empty();
            
        }
	    this.issueaudittable=this.qid("issueaudittable").dataTable({
           "dom": 'tip',
           "loadingRecords": "加载中...",  
           "info":true,
           "pageLength": 50,
           "pagingType": "full_numbers",
           "autoWidth": true,
           "processing": false,
           "serverSide": true,
           "bRetrieve": true,
           "ordering": true,
           "language":this._LANGUAGE,
           "columns": this.columnsB,
           "aoColumnDefs": [
							{
							    "aTargets": 0,
							    "mRender": function (data, type, full) {
							    	if(full.confirmResult=="未验证" && full.improveItemStatus=="整改完成"){
								    	return full.editable ? '<input type="checkbox" class="single" data-id="'+full.id+'"/>' : '';		
							    	}else{
							    		return "";
							    	}
							    }
							},
                            {
                                "aTargets": 5,
                                "mRender": function (data, type, full) {  
                                	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+((data ||"") + "<br>审计记录："+(full.auditRecord || ""))+"'  >"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets": 6,
                                "mRender": function (data, type, full) { 
                                	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets":7,
                                "mRender": function (data, type, full) {
                                	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"
                                }
                            },
                            {
                                "aTargets": 8,
                                "mRender": function (data, type, full) {
                              	return "<div style='overflow: hidden;white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"
                                }
                            },
                            {
                                "aTargets": 12,
                                "mRender": function (data, type, full) {
                            	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                                }
                            },
                             {
                                "aTargets": 14,
                                "bSortable": false,
                                "mRender": function (data, type, full) {
                            	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;color:red;text-align:center' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets": 16,
                                "bSortable": false,
                                "mRender": function (data, type, full) {
                                   	var arr = ['<ul>'];
                                   	data && $.each(data, function(k, v){
                                   		arr.push('<li>'+
                                   				"<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(v.fileName||"")+"'  >"+
                                   				'<span class="downloadfile" fileid="'+v.id+'" >'+v.fileName.substring(0,4)+'...</span></div></li>');
                                   	});
                                   	arr.push('</ul>');
                                   	return arr.join('');
                                   }
                            }
                        ],
           "ajax": this.proxy(function (data, callback, settings) {
		               var order = {}, oorder={}, column = '', dir = '';
		               if(data.order.length){
		            	   order = data.order[0];
		            	   column = data.columns[order['column']]['data'];
		            	   dir = order.dir;
		            	   oorder[column]= dir;
		               }
		               delete data.columns;
		               delete data.draw;
		               delete data.search;
		               var auditObj = this.getAuditData();
	        	   this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
   	        		"order":JSON.stringify(oorder),
	           		"method": "getImproveIssueList"
	            	}, auditObj),this.qid("issueaudittable").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
	            			if(response.success){
	                      		 callback({
	 	                      		"recordsFiltered":response.data.iTotalDisplayRecords,
	 	                      		"data":response.data.aaData
	 	                      	});
	                       	}
	           	}));
        	  }),
           "headerCallback": this.proxy(function( thead, data, start, end, display ) {
           }),
            "rowCallback": this.proxy(function(row, data, index){
            	$(row).data("all_data", [data.checkType, data.improveUnit, data.operator, data.target, data.itemPoint,
            	 data.auditReason, data.improveReason, data.improveMeasure, data.auditResult, data.confirmResult,
            	 data.improveLastDate, data.improveRemark, data.improveDate, data.improveItemStatus]);
            	 $('[data-toggle="popover"]',$(row)).popover({
                     html: 'true',
                     trigger: 'hover',
                 });
         })
       });
	    this.issueaudittable.off("click", "input.all").on("click", "input.all", this.proxy(function(e){
	    	var $e = $(e.currentTarget), check = $e.prop("checked");
	    	this.issueaudittable.find('input.single').prop("checked", check);
	    	return ;
	    }));
	},
	//检查
	 freshCheckTable:function(){
	    	this._Checktable();
	    },
    _Checktable:function(){
	   	if ($.fn.DataTable.isDataTable(this.qid("issuechecktable"))) {
            this.qid("issuechecktable").dataTable().api().destroy();
            this.qid("issuechecktable").empty();
           
        }
	    this.issuechecktable=this.qid("issuechecktable").dataTable({
           "dom": 'tip',
           "loadingRecords": "加载中...",  
           "info":true,
           "pageLength": 50,
           "pagingType": "full_numbers",
           "autoWidth": true,
           "processing": false,
           "serverSide": true,
           "bRetrieve": true,
           "ordering": true,
           "language":this._LANGUAGE,
           "columns": this.columnsC,
           "aoColumnDefs": [
							{
							    "aTargets": 0,
							    "mRender": function (data, type, full) {
							    	if(full.confirmResult =="未验证" && full.improveItemStatus=="整改完成"){
								    	return full.editable ? '<input type="checkbox" class="single" data-id="'+full.id+'"/>' : '';	
							    	}else{
							    		return "";
							    	}
							    }
							},
							{
							    "aTargets": 3,
							    "mRender": function (data, type, full) {
							    	if(data.indexOf("$")>-1){
                                			return data.split("$").join("<br>")||"";
                                	}
							    		return data||""
							    }
							},
                            {
                                "aTargets": 4,
                                "mRender": function (data, type, full) {

                                	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-placement='right' >"+(data||"")+"</div>"

                                	//return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(popo||"")+"'  >"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets": 5,
                                "mRender": function (data, type, full) {
                                	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets": 6,
                                "mRender": function (data, type, full) {
                                	return "<div style='overflow: hidden; white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"
                                }
                            },
                            {
                                "aTargets": 7,
                                "mRender": function (data, type, full) {
                                	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets": 8,
                                "mRender": function (data, type, full) {
                                	return data||""
                                }
                            },
                            {
                                "aTargets": 11,
                                "mRender": function (data, type, full) {
                                	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets": 13,
                                "bSortable": false,
                                "mRender": function (data, type, full) {
                                	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;text-align:center;color:red' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                                }
                            },
                            {
                                "aTargets": 15,
                                "bSortable": false,
                                "mRender": function (data, type, full) {
                                   	var arr = ['<ul>'];
                                   	data && $.each(data, function(k, v){
                                   		arr.push('<li>'+
                                   				"<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(v.fileName||"")+"'  >"+
                                   				'<span class="downloadfile" fileid="'+v.id+'" >'+v.fileName.substring(0,4)+'...</span></div></li>');
                                   	});
                                   	arr.push('</ul>');
                                   	return arr.join('');
                                   }
                            }
                        ],
           "ajax": this.proxy(function (data, callback, settings) {
		        	   var order = {}, oorder={}, column = '', dir = '';
		               if(data.order.length){
		            	   order = data.order[0];
		            	   column = data.columns[order['column']]['data'];
		            	   dir = order.dir;
		            	   oorder[column]= dir;
		               }
		               delete data.order;
		               delete data.columns;
		               delete data.draw;
		               delete data.search;  
		               var checkObj = this.getCheckData();
		               
		          	 this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
	        		 "order":JSON.stringify(oorder),
	           		"method": "getImproveIssueList"
	            	},checkObj),this.qid("issuechecktable").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
	            			if(response.success){
	                      		 callback({
	 	                      		"recordsFiltered":response.data.iTotalDisplayRecords,
	 	                      		"data":response.data.aaData
	 	                      	});
	                       	}
	           	}));
        	  }),
           "headerCallback": this.proxy(function( thead, data, start, end, display ) {
           }),
            "rowCallback": this.proxy(function(row, data, index){
            	$(row).data("all_data", [data.checkType, data.operator, data.improveUnit, data.itemPoint,
            	                    	 data.auditReason, data.improveReason, data.improveMeasure, data.auditResult, data.confirmResult,
            	                    	 data.improveLastDate, data.improveRemark, data.improveDate, data.improveItemStatus]);
           	$('[data-toggle="popover"]',$(row)).popover({
              html: 'true',
              trigger: 'hover',
              content: function(){
		            	  var  popo=data.itemPoint;
		            	  if(data.itemPoint.indexOf("\n检查记录")>-1){
		          	   			var ind=data.itemPoint.indexOf("\n检查记录");
		          	   			popo=data.itemPoint.slice(0,ind) + "<br>"+data.itemPoint.slice(ind);
		            	  }
		            	  return popo;
		              },
           		});
         })
       });
	    this.issuechecktable.off("click", "input.all").on("click", "input.all", this.proxy(function(e){
	    	var $e = $(e.currentTarget), check = $e.prop("checked");
	    	this.issuechecktable.find('input.single').prop("checked", check);
	    	return ;
	    }));
    },
    
    //航站审计
	 freshTerminalTable:function(){
	    	this._Terminaltable();
	    },
 _Terminaltable:function(){
	   	if ($.fn.DataTable.isDataTable(this.qid("issueterminaltable"))) {
         this.qid("issueterminaltable").dataTable().api().destroy();
         this.qid("issueterminaltable").empty();
         
     }
	    this.issueterminaltable=this.qid("issueterminaltable").dataTable({
        "dom": 'tip',
        "loadingRecords": "加载中...",  
        "info":true,
        "pageLength": 50,
        "pagingType": "full_numbers",
        "autoWidth": true,
        "processing": false,
        "serverSide": true,
        "bRetrieve": true,
        "ordering": false,
        "language":this._LANGUAGE,
        "columns": this.columnsD,
        "aoColumnDefs": [
							{
							    "aTargets": 0,
							    "mRender": function (data, type, full) {
							    	return full.editable ? '<input type="checkbox" class="single" data-id="'+full.id+'"/>' : '';
							    }
							},
							{
							    "aTargets": 3,
							    "mRender": function (data, type, full) {
							    	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-placement='right' >"+(data||"")+"</div>"
							    }
							},
                         {
                             "aTargets": 4,
                             "mRender": function (data, type, full) {
                             	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-placement='right' >"+(data||"")+"</div>"
                             }
                         },
                         {
                             "aTargets": 5,
                             "mRender": function (data, type, full) {
                             	return "<div style='overflow: hidden; white-space: nowrap;text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'  data-placement='right' data-content='"+(data ||"")+"'>"+(data||"")+"</div>"

                             }
                         },
                         {
                             "aTargets": 6,
                             "mRender": function (data, type, full) {
                             	return "<div style='overflow: hidden; white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"
                             }
                         },
                         {
                             "aTargets": 7,
                             "mRender": function (data, type, full) {
                             	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                             }
                         },
                          {
                             "aTargets": 8,
                             "bSortable": false,
                             "mRender": function (data, type, full) {
                             	  return "<div style='overflow: hidden;white-space: nowrap;  text-overflow: ellipsis;text-align:center;color:red' data-toggle='popover' data-trigger='hover'   data-placement='right' data-content='"+(data||"")+"'  >"+(data||"")+"</div>"

                             }
                         }
                     ],
        "ajax": this.proxy(function (data, callback, settings) {
		        	   var order = {}, oorder={}, column = '', dir = '';
		               if(data.order.length){
		            	   order = data.order[0];
		            	   column = data.columns[order['column']]['data'];
		            	   dir = order.dir;
		            	   oorder[column]= dir;
		               }
		               delete data.order;
		               delete data.columns;
		               delete data.draw;
		               delete data.search;  
		               var checkObj = this.getTerminalData();
		               
		          	 this._ajax($.u.config.constant.smsqueryserver,$.extend({},data,{
	        		 "order":JSON.stringify(oorder),
	           		"method": "getImproveIssueList"
	            	},checkObj),this.qid("issueterminaltable").parent(),{size:2,backgroundColor:"#fff"},this.proxy(function(response){
	            			if(response.success){
	                      		 callback({
	 	                      		"recordsFiltered":response.data.iTotalDisplayRecords,
	 	                      		"data":response.data.aaData
	 	                      	});
	                       	}
	           	}));
     	  }),
        "headerCallback": this.proxy(function( thead, data, start, end, display ) {
        }),
         "rowCallback": this.proxy(function(row, data, index){
         	$(row).data("all_data", [ data.operator, data.improveUnit,
         	                    	 data.auditReason, data.improveReason, data.improveMeasure, data.auditResult,
         	                    	 data.improveLastDate]);
        	$('[data-toggle="popover"]',$(row)).popover({
           html: 'true',
           trigger: 'hover',
           content: function(){
		            	  var  popo=data.itemPoint;
		            	  if(data.itemPoint.indexOf("\n检查记录")>-1){
		          	   			var ind=data.itemPoint.indexOf("\n检查记录");
		          	   			popo=data.itemPoint.slice(0,ind) + "<br>"+data.itemPoint.slice(ind);
		            	  }
		            	  return popo;
		              },
        		});
      })
    });
	    this.issueterminaltable.off("click", "input.all").on("click", "input.all", this.proxy(function(e){
	    	var $e = $(e.currentTarget), check = $e.prop("checked");
	    	this.issueterminaltable.find('input.single').prop("checked", check);
	    	return ;
	    }));
 },
    
    _verify: function(){
    	var type=$("#navtabs").find("li.active>a").attr("href");
		var $type=$(type), checkArr = $type.find('input.single:checked');
		this.issuesIds = [], this.issuestype = type;
		if(checkArr.length){
			$.each(checkArr, this.proxy(function(k, v){
				if ("#audit" === this.issuestype) {
					this.issuesIds.push({
						id: $(v).data("id"),
						confirmResult: "COMFIRM_PASSED"
					});
				} else if ("#check" === this.issuestype) { 
					this.issuesIds.push({
						id: $(v).data("id"),
						traceFlowStatus: "COMFIRM_PASSED"
					});
				}else if("#official"===this.issuestype){
					this.issuesIds.push({
						id: $(v).data("id"),
						traceFlowStatus: "COMFIRM_PASSED"
					});
				}else if("terminal"===this.issuestype){
					this.issuesIds.push({
						id: $(v).data("id"),
						traceFlowStatus: "COMFIRM_PASSED"
					});
				}
			}));
			this.dialog.dialog("open");
		}else{
			$.u.alert.info("未选择任何数据", 3000);
			return;
		}
    },
	_exportExcel:function(ent){
		this.columns="";
		this.order={};
		var type=$("#navtabs").find("li.active>a").attr("href"),
		    $type=$(type), checkArr = $type.find('input.single:checked');
			if(type == '#audit'){
				this.columns=this.columnsB;
				this.order={checkType: "asc"};
				 var obj = this.getAuditData();
			}else if (type == '#check'){
				this.columns=this.columnsC;
				this.order={checkType: "asc"};
				 var obj = this.getCheckData();
			}else if(type == '#official'){
				this.columns=this.columnsA;
				this.order={checkType: "asc"};
				var obj = this.getOfficialData();
			}else if(type == '#terminal'){
				this.columns=this.columnsD;
				var obj = this.getTerminalData();
			}
	    var obj2 = obj;
	    this.columns.splice(0,1);
	    $.each(this.columns,this.proxy(function(idx,item){
	    	if(item && item.mData=="files"){
	    		this.columns.splice(idx,1);
	    	} 
	     }));
	    mycolumns=[[],[]];
	    for(i in this.columns){
	    	mycolumns[0].push(this.columns[i].title);
	    	mycolumns[1].push(this.columns[i].mData);
	    }
	    var form = $("<form/>");
    	var DATA=[
    	            {name:"tokenid",data:$.cookie("tokenid")},
		            {name:"method",data:"exportImproveIssueToExcel"},
		            {name:"url",data:$.u.config.constant.smsqueryserver},
		            {name:"titles",data:JSON.stringify(mycolumns)},
		            {name:"order",data:JSON.stringify(this.order)},
		            {name:"length",data:5000},
		            ];
    	$.each(obj2,function(idx,item){
    		DATA.push({name:idx,data:item})
    	});
    	for(var i in DATA){  
			 var input = document.createElement("input");  
			  input.type = "hidden";  
			  input.name = DATA[i].name;  
			  input.value = DATA[i].data;  
			  form.append(input); 
			 }
       form.attr({
           'style': 'display:none',
           'method': 'post',
           'target': '_blank',
           'action':$.u.config.constant.smsqueryserver
       });  
       form.appendTo('body').submit().remove();
    	

	},
	 transform_data_type:function(data){
	    	//uuu=[{id:"1",name:"s"},{id:"2",name:"f"},{id:"3",name:"v"}]
	    	var uuu=data;
	    	var str = "{";
	    	for(i in uuu){
	    		if(parseInt(i)+1 != uuu.length){
	    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '",';
	    		}else{
	    			str += '"' + uuu[i].name + '":"' +uuu[i].value + '"';
	    		}
	    	}
	    	str += "}";
	    	return JSON.parse(str);
	    	//{s: "1", f: "2", v: "3"}
	    },
    /**
     * @title ajax
     * @param url {string} url
     * @param param {object} ajax param
     * @param $container {jQuery object} the object for block
     * @param blockParam {object} blockui param
     * @param callback {function} callback
     */
    _ajax:function(url,param,$container,blockParam,callback){
    	$.u.ajax({
    		"url":url,
    		"type": url.indexOf(".json") > -1 ? "get" : "post" ,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container,$.extend({},blockParam)).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    },
    _download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data]));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.audit.query.improveIssue.improveIssueIndex.widgetjs = [
                           "../../../../uui/widget/uploadify/jquery.uploadify.js",
                           '../../../../uui/widget/jqurl/jqurl.js',
                            "../../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                            "../../../../uui/widget/select2/js/select2.min.js",
                            "../../../../uui/widget/spin/spin.js",
                            "../../../../uui/widget/ajax/layoutajax.js"];
com.audit.query.improveIssue.improveIssueIndex.widgetcss = [
                                         { path: "../../../../uui/widget/select2/css/select2.css" }, 
                                         { path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                         { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         { path: "../../../../uui/widget/select2/css/select2-bootstrap.css" },
                                         { path:"../../../../uui/widget/uploadify/uploadify.css"}];

