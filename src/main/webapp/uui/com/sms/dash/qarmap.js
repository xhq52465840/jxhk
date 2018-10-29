// @ sourceURL=com.sms.dash.qarmap
$.u.define('com.sms.dash.qarmap', null, {
	init : function(options) {
		this._options = options;
	},
	afterrender : function(bodystr) {
		
		//当前时间
    	var myDate = new Date();
    	//当前年份
    	var nowYear = myDate.getFullYear();
    	//当前月份
    	var nowMonth = myDate.getMonth(); 
		
    	//月份checkbox集合
    	var month = document.getElementById(nowMonth);   
    	month.checked = true;
    	
		this.result = this._getData(nowYear,month.value);
		var geoCoords = this.result.geoCoords;		
		var top5 = this.result.top5;	
		var normal = this.result.normal;
		
    	//当前年份集合
    	var year = document.getElementById(nowYear);
    	year.checked = true;
      	
    	// 查询按钮
    	this.btnQuery=this.qid("btn_query");
    	
    	$("#type_select").change(this.proxy(function(e) {
    		
            var type = document.getElementById('type_select').value;
    		
    		var yearList;
    		var year = [];
        	year[0] = document.getElementById('2013');
        	year[1] = document.getElementById('2014');
        	year[2] = document.getElementById('2015');
        	year[3] = document.getElementById('2016');
        	year[4] = document.getElementById('2017');
        	
        	//判断当前月份，对应打钩
        	for(var i=0;i<5;i++){
        		if(year[i].checked){
                    if(typeof(yearList)!="undefined"){
                    	yearList = yearList + "," + year[i].value;
                    }else{
                    	yearList = year[i].value ;
                    }
        		}
        	}
        	
        	if(typeof(yearList) == "undefined"){
        		alert("请选择年份！！！");
                return;
            }      
        	
        	
    		var monthList;
    		var month = [];
        	month[0] = document.getElementById('0');
        	month[1] = document.getElementById('1');
        	month[2] = document.getElementById('2');
        	month[3] = document.getElementById('3');
        	month[4] = document.getElementById('4');
        	month[5] = document.getElementById('5');
        	month[6] = document.getElementById('6');
        	month[7] = document.getElementById('7');
        	month[8] = document.getElementById('8');
        	month[9] = document.getElementById('9');
        	month[10] = document.getElementById('10');
        	month[11] = document.getElementById('11');
        	
        	//判断当前月份，对应打钩
        	for(var i=0;i<12;i++){
        		if(month[i].checked){
                    if(typeof(monthList)!="undefined"){
                    	monthList = monthList + "," + "'" + month[i].value +"'";
                    }else{
                    	monthList ="'"+ month[i].value+"'" ;
                    }
        		}
        	}
        	
        	if(typeof(monthList) == "undefined"){
        		alert("请选择月份！！！");
                return;
            }      
        	
        	var yearValue = document.getElementById('2014').value;
    		
    		$.ajax({
   			  url: $.u.config.constant.smsqueryserver,
                 dataType: "json",
                 type : "post",
     			 cache : false,
     			 async : false,
                 data: {
                	"tokenid" : $.cookie("tokenid"),
     				"method" : "getQarEvent",
     				"year":yearList	,
     				"month":monthList ,
     				"type":type
                 }
   		  }).done(this.proxy(function(data) {
				if (data.success) {
					var geoCoords = {};
					var scores = [];	
					// 遍历地理位置
					$.each(data.data.qarEventDOList.aaData, this
							.proxy(function(idx, item) {
								var geoCoord = [];
								geoCoord.push(item.longitude);
								geoCoord.push(item.latitude);
								geoCoords[item.airport] = geoCoord;
							}));

					// 遍历评审单
					$.each(data.data.qarEventDOList.aaData, this
							.proxy(function(idx, item) {
								var data = {};
								data.name = item.airport;
								data.value = item.theCount;
								scores.push(data);
							}));						
					// 数组按降序排序
					var sortedscore = scores.sort(function(data0, data1) {
						return -(data0.value - data1.value);
					});
					resultdata2.geoCoords = geoCoords;
					resultdata2.top5 = sortedscore.slice(0, 5);
					resultdata2.normal = sortedscore.slice(0,
							sortedscore.length);					
				} else {
					$.u.alert.error(data.reason);
				}
			})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
	        }));
    		
    		

    		require(
    			    [
    			        'echarts',
    			        'BMap',
    			        'echarts/chart/map'
    			    ],
    		//地图报表的function
    	    function (echarts, BMapExtension) {
    	    	    		
    	    	//获取div的当前宽度
    	    	var height = $('body').width();
    	    	
    	    	//mainMap对应的是html页面div对应的id
    	        $('#mainMap').css({
    	            height:$('body').height(),
    	            width: $('body').width()
    	        });
    	        
    	        // 初始化地图
    	        var BMapExt = new BMapExtension($('#mainMapQ')[0], BMap, echarts);
    	        var map = BMapExt.getMap();
    	        //对应的容器
    	        var container = BMapExt.getEchartsContainer();
                //地图的中心坐标
    	        var startPoint = {
    	            x: 104.114129,
    	            y: 37.550339
    	        };
    	        
    	        //默认展示地图的大小
    	        var zoom;
    	        
    	        //如果当前浏览器的宽度大于800则显示级别为5否则显示级别为4
    	        if(height > 800){
    	        	zoom = 5
    	        }else{
    	        	zoom = 4
    	        }
    	        
    	        var point = new BMap.Point(startPoint.x, startPoint.y);
    	        //设置地图的中心和地图的初始大小
    	        map.centerAndZoom(point, zoom);
    	        map.enableScrollWheelZoom(true);
    	       
    	        option = {
    	            color: ['gold','aqua','lime'],
    	            title : {
    	                text: '',
    	                x:'center',
    	                textStyle : {
    	                    color: 'black'
    	                }
    	            },
    	            tooltip : {
    	            	show : true,
    					backgroundColor : 'black',
    					textStyle : {
    						color : 'white'
    					},
    					trigger : 'axis'
    	            },
    	            legend: {
    	            	orient: 'vertical',
    	                x:'left',
    	                data:[],
    	                selectedMode: 'single',
    	                selected:{
    	                    'top5' : false
    	                },
    	                textStyle : {
    	                    color: '#fff'
    	                }
    	            },
    	            toolbox: {
    	                show : true,
    	                orient : 'vertical',
    	                x: 'right',
    	                y: 'center',
    	                feature : {
    	                    mark : {show: true},
    	                    dataView : {show: true, readOnly: false},
    	                    restore : {show: true},
    	                    saveAsImage : {show: true}
    	                }
    	            },
    	            dataRange: {
    	            	min : resultdata2.normal[resultdata2.normal.length-1].value,
    					max : resultdata2.top5[0].value,
    	                x: 'right',
    	                calculable : true,
    	                color: ['#ff3333', 'orange', 'yellow','lime'],
    	                textStyle:{
    	                    color:'#fff'
    	                }
    	            },
    	            series : [
    	                {
    	                    name:'',
    	                    type:'map',
    	                    mapType: 'none',
    	                    data:[],
    	                    markPoint : {
    	                symbolSize: 5,       // 标注大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
    	                itemStyle: {
    	                    normal: {
    	                        borderColor: '#87cefa',
    	                        borderWidth: 1,            // 标注边线线宽，单位px，默认为1
    	                        label: {
    	                            show: false
    	                        }
    	                    },
    	                    emphasis: {
    	                        borderColor: '#1e90ff',
    	                        borderWidth: 5,
    	                        label: {
    	                            show: false
    	                        }
    	                    }
    	                },
    	                data : resultdata2.normal
    	            },
    	            geoCoord: resultdata2.geoCoords
    	        },{
    	            name: '',
    	            type: 'map',
    	            mapType: 'none',
    	            data:[],
    	            markPoint : {
    	                symbol:'emptyCircle',
    	                symbolSize : function (v){
    	                    return 10 + v/100
    	                },
    	                effect : {
    	                    show: true,
    	                    shadowBlur : 0
    	                },
    	                itemStyle:{
    	                    normal:{
    	                        label:{show:false}
    	                    }
    	                },
    	                data : resultdata2.top5
    	            }
    	        }
    	            ]
    	        };

    	        var myChart = BMapExt.initECharts(container);
    	        BMapExt.setOption(option);   
    	
    		});
        }));
    	
    	$("#checkAll").click(function() {
            $('input[name="checkbox"]').prop("checked",this.checked); 
            $('input[name="checkboxallnot"]').prop("checked",false); 
        });
    	$("input[name='checkbox']").click(function() {
    	    var $subs = $("input[name='checkbox']");
    	    $("#checkAll").prop("checked" , $subs.length == $subs.filter(":checked").length ? true :false);
    	});
    	$("#checkAllNOT").click(function() {
            $('input[name="checkbox"]').prop("checked",false); 
            $('input[name="checkboxall"]').prop("checked",false); 
        });
    	  	
    	resultdata2 = {};
    	
    	this.btnQuery.button().click(this.proxy(function(e){ 
    		
    		var type = document.getElementById('type_select').value;
    		
    		var yearList;
    		var year = [];
        	year[0] = document.getElementById('2013');
        	year[1] = document.getElementById('2014');
        	year[2] = document.getElementById('2015');
        	year[3] = document.getElementById('2016');
        	year[4] = document.getElementById('2017');
        	
        	//判断当前月份，对应打钩
        	for(var i=0;i<5;i++){
        		if(year[i].checked){
                    if(typeof(yearList)!="undefined"){
                    	yearList = yearList + "," + year[i].value;
                    }else{
                    	yearList = year[i].value ;
                    }
        		}
        	}
        	
        	if(typeof(yearList) == "undefined"){
        		alert("请选择年份！！！");
                return;
            }      
        	
        	
    		var monthList;
    		var month = [];
        	month[0] = document.getElementById('0');
        	month[1] = document.getElementById('1');
        	month[2] = document.getElementById('2');
        	month[3] = document.getElementById('3');
        	month[4] = document.getElementById('4');
        	month[5] = document.getElementById('5');
        	month[6] = document.getElementById('6');
        	month[7] = document.getElementById('7');
        	month[8] = document.getElementById('8');
        	month[9] = document.getElementById('9');
        	month[10] = document.getElementById('10');
        	month[11] = document.getElementById('11');
        	
        	//判断当前月份，对应打钩
        	for(var i=0;i<12;i++){
        		if(month[i].checked){
                    if(typeof(monthList)!="undefined"){
                    	monthList = monthList + "," + "'" + month[i].value +"'";
                    }else{
                    	monthList ="'"+ month[i].value+"'" ;
                    }
        		}
        	}
        	
        	if(typeof(monthList) == "undefined"){
        		alert("请选择月份！！！");
                return;
            }      
        	
        	var yearValue = document.getElementById('2014').value;
    		
    		$.ajax({
   			  url: $.u.config.constant.smsqueryserver,
                 dataType: "json",
                 type : "post",
     			 cache : false,
     			 async : false,
                 data: {
                	"tokenid" : $.cookie("tokenid"),
     				"method" : "getQarEvent",
     				"year":yearList	,
     				"month":monthList ,
     				"type":type
                 }
   		  }).done(this.proxy(function(data) {
				if (data.success) {
					var geoCoords = {};
					var scores = [];	
					// 遍历地理位置
					$.each(data.data.qarEventDOList.aaData, this
							.proxy(function(idx, item) {
								var geoCoord = [];
								geoCoord.push(item.longitude);
								geoCoord.push(item.latitude);
								geoCoords[item.airport] = geoCoord;
							}));

					// 遍历评审单
					$.each(data.data.qarEventDOList.aaData, this
							.proxy(function(idx, item) {
								var data = {};
								data.name = item.airport;
								data.value = item.theCount;
								scores.push(data);
							}));						
					// 数组按降序排序
					var sortedscore = scores.sort(function(data0, data1) {
						return -(data0.value - data1.value);
					});
					resultdata2.geoCoords = geoCoords;
					resultdata2.top5 = sortedscore.slice(0, 5);
					resultdata2.normal = sortedscore.slice(0,
							sortedscore.length);					
				} else {
					$.u.alert.error(data.reason);
				}
			})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
	        }));
    		
    		

    		require(
    			    [
    			        'echarts',
    			        'BMap',
    			        'echarts/chart/map'
    			    ],
    	    function (echarts, BMapExtension) {
    	    	    		
    	    	//获取div的当前宽度
    	    	var height = $('body').width();
    	    	
    	    	//mainMap对应的是html页面div对应的id
    	        $('#mainMap').css({
    	            height:$('body').height(),
    	            width: $('body').width()
    	        });
    	        
    	        // 初始化地图
    	        var BMapExt = new BMapExtension($('#mainMapQ')[0], BMap, echarts);
    	        var map = BMapExt.getMap();
    	        //对应的容器
    	        var container = BMapExt.getEchartsContainer();
                //地图的中心坐标
    	        var startPoint = {
    	            x: 104.114129,
    	            y: 37.550339
    	        };
    	        
    	        //默认展示地图的大小
    	        var zoom;
    	        
    	        //如果当前浏览器的宽度大于800则显示级别为5否则显示级别为4
    	        if(height > 800){
    	        	zoom = 5
    	        }else{
    	        	zoom = 4
    	        }
    	        
    	        var point = new BMap.Point(startPoint.x, startPoint.y);
    	        //设置地图的中心和地图的初始大小
    	        map.centerAndZoom(point, zoom);
    	        map.enableScrollWheelZoom(true);
    	       
    	        option = {
    	            color: ['gold','aqua','lime'],
    	            title : {
    	                text: '',
    	                x:'center',
    	                textStyle : {
    	                    color: 'black'
    	                }
    	            },
    	            tooltip : {
    	            	show : true,
    					backgroundColor : 'black',
    					textStyle : {
    						color : 'white'
    					},
    					trigger : 'axis'
    	            },
    	            legend: {
    	            	orient: 'vertical',
    	                x:'left',
    	                data:[],
    	                selectedMode: 'single',
    	                selected:{
    	                    'top5' : false
    	                },
    	                textStyle : {
    	                    color: '#fff'
    	                }
    	            },
    	            toolbox: {
    	                show : true,
    	                orient : 'vertical',
    	                x: 'right',
    	                y: 'center',
    	                feature : {
    	                    mark : {show: true},
    	                    dataView : {show: true, readOnly: false},
    	                    restore : {show: true},
    	                    saveAsImage : {show: true}
    	                }
    	            },
    	            dataRange: {
    	            	min : resultdata2.normal[resultdata2.normal.length-1].value,
    					max : resultdata2.top5[0].value,
    	                x: 'right',
    	                calculable : true,
    	                color: ['#ff3333', 'orange', 'yellow','lime'],
    	                textStyle:{
    	                    color:'#fff'
    	                }
    	            },
    	            series : [
    	                {
    	                    name:'',
    	                    type:'map',
    	                    mapType: 'none',
    	                    data:[],
    	                    markPoint : {
    	                symbolSize: 5,       // 标注大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
    	                itemStyle: {
    	                    normal: {
    	                        borderColor: '#87cefa',
    	                        borderWidth: 1,            // 标注边线线宽，单位px，默认为1
    	                        label: {
    	                            show: false
    	                        }
    	                    },
    	                    emphasis: {
    	                        borderColor: '#1e90ff',
    	                        borderWidth: 5,
    	                        label: {
    	                            show: false
    	                        }
    	                    }
    	                },
    	                data : resultdata2.normal
    	            },
    	            geoCoord: resultdata2.geoCoords
    	        },{
    	            name: '',
    	            type: 'map',
    	            mapType: 'none',
    	            data:[],
    	            markPoint : {
    	                symbol:'emptyCircle',
    	                symbolSize : function (v){
    	                    return 10 + v/100
    	                },
    	                effect : {
    	                    show: true,
    	                    shadowBlur : 0
    	                },
    	                itemStyle:{
    	                    normal:{
    	                        label:{show:false}
    	                    }
    	                },
    	                data : resultdata2.top5
    	            }
    	        }
    	            ]
    	        };

    	        var myChart = BMapExt.initECharts(container);
    	        BMapExt.setOption(option);   
    	
    		});
         }));
    	   					
			
		require.config({
	        paths: {
	            echarts: 'echarts/js',
	            'echarts/chart/map' : 'echarts/js/chart/map',
	        },
	        packages: [
	            {
	                name: 'BMap',
	                location: './echarts/js/extention',
	                main: 'map_extention'
	            }
	        ]
	    });

	    require(
	    [
	        'echarts',
	        'BMap',
	        'echarts/chart/map'
	    ],
				
	    //地图报表的function
	    function (echarts, BMapExtension) {
	    	    		
	    	//获取div的当前宽度
	    	var height = $('body').width();
	    	
	    	//mainMap对应的是html页面div对应的id
	        $('#mainMap').css({
	            height:$('body').height(),
	            width: $('body').width()
	        });
	        
	        // 初始化地图
	        var BMapExt = new BMapExtension($('#mainMapQ')[0], BMap, echarts);
	        var map = BMapExt.getMap();
	        //对应的容器
	        var container = BMapExt.getEchartsContainer();
	        
            //地图的中心坐标
	        var startPoint = {
	            x: 104.114129,
	            y: 37.550339
	        };
	        
	        //默认展示地图的大小
	        var zoom;
	        
	        //如果当前浏览器的宽度大于800则显示级别为5否则显示级别为4
	        if(height > 800){
	        	zoom = 5
	        }else{
	        	zoom = 4
	        }
	        
	        var point = new BMap.Point(startPoint.x, startPoint.y);
	        //设置地图的中心和地图的初始大小
	        map.centerAndZoom(point, zoom);
	        map.enableScrollWheelZoom(true);
	       
	        option = {
	            color: ['gold','aqua','lime'],
	            title : {
	                text: '',
	                x:'center',
	                textStyle : {
	                    color: 'black'
	                }
	            },
	            tooltip : {
	            	show : true,
					backgroundColor : 'black',
					textStyle : {
						color : 'white'
					},
					trigger : 'axis'
	            },
	            legend: {
	            	orient: 'vertical',
	                x:'left',
	                data:[],	             
	                textStyle : {
	                    color: '#fff'
	                }
	            },
	            toolbox: {
	                show : true,
	                orient : 'vertical',
	                x: 'right',
	                y: 'center',
	                feature : {
	                    mark : {show: true},
	                    dataView : {show: true, readOnly: false},
	                    restore : {show: true},
	                    saveAsImage : {show: true}
	                }
	            },
	            dataRange: {
	            	min : normal[normal.length-1].value,
					max : top5[0].value,
	                x: 'right',
	                calculable : true,
	                color: ['#ff3333', 'orange', 'yellow','lime'],
	                textStyle:{
	                    color:'#fff'
	                }
	            },
	            series : [
	                {
	                    name:'',
	                    type:'map',
	                    mapType: 'none',
	                    data:[],
	                    markPoint : {
	                symbolSize: 5,       // 标注大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
	                itemStyle: {
	                    normal: {
	                        borderColor: '#87cefa',
	                        borderWidth: 1,            // 标注边线线宽，单位px，默认为1
	                        label: {
	                            show: false
	                        }
	                    },
	                    emphasis: {
	                        borderColor: '#1e90ff',
	                        borderWidth: 5,
	                        label: {
	                            show: false
	                        }
	                    }
	                },
	                data : normal
	            },
	            geoCoord: geoCoords
	        },{
	            name: '',
	            type: 'map',
	            mapType: 'none',
	            data:[],
	            markPoint : {
	                symbol:'emptyCircle',
	                symbolSize : function (v){
	                    return 10 + v/100
	                },
	                effect : {
	                    show: true,
	                    shadowBlur : 0
	                },
	                itemStyle:{
	                    normal:{
	                        label:{show:false}
	                    }
	                },
	                data : top5
	            }
	        }
	            ]
	        };

	        var myChart = BMapExt.initECharts(container);
	        BMapExt.setOption(option);
		});
	    
	},
	_getData : function(nowYear,nowMonth) {
		resultdata = {};
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			cache : false,
			async : false,
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method" : "getQarEvent",
				"year":nowYear	,
				"month":nowMonth ,
 				"type":"high_rate"
			}
		}).done(
				this.proxy(function(data) {
					if (data.success) {
						var geoCoords = {};
						var scores = [];	
						// 遍历地理位置
						$.each(data.data.qarEventDOList.aaData, this
								.proxy(function(idx, item) {
									var geoCoord = [];
									geoCoord.push(item.longitude);
									geoCoord.push(item.latitude);
									geoCoords[item.airport] = geoCoord;
								}));

						// 遍历评审单
						$.each(data.data.qarEventDOList.aaData, this
								.proxy(function(idx, item) {
									var data = {};
									data.name = item.airport;
									data.value = item.theCount;
									scores.push(data);
								}));						
						// 数组按降序排序
						var sortedscore = scores.sort(function(data0, data1) {
							return -(data0.value - data1.value);
						});
						resultdata.geoCoords = geoCoords;
						resultdata.top5 = sortedscore.slice(0, 5);
						resultdata.normal = sortedscore.slice(0,
								sortedscore.length);
						
						
					} else {
						$.u.alert.error(data.reason);
					}
				})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
		return resultdata;
	},
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.qarmap.widgetjs = [ "../../../uui/widget/spin/spin.js",
                        		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                        		"../../../uui/widget/ajax/layoutajax.js", 'echarts/js/esl.js',
                        		'echarts/js/echarts.js' ];
com.sms.dash.qarmap.widgetcss = [ {
                        	path : '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
                        } ];