(function () {
    'use strict';

    var config = {
        paths: {
            jquery:     '../../../circuit-construction-kit/bower_components/jquery/dist/jquery',
            underscore: '../../../circuit-construction-kit/bower_components/underscore/underscore',
            backbone:   '../../../circuit-construction-kit/bower_components/backbone/backbone',
            bootstrap:  '../../../circuit-construction-kit/bower_components/bootstrap/dist/js/bootstrap.min',
            text:       '../../../circuit-construction-kit/bower_components/requirejs-text/text',
            pixi:       '../../../circuit-construction-kit/bower_components/pixi/bin/pixi',
            nouislider: '../../../circuit-construction-kit/bower_components/nouislider/distribute/jquery.nouislider.all.min',
            buzz:       '../../../circuit-construction-kit/bower_components/buzz/dist/buzz.min',

            'vector2-node':          '../../../circuit-construction-kit/node_modules/vector2-node-shimmed/index',
            'object-pool':           '../../../circuit-construction-kit/node_modules/object-pool-shimmed/index',
            'circular-list':         '../../../circuit-construction-kit/node_modules/object-pool-shimmed/node_modules/circular-list/index',
            'bootstrap-select':      '../../../circuit-construction-kit/node_modules/bootstrap-select/js/bootstrap-select',
            'bootstrap-select-less': '../../../circuit-construction-kit/node_modules/bootstrap-select/less/bootstrap-select',

            local:            './',
            views:            '../../../circuit-construction-kit/src/js/views',
            models:           '../../../circuit-construction-kit/src/js/models',
            assets:           '../js/assets',
            'circuit-construction-kit-assets': '../../../circuit-construction-kit/src/js/assets',
            constants:        '../../../circuit-construction-kit/src/js/constants',
            templates:        '../../../circuit-construction-kit/src/templates',
            styles:           '../../../circuit-construction-kit/src/styles',
            common:           '../../../common'
        },

        packages: [{
            name: 'css',
            location: '../../../circuit-construction-kit/bower_components/require-css',
            main: 'css'
        }, {
            name: 'less',
            location: '../../../circuit-construction-kit/bower_components/require-less',
            main: 'less'
        }],

        less: {
            logLevel: 1,

            globalVars: {
                dependencyDir: '"../circuit-construction-kit/bower_components"'
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