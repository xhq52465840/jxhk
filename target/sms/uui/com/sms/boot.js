window.console = window.console || {};
console.log || (console.log = function() {
	return false;
});
console.error || (console.error = function() {
	return false;
});

$.u.config.appname = "/sms/uui/"; 
$.u.config.mode = "dev";
$.u.inituui(); //第二种，先配置appname，再inituui，注意前后的"/"

var _gp = {
	smsqueryserver: "/sms/query.do",
	smsmodifyserver: "/sms/modify.do",
	smsloginserver: "/sms/login.do",
	workflowserver: "/sms/Setup"
};
$.extend($.u.config.constant, _gp);
// 设置日期组件的国际化
$.datepicker.setDefaults($.datepicker.regional["zh-CN"]);
// 覆盖匿名登录标识
$.cookie("isAnonymityLogin", false, {
	"path": "/"
});

// 解决select2在dialog里面搜索框无法聚焦
$.widget("ui.dialog", $.ui.dialog, {
	open: function() {
		return this._super();
	},
	_allowInteraction: function(event) {
		return !!$(event.target).is(".select2-input") || this._super(event);
	}
});

$.widget("ui.dialog", $.ui.dialog, {
	open: function() {
		return this._super();
	},
	_allowInteraction: function(event) {
		return !!$(event.target).is(".form-control") || this._super(event);
	}
});

$("head").append("<script type='text/javascript' src='" + $.u.config.appname + "uui/widget/jqurl/jqurl.js'></script>");

var autoLogin = function() {
	$.ajax({
		url: $.u.config.constant.smsloginserver,
		type: "post",
		data: {
			"username": $.cookie("username"),
			"password": $.cookie("pwd"),
			"Ticket": $.urlParam().Ticket,
		},
		dataType: "json",
		async: false,
	}).done(function(response) {
		if (response.success) {
			$.cookie("userid", response.userid, {
				path: "/"
			});
			$.cookie("tokenid", response.tokenid, {
				path: "/"
			});
			$.cookie("sessionid", response.sessionid, {
				path: "/"
			});
			$.cookie("uskyuser", JSON.stringify({}), {
				path: "/"
			});
			$.cookie("pageDisplayNum", response.pageDisplayNum, {
				path: "/"
			});
			if (window.parent) {
				window.parent.location.reload();
			} else {
				window.location.reload();
			}

		} else {
			setTimeout(function() {
				$.u.alert.error(response.reason, 1000 * 3);
			}, 300);
		}
	}).fail(function(jqXHR, errorText, errorThrown) {

	}).complete(function(jqXHR, errorStatus) {

	});
}

var showPluginProgress = function() {
	if ($.cookie("tokenid")) {
		$.ajax({
			url: $.u.config.constant.smsqueryserver,
			type: "post",
			dataType: "json",
			data: {
				"tokenid": $.cookie("tokenid"),
				"method": "echo"
			}
		}).done(function(response) {
			if (response.success === true) {
				$("div.plugin-progress div.progress-bar").attr({
					"aria-valuenow": "100",
					"style": "width:100%"
				}).text("100%");
				setTimeout(function() {
					window.location.reload();
				}, 1000);
			} else if (response.success === false && response.code == -20008) {
				setTimeout("showPluginProgress()", 1000);
			}
		}).fail(function(jqXHR, errorText, errorThrown) {
			setTimeout("showPluginProgress()", 1000);
		});
	}
}

var goToLogin = function() {
	var href = $.u.config.appname + "com/sms/Login.html?url=" + escape(window.parent ? window.parent.location.href : window.location.href);
	if (window.parent) {
		window.parent.location.href = href;
	} else {
		window.location.href = href;
	}
}

var removeCookies = function(cookies) {
	if ($.isArray(cookies)) {
		$.each(cookies, function(idx, cookie) {
			$.removeCookie(cookie, {
				path: "/"
			});
		});
	}
}

$(document).ajaxSuccess(function(event, request, settings, response) {
	if (response.success === false) {
		// 插件更新错误码
		if (response.code === -101000004) {
			if ($("div.plugin-progress").length < 1) {
				$("<div class='plugin-progress'>" +
					"<div class='progress'>" +
					"<div class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%;'>60%</div>" +
					"</div>" +
					"</div>").dialog({
					title: "系统更新中",
					width: 540,
					resizable: false,
					draggable: false,
					modal: true
				});
			}
			$("div.plugin-progress div.progress-bar").attr({
				"aria-valuenow": response.reason,
				"style": "width:" + response.reason + "%"
			}).text(response.reason + "%");
			if (window.location.href.indexOf("/uui/com/sms/upm/Featured.html") < 0) {
				showPluginProgress();
			}
		}
		// 会话过期
		else if (response.code === -103000002) {
			removeCookies(["userid", "tokenid", "sessionid", "uskyuser"]);
              
			if (window.parent ? window.parent.location.href.indexOf("/uui/com/sms/Logout.html") < 0 : window.location.href.indexOf("/uui/com/sms/Logout.html") < 0) {
				$.u.alert.error("会话过期");
				goToLogin();
			}
		}
		// 没有TOKENID
		else if (response.code === -103000001) {
			var parentIsNotLogoutPage = true;
			try {
				parentIsNotLogoutPage = window.parent.location.href.indexOf("/uui/com/sms/Logout.html") < 0;
			} catch (e) {}
			removeCookies(["userid", "tokenid", "sessionid", "uskyuser"]);

			if (window.parent ? parentIsNotLogoutPage : window.location.href.indexOf("/uui/com/sms/Logout.html") < 0) {
				$.u.alert.error("会话过期");
				goToLogin();
			}
		}
		// 登录失败 || 用户不存在 
		else if (response.code === -103000003 || response.code === -104000002) {
			$.u.alert.error(response.reason, 1000 * 3);
			removeCookies(["userid", "tokenid", "sessionid", "uskyuser", "username", "pwd"]);

			// 非登录页面的情况下跳转到登陆页面
			if (window.location.href.indexOf("/uui/com/sms/Login.html") < 0) {
				$.cookie("logout", true, {
					path: "/"
				});
				goToLogin();
			}
		} else if (response.code === -103000004) {
			$.u.alert.error(response.reason, 1000 * 3);
			if (window.location.href.indexOf("/uui/com/sms/Login.html") < 0) {
				goToLogin();
			}
		} 
		// 未知错误
		else if (response.code === -101000003) {
			$.u.alert.error(response.reason, 1000 * 3);
		} else {
			$.u.alert.error(response.reason, 1000 * 3);
		}
	}
});