var fs = require("fs");

module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			dist: ['dist']
		},
		copy: {
			dist: {
				src: '*/dist/**/*',
				dest: 'dist/'
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

	grunt.registerTask('move_dists', function(){
		var dist = './dist/';

		var files = fs.readdirSync('./dist/');
		var simDir, tempDir;
		for (var i = 0; i < files.length; i++) {
			simDir = dist + files[i];
			tempDir = simDir + '.temp';
			if (fs.lstatSync(simDir).isDirectory() && fs.existsSync(simDir + '/dist')) {
				grunt.log.write(simDir + '/dist');
				fs.renameSync(simDir + '/dist', tempDir);
				fs.rmdirSync(simDir);
				fs.renameSync(tempDir, simDir);
			}
		}
	});

	grunt.registerTask('dist', [
		'clean:dist',
		'copy:dist',
		'move_dists'
	]);

};
