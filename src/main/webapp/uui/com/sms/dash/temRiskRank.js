// @ sourceURL=com.sms.dash.temRiskRank
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.temRiskRank', null, {
	init : function(option) {
		var op = window.decodeURIComponent(window.decodeURIComponent(option.filter));
		this._options = $.parseJSON(op);
		this._tabName = ["com/sms/dash/temRiskRank#0"];
		this._method = ["getConsequenceByInsecurity"];
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
				this.param = param;
				this.setLine(data);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    setLine : function(data){
		var option = this._option();
		data.data && $.each(data.data, this.proxy(function(key, item){
			option.yAxis[0].data.push(item.name);
			option.series[0].data.push(item.value);
    	}));
		require(['echarts', 'echarts/chart/bar'],this.proxy(function (ec) {
    		var myChart = ec.init(document.getElementById('temrank'));
    		myChart.setOption(option);
			var ecConfig = require('echarts/config');
			var $this = this;
			myChart.on(ecConfig.EVENT.DBLCLICK, function(param) {
     			var id = param.data.id;
				var name = param.data.name;
				var date = "no";
				var x = param.event.clientX+10;
				var y = param.event.clientY+10;
				$this.dbclick(x,y,id,name,date);
     		});
        }));
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
    					}else if(date == "no"){
							
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
					}else if(date == "no"){
							
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
	dbclick : function(x,y,id,name,date){
    	var rightMenuContent = $("#rightMenuContent");
		rightMenuContent.empty();
		$('<div class="hkaqxx" data-id="'+id+'" data-name="'+name+'" data-date="'+date+'">查看安全信息</div>')
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
    },
	_option : function(){
		return {
		    title : {
		    },
		    backgroundColor : 'white',
		    tooltip : {
		        trigger: 'axis'
		    },
		    toolbox: {
		        show : true,
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
		    xAxis : [
		        {
		            type : 'value',
		            name : '风险值',
		            boundaryGap : [0, 0.01]
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
		            name:'风险排行',
		            type:'bar',
		            data:[]
		        }
		    ]
		};
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.temRiskRank.widgetjs = [  '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js',
										'../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js',
										'echarts/js/echarts.js'
									 ];
com.sms.dash.temRiskRank.widgetcss = [];