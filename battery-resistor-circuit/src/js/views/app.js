define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var BRCSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var BRCAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            BRCSimView
        ]

    });

    return BRCAppView;
});
