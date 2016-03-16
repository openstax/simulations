define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var RutherfordAtomSimView  = require('views/sim/rutherford');
    var PlumPuddingSimView = require('views/sim/plum-pudding');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var RutherfordScatteringAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            RutherfordAtomSimView,
            PlumPuddingSimView
        ]

    });

    return RutherfordScatteringAppView;
});
