var casper = require('casper').create({
	pageSettings : {
		loadImages : true
	},
	viewportSize : {
		width : 1200,
		height : 600
	},
	timeout : 1000000
});
var info = JSON.parse( casper.cli.get(0) );

var fs = require('fs');

casper.waitForCaptcha = function(captchaFile, parsedFile){
    casper.then(function(){
        this.captureSelector(captchaFile, ".quc-captcha-img");
    });
    var key = +new Date();
    console.log('key is ' + key );
    casper.waitFor(function check(){

    	var content = fs.read( parsedFile );

    	if( content.indexOf(key) < 0 ){
    		return false;
    	}else{
    		return true;
    	}

    }, function then(){
    	var content = fs.read( parsedFile );
    	casper.then(function(){
			this.fillSelectors('form.quc-form',{
				'input[name="account"]' : info.user,
				'input[name="password"]' : info.pass,
				'input[name="phrase"]' : content.split('#')[0]
			}, true);
			console.log('用户名密码自动填充中...');
		});

    }, function onTimeout(){

    }, 60000);
    return this;
};

casper.start( info.url , function(){
	console.log('----------------------------');
	console.log('云盘抽奖任务开始运行');
});

casper.waitForSelector('#login',function(){
	casper.waitForCaptcha( 'task/captcha.png', 'task/captcha.txt');
});

casper.then(function(){
	this.click('input[type="submit"]');
	this.capture('task/1.png');
	console.log('开始尝试登录');
});

casper.waitForSelector('#lottery-everyday',function(){
	console.log('登陆成功');
	this.click('#lottery-everyday');
});

casper.then(function(){
	this.click('#lottery-everyday');
});

casper.waitFor( function check(){
	return this.evaluate(function(){
		return document.querySelector('#BasePanel1').style.display === 'none' ? false : true;
	})
},function then(){
	var m = this.evaluate(function(){
		return document.querySelector('#BasePanel1 .content0 h2').innerHTML;
	});
	var text = this.evaluate(function(){
		return document.querySelector('#BasePanel1 .content2').innerText;
	});

	console.log(m);
	
	if( m.indexOf('MB') < 0 ){
		console.log('今天已经抽过了。')
	}else{
		console.log( '抽奖成功 : ' + m );
	}
	
});

casper.run();