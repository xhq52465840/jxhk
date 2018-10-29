$.u.define('com.losa.taskplan.mulPlan', null, {
	init : function(options) {
		this._options = options || null;
		this._select2PageLength = 10;
		this.schemeId = this._options.schemeId;
	},
	afterrender : function() {
		this.flyQueryFormVue = new Vue({
			el : '#flyQueryForm',
			data : {flyDate:'', deptAirport:'',arrAirport:'',flyTeam:'',
					schemeId:this.schemeId,
					schemeSubject:'',
					options1: [{ id: 0, text: '' },],
	      		    options2: [{ id: 0, text: '' },], 
      		        options3: [{ id: 0, text: '' },], 
				},
			methods : {
					searchFly : this.proxy(this._queryFly),
					changeScheme:this.proxy(this._changeScheme),
				}
		});	
		this.flyListVue = new Vue({
			el : '#flyList',
			data : {
					flyList:'',
					options1: [{ id: 0, text: '' },],
				},
			    
			methods : {
					operPlan : this.proxy(this._operPlan),
					openDesc : this.proxy(this._openDesc),
					operAll:this.proxy(this._operAll)
				}
		});	
		
		this.confirmTempPlanVue = new Vue({
			el:'#footer',
			methods:{
				closeMulPlan:this.proxy(this._closeMulPlan)
			}
		});
		
		$("#observeDate").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		
		//添加查询起降机场的select2控件
		this._queryAirport();
		//添加查询所属机队的select2控件
		this._queryFlyTeam();
		//添加查询方案的select2控件
		this._addMulPlanScheme();
		//添加查询观察员的select2控件
		this._queryObservers();
		if(this.schemeId!=null){
			this._querySchemeInfo();//查询方案信息
		}
	},
	_querySchemeInfo:function(){
		data = {
				method:"losaQuerySchemeInfoById",
				schemeId:this.schemeId
		}
		myAjaxQuery(data,null,this.proxy(function(response){
			if(response.success){
				this.flyQueryFormVue.$set("schemeSubject",response.data.schemeSubject);
			}
		}));
	},
	//查询航班信息
	_queryFly:function(){
		var flyDate = this.flyQueryFormVue.flyDate;
		var deptAirport = this.flyQueryFormVue.deptAirport;
		var schemeId = $("#mulPlanScheme").val();
		if(this.schemeId!=null){
			schemeId = this.schemeId;
		}
		if(flyDate==""){
			layer.msg("请选择航班日期");
		}else if(deptAirport==""){
			layer.msg("请选择起飞机场");
		}else{
			var data = {
					"method" : "losaQueryMulFly",
					"flyDate":flyDate,
					"flyTeam":this.flyQueryFormVue.flyTeam,
					"deptAirport":deptAirport,
					"arrAirport":this.flyQueryFormVue.arrAirport,
					"schemeId":schemeId
			};
			myAjaxQuery(data,null,this.proxy(function(response){
				if (response.success) {
					this.flyListVue.$set("flyList", response.data);
					if(response.data.length==0){
						layer.msg("没有符合查询条件的数据");
					}
				}
			})); 
		}
		
	},
	//添加查询起降机场的select2控件
	_queryAirport:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "losaGetAirPort",
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data.aaData,function(index,value){
					var obj = new Object();
					obj.id = value.IATACode;
					var tex1=value.fullName;
					var tex2=value.ICAOCode;
					obj.text = tex1+"("+tex2+")";
					array.push(obj);
				})
				this.flyQueryFormVue.$set("options3", array);
				}
		})); 	
		
	},
	//方案选择的时候，重新查询观察员
	_changeScheme:function(){
		var flyList = this.flyListVue.flyList;
		if(flyList!=null){
			for(var i=0;i<flyList.length;i++){
				var mulFlyDetails = flyList[i].mulFlyDetails;
				if(mulFlyDetails!=null){
					for(var j=0;j<mulFlyDetails.length;j++){
						mulFlyDetails[j].observer = "";
					}
					flyList[i].mulFlyDetails = mulFlyDetails;
				}
				
				flyList[i].observer = "";
			}
			this.flyListVue.flyList = flyList;
		}
		
		this._queryObservers();
	},
	//添加查询所属机队的select2控件
	_queryFlyTeam:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "losaGetFlightUnitNameAndCode",
		};
		
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.unitCode;
					obj.text = value.unitName;
					array.push(obj);
				})
				this.flyQueryFormVue.$set("options2", array);
				}
		})); 		
	},
	//加入或者取消计划
	_operPlan:function(index,e){
		var operation = e.currentTarget.value;
		if(operation=='加入计划'){
			this._joinPlan(index,e);
		}else{
			this._deletePlan(index,e);
		}
	},
	//加入计划
	_joinPlan:function(index,e){
		var flyId = $(e.currentTarget).attr("data");
		var flyDate = $(e.currentTarget).attr("data1");
		var tasknum = $(e.currentTarget).attr("data2");
		var flightTaskId = $(e.currentTarget).attr("dataid");
		var schemeId = $("#mulPlanScheme").val();
		if(this.schemeId!=null){
			schemeId = this.schemeId;
		}
		var observer = this.flyListVue.flyList[tasknum].mulFlyDetails[index].observer;
		if(observer==""){
			layer.msg('观察员不能为空');
			return;
		}
		data = {
	             "method":"losaSavePlanByFlightId",
	             "flyId":flyId,
	             "observeDate":flyDate,
	             "observer":observer,
	             "schemeId":schemeId
	          };
		myAjaxModify(data, null, this.proxy(function(response) {
	          if(response.code){
	        	  this._openDesc(tasknum,flightTaskId,'task');
	          }else{
	        	  $.u.alert.error("加入计划失败！");
	          }
      }));
	},
	_deletePlan:function(index,e){
		var flyId = $(e.currentTarget).attr("data");
		var tasknum = $(e.currentTarget).attr("data2");
		var flightTaskId = $(e.currentTarget).attr("dataid");
		var data = {
				"method" : "losaDelPlanByFlightId",
				"flightId":flyId
		};
		myAjaxModify(data, null, this.proxy(function(response) {
	          if(response.code){
	        	  this._openDesc(tasknum,flightTaskId,'task');
	          }else if(response.code==false){
	        	  layer.msg('此计划不是草稿状态，无法取消！');
	          }else{
	        	  $.u.alert.error("取消计划失败！");
	          }
      }));
	},
	//查询连续航班下具体航班信息
	_openDesc:function(index,e,flag){
		if(flag==undefined){
			var flightTaskId = $(e.currentTarget).attr("dataid");
			$("#flyDetail"+flightTaskId).toggle();
		}else{
			var flightTaskId = e;
		}
		var data = {
				"method" : "losaQueryDetailFly",
				"flightTaskId":flightTaskId
		};
		myAjaxQuery(data,null,this.proxy(function(response){
			if (response.success) {
				this.flyListVue.flyList[index].mulFlyDetails = response.data;
				if(flag!=undefined){
					$("#flyDetail"+flightTaskId).show();
				}
			}
		}));
	},
	//根据航班段插入计划或取消计划
	_operAll:function(index,e){
		var operation = e.currentTarget.value;
		if(operation=='加入计划'){
			this._joinAll(index,e);
		}else{
			this._deleteAll(index,e);
		}
	},
	_joinAll:function(index,e){
		var flightTaskId = $(e.currentTarget).attr("dataid");
		var flyDate = $(e.currentTarget).attr("dataid1");
		var schemeId = $("#mulPlanScheme").val();
		if(this.schemeId!=null){
			schemeId = this.schemeId;
		}
		var observer = this.flyListVue.flyList[index].observer;		
		if(observer==""){
			layer.msg('观察员不能为空');
			return;
		}
		data = {
	             "method":"losaSavePlanByTask",
	             "flightTaskId":flightTaskId,
	             "observeDate":flyDate,
	             "observer":observer,
	             "schemeId":schemeId
	         };
		myAjaxModify(data, null, this.proxy(function(response) {
	          if(response.code){
	        	  var data1 = {
	  					"method" : "losaQueryMulFly",
	  					"flightTaskId":flightTaskId,
	  			};
	  			myAjaxQuery(data1,null,this.proxy(function(response1){
	  				if (response1.success) {
	  					this.flyListVue.flyList[index].joinPlan = '0';
	  					this.flyListVue.flyList[index].observerNames =  response1.data[0].observerNames;
	  					this._openDesc(index,flightTaskId,'task');
	  				}
	  			})); 
	          }else{
	        	  $.u.alert.error("操作失败！");
	          }
      }));
	},
	_deleteAll:function(index,e){
		var flightTaskId = $(e.currentTarget).attr("dataid");
		data = {
	             "method":"losaDelPlanByTask",
	             "flightTaskId":flightTaskId
	          };
		myAjaxModify(data, null, this.proxy(function(response) {
	          if(response.code){
	        	  this._openDesc(index,flightTaskId,'task');
	        	  if(response.flyNos){
	        		  layer.msg(response.flyNos+" ,不是草稿状态，无法取消！");
	        	  }
	        	  this.flyListVue.flyList[index].joinPlan = '1';
	        	  this.flyListVue.flyList[index].observer = '';
	          }else{
	        	  $.u.alert.error("操作失败！");
	          }
      }));
	},
	//查询Losa审计员
	_queryObservers:function(){
		var schemeId = $("#mulPlanScheme").val();
		if(this.schemeId!=null){
			schemeId = this.schemeId;
		}
		var data = {
				tokenid: $.cookie("tokenid"),
				method: "losaQueryLosaAuditors",
				"schemeId":schemeId,
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
				this.flyListVue.$set("options1", array);
				}
		})); 		
	},
 	//确认计划
 	_closeMulPlan:function(){
 		debugger;
  	    layer.close(this.myLayerIndex);//由父传递过来
 	},
 	//添加方案的select2控件
 	_addMulPlanScheme:function(){
 		//添加select2控件 查询审计方案
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
					array.push(obj);
				})
				this.flyQueryFormVue.$set("options1", array);
				}
		})); 		      	       	
 	}
},{
	usehtm : true,
	usei18n : false
});
com.losa.taskplan.mulPlan.widgetjs = [];
com.losa.taskplan.mulPlan.widgetcss = [];