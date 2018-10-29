$.u.define('com.sms.losa.launch', null, {
	init:function(){
		
	},
	afterrender:function(){
		scrollMenu('scrollnext');
		this.save=this.qid("saveLaunch");
		this.submit=this.qid("submitLaunch");
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
				
				/**if(way.get("jsonObserve").loadingBriefing!=""){
					document.getElementById("loadingBriefing").options[way.get("jsonObserve").loadingBriefing].selected = true;
				}
				if(way.get("jsonObserve").loadingPlan!=""){
					document.getElementById("loadingPlan").options[way.get("jsonObserve").loadingPlan].selected = true;
				}
				if(way.get("jsonObserve").loadingWorkDistribute!=""){
					document.getElementById("loadingWorkDistribute").options[way.get("jsonObserve").loadingWorkDistribute].selected = true;
				}
				if(way.get("jsonObserve").loadingEmergencyMeasure!=""){
					document.getElementById("loadingEmergencyMeasure").options[way.get("jsonObserve").loadingEmergencyMeasure].selected = true;
				}
				if(way.get("jsonObserve").loadingCheck!=""){
					document.getElementById("loadingCheck").options[way.get("jsonObserve").loadingCheck].selected = true;
				}
				if(way.get("jsonObserve").loadingWorkManage!=""){
					document.getElementById("loadingWorkManage").options[way.get("jsonObserve").loadingWorkManage].selected = true;
				}
				if(way.get("jsonObserve").loadingAlertness!=""){
					document.getElementById("loadingAlertness").options[way.get("jsonObserve").loadingAlertness].selected = true;
				}
				if(way.get("jsonObserve").loadingAutoManage!=""){
					document.getElementById("loadingAutoManage").options[way.get("jsonObserve").loadingAutoManage].selected = true;
				}
				if(way.get("jsonObserve").loadingPlanAssess!=""){
					document.getElementById("loadingPlanAssess").options[way.get("jsonObserve").loadingPlanAssess].selected = true;
				}
				if(way.get("jsonObserve").loadingQuestion!=""){
					document.getElementById("loadingQuestion").options[way.get("jsonObserve").loadingQuestion].selected = true;
				}
				if(way.get("jsonObserve").loadingConfidence!=""){
					document.getElementById("loadingConfidence").options[way.get("jsonObserve").loadingConfidence].selected = true;
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
		
	},
   
   
	
}, { usehtm: true, usei18n: false });
com.sms.losa.launch.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
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
 com.sms.losa.launch.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]