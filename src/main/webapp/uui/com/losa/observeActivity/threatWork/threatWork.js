var height=270;
var baseInfo="";
$.u.load("com.losa.observeActivity.linknew");
$.u.define('com.losa.observeActivity.threatWork.threatWork', null, {
	init:function(options){
		this._options = options||null;
        this.id=this._options.id;
        this.index = this._options.index;
		this.linknewUm=null;
		this.planId = this._options.planId;
	},
	afterrender:function(){
		var _that = this;
		this.threatVue=new Vue({
			el : '#threat',
			data : {threatList:'',baseInfo:'',threatListCopy:''},
			methods :{				
				save : this.proxy(this._save),
			    submit : this.proxy(this._submit),
				query:this.proxy(function(id){
						 this._query(this.id);
						 
					}),
				addmore:this.proxy(function(id){				    
					this._addmore(this.id);
				    }),
				delthreats:this.proxy(this._delthreats),
				checkAllPlans:this.proxy(this._checkAllPlans),
				isCheckAllChecked:this.proxy(this._isCheckAllChecked),
			},
			filters:{
				'syncfromthreattype':{
					read:function(threatnumber,threattype,baseInfo,index){
						
						if(threattype == ""){
							threatnumber = "";
						}else{
							if(baseInfo != null && baseInfo.length > 0){
								var options = [];
								for(var i=0;i<baseInfo.length;i++){
									if(baseInfo[i].parentNode==threattype.id && threattype != ''){
										options.push(baseInfo[i]);
									}
								}
								if(threatnumber != "" && options != null && options.length > 0){
									var isEqual = 0;
									for(var j=0;j<options.length;j++){
										if(_compObj(threatnumber,options[j])){
											isEqual++;
											break;
										}
									}
									//debugger;
									if(isEqual == 0){
										threatnumber = "";
									}
									
								}else{
									threatnumber = "";
								}
							}else{
								threatnumber = "";
							}
						}
						this.threatList[index].threatNumber = threatnumber;
						return threatnumber;
					},
					write:function(val, oldVal){
						return val;
					}
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
        
	},
	_queryBaseInfo:function(){
	   var _that = this;
	   var data = {
			   "tokenid":$.cookie("tokenid"),
     		   "method":"queryBaseInfo",
			 };
		     myAjaxQuery(data, null, this.proxy(function(response) {
				 this.threatVue.$set('baseInfo',response.jsonBaseInfo);
				 Vue.nextTick(function(){
			        _that._query(_that.id);
			     });
		
			}));	 	
	},
   _query:function(id){
	   var data = {
	      		"method":"pullActivity",
	      		"activityId":id,
	      		"flyStageName":"threat"
			 };
//	   debugger;
		     myAjaxQuery(data, null, this.proxy(function(response) {
				  if(response.jsonActivity.jsonThreat!=null){
					  var jsonThreat = response.jsonActivity.jsonThreat;
					  for(i=0;i<jsonThreat.length;i++){
						  if(jsonThreat[i].threatType == null || jsonThreat[i].threatType == undefined){
							  jsonThreat[i].threatType = "";
						  }
						  if(jsonThreat[i].threatNumber == null || jsonThreat[i].threatNumber == undefined){
							  jsonThreat[i].threatNumber = "";
						  }
						  if(jsonThreat[i].flightProcedure == null || jsonThreat[i].flightProcedure == undefined){
							  jsonThreat[i].flightProcedure = "";
						  }
						  if(jsonThreat[i].isDealValidity == null || jsonThreat[i].isDealValidity == undefined){
							  jsonThreat[i].isDealValidity = "";
						  }
					  }
					  this.threatVue.$set('threatList',jsonThreat); 
				 }else{
					 var data=[{"threatCode":"T1","isDealValidity":1,"activityId":id,"threatType":"","threatNumber":"","flightProcedure":"","isDealValidity":""}];
					 this.threatVue.$set('threatList',data);
				 }	
				  this.threatVue.$set('threatListCopy',_cloneArray(jsonThreat));
			}));	 	
			
   },
   _submit:function(id){
	   //验证字段
	   if(!this._isValidateData()){
		   return false;
	   }
	   this.linknewUm.submitLosa(this.id);
	},
   _save:function(func){
	   if(typeof func == 'function'
				&& _compArray(this.threatVue.threatListCopy,this.threatVue.threatList)){
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
	 //验证字段
	   if(!this._isValidateData()){
		   return false;
	   }
//	   return false;
	   var value=JSON.stringify({
 		  "jsonObserve":JSON.stringify({
			  "activityId":this.id
		  }),
		  "jsonThreat":JSON.stringify(
			   this.threatVue.threatList
		  )})
	   	
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
	    $("#allPlan").prop("checked",false);
		
	}));
   },
   _isValidateData:function(){
	   var threatlist = this.threatVue.threatList;
	   var isValid = true;
	   for(var i=0;i<threatlist.length;i++){
		   if(threatlist[i].threatDesc == ""){
			   $.u.alert.error("请填写威胁代号为"+threatlist[i].threatCode+"的描述该威胁字段");
			   isValid = false;
			   break;
		   }
		   if(threatlist[i].threatType == ""){
			   $.u.alert.error("请选择威胁代号为"+threatlist[i].threatCode+"的威胁类型字段");
			   isValid = false;
			   break;
		   }
//		   alert(threatlist[i].threatNumber);
		   if(threatlist[i].threatNumber == ""){
			   $.u.alert.error("请选择威胁代号为"+threatlist[i].threatCode+"的威胁编号字段");
			   isValid = false;
			   break;
		   }
		   if(threatlist[i].flightProcedure == ""){
			   $.u.alert.error("请选择威胁代号为"+threatlist[i].threatCode+"的飞行阶段字段");
			   isValid = false;
			   break;
		   }
		   if(threatlist[i].isDealValidity == ""){
			   $.u.alert.error("请选择威胁代号为"+threatlist[i].threatCode+"的是否得到有效管理字段");
			   isValid = false;
			   break;
		   }
		   if(threatlist[i].theMeasuresForThreat == ""){
			   $.u.alert.error("请填写威胁代号为"+threatlist[i].threatCode+"的机组对该威胁是如何管理或者管理不当的字段");
			   isValid = false;
			   break;
		   }
	   }
	   return isValid;
   },
   _addmore:function(id){
	   //debugger
		var data=this.threatVue.threatList;
			var threat={"threatCode":"T"+(data.length+1),"isDealValidity":1,"activityId":this.id,"threatType":"","threatNumber":"","flightProcedure":"","isDealValidity":""};
			data.push(threat)
			this.threatVue.$set('threatList',data);
			//height=height+40;
			//document.getElementById('spans').style.height=height+"px";
	   
   },
   //删除
   _delthreats:function(e){
	   //debugger
	var isreturn = false;
   	var threatIds = [];
   	var checkboxes = $("#threat input[type=checkbox]:checked");
   	if(!checkboxes.length){
   		$.u.alert.error("请选择需要删除的记录！");
			return false;
   	}
   	checkboxes.each(function(){
   		if($(this).attr("id") != 'allPlan'){
	   		var threatId = $(this).attr("dataid");
	   		if(threatId == null){
				$.u.alert.error("没有新的威胁记录！");
				isreturn = true;
				return false;
			}else{
	   		threatIds.push(threatId);
			}
   		}
   	});
   	if(isreturn){
		return;
	}
   	var layerindex = layer.confirm('是否确认删除？', {
		    btn: ['确认','取消'] //按钮
		},  this.proxy(function(){
			var data = {
				"method":"deleteThreatManage",
  				"threatId":JSON.stringify(threatIds)
			};
			myAjaxModify(data, null, this.proxy(function(response) {
				// 已删除;
				if(response.success){
		        	  $.u.alert.success("删除成功！");
		        	  layer.close(layerindex);
		        	  $("#allPlan").prop("checked",false);
					  this._query(this.id);
		        }else{
		        	  $.u.alert.error("删除失败！");
		        }
				
			}));
		}), this.proxy(function(){
		})) ;
   },
 //全选功能
	_checkAllPlans:function(e){
		if($(e.currentTarget)[0].checked){
			$("#threat input[type=checkbox]").prop("checked","true");
		}else{
			$("#threat input[type=checkbox]").removeProp("checked");
		}
	},
	//判断全选按钮是否应该被选中
	_isCheckAllChecked:function(){
		var chknum = $("#threat input[type=checkbox]").size();//选项总个数 
	    var chk = 0; 
	    $("#threat input[type=checkbox]").each(function(){   
	        if($(this).prop("checked")==true){ 
	            chk++; 
	        } 
	    }); 
	    if(chknum==chk){//全选 
	        $("#allPlan").prop("checked","true");
	    }else{//不全选 
	        $("#allPlan").removeProp("checked"); 
	    }
	}
}, { usehtm: true, usei18n: false });
com.losa.observeActivity.threatWork.threatWork.widgetjs = [
															"../../../eiosa/base.js",
															"../../../../uui/widget/spin/spin.js",
															"../../../../uui/widget/jqblockui/jquery.blockUI.js",
															"../../../../uui/widget/ajax/layoutajax.js",
															"../../../../uui/util/objectutil.js"
                                                           ];
com.losa.observeActivity.threatWork.threatWork.widgetcss = [{ path: '../../../../css/losa.css' }]