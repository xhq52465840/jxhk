//@ sourceURL=com.sms.review.reviewModel
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.review.reviewModel', null, {
    init: function (options) {
        this._options = options;
        this.td1 = "<td rowspan='#{khxmrow}'>#{khxm}<br/><span class='glyphicon glyphicon-align-justify edit' data='#{editData}'></span>"+
        		   "<span class='glyphicon glyphicon-trash delete' data='#{deleteData}'></span></td>";
        this.td2 = "<td rowspan='#{khnrrow}'>#{khnr}<br/>"+
        			"<span class='glyphicon glyphicon-align-justify com-edit' data='#{editData}'></span>"+
        			"<span class='glyphicon glyphicon-trash com-delete' data='#{deleteData}'></span></td>"+
					"<td rowspan='#{khlyrow}'>#{khly}</td>"+
					"<td rowspan='#{khmsrow}'><pre>#{khms}</pre></td>"+
					"<td rowspan='#{minrow}'>#{min}</td>"+
					"<td rowspan='#{maxrow}'>#{max}</td>";
        this.td3 = "<td>#{fw}</td>"+
					"<td>#{gs}</td>"+
					"<td>#{ms}</td>";
        this.Ly = {
    		"A": "安全信息",
    		"R": "资料上传",
    		"ACTION_ITEM": "行动项",
    		"O": "人工"
        };
        
    },
    afterrender: function (bodystr) {
    	this._addReviewDialog();
    	this._addExamineDialog();
    	this._createTable();
    	this.dataTable = this.qid("datatable");
    	//增加考核项目
    	this.qid("btn_addReview").off("click").on("click",this.proxy(this._addExamProject));
        //设置评审机构
        this.qid("btn_setReviewUnit").off("click").on("click", this.proxy(this._reviewUnit));
        //添加评审单接收角色
        this.qid("btn_reviewRoleConfig").off("click").on("click",this.proxy(this._reviewRoleConfig));
        //生成评审单
        this.qid("btn_generateMethanolInst").off("click").on("click",this.proxy(this._generateMethanolInst));
    	//编辑考核项目
    	this.dataTable.off("click","span.edit").on("click","span.edit",this.proxy(this._editExamProject));
    	//删除考核项目
    	this.dataTable.off("click", "span.delete").on("click", "span.delete", this.proxy(this._delExamProject));
    	//增加考核内容
    	this.dataTable.off("click","span.add").on("click","span.add",this.proxy(this._addExamContent));
    	//编辑考核内容
    	this.dataTable.off("click","span.com-edit").on("click","span.com-edit",this.proxy(this._editExamContent));
    	//删除考核内容
    	this.dataTable.off("click", "span.com-delete").on("click", "span.com-delete", this.proxy(this._delExamContent));
    	//增加考核标准
    	this.dataTable.off("click", "span.score-add").on("click", "span.score-add", this.proxy(this._addScoreStandard));
    	//编辑考核标准
    	this.dataTable.off("click", "span.score-edit").on("click", "span.score-edit", this.proxy(this._editScoreStandard));
    	//删除考核标准
    	this.dataTable.off("click", "span.score-delete").on("click", "span.score-delete", this.proxy(this._delScoreStandard));
    	//增加考核标准详细
    	this.dataTable.off("click", "span.detail-add").on("click", "span.detail-add", this.proxy(this._addDetailStandard));
    	//编辑考核标准详细
    	this.dataTable.off("click", "span.detail-edit").on("click", "span.detail-edit", this.proxy(this._editDetailStandard));
    	//删除考核标准详细
    	this.dataTable.off("click", "span.detail-delete").on("click", "span.detail-delete", this.proxy(this._delDetailStandard));
    	
    	this.dataTable.off("click", "td:has(span)").on("click","td:has(span)",this.proxy(this._show));
    },
    _show : function(e){
    	$(e.currentTarget).find("span").toggle();
    },
    /*
     * 设置评审机构
     */
    _reviewUnit: function(e){
        if(!this.reviewUnitDialog){
            var clz = $.u.load("com.sms.review.setReviewUnit");
            this.reviewUnitDialog = new clz($("div[umid=reviewUnitDialog]"));
        }
        this.reviewUnitDialog.open();
    },
    /*
     * 设置评审单接收角色
     */
    _reviewRoleConfig: function(){
        if(!this.reviewRoleConfigDialog){
            this.reviewRoleConfigDialog =  new com.sms.common.stdComponentOperate($("div[umid='reviewRoleConfigDialog']",this.$),{
                "title":"添加评审接收角色",
                "dataobject":"methanolRole",
                "fields":[
                    {
                        "name": "role",
                        "label": "角色",
                        "type": "select",
                        "dataType": "int",
                        "option": {
                            multiple: false,
                            allowClear:true,
                            placeholder: "请选择接收评审单的角色",
                            params: {"dataobject":"role"},
                            ajax: {
                                data: {"dataobject":"role"}
                            }
                        }
                    }
                ]
            });
        }
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method":"stdcomponent.getbysearch",
                "dataobject": "methanolRole"
            }
        }, this.qid("btn_reviewRoleConfig")).done(this.proxy(function(response){
            if(response.success){
                if(response.data && response.data.aaData && response.data.aaData.length > 0){
                    this.reviewRoleConfigDialog.open({
                        title: "添加评审接收角色",
                        data: $.extend(response.data.aaData[0], {role: response.data.aaData[0].roleId})
                    });
                }
                else{
                    this.reviewRoleConfigDialog.open();
                }
            }
        }));
    },
    /*
     * 生成评审单
     */
    _generateMethanolInst: function(e){
        $.u.ajax({
            url: $.u.config.constant.smsmodifyserver,
            type: "post",
            dataType: "json",
            data: {
                "tokenid": $.cookie("tokenid"),
                "method":"generateMethanolInst"
            }
        }, this.qid("btn_generateMethanolInst")).done(this.proxy(function(response){
            if(response.success){
                $.u.alert.success("生成评审单成功");
            }
        }));
    },
    /**
     * 添加评审规则
     */
    _addReviewDialog : function(){
    	this.addReviewDialog = new com.sms.common.stdComponentOperate($("div[umid='addReviewDialog']",this.$),{
    		"title":"添加评审规则",
    		"dataobject":"assessmentProject",
    		"fields":[
	          {"name":"name","label":"考核项目","type":"text","rule":{required:true},"message":"考核项目不能为空","maxlength":255}
	        ]
    	});
    	this.addReviewDialog.override({
    		refreshDataTable:this.proxy(function(){
    			this._createTable();
    		})
    	});
    },
    /**
     * 生成dialog
     */
    _addExamineDialog : function(){
    	this.addExamineDialog = this.qid("addExamineDialog").dialog({
    		title: "增加考核内容",
    		width: 510,
    		modal: true,
    		resizable: false,
    		draggable: false,
    		autoOpen: false,
    		position: ["center",40],
    		create: this.proxy(this.on_dialog1_create),
    		close: this.proxy(this.on_dialog1_close),
    		buttons:[
    		    {
    		    	text: "确认",
    		    	"class": "button-submit",
    		    	click: this.proxy(this.on_dialogsave1_click)
    		    },
    		    {
    		    	text: "取消",
    		    	"class": "aui-button-link",
    		    	click: this.proxy(function(){
    		    		this.addExamineDialog.dialog("close");
    		    	})
    		    }
    		]
    	});
    	this.addStep2Dialog = this.qid("addStep2Dialog").dialog({
    		title: "增加考核标准",
    		width: 510,
    		modal: true,
    		resizable: false,
    		draggable: false,
    		autoOpen: false,
    		position: ["center",40],
    		create: this.proxy(this.on_dialog2_create),
    		close: this.proxy(this.on_dialog2_close),
    		buttons:[
    		    {
    		    	text: "确认",
    		    	"class": "button-submit",
    		    	click: this.proxy(this.on_dialogsave2_click)
    		    },
    		    {
    		    	text: "取消",
    		    	"class": "aui-button-link",
    		    	click: this.proxy(function(){
    		    		this.addStep2Dialog.dialog("close");
    		    	})
    		    }
    		]
    	});
    	this.addStep3Dialog = this.qid("addStep3Dialog").dialog({
    		title: "增加考核标准详细",
    		width: 510,
    		modal: true,
    		resizable: false,
    		draggable: false,
    		autoOpen: false,
    		position: ["center",40],
    		create: this.proxy(this.on_dialog3_create),
    		close: this.proxy(this.on_dialog3_close),
    		buttons:[
    		    {
    		    	text: "确认",
    		    	"class": "button-submit",
    		    	click: this.proxy(this.on_dialogsave3_click)
    		    },
    		    {
    		    	text: "取消",
    		    	"class": "aui-button-link",
    		    	click: this.proxy(function(){
    		    		this.addStep3Dialog.dialog("close");
    		    	})
    		    }
    		]
    	});
    },
    /**
     * 生成dialog内容
     */
    on_dialog1_create : function(){
    	this.assessmentProject = this.qid("assessmentProject");
    	this.description = this.qid("description");
    	this.summary = this.qid("standardSummary");
    	this.filter = this.qid("filter").select2({
			width: 470,
			allowClear: true,
			ajax: {
				url: $.u.config.constant.smsqueryserver,
				type: "post",
				dataType: "json",
				data: this.proxy(function(term, page){
					term = term.replace(/'/g,'');
					return {
						"tokenid": $.cookie("tokenid"),
						"method": "getFilter",
						"type":"S",
						"dataobject":"filtermanager",
						"param":JSON.stringify({"content":term})
					};
				}),
				results: this.proxy(function(response, page){
					if(response.success){
						return { results: response.data.aaData };
					}
				})
			},
            formatResult:function(item){
            	return item.name;
            },
            formatSelection:function(item){
            	return item.name;
            }
		}).select2("enable", false);
    	this.type = this.qid("type").select2({
			width: 470,
			allowClear: true,
			data :[
                   { id: "A", text: "安全信息" },
                   { id: "R", text: "资料上传"},
                   { id: "ACTION_ITEM", text: "行动项"},
                   { id: "O", text: "人工" }
               ]
		}).on("select2-selecting", this.proxy(this._onSelect));
    },
    on_dialog1_close : function(){
    	this.assessmentProject.val("");
    	this.description.val("");
    	this.summary.val("");
    	this.type.select2("val", "");
    	this.filter.select2("val", "").select2("enable", true);
    },
    on_dialog2_create : function(){
    	this.assessmentComment = this.qid("assessmentComment");
    	this.min = this.qid("min");
    	this.max = this.qid("max");
    },
    on_dialog2_close : function(){
    	this.assessmentComment.val("");
    	this.min.val("");
    	this.max.val("");
    },
    on_dialog3_create : function(){
    	this.scoreStandard = this.qid("scoreStandard");
    	this.leftInterval = this.qid("leftInterval");
    	this.rightInterval = this.qid("rightInterval");
    	this.expression = this.qid("expression");
    	this.remark = this.qid("remark");
    },
    on_dialog3_close : function(){
    	this.scoreStandard.val("");
    	this.leftInterval.val("");
    	this.rightInterval.val("");
    	this.expression.val("");
    	this.remark.val("");
    },
    /**
     * 下拉选择事件
     */
    _onSelect : function(e){
    	switch(e.val){
			case 'A':
				this.filter.select2("enable", true);
				break;
			case 'R':
			case 'O':
			case 'ACTION_ITEM':
				this.filter.select2("enable", false);
				this.filter.select2("val", "");
				break;
		}
    },
    /**
     * 确认
     */
    on_dialogsave1_click : function(){
    	var obj = this.getDialog1("ADD");
    	if(this._isValid_1()){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			"POST",
    			{
    				"tokenid":$.cookie("tokenid"),
            		 "method":"stdcomponent.add",
            		 "dataobject":"assessmentComment",
            		 "obj":JSON.stringify(obj)
    			},
    			this.addExamineDialog,
    			function(data,_this){
    				$.u.alert.success("操作成功。");
					_this._createTable();
					_this.addExamineDialog.dialog("close");
    			}
    		)
    	}
    },
    on_dialog1_click : function(){
    	var obj = this.getDialog1("EDIT");
    	if(this._isValid_1()){
    		this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
					"tokenid":$.cookie("tokenid"),
	        		 "method":"stdcomponent.update",
	        		 "dataobject":"assessmentComment",
	        		 "obj":JSON.stringify(obj),
	        		 "dataobjectid": this.assessmentProject.val()
				},
				this.addExamineDialog,
				function(data,_this){
					$.u.alert.success("操作成功。");
					_this._createTable();
					_this.addExamineDialog.dialog("close");
				}
			);
    	}
    },
    getDialog1 : function(ae){
    	$('.text-danger').remove();
    	var description = this.description.val();
    	var type = this.type.select2("val");
    	var filter = this.filter.select2("val");
    	var id = this.assessmentProject.val();
    	var summary = this.summary.val();
    	var obj = null;
    	if(ae=="ADD"){
    		obj = {
	    		"description":description,
		         "type":type,
		         "filter":parseInt(filter,10),
		         "standardSummary": summary,
		         "assessmentProject":parseInt(id,10)
	    	}
    	}else if(ae="EDIT"){
    		obj = {
	    		"description":description,
		        "type":type,
		        "standardSummary": summary,
		        "filter":parseInt(filter,10)
	    	}
    	}
    	return obj;
    },
    /**
     * 校验必填
     */
    _isValid_1 : function(){
    	var retu = true;
    	var description = this.description.val();
    	var type = this.type.select2("val");
    	var filter = this.filter.select2("val");
    	if(description == ""){
    		this.description.after($('<div class="text-danger">考核内容不能为空</div>'));
    		retu = false;
    	}else{
    		if(type == ""){
    			this.type.after($('<div class="text-danger">考核来源不能为空</div>'));
    			retu = false;
    		}else{
    			if(type == "A"){
    				if(filter==""){
    					this.filter.after($('<div class="text-danger">过滤器不能为空</div>'));
    	    			retu = false;
    				}
    			}
    		}
    	}
    	return retu;
    },
    on_dialogsave2_click : function(){
    	var obj = this.getDialog2("ADD");
    	if(this._isValid_2()){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			"POST",
    			{
    				"tokenid":$.cookie("tokenid"),
            		 "method":"stdcomponent.add",
            		 "dataobject":"scoreStandard",
            		 "obj":JSON.stringify(obj)
    			},
    			this.addStep2Dialog,
    			function(data,_this){
    				$.u.alert.success("操作成功。");
					_this._createTable();
					_this.addStep2Dialog.dialog("close");
    			}
    		)
    	}
    },
    on_dialog2_click : function(){
    	var obj = this.getDialog2("EDIT");
    	if(this._isValid_2()){
    		this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
					"tokenid":$.cookie("tokenid"),
	        		 "method":"stdcomponent.update",
	        		 "dataobject":"scoreStandard",
	        		 "obj":JSON.stringify(obj),
	        		 "dataobjectid": this.assessmentComment.val()
				},
				this.addStep2Dialog,
				function(data,_this){
					$.u.alert.success("操作成功。");
					_this._createTable();
					_this.addStep2Dialog.dialog("close");
				}
			);
    	}
    },
    getDialog2 : function(ae){
    	$('.text-danger').remove();
    	var assessmentComment = this.assessmentComment.val();
    	var min = this.min.val();
    	var max = this.max.val();
    	var obj = null;
    	if(ae=="ADD"){
    		obj = {
	    		"assessmentComment":parseInt(assessmentComment),
		         "min":parseFloat(min),
		         "max":isNaN(parseFloat(max))?null:parseFloat(max)
	    	}
    	}else if(ae="EDIT"){
    		obj = {
    			"min":parseFloat(min),
   		         "max":isNaN(parseFloat(max))?null:parseFloat(max)
	    	}
    	}
    	return obj;
    },
    _isValid_2 : function(){
    	var retu = true;
    	var min = this.min.val();
    	var max = this.max.val();
    	if(min == ""){
    		/*this.min.after($('<div class="text-danger">最小值不能为空</div>'));
    		retu = false;*/
    	}else{
    		if(this.isNum(min)){
    			if(max == ""){
    				
    			}else{
    				if(this.isNum(max)){
    					if(parseInt(max) < parseInt(min)){
    						this.max.after($('<div class="text-danger">最大值必须比最小值大</div>'));
        	        		retu = false;
    					}
    				}else{
    					this.max.after($('<div class="text-danger">最大值必须为数字</div>'));
    	        		retu = false;
    				}
    			}
    		}else{
    			this.min.after($('<div class="text-danger">最小值必须为数字</div>'));
        		retu = false;
    		}
    	}
    	return retu;
    },
    isNum : function(str){
    	var reg = "^([+-]?)\\d*\\.?\\d+$";
    	return new RegExp(reg).test(str);
    },
    on_dialogsave3_click : function(){
    	var obj = this.getDialog3("ADD");
    	if(this._isValid_3()){
    		this._ajax(
    			$.u.config.constant.smsmodifyserver,
    			"POST",
    			{
    				"tokenid":$.cookie("tokenid"),
            		 "method":"stdcomponent.add",
            		 "dataobject":"scoreStandardDetail",
            		 "obj":JSON.stringify(obj)
    			},
    			this.addStep3Dialog,
    			function(data,_this){
    				$.u.alert.success("操作成功。");
					_this._createTable();
					_this.addStep3Dialog.dialog("close");
    			}
    		)
    	}
    },
    on_dialog3_click : function(){
    	var obj = this.getDialog3("EDIT");
    	if(this._isValid_3()){
    		this._ajax(
				$.u.config.constant.smsmodifyserver,
				"POST",
				{
					"tokenid":$.cookie("tokenid"),
	        		 "method":"stdcomponent.update",
	        		 "dataobject":"scoreStandardDetail",
	        		 "obj":JSON.stringify(obj),
	        		 "dataobjectid": this.scoreStandard.val()
				},
				this.addStep3Dialog,
				function(data,_this){
					$.u.alert.success("操作成功。");
					_this._createTable();
					_this.addStep3Dialog.dialog("close");
				}
			);
    	}
    },
    getDialog3 : function(ae){
    	$('.text-danger').remove();
    	var scoreStandard = this.scoreStandard.val();
    	var leftInterval = this.leftInterval.val();
    	var rightInterval = this.rightInterval.val();
    	var expression = this.expression.val();
    	var remark = this.remark.val();
    	var obj = null;
    	if(ae=="ADD"){
    		obj = {
	    		"scoreStandard":parseInt(scoreStandard),
		         "leftInterval":parseFloat(leftInterval),
		         "rightInterval":isNaN(parseFloat(rightInterval))?null:parseFloat(rightInterval),
		         "expression":expression,
		         "description":remark
	    	}
    	}else if(ae="EDIT"){
    		obj = {
   		         "leftInterval":parseFloat(leftInterval),
   		         "rightInterval":isNaN(parseFloat(rightInterval))?null:parseFloat(rightInterval),
   		         "expression":expression,
   		         "description":remark
	    	}
    	}
    	return obj;
    },
    _isValid_3 : function(){
    	var retu = true;
    	var leftInterval = this.leftInterval.val();
    	var rightInterval = this.rightInterval.val();
    	var expression = this.expression.val();
    	if(leftInterval == ""){
    		this.leftInterval.after($('<div class="text-danger">左区间不能为空</div>'));
    		retu = false;
    	}else{
    		if(this.isNum1(leftInterval)){
    			if(rightInterval == ""){
    				
    			}else{
    				if(this.isNum1(rightInterval)){
    					if(parseInt(rightInterval) < parseInt(leftInterval)){
    						this.rightInterval.after($('<div class="text-danger">右区间必须比左区间大</div>'));
        	        		retu = false;
    					}
    				}else{
    					this.rightInterval.after($('<div class="text-danger">右区间值必须为整数</div>'));
    	        		retu = false;
    				}
    			}
    			if(expression == ""){
    				this.expression.after($('<div class="text-danger">数学表达式不能为空</div>'));
    	    		retu = false;
    			}else{
    				
    			}
    		}else{
    			this.leftInterval.after($('<div class="text-danger">左区间必须为整数</div>'));
        		retu = false;
    		}
    	}
    	return retu;
    },
    isNum1 : function(str){
    	var reg = "^[0-9]*$";
    	return new RegExp(reg).test(str);
    },
    /**
     * ajax
     */
    _ajax : function(url, type, data, $container,callback){
    	$.u.ajax({
    		url: url,
            type: type,
            dataType: "json",
            data: data
    	},$container).done(this.proxy(function(response){
    		if(response.success){
    			callback(response,this);
    		}
    	})).fail(this.proxy(function(jqXHR,errorText,errorTHrown){
    		
    	}))
    },
    /**
     * 生成表格
     */
    _createTable : function(){
    	this._ajax(
			$.u.config.constant.smsqueryserver,
			"POST",
			{
    			"tokenid":$.cookie("tokenid"),
         		"method":"stdcomponent.getbysearch",
         		"dataobject":"assessmentProject",
         		"columns":JSON.stringify([{"data":"created"}]),
        		"order":JSON.stringify([{"column":0,"dir":"desc"}])
			},
			this.qid("datatable"),
			function(data,_this){
				_this._modifyTable(data.data.aaData);
			}
		)
    },
    /**
     * 
     */
    _modifyTable : function(data){
    	var $tbody = this.dataTable.find("tbody");
    	$tbody.empty();
    	var td = "";
    	data && $.each(data, this.proxy(function(index, item){
    		var length1 = item.assessmentComments.length;
    		var length2 = 0;
    		if(item.assessmentComments.length > 0){
    			item.assessmentComments && $.each(item.assessmentComments,this.proxy(function(x,y){
            		if(y.scoreStandard){
            			if(y.scoreStandard.details.length > 0){
            				length2 += y.scoreStandard.details.length;
            			}
            		}
            	}))
    		}
    		if(item.assessmentComments.length > 0){
    			$.each(item.assessmentComments, this.proxy(function(key,value){
        			value.filter.id && (value.filter = {id:value.filter.id,name:value.filter.name});
        			if(value.scoreStandard){
        				if(value.scoreStandard.details.length > 0){
        					var len = value.scoreStandard.details.length+1;
        					var min = null;
        					var max= null;
        					if(value.scoreStandard.min === null){
        						min = "-∞";
        					}else{
        						min = value.scoreStandard.min;
        					}
        					if(value.scoreStandard.max === null){
        						max = "∞";
        					}else{
        						max = value.scoreStandard.max;
        					}
        					var td1 = this.td1.replace("#\{khxmrow\}",length1 + length2 + 1)
        									  .replace("#\{editData\}",JSON.stringify({id:item.id,name:item.name}))
											  .replace("#\{deleteData\}",JSON.stringify({id:item.id,name:item.name}))
							  				  .replace("#\{khxm\}",item.name);
        					var td2 = this.td2.replace("#\{khnrrow\}",len)
									 		 .replace("#\{khlyrow\}",len)
									 		 .replace("#\{khmsrow\}",len)
							    			 .replace("#\{minrow\}",len)
							    			 .replace("#\{maxrow\}",len)
							    			 .replace("#\{khnr\}",value.description)
							    			 .replace("#\{khms\}",value.standardSummary || '')
							    			 .replace("#\{khly\}",this.Ly[value.type])
							    			 .replace("#\{editData\}",JSON.stringify({id:value.id,description:value.description,type:value.type,standardSummary:value.standardSummary,filter:value.filter}))
											 .replace("#\{deleteData\}",JSON.stringify({id:value.id,name:value.description}))
							    			 .replace("#\{min\}",min+"<br/>"+
							    			     "<span class='glyphicon glyphicon-align-justify score-edit' data='"+JSON.stringify({id:value.scoreStandard.id,min:value.scoreStandard.min,max:value.scoreStandard.max})+"'></span>"+
							    			     "<span class='glyphicon glyphicon-trash score-delete' data='"+JSON.stringify({id:value.scoreStandard.id})+"'></span>"
							    			 )
							    			 .replace("#\{max\}",max);
        					$.each(value.scoreStandard.details,this.proxy(function(k,v){
        						var rightInterval = null;
        						if(v.rightInterval === null){
        							rightInterval = "∞";
            					}else{
            						rightInterval = v.rightInterval;
            					}
                				var td3 = this.td3.replace("#\{fw\}",v.leftInterval+"-"+rightInterval+"<br/>"+
                									"<span class='glyphicon glyphicon-align-justify detail-edit' data='"+JSON.stringify({id:v.id,leftInterval:v.leftInterval,rightInterval:v.rightInterval,expression:v.expression,description:v.description})+"'></span>"+
                									"<span class='glyphicon glyphicon-trash detail-delete' data='"+JSON.stringify({id:v.id})+"'></span>")
    		        				              .replace("#\{gs\}",v.expression)
    		        			                  .replace("#\{ms\}",v.description||"");
                				if(key == 0){
                					if(k == 0){
                						td = "<tr>" + td1 + td2 + td3 + "</tr>";
                					}else if(k < len-1){
                						td = "<tr>" + td3 + "</tr>";
                					}
                					$(td).appendTo($tbody);
                					if(k == len-2){
                						td = "<tr><td><span class='glyphicon glyphicon-plus detail-add' data='"+value.scoreStandard.id+"'></span></td><td></td><td></td></tr>";
                						$(td).appendTo($tbody);
                					}
                				}else if(key < length1){
                					if(k == 0){
                						td = "<tr>" + td2 + td3 + "</tr>";
                					}else if(k < len-1){
                						td = "<tr>" + td3 + "</tr>";
                					}
                					$(td).appendTo($tbody);
                					if(k == len-2){
                						td = "<tr><td><span class='glyphicon glyphicon-plus detail-add' data='"+value.scoreStandard.id+"'></span></td><td></td><td></td></tr>";
                						$(td).appendTo($tbody);
                					}
                				}
                			}))
                			if(key == length1-1){
            					td = "<tr><td><span class='glyphicon glyphicon-plus add' data='"+item.id+"'></span></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        						$(td).appendTo($tbody);
            				}
        				}else{
        					var len = 1;
        					var min = null;
        					var max= null;
        					if(value.scoreStandard.min === null){
        						min = "-∞";
        					}else{
        						min = value.scoreStandard.min;
        					}
        					if(value.scoreStandard.max === null){
        						max = "∞";
        					}else{
        						max = value.scoreStandard.max;
        					}
            				var td1 = this.td1.replace("#\{khxmrow\}",length1 + length2 + 1)
    										  .replace("#\{editData\}",JSON.stringify({id:item.id,name:item.name}))
    										  .replace("#\{deleteData\}",JSON.stringify({id:item.id,name:item.name}))
    						  				  .replace("#\{khxm\}",item.name);
            				var td2 = this.td2.replace("#\{khnrrow\}",len)
    							 		 .replace("#\{khlyrow\}",len)
    					    			 .replace("#\{minrow\}",len)
    					    			 .replace("#\{khmsrow\}",len)
    					    			 .replace("#\{maxrow\}",len)
    					    			 .replace("#\{khnr\}",value.description)
    					    			 .replace("#\{khly\}",this.Ly[value.type])
    					    			 .replace("#\{khms\}",value.standardSummary || '')
    					    			 .replace("#\{editData\}",JSON.stringify({id:value.id,description:value.description,type:value.type,standardSummary:value.standardSummary,filter:value.filter}))
            							 .replace("#\{deleteData\}",JSON.stringify({id:value.id,name:value.description}))
    					    			 .replace("#\{min\}",min+"<br/>"+
    					    			     "<span class='glyphicon glyphicon-align-justify score-edit' data='"+JSON.stringify({id:value.scoreStandard.id,min:value.scoreStandard.min,max:value.scoreStandard.max})+"'></span>"+
    					    			     "<span class='glyphicon glyphicon-trash score-delete' data='"+JSON.stringify({id:value.scoreStandard.id})+"'></span>"
    					    			 )
    					    			 .replace("#\{max\}",max);
            				var td3 = this.td3.replace("#\{fw\}","<span class='glyphicon glyphicon-plus detail-add' data='"+value.scoreStandard.id+"'></span>")
    							              .replace("#\{gs\}","")
    						                  .replace("#\{ms\}","");
            				if(key == 0){
            					td = "<tr>" + td1 + td2 + td3 + "</tr>";
            				}else if(key < length1){
            					td = "<tr>" + td2 + td3 + "</tr>";
            				}
            				$(td).appendTo($tbody);
            				if(key == length1 -1){
        						td = "<tr><td><span class='glyphicon glyphicon-plus add' data='"+item.id+"'></span></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        						$(td).appendTo($tbody);
            				}
        				}
        			}else{
        				var len = 1;
        				var td1 = this.td1.replace("#\{khxmrow\}",length1 + length2 + 1)
										  .replace("#\{editData\}",JSON.stringify({id:item.id,name:item.name}))
										  .replace("#\{deleteData\}",JSON.stringify({id:item.id,name:item.name}))
						  				  .replace("#\{khxm\}",item.name);
        				var td2 = this.td2.replace("#\{khnrrow\}",len)
							 		 .replace("#\{khlyrow\}",len)
					    			 .replace("#\{minrow\}",len)
					    			 .replace("#\{khmsrow\}",len)
					    			 .replace("#\{maxrow\}",len)
					    			 .replace("#\{khnr\}",value.description)
					    			 .replace("#\{khly\}",this.Ly[value.type])
					    			 .replace("#\{khms\}",value.standardSummary || '')
					    			 .replace("#\{editData\}",JSON.stringify({id:value.id,description:value.description,standardSummary:value.standardSummary,type:value.type,filter:value.filter}))
        							 .replace("#\{deleteData\}",JSON.stringify({id:value.id,name:value.description}))
					    			 .replace("#\{min\}","<span class='glyphicon glyphicon-plus score-add' data='"+value.id+"'></span>")
					    			 .replace("#\{max\}","");
        				var td3 = this.td3.replace("#\{fw\}","")
							              .replace("#\{gs\}","")
						                  .replace("#\{ms\}","");
        				if(key == 0){
        					td = "<tr>" + td1 + td2 + td3 + "</tr>";
        				}else if(key < length1){
        					td = "<tr>" + td2 + td3 + "</tr>";
        				}
        				$(td).appendTo($tbody);
        				if(key == length1 -1){
    						td = "<tr><td><span class='glyphicon glyphicon-plus add' data='"+item.id+"'></span></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
    						$(td).appendTo($tbody);
        				}
        			}
        		}))
    		}else{
    			//如果没有考核内容
	    		var td1 = this.td1.replace("#\{khxmrow\}",1)
	    						  .replace("#\{editData\}",JSON.stringify({id:item.id,name:item.name}))
	    						  .replace("#\{deleteData\}",JSON.stringify({id:item.id,name:item.name}))
				  				  .replace("#\{khxm\}",item.name);
	    		td = "<tr>" + td1 + "<td><span class='glyphicon glyphicon-plus add' data='"+item.id+"'></span></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
	    		$(td).appendTo($tbody);
    		}
    	}))
    	if(data.length == 0){
    		$('<tr><td colspan="8">没有数据</td></tr>').appendTo($tbody);
    	}
    },
    /**
     * 增加考核项目
     */
    _addExamProject : function(e){
    	this.addReviewDialog.open();
    },
    /**
     * 编辑考核项目
     */
    _editExamProject : function(e){
		e.preventDefault();
		try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
	        this.addReviewDialog.open({"data":data,"title":"编辑考核项目："+data.name});
	        this.addReviewDialog.override({
	        	refreshDataTable:this.proxy(function(){
    				this._createTable();
    			})
	        })
    	}catch(e){
    		throw new Error("编辑操作失败！"+e.message);
    	}
	},
	/**
	 * 删除考核项目
	 */
	_delExamProject : function (e) {
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"确认删除考核项目：<strong>"+data.name+"</strong>"+"？"+
    				 "</div>",
    			title:"删除考核项目："+data.name,
    			dataobject:"assessmentProject",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this._createTable();
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败！"+e.message);
    	}
    },
    /**
     * 增加考核内容
     */
    _addExamContent : function(e){
		e.preventDefault();
		var data = JSON.parse($(e.currentTarget).attr("data"));
		this._setData("ADD",data);
	},
	/**
	 * 编辑考核内容
	 */
	_editExamContent : function(e){
		e.preventDefault();
		var data = $(e.currentTarget).attr("data");
		this._setData("EDIT",data);
	},
	/**
	 * 删除考核内容
	 */
	_delExamContent : function(e){
    	e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"确认删除考核内容：<strong>"+data.name+"</strong>"+"？"+
    				 "</div>",
    			title:"删除考核内容："+data.name,
    			dataobject:"assessmentComment",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this._createTable();
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败！"+e.message);
    	}
    },
    /**
     * 增加考核标准
     */
    _addScoreStandard : function(e){
    	e.preventDefault();
		var data = JSON.parse($(e.currentTarget).attr("data"));
		this._setData2("ADD",data);
    },
    /**
     * 编辑考核标准
     */
    _editScoreStandard : function(e){
		e.preventDefault();
		var data = $(e.currentTarget).attr("data");
		this._setData2("EDIT",data);
	},
	/**
	 * 删除考核标准
	 */
	_delScoreStandard : function(e){
		e.preventDefault();
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"确认删除考核标准："+"？"+
    				 "</div>",
    			title:"删除考核标准：",
    			dataobject:"scoreStandard",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this._createTable();
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败！"+e.message);
    	}
	},
    /**
     * 增加考核标准详细
     */
    _addDetailStandard : function(e){
    	e.preventDefault();
		var data = JSON.parse($(e.currentTarget).attr("data"));
		this._setData3("ADD",data);
    },
    /**
     * 编辑考核标准详细
     */
    _editDetailStandard : function(e){
		e.preventDefault();
		var data = $(e.currentTarget).attr("data");
		this._setData3("EDIT",data);
	},
	/**
	 * 删除考核标准详细
	 */
	_delDetailStandard : function(e){
		e.preventDefault();
		try{
    		var data = JSON.parse($(e.currentTarget).attr("data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"确认删除考核标准详细："+
    				 "</div>",
    			title:"删除考核标准详细：",
    			dataobject:"scoreStandardDetail",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this._createTable();
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败！"+e.message);
    	}
	},
    _setData : function(type, data){
    	switch(type){
    		case "ADD":
    			this.assessmentProject.val(data);
    			this.addExamineDialog.dialog("option",{
    				"title":"增加考核内容",
    				"buttons":[
		    		    {
		    		    	text: "确认",
		    		    	"class": "button-submit",
		    		    	click: this.proxy(this.on_dialogsave1_click)
		    		    },
		    		    {
		    		    	text: "取消",
		    		    	"class": "aui-button-link",
		    		    	click: this.proxy(function(){
		    		    		this.addExamineDialog.dialog("close");
		    		    	})
		    		    }
		    		]
    			}).dialog("open");
    			break;
    		case "EDIT":
    			data = $.parseJSON(data);
    			this.assessmentProject.val(data.id);
    			this.description.val(data.description);
    			this.summary.val(data.standardSummary);
    			this.type.select2("val", data.type);
    			if(data.type == "A"){
    				this.filter.select2("data",data.filter).select2("enable", true);
    			}else{
    				this.filter.select2("val", "").select2("enable", false);
    			}
    			this.addExamineDialog.dialog("option",{
    				"title":"编辑考核内容",
    				"buttons":[
		    		    {
		    		    	text: "确认",
		    		    	"class": "button-submit",
		    		    	click: this.proxy(this.on_dialog1_click)
		    		    },
		    		    {
		    		    	text: "取消",
		    		    	"class": "aui-button-link",
		    		    	click: this.proxy(function(){
		    		    		this.addExamineDialog.dialog("close");
		    		    	})
		    		    }
		    		]
    			}).dialog("open");
    			break;
    	}
    },
    _setData2 : function(type,data){
    	switch(type){
			case "ADD":
				this.assessmentComment.val(data);
				this.addStep2Dialog.dialog("option",{
    				"title":"增加考核标准",
    				"buttons":[
		    		    {
		    		    	text: "确认",
		    		    	"class": "button-submit",
		    		    	click: this.proxy(this.on_dialogsave2_click)
		    		    },
		    		    {
		    		    	text: "取消",
		    		    	"class": "aui-button-link",
		    		    	click: this.proxy(function(){
		    		    		this.addStep2Dialog.dialog("close");
		    		    	})
		    		    }
		    		]
    			}).dialog("open");
				break;
			case "EDIT":
				data = $.parseJSON(data);
				this.assessmentComment.val(data.id);
				this.min.val(data.min);
				this.max.val(data.max);
				this.addStep2Dialog.dialog("option",{
					"title":"编辑考核标准",
					"buttons":[
		    		    {
		    		    	text: "确认",
		    		    	"class": "button-submit",
		    		    	click: this.proxy(this.on_dialog2_click)
		    		    },
		    		    {
		    		    	text: "取消",
		    		    	"class": "aui-button-link",
		    		    	click: this.proxy(function(){
		    		    		this.addStep2Dialog.dialog("close");
		    		    	})
		    		    }
		    		]
				}).dialog("open");
				break;
		}
    },
    _setData3 : function(type,data){
    	switch(type){
			case "ADD":
				this.scoreStandard.val(data);
				this.addStep3Dialog.dialog("option",{
    				"title":"增加标准详细",
    				"buttons":[
		    		    {
		    		    	text: "确认",
		    		    	"class": "button-submit",
		    		    	click: this.proxy(this.on_dialogsave3_click)
		    		    },
		    		    {
		    		    	text: "取消",
		    		    	"class": "aui-button-link",
		    		    	click: this.proxy(function(){
		    		    		this.addStep3Dialog.dialog("close");
		    		    	})
		    		    }
		    		]
    			}).dialog("open");
				break;
			case "EDIT":
				data = $.parseJSON(data);
				this.scoreStandard.val(data.id);
				this.leftInterval.val(data.leftInterval);
				this.rightInterval.val(data.rightInterval);
				this.expression.val(data.expression);
				this.remark.val(data.description);
				this.addStep3Dialog.dialog("option",{
					"title":"编辑标准详细",
					"buttons":[
		    		    {
		    		    	text: "确认",
		    		    	"class": "button-submit",
		    		    	click: this.proxy(this.on_dialog3_click)
		    		    },
		    		    {
		    		    	text: "取消",
		    		    	"class": "aui-button-link",
		    		    	click: this.proxy(function(){
		    		    		this.addStep3Dialog.dialog("close");
		    		    	})
		    		    }
		    		]
				}).dialog("open");
				break;
		}
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: false });

com.sms.review.reviewModel.widgetjs = ["../../../uui/widget/select2/js/select2.min.js",
                                       "../../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                                       "../../../uui/widget/spin/spin.js", 
                                       "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                       "../../../uui/widget/ajax/layoutajax.js"];
com.sms.review.reviewModel.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                        {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                        { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                        { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];