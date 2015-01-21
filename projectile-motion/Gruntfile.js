module.exports = function(grunt){

	var BANNER_TEMPLATE_STRING = '/*! <%= pkg.name %> - v<%= pkg.version %> - '
		+ '<%= grunt.template.today("yyyy-mm-dd") %> */\n';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			dist: ['dist']
		},
		copy: {
			require: {
				src: 'bower_components/requirejs/require.js',
				dest: 'dist/js/require.js'
			},
			images: {
				expand: true, // required when using cwd
				cwd: 'src/img/',
				src: '**',
				dest: 'dist/img/'
			},
			audio: {
				expand: true, // required when using cwd
				cwd: 'src/audio/',
				src: '**',
				dest: 'dist/audio/'
			},
			fonts: {
				expand: true,
				filter: 'isFile',
				flatten: true,
				src: ['node_modules/font-awesome/fonts/**'],
				dest: 'dist/node_modules/font-awesome/fonts/'
			},
			common: {
				src: [
					'../common/**/*.{eot,svg,ttf,woff,otf}'
				],
				dest: 'dist/common/'
			}
		},
		rename: {
			optimized: {
				src: 'src/optimized.js',
				dest: 'dist/js/optimized.js'
			}
		},
		connect: {
			dist: {
				options: {
					port: '8090',
					base: 'dist'
				}
			}
		},
		requirejs: {
			compile: {
				options: {
					baseUrl: 'src/js',
					mainConfigFile: 'src/js/config.js',
					findNestedDependencies: true,
					optimize: 'uglify2',
					paths: {
						jquery:     '../../bower_components/jquery/dist/jquery',
						underscore: '../../bower_components/lodash/dist/lodash',
						backbone:   '../../bower_components/backbone/backbone',
						bootstrap:  '../../bower_components/bootstrap/dist/js/bootstrap.min',
						text:       '../../bower_components/requirejs-text/text',
						pixi:       '../../bower_components/pixi/bin/pixi',
						nouislider: '../../bower_components/nouislider/distribute/jquery.nouislider.all.min',
						buzz:       '../../bower_components/buzz/dist/buzz.min',
						'vector2-node':   '../../node_modules/vector2-node-shimmed/index',
						'object-pool':    '../../node_modules/object-pool-shimmed/index',
						'circular-list':  '../../node_modules/object-pool-shimmed/node_modules/circular-list/index',
						'bootstrap-select':      '../../node_modules/bootstrap-select/dist/js/bootstrap-select',
						'bootstrap-select-less': '../../node_modules/bootstrap-select/less/bootstrap-select',

						views:      '../js/views',
						models:     '../js/models',
						assets:     '../js/assets',
						constants:  '../js/constants',
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
						modifyVars: {
							'fa-font-path': '"../node_modules/font-awesome/fonts/"'
						}
					},
					shim: {
						'bootstrap-select': {
							deps: ['jquery']
						}
					},
					name: 'main',
					out: 'src/optimized.js'
				}
			}
		},
		uglify: {
			options: {
				banner: BANNER_TEMPLATE_STRING
			},
			dist: {
				files: {
					'dist/scripts/require.js': ['dist/scripts/require.js']
				}
			}
		},
		targethtml: {
			dist: {
				files: {
					'dist/index.html': 'src/index.html'
				}
			}		
		},		
		watch: {
			styles: {
				files: ['src/less/**/*.less'], // files to watch
				tasks: ['less:development'],
				options: {
					nospawn: true
				}
			}
		},
		jshint: {
			options: {		
				globals: {
					require: true,
					define: true
				},

				// Enforcing Options
				forin: true,
				immed: true,
				latedef: true,
				laxbreak: true,
				laxcomma: true,
				noarg: true,
				noempty: true,
				nonbsp: true,
				nonew: true,
				quotmark: 'single',
				undef: true,
				unused: 'vars',
				strict: true,
				trailing: true,
				//maxlen: 120,
				maxcomplexity: 10,

				// Relaxing Options
				camelcase: false,
				curly: false,
				eqeqeq: false,
				newcap: false,
				plusplus: false,
				asi: false,
				boss: false,
				debug: false,
				eqnull: false,
				evil: false,
				expr: false,
				funcscope: false,
				globalstrict: false,
				iterator: false,
				lastsemic: false,
				loopfunc: false,
				multistr: false,
				proto: false,
				scripturl: false,
				smarttabs: false,
				shadow: false,
				sub: false,
				supernew: false,
				validthis: false,
				
				// Environments
				browser: true,
				devel: false
			},
			source: [
				'src/**/*.js',
				'!src/js/lib/**/*.js',
				'!test/**/*.js'
			],
			test: [
				'test/**/*.js'
			]
		},
		mocha: {
			// Test all files ending in .html anywhere inside the test directory.
			browser: ['test/index.html'],
			options: {
				reporter: 'Spec',
				run: false,
				log: false,
				timeout: 15000
			}
		},
		build_tests: {
			options: {
				template: 'test/index.template.html',
				runner: 'test/index.html',
				files: 'test/**/*.js'
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('build_tests', function(){
		var options = this.options();
		
		// Get all the files and prepend the '../' relative path
		var tests = grunt.file.expand(options.files).map(function(file){
			grunt.log.write('../' + file);
			return '../' + file;
		});

		// Build the template, replacing {{ test }} with the list of test files
		var template = grunt.file.read(options.template).replace('{{ tests }}', JSON.stringify(tests));

		// Write template to tests directory and run tests
		grunt.file.write(options.runner, template);
	});

	grunt.registerTask('default', [
		'watch'
	]);

	grunt.registerTask('dist', [
		'clean:dist',
		'requirejs:compile',
		'copy',
		'rename:optimized',
		'targethtml'
	]);

	grunt.registerTask('test', [
		'jshint:source',
		'build_tests',
		'mocha'
	]);

	grunt.registerTask('lint', ['jshint']);

};
