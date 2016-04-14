var fs = require('fs');
var _  = require('underscore');

module.exports = function(grunt) {
	// Add extra grunt configurations
	grunt.config.merge({
		copy: {
			dist: {
				src: '*/dist/**/*',
				dest: 'dist/'
			}
		}
	});

	// Pattern for matching gruntfiles in the root of each sim directory
	var simGruntfilePatterns = [
		'./*/Gruntfile.js',
		'!./common/Gruntfiles.js'
	];

	// Pattern for matching all package files in each subdirectory
	var packageFilePatterns = [
		'./*/package.json',
		'./common/v3/package.json'
	];

	/**
	 * A utility class for managing the sim project directories and facilitating
	 *   the build and deployment processes
	 */
	var SimManager = {

		/**
		 * Returns a list of all sim gruntfiles (gruntfiles for each simulation
		 *   project director).
		 */
		getAllSimGruntfiles: function() {
			return grunt.file.expand(simGruntfilePatterns);
		},

		/**
		 * Returns a list of all sim directories.
		 */
		getAllSimDirs: function() {
			var gruntfiles = this.getAllSimGruntfiles();
			return _.map(gruntfiles, function(gruntfile) {
				// Gets the path leading up to Gruntfile.js
				return gruntfile.substring(0, gruntfile.indexOf('Gruntfile.js'));
			});
		},

		/**
		 * Returns a list of all the sim directories for sims that have been
		 *   updated since they were last built here in this filesystem.  It
		 *   checks to see if the touched .build_timestamp file is older than
		 *   any of the files in a given simulation directory and only lets
		 *   it pass through if the build timestamp is older.
		 */
		getUpdatedSimDirs: function() {
			var allDirs = this.getAllSimDirs();
			// TODO: filter out all of the ones that aren't up-to-date
			return allDirs;
		},

		/**
		 * Return just the directory names of each updated sim.
		 */
		getUpdatedSimDirNames: function() {
			return _.map(this.getUpdatedSimDirs(), function(simDir) {
				return simDir.substring(simDir.indexOf('/') + 1, simDir.lastIndexOf('/'));
			});
		},

		/**
		 * Runs the `dist` command in each sim directory for either updated
		 *   sims or all sims depending on the `forceBuildAll` flag.
		 */
		buildSims: function(forceBuildAll) {
			// Get the function to call when all gruntfiles have been run
			var done = grunt.task.current.async();

			// Get the list of sim directories
			var simDirs = (forceBuildAll) ?
				this.getAllSimDirs() :
				this.getUpdatedSimDirs();

			// Create a callback for when a dist finishes running
			var numSimsToBuild = simDirs.length;
			var gruntsRunning = numSimsToBuild;
			var checkFinished = function() {
				gruntsRunning--;
				if (gruntsRunning === 0) {
					if (numSimsToBuild === 1)
						grunt.log.writeln('>> 1 simulation compiled');
					else
						grunt.log.writeln('>> ' + numSimsToBuild + ' simulations compiled');
					done();
				}
			};

			for (var i = 0; i < simDirs.length; i++) {
				grunt.util.spawn({
					grunt: true,
					args: ['dist'],
					opts: {
						cwd: simDirs[i]
					}
				}, function (err, result, code) {
					checkFinished();
				});
			}
		},

		/**
		 *
		 */
		copyDists: function(forceCopyAll) {

		},

		/**
		 * When the `dist` directories are copied to the master `dist` directory
		 *   in the root of the simulations folder, they each are actually inside
		 *   directories matching their sim project folder, and the the dist dirs
		 *   need to be renamed as their sim project name and moved up a level to
		 *   be directly in the `dist` root.
		 */
		fixDistDirs: function(forceFixAll) {
			var distDir = './dist/';

			// Get the list of subdirectories in the `dist` folder
			var subDirs = fs.readdirSync('./dist/');
			if (!forceFixAll) {
				// Only keep the ones that have been updated
				subDirs = _.intersection(subDirs, this.getUpdatedSimDirNames());
			}

			var simDir, tempDir;
			var simCount = 0;
			for (var i = 0; i < subDirs.length; i++) {
				simDir = distDir + subDirs[i];
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
		},

		npmInstall: function(forceUpdateAll) {
			grunt.log.writeln('Running `npm install` for each simulation...');
			var spawn = require('child_process').spawn;

			// Function to call when all the local node_modules have been installed
			var done = grunt.task.current.async();

			// Get a list of all the package files from each directory
			var packageFiles = grunt.file.expand(packageFilePatterns);
			if (!forceUpdateAll) {
				var updatedSimDirNames = this.getUpdatedSimDirNames();
				packageFiles = _.filter(packageFiles, function(packageFile) {
					// It's good if it's in the common files
					if (packageFile.indexOf('common') !== -1)
						return true;

					for (var i = 0; i < updatedSimDirNames.length; i++) {
						// If it one of the updated sim dir names is in it, it's good
						if (packageFile.indexOf(updatedSimDirNames[i] + '/') !== -1)
							return true;
					}

					return false;
				});
			}
			
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
		},

		/**
		 * Creates a new sim folder and renames all the references inside.
		 */
		createNewSim: function(dirName, packageName, classPrefix, title) {
			var wrench = require('wrench');

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
		}

	};

	return SimManager;
};
