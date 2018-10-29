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


	Vue.component('selectflights',{
		props:{
			dataObject:{
				type:Array,
				required:true
			},
			options:{
				inputValueDisabled:{
					type:Boolean,
					default:true
				},
				isAjaxContentData:{
					type:Boolean,
					default:true
				},
				selectNewInputStyle:{
					type:Object,
					required:true
				},
				dataUrl:{
					type:String,
					required:true
				}
			},
			inputTips:{
				type:Function,
				required:true
			},
			inputValue:{
				deptAirport:{
					type:Object,
					//required:true,
					twoWay:true,
					default:''
				},
				arrAirport:{
					type:Object,
					//required:true,
					twoWay:true,
					default:''
				},
				depAirportNo:{
					type:String,
					//required:true,
					twoWay:true,
					default:''
				},
				arrAirportNo:{
					type:String,
					//required:true,
					twoWay:true,
					default:''
				},
				flyNo:{
					type:Object,
					required:true,
					twoWay:true,
					default:''
				},
				observeDate:{
					type:String,
					required:true,
					twoWay:true,
					default:''
				},
				flightPlanId:{
					type:String,
					required:true,
					twoWay:true,
					default:true
				},
				schemeId:{
					type:String,
					twoWay:true,
					default:''
				},
				orgName:{
					type:String,
					twoWay:true,
					default:''
				}
			}
		},
		data:function(){
			return {
				isDisplaySelectNew:0,   //0  隐藏，1 显示
				activedCss:'actived',   //两个值 鼠标悬停 actived, 鼠标未悬停 unactived
				searchText:'',
				dataKeys:['flightNo','deptAirport','arrAirport','flightDate','flightDateTimePeriod'],
				dataKeysSelectedIndex:0,
				selectNewStyle:{},
				dataPageSize:10,   //分页使用
				dataPageNo:1,
				dataPageRecordsCount:0,
				dataPageCount:0,
				timeout:4000,
				coverClass:{},  //遮罩层class
				isDisplayCover:false
			};
		},
		template:'<div class="selectnew" :style="selectNewStyle" v-show="isDisplaySelectNew == 1">'+
					'<div class="selectnew-search">'+       
						'<input type="text" v-model="searchText" class="selectnew-search-input" debounce="500" autocomplete="off" />'+
					'</div>'+
					'<div class="selectnew-title">'+
						'<div>航班号</div><div>起飞机场</div><div>到达机场</div><div>起降时间</div>'+
					'</div>'+
					'<div v-if="dataObject != null && dataObject.length > 0"  class="selectnew-content" @scroll="__addMoreData($event)">'+
						'<div class="selectnew-row" v-for="(rowIndex,dataItem) in dataObject"   @click="__getDataFromColumn(rowIndex)" >'+
							'<template v-for="keyIndex in dataKeys.length">'+
							'<div class="selectnew-column"  v-if="keyIndex == 0">{{ dataItem["carrier"] + "" + dataItem[dataKeys[keyIndex]]}}</div>'+
							'<div class="selectnew-column" v-if="keyIndex == 1">{{dataItem["deptAirport"] + "" + dataItem["depAirportNo"]}}</div>'+
							'<div class="selectnew-column" v-if="keyIndex == 2">{{dataItem["arrAirport"] + "" + dataItem["arrAirportNo"]}}</div>'+
							'<div class="selectnew-column" v-if="keyIndex == 3">{{dataItem["flightDateTimePeriod"]}}</div>'+
							'</template>'+
						'</div>'+
					'</div>'+
					'<div class="selectnew-row-ajaxicon" v-show="options.isAjaxContentData">'+
						
					'</div>'+
				  '</div>'+
				  '<div class="selectnew-input" @click="__showSelectNew($event)" :style="options.selectNewInputStyle" v-if="options.inputValueDisabled == false">'+
					 '<div class="selectnew-input-enabled" v-if="inputValue.flyNo != \'\' && inputValue.flyNo != null">{{inputValue.flyNo}}</div>'+
					 '<div class="selectnew-input-enabled" v-else>请 输 入 航 班 号</div>'+
				  '</div>'+
				  '<div class="selectnew-input" @click="inputTips" :style="options.selectNewInputStyle" v-else>'+
					 '<div class="selectnew-input-disabled">请 输 入 航 班 号</div>'+
				  '</div>'+
				  '<div class="coverClass" :style="coverClass" @click="__hideSelectFilght" v-show="isDisplayCover == true"></div>',
		methods:{
			__getDataFromColumn:function(__rowIndex){
				//debugger;
				var __dataItem = this.dataObject[__rowIndex];
				this.inputValue.flyNo = __dataItem['carrier'] + "" + __dataItem['flightNo'];
				this.inputValue.deptAirport = __dataItem['deptAirport'];
				this.inputValue.arrAirport = __dataItem['arrAirport'];
				this.inputValue.flightPlanId = __dataItem['flightPlanId'];
				this.inputValue.depAirportNo = __dataItem['depAirportNo'];
				this.inputValue.arrAirportNo = __dataItem['arrAirportNo'];
				this.inputValue.orgName = __dataItem['orgName'];
				this.searchText = '';
				this.isDisplaySelectNew = 0;
				this.isDisplayCover = false;
			},
			__showSelectNew:function(e){
				console.log(e);
				if(this.inputValue.observeDate == null || this.inputValue.observeDate == '' || this.inputValue.observeDate == undefined){
					this.inputTips();
					return false;
				}
				if(this.isDisplaySelectNew == 1){
					this.searchText = '';
					this.isDisplayCover = false;
					this.isDisplaySelectNew = 0;
				}else{
					
					var __target = e.currentTarget;
					var __pageHeight = $(document).height() > $(window).height() ? $(document).height() : $(window).height();
					var __pageWidth = $(document).width() > $(window).width() ? $(document).width() : $(window).width();
					var __pageScrollTop = $(document).scrollTop();
					var __pageScrollLeft = $(document).scrollLeft();
					var __windowWidth = $(window).width();
					var __windowHeight = $(window).height();
					//设置遮罩层
					var coverClassObject = {};
					coverClassObject.width = __pageWidth + "px";
					coverClassObject.height = __pageHeight + "px";
					this.coverClass = JSON.parse(JSON.stringify(coverClassObject));
					this.isDisplayCover = true;
					//debugger;
					var __selectNewStyle = {};
					var __inputLeft = $(__target).position().left;
					var __inputTop = $(__target).position().top;
					var __inputWidth = $(__target).width();
					var __inputHeight = $(__target).height();
					var __leftInPage = $(__target).offset().left;
					var __topInPage = $(__target).offset().top;

					var __inputHalfWidth = __inputWidth/2;
					var __selectnewHalfWidth = 600/2;
					var __selectnewHeight = 306;
					var __selectnewLeftOuterWidth = (__selectnewHalfWidth*2 - __inputWidth)/2;
					
					
					if(__leftInPage > __selectnewLeftOuterWidth){
						if(__pageWidth - __leftInPage > __selectnewHalfWidth){
							__selectNewStyle.left = __inputLeft - (__selectnewHalfWidth - __inputHalfWidth) +"px";
						}else{
							__selectNewStyle.left = __inputLeft  - (__selectnewHalfWidth*2 - (__pageWidth - __leftInPage)) + "px";
						}
					}else{
						__selectNewStyle.left = __inputLeft - __leftInPage + "px";
					}
					//debugger;
					if(__topInPage > __selectnewHeight){
						if(__pageHeight - __topInPage - __inputHeight > __selectnewHeight){
							if(__topInPage + __inputHeight - __pageScrollTop >= __selectnewHeight){
								__selectNewStyle.top = __inputTop - __selectnewHeight + "px";
							}else{
								__selectNewStyle.top = __inputTop + __inputHeight + "px";
							}
						}else{
							__selectNewStyle.top = __inputTop - __selectnewHeight + "px";
						}
					}else{
						__selectNewStyle.top = __inputTop + __inputHeight + "px";
					}
					this.selectNewStyle = JSON.parse(JSON.stringify(__selectNewStyle));
					this.isDisplaySelectNew = 1;
					var _that = this;
					setTimeout(function(){
						_that.$el.nextElementSibling.focus();
					},500);
					this.addData(this.searchText);
				}
			},
			__addMoreData:function(e){		
				var viewH =e.target.clientHeight;
				var contentH =e.target.scrollHeight;
				var scrollTop =e.target.scrollTop;
				if(contentH - viewH - scrollTop <= 1) {
					this.addMoreData(this.searchText);
				}
			},
			__inputDataToTextbox:function(__data){
				return __data[this.dataKeys[this.dataKeysSelectedIndex]];
			},
			__hideSelectFilght:function(){
				this.searchText = '';
				this.isDisplayCover = false;
				this.isDisplaySelectNew = 0;
			},
			addData:function(__searchText){  //给航班下拉框添加数据
				console.log(new Date() + "===" + this.options.isAjaxContentData)
				var searchText = __searchText;
				if(__searchText == undefined || __searchText == null || $.trim(__searchText) == ''){
					searchText = '';
				}
				
				this.dataPageNo = 1;
				
				var __postData = {};
				__postData.tokenid = $.cookie("tokenid");
				__postData.method = "losaQueryFlightInfo";
				__postData.flightDate = this.inputValue.observeDate;
				__postData.flightNo = searchText;
				__postData.start = 0;
				__postData.length = this.dataPageSize;
				__postData.schemeId = this.inputValue.schemeId;
				
				var __that = this;
				$.ajax({
					url: this.options.dataUrl,
					dataType: "json",
					type: "post",
					data:__postData,
					timeout:this.timeout,
					success:function(_response){
						if(_response.success){
							__that.dataObject = _response.data.aaData;
							__that.dataPageRecordsCount = _response.data.iTotalRecords;
							__that.dataPageCount = Math.ceil(__that.dataPageRecordsCount / __that.dataPageSize);
							for(var i=0;i<__that.dataObject.length;i++){
								__that.dataObject[i].flightDateTimePeriod = __that.dataObject[i].departTime + "--" + __that.dataObject[i].arriveTime;
							}
						}
						
					}
				});
			},
			addMoreData:function(__searchText){  //给航班下拉框后面几页的数据
				//console.log(new Date() + "==more=" + this.options.isAjaxContentData)
				if(this.options.isAjaxContentData){
					return false;
				}
				this.options.isAjaxContentData = true;
				var searchText = __searchText;
				if(__searchText == undefined || __searchText == null || $.trim(__searchText) == ''){
					searchText = '';
				}
				
				var __currentPage = this.dataPageNo;
				__currentPage++;
				if(__currentPage > this.dataPageCount){
					this.options.isAjaxContentData = false;
					return false;
				}
				
				var __postData = {};
				__postData.tokenid = $.cookie("tokenid");
				__postData.method = "losaQueryFlightInfo";
				__postData.flightDate = this.inputValue.observeDate;
				__postData.flightNo = searchText;
				__postData.start = (__currentPage - 1) * this.dataPageSize;
				__postData.length = this.dataPageSize;
				__postData.schemeId = this.inputValue.schemeId;
				
				var __that = this;
				$.ajax({
					url: this.options.dataUrl,
					dataType: "json",
					type: "post",
					data:__postData,
					timeout:4000,
					success:function(_response){
						//debugger;
						if(_response.success){
							var aaData = _response.data.aaData;
							for(var i=0;i<aaData.length;i++){
								aaData[i].flightDateTimePeriod = aaData[i].departTime + "--" + aaData[i].arriveTime;
							}
							__that.dataObject = __that.dataObject.concat(aaData);
							__that.dataPageNo = __currentPage;
							__that.dataPageRecordsCount = _response.data.iTotalRecords;
							__that.dataPageCount = Math.ceil(__that.dataPageRecordsCount / __that.dataPageSize);
							__that.options.isAjaxContentData = false;
						}else{
							__that.options.isAjaxContentData = false;
						}
						
					},
					error:function(){
						//debugger;
						__that.options.isAjaxContentData = false;
					}
					
				});
			}
		},
		watch:{
			'searchText':function(){
				this.addData(this.searchText);
			}		
		}

	});
