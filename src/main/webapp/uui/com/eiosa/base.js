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
function openAttach(attachId) {
	var url = "http://" + window.location.host + "/sms/query.do?"
	+ "nologin=Y&method=downloadLosaFiles&fileId=" + attachId;
	//location.href = url;
	window.open(url);
}
function getUrlBase() {
	var url = location.href;
	var i = url.lastIndexOf("/");
	return i<=0 ? url : url.substring(0,i+1);
}

function setDis() {
	var dis = "";
	if ($("#org").is(':checked') == true) {
		dis += $("#org").val() + ",";
	}
	if ($("#flt").is(':checked') == true) {
		dis += $("#flt").val() + ",";
	}
	if ($("#dsp").is(':checked') == true) {
		dis += $("#dsp").val() + ",";
	}
	if ($("#mnt").is(':checked') == true) {
		dis += $("#mnt").val() + ",";
	}
	if ($("#cgo").is(':checked') == true) {
		dis += $("#cgo").val() + ",";
	}
	if ($("#grh").is(':checked') == true) {
		dis += $("#grh").val() + ",";
	}
	if ($("#cab").is(':checked') == true) {
		dis += $("#cab").val() + ",";
	}
	if ($("#sec").is(':checked') == true) {
		dis += $("#sec").val() + ",";
	}
	;
	return dis;
};

function getDis(value) {
	var strs = value.split(",");
	for (var i = 0; i < strs.length; i++) {
		if (strs[i] == "ORG") {
			document.getElementById("org").checked = true;
		}
		if (strs[i] == "FLT") {
			document.getElementById("flt").checked = true;
		}
		if (strs[i] == "DSP") {
			document.getElementById("dsp").checked = true;
		}
		if (strs[i] == "MNT") {
			document.getElementById("mnt").checked = true;
		}
		if (strs[i] == "CGO") {
			document.getElementById("cgo").checked = true;
		}
		if (strs[i] == "GRH") {
			document.getElementById("grh").checked = true;
		}
		if (strs[i] == "CAB") {
			document.getElementById("cab").checked = true;
		}
		if (strs[i] == "SEC") {
			document.getElementById("sec").checked = true;
		}
	}

};
function canleCheck() {
	document.getElementById("org").checked = false;
	document.getElementById("flt").checked = false;
	document.getElementById("dsp").checked = false;
	document.getElementById("mnt").checked = false;
	document.getElementById("cgo").checked = false;
	document.getElementById("grh").checked = false;
	document.getElementById("cab").checked = false;
	document.getElementById("sec").checked = false;
}
// 查找书

$(function ()  {
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
				placeholder: "请输入",
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
	      	placeholder: "请输入",
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
      })
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
	
});