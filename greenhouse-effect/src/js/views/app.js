define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var GreenhouseHouseSimView = require('views/sim/greenhouse-effect');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var GreenhouseEffectAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            GreenhouseHouseSimView
        ]

    });

    return GreenhouseEffectAppView;
});
