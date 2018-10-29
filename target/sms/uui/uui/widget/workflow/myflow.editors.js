(function($){
var myflow = $.myflow;

$.extend(true, myflow.editors, {
	inputEditor : function(){
		var _props,_k,_div,_src,_r;
		this.init = function(props, k, div, src, r){
			_props=props; _k=k; _div=div; _src=src; _r=r;
			
			$('<input style="width:100%;"/>').val(props[_k].value).change(function(){
				props[_k].value = $(this).val();
			}).appendTo('#'+_div);
			
			$('#'+_div).data('editor', this);
		}
		this.destroy = function(){
			$('#'+_div+' input').each(function(){
				_props[_k].value = $(this).val();
			});
		}
	},
	selectEditor : function(arg, ary){
		var _props,_k,_div,_src,_r;
		this.init = function(props, k, div, src, r){
			_props=props; _k=k; _div=div; _src=src; _r=r;

			var sle = $('<select style="width:100%;"/>').val(props[_k].value).change(function(){
				props[_k].value = $(this).val();
			}).appendTo('#'+_div);
			
			if(typeof arg === 'string'){
				// ------------------------------
				var argStr = "";
				if(ary){
					for(var i=0;i<ary.length;i++){
						argStr += ary[i];
						argStr += "=";
						if(ary[i] == "type"){
							argStr += myflow.config.props.props.type.value;
						} else if (ary[i] == "nodeType"){
							argStr += props.type.value;
						}
						argStr += "&";
					}
					if(argStr != ""){
						argStr = argStr.substring(0, argStr.length - 1);
					}
				}
				// ------------------------------
				$.ajax({
					async: false,
					type: "GET",
					url: arg,
					data: argStr,
					contentType: "application/x-www-form-urlencoded; charset=utf-8",
					success: function(data){
						var opts = eval(data);
						if(opts && opts.length){
							for(var idx=0; idx<opts.length; idx++){
								sle.append('<option value="'+opts[idx].value+'">'+opts[idx].name+'</option>');
							}
							sle.val(_props[_k].value);
							if(sle.val() == "") {
								props[_k].value = opts[0].value;
							} else {
								props[_k].value = sle.val();
							}
						}
					}
				});
			}else {
				for(var idx=0; idx<arg.length; idx++){
					sle.append('<option value="'+arg[idx].value+'">'+arg[idx].name+'</option>');
				}
				sle.val(_props[_k].value);
			}
			
			$('#'+_div).data('editor', this);
		};
		this.destroy = function(){
			$('#'+_div+' input').each(function(){
				_props[_k].value = $(this).val();
			});
		};
	}
});

})(jQuery);