$.u.load("com.losa.observeActivity.linknew");
$.u.load("com.losa.observeActivity.taskPlan.planLog");
$.u.define('com.losa.observeActivity.taskPlan.planEdit', null, {
	init : function(options) {
		//debugger
		this._options = options || null;
		this.linkUm=null;
		this.planLogUm=null;
		this.planId = this._options.planId;
		this.index = this._options.index;
		this.observeId = this._options.id;
		this._select2PageLength = 10;
		this._flightTemplate = '<div class="row">'
			  +		'<div class="col-sm-3">#{carrier}#{flightNO}</div><br/>'
			  +		'<div class="col-sm-9">'
			  +			'<div>起飞机场：#{deptAirportName}</div>'
			  +			'<div>到达机场：#{arrAirportName}</div>'
			  +		'</div>'
			  +'</div>';
	},
	
	afterrender : function() {
		
//		var url=location.href;
//		this.observeId=url.split('?')[1].split('=')[1];
		
		this._initPlanDetail();
//		debugger
//		this.linkUm=new com.losa.observeActivity.link($("div[umid='linkUm']",this.$),{id:this.observeId});
		//加载左侧列表
		if(this.linknewUm!=null)delete this.linknewUm;
		this.linknewUm=new com.losa.observeActivity.linknew($("div[umid='linknewUm']",this.$),{id:this.observeId,index:this.index,planId:this.planId});
		//重载save函数
        this.linknewUm.override({
    	   save: this.proxy(function(e,data){
   			this._saveEditPlan(e,data);
   			})
        });
		this.planLogUm=new com.losa.observeActivity.taskPlan.planLog($("div[umid='planLog']",this.$),{id:this.planId});

	},
	//初始化审计计划详情页面
	_initPlanDetail:function(){
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
		var _that = this;
		this.planEditVue = new Vue({
			el : '#planEditForm',
			data : {planInfo:{},
					planInfoCopy:{},
					isInitialed:false,   //是否初始化了
		             options1: [
	      		                 { id: 0, text: '' },
	      		               ],
					 options2: [
						         { id: 0, text: '' },
						       ],
			         dataObject:[],   //选航班data开始
			         isSchemeIdInSelect:0,
					 options:{
						inputValueDisabled:true,
						isAjaxContentData:false,
						selectNewInputStyle:{position:'relative',left:'0px',top:'2px',width:'418px','line-height':'28px','background-position':'395 1','font-size':'14px'},
						dataUrl:$.u.config.constant.smsqueryserver
					 } //选航班data结束
			       },
			methods:{
				save : this.proxy(this._saveEditPlan),
				cancel : this.proxy(this._cancelEditPlan),
				inputTips:this.proxy(this._inputTips),
				changeScheme:this.proxy(this._changeScheme),
			},
			watch:{
				'planInfo.observeDate':function(){
					//debugger;
					if(this.planInfo.observeDate != null && this.planInfo.observeDate != ''){
						this.options.inputValueDisabled = false;
						if(this.isInitialed && this.planInfo.flightId != null && this.planInfo.flightId != undefined && this.planInfo.flightId != '' && !isNaN(this.planInfo.flightId)){
							console.log("watch");
							this.planInfo.deptAirport = '';
							this.planInfo.arrAirport = '';
							this.planInfo.flyNo = '';
						}
					}
					
				}
			}
		});
		
		$("#observeDate").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		
		//加载数据
		this._load();				
	},
	
	//判断录入观察日期后才能选择航班
	_inputTips:function(){
		if(this.planEditVue.planInfo.observeDate==null||this.planEditVue.planInfo.observeDate==""){
   			layer.msg('请先录入观察日期！');
       		return false;
   		}
	},
	//初始化数据
	_load:function(){	
		var _that = this;
		var data = {
			"method":"queryTaskPlan",
			"observeId":this.observeId,
			"start":0,
			"length":10
		};
		//debugger
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				response.data[0].flightPlanId = response.data[0].flightId;
				//console.log(response.data[0].flightPlanId);
				//this.planEditVue.$set("planInfo",response.data[0]);
//				console.log(this.planEditVue.planInfo);
				//this.planId = this.planEditVue.planInfo.id;
				$("#planEditScheme").select2("data"
						,{id:response.data[0].schemeId,schemeSubject:response.data[0].schemeSubject});
				$("#planEditFly").select2("data"
						,{id:response.data[0].flightPlanId,carrier:response.data[0].flyNo,flightNo:''});
				$("#planEditObserver").select2("data"
						,{id:response.data[0].observerId,fullname:response.data[0].observer});
				//设置审计方案查询的select2控件
				this._schemeSelect2();
				//设置航班查询的select2控件
				this._flySelect2();
				//设置观察员查询的select2控件
				
				Vue.nextTick(function(){
					_that.planEditVue.$set("planInfo",response.data[0]);
					_that.planEditVue.planInfo.schemeId = parseInt(_that.planEditVue.planInfo.schemeId,10);
					_that.planEditVue.$set("planInfoCopy",_clone(_that.planEditVue.planInfo));
					_that._observerSelect2();
					Vue.nextTick(function(){
						_that.planEditVue.isInitialed = true;
					});
				});
			}
		}));
		
		
	},
	//添加select2控件 查询审计方案
	_schemeSelect2:function(){
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
					obj.impleUnitName = value.impleUnitName;
					obj.schemeTypeName = value.schemeTypeName;
					obj.orgName = value.orgName;
					array.push(obj);
				})
				this.planEditVue.$set("options1", array);
				this.planEditVue.isSchemeIdInSelect = 0;
				if(this.planEditVue.planInfo.schemeId == null || isNaN(this.planEditVue.planInfo.schemeId)){
					this.planEditVue.isSchemeIdInSelect = 1;
				}else{
					for(var i=0;i<this.planEditVue.options1.length;i++){
						if(this.planEditVue.options1[i].id == this.planEditVue.planInfo.schemeId){
							this.planEditVue.isSchemeIdInSelect++;
						}
					}
				}
			}
		})); 		
	},
	//设置航班查询的select2控件
	_flySelect2:function(){
		$("#planEditFly").select2({
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
    			quietMillis: 250,
	            data:this.proxy(function(term, page){
	            	return {
	            		"tokenid": $.cookie("tokenid"),
	    				"method": "losaQueryFlightInfo",
	    				"flightDate": this._formatDate(this.planEditVue.planInfo.observeDate),
	    				"flightNo": term,
	    				"start": (page - 1) * this._select2PageLength,
	    				"length": this._select2PageLength
	    			};
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){ 
		        		return { 
		        			"results": response.data.aaData, 
		        			"more": (page * this._select2PageLength) < response.data.iTotalRecords 
		        		};
		        	}
		        	else{
		        		$.u.alert.error(response.reason);
		        	}
		        })
    		},
    		placeholder : "请 输 入 航 班 号",
    		id:function(item){ return item.flightPlanId; },
	        formatResult: this.proxy(this._getFlightHtml),
	        formatSelection: function(item){
	        	return item.carrier + item.flightNo;
	        }
    	}).on("select2-selecting", this.proxy(function(e){
    		this.planEditVue.$set("planInfo.deptAirport",e.object.deptAirport);
    		this.planEditVue.$set("planInfo.arrAirport",e.object.arrAirport);
    		this.planEditVue.$set("planInfo.orgName",e.object.orgName);
       	})).on("select2-opening",this.proxy(function(){
       		if(this.planEditVue.planInfo.observeDate==null||this.planEditVue.planInfo.observeDate==""){
       			layer.msg('请先录入观察日期！');
           		return false;
       		}
       	}));
	},
	//查询航班的显示内容
	_getFlightHtml: function(flight){
    	return this._flightTemplate.replace(/#\{carrier\}/g, flight.carrier)
    							   .replace(/#\{flightNO\}/g, flight.flightNo)
    							   .replace(/#\{deptAirportName\}/g, flight.deptAirport)
    							   .replace(/#\{arrAirportName\}/g, flight.arrAirport); 
    },
    //初始观察日期格式化
    _formatDate:function(value){
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
    },
    //设置查询观察员的select2控件
    _observerSelect2:function(){
    	var schemeId = this.planEditVue.planInfo.schemeId;
    	if(isNaN(schemeId)){
    		schemeId = null;
    	}
    	console.log("_observerSelect2");
    	var data = {
				tokenid: $.cookie("tokenid"),
				method: "losaQueryLosaAuditors",
				"schemeId": schemeId
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
				this.planEditVue.$set("options2", array);
				}
		})); 		
    },
    //取消编辑计划信息
    _cancelEditPlan:function(){
    	layer.close(this.myLayerIndex);//由父传递过来
    },
    //保存修改的计划信息
    _saveEditPlan:function(func){
    	if(typeof func == 'function' && _compObj(this.planEditVue.planInfoCopy,this.planEditVue.planInfo)){
    		func();
    		return false;
    	}
    	
    	var _that = this;
    	if(typeof func == 'function'){
	    	var layerindex = layer.confirm('是否需要离开？', {
			    btn: ['离开并保存','离开不保存',"取消"] //按钮
	    		,btn3:function(){
	    			layer.close(layerindex);
	    		},
	    		title:false,
	    		closeBtn:0
			},  this.proxy(function(){
	//			debugger;
				layer.close(layerindex);
				this._saveData(func);
			}), this.proxy(function(){
				func();
			})) ;
    	}else{
    		this._saveData(func);
    	}
    	
    },
    _saveData:function(func){
    	var _that = this;
    	var planId = this.planId;
    	var schemeId = this.planEditVue.planInfo.schemeId;
    	if(isNaN(schemeId)){
    		schemeId = null;
    	}
        var observeDate = this.planEditVue.planInfo.observeDate;
        observeDate = this._formatDate(observeDate);
        var flightId = this.planEditVue.planInfo.flightPlanId;
        var observerId = this.planEditVue.planInfo.observerId;
        var planDesc = this.planEditVue.planInfo.planDesc;
//        console.log('flightId==='+flightId);
//        return false;
        if(observeDate==null||observeDate==""){
	        layer.msg('观察日期不能为空');
        }else if(flightId==null || flightId==""){
        	layer.msg('航班未做关联，请在此处关联航班号');
        }else if(observerId==null || observerId==""){
        	layer.msg('观察人员不能为空');
        }else{
        	data = {
	             "method":"modifyTaskPlan",
	             "planId":planId,
	             "schemeId":schemeId,
	             "observeDate":observeDate,
	             "flightId":flightId,
	             "observerId":observerId,
	             "planDesc":planDesc,
	             "modifyFlag":"modifyInfo"
	          };
        	//debugger
        	myAjaxModify(data, null, this.proxy(function(response) {
	          if(response.code=="success"){
	        	  if(func != undefined && typeof func == 'function'){
					  func();
				  }else{
					  $.u.alert.success("保存成功！");
		        	  this._load();
				  }
	          }else if(response.code=="isExist"){
	        	  layer.msg('相同观察日期和航班的观察计划已经存在，无法保存！');
	        	  if(func != undefined && typeof func == 'function'){
					  func();
				  }
	          }else{
	        	  $.u.alert.error("保存失败！");
	          }
        }));
      }
    },
    //修改方案的时候，重新选择观察人员
	_changeScheme:function(){
//		this.planEditVue.planInfo.observerId = '';
		var schemeId = $("#planEditScheme").val();
		if(this._isNotEmpty(schemeId)){
			if(this.planEditVue.options1 != null && this.planEditVue.options1.length > 0){
				var schemeArray = this.planEditVue.options1;
				for(var i=0;i<schemeArray.length;i++){
					if(schemeArray[i].id == schemeId){
						this.planEditVue.planInfo.schemeTypeName = schemeArray[i].schemeTypeName;
						this.planEditVue.planInfo.impleUnitName = schemeArray[i].impleUnitName;
						break;
					}
				}
			}
		}else{
			this.planEditVue.planInfo.schemeTypeName = "";
			this.planEditVue.planInfo.impleUnitName = "";
		}
		
		this._observerSelect2();
	},
	_isNotEmpty:function(_str){
		if(_str != null && _str != '' && _str != undefined){
			return true;
		}
		return false;
	}
	
},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.taskPlan.planEdit.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js', 
                                                       '../../vuewidget/selectflights/js/selectflights.js',
                                                       "../../../eiosa/base.js",
                                                       "../../../../uui/widget/spin/spin.js",
                                                       "../../../../uui/widget/jqblockui/jquery.blockUI.js",
                                                       "../../../../uui/widget/ajax/layoutajax.js",
                                                       "../../../../uui/util/objectutil.js"
                                                       
                                       ];
com.losa.observeActivity.taskPlan.planEdit.widgetcss = [{ path: '../../../../css/losa.css' },
                                        { path:"../../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"},
                                        {path:"../../vuewidget/selectflights/css/selectflights.css"}
                                        ];