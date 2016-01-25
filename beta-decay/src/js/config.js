(function () {
    'use strict';

    var config = {
        paths: {
            jquery:       '../../../nuclear-physics/bower_components/jquery/dist/jquery',
            underscore:   '../../../nuclear-physics/bower_components/underscore/underscore',
            backbone:     '../../../nuclear-physics/bower_components/backbone/backbone',
            bootstrap:    '../../../nuclear-physics/bower_components/bootstrap/dist/js/bootstrap.min',
            text:         '../../../nuclear-physics/bower_components/requirejs-text/text',
            pixi:         '../../../nuclear-physics/bower_components/pixi/bin/pixi',
            nouislider:   '../../../nuclear-physics/bower_components/nouislider/distribute/jquery.nouislider.all.min',
            'file-saver': '../../../nuclear-physics/bower_components/file-saver/FileSaver',

            'vector2-node':          '../../../nuclear-physics/node_modules/vector2-node-shimmed/index',
            'object-pool':           '../../../nuclear-physics/node_modules/object-pool-shimmed/index',
            'circular-list':         '../../../nuclear-physics/node_modules/object-pool-shimmed/node_modules/circular-list/index',
            'bootstrap-select':      '../../../nuclear-physics/node_modules/bootstrap-select/js/bootstrap-select',
            'bootstrap-select-less': '../../../nuclear-physics/node_modules/bootstrap-select/less/bootstrap-select',
            'sat':                   '../../../nuclear-physics/node_modules/sat/SAT',

            local:            './',
            views:            '../../../nuclear-physics/src/js/views',
            models:           '../../../nuclear-physics/src/js/models',
            persistence:      '../../../nuclear-physics/src/js/persistence',
            assets:           '../js/assets',
            'nuclear-physics-assets': '../../../nuclear-physics/src/js/assets',
            constants:        '../../../nuclear-physics/src/js/constants',
            templates:        '../../../nuclear-physics/src/templates',
            styles:           '../../../nuclear-physics/src/styles',
            common:           '../../../common'
        },

        packages: [{
            name: 'css',
            location: '../../../nuclear-physics/bower_components/require-css',
            main: 'css'
        }, {
            name: 'less',
            location: '../../../nuclear-physics/bower_components/require-less',
            main: 'less'
        }],

        less: {
            logLevel: 1,

            globalVars: {
                dependencyDir: '"../nuclear-physics/bower_components"'
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