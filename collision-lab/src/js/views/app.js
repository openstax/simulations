define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var IntroSimView    = require('views/sim/intro');
    var AdvancedSimView = require('views/sim/advanced');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var CollisionLabAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            IntroSimView,
            AdvancedSimView
        ]

    });

    return CollisionLabAppView;
});
