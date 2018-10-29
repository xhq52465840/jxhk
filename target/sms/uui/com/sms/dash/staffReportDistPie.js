//@ sourceURL=com.sms.dash.staffReportDistPie
$.u.define('com.sms.dash.staffReportDistPie', null, {
    init: function (options) {
        this._options = options;
        require.config({paths : {echarts : './echarts/js'}});
    },
    afterrender: function () {
    	this.qid("search").off("click").on("click",this.proxy(this._search));
    	this.setCondition();
    	this._getData();
    },
    setCondition : function(){
        this.years = this.qid("years");
		this.months = this.qid("months");
        var date = new Date();
		var year = date.getFullYear();
		for(var i = year,j = 2005; i >= j; i--){
			$('<option value="'+i+'">'+i+'</option>').appendTo(this.years);
		}
    },
    _search : function(){
		var years = this.years.val();
		var months = this.months.val();
		if(years == 0 && months !=0){
			$.u.alert.warn("请输入年份");
			return false;
		}
		if(years != 0 && months ==0){
			$.u.alert.warn("请输入月份");
			return false;
		}
		this._getData();
	},
	_getData : function(){
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method":"getStaffReportStatusDist",
                "year": this.years.val(),
				"month": this.months.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				this._reloadStaffReportStatusDistPie(response.data.nameData, response.data.seriesData);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _reloadStaffReportStatusDistPie:function(nameData, seriesData) { 
    	var option = {
    		    title : {
    		    	text: '员工报告状态分布',
    		    	x:'center'
    		    },
    		    tooltip : {
    		        trigger: 'item',
    		        formatter: "{a} <br/>{b} : {c} ({d}%)"
    		    },
    		    legend: {
    		    	orient : 'vertical',
    		        x : 'left',
    		        data: nameData
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
    		            name:'员工报告状态分布',
    		            type:'pie',
    		            radius : '55%',
    		            center: ['50%', '60%'],
    		            data: seriesData,
    		            itemStyle: {
                     	   normal: {
                     		    label:{ 
                                     show: true, 
                                     formatter: '{b} : {c} ({d}%)',
                                     textStyle : {
           	                            fontSize : '13',
           	                            fontFamily : '微软雅黑',
           	                            fontWeight : 'bold',
           	                        }
                                 }, 
                                 labelLine: {
                             	    show:true
                                 }
                            },
                            emphasis: {
                                 shadowBlur: 10,
                                 shadowOffsetX: 0,
                                 shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
    		        }
    		    ]
    		};
    	require.config({
			paths : {
				echarts : './echarts/js'
			}
		});
		// 使用
		require([ 'echarts', 'echarts/chart/pie', 'echarts/chart/funnel', 'echarts/config' ],
            function (ec) {
                // --- 饼图 ---
                var myChart2 = ec.init(document.getElementById('staffReportDistPie'));
                myChart2.setOption(option);
            }
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.staffReportDistPie.widgetjs = [
                               		'../../../uui/widget/select2/js/select2.min.js',
                            		"../../../uui/widget/spin/spin.js",
                            		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                            		"../../../uui/widget/ajax/layoutajax.js",
                            		'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];

com.sms.dash.staffReportDistPie.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];