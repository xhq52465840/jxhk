$.u.define('com.eiosa.message.message', null, {
	init : function(options) {
		this._options = options || null;
		
	},
	afterrender : function() {
		
		this.messageVue= new Vue({
			              el : '#message',
			              data:{message:{'detail':'','targetId':this._options.isarpId},
			            	    receiver:'',
			            	    type:this._options.type,
			            	    },
			              methods : {
			            	  save:this.proxy(this._save),
			            	  close:this.proxy(this._close),
			            	  noAudited:this.proxy(this._noAudited)
			              }
		                   });
		//信息接收人添加select2事件
		$("#messageReceiver").select2({
			ajax: {
                url: $.u.config.constant.smsqueryserver,
                dataType: "json",
                type: "post",
                data: this.proxy(function(term, page){
                    return {
                    	tokenid: $.cookie("tokenid"),
                        method: "getEiosaUsers",
                
                        userName: term
                    };
                }),
                results: this.proxy(function(response){
                	
                    if(response.success){
                        return {
                        	 "results": response.data.aaData
                        }
                    }
                })
                
            },
            placeholder : "请输入接收人",
            tags:true,
            id: function(item){
                return item.id;
            },

            formatResult:function(item){
            	 return item.fullname+"("+item.username+")"
            },
            formatSelection:function(item){
            	 return item.fullname
            }
		});
	},
	_save:function(){
		
			
		
		var data = {
				"method":"saveMessage",
	       	    "message":JSON.stringify(this.messageVue.message),
	       	    "receiver":this.messageVue.receiver,
	       	    "type":this.messageVue.type,
	       	    "sendToNotice":document.getElementById("sendToNotice").checked,
	       	    "assessment" : parseInt(parent.isarpvue.isarpAll.assessment),
				"reason" : parent.isarpvue.isarpAll.isarp.reason,
				"rootCause" : parent.isarpvue.isarpAll.isarp.rootCause,
				"taken": parent.isarpvue.isarpAll.isarp.taken,
				"comments" : parent.isarpvue.isarpAll.isarp.comments
	       	    
		};
		
		myAjaxModify(data, $("#message"), this.proxy(function(response) {
			if(response.success){
				parent.isarpvue.queryLog(this._options.isarpId);
				parent.isarpvue.queryIsarp(this._options.isarpId);
				if(parent.eiosaMainUm!= undefined){
					parent.eiosaMainUm.isarpStatusChange=true;
				}
				
				this._close();
				
				$.u.alert.success("保存成功");
				
				
			}else{
				$.u.alert.error("保存失败");
			}
		}));
		
	},
	
	_noAudited:function(){
		this.messageVue.$set('type',"noAudited");
		this._save();
	},
	_close : function(e) {
		var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
		
		parent.layer.close(index);
	},
	
	
	

}, {
	usehtm : true,
	usei18n : false
});

com.eiosa.message.message.widgetjs = [
                                     '../../../uui/widget/select2/js/select2.min.js',
       							  '../../../uui/widget/spin/spin.js',
       							  '../../../uui/widget/jqblockui/jquery.blockUI.js',
       							  '../../../uui/widget/ajax/layoutajax.js',
       							  '../../../uui/widget/validation/jquery.validate.js',
       							 '../../../uui/vue.js',
       							"../base.js"
       							
       							  ];
com.eiosa.message.message.widgetcss = [{id:"",path:"../../../uui/widget/select2/css/select2.css"},
                                           {id:"",path:"../../../uui/widget/select2/css/select2-bootstrap.css"},
                                           { path: '../../../css/eiosa.css' }];