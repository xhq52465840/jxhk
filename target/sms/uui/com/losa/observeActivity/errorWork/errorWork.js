var height=450;
var baseInfo="";
var id="";
$.u.load("com.losa.observeActivity.linknew");
$.u.define('com.losa.observeActivity.errorWork.errorWork', null, {
	init:function(options){
		this._options = options||null;
        this.id=this._options.id;
        this.index = this._options.index;
		this.linknewUm=null;
		this.planId = this._options.planId;
	},
	afterrender:function(){
		var _that = this;
		this.errorVue=new Vue({
			el : '#error',
			data : {errorList:'',jsonObserve:'',baseInfo:'',errorListCopy:''},
			methods :{
				save : this.proxy(this._save),
			    submit : this.proxy(this._submit),
				query:this.proxy(function(id){
						 this._query(this.id);
					}),
				addmore:this.proxy(function(id){				    
					this._addmore(this.id);
				    }),
				delerror : this.proxy(this._delerror),
				checkAllPlans:this.proxy(this._checkAllPlans),
				isCheckAllChecked:this.proxy(this._isCheckAllChecked),
			},
			filters:{
				'syncitemfromtype':{
					read:function(selectitem,selecttype,baseinfo,index,type){
	//					debugger;
						if(_that._isEmpty(selecttype)){
							selectitem = "";
						}else{
							if(baseinfo!= null && baseinfo.length > 0){
								var options = [];
								for(var i=0;i<baseinfo.length;i++){
									if(baseinfo[i].parentNode==selecttype.id && _that._isNotEmpty(selecttype)){
										options.push(baseinfo[i]);
									}
								}
								if(_that._isNotEmpty(selectitem) && options != null && options.length > 0){
									var isEqual = 0;
									for(var j=0;j<options.length;j++){
										if(_compObj(selectitem,options[j])){
											isEqual++;
											break;
										}
									}
									//debugger;
									if(isEqual == 0){
										selectitem = "";
									}
									
								}else{
									selectitem = "";
								}
							}else{
								selectitem = "";
							}
						}
						if(type == 'errorTypeItem'){
							this.errorList[index].errorTypeItem = selectitem;
						}
						if(type == 'errorNumber'){
							this.errorList[index].errorNumber = selectitem;
						}
						if(type == 'relateThreatNumber'){
							this.errorList[index].isRelateThreatNumber = selectitem;
						}
						if(type == 'unexceptAircraftNumber'){
							this.errorList[index].unexceptAircraftNumber = selectitem;
						}
						return selectitem;
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
				 this.errorVue.$set('baseInfo',response.jsonBaseInfo);	
				 Vue.nextTick(function(){
					_that._query(this.id); 
				 });
			}));
	},
   _query:function(id){
	   var data = {
	      	   "method":"pullActivity",
	      	   "activityId":this.id,
	      	   "flyStageName":"error"
			 };
//	   debugger;
	   myAjaxQuery(data, null, this.proxy(function(response) {
			  if(response.jsonActivity.jsonError!=null){
				  var jsonError = response.jsonActivity.jsonError;
				  for(var i=0;i<jsonError.length;i++){
					  var jsonErrorJsonObj = jsonError[i];
					  for(var _key in jsonErrorJsonObj){
						if(jsonErrorJsonObj[_key] == null && _key != "localId"){
							jsonErrorJsonObj[_key] = "";
						}  
					  }
				  }
				  this.errorVue.$set('errorList',jsonError);				 
			 }else{
				 var data=[{"errorCode":"E1","isDealValidity":1,"activityId":this.id,"flightProcedure":"","errorType":"",
					 "errorTypeItem":"","errorNumber":"","thePersonCauseError":"","thePersonFoundError":"","crewPesponseForError":"",
					 "theConsequencesOfError":"","isRelateThreatType":"","isRelateThreatNumber":"","unexceptAircraftType":"",
					 "unexceptAircraftNumber":"","thePersonFoundStatus":"","crewResponseForUnexceptAir":"",
					 "theConsequencesofUnexceptAi":""
				 }];
				 this.errorVue.$set('errorList',data);
			 }	 	
			 
			  this.errorVue.$set('errorListCopy',_cloneArray(this.errorVue.errorList));
		}));		 
   },
   _submit:function(id){
	   if(!this._validateData(this.errorVue.errorList)){
		   return false;
	   }
	   this.linknewUm.submitLosa(this.id);
	},
   _save:function(func){
	   if(typeof func == 'function'
			&& _compArray(this.errorVue.errorListCopy,this.errorVue.errorList)){
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
	   if(!this._validateData(this.errorVue.errorList)){
		   return false;
	   }
	   this._transferData(this.errorVue.errorList);
	   console.log(this.errorVue.errorList);
	   var value=JSON.stringify({
  		  "jsonObserve":JSON.stringify({
  			 "activityId":this.id
  		  }),
  		  "jsonError":JSON.stringify(
  		   this.errorVue.errorList	  
  		  )
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
   _validateData:function(errorlist){
	   var isValid = true;
	   var tipPrefix = "请选择差错代号为";
	   if(errorlist != null && errorlist.length > 0){
		   for(var i=0;i<errorlist.length;i++){
			   if(this._isEmpty(errorlist[i].errorDesc)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的描述机组的差错和相应的非预期航空器状态字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].flightProcedure)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的飞行阶段字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].errorType)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的错误类型字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].errorTypeItem)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的错误类型细分字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].errorNumber)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的错误编号字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].thePersonCauseError)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的谁导致了这个差错字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].thePersonFoundError)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的谁发现了这个差错字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].crewPesponseForError)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的机组对差错的反应字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].theConsequencesOfError)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的差错的后果字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].isRelateThreatType)){
				   errorlist[i].isRelateThreatType = null;
			   }
			   if(this._isEmpty(errorlist[i].isRelateThreatNumber)){
				   errorlist[i].isRelateThreatNumber = null;
			   }
			   if(this._isEmpty(errorlist[i].isDealError)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的机组对这一差错是如何管理或管理不当的字段");
				   isValid = false;
				   break;
			   }
			   if(errorlist[i].theConsequencesOfError == 'unanticipated' && this._isEmpty(errorlist[i].unexceptAircraftType)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的非预期的航空器状态类型字段");
				   isValid = false;
				   break;
			   }
			   if(errorlist[i].theConsequencesOfError != 'unanticipated' && this._isEmpty(errorlist[i].unexceptAircraftType)){
				   errorlist[i].unexceptAircraftType = null;
			   }
			   if(errorlist[i].theConsequencesOfError == 'unanticipated' && this._isEmpty(errorlist[i].unexceptAircraftNumber)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的非预期的航空器状态编号字段");
				   isValid = false;
				   break;
			   }
			   if(errorlist[i].theConsequencesOfError != 'unanticipated' && this._isEmpty(errorlist[i].unexceptAircraftNumber)){
				   errorlist[i].unexceptAircraftNumber = null;
			   }
			   if(this._isEmpty(errorlist[i].thePersonFoundStatus)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的谁发现了这一问题字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].crewResponseForUnexceptAir)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的机组对非预期的航空器状态的反应字段");
				   isValid = false;
				   break;
			   }
			   if(this._isEmpty(errorlist[i].theConsequencesofUnexceptAi)){
				   $.u.alert.error(tipPrefix+errorlist[i].errorCode+"的非预期的航空器状态的后果字段");
				   isValid = false;
				   break;
			   }
		   }
		   return isValid;
	   }
   },
   _transferData:function(errorlist){
	   if(errorlist != null && errorlist.length > 0){
		   for(var i=0;i<errorlist.length;i++){
			   if(errorlist[i].isRelateThreatType == ""){
				   errorlist[i].isRelateThreatType = null;
			   }
			   if(errorlist[i].isRelateThreatNumber == ""){
				   errorlist[i].isRelateThreatNumber = null;
			   }
		   }
	   }
	   return errorlist;
   },
   _addmore:function(id){
		var data=this.errorVue.errorList;
		var error={"errorCode":"E"+(data.length+1),"isDealValidity":1,"activityId":this.id,"flightProcedure":"","errorType":"",
				 "errorTypeItem":"","errorNumber":"","thePersonCauseError":"","thePersonFoundError":"","crewPesponseForError":"",
				 "theConsequencesOfError":"","isRelateThreatType":"","isRelateThreatNumber":"","unexceptAircraftType":"",
				 "unexceptAircraftNumber":"","thePersonFoundStatus":"","crewResponseForUnexceptAir":"",
				 "theConsequencesofUnexceptAi":""};
		data.push(error)
		this.errorVue.$set('errorList',data);
		//height=height+80;
		//document.getElementById('spans').style.height=height+"px";
	},
	//删除
	   _delerror:function(e){
		var isreturn = false;
	   	var errorIds = [];
	   	var checkboxes = $("#error input[type=checkbox]:checked");
	   	if(!checkboxes.length){
	   		$.u.alert.error("请选择需要删除的记录！");
				return false;
	   	}
	   	checkboxes.each(function(){
	   		if($(this).attr("id") != 'allPlan'){
	   		var errorId = $(this).attr("dataid");
	   		if(errorId == null){
				$.u.alert.error("没有新的差错记录！");
				isreturn = true;
				return false;
			}else{
				errorIds.push(errorId);
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
					"method":"deleteErrorManage",
	  				"errorId":JSON.stringify(errorIds)
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
				$("#error input[type=checkbox]").prop("checked","true");
			}else{
				$("#error input[type=checkbox]").removeProp("checked");
			}
		},
		//判断全选按钮是否应该被选中
		_isCheckAllChecked:function(){
			var chknum = $("#error input[type=checkbox]").size();//选项总个数 
		    var chk = 0; 
		    $("#error input[type=checkbox]").each(function(){   
		        if($(this).prop("checked")==true){ 
		            chk++; 
		        } 
		    }); 
		    if(chknum==chk){//全选 
		        $("#allPlan").prop("checked","true");
		    }else{//不全选 
		        $("#allPlan").removeProp("checked"); 
		    }
		},
		_isNotEmpty:function(value){
		   var status =false;
		   if(value != undefined && value != null && value != ""){
			   status = true;
		   }
		   return status;
	    },
	    _isEmpty:function(value){
	    	return !this._isNotEmpty(value);
	    }
}, { usehtm: true, usei18n: false });




com.losa.observeActivity.errorWork.errorWork.widgetjs = [
															"../../../eiosa/base.js",
															"../../../../uui/widget/spin/spin.js",
															"../../../../uui/widget/jqblockui/jquery.blockUI.js",
															"../../../../uui/widget/ajax/layoutajax.js",
															"../../../../uui/util/objectutil.js"
                                                         ];
com.losa.observeActivity.errorWork.errorWork.widgetcss = [{ path: '../../../../css/losa.css' }]