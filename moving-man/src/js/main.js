(function () {
	'use strict';

	// Load the config
	require(['config'], function () {
		require(['jquery', 'views/app'], function($, MovingManAppView) {

			$(function(){
				var appView = new MovingManAppView();

				// Append to body
				$('body').append(appView.el);

				// Render main app view
				appView.render();
				appView.postRender();
			});
	
		});
	});

})();
