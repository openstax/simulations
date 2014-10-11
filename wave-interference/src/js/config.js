(function () {
	'use strict';

	var config = {
		paths: {
			jquery:     '../../node_modules/jquery/dist/jquery',
			underscore: '../../node_modules/lodash/dist/lodash',
			backbone:   '../../node_modules/backbone/backbone',
			text:       '../../node_modules/requirejs-text/text',
			pixi:       '../../node_modules/pixi/bin/pixi',
			timbre:     '../../node_modules/timbre/timbre.dev',
			glmatrix:   '../../node_modules/gl-matrix/dist/gl-matrix',

			nouislider: '../../bower_components/nouislider/distribute/jquery.nouislider.all.min',

			templates:  '../templates/'
		}
	};

	require.config(config);
})();