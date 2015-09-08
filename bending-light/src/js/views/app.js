define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var IntroSimView      = require('views/sim/intro');
    var PrismBreakSimView = require('views/sim/prism-break');
    var MoreToolsSimView  = require('views/sim/more-tools');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var BendingLightAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            IntroSimView,
            PrismBreakSimView,
            MoreToolsSimView
        ]

    });

    return BendingLightAppView;
});
