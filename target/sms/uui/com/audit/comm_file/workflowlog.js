//@ sourceURL=com.audit.comm_file.workflowlog
$.u.define('com.audit.comm_file.workflowlog', null, {
    init: function (option) {
    	/**
	   	 {
	   	 	data:[] // 工作流业务日志
	   	 } 
	   	 */
    	this._options = option || {};
    	this.trTemplate = '<tr>'
							+'<td>'
								+'<table class="transition">'
									+'<tbody>'
										+'<tr>'
											+'<td width="7%" valign="center">'
												+'<img src="../../../img/#{fromimg}.png" width="16" height="16"/>'
											+'</td>'
											+'<td width="40%" valign="top">&nbsp;#{fromname}</td>'
											+'<td width="6%" align="center" valign="top" nowrap="nowrap">'
												+'#{toright}'
											+'</td>'
											+'<td width="7%" valign="center">'
												+'#{toimg}'
											+'</td>'
											+'<td width="40%" valign="top">&nbsp;#{toname}</td>'
										+'</tr>'
									+'</tbody>'
								+'</table>'
							+'</td>'
							+'<td>#{time_in}</td>';
							/*+'<td><a href="'+this.getabsurl("../ViewProfile.html")+'?id=#{userid}">#{user}</a></td>'
							+'<td>#{last_update}</td>'
						  +'</tr>';*/
    },
    afterrender: function (bodystr) {
    	this.tbody = this.qid("listcontainer");	// 流程数据容器
    	this._draw();
    },
    /**
     * @title 生成流程日志表格
     * @return void
     */
    _draw:function(){
    	if(this._options.data){
    		var html = "";
    		$.each(this._options.data,this.proxy(function(idx,item){
    			var to_statusname = item.to_status ? item.to_status.name :"";
    			var to_statuscategory = item.to_status ? this._getImgByCategory(item.to_status.category) :"";
    			var toright = to_statuscategory=="" ? "" : "<img src='../../../img/arrow_right_small.gif' width='16' height='16'/>";
    			to_statuscategory = to_statuscategory=="" ? "" : "<img src='../../../img/"+to_statuscategory+".png' width='16' height='16'/>";
    			var time_in = item.time_in ? this._formatMs(item.time_in) : "";
    			var last_update = item.last_update ? item.last_update : "";
    			html = this.trTemplate.replace(/#\{fromname}/g,item.from_status?item.from_status.name:"")
    								  .replace(/#\{fromimg}/g,this._getImgByCategory(item.from_status.category))
    								  .replace(/#\{toname}/g,to_statusname)
    								  .replace(/#\{toright}/g,toright)
    								  .replace(/#\{toimg}/g,to_statuscategory)
    								  .replace(/#\{time_in}/g,time_in);
    								/*.replace(/#\{user}/g,item.user.fullname)
    								  .replace(/#\{userid}/g,item.user.id)
    								  .replace(/#\{last_update}/g,this._formatDate(item.last_update));*/
    			html += "<td>";
    			for(i in item.users){
    				html += '<a href="'+this.getabsurl("../../sms/ViewProfile.html")+'?id='+item.users[i].id+'">'+item.users[i].fullname+'</a>  '
    			}
    			html += "</td><td>"+last_update+"</td></tr>";
    			$(html).appendTo(this.tbody);
    		}));
    	}
    },
    /**
     * @title 转换毫秒数为“xx天xx小时xx分钟”格式字符串
     * @param {int} ms 待转换的字符串
     * @return {string} 转换好格式的字符串，如：xx天xx小时xx分钟
     */
    _formatMs:function(msd){
    	var time = parseFloat(msd) / 1000;
        if (null != time && "" != time) {
            if (time > 60 && time < 60 * 60) {
                time = parseInt(time / 60.0) + "分钟" + parseInt((parseFloat(time / 60.0) -
                    parseInt(time / 60.0)) * 60) + "秒";
            }
            else if (time >= 60 * 60 && time < 60 * 60 * 24) {
                time = parseInt(time / 3600.0 / 24.0) + "天" +
                	   parseInt(time / 3600.0) + "小时" + 
                	   parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) + "分钟" ;
                       parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)-
                       parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "秒";
            }
            else if (time >= 60 * 60 * 24) {
                time = parseInt(time / 3600.0 / 24.0) + "天" +
                	   parseInt((time / 3600.0)%24) + "小时" + 
                	   parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) + "分钟" ;
                       parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)-
                       parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "秒";
            }else if(time <= 60){
                time += "秒";
            }
        }
        return time;
    },
    /**
     * @title 转换日期字符串为yyyy-MM-dd hh:mm:ss格式字符串
     * @param {string} date 待转换的字符串
     * @return {string} 转换好格式的字符串，如：yyyy-MM-dd hh:mm:ss
     */
    _formatDate:function(date){
    	var result = date;
    	try{
    		result = (new Date(date)).format("yyyy-MM-dd hh:mm:ss");
    	}catch(e){
    		
    	}
    	return result;
    },
    /**
     * @title 通过category获取图片
     * @param {string} category 状态节点的category属性信息
     * @return {string} 流程状态表示的图片文件名 
     */
    _getImgByCategory:function(category){
    	var src = "";
    	switch(category){
	    	case "IN_PROGRESS":
	    		src = "inprogress";
	    		break;
	    	case "NEW":
	    		src = "open";
	    		break;
	    	case "COMPLETE":
	    		src = "closed";
	    		break;
	    	// no default
    	}
    	return src;
    },
    destroy: function () {
        this._super();
    }
}, { usehtm: true, usei18n: true });

com.audit.comm_file.workflowlog.widgetjs = ["../../../uui/widget/spin/spin.js", 
                                             "../../../uui/widget/jqblockui/jquery.blockUI.js",
                                             "../../../uui/widget/ajax/layoutajax.js"];
com.audit.comm_file.workflowlog.widgetcss = [];