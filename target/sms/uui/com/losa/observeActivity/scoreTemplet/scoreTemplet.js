
$.u.define('com.losa.observeActivity.scoreTemplet.scoreTemplet', null, {
	init : function(options) {
		this._options = options || null;
		this._flyStageName = this._options.flyStageName;
		this._flyStageValue = this._options.flyStageValue;
		this._tabName = this._options.tabName;
	},
	
	afterrender : function() {
    var tabNameTemp = this._tabName;
		this.scoreTempletVue = new Vue({
		  el: '#scoreTempletVue',
		  data: {
		  	scoreTemplets: [],
		  	options: [],
		  	pagebarsData:{
		  	  all : 0, // 总条数
		  	  cur : 1,// 当前页码
		  	  start : 0,//当前条数
		  	  length : 8,// 单页条数
		  	 },
		  	 tabName:tabNameTemp,
		  },
		  methods : {
		  	query : this.proxy(this._queryScoreTemplet),
		  	append : this.proxy(this._appendScoreTemplet),
				changer : this.proxy(this._changerScoreTemplet),
				cancel : this.proxy(this._cancelScoreTemplet),
				save : this.proxy(this._saveScoreTemplet),
				del : this.proxy(this._delScoreTemplet),
				add : this.proxy(this._addScoreTemplet),
				page : this.proxy(this._queryScoreTempletPage),
			},
		})
				
		this._queryScoreTemplet();		
	},
	
	_queryScoreTemplet : function() {
		this.scoreTempletVue.$set("pagebarsData.cur",1);
		this.scoreTempletVue.$set("pagebarsData.start",0);
		this._queryScoreTempletPage();
	},

	_queryScoreTempletPage : function() {	
		var data = {
			"method" : "queryScoreTemplet",
			"id" : "",
			"flyStage" : this._flyStageName,
			"start" : this.scoreTempletVue.pagebarsData.start,
			"length" : this.scoreTempletVue.pagebarsData.length,
		};
//		debugger
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.scoreTempletVue.$set("pagebarsData.all",response.all);

				var array = new Array();
				var obj = new Object();
				obj.id = 1;
				obj.text = "布尔型打分项";
				array.push(obj);
				var obj2 = new Object();
				obj2.id = 2;
				obj2.text = "数值型打分项";
				array.push(obj2);
				this.scoreTempletVue.$set("options", array);//设置options
				
				var data = JSON.parse(response.data);
				data.forEach(function (value) {
					value.edit = false;
		    })
				this.scoreTempletVue.$set("scoreTemplets", data);
			}
		}));
	},
	
	_appendScoreTemplet : function() {
		this.scoreTempletVue.scoreTemplets.push({edit:true, deleted:false, flyStageName:this._flyStageName, flyStageValue:this._flyStageValue, add:true});
	},
	
	_changerScoreTemplet : function(e) {
		var temp = {};
    for (var i in e.st){
    	temp[i] = e.st[i];
    }
    e.st.uber = temp;
		e.st.edit=true;
	},
	
	_cancelScoreTemplet : function(e) {
		if (e.st.add) {
			this.scoreTempletVue.scoreTemplets.pop();
		} else {
			for ( var i in e.st.uber) {
				e.st[i] = e.st.uber[i];
			}
			e.st.edit = false;
		}		
	},
	
	_saveScoreTemplet : function(e) {
		if(e.st.scoreSelectType==''){
			$.u.alert.error("下拉选项类型不能为空");
			return;
		}
		if(!e.st.scoreItemsSort){
			$.u.alert.error("评分项顺序不能为空");
			return;
		}else{
			reg=/^[-+]?\d*$/;    
	        if(!reg.test(e.st.scoreItemsSort)){    
	        	$.u.alert.error("请输入整数值!");//请将“字符串类型”要换成你要验证的那个属性名称！  
	            return;
	        }    
		}
		var data = {
				"method" : "querySort",
				"scoreTemplet" : JSON.stringify(e.st),
			};
			myAjaxQuery(data, null, this.proxy(function(response) {
				if (response.code=="success") {			
					var data = {
							"method" : "saveScoreTemplet",
							"scoreTemplet" : JSON.stringify(e.st),
						};
						myAjaxQuery(data, null, this.proxy(function(response) {
							if (response.success) {			
								$.u.alert.success("保存成功！");
								e.st.id = response.id;
								var data = {
									"method" : "queryScoreTemplet",
									"id" : response.id,
									"start" : 0,
									"length" : 1,
								};
								myAjaxQuery(data, null, this.proxy(function(response) {
									if (response.success) {
										var data = JSON.parse(response.data);
										data[0].edit = false;
										e.st = data[0];
									}
								}));
							} else {
								$.u.alert.error("保存失败");
							}
						}));
				} else if(response.code=="failure") {
					$.u.alert.error("已存在评分项顺序值");
				}
			}));
		
	},
	
	_delScoreTemplet : function(e) {
		var data = {
			"method" : "deletedScoreTemplet",
			"scoreTemplet" : JSON.stringify(e.st),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				$.u.alert.success("失效成功！");
				this._cancelScoreTemplet(e);
				e.st.deleted=true;
			} else {
				$.u.alert.error("失效失败");
			}
		}));
	},
	
	_addScoreTemplet : function(e) {
		var data = {
			"method" : "addScoreTemplet",
			"scoreTemplet" : JSON.stringify(e.st),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				$.u.alert.success("复效成功！");
				this._cancelScoreTemplet(e);
				e.st.deleted=false;
			} else {
				$.u.alert.error("复效失败");
			}
		}));
	},
	
},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.scoreTemplet.scoreTemplet.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                       '../../../../uui/vue.js',
                                       "../../../eiosa/base.js",];
com.losa.observeActivity.scoreTemplet.scoreTemplet.widgetcss = [{ path: '../../../../css/losa.css' },
                                        { path:"../../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];