//@ sourceURL=com.sms.workflow.workflowDesign
$.u.define('com.sms.workflow.workflowDesign', null, {
    init: function (options) {
    	/*
    	 * {
    	 * 	id:"",
    	 *  mode:"", // simple or base
    	 *  workflowMode:"", // view or edit
    	 *  save:function(){}, // 保存后调用的事件
    	 *  afterLoad:function(response){} // 编辑流程图时加载流程图后执行的事件
    	 * }
    	 */
        this._options = options||{mode:"simple",where:"wsd_id="}; 		// simple有头部 base版没有头部
        this.workflowData = null; 										// 工作流数据
        this.wsd_id = null;
        this._select2PageLength = 10;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.workflow.workflowDesign.i18n;
    	this.btnEditWorkflow=this.qid("btn_editWorkflow");				// 编辑工作流按钮
    	this.workflowName=this.qid("workflow-name"); 					// 工作流名称
    	this.labelActive=this.qid("label-active");						// 状态标签
    	this.workflowDesc= this.qid("workflow-description");			// 工作流描述
    	this.workflowLastupdate=this.qid("workflow-lastupdate");		// 最后修改信息
    	this.workflowGraph = this.qid("workflowGraph");					// 工作流画布
    	this.workflowCore=this.qid("workflowCore");						// 工作流程图实例
    	this.btnGraphPosition=this.qid("btn_graphPosition");			// 调整画布全屏按钮
    	
    	if(this._options.workflowMode == "view"){ // 查看模式
    		this.qid("button-edit").click(this.proxy(function(){
    			window.location.href += "&mode=edit";
    		}));
    		this.qid("button-toolbars").remove();
    		this.qid("btn_editWorkflow").remove();
    	}else{ // 编辑模式
    		this.qid("button-edit").remove();
    		
        	// 绑定发布事件
        	this.qid("button-release").click(this.proxy(function(){
        		$.u.ajax({
                    url: $.u.config.constant.workflowserver,
                    dataType: "json",
                    cache: false,
                    data: {
    	      			 "tokenid":$.cookie("tokenid"),
    	      			 "sv":"Release",
    	      			 "wsd_id":this.wsd_id,
    	      			 "user_id":$.cookie("userid")
    	      		  }
                },this.$, {size:2, background:"#fff"}).done(this.proxy(function (response) {
                    if(response.success !== false){
                    	if(response.responseHeader.status == 0){
                    		if(this._options && typeof this._options.save == "function"){
                                $.u.alert.success(this.i18n.messages.release);
                				this._options.save();
                			}
                        }else{
                        	$.u.alert.error(response.responseHeader.msg);
                        }
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                }))
        	}));
    	}
    	
    	// 编辑工作流事件
    	this.btnEditWorkflow.click(this.proxy(function(e){
    		if(!this.workflowDialog){
    			$.u.load("com.sms.common.stdComponentOperate");
    			this.workflowDialog = new com.sms.common.stdComponentOperate($("div[umid='workflowDialog']",this.$),{
    	    		"fields":[
    		          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull},
    		          {name:"description",label:this.i18n.describe,type:"textarea"}
    		        ]
    	    	});
    		}
    		this.workflowDialog.open({
    			title:this.i18n.editWorkflow,
	    		data:{
	    			name:this.workflowData.name,
	    			description:this.workflowData.description
	    		},
	    		edit:this.proxy(function(comp,formdata){
	    			comp.disableForm();
	    			$.u.ajax({
	            		url:$.u.config.constant.workflowserver,
	            		type:"post",
	            		data:$.extend($.extend({},this.workflowData,formdata),{
		            		"sv":"Save",
		            		"user_id":$.cookie("userid"),
		    	    		"tokenid":$.cookie("tokenid")
		            	}),
	            		dataType:"json",
	            		jsonpCallback:"workflow",
	            	},comp.formDialog.parent(),{ size: 1,backgroundColor:'#fff', selector: comp.formDialog.parent().find(".ui-dialog-buttonpane button:eq(0)"), orient: "west" }).done(this.proxy(function(response){
	            		if(response.success !== false){
                            if(response.responseHeader.status == 0){
    	            			$.extend(this.workflowData,formdata);
    	            			this.workflowName.html(formdata.name);
    	    	    			this.workflowDesc.html(formdata.description||"&nbsp;<i class='active'>无</i>");
    	    	    			this.labelActive.addClass(formdata.release_time == "Y" ? "label-primary" : "label-default").text(formdata.release_time == "Y" ? "已生效" : "未生效");
    	    	    			comp.formDialog.dialog("close");
    	            		}else{
    	            			alert(response.responseHeader.msg);
    	            		}
                        }
	            	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	            	})).complete(this.proxy(function(jqXHR,errorStatus){
	            		comp.enableForm();
	            	}));
	    		})
    		});
    	}));
    	
    	// 调整画布全屏事件
    	this.btnGraphPosition.click(this.proxy(function(e){
    		var $icon = $(e.currentTarget).children("span.glyphicon");
    		if($icon.hasClass("glyphicon-resize-full")){
    			this.workflowGraph.switchClass("position-defalut","position-fixed",this.proxy(function(){
    				$("body").css({"overflow":"hidden"});
        			$icon.removeClass("glyphicon-resize-full").addClass("glyphicon-resize-small");
    			}));
    		}else{
    			this.workflowGraph.switchClass("position-fixed","position-defalut",this.proxy(function(){
    				$("body").css({"overflow":"auto"});
        			$icon.removeClass("glyphicon-resize-small").addClass("glyphicon-resize-full");
    			}));
    		}
    	}));
    	
    	// 基本版隐藏头部
    	if(this._options && this._options.mode == "base"){
    		this.qid("header").addClass("hidden");
    		if(this._options.admin){
    			this.qid("btn_basemode_edit").removeClass("hidden").click(this.proxy(function(){
    				window.location.href = this.getabsurl("../workflow/WorkflowDesign.html?id=" + this._options.id + "&mode=edit&where=wt_id" );
    			}));
    		}
    	}

    	// 加载流程图数据
    	$.u.ajax({
    		url:$.u.config.constant.workflowserver,
    		data:{
	    		"sv":"List",
	    		"user_id":$.cookie("userid"),
	    		"tokenid":$.cookie("tokenid"),
	    		"with_data":"Y",
	    		"where":this._options.where + this._options.id
	    	},
    		dataType:"json"
    	},this.$, {size:2, background:"#fff"}).done(this.proxy(function(response){
            if(response.success !== false){
        		if(response.responseHeader.status == 0){
        			if(response.responseData.total==1){
        				this.workflowData = response.responseData.list[0];
        				this.wsd_id = this.workflowData.wsd_id; 
        				this.workflowName.text(this.workflowData.name);
        				this.workflowDesc.html(this.workflowData.description || "&nbsp;<i class='active'>无</i>");
        				this.workflowLastupdate.text("最后修改："+this.workflowData.modify_by+"，"+this.workflowData.last_update);
        				this.labelActive.addClass(this.workflowData.release_time ? "label-primary" : "label-default").text(this.workflowData.release_time == "Y" ? "已生效" : "未生效");
        				if(this._options && typeof this._options.afterLoad == "function"){
        					this._options.afterLoad(response);
        				}
        				this.initMyFlow(this.workflowData && this.workflowData.data && JSON.parse(this.workflowData.data));
        			}else{
        				alert(this.i18n.remaind);
        				//window.location.href="ListWorkflows.html";
        			}
        		}else{
        			alert(response.responseHeader.msg);
        		}
            }
    	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
    		
    	})).complete(this.proxy(function(jqXHR,errorStatus){
    		
    	}));
    	
    	
    	
    	
    	
    },
    /*
     * 初始化流程图
     */
    initMyFlow:function(restore){
    	this.workflowCore.myflow({
    	    basePath: "",
    	    editable:this._options.workflowMode == "view" ? false : true,
            _id:this._id,
            width:this.workflowGraph.width(),
            height:700,
            props:{
                attr:{top:10, right:30},
                props:{attributes:{}}
            },
            interfaces:{
            	/**
            	 * @title 添加状态
            	 * @param paper 画布对象
            	 * @param currRectArray 当前流程图中所有rect集合
            	 * @description 输入搜索状态条件时，如果没有搜索到状态点击增加则弹出添加新状态的模态层
            	 */
            	addRect:this.proxy(function(paper,currRectArray){
            		if(!this.selectStateDialog){
            			$.u.load("com.sms.common.stdComponentOperate");
            		}
            		this.selectStateDialog && this.selectStateDialog.destroy();
            		this.selectStateDialog = new com.sms.common.stdComponentOperate({
                		"title":this.i18n.addStatus,
            			"fields":[
            	          {name:"state",label:this.i18n.status,type:"select",rule:{required:true},message:this.i18n.statusNotNull,description:this.i18n.statusDesc,
            	        	  option:{
            	        		  params:{"dataobject":"activityStatus"},
	            	        	  ajax:{
		            	        	  data: this.proxy(function(term,page){
							        	   return {
							        		   tokenid:$.cookie("tokenid"),
							        		   method:"stdcomponent.getbysearch",
							        		   dataobject:"activityStatus",
							        		   rule:JSON.stringify([[{"key":"name","op":"like","value":term}]]),
                                               start: (page - 1) * this._select2PageLength,
                                               length: this._select2PageLength
							        	   };
							          }),
		            	        	  success: this.proxy(function(response,page,query){
		            	        		  var currStateIds = $.map(currRectArray,function(rect,id){
		            	        			  return rect.toJson().props.id;
		            	        		  }); 
		            	        		  var data = $.grep(response.data.aaData,function(state,idx){
		        	        				  return $.inArray(state.id,currStateIds) == -1;
		        	        			  });
		            	        		  if(data.length == 0 && query){
		            	        			  data=[{id:0,statename:query,name:query+"(添加新状态)"}]
		            	        		  }
		            	        		  return {
                                            results: data,
                                            more: response.data.iTotalRecords > (page * this._select2PageLength)
                                          };
		            	        	  })
	            	          	  }
            	          }}
            	        ],
            	        "add":this.proxy(function(comp,formData){
            	        	var state = $("[name='state']",comp.form).select2("data");
            	        	if(state.id === 0){
            	        		comp.formDialog.dialog("close");
            	        		if(!this.addStatusDialog){
            	        			$.u.load("com.sms.common.stdComponentOperate");
            	        		}
            	        		this.addStatusDialog && this.addStatusDialog.destroy();
            	        		this.addStatusDialog = new com.sms.common.stdComponentOperate({
            	        			"title":this.i18n.addNewStatus,
            	        			"dataobject":"activityStatus",
            	        			"fields":[
            	        			   {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull,value:state.statename},
							           {name:"description",label:this.i18n.describe,type:"textarea","description":this.i18n.desc},
							           {name:"category",label:this.i18n.classify,type:"select",rule:{required:true},message:this.i18n.classifyNOtNull,description:this.i18n.desc+"<br/>"+this.i18n.descB+"<strong>"+this.i18n.create+"</strong>"+this.i18n.change+"<strong>"+this.i18n.underway+"</strong>，"+this.i18n.explainC+"<strong>"+this.i18n.finish+"</strong>",option:{
							        	  minimumResultsForSearch:-1,
							        	  ajax:{
								        	  data:{"method":"getactivitystatuscategory"}
							           	  },
							        	  id:function(cate){
							        		  return cate.key;
							        	  },
							        	  formatResult:this.proxy(function(cate){
							        		  return "<span class='label "+this.getLabel(cate.key)+"'>&nbsp;</span>&nbsp;"+cate.name;
							        	  }),
							        	  formatSelection:this.proxy(function(cate){
							        		  return "<span class='label "+this.getLabel(cate.key)+"'>&nbsp;</span>&nbsp;"+cate.name;
							        	  })
							        }}],
							        "afterAdd":function(comp,formdata,response){
            	        				$(paper).trigger("addrect", ["state", {
                                            attr: { x: 300, y: 300 },
                                            text:{text:formdata.name},
                                            props:{
                                                name:formdata.name,
                                                description:formdata.description,
                                                category:formdata.category,
                                                id:response.data,
                                                options: {
                                                    property:{
                                                        value: [{"key":"state","value":response.data,"readOnly":true}]
                                                    }
                                                }
                                            }
                                        }]);
	            	        			comp.formDialog.dialog("close");
	            	        		}
            	        		});
            	        		this.addStatusDialog.target($("div[umid='addStatusDialog']",this.$));
                        		this.addStatusDialog.parent(this);
                        		this.addStatusDialog.open();
            	        	}else{
	            	        	$(paper).trigger("addrect", ["state", { 
                                    attr: { x: 300, y: 300 },
                                    text:{text:state.name},
                                    props:{
                                        name:state.name,
                                        description:state.description,
                                        category:state.category,
                                        id:state.id,
                                        options: {
                                            property:{
                                                value: [{"key":"state","value":state.id,"readOnly":true}]
                                            }
                                        }
                                    }
                                }]);
	            	        	comp.formDialog.dialog("close");
            	        	}
            	        })
                	});
            		this.selectStateDialog.target($("div[umid='selectStateDialog']",this.$));
            		this.selectStateDialog.parent(this);
            		this.selectStateDialog.open();
            	}),
            	/**
            	 * @title 编辑状态和线条
            	 * @param paper 当前画布对象
            	 * @param obj 当前对象
            	 * @param props 当前对象的props属性数据
            	 */
            	editRectPath:this.proxy(function(paper,obj,props){ 
            		if(props.type=="state"){ 
            			if(!this.stateDialog){
            				$.u.load("com.sms.common.stdComponentOperate");
            				this.stateDialog = new com.sms.common.stdComponentOperate($("div[umid='stateDialog']",this.$),{
            		    		"dataobject":"activityStatus",
            		    		"fields":[
            			          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull},
            			          {name:"description",label:this.i18n.describe,type:"textarea"},
            			          {name:"category",label:this.i18n.classify,type:"select",rule:{required:true},message:this.i18n.classifyNOtNull,description:this.i18n.explainA+"<br/>"+this.i18n.explainB+"<strong>"+this.i18n.create+"</strong>"+this.i18n.change+"<strong>"+this.i18n.underway+"</strong>，"+this.i18n.explainC+"<strong>"+this.i18n.finish+"</strong>",option:{
            			        	  minimumResultsForSearch:-1,
            			        	  data:this.proxy(function(){
            			        		  var result = {};
            			        		  $.ajax({
            			                      url: $.u.config.constant.smsqueryserver,
            			                      dataType: "json",
            			                      type:"post",
            			                      async:false,
            			                      data: {
            				        			 "tokenid":$.cookie("tokenid"),
            				        			 "method":"getactivitystatuscategory"
            				        		  }
            			                  }).done(this.proxy(function (response) {
            			                      if (response.success) {
            			                          result = {results:response.data.aaData};
            			                      }
            			                  })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

            			                  }));
            			        		  return result;
            			        	  }),
            			        	  id:function(cate){
            			        		  return cate.key;
            			        	  },
            			        	  formatResult:this.proxy(function(cate){
            			        		  return "<span class='label "+this.getLabel(cate.key)+"'>&nbsp;</span>&nbsp;"+cate.name;
            			        	  }),
            			        	  formatSelection:this.proxy(function(cate){
            			        		  return "<span class='label "+this.getLabel(cate.key)+"'>&nbsp;</span>&nbsp;"+cate.name;
            			        	  })
            			          }}
            			        ],
            			        "add":this.proxy(function(comp,formData){
            			        	return false;
            			        })
            		    	});
            			}
	            		this.stateDialog.open({
	            			data:props,
	            			title:this.i18n.editStatus,
	            			afterEdit:this.proxy(function(comp,formdata){
		            			$(paper).trigger('textchange', [formdata.name,obj]);
		            			$(paper).trigger("colorchange",[formdata.category,obj]);
		            			$.extend(props,formdata,true);
		            			comp.formDialog.dialog("close");
		            			$(paper).trigger("showprops",[props,obj]);
		            		})
	            		});
            		}else if(props.type="path"){
            			if(!this.pathDialog){
            				$.u.load("com.sms.common.stdComponentOperate");
            				this.pathDialog = new com.sms.common.stdComponentOperate($("div[umid='pathDialog']",this.$),{
            		    		"fields":[
            			          {name:"name",label:this.i18n.name,type:"text",rule:{required:true},message:this.i18n.nameNotNull},
            			          {name:"description",label:this.i18n.describe,type:"textarea"},
            			          {name:"screen",label:this.i18n.panel,type:"select",
            			        	  option:{
            			        		  placeholder: '请选择',
            			        		  allowClear: true,
            				        	  params:{"dataobject":"fieldScreen"},
            				        	  ajax:{
            				        		  data:{"dataobject":"fieldScreen"}
            				        	  }
            				          }
            			          },
                                  {name:"andor", label:this.i18n.andor, type:"enum", value: "OR",
                                      enums: [
                                        {name: "或签", value: "OR"},
                                        {name: "并签", value: "AND"}
                                      ]
                                  }
            			        ],
            			        "add":this.proxy(function(comp,formData){
            			        	return false;
            			        })
            		    	});
            			}
            			this.pathDialog.open({
            				data:props,title:this.i18n.editconn,
            				edit:this.proxy(function(comp,formdata){
		            			$(paper).trigger('textchange', [formdata.name,obj]);
		            			$.extend(props,formdata,true);
		            			comp.formDialog.dialog("close");
		            			$(paper).trigger("showprops",[props,obj]);
		            		})
	            		});
            		}
	            }),
	            /**
	             * @title 编辑选项（属性、触发条件、检查条件、结果处理）
	             * @param a 当前触发事件源对象
	             * @param props 当前节点或线对象的props属性数据
	             */
	            editOptions:this.proxy(function(a,props){
	            	var $this = $(a), 
	            		module=$this.attr("umodule"),
	            		cate=$this.attr("cate"),
	            		option = $this.attr("option") ? JSON.parse($this.attr("option")) : {},
	            		compClaz;
	            	
	            	compClaz =  $.u.load(module);
	            	module=new compClaz($.extend({},option,{data:props["options"][cate]["value"],save:this.proxy(function(comp,data){
	            		props["options"][cate]["value"]=data;
	            		$(a).next().text("("+data.length+")");
	            		comp.destroy();
	            	})}));
	                module.target($("div[umid='optionDialog']",this.$));
	                module.parent(this);
	                
	            }),
	            /**
	             * @title 保存流程数据
	             * @param data 流程图的json格式数据
	             */
	            saveWorkflowData:this.proxy(function(data){
	            	this.workflowData.data=data;
	            	$.u.ajax({
	            		url:$.u.config.constant.workflowserver,
	            		type:"post",
	            		data:$.extend({},this.workflowData,{
		            		"sv":"Save",
		            		"user_id":$.cookie("userid"),
		    	    		"tokenid":$.cookie("tokenid")
		            	}),
	            		dataType:"json"
	            	},this.$, {size:2, background:"#fff"}).done(this.proxy(function(response){
                        if(response.success !== false){
    	            		if(response.responseHeader.status == 0){
    	            			if(this._options && typeof this._options.save == "function"){
                                    $.u.alert.success(this.i18n.messages.success);
    	            				this._options.save();
    	            			}
    	            		}else{
    	            			$.u.alert.error(response.responseHeader.msg, 1000 * 3);
    	            		}
                        }
	            	})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
	            		
	            	})).complete(this.proxy(function(jqXHR,errorStatus){
	            		
	            	}));
	            })
            },
            restore:restore||null // 编辑时传入流程数据
    	});
    },
    /**
	 * @title 通过分类获取颜色标签
	 * @param v 分类的key值
	 */
    getLabel:function(v){
    	var label=null;
    	switch(v){
			case "NEW":
				label="label-primary";
				break;
			case "IN_PROGRESS":
				label="label-warning";
				break;
			case "COMPLETE":
				label="label-success";
				break;
			default:
				label="label-default";
				break;
		}
    	return label;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.workflowDesign.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                            '../../../uui/widget/workflow/raphael-min.js',
                                            '../../../uui/widget/workflow/myflow.js',
                                            '../../../uui/widget/workflow/myflow.jpdl4.js',
                                            '../../../uui/widget/workflow/myflow.editors.js',
                                            "../../../uui/widget/spin/spin.js",
                                            "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                            "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.workflowDesign.widgetcss = [{ path: '' }];