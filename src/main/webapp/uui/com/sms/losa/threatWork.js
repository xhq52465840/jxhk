var height=270;
var i=1;
var id="";
var baseInfo="";
function addmore(){
	/**var table=document.getElementById('text');
	 i=i+1;
	
	
    var htm =
            '<tr>'
	         + '<td>' + '<input type="text" class="form-control" value="T'+i+'")'+'/>' + '</td>' 
			 + '<td>' + '<input type="text" class="form-control" id="threatDesc")'+'/>' + '</td>'
			 + '<td>' + ' <select class="form-control"> ' + '<option>请选择</option>' + '<option>离场/进场威胁</option>'
			          + '<option>航空器的威胁</option>' + '<option>运行威胁</option>' + '<option>客舱中的威胁</option>'
					  + '<option>ATC带来的威胁</option>' + '<option>机组支持方面的威胁</option>' + '<option>其他威胁</option>'
					  + '</select>' + '</td>'
			 + '<td>' + '<select class="form-control"> <option>请选择</option></select>' + '</td>'
			 + '<td>' + '<select class="form-control">' + '<option>请选择</option>' + '<option>离场前/滑行</option>' + '<option>起飞/爬升</option>'
			          + '<option>巡航</option>' + '<option>下降/进近/着陆</option>' + '<option>滑回</option></select>'+'</td>'
			 + '<td>' + ' <select class="form-control"> <option>请选择</option> <option>是</option> <option>否</option></select>' + '</td>'
			 + '<td>' + '<input type="text" class="form-control"/>' + '</td>'
	         + '</tr>'
	    $(htm).appendTo(table);*/
	var data=way.get("jsonThreat");
		var threat={"threatCode":"T"+(data.length+1),"isDealValidity":1,"activityId":id};
		data.push(threat)
		way.set("jsonThreat",data);
		height=height+40;
		document.getElementById('spans').style.height=height+"px";
	//动态添加基础数据  
		for(var j=0;j<data.length;j++){ 
			if(data[j].id==null){
				 addRoot(baseInfo,"threatType"+j,null);
			}else{
				 addRoot(baseInfo,"threatType"+j,data[j].threatType);
				 addNode(data[j].threatType,baseInfo,data[j].threatNumber,'threatNumber'+j);
			}
				
 }
		 
			 
			 
};
function onclik(value,id){
    $("#"+'threatNumber'+id).empty();
    addNode(value,baseInfo,null,'threatNumber'+id);
	/** var html;
	 if(value==1){
      html='<option>请选择</option>';
	 }
	 
	 if(value==2){
      html='<option>请选择</option>'
	       +'<option>1.恶劣天气/颠簸/仪表气象条件</option>'
		   +'<option>2.地形</option>'
		   +'<option>3.交通——空中或地面拥挤，交通报警和TCAS系统警告</option>'
		   +'<option>4.机场——修建,标识，地面条件</option>'
		   +'<option>5.TCAS RA/TA</option>';
	 }
	 if(value==3){
      html='<option>请选择</option>'
	       +'<option>20. 航空器故障</option>'
		   +'<option>21. 自动设备有问题或反常</option>'
		   +'<option>22. 通信问题——无线电通讯，ATIS，ACARS</option>';
	 }
	 if(value==4){
      html='<option>请选择</option>'
	       +'<option>30. 运行时间的压力——延误，运行时间压力，驾驶员或航空器晚到</option>'
		   +'<option>31. 复飞</option>'
		   +'<option>32. 改航备降</option>'
		   +'<option>33. 不熟悉的机场</option>'
		   +'<option>34. 其他不正常的运行事件——使用MTOW起飞，中断起飞等</option>';
	 }
	 if(value==5){
      html='<option>请选择</option>'
	       +'<option>40. 客舱事件/分散注意力/干扰</option>'
		   +'<option>41. 乘务员差错</option>'
		   +'<option>42. 安全员差错</option>';
	 }
	 if(value==6){
      html='<option>请选择</option>'
	       +'<option>50. ATC的指令——苛求的放行指令，偏晚的改变指令</option>'
		   +'<option>51. ATC的差错</option>'
		   +'<option>52. ATC语言沟通问题</option>'
		   +'<option>53. ATC使用非标准的术语</option>'
		   +'<option>54. ATC无线电拥堵</option>'
		   +'<option>55. 呼号类似</option>';
	 }
	 if(value==7){
      html='<option>请选择</option>'
	       +'<option>80. 维修事件</option>'
		   +'<option>81. 维修差错</option>'
		   +'<option>82. 地面服务事件</option>'
		   +'<option>83. 地面人员差错</option>'
		   +'<option>84. 签派/文件工作事件</option>'
		   +'<option>85. 签派/文件工作差错</option>'
		   +'<option>86. 机组排班事件</option>'
		   +'<option>87. 手册/航图 不完整/不准确</option>';
	 }
	 if(value==8){
      html='<option>请选择</option>'
		   +'<option>87. 手册/航图 不完整/不准确</option>';
	 }
	 $(html).appendTo(select2);*/
}
$.u.define('com.sms.losa.threatWork', null, {
	init:function(){
		
	},
	afterrender:function(){
		scrollMenu('scrollnext');
		this.save=this.qid("saveThreat");
		this.submit=this.qid("submitThreat");
		this.submit.click(function(){
			submitLosa(id);
		})
		var url=location.href;
		$.ajax({
			 url: $.u.config.constant.smsqueryserver,
            type:"post",
           dataType: "json",
           cache: false,
           data: {
      		"tokenid":$.cookie("tokenid"),
      		"method":"queryBaseInfo",
           }
	        
		 }).done(function(response){
			 baseInfo=response.jsonBaseInfo.threatBaseInfo;
		 });
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
				  if(response.jsonActivity.jsonThreat!=null){
					 way.set("jsonThreat",response.jsonActivity.jsonThreat);
					 for(var i=0;i<response.jsonActivity.jsonThreat.length;i++){
						  addRoot(baseInfo,"threatType"+i,response.jsonActivity.jsonThreat[i].threatType);
						  addNode(response.jsonActivity.jsonThreat[i].threatType,baseInfo,response.jsonActivity.jsonThreat[i].threatNumber,'threatNumber'+i);
						  
					  }
					 
				 }else{
					 var data=[{"threatCode":"T1","isDealValidity":1,"activityId":id}];
					 
					 way.set("jsonThreat",data);
					 addRoot(baseInfo,"threatType0",null);
					
				 }
						 
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
			        		  ),
			        		  "jsonThreat":JSON.stringify(
			        			way.get("jsonThreat")	  
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
com.sms.losa.threatWork.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
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
 com.sms.losa.threatWork.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]