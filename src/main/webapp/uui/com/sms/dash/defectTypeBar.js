//@ sourceURL=com.sms.dash.defectTypeBar
$.u.define('com.sms.dash.defectTypeBar', null, {
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
				"method":"getDefectTypeList",
                "year": this.years.val(),
				"month": this.months.val()
			}
		}).done(this.proxy(function(response) {
			if (response.success) {
				var totalSize = response.data.totalSize;
				this.qid("totalSize").text("（缺陷类型总数：" + totalSize + "件）");
				
				this._reloadDefectTypeBar(response.data.xAxisdata, response.data.seriesData);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _reloadDefectTypeBar:function(xAxisdata, seriesData) { 
    	var option = {
    		    title : {
    		    	text: '缺陷类型排名',
    		        subtext: 'TOP10'
    		    },
    		    tooltip : {
    		        trigger: 'axis'
    		    },
    		    legend: {
    		        data:['缺陷类型']
    		    },
    		    toolbox: {
    		        show : true,
    		        feature : {
    		            mark : {show: true},
    		            dataView : {show: true, readOnly: false},
    		            magicType : {show: true, type: ['line', 'bar']},
    		            restore : {show: true},
    		            saveAsImage : {show: true}
    		        }
    		    },
    		    calculable : true,
    		    xAxis : [
    		        {
    		            type : 'category',
    		            "axisLabel": {
    	    	            "interval": 0,

    	    	        },
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
    		            name:'缺陷类型',
    		            type:'bar',
    		            barWidth:35,
    		            itemStyle: {
    		                 normal: {
    		                     label: {
    		                         show: true,
    		                         position:'insideTop',
    		                         textStyle: {
    		                             color: '#3398DB',
    		                             fontWeight:'bold',
    		                             fontSize:20
    		                         }
    		                     }
    		                 }
    		            },
    		            data:seriesData
    		        }
    		    ]
    		};
    	require.config({
			paths : {
				echarts : './echarts/js'
			}
		});
		// 使用
		require([ 'echarts', 'echarts/chart/bar', 'echarts/config' ],
            function (ec) {
                // --- 柱状 ---
                var myChart2 = ec.init(document.getElementById('defectTypeBar'));
                myChart2.setOption(option);
            }
        );
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.defectTypeBar.widgetjs = [
                               		'../../../uui/widget/select2/js/select2.min.js',
                            		"../../../uui/widget/spin/spin.js",
                            		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                            		"../../../uui/widget/ajax/layoutajax.js",
                            		'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];

com.sms.dash.defectTypeBar.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];