$.u.load("com.common.vueupload.fileList");
$.u.define('com.losa.scheme.schemeEdit', null, {
	init : function(options){
		this._options = options || null;
		this.schemeId = null;
	
		
	},
	afterrender:function(){
		var _that = this;
		this.schemeId = this._options.schemeId;		
		this.schemeEditFormVue = new Vue({
			el : '#schemeEditForm',
			data : {
				schemeTypeNames:'',
				schemeInfo:{schemeType:'', impleUnitId:'',startDate:'',
					endDate:'',schemeDesc:'',schemeId:'',
						auditedUnits:'',auditedUnitNames:'',auditor:'',isAuditedUnitsIn:0,isImpleUnitIn:0},
				flag:'M',
				schemeId:this.schemeId,
				userAuth:'',				
				options1: [
		      		      { id: 0, text: '' },
		      		    ],	
      		    options2: [
		      		      { id: 0, text: '' },
		      		    ],
      		    options3: [
		      		      { id: 0, text: '' },
		      		    ],
			},
		
			methods : {
				search : this.proxy(this._querySchemes),
				reset : this.proxy(this._querySchemeReset),
				save : this.proxy(this._saveSchemeInfo),
				cancel : this.proxy(this._cancel),
				modifyBasicInfo : this.proxy(this._modifyBasicInfo),
				changeAuditors : this.proxy(this._loadSchemeObservers),
			},
			watch:{
				   'schemeInfo.startDate':function(val, oldVal){
					   var endDate = this.schemeInfo.endDate;
					   if(!_that._isEmpty(val) && !_that._isEmpty(endDate) && !_that._compareDate(val,endDate)){
						   $.u.alert.error("时间范围开始日期不能大于结束日期！");
						   this.schemeInfo.startDate = oldVal;
					   }
				   },
				   'schemeInfo.endDate':function(val, oldVal){
					   var startDate = this.schemeInfo.startDate;
					   if(!_that._isEmpty(val) && !_that._isEmpty(startDate) && !_that._compareDate(startDate,val)){
						   $.u.alert.error("时间范围结束日期不能小于开始日期！");
						   this.schemeInfo.endDate = oldVal;
					   }
				   },
			   }
		});	
		var _that = this;
		
		if(this.schemeId!="" && this.schemeId!=null){
			setTimeout(function(){
				//判断当前用户是否可以修改方案
				_that._queryUserAuth();
				//查询方案类型
				_that._querySchemeTypeNames();
				//实施单位选择，添加select2控件
				_that._loadImpleUnit();
				//方案参与人员，添加select2控件
				_that._loadSchemeObservers();
				//被实施单位选择，添加select2控件
				_that._loadSchemeAuditedUnits();
				//加载数据
				_that._load();
				
			},50);
			
		}else{
			this.schemeEditFormVue.$set('flag','S');
			this.schemeEditFormVue.schemeInfo.isAuditedUnitsIn = 1;
			this.schemeEditFormVue.schemeInfo.isImpleUnitIn = 1;
			setTimeout(function(){
				//查询方案类型
				_that._querySchemeTypeNames();
				//实施单位选择，添加select2控件
				_that._loadImpleUnit();
				//方案参与人员，添加select2控件
				_that._loadSchemeObservers();
				//被实施单位选择，添加select2控件
				_that._loadSchemeAuditedUnits();
			},50);
		}
		$(".date").datepicker({
			"dateFormat" : "yy-mm-dd",
			constrainInput : true
		});
		
		
		
	},
	_queryUserAuth:function(){
		var userAuth = "";
		var data = {
				"method" : "losaGetUserAuth",
			};
			myAjaxQuery(data, null, this.proxy(function(response) {
				if (response.success) {
					userAuth = response.data;
					if(userAuth=='系统管理员'){//系统管理员可以修改方案
						this.schemeEditFormVue.$set('userAuth', "Y");
						this._addAttach(this.schemeEditFormVue.userAuth);
					}else if(userAuth=='观察员'){//观察员不可以修改方案
						this.schemeEditFormVue.$set('userAuth', "N");
						this._addAttach(this.schemeEditFormVue.userAuth);
						
					}else{//子公司管理员如果作为实施单位，可以修改方案，如果是被实施单位，不可以修改方案
						var data1 = {"method":"losaIsUserSchemeUnit","schemeId":this.schemeId};
						myAjaxQuery(data1,null,this.proxy(function(response1){
							this.schemeEditFormVue.$set('userAuth', response1.data);
							this._addAttach(this.schemeEditFormVue.userAuth);
						}));
					}
					
				}
				
			
			})); 
	},
	_addAttach:function(flag){
		if(this.attachDialog != null) delete this.attachDialog;
		 this.attachDialog=new com.common.vueupload.fileList($("div[umid='attachments']",this.$),{
			 activityId:this.schemeId,type:'scheme',language:'ch',isDeleted:flag,isUpload:flag
		 });
	},
	//查询方案类型
	_querySchemeTypeNames:function(e){
		var data = {
			"method" : "queryDictNames",
			"dictType" : "scheme_type",
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.schemeEditFormVue.$set('schemeTypeNames', response.data)
			}
		})); 
	},
	//实施单位添加select2控件
	_loadImpleUnit:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "losaQuerySchemeImpleUnit",
		};
		
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.unitName;
					array.push(obj);
				})
				//debugger;
				this.schemeEditFormVue.$set("options1", array);
			}
		})); 		
	},
	//方案参与人员添加select2控件
	_loadSchemeObservers:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "losaQueryLosaAuditors",
		};
		
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.fullname;
					array.push(obj);
				})
				this.schemeEditFormVue.$set("options2", array);
				}
		})); 		
	},
	//被实施单位，也就是飞行大队，添加select2控件
	_loadSchemeAuditedUnits:function(){
		var data = {
				tokenid: $.cookie("tokenid"),
                method: "losaGetFlightUnitNameAndCode",
		};
		
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data,function(index,value){
					var obj = new Object();
					obj.id = value.unitId;
					obj.text = value.unitName;
					array.push(obj);
				})
				this.schemeEditFormVue.$set("options3", array);
				}
		})); 		
	},
	
	_saveSchemeInfo:function(){
		this.schemeEditFormVue.schemeInfo.auditorSelect2 = undefined;
		this.schemeEditFormVue.schemeInfo.auditedUnitsSelect2 = undefined;
		var schemeType = this.schemeEditFormVue.schemeInfo.schemeType;
		var schemeImpleUnit = this.schemeEditFormVue.schemeInfo.impleUnitId;
		var startDate = this.schemeEditFormVue.schemeInfo.startDate;
		var endDate =  this.schemeEditFormVue.schemeInfo.endDate;
		var schemeId = this.schemeEditFormVue.schemeInfo.id;
		var auditedUnitsSelect2 = this.schemeEditFormVue.schemeInfo.auditedUnits;
		var auditorSelect2 = this.schemeEditFormVue.schemeInfo.auditor;
		if(schemeType==null||schemeType==""){
	        layer.msg('方案类型不能为空');
        }else if(schemeType=='air_unit'&&(auditedUnitsSelect2==null||auditedUnitsSelect2=="")){
        	layer.msg('方案类型是机队，被实施单位不能为空');
        }else if(schemeType=='air_unit'&&auditedUnitsSelect2.indexOf(",")>0){
        	layer.msg('方案类型是机队，被实施单位只能选择一条记录');
        }else if(schemeImpleUnit==null || schemeImpleUnit==""){
        	layer.msg('实施单位不能为空');
        }else if(startDate==null || startDate==""||endDate==null || endDate==""){
        	layer.msg('时间范围不能为空');
        }else if(auditorSelect2==null || auditorSelect2==""){
        	layer.msg('参与人员不能为空');
        }else{
			data = {
		             "method":"losaInsertOrUpdateScheme",
		             "schemeInfo":JSON.stringify(this.schemeEditFormVue.schemeInfo),
		          };
	       	myAjaxModify(data, null, this.proxy(function(response) {
		          if(response.success){
		        	  if(this.schemeId==null||this.schemeId==''){
		        		  parent.$.u.alert.success("保存成功！");
			        	  losaMainUm.auditSchemeUm._querySchemes();
			        	  layer.close(this.myLayerIndex);//由父传递过来
		        	  }else{
		        		  var message = response.message;
		        		  if(message==''){
		        			  $.u.alert.success("保存成功！");
		        		  }else{
		        			  $.u.alert.success("保存成功，"+message+"已经关联计划，无法删除！");
		        		  }
		        		  $('.disabled').attr("disabled","disabled");
		        		  this.schemeEditFormVue.$set('flag','M');
		        		  //实施单位选择，添加select2控件
		        		  this._loadImpleUnit();
		        		  //方案参与人员，添加select2控件
		        		  this._loadSchemeObservers();
		        		  //被实施单位选择，添加select2控件
		        		  this._loadSchemeAuditedUnits();
		        		  this._load();
		        	  }
		          }else{
		        	  $.u.alert.error("保存失败！");
		          }
	       }));
        }
	},
	_cancel:function(){
		layer.close(this.myLayerIndex);//由父传递过来
	},
	//初始化数据
	_load:function(){	
		var data = {
			"method":"losaQuerySchemeInfoById",
			"schemeId":this.schemeId
		};
		myAjaxQuery(data, null, this.proxy(function(response) {
			if (response.success) {
				this.schemeEditFormVue.$set("schemeInfo",response.data);
				 this.schemeEditFormVue.schemeInfo.auditedUnits= "";
				 this.schemeEditFormVue.schemeInfo.auditor= "";
				 this.schemeEditFormVue.schemeInfo.auditedUnitNames = "";
				var auditedUnitsSelect2 = this.schemeEditFormVue.schemeInfo.auditedUnitsSelect2;
				var auditorSelect2 = this.schemeEditFormVue.schemeInfo.auditorSelect2;
				this.schemeEditFormVue.schemeInfo.isAuditedUnitsIn = 0;
				this.schemeEditFormVue.schemeInfo.isImpleUnitIn = 0;
				var options1 = this.schemeEditFormVue.options1;
				if(options1 != null && options1.length >0){
					for(var h=0;h<options1.length;h++){
						if(options1[h].id == this.schemeEditFormVue.schemeInfo.impleUnitId){
							this.schemeEditFormVue.schemeInfo.isImpleUnitIn++;
							break;
						}
					}
				}
				
				//debugger;
				var options3 = this.schemeEditFormVue.options3;
				if(this.schemeEditFormVue.schemeInfo.schemeType == 'air_line'){
					this.schemeEditFormVue.schemeInfo.isAuditedUnitsIn = 1;
				}
				for(var i=0;i<auditedUnitsSelect2.length;i++){
					this.schemeEditFormVue.schemeInfo.auditedUnits+=auditedUnitsSelect2[i].unitId+",";
					this.schemeEditFormVue.schemeInfo.auditedUnitNames+=auditedUnitsSelect2[i].unitName+",";
					for(var j=0;j<options3.length;j++){
						if(options3[j]['id'] == auditedUnitsSelect2[i].unitId){
							this.schemeEditFormVue.schemeInfo.isAuditedUnitsIn++;
						}
					}
				}
				if (this.schemeEditFormVue.schemeInfo.auditedUnits.length > 0) {
					this.schemeEditFormVue.schemeInfo.auditedUnits = this.schemeEditFormVue.schemeInfo.auditedUnits.substr(0,this.schemeEditFormVue.schemeInfo.auditedUnits.length - 1);
			    }
				if (this.schemeEditFormVue.schemeInfo.auditedUnitNames.length > 0) {
					this.schemeEditFormVue.schemeInfo.auditedUnitNames = this.schemeEditFormVue.schemeInfo.auditedUnitNames.substr(0,this.schemeEditFormVue.schemeInfo.auditedUnitNames.length - 1);
			    }
				for(var i=0;i<auditorSelect2.length;i++){
					this.schemeEditFormVue.schemeInfo.auditor+=auditorSelect2[i].id+",";
				}
				if (this.schemeEditFormVue.schemeInfo.auditor.length > 0){
					this.schemeEditFormVue.schemeInfo.auditor= this.schemeEditFormVue.schemeInfo.auditor.substr(0,this.schemeEditFormVue.schemeInfo.auditor.length - 1);
				}
			}
		}));
	},
	_modifyBasicInfo:function(){
		//$('.disabled').removeAttr("disabled");
		this.schemeEditFormVue.$set('flag','S');
		//实施单位选择，添加select2控件
		this._loadImpleUnit();
		//方案参与人员，添加select2控件
		this._loadSchemeObservers();
		//被实施单位选择，添加select2控件
		this._loadSchemeAuditedUnits();
		this._load();
		
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
},{
	usehtm : true,
	usei18n : false
});
com.losa.scheme.schemeEdit.widgetjs = ['../../../uui/vue.js',
                                       "../../losa/base.js",
                                       ];
com.losa.scheme.schemeEdit.widgetcss = [{ path: '../../../css/losa.css' },
                                        { path:"../../../uui/widget/select2/css/select2.css"},
                                        {path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];