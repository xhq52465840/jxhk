$.u.define('com.sms.losa.wholeFlight', null, {
	init:function(){
		
	},
	afterrender:function(){
		
		scrollMenu('scrollnext');
		this.save=this.qid("saveWhole");
		this.submit=this.qid("submitWhole");
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
				
				/**if(way.get("jsonObserve").theFlightCommunicationEnvir!=""){
					document.getElementById("theFlightCommunicationEnvir").options[way.get("jsonObserve").theFlightCommunicationEnvir].selected = true;
				}
				if(way.get("jsonObserve").theFlightLeadership!=""){
					document.getElementById("theFlightLeadership").options[way.get("jsonObserve").theFlightLeadership].selected = true;
				}
				if(way.get("jsonObserve").theFlightIsExtBrifing!=""){
					document.getElementById("theFlightIsExtBrifing").options[way.get("jsonObserve").theFlightIsExtBrifing].selected = true;
				}
				if(way.get("jsonObserve").theFlightScore!=""){
					document.getElementById("theFlightScore").options[way.get("jsonObserve").theFlightScore].selected = true;
				}
				if(way.get("jsonObserve").contributionOfCaptain!=""){
					document.getElementById("contributionOfCaptain").options[way.get("jsonObserve").contributionOfCaptain].selected = true;
				}
				if(way.get("jsonObserve").contributionOfPolit!=""){
					document.getElementById("contributionOfPolit").options[way.get("jsonObserve").contributionOfPolit].selected = true;
				}
				if(way.get("jsonObserve").theFlightCrewValidity!=""){
					document.getElementById("theFlightCrewValidity").options[way.get("jsonObserve").theFlightCrewValidity].selected = true;
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
com.sms.losa.wholeFlight.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
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
 com.sms.losa.wholeFlight.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]