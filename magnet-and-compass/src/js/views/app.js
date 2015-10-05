define(function(require) {
    
    'use strict';

    var FaradayAppView = require('views/app');
    
    var MagnetAndCompassSimView = require('./sim/magnet-and-compass');

    var Assets = require('assets');

    var MagnetAndCompassAppView = FaradayAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            MagnetAndCompassSimView
        ]

    });

    return MagnetAndCompassAppView;
});
