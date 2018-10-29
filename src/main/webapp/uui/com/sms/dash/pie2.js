//@ sourceURL=com.sms.dash.pie2
$.u.define('com.sms.dash.pie2', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	var option = {
    		    tooltip : {
    		        trigger: 'item',
    		        formatter: "{a} <br/>{b} : {c} ({d}%)"
    		    },
    		    legend: {
    		        orient : 'vertical',
    		        x : 'left',
    		        data:['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
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
    		    calculable : true,
    		    series : [
    		        {
    		            name:'访问来源',
    		            type:'pie',
    		            radius : ['50%', '70%'],
    		            itemStyle : {
    		                normal : {
    		                    label : {
    		                        show : false
    		                    },
    		                    labelLine : {
    		                        show : false
    		                    }
    		                },
    		                emphasis : {
    		                    label : {
    		                        show : true,
    		                        position : 'center',
    		                        textStyle : {
    		                            fontSize : '30',
    		                            fontWeight : 'bold'
    		                        }
    		                    }
    		                }
    		            },
    		            data:[
    		                {value:335, name:'直接访问'},
    		                {value:310, name:'邮件营销'},
    		                {value:234, name:'联盟广告'},
    		                {value:135, name:'视频广告'},
    		                {value:1548, name:'搜索引擎'}
    		            ]
    		        }
    		    ]
    		};
        require.config({
            paths:{ 
            	echarts:'echarts/js'
            }
        });
        require(
            [
    			'echarts',
    			'echarts/chart/pie'
            ],
            function (ec) {
                // --- 饼图2 环形 ---
                var myChart2 = ec.init(document.getElementById('mainPie2'));
                myChart2.setOption(option);
            }
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.pie2.widgetjs = ['echarts/js/echarts.js'];
com.sms.dash.pie2.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];