//@ sourceURL=com.sms.dash.reviewFunnel
$.u.define('com.sms.dash.reviewFunnel', null, {
    init: function(mode, gadgetsinstanceid) {
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
		var month = date.getMonth() + 1;
		var season = 0, cYear = 0;
		switch(month){
			case 1:
			case 2:
			case 3:
				season = 4;
				cYear = year-1;
				break;
			case 4:
			case 5:
			case 6:
				season = 1;
				cYear = year;
				break;
			case 7:
			case 8:
			case 9:
				season = 2;
				cYear = year;
				break;
			case 10:
			case 11:
			case 12:
				season = 3;
				cYear = year;
				break;
		}
		for(var i = year,j = year-5; i >= j; i--){
			$('<option value="'+i+'" '+(cYear===i ? 'selected="selected"' : '')+'>'+i+'</option>').appendTo(this.year);
		}
		this.season.find('option[value='+season+']').attr("selected", "selected");
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
                var legend = [], series = [], ids = [];
                $.each(list, function(k,v){
                    legend.push(v.unitName);
                    series.push(v.score);
                    ids.push(v.id);
                });
                this._reloaddata(legend, series, ids);
                if (window.parent.resizeGadget) {
                    window.parent.resizeGadget(this._gadgetsinstanceid,$("body").outerHeight(true));
                }
    		}
    	}));
    },
    _reloaddata:function(legendData, seriesData, ids){
    	var $this = this;
    	$this.ids = ids;
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
			var ecConfig = require('echarts/config');
            myChart2.on(ecConfig.EVENT.CLICK, function(param) {
				var id = $this.ids[param.seriesIndex];
				var name = $this.year.val() + "年第" + $this.season.val() + "季度";
				var s = window.encodeURIComponent(window.encodeURIComponent(name));
				if (window.parent) {
					window.parent.open("safeReview.html?id="+id+"&s="+s);
				}else{
					window.open("safeReview.html?id"+id+"&s="+s);
				}
			});
        });
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.reviewFunnel.widgetjs = [
                        		"../../../uui/widget/spin/spin.js",
                        		"../../../uui/widget/jqblockui/jquery.blockUI.js",
                        		"../../../uui/widget/ajax/layoutajax.js",
                        		'echarts/js/echarts.js'];
com.sms.dash.reviewFunnel.widgetcss = [];