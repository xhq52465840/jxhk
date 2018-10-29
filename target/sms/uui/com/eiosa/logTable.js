//@ sourceURL=com.eiosa.logTable
$.u.load("com.audit.filter.filter");
$.u.define('com.eiosa.logTable', null, {
	 init: function () {
		 this.staticfilter = [
		          			{
		          				/**"config": {
		          					"method":"queryIsarpNo"
		          				},
		          				"propid": "level2no",
		          				"propname": "Isarp",
		          				"propvalue": [],
		          				"propshow":"",
		          				"type":"static",
		          				"propplugin": "com.audit.filter.selectProp"
		          			},{
		          				"config": {
		          					method:"getSectionName"
		          				},
		          				"propid": "sectionName",
		          				"propname": "Section",
		          				"propvalue": [],
		          				"propshow":"",
		          				"type":"static",
		          				"propplugin": "com.audit.filter.selectProp"
		          			},{*/
		          				"config": {
		          					"method":""
		          				},
		          				"propid": "created",
		          				"propname": "sendDate",
		          				"propvalue": [],
		          				"propshow":"",
		          				"type":"static",
		          				"propplugin": "com.audit.filter.dateProp"
		          			},{
		          				"config": {
		          					"method":"queryLogReceiver"
		          				},
		          				"propid": "receiver",
		          				"propname": "receiver",
		          				"propvalue": [],
		          				"propshow":"",
		          				"type":"static",
		          				"propplugin": "com.audit.filter.selectProp"
		          			},{
		          				"config": {
		          					"method":"queryLogSender"
		          				},
		          				"propid": "sender",
		          				"propname": "sender",
		          				"propvalue": [],
		          				"propshow":"",
		          				"type":"static",
		          				"propplugin": "com.audit.filter.selectProp"
		          			}
		              	];
		              	this.searchTerms = [];
	    },
	afterrender: function () {
	    	
	    },
	 _queryTable:function(id){
		 this.isFirst=true;
		   
		    var module = new com.audit.filter.filter($("div[umid='logfilter']", this.$), this.staticfilter);
	        module.$.find("button[qid='btn-more-1']").remove();
	        module.$.find("button[qid='btn-search-1']").remove();
			module.override({
				loadData:this.proxy(function(param){
					this.searchTerms =  {};
					this.searchTerms["isarp"] = [id];
					param && $.each(param, this.proxy(function(idx, obj){
						if(obj.propvalue.length){
							debugger;
							switch(obj.propid){
							  
								case "created":
									if(obj.propvalue[0].startDate){
										date=[];
										date.push(obj.propvalue[0].startDate);
										this.searchTerms["startSendDate"] = date;
									}
									if(obj.propvalue[0].endDate){
										date=[];
										date.push(obj.propvalue[0].endDate);
										this.searchTerms["endSendDate"] = date;
									}
									break;
								
								default:
									xyz=[]
									obj.propvalue.length>0 && $.each(obj.propvalue,this.proxy(function(idx,item){
										xyz.push(item.name)	
									}))
									this.searchTerms[obj.propid] = xyz;
									break;
							}
						}
					}));
					if(this.logTable){
						this.logTable.fnDraw();
					}else{
						this._createTable();
					}
	    		})
	    	});
			module._start();
	 },
	 _createTable : function(){
		 this.logTable=this.qid("logTable").dataTable({
		 searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: true,
            pageLength:10,
            "sDom":"tip",
	        "columns": [
	                   // { "title": "section", "mData":"sectionName","sWidth": 80 },
	                    //{ "title": "ISARP", "mData":"levelNo", "sWidth": 80},
	                   // { "title": "ISARP Name", "mData":"levelName", "sWidth": 80},
	                    { "title": "sender", "mData":"sender", "sWidth": 80 },
	                    { "title": "receiver", "mData":"receiver", "sWidth": 80 },
	                    { "title": "sendDate", "mData":"created", "sWidth": 80 },
	                    { "title": "detail", "mData":"detail", "sWidth": 80 }
	                   
	                ],
	        "oLanguage": {
	                    "sSearch": "搜索:",
	                    "sLengthMenu": "每页显示 _MENU_ 条记录",
	                    "sZeroRecords": "抱歉未找到记录",
	                    "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
	                    "sInfoEmpty": "没有数据",
	                    "sInfoFiltered": "(从总共_MAX_条记录中过滤)",
	                    "sProcessing": "检索中...",
	                    "oPaginate": {
	                        "sFirst": "<<",
	                        "sPrevious": "上一页",
	                        "sNext": "下一页",
	                        "sLast": ">>"
	                    }
	                },
	      "aoColumnDefs":[
	                      {
	                    	/**"aTargets": 3,
	   		                "mRender": function (data, type, full) {
	   		                if(data!=null){
	   		                	
	   		                	var shortTitle = data;
		   		                 var title = html2Escape(data);
		   		                 var html = "";
		   		            	 if(shortTitle.length >30){
		   		            		  shortTitle = shortTitle.substr(0,30)+"...";
		   		                 };
		   		              html="<div class='detail' data-toggle='tooltip' data-placement='right' data-html='true'  title="+title+">"+shortTitle+"...<div>";
	   		                	return html;  
	   		                }else{
	   		                	return data;
	   		                }
	   		                 
	   		              
	   		                }*/
	                          }
	                      ],
	      "fnServerParams":this.proxy(function (aoData) {
	    	         if(this.isFirst){
          		     sort = "created";
          		     dir = "desc";
          		     this.isFirst=false;
          	          }else{
          		     sort = aoData.columns[aoData.order[0].column].data;
              	     sort == "operator" ? (sort = "operatorId") : sort;
              	     dir =  aoData.order[0].dir || "desc";
          	        }
          	        delete aoData.columns
          	        delete aoData.order
	        	            	 //将上面的参数合并到aoData中
	      $.extend(aoData,{
	        	              "tokenid":$.cookie("tokenid"),
	        	              "method":"queryLog",
	                 		  "rule": JSON.stringify(this.searchTerms),
	                 		  "columns": JSON.stringify( [{"data":"created"}] ),
	                           "order": JSON.stringify( [{"column":0, "dir": "desc"}] ),
	                           "sort":JSON.stringify({"key":sort,"value":dir}),
	                 		  "search": ""
	        	              },true);
	        	         }), 
	      "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
		                	
		           $.ajax({
		                     url: $.u.config.constant.smsqueryserver,
		                        type:"post",
		                        dataType: "json",
		                        cache: false,
		                        data: aoData
		                    }).done(this.proxy(function (data) {
		                    	if (data.success) {
		                         fnCallBack(data.data.LogList);
		                         $(".detail").tooltip({
		                        	 html:true,
		                        	 track: true,
		                     		showURL: false,
		                     		delay: 1000,
		                     		top: 5,
		                     		left: 5});
		                         
		                     }else{
		                    	 alert("没有查找到数据");
		                     }
		                    })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {
		                    }))
		                }),
	       /** "aoColumnDefs": [{
	        	 "aTargets": 4,
                 "mRender": function (data, type, full) {
                	 var a = "", html = "";
	            	   if(data.length > 10){
	                	 a = data.substr(0,10);
	                	 html = '<span title="'+data+'">' + a + '...</span>';
	                     }else{
	                     html = '<span ">' + data + '</span>';
	                     }
	            	  
	            	   return html;
	                  } 
	        },{
	        	"aTargets": 5,
                "mRender": function (data, type, full) {
               	 	return data || "";
                	 
                }
	        }]*/
	       
		});
	    }
},{
	usehtm : true,
	usei18n : false
});
com.eiosa.logTable.widgetjs = ["../../uui/widget/jqdatatable/js/jquery.dataTables.js",
                               "../../uui/widget/spin/spin.js", 
                               "../../uui/widget/jqurl/jqurl.js",
                               "../../uui/widget/jqblockui/jquery.blockUI.js",
                               "../../uui/widget/ajax/layoutajax.js",
                               "../../uui/tooltip/myTooltip.js",
                               "../../uui/util/htmlutil.js"];
com.eiosa.logTable.widgetcss = [{ path: '../../uui/widget/jqdatatable/css/jquery.dataTables.css' },
                                { path: '../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' },
                                {path:'../audit/filter/filter.css'}];