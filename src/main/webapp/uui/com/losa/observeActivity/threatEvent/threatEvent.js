
$.u.define('com.losa.observeActivity.threatEvent.threatEvent', null, {
	init : function(options) {
		this._options = options || null;
		this._eventType = this._options.eventType;
		this._tabName = this._options.tabName;
	},
	
	afterrender : function() {
		var tabNameTemp = this._tabName;
		this.threatEventVue = new Vue({
		  el: '#threatEventVue',
		  data: {
		    treeData: {
		    	id:'',
		    	name:'',
		    	number:'',
		    	parentNode:'',
		    	level:'',
		    	deleted:'',
		      children: [],
		    },
		    threatEvent:{
		    	id:'',
		    	name:'',
		    	number:'',
		    	parentNode:'',
		    	parent_name:'',
		    }, 
		    tabName:tabNameTemp,
		  },
		  methods : {
		  	query : this.proxy(this._queryThreatEvent),
				save : this.proxy(this._saveThreatEvent),
				del : this.proxy(this._delThreatEvent),
				add : this.proxy(this._addThreatEvent),
			},
		})
				
		this._queryThreatEvent();
		
	},
	
	_queryThreatEvent : function() {
		var data = {
			"method" : "queryThreatEvent",
			"eventType" : this._eventType,
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.threatEventVue.$set("treeData", JSON.parse(response.data));
				this.threatEventVue.threatEvent.name = '';
				this.threatEventVue.threatEvent.parent_name = '';
			}
		}));
	},
	
	_saveThreatEvent : function() {
		if(this.threatEventVue.threatEvent.parent_name==''||this.threatEventVue.threatEvent.name==''){
			$.u.alert.error("事件名称不能为空");
			return;
		}
		var data = {
			"method" : "saveThreatEvent",
			"threatEvent" : JSON.stringify(this.threatEventVue.threatEvent),
			"eventType" : this._eventType,
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				$.u.alert.success("保存成功！");
				this._queryThreatEvent();
				$('#btn_save').hide();
      	$('#btn_del').hide();
      	$('#btn_add').hide();
			} else {
				$.u.alert.error(response.resultDesc);
			}
		}));
	},
	
	_delThreatEvent : function() {
		if(this.threatEventVue.threatEvent.parent_name==''||this.threatEventVue.threatEvent.name==''){
			$.u.alert.error("请选择事件");
			return;
		}
		var data = {
			"method" : "deletedThreatEvent",
			"threatEvent" : JSON.stringify(this.threatEventVue.threatEvent),
			"eventType" : this._eventType,
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				$.u.alert.success("失效成功！");
				this._queryThreatEvent();
				$('#btn_save').hide();
      	$('#btn_del').hide();
      	$('#btn_add').hide();
			} else {
				$.u.alert.error("失效失败");
			}
		}));
	},
	
	_addThreatEvent : function() {
		if(this.threatEventVue.threatEvent.parent_name==''||this.threatEventVue.threatEvent.name==''){
			$.u.alert.error("请选择事件");
			return;
		}
		var data = {
			"method" : "addThreatEvent",
			"threatEvent" : JSON.stringify(this.threatEventVue.threatEvent),
			"eventType" : this._eventType,
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				$.u.alert.success("复效成功！");
				this._queryThreatEvent();
				$('#btn_save').hide();
      	$('#btn_del').hide();
      	$('#btn_add').hide();
			} else {
				$.u.alert.error("复效失败");
			}
		}));
	},
	

},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.threatEvent.threatEvent.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                       '../../../../uui/vue.js',
                                       "../../../eiosa/base.js",];
com.losa.observeActivity.threatEvent.threatEvent.widgetcss = [{ path: '../../../../css/losa.css' },
                                        { path:"../../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];