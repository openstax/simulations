define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var GreenhouseEffectSimView = require('views/sim/greenhouse-effect');
    var GlassLayersSimView     = require('views/sim/glass-layers');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var GreenhouseEffectAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            GreenhouseEffectSimView,
            GlassLayersSimView
        ]

    });

    return GreenhouseEffectAppView;
});
