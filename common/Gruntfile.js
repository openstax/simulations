module.exports = function(grunt){

    var BANNER_TEMPLATE_STRING = '/*! <%= pkg.name %> - v<%= pkg.version %> - '
        + '<%= grunt.template.today("yyyy-mm-dd") %> */\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                noarg: true,
                noempty: true,
                nonbsp: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: 'vars',
                strict: true,
                trailing: true,
                //maxlen: 120,
                //maxcomplexity: 12,

                // Relaxing Options
                camelcase: false,
                curly: false,
                eqeqeq: false,
                newcap: false,
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
                devel: true
            },
            source: [
                '**/*.js',
                '!bower_components/**/*.js'
                '!node_modules/**/*.js',
                '!test/**/*.js',
                '!*.js',
                '!binarysearch/binarysearch.js'
            ],
            test: [
                'test/**/*.js'
            ]
        },
        mocha: {
            // Test all files ending in .html anywhere inside the test directory.
            browser: ['test/index.html'],
            options: {
                reporter: 'Spec',
                run: false,
                log: false,
                timeout: 15000
            }
        },
        build_tests: {
            options: {
                template: 'test/index.template.html',
                runner: 'test/index.html',
                files: 'test/tests/**/*.js'
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('build_tests', function(){
        var options = this.options();
        
        // Get all the files and prepend the '../' relative path
        var tests = grunt.file.expand(options.files).map(function(file){
            grunt.log.write('../' + file);
            return '../' + file;
        });

        // Build the template, replacing {{ test }} with the list of test files
        var template = grunt.file.read(options.template).replace('{{ tests }}', JSON.stringify(tests));

        // Write template to tests directory and run tests
        grunt.file.write(options.runner, template);
    });

    grunt.registerTask('default', [
        'test'
    ]);

    grunt.registerTask('test', [
        //'jshint:source',
        'build_tests',
        'mocha'
    ]);

    grunt.registerTask('lint', ['jshint']);

};
