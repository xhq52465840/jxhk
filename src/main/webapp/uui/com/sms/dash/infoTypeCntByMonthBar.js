//@ sourceURL=com.sms.dash.infoTypeCntByMonthBar
$.u.define('com.sms.dash.infoTypeCntByMonthBar', null, {
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
    		this.setCondition("Day");
    		this._getDataDay();
    	} else {
    		$('#tabs-1').hide();
    		$('#tabs-2').show();
    		this.qid("searchMonth").off("click").on("click",this.proxy(this._searchMonth));
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
    		this.startdate.val("");
    		this.enddate.val("");
    	} else {
    		this.yearBeginsMonth = this.qid("yearBeginsMonth");
    		this.yearEndsMonth = this.qid("yearEndsMonth");
    		this.monthBeginsMonth = this.qid("monthBeginsMonth");
    		this.monthEndsMonth = this.qid("monthEndsMonth");
    		var date = new Date();
    		var year = date.getFullYear();
    		for(var i = year,j = 2005; i >= j; i--){
    			$('<option value="'+i+'">'+i+'</option>').appendTo(this.yearBeginsMonth);
    			$('<option value="'+i+'">'+i+'</option>').appendTo(this.yearEndsMonth);
    		}
    		this.yearBeginsMonth.val('0');
    		this.yearEndsMonth.val('0');
    		this.monthBeginsMonth.val('0');
    		this.monthEndsMonth.val('0');
    	}
    },
    _searchDay : function(type){
    	var startDate = this.startdate.val();
    	var endDate = this.enddate.val();
    	
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
	_searchMonth : function(type){
    	var yearBegins = this.yearBeginsMonth.val();
    	var monthBegins = this.monthBeginsMonth.val();
    	var yearEnds = this.yearEndsMonth.val();
    	var monthEnds = this.monthEndsMonth.val();
		
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
	_getDataMonth : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method":"getInfoTypeCntByMonth",
                "yearBegin": this.yearBeginsMonth.val(),
                "monthBegin": this.monthBeginsMonth.val(),
                "yearEnd": this.yearEndsMonth.val(),
                "monthEnd": this.monthEndsMonth.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				this._reloadInfoTypeCntBar(response.data.xAxisdata, response.data.staffReportList, response.data.captainReportList, response.data.continousReportList, response.data.airSafeReportList, 'Month');
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _getDataDay : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method":"getInfoTypeCntByDay",
                "startDate": this.startdate.val(),
                "endDate": this.enddate.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				this._reloadInfoTypeCntBar(response.data.xAxisdata, response.data.staffReportList, response.data.captainReportList, response.data.continousReportList, response.data.airSafeReportList, 'Day');
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _reloadInfoTypeCntBar:function(xAxisdata, staffReportList, captainReportList, continousReportList, airSafeReportList, type) { 
    	var option = {
    			backgroundColor : 'white',
    			title : {
    		    	text: '信息类型数量'
    		    },
    		    tooltip : {
    		        trigger: 'axis',
    		        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
    		            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
    		        }
    		    },
    		    legend: {
    		        data:['员工安全报告','机长报告','持续监控信息', '航空安全信息']
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
    		            name:'员工安全报告',
    		            type:'bar',
    		            stack: '信息类型数量',
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
    		            data: staffReportList
    		        },
    		        {
    		            name:'机长报告',
    		            type:'bar',
    		            stack: '信息类型数量',
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
    		            data: captainReportList
    		        },
    		        {
    		            name:'持续监控信息',
    		            type:'bar',
    		            stack: '信息类型数量',
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
    		            data: continousReportList
    		        },
    		        {
    		            name:'航空安全信息',
    		            type:'bar',
    		            stack: '信息类型数量',
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
    		            data: airSafeReportList
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
	                var myChart2 = ec.init(document.getElementById('infoTypeCntByMonthBarDay'));
	                myChart2.setOption(option);
			    } else {
			    	var myChart2 = ec.init(document.getElementById('infoTypeCntByMonthBarMonth'));
	                myChart2.setOption(option);
			    }
                
            }
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.infoTypeCntByMonthBar.widgetjs = [
                               		'../../../uui/widget/select2/js/select2.min.js',
                            		"../../../uui/widget/spin/spin.js",
                            		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                            		"../../../uui/widget/ajax/layoutajax.js",
                            		'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];

com.sms.dash.infoTypeCntByMonthBar.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];