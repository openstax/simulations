module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			dist: ['dist']
		},
		copy: {
			dist: {
				src: '*/dist/**/*',
				dest: 'dist/',
				options: {
					rename: function(dest, matchedSrcPath, options) {
						grunt.log.write(dest + ' | ' + matchedSrcPath);
						return path.join(dest, matchedSrcPath);
					}
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

};
