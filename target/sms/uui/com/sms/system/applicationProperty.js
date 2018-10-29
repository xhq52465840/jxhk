//@ sourceURL=com.sms.system.applicationProperty
$.u.define('com.sms.system.applicationProperty', null, {
    init: function (options) {
        this._options = options || {};
        this.testUrl = '^((https|http|ftp|rtsp|mms)?://)' 
        	+ '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
        	+ '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
        	+ '|' // 允许IP和DOMAIN（域名） 
        	+ '([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
        	+ '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
        	+ '[a-z]{2,6})' // first level domain- .com or .museum 
        	+ '(:[0-9]{1,4})?' // 端口- :80 
        	+ '((/?)|' // a slash isn't required if there is no file name 
        	+ '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$'; 
        this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.system.applicationProperty.i18n;
    	this.dataTable = this.qid("application-table");
    	this.dataName = this.qid("name");
    	this.dataUrl = this.qid("url");
    	this.dataStatus = this.qid("status");
    	this.dataUsergroup = this.qid("usergroup");
    	
    	this.select2Option = {
        		width:280,
        		multiple:true,
        		ajax:{
        			url:$.u.config.constant.smsqueryserver,
        			dataType: "json",
        			type: "post",
    	            data: this.proxy(function(term, page){
    	            	return {
    	            		tokenid:$.cookie("tokenid"),
    	    				method:"stdcomponent.getbysearch",
    	    				dataobject:"userGroup",
    	    				start: (page - 1) * this._select2PageLength,
    	    				length: this._select2PageLength,
    	    				rule:JSON.stringify([[{key:"name",op:"like","value":term}]])
    	    			};
    	            }),
    		        results:this.proxy(function(response,page,query){ 
    		        	if(response.success){
    		        		return {results:response.data.aaData, more: (page * this._select2PageLength) < response.data.iTotalRecords };
    		        	}
    		        })
        		},
    	        formatResult:function(item){
    	        	return item.name;
    	        },
    	        formatSelection:function(item){
    	        	return item.name;
    	        }
        	};
    	this.dataUsergroup.select2(this.select2Option);
    	this.qid("add").on("click",this.proxy(function(e){
    		var name = this.dataName.val(),
    			url = this.dataUrl.val(),
    			usergroup = this.dataUsergroup.val();
    			status = "NO";
    			if(this.dataStatus.is(":checked")){
    				status = "YES";
    			}
    			var patt=new RegExp(this.testUrl);
    			if(name.trim() != "" && patt.test(url.toLowerCase())){
    				$.u.ajax({
    					url:$.u.config.constant.smsmodifyserver,
    					dataType:"json",
    					type:"post",
    					async:false,
    					data:{
    						tokenid:$.cookie("tokenid"),
    						method:"stdcomponent.add",
    						dataobject:"navigation",
    						"obj":JSON.stringify({"name":name,"url":url,"status":status,"usergroup":usergroup})
    					}
    				}).done(this.proxy(function(response){
    					if(response.success){
    						var check = "",usergroupname = "";
    						if(status == "YES"){
    							check = "checked='checked'";
    						}
							$.each(this.dataUsergroup.select2("data"),this.proxy(function(idx,term){
								usergroupname = usergroupname + term.name + ",";
							}));
							usergroupname = usergroupname.substring(0, usergroupname.length-1);
    						this.dataTable.find("tbody").prepend("<tr>" +
    								"<td class='app-name'><input class='name hidden ' maxlength='50' value='"+name+"'/><span class='name' >"+name+"</span></td>" +
    								"<td class='app-url'><input class='url hidden text-danger' maxlength='255' value='"+url+"'/><span class='url' >"+url+"</span></td>" +
    								"<td class='app-status'><input class='status' type='checkbox' defautvalue='"+status+"' "+check+"/></td>" +
    								"<td class='app-usergroup'><input class='usergroup' type='text' defaultvalue='"+usergroupname+"' dataid='"+this.dataUsergroup.val()+"' value='"+usergroupname+"'/></td>" +
    								"<td class='handle'><button class='app-update hidden btn btn-default' dataid='"+response.data+"'>更新</button>" +
    													"<button class='app-delete  btn btn-link' dataid='"+response.data+"'>删除</button>" +
    													"<button class='app-cancel hidden btn btn-link' dataid='"+response.data+"'>取消</button></td>" +
    								"</tr>");
    						this.dataName.val("");
    						this.dataUrl.val("");
    						this.dataStatus.prop("checked",false);
    						this.dataUsergroup.select2("destroy");
    						this.dataUsergroup.val("");
    						this.dataUsergroup.select2(this.select2Option);
    					}
    				})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
    		 	   		
    		         }));
    			}else{
    				if(name.trim() == "" && patt.test(url)){
    					$.u.alert.error("名称不能为空！", 1000 * 3);
    				}else if(name.trim() != "" && !patt.test(url)){
    					$.u.alert.error("url格式不符合！", 1000 * 3);
    				}else{
    					$.u.alert.error("名称不能为空，url格式不符合！", 1000 * 3);
    				};
    			};
    	}));
    	
    	$.u.ajax({
			url:$.u.config.constant.smsqueryserver,
			dataType:"json",
			type:"post",
			data:{
				tokenid:$.cookie("tokenid"),
				method:"stdcomponent.getbysearch",
				dataobject:"navigation",
				"columns":JSON.stringify([{"data":"created"}]),
        		"order":JSON.stringify([{"column":0,"dir":"desc"}])
			}
    	}).done(this.proxy(function(response){
    		if(response.success){
    			$.each(response.data.aaData,this.proxy(function(idx,term){
    				var check ="";
					if(term.status == "YES"){
						check = "checked='checked'";
					}
    				this.dataTable.find("tbody").append("<tr>" +
    						"<td class='app-name'><input class='name hidden' maxlength='50'value='"+term.name+"'/><span class='name' >"+term.name+"</span></td>" +
							"<td class='app-url'><input class='url hidden text-danger' maxlength='255' value='"+term.url+"'/><span class='url' >"+term.url+"</span></td>" +
							"<td class='app-status'><input class='status' type='checkbox' defaultvalue='"+term.status+"' "+check+"/></td>" +
							"<td class='app-usergroup'><input class='usergroup' type='text' defaultvalue='"+term.usergroupname+"' dataid='"+term.usergroup+"' value='"+term.usergroupname+"'/></td>" +
							"<td class='handle'><button class='app-update hidden btn btn-default' dataid='"+term.id+"'>更新</button>" +
												"<button class='app-delete  btn btn-link' dataid='"+term.id+"'>删除</button>" +
												"<button class='app-cancel hidden btn btn-link' dataid='"+term.id+"'>取消</button></td>" +
							"</tr>");
    			}));
    		}
    	})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
 	   		
        }));
    	
    	this.dataTable.find("tbody").on("click",this.proxy(function(e){
    		if($(e.target).find("input").length > 0){
    			var $sender = $(e.target);
    			var usergroup = [];
    			var usergroupid = $sender.parent().find("input.usergroup").attr("dataid").split(","),
    				usergroupname = $sender.parent().find("input.usergroup").attr("value").split(",");
    			if(usergroupid[0] != "null" && usergroupid[0].length > 0){
    				for(var i = 0, j = 0; i < usergroupid.length, j < usergroupname.length; i++,j++ ){
    					usergroup.push({"id":usergroupid[i],"name":usergroupname[j]});
    				}
    			}
    			
    			var $lastTr = this.dataTable.find("tr.focused");
    			$lastTr.find("input.name").addClass("hidden");
    			$lastTr.find("input.url").addClass("hidden");
    			$lastTr.find("span").removeClass("hidden");
    			$lastTr.find("button.app-update").addClass("hidden");
    			$lastTr.find("button.app-cancel").addClass("hidden");
    			var lastData = $lastTr.find("input.usergroup").select2("data");
    			var tempData = "";
    			$.each(lastData,this.proxy(function(idx,item){
    				tempData = tempData + item.name + ",";
    			}));
    			$lastTr.find("input.usergroup").select2("destroy");
    			$lastTr.find("input.usergroup").val(tempData.substring(0,tempData.length-1));
    			$lastTr.removeClass("focused");
    			
    			
    			$sender.parent().addClass("focused");
    			$sender.parent().find("input").removeClass("hidden");
    			$sender.parent().find("span").addClass("hidden");
    			$sender.parent().find("button").removeClass("hidden");
    			$sender.parent().find("input.usergroup").select2(this.select2Option);
    			if(usergroup.length != 0){
    				$sender.parent().find("input.usergroup").select2("data",usergroup);
    			}
    			
    		}
    		if($(e.target).hasClass("usergroup")){
    			var $sender = $(e.target).parent();
    			var usergroup = [];
    			var usergroupid = $sender.parent().find("input.usergroup").attr("dataid").split(","),
    				usergroupname = $sender.parent().find("input.usergroup").attr("value").split(",");
    			if(usergroupid[0] != "null" && usergroupid[0].length > 0){
    				for(var i = 0, j = 0; i < usergroupid.length, j < usergroupname.length; i++,j++ ){
    					usergroup.push({"id":usergroupid[i],"name":usergroupname[j]});
    				}
    			}
    			
    			var $lastTr = this.dataTable.find("tr.focused");
    			$lastTr.find("input.name").addClass("hidden");
    			$lastTr.find("input.url").addClass("hidden");
    			$lastTr.find("span").removeClass("hidden");
    			$lastTr.find("button.app-update").addClass("hidden");
    			$lastTr.find("button.app-cancel").addClass("hidden");
    			var lastData = $lastTr.find("input.usergroup").select2("data");
    			var tempData = "";
    			$.each(lastData,this.proxy(function(idx,item){
    				tempData = tempData + item.name + ",";
    			}));
    			$lastTr.find("input.usergroup").select2("destroy");
    			$lastTr.find("input.usergroup").val(tempData.substring(0,tempData.length-1));
    			$lastTr.removeClass("focused");
    			
    			$sender.parent().addClass("focused");
    			$sender.parent().find("input").removeClass("hidden");
    			$sender.parent().find("span").addClass("hidden");
    			$sender.parent().find("button").removeClass("hidden");
    			$sender.parent().find("input.usergroup").select2(this.select2Option);
    			if(usergroup.length != 0){
    				$sender.parent().find("input.usergroup").select2("data",usergroup);
    			}
    		}
    		if($(e.target).hasClass("app-update")){
    			var $sender = $(e.target).closest("tr");
    			var name = $sender.find("input.name").val(),
    			url = $sender.find("input.url").val(),
    			usergroup = $sender.find("input.usergroup").val();
    			status = "NO";
    			if($sender.find("input:checkbox").is(":checked")){
    				status = "YES";
    			}
    			var patt=new RegExp(this.testUrl);
    			if(name.trim() != "" && patt.test(url.toLowerCase())){
    				$.u.ajax({
    					url:$.u.config.constant.smsmodifyserver,
    					dataType:"json",
    					type:"post",
    					async:false,
    					data:{
    						tokenid:$.cookie("tokenid"),
    						method:"stdcomponent.update",
    						dataobject:"navigation",
    						"dataobjectid":$(e.target).attr("dataid"),
    						"obj":JSON.stringify({"name":name,"url":url,"status":status,"usergroup":usergroup})
    					}
    				}).done(this.proxy(function(response){
    					if(response.success){
//    						var check = "checked",usergroupname = "";
//    						if(status == "NO"){
//    							check = "";
//    						}
//    						$.each($sender.find("input.usergroup").select2("data"),this.proxy(function(idx,term){
//    							usergroupname = usergroupname + term.name + ",";
//    						}));
//    						usergroupname = usergroupname.substring(0, usergroupname.length-1);
//    						
//    						$sender.find("input.name").val(name).addClass("hidden");
//    						$sender.find("span.name").val(name).removeClass("hidden");
//    						$sender.find("input.url").val(url).addClass("hidden");
//    						$sender.find("span.url").val(url).removeClass("hidden");
//    						$sender.find("input:checkbox").attr("checked",check);
//    						$sender.find("input.usergroup").select2("destroy");
//    						$sender.find("input.usergroup").val(usergroupname);
//    						$sender.find("button.app-update").addClass("hidden");
//    						$sender.find("button.app-cancel").addClass("hidden");
    						this.dataTable.find("tbody").empty();
    						$.u.ajax({
    							url:$.u.config.constant.smsqueryserver,
    							dataType:"json",
    							type:"post",
    							data:{
    								tokenid:$.cookie("tokenid"),
    								method:"stdcomponent.getbysearch",
    								dataobject:"navigation",
    								"columns":JSON.stringify([{"data":"created"}]),
    				        		"order":JSON.stringify([{"column":0,"dir":"desc"}])
    							}
    				    	}).done(this.proxy(function(response){
    				    		if(response.success){
    				    			$.each(response.data.aaData,this.proxy(function(idx,term){
    				    				var check ="";
    									if(term.status == "YES"){
    										check = "checked='checked'";
    									}
    				    				this.dataTable.find("tbody").append("<tr>" +
    				    						"<td class='app-name'><input class='name hidden text-danger' maxlength='50' value='"+term.name+"'/><span class='name' >"+term.name+"</span></td>" +
    											"<td class='app-url'><input class='url hidden text-danger' maxlength='255' value='"+term.url+"'/><span class='url' >"+term.url+"</span></td>" +
    											"<td class='app-status'><input class='status' type='checkbox' defaultvalue='"+term.status+"' "+check+"/></td>" +
    											"<td class='app-usergroup'><input class='usergroup' type='text' defaultvalue='"+term.usergroupname+"' dataid='"+term.usergroup+"' value='"+term.usergroupname+"'/></td>" +
    											"<td class='handle'><button class='app-update hidden btn btn-default' dataid='"+term.id+"'>更新</button>" +
    																"<button class='app-delete  btn btn-link' dataid='"+term.id+"'>删除</button>" +
    																"<button class='app-cancel hidden btn btn-link' dataid='"+term.id+"'>取消</button></td>" +
    											"</tr>");
    				    			}));
    				    		}
    				    	})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
    				 	   		
    				        }));
    					}
    				})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
    		 	   		
    		         }));
    			}else{
    				if(name.trim() == "" && patt.test(url)){
    					$.u.alert.error("名称不能为空！", 1000 * 3);
    				}else if(name.trim() != "" && !patt.test(url)){
    					$.u.alert.error("url格式不符合！", 1000 * 3);
    				}else{
    					$.u.alert.error("名称不能为空，url格式不符合！", 1000 * 3);
    				};
    			};
    	}
    		if($(e.target).hasClass("app-delete")){
    			var $sender = $(e.target);
    			this.qid("desc").text($sender.closest("tr").find("input.name").val());
    			this.deletedialog = this.qid("delete-dialog").dialog({
    				title:"删除:"+$sender.closest("tr").find("input.name").val(),
    	    		autoOpen:false,
    	    		closeOnEscape:false,
    	    		resizable:false,
    	    		modal:true,
//    				width:"600px",
//    				height:"500px",
    				buttons:[{
    					text:"确认",
    					"class":"btn btn-default",
    					click:this.proxy(function(){
    						$.u.ajax({
    							 url: $.u.config.constant.smsmodifyserver,
    		                     dataType: "json",
    		                     cache: false,
    		                     data: {
    		        			 	"tokenid":$.cookie("tokenid"),
    		        			 	"method":"stdcomponent.delete",
    		        			 	"dataobject":"navigation",
    		        			 	dataobjectids:JSON.stringify([parseInt($sender.attr("dataid"))])
    			        		 }
    	    				}).done(this.proxy(function(response){
	    						if(response.success){
	    							$sender.closest("tr").remove();
	    							this.deletedialog.dialog("close");
	    						}
    					}));
    					})
    				},
    				{
    					text:"取消",
    					"class":"but but-link",
    					click:this.proxy(function(){
    						this.deletedialog.dialog("close");
    					})
    				}
    				]
    			});
    			this.deletedialog.dialog("open");
    		}
    		
    		if($(e.target).hasClass("app-cancel")){
    			var $sender = $(e.target).closest("tr");
    			$(e.target).addClass("hidden");
    			$sender.find("button.app-update").addClass("hidden");
    			$sender.find("input.name").addClass("hidden");
    			$sender.find("span.name").removeClass("hidden");
    			$sender.find("input.url").addClass("hidden");
    			$sender.find("span.url").removeClass("hidden");
    			$sender.find("input.usergroup").select2("destroy");
    			$sender.find("input.usergroup").val($sender.find("input.usergroup").attr("defaultvalue"));
    			var tempstatus = $sender.find("input:checkbox").attr("defaultvalue");
    			if(tempstatus == "YES"){
    				$sender.find("input:checkbox").prop("checked",true);
    			}else{
    				$sender.find("input:checkbox").prop("checked",false);
    			}
    			
    			
    		}
    		
    	}));
    	
    	
	},
	/**
	 * super
	 */	
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.system.applicationProperty.widgetjs = ['../../../uui/widget/select2/js/select2.min.js',
                                               "../../../uui/widget/spin/spin.js",
                                               "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                               "../../../uui/widget/ajax/layoutajax.js"];
com.sms.system.applicationProperty.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },{id:"",path:"../../../uui/widget/select2/css/select2.css"},{id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];