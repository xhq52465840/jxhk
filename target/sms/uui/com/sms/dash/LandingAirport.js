// @ sourceURL=com.sms.dash.LandingAirport
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.LandingAirport', null, {
	init : function(option) {
		var op = window.decodeURIComponent(window.decodeURIComponent(option.filter));
		this._options = $.parseJSON(op);
		this._tabName = ["com/sms/dash/LandingAirport#0"];
		this._method = ["getAirportFliterPie"];
		require.config({paths : {echarts : './echarts/js'}});
	},
	afterrender : function(bodystr) {
		this.getDisplayFilter();
	},
    getDisplayFilter : function(index){
    	index = 0 ;
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
    	var option = this._option();
    	var option2 = this._option2();
		data.data && $.each(data.data, this.proxy(function(k,v){
			if(v.value!=0){
				option.legend.data.push(v.name);
				option.series[0].data.push(v);
				option2.yAxis[0].data.push(v.name);
				option2.series[0].data.push(v);
			}
		}));
		require(['echarts', 'echarts/chart/funnel', 'echarts/chart/pie', 'echarts/chart/bar'],
            this.proxy(function (ec) {
            	var length = option.legend.data.length;
        		var height = null;
        		var width =$('#LandingAirport').width();
                if(width < 500){
                	if(length < 4){
                		height = 100;
                	}else{
                		height = parseInt(length/4*30);
                	}
                }else if(width > 500 && width < 800){
                	if(length < 6){
                		height = 100;
                	}else{
                		height = parseInt(length/6*30);
                	}
                }else{
                	height = parseInt(length/10*30);
                }
                var height2 = height+300;
                height = height+100;
                if(length <= 2){
                	height = '50%';
        			height2 = 200;
                }
                option.series[0].center = ['50%', height];
                $('#LandingAirport').css({'height':height2+'px'});
        		$('#LandingAirport_bar').css({'height':height2+'px'});
            	var myChart = ec.init(document.getElementById('LandingAirport'));
        		myChart.setOption(option);
        		var myChart3 = ec.init(document.getElementById('LandingAirport_bar'));
        		myChart3.setOption(option2);
            })
        )
    },
	_option : function(){
		return {
			backgroundColor : 'white',
		    title : {
		       
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    toolbox: {
		        show : false,
		        x : 'right',
  		        y : 'center',
  		        orient : 'vertical',
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: true},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    legend: {
		    	orient : 'horizontal',
		        x : 'center',
		        y : 'top',
		        data:[]
		    },
		    calculable : true,
		    series : [
		        {
		            name:'不安全事件',
		            type:'pie',
		            radius : '40%',
		            center: ['50%', '50%'],
		            itemStyle : {
		                normal : {
		                	label : {
		                		show : false
		                	},
		                    labelLine : {
		                        show : false
		                    }
		                }
		            },
		            data:[
		            ]
		        }
		    ]
		};
	},
	_option2 : function(){
		return {
		    title : {
		        
		    },
		    backgroundColor : 'white',
		    tooltip : {
		        trigger: 'axis'
		    },
		    toolbox: {
		        show : false,
		        x : 'right',
  		        y : 'center',
  		        orient : 'vertical',
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: true},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : false,
		    grid : {
		    	x : '30%'
		    },
		    xAxis : [
		        {
		            type : 'value',
		            name : '个数'
		        }
		    ],
		    yAxis : [
		        {
		            type : 'category',
		            data : []
		        }
		    ],
		    series : [
		        {
		            name:'不安全事件',
		            type:'bar',
		            itemStyle : { normal: {label : {show: true, position: 'insideRight'}}},
		            data:[]
		        }
		    ]
		};	
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.LandingAirport.widgetjs = [  '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js',
										'../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js',
										'echarts/js/echarts.js'
									 ];
com.sms.dash.LandingAirport.widgetcss = [];