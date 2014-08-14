(function () {
	'use strict';

	QUnit.config.autostart = false;

	// Load the config
	require(['../js/config'], function () {
		require.config({
			paths: {
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

				QUnit.test('this is a test', function(assert) {
					assert.equal(1, 1);
				});
			});
	
		});
	});

})();
