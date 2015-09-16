(function( root , factory ){

	if( typeof define === 'function' && define.amd ){
		//AMD
		define(factory);
	}else if( typeof exports === 'object' ){
		//Node , CommonJS之类
		module.exports = factory();
	}else{
		//直接暴露全局变量
		root.mcountdown = factory();
	}

})( window , function(){

	'use strict';

	return function( leftSeconds , ingcallback , overcallback ){

		var start = +new Date(), //获取当前时间戳

			timeleft = leftSeconds*1000, //剩余秒数转化为毫秒

			end = start + timeleft; //计算得到结束时间戳


		function second2JSON( timeleft ){

				var	days = parseInt( timeleft/86400 ),

					hours = parseInt( (timeleft%86400)/3600 ),

					minutes = parseInt( ((timeleft%86400)%3600)/60 ),

					seconds = parseInt( ((timeleft%86400)%3600)%60 );

				return {
					days : days,
					hours : hours < 10 ? '0' + hours : hours,
					minutes : minutes < 10 ? '0' + minutes : minutes,
					seconds : seconds < 10 ? '0' + seconds : seconds
				};

			}

		function runner(){
			//使用时间戳做对比，保证倒计时的精确性。
			var now = +new Date(); //得到运行状态中得时间戳

			if( now >= end ){ //如果倒计时已经结束，则中断

				if( overcallback ){
					overcallback(); //执行倒计时结束的回调函数
				}

				return false;
			}

			if( ingcallback ){
				ingcallback.call( second2JSON((end - now)/1000) );
			}

			setTimeout(function(){
				runner();
			},333);
		}

		runner();

	};

});