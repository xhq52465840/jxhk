//@ sourceURL=com.audit.dash.auditConclusion
$.u.define('com.audit.dash.auditConclusion', null, {
	init: function (mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._options = {};
	},
    afterrender: function (bodystr) {
    	this.initHtml();
    },
    initHtml: function(){
		this.form = this.qid("form");
		this.btn_search = this.qid("btn_search");
		this.btn_search.click(this.proxy(this._search));
		this.auditType = this.qid("auditType").select2({
			placeholder : "请选择审计类型",
			allowClear : true,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				type : "post",
				dataType : "json",
				data : function(term, page) {
					return {
						"tokenid" : $.cookie("tokenid"),
						"method" : "getPlanType"
					};
				},
				results : function(data, page) {
					if (data.success) {
						return {
							results : data.data
						};
					}
				}
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		}).on("select2-selecting", this.proxy(function(e) {
			if (e.val == "SPOT" || e.val == "SPEC") {
				this.grade.select2("enable", true);
			} else {
				this.grade.select2("enable", false);
			}
			this.opUnit.select2("enable", true).select2("val", "");
		}));
		this.grade = this.qid("grade").select2({
			placeholder : "请选择级别",
			allowClear : true,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				type : "post",
				dataType : "json",
				data : function(term, page) {
					return {
						"tokenid" : $.cookie("tokenid"),
						"method" : "getCheckGrade"
					};
				},
				results : function(data, page) {
					if (data.success) {
						return {
							results : data.data
						};
					}
				}
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		});
		this.grade.select2("enable", false);
		this.opUnit = this.qid("opUnit").select2({
			placeholder : "请选择执行安监机构",
			multiple : true,
			allowClear : true,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				type : "post",
				dataType : "json",
				data : this.proxy(function(term, page) {
					return {
						"tokenid" : $.cookie("tokenid"),
						"planType" : this.auditType.select2("val"),
						"name" : term,
						"method" : "getAuditReportOperators"
					};
				}),
				results : function(data, page) {
					if (data.success) {
						return {
							results : data.data.aaData
						};
					} else {
						$.u.alert.error(data.reason, 2000);
					}
				}
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		}).on("select2-selecting", this.proxy(function(e) {
			this.auditUnit.select2("enable", true).select2("val", "");
		}));
		this.opUnit.select2("enable", false);
		this.auditUnit = this.qid("auditUnit").select2(
				{
					placeholder : "请选择被审计安监机构",
					multiple : true,
					allowClear : true,
					ajax : {
						url : $.u.config.constant.smsqueryserver,
						type : "post",
						dataType : "json",
						data : this.proxy(function(term, page) {
							return {
								"tokenid" : $.cookie("tokenid"),
								"planType" : this.auditType.select2("val"),
								"checkType" : this.grade.select2("val"),
								"operators" : JSON.stringify(this.opUnit
										.select2("val")),
								"name" : term,
								"method" : "getAuditReportTargets"
							};
						}),
						results : function(data, page) {
							if (data.success) {
								return {
									results : data.data.aaData
								};
							} else {
								$.u.alert.error(data.reason, 2000);
							}
						}
					},
					formatResult : function(item) {
						return item.name;
					},
					formatSelection : function(item) {
						return item.name;
					}
				});
		this.professions = this.qid("professions").select2({
			placeholder : "请选择专业",
			multiple : true,
			allowClear : true,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				type : "post",
				dataType : "json",
				data : this.proxy(function(term, page) {
					return {
						"tokenid" : $.cookie("tokenid"),
						"dataobject":"dictionary",
						"rule":JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
						"name" : term,
					    "method" : "stdcomponent.getbysearch"
					};
				}),
				results : function(data, page) {
					if (data.success) {
					return {
							results : data.data.aaData
						};
					} else {
						$.u.alert.error(data.reason, 2000);
					}
				}
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		});
		this.auditUnit.select2("enable", false);
		this.getYear();
		this.form.validate({
			rules: {
				auditType: "required",
				_years: "required"
			},
			messages: {
				auditType: "请选择审计类型",
				_years: "请选择年份"
			},
			errorClass: "text-danger text-validate-element",
	        errorElement:"div"
		});
	},
	_search: function(e){
		if(this.form.valid()){
			var param = {
				url: $.u.config.constant.smsqueryserver,
				data: {
	                "method": "getAdtRstLineByAdtRptDate",
	                "planType": this.auditType.select2("val"),
	                "checkType": this.grade.select2("val"),
	                "operators": JSON.stringify(this.opUnit.select2("val")),
	                "targets": JSON.stringify(this.auditUnit.select2("val")),
	                "years": JSON.stringify(this.years.select2("val")),
	                "professions":JSON.stringify(this.professions.select2("val"))
	            },
	            callback: this.proxy(function (response) {
	                if (response.success) {
	                    this._setData(response);
	                }
	            })
			};
			this._ajax(param);
		}else{
			$('div[id$="years"]').css("display","block");
		}
	},
	
	getYear : function(){
		var date = new Date(), data = [], year = date.getFullYear();
		for(var i = year,j = year-5; i >= j; i--){
			data.push({ "id": "" + i, "text": "" + i});
		}
		this.years = this.qid("_years").select2({
			placeholder: "请选择年份",
			allowClear : true,
    		multiple: true,
			data: data
		});
	},
    _setData : function(data){
    	var option = {
		    title: {
		        
		    },
		    tooltip: {
		        trigger: 'axis',
		        backgroundColor: 'black',
		        axisPointer: {
		            type: 'shadow'
		        }
		    },
		    legend: {
		        x: 'right',
		        data:[]
		    },
		    toolbox: {
		        show: true,
		        orient: 'vertical',
		        y: 'center',
		        feature: {
		            mark: {show: true},
		            dataView: {show: true, readOnly: false},
		            restore: {show: true},
		            saveAsImage: {show: true}
		        }
		    },
		    calculable: false,
		    grid: {
		        y: 80,
		        y2: 40,
		        x2: 40
		    },
		    xAxis: [
		        {
		            type: 'category',
		            data: data.timeLine
		        }
		    ],
		    yAxis: [
		        {
		            type: 'value'
		        }
		    ],
		    series: [
		    ]
		};
    	$.each(data.data.aaData, function(k, v){
    		option.series.push({
    			 name: v.name,
    			 type: 'bar',
    			 data: v.value
    		});
    		option.legend.data.push(v.name);
    	});
		require.config({
			paths : {
				echarts : '../../sms/dash/echarts/js'
			}
		});
		require(['echarts', 'echarts/chart/bar'],
            this.proxy(function (ec) {
            	var	myChart = ec.init(document.getElementById('auditCon'));
            	myChart.setOption(option);
            })
        )
    },
    _ajax : function(param) {
		$.u.ajax({
			url : param.url,
			datatype : "json",
			type : 'post',
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param.data)
		}, this.$).done(this.proxy(function(response) {
			param.callback(response);
		}));
	}
}, { usehtm: true, usei18n: false });

com.audit.dash.auditConclusion.widgetjs = [
                              '../../../uui/widget/select2/js/select2.min.js',
							  '../../../uui/widget/spin/spin.js',
							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
							  '../../../uui/widget/ajax/layoutajax.js',
							  '../../../uui/widget/validation/jquery.validate.js',
							  '../../sms/dash/echarts/js/echarts.js'];
com.audit.dash.auditConclusion.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                            {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];