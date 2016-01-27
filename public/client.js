//代码PK客户端

$(function () {
	
	var $loginPage = $("#logon");
	var $lotteryPage = $("#lottery");
	var username;
    var connected = false;
    var socket = io("http://localhost:3000");   
	
   var login = function () {
        username = $("#logonName").val().trim();
        if (username) { 
            socket.emit("add user", username);
        }
        else {
            $("#logonName").attr("placeholder", "兄台，怎么称呼？");
        }
	};
	
	//自动登录
	var autoLogin = function() {
		if ($.cookie("UserName") != null) {
			socket.emit("add user", $.cookie("UserName"));
		}
	}

    //autoLogin();
	
	//登录 
	$("#btnSubmit").click(function () {
		login();
	});

    //手机回车
	$(window).keydown(function (event) {
		if (event.which === 13) {
			login();
			return false;
		}
	}); 
	//登录事件
	socket.on("login", function (data) {
		connected = true; 
		$.cookie("UserName", username, { expires: 365 });
		$loginPage.hide();
		$lotteryPage.show();
		$("#stateMessage").html("等待开奖");
	});
	
	socket.on("loginError", function (data) {
		connected = false;
		$("#stateMessage").html("换个称呼吧，朋友");
	});
	
	socket.on("user joined", function (data) {
		$('#messages').html("共有" + data.numUsers + "参与PK");
	});
	
	socket.on("user left", function (data) {
		$("#messages").html("共有" + data.numUsers + "参与PK");
	});
	
	socket.on("lottery", function (data) {
		if ($.inArray(username, data.message.split(",")) > -1) {
			$("#stateMessage").html("恭喜,您中奖了");
			$(".container").css("background", "url(55771332451950460.jpg) no-repeat center").css("color", "white");
		}
		else {
			$("#stateMessage").html("原来没中奖我也可以这么开心");
		}
	});
	 
});