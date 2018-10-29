//@ sourceURL=com.sms.dash.pie3
$.u.define('com.sms.dash.pie3', null, {
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
			 	"data":{
			 		tokenid:$.cookie("tokenid"),
			 		"method":this._options.method,
			 		"obj":JSON.stringify({
			 			"unitId":this._options.unitId,
				 		"insecurityId":this._options.insecurityId,
				 		"systemId":this._options.systemId,
				 		"paramType":this._options.paramType,
				 		"date":this._options.date
			 		})
			 	}
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
    			tooltip : {
    		        trigger: 'item',
    		        formatter: "{a} <br/>{b} : {c} ({d}%)"
    		    },
    		    legend: {
    		        orient : 'vertical',
    		        x : 'left',
    		        data:[]
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
    		    calculable : false,
    		    series : [
    		        {
    		            name:'不安全状态：',
    		            type:'pie',
    		            radius : '55%',
    		            center: ['50%', '60%'],
    		            data:[
    		            ]
    		        }
    		    ]
    	};
    	data.scoreListOneMonth && $.each(data.scoreListOneMonth,this.proxy(function(key,value){
    		option.legend.data.push(value.name);
    		option.series[0].data.push({
    			"value":value.value,
    			"name":value.name
    		});
    	}))
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

com.sms.dash.pie3.widgetjs = ["../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              "echarts/js/echarts.js"];
com.sms.dash.pie3.widgetcss = [];