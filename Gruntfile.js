var fs = require("fs");

module.exports = function(grunt) {

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
		targethtml: {
			dist: {
				files: {
					'dist/index.html': 'index.html'
				}
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
		}
	});

	var SimManager = require('./grunt/sim-manager')(grunt);

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('create-no-jekyll', function(){
		grunt.file.write('./dist/.nojekyll', '');
	});

	/**
	 * Builds every sim that has changed since last build and copies it into the
	 *   master `dist` directory.  It also renders the index page so the sim list
	 *   is up to date.  The `--all` flag can be added to force build all sims
	 *   instead of just the ones that have been updated.
	 */
	grunt.registerTask('dist', function() {
		grunt.task.run([
			'run-dists',
			'clean-dists',
			'copy-dists',
			'targethtml:dist'
		]);
	});

	/**
	 * Does the same thing as the `dist` command but then deploys to GitHub Pages.
	 */
	grunt.registerTask('deploy', function() {
		SimManager.buildSims(grunt.option('all'));

		grunt.task.run([
			'create-no-jekyll',
			'gh-pages:deploy'
		]);
	});

	grunt.registerTask('dev', [
		'connect:dev'
	]);
	
};
