//@ sourceURL=com.sms.safelib.safelibrary
$.u.load("com.sms.safelib.treeDialog");
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.load("com.sms.safelib.publishDialog");
$.u.load("com.sms.safelib.uploadDialog");
$.u.define('com.sms.safelib.safelibrary', null, {
    init: function (options) {
        this._options = options||null;
        this.editData='';
        this.sectionTemp = "<div class='column'><div class='portlet-header'>鼠标点击拖动</div><div class='row sec-row' itemid='#{itemid}'>"+
						   		"<div class='col-sm-12 sec-col-12'>" +
						   			"<div style='margin:7px;'>"+
						   				"<span class='headline-content' >#{name}</span>" +
						   				"<span style='float:right;'>"+						   					
						   					"<i class='fa fa-pencil fa-fw edititem' data-data='#{data-data}' style='cursor: pointer;#{display}'></i>"+
						   					"<span class='glyphicon glyphicon glyphicon-trash fl-minus removeitem' data-data='#{data-data}' style='cursor: pointer;#{display}'></span><br/>"+
						   				"</span>"+
						   				"<i class='para'>#{content}</i>"+
						   		"</div>"+
						   "</div></div>"; 
        this.sectionTemp = "<div class='part' data-itemid='#{itemid}'>" +
                            "<table class='uui-table'>" +
                                "<thead>" +
                                    "<tr class='infomodel-title' style='background-color: #EAEAEA;'>" +
                                        "<th>#{name}</th>" + 
                                        "<th class='#{operateClass}'><i class='fa fa-arrows fa-lg move' style='cursor: move;#{display}' title='" + "移动" + "' data-data='#{data-data}' ></i></th>" +
                                        "<th class='#{operateClass}'><i class='fa fa-pencil fa-lg edititem' title='" + "编辑" + "' data-data='#{data-data}' style='#{display}'></i></th>" +
                                        "<th class='#{operateClass}'><i class='fa fa-trash-o fa-lg removeitem' title='" + "删除" + "' data-data='#{data-data}' style='#{display}'></i></th>" +
                                    "</tr>" +
                                "</thead>" +
                                "<tbody>" +
                                    "<tr style='background-color: #fff;'>" +
                                        "<td colspan='4' style='padding: 15px;'>#{content}</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>"+
                           "</div>";
        this.fileTemp = "<tr itemid='#{itemid}' >"
        				+	"<td><img src='#{filetype}' style='margin-right: 10px;'/><span class='downloadfile' style='color:#428bca;text-decoration:underline;cursor:pointer;' fileid='#{fileid}'>#{filename}</span></td>"
        				+	"<td>#{filesize}</td>"
        				+	"<td>#{sourceType}</td>"
        				+	"<td>#{filetime}</td>"
        				+	"<td>#{fileuser}</td>"
        				+	"<td><span class='glyphicon glyphicon glyphicon-trash fl-minus del-file' data-data='#{data-data}' style='cursor: pointer;#{display}'></span></td>"
        				+"</tr>";
        this.managable = false;
        this.urlParam = $.urlParam();
        if(this.urlParam){
        	this.urlId=this.urlParam.id;
        }
    },
    beforechildrenrender: function () {
        $.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            type: "post",
            cache: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getSafetyLibraryPermissions"
            }
        }).done(this.proxy(function(response) {
            if (response.success) {
                this.managable = response.managable; // 管理权限
                if (this.managable) {
                    //this.qid("add_item").removeClass("hidden");
                    this.qid("add_file").removeClass("hidden");
                    this.qid("add_section").removeClass("hidden");
                }
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
    },
    afterrender: function (bodystr) {
    	this.rememberTitle = document.title;
        this.i18n = com.sms.safelib.safelibrary.i18n;
    	this.main = this.qid("main");
    	this.libTree = this.qid("libTree");
    	this.libContent = this.qid("libContent");
    	this.addItem = this.qid("add_item");
    	this.father = this.qid("father");
    	this.previous = this.qid("previous");
    	this.name = this.qid("name");
    	this.status = this.qid("status");
    	this.description = this.qid("description");
    	this.section = this.qid("section");
    	this.add_section = this.qid("add_section");
    	this.fileTable = this.qid("datatable"); 
    	this.add_file = this.qid("add_file");
    	this.btn = this.qid("btn_size");
    	this.btn_search = this.qid("btn_search");
    	this.input_search = this.qid("input_search");
    	this.dl = this.qid("dl");
    	this.fj = this.qid("fj");
        this.searchAds = this.qid("searchAds");
        this.btnFilter = this.qid("btnFilter");
    	this.treeDialog = new com.sms.safelib.treeDialog($("div[umid='treedialog']",this.$),null);
    	this.treeDialog.override({
    		refresh:this.proxy(function(data){
    			this._getTree({id: data,treeid:data});
    			this.libContent.show();
    		})
    	});
    	this.fileDialog = new com.sms.safelib.uploadDialog($("div[umid='fileDialog']",this.$),null);
    	this.fileDialog.override({
    		refresh:this.proxy(function(data){
    			this.searchAds.val("");
                this.dataTable.draw();
    		})
    	});
    	this._getTree({
    		treeid:$.urlParam().treeid,
            id: $.urlParam().id,
            name: $.urlParam().name
        });
    	this.add_section.on("click",this.proxy(this._add_section));
    	this.section.on("click","i.edititem",this.proxy(this._edit_section));
    	this.section.on("click","i.removeitem",this.proxy(this._del_section));
    	this.addItem.on("click",this.proxy(this._add));
    	this.btn.on("click","button.edit_item",this.proxy(this._edit));
    	this.btn.on("click","button.del_item",this.proxy(this._delete));
    	this.btn.on("click","button.publish_item",this.proxy(this._publish));
    	this.add_file.on("click",this.proxy(this._add_file));
    	this.fileTable.on("click","span.del-file",this.proxy(this._del_file));
    	this.fileTable.on("click","span.edit-file",this.proxy(this._edit_file));
    	this.fileTable.on("click","span.downloadfile",this.proxy(this._download_file));
    	this.btn_search.on("click",this.proxy(this.search));
    	this.dl.on("click",this.proxy(this._dl));
    	this.fj.on("click",this.proxy(this._fj));
        this.btnFilter.click(this.proxy(this.on_btnFilter_click));
        this.searchFile = this.qid("searchFile");
        this.searchFile.click(this.proxy(this.on_search_click));
        this.input_fileName = this.qid("fileName");
        this.input_fileName.keyup(this.proxy(function(e){
        	if(e.which == 13){
               this.on_search_click();
        	}
        }));

        if(this.urlId){
        	this._getChildData(this.urlId);
        }
    },
    on_search_click: function(){
    	var name = $.trim(this.qid("fileName").val());
    	if(name){
    		window.location.href = this.getabsurl( "ViewSearchFile.html?wd=" + escape(name) );
    	}
    },
    on_btnFilter_click: function(e){
        this.dataTable.draw();
    },
    _dl:function(e){
    	if($('span',$(e.currentTarget)).hasClass("glyphicon-chevron-down")){
    		$('span',$(e.currentTarget)).removeClass("glyphicon-chevron-down");
    		$('span',$(e.currentTarget)).addClass("glyphicon-chevron-right");
    		this.section.slideUp("fast");
    	}else{
    		$('span',$(e.currentTarget)).removeClass("glyphicon-chevron-right");
    		$('span',$(e.currentTarget)).addClass("glyphicon-chevron-down");
    		this.section.slideDown("fast");
    	}
    },
    _fj:function(e){
    	if($('span',$(e.currentTarget)).hasClass("glyphicon-chevron-down")){
    		$('span',$(e.currentTarget)).removeClass("glyphicon-chevron-down");
    		$('span',$(e.currentTarget)).addClass("glyphicon-chevron-right");
    		this.qid("filecontainer").slideUp("fast");
    	}else{
    		$('span',$(e.currentTarget)).removeClass("glyphicon-chevron-right");
    		$('span',$(e.currentTarget)).addClass("glyphicon-chevron-down");
    		this.qid("filecontainer").slideDown("fast");
    	}
    },
    pic:function(data){
    	switch(data){
    		case "rar":
    			return this.getabsurl("../../../img/rar.gif");
    		case "gif":
    		case "bmp":
    		case "png":
    		case "jpg":
    			return this.getabsurl("../../../img/gif.gif");
    		case "doc":
    		case "docx":
    			return this.getabsurl("../../../img/doc.gif");
    		case "ppt":
    		case "pptx":
    			return this.getabsurl("../../../img/ppt.gif");
    		case "pdf":
    			return this.getabsurl("../../../img/pdf.gif");
    		default:
    			return this.getabsurl("../../../img/file.gif");
    	}
    },
    search:function(e){
    	e.preventDefault();
    	var value = this.input_search.val();
    	if(!!value){
    		window.location.href = "ViewSearchList.html?wd=" + escape(value);
    	}else{
    		$.u.alert4$.error("请输入查询条件",$("<div/>").appendTo(this.qid("error-lib")),1000);
    	}
    },
    _getTree:function(param){
        this.libContent.hide();
        var selectNode = null;
        var setting = {
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onClick: this.proxy(function(e, treeId, treeNode, clickFlag) {
                    if (treeNode.parentTId == null) {
                        return false;
                    } else {
                        this._getChildData(treeNode.id);
                    }
                })
            }
        };
        this.tree = $.fn.zTree.init(this.libTree, setting, this._getTreeData());
        var nodes = this.tree.getNodes();
        $.each(nodes, this.proxy(function(idx, node) {
            if (node.parentTId == null) {
                this.tree.expandNode(node, true, false, true);
            }else if(this.urlId==node.parentTId){
            	this.tree.expandNode(node, true, true, true);
            }
            for(i in node.children){
            	if(this.urlId==node.children[i].id){
            		this.tree.expandNode(node.children[i], true, true, true);
            	}else{
            		for(m in node.children[i].children){
            			if(node.children[i].children[m].id==this.urlId){
            			this.tree.expandNode(node.children[i], true, true, true);
            			this.tree.selectNode(node.children[i].children[m]);
            		    }else{
            		    	for(n in node.children[i].children[m].children){
            		    		if(node.children[i].children[m].children[n].id==this.urlId){
                        			this.tree.expandNode(node.children[i].children[m], true, true, true);
                        			this.tree.selectNode(node.children[i].children[m].children[n]);
            		    	       }else{
            		    	    	   for (o in node.children[i].children[m].children[n].children){
            		    	    		   if(this.urlId==node.children[i].children[m].children[n].children[o].id){
                                   			this.tree.expandNode(node.children[i].children[m].children[n], true, true, true);
                                   			this.tree.selectNode(node.children[i].children[m].children[n].children[o]);
            		    	    		   }else{
            		    	    			   for(a in node.children[i].children[m].children[n].children[o].children){
            		    	    				   if(this.urlId==node.children[i].children[m].children[n].children[o].children[a].id){
            		    	    					   this.tree.expandNode(node.children[i].children[m].children[n].children[o], true, true, true);
                                              			this.tree.selectNode(node.children[i].children[m].children[n].children[o].children[a]);
            		    	    				   }
            		    	    			   }
            		    	    		   }
            		    	    	   }
            		    	       }
            		    		}
            		    }
            		}
            	}
            }
        }));
        //如果添加成功，取得根据id选中此节点，展示右边的数据
        if (param && param.id>0) {
            selectNode = this.tree.getNodeByParam("id", param.treeid, null);
            if (selectNode) {
                this.tree.selectNode(selectNode);
            }
        } else if (param.name) {
            selectNode = this.tree.getNodeByParam("name", unescape(param.name), null);
            if (selectNode) {
                this.tree.selectNode(selectNode);
                this.tree.expandNode(selectNode);
            }
        }
        if (selectNode) {
            this._getChildData(selectNode.id);
        }
    },
    _getTreeData:function(){
        var nodes = [];
        $.ajax({
            url: $.u.config.constant.smsqueryserver,
            type: "post",
            dataType: "json",
            cache: false,
            async: false,
            data: {
                "tokenid": $.cookie("tokenid"),
                "method": "getDirectorys",
                "paramType": "getAllDirectorys"
            }
        }).done(this.proxy(function(responseData) {
            if (responseData.success) {
                if (responseData) {
                    nodes = $.map(responseData.directoryData.aaData, function(perm, idx) {
                        return {
                            id: perm.id,
                            pId: perm.fatherId,
                            name: perm.name
                        };
                    });   
                }
            }
        })).fail(this.proxy(function(jqXHR, errorText, errorThrown) {

        }));
        return nodes;
    },
    _clear:function(){
    	this.father.text("");
		this.previous.text("");
		this.name.text("");
		this.status.text("");
		this.description.text("");
		this.section.empty();
		this.fileTable.empty();
		this.btn.empty();
    },
    _getChildData:function(treeId){
    	this.searchAds.val("");
    	this._clear();
    	$.u.ajax({
	    	url:$.u.config.constant.smsqueryserver,
	        type:"post",
	        dataType: "json",
	        cache: false,
	        async:true,
	        data: {
	        	"tokenid":$.cookie("tokenid"),
	    		"method":"getDirectorys",
	    		"paramType":"getDirectoryById",
	    		"directoryId":treeId
	        }
	    },this.main).done(this.proxy(function(responseData){
	    	if(responseData.success){
				if(responseData.directoryData){
			    	if (this.managable && "1" == responseData.directoryData.aaData[0].type) { // 目录类型为自定义并且有管理权限时
						$('<button class="btn btn-default btn-sm edit_item btn-size" >修改</button>').appendTo(this.btn);
						$('<button class="btn btn-default btn-sm del_item btn-size" >删除</button>').appendTo(this.btn);
						$('<button class="btn btn-default btn-sm publish_item btn-size">发布</button>').appendTo(this.btn);
						this.qid("add_item").removeClass("hidden");
					}else{
                        this.btn.closest("div.row").css("margin-bottom", 0);
                    }
					this.libContent.show();
					$.each(responseData.directoryData.aaData,this.proxy(function(k,v){
						v.father && this.father.text(v.father);
						v.previousName && this.previous.text(v.previousName);
						v.name && this.name.text(v.name);
						this.status.text((v.status==0?"未发布":"已发布"));
						v.description && this.description.html(v.description);
						//段落排序
						if(v.sections.length>0){
							$.each(v.sections,this.proxy(function(idx,section){
								var temp = this.sectionTemp.replace(/#\{name\}/g, section.name)
														   .replace(/#\{itemid\}/g, section.id)
										                   .replace(/#\{content\}/g, section.content)
														   .replace(/#\{data-data\}/g, JSON.stringify(section));
								// 权限控制
								if(this.managable){
									temp = temp.replace(/#\{display\}/g,"").replace(/#\{operateClass\}/g,"operate-tool");
								}else{
									temp = temp.replace(/#\{display\}/g,"display:none").replace(/#\{operateClass\}/g,"");
								}
								$(temp).appendTo(this.section);
							}));
							this.section.sortable({
								handle: "i.move",
								connectWith: "div.part",
				          	    stop: this.proxy(function(e,ui) {
				          	        //移动之后，将所有的id传给后台，做排序
				          	        var sortArray = [];
			  	        	        $.each($('div.part',this.$),function(key,value){
			  	        	        	var data = parseInt($(value).attr("data-itemid"));
			  	        	        	sortArray.push(parseInt(data));
			  	        	        });
			  	        	        this.sortItem(sortArray);
				          	    })
			        		});
						}
						//附件
						/*if(v.attachments.length){
							$.each(v.attachments,this.proxy(function(idx,file){
								var temp = this.fileTemp.replace(/#\{filename\}/g, file.name)
														   .replace(/#\{itemid\}/g, file.id)
														   .replace(/#\{filetype\}/g, this.proxy(function(){
							    								return this.pic(file.type);
							    							}))
							    						   .replace(/#\{sourceType\}/g, file.sourceType)
														   .replace(/#\{fileid\}/g, file.id)
										                   .replace(/#\{filesize\}/g, file.size)
										                   .replace(/#\{filetime\}/g, file.uploadTime)
										                   .replace(/#\{fileuser\}/g, file.uploadUser)
														   .replace(/#\{data-data\}/g, JSON.stringify({"id":file.id,"name":file.name}));
								// 权限控制
								if(this.managable && "自定义上传" == file.sourceType){
									temp = temp.replace(/#\{display\}/g,"");
								}else{
									temp = temp.replace(/#\{display\}/g,"display:none");
								}
								$(temp).appendTo(this.fileTable);
							}))
						}*/
						//未修改按钮赋值
						this.editData = {"id":treeId,"father":{"id":v.fatherId,"text":v.father},"previous":{"id":v.previous,"text":v.previousName},
										"name":v.name,"description":v.description}
						
						this.btn.find("button.edit_item").attr("data",JSON.stringify($.extend(this.editData,{mode:"edit"})));
						this.btn.find("button.publish_item").attr("data",v.status);
						this.btn.find("button.publish_item").text(v.status==0?"发布":"取消发布");
						this.qid("add_item").attr("data",JSON.stringify($.extend(this.editData,{mode:"add"})));
					}));
				}
	    	}
	    }));

        if ($.fn.DataTable.isDataTable( this.qid("datatable") ) ) {
            this.dataTable.destroy();
        }
        this.dataTable = this.qid("datatable").DataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            sDom: "t<ip>",
            "columns": [
                { "title": "描述","mData":"description", "sWidth": 280},
                { "title": "文件名","mData":"fileName", "sWidth": 150},
                { "title": "上传时间","mData":"uploadTime", "sWidth": 100},
                { "title": "上传用户","mData":"uploadUser", "sWidth": 80},
                { "title": "大小", "mData": "size", "sWidth": 80},
                { "title": "操作","mData":"id", "sWidth": 50}
            ],
            "aoColumnDefs": [
                {
                    "aTargets": 1,
                    "mRender": this.proxy(function (data, type, full) {
                        return "<img src='" + this.pic(full.type) + "' style='margin-right: 10px;'/><span class='downloadfile' style='color:#428bca;text-decoration:underline;cursor:pointer;' fileid='" + full.id + "'>" + full.fileName + "</span>";
                    })
                },
                {
                    "aTargets": 5,
                    "mRender": this.proxy(function (data, type, full) {
                        var htmls = [];
                        if(this.managable && 1 === full.sourceType){
                        	htmls.push("<span class='glyphicon glyphicon-pencil uui-cursor-pointer fl-minus edit-file' style='margin-right:5px;'></span>");
                            htmls.push("<span class='glyphicon glyphicon-trash uui-cursor-pointer fl-minus del-file' ></span>");
                        }
                        return htmls.join("");
                    })
                }
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
                var rule=[[{"key": "directory", "value": this.tree.getSelectedNodes().length>0 && this.tree.getSelectedNodes()[0].id || Number(this.urlId)}]];
                if($.trim(this.searchAds.val())){
                    rule.push([{"key":"description","op":"like","value":$.trim(this.searchAds.val())}, {"key":"fileName","op":"like","value":$.trim(this.searchAds.val())}]);
                }
                $.extend(aoData,{
                    "tokenid":$.cookie("tokenid"),
                    "method":"stdcomponent.getbysearch",
                    "columns":JSON.stringify([{"data":"t.uploadTime"}]),
        	 		"order":JSON.stringify([{"column":0,"dir":"desc"}]),
                    "dataobject":"file",
                    "rule":JSON.stringify(rule),
                    //"columns":JSON.stringify(aoData.columns),
                    "search":JSON.stringify(aoData.search)
                },true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
                this.btnFilter.attr("disabled",true);
                $.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    type:"post",
                    dataType: "json",
                    cache: false,
                    data: aoData
                }, this.qid("datatable")).done(this.proxy(function (data) {
                    if (data.success) {
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                    this.btnFilter.attr("disabled",false);
                }));
            }),
            "rowCallback": this.proxy(function(row, data, index){
                $(row).data("data", data);
            })
        });
        
    },
    sortItem:function(sortdata){
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": {
            	"tokenid":$.cookie("tokenid"),
				"method":"modifySection",
				"paramType":"sortSections",
				"itemIds":JSON.stringify(sortdata)
            }
        },this.section).done(this.proxy(function(response){
        	if(response.success){
        		
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        }));
    },
    _add:function(e){
    	try {
            var data = JSON.parse($(e.currentTarget).attr("data"));
            this.treeDialog.open({
                data: data,
                title: "增加条目:"+data.name
            });
        } catch (e) {
            throw new Error("修改操作失败：" + e.message);
        }
    },
    _edit:function(e){
    	try {
            var data = JSON.parse($(e.currentTarget).attr("data"));
            this.treeDialog.open({
                data: data,
                title: "修改条目:"+data.name
            });
        } catch (e) {
            throw new Error("修改操作失败：" + e.message);
        }
    },
    _delete:function(e){
    	var nodeid = this.tree.getSelectedNodes()[0].id;
    	var nodename = this.tree.getSelectedNodes()[0].name;
    	try{
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除条目:"+nodename,
    			dataobject:"directory",
    			dataobjectids:JSON.stringify([parseInt(nodeid)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				this._getTree();
    				this._clear();
    				this.libContent.hide();
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    _add_section:function(e){
    	var nodeid = this.tree.getSelectedNodes()[0].id;
    	this.sectionDialog && this.sectionDialog.destroy();
    	this.sectionDialog = new com.sms.common.stdComponentOperate({
    		"title":"添加段落",
    		"dataobject":"section",
    		"fields":[
    		  {"name":"directory","type":"hidden","dataType":"int","value":nodeid},       
	          {"name":"name","label":"段落标题","type":"text","rule":{required:true},"message":"段落标题不能为空","maxlength":255},
	          {"name":"content","label":"段落内容","type":"textarea","maxlength":2000}
	        ],
	        "afterAdd":this.proxy(function(comp,section,res){
				var temp = this.sectionTemp.replace(/#\{name\}/g, section.name)
				   .replace(/#\{itemid\}/g, res.data)
				   .replace(/#\{content\}/g, section.content)
				   .replace(/#\{data-data\}/g, JSON.stringify({
					   "id":res.data,
					   "name":section.name,
					   "content":section.content
				   }));
				// 权限控制
				if(this.managable){
					temp = temp.replace(/#\{display\}/g,"").replace(/#\{operateClass\}/g,"operate-tool");
				}else{
					temp = temp.replace(/#\{display\}/g,"display:none").replace(/#\{operateClass\}/g,"");
				}
	        	$(temp).fadeIn(this.proxy(function(){
	    			$(temp).appendTo(this.section);
	    		}))
	        })
    	});
    	this.sectionDialog.target($("div[umid='sectionDialog']",this.$));
    	this.sectionDialog.parent(this);
    	this.sectionDialog.override({
    		refreshDataTable:this.proxy(function(){
    			
    		})
    	});
		this.sectionDialog.open();
    },
    _edit_section:function(e){
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		var nodeid = this.tree.getSelectedNodes()[0].id;
        	this.sectionDialog && this.sectionDialog.destroy();
        	this.sectionDialog = new com.sms.common.stdComponentOperate({
        		"title":"编辑段落："+data.name,
        		"dataobject":"section",
        		"fields":[
        		  {"name":"directory","type":"hidden","dataType":"int","value":nodeid},       
    	          {"name":"name","label":"段落标题","type":"text","rule":{required:true},"message":"段落标题不能为空","maxlength":255},
    	          {"name":"content","label":"段落内容","type":"textarea","maxlength":2000}
    	        ],
    	        "afterEdit":this.proxy(function(comp,section,res){
					var temp = this.sectionTemp.replace(/#\{name\}/g, section.name)
					   .replace(/#\{itemid\}/g, data.id)
					   .replace(/#\{content\}/g, section.content)
					   .replace(/#\{data-data\}/g, JSON.stringify({
	 					   "id":data.id,
	 					   "name":section.name,
	 					   "content":section.content
	 				   }));
					// 权限控制
					if(this.managable){
						temp = temp.replace(/#\{display\}/g,"").replace(/#\{operateClass\}/g,"operate-tool");
					}else{
						temp = temp.replace(/#\{display\}/g,"display:none").replace(/#\{operateClass\}/g,"");
					}
    	        	$('div[data-itemid='+data.id+']').replaceWith($(temp));
    	        })
        	});
        	this.sectionDialog.target($("div[umid='sectionDialog']",this.$));
        	this.sectionDialog.parent(this);
        	this.sectionDialog.override({
        		refreshDataTable:this.proxy(function(){
        			
        		})
        	});
    		this.sectionDialog.open({"data":data,"title":"编辑段落："+data.name});
    	}catch(e){
    		throw new Error("编辑段落失败:"+e.message);
    	}
    },
    _del_section:function(e){
    	var nodeid = this.tree.getSelectedNodes()[0].id;
    	try{
    		var data = JSON.parse($(e.currentTarget).attr("data-data"));
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除段落:"+data.name,
    			dataobject:"section",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
    				$('div[data-itemid='+data.id+']').fadeOut(function(){
		    			$(this).remove();
		    		})
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    _publish:function(e){
    	try{
    		var data = parseInt($(e.currentTarget).attr("data"));
	    	var nodeid = this.tree.getSelectedNodes()[0].id;
	    	var nodename = this.tree.getSelectedNodes()[0].name;
	    	(new com.sms.safelib.publishDialog({
				body:"<div>"+
					 	"<p>"+(data==0?"确定发布？":"取消发布？")+"</p>"+
					 "</div>",
				title:"发布确认框:"+nodename,
				dataobject:"directory",
				dataobjectid:nodeid,
				status:(data==0?1:0)
			})).override({
				refreshDataTable:this.proxy(function(){
					this._getChildData(nodeid);
				})
			});
    	}catch(e){
    		throw new Error("发布操作失败:"+e.message);
    	}
    },
    _add_file:function(){
            document.title = this.rememberTitle;
    	try{
    		var nodeid = this.tree.getSelectedNodes()[0].id;
    		this.fileDialog.open({
    			"directoryId":nodeid,
    			"method":"uploadFiles",
    			"dataobject":"file",
    			"tokenid":$.cookie("tokenid"),
    			"attachementType":"",
    			"comment":"",
    			"sourceType":1
    		});
    	}catch(e){
    		$.u.alert.error("未选择左边的树节点");
    	}
    },
    _edit_file: function(e){
    	var data = $(e.currentTarget).closest("tr").data("data");
		if(!this.editDialog){
    		$.u.load("com.sms.common.stdComponentOperate");
    		this.editDialog = new com.sms.common.stdComponentOperate($("div[umid='editDialog']",this.$),{
        		"dataobject":"file",
        		"fields":[
    	          {name:"description",label:"描述",type:"textarea",maxlength:2000,value:data.description},
    	        ]
        	});
    	}
		this.editDialog.open({
			"dataid":data.id,
			"title":"编辑文件   "+data.fileName+"  的描述",
			"afterEdit":this.proxy(function(){
				this.dataTable.draw();
			})
		});
    },
    _del_file:function(e){
    	var nodeid = this.tree.getSelectedNodes()[0].id; 
    	try{
    		var data = $(e.currentTarget).closest("tr").data("data");
    		(new com.sms.common.stdcomponentdelete({
    			body:"<div>"+
    				 	"<p>确认删除？</p>"+
    				 "</div>",
    			title:"删除文件:" + data.fileName,
    			dataobject:"file",
    			dataobjectids:JSON.stringify([parseInt(data.id)])
    		})).override({
    			refreshDataTable:this.proxy(function(){
                    this.dataTable.draw();
    			})
    		});
    	}catch(e){
    		throw new Error("删除操作失败:"+e.message);
    	}
    },
    _download_file:function(e){
    	var data = parseInt($(e.currentTarget).attr("fileid"));
    	var directoryId = this.tree.getSelectedNodes()[0].id;
        window.open($.u.config.constant.smsqueryserver+"?method=downloadFiles&tokenid="+$.cookie("tokenid")+"&ids="+JSON.stringify([data])+"&url="+window.encodeURIComponent(window.location.host+window.location.pathname+"?id="+directoryId));
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.sms.safelib.safelibrary.widgetjs = [
    '../../../uui/widget/jqurl/jqurl.js',
    '../../../uui/widget/jqdatatable/js/jquery.dataTables.js',
    '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
    "../../../uui/widget/jqurl/jqurl.js",
    "../../../uui/widget/jqztree/js/jquery.ztree.all-3.5.js",
    "../../../uui/widget/spin/spin.js",
    "../../../uui/widget/jqblockui/jquery.blockUI.js",
    "../../../uui/widget/ajax/layoutajax.js"
];
com.sms.safelib.safelibrary.widgetcss = [{
    path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css'
}, {
    path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css'
}, {
    id: "ztreestyle",
    path: "../../../uui/widget/jqztree/css/zTreeStyle/zTreeStyle.css"
}];
 