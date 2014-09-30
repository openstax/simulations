module.exports = function(grunt){

	var BANNER_TEMPLATE_STRING = '/*! <%= pkg.name %> - v<%= pkg.version %> - '
		+ '<%= grunt.template.today("yyyy-mm-dd") %> */\n';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			// Clean up stuff later when I figure out what I need to clean up
		},
		browserify: {
			dist: {
				files: {
					'dist/js/bundle.js': ['src/js/main.js']
				},
				options: {
					/* Making sure not to put anything here that would override 
					 *   the options that are in the package.json, because that
					 *   messes things up.
					 */
				}	
			}
			
		},
		copy: {
			fonts: {
				expand: true,
				filter: 'isFile',
				flatten: true,
				src: ['bower_components/font-awesome/fonts/**'],
				dest: 'dist/fonts/'
			},
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
					'dist/index.html': 'dist/index.html'
				}
			}		
		},		
		less: {
			development: {
				options: {
					paths: ['src/less']
				},
				files: {
					'src/css/main.css': 'src/less/main.less'
				}
			},
			dist: {
				options: {
					paths: ['src/less'],
					compress: true,
					optimization: 2
				},
				files: {
					'dist/css/main.css': 'src/less/main.less'
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
		},
		'gh-pages': {
			options: {
				base: 'dist'
			},
			src: ['**']
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

	grunt.registerTask('replace_bower_components', function() {
		var config = grunt.file.read('dist/js/config.js').replace(/\.\.\/\.\.\/bower_components\//g, '../bower_components/');
		grunt.file.write('dist/js/config.js', config);
	});

	grunt.registerTask('default', [
		'watch'
	]);

	grunt.registerTask('dist', [
		'requirejs:compile',
		'copy',
		'replace_bower_components',
		'less:dist',
		'targethtml'
		//'clean',
		//'uglify:dist'
	]);

	grunt.registerTask('test', [
		'build_tests',
		'jshint:source',
		'mocha'
	]);

	grunt.registerTask('lint', ['jshint']);

};
