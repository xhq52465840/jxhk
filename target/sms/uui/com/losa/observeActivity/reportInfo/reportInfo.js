$.u.load("com.losa.observeActivity.threatReport.threatReport");
$.u.load("com.losa.observeActivity.errorReport.errorReport");
$.u.load("com.losa.observeActivity.manageCount.manageCount");
$.u.load("com.losa.observeActivity.reportTemplet.reportTemplet");
$.u.define('com.losa.observeActivity.reportInfo.reportInfo', null, {
	init:function(options){
		this._options = options || null;
		this.manageCountTempletUm = null;
		this._select2PageLength = 10;
		this._tabName;
	},
	
	afterrender:function(){
//		$("#tab_fullTimeCaptain").off('click').on('click',this.proxy(this._tab_fullTimeCaptain));
//		$("#tab_manageCount").off('click').on('click',this.proxy(this._tab_manageCount));
//		$("#tab_threatPercent").off('click').on('click',this.proxy(this._tab_threatPercent));
//		$("#tab_threatTop5").off('click').on('click',this.proxy(this._tab_threatTop5));
//		$("#tab_errorPercent").off('click').on('click',this.proxy(this._tab_errorPercent));
//		$("#tab_errorNamePercent10").off('click').on('click',this.proxy(this._tab_errorNamePercent10));
//		$("#tab_errorNameTop5").off('click').on('click',this.proxy(this._tab_errorNameTop5));
		var _that = this;
		this.manageQueryFormVue = new Vue({
			el : '#manageQueryForm',
			data : {
				  manageInfo:'',
					schemeTypeNames:'',
					losaUserRole:$.cookie('losaUserRole'),
					losaUserGroup:$.cookie('losaUserGroup'),
					manageQueryForm:{s_schemeName:'',f_org_code:'',s_schemeType:'',p_flightId:'',p_observerId:'',s_impleUnitId:'',p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',},
					options1 : [ {
						id : 0,
						text : ''
					}, ],
					options2 : [ {
						id : 0,
						text : ''
					}, ],
					options3 : [ {
						id : 0,
						text : ''
					}, ],
					options4 : [ {
						id : 0,
						text : ''
					}, ],
					options5 : [ {
						id : 0,
						text : ''
					}, ],
					headername:""
				},
			methods : {
				search : this.proxy(this._queryInfo),
				cancel : this.proxy(this._cancel),
			},
			watch:{
				   'manageQueryForm.p_observeDate':function(val, oldVal){
					   var endDate = this.manageQueryForm.p_observeDateTo;
					   if(!_that._isEmpty(val) && !_that._isEmpty(endDate) && !_that._compareDate(val,endDate)){
						   $.u.alert.error("观察日期开始时间不能大于结束时间！");
						   this.manageQueryForm.p_observeDate = oldVal;
					   }
				   },
				   'manageQueryForm.p_observeDateTo':function(val, oldVal){
					   var startDate = this.manageQueryForm.p_observeDate;
					   if(!_that._isEmpty(val) && !_that._isEmpty(startDate) && !_that._compareDate(startDate,val)){
						   $.u.alert.error("观察日期结束时间不能小于开始时间！");
						   this.manageQueryForm.p_observeDateTo = oldVal;
					   }
				   },
			   }
		});	
		
		this._initReportLinkDetail(this);

		$("#observeDateFrom").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		$("#observeDateTo").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});

		this._queryScheme();
		this._queryImpleUnit();
		this._queryOrgcode();
		this._querySchemeTypeNames();
		this._queryObserver();
		this._queryAirport();
//		this._queryFlightPlan();
		
//		$("#tab_fullTimeCaptain").click();
//		debugger;
		$("#reportlink #ceair_accordioncontainer a.firstmenua").get(0).click();
	},
	
	_isEmpty:function(value){
		if(value == null || value == '' || value == undefined){
			return true;
		}
		return false;
	},
	//日期比较(yyyy-mm-dd)
	_compareDate:function(a, b){
	    var arr = a.split("-");
	    var starttime = new Date(arr[0], arr[1], arr[2]);
	    var starttimes = starttime.getTime();

	    var arrs = b.split("-");
	    var lktime = new Date(arrs[0], arrs[1], arrs[2]);
	    var lktimes = lktime.getTime();

	    if (starttimes > lktimes) {
	        return false;
	    }
	    return true;
	},
	_initReportLinkDetail:function(_that){
		this.reportLink = new Vue({
			el:"#reportlink",
			data:{
				dataObject:[
				    {
				    	firstmenutitle:'机长飞行时间',
				    	firstmenuclick:function(){
				    		_that._tab_fullTimeCaptain();
				    	}
				    },
					{
						firstmenutitle:'威胁和差错管理统计',
						firstmenuclick:function(){
							_that._tab_manageCount();
						}
					},
					{
				    	firstmenutitle:'威胁管理统计',
				    	firstmenuclick:function(){
				    		_that._tab_threatPercent();
				    	}
				    },
				    {
				    	firstmenutitle:'出现概率TOP5的威胁',
				    	firstmenuclick:function(){
				    		_that._tab_threatTop5();
				    	}
				    },
				    {
				    	firstmenutitle:'差错管理统计',
				    	firstmenuclick:function(){
				    		_that._tab_errorPercent();
				    	}
				    },
				    {
				    	firstmenutitle:'出现概率大于10%的差错',
				    	firstmenuclick:function(){
				    		_that._tab_errorNamePercent10();
				    	}
				    },
				    {
				    	firstmenutitle:'出现概率TOP5的差错',
				    	firstmenuclick:function(){
				    		_that._tab_errorNameTop5();
				    	}
				    },
				    {
				    	firstmenutitle:'威胁明细清单报表',
				    	firstmenuclick:function(){
				    		_that._tab_threatReport();
				    	}
				    },
				    {
				    	firstmenutitle:'差错明细清单报表',
				    	firstmenuclick:function(){
				    		_that._tab_errorReport();
				    	}
				    },
				],
				options:{
					componentPosition:{
						width:'210px'
					},
					oneAtATime:true,
					isLiCrossChangeColor:{
						isChangeColor:false,
						oddColor:'liodd',
						evenColor:'lieven',
					},
					animateDuration:300
				}
			
			}
		});
		
	},
	
	_queryInfo:function(){
		this[this._tabName]();
	},
	_cancel:function(){
		this.manageQueryFormVue.manageQueryForm = {s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
	},
	
	//查询方案主题
	_queryScheme:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
				method: "querySchemes",
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.schemeSubject;
					array.push(obj);
				})
				this.manageQueryFormVue.$set("options1", array);
				}
		})); 		
	},
	//查询实施单位
	_queryImpleUnit:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
        method: "losaQuerySchemeImpleUnit",
		};
		
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.unitName;
					array.push(obj);
				})
				this.manageQueryFormVue.$set("options2", array);
				}
		})); 
	},
	//查询被实施单位
	_queryOrgcode:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "querySchemeOrgcode",
		};
		
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				var array = new Array();
				var obj = new Object();
				obj.id = "null";
				obj.text = "全部";
				array.push(obj);
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.unitName;
					array.push(obj);
				})
				this.manageQueryFormVue.$set("options5", array);
				var role=this.manageQueryFormVue.losaUserRole;
				var group=this.manageQueryFormVue.losaUserGroup;
				if(role!="系统管理员"){
					this.manageQueryFormVue.manageQueryForm.f_org_code = group;
				}else{
					this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
				}
				}
		})); 
	},
	//查询方案类型
	_querySchemeTypeNames:function(e){
		var data = {
			"method" : "queryDictNames",
			"dictType" : "scheme_type",
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.manageQueryFormVue.$set('schemeTypeNames', response.data)
			}
		})); 
	},
	_queryObserver:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
				 method: "losaQueryLosaAuditors",
				 "schemeId":this.schemeId,
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.fullname;
					array.push(obj);
				})
				this.manageQueryFormVue.$set("options3", array);
				}
		})); 		
	},
	//查询起降机场
	_queryAirport:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "losaGetAirPort",
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data.aaData,function(index,value){
					var obj = new Object();
					obj.id = value.IATACode;
					var tex1=value.fullName;
					var tex2=value.IATACode;
					obj.text = tex1+"("+tex2+")";
					array.push(obj);
				})
				this.manageQueryFormVue.$set("options4", array);
				}
		})); 			
	},	
	
	_tab_fullTimeCaptain:function(){
		this._tabName = '_tab_fullTimeCaptainQuery';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[0].firstmenutitle;		
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();		
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryFullTimeCaptain',reportTyppe:'1',tabName:'机长飞行时间',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_fullTimeCaptainQuery:function(){
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryFullTimeCaptain',reportTyppe:'1',tabName:'机长飞行时间',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},

	_tab_manageCount:function(){
		this._tabName = '_tab_manageCountQuery';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[1].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}		
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.manageCount.manageCount($("div[umid='manageCountTemplet']",this.$),{manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_manageCountQuery:function(){
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.manageCount.manageCount($("div[umid='manageCountTemplet']",this.$),{manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	
	_tab_threatPercent:function(){
		this._tabName = '_tab_threatPercentQuery';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[2].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryThreatPercent',reportTyppe:'3',tabName:'威胁管理统计',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_threatPercentQuery:function(){
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryThreatPercent',reportTyppe:'3',tabName:'威胁管理统计',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	
	_tab_threatTop5:function(){
		this._tabName = '_tab_threatTop5Query';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[3].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryThreatTop5',reportTyppe:'1',tabName:'出现概率TOP5的威胁',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_threatTop5Query:function(){
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryThreatTop5',reportTyppe:'1',tabName:'出现概率TOP5的威胁',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	
	_tab_errorPercent:function(){
		this._tabName = '_tab_errorPercentQuery';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[4].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryErrorPercent',reportTyppe:'3',tabName:'差错管理统计',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_errorPercentQuery:function(){
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryErrorPercent',reportTyppe:'3',tabName:'差错管理统计',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	
	_tab_errorNamePercent10:function(){
		this._tabName = '_tab_errorNamePercent10Query';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[5].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryErrorNamePercent10',reportTyppe:'2',tabName:'出现概率大于10%的差错',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_errorNamePercent10Query:function(){
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryErrorNamePercent10',reportTyppe:'2',tabName:'出现概率大于10%的差错',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	
	_tab_errorNameTop5:function(){
		this._tabName = '_tab_errorNameTop5Query';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[6].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryErrorNameTop5',reportTyppe:'1',tabName:'出现概率TOP5的差错',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_errorNameTop5Query:function(){
		if(this.manageCountTempletUm != null) delete this.manageCountTempletUm;
		this.manageCountTempletUm = new com.losa.observeActivity.reportTemplet.reportTemplet($("div[umid='manageCountTemplet']",this.$),{reportName:'queryErrorNameTop5',reportTyppe:'1',tabName:'出现概率TOP5的差错',manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_threatReport:function(){
		this._tabName = '_tab_threatReportQuery';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[7].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		if(this.threatReportTempletUm != null) delete this.threatReportTempletUm;
		this.threatReportTempletUm = new com.losa.observeActivity.threatReport.threatReport($("div[umid='manageCountTemplet']",this.$),{manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_threatReportQuery:function(){
		if(this.threatReportTempletUm != null) delete this.threatReportTempletUm;
		this.threatReportTempletUm = new com.losa.observeActivity.threatReport.threatReport($("div[umid='manageCountTemplet']",this.$),{manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_errorReport:function(){
		this._tabName = '_tab_errorReportQuery';
		this.manageQueryFormVue.headername = this.reportLink.dataObject[8].firstmenutitle;
		this.manageQueryFormVue.manageQueryForm={s_schemeName:'',f_org_code:'',s_impleUnitId:'',s_schemeType:'',p_flightId:'',p_observerId:'', p_depAirportNo:'',p_arrAirportNo:'',p_observeDate:'',p_observeDateTo:'',isAll:'',};
		this.manageQueryFormVue.manageQueryForm.p_observeDateTo =this._getDate();
		this.manageQueryFormVue.manageQueryForm.p_observeDate = this._getLastDate();
		var role=this.manageQueryFormVue.losaUserRole;
		var group=this.manageQueryFormVue.losaUserGroup;
		if(role!="系统管理员"){
			this.manageQueryFormVue.manageQueryForm.f_org_code = group;
		}else{
			this.manageQueryFormVue.manageQueryForm.f_org_code = "null";
		}
		if(this.errorReportTempletUm != null) delete this.errorReportTempletUm;
		this.errorReportTempletUm = new com.losa.observeActivity.errorReport.errorReport($("div[umid='manageCountTemplet']",this.$),{manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_tab_errorReportQuery:function(){
		if(this.errorReportTempletUm != null) delete this.errorReportTempletUm;
		this.errorReportTempletUm = new com.losa.observeActivity.errorReport.errorReport($("div[umid='manageCountTemplet']",this.$),{manageQueryForm:this.manageQueryFormVue.manageQueryForm});
	},
	_getDate:function(){
		var nowDate = new Date();
	  var nowStr = nowDate.getFullYear()+'-'+('00'+(nowDate.getMonth()+1)).slice(-2)+'-'+('00'+nowDate.getDate()).slice(-2);
	  return nowStr;
	},
	
	_getLastDate:function(){
		var date = this._getDate();
	  var arr = date.split('-');
    var year = arr[0]; 
    var month = arr[1];
    var day = arr[2]; 
    var year2 = year;
    var month2 = parseInt(month) - 1;
    if (month2 == 0) {
        year2 = parseInt(year2) - 1;
        month2 = 12;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (parseInt(day2) > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }
    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
	},
	
}, { usehtm: true, usei18n: false});

com.losa.observeActivity.reportInfo.reportInfo.widgetjs = ['../../vuewidget/accordion/js/accordion_component.js'];
com.losa.observeActivity.reportInfo.reportInfo.widgetcss =[{path:"../../vuewidget/accordion/css/ce_accordion.css"}];
