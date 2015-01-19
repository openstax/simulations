define(function(require) {
    
    'use strict';

    var PIXI = require('pixi');
    PIXI.AUTO_PREVENT_DEFAULT = false;
    
    var PixiAppView = require('common/pixi/view/app');

    var IntroSimView         = require('views/sim/intro');
    var EnergySystemsSimView = require('views/sim/energy-systems');

    require('less!styles/font-awesome');

    var Assets = require('assets');

    var EFCAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            IntroSimView,
            EnergySystemsSimView
        ]

    });

    return EFCAppView;
});
