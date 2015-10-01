(function () {
    'use strict';

    var config = {
        paths: {
            jquery:     '../../../faraday/bower_components/jquery/dist/jquery',
            underscore: '../../../faraday/bower_components/underscore/underscore',
            backbone:   '../../../faraday/bower_components/backbone/backbone',
            bootstrap:  '../../../faraday/bower_components/bootstrap/dist/js/bootstrap.min',
            text:       '../../../faraday/bower_components/requirejs-text/text',
            pixi:       '../../../faraday/bower_components/pixi/bin/pixi',
            nouislider: '../../../faraday/bower_components/nouislider/distribute/jquery.nouislider.all.min',
            buzz:       '../../../faraday/bower_components/buzz/dist/buzz.min',

            'vector2-node':          '../../../faraday/node_modules/vector2-node-shimmed/index',
            'object-pool':           '../../../faraday/node_modules/object-pool-shimmed/index',
            'circular-list':         '../../../faraday/node_modules/object-pool-shimmed/node_modules/circular-list/index',
            'bootstrap-select':      '../../../faraday/node_modules/bootstrap-select/js/bootstrap-select',
            'bootstrap-select-less': '../../../faraday/node_modules/bootstrap-select/less/bootstrap-select',

            views:      '../../../faraday/src/js/views',
            models:     '../../../faraday/src/js/models',
            assets:     '../../../faraday/src/js/assets',
            constants:  '../../../faraday/src/js/constants',
            templates:  '../../../faraday/src/templates',
            styles:     '../../../faraday/src/styles',
            common:     '../../../common'
        },

        packages: [{
            name: 'css',
            location: '../../../faraday/bower_components/require-css',
            main: 'css'
        }, {
            name: 'less',
            location: '../../../faraday/bower_components/require-less',
            main: 'less'
        }],

        less: {
            logLevel: 1,

            globalVars: {
                dependencyDir: '"../faraday/bower_components"'
            }
        },

        shim: {
            'bootstrap-select': {
                deps: ['jquery']
            }
        },
    };

    // Expose to the rest of the world 
    if (typeof module !== 'undefined') { 
        module.exports = config; // For nodejs 
    } 
    else if (typeof require.config !== 'undefined') { 
        require.config(config); // For requirejs 
    }
})();