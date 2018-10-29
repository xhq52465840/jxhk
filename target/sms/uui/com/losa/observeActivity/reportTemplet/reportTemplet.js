
$.u.define('com.losa.observeActivity.reportTemplet.reportTemplet', null, {
	init : function(options) {
		this._options = options || null;
		this._reportName = this._options.reportName;
		this._reportTyppe = this._options.reportTyppe;
		this._tabName = this._options.tabName;
		this._manageQueryForm = this._options.manageQueryForm;
	},
	
	afterrender : function() {
		this._queryScoreTemplet();
	},
	
	_queryScoreTemplet : function() {	   
	var data = {
		"method" : this._reportName,
		"manageQueryForm" : JSON.stringify(this._manageQueryForm),
	};
	myAjaxQuery(data, null, this.proxy(function(response) {
		if (response.success) {
			var data1 = JSON.parse(response.data1);
			var data2 = JSON.parse(response.data2);
			var data3 = JSON.parse(response.data3);
			var dataPie = new Array();
			for(var i=0 ;i<data1.length; i++){
				if(data2[i]>0){
					var obj = new Object();
					obj.name = data1[i];
					obj.value = data2[i];
					dataPie[i] = obj;
				}else{
					data1.splice(i,1);
					data2.splice(i,1);
					if(data3.length>0){
						data3.splice(i,1);
					}	
					i--;
				}
			}
			if(this._reportName=='queryErrorPercent'){
				var data4 = JSON.parse(response.data4);
				var data5 = JSON.parse(response.data5);
				var data6 = JSON.parse(response.data6);
			}
			var option1 = {
			    title : {
			        text: this._tabName,
			        subtext: '统计数据',
			        x:'center'
			    },
			    tooltip : {
			        trigger: 'item',
			        formatter: "{a} <br/>{b} : {c} ({d}%)"
			    },
			    legend: {
			        orient : 'vertical',
			        x : 'left',
			        data:data1
			    },
			    toolbox: {
			        show : true,
			        feature : {
			            mark : {show: true},
			            dataView : {show: true, readOnly: false},
			            saveAsImage : {show: true}
			        }
			    },
			    calculable : false,
			    series : [
			          { 
			            type:'pie',
			            radius : '65%',
			            center: ['50%', '55%'],
									itemStyle : {
										normal : {
											label : {
												show : true,
												position : 'top',
												textStyle : {
													fontSize : '10',
													fontFamily : '宋体',
												},
												formatter : "{b} : {c} ({d}%)",
											}
										}
			            },
			            data:dataPie
			        }
			    ],    
			};
			
			var option2 = {
			    title : {
			        text: this._tabName,
			        subtext: '统计数据'
			    },
			    tooltip : {
			        trigger: 'axis'
			    },
			    legend: {
			        data:['出现次数', '机组未发现次数']
			    },
			    toolbox: {
			        show : true,
			        feature : {
			            mark : {show: true},
			            dataView : {show: true, readOnly: false},
			            saveAsImage : {show: true}
			        }
			    },
			    calculable : false,
			    grid: {
		        y2: '25%',
		        y: '10%',
		        x: '10%',
		      },
			    yAxis : [
			        {
			            type : 'value',
			            boundaryGap : [0, 1],
//			            splitNumber:10,
			        }
			    ],
			    xAxis : [
			        {
			            type : 'category',
			            splitLine: {show:true},
			            axisLabel : {
					        	 interval : 0,
					        	 formatter:function(val){
					        		 var arr = val.split("");
					        		 var str = '';
					        		 var strArr = new Array();
					        		 for(var i=0; i<arr.length; i++){
					        			 str += arr[i];
					        			 if((i+1)%4==0){
					        				 strArr.push(str);
					        				 str = '';
					        			 }				        
					        		 }
					        		 if(arr.length%4 != 0){
					        			 strArr.push(str);
					        		 }
					        	    return strArr.join("\n");
					        	},
					        },
			            data : data1
			        }
			    ],
			    series : [
			        {
			            name:'出现次数',
			            type:'bar',
			            barMaxWidth:60,
			            itemStyle : { normal: {label : {show: true, position: 'top',textStyle : {
			              fontSize : '10',
			              fontFamily : '宋体',
			              color: 'black'
			            },
			            }}},
			            data:data2
			        },
			        {
			            name:'机组未发现次数',
			            type:'bar',
			            barMaxWidth:60,
			            itemStyle : { normal: {label : {show: true, position: 'top',textStyle : {
			              fontSize : '10',
			              fontFamily : '宋体',
			              color: 'black'
			            },
			            }}},
			            data:data3
			        }
			    ]
			};
			
			var option3 = {
			    title : {
			        text: this._tabName,
			        subtext: '统计数据'
			    },
			    tooltip : {
			        trigger: 'axis'
			    },
			    legend: {
			        data:['出现次数']
			    },
			    toolbox: {
			        show : true,
			        feature : {
			            mark : {show: true},
			            dataView : {show: true, readOnly: false},
			            saveAsImage : {show: true}
			        }
			    },
			    calculable : false,
			    grid: {
		        y2: '25%',
		        y: '10%',
		        x: '10%',
		      },
			    yAxis : [
			        {
			            type : 'value',
			            boundaryGap : [0, 1],
//			            splitNumber:10,
			        }
			    ],
			    xAxis : [
			        {
			            type : 'category',
			            splitLine: {show:true},
			            axisLabel : {
					        	 interval : 0,
					        	 formatter:function(val){
					        		 var arr = val.split("");
					        		 var str = '';
					        		 var strArr = new Array();
					        		 for(var i=0; i<arr.length; i++){
					        			 str += arr[i];
					        			 if((i+1)%4==0){
					        				 strArr.push(str);
					        				 str = '';
					        			 }					        			 
					        		 }
					        		 if(arr.length%4 != 0){
					        			 strArr.push(str);
					        		 }
					        	    return strArr.join("\n");
					        	},
					        },
			            data : data1
			        }
			    ],
			    series : [
			        {
			            name:'出现次数',
			            type:'bar',
			            barMaxWidth:60,
			            itemStyle : { normal: {label : {show: true, position: 'top',textStyle : {
			              fontSize : '10',
			              fontFamily : '宋体',
			              color: 'black'
			            },
			            }}},
			            data:data2
			        },
			    ]
			};
			
			var option4 = {
			    title : {
			        text: this._tabName,
			        subtext: '统计数据'
			    },
			    tooltip : {
			        trigger: 'axis'
			    },
			    legend: {
			        data:['出现次数', '机组未发现次数']
			    },
			    toolbox: {
			        show : true,
			        feature : {
			            mark : {show: true},
			            dataView : {show: true, readOnly: false},
			            saveAsImage : {show: true}
			        }
			    },
			    calculable : false,
			    grid: {
		        y2: '25%',
		        y: '10%',
		        x: '10%',
		      },
			    yAxis : [
			        {
			            type : 'value',
			            boundaryGap : [0, 1],
//			            splitNumber:10,
			        }
			    ],
			    xAxis : [
			        {
			            type : 'category',
			            splitLine: {show:true},
			            axisLabel : {
					        	 interval : 0,
					        	 formatter:function(val){
					        		 var arr = val.split("");
					        		 var str = '';
					        		 var strArr = new Array();
					        		 for(var i=0; i<arr.length; i++){
					        			 str += arr[i];
					        			 if((i+1)%4==0){
					        				 strArr.push(str);
					        				 str = '';
					        			 }				        			 
					        		 }
					        		 if(arr.length%4 != 0){
					        			 strArr.push(str);
					        		 }
					        	    return strArr.join("\n");
					        	},
					        },
			            data : data4
			        }
			    ],
			    series : [
			        {
			            name:'出现次数',
			            type:'bar',
			            barMaxWidth:60,
			            itemStyle : { normal: {label : {show: true, position: 'top',textStyle : {
			              fontSize : '10',
			              fontFamily : '宋体',
			              color: 'black'
			            },
			            }}},
			            data:data5
			        },
			        {
			            name:'机组未发现次数',
			            type:'bar',
			            barMaxWidth:60,
			            itemStyle : { normal: {label : {show: true, position: 'top',textStyle : {
			              fontSize : '10',
			              fontFamily : '宋体',
			              color: 'black'
			            },
			            }}},
			            data:data6
			        }
			    ]
			};
			
			var reportName = this._reportName;
			var reportTyppe = this._reportTyppe;
			require.config({paths : {echarts : "../sms/dash/echarts/js"}});
			require(['echarts','echarts/chart/bar','echarts/chart/pie','echarts/chart/line','echarts/chart/funnel'],   
	        function (ec) {
				      if(reportName=='queryThreatPercent'){
				      	var myChart1 = ec.init(document.getElementById('general1'));
		            myChart1.setOption(option1);
		            var myChart2 = ec.init(document.getElementById('general2'));
		            myChart2.setOption(option3);			      	
				      }else if(reportName=='queryErrorPercent'){
				      	var myChart1 = ec.init(document.getElementById('general1'));
		            myChart1.setOption(option1);
		            var myChart2 = ec.init(document.getElementById('general2'));
		            myChart2.setOption(option4);
				      }else if(reportTyppe==1){
				      	var myChart1 = ec.init(document.getElementById('general1'));
		            myChart1.setOption(option1);
		            document.getElementById('general2').style.display="none";
				      }else if(reportTyppe==2){
				      	var myChart2 = ec.init(document.getElementById('general2'));
		            myChart2.setOption(option2);
		            document.getElementById('general1').style.display="none";
				      }else if(reportTyppe==3){
				      	var myChart1 = ec.init(document.getElementById('general1'));
		            myChart1.setOption(option1);
		            var myChart2 = ec.init(document.getElementById('general2'));
		            myChart2.setOption(option2);
				      }	            
	        }
	    );
		}
	}));
	},
	
},{
	usehtm : true,
	usei18n : false
});

com.losa.observeActivity.reportTemplet.reportTemplet.widgetjs = ['../../../../uui/widget/select2/js/select2.min.js',
                                       '../../../../uui/vue.js',
                                       "../../../eiosa/base.js",];
com.losa.observeActivity.reportTemplet.reportTemplet.widgetcss = [{ path: '../../../../css/losa.css' },
                                        { path:"../../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../../uui/widget/select2/css/select2-bootstrap.css"}];