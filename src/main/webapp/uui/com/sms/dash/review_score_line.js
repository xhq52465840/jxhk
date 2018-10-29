//@ sourceURL=com.sms.dash.review_score_line
$.u.define('com.sms.dash.review_score_line', null, {
	init: function (options) {
		this._options = options||{};
		require.config({paths : {echarts : './echarts/js'}});
	},
    afterrender: function (bodystr) {
    	this.select_year = this.qid("select_year");
		this.btn_search = this.qid("btn_search");
		this.btn_search.off("click").on("click",this.proxy(this.search));
    	this._setSelect();
    	this.btn_search.click();
    },
    _setSelect : function(){
    	//1、获取当前年2、生成前十年3、下拉
    	this.select_year.empty();
    	var today = new Date();
    	var year = today.getFullYear();
    	for(var i = year; i >= year-10; i--){
    		$('<option value="'+i+'">'+i+'年</option>').appendTo(this.select_year);
    	}
    },
	search : function(){
		var year = this.select_year.val();
		this._loadData(year);
	},
    _loadData : function(param){
    	$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			data :	{
				"tokenid" : $.cookie("tokenid"),
				"method" : "getMethanolsForUnits",
				"year" : param
			}
		}).done(this.proxy(function(data) {
			if (data.success) {
				if (window.parent.resizeGadget) {
					window.parent.resizeGadget(this._options.gadgetsinstance, $('body').outerHeight(true) + 'px');
					window.parent.setGadgetTitle(this._options.gadgetsinstance, "评审趋势图");
				}
				this._setData(data);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
    },
    _setData : function(data){
    	var legendData = [], seriesData = [], selectedData = {},time = [];
    	data.methanols && $.each(data.methanols,this.proxy(function(key,value){
    		var name = key.split(",")[1].split("=")[1].replace("}","");
    		var data = [];
    		$.each(value,this.proxy(function(k,v){
    			data.push(v.score);
    		}))
    		legendData.push(name);
    		seriesData.push({
    			name:name,
	            type:'bar',
	            data:data,
	            score:value
    		})
    	}))
    	data.timeData && $.each(data.timeData, this.proxy(function(key,value){
    		time.push(value.year+"年第"+value.season+"季度");
    	}))
    	var option = this._line(legendData, selectedData, time, seriesData);
		require([ 'echarts', 'echarts/chart/bar'],this.proxy(function (ec) {
            var myChart2 = ec.init(document.getElementById('review_score_line'));
            var length = legendData.length;
            var height = null;
            var width =$('#review_score_line').width();
            if(width < 1024){
            	height = parseInt(length/6*28);
            }else if(width > 1024 && width < 1700){
            	height = parseInt(length/16*28+20);
            }else{
            	height = parseInt(length/22*28);
            }
            option.grid.y = height;
            myChart2.setOption(option);
            var ecConfig = require('echarts/config');
            myChart2.on(ecConfig.EVENT.CLICK, this.proxy(function(param,myChart2) {
            	var Series = myChart2.getSeries();
				var score = Series[param.seriesIndex].score;
				var id = score[param.dataIndex].id;
				var s = window.encodeURIComponent(window.encodeURIComponent(param.name));
				if (window.parent) {
					window.parent.open("safeReview.html?id="+id+"&s="+s);
				}else{
					window.open("safeReview.html?id"+id+"&s="+s);
				}
			}));
			myChart2.on(ecConfig.EVENT.HOVER, this.proxy(function(param) {
			    $('.echarts-tooltip').empty().text(param.seriesName+":"+param.value);
				return false;
			}));
        }));
    },
	_line: function (legendData, selectedData, time, seriesData) {
		return {
		    title : {

		    },
		    backgroundColor : 'white',
		    tooltip : {
		        trigger: 'axis'
		    },
		    legend: {
		        data:legendData,
		        selected:selectedData
		    },
		    grid : {
  		    	y:''
  		    },
		    toolbox: {
		        show : true,
		        x : 'right',
  		        y : 'center',
  		        orient : 'vertical',
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: true},
		            magicType : {show: true, type: ['bar']},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : false,
		    xAxis : [
		        {
		            type : 'category',
		            name : '季度',
		            data : time
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value',
		            name : '分',
		            axisLabel : {
		                formatter: '{value} '
		            }
		        }
		    ],
		    series : seriesData
		};
	}
}, { usehtm: true, usei18n: false });

com.sms.dash.review_score_line.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
							  '../../../uui/widget/spin/spin.js',
							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
							  '../../../uui/widget/ajax/layoutajax.js',
							  'echarts/js/echarts.js',
							  '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.review_score_line.widgetcss = [{id:'',path:'../../../uui/widget/select2/css/select2.css'},
							   {id:'',path:'../../../uui/widget/select2/css/select2-bootstrap.css'},
							   { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
							   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
