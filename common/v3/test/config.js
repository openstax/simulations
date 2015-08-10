(function () {
    'use strict';

    var config = {
        paths: {
            jquery:           './node_modules/jquery/dist/jquery',
            underscore:       './node_modules/underscore/underscore',
            backbone:         './node_modules/backbone/backbone',
            bootstrap:        './node_modules/bootstrap/dist/js/bootstrap.min',
            text:             './node_modules/requirejs-text/text',
            pixi:             './node_modules/pixi/bin/pixi.dev',
            'vector2-node':   './node_modules/vector2-node-shimmed/index',
            'object-pool':    './node_modules/object-pool-shimmed/index',
            'circular-list':  './node_modules/object-pool-shimmed/node_modules/circular-list/index',
        }
    };

    require.config(config);
})();