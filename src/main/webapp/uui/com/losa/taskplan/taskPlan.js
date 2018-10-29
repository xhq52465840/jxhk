//$.u.load("com.losa.taskplan.planDetail");
//$.u.load("com.losa.taskplan.planEdit");
$.u.load("com.losa.scheme.schemeEdit");
$.u.load("com.losa.taskplan.mulPlan");
$.u.load("com.losa.observeActivity.taskPlan.planLog");
$.u.define('com.losa.taskplan.taskPlan', null, {
	init:function(options){
		this._options = options || null;
		this.i18n = com.losa.taskplan.taskPlan.i18n;
		this._select2PageLength = 10;
		this.planDetailUm = null;
		this.planEditUm = null;
		this.mulPlanUm = null;
		this.schemeEditUm = null;
		this.planLogUm=null;
		this.schemeId = null;
		this._flightTemplate = '<div class="row">'
			  +		'<div class="col-sm-3">#{carrier}#{flightNO}</div><br/>'
			  +		'<div class="col-sm-9">'
			  +			'<div>起飞机场：#{deptAirportName}</div>'
			  +			'<div>到达机场：#{arrAirportName}</div>'
			  +		'</div>'
			  +'</div>';
	},
	afterrender:function(){
		var _that = this;
		if(this._options!=null){
			this.schemeId = this._options.schemeId;
		}
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
		
		this.planQueryFormVue = new Vue({
			el : '#planQueryForm',
			data : {
					schemeTypeNames:'',
					planStatusNames:'',
					planQueryForm:{planNo:'',schemeName:'', observeDateFrom:'',observeDateTo:'',
						flyNo:'',depAirportName:'',arrAirportName:'',observerName:'',planStatus:''},
				},
			methods : {
				search : this.proxy(this._queryPlansInit),
				reset : this.proxy(this._queryPlansReset),
				collapseToggle:this.proxy(this._collapseToggle),
			},
			watch:{
				   'planQueryForm.observeDateFrom':function(val, oldVal){
					   var observeDateTo = this.planQueryForm.observeDateTo;
					   if(!_that._isEmpty(val) && !_that._isEmpty(observeDateTo) && !_that._compareDate(val,observeDateTo)){
						   $.u.alert.error("查询开始日期不能大于结束日期！");
						   this.planQueryForm.observeDateFrom = oldVal;
					   }
				   },
				   'planQueryForm.observeDateTo':function(val, oldVal){
					   var observeDateFrom = this.planQueryForm.observeDateFrom;
					   if(!_that._isEmpty(val) && !_that._isEmpty(observeDateFrom) && !_that._compareDate(observeDateFrom,val)){
						   $.u.alert.error("查询结束日期不能小于开始日期！");
						   this.planQueryForm.observeDateTo = oldVal;
					   }
				   },
			   }
		});	
		this.planListVue = new Vue({
			el : '#planList',
			data : {taskPlans:''
					,addParam:{schemeId:'',observeDate:'',deptAirport:'',arrAirport:'',flyNo:'',observerId:'',flightPlanId:''},
					pagebarsData:{
						all : 0, // 总条数
						cur : 1,// 当前页码
						start : 0,//当前条数
						length : 10,// 单页条数
					},
					orders:{
						sortby : '', // 排序字段
						sortorders : 'asc',// 排序方式
					}, 
					options1: [
				      		      { id: 0, text: '' },
				      		    ],
	      		    options2: [
			      		      { id: 0, text: '' },
			      		    ],
			        schemeId:this.schemeId,
					schemeSubject:'',
					dataObject:[],   //选航班data开始
					options:{
						inputValueDisabled:false,
						isAjaxContentData:false,
						selectNewInputStyle:{position:'relative',left:'0px',top:'3px'},
						dataUrl:$.u.config.constant.smsqueryserver
					},
					checkedAll : false,
				},
				computed: {
					isCheckedAll: function () {
						var chknum = this.taskPlans.length;
						var jsonPathObj = new Object();
						jsonPathObj.jsonPathObj = this.taskPlans;
						var chk = jsonPath(jsonPathObj, "$..jsonPathObj[?(@.checked==true)]").length;
						if (chknum != chk) {
							this.checkedAll = false;
						} else {
							this.checkedAll = true;
						}
	          return chknum == chk;
					},
				},	
			methods:{
				addSinglePlan:this.proxy(this._addSinglePlan),
				saveSinglePlan:this.proxy(this._saveSinglePlan),
				changeScheme:this.proxy(this._changeScheme),
				cancelAddPlan:this.proxy(this._cancelAddPlan),
				changeObserveDate:this.proxy(this._changeObserveDate),
				delPlans:this.proxy(this._delPlans),
				modifyStatus:this.proxy(this._modifyStatus),
				addMulPlan:this.proxy(this._addMulPlan),
				openObserview:this.proxy(this._openObserview),
				queryPlans:this.proxy(this._queryPlans),
				openScheme:this.proxy(this._openScheme),
				checkAllPlans:this.proxy(this._checkAllPlans),
				page : this.proxy(this._queryPlans),
				inputTips:this.proxy(this._inputTips)
			},
			watch:{
				'addParam.observeDate':function(){
					if(this.addParam.observeDate != null && this.addParam.observeDate != ''){
						this.options.inputValueDisabled = false;
					}
				}
			}
		});
		
		//隐藏新增计划行
		$("#add_tr").hide();
		//查询方案类型
		//this._querySchemeTypeNames();
		//查询计划状态
		this._queryPlanStatusNames();
		$("#observeDateFrom").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		$("#observeDateTo").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		this._queryPlansInit();
		//this.planLogUm=new com.losa.observeActivity.taskPlan.planLog($("div[umid='planLog']",this.$),{});

	},
	
	//判断录入观察日期后才能选择航班
	_inputTips:function(){
		if(this.planListVue.addParam.observeDate==null||this.planListVue.addParam.observeDate==""||this.planListVue.addParam.observeDate==undefined){
   			layer.msg('请先录入观察日期！');
       		return false;
   		}
	},
	
	//初始查询，点击查询按钮查询
	_queryPlansInit:function() {
		this.planListVue.$set("pagebarsData.cur",1);
		this.planListVue.$set("pagebarsData.start",0);
		this._queryPlans();
	},
	//查询审计计划
	_queryPlans:function(){
		var data = {
			"method" : "queryTaskPlan",
			"planQueryForm":JSON.stringify(this.planQueryFormVue.planQueryForm),
			"schemeId":this.schemeId,
			"start":this.planListVue.pagebarsData.start,
			"length" : this.planListVue.pagebarsData.length,
			"sortby" : this.planListVue.orders.sortby,
			"sortorders" : this.planListVue.orders.sortorders,
		};
		myAjaxQuery(data,null,this.proxy(function(response){
			if (response.success) {
				this.planListVue.$set("taskPlans", response.data);
				this.planListVue.$set("pagebarsData.all",response.all);
				$("#allPlan").removeProp("checked"); 
			}
		})); 
	},
	//重置查询条件
	_queryPlansReset:function(){
		this.planQueryFormVue.$set("planQueryForm"
				,{planNo:'',schemeName:'', observeDateFrom:'',observeDateTo:'',
					flyNo:'',depAirportName:'',arrAirportName:'',observerName:'',planStatus:''});
	},
	//查询计划状态
	_queryPlanStatusNames:function(e){
		var data = {
			"method" : "queryDictNames",
			"dictType" : "plan_status"
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.planQueryFormVue.$set('planStatusNames', response.data)
			}
		})); 
	},
	_addSinglePlan:function(){
		//显示新增数据的行
		$("#add_tr").show();		
       	this._addScheme();
       	this._addObserver();
       	$("#addObserveDate").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
       	if(this.schemeId!=null){
       		var data = {
       				"method":"losaQuerySchemeInfoById",
       				"schemeId":this.schemeId
       			};
       		myAjaxQuery(data,null,this.proxy(function(response){
       			if (response.success) {
       				this.planListVue.$set("schemeSubject", response.data.schemeSubject);
    			}
       		}));
       	}
	},
	_addScheme:function(){
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
				this.planListVue.$set("options1", array);
			}
		})); 		
	},
	//添加单挑计划的时候，方案选择
	_changeScheme:function(){
		this.planListVue.addParam.observerId = '';
		this._addObserver();
	},
	_addObserver:function(){
		var schemeId = this.planListVue.addParam.schemeId;
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
				this.planListVue.$set("options2", array);
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
    //保存单条审计计划信息
    _saveSinglePlan:function(){
    	var schemeId = this.planListVue.addParam.schemeId;
    	if(this.schemeId!=null){
    		schemeId = this.schemeId;
    	}
    	var observeDate = this.planListVue.addParam.observeDate;
    	var flyNo = this.planListVue.addParam.flightPlanId;
    	var observerId = this.planListVue.addParam.observerId;
    	if(observeDate==null||observeDate==""){
			layer.msg('观察日期不能为空');
		}else if(flyNo==null || flyNo==""){
			layer.msg('航班号不能为空');
		}else if(observerId==null || observerId==""){
			layer.msg('观察员不能为空');
		}else{
			data = {
					 "method":"saveTaskPlan",
					 "schemeId":schemeId,
					 "observeDate":observeDate,
					 "flyNo":flyNo,
					 "observerId":observerId
				};
	    	myAjaxModify(data, null, this.proxy(function(response) {
				if(response.code=="success"){
					this.planListVue.$set("addParam",{schemeId:'',observeDate:'',deptAirport:'',arrAirport:'',flyNo:'',observerId:'',flightPlanId:''});
					$("#add_tr").hide();
					this._queryPlans();
					$.u.alert.success("保存成功！");
				}else if(response.code=="isExist"){
					layer.msg('相同观察日期和航班的观察计划已经存在，无法新增！');
				}else{
					$.u.alert.error("保存失败！");
				}
			}));
		}
    },
    //取消新增单条审计计划
    _cancelAddPlan:function(){
    	$("#add_tr").hide();
    	var addParam = {schemeId:'',observeDate:'',deptAirport:'',arrAirport:'',flyNo:'',observerId:'',flightPlanId:''};
    	this.planListVue.$set("addParam",addParam);
    },
    //删除草稿状态的审计计划
    _delPlans:function(e){
    	var isreturn = false;
    	var planIds = [];
    	var checkboxes = $("#planListBody input[type=checkbox]:checked");
    	if(!checkboxes.length){
    		$.u.alert.error("请选择需要删除的记录！");
			return false;
    	}
    	checkboxes.each(function(){
    		var planId = $(this).attr("dataid");
    		var planStatus = $(this).attr("datastatus");
    		if(planStatus != "draft"){
    			$.u.alert.error("有记录不是草稿状态，不能删除！");
    			isreturn = true;
    			return false;
    		}else{
    			planIds.push(planId);
    		}
    	});
    	if(isreturn){
    		return;
    	}
    	var layerindex = layer.confirm('是否确认删除？', {
		    btn: ['确认','取消'] //按钮
		},  this.proxy(function(){
			var data = {
				"method":"delTaskPlan",
   				"planId":JSON.stringify(planIds)
			};
			layer.close(layerindex); 
			myAjaxModify(data, null, this.proxy(function(response) {
				// 已删除;
				if(response.success){
		        	  $.u.alert.success("删除成功！");
		        	  					
					  this._queryPlans();
		        }else{
		        	  $.u.alert.error("删除失败！");
		        }
				
			}));
		}), this.proxy(function(){
		})) ;
    },
    //发布计划
    _modifyStatus:function(e){
    	var isreturn = false;
    	var planIds = [];
    	var planStatus = $(e.currentTarget).attr("data");
    	var checkboxes = $("#planListBody input[type=checkbox]:checked");
    	if(!checkboxes.length){
    		$.u.alert.error("请选择需要发布的记录！");
			return false;
    	}
    	checkboxes.each(function(){
    		var planId = $(this).attr("dataid");
    		var planStatus = $(this).attr("datastatus");
    		if(planStatus != "draft"){
    			$.u.alert.error("有记录不是草稿状态，不能发布！");
    			isreturn = true;
    			return false;
    		}else{
    			planIds.push(planId);
    		}
    	});
    	if(isreturn){
    		return;
    	}
    	var layerindex = layer.confirm('是否确认发布？', {
		    btn: ['确认','取消'] //按钮
		},  this.proxy(function(){
			data = {
		             "method":"modifyTaskPlan",
		             "planIds":JSON.stringify(planIds),
		             "planStatus":planStatus,
		             "modifyFlag":"modifyStatus"
		          };
			myAjaxModify(data, null, this.proxy(function(response) {
				if(response.success){
		        	  $.u.alert.success("发布成功！");
		        	  layer.close(layerindex); 					
					  this._queryPlans();
		        }else{
		        	  $.u.alert.error("发布失败！");
		        }
				
			}));
		}), this.proxy(function(){
		})) ;
    },
    //添加连续计划
    _addMulPlan:function(){
		if(this.mulPlanUm != null) delete this.mulPlanUm;
    	this.mulPlanUm = new com.losa.taskplan.mulPlan($("div[umid='mulPlan']",this.$),{schemeId:this.schemeId});
    	var layerindex = layer.open({
	        type: 1,
	        title: '添加计划',
	        maxmin: false,
	        fix: true,
	        closeBtn: 1,
	        maxmin:true,
	        zIndex : 20,//解决和其它组件的层叠冲突,如果不设select2无法正确显示
	        shadeClose: false, //点击遮罩关闭层
	        area : ['1300px','650px'],
	        content: $("div[umid='mulPlan']",this.$),
	        end:this.proxy(function() {
	        		this._queryPlans();
	        }),
	    });
    	this.mulPlanUm.myLayerIndex = layerindex;
    },
    //打开观察活动
    _openObserview:function(e){
//    	debugger
    	var id=$(e.currentTarget).attr("data");
    	var planId=$(e.currentTarget).attr("data1");
    	if(this.schemeId==null||this.schemeId==''){
    		window.open("observeActivity/taskPlan/planEdit.html?id="+id+"&planId="+planId);
    	}else{
    		window.open("../observeActivity/taskPlan/planEdit.html?id="+id+"&planId="+planId);
    	}
    	
    },
    //查看方案信息
    _openScheme:function(e){
		var schemeId = $(e.currentTarget).attr("dataid");
    	window.open("scheme/schemeDetail.html?schemeId="+schemeId);
	},
	//隐藏查询条件
	_collapseToggle:function(e){
		var $this = $(e.currentTarget);
	    
	    if($this.hasClass("fa-angle-double-up")){
	        $this.removeClass("fa-angle-double-up").addClass("fa-angle-double-down");
	    }
	    else{
	        $this.removeClass("fa-angle-double-down").addClass("fa-angle-double-up");
	    }
	    $this.closest("table").next("table").toggleClass("hidden");
		
	},
	//全选功能
	_checkAllPlans:function(e){		
		var jsonPathObj = new Object();
		jsonPathObj.jsonPathObj = this.planListVue.taskPlans;
	    var res = jsonPath(jsonPathObj, "$..jsonPathObj[?(@.checked=="+this.planListVue.checkedAll+")]");
	    for(var v in res){
	    	res[v].checked=!this.planListVue.checkedAll;  
	     }
	    this.planListVue.checkedAll = !this.planListVue.checkedAll;
	},
	_isEmpty:function(value){
		if(value == null || value == '' || value == undefined){
			return true;
		}
		return false;
	},
	//日期比较(yyyy-mm-dd)
	_compareDate:function(a, b){
	    var arr = a.split("-");
	    var starttime = new Date(arr[0], arr[1], arr[2]);
	    var starttimes = starttime.getTime();

	    var arrs = b.split("-");
	    var lktime = new Date(arrs[0], arrs[1], arrs[2]);
	    var lktimes = lktime.getTime();

	    if (starttimes > lktimes) {
	        return false;
	    }
	    return true;
	}
}, { usehtm: true, usei18n: true});
com.losa.taskplan.taskPlan.widgetjs = ["../../eiosa/base.js",
                                       "../vuewidget/selectflights/js/selectflights.js",
                                       ];
com.losa.taskplan.taskPlan.widgetcss = [{path:"../vuewidget/selectflights/css/selectflights.css"},];
