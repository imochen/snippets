/**
 * name : mresize.js
 * 
 * desc : 根据页面大小来调整 根字体的大小，以便使用rem单位。
 *
 * --------------------------------------------------
 *
 * step1 : 将设计图转化为320的标准宽。
 * 
 * step2 : 将尺寸大小转化为 w/20 rem。[推荐使用less]
 * 
 */
;(function( window , document ){

	"use strict";

	var mresize = function(){

		var innerWidth = window.innerWidth;

		if( !innerWidth ){ return false;}

		document.documentElement.style.fontSize = ( innerWidth*20/320 ) + 'px';

	};

	mresize();

	window.addEventListener( 'resize' , mresize , false );

	window.addEventListener( 'load' , mresize , false );


})( window , document );
