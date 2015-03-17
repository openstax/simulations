define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var PendulumLabSimView = require('views/sim');

    require('less!styles/font-awesome');

    var PendulumLabAppView = PixiAppView.extend({

        assets: [],

        simViewConstructors: [
            PendulumLabSimView
        ]

    });

    return PendulumLabAppView;
});
