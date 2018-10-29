// @ sourceURL=com.sms.dash.reviewMap
$.u.define('com.sms.dash.reviewMap', null, {
	init: function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._gadgetsinstance = null;
	},
	afterrender : function(bodystr) {
		this.setCondition();
		this._getData();
		this.qid("search").off("click").on("click",this.proxy(this._search));
	},
	setCondition : function() {
		this.year = this.qid("year");
		this.season = this.qid("season");
		this.getCurrentDate();
	},
	getCurrentDate : function(){
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var season = 0, cYear = 0;
		switch(month){
			case 1:
			case 2:
			case 3:
				season = 4;
				cYear = year-1;
				break;
			case 4:
			case 5:
			case 6:
				season = 1;
				cYear = year;
				break;
			case 7:
			case 8:
			case 9:
				season = 2;
				cYear = year;
				break;
			case 10:
			case 11:
			case 12:
				season = 3;
				cYear = year;
				break;
		}
		for(var i = year,j = year-5; i >= j; i--){
			$('<option value="'+i+'" '+(cYear===i ? 'selected="selected"' : '')+'>'+i+'</option>').appendTo(this.year);
		}
		this.season.find('option[value='+season+']').attr("selected", "selected");
	},
	_search : function(){
		var year = this.year.val();
		var season = this.season.val();
		if(year == 0 && season !=0){
			$.u.alert.warn("请输入年份");
			return false;
		}
		if(year != 0 && season ==0){
			$.u.alert.warn("请输入季度");
			return false;
		}
		this._getData();
	},
	_getData : function() {
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			cache : false,
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method" : "getAllMethanol",
				"year": this.year.val(),
				"season": this.season.val()
			}
		}).done(this.proxy(function(data) {
			if (data.success) {
				this._loadMap(data.data);
				if (window.parent.resizeGadget) {
					window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
				}
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	_loadMap : function(param) {
		var $this = this;
		require.config({
			paths : {
				echarts : './echarts/js'
			},
			packages : [ {
				name : 'BMap',
				location : './echarts/js/extention',
				main : 'map_extention'
			} ]
		});
		// 使用
		require([ 'echarts', 'BMap', 'echarts/chart/map', 'echarts/chart/pie', 'echarts/config' ],function( echarts, BMapExtension) {
			// 关闭底图可点功能
			var mapOptions ={enableMapClick:false};
			var bMap = new BMap.Map('mainMap', mapOptions);
			var BMapExt = new BMapExtension(bMap, BMap, echarts);
			var map = BMapExt.getMap();
			var container = BMapExt.getEchartsContainer();
			var zoom;
			var width = $('body').width();
			// 如果当前浏览器的宽度大于800则显示级别为5否则显示级别为4
			if (width > 800) {
				zoom = 5;
			} else {
				zoom = 4;
			}
			var startPoint = {
				x : 110.114129,
				y : 37.550339
			};
			var point = new BMap.Point(startPoint.x, startPoint.y);
			map.centerAndZoom(point, zoom);
			map.clearHotspots();
			// 禁用双击放大
			map.disableDoubleClickZoom();
			// 禁用地图拖拽。
			map.disableDragging();
			// 禁用滚轮放大缩小。
			map.disableScrollWheelZoom();
			// 禁用键盘操作。
			map.disableKeyboard();
			// 禁用双指操作缩放。
			map.disablePinchToZoom();
			
			map.setMapStyle({
				styleJson: [
					{
						"featureType": "administrative",
	                    "elementType": "labels.icon",
	                    "stylers": {
	                              "visibility": "off"
	                    }
					}
				]
			});
			var sortList = param.sort(function(data0, data1) {
				return -(data0.score - data1.score);
			});
			var dat = [], city = [], geo = {};
			$.each(sortList, function(k,v){
				var index = city.indexOf(v.city);
				if(index < 0){
					city.push(v.city);
					geo[v.city] = [v.longitude,v.latitude];
					dat.push({
						"name":v.city,
						"value":v.score,
						"unit":[{
							"name":v.unitName,
							"unitid":v.unitId,
							"id":v.id,
							"value":v.score
						}]});
				}else{
					dat[index]["unit"].push({
						"name":v.unitName,
						"unitid":v.unitId,
						"id":v.id,
						"value":v.score
					});
				}
			});
			var option = {
				calculable : false,
				title : {
					text : '安全评审',
					textStyle : {
						color : 'black'
					},
					x : 'center'
				},
				tooltip: {
					trigger: 'item',
					formatter: function (v) {
						var text = "";
						$.each(v[5]["unit"],function(idx, item){
							text += item.name+":"+item.value+"<br/>"; 
						});
						return text;
					}
				},
				dataRange : {
					show: false,
					min : dat.length == 0 ? 0 : dat[dat.length - 1].value,
					max : dat.length == 0 ? 0 : dat[0].value,
					calculable : true,
					realtime : true,
					textStyle : {
						color : 'black'
					},
					text : [ '高', '低' ],
					color : [ 'maroon', 'red', 'orange', 'yellow' ]
				},
				toolbox : {
					show : false
				},
				series : [ {
					name : '分数',
					type : 'map',
					dataRangeHoverLink : true,
					itemStyle : {
						normal : {
							borderColor : 'blue',
							borderWidth : 1,
							areaStyle : {
								color : 'white'
							}
						}
					},
					mapType : 'none',
					hoverable : false,
					roam : false,
					data : [],
					markPoint : {
						symbol : 'emptyCircle',
						symbolSize : 10,
						effect : {
		                    show: true,
		                    shadowBlur : 0
		                },
						data : dat
					// 数据
					},
					geoCoord : geo
				// 经纬度
				}]
			};
			// 基于准备好的dom，初始化echarts图表
			var myChart2 = BMapExt.initECharts(container);
			// 为echarts对象加载数据
			BMapExt.setOption(option);
			// 绑定事件
			var ecConfig = require('echarts/config');
			myChart2.on(ecConfig.EVENT.DBLCLICK, doubleClick);

			function doubleClick(param) {
				if(param.seriesName != "详细"){
					var addedSeries = {
						name: '详细',
						type: 'pie',
						center: ['80%', '50%'],
						radius : '25%',
						tooltip: {
							trigger: 'item',
							formatter: "{a} <br/>{b} : {c} ({d}%)"
						},
						data: param.data.unit
					};
					var newoption = $.extend(true, {}, option, true);
					newoption.series[option.series.length] = addedSeries;
					myChart2.clear();
					myChart2.setOption(newoption);
				}else{
					var name = $this.year.val() + "年第" + $this.season.val() + "季度";
					var s = window.encodeURIComponent(window.encodeURIComponent(name));
					window.open(window.encodeURI(encodeURI("safeReview.html?id=" + param.data.id + "&s=" + s)));
				}
			}
		});
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.reviewMap.widgetjs = [ '../../../uui/widget/spin/spin.js', 
							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
							  '../../../uui/widget/ajax/layoutajax.js', 
							  'echarts/js/echarts.js', 
							  '../../../uui/widget/jqurl/jqurl.js'];
com.sms.dash.reviewMap.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                              { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];