define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var PEffectSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var PEffectAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            PEffectSimView
        ]

    });

    return PEffectAppView;
});
