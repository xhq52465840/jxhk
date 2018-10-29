//@ sourceURL=com.sms.dash.systemConsequenceBar
$.u.define('com.sms.dash.systemConsequenceBar', null, {
	init: function (options) {
        this._options = options;
    },
    afterrender: function () {
    	 var unitId = parseInt(this._options.unitId),//安监机构id
    	 	sysTypeId = parseInt(this._options.sysTypeId),//系统id
    	 	unitName = window.unescape(unescape(this._options.unitName)),//安监机构名称
    	 	sysTypeName = window.unescape(unescape(this._options.sysTypeName)),//系统名称
    	 	date = this._options.date;
    	 require.config({
             paths: {
                 echarts: './echarts/js'
             }
         });
    	 
    	 $.u.ajax({//重大风险趋势图
    		 url:$.u.config.constant.smsqueryserver,
    		 dataType:"json",
    		 type:"post",
    		 "data":{
    			 tokenid:$.cookie("tokenid"),
    			 "method":"calculateLineByItem",
    			 "unit":unitId,
    			 "sysType":sysTypeId,
    		 }
    	},$("#conseline")).done(this.proxy(function(response){
    		if(response.success){
    			var timeaxis = [],consequencename = [],seriesdata = [],selected = {},lendstr = "{",ids = [];
    			$.each(response.data[0], this.proxy(function(key, value) {
    				if(key.indexOf("大风险平均值") > 0){
    					consequencename.push(key);
    					seriesdata.push({
							name : key,
							type : 'line',
							stack : null,
							data : value,
							smooth : true,
	    					markLine : {
	    						data : [ {type : 'average',name : '平均值'} ]
	    					}
						}) ;
    				}
				}));
    			$.each(response.data,this.proxy(function(idx,item){
    				if(idx >0){
    					ids.push(item.id);
    					consequencename.push(item.name);
    					lendstr += "\""+item.name+"\""+":false,";
    					seriesdata.push({
    								name : item.name,
    								type : 'line',
    								stack : null,
    								data : item.value,
    								smooth : true,
    		    					markLine : {
    		    						data : [ {type : 'average',name : '平均值'} ]
    		    					}
    							}) ;
    				}
    			}));
				var lendstrsub = lendstr.substring(0,(lendstr.length-1)) + "}";
				selected = JSON.parse(lendstrsub);
				timeaxis = response.time;
				this._reloadline(timeaxis, consequencename, seriesdata, selected,unitId,sysTypeId,unitName,sysTypeName,date,ids);
    		}
    	 })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
 	   		
         }));
    },
    
    
    _reloadline:function(timeaxis,consequencename,seriesdata,selected,unitId,sysTypeId,unitName,sysTypeName,date,ids) { 
    	var option = {
    		    tooltip : {
    		        trigger: 'axis'
    		    },
    		    legend: {
    		        data:consequencename,
    		        selected : selected,
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
    		            data : timeaxis,
    		            name : '日期'
    		        }
    		    ],
    		    yAxis : [
    		        {
    		            type : 'value',
    		            name : '分数'
    		        }
    		    ],
    		    series : seriesdata
    		};
	 require(['echarts','echarts/chart/line','echarts/chart/bar'],
		 function(ec){
		 	var myChart = ec.init(document.getElementById('conseline'));
		 	myChart.setOption(option);
		 	var ecConfig = require('echarts/config');
			myChart.on(ecConfig.EVENT.DBLCLICK,eConsole);
			function eConsole(param){
					var patt=new RegExp("大风险平均值");
					if(!patt.test(param.seriesName)){
						if(param.name == "最大值" || param.name == "最小值" || param.name == "平均值"){
							return false;
						}
						var tempdate = param.name+"/01";
						var url="ViewSysInsecurity.html?conseName="+escape(param.seriesName)+"&unit="+unitId+"&sysType="+sysTypeId+
						"&unitName="+escape(unitName)+"&sysTypeName="+escape(sysTypeName)+"&date="+tempdate+"&consequence="+ids[param.seriesIndex-1];
						window.open(window.encodeURI(encodeURI(url)));
					}else{
						$.u.alert.success("重大风险平均值没有不安全状态，请重新选择！");
					}
			}
	 });
    },
      
    destroy: function () {
    	this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.systemConsequenceBar.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                              "../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              'echarts/js/echarts.js',
                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.systemConsequenceBar.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                               {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                               { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];