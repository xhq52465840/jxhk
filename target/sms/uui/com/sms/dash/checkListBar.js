// @ sourceURL=com.sms.dash.checkListBar
$.u.define('com.sms.dash.checkListBar', null, {
	init : function(mode, gadgetsinstanceid) {
    this._initmode = mode;
    this._gadgetsinstanceid = gadgetsinstanceid;
    this._gadgetsinstance = null;
		this._SELECT2_PAGE_LENGTH=10;
	},
	afterrender : function(bodystr) {
		this.audittype     = $("[name=auditType]");
		this.profession    = $("[name=profession]");
		this.operator      = $("[name=operator]");
		this.target        = $("[name=target]");
		this.chapter       = $("[name=chapter]");
		this.checklist     = $("[name=checklist]");
		this.treeContent   = this.qid("treeContent");
		this._tree         = this.qid("tree");
		this.startdate     = $("[name=startdate]");
		this.enddate       = $("[name=enddate]");
		this.fliter        = $("[name=fliter]");
		this.resetfilter   = $("[name=resetfilter]");
		this.fliter.off("click").on("click",this.proxy(this.on_filter_checklist));
		this.resetfilter.off("click").on("click",this.proxy(this.on_resetfilter));
		this.startdate.add(this.enddate).datepicker({"dateFormat":"yy-mm-dd"});
		this.initfilter();
		this.getCheckListBar();
	},
	on_filter_checklist:function(ent){
		ent.preventDefault();
		this.getCheckListBar();
	},
	on_resetfilter:function(e){
		e.preventDefault();
		this.clearForm(this.qid("filter-form"));
		this.fliter.trigger("click");
	},
	 
    clearForm: function ($target) {
        $target.find("input,select,textarea").each(function () {
            switch (this.type) {
                case "password":
                case "text":
                case "textarea":
                case "select-one":
                case "select-multiple":
                    $(this).val("");
                   if( $(this).attr("title")){
                	   $(this).attr("title","");
                   }
                   if( $(this).attr("value")){
                	   $(this).attr("value","");
                   }
                   if( $(this).select2("data")){
                	   $(this).select2("data","");
                   }
                    break;
                case "checkbox":
                case "radio":
                    $(this).prop("checked", false);
                    break;
                    // no default
            }
        });
    },
	getCheckListBar : function() {
		var auditType=[],profession=[],checklist=[];
		var chapterId=this.chapter.attr("value");
		if(this.checklist.attr("value")){
			$.each(this.checklist.attr("value").split(","),this.proxy(function(idx,item){
				checklist.push(item-0)
			}))
		}
		$.u.ajax({
			url : $.u.config.constant.smsqueryserver,
			dataType : "json",
			type : "post",
			cache : false,
			data : {
				"tokenid" : $.cookie("tokenid"),
				"method" : "getCheckListBar",
				"auditType":this.audittype.val(),
				"profession": this.profession.val(),
				"chapter":chapterId,
				"checklist": JSON.stringify(checklist),
				"operator":this.operator.val(),
				"target":"["+this.target.val()+"]",
				"startData": this.startdate.val(),
				"endData": this.enddate.val()
			}
		}).done(this.proxy(function(data) {
			if (data.success) {
				this.loadmultmap(data.data);
				if (window.parent.resizeGadget) {
					window.parent.resizeGadget(this._gadgetsinstanceid, $("body").outerHeight(true)  + "px");
				}
			}
		})).fail(this.proxy(function(jqXHR, errorText, errorThrown) {
		}));
	},
	_loadMap : function(param) {
		var categories=[],series=[{name:"检查项",color:"",data:[]}];
		$.each(param,this.proxy(function(k,v){
			categories.push(v.name);
			series[0].data.push(v.value);
		}))
		
		$('#container').highcharts({
	        chart: {
	            type: 'column'
	        },
	        credits: {  enabled: false},
	        title: {
	            text: '检查项看板'
	        },
	        subtitle: {
	            text: ' '
	        },
	        xAxis: {//检查项
	            categories:categories
	        },
	        yAxis: {//数量
	            min: 0,
	            title: {
	                text: '数量 (次)'
	            }
	        },
	        tooltip: {
	            headerFormat: '<span style="font-size:10px"><b>{series.name}:</b>{point.key}</span><table>',
	            pointFormat: '<tr><td style="color:{series.color};padding:0">共计检查了: </td>' +
	                '<td style="padding:0"><b>{point.y:f} 次</b></td></tr>',
	            footerFormat: '</table>',
	            shared: true,
	            useHTML: true
	        },
	        plotOptions: {
	            column: {
	                pointPadding: 0.2,
	                borderWidth: 0
	            }
	        },
	        series: series
	    });
		
		
		
	},
	initfilter:function(){
		var termval="";
		//审计类型
		this.audittype.select2({
    		placeholder: "选择...",
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	termval=term;
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "getPlanType",
                        "category": "audit",
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": termval ? ($.grep(response.data||[],this.proxy(function(item,idx){
  		                        	return item.name.indexOf(termval) > -1
  		                    	}))):response.data,
                            "more": response.data.length > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    	}).on("select2-selecting", this.proxy(function(e) {
			this.operator.select2("enable", true).select2("val", "").select2("data", "");
		}))
		        
    	
    	
		//审计专业
    	this.profession.select2({
    		placeholder: "选择...",
    	    allowClear: true,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "dictionary",
    					"rule": JSON.stringify([[{"key":"name","op":"like","value":term}],[{"key":"type","value":"系统分类"}]]),
                        "start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH                                     
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData,
                            "more": response.data.length > (page * this._SELECT2_PAGE_LENGTH)
                        };
                    }
                    else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.name;
            },
            formatResult: function(item){
                return item.name;
            }
    		
    	});
		//执行机构
    	this.operator.select2({
			placeholder : "请选择...",
			allowClear : true,
			ajax : {
				url : $.u.config.constant.smsqueryserver,
				type : "post",
				dataType : "json",
				data : this.proxy(function(term, page) {
					return {
						"tokenid" : $.cookie("tokenid"),
						"planType" : this.audittype.select2("val"),
						"method" : "getAuditReportOperators",
						"name" : term,
						"start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
                        "length": this._SELECT2_PAGE_LENGTH     
					};
				}),
				results : function(response, page) {
					if (response.success) {
						return {
                            "results": response.data.aaData,
                            "more":  response.data.aaData.length > (page * this._SELECT2_PAGE_LENGTH)
                        };
					}else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
				}
			},
			formatResult : function(item) {
				return item.name;
			},
			formatSelection : function(item) {
				return item.name;
			}
		}).on("select2-selecting", this.proxy(function(e) {
			this.target.select2("enable", true).select2("val", "").select2("data", "");
		})).select2("enable", false);

		
		//被审计机构
		this.target.select2({
					placeholder : "请选择...",
					multiple : true,
					allowClear : true,
					ajax : {
						url : $.u.config.constant.smsqueryserver,
						type : "post",
						dataType : "json",
						data : this.proxy(function(term, page) {
							return {
								"tokenid" : $.cookie("tokenid"),
								"method" : "getAuditReportTargets",
								"planType" : this.audittype.select2("val"),//String
								"checkType" : "",
								"operators" : "["+ this.operator.select2("val") +"]",//数组List<String>JSON.stringify(this.operator.select2("val"))
								"name" : term,
								"start": ( page - 1) * this._SELECT2_PAGE_LENGTH,
		                        "length": this._SELECT2_PAGE_LENGTH     
							};
						}),
						results : function(response, page) {
							if (response.success) {
								return {
									"results" : response.data.aaData,
									"more":  response.data.aaData.length > (page * this._SELECT2_PAGE_LENGTH)
								};
							}else{
		                        $.u.alert.error(response.reason, 1000 * 3);
		                    }
						}
					},
					formatResult : function(item) {
						return item.name;
					},
					formatSelection : function(item) {
						return item.name;
					}
				}).select2("enable", false);
   	 	this.onBody_click = function(e){
   	    	if($(e.target).closest("div").attr("qid") != "treeContent" ){
   	    		if($(e.target).attr("name") != "checklist" && $(e.target).attr("name") != "chapter"){
   	    			this.treeContent.fadeOut("fast");
   	   	    		$(document).unbind('click', this.proxy(this.onBody_click));
   	    		}
   	    	}
   	    }
    	
		//章节
    	this.chapter.on("click",this.proxy(function(e){
    		var data={};
			$.extend(true,data,{"auditType":this.audittype.val()});
			$.extend(true,data,{"profession":this.profession.val()});
			$.extend(true,data,{"pointType":"chapter"});
    		this._getChapterTree(data);
    		var offset = $(e.target).offset();
			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
			$(document).bind('click', this.proxy(this.onBody_click));
    	}))
    	
    	//检查项    要点
		this.checklist.on("click",this.proxy(function(e){
			var checkedNode=[]
			$cur=$(e.currentTarget);
			var value=$cur.attr("value");
			if($cur.attr("value")){
				$.each($cur.attr("value").split(","),this.proxy(function(idx,item){
					checkedNode.push(item-0);
				}))
			}
			var data={};
			$.extend(true,data,{"auditType":this.audittype.val()});
			$.extend(true,data,{"profession":this.profession.val()});
			$.extend(true,data,{"pointType":"point","parent":this.chapter.attr("value")});
    		this._getPointTree(data,checkedNode);
    		var offset = $(e.target).offset();
			this.treeContent.css({left:offset.left + "px", top:offset.top + $(e.currentTarget).outerHeight() + "px"}).slideDown("fast");
			$(document).bind('click', this.proxy(this.onBody_click));
    	}))
		$(".form-horizontal .form-group").css({"margin":0})
	},
	
	//章节
	_getChapterTree:function(data){
	    	var treeNodes=[];
		    $.ajax({
		    	url:$.u.config.constant.smsqueryserver,
		        type:"post",
		        dataType: "json",
		        cache: false,
		        async:false,
		        data: $.extend({
	            	"tokenid":$.cookie("tokenid"),
		    		"method":"getItemByTypeAndProfession",
	        	},data)
		    }).done(this.proxy(function(data){
		    	if(data.success){
					if(data.data.aaData){
						treeNodes = $.map(data.data.aaData,function(perm,idx){
								return {id:perm.id, 
										pId:perm.parentId,
										name:perm.point
										}
	        			});
					}
		    	}
		    })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
		    	
		    }));
	    	var setting = {
	    			data: {
	    				simpleData: {
	    					enable: true
	    				}
	    			},
	    			callback: {
	    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
							this.chapter.val(treeNode.name);
							this.chapter.attr("value",treeNode.id);
							this.treeContent.fadeOut("fast");
							this.chapter.attr("title",treeNode.name);
							this.checklist.val("").attr("value","");
	    				})
	    			},
	    		};
	    	this.tree = $.fn.zTree.init(this._tree, setting,treeNodes);
	    	var nodes = this.tree.getNodes();
	    	$.each(nodes,this.proxy(function(idx,node){
	    		if(node.parentTId==null){
	    			this.tree.expandNode(node, true, false, true);
	    		}
	    	}));
	    	
	    },
	    
	    
	    //检查项 要点
	    _getPointTree:function(data,checkedNode){
	    	var treeNodes=[];
	      	$.u.ajax({
	            url: $.u.config.constant.smsqueryserver,
	            dataType: "json",
	            type:"post",
	            cache: false,
		        async:false,
	            data: $.extend({
	            	"tokenid":$.cookie("tokenid"),
		    		"method":"getItemByTypeAndProfession",
	        	},data)
	        }, this.$, {size: 2, backgroundColor: "#fff"}).done(this.proxy(function (data) {
	        	if (data.success) {
	        		if(data.data.aaData){
						treeNodes = $.map(data.data.aaData,function(perm,idx){
								return {id:perm.id, 
										pId:perm.parentId,
										name:perm.point,
										checked:$.inArray(perm.id,checkedNode)>-1
										}
	        			});
					}
	        	}
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

	        }));
	    	var setting = {
	      			 check: {  
	      				 enable: true,  
	      				 chkstyle:"checkbox",
	      				 chkboxType : { "Y" : "ps", "N" : "ps" },
	      				 selectdMulti : true  
	      	            },
	       			 view: {  
	       			    showLine : true,                  //是否显示节点间的连线  
	           			checkable : true,                  //每个节点上是否显示 CheckBox  
	       	            dblClickExpand: true  
	       	            },
	    			data: {
	    				simpleData: {
	    					enable: true
	    				}
	    			},
	    			callback: {
	    				beforeClick:this.proxy(function(treeId, treeNode, clickFlag){
	    					this.checkedNode = this.tree.getCheckedNodes(true);
	    					var arry=[],idxyz=[];
	    					$.each(this.checkedNode,function(idx,item){
	    						arry.push(item.name);
	    						idxyz.push(item.id);
	    					})
	    					this.checklist.val(arry.join(","));
	    					this.checklist.attr("value",idxyz.join(","));
							this.checklist.attr("title",arry.join(","));
							this.treeContent.fadeOut("fast");
	    				})
	    			},
	    		};
	    	this.tree = $.fn.zTree.init(this._tree, setting,treeNodes);
	    	var nodes = this.tree.getNodes();
	    	$.each(nodes,this.proxy(function(idx,node){
	    		if(node.parentTId==null){
	    			this.tree.expandNode(node, true, false, true);
	    		}
	    	}));
	    	
	    },
	    
	    
	    //3d
	    load3dmap:function(param){
	    	var categories=[],series=[{
							            name: '符合项',
							            data: [3, 4, 4, 2, 5]
							        }, {
							            name: '建议项',
							            data: [3, 4, 4, 2, 5]
							        }, {
							            name: '有文无实',
							            data: [3, 4, 4, 2, 5]
							        }, {
							            name: '有实无文',
							            data: [3, 4, 4, 2, 5]
							        }, {
							            name: '无实无文',
							            data: [3, 4, 4, 2, 5]
							        }, {
							            name: '不适用',
							            data: [3, 4, 4, 2, 5]
							        }];
	    
			
	    		$('#container').highcharts({
	    	        chart: {
	    	            type: 'column',
	    	            margin: 75,
	    	            options3d: {
	    	                enabled: true,
	    	                alpha: 0,
	    	                beta: 0,
	    	                depth: 50,
	    	                viewDistance: 25
	    	            }
	    	        },
	    	        title: {
	    	            text: '',
	    	            x: -20 //center 
	    	        },
	    	        subtitle: {
	    	            text: ''
	    	        },
	    	        legend: {
	    	            layout: 'vertical',//垂直
	    	            backgroundColor: '#FFFFFF',//背景白
	    	            floating: true,
	    	            verticalAlign: 'bottom',
	    	            x: 24,
	    	            y: 0,
	    	            align: 'right',
	    	            borderWidth: 0
	    	        },
	    	        xAxis: {//检查项
	    	            categories:categories
	    	        },
	    	        yAxis: {//数量
	    	            min: 0,
	    	            title: {
	    	                text: '数量 (次)'
	    	            }
	    	        },
	    	        tooltip: {
	    	            headerFormat: '<span style="font-size:10px"><b>{series.name}:</b>{point.key}</span><table>',
	    	            pointFormat: '<tr><td style="color:{series.color};padding:0">共计检查了: </td>' +
	    	                '<td style="padding:0"><b>{point.y:f} 次</b></td></tr>',
	    	            footerFormat: '</table>',
	    	            shared: true,
	    	            useHTML: true
	    	        },
	    	        plotOptions: {
	    	            column: {
	    	            	 pointPadding: 0.2,
	    		             borderWidth: 0,
	    	                 depth: 25
	    	            }
	    	        },
	    	        series: series,
	    	        credits: {  enabled: false},//去掉highcharts.com商标
	    	    });
	    	    
			chart = $('#container').highcharts();  
			
	    	    // Activate the sliders
	    	    $('#R0').on('change', function(){
	    	        chart.options.chart.options3d.alpha = this.value;
	    	        showValues();
	    	        chart.redraw(false);
	    	    });
	    	    $('#R1').on('change', function(){
	    	        chart.options.chart.options3d.beta = this.value;
	    	        showValues();
	    	        chart.redraw(false);
	    	    });

	    	    function showValues() {
	    	        $('#R0-value').html(" "+chart.options.chart.options3d.alpha);
	    	        $('#R1-value').html(" "+chart.options.chart.options3d.beta);
	    	        $('#R0').attr("value",chart.options.chart.options3d.alpha);
	    	        $('#R1').attr("value",chart.options.chart.options3d.beta);
	    	    }
	    	    showValues();
	    },
	    
	    //柱形堆叠图
	    loadmultmap:function(param){
	    	if(((this.audittype.val() || this.profession.val() ||
	   			 this.checklist.val() || this.startdate.val() || 
	   			 this.enddate.val() || this.chapter.attr("value")) === "")||
	   			 ((this.audittype.val() || this.profession.val() ||
	   		   	  this.checklist.val() || this.startdate.val() || 
	   		   	  this.enddate.val()) == "") && this.chapter.attr("value") == undefined){
	    		param = [];
	    	}
		var categories=[],series=[{
						            name: '符合项',
						            data: []
						        }, {
						            name: '建议项',
						            data: []
						        }, {
						            name: '有文无实',
						            data: []
						        }, {
						            name: '有实无文',
						            data: []
						        }, {
						            name: '无文无实',
						            data: []
						        }, {
						            name: '不适用',
						            data: []
						        }];
				$.each(param,this.proxy(function(key,value){
					if($.inArray(value.name,categories) == -1){
						categories.push(value.name);
					}
					$.each(series,this.proxy(function(idx,item){
							var index = $.inArray(value.name,categories)
							if(value.auditResultName == item.name){
								if(typeof item.data[index] == "undefined"){
									item.data.push(value.value);
								}else{
									item.data.splice(index,1,value.value);
								}
							}else{
								if(typeof item.data[index] == "undefined"){
									item.data.push(null);
								}
							}
					}))
				}))
						
	    	 $('#container').highcharts({
	    	        chart: {
	    	            type: 'column'
	    	        },
	    	        title: {
	    	            text: ''
	    	        },
	    	        xAxis: {
	    	            categories: categories
	    	        },
	    	        yAxis: {
	    	            min: 0,
	    	            title: {
	    	                text: '数量 (次)'
	    	            },
	    	            stackLabels: {//顶部stackTotal
	    	                enabled: true,
	    	                style: {
	    	                    fontWeight: 'bold',
	    	                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
	    	                }
	    	            }
	    	        },
	    	        legend: {
	    	            align: 'right',
	    	            x: -70,
	    	            verticalAlign: 'top',
	    	            y: -10,
	    	            floating: true,
	    	            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
	    	            borderColor: '#CCC',
	    	            borderWidth: 1,
	    	            shadow: false
	    	        },
	    	        tooltip: {
	    	            formatter: function() {
	    	                return '<b>'+ this.x +'</b><br/>'+
	    	                    this.series.name +': '+ this.y +'<br/>'+
	    	                    '共计: '+ this.point.stackTotal+'次';
	    	            }
	    	        },
	    	        plotOptions: {
	    	            column: {
	    	                stacking: 'normal',
	    	                dataLabels: {
	    	                    enabled: true,
	    	                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
	    	                }
	    	            }
	    	        },
	    	        credits: {  enabled: false},//去掉highcharts.com商标
	    	        series:  series
	    	    });
	    }
	
	
}, {usehtm : true,usei18n : false});

com.sms.dash.checkListBar.widgetjs = [ '../../../uui/widget/spin/spin.js', 
							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
							  '../../../uui/widget/ajax/layoutajax.js', 
							   "../../../uui/widget/select2/js/select2.min.js",
							    "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
							  '../../audit/plugin/highcharts.js',
							  '../../../uui/widget/jqurl/jqurl.js'];
com.sms.dash.checkListBar.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                       {path:"../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"},
                                       { path: "../../../uui/widget/select2/css/select2.css"},
                                       { path: "../../../uui/widget/select2/css/select2-bootstrap.css" },
                                       { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];