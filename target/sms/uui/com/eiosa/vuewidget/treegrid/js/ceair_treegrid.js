Vue.config.debug = true
/*
	参数：
		{Array<Object>}  dataObject | Tag:data-object		存放下拉框所需的数据
		{Object}  options | Tag:options		一些选项
		{Function}  inputTips | Tag:input-tips		当输入框不可编辑时提示用户不可输入的原因
		{String}  inputValue | Tag:input-value		下拉框中的值，和父元素双向绑定

	用法和试例：
		1、dataObject:[
			{xxx:'111',yyy:'222',zzz:'333'},
			{xxx:'111',yyy:'222',zzz:'333'}
		]
		
		2、options:{
				inputValueDisabled:false,
				isAjaxContentData:false,
				selectNewInputStyle:{
					left:'10px',top:'10px'
				},
				dataUrl:'127.0.0.1'
			}
			inputValueDisabled:  输入框是否可编辑  {Boolean}
			isAjaxContentData:  显示加载图标，当滚动条拖到最后需要加载后面的数据时使用  {Boolean}
			selectNewInputStyle:  下拉框的CSS，如显示的位置  {Object}
			dataUrl:  数据请求url {String}

		3、addData  点击下拉框加载数据      封装的method
			参数：
				__searchText  搜索框中的内容  {String}
				(1) 当__searchText为空的时候直接查询，如果__searchText不为空，则根据这个搜索词去查询。
		
		4、addMoreData  分批加载的数据      封装的method
			参数：
				__searchText  搜索框中的内容  {String}
				(1) 当__searchText为空的时候直接查询，如果__searchText不为空，则根据这个搜索词去查询。


		5、inputValue:{
				deptAirport:'',arrAirport:'',flyNo:''
		   }
			deptAirport:起飞机场  {String}
			arrAirport:到达机场  {String}
			flyNo:航班号  {String}

			这几个参数都是双向绑定
		
*/


	Vue.component('ceair_treegrid',{
		props:{
			isarplist:{
				type:Array,
				default:null
			},
			callhooks:{
				type:Array,
				required:true
			},
			rootpageobject:{
				type:Object
			},
			orders:{
				type:Object,
				default:{
					sortby : '', // 排序字段
					sortorders : 'asc',// 排序方式
				}
			}
		},
		data:function(){
			return {
				
			};
		},
		template:'<table class="ceair-uui-table">'+
					'<thead><tr>'+
						'<td v-sortfun="callhooks[0]" :options="orders" sortby="t7.sectionName" class="name w1" style="text-align:center">专业</td>'+
						'<td v-sortfun="callhooks[0]" :options="orders" sortby="t1.no" class="name w2">ISARPs</td>'+
						'<td class="name w3">协调人</td><td v-sortfun="callhooks[0]" :options="orders" sortby="t1.text" class="name w4" >Text</td>'+
						'<td class="name w5">Conformity</td><td class="name w6">FinishStatus</td>'+
						'<td v-sortfun="callhooks[0]" :options="orders" sortby="t11.code_name" class="name w7" >FlowStatus</td>'+
						'</tr></thead>'+
						'<tbody is="ceair_treegrid_item" :isarplist="isarplist" :rootpageobject="rootpageobject" :callhooks="callhooks"></tbody>'+
				'</table>',
		directives:{
			"sortfun":{
				priority : 2000,
				params : [ 'options'],
				update : function(value) {
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
								self.vm.$parent.pagebarsData.cur=1;
								self.vm.$parent.pagebarsData.start=0;
							}
							console.log(self.params.options);
							self.vm.rootpageobject[value].apply(self.vm.rootpageobject);				
						})
						if(self.modifiers.start){
							$(self.el).click();
						}
					});
				}
			}
		}

	});
