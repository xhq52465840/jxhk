//@ sourceURL=com.sms.dash.singleDchen
$.u.define('com.sms.dash.singleDchen', null, {
    init: function (options) {
        this._options = options || {};
    },
    afterrender: function (bodystr) {
        var date = new Date();
        var year = date.getFullYear();
    	this.draw(year);
    },
    draw: function (year) {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type: "post",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getMethanolsByMultiCon",
                "unitId": this._options.unitId,
                "year": year
            }
        }, this.$).done(this.proxy(function (response) {
            if (response.success) {
                this._drawLine(response);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    },
    _drawLine: function(data){
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
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            calculable: false,
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name : '分数',
                    axisLabel: {
                        formatter: '{value}'
                    }
                }
            ],
            series: [
                {
                    name: '分数',
                    type: 'line',
                    data: []
                }
            ]
        };
    	data.methanols && $.each(data.methanols, function(k,v){
            option.series[0]["data"].push(v.score);
        });
        data.timeData && $.each(data.timeData, function(k,v){
            option.xAxis[0]["data"].push(v.year+"年第"+v.season+"季度");
        });
        require.config({
            paths:{ 
            	echarts:'echarts/js'
            }
        });
        require(['echarts','echarts/chart/line','echarts/config'],
            this.proxy(function (ec) {
            	var $div = $('<div id="'+this._id+'pie" style="height:480px;width:960px;border:0px solid #ccc;padding:10px;"></div>');
            	$div.appendTo(this.$);
            	var myChart2 = ec.init($div.get(0));
                myChart2.setOption(option);
            })
        );
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.singleDchen.widgetjs = ["../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              "echarts/js/echarts.js"];
com.sms.dash.singleDchen.widgetcss = [];