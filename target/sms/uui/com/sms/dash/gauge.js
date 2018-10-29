//@ sourceURL=com.sms.dash.gauge
$.u.define('com.sms.dash.gauge', null, {
    init: function (mode, gadgetsinstanceid) {
    	this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
        this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.display = this.qid('display'); // 显示界面
		this.config = this.qid('config'); // 编辑界面
		this.unitOption = {
			width : 280,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				dataType : "json",
				data : function(term, page) {
					return {
						tokenid : $.cookie("tokenid"),
						method : "getunits",
						dataobject : "unit",
						unitName : term == "" ? null : term
					};
				},
				results : this.proxy(function(response, page, query) {
					if (response.success) {
						var all = {id : "0",name : "全部"};
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
		};

		this.systemOption = {
				width:280,
	    		ajax:{
	    			url: $.u.config.constant.smsqueryserver,
	    			dataType: "json",
	    			type : "post",
	                data:function(term,page){
	    	        	return {
	    	        		tokenid:$.cookie("tokenid"),
	    					method:"stdcomponent.getbysearch",
	    					dataobject:"dictionary",
	    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
	    				};
	                },
				results : this.proxy(function(response, page, query) {
					if (response.success) {
						var all = {id : '0',name : '全部'};
						response.data.aaData.push(all);
						response.data.aaData.reverse();
						return {
							results : response.data.aaData
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
		};

		

		this.qid("unit").select2(this.unitOption);// 安监机构
		this.qid("system").select2(this.systemOption);// 系统分类

		this._ajax(
				$.u.config.constant.smsqueryserver, 
				true, 
			{
			"method" : "stdcomponent.getbyid",
			"dataobject" : "gadgetsinstance",
			"dataobjectid" : this._gadgetsinstanceid
		}, this.$, {}, this.proxy(function(response) {
			var sysType =  "0";
			this._gadgetsinstance = response.data;
			if (this._gadgetsinstance.urlparam != null) {
				this.line_options = JSON.parse(this._gadgetsinstance.urlparam);
				sysType = this.line_options.systemId;
			} else {
				this.line_options = null;
			}
			if (this._initmode == 'config') {
				this.config.removeClass("hidden");
				if (this.line_options) {
					this.qid("unit").select2("data", {"name" : this.line_options.unitName,"id" : this.line_options.unitId});
					this.qid("system").select2("data", {"name" : this.line_options.systemName,"id" : this.line_options.systemId});
				} else {
					this.qid("unit").select2("data", {"name" : "全部","id" : "0"});
					this.qid("system").select2("data", {"name" : "全部","id" : "0"});
				}
			} else if (this._initmode == 'display') {
				var status=0;
				this.qid("insecurity").select2({
					width : 280,
					ajax : {
						url : $.u.config.constant.smsqueryserver,
						dataType : "json",
						type : "post",
						data : this.proxy(function(term, page) {
							return {
								tokenid : $.cookie("tokenid"),
								method : "stdcomponent.getbysearch",
								"dataobject": "insecurity",
             					"rule": JSON.stringify([[{"key":"name", "op":"like", "value": term}],[{"key": "system", "value": sysType && sysType !== "0" ? parseInt(sysType) : null}]]),
             					"start": (page - 1) * this._select2PageLength,
             					"length": this._select2PageLength
							};
						}),
						results : this.proxy(function(response, page, query) {
							if (response.success) {
								if(status==0){
									response.data.aaData.reverse();
									var all = {id : '0',name : '全部'};
									response.data.aaData.push(all);
									response.data.aaData.reverse();
									status++;
								}
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
				this.display.removeClass("hidden");
				this.qid("insecurity").select2("data", {"name" : "全部","id" : "0"});
				this._reloaddata({
					method : "calculateByMultiCon",
					"unitId" : this.line_options ? this.line_options.unitId : 0,
					"systemId" : this.line_options ? this.line_options.systemId : 0,
					"insecurityid" : "0"
				});
			}
		}));

		this.qid("search").click(this.proxy(function() {
			this._reloaddata({
				method : "calculateByMultiCon",
				"unitId" : this.line_options.unitId,
				"systemId" : this.line_options.systemId,
				"insecurityid" : this.qid("insecurity").val()

			});
		}));
		this.qid("update").click(this.proxy(this.on_update_click));
		this.qid("cancel").click(this.proxy(function() {
			this.display.removeClass("hidden"); // 显示界面
			window.location.href = window.location.href.replace("config", "display");
			this.qid("insecurity").select2("data", {"name" : "全部","id" : "0"});
			this._reloaddata({
				method : "calculateByMultiCon",
				"unitId" : this.line_options.unitId,
				"systemId" : this.line_options.systemId,
				"insecurityid" : "0"
			});
		}));
        
    },

	_reloaddata : function(param) {
		var seriesdata = [];
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			datatype : "json",
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)

		}).done(
				this.proxy(function(respone) {
					if (respone.success) {
						seriesdata.push(respone.calculates);
						this._reloadOption(respone.timeData, respone.calculates);// 加载
						if (window.parent) {
							window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
							window.parent.setGadgetTitle(this._gadgetsinstanceid,
									this._gadgetsinstance.gadgetsDisplayName + "：安监机构：" + (this.line_options && this.line_options.unitName) + ",　系统分类："
											+ (this.line_options && this.line_options.systemName));
						}
					}
				})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	_reloadOption : function(timeData, calculates) {
		var option = {
			timeline : {
				data : timeData,
				label : {
					formatter : function(s) {
						return s.slice(0, 7);
					}
				},
				currentIndex : 11
			},
			options : [ ]
		};
		for(i in calculates){
			if(calculates[i].value==0 && calculates[i].green==0 || calculates[i].value==0 && calculates[i].red==0){
				calculates[i].green = 0.25;
				calculates[i].red = 0.75;
				calculates[i].value = 0;
				calculates[i].max = 40;
			}else if(calculates[i].value!=0 && calculates[i].green==0 || calculates[i].value!=0 && calculates[i].red==0){
				calculates[i].green = 0.25;
				calculates[i].red = 0.75;
				calculates[i].max = 1000;
			}
		};
		$.each(calculates, function(idx, term) {
			if (idx != 11) {
				option.options.push({
					series : [ {
						max : calculates[idx].max,
						type : 'gauge',
						axisLabel: {
			                textStyle: {
			                    color: 'auto'
			                },
			                formatter: function (a,b,c) {
			                    return a.toFixed(2);
			                }
						},
						axisLine: {
			                lineStyle: { 
			                	color: [
		                            [calculates[idx].green, '#00B050'],
		                            [calculates[idx].red, '#FFC000'],
		                            [1, '#FF0000']
		                        ],
			                    width: 10
			                }
			            },
						data : [ {
							name : '不安全状态',
							value : calculates[idx].value
						} ]
					} ]
				});
			}else{
				option.options.push({
					tooltip : {
						trigger : 'axis'
					},
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
							}
						}
					},
					series : [ {
						max : calculates[11].max,
						type : 'gauge',
						axisLabel: {
			                textStyle: {
			                    color: 'auto'
			                },
			                formatter: function (a,b,c) {
			                    return a.toFixed(2);
			                }
						},
						axisLine: {
			                lineStyle: { 
			                	color: [
		                            [calculates[11].green, '#00B050'],
		                            [calculates[11].red, '#FFC000'],
		                            [1, '#FF0000']
		                        ],
			                    width: 10
			                }
			            },
						data : [ {
							name : '不安全状态',
							value : calculates[11].value
						} ]
					} ]
				}) 
			}
		});
		require.config({
			paths : {
				echarts : './echarts/js'
			}
		});
		require([ 'echarts', 'echarts/chart/gauge' ], function(ec) {
			var myChart2 = ec.init(document.getElementById('mainGauge'));
			myChart2.setOption(option);
		});
	}, 

	/**
	 * @title 保存
	 * @param e
	 */
	on_update_click : function(e) {
		var pms = {
			unitId : this.qid("unit").select2("data").id,
			unitName:this.qid("unit").select2("data").name,
			systemId : this.qid("system").select2("data").id,
			systemName : this.qid("system").select2("data").name,
		};
		
		this._ajax($.u.config.constant.smsmodifyserver, false, {
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

	},
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

    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.gauge.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                               "../../../uui/widget/spin/spin.js",
                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                               "../../../uui/widget/ajax/layoutajax.js",
                               'echarts/js/echarts.js'];
com.sms.dash.gauge.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];