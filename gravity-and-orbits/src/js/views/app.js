define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var FriendlyScaleSimView = require('views/sim/friendly-scale');
    var ToScaleSimView       = require('views/sim/to-scale');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var GOAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            FriendlyScaleSimView,
            ToScaleSimView
        ]

    });

    return GOAppView;
});
