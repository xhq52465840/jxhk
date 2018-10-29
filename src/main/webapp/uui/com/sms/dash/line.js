//@ sourceURL=com.sms.dash.line
$.u.define('com.sms.dash.line', null, {
    init: function (mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
    },
    afterrender: function () {
    	this.display = this.qid("display");		// 显示界面
    	this.config = this.qid("config");		// 编辑界面
    	this.qid("activity").select2({
    		width:280,
    		ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type : "post",
                data:function(term,page){
    	        	return {
    	        		tokenid:$.cookie("tokenid"),
    					method:"getunits",
    					dataobject:"unit",
    					unitName:term == "" ? null :term
    				};
                },
    	        results:function(response,page,query){
    	        	if(response.success){
    	        		var all = {id:0,name:"全部"};
    	        		response.data.push(all);
    	        		response.data.reverse();
    	        		return {results:response.data};
    	        	}
    	        }
    		},
            formatResult:function(item){
            	return item.name;
            },
            formatSelection:function(item){
            	return item.name;
            }
    	});// 安监机构
    	this.qid("sysType").select2({
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
    	this._ajax(
			$.u.config.constant.smsqueryserver, 
			true,
			{
	            "method": "stdcomponent.getbyid",
	            "dataobject": "gadgetsinstance",
	            "dataobjectid": this._gadgetsinstanceid
	        }, 
	        this.$, 
	        {},
	        this.proxy(function(response){
	        	this._gadgetsinstance = response.data;
	            if (this._gadgetsinstance.urlparam != null) {
	                this.line_options = JSON.parse(this._gadgetsinstance.urlparam);
	            }else{
	            	this.line_options = null;
	            }
	            if (this._initmode == "config") {
	                this.config.removeClass("hidden");
	                if(this.line_options){
	            		this.qid("activity").select2("data",{"name":this.line_options.unitName,"id":this.line_options.unitId});
	            		this.qid("sysType").select2("data",{"name":this.line_options.sysTypeName,"id":this.line_options.sysTypeId});
	                }else{
	                	this.qid("activity").select2("data",{"name":"全部","id":"0"});
	                	this.qid("sysType").select2("data",{"name":"全部","id":"0"});
	                }
	            } else if(this._initmode == "display"){
	                this.display.removeClass("hidden");
	                if(this.line_options != null){
	                	if(this.line_options.unitId == "0" && this.line_options.sysTypeId == "0"){
	                		this._reloadData({"method":"calculateLine"});
	                	}else{
	                		this._search(this.line_options.unitId,this.line_options.sysTypeId);
	                	}
	                }else{
	                	this._reloadData({"method":"calculateLine"});
	                }
	                
	            }    
	        })
	    );
        
        
    	require.config({
            paths:{ 
            	echarts:'echarts/js'
            }
        });

        this.qid("update").click(this.proxy(this.on_update_click));
        this.qid("cancel").click(this.proxy(function(){
        		this.display.removeClass("hidden");		// 显示界面
        		window.location.href = window.location.href.replace("config", "display");
        		if(this.line_options != null){
                	if(this.line_options.unitId == "0" && this.line_options.sysTypeId == "0"){
                		this._reloadData({"method":"calculateLine"});
                	}else{
                		this._search(this.line_options.unitId,this.line_options.sysTypeId);
                	}
                }else{
                	this._reloadData({"method":"calculateLine"});
                }
        }));
    },
    /**
     * @title 保存
     * @param e
     */
    on_update_click:function(e){
    	$.ajax({
			url : $.u.config.constant.smsmodifyserver,
			type : "post",
			dataType : "json",
			cache : false,
			async : false,
			"data" : {
				"tokenid" : $.cookie("tokenid"),
				"method" : "stdcomponent.update",
				"dataobject" : "gadgetsinstance",
				"dataobjectid" : this._gadgetsinstanceid,
				"obj" : JSON.stringify({"urlparam" : JSON.stringify({"unitId" : this.qid("activity").select2("data").id,"unitName" : this.qid("activity").select2("data").name,
																	"sysTypeId" :this.qid("sysType").select2("data").id,"sysTypeName":this.qid("sysType").select2("data").name})})
			}
		}).done(this.proxy(function(response) {
				$.u.alert.info("更新插件配置成功");
				window.location.href = window.location.href.replace("config", "display");
		}));
    	
    },
    /**
     * @title 查询安监机构
     * @param e
     * @returns {Boolean}
     */
    _search:function(unit,sysType){
		this._reloadData({method:"calculateLineByItem","unit":unit,"sysType":sysType});
    },
   
    /**
     * @title 获取用于echart显示的数据
     * @param param {object} ajax param
     */
    _reloadData:function(param){
    	var timeaxis = [],consequencename = [],seriesdata = [],selected = {},lendstr = "{";
    	$.u.ajax({
    		url : $.u.config.constant.smsqueryserver,
    		dataType : 'json',
    		type : 'post',
    		cache : false,
    		data:$.extend({
				'tokenid' : $.cookie("tokenid")
				}, param)
    	}).done(this.proxy(function(response){
    			$.each(response.data[0], function(key, value) {
    				if(key.indexOf("大风险平均值") > 0){
    					consequencename.push(key);
    					seriesdata.push({
							name : key,
							type : 'line',
							stack : null,
							data : value,
							smooth : true,
	    					markLine : {
	    						data : [ {type : 'average',name : '平均值'} ]
	    					}
						}) ;
    				}
				});
    			$.each(response.data,function(idx,item){
    				
    				if(idx>0  && idx <30 || idx>40  && idx <84 ){
    					consequencename.push(item.name);
    					lendstr += "\""+item.name+"\""+":false,";
    					seriesdata.push({
    								name : item.name,
    								type : 'line',
    								stack : null,
    								data : item.value,
    								smooth : true,
    		    					markLine : {
    		    						data : [ {type : 'average',name : '平均值'} ]
    		    					}
    							}) ;
    				};
    			});
    			var lendstrsub = lendstr.substring(0,(lendstr.length-1)) + "}";
    			selected = JSON.parse(lendstrsub);
				timeaxis = response.time;
				this._reloadSource(timeaxis,consequencename,seriesdata,selected);//加载组件
				if (window.parent) {
			        window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
			        window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "　　安监机构：" + (this.line_options && this.line_options.unitName) +"　　系统分类："+(this.line_options && this.line_options.sysTypeName));
				}
    		})
    	);
    },
    /**
     * @title init echart
     * @param timeaxis
     * @param consequencename
     * @param seriesdata
     */
    _reloadSource:function(timeaxis,consequencename,seriesdata,selected) { 
  	  require(
          [
  			'echarts',
  			'echarts/chart/line','echarts/chart/bar'
          ],
      this.proxy(function (ec) {
          // --- 折线 ---
      	var option = {
      			backgroundColor : 'white',
      		    tooltip : {
      		        trigger: 'axis'
      		    },
      		    legend: {
      		    	x :'center',
      		    	y :'top',
      		    	orient :'horizontal',
      		    	selected : selected,
      		        data : consequencename
      		    },
      		    toolbox: {
      		        show : true,
      		        x : 'right',
      		        y : 'center',
      		        orient : 'vertical',
      		        feature : {
      		            mark : {show: true},
      		            dataView : {show: true, readOnly: false},
      		            magicType : {show: true, type: ['line', 'bar']},
      		            restore : {show: true},
      		            saveAsImage : {show: true}
      		        }
      		    },
      		    grid : {
      		    	y:120
      		    },
      		    calculable : false,
      		    xAxis : [
      		        {
      		            type : 'category',
      		            boundaryGap : false,
      		        	data : timeaxis,
      		        	name : '日期'
      		        }
      		    ],
      		    yAxis : [
      		        {
      		            type : 'value',
      		            splitNumber : '2',
      		            name : '分数'
      		        }
      		    ],
      		    series : seriesdata
      		};
          var myChart2 = ec.init(document.getElementById('mainLine'));
          myChart2.setOption(option);
      }));
    },
    /**
     * @title ajax
     * @param url {string} ajax url
     * @param async {bool} async
     * @param param {object} ajax param
     * @param $container {jQuery object} block
     * @param blockParam {object} block param
     * @param callback {function} callback
     */
    _ajax:function(url,async,param,$container,blockParam,callback){
    	$.u.ajax({
			url:url,
			datatype:"json",
			"async":async,
			data:$.extend({
				tokenid:$.cookie("tokenid")
			},param)
		},$container || this.$,$.extend({},blockParam||{})).done(this.proxy(function(response){
			if(response.success){
				callback(response);
			}
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
       
		}));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.line.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                              "../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              'echarts/js/echarts.js',
                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.line.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                               {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                               { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];