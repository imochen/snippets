
(function( window){

	var imgCompress = function( option , callback ){

		var option 		=	option ||  {},
			canvas		=	document.createElement('canvas'),
			context		=	canvas.getContext('2d'),
			img 		=	new Image(),

			maxwidth	=	option.maxwidth,
			maxheight	=	option.height,

			scale		=	option.scale || .8;

		img.onload = function(){

			var _width		=	img.width,
				_height		=	img.height,


				_percent	=	_width/_height,

				real_width	=	_width,
				real_height	=	_height;



			if( typeof maxwidth === undefined ) { maxwidth = _width }
			if( typeof maxheight === undefined ) { maxheight = _height }



			if( _percent > maxwidth/maxheight && _width > maxwidth ){
				real_width	= maxwidth;
				real_height = _height*maxwidth/_width;
			}

			if( _percent <= maxwidth/maxheight && _height > maxheight ){
				real_width 	= _width*maxheight/_height;
				real_height = maxheight;
			}

			canvas.width 	=	real_width;
			canvas.height 	=	real_height;

			context.drawImage( img ,0,0 , _width , _height , 0, 0, real_width , real_height );

			var res = canvas.toDataURL('image/jpeg',scale);

			callback&&callback( res );


		}

		img.src = option.src;

	}

	window.imgCompress = window.imgCompress ? window.imgCompress : imgCompress;

})( window )

