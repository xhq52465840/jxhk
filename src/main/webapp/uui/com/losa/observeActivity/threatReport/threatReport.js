$.u.define('com.losa.observeActivity.threatReport.threatReport', null, {
	init : function(options) {
		this._options = options || null;
		this._manageQueryForm = this._options.manageQueryForm;
	},
	
	afterrender : function() {
		this.threatReportVue = new Vue({
		  el: '#threatReport',
		  data: {
			  threatList:'',
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
		  	query : this.proxy(this._querythreatReport),
		  	exportThreatDetail : this.proxy(this._exportThreatDetail),
		  	retriveScheme:this.proxy(this._retriveScheme),
		  	openObserview:this.proxy(this._openObserview),
		  	page : this.proxy(this._querythreatReport),
			},
		})
				
		this._querythreatReportsInit();
		
	},
	//初始查询，点击查询按钮查询
	_querythreatReportsInit:function() {
		this.threatReportVue.$set("pagebarsData.cur",1);
		this.threatReportVue.$set("pagebarsData.start",0);
		this._querythreatReport();
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
	_querythreatReport : function() {
		var data = {
			"tokenid": $.cookie("tokenid"),
			"method" : "queryThreatDetail",			
	     	"manageQueryForm" : JSON.stringify(this._manageQueryForm),
	     	"sortby" : this.threatReportVue.orders.sortby,
			"sortorders" : this.threatReportVue.orders.sortorders,
	     	"start":this.threatReportVue.pagebarsData.start,
			"length" : this.threatReportVue.pagebarsData.length,
		};
		debugger
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.threatReportVue.$set("threatList", response.data);
				this.threatReportVue.$set("pagebarsData.all",response.all);
			}
		}));
	},
	
	_exportThreatDetail:function(){
		var url="http://"+window.location.host+"/sms/query.do?" + "method=exportThreatDetail&tokenid="+$.cookie("tokenid")+"&manageQueryForm="+JSON.stringify(this._manageQueryForm)+"";
		window.open(url,'_blank');
	},

},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.threatReport.threatReport.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                       '../../../../uui/vue.js',
                                       "../../../eiosa/base.js",];
com.losa.observeActivity.threatReport.threatReport.widgetcss = [{ path: '../../../../css/losa.css' },
                                        { path:"../../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];