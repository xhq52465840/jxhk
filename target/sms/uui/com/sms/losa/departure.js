
$.u.define('com.sms.losa.departure', null, {
	init:function(){
		
	},
	afterrender:function(){
		scrollMenu('scrollnext');
		this.save=this.qid("saveDepart");
		this.submit=this.qid("submitDepart");
		this.submit.click(function(){
			submitLosa(id);
		})
		var url=location.href;
		var id=""
		if (url.indexOf("?") != -1){
			id=url.split('?')[1].split('=')[1];
			$.ajax({
				 url: $.u.config.constant.smsqueryserver,
	             type:"post",
	             dataType: "json",
	             cache: false,
	             data: {
	        		"tokenid":$.cookie("tokenid"),
	        		"method":"pullActivity",
	        		"activityId":id
	             }
		        
			 }).done(function(response){
				
				 $.each( response.jsonActivity.jsonObserve[0], function(key, value){
					 if(value==null){
						 //value="";
						 response.jsonActivity.jsonObserve[0][key] = ""
					 }
					 });
				
				way.set("jsonObserve",response.jsonActivity.jsonObserve[0]);
				//$("#beforeLeaveBriefing").val(way.get("jsonObserve").beforeLeaveBriefing);
				
				/**if(way.get("jsonObserve").beforeLeaveBriefing!=""){
					document.getElementById("beforeLeaveBriefing").options[way.get("jsonObserve").beforeLeaveBriefing].selected = true;
				}
				if(way.get("jsonObserve").beforeLeavePlan!=""){
					document.getElementById("beforeLeavePlan").options[way.get("jsonObserve").beforeLeavePlan].selected = true;
				}
				if(way.get("jsonObserve").beforeLeaveWorkDistribute!=""){
					document.getElementById("beforeLeaveWorkDistribute").options[way.get("jsonObserve").beforeLeaveWorkDistribute].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelEmergencyMeasure!=""){
					document.getElementById("beforeLevelEmergencyMeasure").options[way.get("jsonObserve").beforeLevelEmergencyMeasure].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelCheck!=""){
					document.getElementById("beforeLevelCheck").options[way.get("jsonObserve").beforeLevelCheck].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelWorkManage!=""){
					document.getElementById("beforeLevelWorkManage").options[way.get("jsonObserve").beforeLevelWorkManage].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelAlertness!=""){
					document.getElementById("beforeLevelAlertness").options[way.get("jsonObserve").beforeLevelAlertness].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelAutoManage!=""){
					document.getElementById("beforeLevelAutoManage").options[way.get("jsonObserve").beforeLevelAutoManage].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelPlanAssess!=""){
					document.getElementById("beforeLevelPlanAssess").options[way.get("jsonObserve").beforeLevelPlanAssess].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelQuestion!=""){
					document.getElementById("beforeLevelQuestion").options[way.get("jsonObserve").beforeLevelQuestion].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelConfidence!=""){
					document.getElementById("beforeLevelConfidence").options[way.get("jsonObserve").beforeLevelConfidence].selected = true;
				}*/
				
               

				
				
			 });	
		}else{	
		}
		addLink(id);
		
		this.save.click(function(){
			
			$.each( way.get("jsonObserve"), function(key, value){
				 if(value==""){
					 value="";
					 way.get("jsonObserve")[key] =null;
				 }
				 });
			way.set("jsonObserve.flightDate",way.get("jsonObserve.flightDate")+" 00:00:00");
			$.ajax({
				 url: $.u.config.constant.smsmodifyserver,
	             type:"post",
	             dataType: "json",
	             cache: false,
	             data: {
	            	 "tokenid":$.cookie("tokenid"),
		        	  "method":"pushActivity",
		        	  "jsonActivity":JSON.stringify({
		        		  "jsonObserve":JSON.stringify(
		        			way.get("jsonObserve")	
		        		  )
		        	  })
	             }
	             
			}).done(function(response){
			
				 
				if(response.Code=="success"){
					$.u.alert.success("保存成功");
				}else{
					$.u.alert.error("保存失败");
				}
			})
		});
		//
		/**var url=location.href;
		var id=""
		var detail="";
		if (url.indexOf("?") != -1){
			id=url.split('?')[1].split('=')[1];
			detail=url.split('?')[1].split('=')[2];
			
		}
		if(id!=""){
			addLink(id);
			$.ajax({
				url:$.u.config.constant.smsqueryserver,
				type: "post",
                dataType: "json",
                data:{
                	"tokenid":$.cookie("tokenid"),
					"method":"stdcomponent.getbyid",
					"dataobject":"losa",
					"dataobjectid":id
                }
			}).done(function(response){
				if(response.data.before_leave_desc!=null){
					$('#depAccount').val(response.data.before_leave_desc);
				}
				
				
			})
		}
		this.save=this.qid("saveBasic").click(function(){
			$.ajax({
				url:$.u.config.constant.smsmodifyserver,
				type: "post",
                dataType: "json",
				data:{
					"tokenid":$.cookie("tokenid"),
					"method":"stdcomponent.update",
					"dataobject":"losa",
					"dataobjectid":id,
            		 "obj":JSON.stringify({
            			 before_leave_desc: $("#depAccount").val(),
            			 
                    })
				}, 
			}).done(function(response){
				var dialogOptions = {
						buttons: [{
                        text: "确定",
  						"class": "aui-button-link",
  						 click: function () {
  							window.location.href = "cruise.html?id=" + id;
  							$('#saveDialog').dialog("close");
  							$('#depAccount').val("");
						    }
                        },
                         {
                         text: "取消",
              			"class": "aui-button-link",
              			click: function () {
              			$('#saveDialog').dialog("close");
              			$('#depAccount').val("");
          			}
                        }
				]
				};
				this.saveDialog = $('#saveDialog').dialog({
					title : "保存数据",
					width:350,
					modal: true,
			        draggable: false,
			        resizable: false,
			        autoOpen: false,
			        position:[550,200],
				});
				this.saveDialog.dialog("option",dialogOptions).dialog("open");
			
			});
		});*/
		
	},
   
   
	
}, { usehtm: true, usei18n: false });
com.sms.losa.departure.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                  '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                  '../../../uui/widget/select2/js/select2.min.js',
                                  "../../../uui/widget/spin/spin.js", 
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/widget/ajax/layoutajax.js",
                                 
                                  "../../../uui/vendor/underscore.js",
                                  "../../../uui/vendor/underscore.json.js",
                                   "../../../uui/vendor/form2js.js",
                                   "../../../uui/vendor/js2form.js",
                                   "../../../uui/way.js"];
 com.sms.losa.departure.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]
