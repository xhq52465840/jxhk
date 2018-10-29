// @ sourceURL=com.sms.dash.staffReport
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.staffReport', null, {
	init: function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._options = {};
	},
	afterrender: function(bodystr) {
		this.getDisplayFilter();
	},
	getDisplayFilter: function() {
		var module = new com.sms.dashfilter.filter($("div[umid='sr']", this.$), "com/sms/dash/staffReport#0");
		module.override({
			loadData: this.proxy(function(param, other, index, otherType) {
				this._loadData({
					"method": "getEventEmpReport",
					"query": param
				});
				this._userFilter = other;
				this._userFilterType = otherType.split(",");
			})
		});
		module._start();
	},
	_loadData: function(param) {
		this.param = param;
		$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			dataType: "json",
			type: "post",
			data: $.extend({
				"tokenid": $.cookie("tokenid")
			}, param)
		}, this.$).done(this.proxy(function(data) {
			if (data.success) {
				if (window.parent.resizeGadget) {
					window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
				}
				this._setData(data);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	_setData: function(data) {
		var option = this._setOption(data);
		this.setOperate(option);
	},
	setOperate: function(option) {
		var timer = null;
		var a = 0;
		var sendData = null;
		var c2 = this.proxy(function() {
			clearTimeout(timer);
			var x = sendData.event.clientX;
			var y = sendData.event.clientY;
			var id = sendData.series.id;
			var name = sendData.series.rname;
			var date = sendData.name;
			if (a === 1) {
				this._click(id, name, date);
			} else if (a === 2) {
				this._dbclick(x, y, id, name, date);
			} else if (a > 2) {

			}
			a = 0;
		});
		require.config({
			paths: {
				echarts: './echarts/js'
			}
		});
		require(['echarts', 'echarts/chart/line'],
			this.proxy(function(ec) {
				var myChart = ec.init(document.getElementById('staffReport'));
				var ecConfig = require('echarts/config');
				myChart.on(ecConfig.EVENT.CLICK, function(param) {
					sendData = param;
					sendData.series = this.getSeries()[param.seriesIndex];
					a++;
					timer = setTimeout(c2, 600);
				});
				myChart.setOption(option);
			})
		)
	},
	_setQuery: function(id, name, date) {
		var filter = $.parseJSON(this.param.query);
		var len = filter.length;
		var query = filter.slice(0);
		this._userFilter && $.each(this._userFilter, this.proxy(function(k, v) {
			var flag = true;
			var datatype = this._userFilterType[k];
			for (var i = 0; i < len; i++) {
				var propid = filter[i].propid;
				if (v.propid == propid) {
					if (v.propplugin.indexOf("dateProp") > -1) {
						if (date == "other") {
							query.splice(i, 1, this.time2(v));
						} else {
							query.splice(i, 1, this.time(date, v));
						}
					} else {
						v.propshow = name == "全部" ? "" : name;
						if (datatype == "id") {
							v.propvalue = name == "全部" ? [] : [{
								"id": id,
								"name": name
							}];
						} else if (datatype == "name") {
							v.propvalue = name == "全部" ? [] : [{
								"id": name,
								"name": name
							}];
						}
						query.splice(i, 1, v);
					}
					flag = false;
					break;
				}
			}
			if (flag) {
				if (v.propplugin.indexOf("dateProp") > -1) {
					if (date == "other") {
						query.splice(i, 1, this.time2(v));
					} else {
						query.splice(i, 1, this.time(date, v));
					}
				} else {
					v.propshow = name == "全部" ? "" : name;
					if (datatype == "id") {
						v.propvalue = name == "全部" ? [] : [{
							"id": id,
							"name": name
						}];
					} else if (datatype == "name") {
						v.propvalue = name == "全部" ? [] : [{
							"id": name,
							"name": name
						}];
					}
					v.type = "static";
					query.splice(query.length + 1, 1, v);
				}
			}
		}))
		query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
		return query;
	},
	_click: function(id, name, date) {
		var query = null;
		query = this._setQuery(id, name, date);
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("staffReportUnit.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
			window.open("staffReportUnit.html?filter=" + query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("staffReportUnit.html?filter=" + query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("staffReportUnit.html?filter=" + query);
			}
		//window.open("staffReportUnit.html?filter=" + query);
	},
	_dbclick: function(x, y, id, name, date) {
		var rightMenuContent = $("#rightMenuContent");
		var top=rightMenuContent.offset().top;
		var dashboardItemContentOffset = this.$.closest('.dashboard-item-content').offset() || {};
		rightMenuContent.empty();
		$('<div class="hkaqxx" data-id="' + id + '" data-name="' + name + '" data-date="' + date + '">查看安全信息</div>' + '<div class="qtwd" data-id="' + id + '" data-name="' + name + '" data-date="' + date + '">查看其他维度</div>')
			.appendTo(rightMenuContent);
		//x = (x > 100 ? x - 100 : 0);
		x = x - dashboardItemContentOffset.left;
		y = y - dashboardItemContentOffset.top;
		rightMenuContent.css({left:x + "px", top:dashboardItemContentOffset.top-this.$.height() + "px"}).slideDown("fast");
		$("body").off("mousedown").on("mousedown", this.proxy(this.onBodyDown));
		rightMenuContent.off("mouseover mouseout").on({
			"mouseover": function(e) {
				$(e.target).css("background-color", "#B51E6E");
			},
			"mouseout": function(e) {
				$(e.target).css("background-color", "");
			}
		})
		$("div.hkaqxx").off("click").on("click", this.proxy(this.hkaqxx));
		$("div.qtwd").off("click").on("click", this.proxy(this.qtwd));
	},
	onBodyDown: function(e) {
		if (!(e.target.id == "rightMenuContent" || $(e.target).parents("#rightMenuContent").length > 0)) {
			this.hideMenu();
		}
	},
	hideMenu: function() {
		var rightMenuContent = $("#rightMenuContent");
		rightMenuContent.empty();
		rightMenuContent.fadeOut("fast");
		$("body").off("mousedown", this.proxy(this.onBodyDown));
	},
	time: function(param, plugin) {
		var time = param.split("-");
		var year = parseInt(time[0]);
		var nyear = year;
		var month = parseInt(time[1]);
		var nMonth = month + 1;
		if (month <= 9) {
			month = "0" + month;
		}
		if (nMonth <= 9) {
			nMonth = "0" + nMonth;
		} else if (nMonth == 13) {
			nMonth = "01";
			nyear = nyear + 1;
		}
		var startDate = year + "-" + month + "-01";
		var endDate = nyear + "-" + nMonth + "-01";
		var endDateId =endDate;
		var time_a = Date.parse(new Date(endDate));// @program将时间格式转换为时间戳,js获取时间戳单位为ms
		var time_b = time_a-(24*60*60*1000);      //@将时间向前推一天
		var newDate = new Date();                //@获取时间格式
		    newDate.setTime(time_b);            //@把时间
	   var time_c = newDate.toISOString();     //@最后把时间复制过来
	       endDate = time_c.substring(0,10);
		var propshow = startDate + " 至 " + endDate;
		var propvalue = [{
			"id": "[" + startDate + "T00:00:00Z TO " + endDateId + "T00:00:00Z }",
			"startDate": startDate,
			"endDate": endDate
		}];
		plugin.propshow = propshow;
		plugin.propvalue = propvalue;
		plugin.type = "static";
		return plugin;
	},
	time2: function(plugin) {
		plugin.propshow = "最近12个月";
		plugin.propvalue = [{
			"id": "last12Months()",
			"name": "最近12个月",
			"type": "last12Months"
		}];
		plugin.type = "static";
		return plugin;
	},
	hkaqxx: function(e) {
		var query = [];
		var id = $(e.currentTarget).attr("data-id");
		var name = $(e.currentTarget).attr("data-name");
		var date = $(e.currentTarget).attr("data-date");
		query = this._setQuery(id, name, date);
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
	qtwd: function(e) {
		var id = $(e.currentTarget).attr("data-id");
		var name = $(e.currentTarget).attr("data-name");
		var date = $(e.currentTarget).attr("data-date");
		this._click(id, name, date);
	},
	_setOption: function(data) {
		var option = {
			backgroundColor: 'white',
			title: {
				text: '',
				subtext: ''
			},
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: ["报告率"],
				selected: {}
			},
			toolbox: {
				show: true,
				x: 'right',
				y: 'center',
				orient: 'vertical',
				feature: {
					mark: {
						show: true
					},
					dataView: {
						show: true,
						readOnly: true
					},
					restore: {
						show: true
					},
					saveAsImage: {
						show: true
					}
				}
			},
			calculable: false,
			xAxis: [{
				type: 'category',
				boundaryGap: false,
				axisLabel: {
					interval: 0
				},
				splitNumber: 12,
				data: []
			}],
			grid: {
				y: ''
			},
			yAxis: [{
				type: 'value',
				name: '',
				axisLabel: {
					formatter: '{value}'
				}
			}],
			series: []
		};
		data.data && $.each(data.data, this.proxy(function(k, v) {
			option.legend.data.push(v.count);
			if (v.mark) {
				option.legend.selected[v.count] = true;
			} else {
				option.legend.selected[v.count] = false;
			}
			option.series.push({
				name: v.count,
				type: 'line',
				data: v.value,
				id: v.id,
				itemStyle: {
	            	 normal: { 
			            label : {
	                        show : true,
	                        textStyle : {
	                            fontSize : '15',
	                            fontFamily : '微软雅黑',
	                            fontWeight : 'bold',
	                        }
	                    }
	            	 }
	               },
				rname: v.name
			});
			option.series.push({
				name: "报告率",
				type: 'line',
				data: v.rate,
				id: v.id,
				itemStyle: {
	            	 normal: { 
			            label : {
	                        show : true,
	                        textStyle : {
	                            fontSize : '12',
	                            fontFamily : '微软雅黑',
	                            fontWeight : 'bolder',
	                        }
	                    }
	            	 }
	               },
				rname: v.name
			});
		}));
		data.timeline = $.map(data.timeline, function(k, v) {
			return k.substring(0, 7);
		})
		option.xAxis[0].data = data.timeline;
		redataline=function(){
			if(data.timeline.length<=12){
				return 0;
			}else{
				return Math.floor(((data.timeline.length)/12));
			} 
		};
		option.xAxis[0].axisLabel.interval=redataline();
		var length = option.legend.data.length;
		var height = null;
		var width = $('#staffReport').width();
		if (width < 1024) {
			if (length < 6) {
				height = 100;
			} else {
				height = parseInt(length / 5 * 30);
			}
		} else if (width > 1024 && width < 1700) {
			if (length < 16) {
				height = 100;
			} else {
				height = parseInt(length / 16 * 30);
			}
		} else {
			height = parseInt(length / 22 * 30);
		}
		option.grid.y = height;
		return option;
	},
	destroy: function() {
		this._super();
	}
}, {
	usehtm: true,
	usei18n: false
});

com.sms.dash.staffReport.widgetjs = ['../../../uui/widget/spin/spin.js',
	'../../../uui/widget/jqblockui/jquery.blockUI.js',
	'../../../uui/widget/ajax/layoutajax.js',
	'../../../uui/widget/jqurl/jqurl.js',
	'echarts/js/echarts.js'
];
com.sms.dash.staffReport.widgetcss = [];