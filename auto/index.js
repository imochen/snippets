var colors = require('colors'),

	config = {
		yunpan : {
			url : 'http://yunpan.360.cn/',
			user : '你的账号',
			pass : '你的密码'
		}
	},

	sign = 'yunpan',

	spawn = require('child_process').spawn,

	casper = spawn('casperjs',[ 'task/'+ sign + '.js', JSON.stringify(config[sign])]);


casper.stdout.on('data',function( data ){
	console.log( colors.green(data) );
});

casper.stderr.on('data',function(data){
	console.log( colors.red( data ) );
});