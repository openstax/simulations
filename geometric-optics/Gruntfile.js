module.exports = function(grunt) {

	var _               = grunt.util._;
	var requireJsConfig = require('./src/js/config.js');

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
				src: ['**', '!**/*.blend', '!**/*.blend1'],
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
					'!../common/**/docs/**/*',
                    '../common/**/*.{eot,svg,ttf,woff,otf}',
                    '../common/img/**/*.{png,jpg,jpeg,gif}'
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
				options: _.merge(requireJsConfig, {
					baseUrl: 'src/js',
					findNestedDependencies: true,
					optimize: 'uglify2',
					name: 'main',
					out: 'src/optimized.js',

					less: {
					    modifyVars: {
					        'fa-font-path': '"../node_modules/font-awesome/fonts/"'
					    }
					}

					// Doing it this way doesn't work:
					// mainConfigFile: 'src/js/config.js'
				})
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
