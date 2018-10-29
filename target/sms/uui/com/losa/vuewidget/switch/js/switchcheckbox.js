Vue.config.debug = true
/*
	参数：
		{Boolean}  checkboxstate | Tag:checkboxstate		switch选中的状态
		{String}  dataSize | Tag:data-size		  switch的大小
		{String}  dataOnColor | Tag:data-on-color		switch选中时候的颜色
		{String}  dataOffColor | Tag:data-off-color		switch未被选中时候的颜色
		{String}  dataOnText | Tag:data-on-text		switch选中时候的文字
		{String}  dataOffText | Tag:data-off-text		switch未被选中时候的文字
		{Function}  changeEvent| Tag:change-event       switch状态改变时触发的事件函数

	用法和试例：
		1、checkboxstate:有两种状态，选中时候是true，未被选中时为false。
		
		2、dataSize:它的值分别是 'mini', 'small', 'normal', 'large'，默认是'small'

		3、dataOnColor:它的值分别是 'primary', 'info', 'success', 'warning', 'danger', 'default'
		
		4、dataOffColor:它的值分别是 'primary', 'info', 'success', 'warning', 'danger', 'default'

		5、dataOnText:它的值是一个String，默认是'ON'

		6、dataOffText:它的值是一个String，默认是'OFF'

		7、changeEvent:它的值是一个Function函数，该函数有两个值一个是event事件，另一个是switch的状态state
		
*/


	Vue.component('switchcheckbox',{
		props:{
			checkboxstate:{
				required:true,
				default:false
			},
			dataSize:{
				type:String,
				default:'small'
			},
			dataOnColor:{
				type:String,
				default:'primary'
			},
			dataOffColor:{
				type:String,
				default:'default'
			},
			dataOnText:{
				type:String,
				default:'ON'
			},
			dataOffText:{
				type:String,
				default:'OFF'
			},
			changeEvent:{
				type:Function,
				required:true
			}
		},
		data:function(){
			return {
				isInitFinished:false
			};
		},
		ready:function(){
			var _that = this;
			if(this.checkboxstate == null || this.checkboxstate == '' || this.checkboxstate == undefined){
				this.checkboxstate = false;
			}
			$(this.$el).bootstrapSwitch("state",this.checkboxstate,true).off('switchChange.bootstrapSwitch').on('switchChange.bootstrapSwitch', function(event, state){
				_that.checkboxstate = state;
				_that.changeEvent(event,state);
			});
			this.isInitFinished = true;
		},
		template:'<input type="checkbox" v-model="checkboxstate" :data-size="dataSize" :data-on-color="dataOnColor" :data-on-text="dataOnText" :data-off-text="dataOffText"/>',
		methods:{
			
		},
		watch:{
			'checkboxstate':function(val, oldVal){
				if(this.isInitFinished){
					$(this.$el).bootstrapSwitch("state",val,true);
				}
			}
		}

	});
