$.u.load("com.losa.observeActivity.linknew");
$.u.define('com.losa.observeActivity.techWorkSheet.techWorkSheet', null, {
	init:function(options){
		this._options = options||null;
        this.id=this._options.id;
        this.index = this._options.index;
		this.linknewUm=null;
		this.planId = this._options.planId;
	},
	afterrender:function(){
		this.techWorkSheetVue=new Vue({
	    	   el : '#techWorkSheet',
			   data : {
				   techWorkSheet:{
					   isMadeBriefingBeforeTod:false,isDroBeforeTod:false,isBigMarginFly:false
					   
				   },
				    scoreList:'',baseInfo:'',observeApproach:'',techWorkSheetCopy:'',scoreListCopy:'',observeApproachCopy:'',
				    checkboxstate:false,
					dataSize:'normal',
					dataOnColor:'warning',
					dataOffColor:'primary',
					dataOnText:'是',
					dataOffText:'否'
			   },
			   methods:{
				   checkOther:this.proxy(this._checkOther),
				   addApproach:this.proxy(this._addApproach),
				   save : this.proxy(this._save),
				   submit : this.proxy(this._submit),
				   query:this.proxy(function(id){
							 this._query(this.id);
						}),
				   changeEvent:function(e, state){
					   
				   }
				   
			   }
	    });
	   
	    if(this.linknewUm!=null)delete this.linknewUm;
		this.linknewUm=new com.losa.observeActivity.linknew($("div[umid='linknewUm']",this.$),{id:this.id,index:this.index,planId:this.planId});
		//重载save函数
        this.linknewUm.override({
    	   save: this.proxy(function(data){
   			this._save(data);
   			})
        });
		this._query(this.id);	
		this._queryBaseInfo();
	},
	_queryBaseInfo:function(){		
		var data = {
				"tokenid":$.cookie("tokenid"),
	     		"method":"queryBaseInfo",	        
				 };
		     myAjaxQuery(data, null, this.proxy(function(response) {
				 this.techWorkSheetVue.$set('baseInfo',response.jsonBaseInfo);						
				}));
	},
   _query:function(id){
	   var data = {
			   "tokenid":$.cookie("tokenid"),
	      		"method":"pullActivity",
	      		"activityId":id,
	      		"flyStageName":"techWorkSheet"
			 };
		     myAjaxQuery(data, null, this.proxy(function(response) {
		    	 var observeActivity = response.jsonActivity.jsonObserve.observeActivity;
		    	 if(observeActivity != null){
	    			 if(observeActivity.theAppoachType == null || observeActivity.theAppoachType == undefined){
	    				 observeActivity.theAppoachType = "";
	    			 }
	    			 if(observeActivity.theAppoachArtificialOrAut == null || observeActivity.theAppoachArtificialOrAut == undefined){
	    				 observeActivity.theAppoachArtificialOrAut = "";
	    			 }
	    			 if(observeActivity.theWeatherType == null || observeActivity.theWeatherType == undefined){
	    				 observeActivity.theWeatherType = "";
	    			 }
	    			 if(observeActivity.isFlapNormal == null || observeActivity.isFlapNormal == undefined){
	    				 observeActivity.isFlapNormal = "";
	    			 }
	    			 if(observeActivity.isBigMarginAbroveExpect == null || observeActivity.isBigMarginAbroveExpect == undefined){
	    				 observeActivity.isBigMarginAbroveExpect = "";
	    			 }
		    	 }
		    	 //处理scoreList字段 
		    	 var score = response.jsonActivity.jsonObserve.score;
		    	 if(score != null && score.length > 0){
		    		 for(var i=0;i<score.length;i++){
		    			 if(score[i].scoreSelectKey == null || score[i].scoreSelectKey == "null"){
		    				 score[i].scoreSelectKey = "";
		    			 }
		    		 }
		    	 }
		    	 this.techWorkSheetVue.$set('techWorkSheet',observeActivity);
				 this.techWorkSheetVue.$set('scoreList',response.jsonActivity.jsonObserve.score);	
				 var observerApproach = response.jsonActivity.jsonObserveApproach;
				 if(observerApproach.length>1){
					 for(var i=0;i<observerApproach.length-1;i++){
						 observerApproach[i].repeatFly = true;
					 }
				 }else if(observerApproach.length == 1){
					 observerApproach[0].repeatFly = false;
				 }
				 this.techWorkSheetVue.$set('observeApproach',observerApproach);
				 
				 this.techWorkSheetVue.$set('techWorkSheetCopy',_clone(observeActivity));
				 this.techWorkSheetVue.$set('scoreListCopy',_clone(response.jsonActivity.jsonObserve.score));
				 this.techWorkSheetVue.$set('observeApproachCopy',_cloneArray(observerApproach));
				 Vue.nextTick(this.proxy(function(){
					 if(this.techWorkSheetVue.scoreList.length > 0){
						 var table = document.getElementById("product_table"); 
					 	this.linknewUm.autoRowSpan(table,0,0);
					 }
					 //this._renderCheckboxToSwitch();
				}) );
			}));	
	
   },
   _submit:function(id){
		this.linknewUm.submitLosa(this.id);
	},
   _save:function(func){
	   if(typeof func == 'function' && _compObj(this.techWorkSheetVue.techWorkSheetCopy,this.techWorkSheetVue.techWorkSheet)
				&& _compArray(this.techWorkSheetVue.observeApproachCopy,this.techWorkSheetVue.observeApproach)
				&& _compObj(this.techWorkSheetVue.scoreListCopy,this.techWorkSheetVue.scoreList)){
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
	   if(!this._validateData(this.techWorkSheetVue.techWorkSheet)){
		   return false;
	   }
	   if(!this._validateDataScore(this.techWorkSheetVue.scoreList)){
		   return false;
	   }
	   var value=JSON.stringify({
 		  "jsonObserve":JSON.stringify({
   		      "observeActivity": JSON.stringify(this.techWorkSheetVue.techWorkSheet),
   		      "score":JSON.stringify(this.techWorkSheetVue.scoreList),
   		  }),
   		"jsonApproach":JSON.stringify(this.techWorkSheetVue.observeApproach)
   	   });
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
   _validateData:function(list){
	   var isValid = true;
	   var tipPrefix = "请选择";
	   if(list.theAppoachType == ""){
		   $.u.alert.error(tipPrefix+"何种进近字段");
		   return false;
	   }
	   if(list.theAppoachArtificialOrAut == ""){
		   $.u.alert.error(tipPrefix+"进近：人工飞行还是自动飞行字段");
		   return false;
	   }
	   if(list.theWeatherType == ""){
		   $.u.alert.error(tipPrefix+"天气字段");
		   return false;
	   }
	   if(list.isFlapNormal == ""){
		   $.u.alert.error(tipPrefix+"在放襟翼期间，襟翼是否被“正常”的放下字段");
		   return false;
	   }
	   return isValid;
   },
   _validateDataScore:function(list){
	   var isValid = true;
	   var tipPrefix = "请选择";
	   if(list != null && list.length > 0){
		   for(var i=0;i<list.length;i++){
			   if(list[i].scoreSelectKey == ""){
				   $.u.alert.error(tipPrefix+list[i].scoreItems+"字段");
				   isValid = false;
				   break;
			   }
		   }
	   }
	   return isValid;
   },
   _setTechWorkSheet:function(e,state){
	   var checkboxId = $(e.currentTarget).attr("id");
	   this.techWorkSheetVue.techWorkSheet[checkboxId] = state;
   },
   _checkOther:function(e, state){
	   var check500=$(e.currentTarget).attr("check500");
	   var check1000=$(e.currentTarget).attr("check1000");
	   var check1500=$(e.currentTarget).attr("check1500");
	   var checkstr = undefined;
	   if(this._isNotEmpty(check500)){
		   checkstr = check500;
	   }
	   if(this._isNotEmpty(check1000)){
		   checkstr = check1000;
	   }
	   if(this._isNotEmpty(check1500)){
		   checkstr = check1500;
	   }
	   var time=$(e.currentTarget).attr("dataTime")-1;
	   var value = state;
	   var _that = this;
//	   debugger;
	   if(check1500!=undefined){
		   if(value == true){
			   this.techWorkSheetVue.observeApproach[time][check1500+'1000']=true;
			   this.techWorkSheetVue.observeApproach[time][check1500+'500']=true;
		   }
	   }else if(check1000!=undefined){
		   if(value==true){
			   this.techWorkSheetVue.observeApproach[time][check1000+'500']=true;
		   }else{
			   this.techWorkSheetVue.observeApproach[time][check1000+'1500']=false;
		   }
	   }else if(check500!=undefined){
		   if(value == false){
			   this.techWorkSheetVue.observeApproach[time][check500+'1500']=false;
			   this.techWorkSheetVue.observeApproach[time][check500+'1000']=false;
		   }
	   }
   },
   _addApproach:function(e ,state){
//	   debugger;
	   var _that = this;
	   var value = state;
	   if(value==true){
		   var time=Number($(e.currentTarget).attr("dataTime"))+1;
		   var approach = this.techWorkSheetVue.observeApproach;
		   approach.push({'targetAirspeedAbove1500':false,'verticalVelocity1500':false,'runningEngine1500':false,
			   'loadingType1500':false,'stableCrouse1500':false,'stableSlop1500':false,'targetAirspeedAbove1000':false,
			   'verticalVelocity1000':false,'runningEngine1000':false,'loadingType1000':false,'stableCrouse1000':false,
			   'stableSlop1000':false,'targetAirspeedAbove500':false,'verticalVelocity500':false,'runningEngine500':false,
			   'loadingType500':false,'stableCrouse500':false,'stableSlop500':false,'approachTime':time});
		   this.techWorkSheetVue.$set('observeApproach',approach);
	   }else{
		   var time=Number($(e.currentTarget).attr("dataTime"));
		   var approach = this.techWorkSheetVue.observeApproach;
		   var len = approach.length-1;
		   if(time!=len){
			   $.u.alert.error('请先取消第'+len+"次复飞！");
			   Vue.nextTick(function(){
				   _that.techWorkSheetVue.observeApproach[time-1]["repeatFly"] = true;
			   });
		   }else{
			   approach.splice(time,1);
			   this.techWorkSheetVue.$set('observeApproach',approach);
		   }
		   
	   }
   },
   _isNotEmpty:function(value){
	   var status =false;
	   if(value != undefined && value != null && value != ""){
		   status = true;
	   }
	   return status;
   }
}, { usehtm: true, usei18n: false });
com.losa.observeActivity.techWorkSheet.techWorkSheet.widgetjs = [
																	"../../../eiosa/base.js",
																	"../../../../uui/widget/spin/spin.js",
																	"../../../../uui/widget/jqblockui/jquery.blockUI.js",
																	"../../../../uui/widget/ajax/layoutajax.js",
																	"../../vuewidget/switch/js/bootstrap-switch.min.js",
																	"../../vuewidget/switch/js/switchcheckbox.js",
																	"../../../../uui/util/objectutil.js"
                                                                 ];
com.losa.observeActivity.techWorkSheet.techWorkSheet.widgetcss = [{ path: '../../../../css/losa.css' },
                                                                  //{ path: '../../vuewidget/switch/css/bootstrap-switch.min.css' }
                                                                 ];
                                   