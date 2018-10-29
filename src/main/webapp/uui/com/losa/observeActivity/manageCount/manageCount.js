
$.u.define('com.losa.observeActivity.manageCount.manageCount', null, {
	init : function(options) {
		this._options = options || null;
		this._manageQueryForm = this._options.manageQueryForm;
	},
	
	afterrender : function() {
		this.manageCountVue = new Vue({
		  el: '#manageCount',
		  data: {
			  countList:''
		  },
		  methods : {
		  	query : this.proxy(this._queryManageCount),
		  	exportmanage : this.proxy(this._exportmanage),
			},
		})
				
		this._queryManageCount();
		
	},
	
	_queryManageCount : function() {
		var data = {
			"tokenid": $.cookie("tokenid"),
			"method" : "queryThreatErrorCount",			
			"manageQueryForm" : JSON.stringify(this._manageQueryForm),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.manageCountVue.$set("countList", response.data);
			}
		}));
	},
	
	_exportmanage:function(){
		var url="http://"+window.location.host+"/sms/query.do?" + "method=ExportangerCount&tokenid="+$.cookie("tokenid")+"&manageQueryForm="+JSON.stringify(this._manageQueryForm)+"";
		window.open(url,'_blank');
	},

},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.manageCount.manageCount.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                       '../../../../uui/vue.js',
                                       "../../../eiosa/base.js",];
com.losa.observeActivity.manageCount.manageCount.widgetcss = [{ path: '../../../../css/losa.css' },
                                        { path:"../../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];