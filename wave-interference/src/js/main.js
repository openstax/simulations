(function () {
	'use strict';

	// Load the config
	require(['config'], function () {
		require(['jquery', 'views/app'], function($, AppView) {
			var appView = new AppView();


			appView.render();

			$('body').append(appView.el);
		});
	});

})();
