$.u.load("com.losa.observeActivity.linknew");
$.u.define('com.losa.observeActivity.launch.launch', null, {
	init:function(options){
		this._options = options||null;
        this.id=this._options.id;
        this.index = this._options.index;
		this.linknewUm=null;
		this.planId = this._options.planId;
	},
	afterrender:function(){
		this.launchVue=new Vue({
	    	   el : '#launch',
			   data : {launch:'',scoreList:'',scoreListCopy:''},
			   methods :{
					  save : this.proxy(this._save),
					  submit : this.proxy(this._submit),
					  query:this.proxy(function(id){
							 this._query(this.id);
						}),
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
	},
   _query:function(id){
	   var data = {
			   "tokenid":$.cookie("tokenid"),
	      		"method":"pullActivity",
	      		"activityId":id,
	      		"flyStageName":"launch"
			 };
		     myAjaxQuery(data, null, this.proxy(function(response) {
		    	 var score = response.jsonActivity.jsonObserve.score;
		    	 if(score != null && score.length > 0){
		    		 if(score != null && score.length > 0){
			    		 for(var i=0;i<score.length;i++){
			    			 if(score[i].scoreSelectKey == null || score[i].scoreSelectKey == "null"){
			    				 score[i].scoreSelectKey = "";
			    			 }
			    		 }
			    	 }
		    	 }
		    	 this.launchVue.$set('launch',response.jsonActivity.jsonObserve.observeActivity);
				 this.launchVue.$set('scoreList',response.jsonActivity.jsonObserve.score);	
				 this.launchVue.$set('scoreListCopy',_clone(response.jsonActivity.jsonObserve.score));	
				 Vue.nextTick(this.proxy(function(){
					 var table = document.getElementById("product_table"); 
					 this.linknewUm.autoRowSpan(table,0,0);
				}) );
			}));	
	  
   },
   _submit:function(id){
	   if(!this._validateData(this.launchVue.scoreList)){
		   return false;
	   }
	   this.linknewUm.submitLosa(this.id);
	},
   _save:function(func){
	   if(typeof func == 'function'
				&& _compObj(this.launchVue.scoreListCopy,this.launchVue.scoreList)){
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
	   var value=JSON.stringify({
	 		  "jsonObserve":JSON.stringify({
	   		   "observeActivity": JSON.stringify(this.launchVue.launch),
	   		    "score":JSON.stringify(this.launchVue.scoreList),
	   		    
	   		  })});
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
   }	
}, { usehtm: true, usei18n: false });
com.losa.observeActivity.launch.launch.widgetjs = [
													"../../../eiosa/base.js",
													"../../../../uui/widget/spin/spin.js",
													"../../../../uui/widget/jqblockui/jquery.blockUI.js",
													"../../../../uui/widget/ajax/layoutajax.js",
													"../../../../uui/util/objectutil.js"
                                                   ];
com.losa.observeActivity.launch.launch.widgetcss = [
                                                    { path: '../../../../css/losa.css' }]