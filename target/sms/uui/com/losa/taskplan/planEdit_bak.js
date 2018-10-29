$.u.load("com.losa.observeActivity.link");
$.u.define('com.losa.taskplan.planEdit', null, {
	init : function(options) {
		this._options = options || null;
		this.linkUm=null;
		//this.planId = this._options.planId;	
		this.planId =null;
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
		
		var url=location.href;
		this.planId=url.split('?')[1].split('=')[1];
		this.linkUm=new com.losa.observeActivity.link($("div[umid='linkUm']",this.$),{id:this.planId});
		this._initPlanDetail();
	},
	//初始化审计计划详情页面
	_initPlanDetail:function(){
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
		
		this.planEditVue = new Vue({
			el : '#planEditForm',
			data : {planInfo:{}},
			methods:{
				save : this.proxy(this._saveEditPlan),
				cancel : this.proxy(this._cancelEditPlan),
			}
		});
		
		$("#observeDate").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		
		//加载数据
		this._load();				
	},
	//初始化数据
	_load:function(){	
		var data = {
			"method":"queryTaskPlan",
			"planId":this.planId
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.planEditVue.$set("planInfo",response.data[0]);
				$("#planEditScheme").select2("data"
						,{id:response.data[0].schemeId,schemeSubject:response.data[0].schemeSubject});
				$("#planEditFly").select2("data"
						,{id:response.data[0].flightId,carrier:response.data[0].flyNo,flightNO:''});
				$("#planEditObserver").select2("data"
						,{id:response.data[0].observerId,fullname:response.data[0].observer});
			}
		}));
		//设置审计方案查询的select2控件
		this._schemeSelect2();
		//设置航班查询的select2控件
		this._flySelect2();
		//设置观察员查询的select2控件
		this._observerSelect2();
		
	},
	//添加select2控件 查询审计方案
	_schemeSelect2:function(){
		$("#planEditScheme").select2({     
			  allowClear: true,
		      ajax: {
		              url: $.u.config.constant.smsqueryserver,
		              dataType: "json",
		              type: "post",
		              data: this.proxy(function(term, page){
		                  return {
		                      tokenid: $.cookie("tokenid"),
		                      method: "querySchemes",
		                      "schemeSubject":term
		                  };
		              }),
		              results: function(response){                         
		                  if(response.success){
		                      return {
		                         "results": response.data
		                      }
		                  }
		              }                       
		          },
		          id: function(item){
		              return item.id;
		          },
		          placeholder : "请输入方案主题",
		          formatResult:function(item){
		            return item.schemeSubject;                                          
		          },
		          formatSelection:function(item){                     
		             return item.schemeSubject;
		          },
		          formatNoMatches:function(item){
		             return "没有您需要的方案,请先维护方案信息";                             
		          }                         
		    });
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
	    				"method": "getBaseInfo",
	    				"dataTime": this._formatDate(this.planEditVue.planInfo.observeDate),
	    				"flightNum": term,
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
    		id:function(item){ return item.flightInfoID; },
	        formatResult: this.proxy(this._getFlightHtml),
	        formatSelection: function(item){
	        	return item.carrier + item.flightNO;
	        }
    	}).on("select2-selecting", this.proxy(function(e){
    		this.planEditVue.$set("planInfo.deptAirport",e.object.deptAirportName);
    		this.planEditVue.$set("planInfo.arrAirport",e.object.arrAirportName);
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
    							   .replace(/#\{flightNO\}/g, flight.flightNO)
    							   .replace(/#\{deptAirportName\}/g, flight.deptAirportName)
    							   .replace(/#\{arrAirportName\}/g, flight.arrAirportName); 
    },
    //初始观察日期格式化
    _formatDate:function(value){
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
    },
    //设置查询观察员的select2控件
    _observerSelect2:function(){
    	$("#planEditObserver").select2({
			 ajax: {
              url: $.u.config.constant.smsqueryserver,
              dataType: "json",
              type: "post",
              data: this.proxy(function(term, page){
                  return {
                      tokenid: $.cookie("tokenid"),
                      method: "queryAuditors",
                      "type":"losa",
                      "name":term
                  };
              }),
              results: this.proxy(function(response){
                  if(response.success){
                      return {
                      	 "results": response.auditorList
                      }
                  }
              })
              
          },
          id: function(item){
              return item.id;
          },
          placeholder : "请输入审计员名称",
          formatResult:function(item){
            return item.fullname;
          },
          formatSelection:function(item){
          	return item.fullname;
          }
    	});
    },
    //取消编辑计划信息
    _cancelEditPlan:function(){
    	layer.close(this.myLayerIndex);//由父传递过来
    },
    //保存修改的计划信息
    _saveEditPlan:function(){
    	var planId = this.planId;
    	var schemeId = this.planEditVue.planInfo.schemeId;
        var observeDate = this.planEditVue.planInfo.observeDate;
        observeDate = this._formatDate(observeDate);
        var flightId = this.planEditVue.planInfo.flightId;
        var observerId = this.planEditVue.planInfo.observerId;
        var planDesc = this.planEditVue.planInfo.planDesc;
        if(observeDate==null||observeDate==""){
	        layer.msg('观察日期不能为空');
        }else if(flightId==null || flightId==""){
        	layer.msg('观察航班不能为空');
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
        	myAjaxModify(data, null, this.proxy(function(response) {
	          if(response.success){
	        	  parent.$.u.alert.success("保存成功！");
	        	  losaMainUm.taskPlanUm.planListVue.$set("child_modified", true);
	        	  layer.close(this.myLayerIndex);//由父传递过来
	          }else{
	        	  $.u.alert.error("保存失败！");
	          }
        }));
      }
    }
},{
	usehtm : true,
	usei18n : false
});

com.losa.taskplan.planEdit.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                       '../../../uui/vue.js',
                                       "../../eiosa/base.js",];
com.losa.taskplan.planEdit.widgetcss = [{ path: '../../../css/losa.css' },
                                        { path:"../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];