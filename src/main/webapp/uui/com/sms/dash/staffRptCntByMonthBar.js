//@ sourceURL=com.sms.dash.staffRptCntByMonthBar
$.u.define('com.sms.dash.staffRptCntByMonthBar', null, {
    init: function (options) {
        this._options = options;
        require.config({paths : {echarts : './echarts/js'}});
    },
    afterrender: function () {
    	var index = $('li.active').index();
    	if (index == 0) {
    		$('#tabs-1').show();
    		$('#tabs-2').hide();
    		this.qid("searchDay").off("click").on("click",this.proxy(this._searchDay));
    		// 安监机构
    		this.qid('unitDay').select2({
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
//    						if (response.data.length != 1) {
    							response.data.push(all);
//    						}
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
    		this.setCondition("Day");
    		this._getDataDay();
    	} else {
    		$('#tabs-1').hide();
    		$('#tabs-2').show();
    		this.qid("searchMonth").off("click").on("click",this.proxy(this._searchMonth));
    		// 安监机构
    		this.qid('unitMonth').select2({
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
//    						if (response.data.length != 1) {
    							response.data.push(all);
//    						}
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
        	this.setCondition("Month");
        	this._getDataMonth();
    	}
    	
    	this.qid("countByDay").off("click").on("click",this.proxy(this._setActiveDay));
    	this.qid("countByMonth").off("click").on("click",this.proxy(this._setActiveMonth));
    },
    _setActiveDay : function(e){
    	this.qid("countByDay").attr("class", "active");
    	this.qid("countByMonth").attr("class", " ");
    	this.afterrender();
    },
    _setActiveMonth : function(e){
    	this.qid("countByDay").attr("class", " ");
    	this.qid("countByMonth").attr("class", "active");
    	this.afterrender();
    },
    setCondition : function(type){
    	if (type == 'Day') {
    		this.startdate = $("[name=startdate]");
    		this.enddate   = $("[name=enddate]");
    		this.startdate.add(this.enddate).datepicker({"dateFormat":"yy-mm-dd"});
    		this.unitIdDay = this.qid('unitDay');
    		this.qid('unitDay').select2("data", {"id":null,"name":"安监机构"});
    		this.startdate.val("");
    		this.enddate.val("");
    	} else {
    		this.yearBegins = this.qid("yearBegins");
    		this.yearEnds = this.qid("yearEnds");
    		this.monthBegins = this.qid("monthBegins");
    		this.monthEnds = this.qid("monthEnds");
    		this.unitId = this.qid('unitMonth');
    		this.qid('unitMonth').select2("data", {"id":null,"name":"安监机构"});
            var date = new Date();
    		var year = date.getFullYear();
    		for(var i = year,j = 2005; i >= j; i--){
    			$('<option value="'+i+'">'+i+'</option>').appendTo(this.yearBegins);
    			$('<option value="'+i+'">'+i+'</option>').appendTo(this.yearEnds);
    		}
    		this.yearBegins.val('0');
    		this.yearEnds.val('0');
    		this.monthBegins.val('0');
    		this.monthEnds.val('0');
    	}
    },
    _searchDay : function(type){
    	var startDate = this.startdate.val();
    	var endDate = this.enddate.val();
    	var unitStr = this.unitIdDay.val();
    	if (unitStr == null || unitStr == '') {
    		$.u.alert.warn("请选择安监机构");
			return false;
    	}
    	if (startDate != '' || endDate != '') {
    		if (startDate == null || startDate == '') {
        		$.u.alert.warn("请选择开始日期");
    			return false;
        	}
        	if (endDate == null || endDate == '') {
        		$.u.alert.warn("请选择结束日期");
    			return false;
        	}
        	var date1=Date.parse((startDate + ' 00:00:00').replace(/-/g,"/"));
        	var date2=Date.parse((endDate + ' 00:00:00').replace(/-/g,"/"));
        	if (date1 > date2) {
        		$.u.alert.warn("选择的开始日期不能大于结束日期");
    			return false;
        	}
    	}
    	this._getDataDay();
	},
	_searchMonth : function(){
    	var unitId = this.unitId.val();
		var yearBegins = this.yearBegins.val();
		var monthBegins = this.monthBegins.val();
		var yearEnds = this.yearEnds.val();
		var monthEnds = this.monthEnds.val();
		var unitStr = this.unitId.val();
    	if (unitStr == null || unitStr == '') {
    		$.u.alert.warn("请选择安监机构");
			return false;
    	}
		if (yearBegins != 0 || monthBegins != 0 || yearEnds != 0 || monthEnds != 0) {
			if(yearBegins == 0){
				$.u.alert.warn("请输入开始年份");
				return false;
			}
			if(monthBegins == 0){
				$.u.alert.warn("请输入开始月份");
				return false;
			}
			if(yearEnds == 0){
				$.u.alert.warn("请输入结束年份");
				return false;
			}
			if(monthEnds == 0){
				$.u.alert.warn("请输入结束月份");
				return false;
			}
			if (parseInt(yearBegins) > parseInt(yearEnds)) {
				$.u.alert.warn("选择的开始年月不能大于结束年月");
				return false;
			}
			if (parseInt(yearBegins) == parseInt(yearEnds) && parseInt(monthBegins) > parseInt(monthEnds)) {
				$.u.alert.warn("选择的开始年月不能大于结束年月");
				return false;
			}
		}
		this._getDataMonth();
	},
	_getDataDay : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method":"getStaffRptCntByDay",
				"startDate": this.startdate.val(),
                "endDate": this.enddate.val(),
                "unitId": this.unitIdDay.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				this._reloadStaffRptCntBar(response.data.xAxisdata, response.data.staffShiMingList, response.data.staffNiMingList, 'Day');
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _getDataMonth : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method":"getStaffRptCntByMonth",
                "yearBegin": this.yearBegins.val(),
                "monthBegin": this.monthBegins.val(),
                "yearEnd": this.yearEnds.val(),
                "monthEnd": this.monthEnds.val(),
                "unitId": this.unitId.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				this._reloadStaffRptCntBar(response.data.xAxisdata, response.data.staffShiMingList, response.data.staffNiMingList, 'Month');
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _reloadStaffRptCntBar:function(xAxisdata, staffShiMingList, staffNiMingList, type) { 
    	var option = {
    			backgroundColor : 'white',
    			title : {
    		    	text: '员工报告数量'
    		    },
    		    tooltip : {
    		        trigger: 'axis',
    		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
    		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
    		        }
    		    },
    		    legend: {
    		        data:['实名报告数量','匿名报告数量']
    		         },
    		    toolbox: {
    		        show : true,
    		        orient: 'vertical',
    		        x: 'right',
    		        y: 'center',
    		        feature : {
    		            mark : {show: true},
    		            dataView : {show: true, readOnly: false},
    		            magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
    		            restore : {show: true},
    		            saveAsImage : {show: true}
    		        }
    		    },
    		    calculable : true,
    		    xAxis : [
    		        {
    		            type : 'category',
    		            data : xAxisdata
    		        }
    		    ],
    		    yAxis : [
    		        {
    		            type : 'value'
    		        }
    		    ],
    		    series : [
    		        {
    		            name:'实名报告数量',
    		            type:'bar',
    		            stack: '员工报告数量',
                        itemStyle: {
       	            	 normal: { 
       			            label : {
       	                        show : true,
       	                        position: 'insideTop',
       	                        textStyle : {
       	                            fontSize : '13',
       	                            fontFamily : '微软雅黑',
       	                            fontWeight : 'bold',
       	                        }
       	                    }
       	            	 }
       	                },
    		            data: staffShiMingList
    		        },
    		        {
    		            name:'匿名报告数量',
    		            type:'bar',
    		            stack: '员工报告数量',
    		            itemStyle: {
          	            	 normal: { 
          			            label : {
          	                        show : true,
          	                        position: 'right',
          	                        textStyle : {
          	                            fontSize : '13',
          	                            fontFamily : '微软雅黑',
          	                            fontWeight : 'bold',
          	                        }
          	                    }
          	            	 }
          	                },
    		            data: staffNiMingList
    		        }
    		    ]
    		};
    	require.config({
			paths : {
				echarts : './echarts/js'
			}
		});
		// 使用
		require([ 'echarts', 'echarts/chart/bar', 'echarts/chart/line', 'echarts/config' ],
            function (ec) {
                // --- 柱状 ---
                if (type == 'Day') {
                	var myChart2 = ec.init(document.getElementById('infoTypeCntByDayBar'));
                    myChart2.setOption(option);
			    } else {
			    	var myChart2 = ec.init(document.getElementById('staffRptCntByMonthBar'));
	                myChart2.setOption(option);
			    }
            }
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.staffRptCntByMonthBar.widgetjs = [
                               		'../../../uui/widget/select2/js/select2.min.js',
                            		"../../../uui/widget/spin/spin.js",
                            		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                            		"../../../uui/widget/ajax/layoutajax.js",
                            		'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];

com.sms.dash.staffRptCntByMonthBar.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                                { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                                { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];