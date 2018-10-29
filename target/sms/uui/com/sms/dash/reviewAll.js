// @ sourceURL=com.sms.dash.reviewAll
$.u.define('com.sms.dash.reviewAll', null, {
	init : function(options) {
		this._options = options;
	},
	afterrender : function(bodystr) {
		this.setDiv0();
		$('ul.nav-tabs>li',this.$).on("click",this.proxy(this._liActive));
	},
    _liActive : function(e){
    	var active = $(e.target).parent().hasClass('active');
    	if(!active){
    		var index = $(e.target).parent().index();
    		this.getDisplayFilter(index);
    	}
    },
    getDisplayFilter : function(idx){
    	this['setDiv'+idx]();
    },
	setDiv0 : function() {
		if(!this.sro){
			$.u.load('com.sms.dash.reviewMap');
		}
		this.sr0 = new com.sms.dash.reviewMap($('div[umid=sr0]'));
	},
	setDiv1 : function() {
		if(!this.sr1){
			$.u.load('com.sms.dash.review_score_line');
		}
		this.sr1 = new com.sms.dash.review_score_line($('div[umid=sr1]'));
		$('.title-review',this.sr1.$).remove();
	},
	setDiv2 : function() {
		if(!this.sr2){
			$.u.load('com.sms.dash.reviewFunnel');
		}
		this.sr2 = new com.sms.dash.reviewFunnel($('div[umid=sr2]'));
	},
}, {
	usehtm : true,
	usei18n : false
});

com.sms.dash.reviewAll.widgetjs = [];
com.sms.dash.reviewAll.widgetcss = [];