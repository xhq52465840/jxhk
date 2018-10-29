// @ sourceURL=com.sms.dash.insecurities1
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.insecurities1', null, {
	init : function(option) {
		this.dd = option;
		this._tabName = ["com/sms/dash/insecurities1#0","com/sms/dash/insecurities1#1"];
		this._method = ["getInsecurityPie","getInsecurityGauge"];
		this._lineMethod = ["getInsecurityLine"];
		require.config({paths : {echarts : './echarts/js'}});
		this.aa = 120,this.bb = 240,this.cc = 240;
		this.xy ={"x":this.aa,"y":this.cc};
		this.show_8_10 = null;
	},
	afterrender : function(bodystr) {
		this.getDisplayFilter();
		this.showEight = this.qid("showEight");
		this.showEight.click(this.proxy(this.show_8));
		this.showAll = this.qid("showAll");
		this.showAll.click(this.proxy(this.show_0));		
		$('ul.nav-tabs>li',this.$).on("click",this.proxy(this._liActive));
	},
    show_8: function(e){
    	this.show_8_10 = 8;
    	this.moduleFilter.on_btn_search_click();
    },
    show_0: function(e){
    	this.show_8_10 = 10;
    	this.moduleFilter.on_btn_search_click();
    },	
    getDisplayFilter : function(index){
    	if(typeof index == "undefined"){
    		index = $('li.active').index();
    	}
		var qu = $.parseJSON(window.decodeURIComponent(window.decodeURIComponent(this.dd.filter)));
		this.moduleFilter = new com.sms.dashfilter.filter($("div[umid='sr"+index+"']", this.$), {"op":qu,"md":this._tabName[index]});
		this.moduleFilter.override({
			loadData:this.proxy(function(param,other,index,otherType){
    			this._loadData({
    				"method": this._method[index],
    	     		"query":param
    			});
    			this._userFilter = other;
				this._userFilterType = otherType.split(",");
    		})
    	});
		this.moduleFilter._start();
    },
    _liActive : function(e){
    	var active = $(e.target).parent().hasClass('active');
    	if(!active){
    		var index = $(e.target).parent().index();
    		this.getDisplayFilter(index);
    	}
    },
    _loadData : function(param){
    	$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : $.extend({
				"tokenid" : $.cookie("tokenid")
			}, param)
		},$('.tab-content')).done(this.proxy(function(data) {
			if (data.success) {
				this._setData(data,param);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _setData : function(data,param){
    	var option = null ,option2 = null, method =  param.method;
    	this.param = param;
    	switch(method){
    		case this._method[0]:
    			option = this._funnel();
    			option2 = this._bar();
	    		if(this.show_8_10 === 10){
	    			data.alldata && $.each(data.alldata, this.proxy(function(k,v){
	    				option.legend.data.push(v.name);
	    				option2.yAxis[0].data.push(v.name);
	    				if(v.mark){
	        				option.legend.selected[v.name]= true;
	        			}else{
	        				option.legend.selected[v.name]= false;
	        			}
	    				option.series[0].data.push(v);
	    				option2.series[0].data.push(v);
	    			}));
	    		}else{
	    			data.data && $.each(data.data, this.proxy(function(k,v){
	    				option.legend.data.push(v.name);
	    				option2.yAxis[0].data.push(v.name);
	    				if(v.mark){
	        				option.legend.selected[v.name]= true;
	        			}else{
	        				option.legend.selected[v.name]= false;
	        			}
	    				option.series[0].data.push(v);
	    				option2.series[0].data.push(v);
	    			}));
	    		}    			
    			
    			break;
    		case this._method[1]:
    			option = {
    				backgroundColor : 'white',
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
    	    	data.data && $.each(data.data,this.proxy(function(key,value){
    	    		this.xy = this.showXy(key,4);
    				var insecurity = {
    			            name:value.name,
    			            type:'gauge',
    			            min:0,
    			            max:value.max,
    			            splitNumber:10,
    			            center : [this.xy.x, this.xy.y],
    			            radius : '110',
    			            axisLabel: {
    			                textStyle: {
    			                    color: 'auto'
    			                },
    			                formatter: function (a,b,c) {
    			                    return a.toFixed(2);
    			                }
    						},
    			            axisLine: {
    			                lineStyle: { 
    			                	color: [
    		                            [value.green, '#00B050'],
    		                            [value.red, '#FFC000'],
    		                            [1, '#FF0000']
    		                        ],
    			                    width: 10
    			                }
    			            },
    			            axisTick: {
    			                length :15,
    			                lineStyle: {
    			                    color: 'auto'
    			                }
    			            },
    			            splitLine: {
    			                length :20,
    			                lineStyle: {
    			                    color: 'auto'
    			                }
    			            },
    			            title : {
    			            	show : true,
    			            	offsetCenter: [0, '-40%'],
    			                textStyle: {
    			                    fontWeight: 'bolder',
    			                    fontSize: 20
    			                }
    			            },
    			            detail : {
    			                textStyle: {
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
    		                clickable : true,
    		                _name:value.name,
    		                _id:value.id,
    	                    ondblclick: this.proxy(function(params){
    	                    	var id = params.target._id;
    	                    	var name = params.target._name;
    	                    	var x = params.event.clientX+10;
	        					var y = params.event.clientY+10;
    	                    	this.DBCLK1(x,y,id,name);
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
    			break;
    	}
		require(['echarts', 'echarts/chart/funnel', 'echarts/chart/line','echarts/chart/bar','echarts/chart/pie', 'zrender','echarts/chart/gauge' ],
            this.proxy(function (ec) {
            	var ecConfig = require('echarts/config');
            	var timer1 = null;
                var a = 0;
                var sendData = null;
				var myChart = null;
				var myChart2 = null;
				var myChart3 = null;
				var height = null, height2 = null;
	            switch(method){
	            	case this._method[0]:
	            		var length = option.legend.data.length;
	            		if(length <= 2){
	            			height = '50%';
	            			height2 = '200px';
	            		}else{
	            			height = parseInt(length*28/2.5)+100;
		            		height2 = height+200+'px';
	            		}
	            		var height22 = length * 80 + 200;
	            		$('#main1').css({'height':height2});
	            		$('#main12').css({'height':height22});
	            		option.series[0].center = ['50%', height];
	            		myChart = ec.init(document.getElementById('main1'));
	            		myChart.setOption(option);
	            		myChart3 = ec.init(document.getElementById('main12'));
	            		myChart3.setOption(option2);
	                	myChart2 = ec.init(document.getElementById('main2'));
						$('div[umid=sr01]').empty();
	                	myChart2.clear();
	                    var c2 = this.proxy(function(){
	        				clearTimeout(timer1);
							var id = sendData.data.id;
	        				var name = sendData.data.name;
							var x = sendData.event.clientX+10;
	        				var y = sendData.event.clientY+10;
	        				if(a===1){
	        					this.setLine(id,name,"other");
	        				}else if(a===2){
	        					this.DBCLK1(x,y,id,name,"other");
	        				}else if(a>2){
	        					
	        				}
	        				a = 0;
	        			});
	                    myChart.on(ecConfig.EVENT.CLICK, function(param) {
	        				sendData = param;
	        				a++;
	                        timer1 = setTimeout(c2, 600);
	        			});
	                    myChart3.on(ecConfig.EVENT.CLICK, function(param) {
	        				sendData = param;
	        				a++;
	                        timer1 = setTimeout(c2, 600);
	        			});
	            		break;
	            	case this._method[1]:
	            		height = (this.xy.y+300)+"px"; 
	    				$("#main21").css({"height":height});
	            		myChart = ec.init(document.getElementById('main21'));
	                    var zend = myChart.getZrender();
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
	            		myChart.setOption(option);
	        			break;
	            }
            })
        )
    },
	time2 : function(plugin){
    	plugin.propshow = "最近12个月";
    	plugin.propvalue = [{"id":"last12Months()","name":"最近12个月","type":"last12Months"}];
		plugin.type = "static";
    	return plugin;
    },
	_setQuery : function(id,name,date){
    	var filter = $.parseJSON(this.param.query);
    	var len = filter.length;
    	var query = filter.slice(0);
    	this._userFilter && $.each(this._userFilter, this.proxy(function(k,v){
    		var flag = true;
			var datatype = this._userFilterType[k];
			v.type = "static";
    		for(var i = 0; i < len; i++){
    			var propid = filter[i].propid;
    			if(v.propid == propid){
    				if(v.propplugin.indexOf("dateProp") > -1){
    					if(date=="other"){
    						query.splice(i,1,this.time2(v));
    					}else if(date=="no"){
							
						}else{
    						query.splice(i,1,this.time(date,v));
    					}
    				}else{
    					v.propshow = name=="全部"?"":name;
						if(datatype == "id"){
							v.propvalue = name=="全部"?[]:[{"id":id,"name":name}];
						}else if(datatype == "name"){
							v.propvalue = name=="全部"?[]:[{"id":name,"name":name}];
						}
    					query.splice(i,1,v);
    				}
    				flag = false;
    				break; 
    			}
    		}
    		if(flag){
    			if(v.propplugin.indexOf("dateProp") > -1){
    				if(date=="other"){
						query.splice(i,1,this.time2(v));
					}else if(date=="no"){
							
					}else{
						query.splice(i,1,this.time(date,v));
					}
				}else{
					v.propshow = name=="全部"?"":name;
					if(datatype == "id"){
						v.propvalue = name=="全部"?[]:[{"id":id,"name":name}];
					}else if(datatype == "name"){
						v.propvalue = name=="全部"?[]:[{"id":name,"name":name}];
					}
					query.splice(query.length+1,1,v);
				}
			}
    	}));
    	return query; 
    },
    setLine : function(id, name, date){
		var query = this._setQuery(id, name, date);
		var index = this._method.indexOf(this.param.method);
    	var lineMethod = this._lineMethod[index];
        this.line(lineMethod, query, index);
    },
	line : function(lineMethod, query,index){
    	var module1 = new com.sms.dashfilter.filter($("div[umid=sr"+index+"1]", this.$), query);
    	module1.override({
			loadData2:this.proxy(function(param){
				$.u.ajax({
					url : $.u.config.constant.smsqueryserver,
					dataType : "json",
					type : "post",
					data : $.extend({
						"tokenid" : $.cookie("tokenid")
					}, {
						"method": lineMethod,
			     		"query":param	
					})
				}).done(this.proxy(function(data) {
					if (data.success) {
						require(['echarts', 'echarts/chart/line'],this.proxy(function (ec) {
							var myChart2 = ec.init(document.getElementById('main2'));
							var ecConfig = require('echarts/config');
		            		var option2 = this._line();
		            		data.data && $.each(data.data, this.proxy(function(key, item){
								option2.series.push({
									name:item.name,
						            type:'line',
						            data:item.value
								});
								option2.legend.data.push(item.name);
		                	}));
		            		data.timeline = $.map(data.timeline, function(k,v){
		            			return k.substring(0,7);
		            		});
		            		option2.xAxis[0].data = data.timeline;
		            		myChart2.setOption(option2);
							myChart2.on(ecConfig.EVENT.HOVER, function(param) {
								$('.echarts-tooltip').empty().text(param.seriesName+":"+param.value);
				        		return false;
				     		});
			            }));
					}
				})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
					
				}));
    		})
    	});
    	module1._start();
    },
    onBodyDown : function(e){
    	if (!(e.target.id == "rightMenuContent" || $(e.target).parents("#rightMenuContent").length>0)) {
			this.hideMenu();
		}
    },
    hideMenu : function(){
    	var rightMenuContent = $("#rightMenuContent");
    	rightMenuContent.empty();
		rightMenuContent.fadeOut("fast");
		$("body").off("mousedown", this.proxy(this.onBodyDown));
    },
    DBCLK1 : function(x,y,id,name){
    	var rightMenuContent = $("#rightMenuContent");
    	rightMenuContent.empty();
    	if(this.param.method=="getInsecurityPie"){
    		$('<div class="zxt" data-id="'+id+'" data-name="'+name+'">显示折线图</div>'
			 +'<div class="zdfx" data-id="'+id+'" data-name="'+name+'">查看重大风险</div>'
			 +'<div class="hkaqxx" data-id="'+id+'" data-name="'+name+'">查看安全信息</div>'
			 +'<div class="wxcc" data-id="'+id+'" data-name="'+name+'">查看威胁差错</div>')
			 .appendTo(rightMenuContent);
    	}else if(this.param.method=="getInsecurityGauge"){
    		$('<div class="zdfx" data-id="'+id+'" data-name="'+name+'">查看重大风险</div>'
			 +'<div class="hkaqxx" data-id="'+id+'" data-name="'+name+'">查看安全信息</div>'
			 +'<div class="wxcc" data-id="'+id+'" data-name="'+name+'">查看威胁差错</div>')
			 .appendTo(rightMenuContent);
    	}
		rightMenuContent.css({left:x + "px", top:y + "px"}).slideDown("fast");
		$("body").off("mousedown").on("mousedown", this.proxy(this.onBodyDown));
		rightMenuContent.off("mouseover mouseout").on({"mouseover":function(e){
			$(e.target).css("background-color","#B51E6E");
		},"mouseout":function(e){
			$(e.target).css("background-color","");
		}})
		$("div.zxt").off("click").on("click",this.proxy(this.zxt));
		$("div.zdfx").off("click").on("click",this.proxy(this.zdfx));
		$("div.hkaqxx").off("click").on("click",this.proxy(this.hkaqxx));
		$("div.wxcc").off("click").on("click",this.proxy(this.wxcc));
    },
	zxt : function(e){
		var id = $(e.currentTarget).attr("data-id");
    	var name = $(e.currentTarget).attr("data-name");
		this.setLine(id,name,"other");
	},
    zdfx : function(e){
    	var id = $(e.currentTarget).attr("data-id");
    	var name = $(e.currentTarget).attr("data-name");
    	var query = this._setQuery(id,name,"no");
    	query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
    	/*
    	 * 浏览器
    	 */
    	var agent = navigator.userAgent.toLowerCase();
    	
    	if(agent.indexOf("edge") > 0){//edge流浪器
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("temRiskRank.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
			window.open("temRiskRank.html?filter="+query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("temRiskRank.html?filter="+query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("temRiskRank.html?filter="+query);
			}
    	//window.open("temRiskRank.html?filter="+query);
    },
    hkaqxx : function(e){
	    var id = $(e.currentTarget).attr("data-id");
    	var name = $(e.currentTarget).attr("data-name");
    	var query = this._setQuery(id,name,"no");
		query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
		/*
		 * 浏览器
		 */
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("aviationSafetyInfo.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
			window.open("aviationSafetyInfo.html?filter="+query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("aviationSafetyInfo.html?filter="+query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("aviationSafetyInfo.html?filter="+query);
			}
		//window.open("aviationSafetyInfo.html?filter="+query);
    },
    wxcc : function(e){
	    var id = parseInt($(e.currentTarget).attr("data-id"));
    	var name = $(e.currentTarget).attr("data-name");
		var query = this._setQuery(id,name,"no");
		query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
		/*
		 * 浏览器
		 */
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("errorThread.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
			window.open("errorThread.html?filter="+query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("errorThread.html?filter="+query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("errorThread.html?filter="+query);
			}
		//window.open("errorThread.html?filter="+query);
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
	_funnel : function(){
    	return {
			backgroundColor : 'white',
		    title : {
		       
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    toolbox: {
		        show : false,
		        x : 'right',
  		        y : 'center',
  		        orient : 'vertical',
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: true},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    legend: {
		    	orient : 'horizontal',
		        x : 'center',
		        y : 'top',
		        data:[],
		        selected:{}
		    },
		    calculable : true,
		    series : [
		        {
		            name:'不安全状态排行',
		            type:'pie',
		            radius : '40%',
		            center: ['50%', '50%'],
		            itemStyle : {
		                normal : {
		                	label : {
		                		show : false
		                	},
		                    labelLine : {
		                        show : false
		                    }
		                }
		            },
		            data:[
		            ]
		        }
		    ]
		};
    },
    _bar : function(){
    	return {
		    title : {
		        
		    },
		    backgroundColor : 'white',
		    tooltip : {
		        trigger: 'axis'
		    },
		    toolbox: {
		        show : false,
		        x : 'right',
  		        y : 'center',
  		        orient : 'vertical',
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: true},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : false,
		    grid : {
		    	x : '10%',
		    	x2 : 50
		    },
		    xAxis : [
		        {
		            type : 'value',
		            name :'风险值'
		        }
		    ],
		    yAxis : [
		        {
		            type : 'category',
		            data : [],
		            axisLabel: {
		            	formatter: function(value){
		            		var data = value.split(''), len = data.length, arr = [];
		            		for(var i = 0; i < len; i++){
		            			if(i > 0 && i%5 == 0){
		            				arr.push('\n');
		            			}
		            			arr.push(data[i]);
		            		}
		            		return arr.join('');
		            	}
		            }
		        }
		    ],
		    series : [
		        {
		            name:'风险值',
		            type:'bar',
		            itemStyle : { normal: {label : {show: true, position: 'insideRight'}}},
		            data:[]
		        }
		    ]
		};
    },
    _line : function(){
    	return {
		    title : {
		       text : this.lineName,
		       textStyle :{
		    	    fontSize: 12,
		    	    fontWeight: 'normal',
		    	    color: '#333'
		    	}
		    },
		    tooltip : {
		        trigger: 'axis'
		    },
			legend : {
				data : []	
			},
		    calculable : false,
		    grid : {
  		    	x:40,
  		    	y:45,
  		    	x2:40,
  		    	y2:20
  		    },
		    xAxis : [
		        {
		            type : 'category',
		            boundaryGap : false,
		            data :[]
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value',
		            name : '风险值',
		            axisLabel : {
		                formatter: '{value} '
		            },
		            splitNumber :3
		        }
		    ],
		    series : [
		        
		    ]
		};
    }
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.insecurities1.widgetjs = [  '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js',
										'../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js',
										'echarts/js/echarts.js'
									 ];
com.sms.dash.insecurities1.widgetcss = [];