//@ sourceURL=com.sms.dash.systemInsecurityGauge
$.u.define('com.sms.dash.systemInsecurityGauge', null, {
	init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	var conseName = window.unescape(unescape(this._options.conseName)),//重大风险名称
			consequence = this._options.consequence;//重大风险id
		 	unitId = window.unescape(unescape(this._options.unit)),//安监机构id
		 	sysTypeId = window.unescape(unescape(this._options.sysType)),//系统id
		 	unitName = window.unescape(unescape(this._options.unitName)),//安监机构名称
		 	sysTypeName = window.unescape(unescape(this._options.sysTypeName)),//系统名称
		 	date = this._options.date;
    	//安全状态告警图（可查询）
    	this.qid("insecurity").select2({
    		width:280,
    		ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type : "post",
                data:function(term,page){
    	        	return {
    	        		tokenid:$.cookie("tokenid"),
    					method:"getInsecurityByConsequence",
    					"name":term,//可检索
    					"consequence":consequence,//重大风险id
    					"start": (page - 1) * 10,
    					"length": 10
    				};
                },
    	        results:function(response,page,query){
    	        	if(response.success){
    	        		var all = {id:0,name:"全部"};
    	        		response.data.aaData.push(all);
    	        		response.data.aaData.reverse();
    	        		return {results:response.data.aaData, more: (page * 10) < response.data.iTotalRecords}
    	        	}
    	        }
    		},
            formatResult:function(item){
            	return item.name;
            },
            formatSelection:function(item){
            	return item.name;
            }
    	});
    	this.qid("insecurity").select2("data",{"name":"全部","id":"0"});
    	this._reloadseachgauge(this.qid("insecurity").val(),unitId,sysTypeId,consequence,date);
    	this.qid("seach").on("click",this.proxy(function(){
    		this._reloadseachgauge(this.qid("insecurity").val(),unitId,sysTypeId,consequence,date);
    	}));
    	
    },
   
    _reloadseachgauge:function(insecurity,unitId,sysTypeId,consequence,date){
    	var max = 100,value = 0,tempdate = date;
    	if(tempdate == "undefined"){
    		tempdate = "";
    	}
    	$.u.ajax({//不安全状态柱状图
	   		 url:$.u.config.constant.smsqueryserver,
	   		 dataType:"json",
	   		 type:"post",
	   		 "data":{
	   			 tokenid:$.cookie("tokenid"),
	   			 "method":"drawGaugeByInsecurity",
	   			 "insecurity":insecurity,
	   			 "unit":unitId,
	   			 "sysType":sysTypeId,
	   			 "date":tempdate,
	   			 "consequence":consequence
	   		 }
	   	}).done(this.proxy(function(response){
	   		if(response.success){
   				max = response.data.max;
	   			value = response.data.value;
	   			var option = {
	   	    			tooltip : {
	   	    			formatter: "{a} <br/>{b} : {c}分"
	   	    			},
	   	        toolbox: {
	   	            show : true,
	   	            feature : {
	   	                mark : {show: true},
	   	                restore : {show: true},
	   	                saveAsImage : {show: true}
	   	            }
	   	        },
	   	        series : [
	   	            {
	   	                name:'不安全状态',
	   	                max : max,
	   	                type:'gauge',
	   	                detail : {formatter:'{value}分'},
	   	                data:[{value: value, name: '得分'}],
		   	            axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
				                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
				                    color: 'auto'
				                },
				                formatter: function (a,b,c) {
				                    return a.toFixed(2);
				                }
							},
						axisLine: {            // 坐标轴线
			                lineStyle: { 
			                	color: [
		                            [response.data.green, '#00B050'],
		                            [response.data.red, '#FFC000'],
		                            [1, '#FF0000']
		                        ], // 属性lineStyle控制线条样式
			                    width: 10
			                }
			            }	
	   	            }
	   	        ]};
	   			require(['echarts','echarts/chart/gauge'],
	   	    		    function(ec){
	   	    			var myChart = ec.init(document.getElementById('gaugeseach'));
	   	    			myChart.setOption(option);
	   	    			var ecConfig = require('echarts/config');
	   	    			myChart.on(ecConfig.EVENT.DBLCLICK,eConsole);
	   	    			function eConsole(param){
	   	    				
	   	    			}
	   	    		}); 
	   		}
	   	})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
 	   		
        }));
    	  
    		                    
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.systemInsecurityGauge.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
		                              "../../../uui/widget/spin/spin.js",
		                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
		                              "../../../uui/widget/ajax/layoutajax.js",
		                              'echarts/js/echarts.js',
		                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.systemInsecurityGauge.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                         {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                         { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                         { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];