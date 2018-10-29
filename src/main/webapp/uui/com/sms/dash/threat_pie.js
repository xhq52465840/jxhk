// @ sourceURL=com.sms.dash.threat_pie
$.u.define('com.sms.dash.threat_pie', null, {
	init : function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._gadgetsinstance = null;
		this._select2PageLength = 10;
	},
	afterrender : function(bodystr) {
		this.state=0;
		this.display = this.qid('display'); // 显示界面
		this.config = this.qid('config'); // 编辑界面
		// 安监机构
		this.qid('unit').select2({
			width : 280,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				dataType : 'json',
				type : 'post',
				data : function(term, page) {
					return {
						tokenid : $.cookie("tokenid"),
						method : 'getunits',
						unitName : term
					};
				},
				results : this.proxy(function(response, page, query) {
					if (response.success) {
						var all = {
							id : '0',
							name : '全部'
						};
						response.data.push(all);
						response.data.reverse();
						return {
							results : response.data
						};
					}
				})
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		});
		// 系统类别
		this.qid('system').select2({
			width : 280,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				dataType : 'json',
				type : 'post',
				data : this.proxy(function(term, page) {
					tempTerm = term;
					return {
						tokenid : $.cookie("tokenid"),
						method : 'stdcomponent.getbysearch',
						dataobject:'dictionary',
						start: (page - 1) * this._select2PageLength,
						length: this._select2PageLength,
						rule : JSON.stringify([[{'key':'name','op':'like','value':''}],[{'key':'type','value':'系统分类'}]])
					};
				}),
				results : this.proxy(function(response, page, query) {
					if (response.success) {
						var all = {
							id : '0',
							name : '全部'
						};
						response.data.aaData.push(all);
						response.data.aaData.reverse();
						return {
							results : response.data.aaData, more: (page * this._select2PageLength) < response.data.iTotalRecords
						};
					}
				})
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		});
		// 不安全狀態
		this.qid('insecurity').select2({
			width : 280,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				dataType : 'json',
				type : 'post',
				data : this.proxy(function(term, page) {
					return {
						tokenid : $.cookie("tokenid"),
						method : 'stdcomponent.getbysearch',
						dataobject : 'insecurity',
						rule : JSON.stringify([[{'key' : 'name', 'op' : 'like', 'value' : term} ],[{"key": "system", "value": this.param.system && this.param.system !== "0" ? parseInt(this.param.system) : null}]]),
						start: (page - 1) * this._select2PageLength,
						length: this._select2PageLength,
						"columns" : JSON.stringify([ {
							"data" : "name"
						} ]),
						"order" : JSON.stringify([ {
							"column" : 0,
							"dir" : "asc"
						} ])
					};
				}),
				results : this.proxy(function(response, page, query) {
					if (response.success) {
						return {
							results : response.data.aaData, more: (page * this._select2PageLength) < response.data.iTotalRecords
						};
					}
				})
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		});

		this._ajax($.u.config.constant.smsqueryserver, true, {
			'method' : 'stdcomponent.getbyid',
			'dataobject' : 'gadgetsinstance',
			'dataobjectid' : this._gadgetsinstanceid
		}, this.$, {}, this.proxy(function(response) {
			this._gadgetsinstance = response.data;
			if (this._gadgetsinstance.urlparam != null) {
				this.param = JSON.parse(this._gadgetsinstance.urlparam);
			} else {
				this.param = null;
			}

			if (this._initmode == 'config') {
				this.config.removeClass("hidden");
				// 用户保存了安监机构,输入框显示对应的安监机构
				if (this.param && this.param.unit != '0') { // 安监机构
					this._ajax($.u.config.constant.smsqueryserver, true, {
						'method' : 'stdcomponent.getbyid',
						'dataobject' : 'unit',
						'dataobjectid' : parseInt(this.param.unit)
					}, this.$, {}, this.proxy(function(response) {
						this.unitName = response.data.name;
						this.qid('unit').select2('data', {
							'name' : response.data.name,
							'id' : response.data.id
						});
					}));
				} else {
					this.unitName = '全部';
					this.qid('unit').select2('data', {
						'name' : '全部',
						'id' : '0'
					});
				}
				// 用户保存了系统分类,输入框显示对应的系统分类
				if (this.param && this.param.system != '0') { // 系统分类
					this._ajax($.u.config.constant.smsqueryserver, true, {
						'method' : 'stdcomponent.getbyid',
						'dataobject' : 'dictionary',
						'dataobjectid' : parseInt(this.param.system)
					}, this.$, {}, this.proxy(function(response) {
						this.systemName = response.data.name;
						this.qid('system').select2('data', {
							'name' : response.data.name,
							'id' : response.data.id
						});
					}));
				} else {
					this.systemName = '全部';
					this.qid('system').select2('data', {
						'name' : '全部',
						'id' : '0'
					});
				}
			} else if (this._initmode == 'display') {
				this.display.removeClass("hidden");
				this.unitId = '';
				this.systemId = '';
				// 用户保存了安监机构时,则根据相应的值检索,否则检索全部内容
				if (this.param && this.param.unit != '0') {
					this.unitId = this.param.unit;
					this._ajax($.u.config.constant.smsqueryserver, true, {
						"method" : "stdcomponent.getbyid",
						"dataobject" : "unit",
						"dataobjectid" : parseInt(this.unitId)
					}, this.$, {}, this.proxy(function(response) {
						this.unitName = response.data.name;
					}));
				} else {
					this.unitName = '全部';
				}
				// 用户保存了系统分类时,则根据相应的值检索,否则检索全部内容
				if (this.param && this.param.system != '0') {
					this.systemId = this.param.system;
					this._ajax($.u.config.constant.smsqueryserver, true, {
						"method" : "stdcomponent.getbyid",
						"dataobject" : "dictionary",
						"dataobjectid" : parseInt(this.systemId)
					}, this.$, {}, this.proxy(function(response) {
						this.systemName = response.data.name;
					}));
				} else {
					this.systemName = '全部';
				}
				this._getData({
					obj : JSON.stringify({
						'unitId' : this.unitId,
						'insecurityId' : '',
						'systemId' : this.systemId,
						paramType : 'threat'
					})
				});
				this.qid("search").click(this.proxy(function() {
					var insecurityId = this.qid("insecurity").val() == '0' ? "" : this.qid("insecurity").val();
					this._getData({
						obj : JSON.stringify({
							'unitId' : this.unitId,
							'systemId' : this.systemId,
							'insecurityId' : insecurityId,
							paramType : 'threat'
						})
					});
				}));
			}
		}));

		this.qid("update").click(this.proxy(this.on_update_click));
		this.qid("cancel").click(this.proxy(function() {
			this.display.removeClass("hidden"); // 显示界面
			window.location.href = window.location.href.replace("config", "display");
			this.unitId = '';
			this.systemId = '';
			this.insecurityId = '';
			// 用户保存了安监机构和系统分类时,则根据相应的值检索,否则检索全部内容
			if (this.param != null) {
				if (this.param.unit != '0') {
					this.unitId = this.param.unit;
				}
				if (this.param.system != '0') {
					this.systemId = this.param.system;
				}
			}
			this._getData({
				obj : JSON.stringify({
					'unitId' : this.unitId,
					'insecurityId' : this.insecurityId,
					'systemId' : this.systemId,
					paramType : 'threat'
				})
			});
		}));

	},
	_loadPie : function(timeData, scoreListOneYear, insecurityIdListOneYear) {
		var dataArray=[];
		var nameArray=[];
		if(this.state==0){
				$.each(scoreListOneYear[scoreListOneYear.length-1],function(idx,name){
					dataArray.push({value:Number(scoreListOneYear[scoreListOneYear.length-1][idx].value),name:scoreListOneYear[scoreListOneYear.length-1][idx].name});
					nameArray.push(scoreListOneYear[scoreListOneYear.length-1][idx].name);
				});
			
			this.state++;
		}else{
			$.each(scoreListOneYear,function(index,term){
				$.each(scoreListOneYear[index],function(idx,name){
					if($.inArray(scoreListOneYear[index][idx].name,nameArray)==-1){
						nameArray.push(scoreListOneYear[index][idx].name);
						dataArray.push({value:Number(scoreListOneYear[index][idx].value),name:scoreListOneYear[index][idx].name});	
					}else if($.inArray(scoreListOneYear[index][idx].name,nameArray)!=-1){
						var value=$.inArray(scoreListOneYear[index][idx].name,nameArray);
						dataArray[value].value+=Number(scoreListOneYear[index][idx].value);
					}
					});
			});
		};
		require.config({
			paths : {
				echarts : './echarts/js'
			}
		});
		// 使用
		require([ 'echarts', 'echarts/chart/pie','echarts/chart/funnel' ], function(ec) {

			var option = {/*
				timeline : {
					data : timeData,
					currentIndex : timeData.length - 1,
					notMerge : true,
					label : {
						formatter : function(s) {
							// 火狐浏览器的兼容性
							return s.slice(0, 7);
						}
					}
				},
				options : [ {
					title : {
						text : '威胁饼图',
						x : 'center'
					},
					tooltip : {
						trigger : 'item',
						formatter : '{a} <br/>{b} : {c} ({d}%)'
					},
					series : [ {
						name : '威胁',
						type : 'pie',
						radius : '120',
						center : [ '50%', '55%' ]
					} ],
					toolbox : {
						show : true,
						feature : {
							mark : {
								show : true
							},
							dataView : {
								show : true,
								readOnly : false
							},
							restore : {
								show : true
							},
							saveAsImage : {
								show : true
							},
							magicType : {show: true, type: ['pie', 'funnel']}
						}
					},
					calculable : true
				} ]
			*/};

	/*		option.options[0].series[0].data = scoreListOneYear[0];
			var legend = {
				orient : 'vertical',
				x : 'left',
				y : 'top'
			};
			var legendData = [];
			$.each(scoreListOneYear[0], function(idx, term) {
				legendData.push(term.name);
			});
			legend.data = legendData;
			option.options[0].legend = legend;
			$.each(scoreListOneYear, function(idx, term) {
				if (idx != 0) {
					var addOption = $.extend(true, {}, option.options[0], true);
					addOption.series[0].data = term;
					var addLegendData = [];
					$.each(term, function(idx, term) {
						addLegendData.push(term.name);
					});
					addOption.legend.data = addLegendData;
					option.options.push(addOption);
				}
			});*/

			// --- 饼图1 标准 ---
			/*
			 * 饼图另外修改
			 */
			var option = {
				    title : {
				        text: '威胁饼图',
				        subtext: '',
				        x:'center'
				    },
				    tooltip : {
				        trigger: 'item',
				        formatter: "{a} <br/>{b} : {c} ({d}%)"
				    },
				    legend: {
				        orient : 'vertical',
				        x : 'left',
				        data:nameArray,
				    },
				    toolbox: {
				        show : true,
				        feature : {
				            mark : {show: true},
				            dataView : {show: true, readOnly: false},
				            magicType : {
				                show: true, 
				                type: ['pie', 'funnel'],
				                option: {
				                    funnel: {
				                        x: '25%',
				                        width: '50%',
				                        funnelAlign: 'left',
				                        max: 1548
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
				            name:'访问来源',
				            type:'pie',
				            radius : '55%',
				            center: ['55%', '60%'],
				            data:dataArray
				        }
				    ]
				};   
			var myChart2 = ec.init(document.getElementById('mainPie'));
			myChart2.setOption(option);
			// 绑定事件
			var ecConfig = require('echarts/config');
			myChart2.on(ecConfig.EVENT.TIMELINE_CHANGED, function(param) {
				param.currentIndex;// 当前timeline的index
				var insecurityId = insecurityIdListOneYear[param.currentIndex];
				if (0 != insecurityId) {
					$.u.ajax({
						url : $.u.config.constant.smsqueryserver,
						dataType : "json",
						type : "post",
						cache : false,
						data : {
							"tokenid" : $.cookie("tokenid"),
							method : 'stdcomponent.getbyid',
							dataobject : 'insecurity',
							dataobjectid : insecurityId
						}
					}).done(function(response) {
						if (response.success && response.data != null) {
							$("[qid='insecurity']").select2("data", response.data);
						}
					});
				}
			});
		});
	},
	/**
	 * 从后台获取数据
	 */
	_getData : function(param) {
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : 'json',
			type : 'post',
			cache : false,
			data : $.extend({
				'tokenid' : $.cookie("tokenid"),
				method : 'calculateByMultiConForThreatAndError'
			}, param)
		}).done(
				this.proxy(function(data) {
					if (data.success) {
						var scoreListOneYear = data.scoreListOneYear;
						var timeData = data.timeData;
						var insecurityIdListOneYear = data.insecurityIdListOneYear;
						// 加载饼图
						this._loadPie(timeData, scoreListOneYear, insecurityIdListOneYear);
						if (window.parent) {
							window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
							window.parent.setGadgetTitle(this._gadgetsinstanceid,
									this._gadgetsinstance.gadgetsDisplayName + "：(安监机构：" + this.unitName + ",　系统分类：" + this.systemName + ")");
						}
					}
				})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	/**
	 * @title 保存
	 * @param e
	 */
	on_update_click : function(e) {
		var pms = {
			unit : this.qid("unit").val(),
			system : this.qid("system").val()
		};
		if (this.qid("unit").val() != null || this.qid("system").val() != null) {
			this._ajax($.u.config.constant.smsmodifyserver, true, {
				"method" : "stdcomponent.update",
				"dataobject" : "gadgetsinstance",
				"dataobjectid" : this._gadgetsinstanceid,
				"obj" : JSON.stringify({
					"urlparam" : JSON.stringify(pms)
				})
			}, this.$, {}, this.proxy(function(response) {
				$.u.alert.info("更新插件配置成功");
				window.location.href = window.location.href.replace("config", "display");
			}));
		}

	},
	/**
	 * @title ajax
	 * @param url
	 *            {string} ajax url
	 * @param type
	 *            {string} ajax 请求类型
	 * @param async
	 *            {bool} async
	 * @param param
	 *            {object} ajax param
	 * @param $container
	 *            {jQuery object} block
	 * @param blockParam
	 *            {object} block param
	 * @param callback
	 *            {function} callback
	 */
	_ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.threat_pie.widgetjs = [ '../../../uui/widget/select2/js/select2.min.js',
		'../../../uui/widget/spin/spin.js', '../../../uui/widget/jqblockui/jquery.blockUI.js',
		'../../../uui/widget/ajax/layoutajax.js', 'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.threat_pie.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                     {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                     { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                     { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];