({
	paths: {
		jquery:     'bower_components/jquery/dist/jquery',
		underscore: 'bower_components/lodash/dist/lodash',
		backbone:   'bower_components/backbone/backbone',
		text:       'bower_components/requirejs-text/text',
		pixi:       'bower_components/pixi/bin/pixi',
		nouislider: 'bower_components/nouislider/distribute/jquery.nouislider.all.min',
		timbre:     'bower_components/timbre/timbre.dev',
		glmatrix:   'bower_components/gl-matrix/dist/gl-matrix',

		templates:  'src/templates/'
	},

	packages: [{
		name: 'css',
		location: 'bower_components/require-css',
		main: 'css'
	}, {
		name: 'less',
		location: 'bower_components/require-less',
		main: 'less'
	}],

	baseUrl : "src/js",
	name: "main",
	out: "dist/main.js",
	removeCombined: true	
})

