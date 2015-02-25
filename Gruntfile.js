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
			},
			common: {
				src: 'common/img/*',
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
        'copy:common',
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
};
