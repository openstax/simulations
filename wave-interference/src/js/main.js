(function () {
	'use strict';

	// Load the config
	require(['config'], function () {
		require(['jquery'], function($) {
			$('body').css('background-color', '#333').html('Hello World');
		});
	});

})();
