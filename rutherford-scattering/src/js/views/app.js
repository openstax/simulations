define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var RutherfordAtomSimView  = require('rutherford-scattering/views/sim/rutherford');
    var PlumPuddingSimView = require('rutherford-scattering/views/sim/plum-pudding');

    var Assets = require('assets');

    require('less!rutherford-scattering/styles/font-awesome');

    var RutherfordScatteringAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            RutherfordAtomSimView,
            PlumPuddingSimView
        ]

    });

    return RutherfordScatteringAppView;
});
