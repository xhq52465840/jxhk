//@ sourceURL=com.sms.safelib.dangerSourceList
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.safelib.dangerSourceList', null, {
    init: function (options) {
        this._options = options || {};
        this.type = null;///用于标记风险评价（a）,剩余风险（e）;
        this.selectActive = null;//用于标记选中的流程 ：一级（1），二级（2），三级（3）
        this.dangerousSourceId = null; //用于添加后果和控制措施的id
        this.liTemp = '<li class="list-group-item" data-id="#{id}">'
		    	  	+ '#{name}'
		    	  	+ '<p class="list-group-item-text hidden">'
		    	  	+	'<span class="glyphicon glyphicon-pencil m-left edit"></span>'
		    	  	+	'<span class="glyphicon glyphicon-trash m-left del"></span>'
		    	  	+ '</p></li>';
        this.trTemp = '<tr data-id="#{id}"><td>#{index}</td><td style="word-break: break-all;">#{code}</td><td style="word-break: break-all;">#{description}</td>'
        			+ '<td style="word-break: break-all;" data-control="#{control}"></td>'
        			+ '<td>#{beforep}</td><td>#{befores}</td>'
					+ '<td>#{beforer}</td><td>#{beforel}</td><td>#{afterp}</td><td>#{afters}</td>'
					+ '<td>#{afterr}</td><td>#{afterl}</td><td>'
					+ '<div class="dropdown">'
					+ '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
				    + '按钮<span class="caret"></span></button>'
				    + '<ul class="dropdown-menu" aria-labelledby="dropdownMenu2">'
				    + '<li><a href="#" class="view">查看</a></li>'
				    + '<li><a href="#" class="edit">编辑</a></li>'
				    + '<li><a href="#" class="del">删除</a></li>'
				    + '<li><a href="#" class="consq">后果</a></li>'
				    + '<li><a href="#" class="ctrl">控制措施</a></li></ul></div>'
					+ '</td></tr>';
        this.ctrlTemp = '<tr data-id="#{id}"><td>#{index}</td><td>#{description}</td>'
        			  + '<td><span class="add_c glyphicon glyphicon-pencil edit" title="编辑"></span>'
        			  + '<span class="add_c glyphicon glyphicon-trash m-left del" title="删除"></span></td>'
					  + '</tr>';
    },
    afterrender: function (bodystr) {
    	this.subDangerous = this.qid("subDangerous");//危险源模块
    	this.editForm = this.qid("editForm");//子系统编辑form
    	this.navUl = this.qid("navUl");//上层导航栏模块
    	this.subSystem = this.qid("subSystem");//中间模块
    	this.sys_tabs = this.qid("sys_tabs");//中间模块展示头
    	this.child_add = this.qid("child_add");//子系统增加按钮
    	this.first_add = this.qid("first_add");//一级流程增加按钮
    	this.second_add = this.qid("second_add");//二级流程增加按钮
    	this.third_add = this.qid("third_add");//三级流程增加按钮
    	this.childsys = this.qid("childsys");//子系统展示
    	this.firstsys = this.qid("firstsys");//一级流程展示
    	this.secondsys = this.qid("secondsys");//二级流程展示
    	this.thirdsys = this.qid("thirdsys");//三级流程展示
    	this.risk_add = this.qid("risk_add");//添加危险源按钮
    	this.riskForm = this.qid("riskForm");//添加危险源弹出层
    	this.add_cons = this.qid("add_cons");//增加风险评价按钮
    	this.add_left = this.qid("add_left");//增加剩余风险按钮
    	this.add_conc = this.qid("add_conc");//增加后果按钮
    	this.add_ctrl = this.qid("add_ctrl");//增加控制措施按钮
    	this.concForm = this.qid("concForm");//增加后果弹出层
    	this.ctrlForm = this.qid("ctrlForm");//增加控制措施
    	this.edit_c_cDialogForm = this.qid("edit_c_cDialogForm");//后果编辑层
    	this.child_add.off("click").on("click", this.proxy(this.child_add_click));
    	this.first_add.off("click").on("click", this.proxy(this.first_add_click));
    	this.second_add.off("click").on("click", this.proxy(this.second_add_click));
    	this.third_add.off("click").on("click", this.proxy(this.third_add_click));
    	this.risk_add.off("click").on("click", this.proxy(this.risk_add_click));
    	this.add_cons.off("click").on("click", this.proxy(this.add_cons_click));
    	this.add_left.off("click").on("click", this.proxy(this.add_left_click));
    	this.add_conc.off("click").on("click", this.proxy(this.add_conc_click));
    	this.add_ctrl.off("click").on("click", this.proxy(this.add_ctrl_click));
    	this.getTabs();
    	this.createDialog();
    	this.createForm();
    },
    getTabs : function(){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"dictionary",
				"rule":JSON.stringify([[{"key":"type","value":"系统分类"}]])
            },
            this.$,
            this.proxy(function(data){
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx,obj){
        			$('<li role="presentation" class="'+ (idx == 0 ? "active" : "") +'" ><a href="#" data-id="'+ 
        				obj.id +'">' + obj.value + '</a></li>').appendTo(this.navUl);
        			idx == 0 && this.getChildSysData(obj.id);
        			this.navUl.find('li').off("click").on("click", this.proxy(this.liClick));
            	}));
            	this.sys_tabs.removeClass("hidden");
            })
    	);
    },
    createDialog : function(e){
    	this.editDialog = this.qid("editDialog").dialog({
            width:540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function () {

            }),
            close: this.proxy(function () {
            	this.clearFormData();
            })
        });
    	this.riskDialog = this.qid("riskDialog").dialog({
            width:650,
            height:600,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function () {

            }),
            close: this.proxy(function () {
            	this.clearRiskFormData();
            })
        });
    	this.scoreDialog = this.qid("scoreDialog").dialog({
    		title: "设置风险矩阵",
            width: 520,
            modal: true,
            resizable: false,
            autoOpen: false,
            create: this.proxy(this.on_score_create),
            close: this.proxy(function(){
                this.qid("riskMatrix").select2("val", null);
                this.qid("riskMatrixSelect").addClass("hidden");
                this.qid("riskMatrixPossible").select2("val", null);
                this.qid("riskMatrixSerious").select2("val", null);
                this.qid("riskMatrixCoefficient").text("");
                this.qid("riskMatrixSeriousLabel").empty();
                this.qid("riskMatrixPossibleLabel").empty();
                this.qid("riskMatrixCoefficientlabel").text("");
                this.qid("riskMatrixCoefficient").text("");
                this.type = "";
            }),
            buttons: [
	              {
	                  "text": "保存",
	                  "click": this.proxy(this.on_score_save)
	              },
	              {
	                  "text": "取消",
	                  "class": "aui-button-link",
	                  "click": this.proxy(function(){
	                	  this.scoreDialog.dialog("close");
	                  })
	              }
	          ],
	        open: this.proxy(function(){
	        	$('.ui-widget-overlay').last().addClass("last-ui-index");
	        	$('.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-dialog-buttons.ui-draggable')
	        	.last().addClass("last-dg-index");
	        })
    	});
    	this.concDialog = this.qid("concDialog").dialog({
            width:650,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function () {

            }),
            close: this.proxy(function () {
            	this.clearConcFormData();
            })
        });
    	this.ctrlDialog = this.qid("ctrlDialog").dialog({
            width:650,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function () {

            }),
            close: this.proxy(function () {
            	this.clearCtrlFormData();
            })
        });
    	this.edit_c_cDialog = this.qid("edit_c_cDialog").dialog({
            width:650,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            open: this.proxy(function(){
	        	$('.ui-widget-overlay').last().addClass("last-ui-index");
	        	$('.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-dialog-buttons')
	        	.last().addClass("last-dg-index");
	        }),
            close: this.proxy(function () {
            	this.clearEdit_c_cFormData();
            })
        });
    },
    on_score_save : function(){
    	var a = this.qid("riskMatrixPossible").select2("data").source;
    	var b = this.qid("riskMatrixSerious").select2("data").source;
    	var c = this.qid("riskMatrixCoefficient").text();
    	var d = this.qid("riskMatrixCoefficientlabel").text();
    	if(this.type == "a"){
    		this.qid("a").text(a);
        	this.qid("b").text(b);
        	this.qid("c").text(c);
        	this.qid("d").text(d);
    	}else if(this.type == "e"){
    		this.qid("e").text(a);
        	this.qid("f").text(b);
        	this.qid("g").text(c);
        	this.qid("h").text(d);
    	}
    	this.scoreDialog.dialog("close");
    },
    _coefficient : function(possible,serious,matrix){
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: $.extend(true, {
                "tokenid": $.cookie("tokenid")
            }, {
                "method": "stdcomponent.getbysearch",
                "dataobject": "coefficient",
                "rule": JSON.stringify([[{"key":"possible","value":possible}],[{"key":"serious","value":serious}],[{"key":"matrix","value":matrix}]])
            })
        }).done(this.proxy(function(response){
        	if(response.success){
        		this.qid("riskMatrixCoefficient").text(response.data.aaData[0].score);
        		this.qid("riskMatrixCoefficientlabel").attr("data-color",response.data.aaData[0].bandingColor).text(response.data.aaData[0].banding).css("background-color",response.data.aaData[0].bandingColor);
        	}
        }));
    },
    on_score_create : function(){
    	this.qid("riskMatrix").select2({
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "matrix",
                        "rule": JSON.stringify([[{"key":"name","value":term}],[{"key":"status","value":"Y"}],[{"key":"publish","value":"Y"}]])                                   
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData
                        };
                    }else{
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
        	this.qid("riskMatrixSelect").removeClass("hidden");
        	this.qid("riskMatrixPossible").select2("val", null);
            this.qid("riskMatrixSerious").select2("val", null);
            this.qid("riskMatrixPossibleLabel").empty();
            this.qid("riskMatrixSeriousLabel").empty();
            this.qid("riskMatrixCoefficient").text("");
            this.qid("riskMatrixCoefficientlabel").text("");
        }));
    	this.qid("riskMatrixPossible").select2({
    		minimumResultsForSearch: -1,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var id = parseInt(this.qid("riskMatrix").select2("val"));
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "range",
                        "rule": JSON.stringify([[{"key":"matrix","value":id}],[{"key":"type","value":"P"}]])                                 
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData
                        };
                    }else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.source;
            },
            formatResult: function(item){
                return item.source;
            }
        }).on("select2-selecting", this.proxy(function(e) {
        	if(this.qid("riskMatrixSerious").select2("val")){
        		var b = this.qid("riskMatrixSerious").select2('data').source;
        		var a = e.object.source;
        		var id = parseInt(this.qid("riskMatrix").select2("val"));
        		this._coefficient(a,b,id);
        	}
        	$.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                data: $.extend(true, {
                    "tokenid": $.cookie("tokenid")
                }, {
                    "method": "stdcomponent.getbysearch",
                    "dataobject": "aids",
                    "rule": JSON.stringify([[{"key":"range","value":e.val}]])
                })
            }).done(this.proxy(function(response){
            	this.qid("riskMatrixPossibleLabel").empty();
            	var htmls=["<ul style='margin-left: 130px;font-size: 10px;color: #949292;'>"];
        		$.each(response.data.aaData,this.proxy(function(k,v){
        			 htmls.push("<li>"+(v.perspectives?v.perspectives+":":"")+v.description+"</li>");
        		}));
        		htmls.push("</ul>");
        		htmls = htmls.join("").toString();
        		this.qid("riskMatrixPossibleLabel").html(htmls);
            }));
        }));
    	this.qid("riskMatrixSerious").select2({
    		minimumResultsForSearch: -1,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                data: this.proxy(function(term, page){
                	var id = parseInt(this.qid("riskMatrix").select2("val"));
                    return {
                        "tokenid": $.cookie("tokenid"),
                        "method": "stdcomponent.getbysearch",
                        "dataobject": "range",
                        "rule": JSON.stringify([[{"key":"matrix","value":id}],[{"key":"type","value":"S"}]])                                 
                    };
                }),
                results: this.proxy(function(response, page){
                    if(response.success){
                        return {
                            "results": response.data.aaData
                        };
                    }else{
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatSelection: function(item){
                return item.source;
            },
            formatResult: function(item){
                return item.source;
            }
        }).on("select2-selecting", this.proxy(function(e) {
        	if(this.qid("riskMatrixPossible").select2("val")){
        		var a = this.qid("riskMatrixPossible").select2('data').source;
        		var b = e.object.source; 
        		var id = parseInt(this.qid("riskMatrix").select2("val"));
        		this._coefficient(a,b,id);
        	}
        	$.u.ajax({
                url: $.u.config.constant.smsqueryserver,
                type: "post",
                dataType: "json",
                data: $.extend(true, {
                    "tokenid": $.cookie("tokenid")
                }, {
                    "method": "stdcomponent.getbysearch",
                    "dataobject": "aids",
                    "rule": JSON.stringify([[{"key":"range","value":e.val}]])
                })
            }).done(this.proxy(function(response){
            	if(response.success){
            		this.qid("riskMatrixSeriousLabel").empty();
            		var htmls=["<ul style='margin-left: 130px;font-size: 10px;color: #949292;'>"];
            		$.each(response.data.aaData,this.proxy(function(k,v){
            			 htmls.push("<li>"+v.perspectives+":"+v.description+"</li>");
            		}));
            		htmls.push("</ul>");
            		htmls = htmls.join("").toString();
            		this.qid("riskMatrixSeriousLabel").html(htmls);
            	}
            }));
        }));
    },
    createForm : function(){
    	this.editForm.validate({
            rules: {
            	name : "required"
            },
            messages: {
            	name:"名称不能为空"
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
    	this.riskForm.validate({
            rules: {
            	code : "required"
            },
            messages: {
            	code:"编号不能为空",
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
    	this.edit_c_cDialogForm.validate({
            rules: {
            	description : "required"
            },
            messages: {
            	description:"描述不能为空",
            },
            errorClass: "text-danger text-validate-element",
            errorElement:"div"
        });
    },
    clearFormData : function(){
    	this.editForm.find("input").val("");
    	this.editForm.validate().resetForm();
    },
    clearRiskFormData : function(){
    	this.riskForm.find("input").val("");
    	this.riskForm.find("textarea").val("");
    	this.qid("a")
    		.add(this.qid("b"))
    		.add(this.qid("c"))
    		.add(this.qid("d"))
    		.add(this.qid("e"))
    		.add(this.qid("f"))
    		.add(this.qid("g"))
    		.add(this.qid("h"))
    		.text("");
    	this.riskForm.validate().resetForm();
    },
    clearEdit_c_cFormData : function(){
    	this.edit_c_cDialogForm.find("textarea").val("");
    	this.edit_c_cDialogForm.validate().resetForm();
    },
    clearConcFormData : function(){
    	this.concForm.find("table>tbody").empty();
    },
    clearCtrlFormData : function(){
    	this.ctrlForm.find("table>tbody").empty();
    },
    liClick : function(e){
    	var $e = $(e.currentTarget), type = $e.parent().attr("qid"), 
    		id = null, fid = null;
    	$e.siblings().removeClass("active").end().addClass("active");
    	this.subDangerous.find("table>tbody").empty();
    	switch(type){
	    	case "navUl":
	    		this.childsys.add(this.firstsys).add(this.secondsys).add(this.thirdsys).empty();
	    		id = parseInt(this.navUl.find("li.active>a").attr("data-id"),10);
	    		this.getChildSysData(id);
	    		break;
	    	case "childsys":
	    		this.subDangerous.addClass("hidden");
	    		$e.siblings().find("p").addClass("hidden");
	    		$e.find("p").removeClass("hidden");
	    		id = parseInt(this.childsys.find("li.active").attr("data-id"),10);
	    		this.getFirstSysData(id);
	    		break;
	    	case "firstsys":
	    		this.subDangerous.removeClass("hidden");
	    		$e.siblings().find("p").addClass("hidden");
	    		$e.find("p").removeClass("hidden");
	    		id = parseInt(this.childsys.find("li.active").attr("data-id"),10);
	    		fid = parseInt(this.firstsys.find("li.active").attr("data-id"),10);
	    		this.selectActive = fid;
	    		this.getSecondSysData(id,fid);
	    		this.getDangerSource(fid);
	    		break;
	    	case "secondsys":
	    		this.subDangerous.removeClass("hidden");
	    		$e.siblings().find("p").addClass("hidden");
	    		$e.find("p").removeClass("hidden");
	    		id = parseInt(this.childsys.find("li.active").attr("data-id"),10),
	    		fid = parseInt(this.secondsys.find("li.active").attr("data-id"),10);
	    		this.selectActive = fid;
	    		this.getThirdSysData(id, fid);
	    		this.getDangerSource(fid);
	    		break;
	    	case "thirdsys":
	    		this.subDangerous.removeClass("hidden");
	    		this.selectActive = 3;
	    		$e.siblings().find("p").addClass("hidden");
	    		$e.find("p").removeClass("hidden");
	    		id = parseInt(this.thirdsys.find("li.active").attr("data-id"),10);
	    		this.selectActive = id;
	    		this.getDangerSource(id);
	    		break;
    	}
    },
    getChildSysData : function(id){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"subSystem",
				"rule":JSON.stringify([[{"key":"sysType","value":id}]])
            },
            this.$,
            this.proxy(function(data){
            	var liTemp = null;
            	this.childsys.empty();
            	this.firstsys.empty();
            	this.secondsys.empty();
            	this.thirdsys.empty();
            	this.subSystem.removeClass("hidden");
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx, obj){
            		liTemp = this.liTemp.replace(/#\{id\}/g,obj.id)
            			.replace(/#\{name\}/g,obj.name);
            		$(liTemp).appendTo(this.childsys).data("obj",obj);
            		this.childsys.find('li').off("click").on("click", this.proxy(this.liClick));
            		this.childsys.find('span.edit').off("click").on("click", this.proxy(this.child_span_edit_click));
            		this.childsys.find('span.del').off("click").on("click", this.proxy(this.child_span_del_click));
            	}));
            })
    	);
    },
    child_add_click : function(){
    	var sysType = parseInt(this.navUl.find("li.active>a").attr("data-id"),10);
    	if(!sysType){
    		$.u.alert.info("请选择一个系统");
    		return false;
    	}
    	this.editDialog.dialog("option",{
    		title:"添加子系统",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"subSystem",
					            "obj":JSON.stringify({
					            	"sysType":sysType,
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getChildSysData(sysType);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    child_span_edit_click : function(e){
    	var text = $(e.currentTarget).parents('li').data("obj").name,
    		id = parseInt(this.navUl.find("li.active>a").attr("data-id"),10);;
    	this.editForm.find(".name").val(text);
    	this.editDialog.dialog("option",{
    		title:"编辑子系统",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val(),
							sysType = parseInt(this.childsys.find("li.active").attr("data-id"),10);
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"subSystem",
					            "dataobjectid":sysType,
					            "obj":JSON.stringify({
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getChildSysData(id);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    child_span_del_click : function(e){
    	try{
    		var id = parseInt($(e.currentTarget).parents('li').attr("data-id"),10);
    		var name = $(e.currentTarget).parents('li').data("obj").name;
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除子系统:" + name,
    			dataobject:"subSystem",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				var that = this;
	    			$(e.currentTarget).closest('li').fadeOut(function(){
		    		 	$(this).remove();
		    		 	that.firstsys.empty();
		    		 	that.secondsys.empty();
		    		 	that.thirdsys.empty();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    getFirstSysData : function(id){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"sysFlow",
				"rule":JSON.stringify([[{"key":"subSystem","value":id}],[{"key":"slevel","value":"1"}]])
            },
            this.$,
            this.proxy(function(data){
            	var liTemp = null;
            	this.firstsys.empty();
            	this.secondsys.empty();
            	this.thirdsys.empty();
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx, obj){
            		liTemp = this.liTemp.replace(/#\{id\}/g,obj.id)
            			.replace(/#\{name\}/g,obj.name);
            		$(liTemp).appendTo(this.firstsys).data("obj",obj);
            		this.firstsys.find('li').off("click").on("click", this.proxy(this.liClick));
            		this.firstsys.find('span.edit').off("click").on("click", this.proxy(this.first_span_edit_click));
            		this.firstsys.find('span.del').off("click").on("click", this.proxy(this.first_span_del_click));
            	}));
            })
    	);
    },
    first_add_click : function(){
    	var sysType = parseInt(this.childsys.find("li.active").attr("data-id"),10);
    	if(!sysType){
    		$.u.alert.info("请选择一个子系统");
    		return false;
    	}
    	this.editDialog.dialog("option",{
    		title:"添加一级流程",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"sysFlow",
					            "obj":JSON.stringify({
					            	"parent":"",
					            	"slevel":"1",
					            	"subSystem":sysType,
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getFirstSysData(sysType);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    first_span_edit_click : function(e){
    	var text = $(e.currentTarget).parents('li').data("obj").name,
			id = parseInt(this.childsys.find("li.active").attr("data-id"),10);
		this.editForm.find(".name").val(text);
		this.editDialog.dialog("option",{
			title:"编辑子系统",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val(),
							sysType = parseInt(this.firstsys.find("li.active").attr("data-id"),10);
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"subFlow",
					            "dataobjectid":sysType,
					            "obj":JSON.stringify({
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getFirstSysData(id);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}]
		}).dialog("open");	
    },
    first_span_del_click : function(e){
    	try{
    		var id = parseInt($(e.currentTarget).parents('li').attr("data-id"),10);
    		var name = $(e.currentTarget).parents('li').data("obj").name;
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除一级流程:" + name,
    			dataobject:"sysFlow",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				var that = this;
	    			$(e.currentTarget).closest('li').fadeOut(function(){
		    		 	$(this).remove();
		    		 	that.secondsys.empty();
		    		 	that.thirdsys.empty();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    getSecondSysData : function(id,fid){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"sysFlow",
				"rule":JSON.stringify([[{"key":"subSystem","value":id}],
	               [{"key":"slevel","value":"2"}],
	               [{"key":"parent","value":fid}]])
            },
            this.$,
            this.proxy(function(data){
            	var liTemp = null;
            	this.secondsys.empty();
            	this.thirdsys.empty();
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx, obj){
            		liTemp = this.liTemp.replace(/#\{id\}/g,obj.id)
            			.replace(/#\{name\}/g,obj.name);
            		$(liTemp).appendTo(this.secondsys).data("obj",obj);
            		this.secondsys.find('li').off("click").on("click", this.proxy(this.liClick));
            		this.secondsys.find('span.edit').off("click").on("click", this.proxy(this.second_span_edit_click));
            		this.secondsys.find('span.del').off("click").on("click", this.proxy(this.second_span_del_click));
            	}));
            })
    	);
    },
    second_add_click : function(){
    	var parent = parseInt(this.firstsys.find("li.active").attr("data-id"),10);
    	if(!parent){
    		$.u.alert.info("请选择一个一级系统");
    		return false;
    	}
    	this.editDialog.dialog("option",{
    		title:"添加二级流程",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val(),
							sysType = parseInt(this.childsys.find("li.active").attr("data-id"),10);
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"sysFlow",
					            "obj":JSON.stringify({
					            	"parent":parent,
					            	"slevel":"2",
					            	"subSystem":sysType,
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getSecondSysData(sysType, parent);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    second_span_edit_click : function(e){
    	var text = $(e.currentTarget).parents('li').data("obj").name,
			id = parseInt(this.childsys.find("li.active").attr("data-id"),10),
			fid = parseInt(this.firstsys.find("li.active").attr("data-id"),10);
		this.editForm.find(".name").val(text);
		this.editDialog.dialog("option",{
			title:"编辑二级系统",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val(),
							sysType = parseInt(this.secondsys.find("li.active").attr("data-id"),10);
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"subFlow",
					            "dataobjectid":sysType,
					            "obj":JSON.stringify({
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getSecondSysData(id, fid);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}]
		}).dialog("open");
    },
    second_span_del_click : function(e){
    	try{
    		var id = parseInt($(e.currentTarget).parents('li').attr("data-id"),10);
    		var name = $(e.currentTarget).parents('li').data("obj").name;
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除二级流程:" + name,
    			dataobject:"sysFlow",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				var that = this;
	    			$(e.currentTarget).closest('li').fadeOut(function(){
		    		 	$(this).remove();
		    		 	that.thirdsys.empty();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    getThirdSysData : function(id, fid){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"sysFlow",
				"rule":JSON.stringify([[{"key":"subSystem","value":id}],
	               [{"key":"slevel","value":"3"}],
	               [{"key":"parent","value":fid}]])
            },
            this.$,
            this.proxy(function(data){
            	var liTemp = null;
            	this.thirdsys.empty();
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx, obj){
            		liTemp = this.liTemp.replace(/#\{id\}/g,obj.id)
            			.replace(/#\{name\}/g,obj.name);
            		$(liTemp).appendTo(this.thirdsys).data("obj",obj);
            		this.thirdsys.find('li').off("click").on("click", this.proxy(this.liClick));
            		this.thirdsys.find('span.edit').off("click").on("click", this.proxy(this.third_span_edit_click));
            		this.thirdsys.find('span.del').off("click").on("click", this.proxy(this.third_span_del_click));
            	}));
            })
    	);
    },
    third_add_click : function(){
    	var parent = parent = parseInt(this.secondsys.find("li.active").attr("data-id"),10);
    	if(!parent){
    		$.u.alert.info("请选择一个二级系统");
    		return false;
    	}
    	this.editDialog.dialog("option",{
    		title:"添加三级流程",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val(),
							sysType = parseInt(this.childsys.find("li.active").attr("data-id"),10);
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"sysFlow",
					            "obj":JSON.stringify({
					            	"parent":parent,
					            	"slevel":"3",
					            	"subSystem":sysType,
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getThirdSysData(sysType, parent);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}],	
    	}).dialog("open");	
    },
    third_span_edit_click : function(e){
    	var text = $(e.currentTarget).parents('li').data("obj").name,
			id = parseInt(this.childsys.find("li.active").attr("data-id"),10),
			fid = parseInt(this.secondsys.find("li.active").attr("data-id"),10);
		this.editForm.find(".name").val(text);
		this.editDialog.dialog("option",{
			title:"编辑三级系统",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.editForm.valid()){
						var name = this.editForm.find("input.name").val(),
							sysType = parseInt(this.thirdsys.find("li.active").attr("data-id"),10);
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"subFlow",
					            "dataobjectid":sysType,
					            "obj":JSON.stringify({
					            	"name":name
					            })
				            },
				            this.editForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.editDialog.dialog("close");
					    			this.getThirdSysData(id, fid);
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.editDialog.dialog("close");
				})
			}]
		}).dialog("open");
    },
    third_span_del_click : function(e){
    	try{
    		var id = parseInt($(e.currentTarget).parents('li').attr("data-id"),10);
    		var name = $(e.currentTarget).parents('li').data("obj").name;
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除三级流程:" + name,
    			dataobject:"sysFlow",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
	    			$(e.currentTarget).closest('li').fadeOut(function(){
		    		 	$(this).remove();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    risk_add_click : function(){
    	this.qid("code").attr("readonly",false);
    	this.qid("desc").attr("readonly",false);
    	this.add_cons.removeClass("hidden");
    	this.add_left.removeClass("hidden");
    	this.riskDialog.dialog("option",{
    		title:"添加危险源",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.riskForm.valid()){
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"dangerousSource",
					            "obj":JSON.stringify({
					            	"code":this.qid("code").val(),
					            	"description":this.qid("desc").val(),
					            	"beforep":this.qid("a").text(),
					            	"befores":this.qid("b").text(),
					            	"beforer":this.qid("c").text(),
					            	"beforel":this.qid("d").text(),
					            	"afterp":this.qid("e").text(),
					            	"afters":this.qid("f").text(),
					            	"afterr":this.qid("g").text(),
					            	"afterl":this.qid("h").text(),
					            	"future":"",
					            	"sysFlow":this.selectActive
					            })
				            },
				            this.riskForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.getDangerSource(this.selectActive);
					    			this.riskDialog.dialog("close");
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.riskDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    add_cons_click : function(){
    	this.type = "a";
    	this.scoreDialog.dialog("open");
    },
    add_left_click : function(){
    	this.type = "e";
    	this.scoreDialog.dialog("open");
    },
    add_conc_click : function(){
    	this.edit_c_cDialog.dialog("option",{
    		title:"添加后果",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.edit_c_cDialogForm.valid()){
						var description = this.edit_c_cDialogForm.find("textarea.description").val();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"afterMath",
					            "obj":JSON.stringify({
					            	"dangerousSource":this.dangerousSourceId,
					            	"description":description
					            })
				            },
				            this.edit_c_cDialogForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.edit_c_cDialog.dialog("close");
					    			this.getConseq();	
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.edit_c_cDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    add_ctrl_click : function(){
    	this.edit_c_cDialog.dialog("option",{
    		title:"添加控制措施",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.edit_c_cDialogForm.valid()){
						var description = this.edit_c_cDialogForm.find("textarea.description").val();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.add",
					            "dataobject":"riskControl",
					            "obj":JSON.stringify({
					            	"dangerousSource":this.dangerousSourceId,
					            	"description":description
					            })
				            },
				            this.edit_c_cDialogForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.edit_c_cDialog.dialog("close");
					    			this.getCtrl();	
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.edit_c_cDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    getDangerSource : function(id){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"dangerousSource",
				"rule":JSON.stringify([[{"key":"sysFlow","value":id}]]),
				"columns":JSON.stringify([{"data":"code"}]),
           	 	"order":JSON.stringify([{"column":0,"dir":"asc"}])
            },
            this.$,
            this.proxy(function(data){
            	var $table = this.subDangerous.find("table>tbody"),tr = null;
            	$table.empty();
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx, obj){
            		//TODO 得到控制措施
            		tr = this.trTemp.replace(/#\{code\}/g,obj.code)
	        			.replace(/#\{index\}/g,idx + 1)
	        			.replace(/#\{control\}/g,obj.id)
	        			.replace(/#\{description\}/g,obj.description)
	        			.replace(/#\{id\}/g,obj.id || '')
	            		.replace(/#\{beforep\}/g,obj.beforep || '')
	            		.replace(/#\{befores\}/g,obj.befores || '')
	            		.replace(/#\{beforer\}/g,obj.beforer || '')
	            		.replace(/#\{beforel\}/g,obj.beforel || '')
	            		.replace(/#\{afterp\}/g,obj.afterp || '')
	            		.replace(/#\{afters\}/g,obj.afters || '')
	            		.replace(/#\{afterr\}/g,obj.afterr || '')
	            		.replace(/#\{afterl\}/g,obj.afterl || '');
            		$(tr).appendTo($table).data("obj",obj);
            		$table.find("li>a.view").off("click").on("click", this.proxy(this.aView));
            		$table.find("li>a.edit").off("click").on("click", this.proxy(this.aEdit));
            		$table.find("li>a.del").off("click").on("click", this.proxy(this.aDel));
            		$table.find("li>a.consq").off("click").on("click", this.proxy(this.aConseq));
            		$table.find("li>a.ctrl").off("click").on("click", this.proxy(this.aCtrl));
            		this._ajax(
        	    		$.u.config.constant.smsqueryserver,
        	    		'POST',
        	    		{
        	    			"method":"stdcomponent.getbysearch",
        					"dataobject":"riskControl",
        					"rule":JSON.stringify([[{"key":"dangerousSource","value":obj.id}]])
        	            },
        	            this.$,
        	            this.proxy(function(data){
        	            	var ctrl = "";
        	            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(key, value){
        	            		ctrl += value.description+"<br/>";
        	            	}));
        	            	$table.find("td[data-control="+obj.id+"]").html(ctrl);
        	            })
        	    	);
            	}));
            })
    	);
    },
    aView : function(e){
    	var id = parseInt($(e.currentTarget).parents('tr').attr("data-id"),10),
			obj = $(e.currentTarget).parents('tr').data("obj");
		this.qid("code").val(obj.code||"").attr("readonly",true);
		this.qid("desc").val(obj.description||"").attr("readonly",true);
		this.qid("a").text(obj.beforep||"");
		this.qid("b").text(obj.befores||"");
		this.qid("c").text(obj.beforer||"");
		this.qid("d").text(obj.beforel||"");
		this.qid("e").text(obj.afterp||"");
		this.qid("f").text(obj.afters||"");
		this.qid("g").text(obj.afterr||"");
		this.qid("h").text(obj.afterl||"");
		this.add_cons.addClass("hidden");
    	this.add_left.addClass("hidden");
		this.riskDialog.dialog("option",{
    		title:"查看危险源",
			buttons:[{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.riskDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    aEdit : function(e){
    	var id = parseInt($(e.currentTarget).parents('tr').attr("data-id"),10),
    		obj = $(e.currentTarget).parents('tr').data("obj");
    	this.qid("code").val(obj.code||"").attr("readonly",false);
    	this.qid("desc").val(obj.description||"").attr("readonly",false);
    	this.qid("a").text(obj.beforep||"");
    	this.qid("b").text(obj.befores||"");
    	this.qid("c").text(obj.beforer||"");
    	this.qid("d").text(obj.beforel||"");
    	this.qid("e").text(obj.afterp||"");
    	this.qid("f").text(obj.afters||"");
    	this.qid("g").text(obj.afterr||"");
    	this.qid("h").text(obj.afterl||"");
    	this.add_cons.removeClass("hidden");
    	this.add_left.removeClass("hidden");
    	this.riskDialog.dialog("option",{
    		title:"编辑危险源",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.riskForm.valid()){
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"dangerousSource",
					            "dataobjectid":id,
					            "obj":JSON.stringify({
					            	"code":this.qid("code").val(),
					            	"description":this.qid("desc").val(),
					            	"beforep":this.qid("a").text(),
					            	"befores":this.qid("b").text(),
					            	"beforer":this.qid("c").text(),
					            	"beforel":this.qid("d").text(),
					            	"afterp":this.qid("e").text(),
					            	"afters":this.qid("f").text(),
					            	"afterr":this.qid("g").text(),
					            	"afterl":this.qid("h").text(),
					            	"future":"",
					            	"sysFlow":this.selectActive
					            })
				            },
				            this.riskForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.getDangerSource(this.selectActive);
					    			this.riskDialog.dialog("close");
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.riskDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    aDel : function(e){
    	try{
    		var id = parseInt($(e.currentTarget).parents('tr').attr("data-id"),10);
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除:",
    			dataobject:"dangerousSource",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
	    			$(e.currentTarget).closest('tr').fadeOut(function(){
		    		 	$(this).remove();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    aConseq : function(e){
    	var id = parseInt($(e.currentTarget).parents("tr").attr("data-id"), 10);
    	this.dangerousSourceId = id;
    	this.getConseq();
    	this.concDialog.dialog("option",{
    		title:"后果",
			buttons:[{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.concDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    getConseq : function(){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"afterMath",
				"rule":JSON.stringify([[{"key":"dangerousSource","value":this.dangerousSourceId}]])
            },
            this.$,
            this.proxy(function(data){
            	var $table = this.concForm.find("table>tbody"),tr = null;
            	$table.empty();
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx, obj){
            		tr = this.ctrlTemp.replace(/#\{index\}/g,idx+1)
            			.replace(/#\{description\}/g,obj.description || '')
	            		.replace(/#\{id\}/g,obj.id || '');
            		$(tr).appendTo($table).data("obj",obj);
            		$table.find("td>span.edit").off("click").on("click", this.proxy(this.conseqEdit));
            		$table.find("td>span.del").off("click").on("click", this.proxy(this.conseqDel));
            	}));
            })
    	);
    },
    aCtrl : function(e){
    	var id = parseInt($(e.currentTarget).parents("tr").attr("data-id"), 10);
    	this.dangerousSourceId = id;
    	this.getCtrl();
    	this.ctrlDialog.dialog("option",{
    		title:"控制措施",
			buttons:[{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.ctrlDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    getCtrl : function(){
    	this._ajax(
    		$.u.config.constant.smsqueryserver,
    		'POST',
    		{
    			"method":"stdcomponent.getbysearch",
				"dataobject":"riskControl",
				"rule":JSON.stringify([[{"key":"dangerousSource","value":this.dangerousSourceId}]])
            },
            this.$,
            this.proxy(function(data){
            	var $table = this.ctrlForm.find("table>tbody"),tr = null;
            	$table.empty();
            	data.data.aaData && $.each(data.data.aaData, this.proxy(function(idx, obj){
            		tr = this.ctrlTemp.replace(/#\{index\}/g,idx+1)
            			.replace(/#\{description\}/g,obj.description || '')
	            		.replace(/#\{id\}/g,obj.id || '');
            		$(tr).appendTo($table).data("obj",obj);
            		$table.find("td>span.edit").off("click").on("click", this.proxy(this.ctrlEdit));
            		$table.find("td>span.del").off("click").on("click", this.proxy(this.ctrlDel));
            	}));
            })
    	);
    },
    ctrlEdit : function(e){
    	var id = parseInt($(e.currentTarget).parents("tr").attr("data-id"), 10),
			text = $(e.currentTarget).parents("tr").data("obj").description;
		this.edit_c_cDialogForm.find("textarea.description").val(text);
		this.edit_c_cDialog.dialog("option",{
			title:"编辑控制措施",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.edit_c_cDialogForm.valid()){
						var description = this.edit_c_cDialogForm.find("textarea.description").val();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"riskControl",
					            "dataobjectid":id,
					            "obj":JSON.stringify({
					            	"description":description
					            })
				            },
				            this.edit_c_cDialogForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.edit_c_cDialog.dialog("close");
					    			this.getCtrl();	
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.edit_c_cDialog.dialog("close");
				})
			}]
		}).dialog("open");
    },
    ctrlDel : function(e){
    	try{
    		var id = parseInt($(e.currentTarget).parents('tr').attr("data-id"),10);
    		var name = $(e.currentTarget).parents('tr').data("obj").description;
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除控制措施:" + name,
    			dataobject:"riskControl",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
	    			$(e.currentTarget).closest('tr').fadeOut(function(){
		    		 	$(this).remove();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    conseqEdit : function(e){
    	var id = parseInt($(e.currentTarget).parents("tr").attr("data-id"), 10),
    		text = $(e.currentTarget).parents("tr").data("obj").description;
    	this.edit_c_cDialogForm.find("textarea.description").val(text);
    	this.edit_c_cDialog.dialog("option",{
    		title:"编辑后果",
			buttons:[{
				"text" : "保存",
				"class" : "ok",
				"click" : this.proxy(function(){
					if(this.edit_c_cDialogForm.valid()){
						var description = this.edit_c_cDialogForm.find("textarea.description").val();
						this._ajax(
							$.u.config.constant.smsmodifyserver,
							"post",
				    		{
					    		"method": "stdcomponent.update",
					            "dataobject":"afterMath",
					            "dataobjectid":id,
					            "obj":JSON.stringify({
					            	"description":description
					            })
				            },
				            this.edit_c_cDialogForm,
				            this.proxy(function(response){
				            	if(response.success){
					    			$.u.alert.success("保存成功",3000);
					    			this.edit_c_cDialog.dialog("close");
					    			this.getConseq();	
					    		}
					    	})
					    );
					}
				})
			},{
				"text" : "关闭",
				"class": "aui-button-link",
				"click" : this.proxy(function(){
					this.edit_c_cDialog.dialog("close");
				})
			}]
    	}).dialog("open");
    },
    conseqDel : function(e){
    	try{
    		var id = parseInt($(e.currentTarget).parents('tr').attr("data-id"),10);
    		var name = $(e.currentTarget).parents('tr').data("obj").description;
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除后果:" + name,
    			dataobject:"afterMath",
    			dataobjectids:JSON.stringify([parseInt(id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
	    			$(e.currentTarget).closest('tr').fadeOut(function(){
		    		 	$(this).remove();
		    		});
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    _ajax:function(url,type,param,$container,callback){
    	$.u.ajax({
    		"url":url,
    		"type": type,
    		"data":$.cookie("tokenid") ? $.extend({"tokenid":$.parseJSON($.cookie("tokenid"))},param) : $.extend({"tokenid":$.parseJSON($.cookie("uskyuser")).tokenid},param),
    		"dataType":"json"
    	},$container).done(this.proxy(function(response){
    		if (response.success) {
    			callback && callback(response);
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
    }
}, { usehtm: true, usei18n: false });

com.sms.safelib.dangerSourceList.widgetjs = ["../../../uui/widget/jqurl/jqurl.js","../../../uui/widget/spin/spin.js",
		                                     "../../../uui/widget/jqblockui/jquery.blockUI.js",
		                                     "../../../uui/widget/ajax/layoutajax.js",
		                                     "../../../uui/widget/select2/js/select2.min.js"];
com.sms.safelib.dangerSourceList.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                              {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];