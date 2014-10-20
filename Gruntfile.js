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
			src: ['**']
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('run-dists', function() {

		// Get the function to call when all gruntfiles have been run
		var done = this.async();

		// Get a list of all the gruntfiles from each directory
		var gruntfiles = grunt.file.expand(this.options().gruntfiles);
		
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
		'copy-dists'
	]);

	grunt.registerTask('deploy', [
		'dist',
		'create-no-jekyll',
		'gh-pages'
	]);

	grunt.registerTask('dev', [
		'connect:dev'
	]);
};
