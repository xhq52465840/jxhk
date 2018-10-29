var reportIdArray = null;
var count = 0;
$.u.load('com.eiosa.reportExportDialog');
$.u.load("com.eiosa.reportList");
$.u.load("com.eiosa.reportDetail");

$.u.define('com.eiosa.general', null, {
	init : function(options) {
		this._options = options || null;
		this.reportExportDialogUm = null;
		this.reportListUm = null;
		this.reportDetailUm = null;
	},
	afterrender : function() {
		this.querygeneral = new Vue({
			el : '#queryGenralform',
			data : {
			},
			methods : {
				searchRepotBefore : this.proxy(this._searchRepotBefore),
				searchExport : this.proxy(this._searchExport),
				searchLib : this.proxy(this._searchLib),
				searchReport : this.proxy(this._searchReport),
				searchRepotAfter : this.proxy(this._searchRepotAfter),
				reportInfo : this.proxy(this._reportInfo),
			}
		});
//		var rule=[];   	
//    rule.push(
//               [{"key":"repDate","value":this.reportDate.val()}]
//           );  
		this._queryReport();
	},

	_queryReport : function() {  
		var data = {
			   "method" : "queryReportId",
//			   "reportDate" : '',
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				 // 得到第一个report的id，作为默认工作的report
				var reportId = eiosaMainUm.reportId;
				if (reportId == null || isNaN(reportId)) {
					reportIdArray = param.data;
					eiosaMainUm.reportId = param.data[count];
					$.cookie('workReportId', eiosaMainUm.reportId);
				}
				this._querySection();
			}
		}));
	},
	
	_querySection : function() {		
		var data = {
			"method" : "querySection",
			"reportId" : eiosaMainUm.reportId,
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var list = param.data.SectionList.aaData;
				var sectionArray = ['ORG','FLT','DSP','MNT','CAB','GRH','CGO','SEC'];
				var dateArray = new Array();
				var dateArray1 = new Array();
				var dateArray2 = new Array();
				var startyear;
				var endyear;
				for ( var i in list) {
					var start = new Date(list[i].startDate);	
					if(startyear==null || start.getFullYear()<startyear.getFullYear()){
						startyear = start;
					}
				}
				startyear = new Date(startyear.getFullYear()-1,8,1);
				endyear = new Date(startyear.getFullYear()+2,8,30);
			   
				for ( var j in sectionArray) {
					for ( var i in list) {
						if(sectionArray[j]==list[i].sectionName){
							var start = new Date(list[i].startDate);	
							dateArray[j] = start;
							var end = new Date(list[i].endDate);	;
							var isarpPercent = list[i].isarpPercent;
							var now = (end - start) * Number(isarpPercent.substring(0,isarpPercent.length-1)) / 100;
							var myitem = {
						      value : now,
						      tooltip:{},             //自定义特殊tooltip，仅对该item有效，详见tooltip
						      itemStyle:{
										normal : {											
											label : {
												show : true,
												position : 'insideRight',
												textStyle : {
						              fontSize : '15',
						              fontFamily : '宋体',
						              fontWeight : 'bold',
						              color: 'skyblue'
						            },
												formatter : isarpPercent,
											}
										},
		                emphasis: {
		                	label : {
												show : true,
												position : 'insideRight',
												textStyle : {
						              fontSize : '15',
						              fontFamily : '宋体',
						              fontWeight : 'bold',
						              color: 'yellow'
						            },
											}
	                }
									}            //自定义特殊itemStyle，仅对该item有效，详见itemStyle
						  };
							dateArray1[j] = myitem;
							dateArray2[j] = end-now-start;
//							console.log(i, ":", list[i]);
							break;
						}						
					}
				}
        

				$.u.ajax({
					url : $.u.config.constant.smsqueryserver,
					type : "post",
					dataType : "json",
					cache : false,
					data : {
						"tokenid" : $.cookie("tokenid"),
						"method" : "queryReportDtatil",
						"id" : eiosaMainUm.reportId
					}
				}).done(this.proxy(function(response) {
					if (response.success) {
						var title = response.data.report.title;
						$('#generaltit').html(title);
					}
				}));

				var option = {				 
				    tooltip : {
				        trigger: 'axis',
				        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
				            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
				        },
				        formatter: function (params) {
				            var tar = params[0];
				            return tar.name;
				        }
				    },
				   
				    grid: {
				        y: '10%',
				        x: '15%',
				    },
				    yAxis: [{
				        type : 'category',
				        splitLine: {show:false},
				        position:'left',
				        data : sectionArray,
				        axisTick:{length:0},
				    }],
				    xAxis: [{
				        type : 'time',
				        splitLine: {show:false},
				        position:'top',
				        min:startyear,
				        max:endyear,
				        splitNumber:12,
				        axisLabel:{
				        	formatter:function(value){
	                  var mon=value.toString().substr(4, 3)
	                  return mon+' '+value.getFullYear();				        		
				        	},
				        }				         
				    }],
				    series: [        
				        {
				            name: '开始',
				            type: 'bar',
				            stack:  '天数',
				            barWidth:30,
				            itemStyle: {
				                normal: {
				                    barBorderColor: 'rgba(0,0,0,0)',
				                    color: 'rgba(0,0,0,0)'
				                },
				                emphasis: {
				                    barBorderColor: 'rgba(0,0,0,0)',
				                    color: 'rgba(0,0,0,0)'
				                }
				            },
				            data: dateArray
				        },
		 		        {
									name : '进行',
									type : 'bar',
									stack : '天数',
									barWidth:30,
									itemStyle : {
										normal : {
											color:'#4A708B',
											barBorderColor:'blue',
		                  barBorderWidth: 0,
										}
									},
									data : dateArray1
								},
				        {
			            name: '剩余',
			            type: 'bar',
			            stack: '天数',
			            barWidth:30,
			            itemStyle : {
										normal : {
											color:'#BABABA',
											barBorderColor:'skyblue',
		                  barBorderWidth: 0,
										}
									},
			            data: dateArray2
			        },
				    ]
				};
				require.config({paths : {echarts : "../sms/dash/echarts/js"}});
				require(['echarts','echarts/chart/bar' ],   
		        function (ec) {
		            var myChart = ec.init(document.getElementById('general'));
		            myChart.setOption(option);
		            myChart.on(require('echarts/config').EVENT.CLICK, function(){
		            	$('#tab_follow').click().tab('show');
		            	$('#tab_sectionStatus').click().tab('show');
		            });
		        }
		    );
			
			}
		}));
	},
	
	_searchRepotBefore : function(e) {  
	    if(count>=reportIdArray.length-1&&reportIdArray.length>1){
	    	count = count-1;
	    }else{
	    	count =reportIdArray.length-1;
	    }
			eiosaMainUm.reportId = reportIdArray[count];
			$.cookie('workReportId', eiosaMainUm.reportId);
			this._querySection();
	},
	

		_searchExport : function(e) {			
			if (this.reportExportDialogUm != null)
				delete this.reportExportDialogUm;
			this.reportExportDialogUm = new com.eiosa.reportExportDialog($("div[umid='reportExportDialog2']", this.$), {
				reportId : eiosaMainUm.reportId
			});
	
			var layerindex = layer.open({
				type : 1,
				title : 'EIOSA报告导出',
				maxmin : false,
				fix : false,
				zIndex : 20, // 不能太高，免得附件窗口被遮挡
				shadeClose : false, // 点击遮罩关闭层
				area : [ '800px', '520px' ],
				content : $("div[umid='reportExportDialog2']", this.$),
			});
			this.reportExportDialogUm.myLayerIndex = layerindex;
	},
	
	_reportInfo:function(e){		
		if(this.reportDetailUm != null) delete this.reportDetailUm;
		this.reportDetailUm = new com.eiosa.reportDetail($("div[umid='reportDetail2']",eiosaMainUm.$),{id: eiosaMainUm.reportId});
		var layerindex = layer.open({
	        type: 1,
	        title: 'EIOSA报告详细信息',
	        maxmin: false,
	        fix: false,
	        zIndex : 20, //不能太高，免得附件窗口被遮挡
	        shadeClose: false, //点击遮罩关闭层
	        area : ['800px' , '520px'],
	        content: $("div[umid='reportDetail2']",eiosaMainUm.$),
	        end:  this.proxy(function() {
	        }),
	    });
		this.reportDetailUm.myLayerIndex = layerindex;
		 layer.close(this.myLayerIndex);
	},
	
	_searchLib : function(e) {
		window.location.href ="http://"+window.location.host+"/sms/uui/com/sms/safelib/ViewLibrary.html";
	},
	
	_searchReport : function(e) {
		if(this.reportListUm != null) delete this.reportListUm;
   	this.reportListUm = new com.eiosa.reportList($("div[umid='reportList2']",this.$),{}); 
   	
   	var layerindex = layer.open({
			type : 1,
			title : 'E-IOSA查询',
			maxmin : false,
			fix : false,
			zIndex : 20, // 不能太高，免得附件窗口被遮挡
			shadeClose : false, // 点击遮罩关闭层
			area : [ '1300px', '520px' ],
			content : $("div[umid='reportList2']", this.$),
		});
		this.reportListUm.myLayerIndex = layerindex;
	},
	
	_searchRepotAfter : function(e) {
		if(count<reportIdArray.length-1){
    	count = count+1;
    }else{
    	count =0;
    }
		eiosaMainUm.reportId = reportIdArray[count];
		$.cookie('workReportId', eiosaMainUm.reportId);
		this._querySection();
	},
	
	
}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.general.widgetjs = [];
com.eiosa.general.widgetcss = [];


