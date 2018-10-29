$.u.define('com.losa.taskplan.planDetail', null, {
	init : function(options) {
		this._options = options || null;
		this.planId = this._options.planId;	
	},
	
	afterrender : function() {
		this._initPlanDetail();
	},
	//初始化审计计划详情页面
	_initPlanDetail:function(){
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
		
		this.planDetailVue = new Vue({
			el : '#planDetailForm',
			data : {planInfo:''},
		});
		
		this._load();
	},
	//初始化数据
	_load:function(){
		var data = {
			"method":"queryTaskPlan",
			"planId":this.planId
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.planDetailVue.$set("planInfo",response.data[0]);
			}
		}));
	}
	
},{
	usehtm : true,
	usei18n : false
});

com.losa.taskplan.planDetail.widgetjs = [];
com.losa.taskplan.planDetail.widgetcss = [];