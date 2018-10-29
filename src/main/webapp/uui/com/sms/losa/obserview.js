
$.u.define('com.sms.losa.obserview', null, {
	init:function(){
		
	},
	afterrender:function(){//debugger;
		$("#flightDate").datepicker({"dateFormat":"yy-mm-dd", constrainInput:true});
		scrollMenu('scrollnext');
		//alert(document.getElementById("isThreat").value);
       this.save=this.qid("saveObserve");
       this.submit=this.qid("submitObserve");
		var url=location.href;
		var id=""
	    //var detail="";
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
				// alert(JSON.stringify(response.jsonActivity.jsonObserve[0]));
				 
				 //jsonObserve=response.jsonActivity.jsonObserve;
				// alert(jsonObserve);
				//way.set("jsonObserve", { "activityNumber": "","identifyNumber": "1232"});
				 $.each( response.jsonActivity.jsonObserve[0], function(key, value){
					 if(value==null){
						 //value="";
						 response.jsonActivity.jsonObserve[0][key] = ""
					 }
					 });
				
				way.set("jsonObserve",response.jsonActivity.jsonObserve[0]);
				var str=response.jsonActivity.jsonObserve[0].flightDate;
				//alert(str);
				way.set("jsonObserve.flightDate",formDate(str));
				//alert(formDate(str));
				if(response.jsonActivity.jsonThreat.length>0){
					way.set("jsonObserve.isExtThreat","on");
					way.set("jsonObserve.threatNumber",response.jsonActivity.jsonThreat.length);
				}
				if(response.jsonActivity.jsonError.length>0){
					way.set("jsonObserve.isExtError","on");
					way.set("jsonObserve.errorNumber",response.jsonActivity.jsonError.length);
				}
				
				//alert(way.get("jsonObserve").aircraftType);
				//$("#aircraftType").val(way.get("jsonObserve").aircraftType);
				//$("#aircraftCaptain").val(way.get("jsonObserve").aircraftCaptain);
				//$("#aircraftCopilot").val(way.get("jsonObserve").aircraftCopilot);
				//$("#isDelay").val(way.get("jsonObserve").isDelay);
				//$("#companyCaptain1").val(way.get("jsonObserve").companyCaptain1);
				//$("#companyCaptain2").val(way.get("jsonObserve").companyCaptain2);
				//$("#companyCopilot1").val(way.get("jsonObserve").companyCopilot1);
				//$("#companyCopilot2").val(way.get("jsonObserve").companyCopilot2);
				//$("#firstLegOfCrew").val(way.get("jsonObserve").firstLegOfCrew);
				//way.set("jsonObserve.aircraftType","A320");
				//alert( way.get("jsonObserve").identifyNumber);
				
			 });
			
			
			/**detail=url.split('?')[1].split('=')[2];
			if( url.split('?')[1].split('=').length==3){
				document.getElementById("observiewerId").readOnly=true;
				document.getElementById("observiewNum").readOnly=true;
				document.getElementById("saveBasic").disabled=true;

			}*/
			
		}else{
			
			//$('#link').click(function(){
				//alert("请先填写基础信息的必填项并保存，才可进入下一页");
			//});
			
		}
		addLink(id);
		//保存数据
		this.save.click(function(){
			//alert($("#flightDate").val());
			var data=$("#flightDate").val();
			 $.each( way.get("jsonObserve"), function(key, value){
				 if(value==""){
					 value="";
					 way.get("jsonObserve")[key] =null;
				 }
				 });
			 way.set("jsonObserve.flightDate",$("#flightDate").val()+" 00:00:00");
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
				$.each( way.get("jsonObserve"), function(key, value){
					 if(value==null){
						 //value="";
						 way.get("jsonObserve")[key] ="";
					 }
					 });
				 way.set("jsonObserve.flightDate",data);
				 
				if(response.Code=="success"){
					$.u.alert.success("保存成功");
				}else{
					$.u.alert.error("保存失败");
				}
			})
			
			
		});
		this.submit.click(function(){
			submitLosa(id);
		})
		
		/**if(id!=""){//说明是修改数据，先查询数据库填充数据
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
				if(response.data.identity_number!=null){
					$('#observiewerId').val(response.data.identity_number);
				}
				if(response.data.activity_number!=null){
					$('#observiewNum').val(response.data.activity_number);
				}
				
				
			})
			
		}
		$("#saveBasic").click(function(){
			if($('#observiewerId').val()==""){
				alert("请输入观察员的身份证明（编号）");
			}else if($('#observiewNum').val()==""){
				alert("请输入观察活动编号");
			}else{
				var postData;
				if(id==""){//说明是第一次创建数据
					postData={
						"tokenid":$.cookie("tokenid"),
						"method":"stdcomponent.add",
						"dataobject":"losa",
						
	            		 "obj":JSON.stringify({
	            			 identity_number: $('#observiewerId').val(),
	            			 activity_number: $('#observiewNum').val()
	                    })
					}
					
				}else{
					//修改数据
					postData={
							"tokenid":$.cookie("tokenid"),
							"method":"stdcomponent.update",
							"dataobject":"losa",
							"dataobjectid":id,
		            		 "obj":JSON.stringify({
		            			 identity_number: $('#observiewerId').val(),
		            			 activity_number: $('#observiewNum').val()
		                    })
						}
				}
				$.ajax({
					url:$.u.config.constant.smsmodifyserver,
					type: "post",
	                dataType: "json",
					data:postData
				}).done(function(response){
					var dialogOptions = {
							buttons: [{
	                        text: "确定",
	                        "style":"font-size:25px",
	  						"class": "aui-button-link",
	  						 click: function () {
	  							 if(response.data!=null){
	  								window.location.href = "departure.html?id=" + response.data; 
	  							 }else{
	  								window.location.href = "departure.html?id=" + id; 
	  							 }
	  							
	  							
	  							$('#saveDialog').dialog("close");
	  							$('#observiewerId').val("");$('#observiewNum').val("");
							    }
	                        },
	                         {
	                         text: "取消",
	                         "style":"font-size:25px",
	              			"class": "aui-button-link",
	              			click: function () {
	              			$('#saveDialog').dialog("close");
	              			
	              			$('#observiewerId').val("");$('#observiewNum').val("");
	          			}
	                        }
					]
					};
					this.saveDialog = $('#saveDialog').dialog({
						width:450,
						modal: true,
				        draggable: false,
				        resizable: false,
				        autoOpen: false,
				        position:[300,250],
					});
					this.saveDialog.dialog("option",dialogOptions).dialog("open");
				
				});
				
			}
			
		});*/
		
		
	},
	
	
}, { usehtm: true, usei18n: true });
com.sms.losa.obserview.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
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
 com.sms.losa.obserview.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   //{path:"../../../uui/widget/bootstrap/css/bootstrap.css"}
                                   ];