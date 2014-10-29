(function () {
	'use strict';

	var config = {
		paths: {
			jquery:     '../../bower_components/jquery/dist/jquery',
			underscore: '../../bower_components/lodash/dist/lodash',
			backbone:   '../../bower_components/backbone/backbone',
			bootstrap:  '../../bower_components/bootstrap/dist/js/bootstrap.min',
			text:       '../../bower_components/requirejs-text/text',
			pixi:       '../../bower_components/pixi/bin/pixi',
			nouislider: '../../bower_components/nouislider/distribute/jquery.nouislider.all.min',
			timbre:     '../../bower_components/timbre/timbre.dev',
			glmatrix:   '../../bower_components/gl-matrix/dist/gl-matrix',
			buzz:       '../../bower_components/buzz/dist/buzz.min',

			views:      '../js/views',
			graphics:   '../js/graphics',
			models:     '../js/models',
			lib:        '../js/lib',
			utils:      '../js/utils',
			templates:  '../templates',
			styles:     '../styles',
			common:     '../../../common'
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

		less: {
			logLevel: 1,

			globalVars: {
				dependencyDir: '"/bower_components"'
			}
		}
	};

	require.config(config);
})();