//@ sourceURL=com.sms.fieldscreen.configScreen
$.u.load("com.sms.common.stdComponentOperate");
$.u.define('com.sms.fieldscreen.configScreen', null, {
    init: function (options) {
        this._options = options;
        this._active = 0;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.fieldscreen.configScreen.i18n;
    	/*
    	 *1.根据id查找其选项卡
    	 *2.根据找到的选项卡数据进行排序，并选中第一个
    	 *3.根据选中的选项卡，获得下面的列表 
    	 */
    	
    	//id
    	this.configScreenId=$.urlParam().id;
    	
    	if(!this.configScreenId){
			window.location.href="ViewFieldScreens.html";
		} 
    	
        //显示几个安监机构
        this.units = this.qid("units");
        this.unitsUl = this.qid("units-ul");
        // 绑定方案标题的点击事件
    	this.$.on("click",".unit-config-scheme-name",this.proxy(this._toggleScreenScheme));
    	
    	//添加选项卡按钮
    	this.btn_addTab = this.qid("btn_addTab");
    	
    	this.configname = this.qid("configname");
    	
    	this.confignametext = this.qid("confignametext");
    	
    	// 字段选项卡
    	this.fieldTabs=this.qid("tabs");
    	
    	this.fieldul = this.qid("field-ul");
    	
    	//tab--sequence
    	this.tabSequence = [];
    	
    	//item-sequence
    	this.itemSequence = [];
    	    	
    	//select
    	this.selectField=this.qid("field-select").select2({
    		width:322,
    		data:this.proxy(function(term,page) { return { text:'name', results: this.getFieldData(term,page) }; }),
	        id:function(obj){
	        	return obj.key;
	        },
	        formatResult:function(item){
	        	return item.name;
	        },
	        formatSelection:function(item){
	        	return item.name;
	        }
    	});
    	
    	this.selectField.off("select2-selecting").on("select2-selecting",this.proxy(function(val,choice){
        	//得到当前显示的tabs
    		var active = this.fieldTabs.tabs( "option", "active" );
    		var $li = this.fieldul.find('li').eq(active);
    		var $a = $('a',$li);
    		var qid = $a.attr("href").replace(/#/g,"");
    		var tabid = parseInt(qid.substring(5));
    		var $div = $("#"+qid); 
    		var $ul = $('ul',$div);
    		//取得所有的sequence
    		$.each($('li',$ul),this.proxy(function(k,v){
	        	var itemdata = $(v).attr("sequenceid");
	        	this.itemSequence.push(parseInt(itemdata));
	        }));
    		var seq = 1;
    		if(this.itemSequence.length==0){
    			seq = 1;
    		}else{
    			seq = Math.max.apply(Math,this.itemSequence)+parseInt(1);
    		}
    		this.sendSelectData(tabid,val.object.key,seq,$ul,val.object.name);
    	}));
    	
    	
    	//找到选项卡
    	this.getTab(this.configScreenId);

    	this.btn_addTab.click(this.proxy(function(){
    		this.tabDialog&&this.tabDialog.destroy();
    		this.tabDialog = new com.sms.common.stdComponentOperate({
        		"title":this.i18n.addControl,
        		"dataobject":"fieldScreenTab",
        		"afterAdd":this.proxy(function(comp,formdata){
            		comp.formDialog.dialog("close");
            		this.getTab(this.configScreenId);
            	}),
        		"fields":[
        		          {name:"screen",type:"hidden",dataType:"int",value:this.configScreenId},
        		          {name:"sequence",type:"hidden",dataType:"int",value:Math.max.apply(Math,this.tabSequence)+parseInt(1)},
        		          {name:"name",label:this.i18n.ControlName,type:"text",rule:{required:true},message:this.i18n.ControlNameNotNull,maxlength:50}
    	        ]
        	});
    		this.tabDialog.target($("div[umid='tabDialog']",this.$));
    		this.tabDialog.open();
    	}));

    	//选项卡名编辑
    	this.fieldTabs.off("click", "span.edit").on("click", "span.edit", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		this.edidtabid = data.id;
        		if(!this.tabDialogEdit){
            		$.u.load("com.sms.common.stdComponentOperate");
            		this.tabDialogEdit = new com.sms.common.stdComponentOperate($("div[umid='tabDialogEdit']",this.$),{
                		"title":this.i18n.editControl,
                		"dataobject":"fieldScreenTab",
                		"fields":[
                		     {name:"name",label:this.i18n.ControlName,type:"text",rule:{required:true},message:this.i18n.ControlNameNotNull,maxlength:50}
            	        ]
                	});
            		this.tabDialogEdit.override({
                		refreshDataTable:this.proxy(function(){
                			this.getTab(this.configScreenId);
                		})
                	});
            	}
        		this.tabDialogEdit.open({"data":data,"title":this.i18n.editControl+data.name});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
    	}));
    	
    	//选项卡名删除
    	this.fieldTabs.off("click", "span.remove").on("click", "span.remove", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data"));
        		$.u.load("com.sms.common.stdcomponentdelete");
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	this.i18n.removeControl+"<strong>"+data.name+"</strong>？"+
        				 "</div>",
        			title:this.i18n.remove,
        			dataobject:"fieldScreenTab",
        			dataobjectids:JSON.stringify([parseInt(data.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.getTab(this.configScreenId);
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.removeFail+e.message);
        	}
    	}));
    	
    	// 初始化字段列表排序功能
    	$("ul.list-fields",this.$).sortable({
    		handle:".handler",
    		revert: true
        });
    	
    	// 绑定字段列表鼠标移入事件
    	this.$.on("mouseenter","ul.list-fields li.list-group-item",this.proxy(function(e){
    		var $sender=$(e.currentTarget);
    		$("button.remove-field",$sender).removeClass("hidden");
    	}));
    	
    	// 绑定字段列表鼠标移出事件
    	this.$.on("mouseleave","ul.list-fields li.list-group-item",this.proxy(function(e){
    		var $sender=$(e.currentTarget);
    		$("ul.list-fields button.remove-field",this.$).addClass("hidden");
    	}));
    	
    	// 删除字段事件
    	this.$.on("click","li.list-group-item button.remove-field",this.proxy(function(e){
    		var $sender=$(e.currentTarget);	
    		var sendData = [];
    		sendData.push(parseInt($sender.parent().attr("itemid")));
	   		 $.ajax({
				 url: $.u.config.constant.smsmodifyserver,
	             dataType: "json",
	             cache: false,
	             data: {
				 	"tokenid":$.cookie("tokenid"),
				 	"method":"stdcomponent.delete",
				 	"dataobject":"fieldScreenLayoutItem",
				 	"dataobjectids":JSON.stringify(sendData)
	    		 }
			 }).done(this.proxy(function(response){
				 if(response.success){
					 $sender.parent().fadeOut(function(){
			    			$(this).remove();
			    		})
				 }
			 })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
				 
			 }));
    	}));
    },
    _toggleScreenScheme:function(e){
    	var $sender = $(e.currentTarget),$prev=$sender.prev();
		$sender.closest("div.unit-config-scheme-item").toggleClass("collapsed");
		if($prev.hasClass("glyphicon-chevron-right")){
			$prev.removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
		}else{
			$prev.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
		}
    },
    sendSelectData:function(tabid,key,seq,bkul,name){
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": {
    			  "tokenid":$.cookie("tokenid"),
          		  "method":"stdcomponent.add",
          		  "dataobject":"fieldScreenLayoutItem",
          		  "obj":JSON.stringify({
          			  "tab":tabid,
          			  "key":key,
          			  "sequence":seq
          		  })
  			}
        },this.$, {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
        		$('<li class="list-group-item" itemid="'+response.data+'" sequenceid="'+seq+'"  value="'+key+'"><span class="glyphicon handler glyphicon-align-justify"></span>'+name+'<button class="btn btn-default pull-right hidden remove-field">删除</button></li>').appendTo(bkul);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){

        }));
    },
    getItem:function(id){
    	this.itemSequence = [];
		$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
            	"tokenid":$.cookie("tokenid"),
        		"method":"stdcomponent.getbysearch",
        		"dataobject":"fieldScreenLayoutItem",
        		"rule":JSON.stringify([[{"key":"tab","value":parseInt(id)}]]),
        		"columns":JSON.stringify([{"data":"sequence"}] ),
        		"order":JSON.stringify([{"column":0,"dir":"asc"}])
            }
        },this.$, {size:2, backgroundColor:"#fff"}).done(this.proxy(function (data) {
        	if (data.success) {
        		//$('#tabs-'+id)
        		//将编辑、删除按钮隐藏
        		$("a[href=#tabs-"+id+"]").children("span.operate.edit").show();
        		var $div =  $('#tabs-'+id).empty();
        		var $ul = $('<ul class="list-group list-fields"></ul>').appendTo($div);
        		$.each(data.data.aaData,this.proxy(function(k1,v1){
        			$('<li class="list-group-item" itemid="'+v1.id+'" sequenceid="'+v1.sequence+'"  value="'+v1.key+'"><span class="glyphicon handler glyphicon-align-justify"></span>'+v1.name+'<button class="btn btn-default pull-right hidden remove-field">'+com.sms.fieldscreen.configScreen.i18n.removeD+'</button></li>').appendTo($ul);
        		}));
        		$ul.sortable({
          	      stop: this.proxy(function(e,ui) {
          	        //移动之后，将所有的id传个后台，做排序
          	        var sortArray = [];
  	        	        $.each($('li',$ul),function(k,v){
  	        	        	var tabdata = $.parseJSON($(v).attr("itemid"));
  	        	        	sortArray.push(parseInt(tabdata));
  	        	        });
  	        	        this.sortItem(sortArray);
          	      })

        		});
        	}
        	
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));	
    },
    //method:sortfieldscreenlayoutitem  itemIds:  [1,2,3]
    //sortfieldscreentab   tabIds
    sortItem:function(sortdata){
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": {
            	"tokenid":$.cookie("tokenid"),
				"method":"sortfieldscreenlayoutitem",
				"itemIds":JSON.stringify(sortdata)
            }
        },this.$, {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
        		//this.getTab(this.configScreenId);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	
        }));
    },
    sortTab:function(sortdata){
    	$.u.ajax({
        	url: $.u.config.constant.smsmodifyserver,
            type:"post",
            dataType: "json",
            cache: false,
            "data": {
            	"tokenid":$.cookie("tokenid"),
				"method":"sortfieldscreentab",
				"tabIds":JSON.stringify(sortdata)
            }
        },this.$, {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
        		this.getTab(this.configScreenId);
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){
        	
        }));
    },
    getTab:function(id){
    	this.tabSequence = [];
    	this._active = 0;
    	$.u.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
            	"tokenid":$.cookie("tokenid"),
        		"method":"getfieldscreentabs",
        		"screen":parseInt(id),
        		"manage":true
            }
        },this.$, {size:2, backgroundColor:"#fff"}).done(this.proxy(function (data) {
        	if (data.success) {
        		data.data["screen"]&&this.configname.text(data.data["screen"])&&this.confignametext.text(data.data["screen"]);
        		this.fieldul.children(":not(button)").remove();
        		this.fieldTabs.children("div").remove();
        		this.unitsUl.empty();
        		data.data.units&&$.each(data.data.units,this.proxy(function(idx,unit){
					$('<li role="presentation"><a role="menuitem" tabindex="-1" href="../unitconfig/Summary.html?id='+unit.id+'"><img width="16" src="'+unit.avatarUrl+'" height="16"/>&nbsp;'+unit.name+'</a></li>').appendTo(this.unitsUl);
				}));
    			this.units.text(data.data.units.length);        		
        		//根据结果找到下面的选项
        		$.each(data.data.tabs,this.proxy(function(k,v){
                	//用于添加时取最大的sequence
        			this.tabSequence.push(v.sequence);
        			$('<li><a href="#tabs-'+v.id+'"><span class="glyphicon handler glyphicon-align-justify"></span><span class="atitle">'+v.name+'</span><span class="glyphicon glyphicon-pencil operate edit" data=\''+JSON.stringify(v)+'\'></span><span class="glyphicon glyphicon-remove-sign operate remove" data=\''+JSON.stringify(v)+'\'></span></a></li>').prependTo(this.fieldul);
        			//根据id找到item
        			$('<div id="tabs-'+v.id+'" ></div>').appendTo(this.fieldTabs);
        			//
        		}));
        		try{
        			this.qid("tabs").tabs("destroy").find(".ui-tabs-nav").sortable("destroy");
        		}catch(e){ 
        		
        		};
    			//点击第一个结果
            	this._active = data.data.tabs[data.data.tabs.length-1].id;
            	// 初始化字段选项卡和选项卡排序
            	this.qid("tabs").tabs({
            		activate:this.proxy(function(e,ui){
            			$("span.operate",this.fieldTabs).addClass("hidden");
            			$("span.operate",ui.newTab).removeClass("hidden");
            			var id = $(ui.newTab).children("a:eq(0)").attr("href").substring(6);
            			this.getItem(id);
            		})
            	});
            	this.qid("tabs").find( ".ui-tabs-nav" ).sortable({
        	      axis: "x",
        	      handle:".handler",
        	      stop: this.proxy(function(e,ui) {
        	        this.fieldTabs.tabs( "refresh" );
        	        //移动之后，将所有的id传个后台，做排序
        	        var sortArray = [];
	        	        $.each($('a span.edit',$(ui.item).parent()),function(k,v){
	        	        	var tabdata = $.parseJSON($(v).attr("data"));
	        	        	sortArray.push(parseInt(tabdata.id));
	        	        });
	        	        this.sortTab(sortArray);
        	      }),
        	      start:this.proxy(function(e,ui) {
        	      	console.log($(ui.item).index());
	      	        this.fieldTabs.tabs( "refresh" );
	      	      })
        	    });
            	//点击第一个
            	this.getItem(this._active);
        		//如果只有一个tab
        		if(data.data.tabs.length==1){
        			$("a[href=#tabs-"+this._active+"]").children("span.operate.edit").removeClass("hidden");
        			$("a[href=#tabs-"+this._active+"]").children("span.operate.remove").addClass("hidden");
        		}else{
        			$("span.operate",this.fieldTabs).addClass("hidden");
        			$("a[href=#tabs-"+this._active+"]").children("span.operate").removeClass("hidden");
        		}
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        })).complete(this.proxy(function(){
        }));	
    },
    getFieldData:function(term,page){
    	var data = null;
    	$.u.ajax({
        	url: $.u.config.constant.smsqueryserver,
            type:"post",
            dataType: "json",
            async:false,
            cache: false,
            data: {
            	"tokenid":$.cookie("tokenid"),
				"method":"getallfields",
				"screenId":this.configScreenId,
				"rule":JSON.stringify([[{"key":"name","op":"like","value":term}]])
  			}
        },this.$, {size:2, backgroundColor:"#fff"}).done(this.proxy(function(response){
        	if(response.success){
        		data = $.grep(response.data.aaData, function(item, idx){
                    return item.renderer !== null;
                });
        	}
        })).fail(this.proxy(function(jqXHR,errorText,errorThrown){
        	
        })).complete(this.proxy(function(jqXHR,errorStatus){

        }));
    	return data;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.fieldscreen.configScreen.widgetjs = ['../../../uui/widget/jqurl/jqurl.js',
                                             '../../../uui/widget/select2/js/select2.min.js'];
com.sms.fieldscreen.configScreen.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                              {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"}];