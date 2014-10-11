module.exports = function(grunt){

	var BANNER_TEMPLATE_STRING = '/*! <%= pkg.name %> - v<%= pkg.version %> - '
		+ '<%= grunt.template.today("yyyy-mm-dd") %> */\n';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		devPort:   8080,
		buildPort: 8090,
		testPort:  8081,
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

				keepalive: false
			},
			all: {
				src: './src/js/main.js',
				dest: 'src/js/bundle.js'
			},
			test: {
				src: './src/js/**/*.js',
				dest: 'test/bundle.js'
			}
		},
		copy: {
			fonts: {
				expand: true,
				filter: 'isFile',
				flatten: true,
				src: [
					'node_modules/font-awesome/fonts/**',
					'node_modules/bootstrap/fonts/**'
				],
				dest: 'src/fonts/'
			}
		},
		shell: {
			inline: {
				command: 'node node_modules/.bin/inliner http://localhost:<%= buildPort %> > dist/index.html'
			}
		},
		connect: {
			dev: {
				options: {
					port: '<%= devPort %>',
					base: 'src'
				}
			},
			build: {
				options: {
					port: '<%= buildPort %>',
					base: 'src'
				}
			},
			test: {
				options: {
					port: '<%= testPort %>'
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
			dev: {
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
				tasks: ['less:dev'],
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
				devel: true
			},
			source: [
				'src/**/*.js',
				'!src/js/bundle.js',
				'!src/js/lib/**/*.js',
				'!test/**/*.js'
			],
			test: [
				'test/**/*.js'
			]
		},
		mocha: {
			// Test all files ending in .html anywhere inside the test directory.
			all: ['test/index.html'],
			options: {
				reporter: 'Spec',
				run: false,
				log: false,
				timeout: 15000,
				urls: [ 'http://localhost:8081/test/index.html' ]
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

	grunt.registerTask('default', [
		'dev'
	]);

	grunt.registerTask('dist', [
		'copy',
		'watchify:all',
		'less:dist',
		'targethtml:dist',
		'connect:build',
		'shell:inline'
	]);

	grunt.registerTask('dev', [
		'copy:fonts',
		'watchify:all',
		'targethtml:dev',
		'connect:dev',
		'watch'
	]);

	grunt.registerTask('test', [
		'jshint:source',
		'watchify:test',
		'build_tests',
		'mocha'
	]);

	grunt.registerTask('lint', ['jshint']);

};
