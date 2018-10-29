//@ sourceURL=com.sms.dash.radar
$.u.define('com.sms.dash.radar', null, {
	init: function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._gadgetsinstance = null;
		var year = (new Date()).format("yyyy"),
			month = (new Date()).format("yyyy/MM/dd").substring(5, 7) - 1;
		this._date = (new Date(year + "/" + month + "/" + "01")).format("yyyy/MM/dd");
		this.changeCount = 0;
	},
	afterrender: function(bodystr) {
		this.display = this.qid("display"); // 显示界面
		this.config = this.qid("config"); // 编辑界面
		this.sysType = this.qid("sysType");

		if (this._initmode === 'config') {
			this.config.removeClass("hidden");
			this.qid("activity").select2({
				width: 280,
				ajax: {
					url: $.u.config.constant.smsqueryserver,
					dataType: "json",
					type: "post",
					data: function(term, page) {
						return {
							tokenid: $.cookie("tokenid"),
							method: "getunits",
							dataobject: "unit",
							unitName: term == "" ? null : term
						};
					},
					results: function(response, page, query) {
						if (response.success) {
							var all = {
								id: 0,
								name: "全部"
							};
							response.data.push(all);
							response.data.reverse();
							return {
								results: response.data
							};
						}
					}
				},
				formatResult: function(item) {
					return item.name;
				},
				formatSelection: function(item) {
					return item.name;
				}
			}); // 安监机构
			this.sysType.select2({
				width: 280,
				ajax: {
					url: $.u.config.constant.smsqueryserver,
					dataType: "json",
					type: "post",
					data: function(term, page) {
						return {
							tokenid: $.cookie("tokenid"),
							method: "stdcomponent.getbysearch",
							dataobject: "dictionary",
							"rule": JSON.stringify([
								[{
									"key": "name",
									"op": "like",
									"value": term
								}],
								[{
									"key": "type",
									"value": "系统分类"
								}]
							]),
						};
					},
					results: function(response, page, query) {
						if (response.success) {
							var all = {
								id: 0,
								name: "全部"
							};
							response.data.aaData.push(all);
							response.data.aaData.reverse();
							return {
								results: response.data.aaData
							};
						}
					}
				},
				formatResult: function(item) {
					return item.name;
				},
				formatSelection: function(item) {
					return item.name;
				}
			});
		} else if (this._initmode === 'display') {
			this.display.removeClass("hidden");
		}

		$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type: "post",
			dataType: "json",
			data: {
				"tokenid": $.cookie("tokenid"),
				"method": "stdcomponent.getbyid",
				"dataobject": "gadgetsinstance",
				"dataobjectid": this._gadgetsinstanceid
			}
		}, this.$).done(this.proxy(function(response) {
			this._gadgetsinstance = response.data;
			if (this._gadgetsinstance.urlparam !== null) {
				this.line_options = JSON.parse(this._gadgetsinstance.urlparam);
			} else {
				this.line_options = null;
			}
			if (this._initmode == "display") {
				if (this.line_options != null) {
					this._search(this.line_options.unitId, this.line_options.sysTypeId, this._date);
				} else {
					this._reloaddata({
						method: "drawRadar",
						"unitId": "0",
						"sysTypeId": "0",
						"date": this._date
					});
				}
			} else if (this._initmode == "config") {
				if (this.line_options) {
					this.qid("activity").select2("data", {
						"name": this.line_options.unitName,
						"id": this.line_options.unitId
					});
					this.qid("sysType").select2("data", {
						"name": this.line_options.sysTypeName,
						"id": this.line_options.sysTypeId
					});
				} else {
					this.qid("activity").select2("data", {
						"name": "全部",
						"id": "0"
					});
					this.qid("sysType").select2("data", {
						"name": "全部",
						"id": "0"
					});
				}
				if (window.parent) {
					window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
				}
			}
		}));
		// --- 雷达 ---
		require.config({
			paths: {
				echarts: './echarts/js'
			}
		});

		this.qid("update").click(this.proxy(this.on_update_click));
		this.qid("cancel").click(this.proxy(function() {
			this.display.removeClass("hidden"); // 显示界面
			window.location.href = window.location.href.replace("config", "display");
			this.display.removeClass("hidden");
			if (this.line_options != null) {
				this._search(this.line_options.unitId, this.line_options.sysTypeId, this._date);
			} else {
				this._reloaddata({
					method: "drawRadar",
					"unitId": "0",
					"sysTypeId": "0",
					"date": this._date
				});
			}

		}));
	},
	_search: function(unit, sysType, date) {
		this._reloaddata({
			method: "drawRadar",
			"unitId": unit,
			"sysTypeId": sysType,
			"date": date
		}); // 获取全部
	},
	/**
	 * @title 保存
	 * @param e
	 */
	on_update_click: function(e) {
		$.ajax({
			url: $.u.config.constant.smsmodifyserver,
			type: "post",
			dataType: "json",
			cache: false,
			async: false,
			"data": {
				"tokenid": $.cookie("tokenid"),
				"method": "stdcomponent.update",
				"dataobject": "gadgetsinstance",
				"dataobjectid": this._gadgetsinstanceid,
				"obj": JSON.stringify({
					"urlparam": JSON.stringify({
						"unitId": this.qid("activity").select2("data").id,
						"unitName": this.qid("activity").select2("data").name,
						"sysTypeId": this.sysType.select2("data").id,
						"sysTypeName": this.sysType.select2("data").name
					})
				})
			}
		}).done(this.proxy(function(response) {
			$.u.alert.info("更新插件配置成功");
			window.location.href = window.location.href.replace("config", "display");
		}));
	},
	_reloaddata: function(param) {
		$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type: "post",
			datatype: "json",
			data: $.extend({
				tokenid: $.cookie("tokenid")
			}, param)
		}).done(this.proxy(function(response) {
			if (response.success) {
				var timedata = [],
					indicatordata = [],
					seriesvalue = [],
					showValue = [];
				timedata = response.timeline;
				$.each(response.data, this.proxy(function(idx, item) {
					indicatordata.push({
						text: item.name,
						max: item.max
					});
					seriesvalue.push(item.value);
					showValue.push(item.showValue);
				}));
				this._reloadOption(timedata, indicatordata, seriesvalue, param, showValue); // 加载
				if (window.parent) {
					window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
					window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "　　安监机构：" + this.line_options.unitName + "　　系统分类：" + this.line_options.sysTypeName);
				}
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	_reloadOption: function(timedata, indicatordata, seriesvalue, param1, showValue) {
		var index = timedata.indexOf(param1.date);
		var options = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
		options[index] = {
			color: ['blue'],
			tooltip: {
				trigger: 'item',
				formatter: function(params, ticket, callback) {
					var index = params["3"];
					if (typeof index == "number") {
						var showValue = params.data.showValue[index];
						var res = params.seriesName;
						var name = params.name;
						res += '<br/>' + name + ' : ' + showValue;
						return res;
					} else {
						return "";
					}
				}
			},
			toolbox: {
				show: true,
				feature: {
					mark: {
						show: true
					},
					dataView: {
						show: true,
						readOnly: false
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
			polar: [{
				indicator: indicatordata,
				radius: 130,
				splitNumber: 3,
				splitArea: {
					show: true,
					areaStyle: {
						color: ['red', 'yellow', 'green']
					}
				}
			}],
			series: [{
				name: '重大风险',
				type: 'radar',
				data: [{
					value: seriesvalue,
					name: "重大风险",
					showValue: showValue
				}]
			}]
		};
		var option = {
			timeline: {
				data: timedata,
				label: {
					formatter: function(s) {
						return s.slice(0, 7);
					}
				},
				currentIndex: index
			},
			options: options
		};
		require(['echarts', 'echarts/chart/radar'], this.proxy(function(ec) {
			var myChart2 = ec.init(document.getElementById('mainRadar'));
			myChart2.setOption(option);
			var ecConfig = require('echarts/config');
			myChart2.on(ecConfig.EVENT.TIMELINE_CHANGED, this.proxy(function(param) {
				if (this.changeCount !== 0) {
					param1.date = param.data;
					this._loadByDate(param1, myChart2);
					this.changeCount = 0;
				} else {
					this.changeCount++;
				}

			}));
		}));
	},
	/**
	 * @title ajax
	 * @param url {string} ajax url
	 * @param async {bool} async
	 * @param param {object} ajax param
	 * @param $container {jQuery object} block
	 * @param blockParam {object} block param
	 * @param callback {function} callback
	 */
	_ajax: function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url: url,
			datatype: "json",
			type: "post",
			"async": async,
			data: $.extend({
				tokenid: $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	_loadByDate: function(param, my) {
		$.u.ajax({
			url: $.u.config.constant.smsqueryserver,
			type: "post",
			datatype: "json",
			data: $.extend({
				tokenid: $.cookie("tokenid")
			}, param)
		}).done(this.proxy(function(response) {
			if (response.success) {
				var timedata = [],
					indicatordata = [],
					seriesvalue = [],
					showValue = [];
				timedata = response.timeline;
				$.each(response.data, this.proxy(function(idx, item) {
					indicatordata.push({
						text: item.name,
						max: item.max
					});
					seriesvalue.push(item.value);
					showValue.push(item.showValue);
				}));
				my.clear();
				var index = timedata.indexOf(param.date);
				var options = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
				options[index] = {
					color: ['blue'],
					tooltip: {
						trigger: 'item',
						formatter: function(params, ticket, callback) {
							var index = params["3"];
							if (typeof index == "number") {
								var showValue = params.data.showValue[index];
								var res = params.seriesName;
								var name = params.name;
								res += '<br/>' + name + ' : ' + showValue;
								return res;
							} else {
								return "";
							}
						}
					},
					toolbox: {
						show: true,
						feature: {
							mark: {
								show: true
							},
							dataView: {
								show: true,
								readOnly: false
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
					polar: [{
						indicator: indicatordata,
						radius: 130,
						splitNumber: 3,
						splitArea: {
							show: true,
							areaStyle: {
								color: ['red', 'yellow', 'green']
							}
						}
					}],
					series: [{
						name: '重大风险',
						type: 'radar',
						data: [{
							value: seriesvalue,
							name: "重大风险",
							showValue: showValue
						}]
					}]
				};
				var option = {
					timeline: {
						data: timedata,
						label: {
							formatter: function(s) {
								return s.slice(0, 7);
							}
						},
						currentIndex: index
					},
					options: options
				};
				my.setOption(option);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	destroy: function() {
		this._super();
	}
}, {
	usehtm: true,
	usei18n: false
});

com.sms.dash.radar.widgetjs = [
	'../../../uui/widget/select2/js/select2.min.js',
	"../../../uui/widget/spin/spin.js",
	"../../../uui/widget/jqblockui/jquery.blockUI.js",
	"../../../uui/widget/ajax/layoutajax.js",
	'echarts/js/echarts.js',
	'../../../uui/widget/jqurl/jqurl.js'
];
com.sms.dash.radar.widgetcss = [{
	id: "",
	path: "../../../uui/widget/select2/css/select2.css"
}, {
	id: "",
	path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}, {
	path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
	path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}];