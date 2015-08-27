(function( M ){

	"use strict";

	var Sync = M.Sync;

	M.sync = {

		getSourceData: function() {
			
			var sync = new Sync({
				param: 'your param'
			},{
				dataType : 'jsonp'
			});

			return sync.get('your url');
		},

	};


})( MFrame );