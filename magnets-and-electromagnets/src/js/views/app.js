define(function(require) {
    
    'use strict';

    var FaradayAppView = require('views/app');
    
    var MEBarMagnetSimView     = require('./sim/bar-magnet');
    var MEElectromagnetSimView = require('./sim/electromagnet');

    var Assets = require('assets');

    var MEAppView = FaradayAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            MEBarMagnetSimView,
            MEElectromagnetSimView
        ]

    });

    return MEAppView;
});
