$.u.load("com.losa.observeActivity.linknew");
$.u.define('com.losa.observeActivity.obserview.obserview', null, {
	init:function(options){
		this._options = options||null;
        this.id=this._options.id;
        this.index = this._options.index;
        this.planId = this._options.planId;
	},
	
	afterrender:function(){
	   var _that = this;
       this.observiewVue=new Vue({
    	   el : '#jsonObserve',
		   data : {
			   	obserview:'',
			   	plan:'',
			   	threat:'',
			   	error:'',
			   	observiewCopy:'',
			   	planCopy:'',
			   	threatCopy:'',
			   	errorCopy:'',
			   	baseInfo:'',
			   	dataObject:[],   //选航班data开始
				options:{
					inputValueDisabled:false,
					isAjaxContentData:false,
					selectNewInputStyle:{position:'relative',left:'0px',top:'2px',width:'468px','line-height':'28px','background-position':'395 1','font-size':'14px'},
					dataUrl:$.u.config.constant.smsqueryserver
				}, //选航班data结束
       			inputTips:function(){
       				return false;
       			},
       			language:'zh-CN',
       			type:'time',
       			timeFormat:'HHmm'
			   
		   },
		   methods :{
			   save : this.proxy(this._save),
			   submit : this.proxy(this._submit),
			   query:this.proxy(function(id){
					 this._query(this.id);
				}),
			   computedTimeForGotReady:function(depTime, arrTime){
				   var arrTimeHour = parseInt(arrTime.substring(0,2),10);
				   var arrTimeMinute = parseInt(arrTime.substring(2,4),10);
				   var depTimeHour = parseInt(depTime.substring(0,2),10);
				   var depTimeMinute = parseInt(depTime.substring(2,4),10);
				   var tmpTimeHour = 0;
				   var tmpTimeMinute = 0;
				   if(depTimeHour < arrTimeHour){
					   tmpTimeHour = arrTimeHour - depTimeHour;
					   tmpTimeMinute = arrTimeMinute - depTimeMinute;
					   if(tmpTimeMinute < 0){
						   tmpTimeMinute = tmpTimeMinute + 60;
						   tmpTimeHour--;
					   }
				   }else{
					   tmpTimeHour = arrTimeHour - depTimeHour;
					   if(arrTimeHour != depTimeHour){
						   tmpTimeHour = tmpTimeHour + 24;
					   }
					   tmpTimeMinute = arrTimeMinute - depTimeMinute;
					   if(tmpTimeMinute < 0){
						   tmpTimeMinute = tmpTimeMinute + 60;
						   if(arrTimeHour != depTimeHour){
							   tmpTimeHour--;
						   }else{
							   tmpTimeHour = tmpTimeHour + 23;
						   }
					   }
				   }
				   var tmpTimeHourStr = tmpTimeHour + "";
				   var tmpTimeMinuteStr = tmpTimeMinute + "";
				   if(tmpTimeHour < 10){
					   tmpTimeHourStr = "0"+tmpTimeHourStr;
				   }
				   if(tmpTimeMinute < 10){
					   tmpTimeMinuteStr = "0"+tmpTimeMinuteStr;
				   }
				   return tmpTimeHourStr + '' + tmpTimeMinuteStr;
			   }
		   },
		   watch:{
			   'obserview.depTime':function(val, oldVal){
				   //debugger;
				   if(_that._isEmpty(val) || _that._isEmpty(this.obserview.arrTime)){
					   return false;
				   }
				   this.obserview.timeForGetReady = this.computedTimeForGotReady(val, this.obserview.arrTime);
			   },
			   'obserview.arrTime':function(val, oldVal){
				   if(_that._isEmpty(val) || _that._isEmpty(this.obserview.depTime)){
					   return false;
				   }
				   this.obserview.timeForGetReady = this.computedTimeForGotReady( this.obserview.depTime, val);;
			   }
		   }
       });
       this._queryBaseInfo();
       if(this.linknewUm!=null)delete this.linknewUm;
		this.linknewUm=new com.losa.observeActivity.linknew($("div[umid='linknewUm']",this.$),{id:this.id,index:this.index,planId:this.planId});
       
       //重载save函数
       this.linknewUm.override({
    	   save: this.proxy(function(data){
   			this._save(data);
   			})
   	   });
       
       Vue.nextTick(function(){
    	   _that._query(_that.id); 
       });
	},
	_inputTips:function(){
		return false;
	},
	_queryBaseInfo:function(){		
		var data = {
				"tokenid":$.cookie("tokenid"),
	     		"method":"queryBaseInfo",	        
				 };
		//debugger
		     myAjaxQuery(data, null, this.proxy(function(response) {
				 this.observiewVue.$set('baseInfo',response.jsonBaseInfo);						
				}));
	},
	_submit:function(id){
		this.linknewUm.submitLosa(this.id);
	},
	_query:function(id){
		  var data = {
				 "tokenid":$.cookie("tokenid"),
	        	 "method":"pullActivity",
	        	 "activityId":id,
	        	 "flyStageName":"baseInfo"
			 };
			
		     myAjaxQuery(data, null, this.proxy(function(response) {
		    	 	var jsonPlan = response.jsonActivity.jsonPlan;
		    	 	jsonPlan.flightPlanId = jsonPlan.flightId;
					this.observiewVue.$set('plan',jsonPlan);
					var observeActivity = response.jsonActivity.jsonObserve.observeActivity;
//					console.log(observeActivity);
					if(observeActivity.dutyOfObserver == null){
						observeActivity.dutyOfObserver = "";
					}
					if(observeActivity.companyCaptain1 == null){
						observeActivity.companyCaptain1 = "";
					}
					if(observeActivity.companyCaptain2 == null){
						observeActivity.companyCaptain2 = "";
					}
					if(observeActivity.companyCopilot1 == null){
						observeActivity.companyCopilot1 = "";
					}
					if(observeActivity.companyCopilot2 == null){
						observeActivity.companyCopilot2 = "";
					}
					if(observeActivity.firstLegOfCrew == null){
						observeActivity.firstLegOfCrew = "";
					}
					if(observeActivity.aircraftCaptain == null){
						observeActivity.aircraftCaptain = "";
					}
					if(observeActivity.aircraftCopilot == null){
						observeActivity.aircraftCopilot = "";
					}
					if(observeActivity.isDelay == true){
						observeActivity.isDelay = "1";
					}else if(observeActivity.isDelay == false){
						observeActivity.isDelay = "0";
		     		}
					this.observiewVue.$set('obserview',observeActivity);
					this.observiewVue.$set('threat',response.jsonActivity.threatNum);
					this.observiewVue.$set('error',response.jsonActivity.errorNum);	
					this.observiewVue.$set('planCopy',_clone(jsonPlan));
					this.observiewVue.$set('observiewCopy',_clone(observeActivity));
					this.observiewVue.$set('threatCopy',_clone(response.jsonActivity.threatNum));
					this.observiewVue.$set('errorCopy',_clone(response.jsonActivity.errorNum));	
				   
			}));     
	},
	_save:function(func){
		if(typeof func == 'function' && _compObj(this.observiewVue.planCopy,this.observiewVue.plan)
				&& _compObj(this.observiewVue.threatCopy,this.observiewVue.threat)
				&& _compObj(this.observiewVue.observiewCopy,this.observiewVue.obserview)
				&& _compObj(this.observiewVue.errorCopy,this.observiewVue.error)){
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
		console.log("observe save");
		if(!this._validateform()){
			return false;
		}
		this.observiewVue.plan.flightId=this.observiewVue.plan.flightPlanId;
		if(this.observiewVue.obserview.isDelay == "0"){
			this.observiewVue.obserview.isDelay = false;
			this.observiewVue.obserview.delayTime = "";
		}else if(this.observiewVue.obserview.isDelay == "1"){
			this.observiewVue.obserview.isDelay = true;
		}
		var value=JSON.stringify({
  		  "jsonObserve":JSON.stringify({
			  "observeActivity":JSON.stringify(
					  this.observiewVue.obserview
			  )}),
			"jsonPlan":JSON.stringify(
				     this.observiewVue.plan
			)});
		
		var data = {
				   "method":"pushActivity",
			      	"jsonActivity":value
				};
	    myAjaxModify(data,null, this.proxy(function(response) {	
		    if(response.Code=="success"){
		    	if(func != undefined && typeof func == 'function'){
					func();
				}else{
					$.u.alert.success("保存成功");
			    	this._query(this.id)
				}
			}else{
				$.u.alert.error("保存失败");
			}
			
		}));
	},
	_validateform:function(){
		var isValid = true;
//		alert(typeof this.observiewVue.obserview.isDelay);
		if(this._isEmpty(this.observiewVue.obserview.currentNumber)){
			$.u.alert.error('请输入被观察机组执飞第几行段');
			return false;
		}
		if(this._isEmpty(this.observiewVue.obserview.totalNumber)){
			$.u.alert.error('请输入被观察机组执飞共几段');
			return false;
		}
		if(this.observiewVue.plan.flightId == null && this._isEmpty(this.observiewVue.plan.flyNo)){
			$.u.alert.error('请选择航班号');
			return false;
		}
		if(this._isEmpty(this.observiewVue.obserview.aircraftCaptain)){
			$.u.alert.error('请选择操作飞机起飞的驾驶员');
			return false;
		}
		if(this._isEmpty(this.observiewVue.obserview.aircraftCopilot)){
			$.u.alert.error('请选择操作飞机降落的驾驶员');
			return false;
		}
		if(this._isEmpty(this.observiewVue.obserview.depTime)){
			$.u.alert.error('请输入航空器推出时间（UTC）');
			return false;
		}
		if(this._isEmpty(this.observiewVue.obserview.arrTime)){
			$.u.alert.error('请输入航空器到达停机位时间（UTC）');
			return false;
		}
		if(this._isEmpty(this.observiewVue.obserview.timeForGetReady)){
			$.u.alert.error('请输入从航空器推出至到达停机位的时间（小时：分钟）');
			return false;
		}
		if(this._isEmpty(this.observiewVue.obserview.isDelay)){
			$.u.alert.error('请选择是否延迟离场');
			return false;
		}
		if(this.observiewVue.obserview.isDelay == 'true' && this._isEmpty(this.observiewVue.obserview.delayTime)){
			$.u.alert.error('请输入延迟时间（小时：分钟）');
			return false;
		}
		return isValid;
	},
	_isEmpty:function(value){
		if(value == null || value == '' || value == undefined){
			return true;
		}
		return false;
	}
	
}, { usehtm: true, usei18n: true });
com.losa.observeActivity.obserview.obserview.widgetjs = [
															"../../../eiosa/base.js",
															"../../../../uui/widget/spin/spin.js",
															"../../../../uui/widget/jqblockui/jquery.blockUI.js",
															"../../../../uui/widget/ajax/layoutajax.js",
															'../../vuewidget/selectflights/js/selectflights.js',
															"../../../../uui/widget/vuedatetimepicker/js/bootstrap-3.3.4.min.js",
															"../../../../uui/widget/vuedatetimepicker/js/moment-with-locales.min.js",
															"../../../../uui/widget/vuedatetimepicker/js/moment-timezone-with-data.min.js",
															//"../../../../uui/widget/vuedatetimepicker/js/vue-i18n.js",
															"../../../../uui/widget/vuedatetimepicker/js/bootstrap-datetimepicker-4.17.37.min.js",
															//"../../../../uui/widget/vuedatetimepicker/js/bootstrap-datetimepicker_original.js",
															"../../../../uui/widget/vuedatetimepicker/js/vue-datetime-picker.js",
															"../../../../uui/util/objectutil.js"
                                                         ];
com.losa.observeActivity.obserview.obserview.widgetcss = [
                                                          { path: '../../../../css/losa.css' },
                                                          {path:"../../vuewidget/selectflights/css/selectflights.css"},
                                                          {path:"../../../../uui/widget/vuedatetimepicker/css/bootstrap.css"},
                                                          //{path:"../../../../uui/widget/vuedatetimepicker/css/font-awesome.min.css"},
                                                          {path:"../../../../uui/widget/vuedatetimepicker/css/bootstrap-datetimepicker.css"}
                                                          ];