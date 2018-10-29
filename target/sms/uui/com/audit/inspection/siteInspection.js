//@ sourceURL=com.audit.inspection.siteInspection
$.u.define('com.audit.inspection.siteInspection', null, {
    init: function (option) {    	
    	this._option = option || {};
    	this._option.obj = {};//新增工作单时使用
    	this._option.planData = {};//用于判断是否已经在当前存在数据
    	this._option.editSpec = null;//用于判断专项检查的编辑
    	this.createAble = false;    	    	
    },
    afterrender: function () {
        this.initHtml();
    },
    initHtml : function () {
    	this.getNowDate();
        this.sys_sys = this.qid("sys_sys").select2({
    		placeholder: "请选择计划类别",
    		allowClear : true,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"getPlanType",
 		    			"category":"check"
 	        		};
 	    		},
 		        results:function(data,page){
 		        	if(data.success){
 		        		return { results: data.data };
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       }).on("select2-selecting", this.proxy(function(e) {
    	   this.btn_create.addClass("hidden").attr("disabled","disabled");
    	   if(e.val=="SPOT"){
    		   $("div[id$=sys_year]").removeClass("hidden"); 
    		   this.sys_date.addClass("hidden");
    		   $("div[id$=sys_type]").removeClass("hidden")
    	   }else if(e.val=="SPEC"){
    		   $("div[id$=sys_year]").addClass("hidden"); 
    		   this.sys_date.removeClass("hidden");
    		   $("div[id$=sys_type]").addClass("hidden");
    	   }
       }));
        this.sys_sys.select2("data",{id: "SPOT",name: "现场检查"});
        this.sys_item = this.qid("sys_item").select2({
        	placeholder: "请选择检查级别",
    		allowClear : true,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"getCheckGrade"
 	        		};
 	    		},
 		        results:function(data,page){
 		        	if(data.success){
 		        		return { results: data.data };
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       }).on("select2-selecting", this.proxy(function(e) {
    	   this.btn_create.addClass("hidden").attr("disabled","disabled");
    	   if(this.sys_sys.val()=="SPOT"){
    		   if(e.val == "SYS"){
        		   $("div[id$=sys_unit]").addClass("hidden");
        	   }else if(e.val == "SUB2"){
        		   $("div[id$=sys_unit]").removeClass("hidden");
        	   }
        	   $("div[id$=sys_year]").removeClass("hidden"); 
    	   }else if(this.sys_sys.val()=="SPEC"){
    		   if(e.val == "SYS"){
        		   $("div[id$=sys_unit]").addClass("hidden");
        	   }else if(e.val == "SUB2"){
        		   $("div[id$=sys_unit]").removeClass("hidden");
        	   }
    		   this.sys_date.removeClass("hidden");
    	   }
       }));
        
        this.sys_item.select2("data",{id: "SYS", name: "公司级"});
        this.sys_unit = this.qid("sys_unit").select2({
        	placeholder: "请选择安监机构",
    		allowClear : true,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: this.proxy(function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"getunits",
 		    			"unitName":term
 	        		};
 	    		}),
 		        results:function(data,page){
 		        	if(data.success){
 		        		return { results: data.data };
 		        	}
 		        }
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       });
        this.sys_year = this.qid("sys_year").select2({
        	placeholder: "请选择计划年份",
    		allowClear : true,
    		ajax:{
 	        	url: $.u.config.constant.smsqueryserver,
 	        	type: "post",
 	            dataType: "json",
 	        	data: this.proxy(function(term, page){
 	        		return {
 		    			"tokenid":$.cookie("tokenid"),
 		    			"method":"getFirstPlanYear",
 		    			"planType":this.sys_sys.select2("val"),
 		    			"checkType":this.sys_item.select2("val")
 	        		};
 	    		}),
 		        results:this.proxy(function(data,page){
 		        	if(data.success){
 		        		var aData = [];
 		        		if(data.data <= this.nowYear+1){
 		        			for(var i = 2015;i <= this.nowYear + 2; i++ ){
 		        				aData.push({"id":i,"name":i})
 		        			}
 		        		}
 		        		return { results: aData };
 		        	}
 		        })
 	        },
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       });
        this.sys_year.select2("data",{"id":this.nowYear,"name":this.nowYear});
        
        
        
        $.ajax({
        	url: $.u.config.constant.smsqueryserver,
        	type: "post",
            dataType: "json",
            async: false,
        	data:{
	    			"tokenid":$.cookie("tokenid"),
	    			"method":"getCheckInitSearchCondition"
    		}
    	}).done(this.proxy(function(response){
    		if (response.success) {
    			if(response.data){
    				this.sys_item.select2("data",response.data.checkGrade);
    				if(response.data.checkGrade.id === "SUB2"){
    					$("div[id$=sys_unit]").removeClass("hidden");
    					this.sys_unit.select2("data",response.data.unit);
    				}
    			}
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
        
        
        var sysTypeData = [];
        $.ajax({
        	url: $.u.config.constant.smsqueryserver,
        	type: "post",
            dataType: "json",
            async: false,
        	data:{
	    			"tokenid":$.cookie("tokenid"),
	    			"method":"stdcomponent.getbysearch",
	    			"dataobject":"dictionary",
	    			"rule":JSON.stringify([[{"key":"type","value":"现场检查"}]])
    		}
    	}).done(this.proxy(function(response){
    		if (response.success) {
    			sysTypeData = response.data.aaData;
    		}   		
    	})).fail(this.proxy(function(jqXHR,responseText,responseThrown){
    		
    	}));
        this.sys_type = this.qid("sys_type").select2({
        	placeholder: "请选择",
    		allowClear : true,
    		multiple : true,
    		data: sysTypeData,
 	        formatResult: function(item){
 	        	return item.name;      		
 	        },
 	        formatSelection: function(item){
 	        	return item.name;	        	
 	        }
       });
        this.sys_type.select2("data", sysTypeData);
        this.head_th = this.qid("head_th");
        this.btn_search = this.qid("btn_search");
        this.btn_search.off("click").on("click", this.proxy(this.get_data));
        this.btn_create = this.qid("btn_create");
        this.btn_create.off("click").on("click", this.proxy(this.create_data));
        this.datatable = this.qid("datatable");
        this.spectable = this.qid("spectable");
        this.planYear = this.qid("planYear");
        this.plan = this.qid("plan");
        this.spot = this.qid("spot");
        this.spec = this.qid("spec");
        this.myModal = $('#myModal');
        this.myModal.find('td.edit').off("click").on("click",this.proxy(this.my_modal_click));
        this.work = this.qid("work");
        this.work.off("click").on("click", this.proxy(this.work_click));
        this.del = this.qid("del");
        this.del.off("click").on("click", this.proxy(this.del_click));
        this.move = this.qid("move");
        this.checklist = this.qid("checklist");
        this.checklist.off("click").on("click", this.proxy(this.work_click));
        this.checkreport = this.qid("checkreport");
        this.checkreport.off("click").on("click", this.proxy(this.checkreport_click));
        this.improvelist = this.qid("improvelist");
        this.improvelist.off("click").on("click", this.proxy(this.improvelist_click));
        this.tracking = this.qid("tracking");
        this.tracking.off("click").on("click", this.proxy(this.tracking_click));
        /**
         * 专项检查时间
         */
        this.date=this.proxy(function(){
        	var date=[];
        	for(var i=2015;i<=this.nowYear+2;i++){
        		date.push({id:i,text:i.toString()});
        	}
        	return date;
        })();
        this.sys_date = this.qid("sys_date").select2({
        	placeholder: "请选择计划年份",
    		allowClear: true,
    		data:this.date,
       });
        this.spec_add = this.qid("btn_do");
        this.plantime_1 = this.qid("plantime_1");
        this.plantime_2 = this.qid("plantime_2");
        this.plantime_1.add(this.plantime_2).datepicker({dateFormat: 'yy-mm-dd'});
        this.modal_ed_click = this.qid("modal_ed_click");
        this.modal_ed_click.off("click").on("click", this.proxy(this.modal_ed));
        
        this.a = {};
        this.$thead = this.spectable.find("thead");
		$(window).scroll(this.proxy(function() {
	    	if(!this.a.width){
	    		this.a.top = this.$thead.offset().top;
	    		this.a.width = this.$thead.width();
	    	}
	    	var top2 = $(document).scrollTop();
	    	if(top2 < this.a.top){
	    		this.$thead.removeClass("th_fix");
	    	}else if(top2 > this.a.top){
	    		this.$thead.addClass("th_fix");
	    	}
		}));
		
		this.get_data();
    },
    modal_ed : function(){
    	var time1 = this.plantime_1.val(), 
    		time2 = this.plantime_2.val(),
    		planTime = "", data = "";
    	if(!time1){
    		this.plantime_1.addClass("div-error");
    		return false;
    	}else{
    		this.plantime_1.removeClass("div-error");
    	}
    	if(!time2){
    		this.plantime_2.addClass("div-error");
    		return false;
    	}else{
    		this.plantime_2.removeClass("div-error");
    	}
    	if(time1 > time2){
    		$.u.alert.error("结束时间小于开始时间");
    		return false;
    	}
    	planTime = time1+"至"+time2;
    	if(this._option.editSpec){
    		data = {
                "method": "modifyPlanTime",
                "id": this._option.editSpecId,
                "operate":"modify",
                "oldPlanTime": this._option.editSpecTime,
                "newPlanTime": planTime
            }
    	}else{
    		data = {
                "method": "stdcomponent.update",
                "dataobject":"plan",
                "dataobjectid":this._option.spec.id,
                "obj" : JSON.stringify({
                	"planTime" : planTime
                })
            }
    	}
    	this._ajax(
            $.u.config.constant.smsmodifyserver,
            "post",
            data,
            this.$,
            this.proxy(function(resp){
            	this.qid("modal_do_click").click();
            	this._option.editSpec = null;
            	this._option.editSpecTime = null;
            	this.get_data();
            })
        );
    	
    },
    getNowDate : function(){
    	var now = new Date();
    	this.nowYear = now.getFullYear();
    },
    get_data : function (e) {
    	this.btn_create.addClass("hidden").attr("disabled","disabled");
    	var obj = this.valid();
    	var dt = null;
    	if(this.valid()){
    		if(obj.planType === "SPOT"){
    			if(obj.checkType === "SYS"){
        			dt = $.extend({},obj,{"year":obj.year.toString()},{"method": "getAddPlanPermission"});
        		}else {
        			dt = $.extend({},obj,{"unitId":obj.operator.toString()},{"method": "getAddPlanPermission"});
        		}
    		}else if(obj.planType === "SPEC"){
    			if(obj.checkType === "SYS"){
        			dt = $.extend({},obj,{"year":obj.year.toString()},{"method": "getAddPlanPermission"});
        		}else {
        			dt = $.extend({},obj,{"unitId":obj.operator.toString()},{"method": "getAddPlanPermission"});
        		}
    		}
    		this._ajax(
	            $.u.config.constant.smsqueryserver,
	            "post",
	            dt,
	            this.$,
	            this.proxy(function(resp){
	            	this.createAble = resp.data.addable;
	            	obj.year = [obj.year];
            		if(obj.planType === "SPOT"){
            			if(this.sys_type.val()){
            				$("div[id$=sys_type]").removeClass("div-error");
            				var data = this.sys_type.select2("val");
            				obj.targetIds = [];
            				data && $.each(data, function(k,v){
            					obj.targetIds.push(parseInt(v,10));
            				});
            				obj.permittedQuery=true;
            			}else{
            				$("div[id$=sys_type]").addClass("div-error");
            				$.u.alert.error("请选择检查类别");
            	    		return false;
            			}
            		}
            		
            		this._option.obj = obj;
            		this._ajax(
        	            $.u.config.constant.smsqueryserver,
        	            "post",
        	            {
        	                "method": "getPlanByYearAndType",
        	                "obj" : JSON.stringify(obj)
        	            },
        	            this.$,
        	            this.proxy(function(resp){
        	            	if(resp.data.plans.length){
        	            		this.boolSeeTask = resp.data.boolSeeTask;//右键查看工作单的权限
        	            		$.each(resp.data.plans, this.proxy(function(idx, value){
            	            		if(value.planType == "SPOT"){
            	            			this.plan.text(value.planName);
            	            			this.planYear.text(value.year);
            		            		this.spot.removeClass("hidden");
            		            		this.spec.addClass("hidden");
            		            		this.createSpotTable(value.id,value.targets);
            	            		}else{
            	            			this.plan.text(value.planName);
            	            			this.planYear.text("");
            		            		this.spot.addClass("hidden");
            		            		this.spec.removeClass("hidden");
            		            		this._option.spec = {
        		            				planTime: value.planTime ? value.planTime.split(","):"",
        		            	    		id: value.id,
        		            	    		data: value.targets
        		            	    	}
            		            		this.createSpecTable(value.id,value.targets);
            	            		}
            	            	}));	
        	            	}else{
        	            		if(this.createAble){
        	            			this.btn_create.removeClass("hidden").removeAttr("disabled");
        	            		}
        	            		this.spot.add(this.spec).addClass("hidden");
        	            		$.u.alert.info("计划还没有创建", 4000);
        	            	}
        	            })
        	        );
	            })
	        )
    	}
    },
    create_data : function(){
    	var obj = this.valid();
    	if(this.valid()){
    		if(obj.planType=="SPOT"){
    			if(obj.checkType=="SYS"){
    				obj.planName = obj.year+"年公司" + this.sys_sys.select2("data").name + "计划";
    			}else if(obj.checkType=="SUB2"){
    				obj.planName = obj.year+"年" + this.sys_unit.select2("data").name + this.sys_sys.select2("data").name + "计划";
    				obj.operator = this.sys_unit.val();
    			}
    		}else if(obj.planType=="SPEC"){
    			if(obj.checkType=="SYS"){
    				obj.planName = obj.year+"年公司" + this.sys_sys.select2("data").name + "计划";
    			}else if(obj.checkType=="SUB2"){
    				obj.planName = obj.year+"年" + this.sys_unit.select2("data").name + this.sys_sys.select2("data").name + "计划";
    				obj.operator = this.sys_unit.val();
    			}
    		}
    		this._option.obj = obj;
    		this._ajax(
	            $.u.config.constant.smsmodifyserver,
	            "post",
	            {
	                "method": "stdcomponent.add",
	                "dataobject":"plan",
	                "obj" : JSON.stringify(obj)
	            },
	            this.$,
	            this.proxy(function(resp){
	            	$.u.alert.info("创建成功",3000);
	            	this.get_data();
	            })
	        );
    	}
    },    
    //循环追加行列
    createSpotTable : function(id,data){
    	var  count= {"01":"","02":"","03":"","04":"","05":"","06":"","07":"","08":"","09":"","10":"","11":"","12":""};
    	this._option.planData = {};    	    	
    	var $tbody = this.datatable.find("tbody").empty();
    	data && $.each(data, this.proxy(function(idx, obj){
    		this._option.planData[obj.id] = [];
    		var tr = '<tr><td>'+obj.name+'</td>';
			for(var i = 1;i < 13;i++){
				tr+='<td class="edit" data-id="'+id+'" data-target="'+obj.id+'" data-month="'+(i<10?'0'+i:i)+'" data-name="'+obj.name+'"></td>';
			}
			tr+='</tr>';			
			$tbody.append(tr);  									
    		obj.tasks && $.each(obj.tasks, this.proxy(function(k, v){
    			this._option.planData[obj.id].push(v.planTime);
    			if(!v.planTime){
    				return ;
    			}
    			var month = v.planTime.substr(-2);
    			if (!count[month]) {
    				count[month] = 0;
    			}
    			count[month] += 1;
    			var img = '';
    			if(v.closeDate!==""){
    				img = '<img class="flag" src="../img/r6.png" alt="" data-type="audit" data-flowstep="5" data-taskId="'+v.id+
    				'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    			}else if(v.improveNotices.length){
    					for(var i = 0,len = v.improveNotices.length; i < len; i++){
    						/*switch(v.improveNotices[i].flowStep){
		    				case "1":
		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-flowstep="1" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
		    				case "2":
		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-flowstep="2" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
		    				case "3":
		    					img = '<img class="flag" src="../img/r5.png" alt="" data-type="tracking" data-flowstep="3" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
		    				case "4":
		    					img = '<img class="flag" src="../img/r5.png" alt="" data-type="tracking" data-flowstep="4" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
		    				case "5":
		    					img = '<img class="flag" src="../img/r6.png" alt="" data-type="complete" data-flowstep="5" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
	    					}*/
    					if(v.improveNotices[i].completeDate!==""){
	    					img = '<img class="flag" src="../img/r6.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					continue;
    					}else if(v.improveNotices[i].improveNoticeDelayDate!==""||v.improveNotices[i].confirmDelayDate!==""){
    						img = '<img class="flag" src="../img/r7.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					continue;
    					}else if(v.generateReportDate!=="" ){
    						img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					continue;
    					}
    					switch(v.improveNotices[i].status.id){
    						case "NEW":
		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
    						case "AUDIT_WAITING":
		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
    						case "AUDIT_REJECTED":
		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
		    				case "UN_SENT":
		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
		    				case "SENT":
		    				case "COMPLETED":
		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[i].status.id + '" data-improveId="'+v.improveNotices[i].id+'" data-taskId="'+v.id+'"/>';
		    					break;
	    				}
    				}
    			}else{
    				switch(v.flowStep){
	    				case "1":
	    					img = '<img class="flag" src="../img/r2.png" alt="" data-type="plan" data-flowstep="1" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					break;
	    				case "2":
	    					img = '<img class="flag" src="../img/r3.png" alt="" data-type="audit" data-flowstep="2" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					break;
	    				case "3":
	    					img = '<img class="flag" src="../img/r3.png" alt="" data-type="audit" data-flowstep="3" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					break;
	    				case "4":
	    					img = '<img class="flag" src="../img/r3.png" alt="" data-type="audit" data-flowstep="4" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					break;
	    				case "5":
	    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-flowstep="5" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
	    					break;
					}
    			}
    			$('td[data-target='+obj.id+'][data-month='+month+']').append(img);
    		}));
    		
    		$("img.flag").tooltip({html : true ,left: 25});
    		$tbody.find("img").off("contextmenu").on("contextmenu", this.proxy(this.showMenu));
    		$tbody.find("td.edit").off("click").on("click", this.proxy(this.editTd));
    	}));    	    	
    	/**统计工作单数*/
    	var tr = '<tr><td>工作单数</td>';    	
		for(var i = 1;i < 13;i++){
			var month = i<10?'0'+i:i;
			tr+='<td class="edit table-counter" data-id="" data-target="" data-month="'+month+'" data-name="">' + count[month] + '</td>';
		}
		tr+='</tr>';		
    	$tbody.append(tr);
    },	
    createSpecTable : function(id,data){
    	var $tbody = this.spectable.find("tbody").empty(),
    	length = this._option.spec.planTime.length,
    	width = (80-(length*15))+"%",
    	width1 = this.spectable.width()*0.15 + "px";
    	this.head_th.css("width",width);
    	this.qid("head_th1").css("width", width1);
    	$('th.mo-do').remove();
    	this._option.spec.planTime && $.each(this._option.spec.planTime, this.proxy(function(k,v){
    		this.head_th.before('<th class="text-center mo-do" style="width:15%" data-id="' + id + '" data-time="' + v + '">' + v 
    				+ '<br /><span class="glyphicon glyphicon-pencil span_cursor spec_edit" title="编辑"></span>'
    				+ '<span class="glyphicon glyphicon-trash span_cursor spec_del" title="删除"></span></th>');
    	}));
    	data && $.each(data, this.proxy(function(idx, obj){
    		var tr = '<tr><td class="th_width">'+obj.name+'</td>', index = [], temp = [], img = "";
			obj.tasks && $.each(obj.tasks, this.proxy(function(k,v){
				var a = $.inArray(v.planTime, this._option.spec.planTime);
				a > -1 ? (index.push(a),temp.push(v)) : "";
			}));
			for(var i = 0; i < length; i++){
				var j = $.inArray(i, index);
    			if(j > -1){
    				var v = temp[j];
    				if(v.closeDate!==""){
        				img = '<img class="flag" src="../img/r6.png" alt="" data-type="audit" data-flowstep="5" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
        			}else if(v.improveNotices.length){
        				for(var m = 0,len = v.improveNotices.length; m < len; m++){
        					/*switch(v.improveNotices[m].flowStep){
    		    				case "1":
    		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-flowstep="1" data-improveId="'+v.improveNotices[m].id+'" />';
    		    					break;
    		    				case "2":
    		    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-flowstep="2" data-improveId="'+v.improveNotices[m].id+'" />';
    		    					break;
    		    				case "3":
    		    					img = '<img class="flag" src="../img/r5.png" alt="" data-type="tracking" data-flowstep="3" data-improveId="'+v.improveNotices[m].id+'" />';
    		    					break;
    		    				case "4":
    		    					img = '<img class="flag" src="../img/r5.png" alt="" data-type="tracking" data-flowstep="4" data-improveId="'+v.improveNotices[m].id+'" />';
    		    					break;
    		    				case "5":
    		    					img = '<img class="flag" src="../img/r6.png" alt="" data-type="complete" data-flowstep="5" data-improveId="'+v.improveNotices[m].id+'" />';
    		    					break;d
    	    				}*/
        					
        					if(v.improveNotices[m].completeDate!==""){
    	    					img = '<img class="flag" src="../img/r6.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					continue;
        					}else if(v.improveNotices[m].improveNoticeDelayDate!==""||v.improveNotices[m].confirmDelayDate!==""){
        						img = '<img class="flag" src="../img/r7.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					continue;
        					}else if(v.generateReportDate!=="" ){
        						img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					continue;
        					}
        					
        					switch(v.improveNotices[m].status.id){
	        					case "NEW":
			    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'"/>';
			    					break;
	    						case "AUDIT_WAITING":
			    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'"/>';
			    					break;
	    						case "AUDIT_REJECTED":
			    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'"/>';
			    					break;
			    				case "UN_SENT":
			    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'"/>';
			    					break;
			    				case "SENT":
			    				case "COMPLETED":
			    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-status="' + v.improveNotices[m].status.id + '" data-improveId="'+v.improveNotices[m].id+'" data-taskId="'+v.id+'"/>';
			    					break;
		    				}
        				}
        			}else{
        				switch(v.flowStep){
    	    				case "1":
    	    					img = '<img class="flag" src="../img/r2.png" alt="" data-type="plan" data-flowstep="1" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					break;
    	    				case "2":
    	    					img = '<img class="flag" src="../img/r3.png" alt="" data-type="audit" data-flowstep="2" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					break;
    	    				case "3":
    	    					img = '<img class="flag" src="../img/r3.png" alt="" data-type="audit" data-flowstep="3" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					break;
    	    				case "4":
    	    					img = '<img class="flag" src="../img/r3.png" alt="" data-type="audit" data-flowstep="4" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					break;
    	    				case "5":
    	    					img = '<img class="flag" src="../img/r4.png" alt="" data-type="improve" data-flowstep="5" data-taskId="'+v.id+'" data-toggle="tooltip" data-placement="top" data-html="true" data-original-title="'+(v.workNo||"")+'"/>';
    	    					break;
    					}
        			}
    			}else{
    				img = "";
    			}
    			tr += '<td class="edit th_width" data-target="'+obj.id + '"'
					+ ' data-id="' + id + '"'
					+ ' data-name="专项检查"'
					+ ' data-month="'+this._option.spec.planTime[i] + '"'
					+ (j > -1 ? ' data-taskId="'+v.id+'"' : "")
					+ '>'
					+ img
					+ '</td>';
    		}
    		tr += '<td style="width:'+width+'"></td><td style="width:5%;"></td></tr>';
    		$tbody.append(tr);
    	}));
    	/**统计专项检查工作单数*/
    	var tr = '<tr><td>工作单数</td>';
    	var q=[];var p=0;
    	for(var a=0;a<this._option.spec.planTime.length;a++){
    		 for(b=0;b<this._option.spec.data.length;b++){
    			 for(c=0;c<this._option.spec.data[b].tasks.length;c++){
    				 if(this._option.spec.planTime[a]==this._option.spec.data[b].tasks[c].planTime){
    					  p=p+1;
    				 }else{
    					 continue;
    				 }
    			 }
    		 }
    		q.push(p);
    	}
		for(var m = 0;m <q.length;m++){
			var s = m<10?'0'+m:m;
			if(q[m-1]==undefined){
				tr+='<td class="edit table-counter" class="worksNum" data-id="" data-target="" data-month="'+s+'" data-name="">' + q[m] + '</td>';
			}else{
				tr+='<td class="edit table-counter"  class="worksNum" data-id="" data-target="" data-month="'+s+'" data-name="">' + (q[m]-q[m-1]) + '</td>';
			}
			
		}
		tr+='<td></td><td></td></tr>';		
    	$tbody.append(tr);
    	
    	
    	$("img.flag").tooltip({html:true,left:25})
    	var width = this.spectable.find("thead").width();
    	this.spectable.find('thead').css("width",width);
    	$('td').find("img").off("contextmenu").on("contextmenu", this.proxy(this.showMenu));
    	$tbody.find("td.edit").off("click").on("click", this.proxy(this.editTd));
    	this.spectable.find(".spec_edit").off("click").on("click", this.proxy(this.spec_edit));
    	this.spectable.find(".spec_del").off("click").on("click", this.proxy(this.spec_del));
    },
    //<-专项检查工作单结束->
    editTd : function(e){   
    	var $e = $(e.currentTarget);
    	if(this.createAble){
    		if(this._option.obj.planType === "SPOT"){
    			this.addPlan($e);
    		}else if(this._option.obj.planType === "SPEC"){
    			if(!$e.has("img").length){
            		this.addPlan($e);
 
            	}
    		}
    	}
    },
    spec_edit: function(e){
    	var $e = $(e.currentTarget).parent(),
    	id = $e.attr("data-id"),
    	time = $e.attr("data-time"),
    	time3 = time.split("至"),
    	time1 = time3[0],
    	time2 = time3[1];
    	this.spec_add.click();
    	this._option.editSpec = true;
    	this._option.editSpecId = id;
    	this._option.editSpecTime = time;
    	this.plantime_1.val(time1);
        this.plantime_2.val(time2);
    },
    spec_del: function(e){
    	var $e = $(e.currentTarget).parent(),
    	id = $e.attr("data-id"),
    	time = $e.attr("data-time");
    	var clz = $.u.load("com.audit.comm_file.confirm");
    	var confirm = new clz({
            "body": "确认删除？",
            "buttons": {
                "ok": {
                    "click": this.proxy(function(){
                    	this._ajax(
                            $.u.config.constant.smsmodifyserver,
                            "post",
                            {
                                "method": "modifyPlanTime",
                                "id": id,
                                "operate":"delete",
                                "oldPlanTime": time
                            },
                            this.$,
                            this.proxy(function(resp){
                            	if(resp.success){                                 		
                            		confirm.confirmDialog.dialog("close");
                            		this.get_data();                            		                            		                                   
                  	            	                        	            	                                                            		                            		
                            	}else{
                            		$.u.alert.error("删除失败！"+resp.season, 4000);
                            	}
                            	
                            })
                        );
                    })
                }
            }
        });
    },
    work_click : function(){
    	window.open('viewworklist.html?id='+this.myModalId,'_blank');
    },
    del_click : function(){
    	this._ajax(
            $.u.config.constant.smsmodifyserver,
            "post",
            {
                "method": "stdcomponent.delete",
                "dataobject":"task",
                "dataobjectids":JSON.stringify([this.myModalId])
            },
            this.$,
            this.proxy(function(resp){
            	if(resp.success){
            		this.get_data();
            		if($('td[data-taskid='+this.myModalId+']').length){
            			$('td[data-taskid='+this.myModalId+']').empty().removeAttr('data-taskid');
            		}else if($('img[data-taskid='+this.myModalId+']').length){
            			//1@获取月份
            			var dataMonth = $('img[data-taskid='+this.myModalId+']').parent().attr("data-month");            			
            			//2@移除圆图
            			$('img[data-taskid='+this.myModalId+']').remove();
            			//3@追加球的图片            	  
                    	var counter = 0;
                    	//4@计算此列合计              	
                    		var $tdCounter = $('.table-counter[data-month='+dataMonth +']');            	            	
                        	counter = $.isNumeric($tdCounter.text()) ? parseInt($tdCounter.text()) : 0;            	            	            	
                        	$tdCounter.text(counter -1);            		            	            		            		        	            	            	    	            	            	
                        	$e.find("img").off("contextmenu").on("contextmenu", this.proxy(this.showMenu));             			            			                        	            		
                    	
            		}
            	}else{
            		$.u.alert.error("工作单删除失败！"+resp.season, 4000);
            	}
            
            })
        );
    	
    },
    checkreport_click : function(){
    	if(this.flowstep == "4"){
    		window.open('viewUploadDocumentsSigned.html?id='+this.myModalId,'_blank');
    	}else{
    		window.open('viewCheckReport.html?id='+this.myModalId,'_blank');
    	}
    },
    improvelist_click : function(){
    	if(this.status === "UN_SENT"){
    		window.open('../notice/RectificationForm.html?id='+this.improveId,'_blank');
    	}else{
    		window.open('../notice/RectificationFormDetail.html?id='+this.improveId,'_blank');
    	}
    },
    tracking_click : function(){
    	window.open('viewTrackList.html?id='+this.improveId,'_blank');
    },
    my_modal_click : function(e){
    	var planTime = this._option.obj.year.join(" ").toString()+$(e.currentTarget).attr("data-month");
    	var planData = this._option.planData[this.targetId];
    	this._ajax(
            $.u.config.constant.smsmodifyserver,
            "post",
            {
                "method": "stdcomponent.update",
                "dataobject":"task",
                "dataobjectid":this.myModalId,
                "obj" : JSON.stringify({
                	"planTime" : planTime
                })
            },
            this.$,
            this.proxy(function(resp){
            	this.qid("modal_click").click();
            	this.get_data();
            })
        );
    },
    addPlan : function($e){
    	
    	var obj = {};
		obj.plan =  parseInt($e.attr("data-id"), 10);
    	obj.planType = this._option.obj.planType;
    	obj.checkType = this._option.obj.checkType;
    	obj.target = $e.attr("data-target");
    	obj.year = parseInt(this._option.obj.year.join("").toString());
    	if(this._option.obj.planType === "SPOT"){
    		if(obj.checkType=="SYS"){
        		obj.workName = obj.year + "年" + $e.attr("data-month") + "月份公司" + $e.attr("data-name")+"工作单";
        		obj.reportName = obj.year + "年" + $e.attr("data-month") + "月份公司" + $e.attr("data-name")+"检查报告";
        	}else if(obj.checkType=="SUB2"){
        		obj.workName = obj.year + "年" + $e.attr("data-month") + "月份"+ this.sys_unit.select2("data").name + $e.attr("data-name")+"工作单";
        		obj.reportName = obj.year + "年" + $e.attr("data-month") + "月份"+ this.sys_unit.select2("data").name + $e.attr("data-name")+"检查报告";
        		obj.operator = this._option.obj.operator;
        	}
    		obj.planTime = obj.year + $e.attr("data-month");
    	}else if(this._option.obj.planType === "SPEC"){
    		if(obj.checkType=="SYS"){
        		obj.workName = obj.year + "年" + $e.attr("data-month") + "公司" + $e.attr("data-name")+"工作单";
        		obj.reportName = obj.year + "年" + $e.attr("data-month") + "公司" + $e.attr("data-name")+"检查报告";
        	}else if(obj.checkType=="SUB2"){
        		obj.workName = obj.year + "年" + $e.attr("data-month") + this.sys_unit.select2("data").name + $e.attr("data-name")+"工作单";
        		obj.reportName = obj.year + "年" + $e.attr("data-month") + this.sys_unit.select2("data").name + $e.attr("data-name")+"检查报告";
        		obj.operator = this._option.obj.operator;
        	}
    		obj.planTime = $e.attr("data-month");
    	}
    	this._ajax(
            $.u.config.constant.smsmodifyserver,
            "post",
            {
                "method": "stdcomponent.add",
                "dataobject":"task",
                "obj" : JSON.stringify(obj)
            },
            this.$,
            this.proxy(function(resp){
            	this.get_data();
            	//追加球的图片            	  
            	var counter = 0;
            	//计算此列合计              	
            		var $tdCounter = $('.table-counter[data-month='+$e.attr('data-month')+']');            	            	
                	counter = $.isNumeric($tdCounter.text()) ? parseInt($tdCounter.text()) : 0;            	            	            	
                	$tdCounter.text(counter +1);            		            	            		            		        	            	            	    	            	            	
                	$e.append('<img class="flag" src="../img/r2.png" alt="" data-type="plan" data-flowstep="1" data-taskId="'+resp.data+'"/>');
                	$e.find("img").off("contextmenu").on("contextmenu", this.proxy(this.showMenu));                      	            	                        	            	
            })
        );   
    	
    },
    showMenu : function(e){
    	var $e = $(e.currentTarget), offset = $e.offset(),
    	top = (offset.top+10)+"px", left = (offset.left+10)+"px",
    	type = $e.attr("data-type"), flowstep = $e.attr("data-flowstep"),
    	$u = $('ul.ul-show');
    	$u.find('li').addClass("hidden");
    	//TODO 右键显示菜单
    	if(e.which == 3){
    		switch(type){
	    		case "plan":
	    			if(this.boolSeeTask){//为true 表示可以查看工作单
		    			if(this._option.obj.planType === "SPEC"){
		    				this.work.parent().add(this.del.parent()).removeClass("hidden");
		    			}else if(this._option.obj.planType === "SPOT"){
		    				this.work.parent().add(this.move.parent()).add(this.del.parent()).removeClass("hidden");
		    			}
		    			
	    			}
	    			break;
	    		case "audit":
	    			if(this.boolSeeTask){//为true 表示可以查看工作单
		    			if(flowstep=="2"){
		    				this.work.parent().add(this.checklist.parent()).removeClass("hidden");
		    			}else if(flowstep=="3" || flowstep=="4"|| flowstep=="5"){
		    				this.work.parent().add(this.checklist.parent()).add(this.checkreport.parent()).removeClass("hidden");
		    			}
	    			}
	    			break;
	    		case "improve":
	    			if(this.boolSeeTask){//为true 表示可以查看工作单
	    			if(flowstep=="5"){
	    				this.work.parent().add(this.checklist.parent()).add(this.checkreport.parent()).removeClass("hidden");
	    			}else{
	    				this.work.parent().add(this.checklist.parent())
	    				.add(this.checkreport.parent()).add(this.improvelist.parent()).removeClass("hidden");
	    			}
	    			}
	    			break;
	    		case "tracking":
	    			if(this.boolSeeTask){//为true 表示可以查看工作单
		    			if(flowstep=="3" || flowstep=="4"){
		    				this.work.parent().add(this.checklist.parent())
		    				.add(this.checkreport.parent()).add(this.improvelist.parent())
		    				.add(this.tracking.parent()).removeClass("hidden");
		    			}
	    			}
	    			break;
	    		case "complete":
	    			if(this.boolSeeTask){//为true 表示可以查看工作单
		    				this.work.parent().add(this.checklist.parent())
		    				.add(this.checkreport.parent()).add(this.improvelist.parent())
		    				.add(this.tracking.parent()).removeClass("hidden");
	    			}
	    			break;
    		}
    		
    		this.myModalId = $e.attr("data-taskId");
    		this.targetId = $e.parent().attr("data-target");
    		this.status = $e.attr("data-status");
    		this.flowstep = flowstep;
    		this.improveId = $e.attr("data-improveId");
    		if($u.find("li:not(.hidden)").length){
    			$u.css({"display":"block","top":top,"left":left});
    		}
            $("body").bind("click", this.proxy(this.onBodyDown));
        }
    	return false;
    },
    onBodyDown : function(e){
    	if ($('ul.ul-show').css("display")=="block") {
			this.hideMenu();
		}
    },
    hideMenu : function(){
    	$('ul.ul-show').css({"display":"none","top":0,"left":0});
		$("body").unbind("click", this.proxy(this.onBodyDown));
    },
    createDatatable : function (data) {
        
    },
    valid : function(){
    	this._option.obj = {};
    	var sys_sys = this.sys_sys.val(),sys_item  = this.sys_item.val(),
    		sys_unit = this.sys_unit.val(),sys_year =  this.sys_year.val(),
    		sys_date = this.sys_date.val(), obj = {};
    	if(sys_sys){
    		$("div[id$=sys_sys]").removeClass("div-error");
    		obj.planType = sys_sys;
    		if(sys_sys == "SPOT"){
    			if(sys_item){
    				$("div[id$=sys_item]").removeClass("div-error");
    				obj.checkType = sys_item;
    				if(sys_item == "SYS"){
    					if(sys_year){
    						$("div[id$=sys_year]").removeClass("div-error");
    						obj.year = parseInt(sys_year, 10);
    					}else{
    						$("div[id$=sys_year]").addClass("div-error");
    	    				$.u.alert.error("请选择计划年份");
    	    	    		return false;
    					}
    				}else if(sys_item == "SUB2"){
    					if(sys_unit){
    						$("div[id$=sys_year]").removeClass("div-error");
    						obj.operator = sys_unit.toString();
    						if(sys_year){
        						$("div[id$=sys_year]").removeClass("div-error");
        						obj.year = parseInt(sys_year, 10);
        					}else{
        						$("div[id$=sys_year]").addClass("div-error");
        						$.u.alert.error("请选择计划年份");
        	    	    		return false;
        					}
    					}else{
    						//$("div[id$=sys_unit]").addClass("div-error");
    						$.u.alert.error("请选择安监机构");
    	    	    		return false;
    					}
    				}
    			}else{
    				$("div[id$=sys_item]").addClass("div-error");
    				$.u.alert.error("请选择检查级别");
    	    		return false;
    			}
    		}else if(sys_sys == "SPEC"){
    			if(sys_item){
    				$("div[id$=sys_item]").removeClass("div-error");
    				obj.checkType = sys_item;
    				if(sys_item === "SYS" ){
    					if(sys_date){
            				$("div[id$=sys_date]").removeClass("div-error");
            				obj.year = parseInt(sys_date, 10);
            			}else{
            				$("div[id$=sys_date]").addClass("div-error");
            	    		return false;
            			}
    				}else if(sys_item == "SUB2"){
    					if(sys_unit){
    						$("div[id$=sys_date]").removeClass("div-error");
    						obj.operator = sys_unit.toString();
    						if(sys_date){
    	        				$("div[id$=sys_date]").removeClass("div-error");
    	        				obj.year = parseInt(sys_date, 10);
    	        			}else{
    	        				$("div[id$=sys_date]").addClass("div-error");
    	        	    		return false;
    	        			}
    					}else{
    						$("div[id$=sys_unit]").addClass("div-error");
    	    	    		return false;
    					}
    				}
    			}else{
    				$("div[id$=sys_item]").addClass("div-error");
    	    		return false;
    			}
    		}
    	}else{
    		$("div[id$=sys_sys]").addClass("div-error");
    		$.u.alert.error("请选择计划类别");
    		return false;
    	}
    	return obj;
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

com.audit.inspection.siteInspection.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                     			"../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      			"../../../uui/widget/ajax/layoutajax.js",
                                      			"../../../uui/widget/select2/js/select2.min.js"
												];
com.audit.inspection.siteInspection.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                                 {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}
												];