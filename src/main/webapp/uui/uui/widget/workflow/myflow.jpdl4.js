(function($){
var myflow = $.myflow;

$.extend(true,myflow.config.rect,{ // SMS: 覆盖矩形样式
	attr : {
		r : 8, 					  // SMS: 圆角度数
		width:78,				  // SMS: 矩形宽度
		height:28,				  // SMS: 矩形高度
		fill : '#F6F7FF',	      // SMS: 填充色 #F6F7FF (in porcess:#ffd351 done:#14892c new:#4a6785)
		stroke : '#03689A', 	  // SMS: 边条颜色
		"stroke-width": 1,  	  // SMS: 边条宽度
		cursor: "move"            // SMS: 矩形鼠标样式
		
	}
});

$.extend(true,myflow.config.props.props,{
	type:"template"
});

$.extend(true,myflow.config.path.props,{
	type:"path",
	name:"",
	description:"",
	screen:"",
	options:{
		property:{
			label:"属性",	
			umodule:"com.sms.workflow.property",
			value:[]
		},
		user:{
			label:"选人",
			umodule:"com.sms.workflow.commonFunction",
			option:{
				title:"选人",
				description:"1、系统“选人”功能列表中选中一项功能，点击下方“添加已选中功能”按钮添加功能<br/>2、当前“选人”功能列表中选中一项功能，右侧参数配置界面显示对应配置界面进行参数设置，点击下方“删除已选中功能”按钮删除功能",
				subtitles:["1、系统“选人”功能列表","2、当前“选人”功能列表","3、参数配置"],
				buttontitles:["添加已选中功能","删除已选中功能"],
				type:"选人"
			},
			value:[]
		},
		condition:{
			label:"触发条件",
			umodule:"com.sms.workflow.commonFunction",
			option:{
				title:"触发条件",
				description:"1、系统“触发条件”功能列表中选中一项功能，点击下方“添加已选中功能”按钮添加功能<br/>2、当前“触发条件”功能列表中选中一项功能，右侧参数配置界面显示对应配置界面进行参数设置，点击下方“删除已选中功能”按钮删除功能",
				subtitles:["1、系统“触发条件”功能列表","2、当前“触发条件”功能列表","3、参数配置"],
				buttontitles:["添加已选中功能","删除已选中功能"],
				type:"触发条件"
			},
			value:[]
		},
		validator:{
			label:"校验条件",
			umodule:"com.sms.workflow.commonFunction",
			option:{
				title:"校验条件",
				description:"1、系统“校验条件”功能列表中选中一项功能，点击下方“添加已选中功能”按钮添加功能<br/>2、当前“校验条件”功能列表中选中一项功能，右侧参数配置界面显示对应配置界面进行参数设置，点击下方“删除已选中功能”按钮删除功能",
				subtitles:["1、系统“校验条件”功能列表","2、当前“校验条件”功能列表","3、参数配置"],
				buttontitles:["添加已选中功能","删除已选中功能"],
				type:"校验条件"
			},
			value:[]
		},
		postFunction:{
			label:"结果处理",
			umodule:"com.sms.workflow.commonFunction",
			option:{
				title:"结果处理",
				description:"1、系统“结果处理”功能列表中选中一项功能，点击下方“添加已选中功能”按钮添加功能<br/>2、当前“结果处理”功能列表中选中一项功能，右侧参数配置界面显示对应配置界面进行参数设置，点击下方“删除已选中功能”按钮删除功能",
				subtitles:["1、系统“结果处理”功能列表","2、当前“结果处理”功能列表","3、参数配置"],
				buttontitles:["添加已选中功能","删除已选中功能"],
				type:"结果处理"
			},
			value:[]
		}
	}
});

$.extend(true,myflow.config.tools.states,{
	start : {
		showType: 'image',
		type : 'start',
		name : {text:'<<start>>'},
		text : {text:'开始'},
		img : {src : '/sms/uui/uui/widget/workflow/img/48/usky/开始.png',width : 38, height:38},
		attr : {width:50 ,heigth:50 },
		props : {
			type:"start",
			options:{
				property:{
					value:[{"key":"state","value":"1","readOnly":true}]
				}
			}
		}},
	end : {
		showType: 'image',
		type : 'end',
		name : {text:'<<end>>'},
		text : {text:'结束'},
		img : {src : '/sms/uui/uui/widget/workflow/img/48/usky/结束.png',width : 38, height:38},
		attr : {width:50 ,heigth:50 },
		props : {
			type:"end",
			options:{
				property:{
					value:[{"key":"state","value":"4","readOnly":true}]
				}
			}
		}},
	state : {
		showType: 'text',
		type : 'state',
		name : {text:'<<state>>'},
		text : {text:'任务节点'},
		img : {src : '/sms/uui/uui/widget/workflow/img/48/usky/任务节点.png',width :100, height:25},
		props : {
			type:"state",
			id:"",
			name:"",
			description:"",
			category:"",
			options:{
				property:{
					umodule:"com.sms.workflow.property",
					label:"属性",
					value:[{"key":"state","value":"","readOnly":true}]
				}
			}
		}}
});
})(jQuery);