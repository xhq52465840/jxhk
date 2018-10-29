//@ sourceURL=com.sms.dash.systemappraise
$.u.define('com.sms.dash.systemappraise', null, {
    init: function(mode, gadgetsinstanceid) {
        this._initmode = mode;
        this._gadgetsinstanceid = gadgetsinstanceid;
        this._gadgetsinstance = null;
    },
    afterrender: function () {
    	this.display = this.qid("display");		// 显示界面
    	this.config = this.qid("config");		// 编辑界面
    	this.unit = this.qid("unit");
    	this.sysType = this.qid("sysType");
    	this.update = this.qid("update");
    	this.cancel = this.qid("cancel");
    	this.qid("unit").select2({
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
    	require.config({
            paths: {
                echarts: './echarts/js'
            }
        });
    	
    	this.systemTable = this.qid("system-table");
    	
    	$.u.ajax({
    		url:$.u.config.constant.smsqueryserver, 
    		dataType:"json",
    		type:"post",
    		"data":{
    			"tokenid":$.cookie("tokenid"),
    			"method": "stdcomponent.getbyid",
	            "dataobject": "gadgetsinstance",
	            "dataobjectid": this._gadgetsinstanceid
    		}
    	},this.$).done(this.proxy(function(response){
    		if(response.success){
            	this._gadgetsinstance = response.data;
                if (this._gadgetsinstance.urlparam != null) {
                    this.line_options = JSON.parse(this._gadgetsinstance.urlparam);
                }else{
                	this.line_options = null;
                }
                if (this._initmode == "config") {
                    this.config.removeClass("hidden");
                    if(this.line_options){
                    	this.unit.select2("data",{"name":this.line_options.unitName,"id":this.line_options.unitId});
                    	this.sysType.select2("data",{"name":this.line_options.sysTypeName,"id":this.line_options.sysTypeId});
                    }else{
                    	this.unit.select2("data",{"name":"全部","id":"0"});
                    	this.sysType.select2("data",{"name":"全部","id":"0"});
                    }
                    
                } else if(this._initmode == "display"){
                	this.display.removeClass("hidden");
                	this._reloadtable();
                }    
    		}
    	})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
 	   		
        }));
    	
    	this.update.click(this.proxy(this.on_update_click));
    	this.cancel.click(this.proxy(function(){
    		this.display.removeClass("hidden");
    		window.location.href = window.location.href.replace("config", "display");
    		this._reloadtable();
    	}));
    	
    	this.qid("seachdata").on("click",this.proxy(function(){
    		this._reloadtable({"date":this.qid("years").val()+"/"+this.qid("months").val()+"/01"});
    	}));
    	
    	this.systemTable.on("dblclick",this.proxy(function(e){
    		if($(e.target).hasClass("enable")){
    			if($(e.target).text() == "0"){
    				$.u.alert.success("该条件下没有重大风险，请重新选择！");
    				return false;
    			}
    			var url = "ViewSystemAppraiseCopy.html?unitId="+$(e.target).attr("data-unit")+"&sysTypeId="+$(e.target).attr("data-sys")+"" +
				"&unitName="+escape($(e.target).attr("unitName"))+"&sysTypeName="+escape($(e.target).attr("systemName"))+
				"&date="+this.qid("years").val()+"/"+this.qid("months").val()+"/01";
    			window.open(window.encodeURI(encodeURI(url)));
    		}
    	}));
    },
    	
    _reloadtable:function(param){
    	$.u.ajax({
    		url:$.u.config.constant.smsqueryserver,
    		dataType:"json",
    		type:"post",
    		data:$.extend({
    			tokenid:$.cookie("tokenid"),
    			method:"getScoreBySysType",
    		},param)
    	},this.$).done(this.proxy(function(response){
    		if(response.success){
    			$current = this.systemTable.find("thead").find("th");
        		$.each($current,this.proxy(function(idx,term){
        			if($(term).hasClass("sysType")){
        				$(term).remove();
        			}
        		}));
    			this.systemTable.find("tbody").empty();
    			//this.qid("years").find("option.temp").remove();
    			var year = (new Date()).format("yyyy")
    			this.qid("first1").text(year);
    			this.qid("first2").text(year - 1);
    			this.qid("first3").text(year - 2);
    			this.qid("first4").text(year - 3);
    			this.qid("first5").text(year - 4);
    			this.qid("first6").text(year - 5);
    			this.qid("first7").text(year - 6);
    			this.qid("first8").text(year - 7);
    			this.qid("first9").text(year - 8);
    			this.qid("first10").text(year - 9);
    			//this.qid("years").append("<option class='temp'>"+(response.year+1)+"</option><option class='temp'>"+(response.year-1)+"</option>");
    			this.qid(response.month).attr("selected","selected");
    			response.data[0] && $.each(response.data[0].sysType,this.proxy(function(index,term){
        			this.systemTable.find("thead").find("tr").append("<th class='sysType' style='background-color: beige;' sysId="+term.sysTypeId+">"+term.name+"</th>");
        		}));
        		$.each(response.data,this.proxy(function(idx,term){
        			this.systemTable.find("tbody").append("<tr><td style='background-color: beige;' unitId="+term.unitId+">"+term.unitName+"</td></tr>");
        		}));
        		var trdata = this.systemTable.find("tbody").find("tr");
        		$.each(response.data,this.proxy(function(index,term){
        			$.each(term.sysType,this.proxy(function(idx,sysdata){
        				$(trdata[index]).append("<td class='activity' systemName="+sysdata.name+" unitName="+term.unitName+" id="+term.unitId+sysdata.sysTypeId+" data-unit="+term.unitId+" data-sys="+sysdata.sysTypeId+" style='background-color:rgba(0, 0, 0, 0.24);'>"+sysdata.value+"</td>");
        			}));
        		}));
        		if(this.line_options){
        			$td = this.systemTable.find("td");
        			if(this.line_options.unitName == "全部" && this.line_options.sysTypeName == "全部"){
        				this.systemTable.find("td.activity").attr("style","").addClass("enable");
        			}else if(this.line_options.unitName == "全部" && this.line_options.sysTypeName != "全部"){
        				$.each($td,this.proxy(function(idx,item){
        					if($(item).attr("data-sys") == this.line_options.sysTypeId){
        						$(item).attr("style","").addClass("enable");
        					}
        				}));
        			}else if(this.line_options.unitName != "全部" && this.line_options.sysTypeName == "全部"){
        				$.each($td,this.proxy(function(idx,item){
        					if($(item).attr("data-unit") == this.line_options.unitId){
        						$(item).attr("style","").addClass("enable");
        					}
        				}));
        			}else{
        				var id = this.line_options.unitId.toString() + this.line_options.sysTypeId.toString();
        				$("#"+id+"").attr("style","").addClass("enable");
        			}
        		}
        		if (window.parent) {
    		        window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true));
    		        window.parent.setGadgetTitle(this._gadgetsinstanceid, this._gadgetsinstance.gadgetsDisplayName + "　　安监机构：" + (this.line_options && this.line_options.unitName) +"　　系统分类："+(this.line_options && this.line_options.sysTypeName));
    			}
    		}
    	})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	   		
        }));
    },
    on_update_click : function(e) {
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
				"obj" : JSON.stringify({"urlparam" : JSON.stringify(
						{"unitId" : this.qid("unit").select2("data").id,"unitName" : this.qid("unit").select2("data").name,
						"sysTypeId" : this.sysType.select2("data").id,"sysTypeName":this.sysType.select2("data").name})})
			}
		}).done(this.proxy(function(response) {
				$.u.alert.info("更新插件配置成功");
				window.location.href = window.location.href.replace("config", "display");
		}));
	},
	
    destroy: function () {
    	this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.dash.systemappraise.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                              "../../../uui/widget/spin/spin.js",
                              "../../../uui/widget/jqblockui/jquery.blockUI.js",
                              "../../../uui/widget/ajax/layoutajax.js",
                              'echarts/js/echarts.js',
                              '../../../uui/widget/jqurl/jqurl.js' ];
com.sms.dash.systemappraise.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                               {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                               { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                               { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];