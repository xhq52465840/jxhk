//@ sourceURL=com.sms.dash.unsafeIncidents
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.unsafeIncidents', null, {
	init : function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
        this._tabName = ["com/sms/dash/unsafeIncidents#0","com/sms/dash/unsafeIncidents#1"];
        this._method = ["getEventBySystem", "getSeverityByFliter"];
		require.config({paths : {echarts : './echarts/js'}});
        this._options = {};
	},
	afterrender : function(bodystr) {
		this.getDisplayFilter();
		$('ul.nav-tabs>li',this.$).on("click",this.proxy(this._liActive));
	},
    getDisplayFilter : function(index){
    	if(typeof index == "undefined"){
    		index = $('li.active').index();
    	}
		var module = new com.sms.dashfilter.filter($("div[umid='sr"+index+"']", this.$), this._tabName[index]);
		if(index == 1){
			var $staticul = $(".search-criteria",$("div[umid='sr"+index+"']")).children().first();
	        $('<li><select class="form-control rate_count">'
	     		  +'<option value="count">次数</option><option value="rate">万时率</option>'
	     		  +'</select></li>').appendTo($staticul);
		}
		module.override({
			loadData:this.proxy(function(param,other,index,otherType){
                if(index==1){
                    this._loadData({
        				"method": this._method[index],
                        "symbol": $('.rate_count').val(),
        	     		"query":param
        			});
                }else{
                    this._loadData({
        				"method": this._method[index],
        	     		"query":param
        			});
                }
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
		}).done(this.proxy(function(data) {
			if (data.success) {
				if (window.parent.resizeGadget) {
					window.parent.resizeGadget(this._gadgetsinstanceid, '520px');
				}
				this._setData(data,param);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _setData : function(data,param){
    	var method = param.method, myChart = null;
    	this.param = param;
    	var rate_count = "个数";
    	param.symbol && (param.symbol=="rate") && (rate_count = "万时率(%)");
    	var option = this._option(rate_count);
		data.data && $.each(data.data, this.proxy(function(k,v){
			option.legend.data.push(v.count);
			if(v.mark){
				option.legend.selected[v.count]= true;
			}else{
				option.legend.selected[v.count]= false;
			}
			option.series.push({
	            name:v.count,
	            type:'line',
	            data:v.value,
	            id:v.id,
	            rname: v.name
			});
		}));
		data.timeline = $.map(data.timeline, function(k,v){
			return k.substring(0,7);
		});
		option.xAxis[0].data = data.timeline;
		require(['echarts', 'echarts/chart/line'],
            this.proxy(function (ec) {
            	var ecConfig = require('echarts/config');
            	var $this = this;
            	var timer1 = null;
                var a = 0;
                var sendData = null;
                var length = option.legend.data.length;
                var height = null;
                var width =$('#main11').width();
                if(width < 1024){
                	if(length < 8){
                		height = 100;
                	}else{
                		height = parseInt(length/5*30);
                	}
                }else if(width > 1024 && width < 1700){
                	if(length < 16){
                		height = 100;
                	}else{
                		height = parseInt(length/16*30);
                	}
                }else{
                	height = parseInt(length/22*30);
                }
                option.grid.y = height;
	            switch(method){
	            	case $this._method[0]:
	                	myChart = ec.init(document.getElementById('main11'));
	                	myChart.setOption(option);
	            		break;
	            	case $this._method[1]:
	            		myChart = ec.init(document.getElementById('main21'));
	            		myChart.setOption(option);
	        			break;
	            }
	            var c2 = this.proxy(function(){
    				clearTimeout(timer1);
    				var x = sendData.event.pageX;
					var y = sendData.event.pageY;
					var id = sendData.series[sendData.seriesIndex].id;
					var date = sendData.name;
					var name = sendData.series[sendData.seriesIndex].rname;
    				if(a===1){
    					this.CLK1(id, name,date);
    				}else if(a===2){
    					$this._click(x,y,id,name,date);
    				}else if(a>2){
    					
    				}
    				a = 0;
    			});
                myChart.on(ecConfig.EVENT.CLICK, function(param) {
                	param.series = this.getSeries();
    				sendData = param;
    				a++;
                    timer1 = setTimeout(c2, 600);
    			});
				myChart.on(ecConfig.EVENT.HOVER, function(param) {
					$('.echarts-tooltip').empty().text(param.seriesName+":"+param.value);
	        		return false;
	     		});
            })
        )
    },
    _setQuery : function(id,name,date){
    	var filter = $.parseJSON(this.param.query);
    	var len = filter.length;
    	var query = filter.slice(0);
    	this._userFilter && $.each(this._userFilter, this.proxy(function(k,v){
    		var flag = true;
			v.type = "static";
			var datatype = this._userFilterType[k];
    		for(var i = 0; i < len; i++){
    			var propid = filter[i].propid;
    			if(v.propid == propid){
    				if(v.propplugin.indexOf("dateProp") > -1){
    					if(date=="other"){
    						query.splice(i,1,this.time2(v));
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
	    query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
    	return query; 
    },
    CLK1 : function(id, name,date){
    	var query = this._setQuery(id,name,date);
    	var agent = navigator.userAgent.toLowerCase();
    	if(agent.indexOf("edge") > 0){//edge流浪器
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("unsafe.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
			window.open("unsafe.html?filter="+query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("unsafe.html?filter="+query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("unsafe.html?filter="+query);
			}
		//window.open("unsafe.html?filter="+query);
    },
    _click : function(x,y,id,name,date){
    	var rightMenuContent = $("#rightMenuContent");
    	var dashboardItemContentOffset = this.$.closest('.dashboard-item-content').offset() || {};
		rightMenuContent.empty();
		$('<div class="hkaqxx" data-id="'+id+'" data-name="'+name+'" data-date="'+date+'">查看安全信息</div>'
		 +'<div class="baqsj" data-id="'+id+'" data-name="'+name+'" data-date="'+date+'">查看其他维度</div>')
		 .appendTo(rightMenuContent);
		//x = (x > 100 ? x - 100 : 0);
		x = x - dashboardItemContentOffset.left;
		y = y - dashboardItemContentOffset.top;
		rightMenuContent.css({left:x + "px", top:y + "px"}).slideDown("fast");
		$("body").off("mousedown").on("mousedown", this.proxy(this.onBodyDown));
		rightMenuContent.off("mouseover mouseout").on({"mouseover":function(e){
			$(e.target).css("background-color","#B51E6E");
		},"mouseout":function(e){
			$(e.target).css("background-color","");
		}});
		$("div.hkaqxx").off("click").on("click",this.proxy(this.hkaqxx));
		$("div.baqsj").off("click").on("click",this.proxy(this.baqsj));
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
    time : function(param,plugin){
    	var time = param.split("-");
    	var year = parseInt(time[0]);
    	var nyear = year;
    	var month = parseInt(time[1]);
    	var nMonth = month + 1;
    	if (month <= 9){
    		month = "0" + month;
        }
    	if(nMonth <=9 ){
    		nMonth = "0" + nMonth;
    	}else if(nMonth==13){
    		nMonth = "01";
        	nyear = nyear+1;	
    	}
    	var startDate = year + "-" + month + "-01";
        var endDate = nyear + "-" + nMonth + "-01";
        var propshow = startDate + " 至 " + endDate;
    	var propvalue = [{ "id": "[" + startDate + "T00:00:00Z TO " + endDate + "T00:00:00Z }", "startDate": startDate, "endDate": endDate }];
    	plugin.propshow = propshow;
    	plugin.propvalue = propvalue;
		plugin.type = "static";
    	return plugin;
    },
    hkaqxx : function(e){
    	var query = null;
        var id = $(e.currentTarget).attr("data-id");
    	var name = $(e.currentTarget).attr("data-name");
    	var date = $(e.currentTarget).attr("data-date");
        query = this._setQuery(id,name,date);
        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf("edge") > 0){//edge流浪器
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
    baqsj : function(e){
    	var query = null;
	    var id = $(e.currentTarget).attr("data-id");
    	var name = $(e.currentTarget).attr("data-name");
    	var date = $(e.currentTarget).attr("data-date");
    	query = this._setQuery(id,name,date);
    	 var agent = navigator.userAgent.toLowerCase();
 		if(agent.indexOf("chrome") > 0){
 			window.open("unsafe.html?filter="+query);
 		}else if(agent.indexOf("msie") > 0){
 			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
 			query=JSON.stringify(query);
 			window.open("unsafe.html?filter="+query);
 			}else{
 				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
 				query=JSON.stringify(query);
 				window.open("unsafe.html?filter="+query);
 			}
		//window.open("unsafe.html?filter="+query);
    },
    _option : function(rate_count){
        return {
			backgroundColor : 'white',
		    title : {
		        text: '',
		        subtext: ''
		    },
		    tooltip : {
		        trigger: 'axis'
		    },
		    legend: {
		        data:[],
		        selected :{}
		    },
		    grid : {
  		    	y:''
  		    },
		    toolbox: {
		        show : true,
		        x : 'right',
  		        y : 'center',
  		        orient : 'vertical',
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: true},
		            magicType : {show: true, type: ['line']},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : false,
		    xAxis : [
		        {
		            type : 'category',
		            boundaryGap : false,
		            axisLabel : {
		            	interval : 0
		            },
		            splitNumber : 12,
		            data : []
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value',
		            name : rate_count,
		            axisLabel : {
		                formatter: '{value}'
		            }
		        }
		    ],
		    series : [
		    ]
		};
    },
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.unsafeIncidents.widgetjs = [  '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js',
										'../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js',
										'echarts/js/echarts.js'
									 ];
com.sms.dash.unsafeIncidents.widgetcss = [];