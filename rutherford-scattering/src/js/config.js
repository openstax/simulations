(function () {
    'use strict';

    var config = {
        paths: {
            jquery:     '../../bower_components/jquery/dist/jquery',
            underscore: '../../bower_components/underscore/underscore',
            backbone:   '../../bower_components/backbone/backbone',
            bootstrap:  '../../bower_components/bootstrap/dist/js/bootstrap.min',
            text:       '../../bower_components/requirejs-text/text',
            pixi:       '../../bower_components/pixi/bin/pixi',
            nouislider: '../../bower_components/nouislider/distribute/jquery.nouislider.all.min',
            buzz:       '../../bower_components/buzz/dist/buzz.min',

            'point-in-polygon':      '../../node_modules/point-in-polygon-shimmed/index',
            'vector2-node':          '../../node_modules/vector2-node-shimmed/index',
            'object-pool':           '../../node_modules/object-pool-shimmed/index',
            'circular-list':         '../../node_modules/circular-list-shimmed/index',
            'bootstrap-select':      '../../node_modules/bootstrap-select/js/bootstrap-select',
            'bootstrap-select-less': '../../node_modules/bootstrap-select/less/bootstrap-select',

            assets:     '../js/assets',
            constants:  '../js/constants',
            common:     '../../../common',

            'views':            '../../../nuclear-physics/src/js/views',
            'models':           '../../../nuclear-physics/src/js/models',
            'templates':        '../../../nuclear-physics/src/templates',
            'styles':           '../../../nuclear-physics/src/styles',
            'nuclear-physics':  '../../../nuclear-physics/src/js',

            'rutherford-scattering/views':        '../js/views',
            'rutherford-scattering/models':       '../js/models',
            'rutherford-scattering/templates':    '../templates',
            'rutherford-scattering/styles':       '../styles',
            'rutherford-scattering':              '.'
        },

        packages: [{
            name: 'css',
            location: '../../bower_components/require-css',
            main: 'css'
        }, {
            name: 'less',
            location: '../../bower_components/require-less',
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