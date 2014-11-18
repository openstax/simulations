(function () {
    'use strict';

    var config = {
        paths: {
            jquery:           '../../bower_components/jquery/dist/jquery',
            underscore:       '../../bower_components/lodash/dist/lodash',
            backbone:         '../../bower_components/backbone/backbone',
            bootstrap:        '../../bower_components/bootstrap/dist/js/bootstrap.min',
            text:             '../../bower_components/requirejs-text/text',
            pixi:             '../../bower_components/pixi/bin/pixi',
            nouislider:       '../../bower_components/nouislider/distribute/jquery.nouislider.all.min',
            'vector2-node':   '../../node_modules/vector2-node-shimmed/index',
            'rectangle-node': '../../node_modules/rectangle-node-shimmed/index',
            'object-pool':    '../../node_modules/object-pool-shimmed/index',

            views:      '../js/views',
            models:     '../js/models',
            templates:  '../templates',
            styles:     '../styles',
            common:     '../../../common'
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

            globalVars: {
                dependencyDir: '"/bower_components"'
            }
        },

        shim: {
            'vector2-node': {
                exports: 'Vector2'
            },
            'rectangle-node': {
                deps: ['vector2-node'],
                exports: 'Rectangle'
            }
        }
    };

    require.config(config);
})();