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


	Vue.component('ceair_treegrid_item',{
		props:{
			isarplist:{
				type:Array,
				default:null
			},
			callhooks:{
				type:Array,
				required:true
			},
			arrowmarginleft:{
				type:Number,
				default:10
			},
			rootpageobject:{
				type:Object
			}
		},
		data:function(){
			return {
				changeAuditor:null,
				oddtrstyle:'',
				eventrstyle:'',
				arrowstyle:{
					'margin-left':'10px'
				},
				arrowmarginleftinc:12,
				arrowmarginleftinner:0,
				treearrowright:'treearrowright',
				treearrowdown:'treearrowdown',
				treearrow:[],
				treearrowinner:[],
			};
		},
		created:function(){
//			console.log("aaaaaa====");
			this.oddtrstyle = 'oddtrstyle';
			this.eventrstyle = 'eventrstyle';
			var isarplistLength = this.isarplist.length;
			for(var i=0;i<isarplistLength;i++){
				this.treearrow[i] = this.treearrowright;
			}
			this.arrowmarginleftinner = this.arrowmarginleft + this.arrowmarginleftinc;
			this.arrowstyle['margin-left'] = this.arrowmarginleft + "px";
		},
		template:'<tr v-for="il in isarplist" :class="[$index%2==0?oddtrstyle:eventrstyle]"><td colspan="7" style="width:100%;border:0px">'+
				 '<table style="width:100%">'+
				 '<tr>'+
					'<td class="w1"><div :class="treearrow[$index]" :style="arrowstyle" @click="showChildren($event,$index,rootpageobject)"></div>&nbsp;&nbsp{{ il.sectionName }}</td>'+
					  '<td class="w2" v-if="il.no.length<4"> {{ il.no }}</td>'+	
					  '<td class="w2" v-else>'+
						'<a href="#" v-on:click="isarpInfo($event)" data="{{il.isarpId}}" sectionId="{{il.sectionId}}" chapter="{{il.no}}" sectionName="{{il.sectionName}}"> {{ il.no }}</a>'+
					  '</td>'+														
					'<td class="value w3">'+ 
					  '<select  style="width:100%" v-model="il.dealer"   id="section{{il.isarpId}}" data="{{il.sectionId}}" no="{{il.no}}" isarpId="{{il.isarpId}}" taskId="{{il.taskId}}" options="il.auditors" v-on:change="changeManger($event)">'+
						'<option v-for="optionss in il.auditors"  v-bind:value="optionss.number">{{ optionss.name }}</option>'+
					  '</select>'+
					'</td>'+
					'<td class="isarpText w4"  title="{{il.text | titleToolTtipForTreeGridItem}}"> {{ il.text | shortTitleForTreeGridItem}}</td>'+
					'<td class="w5" sortby="t1.no">{{ il.conformity }}</td>'+
						'<td class="value1 w6" v-if="il.no.length<4">'+ 
							'<table class="table table-striped table-bordered">'+	
								'<tr>'+
									'<td style="width:31%;border:0px">ISARP:</td>'+
									'<td style="width:28%;color:#008000;border:0px">{{il.isarpFinish}}/{{il.isarpCount}}</td>'+
									'<td style="width:41%;color:#008000;border:0px">{{il.isarpPercent}}</td>'+
								'</tr>'+	  
								'<tr>'+
									'<td style="width:31%;border:0px"> AA:</td>'+
									'<td style="width:28%;color:#008000;border:0px">{{il.aaFinish}}/{{il.aaCount}}</td>'+
									'<td style="width:41%;color:#008000;border:0px">{{ style }} {{il.aaPercent}}</td>'+
								'</tr>'+
							'</table>'+
						'</td>'+     		
						'<td class="value1 w6" v-else>'+ 
							'<table class="table table-striped table-bordered">'+	  
								'<tr>'+
									'<td style="width:31%;border:0px">AA:</td>'+
									'<td style="width:28%;color:#008000;border:0px">{{il.aaFinish}}/{{il.aaCount}}</td>'+
									'<td style="width:41%;color:#008000;border:0px">{{il.aaPercent}}</td>'+
								'</tr>'+		     
							'</table>'+
						'</td>'+
					'<td class="w7"> {{ il.status }}</td>'+
				'</tr>'+
				'<tr v-if="il.children != undefined && il.children != null && il.children.length>0"><td colspan="7" style="width:100%;border:0px">'+
					'<table>'+
					'<tr is="ceair_treegrid_item" :isarplist="il.children" :arrowmarginleft="arrowmarginleftinner" :modifydataurl="modifydataurl" :querydataurl="querydataurl" :rootpageobject="rootpageobject" :callhooks="callhooks"></tr>'+
					'</table>'+
				'</td></tr></table>'+
				'</td></tr>',
		methods:{
			"isarpInfo":function(e){
				this.rootpageobject[this.callhooks[2]].call(this.rootpageobject,e);
			},
			"changeManger":function(e){
				this.rootpageobject[this.callhooks[1]].call(this.rootpageobject,e);
				
			},
			showChildren:function(e, index){
				if(this.treearrow[index] == this.treearrowdown){
					this.isarplist[index].children.splice(0,this.isarplist[index].children.length);
					this.treearrow.$set(index,this.treearrowright);
					return false;
				}
				var _that = this;
				var no = this.isarplist[index].no;
				var isarpNo = this.transformNoToIsarpno(no);
				if(isarpNo == ''){
					return false;
				}
				this.rootpageobject[this.callhooks[3]].call(this.rootpageobject,isarpNo,index,this,this.isarplist[index].sectionName);
			},
			transformNoToIsarpno:function(str){
				var count = this.calculateWordRepeatCount(str,'.');
				var strResult = '';
				switch(count){
					case 0:
						strResult = this.processStr(str);
						break;
					case 1:
						var strArray = str.split('.')
						for(var i=0;i<strArray.length;i++){
							strResult += this.processStr(strArray[i]);
						}
						break;
				}
				return strResult;
			},
			processStr:function(str){
				var strResult = '';
				var strNumber = parseInt(str,10);
				if(strNumber < 10){
					strResult = "00"+str;
				}else if(strNumber >= 10 && strNumber <100){
					strResult = "0"+str;
				}else{
					strResult = str;
				}
				return strResult;
			},
			calculateWordRepeatCount:function(str,countword){
				if(str == undefined || str == null || str == '' || countword == undefined || countword == null || countword == ''){
					return 0;
				}
				var strArr = str.split('');
				var count = 0;
				for(var i = 0; i< strArr.length; i++){
					if(strArr[i] == countword){
						count++;
					}
				}
				return count;
			},
			clone:function(myObj){   //复制对象 
				if(typeof(myObj) != 'object') return myObj; 
				if(myObj == null) return myObj; 
				var myNewObj = new Object(); 
				for(var i in myObj){
					myNewObj[i] = this.clone(myObj[i]);
				}
				return myNewObj; 
			}
		},
		watch:{
			"isarplist":{
				handler:function(val, oldVal){
					var length = val.length;
					if(length > 0){
						this.treearrow.splice(0,this.treearrow.length);
						for(var i=0;i<length;i++){
							this.treearrow.$set(i,this.treearrowright);
						}
					}else{
						if(this.treearrow.length > 0){
							this.treearrow.splice(0,this.treearrow.length);
						}
					}
				}
			}
		},
		filters:{
			"titleToolTtipForTreeGridItem":function(data){
				data = data.replace(/<[^>].*?>/g,"");
				data = data.replace("&nbsp;","");
				return data;
			},
			"shortTitleForTreeGridItem":function(data){
				var shortTitle = data.replace(/<[^>].*?>/g,"");
   				if(shortTitle.length > 80){
   					shortTitle = shortTitle.substr(0,80)+"...";
				};
				return shortTitle;
			}
		}

	});
