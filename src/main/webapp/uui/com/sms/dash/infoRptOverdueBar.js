//@ sourceURL=com.sms.dash.infoRptOverdueBar
$.u.define('com.sms.dash.infoRptOverdueBar', null, {
    init: function (options) {
        this._options = options;
        require.config({paths : {echarts : './echarts/js'}});
    },
    afterrender: function () {
    	this.qid("search").off("click").on("click",this.proxy(this._search));
    	this.setCondition();
    	this._getData();
    },
    setCondition : function(){
    	this.startdate = $("[name=startdate]");
		this.startdate.datepicker({"dateFormat":"yy-mm-dd"});
		this.startdate.val("");
    },
    _search : function(){
		this._getData();
	},
	_getData : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method":"getInfoRptOverdueList",
				"startDate": this.startdate.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				this._reloadInfoRptOverdueBar(response.data.deptData, response.data.seriesData);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _reloadInfoRptOverdueBar:function(deptData, seriesData) { 
    	var option = {
    			title : {
    		        text: '信息报告超期（按部门）'
    		    },
    		    tooltip : {
    		        trigger: 'axis'
    		    },
    		    legend: {
    		        data:['数量']
    		    },
    		    toolbox: {
    		        show : true,
    		        feature : {
    		            mark : {show: true},
    		            dataView : {show: true, readOnly: false},
    		            magicType: {show: true, type: ['line', 'bar']},
    		            restore : {show: true},
    		            saveAsImage : {show: true}
    		        }
    		    },
    		    calculable : true,
    		    xAxis : [
    		        {
    		            type : 'value',
    		            boundaryGap : [0, 0.01]
    		        }
    		    ],
    		    yAxis : [
    		        {
    		            type : 'category',
    		            data : deptData
    		        }
    		    ],
    		    series : [
    		        {
    		            name:'数量',
    		            type:'bar',
    		            itemStyle: {
   		                 normal: {
   		                     label: {
   		                         show: true,
   		                         position:'right',
   		                         textStyle: {
   		                             color: '#3398DB',
   		                             fontWeight:'bold',
   		                             fontSize:20
   		                         }
   		                     }
   		                 }
    		            },
    		            data:seriesData
    		        }
    		    ]
    		};
    	require.config({
			paths : {
				echarts : './echarts/js'
			}
		});
		// 使用
		require([ 'echarts', 'echarts/chart/bar', 'echarts/config' ],
            function (ec) {
                // --- 柱状 ---
                var myChart2 = ec.init(document.getElementById('infoRptOverdueBar'));
                myChart2.setOption(option);
            }
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.infoRptOverdueBar.widgetjs = [
                               		'../../../uui/widget/select2/js/select2.min.js',
                            		"../../../uui/widget/spin/spin.js",
                            		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                            		"../../../uui/widget/ajax/layoutajax.js",
                            		'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];

com.sms.dash.infoRptOverdueBar.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];