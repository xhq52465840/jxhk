//@ sourceURL=com.sms.dash.funnel
$.u.define('com.sms.dash.funnel', null, {
    init: function (mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
    },
    afterrender: function (bodystr) {
    	this.qid("search").off("click").on("click",this.proxy(this._search));
    	this.setCondition();
        this._getData();
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
    setCondition : function(){
        this.year = this.qid("year");
		this.season = this.qid("season");
        var date = new Date();
		var year = date.getFullYear();
		for(var i = year,j = year-5; i >= j; i--){
			$('<option value="'+i+'">'+i+'</option>').appendTo(this.year);
		}
    },
    _getData : function(){
    	$.u.ajax({
    		url:$.u.config.constant.smsqueryserver,
    		dataType: "json",
    		data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getAllMethanol",
                "year": this.year.val(),
				"season": this.season.val()
			}
    	}).done(this.proxy(function(response){
    		if(response.success){
                var list = response.data.sort(function(data0, data1) {
    				return data0.score - data1.score;
    			});
                var legend = [], series = [];
                $.each(list, function(k,v){
                    legend.push(v.unitName);
                    series.push(v.score);
                });
                this._reloaddata(legend, series);
                if (window.parent.resizeGadget) {
                    window.parent.resizeGadget(this._gadgetsinstanceid,($("body").outerHeight(true)) + "px");
                }
    		}
    	}));
    },
    _reloaddata:function(legendData, seriesData){
        require.config({
            paths:{ 
            	echarts:'echarts/js'
            }
        });
    	require(['echarts','echarts/chart/bar'],function (ec) {
            var option = {
                title: {
                    text: '',
                    subtext: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: { show: true },
                        dataView: { show: true, readOnly: true },
                        magicType: { show: false },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                calculable: false,
                grid: {
                    x: '150px',
                    y: '0px',
                    y2: '10px'
                },
                xAxis: [
                    {
                        type: 'value',
                        boundaryGap: [0, 0.01]
                    }
                ],
                yAxis: [
                    {
                        type: 'category',
                        data: legendData
                    }
                ],
                series: [
                    {
                        name: '得分',
                        type: 'bar',
                        data: seriesData
                    }
                ]
            };
            var myChart2 = ec.init(document.getElementById('mainFunnel'));
            myChart2.setOption(option);
        });
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.funnel.widgetjs = [
                        		'../../../uui/widget/select2/js/select2.min.js',
                        		"../../../uui/widget/spin/spin.js",
                        		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                        		"../../../uui/widget/ajax/layoutajax.js",
                        		'echarts/js/echarts.js', '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.funnel.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }];