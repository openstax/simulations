define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var MassesAndSpringsSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var MassesAndSpringsAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            MassesAndSpringsSimView
        ]

    });

    return MassesAndSpringsAppView;
});
