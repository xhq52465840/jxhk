//@ sourceURL=com.sms.plugin.severity.severity
$.u.define('com.sms.plugin.severity.severity', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.plugin.severity.severity.i18n;
    	//添加严重等级组件
    	this.severityDialog = this.qid("severityDialog").dialog({
    		title :"添加严重等级",
    		autoOpen: false,
    		modal: true,
    		width : 500,
    		buttons :[{
    			text:"添加",
    			click:this.proxy(function(){
    				var $name = $("#name").val().trim();
    				if($name == ""){
    					$("#name").parent().append("<p style='color:#a94442'>名称不能为空！</p>");
    					return false;
    				}
    				var $comment = $("#comment").val();
    				$.ajax({
    					url: $.u.config.constant.smsmodifyserver,
    					type: "post",
    					dataType: "json",
    					"data": {
    						"tokenid": $.cookie("tokenid"),
    						"method": "addSeverity",
    						"dataobject": "severity",
    						"obj": JSON.stringify({ "name": $name, "comment": $comment })
    					}
    				}).done(this.proxy(function (result) {
    					if (result.success) {
    						this.qid("severity-table").append("<tr><td>"+$name+"</td><td><ul style='padding-left:15px;'></ul></td><td>"+$comment+"</td>" +
    								"<td><button class='btn btn-link edit' dataid='"+result.data+"'>编辑</button>" +
    										"<button class='btn btn-link delete' dataid='"+result.data+"'>删除</button>" +
    										"<button class='btn btn-link add' dataid='"+result.data+"'>添加等级</button>"+
    										"</td>" +
    								"</tr>");
    						this.severityDialog.dialog("close");
    						
    					}
    				})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
    						
    					}));
    			})},
    			{	text:"取消",
    				"class":"aui-button-link",
					click:this.proxy(function(){
    				this.severityDialog.dialog("close");
    				this.severityDialog.find("p").remove();
        			})}],
    			
    		
    	});
    	this.qid("add-severity").click(this.proxy(function(){
    		this.severityDialog.dialog("open");
    	}));
    	//添加等级组件
    	this.gradeDialog = this.qid("gradeDialog").dialog({
    		title :"添加等级",
    		autoOpen: false,
    		modal: true,
    		width : 500,
    		buttons:[{
    			text:"添加",
    			click:this.proxy(function(){
    				var $gradename = $("#grade_name").val();
    				var $score = $("#score").val();
    				if($gradename == "" || $score == ""){
    					$("#grade_name").parent().append("<p style='color:#a94442'>名称不能为空！</p>");
    					$("#score").parent().append("<p style='color:#a94442'> 分值不能为空！</p>");
    					return false;
    				}
    				$.ajax({
    					url: $.u.config.constant.smsmodifyserver,
    					type: "post",
    					dataType: "json",
    					"data": {
    						"tokenid": $.cookie("tokenid"),
    						"method": "addLevel",
    						"dataobject": "level",
    						"dataobjectid": $sender.attr("dataid"),
    						"obj": JSON.stringify({ "name": $gradename, "score": $score })
    					}
    				}).done(this.proxy(function (result) {
    					if (result.success) {
    						this.gradeDialog.dialog("close");
    							$sender.parent().siblings().find("ul").append("<li><a class='level' href='javascript:' dataid='"+result.data+"'>"+$gradename+"("+$score+")</a><a class='remove' dataid='"+result.data+"' href='javascript:' style='float:right;font-size:10pt'>[删除]</a></li>");
    							$sender="";
    					}
    				})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
    						
    					}));
    			})},
    			{
    			text:"取消",
    			"class":"aui-button-link",
    			click:	this.proxy(function(){
    				this.gradeDialog.dialog("close");
    				this.gradeDialog.find("p").remove();
    			})
    		}]
    	});
    	var $sender="";
    	this.qid("severity-table").on("click","button.add",(this.proxy(function(e){
    		$sender = $(e.currentTarget);
    		this.gradeDialog.dialog("open");
    	})));
    	
    	//编辑
    	
    	this.editseverityDialog = this.qid("editseverityDialog").dialog({
    		title :"编辑严重等级",
    		autoOpen: false,
    		modal: true,
    		width : 500,
    		buttons:[{
    			text:"更新",
    			click:this.proxy(function(){
    				var $name = $("#edit-name").val().trim();
    				if($name == ""){
    					$("#edit-name").parent().append("<p style='color:#a94442'>名称不能为空！</p>");
    					return false;
    				}
    				var $comment = $("#edit-comment").val();
    				$.ajax({
    					url: $.u.config.constant.smsmodifyserver,
    					type: "post",
    					dataType: "json",
    					"data": {
    						"tokenid": $.cookie("tokenid"),
    						"method": "stdcomponent.update",
    						"dataobject": "severity",
    						"dataobjectid": $target.attr("dataid"),
    						"obj": JSON.stringify({ "name": $name, "comment": $comment })
    					}
    				}).done(this.proxy(function (result) {
    					if (result.success) {
    					var $tr = $target.closest("tr");
    		    		 	$tr.children().eq(0).text($name),
    		    		 	$tr.children().eq(2).text($comment);
    						this.editseverityDialog.dialog("close");
    						
    					}
    				})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
    						
    					}));
    			})},
    			{text:"取消",
    				"class":"aui-button-link",
    				click:this.proxy(function(){
    				this.editseverityDialog.dialog("close");
    				this.editseverityDialog.find("p").remove();
    			})
    			
    		}]
    	});
    	var $target="";
    	this.qid("severity-table").on("click","button.edit",(this.proxy(function(e){
    		$target = $(e.currentTarget);
    		var $tr = $target.closest("tr"),
    		 	$name = $tr.children().eq(0).text(),
    		 	$comment = $tr.children().eq(2).text();
    		$("#edit-name").val($name);
    		$("#edit-comment").val($comment);
    		this.editseverityDialog.dialog("open");
    	})));
    	//删除
    	this.qid("severity-table").on("click","button.delete",this.proxy(function(e){
    		var $sender = $(e.currentTarget);
		$.ajax({
			url: $.u.config.constant.smsmodifyserver,
            dataType: "json",
            cache: false,
            data: {
		 	"tokenid":$.cookie("tokenid"),
		 	"method":"stdcomponent.delete",
		 	"dataobject":"severity",
		 	"dataobjectids":JSON.stringify([parseInt($sender.attr("dataid"))]),
            }}).done(this.proxy(function(result){
   			 if(result.success){
   				 $sender.closest("tr").remove();
   			 }
   		 })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

   		 }));
    	}));
    	//编辑等级
    	this.editgradeDialog = this.qid("editgradeDialog").dialog({
    		title :"编辑等级",
    		autoOpen: false,
    		modal: true,
    		width : 500,
    		buttons:[{
    			text:"更新",
    			click:this.proxy(function(){
    				var $gradename = $("#edit_grade_name").val(),
    					$newscore = $("#edit_score").val();
    				if($gradename == "" || $newscore == ""){
    					$("#edit_grade_name").parent().append("<p style='color:#a94442'>名称不能为空！</p>");
    					$("#edit_score").parent().append("<p style='color:#a94442'> 分值不能为空！</p>");
    					return false;
    				}
    				$.ajax({
    					url: $.u.config.constant.smsmodifyserver,
    					type: "post",
    					dataType: "json",
    					"data": {
    						"tokenid": $.cookie("tokenid"),
    						"method": "stdcomponent.update",
    						"dataobject": "level",
    						"dataobjectid": $current.attr("dataid"),
    						"obj": JSON.stringify({ "name": $gradename, "score": $newscore })
    					}
    				}).done(this.proxy(function (result) {
    					if (result.success) {
    						$current.text($gradename+"("+$newscore+")"),
    						this.editgradeDialog.dialog("close");
    					}
    				})).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
    						
    					}));
    			})},
    			{text:"取消",
    				"class":"aui-button-link",
    				click:this.proxy(function(){
    				this.editgradeDialog.dialog("close");
    				this.editgradeDialog.find("p").remove();
    			})
    		}]
    	
    	});
    	var $current="";
    	this.qid("severity-table").on("click","a.level",(this.proxy(function(e){
    		$current = $(e.currentTarget);
    		var $li = $current.text(),
    		 	$text1 = $li.split("("),
    		 	$name = $text1[0],
    		 	$text2 = $text1[1],
    		 	$text3 = $text2.split(")"),
    		 	$score = $text3[0];
    		 $("#edit_grade_name").val($name);
    		 $("#edit_score").val($score);
    		this.editgradeDialog.dialog("open");
    	})));
    	//删除等级
    	this.qid("severity-table").on("click","a.remove",this.proxy(function(e){
    		var $sender = $(e.currentTarget);
    		$.ajax({
    			url: $.u.config.constant.smsmodifyserver,
                dataType: "json",
                cache: false,
                data: {
    		 	"tokenid":$.cookie("tokenid"),
    		 	"method":"stdcomponent.delete",
    		 	"dataobject":"level",
    		 	"dataobjectids":JSON.stringify([parseInt($sender.attr("dataid"))]),
                }}).done(this.proxy(function(result){
       			 if(result.success){
       				 $sender.parent().remove();
       			 }
       		 })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

       		 }));
        	}));
    	//过滤
    	this.qid("butFilter").click(this.proxy(function(){
    		this.dataTable.draw();

    	}));
    	//清除过滤
    	this.qid("delFilter").click(this.proxy(function(){
    		this.qid("filtername").val("");
    		this.qid("filtercomment").val("");
    		this.dataTable.draw();

    	}));
    	this.dataTable = this.qid("severity-table").DataTable({
    		searching: false,
            serverSide: true,
            bProcessing:true,
            ordering:false,
             "columns": [
                         { "title": "名称" ,"mData":"name",orderable:true,"sWidth":300},
                         { "title": "等级" ,"mData":"level","sWidth":300},
                         { "title": "备注" ,"mData":"comment","sWidth":300},
                         { "title": "操作" ,"mData":"id","sWidth":300}
                     ],
        
             
             "oLanguage": { //语言
                 "sSearch": this.i18n.search,
                 "sLengthMenu": this.i18n.everPage+" _MENU_ "+this.i18n.record,
                 "sZeroRecords": this.i18n.message,
                 "sInfo": this.i18n.from+" _START_ "+this.i18n.to+" _END_ /"+this.i18n.all+" _TOTAL_ "+this.i18n.allData,
                 "sInfoEmpty": this.i18n.withoutData,
                 "sInfoFiltered": "("+this.i18n.fromAll+"_MAX_"+this.i18n.filterRecord+")",
                 "sProcessing": ""+this.i18n.searching+"...",
                 "oPaginate": {
                     "sFirst": "<<",
                     "sPrevious": this.i18n.back,
                     "sNext": this.i18n.next,
                     "sLast": ">>"
                 }
             },
             "fnServerParams": this.proxy(function (aoData) {
            	var rule=[];
             	if($.trim(this.qid("filtername").val())){
             		rule.push([{"key":"name","op":"like","value":this.qid("filtername").val()}]);
             	}
             	if($.trim(this.qid("filtercomment").val())){
             		rule.push([{"key":"comment","op":"like","value":this.qid("filtercomment").val()}]);
             	}
             	$.extend(aoData,{
             		"tokenid":$.cookie("tokenid"),
             		"method":"stdcomponent.getbysearch",
             		"dataobject":"severity",
             		"rule":JSON.stringify(rule),
             		"columns":JSON.stringify(aoData.columns),
             		"search":JSON.stringify(aoData.search)
             	},true);
             }),
             "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
             	$.u.ajax({
                     url: $.u.config.constant.smsqueryserver,
                     dataType: "json",
                     cache: false,
                     data: aoData
                 },this.qid("severity-table")).done(this.proxy(function (data) {
                     if (data.success) {
                         fnCallBack(data.data);
                     }
                 })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                 })).complete(this.proxy(function(){
                 }));
             }),
             "columnDefs": [
                  {
                      "targets": 0,
                      "render": function (data, type, full) {
                    	  return full.name;
                      }
                  },
                  {
                      "targets": 1,
                      "render": function (data, type, full) {
                    	  var htmls=["<ul style='padding-left:15px;'>"];
                    	  full.levelObj && $.each(full.levelObj,function(idx,item){
                  			htmls.push("<li><a class='level' href='javascript:' dataid='"+item.id+"'>"+item.name+"("+item.score+")</a><a class='remove' dataid='"+item.id+"' href='javascript:' style='float:right;font-size:10pt'>[删除]</a></li>");
                  		});
                  			htmls.push("</ul>");
                          return htmls.join("");
                    	  
                      }
                  },
                  {
                      "targets": 2,
                      "render": function (data, type, full) {
                    	  return full.comment;
                      }
                  },
                  {
                	  "targets": 3,
                	  "render": function (data, type, full) {
                		  return "<button class='btn btn-link edit' dataid='"+full.id+"' data='"+JSON.stringify(full)+"'>编辑</button>"+
		             	   		"<button class='btn btn-link delete' dataid='"+full.id+"' data='"+JSON.stringify(full)+"'>删除</button>"+
                		  		"<button class='btn btn-link add' dataid='"+full.id+"'  data='"+JSON.stringify(full)+"'>添加等级</button>";
                	  }
                  }
              ]
             
             
    	});
    	//分割线
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.plugin.severity.severity.widgetjs = ['../../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                             '../../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.plugin.severity.severity.widgetcss = [{ path: '../../../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                              { path: '../../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];
