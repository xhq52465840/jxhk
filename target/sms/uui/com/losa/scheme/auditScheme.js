$.u.load("com.losa.scheme.schemeEdit");
//$.u.load("com.losa.scheme.schemeLog");
$.u.define('com.losa.scheme.auditScheme', null, {
	init:function(options){
		this.schemeEditUm = null;
		this.schemeLogListUm = null
	},
	afterrender:function(){
		var _that = this;
		this.schemeQueryFormVue = new Vue({
			el : '#schemeQueryForm',
			data : {
				schemeTypeNames:'',
				schemeStatusNames:'',
				schemeQueryForm:{schemeType:'', schemeStartDateFrom:'',schemeStartDateTo:'',schemeStatus:'',
					schemeNo:'',schemeSubject:'',impleUnitName:'',schemeEndDateFrom:'',schemeEndDateTo:''}},
			methods : {
				search : this.proxy(this._querySchemesInit),
				reset : this.proxy(this._querySchemeReset),
				collapseToggle:this.proxy(this._collapseToggle),
			},
			watch:{
				   'schemeQueryForm.schemeStartDateFrom':function(val, oldVal){
					   var schemeStartDateTo = this.schemeQueryForm.schemeStartDateTo;
					   if(!_that._isEmpty(val) && !_that._isEmpty(schemeStartDateTo) && !_that._compareDate(val,schemeStartDateTo)){
						   $.u.alert.error("查询开始日期不能大于结束日期！");
						   this.schemeQueryForm.schemeStartDateFrom = oldVal;
					   }
				   },
				   'schemeQueryForm.schemeStartDateTo':function(val, oldVal){
					   var schemeStartDateFrom = this.schemeQueryForm.schemeStartDateFrom;
					   if(!_that._isEmpty(val) && !_that._isEmpty(schemeStartDateFrom) && !_that._compareDate(schemeStartDateFrom,val)){
						   $.u.alert.error("查询结束日期不能小于开始日期！");
						   this.schemeQueryForm.schemeStartDateTo = oldVal;
					   }
				   },
				   'schemeQueryForm.schemeEndDateFrom':function(val, oldVal){
					   var schemeEndDateTo = this.schemeQueryForm.schemeEndDateTo;
					   if(!_that._isEmpty(val) && !_that._isEmpty(schemeEndDateTo) && !_that._compareDate(val,schemeEndDateTo)){
						   $.u.alert.error("查询开始日期不能大于结束日期！");
						   this.schemeQueryForm.schemeEndDateFrom = oldVal;
					   }
				   },
				   'schemeQueryForm.schemeEndDateTo':function(val, oldVal){
					   var schemeEndDateFrom = this.schemeQueryForm.schemeEndDateFrom;
					   if(!_that._isEmpty(val) && !_that._isEmpty(schemeEndDateFrom) && !_that._compareDate(schemeEndDateFrom,val)){
						   $.u.alert.error("查询结束日期不能小于开始日期！");
						   this.schemeQueryForm.schemeEndDateTo = oldVal;
					   }
				   },
			   }
		});	
		this.schemeListVue = new Vue({
			el : '#schemeList',
			data : {auditSchemes:'',
					pagebarsData:{
						all : 0, // 总条数
						cur : 1,// 当前页码
						start : 0,//当前条数
						length : 10,// 单页条数
					},
					userAuth:'',
					orders:{
						sortby : '', // 排序字段
						sortorders : 'asc',// 排序方式
					}, 
				},
				
			methods : {
				addScheme:this.proxy(this._addScheme),
				delSchemes:this.proxy(this._delSchemes),
				disSchemes:this.proxy(this._disSchemes),
				modifyScheme:this.proxy(this._modifyScheme),
				retriveScheme:this.proxy(this._retriveScheme),
				querySchemes : this.proxy(this._querySchemes),
				checkAllSchemes:this.proxy(this._checkAllSchemes),
				isCheckAllChecked:this.proxy(this._isCheckAllChecked),
				page : this.proxy(this._querySchemes),
				
			},
		});	
		$(".date").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		if(this.schemeLogListUm != null) delete this.schemeLogListUm;
//		this.schemeLogListUm = new com.losa.scheme.schemeLog($("div[umid='schemeLogList']",this.$),{});
		//查询用户职责
		this._queryUserAuth();
		//查询方案类型
		this._querySchemeTypeNames();
		//查询方案状态
		this._querySchemeStatusNames();
		//查询方案
		this._querySchemesInit();
	},
	//查询用户职责
	_queryUserAuth:function(){
		var data = {
				"method" : "losaGetUserAuth",
			};
			myAjaxQuery(data, null, this.proxy(function(response) {
				if (response.success) {
					this.schemeListVue.$set('userAuth', response.data);
				}
			})); 
	},
	//查询方案类型
	_querySchemeTypeNames:function(e){
		var data = {
			"method" : "queryDictNames",
			"dictType" : "scheme_type",
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.schemeQueryFormVue.$set('schemeTypeNames', response.data);
			}
		})); 
	},
	//查询方案状态
	_querySchemeStatusNames:function(e){
		var data = {
			"method" : "queryDictNames",
			"dictType" : "plan_status",
			"filterDictCode":"done"
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.schemeQueryFormVue.$set('schemeStatusNames', response.data)
			}
		})); 
	},
	//重置查询条件
	_querySchemeReset:function(){
		this.schemeQueryFormVue.$set("schemeQueryForm"
				,{schemeType:'', schemeStartDateFrom:'',schemeStartDateTo:'',schemeStatus:'',
					schemeNo:'',schemeSubject:'',impleUnitName:'',schemeEndDateFrom:'',schemeEndDateTo:''});
	},
	//初始查询，点击查询按钮查询
	_querySchemesInit:function() {
		this.schemeListVue.$set("pagebarsData.cur",1);
		this.schemeListVue.$set("pagebarsData.start",0);
		this._querySchemes();
	},
	//查询审计方案
	_querySchemes:function(){
		var data = {
			"method" : "querySchemes",
			"schemeQueryForm":JSON.stringify(this.schemeQueryFormVue.schemeQueryForm),
			"start" : this.schemeListVue.pagebarsData.start,
			"length" : this.schemeListVue.pagebarsData.length,
			"sortby" : this.schemeListVue.orders.sortby,
			"sortorders" : this.schemeListVue.orders.sortorders,
		};
		myAjaxQuery(data,null,this.proxy(function(response){
			if (response.success) {
				this.schemeListVue.$set("auditSchemes", response.data);
				this.schemeListVue.$set("pagebarsData.all",response.all);
				$("#allScheme").removeProp("checked"); 
			}
		})); 
	},
	//新增方案
	_addScheme:function(){
		if(this.schemeEditUm != null) delete this.schemeEditUm;
    	this.schemeEditUm = new com.losa.scheme.schemeEdit($("div[umid='schemeEdit']",this.$),{schemeId:''});
    	var layerindex = layer.open({
	        type: 1,
	        title: '新增航线审计方案',
	        maxmin: false,
	        fix: false,
	        closeBtn: 1,
	        zIndex : 20,//解决和其它组件的层叠冲突,如果不设select2无法正确显示
	        shadeClose: false, //点击遮罩关闭层
	        area : ['800px','600px'],
	        content: $("div[umid='schemeEdit']",this.$),
	    });
    	this.schemeEditUm.myLayerIndex = layerindex;
	},
	//删除方案
	_delSchemes:function(){
		var isreturn = false;
		var schemeIds = [];
    	var checkboxes = $("#schemeListBody input[type=checkbox]:checked");
    	if(!checkboxes.length){
    		$.u.alert.error("请选择需要删除的记录！");
			return false;
    	}
    	var info = "";
    	checkboxes.each(function(){
    		var schemeId = $(this).attr("dataid");
    		var schemeStatus = $(this).attr("datastatus");
    		var schemeNo = $(this).attr("dataSchemeNo");
    		if(schemeStatus != "draft"){
    			info += "'"+schemeNo+"',";
    			isreturn = true;
    		}else{
    			schemeIds.push(schemeId);
    		}
    	});
    	if(isreturn){
    		info.substring(0,info.length-1);
    		$.u.alert.error("方案 "+info+"不是草稿状态，不能删除！");
    		return;
    	}
		var layerindex = layer.confirm('是否确认删除？', {
		    btn: ['确认','取消'] //按钮
		},  this.proxy(function(){
			var data = {
				"method":"losaDelSchemes",
   				"schemeIds":JSON.stringify(schemeIds)
			};
			layer.close(layerindex);
			myAjaxModify(data, null, this.proxy(function(response) {
				if(response.success){
		        	  $.u.alert.success("删除成功！");
					  this._querySchemes();
		        }else{
		        	var schemeNos = response.data;
					if(schemeNos.length!=0){
						var schemeNo = "'";
						for(var i=0;i<schemeNos.length;i++){
							schemeNo += schemeNos[i].schemeNo;
							schemeNo += "'、"
						}
						schemeNo.substring(0,schemeNo.length-1);
						$.u.alert.error("方案"+schemeNo+"下已经关联方案，不能删除！");
					}else{
						$.u.alert.error("删除失败！");
					}
		        }
			}));
		})) ;
	},
	//发布方案
	_disSchemes:function(){
		var isreturn = false;
		var schemeIds = [];
    	var checkboxes = $("#schemeListBody input[type=checkbox]:checked");
    	if(!checkboxes.length){
    		$.u.alert.error("请选择需要发布的记录！");
			return false;
    	}
    	var info = "";
    	checkboxes.each(function(){
    		var schemeId = $(this).attr("dataid");
    		var schemeStatus = $(this).attr("datastatus");
    		var schemeNo = $(this).attr("dataSchemeNo");
    		if(schemeStatus != "draft"){
    			info += "'"+schemeNo+"',";
    			isreturn = true;
    		}else{
    			schemeIds.push(schemeId);
    		}
    	});
    	if(isreturn){
    		info.substring(0,info.length-1);
    		$.u.alert.error("方案 "+info+"不是草稿状态，不能发布！");
    		return;
    	}
    	var layerindex = layer.confirm('是否确认发布？', {
		    btn: ['确认','取消'] //按钮
		},  this.proxy(function(){
			var data = {
				"method":"losaDisSchemes",
   				"schemeIds":JSON.stringify(schemeIds)
			};
			myAjaxModify(data, null, this.proxy(function(response) {
				if(response.success){
		        	  $.u.alert.success("发布成功！");
		        	  layer.close(layerindex); 					
					  this._querySchemes();
		        }else{
		        	  $.u.alert.error("发布失败！");
		        }
				
			}));
		}), this.proxy(function(){
		})) ;
	},
	_modifyScheme:function(){
		var isreturn = false;
		var schemeIds = [];
    	var checkboxes = $("#schemeListBody input[type=checkbox]:checked");
    	if(!checkboxes.length||checkboxes.length>1){
    		$.u.alert.error("请选择一条记录！");
			return false;
    	}
    	var schemeId;
    	checkboxes.each(function(){
    		schemeId = $(this).attr("dataid");
    		var schemeStatus = $(this).attr("datastatus");
    		if(schemeStatus != "draft"){
    			$.u.alert.error("方案不是草稿状态，不能修改！");
    			isreturn = true;
    			return false;
    		}
    	});
    	if(isreturn){
    		return;
    	}
    	if(this.schemeEditUm != null) delete this.schemeEditUm;
    	this.schemeEditUm = new com.losa.scheme.schemeEdit($("div[umid='schemeEdit']",this.$),{schemeId:schemeId});
    	var layerindex = layer.open({
	        type: 1,
	        title: '修改航线审计方案',
	        maxmin: false,
	        fix: false,
	        closeBtn: 1,
	        zIndex : 20,//解决和其它组件的层叠冲突,如果不设select2无法正确显示
	        shadeClose: false, //点击遮罩关闭层
	        area : ['800px','600px'],
	        content: $("div[umid='schemeEdit']",this.$),
	    });
    	this.schemeEditUm.myLayerIndex = layerindex;
	},
	_retriveScheme:function(e){
		var schemeId = $(e.currentTarget).attr("dataid");
    	/*if(this.schemeEditUm != null) delete this.schemeEditUm;
    	this.schemeEditUm = new com.losa.scheme.schemeEdit($("div[umid='schemeEdit']",this.$),{schemeId:schemeId});
    	var layerindex = layer.open({
	        type: 1,
	        title: '查看航线审计方案',
	        maxmin: false,
	        fix: true,
	        closeBtn: 1,
	        zIndex : 20,//解决和其它组件的层叠冲突,如果不设select2无法正确显示
	        shadeClose: false, //点击遮罩关闭层
	        area : ['800px','600px'],
	        content: $("div[umid='schemeEdit']",this.$),
	    });
    	this.schemeEditUm.myLayerIndex = layerindex;*/
		window.open("scheme/schemeDetail.html?schemeId="+schemeId);
	},
	_collapseToggle:function(e){
		var $this = $(e.currentTarget);
	    if($this.hasClass("fa-angle-double-up")){
	        $this.removeClass("fa-angle-double-up").addClass("fa-angle-double-down");
	    }else{
	        $this.removeClass("fa-angle-double-down").addClass("fa-angle-double-up");
	    }
	},
	//全选功能
	_checkAllSchemes:function(e){
		if(e.currentTarget.checked){
			$("#schemeListBody input[type=checkbox]").prop("checked","true");
		}else{
			$("#schemeListBody input[type=checkbox]").removeProp("checked");
		}
	},
	//判断全选按钮是否应该被选中
	_isCheckAllChecked:function(){
		var chknum = $("#schemeListBody input[type=checkbox]").size();//选项总个数 
	    var chk = 0; 
	    $("#schemeListBody input[type=checkbox]").each(function(){   
	        if($(this).prop("checked")==true){ 
	            chk++; 
	        } 
	    }); 
	    if(chknum==chk){//全选 
	        $("#allScheme").prop("checked","true");
	    }else{//不全选 
	        $("#allScheme").removeProp("checked"); 
	    }
	},
	_isEmpty:function(value){
		if(value == null || value == '' || value == undefined){
			return true;
		}
		return false;
	},
	//日期比较(yyyy-mm-dd)
	_compareDate:function(a, b){
	    var arr = a.split("-");
	    var starttime = new Date(arr[0], arr[1], arr[2]);
	    var starttimes = starttime.getTime();

	    var arrs = b.split("-");
	    var lktime = new Date(arrs[0], arrs[1], arrs[2]);
	    var lktimes = lktime.getTime();

	    if (starttimes > lktimes) {
	        return false;
	    }
	    return true;
	}
},{ usehtm: true, usei18n: false});
com.losa.scheme.auditScheme.widgetjs = [];
com.losa.scheme.auditScheme.widgetcss = [];