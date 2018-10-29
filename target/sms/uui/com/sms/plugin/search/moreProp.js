//@ sourceURL=com.sms.plugin.search.moreProp
$.u.define("com.sms.plugin.search.moreProp", "com.sms.plugin.search.baseprop",{
    // filter段
    filter_html: function () { 
    	return  '<div class="filter-layer">'
			    + '<form style="min-width:250px;" role="form" id="'+this._id+'-form">'
		    	+	'<div class="form-body">'
			    + 		'<div style="padding: 10px; ">'	
			    + 			'<div class="form-group has-feedback" style="margin-bottom:0;">'
				+ 				'<label class="control-label sr-only" for="inputSuccess5">Hidden label</label>'
				+ 				'<input type="text" placeholder="搜索"  class="form-control input-sm" id="'+this._id+'-search"/>'			
				+ 				'<span class="glyphicon glyphicon-search form-control-feedback removeads" style="cursor:pointer;"></span>'			
				+ 			'</div>'		
			    + 		'</div>'
				+ 		'<div style="max-height: 270px;overflow-y: auto;overflow-x: hidden;clear: both;" id="'+this._id+'-project-div">'
				+		'</div>'
				+ 	'</div>'
				+ '</form>'
				+ '</div>';
    },
    filter_render: function (setting,toolsel) { 
        this.filtersel = toolsel;
        this.setting = setting;
        this.checked = this.setting.checked;//被选中的
        this.remove = $.map(this.setting.remove,function(v,k){
        	return v.propid;
        });//一定存在的
        this.projectDiv = $("#"+this._id+"-project-div",this.filtersel); 
        this.searchAds=$("#"+this._id+"-search",this.filtersel).focus();
        
        this.searchAds.off("keyup").on("keyup",this.proxy(function(e){
        	this.projectDiv.empty();
        	var data = $.trim(this.searchAds.val());
        	if(data){
        		$(".removeads", this.filtersel).removeClass("glyphicon-search").addClass("glyphicon-remove-sign");
        		this._setData(data);
		    }else{
		    	$(".removeads", this.filtersel).removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
		    	this._setAllData();
		    }  
    	}));
        
        this.filtersel.find(".removeads").unbind("click").click(this.proxy(function(e){
        	var $this = $(e.currentTarget);
        	$this.removeClass("glyphicon-remove-sign").addClass("glyphicon-search");
        	this.searchAds.val("").focus();
        	this._setAllData();
        }));
        
        this.projectDiv.off("mouseenter","li.list-group-item:not(li.no)").on("mouseenter","li.list-group-item:not(li.no)",this.proxy(function(e){
        	this.projectDiv.find("li.list-group-item").css({"background-color":"#fff"});
        	$(e.currentTarget).css({"background-color":"#ebf2f9"});
        }));
        
        this.projectDiv.off("click","input:checkbox").on("click","input:checkbox",this.proxy(function(e){
        	$("input[type='checkbox'][value="+$(e.currentTarget).attr("value")+"]",this.filtersel).prop("checked",  $(e.currentTarget).prop("checked"));
        	try{
        		var sendData = JSON.parse($(e.currentTarget).attr("data-data"));
            	if($(e.currentTarget).prop("checked")){
            		this.filter_check(sendData);
            	}else{
            		this.filter_uncheck(sendData);
            	} 
            	this.destroy();
        	}catch(e){
        		
        	}
        }));
        this._filter_bind_commonobj();
        this._loadData();
    },
    _loadData:function(){
    	this.projectDiv.empty();
    	this.dataArr = []; //去掉选中的所有的字段集合
    	this.dataArr2 = [];//去掉选中的最新字段的集合
    	this.idArr = [];//选中的id的集合
    	this.moreData = [];//数据库里面的所有的字段
    	this.recentData = [];//数据库里面的最新的字段
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"getSearchFields"
        	}
        },this.filtersel).done(this.proxy(function (data) {
        	if (data.success) {
            	data.data.units =[];
            	data.data.recentUnits = [];
        		$.each(data.data.aaData,this.proxy(function(idx,item){
        			if($.inArray(item.key,this.remove)<0){
        				data.data.units[idx] = {
                				"propid":item.key,
                				"propname": item.name,
                				"propvalue": [],
                				"propshow":"",
                				"propplugin": item.searcher,
                				"config": item.config
                			}
        			}
        		})); 
        		this.moreData = data.data.units;
        		this.recentData = data.data.recentUnits;
        		var $li = null, $div = null, $label = null,$ul = null;
        		$.each(this.checked,this.proxy(function(k,v){
        			this.idArr.push(v.propid);
            	}));
        		if(this.checked.length>0){
        			$ul = $('<ul class="list-group" id="'+this._id+'-project-ul" style="border-bottom:1px solid #ccc;">').appendTo(this.projectDiv);
        			if(this.checked.length > 1){
        				$('<li class="list-group-item no" ><a class="clear-all" href="#" id="'+this._id+'-btn_clear">清除选择的内容</a></li>').appendTo($ul);	
        			}
        			$.each(this.checked,this.proxy(function(key,value){
                		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
                		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
                		$label = $('<label style="width:100%;"></label>').appendTo($div);
    					if($.inArray(value.propid,this.idArr)>-1){
    						$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" checked="checked" />').appendTo($label);
    					}else{
    						$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\'  value="'+value.propid+'" />').appendTo($label);
    					}
                		$('<span>'+value.propname+'</span>').appendTo($label);
        			}));
        		}
        		
        		//最新字段
        		//将已选中的字段去掉
                data.data.recentUnits && $.each(data.data.recentUnits,this.proxy(function(idx,item){
            		if($.inArray(item.propid,this.idArr) < 0 ){
            			this.dataArr2.push(item);
            		}
                }));
                if(this.dataArr2.length>0){
                	$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-recentUnits" style="border-bottom:1px solid #ccc;">').appendTo(this.projectDiv);
                    $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">最新字段</h5>').appendTo($ul);
                    $.each(this.dataArr2,this.proxy(function(key,value){
                		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
                		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
                		$label = $('<label style="width:100%;"></label>').appendTo($div);
    					$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" />').appendTo($label);
    					$('<span>'+value.propname+'</span>').appendTo($label);
                    }));
                }
              //所有字段
              //将已选中的字段去掉
                data.data.units && $.each(data.data.units,this.proxy(function(idx,item){
                	if(item){
                		if($.inArray(item.propid,this.idArr) < 0 ){
                			this.dataArr.push(item);
                		}
                	}
                }));
                if(this.dataArr.length > 0 ){
                	$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-units">').appendTo(this.projectDiv);
                    $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">所有字段</h5>').appendTo($ul);
                    $.each(this.dataArr,this.proxy(function(key,value){
                		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
                		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
                		$label = $('<label style="width:100%;"></label>').appendTo($div);
    					$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" />').appendTo($label);
    					$('<span>'+value.propname+'</span>').appendTo($label);
                    }));
                }
                this.btnClear = null;
                this.btnClear=$("#"+this._id+"-btn_clear",this.filtersel);
                this.btnClear.off("click").on("click",this.proxy(function(e){
            		e.preventDefault();
            		$.each($("input[type='checkbox']:checked",this.filtersel),this.proxy(function(idx,item){
        				var sendData =$(item).attr("data-data");
        				try{
        					sendData = JSON.parse(sendData); 
        					this.filter_uncheck(sendData);
        					$("input[type='checkbox']",this.filtersel).prop("checked", false);
                    		$(e.currentTarget).parent().remove();
                    		this.idArr = [];
        				}catch(e){
        					$.u.alert.error(e);
        				}
            		}));
            		
            	}));
                //第一个变色
                this.projectDiv.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }))
    },
    _setData:function(data){
    	var $li = null, $div = null, $label = null,$ul = null;
    	this.data = [];
    	if(this.checked.length>0){
    		this.data = this.checked.concat(this.dataArr);	
    	}else{
    		this.data = this.dataArr;
    	}
    	$ul = $('<ul class="list-group"></ul>').appendTo(this.projectDiv);
    	$.each(this.data,this.proxy(function(idx,item){
    		if(item.propname.indexOf(data)>-1){
	    		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
				$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
				$label = $('<label style="width:100%;"></label>').appendTo($div);
				if($.inArray(item.propid,this.idArr)>-1){
					$('<input type="checkbox" data-data = \''+JSON.stringify(item)+'\' value="'+item.propid+'" checked="checked" />').appendTo($label);
				}else{
					$('<input type="checkbox" data-data = \''+JSON.stringify(item)+'\' value="'+item.propid+'" />').appendTo($label);
				}
				$('<span>'+item.propname+'</span>').appendTo($label);
    		}
    	}))
		if($('ul',this.projectDiv).children().length==0){
			$('<li  class="list-group-item" style="font-style: italic;">没有匹配的</li>').appendTo(this.projectDiv);
		}
    	//第一个变色
        this.projectDiv.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
    },
    _setAllData:function(){
    	var $li = null, $div = null, $label = null,$ul = null;
    	if(this.checked.length>0){
			$ul = $('<ul class="list-group" id="'+this._id+'-project-ul" style="border-bottom:1px solid #ccc;">').appendTo(this.projectDiv);
			if(this.checked.length > 1){
				$('<li class="list-group-item no" ><a class="clear-all" href="#" id="'+this._id+'-btn_clear">清除选择的内容</a></li>').appendTo($ul);	
			}
			$.each(this.checked,this.proxy(function(key,value){
        		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
        		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
        		$label = $('<label style="width:100%;"></label>').appendTo($div);
				if($.inArray(value.propid,this.idArr)>-1){
					$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" checked="checked" />').appendTo($label);
				}else{
					$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" />').appendTo($label);
				}
        		$('<span>'+value.propname+'</span>').appendTo($label);
			}));
	        if(this.dataArr2.length>0){
	        	$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-recentUnits" style="border-bottom:1px solid #ccc;">').appendTo(this.projectDiv);
	            $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">最新字段</h5>').appendTo($ul);
	            $.each(this.dataArr2,this.proxy(function(key,value){
	        		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
	        		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
	        		$label = $('<label style="width:100%;"></label>').appendTo($div);
					$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" />').appendTo($label);
					$('<span>'+value.propname+'</span>').appendTo($label);
	            }));
	        }
	        if(this.dataArr.length > 0 ){
	        	$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-units">').appendTo(this.projectDiv);
	            $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">所有字段</h5>').appendTo($ul);
	            $.each(this.dataArr,this.proxy(function(key,value){
	        		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
	        		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
	        		$label = $('<label style="width:100%;"></label>').appendTo($div);
					$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\'  value="'+value.propid+'" />').appendTo($label);
					$('<span>'+value.propname+'</span>').appendTo($label);
	            }));
	        }
		}else{
	        if(this.recentData.length>0){
	        	$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-recentUnits" style="border-bottom:1px solid #ccc;">').appendTo(this.projectDiv);
	            $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">最新字段</h5>').appendTo($ul);
	            $.each(this.recentData, this.proxy(function(key, value){
	        		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
	        		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
	        		$label = $('<label style="width:100%;"></label>').appendTo($div);
					$('<input type="checkbox" data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" />').appendTo($label);
					$('<span>'+value.propname+'</span>').appendTo($label);
	            }));
	        }
	        if(this.moreData.length > 0 ){
	        	$ul = $('<ul class="list-group" id="'+this._id+'-project-ul-units">').appendTo(this.projectDiv);
	            $('<h5 style="font-weight: bold;padding: 3px;padding: 0 0 0 10px;">所有字段</h5>').appendTo($ul);
	            $.each(this.moreData,this.proxy(function(key,value){
	            	if(value){
		        		$li = $('<li class="list-group-item" ></li>').appendTo($ul);
		        		$div = $('<div class="checkbox" style="margin: 0;"></div>').appendTo($li);
		        		$label = $('<label style="width:100%;"></label>').appendTo($div);
						$('<input type="checkbox"  data-data = \''+JSON.stringify(value)+'\' value="'+value.propid+'" />').appendTo($label);
						$('<span>'+value.propname+'</span>').appendTo($label);
	            	}
	            }));
	        }
		}

      //第一个变色
        this.projectDiv.find("li.list-group-item:not(li.no)").eq(0).css({"background-color":"#ebf2f9"});
        this.btnClear = null;
        this.btnClear=$("#"+this._id+"-btn_clear",this.filtersel);
        this.btnClear.off("click").on("click",this.proxy(function(e){
        	e.preventDefault();
    		$.each($("input[type='checkbox']:checked",this.filtersel),this.proxy(function(idx,item){
				var sendData =$(item).attr("data-data");
				try{
					sendData = JSON.parse(sendData); 
					this.filter_uncheck(sendData);
					$("input[type='checkbox']",this.filtersel).prop("checked", false);
            		$(e.currentTarget).parent().remove();
            		this.idArr = [];
				}catch(e){
					$.u.alert.error(e);
				}
    		}));
    		$("input[type='checkbox']",this.filtersel).prop("checked", false);
    		$(e.currentTarget).parent().remove();
    		this.idArr = [];
    	}));
    },
    filter_getdata: function () {
    	
    },
    filter_setdata:function(){
    	
    },
    filter_check:function(data){

    },
    filter_uncheck:function(data){
    	
    },
    destroy:function(){
    	if(this.filtersel){
    		this.filtersel.remove();	
    	}
    	this.afterDestroy && this.afterDestroy();
    	this._super();
    }
}, { usehtm: false, usei18n: false });
