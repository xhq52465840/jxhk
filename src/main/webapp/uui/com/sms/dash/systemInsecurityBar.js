//@ sourceURL=com.sms.dash.systemInsecurityBar
$.u.define('com.sms.dash.systemInsecurityBar', null, {
	init: function (options) {
        this._options = options;
    },
    afterrender: function () {
	var conseName = window.unescape(unescape(this._options.conseName)),//重大风险名称
		consequence = this._options.consequence;//重大风险id
	 	unitId = window.unescape(unescape(this._options.unit)),//安监机构id
	 	sysTypeId = window.unescape(unescape(this._options.sysType)),//系统id
	 	unitName = window.unescape(unescape(this._options.unitName)),//安监机构名称
	 	sysTypeName = window.unescape(unescape(this._options.sysTypeName)),//系统名称
	 	date = this._options.date;
	 	require.config({
            paths: {
                echarts: './echarts/js'
            }
        });
    	$.u.ajax({//不安全状态柱状图
	   		 url:$.u.config.constant.smsqueryserver,
	   		 dataType:"json",
	   		 type:"post",
	   		 "data":{
	   			 tokenid:$.cookie("tokenid"),
	   			 "method":"drawLine",
	   			 "consequence":consequence,
	   			 "unit":unitId,
	   			 "sysType":sysTypeId
	   		 }
	   	},this.$).done(this.proxy(function(response){
	   		if(response.success){
	   		var legrnddata = [],xAxisdata = [],seriesdata = [],ids = [],lendstr = "{",selected = {};
	   		xAxisdata = response.timeline;
	   		$.each(response.data,this.proxy(function(idx,item){
	   			if(item.mark){
	   				lendstr += "\""+item.name+"\""+":false,";
	   			}
	   			legrnddata.push(item.name);
	   			ids.push(item.id);
	   			seriesdata.push({
					name : item.name,
					type : 'bar',
					stack : null,
					data : item.value,
					smooth : true,
					markLine : {
						data : [ {
							type : 'average',
							name : '平均值'
						} ]
					}
			}) ;
   		}));
	   		var lendstrsub = lendstr.substring(0,(lendstr.length-1)) + "}";
			selected = JSON.parse(lendstrsub);
	   		this._reloadLine(legrnddata, xAxisdata, seriesdata,ids,this._options,selected);
	   		}
	   	})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	   		
        }));
    	
    },
    _reloadLine:function(legrnddata,xAxisdata,seriesdata,ids,_option,selected){
    	var option = {
    		    tooltip : {
    		        trigger: 'axis'
    		    },
    		    legend: {
    		        data:legrnddata,
    		        selected:selected
    		    },
    		    toolbox: {
    		        show : true,
    		        x : 'right',
      		        y : 'center',
      		        orient : 'vertical',
    		        feature : {
    		            mark : {show: true},
    		            dataView : {show: true, readOnly: false},
    		            magicType : {show: true, type: ['line', 'bar']},
    		            restore : {show: true},
    		            saveAsImage : {show: true}
    		        }
    		    },
    		    calculable : false,
    		    xAxis : [
    		        {
    		            type : 'category',
    		            data : xAxisdata
    		        }
    		    ],
    		    yAxis : [
    		        {
    		            type : 'value'
    		        }
    		    ],
    		    series : seriesdata
    		};
    		require(['echarts','echarts/chart/bar','echarts/chart/line'],
    		    function(ec){
    			var myChart = ec.init(document.getElementById('insebar'));
    			myChart.setOption(option);
    			var ecConfig = require('echarts/config');
    			myChart.on(ecConfig.EVENT.DBLCLICK,eConsole);
    			function eConsole(param){
	    			if(param.name == "最大值" || param.name == "最小值" || param.name == "平均值"){
	    				return false;
	    			}else {
	    				var url = {
    						'unitId' : _option.unit,//安监机构id
    		    			'insecurityId' : ids[param.seriesIndex],//点击是获取id
    		    			'date':	param.name+"/01",
    		    			'insecurityName':window.escape(escape(param.seriesName)),
    		    			'systemId' : _option.sysType,//系统id
    		    			'conseName':_option.conseName,
    		    			'unitName':_option.unitName,
    		    			'sysTypeName':_option.sysTypeName
	    				};
	    				window.open("ViewSysThreadError.html?"+$.param(url));
	    			}
    			}
    		});                    
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.systemInsecurityBar.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
		                              "../../../uui/widget/spin/spin.js",
		                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
		                              "../../../uui/widget/ajax/layoutajax.js",
		                              'echarts/js/echarts.js',
		                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.systemInsecurityBar.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                         {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                         { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                         { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];