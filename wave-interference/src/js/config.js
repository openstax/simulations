(function () {
	'use strict';

	require.config({
		paths: {
			jquery: '../../bower_components/jquery/dist/jquery',
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