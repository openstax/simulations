module.exports = function(grunt){

	var BANNER_TEMPLATE_STRING = '/*! <%= pkg.name %> - v<%= pkg.version %> - '
		+ '<%= grunt.template.today("yyyy-mm-dd") %> */\n';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			// Clean up stuff later when I figure out what I need to clean up
		},
		copy: {
			require: {
				src: 'bower_components/requirejs/require.js',
				dest: 'dist/js/require.js'
			},
			fonts: {
				expand: true,
				filter: 'isFile',
				flatten: true,
				src: ['bower_components/font-awesome/fonts/**'],
				dest: 'dist/fonts/'
			},
			bower_components: {
				src: 'bower_components/**',
				dest: 'dist/'
			}
		},
		requirejs: {
			compile: {
				options: {
					appDir: 'src',
					baseUrl: 'js',
					mainConfigFile: 'src/js/config.js',
					dir: 'dist',
					findNestedDependencies: true,
					removeCombined: false,
					keepBuildDir: false,
					skipDirOptimize: true,
					optimize: 'uglify2'	
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
				newcap: true,
				noarg: true,
				noempty: true,
				nonbsp: true,
				nonew: true,
				quotmark: 'single',
				undef: true,
				unused: 'vars',
				strict: true,
				trailing: true,
				maxlen: 120,
				maxcomplexity: 10,

				// Relaxing Options
				camelcase: false,
				curly: false,
				eqeqeq: false,
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
				'!src/test/**/*.js'
			],
			test: [
				'src/test/**/*.js'
			]
		},
		mocha: {
			// Test all files ending in .html anywhere inside the test directory.
			browser: ['src/test/**/*.html'],
			options: {
				reporter: 'Nyan', // Duh!
				run: true
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('default', [
		'watch'
	]);

	grunt.registerTask('dist', [
		'requirejs:compile',
		'copy',
		'less:dist',
		'targethtml'
		//'clean',
		//'uglify:dist'
	]);

	grunt.registerTask('test', [
		'jshint:source',
		'mocha'
	]);

	grunt.registerTask('lint', ['jshint']);

};
