function addmore(){
	var table2=document.getElementById('operate');
	var htm2 = 
	       '<lable>问题描述：'
		   +'<select class="form-control"><option>请选择</option><option>什么是这架飞机最大的自动化问题</option><option>在提高安全水平方面所关心的问题和建议</option><option>其它</option></select></lable>'
           +'<textarea  style="width:100%" rows="4"></textarea>';
$(htm2).appendTo(table2);
}
$.u.define('com.sms.losa.crewInterview', null, {
	init:function(){
		
	},
	afterrender:function(){
		scrollMenu('scrollnext');
		this.save=this.qid("saveCrew");
		this.submit=this.qid("submitCrew");
		this.submit.click(function(){
			submitLosa(id);
		});
		var url=location.href;
		var id="";
		var crewId="";
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
				
				 $.each( response.jsonActivity.jsonCrew[0], function(key, value){
					 if(value==null){
						 //value="";
						 response.jsonActivity.jsonCrew[0][key] = ""
					 }
					 });
				
				way.set("jsonCrew",response.jsonActivity.jsonCrew[0]);
				crewId=response.jsonActivity.jsonCrew[0].id;
			 });	
		}else{	
		}
		addLink(id);
        this.save.click(function(){
			way.set("jsonCrew.activityId",id);
			if(crewId!=""){
				way.set("jsonCrew.id",crewId);
			}
			$.each( way.get("jsonCrew"), function(key, value){
				 if(value==""){
					 value="";
					 way.get("jsonCrew")[key] =null;
				 }
				 });
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
		        		  ),
		        		  "jsonCrew":JSON.stringify(
		        			way.get("jsonCrew")	
		        		  ),
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
com.sms.losa.crewInterview.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
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
                                   "../../../uui/way.js"
                                  ];
 com.sms.losa.crewInterview.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]