module.exports = function(grunt){

	var BANNER_TEMPLATE_STRING = '/*! <%= pkg.name %> - v<%= pkg.version %> - '
		+ '<%= grunt.template.today("yyyy-mm-dd") %> */\n';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			// Clean up stuff later when I figure out what I need to clean up
			dev: [
				'src/js/bundle.js'
			],
			dist: [
				'src/css/main.css',
				'src/js/bundle.min.js'
			]
		},
		watchify: {
			options: {
				// defaults options used in b.bundle(opts)
				detectGlobals: true,
				insertGlobals: false,
				ignoreMissing: true,
				debug: false,
				standalone: false,

				keepalive: false,
				callback: function(b) {
					// configure the browserify instance here
					b.transform('aliasify');
					b.transform('html2js-browserify');
					b.transform('browserify-shim');
					b.transform('deamdify');
					//b.transform('uglifyify');

					// return it
					return b;
				}
			},
			all: {
				src: './src/js/main.js',
				dest: 'src/js/bundle.js'
			}
		},
		copy: {
			fonts: {
				expand: true,
				filter: 'isFile',
				flatten: true,
				src: ['bower_components/font-awesome/fonts/**'],
				dest: 'dist/fonts/'
			}
		},
		uglify: {
			options: {
				banner: BANNER_TEMPLATE_STRING,
				sourceMap: true,
				sourceMapName: 'src/js/bundle.min.js.map'
			},
			dist: {
				files: {
					'src/js/bundle.min.js': ['src/js/bundle.js']
				}
			}
		},
		targethtml: {
			dev: {
				files: {
					'src/index.html': 'src/index.template.html'
				}
			},
			dist: {
				files: {
					'dist/index.html': 'src/index.template.html'
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
					'src/css/main.css': 'src/less/main.less'
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
		inline_sources: {
			options: {
				template: 'src/index.html',
				output:   'src/index.html',
				js:  'src/js/bundle.min.js',
				css: 'src/css/main.css'
			}
		},
		staticinline: {
			main: {
				files: {
					'dist/index.html': 'src/index.html',
				}
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

	grunt.registerTask('inline_sources', function(){
		var options = this.options();

		// Read template file
		var temp = grunt.file.read(options.template)
		
		// Get the js and css
		var js  = grunt.file.read(options.js);
		var css = grunt.file.read(options.css);

		var html = temp.replace('{{ js }}', js).replace('{{ css }}', css);

		// Write template to tests directory and run tests
		grunt.file.write(options.output, html);
	});

	grunt.registerTask('replace_bower_components', function() {
		var config = grunt.file.read('dist/js/config.js').replace(/\.\.\/\.\.\/bower_components\//g, '../bower_components/');
		grunt.file.write('dist/js/config.js', config);
	});

	grunt.registerTask('default', [
		'watch'
	]);

	// grunt.registerTask('dist', [
	// 	'copy',
	// 	'watchify:all',
	// 	'uglify:dist',
	// 	'less:dist',
	// 	'targethtml:dist',
	// 	'staticinline'
	// 	//'clean:dist'
	// ]);
	grunt.registerTask('dist', function() {
		var Inliner = require('inliner');

		new Inliner('http://localhost:8001', function (html) {
			grunt.file.write('dist/index.html', html);
			console.log(html);
		});
	});

	grunt.registerTask('dev', [
		'watchify:all',
		'less:development',
		'targethtml:dev'
	]);

	grunt.registerTask('test', [
		'build_tests',
		'jshint:source',
		'mocha'
	]);

	grunt.registerTask('lint', ['jshint']);

};
