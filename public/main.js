$(function () {
	var $members = $('#members');
	var users = new Array();
	var socket = io('http://linkage-tech-share.t0.daoapp.io:61086');
	var lotteryState = false;
	
	
	$('.btn-lg').click(function () {
		if (lotteryState) {
			return false;
		}
		if (users.length === 0 || users.length <= 2) {
			alert("没人抽毛");
		}
		else {
			var lotteryCount = parseInt($(this).attr("data-length"));
			if (lotteryCount) {
				$(this).button('loading');
				setTimeout(function () {
					lotteryState = true;
					var lotteryData = new Array();
					function lotteryUser(name, idx, value) {
						this.name = name;
						this.idx = idx;
						this.random = value;
					}
					$.each(users, function (i, user) {
						lotteryData.push(new lotteryUser(user, i, parseInt(10000 * Math.random())));
					});
					lotteryData.sort(function (a, b) {
						return a.random < b.random ? 1:-1
					});
					var lotteryUsername = [];
					for (var i = 0; i < lotteryCount; i++) {
						$('span[data-index="' + lotteryData[i].idx + '"]').removeClass('label-default').addClass('label-danger');
						lotteryUsername.push(lotteryData[i].name);
					}
					socket.emit('lottery', lotteryUsername);
					lotteryState = false;
					$('#btnLottery').button('reset');
				}, 2000);
			}
		}
		return false;
	});
	
	socket.on('user joined', function (data) {
		if (!lotteryState) {
			users.push(data.username);
			$members.append('<span class="label label-default" data-index="' + (users.length - 1) + '">' + data.username + '</span>        ');
		}
	});
	
	
	socket.on('user left', function (data) {
		if (!lotteryState) {
			var userid = $.inArray(data.username, users);
			if (userid > -1) {
				$('span[data-index="' + userid + '"]').remove();
				users.splice(userid, 1);
			}
		}
	});
});