// @ sourceURL=com.sms.dash.errorThread
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.errorThread', null, {
	init : function(option) {
		this.dd = option;
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("chrome") > 0){
		}else if(agent.indexOf("msie") > 0){
			query=JSON.parse(this.dd.filter);
			}
		this._tabName = ["com/sms/dash/errorThread#0","com/sms/dash/errorThread#1"];
		this._method = ["getThreatPie","getErrorPie"];
		this._lineMethod = ["getThreatLine","getErrorLine"];
		require.config({paths : {echarts : './echarts/js'}});
	},
	afterrender : function(bodystr) {
		this.getDisplayFilter();
		$('ul.nav-tabs>li',this.$).on("click",this.proxy(this._liActive));
	},
    getDisplayFilter : function(index){
    	if(typeof index == "undefined"){
    		index = $('li.active').index();
    	}
		var qu = $.parseJSON(window.decodeURIComponent(window.decodeURIComponent(this.dd.filter)));
		var module = new com.sms.dashfilter.filter($("div[umid='sr"+index+"']", this.$), {"op":qu,"md":this._tabName[index]});
		module.override({
			loadData:this.proxy(function(param,other,index,otherType){
    			this._loadData({
    				"method": this._method[index],
    	     		"query":param
    			});
    			this._userFilter = other;
				this._userFilterType = otherType.split(",");
    		})
    	});
		module._start();
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
    	var option = null, myChart = null, myChart2 = null, myChart3 = null,option3 = null;
    	this.param = param;
		option = this._pie();
		option3 = this._bar();
		data.data && $.each(data.data, this.proxy(function(k,v){
			if(v.mark){
				option.legend.data.push(v.name);
				option.series[0].data.push(v);
				option3.yAxis[0].data.push(v.name);
				option3.series[0].data.push(v);
			}
		}));
		require(['echarts', 'echarts/chart/line','echarts/chart/funnel','echarts/chart/pie','echarts/chart/bar'],
            this.proxy(function (ec) {
            	var ecConfig = require('echarts/config');
            	var timer1 = null;
                var a = 0;
                var sendData = null;
                var length = option.legend.data.length;
                var height = null;
                var width =$('#main11').width();
                if(width < 500){
                	if(length < 4){
                		height = 100;
                	}else{
                		height = parseInt(length/2.5*30);
                	}
                }else if(width > 500 && width < 800){
                	if(length < 6){
                		height = 100;
                	}else{
                		height = parseInt(length/4*30);
                	}
                }else{
                	height = parseInt(length/6*30);
                }
                var height2 = height+300;
                height = height+100;
                if(length <= 2){
                	height = '50%';
        			height2 = 200;
                }
                option.series[0].center = ['50%', height];
				var index = this._method.indexOf(param.method)+1;
				$('#main'+index+'1').css({"height":height2+'px'});
                $('#main'+index+'1_bar').css({"height":height2+'px'});
            	myChart = ec.init(document.getElementById('main'+index+'1'));
            	myChart.setOption(option);
            	myChart3 = ec.init(document.getElementById('main'+index+'1_bar'));
            	myChart3.setOption(option3);
            	myChart2 = ec.init(document.getElementById('main'+index+'2'));
				$('div[umid=sr'+index+'1]').empty();
            	myChart2.clear();
				 var c2 = this.proxy(function(){
    				clearTimeout(timer1);
					var id = parseInt(sendData.data.id);
        			var name = sendData.data.name;
					var x = sendData.event.clientX;
        			var y = sendData.event.clientY;
    				if(a===1){
    					this.setLine(id,name,"other");
    				}else if(a===2){
    					this.threadDBCLK(x,y,id,name,"no");
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
		var module1 = new com.sms.dashfilter.filter($("div[umid=sr"+index+"1]"), query);
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
						require(['echarts', 'echarts/chart/line'],
				            this.proxy(function (ec) {
								var myChart2 = null;
								var id = "main"+(index+1)+"2";
								var ecConfig = require('echarts/config');
								myChart2 = ec.init(document.getElementById(id));
			            		var option2 = this._line();
								data.data && $.each(data.data, this.proxy(function(key, item){
									option2.legend.data.push(item.name);
									option2.series.push({
										name:item.name,
							            type:'line',
							            data:item.value
									});
			                	}));
			            		data.timeline = $.map(data.timeline, function(k,v){
			            			return k.substring(0,7);
			            		})
			            		option2.xAxis[0].data = data.timeline;
			            		myChart2.clear();
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
    threadDBCLK : function(x,y,id,name){
    	var rightMenuContent = $("#rightMenuContent");
		rightMenuContent.empty();
		$('<div class="zxt" data-id="'+id+'" data-name="'+name+'">显示折线图</div>'
		 +'<div class="hkaqxx" data-id="'+id+'" data-name="'+name+'">查看安全信息</div>'
		 +'<div class="baqztpm" data-id="'+id+'" data-name="'+name+'">查看不安全状态排名</div>')
		 .appendTo(rightMenuContent);
		rightMenuContent.css({left:x + "px", top:y + "px"}).slideDown("fast");
		$("body").off("mousedown").on("mousedown", this.proxy(this.onBodyDown));
		rightMenuContent.off("mouseover mouseout").on({"mouseover":function(e){
			$(e.target).css("background-color","#B51E6E");
		},"mouseout":function(e){
			$(e.target).css("background-color","");
		}});
		$("div.zxt").off("click").on("click",this.proxy(this.zxt));
		$("div.hkaqxx").off("click").on("click",this.proxy(this.hkaqxx));
		$("div.baqztpm").off("click").on("click",this.proxy(this.baqztpm));
    },
    onBodyDown : function(e){
    	if (!(e.target.id == "rightMenuContent" || $(e.target).parents("#rightMenuContent").length>0)) {
			this.hideMenu();
		}
    },
    hideMenu : function(){
    	var rightMenuContent = $("#rightMenuContent");
		rightMenuContent.fadeOut("fast").empty();
		$("body").off("mousedown", this.proxy(this.onBodyDown));
    },
    zxt : function(e){
	    var id = $(e.currentTarget).attr("data-id");
    	var name = $(e.currentTarget).attr("data-name");
    	this.line(id,name,"other");
    },
    hkaqxx : function(e){
	    var id = parseInt($(e.currentTarget).attr("data-id"));
    	var name = $(e.currentTarget).attr("data-name");
    	var query = this._setQuery(id,name,"no");
		query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("aviationSafetyInfo.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
		window.open("aviationSafetyInfo.html?filter=" + query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("aviationSafetyInfo.html?filter=" + query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("aviationSafetyInfo.html?filter=" + query);
			}
		//window.open("aviationSafetyInfo.html?filter="+query);
    },
    baqztpm : function(e){
	    var id = parseInt($(e.currentTarget).attr("data-id"));
    	var name = $(e.currentTarget).attr("data-name");
    	var query = this._setQuery(id,name,"no");
		query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("unSafeRank.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
			window.open("unSafeRank.html?filter="+query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("unSafeRank.html?filter="+query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("unSafeRank.html?filter="+query);
			}
		//window.open("unSafeRank.html?filter="+query);
    },
	_pie : function(){
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
		            mark : {show: false},
		            dataView : {show: true, readOnly: true},
		            magicType : {
		                show: false, 
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
		        data:[]
		    },
		    calculable : true,
		    series : [
		        {
		            name:'风险值',
		            type:'pie',
		            radius : '55%',
		            center: ['50%', 225],
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
		    	x2 : 40
		    		
		    },
		    xAxis : [
		        {
		            type : 'value',
		            name : '风险值'
		        }
		    ],
		    yAxis : [
		        {
		            type : 'category',
		            data : [],
		            axisLabel: {
		            	formatter: function(value){
		            		return value.substring(0,15) + ((value.length > 15) ? '...' : '');
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

		    },
		    tooltip : {
		        trigger: 'axis'
		    },
			legend: {
		        data:[]
		    },
		    calculable : false,
		    grid : {
  		    	x:40,
  		    	x2:40
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

com.sms.dash.errorThread.widgetjs = [  '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js',
										'../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js',
										'echarts/js/echarts.js'
									 ];
com.sms.dash.errorThread.widgetcss = [];