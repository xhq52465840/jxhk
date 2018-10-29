
$.u.define('com.losa.observeActivity.errorReport.errorReport', null, {
	init : function(options) {
		this._options = options || null;
		this._manageQueryForm = this._options.manageQueryForm;
	},
	
	afterrender : function() {
		this.errorReportVue = new Vue({
		  el: '#errorReport',
		  data: {
			  errorList:'',
			  pagebarsData:{
					all : 0, // 总条数
					cur : 1,// 当前页码
					start : 0,//当前条数
					length : 10,// 单页条数
				},
				orders:{
					sortby : '', // 排序字段
					sortorders : 'asc',// 排序方式
				},
		  },
		  methods : {
		  	query : this.proxy(this._queryErrorReport),
		  	exportError : this.proxy(this._exportError),
		  	retriveScheme:this.proxy(this._retriveScheme),
		  	openObserview:this.proxy(this._openObserview),
		  	page : this.proxy(this._queryErrorReport),
			},
		})
				
		this._queryErrorReportInit();
		
	},
	_retriveScheme:function(e){
		var schemeId = $(e.currentTarget).attr("dataid");
		window.open("scheme/schemeDetail.html?schemeId="+schemeId);
	},
	//打开观察活动
    _openObserview:function(e){
    	var id=$(e.currentTarget).attr("data");
    	var planId=$(e.currentTarget).attr("data1");
    	if(this.schemeId==null||this.schemeId==''){
    		window.open("observeActivity/taskPlan/planEdit.html?id="+id+"&planId="+planId);
    	}else{
    		window.open("../observeActivity/taskPlan/planEdit.html?id="+id+"&planId="+planId);
    	}
    	
    },
	//初始查询，点击查询按钮查询
	_queryErrorReportInit:function() {
		this.errorReportVue.$set("pagebarsData.cur",1);
		this.errorReportVue.$set("pagebarsData.start",0);
		this._queryErrorReport();
	},
	_queryErrorReport : function() {
		var data = {
			"tokenid": $.cookie("tokenid"),
			"method" : "queryErrorDetail",			
			"manageQueryForm" : JSON.stringify(this._manageQueryForm),
			"sortby" : this.errorReportVue.orders.sortby,
			"sortorders" : this.errorReportVue.orders.sortorders,
			"start":this.errorReportVue.pagebarsData.start,
			"length" : this.errorReportVue.pagebarsData.length,
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.errorReportVue.$set("errorList", response.data);
				this.errorReportVue.$set("pagebarsData.all",response.all);
			}
		}));
	},
	
	_exportError:function(){
		var url="http://"+window.location.host+"/sms/query.do?" + "method=exportErrorDetail&tokenid="+$.cookie("tokenid")+"&manageQueryForm="+JSON.stringify(this._manageQueryForm)+"";
		window.open(url,'_blank');
	},

},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.errorReport.errorReport.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                       '../../../../uui/vue.js',
                                       "../../../eiosa/base.js",];
com.losa.observeActivity.errorReport.errorReport.widgetcss = [{ path: '../../../../css/losa.css' },
                                        { path:"../../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];