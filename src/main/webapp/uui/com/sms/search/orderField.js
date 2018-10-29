//@ sourceURL=com.sms.search.orderField
$.u.define('com.sms.search.orderField', null, {
    init: function (options) {
        this._options = options;
        this.template = "<li class='list-group-item'>#{name}</li>";
    },
    afterrender: function (bodystr) {
    	this.fieldContainer = this.qid("fieldcontainer");
    	this.search = this.qid("input_search");
    	this.fields=[];
    	
    	this.search.unbind("keyup").keyup(this.proxy(this._on_input_search_keyup));
    	this.fieldContainer.off("click","li.list-group-item").on("click","li.list-group-item",this.proxy(this._on_field_click));
    	
    	$.ajax({
            url: $.u.config.constant.smsqueryserver,
            dataType: "json",
            cache: false,
            data: {
        		"tokenid":$.cookie("tokenid"),
        		"method":"getallfields"
        	}
        }).done(this.proxy(function (response) {
        	if (response.success) {
        		this.fields = response.data.aaData;
        		$.each(this.fields,this.proxy(function(idx,item){
        			$(this.template.replace(/#\{name\}/g, item.name)).appendTo(this.fieldContainer).data("data",item);
        		}));
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
    	
    	
    },
    _on_field_click:function(e){
    	var field = $(e.currentTarget).data("data"); 
    	this.order(field);
    },
    _on_input_search_keyup:function(e){
    	var s = this.search.val();
    	this.fieldContainer.empty();
    	$.each(this.fields,this.proxy(function(idx,item){
    		if(item.name.indexOf(s) > -1){
    			$(this.template.replace(/#\{name\}/g,item.name)).appendTo(this.fieldContainer).data("data",item);
    		}
    	}));
    },
    /**
     * 用于override，进行排序操作
     * @param field 字段
     */
    order:function(field){},
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.search.orderField.widgetjs = [];
com.sms.search.orderField.widgetcss = [];