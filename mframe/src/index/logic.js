(function( M ){

	"use strict";

	var name = 'index',

		errmsg = '网络连接异常，请稍后尝试!',

		utils = M.utils;

	var logic = M.getLogic({

		name: name,

		run: function( opts ){
			this.init();
		},
		getData: function() {

			var deferred = $.Deferred();

			M.sync.getSourceData().done(function( res ){
				
				deferred.resolve( res );

			}).fail(function(){
				deferred.reject( errmsg );
			})
			return deferred.promise();
		}
	});

	M[name] = function(opts) {
		logic.run(opts);
	};


})( MFrame )