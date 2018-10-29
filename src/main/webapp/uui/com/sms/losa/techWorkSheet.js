$.u.define('com.sms.losa.techWorkSheet', null, {
	init:function(){
		
	},
	afterrender:function(){
		scrollMenu('scrollnext');
		this.save=this.qid("saveTechWork");
		this.submit=this.qid("submitTechWork");
		this.submit.click(function(){
			submitLosa(id);
			
			// $('#isMadeBriefingBeforeTod').bootstrapSwitch('toggleState');       
			// $('#isMadeBriefingBeforeTod').bootstrapSwitch('setState', true);    
			 //alert($("#isMadeBriefingBeforeTod").bootstrapSwitch('state'));
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
				showSwitch("isMadeBriefingBeforeTod",response.jsonActivity.jsonObserve[0].isMadeBriefingBeforeTod);
				showSwitch("isDroBeforeTod",response.jsonActivity.jsonObserve[0].isDroBeforeTod);
				showSwitch("isBigMarginFly",response.jsonActivity.jsonObserve[0].isBigMarginFly);
				showSwitch("isBigMarginAbroveExpect",response.jsonActivity.jsonObserve[0].isBigMarginAbroveExpect);
				showSwitch("theTatgetAirspeedAbove1500",response.jsonActivity.jsonObserve[0].theTatgetAirspeedAbove1500);
				showSwitch("theTatgetAirspeedAbove1000",response.jsonActivity.jsonObserve[0].theTatgetAirspeedAbove1000);
				showSwitch("theTatgetAirspeedAbove500",response.jsonActivity.jsonObserve[0].theTatgetAirspeedAbove500);
				showSwitch("theVerticalVelocity1500",response.jsonActivity.jsonObserve[0].theVerticalVelocity1500);
				showSwitch("theVerticalVelocity1000",response.jsonActivity.jsonObserve[0].theVerticalVelocity1000);
				showSwitch("theVerticalVelocity500",response.jsonActivity.jsonObserve[0].theVerticalVelocity500);
				showSwitch("theRunningEngine1500",response.jsonActivity.jsonObserve[0].theRunningEngine1500);
				showSwitch("theRunningEngine1000",response.jsonActivity.jsonObserve[0].theRunningEngine1000);
				showSwitch("theRunningEngine500",response.jsonActivity.jsonObserve[0].theRunningEngine500);
				showSwitch("loadingType1500",response.jsonActivity.jsonObserve[0].loadingType1500);
				showSwitch("loadingType1000",response.jsonActivity.jsonObserve[0].loadingType1000);
				showSwitch("loadingType500",response.jsonActivity.jsonObserve[0].loadingType500);
				showSwitch("stableCrouse1500",response.jsonActivity.jsonObserve[0].stableCrouse1500);
				showSwitch("stableCrouse1000",response.jsonActivity.jsonObserve[0].stableCrouse100);
				showSwitch("stableCrouse500",response.jsonActivity.jsonObserve[0].stableCrouse500);
				showSwitch("stableSlop1500",response.jsonActivity.jsonObserve[0].stableSlop1500);
				showSwitch("stableSlop1000",response.jsonActivity.jsonObserve[0].stableSlop1000);
				showSwitch("stableSlop500",response.jsonActivity.jsonObserve[0].stableSlop500);
				//document.getElementById("isMadeBriefingBeforeTod").checked=way.get("jsonObserve").isMadeBriefingBeforeTod;
				
			 });	
		}else{	
		}
		addLink(id);
		
		
        this.save.click(function(){
        	way.set("jsonObserve.isMadeBriefingBeforeTod",setSwitch("isMadeBriefingBeforeTod"));
        	way.set("jsonObserve.isDroBeforeTod",setSwitch("isDroBeforeTod"));
        	way.set("jsonObserve.isBigMarginFly",setSwitch("isBigMarginFly"));
        	way.set("jsonObserve.isBigMarginAbroveExpect",setSwitch("isBigMarginAbroveExpect"));
        	way.set("jsonObserve.theTatgetAirspeedAbove1500",setSwitch("theTatgetAirspeedAbove1500"));
        	way.set("jsonObserve.theTatgetAirspeedAbove1000",setSwitch("theTatgetAirspeedAbove1000"));
        	way.set("jsonObserve.theTatgetAirspeedAbove500",setSwitch("theTatgetAirspeedAbove500"));
        	way.set("jsonObserve.theVerticalVelocity1500",setSwitch("theVerticalVelocity1500"));
        	way.set("jsonObserve.theVerticalVelocity1000",setSwitch("theVerticalVelocity1000"));
        	way.set("jsonObserve.theVerticalVelocity500",setSwitch("theVerticalVelocity500"));
        	way.set("jsonObserve.theRunningEngine1500",setSwitch("theRunningEngine1500"));
        	way.set("jsonObserve.theRunningEngine1000",setSwitch("theRunningEngine1000"));
        	way.set("jsonObserve.theRunningEngine500",setSwitch("theRunningEngine500"));
        	way.set("jsonObserve.loadingType1500",setSwitch("loadingType1500"));
        	way.set("jsonObserve.loadingType1000",setSwitch("loadingType1000"));
        	way.set("jsonObserve.loadingType500",setSwitch("loadingType500"));
        	way.set("jsonObserve.stableCrouse1500",setSwitch("stableCrouse1500"));
        	way.set("jsonObserve.stableCrouse1000",setSwitch("stableCrouse1000"));
        	way.set("jsonObserve.stableCrouse500",setSwitch("stableCrouse500"));
        	way.set("jsonObserve.stableSlop1500",setSwitch("stableSlop1500"));
        	way.set("jsonObserve.stableSlop1000",setSwitch("stableSlop1000"));
        	way.set("jsonObserve.stableSlop500",setSwitch("stableSlop500"));
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
com.sms.losa.techWorkSheet.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                  '../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                  '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                  '../../../uui/widget/select2/js/select2.min.js',
                                  "../../../uui/widget/spin/spin.js", 
                                  "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                  "../../../uui/docs/js/highlight.js",
                                  "../../../uui/dist/js/bootstrap-switch.js",
                                  "../../../uui/docs/js/main.js",
                                  "../../../uui/widget/ajax/layoutajax.js",
                                  "../../../uui/vendor/underscore.js",
                                  "../../../uui/vendor/underscore.json.js",
                                   "../../../uui/vendor/form2js.js",
                                   "../../../uui/vendor/js2form.js",
                                   "../../../uui/way.js"];
 com.sms.losa.techWorkSheet.widgetcss = [
                                         { path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                         { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                         {path:"../../../uui/widget/bootstrap/css/table.css"},
                                         {path:"../../../uui/widget/select2/css/select2.css"},
                                         {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                         
                                        
                                   ]