(function () {
	'use strict';

	var config = {
		paths: {
			jquery:     '../bower_components/jquery/dist/jquery',
			underscore: '../bower_components/lodash/dist/lodash',
			backbone:   '../bower_components/backbone/backbone',
			text:       '../bower_components/requirejs-text/text',
			pixi:       '../bower_components/pixi/bin/pixi',
			nouislider: '../bower_components/nouislider/jquery.nouislider.full.min',

			templates:  '../templates/'
		},

		packages: [{
			name: 'css',
			location: '../bower_components/require-css',
			main: 'css'
		}, {
			name: 'less',
			location: '../bower_components/require-less',
			main: 'less'
		}],
	};

	require.config(config);
})();