define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var MagnetAndCompassSimView = require('./sim/magnet-and-compass');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var FaradayAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            MagnetAndCompassSimView
        ]

    });

    return FaradayAppView;
});
