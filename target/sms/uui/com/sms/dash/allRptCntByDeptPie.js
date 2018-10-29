//@ sourceURL=com.sms.dash.allRptCntByDeptPie
$.u.define('com.sms.dash.allRptCntByDeptPie', null, {
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
        this.yearBegins = this.qid("yearBegins");
		this.yearEnds = this.qid("yearEnds");
		this.monthBegins = this.qid("monthBegins");
		this.monthEnds = this.qid("monthEnds");
        var date = new Date();
		var year = date.getFullYear();
		for(var i = year,j = 2005; i >= j; i--){
			$('<option value="'+i+'">'+i+'</option>').appendTo(this.yearBegins);
			$('<option value="'+i+'">'+i+'</option>').appendTo(this.yearEnds);
		}
    },
    _search : function(){
		var yearBegins = this.yearBegins.val();
		var monthBegins = this.monthBegins.val();
		var yearEnds = this.yearEnds.val();
		var monthEnds = this.monthEnds.val();
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
			if (yearBegins > yearEnds) {
				$.u.alert.warn("选择的开始年月不能大于结束年月");
				return false;
			}
			if (yearBegins == yearEnds && monthBegins > monthEnds) {
				$.u.alert.warn("选择的开始年月不能大于结束年月");
				return false;
			}
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
				"method":"getAllRptCntByDept",
                "yearBegin": this.yearBegins.val(),
                "monthBegin": this.monthBegins.val(),
                "yearEnd": this.yearEnds.val(),
                "monthEnd": this.monthEnds.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				this._reloadAllRptCntByDeptPie(response.data.nameData, response.data.seriesData);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _reloadAllRptCntByDeptPie:function(nameData, seriesData) {
    	var option = {
    		    title : {
    		    	text: '各类报告数量（按部门）',
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
    		            name:'各类报告数量（按部门）',
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
                var myChart2 = ec.init(document.getElementById('allRptCntByDeptPie'));
                myChart2.setOption(option);
            }
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.allRptCntByDeptPie.widgetjs = [
                               		'../../../uui/widget/select2/js/select2.min.js',
                            		"../../../uui/widget/spin/spin.js",
                            		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                            		"../../../uui/widget/ajax/layoutajax.js",
                            		'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];

com.sms.dash.allRptCntByDeptPie.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];