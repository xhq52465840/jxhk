var height=450;
var baseInfo="";
function addmore(){
	var data=way.get("jsonError");
	var error={"errorCode":"E"+(data.length+1),"activityId":id};
	data.push(error)
	way.set("jsonError",data);
	height=height+80;
	document.getElementById('spans').style.height=height+"px";
	//添加数据
	for(var i=0;i<data.length;i++){
		if(data[i].id==null){//新增数据,只添加根节点数据
			 addRoot(baseInfo.causeFindPersonType,"thePersonCauseError"+i,null);
			 addRoot(baseInfo.causeFindPersonType,"thePersonFoundError"+i,null);
			 addRoot(baseInfo.causeFindPersonType,"thePersonFoundStatus"+i,null);
			 addRoot(baseInfo.threatBaseInfo,"isRelateThreatType"+i,null);
			 addRoot(baseInfo.unexcetStatus,"unexceptAircraftType"+i,null);
			 addRoot(baseInfo.errorBaseInfo,"errorType"+i,null);
			
		}else{//已有数据
			  addRoot(baseInfo.causeFindPersonType,"thePersonCauseError"+i,data[i].thePersonCauseError);
			  addRoot(baseInfo.causeFindPersonType,"thePersonFoundError"+i,data[i].thePersonFoundError);
			  addRoot(baseInfo.causeFindPersonType,"thePersonFoundStatus"+i,data[i].thePersonFoundStatus);
			  addRoot(baseInfo.threatBaseInfo,"isRelateThreatType"+i,data[i].isRelateThreatType);
			  addRoot(baseInfo.unexcetStatus,"unexceptAircraftType"+i,data[i].unexceptAircraftType);
			  addRoot(baseInfo.errorBaseInfo,"errorType"+i,data[i].errorType);
			  addNode(data[i].isRelateThreatType,baseInfo.threatBaseInfo,data[i].isRelateThreatNumber,'isRelateThreatNumber'+i);
			  addNode(data[i].unexceptAircraftType,baseInfo.unexcetStatus,data[i].unexceptAircraftNumber,'unexceptAircraftNumber'+i);
			  addNode(data[i].errorType,baseInfo.errorBaseInfo,data[i].errorTypeItem,'errorTypeItem'+i);
			  addNode(data[i].errorTypeItem,baseInfo.errorBaseInfo,data[i].errorNumber,'errorNumber'+i);
		}
	}
}

$.u.define('com.sms.losa.errorWork', null, {
	init:function(){
		
	},
	afterrender:function(){
		//目录滚动
		scrollMenu('scrollnext');
		this.save=this.qid("saveError");
		this.submit=this.qid("submitError");
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
			 baseInfo=response.jsonBaseInfo;
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
				  if(response.jsonActivity.jsonError!=null){
					 way.set("jsonError",response.jsonActivity.jsonError);
					  for(var i=0;i<response.jsonActivity.jsonError.length;i++){
						//加载基础数据
						  addRoot(baseInfo.causeFindPersonType,"thePersonCauseError"+i,response.jsonActivity.jsonError[i].thePersonCauseError);
						  addRoot(baseInfo.causeFindPersonType,"thePersonFoundError"+i,response.jsonActivity.jsonError[i].thePersonFoundError);
						  addRoot(baseInfo.causeFindPersonType,"thePersonFoundStatus"+i,response.jsonActivity.jsonError[i].thePersonFoundStatus);
						  addRoot(baseInfo.threatBaseInfo,"isRelateThreatType"+i,response.jsonActivity.jsonError[i].isRelateThreatType);
						  addRoot(baseInfo.unexcetStatus,"unexceptAircraftType"+i,response.jsonActivity.jsonError[i].unexceptAircraftType);
						  addRoot(baseInfo.errorBaseInfo,"errorType"+i,response.jsonActivity.jsonError[i].errorType);
						  addNode(response.jsonActivity.jsonError[i].isRelateThreatType,baseInfo.threatBaseInfo,response.jsonActivity.jsonError[i].isRelateThreatNumber,'isRelateThreatNumber'+i);
						  addNode(response.jsonActivity.jsonError[i].unexceptAircraftType,baseInfo.unexcetStatus,response.jsonActivity.jsonError[i].unexceptAircraftNumber,'unexceptAircraftNumber'+i);
						  addNode(response.jsonActivity.jsonError[i].errorType,baseInfo.errorBaseInfo,response.jsonActivity.jsonError[i].errorTypeItem,'errorTypeItem'+i);
						  addNode(response.jsonActivity.jsonError[i].errorTypeItem,baseInfo.errorBaseInfo,response.jsonActivity.jsonError[i].errorNumber,'errorNumber'+i);
						  
					  }
					 
				 }else{
					 var data=[{"errorCode":"E1","activityId":id}];
					 way.set("jsonError",data);
					//加载导致和发现差错的人员类型
					  addRoot(baseInfo.causeFindPersonType,"thePersonCauseError0",null);
					  addRoot(baseInfo.causeFindPersonType,"thePersonFoundError0",null);
					  addRoot(baseInfo.causeFindPersonType,"thePersonFoundStatus0",null);
					  addRoot(baseInfo.threatBaseInfo,"isRelateThreatType0",null);
					  addRoot(baseInfo.unexcetStatus,"unexceptAircraftType0",null);
					  addRoot(baseInfo.errorBaseInfo,"errorType0",null);
				 }
				  		 
			 });	
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
			        		  "jsonError":JSON.stringify(
			        			way.get("jsonError")	  
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
function onclik(value,id){
	//添加叶子节点
	$("#"+'isRelateThreatNumber'+id).empty();
	addNode(value,baseInfo.threatBaseInfo,null,'isRelateThreatNumber'+id);
	
};
function onclik1(value,id){
	$("#"+'unexceptAircraftNumber'+id).empty();
	addNode(value,baseInfo.unexcetStatus,null,'unexceptAircraftNumber'+id);
}
function onclik2(value,id){
	$("#"+'errorTypeItem'+id).empty();
	addNode(value,baseInfo.errorBaseInfo,null,'errorTypeItem'+id);
}
function onclik3(value,id){
	$("#"+'errorNumber'+id).empty();
	addNode(value,baseInfo.errorBaseInfo,null,'errorNumber'+id);
}



com.sms.losa.errorWork.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
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
 com.sms.losa.errorWork.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, 
                                   { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                   {path:"../../../uui/widget/select2/css/select2.css"},
                                   {path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                   {path:"../../../uui/widget/bootstrap/css/bootstrap.css"}]