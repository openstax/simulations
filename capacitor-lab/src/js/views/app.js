define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var CapacitorLabSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var CapacitorLabAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            CapacitorLabSimView
        ]

    });

    return CapacitorLabAppView;
});
