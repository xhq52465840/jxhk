/*
	参数：

	{Array[Object]}  dataObject  |  Tag data-object     //存放菜单的数据
	{Object}  options  |  Tag options

	用法和实例

	1、dataObject:[
			{
				firstmenutitle:'威胁事件',
				firstmenuclick:clickfunction,
				firstmenuchildren:[{
						secondmenutitle:'aaa#111',
					},
					{
						secondmenutitle:'aaa#222',
						secondmenuclick:clickfunction,
					}]
			},
			{
				firstmenutitle:'差错事件',
			}]

	  1.1 firstmenutitle : 一级菜单显示的名称。
	  1.2 firstmenuclick : 点击一级菜单对应的方法函数
	  1.3 firstmenuchildren : 存放二级菜单的内容，如果没有二级菜单可以不用写这个属性，或者这个属性值是[]。
	    1.3.1 secondmenutitle : 二级菜单显示的名称。
		1.3.2 secondmenuclick : 点击二级菜单对应的方法函数。


	2、options:{
		  componentPosition:{
			  position:'absolute',
			  top:'10px',
			  left:'10px',
			  width:'250px',
			  height:'auto',
			  'min-height':'500px'
		  },
		  oneAtATime:true,
		  isLiCrossChangeColor:{
			  isChangeColor:false,
			  oddColor:'liodd',
			  evenColor:'lieven'
		  },
		  animateDuration:300,
		  index:0
	   }

	  2.1 oneAtATime : 是否一次只打开一个菜单 true 是  false 否
	  2.2 componentPosition : 插件的定位CSS
	  2.3 isLiCrossChangeColor : 设置二级菜单列的背景色
		  isLiCrossChangeColor:{isChangeColor:true,oddColor:'sss',evenColor:'xxx'}
		  isChangeColor 为true 使用交替色，false不使用交替色，直接用横线分割。
		  oddColor : 奇数行的背景色class。
		  evenColor : 偶数行的背景色class。
	  2.4 animateDuration : 菜单打开和关闭的动画持续时间
	  2.5 index : 一级菜单选中的序号

	      
	
*/

//Vue.config.debug = true
var ceair_accordion_param = {};
ceair_accordion_param.animateDuration = 1000;

Vue.component('accordion',{
	props:{
		dataObject:{
			type:Array,
			required:true
		},
		options:{
			oneAtATime:{
				type:Boolean,
				default:true
			},
			componentPosition:{
				type:Object,
				required:true
			},
			isLiCrossChangeColor:{
				type:Object,
				required:true
			},
			animateDuration:{
				type:Number,
				required:true,
				default:1000
			},
			index:{
				type:Number,
				default:0
			}
		},
		changeColor:{
			type:Boolean,
			default:true
		}
	
	},
	data:function(){
		return {
			firstMenuStatus:[],    //menu是否已打开
			firstMenuStatusFlag:-1,   //menu的位置
			firstmenucollapsediv:'firstmenucollapsediv',
			firstmenuselected:'selected',
			firstmenuunselected:'unselected',
			itemUlMaxHeight:[],
			firstmenua:'firstmenua',
			secondmenuliheight:32,   //二级菜单每行的高度
			secondmenu:'secondmenu',
			secondmenulicss:'secondmenulicss',  //二级菜单默认样式
			secondmenuselected:'secondmenuselected',  //二级菜单被选中
			secondmenuselected:'secondmenuselected'   //二级菜单未被选中
		}
	},
	created:function(){
		if(this.dataObject != undefined && this.dataObject != null && this.dataObject.length > 0){
			var j = 0;
			for(var i=0;i<this.dataObject.length;i++){
				this.firstMenuStatus[i] = {status:false,arrowdirection:'collapsearrowright',firstmenuselected:''};
				if(this.dataObject[i].firstmenuchildren != undefined && this.dataObject[i].firstmenuchildren != null && this.dataObject[i].firstmenuchildren.length > 0){
					this.itemUlMaxHeight[j] = this.secondmenuliheight*this.dataObject[i].firstmenuchildren.length;
					j++;
				}
			}
		}
		if(this.options.isLiCrossChangeColor.isChangeColor){
			this.secondmenuliheight = 31;
		}
		//debugger;
		if(this.options.animateDuration != undefined && !isNaN(this.options.animateDuration)){
			ceair_accordion_param.animateDuration = this.options.animateDuration;
		}
		if(this.options.index != undefined && !isNaN(this.options.index)){
			if(this.options.index >= 0 && this.options.index < this.dataObject.length){
				this.firstMenuStatus.$set(this.options.index,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:true});
			}
		}

	},
	watch:{
		'dataObject':function(){
			if(this.dataObject != undefined && this.dataObject != null && this.dataObject.length > 0){
				var j = 0;
				if(this.firstMenuStatus.length > 0){
					this.firstMenuStatus.splice(0,this.firstMenuStatus.length);
				}
				if(this.itemUlMaxHeight.length > 0){
					this.itemUlMaxHeight.splice(0,this.itemUlMaxHeight.length);
				}
				for(var i=0;i<this.dataObject.length;i++){
					this.firstMenuStatus[i] = {status:false,arrowdirection:'collapsearrowright',firstmenuselected:''};
					if(this.dataObject[i].firstmenuchildren != undefined && this.dataObject[i].firstmenuchildren != null && this.dataObject[i].firstmenuchildren.length > 0){
						this.itemUlMaxHeight[j] = this.secondmenuliheight*this.dataObject[i].firstmenuchildren.length;
						j++;
					}
				}
			}
			if(this.options.index != undefined && !isNaN(this.options.index)){
				if(this.options.index >= 0 && this.options.index < this.dataObject.length){
					this.firstMenuStatus.$set(this.options.index,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:true});
				}
			}
		}
	},
	template:'<div id="ceair_accordioncontainer" class="accordioncontainer" :style="options.componentPosition">'+
				'<ul class="accordioncontainerul">'+
					'<li v-for="dataItem in dataObject">'+
						'<div :class="[firstmenucollapsediv,firstMenuStatus[$index].firstmenuselected?firstmenuselected:firstmenuunselected]">'+
							'<div class="firstmenucollapse" @click="__showLi($event,$index)"><div :class="firstMenuStatus[$index].arrowdirection"></div></div>'+
							'<a :class="firstmenua" v-if="dataItem.firstmenuclick" href="javascript:void(0)" @click="__removeSecondSelected($event,$index,dataItem.firstmenuclick)" >{{dataItem.firstmenutitle}}</a>'+
							'<a :class="firstmenua" v-else href="javascript:void(0)" @click="__showLi($event,$index)" >{{dataItem.firstmenutitle}}</a>'+
						'</div>'+
						'<template v-if="dataItem.firstmenuchildren != undefined && dataItem.firstmenuchildren != null && dataItem.firstmenuchildren.length > 0">'+
						'<ul v-show="firstMenuStatus[$index].status == true" transition="dropdown" :data-ulheight="itemUlMaxHeight[$index]">'+
							'<template  v-if="options.isLiCrossChangeColor.isChangeColor == true">'+
							'<template v-for="secondDataItem in dataItem.firstmenuchildren">'+
							'<li :class="[secondmenu,options.isLiCrossChangeColor.oddColor]" @click="__setSecondSelected($event)" v-if="$index % 2 == 0">'+
								'<a href="javascript:void(0)" @click="secondDataItem.secondmenuclick">{{secondDataItem.secondmenutitle}}</a>'+
							'</li>'+
							'<li :class="[secondmenu,options.isLiCrossChangeColor.evenColor]" @click="__setSecondSelected($event)" v-else>'+
								'<a href="javascript:void(0)" @click="secondDataItem.secondmenuclick">{{secondDataItem.secondmenutitle}}</a>'+
							'</li>'+
							'</template>'+
							'</template>'+
							'<template v-if="options.isLiCrossChangeColor.isChangeColor == false">'+
							'<li v-for="secondDataItem in dataItem.firstmenuchildren" :class="[secondmenu,secondmenulicss]" @click="__setSecondSelected($event)">'+
								'<a href="javascript:void(0)" @click="secondDataItem.secondmenuclick">{{secondDataItem.secondmenutitle}}</a>'+
							'</li>'+
							'</template>'+
						'</ul>'+
						'</template>'+
					'</li>'+
				'</ul>'+
			  '</div>',
	methods:{
		__showLi:function(e,_num,isExecuteFirstMenuClick){
			//debugger;
			if(!this.changeColor){
				return false;
			}
						
			if(_num > this.firstMenuStatus.length){
				return false;
			}

			if(this.firstMenuStatusFlag == _num){
				if(!this.firstMenuStatus[this.firstMenuStatusFlag].status){
					this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:true});
				}else{
					this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:false,arrowdirection:'collapsearrowright',firstmenuselected:true});
				}
				return false;
			}
			//debugger;
			if(this.options.oneAtATime == true){
				if(this.firstMenuStatusFlag > -1){
					this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:false,arrowdirection:'collapsearrowright',firstmenuselected:false});
				}
				this.firstMenuStatusFlag = _num;
				this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:true});
			}else{
				if(this.firstMenuStatusFlag > -1){
					if(!this.firstMenuStatus[this.firstMenuStatusFlag].status){
						this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:false,arrowdirection:'collapsearrowright',firstmenuselected:false});
						this.firstMenuStatusFlag = _num;
						if(!this.firstMenuStatus[this.firstMenuStatusFlag].status){
							this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:true});
						}else{
							this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:false,arrowdirection:'collapsearrowright',firstmenuselected:true});
						}
					}else{
						this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:false});
						this.firstMenuStatusFlag = _num;
						if(!this.firstMenuStatus[this.firstMenuStatusFlag].status){
							this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:true});
						}else{
							this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:false,arrowdirection:'collapsearrowright',firstmenuselected:true});
						}
					}
				}else{
					this.firstMenuStatusFlag = _num;
					this.firstMenuStatus.$set(this.firstMenuStatusFlag,{status:true,arrowdirection:'collapsearrowdown',firstmenuselected:true});
					
				}
			}
			
			if(isExecuteFirstMenuClick == undefined && (this.dataObject[_num].firstmenuchildren == undefined 
					|| this.dataObject[_num].firstmenuchildren == null 
					|| this.dataObject[_num].firstmenuchildren.length <= 0)){
				this.dataObject[_num].firstmenuclick();
				return false;
			}
		},
		__setSecondSelected:function(e){
			var __target = e.currentTarget;
			$("#ceair_accordioncontainer ."+this.secondmenu).removeClass(this.secondmenuselected);
			$(__target).addClass(this.secondmenuselected);
		},
		__removeSecondSelected:function(e,__index,func){
			$("#ceair_accordioncontainer ."+this.secondmenu).removeClass(this.secondmenuselected);
			this.__showLi(e,__index, false);
			func();
		}
		
	}
});

Vue.transition('dropdown',{
	css:false,
	enter:function(el, done){
		var height = $(el).attr('data-ulheight');
		$(el).css('height','0px').animate({'height':height+'px'},ceair_accordion_param.animateDuration,done);
	},
	enterCancelled:function(el){
		$(el).stop();
	},
	leave: function (el, done) {
		$(el).animate({ 'height': '0px' }, ceair_accordion_param.animateDuration, done)
	},
	leaveCancelled: function (el){
		$(el).stop();
    }	
});