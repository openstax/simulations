(function () {
	'use strict';

	// Load the config
	require(['config'], function () {
		require(['jquery', 'views/app'], function($, AppView) {

			$(function(){
				var appView = new AppView();

				appView.render();

				$('body').append(appView.el);

				// For demoing
				$(document).bind('keydown', function(event) {
					if (event.which === 66)
						$('body').togglClass('better');
					console.log(event.which);
				});	
			});
	
		});
	});

})();
