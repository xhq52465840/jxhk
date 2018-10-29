function myAjaxModify(data, targetobj, callback) {
	_myAjax({url:$.u.config.constant.smsmodifyserver}, data, targetobj, callback);
}
function myAjaxQuery(data, targetobj, callback) {
	_myAjax({url:$.u.config.constant.smsqueryserver}, data, targetobj, callback);
}
function _myAjax(param, data, targetobj, callback) {
	ajaxParam = {
		url : $.u.config.constant.smsmodifyserver,
		type : "post",
		dataType : "json",
		data :   $.extend({"tokenid":$.cookie("tokenid")}, data || {})
	}
	ajaxParam = $.extend(ajaxParam, param || {})
	$.u.ajax(ajaxParam, targetobj).done(callback);
}
function vueLoad(){
	//定义,注册分页组件
		Vue.component('pagebars', {
			props: {
				pagemsg : Object,  // 总条数all,当前页码cur,当前条数start,单页条数length,
				pagefun : Function, 
			},
			data: function () {
		    return {
		      total: 1,
		    };
		  },
		  template: '<div style="cursor:pointer;float:right;">'+
										 '		<div v-if="showFirst" style="display:inline;"><a v-on:click="btnFirstClick(pagemsg.cur--)">上一页&nbsp;</a></div>'+
			 							 '		<div v-if="showStart" style="display:inline;"><a v-on:click="btnStartClick()">1...&nbsp;</a></div>'+
		  							 '		<div v-for="index in indexs" style="display:inline;"><a v-on:click="btnClick(index)" v-bind:class="{\'onpagebars\':pagemsg.cur == index}" >{{ index }}&nbsp;</a></div>'+
		  							 '		<div v-if="showEnd" style="display:inline;"><a v-on:click="btnEndClick()">...{{total}}&nbsp;</a></div>'+
		  							 '		<div v-if="showLast" style="display:inline;"><a v-on:click="btnLastClick(pagemsg.cur++)">下一页&nbsp;</a></div>'+					
		  							 '		<div style="display:inline;">共{{total}}页&nbsp;</div>'+
		  							 '		<div style="display:inline;">共{{pagemsg.all}}条数据</div>'+
			  						   '</div>',
			computed : {
				indexs : function() {
					var left = 1;
					var right = this.total;
					var ar = [];
					if (this.total >= 6) {
						if (this.pagemsg.cur > 2 && this.pagemsg.cur < this.total - 2) {
							left = this.pagemsg.cur - 2;
							right = this.pagemsg.cur + 2;
						} else {
							if (this.pagemsg.cur <= 3) {
								left = 1;
								right = 5;
							} else {
								right = this.total;
								left = this.total - 4;
							}
						}
					}
					while (left <= right) {
						ar.push(left);
						left++;
					}
					return ar;
				},
				showLast : function() {
					if (this.pagemsg.cur != this.total && this.total > 1) {
						return true;
					}
					return false;
				},
				showFirst : function() {
					if (this.pagemsg.cur > 1) {
						return true;
					}
					return false;
				},
				showStart : function() {
					var length = this.pagemsg.length;
				  this.total = this.pagemsg.all % length == 0 ? this.pagemsg.all / length : parseInt(this.pagemsg.all / length) + 1; //总条数计算出总页数
					if (this.pagemsg.cur > 3 && this.total >= 6) {
						return true;
					}
					return false;
				},
				showEnd : function() {
					if (this.pagemsg.cur <= this.total - 3 && this.total >= 6) {
						return true;
					}
					return false;
				},
			},
		 methods : {
				btnClick : function(data) {// 页码点击事件
					if (data != this.pagemsg.cur) {
						this.pagemsg.cur = data;
					  this.pagemsg.start = (this.pagemsg.cur - 1) * this.pagemsg.length;
						var fun = this.pagefun;
						fun();
					}
				},
				btnStartClick : function() {
					this.pagemsg.cur = 1;
				  this.pagemsg.start = (this.pagemsg.cur - 1) * this.pagemsg.length;
					var fun = this.pagefun;
					fun();
				},
				btnEndClick : function() {
					this.pagemsg.cur = this.total;
				  this.pagemsg.start = (this.pagemsg.cur - 1) * this.pagemsg.length;
					var fun = this.pagefun;
					fun();
				},
				btnFirstClick : function(cur) {//上一页
				  this.pagemsg.start = (this.pagemsg.cur - 1) * this.pagemsg.length;
					var fun = this.pagefun;
					fun();
				},
				btnLastClick : function(cur) {//下一页
				  this.pagemsg.start = (this.pagemsg.cur - 1) * this.pagemsg.length;
					var fun = this.pagefun;
					fun();
				},
		 },
		});//ppagebars
		//select2控件指令	
		Vue.directive('select', {		
			priority : 2000,
			twoWay : true,
			params : [ 'options' ],
			bind : function() {
				var self = this;
				$(this.el).select2({
					data : this.params.options,
					multiple : self.modifiers.multiple,//多选需设置参数 v-select.multiple
					placeholder: "请选择",
					allowClear : self.modifiers.allowclear,//清除输入框 v-select.allowclear
				}).on('change', function() {
					self._watcher.set(this.value);
				})
			},
			update : function(value, oldvalue) {
				var self = this;
				Vue.nextTick(function() {
					$(self.el).val(value).trigger('change');
					if (value != oldvalue && oldvalue != null) {
						var selectOn = $(self.el).attr('selectOnChange');
						if(selectOn!=undefined){
							self.vm[selectOn]($(self.el));
						}
					}
				})
			},
			unbind : function() {
				$(this.el).off().select2('destroy');
			},
			paramWatchers: {
				options: function (val, oldVal) {
		      $(this.el).select2({
		      	data : val,
		      	multiple : this.modifiers.multiple,
		      	placeholder: "请选择",
		      	allowClear : this.modifiers.allowclear,
		      });
		    }
		  },
		});//

		//排序指令
		Vue.directive('sortfun', {
			priority : 2000,
			params : [ 'options' ],
			bind : function() {
				var self = this;
				Vue.nextTick(function() {
					$(self.el).css({
						"cursor":"pointer",
					  });
					$(self.el).append('<span class="arrow"></span>');
					$(self.el).click(function() {
						self.params.options.sortby = $(self.el).attr('sortby');
						if(self.params.options.sortorders=='asc'){
							self.params.options.sortorders = 'desc';
							$(self.el).parent().find('span').removeClass('asc');
							$(self.el).find('span').addClass('dsc');
						}else{
							self.params.options.sortorders = 'asc';
							$(self.el).parent().find('span').removeClass('dsc');
							$(self.el).find('span').addClass('asc');
						}
						if(self.vm.pagebarsData!=undefined){
							self.vm.pagebarsData.cur=1;
							self.vm.pagebarsData.start=0;
						}
						self.vm[self.expression]();				
					})
					if(self.modifiers.start){
						$(self.el).click();
					}
	      })
			}
		});//
		
	//威胁差错树
		Vue.component('eventitem', {
		  template: '<li>'+
		                 '  <div :class="{\'liColor\': model.deleted, \'cur\': cur}" @click="toggle" @dblclick="changeType">'+
		                 '    {{model.name}}'+
		                 '    <span v-if="isFolder">[{{open ? "-" : "+"}}]</span>'+
		                 '  </div>'+
		                 '  <ul v-show="open" v-if="isFolder">'+
		                 '    <eventitem class="item" v-for="model in model.children" :model="model"></eventitem>'+
		                 '    <li v-if="model.level>0" :class="{\'cur\': cur2}" @click="addChild">......点击新增（请在右侧保存）</li>'+
		                 '  </ul>'+
		                 '</li>',

		  props: {
		    model: Object
		  },
		  
		  data: function () {
		  	var isOpen = false;
		  	if(this.$root.threatEvent.parentNode == this.model.id){
		  		this.$parent.open = true;
		  		isOpen = true;
		  	}
		  	var isCur = false;
	    	if(this.$root.threatEvent.number == this.model.number && this.$root.threatEvent.number != 0){
	    		isCur = true;
		  	}
		    return {
		    	open: isOpen,
		    	cur: isCur,
		    	cur2: false,
		    }
		  },
		  
		  computed: {
		    isFolder: function () {	
		      return this.model.children && this.model.children.length;
		    },
		  },
		  
		  methods: {
		    toggle: function () {
		    	var eachFun = function (data,value) {
	    		  var dataNow = data;
	    		  dataNow[value]=false;
	      		if(dataNow.$children!=undefined){
	      			for(var i=0; i<dataNow.$children.length; i++){
	      				eachFun(dataNow.$children[i],value);
	      			}
	      		}
	    	  }	
		    	eachFun(this.$root,'cur');
		    	eachFun(this.$root,'cur2');
	      	this.cur=true;
		      var openTemp = this.open;	     
		      
		      eachFun(this.$parent,'open');
	      	this.$parent.open = true;
	        this.open = !openTemp;

	        if(this.model.level>0){
	        	this.$root.threatEvent.id = this.model.id;
	        	this.$root.threatEvent.name = this.model.name;
	        	this.$root.threatEvent.number = this.model.number;
	        	this.$root.threatEvent.parentNode = this.model.parentNode;
	        	this.$root.threatEvent.parent_name = this.$parent.model.name;
	        	if(this.model.deleted==0){
	        		$('#btn_save').show();
	  	      	$('#btn_del').show();
	  	      	$('#btn_add').hide();
	        	}else{
	        		$('#btn_save').hide();
	  	      	$('#btn_del').hide();
	  	      	$('#btn_add').show();
	        	}
	        }else{
	      		$('#btn_save').hide();
		      	$('#btn_del').hide();
		      	$('#btn_add').hide();
	      	}	      	

		    },
		    
		    changeType: function () {
		    	var eachFun = function (data,count) {
		    		count++;
	    		  var dataNow = data;
	      		if(dataNow.$children!=undefined){
	      			var countMax = 0;
	      			for(var i=0; i<dataNow.$children.length; i++){
	      				var countTemp = eachFun(dataNow.$children[i],count);
	      				countMax = countTemp>countMax?countTemp:countMax;
	      			}
	      			if(dataNow.$children.length!=0){
	      				return countMax;
	      			}else{
	      				return count;
	      			}    			
	      		}else{
	      			return count;
	      		}
	    	  }	
		    	var count = eachFun(this.$root,0)-2;
		      if (!this.isFolder&&this.model.level<count&&this.model.deleted!=true) {
		        Vue.set(this.model, 'children', []);
		        this.model.children.push({
		        	id: null,
		          name: '新增项,请修改',
		          number:  this.model.number+'001',
		          parentNode: this.model.id,
		          parent_name: this.model.name,
		          deleted: false,
		          level: this.model.level+1,
		        });
		        var changeTemp = this;
		        Vue.nextTick(function() {
		        	changeTemp.$children[0].toggle();
		        	$('#btn_save').trigger('click');
		        })	        
		      }
		    },
		    
		    addChild: function () {
		    	var eachFun = function (data,value) {
	    		  var dataNow = data;
	    		  dataNow[value]=false;
	      		if(dataNow.$children!=undefined){
	      			for(var i=0; i<dataNow.$children.length; i++){
	      				eachFun(dataNow.$children[i],value);
	      			}
	      		}
	    	  }	
		    	eachFun(this.$root,'cur');
		    	eachFun(this.$root,'cur2');
	      	this.cur2=true;
	      	
					var lastModel = this.$children[this.$children.length - 1].model;
					var number = lastModel.number;
					var no = number.substr(number.length - 3, 3);
					no = parseInt(no, 10) + 1;
					no = (Array(3).join(0) + no).slice(-3);
					number = this.model.number + no;	
		    	this.$root.threatEvent.id = null;
		    	this.$root.threatEvent.name = '';
	      	this.$root.threatEvent.number = number;
	      	this.$root.threatEvent.parentNode = this.model.id;
	      	this.$root.threatEvent.parent_name = this.model.name;      
	      	$('#btn_save').show();
	      	$('#btn_del').hide();
	      	$('#btn_add').hide();
		    }
		  }
		});//
		
		
		
		
		Vue.filter('shortTitle', function(data) {
			var shortTitle = data.replace(/<[^>].*?>/g,"");
	   	    if(shortTitle.length > 80){
	   		  shortTitle = shortTitle.substr(0,80)+"...";
	        };
	        return shortTitle;
		});
		Vue.filter('titleToolTtip', function(data) {
			 data = data.replace(/<[^>].*?>/g,"");
			 data = data.replace("&nbsp;","");
	        return data;
		});
		Vue.filter('datestr', function(value) {
			var date = new Date(value);
			if ( isNaN(date)==true ) return value;
			return date.format("yyyy-MM-dd");
		});
	}
vueLoad();