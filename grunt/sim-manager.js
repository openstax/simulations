var _      = require('underscore');
var touch  = require('touch');
var wrench = require('wrench');

module.exports = function(grunt) {

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
			var dirs = _.map(gruntfiles, function(gruntfile) {
				// Gets the path leading up to Gruntfile.js
				return gruntfile.substring(0, gruntfile.indexOf('Gruntfile.js'));
			});

			return _.reject(dirs, function(dir) {
				return (dir.indexOf('common') !== -1);
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
			// If we've already cached the list, return it.  Saving a cached
			//   list ensures that we have the same list of updated sims
			//   across multiple tasks being run together--even after the
			//   runDists task finishes and touches the .build_timestamp file.
			if (this._updatedSimDirs)
				return this._updatedSimDirs;

			// Otherwise, spawn some `find` tasks and find out which sim folders have new files.
			var spawnSync = require('child_process').spawnSync;
			var dirs = this.getAllSimDirs();

			// Check if there is even a build timestamp; if not, it's our first time running it,
			//   and we need to build all of them anyway.
			if (!grunt.file.exists('.build_timestamp')) {
				this._updatedSimDirs = dirs;
				return dirs;
			}

			for (var i = dirs.length - 1; i >= 0; i--) {
				// Look for files that are newer than the `.build_timestamp` and aren't in any
				//   of those big nasty folders that we don't care about.
				var process = spawnSync('find', [
					dirs[i], 
					'-type', 'f', 
					'-newer', '.build_timestamp', 
					'-not', '-iwholename', '*node_modules*', 
					'-not', '-iwholename', '*bower_components*', 
					'-not', '-iwholename', '*dist*'
				]);

				// If there was no output (no newer file found), remove it from the list
				if (process.stdout == '')
					dirs.splice(i, 1);
			}

			this._updatedSimDirs = dirs;

			return dirs;
		},

		/**
		 * Return just the directory names of each updated sim.
		 */
		getAllSimDirNames: function() {
			return _.map(this.getAllSimDirs(), function(simDir) {
				return simDir.substring(simDir.indexOf('/') + 1, simDir.lastIndexOf('/'));
			});
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
		runDists: function(forceBuildAll) {
			// Get the list of sim directories
			var simDirs = (forceBuildAll) ?
				this.getAllSimDirs() :
				this.getUpdatedSimDirs();

			if (simDirs.length === 0) {
				grunt.log.writeln('>> All simulations are already up-to-date.');
				return;
			}

			// Get the function to call when all gruntfiles have been run
			var done = grunt.task.current.async();

			// Create a callback for when a dist finishes running
			var numSimsToBuild = simDirs.length;
			var totalNumSims = this.getAllSimDirs().length;
			var gruntsRunning = numSimsToBuild;
			var checkFinished = function() {
				gruntsRunning--;
				if (gruntsRunning === 0) {
					var unchangedOutput = '';
					var numUnchanged = totalNumSims - numSimsToBuild;
					if (numUnchanged > 0)
						unchangedOutput = '; ' + numUnchanged + ' remained unchanged';

					if (numSimsToBuild === 1)
						grunt.log.writeln('>> 1 simulation built' + unchangedOutput);
					else
						grunt.log.writeln('>> ' + numSimsToBuild + ' simulations built' + unchangedOutput);

					// Update the build timestamp
					touch('.build_timestamp');

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

		cleanDists: function(forceCleanAll) {
			// Get the list of sim directories
			var simDirNames = (forceCleanAll) ?
				this.getAllSimDirNames() :
				this.getUpdatedSimDirNames();

			var dirsCleaned = 0;
			for (var i = 0; i < simDirNames.length; i++) {
				var directory = './dist/' + simDirNames[i];
				if (grunt.file.exists(directory)) {
					wrench.rmdirSyncRecursive(directory);
					dirsCleaned++;
				}
			}

			if (dirsCleaned === 1)
				grunt.log.writeln('>> 1 old simulation dist directory removed');
			else
				grunt.log.writeln('>> ' + dirsCleaned + ' old simulation dist directories removed');
		},

		/**
		 *
		 */
		copyDists: function(forceCopyAll) {
			// Get the list of sim directories
			var simDirNames = (forceCopyAll) ?
				this.getAllSimDirNames() :
				this.getUpdatedSimDirNames();

			// Copy each dist folder into the master dist folder
			var dirsCopied = 0;
			for (var i = 0; i < simDirNames.length; i++) {
				var dirName = simDirNames[i];
				var src = './' + dirName + '/dist';
				var dst = './dist/' + dirName;

				if (grunt.file.exists(src)) {
					wrench.copyDirSyncRecursive(src, dst);
					dirsCopied++;
				}
			}

			if (dirsCopied === 1)
				grunt.log.writeln('>> 1 simulation dist directory copied into the master dist directory');
			else
				grunt.log.writeln('>> ' + dirsCopied + ' simulation dist directories copied into the master dist directory');
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


	/**
	 * Runs the `grunt dist` command for every sim that has changed since last build.
	 *   The `--all` flag can be specified to force build of all sims instead of
	 *   just the ones that have been updated.
	 */
	grunt.registerTask('run-dists', function() {
		SimManager.runDists(grunt.option('all'));
	});

	grunt.registerTask('clean-dists', function() {
		SimManager.cleanDists(grunt.option('all'));
	});

	grunt.registerTask('copy-dists', function() {
		SimManager.copyDists(grunt.option('all'));
	});

	grunt.registerTask('npm-install', function() {
		SimManager.npmInstall(grunt.option('all'));
	});

	/**
	 * This task creates a new sim folder and renames all the references inside.
	 *   Note that one must specify each argument by name.  Example:
	 *
	 *   `grunt create --dirName="plant-growth" --packageName="plant-growth" --classPrefix="PlantGrowth" --title="Plant Growth"`
	 */
	grunt.registerTask('create', 'Creates a new simulation project.', function() {
		var dirName = grunt.option('dirName') || 'template-copy';
		var packageName = grunt.option('packageName') || dirName;
		var classPrefix = grunt.option('classPrefix') || 'TemplateCopy';
		var title = grunt.option('title') || 'Template Copy';

		SimManager.createNewSim(dirName, packageName, classPrefix, title);
	});


	return SimManager;
};
