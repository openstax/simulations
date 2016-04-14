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
		clean: {
			dist: ['dist']
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

	/**
	 * Runs the `grunt dist` command for every sim that has changed since last build.
	 *   The `--all` flag can be specified to force build of all sims instead of
	 *   just the ones that have been updated.
	 */
	grunt.registerTask('run-dists', function() {
		SimManager.buildSims(grunt.option('all'));
	});

	grunt.registerTask('fix-dist-directories', function(){
		SimManager.fixDistDirs(grunt.option('all'));
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
		if (grunt.option('all')) {
			grunt.task.run([
				'dist',
				'create-no-jekyll',
				'gh-pages:deploy'
			]);
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
};
