(function () {
	'use strict';

	require.config({
		paths: {
			jquery:     '../../bower_components/jquery/dist/jquery',
			underscore: '../../bower_components/lodash/dist/lodash',
			backbone:   '../../bower_components/backbone/backbone',
			text:       '../../bower_components/requirejs-text/text'
		},

		packages: [{
			name: 'css',
			location: '../../bower_components/require-css',
			main: 'css'
		}, {
			name: 'less',
			location: '../../bower_components/require-less',
			main: 'less'
		}],

	});
})();