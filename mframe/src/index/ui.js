/**
 * @Overview  UI模块
 * 页面交互，通知状态
 */
(function(M){
	
	'use strict';

	var name = 'index',

		$ = M.$;
	 
	var ui = {

		init : function( model ) {

			this.model = model;

			this.testEvent();
		},
		testEvent : function(){

			var $content = $('#content');

			this.model.getData().done(function( res ){

				$content.html( JSON.stringify(res) );

			}).fail(function( errmsg ){
				alert( errmsg );
			});

		}

	};

	M.ui.index = {
		init : function() {
			ui.init.apply(ui, arguments);
		}
	};
})( MFrame );