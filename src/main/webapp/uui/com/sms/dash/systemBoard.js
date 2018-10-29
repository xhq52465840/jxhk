// @ sourceURL=com.sms.dash.systemBoard
$.u.define('com.sms.dash.systemBoard', null, {
	init : function(mode, gadgetsinstanceid) {
		this._initmode = mode;
		this._gadgetsinstanceid = gadgetsinstanceid;
		this._gadgetsinstance = null;
	},
	afterrender : function(bodystr) {
		this.display = this.qid('display'); // 显示界面
		this.config = this.qid('config'); // 编辑界面
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
	                }else{
	                	this.qid('unit').select2("data",{"name":"全部","id":"0"});
	                }
	            } else if(this._initmode == "display"){
	                this.display.removeClass("hidden");
	                if(this.line_options){
	                	this.qid('unit').select2("data",{"name":this.line_options.unitName,"id":this.line_options.unit});
	                	this._reloadData({"method":"getScoreByUnit","unit":this.line_options.unit||"0"});
	                }else{
	                	this.qid('unit').select2("data",{"name":"全部","id":"0"});
	                	//this._reloadData({"method":"getScoreByUnit"});
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
	_loadData : function(data) {
		var unitData = JSON.parse(this._gadgetsinstance.urlparam);
		var r = new Raphael("mainSystemBoard", 800, 500),
	        angle = 0,//旋转角度
	        alpha = parseInt(360 / (data.data.length)),//固定旋转角度
			unitId = parseInt(unitData.unit),//安监机构id
			unitName = window.escape(escape(unitData.unitName)),//安监机构名称
	 	 	date = data.date,//开始日期
	 	 	sysTypeId = 0,
	 	 	sysTypeName = 0,
	 	 	warningValue = data.warningValue;
		var c = null;
		var warningValue1 = parseInt(warningValue*(1/3));
		var warningValue2 = parseInt(warningValue*(2/3));
		$.each(data.data,this.proxy(function(k,v){
			var t = "r" + angle + " 400 240";
			var value = parseInt(v.value);
			if(value <= warningValue1){
				c = "#00B050";
			}else if(value > warningValue1 && value <= warningValue2){
				c = "#FFC000";
			}else if(value > warningValue2){
				c = "#FF0000";
			}
			sysTypeId = parseInt(v.id);//系统id
 	 		sysTypeName = window.escape(escape(v.name));//系统名称
 	 		var dblData = {
 	 				"unitId":unitId,
 	 				"unitName":unitName,
 	 				"date":date,
 	 				"sysTypeId":sysTypeId,
 	 				"sysTypeName":sysTypeName
 	 		};
			if((360 - angle) > 0){
				var circle = r.circle(400, 400, 50).attr({ stroke: c, fill: c, transform: t, "fill-opacity": 1 ,"cursor":"pointer"}).data("value", $.param(dblData)).data("score",v.value).dblclick(function () {
            		var url = "ViewSystemAppraiseCopy.html?"+this.data("value");
					window.open(url);	
                })
                /*.mouseover(function () {
                    this.animate({ "fill-opacity": .75 }, 500);
                }).mouseout(function () {
                    this.animate({ "fill-opacity": .4 }, 500);
                });*/
				var x = circle.getBBox().cx;
                var y = circle.getBBox().cy;
                var b = r.text(x, y, v.value).attr({ fill: "#fff", "font-size":30,"cursor":"pointer"}).data("value", $.param(dblData)).data("score",v.value).dblclick(function(){
            		var url = "ViewSystemAppraiseCopy.html?"+this.data("value");
					window.open(url);
                });
                var d = null;
                var fc = "white";
                var fw = "bold";
                var lc = "white";
                if(angle >= 0 && angle < 180){
                	r.path("M"+(x-50)+" "+y+"L"+(x-140)+" "+y).attr({fill: "lc", stroke : "#fff","stroke-width": 2});
                	r.text(x-140, y+20, v.name).attr({fill: fc,"font-size":20,"font-weight":fw});
                }else if(angle >= 180 && angle < 360){
                	r.path("M"+(x+50)+" "+y+"L"+(x+140)+" "+y).attr({fill: "lc", stroke : "#fff","stroke-width": 2});
                	r.text(x+140, y+20, v.name).attr({fill: fc,"font-size":20,"font-weight":fw});
                }
			}
			angle += alpha;
		}));
		sysTypeId = 0,
 	 	sysTypeName = 0;
		var ccc = "";
		if(data.sum.value <= warningValue1){
			ccc = "#00B050";
		}else if(data.sum.value > warningValue1 && data.sum.value <= warningValue2){
			ccc = "#FFC000";
		}else if(data.sum.value > warningValue2){
			ccc = "#FF0000";
		}
		var dblData = {
	 				"unitId":unitId,
	 				"unitName":unitName,
	 				"date":date,
	 				"sysTypeId":sysTypeId,
	 				"sysTypeName":sysTypeName
	 		};
		var cir = r.circle(400, 240, 70).attr({ stroke: "#fff", fill: ccc,"cursor":"pointer"}).data("value", $.param(dblData)).data("score",data.sum.value).dblclick(function () {
			var url = "ViewSystemAppraiseCopy.html?"+this.data("value");
			window.open(url);
        });
        var t = r.text(400, 240, data.sum.value).attr({ fill: "#fff", "font-size":30,"cursor":"pointer"}).data("value", $.param(dblData)).data("score",data.sum.value).dblclick(function () {
			var url = "ViewSystemAppraiseCopy.html?"+this.data("value");
			window.open(url);
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
					window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "：(安监机构：" + displayData.unitName + ")");
				}
				this._loadData(data);
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

		}));
	},
	/**
	 * @title 保存
	 * @param e
	 */
	on_update_click : function(e) {
		var data = this.qid("unit").select2("data");
		var pms = {
			unit : data.id,
			unitName : data.name
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

com.sms.dash.systemBoard.widgetjs = [ '../../../uui/widget/select2/js/select2.min.js', '../../../uui/widget/spin/spin.js',
		'../../../uui/widget/jqblockui/jquery.blockUI.js', '../../../uui/widget/ajax/layoutajax.js',
		'../../../uui/widget/jqurl/jqurl.js','raphael/raphael-min.js'];
com.sms.dash.systemBoard.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                    {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                    { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                    { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];