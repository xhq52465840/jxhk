//@ sourceURL=com.sms.filter.subscriptions
$.u.load("com.sms.common.stdComponentOperate");
$.u.load("com.sms.common.stdcomponentdelete");
$.u.define('com.sms.filter.subscriptions', null, {
    init: function (options) {
        this._options = options;
    },
    afterrender: function (bodystr) {
    	this.i18n = com.sms.filter.subscriptions.i18n;

    	this.id=$.urlParam().id;
    	
    	if(!this.id){
			window.location.href="ManageFilters.html";
		} 
    	
    	this.btn_addSubscribe=this.qid("btn_addSubscribe");
    	
    	this.btn_addSubscribe.click(this.proxy(function(){
    		this.subscribe.open({"title":this.i18n.editSubscription,"dataobject":"subscribe","id":this.id});
    	}));

    	this.dataTable = this.qid("datatable").dataTable({
            searching: false,
            serverSide: true,
            bProcessing: true,
            ordering: false,
            pageLength:1000,
            "sDom":"",
            "columns": [
                { "title": this.i18n.subscriber ,"mData":"creator","sWidth":150},
                { "title": this.i18n.hasSubscriber ,"mData":"receive","sWidth":150},
                { "title": this.i18n.schedule ,"mData":"cronexpression","sWidth":150},
                { "title": this.i18n.lastSend ,"mData":"lastSend","sWidth":200},
                { "title": this.i18n.handle ,"mData":"id"}
            ],
            "aaData":[
                      
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
            	$.extend(aoData,{
            		"tokenid":$.cookie("tokenid"),
            		"method":"stdcomponent.getbysearch",
            		"dataobject":"subscribe",
            		"search":"",
            		"rule":JSON.stringify([[{"key":"filtermanager","value":parseInt(this.id)}]])
            	},true);
            }),
            "fnServerData": this.proxy(function (sSource, aoData, fnCallBack, oSettings) {
            	$.u.ajax({
                    url: $.u.config.constant.smsqueryserver,
                    dataType: "json",
                    type:"post",
                    cache: false,
                    data: aoData
                },this.qid("datatable")).done(this.proxy(function (data) {
                	console.log(data);
                    if (data.success) {
                    	if(data.data.aaData.length>0){
                    		this.qid("filter-name").text(data.data.aaData[0]["filtermanager"]);
                    	}
                        fnCallBack(data.data);
                    }
                })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

                })).complete(this.proxy(function(){
                }));
            }),
            "aoColumnDefs": [
                {
                    "aTargets": 0,
                    "mRender": function (data, type, full) {
                    	return  '<P>' + data + '</P>' ;
                    }
                },
                {
                    "aTargets": 1,
                    "mRender": function (data, type, full) {
                    	return  '<P>' + (full. receive || full.receivegroup)+ '</P>' ;
                    }
                },
                {
                    "aTargets": 2,
                    "mRender": function (data, type, full) {
                    	if(data){
                    		var arr = data.split(" ");
                        	var time = arr[2];
                        	var day = arr[3].substr(arr[3].length-1);
                        	data = "每隔" + day + "天 " + time + "点";
                    	}
	                	return data;
                    }
                },
                {
                    "aTargets": 3,
                    "mRender": function (data, type, full) {
                    	return  '<P>' + (data?data:"NEVER")+ '</P>' ;
                    }
                },
                {
                    "aTargets": 4,
                    "mRender": function (data, type, full) {
                    	return "<button class='btn btn-link edit' data-data='"+JSON.stringify(full)+"'>"+com.sms.filter.subscriptions.i18n.edit+"</button>"+
		             	   "<button class='btn btn-link delete' data-data='"+JSON.stringify(full)+"'>"+com.sms.filter.subscriptions.i18n.remove+"</button>"+
		             	  "<button class='btn btn-link execute' data-data='"+JSON.stringify(full)+"'>"+com.sms.filter.subscriptions.i18n.immediate+"</button>";
                    }
                }
            ]
        });
    	
        this.subscribe.override({
    		refreshDataTable:this.proxy(function(){
    			this.dataTable.fnDraw();
    		})
    	});
    	
    	// 编辑界面
    	this.dataTable.off("click", "button.edit").on("click", "button.edit", this.proxy(function (e) {
            e.preventDefault();
            try{
            	var $fav = $(e.currentTarget);
                var datajson = JSON.parse($fav.attr("data-data"));
        		this.subscribe.open({"title":this.i18n.editSubscription,"dataobject":"subscribe","id":datajson.id,"data":datajson});
        	}catch(e){
        		throw new Error(this.i18n.editFail+e.message);
        	}
        }));
    	
    	// 删除
        this.dataTable.off("click", "button.delete").on("click", "button.delete", this.proxy(function (e) {
        	e.preventDefault();
        	try{
        		var data = JSON.parse($(e.currentTarget).attr("data-data"));
        		(new com.sms.common.stdcomponentdelete({
        			body:"<div>"+
        				 	"<p>"+this.i18n.affirm+"</p>"+
        				 "</div>",
        			title:this.i18n.removeSubscription+data.filtermanager,
        			dataobject:"subscribe",
        			dataobjectids:JSON.stringify([parseInt(data.id)])
        		})).override({
        			refreshDataTable:this.proxy(function(){
        				this.dataTable.fnDraw();
        			})
        		});
        	}catch(e){
        		throw new Error(this.i18n.removeFail+e.message);
        	}
        }));
        
        // 立即执行
    	this.dataTable.off("click", "button.execute").on("click", "button.execute", this.proxy(function (e) {
            e.preventDefault();
            var data = JSON.parse($(e.currentTarget).attr("data-data"));
	    	$.u.ajax({
				url: $.u.config.constant.smsqueryserver,
				type:"post",
	            dataType: "json",
	            data:{
	            	tokenid:$.cookie("tokenid"),
	            	method:"excuteImmediately",
	        		subscribeId:data.id
	            }
			},this.$,{size:2,backgroundColor:"#fff"}).done(this.proxy(function(response){
				if(response.success){
					$.u.alert.success("发送成功！");
					this.dataTable.fnDraw();
				}
			})).fail(this.proxy(function(jqXHR,errorText,errorThrown){
				
			}));
        }));
        
    },
    analysis:function(data){
    	var arr = data.split(" ");
    	
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.filter.subscriptions.widgetjs = ['../../../uui/widget/jqurl/jqurl.js','../../../uui/widget/jqdatatable/js/jquery.dataTables.js', '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js'];
com.sms.filter.subscriptions.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];