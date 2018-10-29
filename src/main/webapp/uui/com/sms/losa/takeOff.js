$.u.define('com.sms.losa.takeOff', null, {
	init:function(){
		
	},
	afterrender:function(){
		scrollMenu('scrollnext');
		this.save=this.qid("saveTakeOff");
		this.submit=this.qid("submitTakeOff");
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
				
				/**if(way.get("jsonObserve").takeOffCheck!=""){
					document.getElementById("takeOffCheck").options[way.get("jsonObserve").takeOffCheck].selected = true;
				}
				if(way.get("jsonObserve").takeOffWorkManage!=""){
					document.getElementById("takeOffWorkManage").options[way.get("jsonObserve").takeOffWorkManage].selected = true;
				}
				if(way.get("jsonObserve").takeOffAlertness!=""){
					document.getElementById("takeOffAlertness").options[way.get("jsonObserve").takeOffAlertness].selected = true;
				}
				if(way.get("jsonObserve").takeOffAutoManage!=""){
					document.getElementById("takeOffAutoManage").options[way.get("jsonObserve").takeOffAutoManage].selected = true;
				}
				if(way.get("jsonObserve").takeOffPlanAssess!=""){
					document.getElementById("takeOffPlanAssess").options[way.get("jsonObserve").takeOffPlanAssess].selected = true;
				}
				if(way.get("jsonObserve").takeOffQuestion!=""){
					document.getElementById("takeOffQuestion").options[way.get("jsonObserve").takeOffQuestion].selected = true;
				}
				if(way.get("jsonObserve").takeOffConfidence!=""){
					document.getElementById("takeOffConfidence").options[way.get("jsonObserve").takeOffConfidence].selected = true;
				}
				if(way.get("jsonObserve").beforeLevelAutoManage!=""){
					document.getElementById("beforeLevelAutoManage").options[way.get("jsonObserve").beforeLevelAutoManage].selected = true;
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
   
   
	
}, { usehtm: true, usei18n: true });
com.sms.losa.takeOff.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
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
 com.sms.losa.takeOff.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]