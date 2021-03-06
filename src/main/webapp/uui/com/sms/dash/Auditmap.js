// @ sourceURL=com.sms.dash.Auditmap
$.u.define('com.sms.dash.Auditmap', null, {
	init : function(mode, gadgetsinstanceid) {
		this._initmode = mode;
    this._gadgetsinstanceid = gadgetsinstanceid;
    this._gadgetsinstance = null;
	},
	afterrender : function(bodystr) {
		this.year = $("[name=year]");
		this.year.on("change",this.proxy(this.on_change_year));
		this.getCurrentDate();
		this.getAuditMap();
		
	},
	on_change_year:function(ent){
		this.getAuditMap();
	},
	getCurrentDate : function(){
		var date = new Date();
		var year = date.getFullYear();
		for(var i = year,j = year-6; i >= j; i--){
			$('<option value="'+i+'">'+i+'</option>').appendTo(this.year);
		}
	},
	getAuditMap : function() {
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			cache : false,
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method" : "getAuditMap",
				"year": this.year.val()
			}
		}).done(this.proxy(function(data) {
			if (data.success) {
				this._loadMap(data.data);
				if (window.parent.resizeGadget) {
					window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true)  + "px");
				}
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	_loadMap : function(param) {
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
			map.centerAndZoom(new BMap.Point(startPoint.x, startPoint.y), zoom);
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
				return -(data0.source - data1.source);
			});
			
			var dat = [], city = [], geo = {};
			$.each(sortList, function(k,v){
				var index = city.indexOf(v.city);
				if(index < 0){
					city.push(v.city);
					geo[v.city] = [v.longitude,v.latitude];
					dat.push({
						"name":v.city,
						"value":v.source,
						"unit":[{
							"name":v.unitName,
							"unitid":v.unitId,
							"value":v.source
						}]});
				}else{
					dat[index]["unit"].push({
						"name":v.unitName,
						"unitid":v.unitId,
						"value":v.source
					});
				}
			});
			
			
			var option = {
				calculable : false,
				title : {
					text : '',
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
					window.open(window.encodeURI(encodeURI("review_score_and_system_consequence.html?unitId=" + param.data.unitid + "&unitName=" + escape(param.data.name))));
				}
			}
		});
	}
	

	
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.Auditmap.widgetjs = [ '../../../uui/widget/spin/spin.js', 
							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
							  '../../../uui/widget/ajax/layoutajax.js', 
							  'echarts/js/echarts.js', 
							  '../../../uui/widget/jqurl/jqurl.js'];
com.sms.dash.Auditmap.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                              { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];