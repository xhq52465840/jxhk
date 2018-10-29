// @ sourceURL=com.sms.dash.unSafeRank
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.unSafeRank', null, {
	init : function(option) {
		var op = window.decodeURIComponent(window.decodeURIComponent(option.filter));
		this._options = $.parseJSON(op);
		this._tabName = ["com/sms/dash/unSafeRank#0"];
		this._method = ["getInsecurityPie"];
		this._lineMethod = ["getInsecurityLine"];
		require.config({paths : {echarts : './echarts/js'}});
	},
	afterrender : function(bodystr) {
		this.getDisplayFilter();
	},
	getDisplayFilter : function(index){
    	index = 0;
		var module = new com.sms.dashfilter.filter($("div[umid='sr"+index+"']", this.$), {"op":this._options,"md":this._tabName[index]});
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
    _loadData : function(param){
    	$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : $.extend({
				"tokenid" : $.cookie("tokenid")
			}, param)
		},this.qid("div_content")).done(this.proxy(function(data) {
			if (data.success) {
				this._setData(data,param);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _setData : function(data,param){
    	this.param = param;
		var	option = this._pie();
        var option3 = this._bar();
		data.data && $.each(data.data, this.proxy(function(key, item){
			option.legend.data.push(item.name);
			if(item.mark){
				option.legend.selected[item.name]= true;
			}else{
				option.legend.selected[item.name]= false;
			}
			option.series[0].data.push(item);
			option3.yAxis[0].data.push(item.name);
			option3.series[0].data.push(item);
    	}));
		var length = option.legend.data.length;
        var height = null;
        var width =$('#unSafeRank').width();
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
		$('#unSafeRank').css({"height":height2+'px'});
        $('#unSafeRank_bar').css({"height":height2+'px'});
		this._setOp(option, option3);
    },
	_setOp : function(option, option3){
		var timer = null;
	    var a = 0;
	    var sendData = null;
	    var c2 = this.proxy(function(){
			clearTimeout(timer);
			var id = sendData.data.id;
            var name = sendData.data.name;
			if(a===1){
				this.setLine(id, name, "other");
			}else if(a===2){
				var x = sendData.event.clientX+10;
				var y = sendData.event.clientY+10;
				this.DBCLK1(x,y,id,name,"no");
			}else if(a>2){
				
			}
			a = 0;
		});
		require(['echarts', 'echarts/chart/pie','echarts/chart/funnel','echarts/chart/bar'],
            this.proxy(function (ec) {
            	var ecConfig = require('echarts/config');
        		var	myChart = ec.init(document.getElementById('unSafeRank'));
            	var myChart2 = ec.init(document.getElementById('unSafeRank2'));
            	var myChart3 = ec.init(document.getElementById('unSafeRank_bar'));
				$('div[umid=sr01]').empty();
                myChart2.clear();
                myChart.on(ecConfig.EVENT.CLICK, this.proxy(function(param) {
					sendData = param;
	     			a++;
	     	        timer = setTimeout(c2, 600);
    			}));
                myChart3.on(ecConfig.EVENT.CLICK, this.proxy(function(param) {
					sendData = param;
	     			a++;
	     	        timer = setTimeout(c2, 600);
    			}));
                myChart.setOption(option);
                myChart3.setOption(option3);
            })
        );
	},
    setLine : function(id,name,date){
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
							var myChart2 = ec.init(document.getElementById('unSafeRank2'));
		            		var option2 = this._line();
							var ecConfig = require('echarts/config');
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
	DBCLK1 : function(x,y,id,name,date){
    	var rightMenuContent = $("#rightMenuContent");
		rightMenuContent.empty();
		$('<div class="zxt" data-id="'+id+'" data-name="'+name+'" data-date="'+date+'">查看折线图</div>'
		 +'<div class="hkaqxx" data-id="'+id+'" data-name="'+name+'" data-date="'+date+'">查看安全信息</div>')
			.appendTo(rightMenuContent);
		x = (x > 100 ? x - 100 : 0);
		rightMenuContent.css({left:x + "px", top:y + "px"}).slideDown("fast");
		$("body").off("mousedown").on("mousedown", this.proxy(this.onBodyDown));
		rightMenuContent.off("mouseover mouseout").on({"mouseover":function(e){
			$(e.target).css("background-color","#B51E6E");
		},"mouseout":function(e){
			$(e.target).css("background-color","");
		}});
		$("div.hkaqxx").off("click").on("click",this.proxy(this.hkaqxx));
		$("div.zxt").off("click").on("click",this.proxy(this.zxt));
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
    hkaqxx : function(e){
	    var id = parseInt($(e.currentTarget).attr("data-id"));
    	var name = $(e.currentTarget).attr("data-name");
		var date = $(e.currentTarget).attr("data-date");
    	var query = this._setQuery(id,name,date);
		query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){//edge流浪器
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
	zxt : function(e){
    	var id = $(e.currentTarget).attr("data-id");
     	var name = $(e.currentTarget).attr("data-name");
     	this.setLine(id, name, "other");
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
		    legend: {
		        orient : 'horizontal',
		        x : 'center',
		        y : 'top',
		        data:[],
		        selected:{}
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
		    calculable : true,
		    series : [
		        {
		            name:'不安全状态排行',
		            type:'pie',
		            radius : '40%',
		            center: ['50%', 265],
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
		            name:'不安全状态排行',
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
		    	x:80,
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

com.sms.dash.unSafeRank.widgetjs = [  '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js',
										'../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js',
										'echarts/js/echarts.js'
									 ];
com.sms.dash.unSafeRank.widgetcss = [];