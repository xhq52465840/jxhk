/**
* hashcode
* MD，不能给object增加额外的方法。jq-layout会遍历，然后jq-layout就挂了。
* 
*/
//Object.prototype.hashcode = function () {
//    var h = 0;
//    var s = this.toString();
//    for (var i = 0; i < s.length; i++) {
//        h = 31 * h + s.charCodeAt(i);
//    }
//    return h;
//}
var _compObj = function(obj1,obj2){  //比较两个对象是否相等，不包含原形上的属性计较
	    if((obj1&&typeof obj1==="object")&&((obj2&&typeof obj2==="object"))){   
	    	var count1 = _propertyLength(obj1);
	    	var count2 = _propertyLength(obj2);
	    	if(count1==count2){ 
	    		for(var ob in obj1){
	    			if(obj1.hasOwnProperty(ob)&&obj2.hasOwnProperty(ob)){
	    				if(obj1[ob] == null || obj2[ob] == null){
	    					if(obj1[ob] !== obj2[ob]){
	    						return false;
	    					}	
	    				}else if(obj1[ob].constructor==Array&&obj2[ob].constructor==Array){  //如果属性是数组
	    					if(!_compArray(obj1[ob],obj2[ob])){
	    						return false;
	    					}
	    				}else if(typeof obj1[ob]==="object"&&typeof obj2[ob]==="object"){  //属性是对象
	    					if(!_compObj(obj1[ob],obj2[ob])){  
	    						return false;
	    					}
	    				}else if(isNaN(obj1[ob]) || isNaN(obj2[ob])){
	    					if(!(isNaN(obj1[ob]) && isNaN(obj2[ob]))){
	    						return false;
	    					}
	    					
	    				}else{
	    					if(obj1[ob]!=obj2[ob]){
	    						return false;
	    					}
	    				}
	    			}else{
	    				return false;
	    			}
	    		}
	    	}else{
	    		return false;
	    	}	 
	    }else{
	    	if(obj1 != obj2){
	    		return false;
	    	}
	    }
	    return true;
	};
	
var _compArray = function(array1,array2){
		if((array1&&typeof array1 ==="object"&&array1.constructor===Array)
				&&(array2&&typeof array2 ==="object"&&array2.constructor===Array)){
		      if(array1.length==array2.length){
		    	  for(var i=0;i<array1.length;i++){
		    		  var ggg=_compObj(array1[i],array2[i]);
		    		  if(!ggg){
		    			  return false;
		    		  }
		    	  }
		      }else{
		    	  return false;
		      }
		   }else{
			   throw new Error("argunment is  error ;");
		   }
		return true;
	};
var _propertyLength = function(obj){	//获得对象上的属性个数，不包含对象原形上的属性
	    var count=0;
	    if(obj&&typeof obj==="object"){
	    	for(var ooo in obj){
	    		if(obj.hasOwnProperty(ooo)) {
	    			count++;
	    		}
	    	}
	    	return count;
	    }else {
	    	throw new Error("argunment can not be null;");
	    }
	};
	
var _clone = function(myObj){   //复制对象 
	if(typeof(myObj) != 'object') return myObj; 
	if(myObj == null) return myObj; 
	var myNewObj = new Object(); 
//	debugger;
	for(var i in myObj){
		myNewObj[i] = _clone(myObj[i]);
	}
	return myNewObj; 
};

var _cloneArray = function(myArray){
	var myNewArray = [];
	for(var i=0;i<myArray.length;i++){
		myNewArray[i] = _clone(myArray[i]);
	}
	return myNewArray;
};