(function () {
    'use strict';

    var config = {
        paths: {
            jquery:     '../../../common/bower_components/jquery/dist/jquery',
            underscore: '../../../common/bower_components/underscore/underscore',
            backbone:   '../../../common/bower_components/backbone/backbone',
            bootstrap:  '../../../common/bower_components/bootstrap/dist/js/bootstrap.min',
            text:       '../../../common/bower_components/requirejs-text/text',
            pixi:       '../../../common/bower_components/pixi/bin/pixi',
            nouislider: '../../../common/bower_components/nouislider/distribute/jquery.nouislider.all.min',
            buzz:       '../../../common/bower_components/buzz/dist/buzz.min',
            
            'sat':                   '../../../common/node_modules/sat/SAT',
            'vector2-node':          '../../../common/node_modules/vector2-node-shimmed/index',
            'object-pool':           '../../../common/node_modules/object-pool-shimmed/index',
            'circular-list':         '../../../common/node_modules/object-pool-shimmed/node_modules/circular-list/index',
            'bootstrap-select':      '../../../common/node_modules/bootstrap-select/js/bootstrap-select',
            'bootstrap-select-less': '../../../common/node_modules/bootstrap-select/less/bootstrap-select',
            'clipper-lib':           '../../../common/node_modules/clipper-lib/clipper',

            views:      '../js/views',
            models:     '../js/models',
            assets:     '../js/assets',
            constants:  '../js/constants',
            templates:  '../templates',
            styles:     '../styles',
            common:     '../../../common'
        },

        packages: [{
            name: 'css',
            location: '../../../common/bower_components/require-css',
            main: 'css'
        }, {
            name: 'less',
            location: '../../../common/bower_components/require-less',
            main: 'less'
        }],

        less: {
            logLevel: 1,
            async: true,

            globalVars: {
                dependencyDir: '"/bower_components"'
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