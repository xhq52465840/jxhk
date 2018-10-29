//@ sourceURL='com.sms.dash.tem'
$.u.load("com.sms.dashfilter.filter");
$.u.define('com.sms.dash.tem', null, {
	init: function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._tabName = ["com/sms/dash/tem#0", "com/sms/dash/tem#1", "com/sms/dash/tem#2", "com/sms/dash/tem#3"];
		this._method = ["getConsequenceRadar", "getConsequenceLine", "getConsequenceByInsecurity", "getInsecurityPie"];
		require.config({
			paths: {
				echarts: './echarts/js'
			}
		});
		this._options = {};
		this.show_8_10 = null;
	},
	afterrender: function(bodystr) {
		this.getDisplayFilter();
		$('ul.nav-tabs>li', this.$).on("click", this.proxy(this._liActive));
		this.showEight = this.qid("showEight");
		this.showEight.click(this.proxy(this.show_8));
		this.showAll = this.qid("showAll");
		this.showAll.click(this.proxy(this.show_0));
	},
	getDisplayFilter: function(index) {
		if (typeof index == "undefined") {
			index = $('li.active').index();
		}
		this.moduleFilter = new com.sms.dashfilter.filter($("div[umid='sr" + index + "']", this.$), this._tabName[index]);
		this.moduleFilter.override({
			loadData: this.proxy(function(param, other, index, otherType) {
				this._loadData({
					"method": this._method[index],
					"query": param
				});
				this._userFilter = other;
				this._userFilterType = otherType.split(",");
			})
		});
		this.moduleFilter._start();
	},
	_liActive: function(e) {
		var active = $(e.target).parent().hasClass('active');
		if (!active) {
			var index = $(e.target).parent().index();
			this.getDisplayFilter(index);
		}
	},
	_loadData: function(param) {
		$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			dataType: "json",
			type: "post",
			data: $.extend({
				"tokenid": $.cookie("tokenid")
			}, param)
		}, this.$).done(this.proxy(function(data) {
			if (data.success) {
				this._setData(data, param);
				if (window.parent.resizeGadget) {
					window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
				}
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	_setData: function(data, param) {
		this.param = param;
		var option = null;
		var tempName = '';
		switch (param.method) {
			case this._method[0]:
				 option = this._radar();
				 data.data.sort(function(x, y){
				 	return x.value > y.value;
				 })
				data.data && $.each(data.data, this.proxy(function(key, item) {
					option.polar[0].indicator.push({
						text: item.name,
						max: item.max
					});
					option.series[0].data[0].value.push(item.value);
					option.series[0].data[0].id.push(item.id);
					option.series[0].data[0].show.push(item.showValue);
				}));
				this.setOperate1(option);
				break;
			case this._method[1]:
				option = this._line();
				data.data && $.each(data.data, this.proxy(function(key, item) {
					option.legend.data.push(item.name);
					if (item.mark) {
						option.legend.selected[item.name] = true;
					} else {
						option.legend.selected[item.name] = false;
					}
					option.series.push({
						name: item.name,
						type: 'line',
						id: item.id,
						data: item.value
					});
				}));
				data.timeline = $.map(data.timeline, function(k, v) {
					return k.substring(0, 7);
				})
				option.xAxis[0].data = data.timeline;
				var length = option.legend.data.length;
				var height = null;
				var width = $('#tem_line').width();
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
				this.setOperate2(option);
				break;
			case this._method[2]:
				option = this._bar();
				data.data && $.each(data.data, this.proxy(function(key, item) {
					tempName = item.name && item.name.length > tempName.length ? item.name : tempName;
					option.yAxis[0].data.push(item.name);
					option.series[0].data.push(item.value);
					option.series[0].id.push(item.id);
				}));
				if(tempName.length > 0){
					tempName = $('<span/>').appendTo('body').text(tempName);
					if(tempName.width()<500){
						option.grid = {x:tempName.outerWidth(true)};
					}else{
						option.grid = {x:500};
					}
					
					tempName.remove();
				}
				this.setOperate3(option);
				break;
			case this._method[3]:
				option = this._funnel();
				var option2 = this._bar2();
				if (this.show_8_10 === 10) {
					
					data.alldata && $.each(data.alldata, this.proxy(function(key, item) {
						option.legend.data.push(item.name);
						if (item.mark) {
							option.legend.selected[item.name] = true;
						} else {
							option.legend.selected[item.name] = false;
						}
						option.series[0].data.push(item);
						option2.yAxis[0].data.push(item.name);
						option2.series[0].data.push(item);
					}));
				} else {
					data.data && $.each(data.data, this.proxy(function(key, item) {
						option.legend.data.push(item.name);
						if (item.mark) {
							option.legend.selected[item.name] = true;
						} else {
							option.legend.selected[item.name] = false;
						}
						option.series[0].data.push(item);
						option2.yAxis[0].data.push(item.name);
						option2.series[0].data.push(item);
					}));
				}
				var length = option.legend.data.length;
				var height = null;
				var width = $('#insecurity_line').width();
				if (width < 500) {
					if (length < 4) {
						height = 100;
					} else {
						height = parseInt(length / 1.5 * 30);
					}
				} else if (width > 500 && width < 800) {
					if (length < 6) {
						height = 100;
					} else {
						height = parseInt(length / 4 * 30);
					}
				} else {
					height = parseInt(length / 6 * 30);
				}
				var height2 = height + 300;
				option.series[0].center = ['50%', height + 100];
				$('#insecurity_line').css({
					"height": height2 + 'px'
				});
				$('#insecurity_bar').css({
					"height": height2 + 'px'
				});
				this.setOperate4(option, option2);
				break;
		}
	},
	show_8: function(e) {
		$("#insecurity_line2").hide();
		this.show_8_10 = 8;
		this.moduleFilter.on_btn_search_click();
	},
	show_0: function(e) {
		$("#insecurity_line2").hide();
		this.show_8_10 = 10;
		this.moduleFilter.on_btn_search_click();
	},
	setOperate1: function(option) {
		var timer = null;
		var a = 0;
		var sendData = null;
		var c2 = this.proxy(function() {
			clearTimeout(timer);
			var id = sendData.data.id[sendData.special];
			var name = sendData.name;
			var date = "no";
			if (a === 1) {
				this.CLK1(id, name, date);
			} else if (a === 2) {
				var x = sendData.event.clientX + 10;
				var y = sendData.event.clientY + 10;
				
				this.DBCLK1(x, y, id, name, date,event);
			} else if (a > 2) {

			}
			a = 0;
		});
		require(['echarts', 'echarts/chart/radar'],
			this.proxy(function(ec) {
				var myChart = ec.init(document.getElementById('tem_radar'));
				var ecConfig = require('echarts/config');
				myChart.on(ecConfig.EVENT.CLICK, function(param) {
					sendData = param;
					a++;
					timer = setTimeout(c2, 600);
				});
				myChart.setOption(option);
			})
		);
	},
	setOperate2: function(option) {
		var timer = null;
		var a = 0;
		var sendData = null;
		var c2 = this.proxy(function() {
			clearTimeout(timer);
			var id = sendData.Series[sendData.seriesIndex].id;
			var name = sendData.seriesName;
			var date = sendData.name;
			if (a === 1) {
				this.CLK1(id, name, date);
			} else if (a === 2) {
				var x = sendData.event.clientX + 10;
				var y = sendData.event.clientY + 10;
				this.DBCLK1(x, y, id, name, date,event);
			} else if (a > 2) {

			}
			a = 0;
		});
		require(['echarts', 'echarts/chart/line'], this.proxy(function(ec) {
			var myChart = ec.init(document.getElementById('tem_line'));
			var ecConfig = require('echarts/config');
			myChart.on(ecConfig.EVENT.CLICK, function(param) {
				param.Series = this.getSeries();
				sendData = param;
				a++;
				timer = setTimeout(c2, 600);
			});
			myChart.on(ecConfig.EVENT.HOVER, function(param) {
				$('.echarts-tooltip').empty().text(param.seriesName + ":" + param.value);
				return false;
			});
			myChart.setOption(option);
		}));
	},
	setOperate3: function(option) {
		require(['echarts', 'echarts/chart/bar'],
			this.proxy(function(ec) {
				var myChart = ec.init(document.getElementById('tem_row'));
				var ecConfig = require('echarts/config');
				var $this = this;
				myChart.on(ecConfig.EVENT.DBLCLICK, function(param) {
					param.Series = this.getSeries();
					var sendData = param;
					var index = sendData.dataIndex;
					var id = parseInt(sendData.Series[0]["id"][index]);
					var name = sendData.name;
					var x = sendData.event.clientX + 10;
					var y = sendData.event.clientY + 10;
					var date = "no";
					$this.DBCLK1(x, y, id, name, date,event);
				});
				myChart.setOption(option);
			})
		);
	},
	setOperate4: function(option, option2) {
		var timer = null;
		var a = 0;
		var sendData = null;
		var c2 = this.proxy(function() {
			clearTimeout(timer);
			var id = sendData.data.id;
			var name = sendData.data.name;
			var date = "no";
			if (a === 1) {
				var query = this._setQuery(id, name, "other");
				query = window.decodeURIComponent(window.decodeURIComponent(query));
				this._cInsecurity(query, name);
			} else if (a === 2) {
				var x = sendData.event.clientX + 10;
				var y = sendData.event.clientY + 10;
				this.DBCLK1(x, y, id, name, date,event);
			} else if (a > 2) {

			}
			a = 0;
		});
		require(['echarts', 'echarts/chart/bar', 'echarts/chart/pie', 'echarts/chart/funnel'], this.proxy(function(ec) {
			var myChart = ec.init(document.getElementById('insecurity_line'));
			var myChart2 = ec.init(document.getElementById('insecurity_bar'));
			var ecConfig = require('echarts/config');
			myChart.on(ecConfig.EVENT.CLICK, function(param) {
				sendData = param;
				a++;
				timer = setTimeout(c2, 600);
			});
			myChart2.on(ecConfig.EVENT.CLICK, function(param) {
				$("#insecurity_line2").show();
				sendData = param;
				a++;
				timer = setTimeout(c2, 600);
			});
			myChart.setOption(option);
			myChart2.setOption(option2);
			var myChart3 = ec.init(document.getElementById('insecurity_line2'));
			$('div[umid=srother]').empty();
			myChart3.clear();
		}));
	},
	_cInsecurity: function(query, name) {
		query = $.parseJSON(query);
		var module1 = new com.sms.dashfilter.filter($("div[umid='srother']", this.$), query);
		module1.override({
			loadData2: this.proxy(function(param) {
				$.u.ajax({
					url: $.u.config.constant.smsqueryserver,
					dataType: "json",
					type: "post",
					data: $.extend({
						"tokenid": $.cookie("tokenid")
					}, {
						"method": "getInsecurityLine",
						"query": param
					})
				}, this.$).done(this.proxy(function(data) {
					if (data.success) {
						if (window.parent.resizeGadget) {
							window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
						}
						require(['echarts', 'echarts/chart/line'], this.proxy(function(ec) {
							$("#insecurity_line2").css({
								"height": "380px"
							});
							var ecConfig = require('echarts/config');
							var myChart = ec.init(document.getElementById('insecurity_line2'));
							var option = this._ins();
							data.data && $.each(data.data, this.proxy(function(key, item) {
								option.series.push({
									name: item.name,
									type: 'line',
									data: item.value
								});
								option.legend.data.push(item.name);
							}));
							data.timeline = $.map(data.timeline, function(k, v) {
								return k.substring(0, 7);
							});
							option.xAxis[0].data = data.timeline;
							myChart.setOption(option);
							myChart.on(ecConfig.EVENT.HOVER, function(param) {
								$('.echarts-tooltip').empty().text(param.seriesName + ":" + param.value);
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
		var propshow = startDate + " 至 " + endDate;
		var propvalue = [{
			"id": "[" + startDate + "T00:00:00Z TO " + endDate + "T00:00:00Z }",
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
	_setQuery: function(id, name, date) {
		var filter = $.parseJSON(this.param.query);
		var len = filter.length;
		var query = filter.slice(0);
		this._userFilter && $.each(this._userFilter, this.proxy(function(k, v) {
			var flag = true;
			var datatype = this._userFilterType[k];
			v.type = "static";
			for (var i = 0; i < len; i++) {
				var propid = filter[i].propid;
				if (v.propid == propid) {
					if (v.propplugin.indexOf("dateProp") > -1) {
						if (date == "other") {
							query.splice(i, 1, this.time2(v));
						} else if (date == "no") {

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
					} else if (date == "no") {

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
					query.splice(query.length + 1, 1, v);
				}
			}
		}));
		query = window.encodeURIComponent(window.encodeURIComponent(JSON.stringify(query)));
		return query;
	},
	CLK1: function(id, name, date) {
		var query = null;
		query = this._setQuery(id, name, date);
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){//edge流浪器
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("insecurities1.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
			window.open("insecurities1.html?filter=" + query);
		}else if(agent.indexOf("msie") > 0 || agent.indexOf("Edge") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("insecurities1.html?filter=" + query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("insecurities1.html?filter=" + query);
			}
		//window.open("insecurities1.html?filter=" + query);
	},
	DBCLK1: function(x, y, id, name, date,event) {
		console.log(x,y);
		var rightMenuContent = $("#rightMenuContent");
		rightMenuContent.empty();
		var index = $('li.active').index();
		if (index == 3) {
			$('<div class="zxt" data-id="' + id + '" data-name="' + name + '" data-date="' + date + '">查看折线图</div>' + '<div class="hkaqxx" data-id="' + id + '" data-name="' + name + '" data-date="' + date + '">查看安全信息</div>' + '<div class="wxcc" data-id="' + id + '" data-name="' + name + '">查看威胁差错</div>')
				.appendTo(rightMenuContent);
		} else {
			$('<div class="hkaqxx" data-id="' + id + '" data-name="' + name + '" data-date="' + date + '">查看安全信息</div>' + '<div class="fxld" data-id="' + id + '" data-name="' + name + '" data-date="' + date + '">查看不安全状态</div>')
				.appendTo(rightMenuContent);
		}
		//x = (x > 100 ? x - 100 : 0);
		
		rightMenuContent.css({
			position:"absolute",
			display:"inline-block",
			left: (x-200) + "px",
			top: y+ "px"
		}).slideDown("fast");
		$("body").off("mousedown").on("mousedown", this.proxy(this.onBodyDown));
		rightMenuContent.off("mouseover mouseout").on({
			"mouseover": function(e) {
				$(e.target).css("background-color", "#B51E6E");
			},
			"mouseout": function(e) {
				$(e.target).css("background-color", "");
			}
		});
		$("div.hkaqxx").off("click").on("click", this.proxy(this.hkaqxx));
		$("div.fxld").off("click").on("click", this.proxy(this.fxld));
		$("div.zxt").off("click").on("click", this.proxy(this.zxt));
		$("div.wxcc").off("click").on("click", this.proxy(this.wxcc));
	},
	onBodyDown: function(e) {
		if (!(e.target.id == "rightMenuContent" || $(e.target).parents("#rightMenuContent").length > 0)) {
			this.hideMenu();
		}
	},
	hideMenu: function() {
		var rightMenuContent = $("#rightMenuContent");
		rightMenuContent.fadeOut("fast").empty();
		$("body").off("mousedown", this.proxy(this.onBodyDown));
	},
	hkaqxx: function(e) {
		var id = parseInt($(e.currentTarget).attr("data-id"));
		var name = $(e.currentTarget).attr("data-name");
		var date = $(e.currentTarget).attr("data-date");
		var query = this._setQuery(id, name, date);
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
	fxld: function(e) {
		var id = $(e.currentTarget).attr("data-id");
		id = parseInt(id);
		var name = $(e.currentTarget).attr("data-name");
		var date = $(e.currentTarget).attr("data-date");
		this.CLK1(id, name, date);
	},
	wxcc: function(e) {
		var id = parseInt($(e.currentTarget).attr("data-id"));
		var name = $(e.currentTarget).attr("data-name");
		var query = this._setQuery(id, name, "no");
		var agent = navigator.userAgent.toLowerCase();
		if(agent.indexOf("edge") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("errorThread.html?filter=" + query);
		}else if(agent.indexOf("chrome") > 0){
		window.open("errorThread.html?filter=" + query);
		}else if(agent.indexOf("msie") > 0){
			query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
			query=JSON.stringify(query);
			window.open("errorThread.html?filter=" + query);
			}else{
				query = JSON.parse(window.decodeURIComponent(window.decodeURIComponent(query)));
				query=JSON.stringify(query);
				window.open("errorThread.html?filter=" + query);
			}
	},
	zxt: function(e) {
		var id = $(e.currentTarget).attr("data-id");
		id = parseInt(id);
		var name = $(e.currentTarget).attr("data-name");
		var query = this._setQuery(id, name, "other");
		query = window.decodeURIComponent(window.decodeURIComponent(query));
		this._cInsecurity(query, name);
	},
	/**
	 * 风险雷达
	 */
	_radar: function() {
		return {
			color: ['blue'],
			title: {
				text: ""
			},
			backgroundColor: 'white',
			tooltip: {
				trigger: 'axis',
				formatter: function(params, ticket, callback) {
					var index = params[0].dataIndex;
					var showValue = params[0].data.show[index];
					var res = params[0].name;
					var name = params[0]["3"];
					res += '<br/>' + name + ' : ' + showValue;
					return res;
				}
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
			polar: [{
				indicator: [],
				radius: 130,
				splitNumber: 3,
				splitArea: {
					show: true,
					areaStyle: {
						color: ['red', 'yellow', 'green']
					}
				}
			}],
			calculable: false,
			series: [{
				type: 'radar',
				data: [{
					value: [],
					name: '风险雷达',
					id: [],
					show: []
				}]
			}]
		};
	},
	/**
	 * 风险趋势
	 */
	_line: function() {
		return {
			title: {

			},
			backgroundColor: 'white',
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: [],
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
			grid: {
				y: '',
				x: 80,
				x2: 40
			},
			xAxis: [{
				type: 'category',
				splitNumber: 12,
				boundaryGap: false,
				axisLabel: {
					interval: 0
				},
				data: []
			}],
			yAxis: [{
				type: 'value',
				name: '风险值',
				axisLabel: {
					formatter: '{value} '
				}
			}],
			series: [

			]
		};
	},
	/**
	 * 风险排行
	 */
	_bar: function() {
		return {
			title: {

			},
			backgroundColor: 'white',
			tooltip: {
				trigger: 'axis'
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
				type: 'value',
				name: '风险值',
				boundaryGap: [0, 0.01]
			}],
			yAxis: [{
				type: 'category',
				data: []/*,
				axisLabel: {
					formatter: function(value) {
						return value.substring(0, 15) + ((value.length > 15) ? '...' : '');
					}
				}*/
			}],
			series: [{
				name: '风险值',
				type: 'bar',
				id: [],
				data: []
			}]
		};
	},
	_bar2: function() {
		return {
			title: {

			},
			backgroundColor: 'white',
			tooltip: {
				trigger: 'axis'
			},
			toolbox: {
				show: false,
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
			grid: {
				x: '20%',
				x2: 45,
			},
			xAxis: [{
				type: 'value',
				name: '风险值'
			}],
			yAxis: [{
				type: 'category',
				data: [],
				axisLabel: {
					formatter: function(value) {
						return value.substring(0, 6) + ((value.length > 6) ? '...' : '');
					}
				}
			}],
			series: [{
				name: '风险值',
				type: 'bar',
				itemStyle: {
					normal: {
						label: {
							show: true,
							position: 'right'
						}
					}
				},
				data: []
			}]
		};
	},
	/**
	 * @title  不安全状态排行
	 */
	_funnel: function() {
		return {
			title: {

			},
			backgroundColor: 'white',
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b} : {c} ({d}%)"
			},
			legend: {
				orient: 'horizontal',
				x: 'center',
				y: 'top',
				data: [],
				selected: {}
			},
			toolbox: {
				show: false,
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
					magicType: {
						show: true,
						type: ['pie', 'funnel'],
						option: {
							funnel: {}
						}
					},
					restore: {
						show: true
					},
					saveAsImage: {
						show: true
					}
				}
			},
			calculable: true,
			series: [{
				name: '不安全状态排行',
				type: 'pie',
				radius: '40%',
				center: ['50%', 205],
				itemStyle: {
					normal: {
						label: {
							show: false
						},
						labelLine: {
							show: false
						}
					}
				},
				data: [

				]
			}]
		};
	},
	_ins: function() {
		return {
			title: {
				text: '',
				textStyle: {
					fontSize: 12,
					fontWeight: 'normal',
					color: '#333'
				}
			},
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: []
			},
			calculable: false,
			grid: {
				x: 80,
				x2: 40
			},
			xAxis: [{
				type: 'category',
				boundaryGap: false,
				axisLabel: {
					interval: 0
				},
				data: []
			}],
			yAxis: [{
				type: 'value',
				name: '风险值',
				axisLabel: {
					formatter: '{value} '
				},
				splitNumber: 3
			}],
			series: [

			]
		};
	}
}, {
	usehtm: true,
	usei18n: false
});

com.sms.dash.tem.widgetjs = [
	'../../../uui/widget/select2/js/select2.min.js',
	'../../../uui/widget/spin/spin.js',
	'../../../uui/widget/jqblockui/jquery.blockUI.js',
	'../../../uui/widget/ajax/layoutajax.js',
	'echarts/js/echarts.js',
	'../../../uui/widget/jqurl/jqurl.js'
];
com.sms.dash.tem.widgetcss = [{
	path: '../../../uui/widget/select2/css/select2.css'
}, {
	path: '../../../uui/widget/select2/css/select2-bootstrap.css'
}];