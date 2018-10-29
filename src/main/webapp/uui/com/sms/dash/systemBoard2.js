// @ sourceURL=com.sms.dash.systemBoard2
$.u.define('com.sms.dash.systemBoard2', null, {
	init : function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._gadgetsinstance = null;
	},
	afterrender : function(bodystr) {
		this.display = this.qid('display'); // 显示界面
		this.config = this.qid('config'); // 编辑界面
		this.sysType = this.qid("sysType"); //选择系统
		 require.config({
				paths : {
					echarts : './echarts/js'
				}
			});

		 if(this._initmode == 'config'){
			// 安监机构
			this.qid('unit').select2({
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
								response.data.push(all);
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
			
			this.sysType.select2({
	    		width:280,
	    		ajax:{
	    			url: $.u.config.constant.smsqueryserver,
	    			dataType: "json",
	    			type : "post",
	                data:function(term,page){
	    	        	return {
	    	        		tokenid:$.cookie("tokenid"),
	    					method:"stdcomponent.getbysearch",
	    					dataobject:"dictionary",
	    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
	    				};
	                },
	    	        results:function(response,page,query){
	    	        	if(response.success){
	    	        		var all = {id:0,name:"全部"};
	    	        		response.data.aaData.push(all);
	    	        		response.data.aaData.reverse();
	    	        		return {results:response.data.aaData};
	    	        	}
	    	        }
	    		},
	            formatResult:function(item){
	            	return item.name;
	            },
	            formatSelection:function(item){
	            	return item.name;
	            }
	    	});
		}
		
		this._ajax($.u.config.constant.smsqueryserver, true, 
            {
	            "method": "stdcomponent.getbyid",
	            "dataobject": "gadgetsinstance",
	            "dataobjectid": this._gadgetsinstanceid
		    }, this.$, {}, this.proxy(function(response) {
				this._gadgetsinstance = response.data;
	            if (this._gadgetsinstance.urlparam) {
	                this.line_options = JSON.parse(this._gadgetsinstance.urlparam);
	            }else{
	            	this.line_options = null;
	            }
	            if (this._initmode == "config") {
	                this.config.removeClass("hidden");
	                if(this.line_options){
	                	this.qid('unit').select2("data",{"name":this.line_options.unitName,"id":this.line_options.unit});
	                	this.qid("sysType").select2("data", {"name" : this.line_options.sysTypeName,"id" : this.line_options.sysTypeId});
	                }else{
	                	this.qid('unit').select2("data",{"name":"全部","id":"0"});
	                	this.qid("sysType").select2("data", {"name" : "全部","id" : "0"});
	                }
									window.parent && window.parent.resizeGadget && window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
	            } else if(this._initmode == "display"){
	                this.display.removeClass("hidden");
	                if(this.line_options){
	                	this.qid('unit').select2("data",{"name":this.line_options.unitName,"id":this.line_options.unit});
	                	this.qid("sysType").select2("data", {"name" : this.line_options.sysTypeName,"id" : this.line_options.sysTypeId});
	                	this._reloadData({"method":"systemLine","unit":this.line_options.unit||"0","system":this.line_options.sysTypeId||"0"});
	                }else{
	                	this.qid('unit').select2("data",{"name":"全部","id":"0"});
	                	this.qid("sysType").select2("data", {"name" : "全部","id" : "0"});
	                }
	            }
			}
		));

		this.qid("update").click(this.proxy(this.on_update_click));
		this.qid("cancel").click(this.proxy(function() {
			this.display.removeClass("hidden"); // 显示界面
			window.location.href = window.location.href.replace("config", "display");
		}));

	},
	_loadData : function(data,dblData) {
		var response = data;
		var length = response.data.length;
		if(length > 0){
			length = length - 1;
		}else{
			length = 0;
		}
		var option = {
		    title : {
		        text: '系统：' + dblData.sysTypeName,
		        x:'center'
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b}"
		    },
		    color : ['#FA0000'],
		    calculable : false,
		    series : [
		        {
		            name:'系统看板',
		            type:'pie',
		            radius : [0, 100],
		            center: [110, 225],
		            itemStyle : {
		                normal : {
		                    label : {
		                        position : 'inner',
		                        formatter: function (a) {
		                            return a.name+"：\n"+a.value+"分";
		                        },
		                        textStyle : {
		                        	fontSize : 20
		                        }
		                    },
		                    labelLine : {
		                        show : false
		                    }
		                }
		            },
		            data: [{value:response.data[length],name:'系统：' + dblData.sysTypeName}]
		        }
		    ]
		};
		var option2 = {
		    tooltip : {
		        trigger: 'axis',
		        axisPointer : {
		            type: 'shadow'
		        }
		    },
		    toolbox: {
		        show : true,
		        orient : 'vertical',
		        y : 'center',
		        feature : {
		            mark : {show: true},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : false,
		    color : ['#FA0000'],
		    xAxis : [
		        {
		            type : 'category',
		            data : response.timeline
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value',
		            splitArea : {show : true}
		        }
		    ],
		    grid: {
		        x2:40
		    },
		    series : [
		        {
		            name:'系统分数',
		            type:'line',
		            stack: '总量',
		            data:response.data
		        }
		    ]
		};
		
		require([ 'echarts', 'echarts/chart/pie', 'echarts/chart/line', 'echarts/config'], function(ec) {	
			var myChart = ec.init(document.getElementById('mainSystem'));
			myChart.setOption(option);
			var myChart2 = ec.init(document.getElementById('mainSystem2'));
			myChart2.setOption(option2);
			
			myChart.connect(myChart2);
			myChart2.connect(myChart);
			var ecConfig = require('echarts/config');
			myChart2.on(ecConfig.EVENT.DBLCLICK, function(param){
				var date = param.name.replace("-","/");
				date = date+"/01";
				var data = $.extend({},dblData,{"unitName":window.escape(escape(dblData.unitName)),"sysTypeName":window.escape(escape(dblData.unitName)),"date":date,"unitId":dblData.unit});
				var url = "ViewSystemAppraiseCopy.html?"+$.param(data);
				window.open(url);
			});
		});
	},
	/**
	 * 从后台获取数据
	 */
	_reloadData : function(param) {
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : 'json',
			type : 'post',
			cache : false,
			data : $.extend({
				'tokenid' : $.cookie("tokenid")
			}, param)
		}).done(this.proxy(function(data) {
			if (data.success) {
				if (window.parent) {
					var displayData = JSON.parse(this._gadgetsinstance.urlparam);
					window.parent.resizeGadget(this._gadgetsinstanceid, $('body').outerHeight(true));
					window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "：(安监机构：" + displayData.unitName + ",系统：" + displayData.sysTypeName + ")");
				}
				this._loadData(data,displayData);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	/**
	 * @title 保存
	 * @param e
	 */
	on_update_click : function(e) {
		var pms = {
			"unit" : this.qid("unit").select2("data").id,
			"unitName" : this.qid("unit").select2("data").name,
			"sysTypeId" : this.sysType.select2("data").id,
			"sysTypeName":this.sysType.select2("data").name
		}
		if (this.qid("unit").val()) {
			this._ajax($.u.config.constant.smsmodifyserver, true, {
				"method" : "stdcomponent.update",
				"dataobject" : "gadgetsinstance",
				"dataobjectid" : this._gadgetsinstanceid,
				"obj" : JSON.stringify({
					"urlparam" : JSON.stringify(pms)
				})
			}, this.$, {}, this.proxy(function(response) {
				$.u.alert.info("更新插件配置成功");
				window.location.href = window.location.href.replace("config", "display");
			}));
		}

	},
	/**
	 * @title ajax
	 * @param url
	 *            {string} ajax url
	 * @param type
	 *            {string} ajax 请求类型
	 * @param async
	 *            {bool} async
	 * @param param
	 *            {object} ajax param
	 * @param $container
	 *            {jQuery object} block
	 * @param blockParam
	 *            {object} block param
	 * @param callback
	 *            {function} callback
	 */
	_ajax : function(url, async, param, $container, blockParam, callback) {
		$.u.ajax({
			url : url,
			datatype : "json",
			type : 'post',
			"async" : async,
			data : $.extend({
				tokenid : $.cookie("tokenid")
			}, param)
		}, $container || this.$, $.extend({}, blockParam || {})).done(this.proxy(function(response) {
			if (response.success) {
				callback(response);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	destroy : function() {
		this._super();
	}
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.systemBoard2.widgetjs = [ '../../../uui/widget/select2/js/select2.min.js', '../../../uui/widget/spin/spin.js',
										'../../../uui/widget/jqblockui/jquery.blockUI.js', '../../../uui/widget/ajax/layoutajax.js',
										'../../../uui/widget/jqurl/jqurl.js','echarts/js/echarts.js'];
com.sms.dash.systemBoard2.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                    {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                    { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                    { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];