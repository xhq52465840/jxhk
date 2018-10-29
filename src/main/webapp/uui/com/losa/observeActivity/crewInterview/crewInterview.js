$.u.load("com.losa.observeActivity.linknew");
$.u.define('com.losa.observeActivity.crewInterview.crewInterview', null, {
	init:function(options){
		this._options = options||null;
        this.id=this._options.id;
        this.index = this._options.index;
		this.linknewUm=null;
		this.planId = this._options.planId;
	},
	afterrender:function(){
		this.jsonCrewVue=new Vue({
	    	   el : '#jsonCrew',
			   data : {jsonCrew:'',jsonObserve:'',jsonCrewCopy:''},
			   methods :{
			   save : this.proxy(this._save),
			   submit : this.proxy(this._submit),
			   query:this.proxy(function(id){
						 this._query(this.id);
					}),
			   }
	    });
		this._query(this.id);
		if(this.linknewUm!=null)delete this.linknewUm;
		this.linknewUm=new com.losa.observeActivity.linknew($("div[umid='linknewUm']",this.$),{id:this.id,index:this.index,planId:this.planId});
		//重载save函数
        this.linknewUm.override({
    	   save: this.proxy(function(data){
   			this._save(data);
   			})
        });
	},
    _query:function(id){
    	var data = {
 	      		"method":"pullActivity",
 	      		"activityId":id,
	      		"flyStageName":"crewInterview"
 			 };
 		     myAjaxQuery(data, null, this.proxy(function(response) {
 					 this.jsonCrewVue.$set('jsonCrew',response.jsonActivity.jsonCrew);	
 					 this.jsonCrewVue.$set('jsonCrewCopy',_clone(response.jsonActivity.jsonCrew));
 			 }));	
  },
  _submit:function(id){
		this.linknewUm.submitLosa(this.id);
	},
  _save:function(func){
	  if(typeof func == 'function'
				&& _compObj(this.jsonCrewVue.jsonCrewCopy,this.jsonCrewVue.jsonCrew)){
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
	  var data = {
			  "method":"pushActivity",
			  "jsonActivity":JSON.stringify({
			  "jsonObserve":JSON.stringify({
				  "activityId":this.id	
			  }),
			  "jsonCrew":JSON.stringify(
			    			this.jsonCrewVue.jsonCrew
			    		  ),
			    	  })
	   
		 };
		 myAjaxModify(data, null, this.proxy(function(response) {
			 if(response.Code=="success"){
				 	if(func != undefined && typeof func == 'function'){
						func();
					}else{
						$.u.alert.success("保存成功");
						this._query(this.id);
					}
				}else{
					$.u.alert.error("保存失败");
				}			
				
			}));
  }
}, { usehtm: true, usei18n: false });
com.losa.observeActivity.crewInterview.crewInterview.widgetjs = [
																	"../../../eiosa/base.js",
																	"../../../../uui/widget/spin/spin.js",
																	"../../../../uui/widget/jqblockui/jquery.blockUI.js",
																	"../../../../uui/widget/ajax/layoutajax.js",
																	"../../../../uui/util/objectutil.js"
                                                                  ];
com.losa.observeActivity.crewInterview.crewInterview.widgetcss = [
                                                                  { path: '../../../../css/losa.css' }
                                                                  ]