define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/app');

    var IntroSimView         = require('views/sim/intro');
    var EnergySystemsSimView = require('views/sim/energy-systems');

    require('less!styles/font-awesome');

    var Assets = require('assets');

    var EFCAppView = PixiAppView.extend({

        assets: Assets.assetsList,

        simViewConstructors: [
            IntroSimView,
            EnergySystemsSimView
        ]

    });

    return EFCAppView;
});
