$.u.load("com.eiosa.section.sectionDetail");
$.u.load("com.eiosa.document.docList");
$.u.define('com.eiosa.section.section', null, {
	init : function(options) {
		this._options = options || null;
		this.reportId=this._options.reportId
		this.sectionId=this._options.id
		this.docListUm = null;
		this.sectionDetailUm = null;
		
	},
	afterrender : function() {
		
		
		this.sectionVue= new Vue({
            el : '#sectionContext',
            data:{sectionList:'',
      		  options: [
      		      { id: 0, text: '' },
      		    ],	
            },
            methods : {
          	  querySection:this.proxy(this._querySection),
          	  sectionToIsarp:this.proxy(this._sectionToIsarp),
          	  sectionDocument:this.proxy(this._sectionDocument),
          	  conformity:this.proxy(this._conformity),
          	  changeManger:this.proxy(this._changeManger),
          	 changeChief:this.proxy(this._changeChief),
          	 startDate:this.proxy(this._startDate),
          	 endDate:this.proxy(this._endDate),
          	sectionDetail:this.proxy(this._linkToSectionDetail)
          	
            },
             
             });
		this._querySection();
		this._queryChief();
	
	},
	
	_querySection:function(){
		var data = {
				"method":"querySection",
				"reportId":this.reportId
		};
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			

			if (param.success) {
	            this.sectionVue.$set('sectionList',param.data.SectionList.aaData);
	            Vue.nextTick(this.proxy(function() {	            	
	            	 $(".date").datepicker({
	            		 "dateFormat":"yy-mm-dd", 
	            		 constrainInput:true,
	            		 onSelect: this.proxy(function(selectedDate, inst){  
	            			 if(inst.id.indexOf("start")>=0) {
	            				 this._updateDate0("startDate", $(inst.input).attr("data"));
	            			 } else {
	            				 this._updateDate0("endDate", $(inst.input).attr("data"));
	            			 }
	            		 })
	            	 });
	            	 
//	            	 $(".chief").select2({
//	            		  placeholder: "请输入审计组联络人",
//	         			  allowClear : true,
//	 	    			   ajax: {
//	 	                       url: $.u.config.constant.smsqueryserver,
//	 	                       dataType: "json",
//	 	                       type: "post",
//	 	                       data: function(term, page){
//	 	                           return {
//	 	                               tokenid: $.cookie("tokenid"),
//	 	                               method: "getUserIdNameByGroupName",
//	 	                               groupName: 'EIOSA审计管理员',
//	 	                               userName: term
//	 	                           };
//	 	                       },
//	 	                       results:function(response, page, query){
//	 	                           if(response.success){
//	 	                               return {
//	 	                                   "results": response.data.aaData
//	 	                               }
//	 	                           }
//	 	                       }
//	 	                   },
//	 	                   id: function(item){
//	 	                       return item.id;
//	 	                   },
//	 	                   formatResult:function(item){
//	 	                  	 return item.fullname+"("+item.username+")"
//	 	                  },
//	 	                  formatSelection:function(item){
//	 	                  	 return item.fullname
//	 	                  }
//	 	    		}).on("change",  this.proxy(function(e){
//	 	    
//	            		this._changeChief(e);
//	            	}));
//	            	//给审计组联络人select2添加数据
//	            	$.each(this.sectionVue.sectionList,function(index,value){
//	            		if(value.chief.id!=null){
//	            			$("#chief"+value.id).select2('data',value.chief);
//	            		}
//	            		
//	            	})
	            	 
	            	
				}) );
	           
       
		}
		})); 
		
	},
	
	_queryChief:function(){
		var data = {
			  	tokenid: $.cookie("tokenid"),
         method: "getUserIdNameByGroupName",
         groupName: 'EIOSA审计管理员',
		};
		debugger
		myAjaxQuery(data, null, this.proxy(function(param, response) {
			if (param.success) {
				var array = new Array();
				$.each(param.data.aaData,function(index,value){
					var obj = new Object();
					obj.id = value.id;
					obj.text = value.fullname;
					array.push(obj);
				})
				this.sectionVue.$set("options", array);
				}
		})); 		
	},
	
    _linkToSectionDetail:function(e){
    	
//		var reportId=$(e.currentTarget).attr("data");
		var sectionId=$(e.currentTarget).attr("data");
		if(this.sectionDetailUm != null) delete this.sectionDetailUm;
		
		this.sectionDetailUm = new com.eiosa.section.sectionDetail($("div[umid='documentLibary']",this.$),{"reportId":this.reportId,"id":sectionId});
		var layerindex =layer.open({
	        type: 1,
	        title: 'Section详细信息',
	        maxmin: false,
	        fix:false,
	        shadeClose: false, //点击遮罩关闭层
	        area : ['1000px' , '600px'],
	        content: $("div[umid='documentLibary']",this.$),
	    });
		this.sectionDetailUm.myLayerIndex = layerindex;
	},   
	
	
	
	_conformity:function(e){
		debugger
		var sectionId=$(e.currentTarget).attr("data");
		var type=$(e.currentTarget).attr("type");
//		$("#isarpSection").val(id);
//		assessmentType=type;
//		$("#tab_isarps").click();
		var check="false";
		eiosaMainUm._initIsarpsTab({sectionId: sectionId,check :check,assessmentType: type});
		$('#myTab li:eq(4) a').tab('show');
	},
	
	_sectionToIsarp:function(e){
		debugger
		var sectionId=$(e.currentTarget).attr("data");
//		$("#isarpSection").val(sectionId);
//		 $("#tab_isarps").click();	
		var check="false";
		eiosaMainUm._initIsarpsTab({sectionId: sectionId,check :check});
		$('#myTab li:eq(4) a').tab('show');
	},
	_sectionDocument:function(e){
		var sectionId=$(e.currentTarget).attr("data");		
		//$("#docSection").val(secId);
		//$("#tab_documents").click();		
		eiosaMainUm._initDocumentsTab({sectionId: sectionId});
    	$('#myTab li:eq(2) a').tab('show');

    	
	},
	_changeManger:function(e){
		var id=$(e.currentTarget).attr("data");
		var layerindex=layer.confirm('您确认将本项和其下级负责人同时变为新的负责人吗？', {
		    btn: ['确认','取消'] //按钮
		}, this.proxy(function(){
			var data = {
					"method":"addDealer",
					"sectionId":id,
					"dealerId":$("#section"+id).val(),
					
			}
			layer.close(layerindex);
			myAjaxModify(data, $("#sectionContext"), this.proxy(function(response) {
				if (response.code=="success") {
					
					$.u.alert.success("保存成功");
					
				} else {
					$.u.alert.error("保存失败");
				}
			}));
		}), function(){
			
		});	 
	},
	_changeChief:function(el){
		var id= el.attr("data");
		var data = {
				"method":"updateChiefAuditor",
				"sectionId":id,
				"userId":el.val(),		
		};
		myAjaxModify(data, $("#sectionContext"), this.proxy(function(response) {
			if (response.code=="success") {
				
				$.u.alert.success("保存成功");
				
			} else {
				$.u.alert.error("保存失败");
			}
		}));
		
	},
	_startDate:function(e){
		var id=$(e.currentTarget).attr("data");
		this._updateDate0("startDate", id);
	},
	
	_endDate:function(e){
		var id=$(e.currentTarget).attr("data");
		this._updateDate0("endDate", id);
	},
	_updateDate0:function(type, id){
		var data = {
				"method":"stdcomponent.update",
				"dataobject":"iosaSection",
				"dataobjectid":id,
		};
		var obj = {};
		obj[type] = $('#'+type+id).val();
		data.obj = JSON.stringify(obj);

		myAjaxModify(data, $("#sectionContext"), this.proxy(function(response) {
			if(response.success){
			      $.u.alert.success("日期保存成功");
			    
			     }
		}));	
	},
	
}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.section.section.widgetjs = [
                                     '../../../uui/widget/select2/js/select2.min.js',
       							  '../../../uui/widget/spin/spin.js',
       							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
       							  '../../../uui/widget/ajax/layoutajax.js',
       							  '../../../uui/widget/validation/jquery.validate.js',
       							 '../../../uui/vue.js',
       							"../base.js"
       							
       							  ];
com.eiosa.section.section.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                           {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}
                                       ];