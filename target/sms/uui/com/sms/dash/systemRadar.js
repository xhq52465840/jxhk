//@ sourceURL=com.sms.dash.systemRadar
$.u.define('com.sms.dash.systemRadar', null, {
	init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	 var unitId = parseInt(this._options.unitId),//安监机构id
    	 	sysTypeId = parseInt(this._options.sysTypeId),//系统id
    	 	unitName = window.unescape(unescape(this._options.unitName)),//安监机构名称
    	 	sysTypeName = window.unescape(unescape(this._options.sysTypeName)),//系统名称
    	 	date = this._options.date;//开始日期
    	 require.config({
             paths: {
                 echarts: './echarts/js'
             }
         });
    	 $.u.ajax({//重大风险雷达图
    		 url:$.u.config.constant.smsqueryserver,
    		 dataType:"json",
    		 type:"post",
    		 "data":{
    			 tokenid:$.cookie("tokenid"),
    			 "method":"drawRadar",
    			 "unitId":unitId,
    			 "sysTypeId":sysTypeId,
    			 "date":date
    		 }
    	 },$("#conseradar")).done(this.proxy(function(response){
    		 if(response.success){
    			 var indicatordata = [],seriesdata = [],ids = [], showValue = [];
    			 $.each(response.data,this.proxy(function(idx,term){
    				 indicatordata.push({text:term.name,max:term.max});
    				 ids.push(term.id);
    				 seriesdata.push(term.value);
    				 showValue.push(term.showValue);
    			 }));
    			 this._reloadradar(indicatordata, seriesdata,unitId,sysTypeId,unitName,sysTypeName,ids,date,showValue);
    		 }
    	 })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
 	   		
         }));
    },
    
    _reloadradar:function(indicatordata, seriesdata,unitId,sysTypeId,unitName,sysTypeName,ids,date,showValue){
    	var temp = new Date(date).format("yyyy-MM");
		var option = {
				color : [ '#0000FF' ],
				title :{
					text : "日期： "+temp,
				},
			    tooltip : {
			    	trigger: 'item',
			        formatter: function (params,ticket,callback) {
	    	        	var index = params["3"];
	    	        	if(typeof index == "number"){
	    	        		var showValue = params.data.showValue[index];
		    	            var res = params.seriesName;
		    	            var name = params.name;
		    	            res += '<br/>' + name + ' : ' + showValue;
		    	            return res;
	    	        	}else{
	    	        		return "";
	    	        	}
	    	        }
			    },
			    toolbox: {
			        show : true,
			        feature : {
			            mark : {show: true},
			            dataView : {show: true, readOnly: false},
			            restore : {show: true},
			            saveAsImage : {show: true}
			        }
			    },
			    polar : [
			       {
			           indicator : indicatordata,
			           radius:"50%",
		        	   splitArea : {
							show : true,
							areaStyle : {
								color : [ '#FF0000', '#FFFF00', '#00FF00' ]
							}
						},
						splitNumber : 3,
			        }
			    ],
			    calculable : false,
			    series : [
			        {
			            type: 'radar',
			            data : [
			                {	id:ids,
			                	name :"重大风险",
			                    value : seriesdata,
			                    showValue : showValue
			                }
			            ]
			        }
			    ]
			};
	require(['echarts','echarts/chart/radar'],
		function(ec){
			var myChart = ec.init(document.getElementById('conseradar'));
			myChart.setOption(option);
			var ecConfig = require('echarts/config');
			myChart.on(ecConfig.EVENT.DBLCLICK,eConsole);
			function eConsole(param){
				var url="ViewSysInsecurity.html?conseName="+escape(param.name)+"&unit="+unitId+"&sysType="+sysTypeId+
				"&unitName="+escape(unitName)+"&sysTypeName="+escape(sysTypeName)+"&date="+date+"&consequence="+param.data.id[param.special];
				window.open(window.encodeURI(encodeURI(url)));
			}
		});
    },
      
    destroy: function () {
    	this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.systemRadar.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                              "../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              'echarts/js/echarts.js',
                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.systemRadar.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                               {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                               { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];