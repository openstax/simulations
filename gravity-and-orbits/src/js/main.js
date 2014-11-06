(function () {
	'use strict';

	// Load the config
	require(['config'], function () {
		require(['jquery', 'views/app'], function($, GOAppView) {

			$(function(){
				var appView = new GOAppView();

				// Append to body
				$('body').append(appView.el);

				// Render main app view
				appView.render();
				appView.postRender();
			});
	
		});
	});

})();
