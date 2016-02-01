define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var NuclearPhysicsSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var NuclearPhysicsAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            NuclearPhysicsSimView
        ]

    });

    return NuclearPhysicsAppView;
});
