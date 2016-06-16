define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var GreenhouseEffectSimView = require('views/sim/greenhouse-effect');
    var GlassLayersSimView      = require('views/sim/glass-layers');
    var PhotonAbsorptionSimView = require('views/sim/photon-absorption');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var GreenhouseEffectAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            GreenhouseEffectSimView,
            GlassLayersSimView,
            PhotonAbsorptionSimView
        ]

    });

    return GreenhouseEffectAppView;
});
