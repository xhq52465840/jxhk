//@ sourceURL=com.sms.dash.threadErrorLine
$.u.define('com.sms.dash.threadErrorLine', null, {
    init: function (options) {
    	this._options = options;
    },
    afterrender: function () {
    	this.qid("searchThreadError").select2({
    		width:780,
            allowClear: true,
            multiple: true,
    		ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type : "post",
                data:this.proxy(function(term,page){
    	        	return {
    	        		"tokenid":$.cookie("tokenid"),
    					"method":"stdcomponent.getbysearch",
    					"dataobject":this._options.paramType,
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}]]),
    				};
                }),
    	        results:function(response,page,query){
    	        	if(response.success){
    	        		return {results:response.data.aaData};
    	        	}
    	        }
    		},
            formatResult:function(item){
            	return item.name;
            },
            formatSelection:function(item){
            	return item.name;
            }
    	});
    	this.qid("shThreadError").off("click").on("click",this.proxy(this.search));
    	this.draw();
    },
    search: function(){
    	var ids = this.qid("searchThreadError").select2("val");
    	this.draw(ids);
    },
    draw: function(ids){
    	$("#"+this.did).remove();
		$.u.ajax({
			url:$.u.config.constant.smsqueryserver,
			 	dataType:"json",
			 	type:"post",
			 	"data":{
			 		tokenid:$.cookie("tokenid"),
			 		"method":"calculateByMultiConForThreatAndError",
			 		"obj":JSON.stringify({
			 			"unitId":this._options.unitId,
				 		"insecurityId":this._options.insecurityId,
				 		"systemId":this._options.systemId,
				 		"paramType":this._options.paramType,
				 		"date":this._options.date
			 		}),
			 		"ids":JSON.stringify(ids)||""
			 	}
			},this.$).done(this.proxy(function(response){
				if(response.success){
					if(response){
						this._drawLine(response);
					}else{
						$.u.alert.info("结果为空，请稍候");
					}
					
				}
			})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
		   	
		}));
    },
    _drawLine: function(data){
    	if(data.scoreListOneYear.length){
    		var legendData = [];
    		data.scoreListOneYear[0] && $.each(data.scoreListOneYear[0], this.proxy(function(key,value){
    			legendData.push(value.name);
    		}))
    		var option = {
        		    title : {
        		        text: ''
        		    },
        		    tooltip : {
        		        trigger: 'axis'
        		    },
        		    legend: {
        		    	data: legendData
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
        		        x: 'right',
                        y: 'bottom'
        		    },
        		    calculable : false,
        		    xAxis : [
        		        {
        		            type : 'category',
        		            boundaryGap : false,
        		            data :  data.timeData
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
            data.scoreListOneYear && $.each(data.scoreListOneYear, function (key, value) {
                var ser = {
                    name: "",
                    type: 'line',
                    data: []
                };
                if (value[key]) {
                    ser.name = value[key].name;
                    for (var i = 0 ; i < data.scoreListOneYear.length; i++) {
                    	if(data.scoreListOneYear[i][key]){
                    		ser.data.push(data.scoreListOneYear[i][key].value);	
                    	}else{
                    		
                    	}
                    }
                    option.series.push(ser);
                }
                
            });
            require.config({
                paths:{ 
                	echarts:'echarts/js'
                }
            });
            require(
                [
        			'echarts',
        			'echarts/chart/line'
                ],
                this.proxy(function (ec) {
                	this.did = this._id + "threadErrorLine";
                    var $div = $('<div id="'+this.did+'" style="height:480px;width:1024px;border:1px solid #ccc;padding:10px;"></div>');
                	$div.appendTo(this.$);
                	var myChart2 = ec.init($div.get(0));
                    myChart2.setOption(option);
                })
            );	
    	}
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.threadErrorLine.widgetjs = [
                                         "../../../uui/widget/select2/js/select2.min.js",
                                         "../../../uui/widget/spin/spin.js",
			                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
			                             "../../../uui/widget/ajax/layoutajax.js",
			                             "echarts/js/echarts.js"];
com.sms.dash.threadErrorLine.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                          {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];