var fs = require("fs");

module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		connect: {
			dev: {
				options: {
					port: '8080',
					keepalive: true
				}
			}
		},
		clean: {
			dist: ['dist']
		},
		copy: {
			dist: {
				src: '*/dist/**/*',
				dest: 'dist/'
			}
		},
		targethtml: {
			dist: {
				files: {
					'dist/index.html': 'index.html'
				}
			}		
		},	
		'run-dists': {
			options: {
				gruntfiles: [
					'./*/Gruntfile.js',
					'!./common/Gruntfiles.js'
				]
			}
		},
		'gh-pages': {
			options: {
				base: 'dist',
				dotfiles: true
			},
			deploy: {
				src: ['**']
			}
		},
		'npm-install': {
			options: {
				packageFiles: [
					'./*/package.json',
					'./common/v3/package.json'
				]
			}
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('run-dists', function() {

		// Get the function to call when all gruntfiles have been run
		var done = this.async();

		// Get the list of gruntfiles
		var gruntfiles;
		if (grunt.option('sim')) {
			// We just want to do one sim
			gruntfiles = './' + grunt.option('sim') + '/Gruntfile.js';
			if (!grunt.file.exists(gruntfiles[0])) {
				grunt.fail.fatal('No gruntfile found at ' + gruntfiles[0]);
			}
		}
		else {
			// Get a list of all the gruntfiles from each directory
			gruntfiles = grunt.file.expand(this.options().gruntfiles);
		}
		
		// Create a callback for when a dist finishes running
		var gruntsRunning = gruntfiles.length;
		var checkFinished = function() {
			gruntsRunning--;
			if (gruntsRunning === 0) {
				if (gruntfiles.length === 1)
					grunt.log.writeln('>> 1 simulation compiled');
				else
					grunt.log.writeln('>> ' + gruntfiles.length + ' simulations compiled');
				done();
			}
		};

		var simDir;
		for (var i = 0; i < gruntfiles.length; i++) {
			simDir = gruntfiles[i].substring(0, gruntfiles[i].indexOf('Gruntfile.js'));
			grunt.util.spawn({
				grunt: true,
				args: ['dist'],
				opts: {
					cwd: simDir
				}
			}, function (err, result, code) {
				checkFinished();
			});
		}
	});

	grunt.registerTask('fix-dist-directories', function(){
		var dist = './dist/';

		var files = fs.readdirSync('./dist/');
		var simDir, tempDir;
		var simCount = 0;
		for (var i = 0; i < files.length; i++) {
			simDir = dist + files[i];
			tempDir = simDir + '.temp';
			if (fs.lstatSync(simDir).isDirectory() && fs.existsSync(simDir + '/dist')) {
				fs.renameSync(simDir + '/dist', tempDir);
				fs.rmdirSync(simDir);
				fs.renameSync(tempDir, simDir);
				simCount++;
			}
		}

		if (simCount === 1)
			grunt.log.writeln('>> 1 simulation dist directory fixed');
		else
			grunt.log.writeln('>> ' + simCount + ' simulations dist directory fixed');
	});

	grunt.registerTask('create-no-jekyll', function(){
		grunt.file.write('./dist/.nojekyll', '');
	});

	grunt.registerTask('copy-dists', [
		'clean:dist',
		'copy:dist',
		'fix-dist-directories'
	]);

	grunt.registerTask('dist', [
		'run-dists',
		'copy-dists',
		'targethtml:dist'
	]);

	grunt.registerTask('deploy', function() {
		if (grunt.option('sim')) {

		}
		else {
			grunt.task.run([
				'dist',
				'create-no-jekyll',
				'gh-pages:deploy'
			]);
		}
	});

	grunt.registerTask('dev', [
		'connect:dev'
	]);

	grunt.registerTask('npm-install', function() {
		grunt.log.writeln('Running `npm install` for each simulation...');
		var spawn = require('child_process').spawn;

		// Function to call when all the local node_modules have been installed
		var done = this.async();

		// Get a list of all the package files from each directory
		packageFiles = grunt.file.expand(this.options().packageFiles);
		
		// Create a callback for when a local npm install has finished running
		var installsRunning = packageFiles.length;
		var checkFinished = function() {
			installsRunning--;
			if (installsRunning === 0) {
				if (packageFiles.length === 1)
					grunt.log.writeln('>> 1 npm package file installed');
				else
					grunt.log.writeln('>> ' + packageFiles.length + ' package files installed');
				done();
			}
		};

		var packageDir;
		var childProcess;
		for (var i = 0; i < packageFiles.length; i++) {
			packageDir = packageFiles[i].substring(0, packageFiles[i].indexOf('package.json'));

			// Spawn a child process that will run the install
			childProcess = spawn('npm', ['install'], { 
				cwd: packageDir, // Where the package file lives
				stdio: 'inherit' // Makes it so output gets automatically routed to our current output stream
			});

			// Bind an event for when it's finished
			childProcess.on('close', function(code) {
				checkFinished();
			});
		}
	});

	/**
	 * This task creates a new sim folder and renames all the references inside.
	 *   Note that one must specify each argument by name.  Example:
	 *
	 *   `grunt create --dirName="plant-growth" --packageName="plant-growth" --classPrefix="PlantGrowth" --title="Plant Growth"`
	 */
	grunt.registerTask('create', 'Creates a new simulation project.', function() {
		var wrench = require('wrench');

		var dirName = grunt.option('dirName') || 'template-copy';
		var packageName = grunt.option('packageName') || dirName;
		var classPrefix = grunt.option('classPrefix') || 'TemplateCopy';
		var title = grunt.option('title') || 'Template Copy';

		// Remove the current template's /dist directory if it exists--just slows down the copy
		if (grunt.file.exists('./template/dist/'))
			wrench.rmdirSyncRecursive('./template/dist/');

		// Copy the template directory
		var newDir = './' + dirName;
		wrench.copyDirSyncRecursive('./template/', newDir);

		// Replace certain strings in certain files
		var replacements = [
			['package.json',                [{ from: 'template-sim',              to: packageName                }]],
			['bower.json',                  [{ from: 'template-sim',              to: packageName                }]],
			['README.md',                   [{ from: 'template',                  to: dirName                    },
			                                 { from: 'Empty Simulation Template', to: title                      }]],
			['src/index.html',              [{ from: 'Empty Simulation',          to: title                      }]],
			['src/js/main.js',              [{ from: 'TemplateAppView',           to: classPrefix + 'AppView'    }]],
			['src/js/views/app.js',         [{ from: 'Template',                  to: classPrefix                }]],
			['src/js/views/sim.js',         [{ from: 'TemplateSimulation',        to: classPrefix + 'Simulation' },
			                                 { from: 'TemplateSimView',           to: classPrefix + 'SimView'    },
			                                 { from: 'TemplateSceneView',         to: classPrefix + 'SceneView'  },
			                                 { from: 'Template Sim',              to: title                      },
			                                 { from: 'template-sim',              to: packageName                }]],
			['src/js/views/scene.js',       [{ from: 'Template',                  to: classPrefix                }]],
			['src/js/models/simulation.js', [{ from: 'Template',                  to: classPrefix                }]]
		];

		for (var i = 0; i < replacements.length; i++) {
			var filename = newDir + '/' + replacements[i][0];
			var contents = grunt.file.read(filename);
			// Loop through all the replacements to change the content into what we want
			for (var r = 0; r < replacements[i][1].length; r++) {
				var replacement = replacements[i][1][r];
				// Replace globally (multiple replaces)
				contents = contents.replace(new RegExp(replacement.from, 'g'), replacement.to);
			}
			grunt.file.write(filename, contents);
		}

		grunt.log.writeln('>> New sim created in ' + newDir + '/');
	});
};
