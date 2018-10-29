$.u.load("com.losa.general.general");
$.u.load("com.losa.observeActivity.reportInfo.reportInfo");
$.u.load("com.losa.observeActivity.basisInfo.basisInfo");
$.u.load("com.losa.taskplan.taskPlan");
$.u.load("com.losa.scheme.auditScheme");
$.u.load("com.losa.observeActivity.activity.auditContent");
$.u.define('com.losa.main', null, {
	init:function(options){
		this.i18n = com.losa.main.i18n;
		this.taskPlanUm = null;
		this.activityUm=null;
		this.auditSchemeUm = null;
		this.basisInfoUm = null;
		this.reportInfoUm = null;
		this.portalUm = null;
	},
	afterrender:function(){
		$("#tab_portal").off('click').on('click',this.proxy(this._initPortalTab));	
		$("#tab_plan").off('click').on('click',this.proxy(this._initPlanTab));
		$("#tab_scheme").off('click').on('click',this.proxy(this._initSchemeTab));
		$("#tab_basisInfo").off('click').on('click',this.proxy(this._initBasisInfo));
		$("#tab_reportInfo").off('click').on('click',this.proxy(this._initReportInfo));
		$("#tab_portal").click();
		this.tabVue=new Vue({
			el : '#myTab',
			data : {
				userRole:''				
			}
		});
		// 查询当前用户的角色
		this._queryUserRole();
		// 查询当前用户的所在公司
		this._queryUserRoles();
	},
	_queryUserRole:function(){
		var data = {
				"method" : "losaGetUserAuth",
			};
			myAjaxQuery(data, null, this.proxy(function(response){
				if (response.success) {
					this.tabVue.$set('userRole',response.data);
					//将用户角色添加到cookie里面，以供其他页面调用
					$.cookie('losaUserRole',response.data);
				} 
			}));
	},
	_queryUserRoles:function(){
		var data = {
				"method" : "losaGetUserAuths",
			};
			myAjaxQuery(data, null, this.proxy(function(response){
				if (response.success) {
					this.tabVue.$set('userRoleGroup',response.data);
					//将用户所属公司添加到cookie里面，以供其他页面调用
					$.cookie('losaUserGroup',response.data);
				} 
			}));
	},
	_initPortalTab:function(e){
		if(this.portalUm != null) delete this.portalUm;
		this.portalUm = new com.losa.general.general($("div[umid='general']",this.$),{}); 
	},
	_initPlanTab:function(){
		if(this.taskPlanUm != null) delete this.taskPlanUm;
		this.taskPlanUm = new com.losa.taskplan.taskPlan($("div[umid='taskPlan']",this.$));
	},
	_initInfoTab:function(){
		if(this.activityUm!=null)delete this.activityUm;
		this.activityUm=new com.losa.observeActivity.activity.auditContent($("div[umid='activity']",this.$));
	},
	_initSchemeTab:function(){
		if(this.auditSchemeUm != null) delete this.auditSchemeUm;
		this.auditSchemeUm = new com.losa.scheme.auditScheme($("div[umid='auditScheme']",this.$));
	},
	_initBasisInfo:function(){
		if(this.basisInfoUm != null) delete this.basisInfoUm;
		this.basisInfoUm = new com.losa.observeActivity.basisInfo.basisInfo($("div[umid='basisInfo']",this.$));
	},
	
	_initReportInfo:function(){
		if(this.reportInfoUm != null) delete this.reportInfoUm;
		this.reportInfoUm = new com.losa.observeActivity.reportInfo.reportInfo($("div[umid='reportInfo']",this.$));
	},
}, { usehtm: true, usei18n: true});

com.losa.main.widgetjs = ['../../uui/widget/select2/js/select2.min.js',
                          '../../uui/widget/spin/spin.js',
                          '../../uui/widget/jqblockui/jquery.blockUI.js',
                          '../../uui/widget/ajax/layoutajax.js',
                          '../../uui/widget/validation/jquery.validate.js',
                          "../../uui/vendor/underscore.js",
                          "../../uui/vendor/underscore.json.js",
                          "../../uui/vendor/form2js.js",
                          "../../uui/vendor/js2form.js",
                          "../sms/losa/losa.js",
                          "../../uui/way.js", 
                          "../../uui/tooltip/myTooltip.js",
                          "../../uui/util/htmlutil.js",
                          "../../uui/async/async.min.js",
                          '../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                          '../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                          "../sms/dash/echarts/js/echarts.js"
                                   ];
com.losa.main.widgetcss =  [{id:"",path:"../../uui/widget/select2/css/select2.css"},
                            {id:"",path:"../../uui/widget/select2/css/select2-bootstrap.css"},
                            { path: '../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                            { path: '../../uui/tooltip/jquery.tooltip.css' },
                            { path: '../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                            { path: "../../css/eiosa.css" },
                            { path: '../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                            { path:"../../css/losa.css"} ];
