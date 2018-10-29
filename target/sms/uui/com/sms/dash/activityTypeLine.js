//@ sourceURL=com.sms.dash.activityTypeLine
$.u.define('com.sms.dash.activityTypeLine', null, {
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
    		        trigger: 'axis'
    		    },
    		    legend: {
    		        data:[],
    		        selected : {}
    		    },
    		    toolbox: {
    		        show : true,
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
    		                formatter: '{value} 分'
    		            }
    		        }
    		    ],
    		    series : [

    		    ]
    		};
    	data.data && $.each(data.data, this.proxy(function(key,value){
    		option.legend.data.push(key);
    		if(option.legend.data.length === 1){
    			option.legend.selected[key] = true;
    		}else{
    			option.legend.selected[key] = false;
    		}
    		var ses =  {
    	            name:key,
    	            type:'line',
    	            data:value,
    	            markLine : {
    	                data : [
    	                    {type : 'average', name: '平均值'}
    	                ]
    	            }
    	        };
        	option.series.push(ses);
    	}))
        require.config({
            paths:{ 
            	echarts:'echarts/js'
            }
        });
        require(
            [
    			'echarts',
    			'echarts/chart/line',
    			'echarts/config'
            ],
            this.proxy(function (ec) {
            	var $div = $('<div id="'+this._id+'pie3" style="height:480px;width:1024px;border:1px solid #ccc;padding:10px;"></div>');
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

com.sms.dash.activityTypeLine.widgetjs = ["../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              "echarts/js/echarts.js"];
com.sms.dash.activityTypeLine.widgetcss = [];