(function () {
	'use strict';

	// Load the config
	require(['config'], function () {
		require(['jquery', 'views/app'], function($, AppView) {

			$(function(){
				var appView = new AppView();

				// Render main app view
				appView.render();

				// Append to body
				$('body').append(appView.el);

				// For demoing
				var better = false;
				$(document).bind('keydown', function(event) {
					if (event.which === 66) {
						if (better) {
							$('body').removeClass('better');
							$(window).trigger('worse');
							better = false;
						}
						else {
							$('body').addClass('better');
							$(window).trigger('better');
							better = true;
						}
					}
				});	

				// Trigger window resize to update canvases
				$(window).trigger('resize');
			});
	
		});
	});

})();
