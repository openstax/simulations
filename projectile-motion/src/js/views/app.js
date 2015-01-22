define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var ProjectileMotionSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var ProjectileMotionAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            ProjectileMotionSimView
        ]

    });

    return ProjectileMotionAppView;
});
