//@ sourceURL=sms.src.main.webapp.uui.com.audit.terminal.planDialog
$.u.define('com.audit.terminal.planDialog', null,{
    init: function (options) {  
        this._options = options || {};
        this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.form = this.qid("planForm");
    	this.year=this.qid("year");
    	this.flight = this.qid("flight");					    // 航班
    	this.unit = this.qid("unit");				            // 单位
    	this.quarter = this.qid("quarter");						// 年季度
    	
    	this.form.validate({
    		rules:{
    			"flight":"required",
    			 "unit":"required",
    			 "quarter":"required"
    		},
    		messages:{
    			"flight":"航班不能为空",
    			"unit":"单位不能为空",
    			"quarter":"年季度不能为空"
    			
    		},
    		errorClass: "text-danger text-validate-element",
            errorElement:"div"
    	});
    		
    	this.planDialog = this.qid("div_planDialog");
	       this.planDialog.dialog({
	    	title:"年度计划",
	        width:540,
	        modal: true,
	        draggable: false,
	        resizable: false,
	        autoOpen: false,
	        buttons: [
	            { text: "添加",click: this.proxy(this.on_ok_click)},
	            { text: "取消","class": "aui-button-link",click: this.proxy(this.on_cancel_click)}
	        ],
	        open: this.proxy(this.on_dialog_open),
	        
	        close: this.proxy(this.on_dialog_close),
	        create: this.proxy(this.on_dialog_create)
	    }); 
	       //日期
	       var myDate= new Date(); 
	       var startYear=2015;//起始年份 
	       var endYear=myDate.getFullYear()+2;//结束年份 
	       var obj=document.getElementById('year');
	       var html="";
	       for (var i=startYear;i<=endYear;i++) 
	       { 
	        html+=("<option value="+i+">"+i+"年"+"</option>"); 
	       }
	       this.year.html(html);
	       setTimeout(this.proxy(this.getPlan),1000),
	       this.year.change(this.proxy(this.getPlan));
	       this.flight.select2({
		    	ajax:{
	    			url: $.u.config.constant.smsqueryserver,
	    			dataType: "json",
	    			type: "post",
	    			quietMillis: 250,
		            data: this.proxy(function(term, page){
		            	return {
		            		"tokenid": $.cookie("tokenid"),
		    				"method": "stdcomponent.getbysearch",
		    				"dataobject": "terminal",
		    				"rule": JSON.stringify([[{"key":"airport","op":"like","value":term}]]),
		    				"start": (page - 1) * this._select2PageLength,
		    				"length": this._select2PageLength
		    			};
		            }),
			        results:this.proxy(function(response, page, query){ 
			        	if(response.success){
			        		return {
			        			results:response.data.aaData, more:page * this._select2PageLength < response.data.iTotalRecords,
			        			
			        			};
			        			}
			        })
	    		},
		        formatResult:function(item){ return item.airport; },
		        formatSelection:function(item){ return item.airport; }
	    	}).on("select2-open", this.proxy(this.on_select2_open));  
	    // 安监机构
	       this.unit.select2({
	         width: "100%",
	         ajax: {
	           url: "/sms/query.do",
	           type: "post",
	           dataType: "json",
	           data: function (term, page) {
	             return {
	               method: "stdcomponent.getbysearch",
	               dataobject: "unit",
	               rule: JSON.stringify([[{ "key": "name", "op": "like", "value": term }]]),
	               start: (page - 1) * 10,
	               length: 10,
	               nologin: "Y"
	             };
	            
	           },
	             results: function(response, page){
	            
	            
	     	  return {
	     		 
	     		  results: response.data.aaData,
	     		  more: response.data.iTotalRecords > (page * 10)
	     	  };
	           }
	         },
	         operatorid:function(item){ return item.id; },
	         formatSelection: function (item){
	           return item.name;
	         },
	         formatResult: function (item) {
	           return item.name;
	         }
	       }).on("select2-selecting", function(){
	     	  $("#dealDepartment").select2("val", null);
	       });
	},
	//
	
	 getPlan:function(){
		    var val=[];
	    	val.push(parseInt(this.year.val()));
	    	var obj={"planType":"TERM","year":val};
	    	$.u.ajax({
	 			url : $.u.config.constant.smsqueryserver,
	 			type:"post",
	             dataType: "json",
	             cache: false,
	             data: {
	            	 "tokenid":$.cookie("tokenid"),
		       		  "method":"getPlanByYearAndType",
		       		  "obj":JSON.stringify(obj)
	             }
	     	},this.$).done(this.proxy(function(response) {
	     		if(response.success){
	        		this.planid = response.data.plans[0].id;
	     		}
	     	}))
	    },
	/**
	 * @title at after dialog open execute
	 * @return void 
	 */
	on_dialog_open:function(){
		var zIndex = parseInt(this.planDialog.parent().css("z-index"));
        $("body>.ui-dialog:last").css("z-index", zIndex + 2);
        $("body>.ui-widget-overlay:last").css("z-index", 1050);
	},
	/**
	 * @title at after dialog close execute
	 * @return void 
	 */
	on_dialog_close:function(){
		this.quarter.val("");
		this.flight.select2("val","");
		this.unit.select2("val","");
		this.form.validate().resetForm();
	},
	/**
	 * @title at after dialog create execute
	 * @return void 
	 */
	on_dialog_create:function(){
    },
	/**
	 * @title ok event
	 * @return void
	 */  
	on_ok_click:function(){
		var targetid=this.flight.select2("data").id;
		var operatorid=this.unit.select2("data").id;
		var airport=this.flight.select2("data").airport;
		if(this.form.valid()){
			$.u.ajax({
                url: $.u.config.constant.smsmodifyserver,
                type: "post",
                dataType: "json",
                data: {
                	"tokenid": $.cookie("tokenid"),
                	"method": "createTask",
                	"operate":"instanceTermTaskWorkflow",
            		"obj":JSON.stringify({
            			"plan":this.planid,
        	    		"planType":"TERM",
        	    		"target":targetid.toString(),//机场ID
        	    		"year":Number(this.year.val()),
        	    		"planTime":this.year.val()+"0"+this.quarter.val(),
        	    		"workName":this.year.val()+airport+"航站审计工作单",
        	    		"reportName":this.year.val()+airport+"航站审计报告",
        	    		"operator":operatorid.toString()
        	    		 
            		})
                }
            }, this.planDialog.parent(),{size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
            	
            	
            	if (response.success) {
            		parent.location.reload(); 
                	this.planDialog.dialog("close");
                	  
                   
                }
            })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
            	
            }));
		}
	},
	/**
	 * @title cancel event
	 * @return void
	 */
	on_cancel_click:function(){
		this.planDialog.dialog("close");
	},

    /**
     * @title function for override
     */
	 open: function (options) {
	    	this.planDialog.dialog("open");
	    },
    refreshList:function(){},
//    destroy: function () {
//    	this.flght.select2("destroy");
//    	this.unit.select2("destroy");
//    	this.quarter.val("destroy");
//    	this.planDialog.dialog("destroy").remove();
//        this._super();
//    }
}, { usehtm: true, usei18n: false });

com.audit.terminal.planDialog.widgetjs = ['../../../uui/widget/validation/jquery.validate.js',
                                           '../../../uui/widget/jqurl/jqurl.js',
                                           "../../../uui/widget/spin/spin.js", 
                                           "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                           "../../../uui/widget/ajax/layoutajax.js"];
com.audit.terminal.planDialog.widgetcss = [];