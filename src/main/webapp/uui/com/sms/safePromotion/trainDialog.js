//@ sourceURL=com.sms.safePromotion.trainDialog
/**
 * 增加/编辑奖惩记录对话框
 * @author 
 */
$.u.define('com.sms.safePromotion.trainDialog', null, {
    init: function(options) {
        this._options = options || {};
        this._SELECT2_PAGE_LENGTH = 10;
    },
    afterrender: function() {
    	this.name=this.qid("name");
        this.startDate = this.qid("startDate");
        this.endDate = this.qid("endDate");
        this.expiryDate=this.qid("expiryDate");
        this.trainingUnit=this.qid("trainingUnit");
        this.trainingType = this.qid("trainingType");
        this.trainingCourse = this.qid("trainingCourse");
        this.trainingInstitution=this.qid("trainingInstitution");
        this.recurrentTraining = this.qid("recurrentTraining");
        this.recurrentTrainningDate=this.qid("recurrentTrainningDate");//复训日期的div
        this.recurrentTraining.on("change",this.proxy(this.on_change));//是否复训
        this.recurrentDate =this.qid("recurrentDate");//复训日期
        this.certificateType =this.qid("certificateType");//证书类别
        this.certificateNo =this.qid("certificateNo");//证书编号
        this.certificationAuthority=this.qid("certificationAuthority");//发证机构
        //this.qualified =this.qid("qualified");//是否合格
        this.form = this.qid("form");
        this.trainDialog = this.qid("trainDialog").dialog({
            title: "添加培训记录",
            width: 540,
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            buttons: [{
                "text":"取消",
                "click": this.proxy(this.on_cancel_click)
            }, {
                "text": "确定",
                "class": "aui-button-link",
                "click": this.proxy(this.on_ok_click)
            }],
            create:this.proxy(this.on_dialog_create),
            open:this.proxy(this.on_dialog_open),
            close: this.proxy(this.on_dialog_close)
        });
    },
    /**
     * @title 模态层创建时执行
     */
	on_change:function(){
    		if(this.recurrentTraining.val()=="true"){
        		this.recurrentTrainningDate.show();
        	}else{
        		this.recurrentTrainningDate.hide();
        	}
	    },
    on_dialog_create: function() {
    	this.startDate.add(this.endDate).add(this.expiryDate).add(this.recurrentDate).datepicker({
    		dateFormat:"yy-mm-dd"
    	});
    	var unitId=this.unitId;
    	//姓名
    	this.name.select2({
    		multiple: true,
	    	ajax:{
    			url: $.u.config.constant.smsqueryserver,
    			dataType: "json",
    			type: "post",
	            data:this.proxy(function(term, page){
	            	var unitIds =[this.trainingUnit.select2("val")] || [];
                    
                    
	            	return {
	            		tokenid: $.cookie("tokenid"),
	            		method: "getUsersByUnitIds",
	            		 unitIds: JSON.stringify(unitIds || ''),
                        "term":term,
	    				"start": (page - 1) * this._SELECT2_PAGE_LENGTH,
	    				"length": this._SELECT2_PAGE_LENGTH
	    			};
	            }),
		        results:this.proxy(function(response, page, query){ 
		        	if(response.success){
		        		return {
		        			 results: response.data.aaData,
		        			 more: response.data.iTotalRecords > (page * this._SELECT2_PAGE_LENGTH) 
		        		};
		        	}
		        	else{
		        		$.u.alert.error(response.reason, 1000 * 3);
		        	}
		        })
    		},
    		formatSelection: function(item) {
    			if(item.username){
    				return item.fullname;
    			}else{
    				return item.fullname || '';
    			}
            },
            formatResult: function(item){
            	
            	if(item.username){
    				return item.fullname;
    			}else{
    				return item.fullname || '';
    			}
	        }
    	
    	}).on('select2-opening', this.proxy(function(e){
        	if(!this.trainingUnit.select2('val')){
        		$.u.alert.error('请选择所属单位');
        		this.trainingUnit.select2('open');
        		e.preventDefault();
        	}
        }));
    	
    	//所属单位
        this.trainingUnit.select2({
            width: '100%',
            multiple: false,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getunits",
                        dataobject:"trainingUnit",
                        rule: JSON.stringify([
                            [{
                                "key": "name",
                                "op": "like",
                                "value": term
                            }]
                        ]),
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data,
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return  item.name;
            },
            formatSelection: function(item) {
                return  item.name;
            }
        });
        //证书类别
        this.certificateType.select2({
            width: '100%',
            multiple: false,
            ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page) {
                    return {
                        tokenid: $.cookie("tokenid"),
                        method: "getCertificateType"
                    };
                }),
                results: this.proxy(function(response, page, query) {
                    if (response.success) {
                        return {
                            results: response.data,
                            more: response.data.length > (page * this._SELECT2_PAGE_LENGTH)
                        }
                    } else {
                        $.u.alert.error(response.reason, 1000 * 3);
                    }
                })
            },
            formatResult: function(item) {
                return item.name;
            },
            formatSelection: function(item) {
                return item.name;
            }
        
        })
        this.form = this.qid("form").validate({
            rules: {
            	name:"required",
            	startDate: "required",
                endDate: "required",
                trainingUnit: "required",
                trainingType: "required",
                trainingCourse: "required",
                recurrentDate:"required",
                expiryDate:"required",
                trainingInstitution:"required",
                certificateType:"required",
                certificationAuthority:"required"
            },
            messages: {
            	name:"请选择姓名",
            	startDate: "请选择开始日期",
            	endDate: "请选择结束日期",
            	trainingUnit: "请选择部门",
            	trainingCourse: "请填写培训课程",
            	recurrentDate:"请选择复训日期"	,
            	expiryDate:"请选择有效期",
            	trainingInstitution:"请填写培训单位",
            	certificateType:"请选择证书类别",
            	certificationAuthority:"请填写发证机构"
            },
            errorClass: 'text-danger',
            errorElement: 'div'
        });
        
    },
    /**
     * @title 模态层打开时执行
     */
    on_dialog_open: function() {
        
    },
    /**
     * @title 模态层关闭时执行
     */
    on_dialog_close: function() {
        this.clearFormData();
        this.qid("form").validate().resetForm(); 
    },
        
    
    on_ok_click:function(param){
    	this.form = this.qid("form");
        if(this.form.valid()){
        	this.fresh(this.getFormData());
        };
    },
    fresh:function(param){
    	var FormData=this.getFormData();
   },
    on_cancel_click:function(){
    	this.trainDialog.dialog("close");
    },
 
    open: function(param) {
        if(param.mode=='edit'){
             this.trainDialog.dialog("option", {title:"编辑培训记录"});
            $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            data: {
                tokenid: $.cookie("tokenid"),
                method: "stdcomponent.getbyid",
                dataobject: 'trainingRecord',
                dataobjectid: param.id
            },
            dataType: "json"
        }, this.$analysisContainer).done(this.proxy(function(response) {
            if (response.success && response.data) {
            	//打开赋值
            	//培训对象
            	if(response.data.trainingTarget){
            		var m=response.data.trainingTarget;
            		this.name.select2("data",{id:m.id,fullname:m.displayName});
            	};
            	this.name.select2("enable", false);
            	//所属单位
            	if(response.data.trainingUnit && response.data.trainingUnitDisplayName){
            		var m={id:response.data.trainingUnit,name:response.data.trainingUnitDisplayName};
            		this.trainingUnit.select2("data",{id:m.id,name:m.name});
            	};
            	this.trainingUnit.select2("enable", false);
            	//证书类型
            	if(response.data.certificateType){
            		var m=response.data.certificateType;
            		this.certificateType.select2("data",{id:m.code,name:m.name});
            	};
            	//培训类别
            	this.trainingType.val(response.data.trainingType.code);
            	//是否合格
//            	if(response.data.qualified==true){
//            		this.qualified.find("option[value=true]").attr("selected","selected");
//            	 }else{
//            		 this.qualified.find("option[value=false]").attr("selected","selected");
//            	 }
            	//是否复训
            	if(response.data.recurrentTraining==true){
            		this.recurrentTraining.find("option[value=true]").attr("selected","selected");
            	 }else{
            		 this.recurrentTraining.find("option[value=false]").attr("selected","selected");
            	 }
            	if(response.data.recurrentTraining==false){
            		this.recurrentTrainningDate.hide();
            	}else{
            		this.recurrentTrainningDate.show();
            	}
            	 this.recurrentDate.val(response.data.recurrentTrainingDate);
                 this.certificateNo.val(response.data.certificateNo);
                 this.certificationAuthority.val(response.data.certificationAuthority);
            	this.trainingCourse.val(response.data.trainingCourse);
            	this.trainingInstitution.val(response.data.trainingInstitution);
                this.startDate.val(response.data.trainingStartDate);
                this.endDate.val(response.data.trainingEndDate);
                this.expiryDate.val(response.data.expiryDate);
                        
            }
        }));
            
        }else{
        	this.name.select2("enable", true);
        	this.trainingUnit.select2("enable", true);
        };
        
       
        this.trainDialog.dialog("open");
    },
    getFormData: function() {
    	 var nameValue = [];
         this.name.select2("data") && $.each(this.name.select2("data"), function(k, v) {
             nameValue.push(v.id);
         });
    	return obj={
    		trainingTargets:nameValue,
    		trainingStartDate:this.startDate.val(),
    		trainingEndDate:this.endDate.val(),
    		trainingType:this.trainingType.val(),
    		trainingCourse:this.trainingCourse.val(),
    		trainingUnit:parseInt(this.trainingUnit.select2("val")),
    		recurrentTraining:this.recurrentTraining.val(),
    		recurrentTrainingDate:this.recurrentDate.val(),
    		expiryDate:this.expiryDate.val(),
    		trainingInstitution:this.trainingInstitution.val(),
    		certificateType:this.certificateType.select2("val"),
    		certificateNo:this.certificateNo.val(),
    		certificationAuthority:this.certificationAuthority.val(),
    		qualified:this.proxy(function(){
                var shifouhege="";
                var d = new Date();
                var strDate = getDateStr(d);
                var d2 = new Date(this.expiryDate.val());
                if (d2 < d) {
                	shifouhege = false;
                }else{
                	shifouhege = true; 
                }
            function getDateStr(date){
                var month = date.getMonth() + 1;
                var strDate = date.getFullYear() + '-' + month + '-' + date.getDate();
                return strDate;
            };
               return shifouhege;
    		})()
    		
    	};
    },
    clearFormData: function() {
    	this.name.select2("data",null),
    	this.startDate.val(null),
    	this.endDate.val(null),
    	this.trainingType.val(null),
    	this.trainingCourse.val(null),
    	this.trainingUnit.select2("val",null),
    	this.recurrentDate.val(null),
    	this.expiryDate.val(null),
    	this.trainingInstitution.val(null),
    	this.trainingInstitution.select2("val",null),
    	this.certificateNo.val(null),
    	this.certificationAuthority.val(null),
    	this.name.select2("enable", true)
    	
     },
    destroy: function() {
        this._super();
    }
}, {
    usehtm: true,
    usei18n: false
});

com.sms.safePromotion.trainDialog.widgetjs = [
    "../../../uui/widget/jqurl/jqurl.js",
    "../../../uui/widget/select2/js/select2.min.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.safePromotion.trainDialog.widgetcss = [{
    path: "../../../uui/widget/select2/css/select2.css"
}, {
    path: "../../../uui/widget/select2/css/select2-bootstrap.css"
}];