(function () {
	'use strict';

	// Load the config
	require(['config'], function () {
		require(['jquery', 'views/app'], function($, AppView) {

			$(function(){
				var appView = new AppView();

				// Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
			});
	
		});
	});

})();
