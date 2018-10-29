//@ sourceURL=com.sms.unitbrowse.activityLine
$.u.define('com.sms.unitbrowse.activityLine', null, {
    init: function (options) {
        this._options = options || {};
    },
    afterrender: function (bodystr) {
    	this.draw();
    },
    draw:function(){ 
		$.u.ajax({
			url:$.u.config.constant.smsqueryserver,
			 	dataType:"json",
			 	type:"post",
			 	"data":$.extend({tokenid:$.cookie("tokenid")},this._options)
			 	
			},this.$).done(this.proxy(function(response){
				if(response.success){
					if(response){
						this._drawPie(response);
					}else{
						$.u.alert.info("结果为空，请稍候");
					}
					
				}
			})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
		   	
		}));
    },
    _drawPie: function(data){
    	var option = {
    		    title : {
    		        text: ''
    		    },
    		    tooltip : {
    		        trigger: 'axis',
    		        formatter: "{a} <br/> 日期：{b} <br/> {c}次 "
    		    },
    		    legend: {
    		        data:[]
    		    },
    		    toolbox: {
    		        show : false,
    		        feature : {
    		            mark : {show: true},
    		            dataView : {show: true, readOnly: false},
    		            magicType : {show: true, type: ['line', 'bar']},
    		            restore : {show: true},
    		            saveAsImage : {show: true}
    		        },
    		        x:"right",
    		        y:"bottom"
    		    },
    		    calculable : false,
    		    xAxis : [
    		        {
    		            type : 'category',
    		            boundaryGap : false,
    		            data : data.timeline
    		        }
    		    ],
    		    yAxis : [
    		        {
    		            type : 'value',
    		            axisLabel : {
    		                formatter: '{value}次'
    		            }
    		        }
    		    ],
    		    series : [
					{
					    name:"安全信息30天汇总",
					    type:'line',
					    data:data.data,
					    markLine : {
					        data : [
					            {type : 'average', name: '平均值'}
					        ]
					    }
					}
    		    ]
    		};
        require.config({
            paths:{ 
            	echarts:'../dash/echarts/js'
            }
        });
        require(
            [
    			'echarts',
    			'echarts/chart/line',
    			'echarts/chart/bar'
            ],
            this.proxy(function (ec) {
            	var $div = $('<div id="'+this._id+'pie3" style="height:380px;width:100%;"></div>');
            	$div.appendTo(this.$);
            	var myChart2 = ec.init($div.get(0));
                myChart2.setOption(option);
            })
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.unitbrowse.activityLine.widgetjs = ["../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              "../dash/echarts/js/echarts.js"];
com.sms.unitbrowse.activityLine.widgetcss = [];