$.u.define('com.losa.observeActivity.observer.observerMaintain', null, {
	init : function(options) {
		this._options = options || null;
	},
	afterrender : function() {
		this.observerInfoVue = new Vue({
			  el: '#observerInfo',
			  data: {
			  	observerInfos: [],
			  	aircraftTypes: [],
			  	respNames: [{ id: 0, text: '' },],
			  	observers:[{ id: 0, text: '' },],
			  	observerOrg:[{ id: 0, text: '' },],
			  	pagebarsData:{
			  	  all : 0, // 总条数
			  	  cur : 1,// 当前页码
			  	  start : 0,//当前条数
			  	  length : 10,// 单页条数
			  	 },
			  	losaUserRole:$.cookie('losaUserRole'),
			  	observerStatusNames:'',
			  	observerQueryForm:{observerName:'',respName:'',observerOrg:'',observerPost:'',observerAircraftType:'',observerFXWID:'',observerStatus:''},
			  },
			  methods : {
				  	append : this.proxy(this._appendObserverInfo),
					change : this.proxy(this._changeObserverInfo),
					cancel : this.proxy(this._cancelObserverInfo),
					save : this.proxy(this._saveObserverInfo),
					del : this.proxy(this._delObserverInfo),
					add : this.proxy(this._addObserverInfo),
					page : this.proxy(this._queryObserverInfoPage),
					search : this.proxy(this._queryObserverInfoPage),
					reset : this.proxy(this._cancel),
			  },
			});
			this._queryAircraftTypes();//查询操作机型
			this._loadObserverOrg();//查询所属机构
			this._observerRespNames();//查询losa用户职责
			this._queryObservers();//查询可以选择的观察员，从用户里面选择
			this._queryObserverInfo();//查询观察员信息
			this._queryobserverStatusNames();//查询观察员状态
		},
	_cancel:function(){
		this.observerInfoVue.observerQueryForm = {observerName:'',respName:'',observerOrg:'',observerPost:'',observerAircraftType:'',observerFXWID:''};
	},
	//查询观察员状态
	_queryobserverStatusNames:function(e){
		var data = {
			"method" : "queryDictNames",
			"dictType" : "observer_status"
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.observerInfoVue.$set('observerStatusNames', response.data)
			}
		})); 
	},
	//设置主操作机型
	_queryAircraftTypes:function(){
		var array = new Array();
		var obj = new Object();
		obj.id = 'A';
		obj.text = "空客";
		array.push(obj);
		var obj2 = new Object();
		obj2.id = 'B';
		obj2.text = "波音";
		array.push(obj2);
		this.observerInfoVue.$set("aircraftTypes", array);
	},
	//查询losa用户职责名称
	_observerRespNames:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
				method: "queryDuty",
				dictType:"losa_role"
		};
		myAjaxQuery(data, null, this.proxy(function(response, param) {
			if (response.success) {
				var array = new Array();
				$.each(response.data,function(index,value){
					var obj = new Object();
					obj.id = value.dictCode;
					obj.text = value.dictName;
					array.push(obj);
				})
				this.observerInfoVue.$set("respNames", array);
			}
		})); 		
	},
	//所属公司添加select2控件
	_loadObserverOrg:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
				method: "observerInfoService",
				methodName:"queryObserverOrg"
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
				this.observerInfoVue.$set("observerOrg", array);
			}
		})); 		
	},
	//从用户里面选择观察员
	_queryObservers:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
				method: "observerInfoService",
				methodName:"queryObservers"
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				var array = new Array();
				$.each(response.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					var tex1=value.userName;
					var tex2=value.email;
					obj.text = tex1+"("+tex2+")";
					array.push(obj);
				})
				this.observerInfoVue.$set("observers", array);
			}
		})); 		
	},
	_queryObserverInfo : function() {
		this.observerInfoVue.$set("pagebarsData.cur",1);
		this.observerInfoVue.$set("pagebarsData.start",0);
		this._queryObserverInfoPage();
	},
	//查询观察员信息	
	_queryObserverInfoPage : function() {	
		var data = {
			"method" : "observerInfoService",
			"methodName" : "queryObserverInfos",
			"observerQueryForm": JSON.stringify(this.observerInfoVue.observerQueryForm),
			"start" : this.observerInfoVue.pagebarsData.start,
			"length" : this.observerInfoVue.pagebarsData.length,
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.observerInfoVue.$set("pagebarsData.all",response.all);
				var data = response.data;
				data.forEach(function (value) {
					value.edit = false;
				})
				this.observerInfoVue.$set("observerInfos", data);
			}
		}));
	},
	//添加观察员信息
	_appendObserverInfo : function() {
		this.observerInfoVue.observerInfos.push({edit:true, deleted:false,add:true});		
	},
	//保存新增的观察员信息
	_saveObserverInfo : function(e) {
		var userId = e.oi.userId;
		var aircraftType = e.oi.observerAircraftType;
		var respName = e.oi.respName;
		var observerOrg = e.oi.observerOrg;
		var fxwId = e.oi.observerFXWID;
		var code = e.oi.observerIDCode;		
		if(code!=null&&code!=""){
			if(this._IdentityCodeValid(code)==false){
				return;
			}
		}
		if(!userId){
			layer.msg('姓名不能为空');
			return;		
		}else if(!respName){
			layer.msg('职责不能为空');
			return;
		}else if(!observerOrg){
			layer.msg('所属公司不能为空');
			return;
		};
		if(respName.indexOf("observer") >= 0){
			 if(!aircraftType){
				layer.msg('主操作机型不能为空');
				return;
			}else if(!fxwId){
				layer.msg('飞行网编号不能为空');
				return;
		    };
		}
		var data = {
			"method" : "observerInfoService",
			"methodName" : "saveObserverInfo",
			"observerInfo" : JSON.stringify(e.oi),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {		
				$.u.alert.success("保存成功！");
				e.oi.id = response.id;
				var data1 = {
						"method" : "observerInfoService",
						"methodName" : "queryObserverInfos",
						"observerQueryForm": JSON.stringify(this.observerInfoVue.observerQueryForm),
						"id" : response.id,
						"start" : 0,
						"length" : 1,
					};
				myAjaxQuery(data1, null, this.proxy(function(response) {
					if (response.success) {
						var observerInfos = response.data;
						observerInfos[0].edit = false;
						e.oi = observerInfos[0];
					}
				}));
			} else if(response.message){
				$.u.alert.error(response.message);
			}else{
				$.u.alert.error("保存失败");
			}
		}));
	},
	
	  _IdentityCodeValid: function(code) { 
        var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
        var tip = "";
        var pass= true;        
        if(!code || !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(code)){
            tip = "身份证号长度或格式错误";
            pass = false;
        }
        
       else if(!city[code.substr(0,2)]){
            tip = "身份证号地址编码错误";
            pass = false;
        }
        else{
            //18位身份证需要验证最后一位校验位
            if(code.length == 18){
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                //校验位
                var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++)
                {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if(parity[sum % 11] != code[17]){
                    tip = "身份证号校验位错误";
                    pass =false;
                }
            }
        }
        if(!pass) $.u.alert.error(tip);
        return pass;
    },
	//修改观察员信息
	_changeObserverInfo : function(e) {
		var temp = {};
	    for (var i in e.oi){
	    	temp[i] = e.oi[i];
	    }
	    e.oi.uber = temp;//添加这些代码是为了取消修改恢复原来数据用的
		e.oi.edit = true;
		e.oi.deleted = false;
	},
	//取消添加或修改观察员信息
	_cancelObserverInfo : function(e) {
		if (e.oi.add) {
			this.observerInfoVue.observerInfos.pop();
		} else {
			for ( var i in e.oi.uber) {
				e.oi[i] = e.oi.uber[i];
			}
			e.oi.edit = false;
		}		
	},
	//失效观察员
	_delObserverInfo : function(e) {
		e.oi.deleted = true;
		var data = {
			"method" : "observerInfoService",
			"methodName" : "saveObserverInfo",
			"observerInfo" : JSON.stringify(e.oi),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				$.u.alert.success("失效成功！");
			} else {
				$.u.alert.error("失效失败！");
			}
		}));
	},
	//复效观察员信息
	_addObserverInfo : function(e) {
		e.oi.deleted = false;
		var data = {
			"method" : "observerInfoService",
			"methodName" : "saveObserverInfo",
			"observerInfo" : JSON.stringify(e.oi),
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				$.u.alert.success("复效成功！");
			} else {
				$.u.alert.error("复效失败");
			}
		}));
	},
},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.observer.observerMaintain.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                                               '../../../../uui/vue.js',
                                                               "../../../eiosa/base.js",];
com.losa.observeActivity.observer.observerMaintain.widgetcss = [{ path: '../../../../css/losa.css' },
                                                                { path:"../../../../uui/widget/select2/css/select2.css"},
                                                                {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];