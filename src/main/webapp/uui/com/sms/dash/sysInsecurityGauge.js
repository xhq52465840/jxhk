//@ sourceURL=com.sms.dash.sysInsecurityGauge
$.u.define('com.sms.dash.sysInsecurityGauge', null, {
	 init: function (options) {
		 this._options = options||{};
		 this.aa = 120,this.bb = 240,this.cc = 240;
		 this.xy ={"x":this.aa,"y":this.cc};
	    },
    afterrender: function (bodystr) {
    	require.config({
			paths : {
				echarts : './echarts/js'
			}
		});
    	this._getData();
    },
    _getData:function(){
    	$.u.ajax({
    		url:$.u.config.constant.smsqueryserver,
   		 	dataType:"json",
   		 	type:"post",
   		 	"data":{
   		 		tokenid:$.cookie("tokenid"),
   		 		"method":"drawGaugeAll",
   		 		"consequence":this._options.consequence,
   		 		"unit":this._options.unit,
   		 		"sysType":this._options.sysType,
   		 		"date":this._options.date
   		 	}
	   	},$("#gaugeMain").parent()).done(this.proxy(function(response){
	   		if(response.success){
	   			if(response.data.length){
	   				this._drawGauge(response.data);
	   			}else{
	   				$.u.alert.info("结果为空，请稍候");
	   			}
	   			
	   		}
	   	})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
		   	
	    }));
    },
    _drawGauge:function(data){    	
    	var option = {
    		    title : {
    		        text: '',
    		        x : 'center'
    		    },
    		    tooltip : {
    		        formatter: "{a} <br/>{c} {b} ",
    		    },
    		    toolbox: {
    		        show : true,
    		        feature : {
    		            mark : {show: true},
    		            dataView : {show: true, readOnly: false},
    		            restore : {show: true},
    		            saveAsImage : {show: true}
    		        },
    		        x : 'left'
    		    },
    		    series : []
    		};
    	var zendOption = [] , zendLineOption = [];
    	data && $.each(data,this.proxy(function(key,value){
    		this.xy = this.showXy(key,4);
			var insecurity = {
		            name:value.name,
		            type:'gauge',
		            min:0,
		            max:value.max,
		            splitNumber:10,
		            center : [this.xy.x, this.xy.y],    // 默认全局居中
		            radius : '22%',
		            axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
		                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
		                    color: 'auto'
		                },
		                formatter: function (a,b,c) {
		                    return a.toFixed(2);
		                }
					},
		            axisLine: {            // 坐标轴线
		                lineStyle: { 
		                	color: [
	                            [value.green, '#00B050'],
	                            [value.red, '#FFC000'],
	                            [1, '#FF0000']
	                        ], // 属性lineStyle控制线条样式
		                    width: 10
		                }
		            },
		            axisTick: {            // 坐标轴小标记
		                length :15,        // 属性length控制线长
		                lineStyle: {       // 属性lineStyle控制线条样式
		                    color: 'auto'
		                }
		            },
		            splitLine: {           // 分隔线
		                length :20,         // 属性length控制线长
		                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
		                    color: 'auto'
		                }
		            },
		            title : {
		            	show : true,
		            	offsetCenter: [0, '-40%'],
		                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
		                    fontWeight: 'bolder',
		                    fontSize: 20
		                }
		            },
		            detail : {
		                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
		                    fontWeight: 'bolder'
		                }
		            },
		            data:[{value: value.value, name: '分'}]
		        }
	    		option.series.push(insecurity);
				var d = this.showTitle(value.name,10);
				zendOption.push({
	                style : {
	                	text: d,
	                    x: this.xy.x-60,
	                    y: this.xy.y-140,
	                    textFont : 'bold 14px verdana'
	                },
	                clickable : true,   // default false
                    // 可自带任何有效自定义属性
	                _name:value.name,
	                _id:value.id,
                    ondblclick: this.proxy(function(params){
                    	var url = {
        						'unitId' : this._options.unit,//安监机构id
        		    			'insecurityId' : params.target._id,//点击是获取id
        		    			'date':	this._options.date,
        		    			'insecurityName':window.escape(escape(params.target._name)),
        		    			'systemId' : this._options.sysType,//系统id
        		    			'conseName':this._options.conseName,
        		    			'unitName':this._options.unitName,
        		    			'sysTypeName':this._options.sysTypeName
    	    				};
                        window.open("ViewSysThreadError.html?"+$.param(url));
                    })
	            });
				if(zendOption.length%4==0){
					zendLineOption.push({
						style: {
            		        xStart: this.xy.x-890,
            		        yStart: this.xy.y+90,
            		        xEnd: 960,
            		        yEnd: this.xy.y+90,
            		        strokeColor: '#000',
            		        lineWidth: 1
            		    }
					})
            	}
    	}));
		require([ 'echarts', 'zrender','echarts/chart/gauge'],
            this.proxy(function (ec) {
				var height = (this.xy.y+300)+"px"; 
				$("#gaugeMain").css({"height":height});
                var myChart2 = ec.init(document.getElementById('gaugeMain'));
                var zend = myChart2.getZrender();
                var TextShape = require('zrender/shape/Text');
                var Line = require('zrender/shape/Line');
                for(var i = 0;i < zendOption.length;i++){
                	zend.addShape(new TextShape(zendOption[i]));
                	if(i%4==0){
                		var j = i/4;
                		zend.addShape(new Line(zendLineOption[j]));
                	}
                }
                zend.render();
                myChart2.setOption(option);
            }
        ));
    },
    showXy: function(data,len){
    	var dl = Math.ceil(data/len);//最大值
    	var dl1 = parseInt(data/len);//最小值
    	var x = this.xy.x, y = this.xy.y;
    	if(data % len==0){
    		x = this.aa;
    		y = this.cc+300*dl1;
    	}else if(data < dl*len && data >= dl1*len){
    		if(data==dl1*len){
    			x = this.aa;
    			y = this.cc;
    		}else{
    			x += this.bb; 
    		}
    	}
    	return {"x":x,"y":y};
    },
    showTitle: function(data,len){
    	var text = "";
    	var dl = Math.ceil(data.length/len);
    	for(var i = 0;i <= dl;i++){
    		text += data.substr(i*len,len)+"\n"; 
    	}
    	return text;
    	
    },
    destroy: function () {
    	this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.sysInsecurityGauge.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                              "../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              'echarts/js/echarts.js',
                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.sysInsecurityGauge.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                               {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                               { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];