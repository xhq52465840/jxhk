// @ sourceURL=com.sms.dash.staffReportUnit
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.staffReportUnit', null, {
	init : function(option) {
		var op = window.decodeURIComponent(window.decodeURIComponent(option.filter));
		this._options = $.parseJSON(op);
		this._tabName = ["com/sms/dash/staffReportUnit#0"];
		this._method = ["getUnitEmpReport"];
		require.config({paths : {echarts : './echarts/js'}});
	},
	afterrender : function(bodystr) {
		this.getDisplayFilter();
	},
	getDisplayFilter : function(index){
    	index = 0;
		var module = new com.sms.dashfilter.filter($("div[umid='sr"+index+"']", this.$), {"op":this._options,"md":this._tabName[index]});
		module.override({
			loadData:this.proxy(function(param,other,index,otherType){
    			this._loadData({
    				"method": this._method[index],
    	     		"query":param
    			});
    			this._userFilter = other;
				this._userFilterType = otherType.split(",");
    		})
    	});
		module._start();
    },
    _loadData : function(param){
    	$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : $.extend({
				"tokenid" : $.cookie("tokenid")
			}, param)
		}).done(this.proxy(function(data) {
			if (data.success) {
				this._setData(data,param);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _setData : function(data,param){
		var option = {
			backgroundColor : 'white',
			tooltip : {
		        trigger: 'axis',
		        axisPointer : {
		            type: 'shadow'
		        }
		    },
		    toolbox: {
		        show : true,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: true},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : false,
		    legend: {
		        data:['已处理','未处理','处理率']
		    },
		    grid : {
		    	y : '',
		    	y2 : 150
		    },
		    xAxis : [
		        {
		            type : 'category',
		            splitNumber : data.data.unit.length,
		            axisLabel : {
		            	interval : 0,
		            	formatter: function(value){
		            	    var a = value.split("").join("\n").toString();
		            		return a;
		            	}
		            },
		            data : data.data.unit
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value',
		            name : '数量',
		            axisLabel : {
		                formatter: '{value} 条'
		            }
		        },
		        {
		            type : 'value',
		            name : '处理率(%)',
		            axisLabel : {
		                formatter: '{value}'
		            }
		        }
		    ],
		    series : [

		        {
		            name:'已处理',
		            type:'line',
		            stack: '数量',
		            itemStyle: {
		            	 normal: { 
				            label : {
		                        show : true,
		                        textStyle : {
		                            fontSize : '15',
		                            fontFamily : '微软雅黑',
		                            fontWeight : 'bold',
		                        }
		                    }
		            	 }
		               },
		            data:data.data.finish
		        },
		        {
		            name:'未处理',
		            type:'line',
		            stack: '数量',
		            itemStyle: {
		            	 normal: { 
				            label : {
		                        show : true,
		                        textStyle : {
		                            fontSize : '15',
		                            fontFamily : '微软雅黑',
		                            fontWeight : 'bold',
		                            
		                        }
		                    }
		            	 }
		             },
				  data:data.data.unfinish
				       
		        },
		        {
		            name:'处理率',
		            type:'line',
		            yAxisIndex: 1,
		            data:data.data.completionRate
		        }
		    ]
		};
		require(['echarts', 'echarts/chart/line','echarts/chart/bar'],
            this.proxy(function (ec) {
            	var length = option.legend.data.length;
                var height = null;
                var width =$('#staffReportUnit').width();
                if(width < 1024){
                	if(length < 6){
                		height = 100;
                	}else{
                		height = parseInt(length/5*30);
                	}
                }else if(width > 1024 && width < 1900){
                	if(length < 16){
                		height = 100;
                	}else{
                		height = parseInt(length/16*30);
                	}
                }else{
                	height = parseInt(length/22*30);
                }
                option.grid.y = height;
            	var myChart = ec.init(document.getElementById('staffReportUnit'));
        		myChart.setOption(option);
            })
        )
    }
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.staffReportUnit.widgetjs = [  '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js',
										'../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js',
										'echarts/js/echarts.js'
									 ];
com.sms.dash.staffReportUnit.widgetcss = [];

