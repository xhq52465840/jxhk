//@ sourceURL=com.sms.workflow.textView
$.u.define('com.sms.workflow.textView', null, {
    init: function (options) {
        this._options = options;
        this.id=null;
    },
    afterrender: function (bodystr) {
    	var maxHeight=$(window).height()*0.8;
    	$(".textview-container",this.$).css({"max-height":maxHeight,"overflow-y":"auto"});
    	this.textViewDialog = $(".textview",this.$).dialog({
    		modal:true,
    		width:810,
    		resizable:false,
    		draggable: false,
    		position:["center",30],
    		autoOpen:false,
    		open:this.proxy(this.loadPathList),
    		buttons:[{
    			'text':'关闭',
    			'class':'aui-button-link',
    			'click':this.proxy(function(){
    				this.textViewDialog.dialog("close");
    			})
    		}]
    	});
    },
    /**
     * 打开模态层
     * @param params {id:"",title:""}
     */
    open:function(params){
    	this.id=params.id;
    	this.textViewDialog.dialog("option","title",params.title).dialog("open");
    },
    /**
     * @title 加载步骤列表
     * @param e
     */
    loadPathList:function(e){
    	var $tbody = this.qid("tbody").empty();
    	$.u.ajax({
            url: $.u.config.constant.workflowserver,
            dataType: "json",
            cache: false,
            data: {
	    		"sv":"PathList",
	    		"user_id":$.cookie("userid"),
	    		"tokenid":$.cookie("tokenid"),
	    		"wt_id":this.id
	    	}
        },this.textViewDialog.parent(), {size:2, backgroundColor:"#fff"}).done(this.proxy(function (response) {
            if(response.success !== false){
                if (response.responseHeader.status == 0) {
                	var $tr=null;
                	$.each(response.responseData.list,this.proxy(function(rect,paths){
                        $tr = $("<tr/>").appendTo($tbody);
                		$("<td/>").attr("rowspan",paths.length).html("<span class='label "+this.getLabel(paths[0].from_category)+"'>"+rect+"</span>").appendTo($tr);
                		$.each(paths,this.proxy(function(idx,path){
                			if(idx == 0){
                				$("<td>"+path.path_name+(path.screen ? "<br/><a href='../fieldscreen/ConfigFieldScreen.html?id="+path.screen_id+"'>"+path.screen+"</a>" : "<br/>"+com.sms.workflow.textView.i18n.configPanel+"")+"</td><td><i class='fa fa-long-arrow-right fa-1'></i></td><td><span class='label "+this.getLabel(path.to_category)+"'>"+path.to+"</span></td>").appendTo($tr);
                			}else{
                				$("<tr><td>"+path.path_name+(path.screen ? "<br/><a href='../fieldscreen/ConfigFieldScreen.html?id="+path.screen_id+"'>"+path.screen+"</a>" : "<br/>"+com.sms.workflow.textView.i18n.configPanel+"")+"</td><td><i class='fa fa-long-arrow-right fa-1'></i></td><span class='label "+this.getLabel(path.to_category)+"'>"+path.to+"</span></tr>").appendTo($tbody);
                			}
                		}));
                	}));
                }else{
                	$.u.alert.error(response.responseHeader.msg);
                }
            }
        })).fail(this.proxy(function (jqXHR, errorText, errorThrown) {

        }));
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
    	this.textViewDialog.dialog("destroy").remove();
        this._super();
    }
}, { usehtm: true, usei18n: true });


com.sms.workflow.textView.widgetjs = ['../../../uui/widget/jqdatatable/js/jquery.dataTables.js', 
                                      '../../../uui/widget/jqdatatable/js/dataTables.bootstrap.js',
                                      "../../../uui/widget/spin/spin.js",
                                      "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                      "../../../uui/widget/ajax/layoutajax.js"];
com.sms.workflow.textView.widgetcss = [{ path: '../../../uui/widget/jqdatatable/css/jquery.dataTables.css' }, { path: '../../../uui/widget/jqdatatable/css/dataTables.bootstrap.css' }];