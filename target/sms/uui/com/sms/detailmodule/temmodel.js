//@ sourceURL=com.sms.detailmodule.temmodel
$.u.define('com.sms.detailmodule.temmodel', null, {
    init: function (option) {
    	this._options = option || {};
        this.i18n = com.sms.detailmodule.temmodel.i18n;
    	this._select2PageLength = 10;
    	this._COMPLETE = "COMPLETE";
    	this._denyModify = this._options.statusCategory === this._COMPLETE || this._options.editable === false;
    	this.tem =  '<div class="tem-core" data-id="#{id}">' 
    		   +	'<table class="uui-table" >'
			   +		'<thead>'
			   +			'<tr class="infomodel-title">'
			   +				'<th>'
			   +					'<span class="fa fa-chevron-down hidden"></span>#{no}: TEM分析(#{system})'
			   +				'</th>'
			   +				'<th class="operate-tool"><i class="fa fa-pencil fa-lg edit-tem" data-id="#{id}" ></i></th>'
			   +				'<th class="operate-tool"><i class="fa fa-trash-o fa-lg remove-tem" data-id="#{id}" ></i></th>'
			   +			'</tr>'
			   +		'</thead>'
			   +		'<tbody>'
			   +			'<tr>'
			   +				'<td colspan="3" style="padding:0;">'
			   +    				'<ul class="property-list two-cols">'
			   +						'<li class="item" style="width:100%;"><div class="wrap"><strong class="name">严重程度:</strong><span class="value span-severity" >#{severity}</span></div></li>'
			   +						'<li class="item" style="width:100%;"><div class="wrap"><strong class="name">对应条款:</strong><span class="value span-provision" >#{provision}</span></div></li>'
			   +						'<li class="item" style="width:100%;"><div class="wrap"><strong class="name">不安全状态:</strong><span class="value span-insecurity" >#{insecurity}</span></div></li>'
			   +						'<li class="item" style="width:100%;"><div class="wrap"><strong class="name">重大风险:</strong><span class="value span-consequence" >#{consequence}</span></div></li>'
			   +						'<li class="item" style="width:100%;"><div class="wrap"><strong class="name">分数:</strong><span class="value span-score" >#{score}</span></div></li>'
			   +					'</ul>'
			   +				'</td>'
			   +			'</tr>'
			   +		'</tbody>'
			   +	'<table class="uui-table table-fixed">'
			   +		'<thead>'
			   +			'<tr>'
			   +				'<th style="width:30%;">威胁</th>'
			   +				'<th colspan="">控制措施</th>'
               +                '<th style="width:80px;">分数</th>'
               +                '<th class="operate-tool control-measure-tool" style="border:none;"></th>'
               +                '<th class="operate-tool" style="border:none;"><button type="button" class="button-create-DE" class="btn btn-primary dropdown-toggle" style="height:100%;border:0;background-color: #A2ACB6;" data-toggle="dropdown"><span title="新增危险源" style="color:#fff">新建</span></button></th>'
			   +				'<th class="operate-tool"><i class="fa fa-plus fa-lg btn-threat" title="添加威胁" data-id="#{id}" ></i></th>'
			   +			'</tr>'
			   +		'</thead>'
			   +		'<tbody class="threatlist"></tbody>'
			   +	'</table>'
			   +	'<table class="uui-table table-fixed">'
			   +		'<thead>'
			   +			'<tr>'
			   +				'<th style="width:30%;">差错</th>'
			   +				'<th colspan="">控制措施</th>'
               +                '<th style="width:80px;">分数</th>'
               +                '<th class="operate-tool control-measure-tool" style="border:none;"> </th>'
               +                '<th class="operate-tool" style="border:none;"><button type="button" class="button-create-DE" class="btn btn-primary dropdown-toggle" style="height:100%;border:0;background-color: #A2ACB6;" data-toggle="dropdown"><span title="新增危险源" style="color:#fff">新建</span></button></th>'
			   +				'<th class="operate-tool"><i class="fa fa-plus fa-lg btn-error"  title="添加差错" data-id="#{id}" ></i></th>'
			   +			'</tr>'
			   +		'</thead>'
			   +		'<tbody class="errorlist"></tbody>'
			   +	'</table>'
			   + '</div>';
    	this.threatTr = '<tr>'
							+'<td>#{name}</td>'
							//+'<td><a href="#" class="control" data-id="#{id}" data-dic-id="#{threat_id}" data-type="threat">控制措施</a></td>'
                            +'<td><ol class="list-unstyled controlMeasures"  style="margin:0; "></ol></td>'
							+'<td><span>#{score}</span></td>'
                            +'<td class="operate-tool">'
                                +'<i data-id="#{id}" class="fa fa-plus fa-lg btn-addcontrolmeasure" data-type="threat" data-threatErrorId="#{threat_id}" ></i>'
                            +'</td>'
                            +'<td class="operate-tool"><span data-id="#{id}" data-type="threat" class="glyphicon glyphicon-#{start}" ></span></td>'
							+'<td class="operate-tool">'
								+'<i data-id="#{id}" class="fa fa-trash-o fa-lg btn-removethreat" ></i>'
							+'</td>'
						+'</tr>';
    	this.errorTr = '<tr>'
							+'<td>#{name}</td>'
							//+'<td><a href="#" class="control" data-id="#{id}" data-dic-id="#{error_id}" data-type="error">控制措施</a></td>'
							+'<td><ol class="list-unstyled controlMeasures"  style="margin:0; "></ol></td>'
                            +'<td><span>#{score}</span></td>'
                            +'<td class="operate-tool">'
                                +'<i data-id="#{id}" class="fa fa-plus fa-lg btn-addcontrolmeasure" data-type="error" data-threatErrorId="#{error_id}" ></i>'
                            +'</td>'
                            +'<td class="operate-tool"><span data-id="#{id}"  data-type="error" class="glyphicon glyphicon-#{start}" ></span></td>'
							+'<td class="operate-tool">'
								+'<i data-id="#{id}"  class="fa fa-trash-o fa-lg btn-removeerror" ></i>'
							+'</td>'
						+'</tr>';
        this.controlTemplate = "<li style='padding-right: 5em; position: relative;'>" +
                                    "<button style='padding-left: 0;width:50%;'  class='btn btn-link btn-sm actionItem' data-id='#{id}' data-title='#{title}'>" +
                                        "<div style='overflow: hidden;text-overflow: ellipsis;' class='text-left' title='#{Number}&nbsp;#{title}'><nobr>#{Number}&nbsp;#{title}</nobr></div>" +
                                    "</button>" +
                                    "<div style='position: absolute; top: 8px; right: 10%;line-height: 1.1em;'>#{status}<i class='fa fa-trash-o uui-cursor-pointer removeControlMeasure mod-edit mod-add' style='padding-left:.3em;'  data-id='#{id}' title='" + this.i18n.buttons.remove + "'></i></div>" +
                                "</li>";
        this._curr_tem = {};
    },
    afterrender: function (bodystr) {
    	this.editTemDialog = null;								// 编辑tem的组件
    	this.threatDialog = null;								// threat组件
    	this.errorDialog = null;								// error组件
    	this.controlDialog = null;								// control组件
    	this.addTemDialog = null;								// 新增temp组件 
    		
    	if(this._denyModify === true){
    		this.qid("btn_add").remove();
    	}else{ 
    		this.qid("btn_add").click(this.proxy(this.on_add_click));
        	this.qid("content-tem").on("click", ".edit-tem", this.proxy(this.on_edit_click));
        	this.qid("content-tem").on("click", ".remove-tem", this.proxy(this.on_remove_click));
        	this.qid("content-tem").on("click", ".btn-threat", this.proxy(this.on_threat_click));
        	this.qid("content-tem").on("click", ".btn-error", this.proxy(this.on_error_click));
            this.qid("content-tem").on("click", ".btn-addcontrolmeasure", this.proxy(this.on_addControlMeasure_click));
            this.qid("content-tem").on("click", ".removeControlMeasure", this.proxy(this.on_removeControlMeasure_click));
            
        	this.qid("content-tem").on("click", ".threatlist .btn-removethreat", this.proxy(this.on_removethreat_click));
        	this.qid("content-tem").on("click", ".threatlist .btn-setprimary", this.proxy(this.on_setprimary_click));
        	this.qid("content-tem").on("click", ".errorlist .btn-removeerror", this.proxy(this.on_removeerror_click));
        	this.qid("content-tem").on("click", ".errorlist .btn-setprimary", this.proxy(this.on_setprimary_click));
        	/**
        	 * @title 新增危险源
        	 * 
        	 */
        	this.qid("content-tem").on("click",".button-create-DE",this.proxy(this.on_createActivityButton_click));
        	this.qid("content-tem").on("click",".button-create-ER", this.proxy(this.on_createActivityButton_click));
    	}
    	this.qid("content-tem").on("click", ".actionItem", this.proxy(this.on_actionItem_click));
    	// this.qid("content-tem").on("click", ".threatlist a.control", this.proxy(this.on_editcontrol_click));
    	// this.qid("content-tem").on("click", ".errorlist a.control", this.proxy(this.on_editcontrol_click));
    	
    	this._options.tems && $.each(this._options.tems, this.proxy(function(idx, tem){
    		this._draw(tem, idx + 1);
    	}));
    },
    /**
     * @title 新增危险源
     */
    on_createActivityButton_click: function(e) {
        if (this.activityDialog == null) {
            $.u.load("com.sms.activityinfo.create");
            this.activityDialog = new com.sms.activityinfo.create($("div[umid=activityDialog]", this.$));
        }
        this.activityDialog.open({type:"tem"});
    },
    /**
     * @title 添加TEM
     * @return void
     */
    on_add_click: function(){
    	if(this.addTemDialog == null){
    		this.addTemDialog = this.qid("addDialog").removeClass("hidden").dialog({
    			title: "选择TEM系统分类",
    			width: 520,
    			modal: true,
    			resizable: false,
    			draggable: false,
    			autoOpen: false,
    			create: this.proxy(this.on_addTemDialog_create),
    			close: this.proxy(function(){
    				this.qid("system").select2("val", null);
    			}),
    			buttons: [
    			    {
    			    	"text": "添加",
    			    	"click": this.proxy(this.on_addTemDialog_save)
    			    },
    			    {
    			    	"text": "取消",
    			    	"class": "aui-button-link",
    			    	"click": this.proxy(function(){
    			    		this.addTemDialog.dialog("close");
    			    	})
    			    }
    			]
    		});
    	}
    	this.addTemDialog.dialog("open");
    },
    on_addTemDialog_create: function(){
    	this.qid("system").select2({
			width: 300,
			minimumResultsForSearch: -1,
			ajax: {
				url: $.u.config.constant.smsqueryserver,
				type: "post",
				data: this.proxy(function(term, page){
					return {
						"tokenid": $.cookie("tokenid"),
						"method": "getSysTemByUser",
						"dataobject": "organization"    								
					};
				}),
				results: this.proxy(function(response, query, page){
					if(response.success){
                        return {results: response.data};
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
		});
    },
    on_addTemDialog_save: function(){
    	var system = this.qid("system").select2("data");
    	if(!system){
    		this.qid("system").select2("focus");
    	}else{
    		$.u.ajax({
    			url: $.u.config.constant.smsmodifyserver,
    			type: "post",
    			dataType: "json",
    			data: { 
    				"tokenid": $.cookie("tokenid"),
    				"method": "stdcomponent.add",
    				"dataobject": "tem",
    				"obj": JSON.stringify({"activity": this._options.activity, "sysType": system.id })
    			}
    		}, this.addTemDialog.parent(), {size:2, background:"#fff"}).done(this.proxy(function(response){
    			if (response.success) {
    				this._reload();
    				this.addTemDialog.dialog("close");
    			} 
    		}));
    	}
    },
    /**
     * @title 编辑TEM
     * @return void
     */
    on_edit_click: function(e){
    	this._curr_tem =  $(e.currentTarget).closest(".tem-core").data("data"); 
    	if(this.editTemDialog === null){
    		$.u.load("com.sms.detailmodule.temDialog");
    		this.editTemDialog = new com.sms.detailmodule.temDialog($("div[umid=editdialog]",this.$));
    		this.editTemDialog.override({
    			refreshDataTable:this.proxy(function(data){ 
    				this._reload(this._curr_tem.id);
    			})
    		});
    	}
		this.editTemDialog.open(this._curr_tem);
    },
    /**
     * @title 删除TEM
     * @return void
     */    
    on_remove_click: function(e){
    	var $tem = $(e.currentTarget).closest(".tem-core"), tem = $tem.data("data");
    	this._showRemoveDialog("请确认删除TEM操作？",{"method":"stdcomponent.delete","dataobject": "tem", "dataobjectids": JSON.stringify([tem.id])},this.proxy(function(){
    		$tem.fadeOut(this.proxy(function(){
    			this._reload();
    		}));
    	}));
    },
    /**
     * @title 添加威胁
     * @return void
     */
    on_threat_click:function(e){
    	var $tem = $(e.currentTarget).closest(".tem-core"), tem = $tem.data("data");
    	if($(e.currentTarget).closest("table").find("tbody > tr").length == 4){
    		$.u.alert.error("最多添加4个威胁", 1000 * 2);
    		return;
    	}
    	if(tem && tem.insecurity && tem.insecurity.id){
    		$.u.load("com.sms.detailmodule.threatErrorDialog");
	    	this.threatDialog && this.threatDialog.destroy();
        	this.threatDialog = new com.sms.detailmodule.threatErrorDialog($("div[umid='threatdialog']",this.$),{
        		title: "威胁",
        		type: "THREAT",
        		temId: tem.id,
        		insecurityId: tem.insecurity.id, 
        		sysTypeId: tem.sysTypeId 	        
        	});
        	this.threatDialog.override({
        		save: this.proxy(this._saveThreat)
        	});
	    	this.threatDialog.open();
    	}else{
    		alert("请填写不安全状态");
    	}
    },
    /**
     * @title 添加差错
     * @return void
     */
    on_error_click:function(e){
    	var $tem = $(e.currentTarget).closest(".tem-core"), tem = $tem.data("data");
    	if($(e.currentTarget).closest("table").find("tbody > tr").length == 4){
    		$.u.alert.error("最多添加4个差错", 1000 * 2);
    		return;
    	}
    	if(tem && tem.insecurity && tem.insecurity.id){
    		$.u.load("com.sms.detailmodule.threatErrorDialog");
    		this.errorDialog && this.errorDialog.destroy();
    		this.errorDialog = new com.sms.detailmodule.threatErrorDialog($("div[umid='errordialog']",this.$),{
        		title: "差错",
        		type: "ERROR",
        		temId: tem.id,
        		insecurityId: tem.insecurity.id, 
        		sysTypeId: tem.sysTypeId   
        	});
        	this.errorDialog.override({
        		save: this.proxy(this._saveError)
        	});
	    	this.errorDialog.open();
    	}else{
    		alert("请填写不安全状态");
    	}
    },
    /**
     * @title 删除威胁
     * @param e {object} 鼠标对象
     * @return void
     */
    on_removethreat_click:function(e){
    	var $this = $(e.currentTarget), id = $this.attr("data-id"), tem = $this.closest(".tem-core").data("data");
    	this._showRemoveDialog("请确认删除威胁操作？",{"method":"removethreat","threat":parseInt(id)},this.proxy(function(){
    		this._reload(tem.id);
    	}));
    },
    /**
     * @title 删除差错
     * @param e {object} 鼠标对象
     * @return void
     */
    on_removeerror_click:function(e){
    	var $this = $(e.currentTarget),id = $this.attr("data-id"), tem = $this.closest(".tem-core").data("data");
    	this._showRemoveDialog("请确认删除差错操作？",{"method":"removeerror","error":parseInt(id)},this.proxy(function(){
    		this._reload(tem.id);
    	}));
    },
    /**
     * @title 将威胁或差错设为主要
     * @param e {object} 鼠标对象
     * @return void
     */
    on_setprimary_click:function(e){
    	var $this = $(e.currentTarget), tem = $this.closest(".tem-core").data("data"), type = $this.attr("data-type"),id=parseInt($this.attr("data-id")),obj = {};
    	if(type == "threat"){
    		obj.primaryThreat = id;
    	}else if(type == "error"){
    		obj.primaryError = id;
    	}
    	$.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method":"stdcomponent.update",
        		"dataobject":"tem",
        		"dataobjectid": tem.id,
        		"obj":JSON.stringify(obj)
            }
        }, $this.closest(".tem-core"),{size:2,backgroundColor:"#fff"}).done(this.proxy(function (response) {
            if (response.success) {
                this._reload(tem.id);
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        }));
    },    
    on_actionItem_click: function(e){
        var $this = $(e.currentTarget), tem = $this.closest(".tem-core").data("data"), controlMeasureId = parseInt($this.attr("data-id")), title = $this.attr("data-title"), editable = $this.closest("tr").attr("data-editable");
        this.actionItemDialog && this.actionItemDialog.destroy();
        var clz = $.u.load("com.sms.detailmodule.actionItemDialog");
        this.actionItemDialog = new clz(this.$.find("div[umid=actionItemDialog]"), {
            "activity": this._options.activity,
            "statusCategory": this._options.statusCategory,
            "cate": "MEASURE",
            "mode": "TEM"
        });
        this.actionItemDialog.override({
            refreshControlMeasure:this.proxy(function(){
                this._reload(tem.id);
            })
        });
        this.actionItemDialog.open(controlMeasureId, title);
    },
    on_addControlMeasure_click: function(e){
        var $this = $(e.currentTarget), type = $this.attr("data-type"), threatOrErrorId = parseInt($this.attr("data-threatErrorId")), mappingId = parseInt($this.attr("data-id")) , obj = {};
        if(!this.selectControlDialog){
            var clz = $.u.load("com.sms.detailmodule.selectControl");
            this.selectControlDialog = new clz(this.$.find("div[umid=selectControlDialog]"));
        }
        this.selectControlDialog.override({
            save: this.proxy(function(newIds){
                this._addControlMeasure({
                    "objs": $.map(newIds, function(newId, idx){
                        obj = {};
                        obj[type] = mappingId;
                        obj.control = newId;
                        return obj;
                    }),
                    "container": $this.closest("tr").find(".controlMeasures"),
                    "temId": $this.closest(".tem-core").data("data").id
                });
            })
        });
        this.selectControlDialog.open({
            "type": type,
            "threatOrErrorId": threatOrErrorId
        });
    },
    on_removeControlMeasure_click: function(e){
        var $this = $(e.currentTarget), id= parseInt($(e.currentTarget).attr("data-id"));
        $.u.load("com.sms.common.stdcomponentdelete");
        (new com.sms.common.stdcomponentdelete({
            body:"<div>"+
                    "<div class='alert alert-warning'>"+
                        "<span class='glyphicon glyphicon-exclamation-sign'></span>"+ this.i18n.messages.confirmDeleteActionItem +
                    "</div>"+
                 "</div>",
            title: "确认删除",
            dataobject: "controlMeasure",
            dataobjectids:JSON.stringify([id])
        })).override({
            refreshDataTable:this.proxy(function(){
                $this.closest("li").remove();
            })
        });
    },
    /**
     * @title 编辑控制措施
     * @param e {object} 鼠标对象
     * @return void
     */
    on_editcontrol_click:function(e){
    	e.preventDefault();
    	var $this = $(e.currentTarget),
    		type = $this.attr("data-type"),
    		data_id = parseInt($this.attr("data-id")),
    		dic_id = parseInt($this.attr("data-dic-id"));
    	if(this.controlDialog == null){
    		$.u.load("com.sms.detailmodule.controlDialog");
    		this.controlDialog = new com.sms.detailmodule.controlDialog($("div[umid=controldialog]",this.$),{
    			"activity": this._options.activity, 
    			"statusCategory": this._options.statusCategory
    		});
    	}
    	this.controlDialog.open(data_id,dic_id,type);
    },
    /**
     * @title 刷新tem数据
     * @param temid {int} tem编号 （如果没有则取全局temid）
     * @return void
     */
    _reload:function(temid){
    	if(temid){	    
    		var $tem = $(".tem-core[data-id=" + temid + "]", this.$), $threatlist = $tem.find(".threatlist"), $errorlist = $tem.find(".errorlist");
	    	$.u.ajax({
	            url: $.u.config.constant.smsqueryserver,
	            type: "post",
	            dataType: "json",
	            data: {
	                "tokenid": $.cookie("tokenid"),
	                "method":"stdcomponent.getbyid",
	        		"dataobject":"tem",
	        		"dataobjectid":temid
	            }
	        }, $tem ,{size:2,backgroundColor:"#fff"}).done(this.proxy(function (response) {
	            if (response.success) {
	            	var data = response.data,
                        threatScore = 0,
                        errorScore = 0;

                    if(data.provision && data.provision.score){
                        if(data.threats && data.errors && data.threats.length > 0 && data.errors.length > 0){
                            threatScore = Number(data.provision.score * 0.4).toFixed(2);
                            errorScore = Number(data.provision.score * 0.6).toFixed(2);
                        }
                        else if(data.threats && data.threats.length > 0){
                            threatScore = data.provision.score;
                        }
                        else if(data.errors && data.errors.length > 0){
                            errorScore = data.provision.score;
                        }
                    }

	                $tem.data("data", data);
    				$tem.find(".span-severity").text(data.severity ? data.severity.name : "");
    				$tem.find(".span-provision").text(data.severity ? data.provision.name : "");
    				$tem.find(".span-insecurity").text(data.severity ? data.insecurity.name : "");
    				$tem.find(".span-consequence").text(data.severity ? data.consequence.name : "");
    				$tem.find(".span-score").text(data.provision ? data.provision.score : "");
    				
    				$threatlist.empty();
    				data.threats && $.each(data.threats,this.proxy(function(idx, map){
    	        		this._drawThreat(map, data.primaryThreat == map.id, $threatlist, data.threats.length, threatScore);
    	        	}));
    	    		
    				$errorlist.empty();
    	    		data.errors && $.each(data.errors,this.proxy(function(idx, map){
    	        		this._drawError(map, data.primaryError == map.id, $errorlist, data.errors.length, errorScore);
    	        	}));
	            }
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	        }));
    	}else{
    		$.u.ajax({
	            url: $.u.config.constant.smsqueryserver,
	            type: "post",
	            dataType: "json",
	            data: {
	                "tokenid": $.cookie("tokenid"),
	                "method": "stdcomponent.getbysearch",
	        		"dataobject": "tem",
	        		"rule": JSON.stringify([[{"key":"activity", "value":this._options.activity}]]),
	        		"columns": JSON.stringify([{"data":"created"}]),
	        		"order": JSON.stringify([{"column":0,"dir":"asc"}])
	            }
	        }, this.qid("content-tem") ,{size:2,backgroundColor:"#fff"}).done(this.proxy(function (response) {
	            if (response.success) {
	            	this.qid("content-tem").empty();
	            	$.each(response.data.aaData, this.proxy(function(idx, item){
	            		this._draw(item, idx + 1);
	            	}));
	            }
	        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
	        }));
    	}
    },
    /**
     * @title 呈现数据到界面上
     * @param data {object} tem数据
     * @return void
     */
    _draw:function(data, no){
    	if (data) {
    		var $tem, $threatlist, $errorlist, htmls, threatScore = 0, errorScore = 0;
            if(data.provision && data.provision.score){
                if(data.threats && data.errors && data.threats.length > 0 && data.errors.length > 0){
                    threatScore = Number(data.provision.score * 0.4).toFixed(2);
                    errorScore = Number(data.provision.score * 0.6).toFixed(2);
                }
                else if(data.threats && data.threats.length > 0){
                    threatScore = data.provision.score;
                }
                else if(data.errors && data.errors.length > 0){
                    errorScore = data.provision.score;
                }
            }
    		htmls = this.tem.replace(/#\{id\}/g, data.id)
    						.replace(/#\{no\}/g, no)
    						.replace(/#\{system\}/g, data.sysType || "")
    						.replace(/#\{severity\}/g, data.severity ? data.severity.name : "")
    						.replace(/#\{provision\}/g, data.provision ? data.provision.name : "")
    						.replace(/#\{score\}/g, data.provision ? data.provision.score : "")
    						.replace(/#\{insecurity\}/g, data.insecurity ? data.insecurity.name : "")
    						.replace(/#\{consequence\}/g, data.consequence ? data.consequence.name : "");
    		$tem = $(htmls).appendTo(this.qid("content-tem")).data("data", data);
    		$threatlist = $tem.find(".threatlist");
    		$errorlist = $tem.find(".errorlist");
    		
    		if(this._denyModify === true){
    			var $obj = $tem.find(".edit-tem,.remove-tem,.btn-threat,.btn-error");
                $.each($obj, function(idx, obj){
                    if($(obj).parent().hasClass("operate-tool")){
                        $(obj).parent().remove();
                    }
                    else{
                        $obj.remove();
                    }
                });
    		}
    		
    		data.threats && $.each(data.threats, this.proxy(function(idx, map){
        		this._drawThreat(map, data.primaryThreat == map.id, $threatlist, data.threats.length, threatScore);
        	}));
    		
    		data.errors && $.each(data.errors, this.proxy(function(idx, map){
        		this._drawError(map, data.primaryError == map.id, $errorlist, data.errors.length, errorScore);
        	}));
    	}
    },
    /**
     * @title 绘制单条威胁信息
     * @param map {object} 威胁数据
     * @param isPrimary {bool} 是否主要
     * @param threatsCount {int} 威胁个数
     * @param totalScore {int} 分数
     * @return void
     */
    _drawThreat:function(map, isPrimary, container, threatsCount, totalScore){
    	if(map && map.threat){
    		var htmls = "", $obj = null, $controlContainer = null, score = 0;
            if(threatsCount === 1){
                score = totalScore;
            }
            else if(threatsCount === 2){
                score = isPrimary ? Number(totalScore * 0.6).toFixed(2) : Number(totalScore * 0.4).toFixed(2);
            }
            else if(threatsCount === 3){
                score = isPrimary ? Number(totalScore * 0.6).toFixed(2) : Number(totalScore * 0.2).toFixed(2);    
            }
            else if(threatsCount === 4){
                score = isPrimary ? Number(totalScore * 0.7).toFixed(2) : Number(totalScore * 0.1).toFixed(2);    
            }
    		htmls = this.threatTr.replace(/#\{name}/g, map.threat.name)
    							 .replace(/#\{start}/g, isPrimary ? "star" : "star-empty btn-setprimary")
    							 .replace(/#\{id}/g, map.id)
                                 .replace(/#\{score}/g, score)
    							 .replace(/#\{threat_id}/g, map.threat.id);
    		$obj = $(htmls).appendTo(container);
            $controlContainer = $obj.find(".controlMeasures");
            $.each(map.controlMeasures.data || [], this.proxy(function(idx, controlMeasure){
                this._drawControlMeasure(controlMeasure, map.controlMeasures.editable, $controlContainer);
            }));
    		if(this._denyModify === true){
    			$obj.find(".btn-removethreat").parent().remove();
                $obj.find(".btn-addcontrolmeasure").parent().remove();
                $obj.closest("table").find("th.control-measure-tool").remove();
    			$obj.find(".btn-setprimary").css("cursor", "default");
    		}
    	}
    },
    /**
     * @title 绘制单条差错信息
     * @param map {object} 差错数据
     * @param isPrimary {bool} 是否主要
     * @param errorsCount {int} 差错个数
     * @param totalScore {int} 分数
     * @return void
     */
    _drawError:function(map,isPrimary,container, errorsCount, totalScore){
    	if(map && map.error){
    		var htmls = "", $obj = null, $controlContainer = null, score = 0;
            if(errorsCount === 1){
                score = totalScore;
            }
            else if(errorsCount === 2){
                score = isPrimary ? Number(totalScore * 0.6).toFixed(2) : Number(totalScore * 0.4).toFixed(2) ;
            }
            else if(errorsCount === 3){
                score = isPrimary ? Number(totalScore * 0.6).toFixed(2) : Number(totalScore * 0.2).toFixed(2) ;    
            }
            else if(errorsCount === 4){
                score = isPrimary ? Number(totalScore * 0.7).toFixed(2)  : Number(totalScore * 0.1).toFixed(2) ;    
            }
    		htmls = htmls = this.errorTr.replace(/#\{name}/g, map.error.name)
        			 					.replace(/#\{start}/g, isPrimary ? "star" : "star-empty btn-setprimary")
            							.replace(/#\{id}/g, map.id)    
                                        .replace(/#\{score}/g, score)							
            							.replace(/#\{error_id}/g, map.error.id);
    		$obj = $(htmls).appendTo(container);
            $controlContainer = $obj.find(".controlMeasures");
            $.each(map.controlMeasures.data || [], this.proxy(function(idx, controlMeasure){
                this._drawControlMeasure(controlMeasure, map.controlMeasures.editable, $controlContainer);
            }));
    		if(this._denyModify === true){
    			$obj.find(".btn-removeerror").parent().remove();
                $obj.find(".btn-addcontrolmeasure").parent().remove();
                $obj.closest("table").find("th.control-measure-tool").remove();
    			$obj.find(".btn-setprimary").css("cursor", "default");
    		}
    	}
    },
    _drawControlMeasure: function(controlMeasure, editable, container){
        if(controlMeasure && controlMeasure.control){
            var htmls = "", $obj = null;
            var htmls = this.controlTemplate.replace(/#\{id}/g, controlMeasure.id)
                                            .replace(/#\{Number}/g, controlMeasure.control.number)
                                            .replace(/#\{title}/g, controlMeasure.control.title)
                                            .replace(/#\{status}/g, controlMeasure.status);
            $obj = $(htmls).appendTo(container);
            if(this._denyModify === true || editable !== true){
                $obj.find(".removeControlMeasure").remove();
                container.closest("tr").find(".btn-addcontrolmeasure").parent().remove();
                container.closest("table").find("th.control-measure-tool").remove();
            }
        }
    },
    /**
     * @title 删除对话框
     * @param content {string} 标题
     * @param params {object} ajax的参数信息
     * @param callback {function} 删除成功后的回调函数
     * @return void
     */
    _showRemoveDialog:function(content,params,callback){
    	this.removeDialog = $("<div>"+content+"</div>").dialog({
			title:this.i18n.removetitle,
			width:540,
			modal:true,
			resizable:false,
			draggable: false,
			buttons:[
	         {
	        	 text:this.i18n.removeok,
	        	 click:this.proxy(function(e){
	        		 $(e.currentTarget).add($(e.currentTarget).next()).button("disable");
	        		 $.u.ajax({
	        			 url: $.u.config.constant.smsmodifyserver,
	                     dataType: "json",
	                     cache: false,
	                     data: $.extend({
	        			 	"tokenid":$.cookie("tokenid")
		        		 },params)
	        		 },this.removeDialog.parent(),{ size: 1,backgroundColor:'transparent', selector:$(e.currentTarget).parent(), orient: "west" }).done(this.proxy(function(response){
	        			 if(response.success){
	        				 this.removeDialog.dialog("close");
	        				 callback();
	        			 }else{
	    	        		 $(e.currentTarget).add($(e.currentTarget).next()).button("enable");
	        			 }
	        		 })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
		        		 $(e.currentTarget).add($(e.currentTarget).next()).button("enable");
	        		 }));
	        	 })
	         },
	         {
	        	 text:this.i18n.removecancel,
	        	 "class":"aui-button-link",
	        	 click:this.proxy(function(){
	        		 this.removeDialog.dialog("close");
	        	 })
	         }
			],
			close:this.proxy(function(){
				this.removeDialog.dialog("destroy").remove();
			})
		});
    },
    /**
     * @title 保存威胁
     * @param comp com.sms.common.stdComponentOperate 组件
     * @param formdata 表单json数据
     * @return void
     */
    _saveThreat:function(comp,formdata){
    	this._saveData(comp,{"method":"addthreat","tem":formdata.tem,"threats":formdata.threats}, this.proxy(function(){
    		this._reload(formdata.tem);
    	}));
    },
    /**
     * @title 保存差错
     * @param comp com.sms.common.stdComponentOperate 组件
     * @param formdata 表单json数据
     * @return void
     */
    _saveError:function(comp,formdata){
    	this._saveData(comp,{"method":"adderror","tem":formdata.tem,"errors":formdata.errors}, this.proxy(function(){
    		this._reload(formdata.tem);
    	}));
    },
    /**
     * @title 保存数据
     * @param comp com.sms.common.stdComponentOperate 组件
     * @param formdata 表单json数据
     * @param callback {function}
     * @return void
     */
    _saveData:function(comp, params, callback){
    	$.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: $.extend({
            	"tokenid": $.cookie("tokenid")
            },params)
        },comp.formDialog.parent(),{size:2}).done(this.proxy(function (response) {
            if (response.success) {
            	comp.formDialog.dialog("close");
            	callback();
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
        	
        }));
    },
    _addControlMeasure: function(params){
        this._ajax({
            url: $.u.config.constant.smsmodifyserver,
            data: {
                "method": "stdcomponent.addall",
                "dataobject": "controlMeasure",
                "objs": JSON.stringify(params.objs)
            },
            block: this.selectControlDialog.controlDialog.parent(),
            callback: this.proxy(function(response){
                if(response.success){
                    this.selectControlDialog.controlDialog.dialog("close");
                    // this._ajax({
                    //     data: {
                    //         "method": "stdcomponent.getbyids",
                    //         "dataobject": "controlMeasure",
                    //         "dataobjectid": JSON.stringify(response.data)
                    //     },
                    //     block: params.container,
                    //     callback: this.proxy(function(response){
                    //         if(response.success){
                    //             $.each(response.data, this.proxy(function(idx, item){
                    //                 this._drawControlMeasure(item, params.container);
                    //             }));
                    //         }
                    //     })
                    // });
                    this._reload(params.temId);
                }
            })
        });
    },
    _ajax: function(param){
        $.u.ajax({ 
            url: param.url || $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: $.extend(true, {
                "tokenid": $.cookie("tokenid")
            }, (param.data || {}) )
        }, param.block).done(this.proxy(param.callback));
    },
    destroy: function () {
        this.addTemDialog && this.addTemDialog.dialog("destroy");
    	this._super(); 
    }
}, { usehtm: true, usei18n: true });


com.sms.detailmodule.temmodel.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                          "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                          "../../../uui/widget/ajax/layoutajax.js"];
com.sms.detailmodule.temmodel.widgetcss = [];