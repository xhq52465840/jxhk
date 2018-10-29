var scrollMenu= function(id){//debugger;
setInterval(function(){
	   var posX,posY;  
	    if (window.innerHeight) {  
	        posX = window.pageXOffset;  
	        posY = window.pageYOffset;  
	    }  
	    else if (document.documentElement && document.documentElement.scrollTop) {  
	        posX = document.documentElement.scrollLeft;  
	        posY = document.documentElement.scrollTop;  
	    }  
	    else if (document.body) {  
	        posX = document.body.scrollLeft;  
	        posY = document.body.scrollTop;  
	    }  
	    this.scrollnext=document.getElementById(id);
	    if(id=="newCreate"){
	    	this.scrollnext.style.top=(posY+300)+"px";  
		    this.scrollnext.style.left=(posX+20)+"px";
	       }else{
	    	 this.scrollnext.style.top=(posY+0)+"px";  
	   	    this.scrollnext.style.left=(posX+30)+"px";
	       }
	    
	   
   }, 100); 

};
//添加链接
var addLink=function( data){
	  document.getElementById('homePage').href="../../main.html";
	  document.getElementById('basicUrl').href="../obserview/obserview.html?id="+data;
	  document.getElementById('departUrl').href="../departure/departure.html?id="+data;
	  document.getElementById('takeOffUrl').href="../takeOff/takeOff.html?id="+data;
	  document.getElementById('cruiseUrl').href="../cruise/cruise.html?id="+data;
	  document.getElementById('techWsUrl').href="../techWorkSheet/techWorkSheet.html?id="+data;
	  document.getElementById('launchUrl').href="../launch/launch.html?id="+data; 
	  document.getElementById('wholeFlUrl').href="../wholeFlight/wholeFlight.html?id="+data;
	  document.getElementById('threatUrl').href="../threatWork/threatWork.html?id="+data;
	  document.getElementById('errorUrl').href="../errorWork/errorWork.html?id="+data;
	  document.getElementById('crewUrl').href="../crewInterview/crewInterview.html?id="+data;
	  document.getElementById('appendix').href="../appendix/appendix.html?id="+data;
};
//添加根节点
function addRoot(data,index,returnData){
	   $(document).ready(function() {
		   var obj=document.getElementById(index);
		   for(var j=0;j<data.length;j++){
			     if(data[j].parentNode==null){
			    	 obj.options.add(new Option(data[j].name,data[j].number));
			     }
				 
			}
			if(returnData==null){
				$("#"+index).val("");
			}else{
				$("#"+index).val(returnData);
			}
	   });
	 	
		
};
//添加节点
function addNode(frontValue,data,defaultValue,index){
	   $(document).ready(function() {
		   var obj=document.getElementById(index);
		   for(var m=0;m<data.length;m++){
				 if(frontValue==data[m].number){
					   for(var k=0;k<data.length;k++){
						   if(data[k].parentNode==data[m].id){
							   obj.options.add(new Option(data[k].number+"_"+data[k].name,data[k].number));
						   }
					   }
				   }
			   }
			   if(defaultValue!=null){
				   $("#"+index).val(defaultValue);
			   }else{
				   $("#"+index).val("");
			   }
		   
	   }) 
};
//转换为'2015-09-01 00:00:00'
function formAllDate(date){
	var tempStrs = date.split(" ");
	var year=tempStrs[2];
	if(tempStrs[1].length==3){
		var day=tempStrs[1].substr(0, 2); 
	}else if(tempStrs[1].length==2){
		var day=0+tempStrs[1].substr(0, 1);
	}

	var times=tempStrs[3].split(":");;
	var time="";
	var mon="";
	if(tempStrs[4]=="AM"){
		time=tempStrs[3];
	}else{
		times[0]=parseInt(times[0])+12;
		time=times[0]+":"+times[1]+":"+times[2];
	}
	if(tempStrs[0]=='Jan'){
		mon=01;
	}else if(tempStrs[0]=='Feb'){
		mon=02;
	}else if(tempStrs[0]=='Mar'){
		mon=03;
	}else if(tempStrs[0]=='Apr'){
		mon=04;
	}else if(tempStrs[0]=='May'){
		mon=05;
	}else if(tempStrs[0]=='Jun'){
		mon=06;
	}else if(tempStrs[0]=='Jul'){
		mon=07;
	}else if(tempStrs[0]=='Aug'){
		mon=08;
	}else if(tempStrs[0]=='Sep'){
		mon=09;
	}else if(tempStrs[0]=='Oct'){
		mon=10;
	}else if(tempStrs[0]=='Nov'){
		mon=11;
	}else if(tempStrs[0]=='Dec'){
		mon=12;
	}
	return year+"-"+mon+"-"+day+" "+time;
}
//转换为"2015-09-01"
function formDate(date){
	var tempStrs = date.split(" ");
	var year=tempStrs[2];
	if(tempStrs[1].length==3){
		var day=tempStrs[1].substr(0, 2); 
	}else if(tempStrs[1].length==2){
		var day=0+tempStrs[1].substr(0, 1);
	}
	
	var mon="";
	
	if(tempStrs[0]=='Jan'){
		mon=01;
	}else if(tempStrs[0]=='Feb'){
		mon=02;
	}else if(tempStrs[0]=='Mar'){
		mon=03;
	}else if(tempStrs[0]=='Apr'){
		mon=04;
	}else if(tempStrs[0]=='May'){
		mon=05;
	}else if(tempStrs[0]=='Jun'){
		mon=06;
	}else if(tempStrs[0]=='Jul'){
		mon=07;
	}else if(tempStrs[0]=='Aug'){
		mon=08;
	}else if(tempStrs[0]=='Sep'){
		mon=09;
	}else if(tempStrs[0]=='Oct'){
		mon=10;
	}else if(tempStrs[0]=='Nov'){
		mon=11;
	}else if(tempStrs[0]=='Dec'){
		mon=12;
	}
	return year+"-"+mon+"-"+day;
}

//提交
var submitLosa=function(id){
	$.ajax({
		 url: $.u.config.constant.smsmodifyserver,
        type:"post",
        dataType: "json",
        cache: false,
        data: {
       	 "tokenid":$.cookie("tokenid"),
       	  "method":"submitLosa",
       	  "id":id
        }
        
	}).done(function(response){
		if(response.Code=="success"){
			$.u.alert.success("提交成功");
		}else{
			$.u.alert.error("提交失败");
		}
	})
};
var showSwitch=function(id,stateValue){
	
	if(stateValue=="on"){
		$("#"+id).bootstrapSwitch('toggleState');       
		$("#"+id).bootstrapSwitch('setState', true);
	}else{
		$("#"+id).bootstrapSwitch('toggleState');       
		$("#"+id).bootstrapSwitch('setState', false);
	}
};
var setSwitch=function(id){
	var value="";
	
	if($("#"+id).bootstrapSwitch('state')==true){
		value="on";
		
	}else{
		value=null;
	}
	return value;
};
function freshAction(list,id){
	if(list!=null){
		var attach="";
		for(var k=0;k<list.length;k++){
			 var url="http://"+window.location.host+"/sms/query.do?"
				 + "nologin=Y&method=downloadFiles&fileId="+list[k].id;
			   attach+="<a href='"+url+"'>"+list[k].attachShowName+"</a><br>" ;
		 }
		 document.getElementById("attach"+id).innerHTML=attach;
	}
	
}