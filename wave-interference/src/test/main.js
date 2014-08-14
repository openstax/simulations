(function () {
	'use strict';

	// Load the config
	require(['../js/config'], function () {
		require.config({
			paths: {
				qunit: '../../../bower_components/qunit/build/release',

				views:  '../js/views',
				models: '../js/models',
				utils:  '../js/utils',

				templates: '../templates',

				css: '../css',
				img: '../img'
			}
		});
		require(['jquery', '../js/views/app'], function($, AppView) {

			$(function(){
				var appView = new AppView();

				// Render main app view
				appView.render();

				// Append to body
				$('#qunit-fixture').append(appView.el);

				// Trigger window resize to update canvases
				$(window).trigger('resize');
			});
	
		});
	});

})();
