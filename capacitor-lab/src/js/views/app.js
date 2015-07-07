define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var IntroSimView              = require('views/sim/intro');
    var DielectricSimView         = require('views/sim/dielectric');
    var MultipleCapacitorsSimView = require('views/sim/multiple-capacitors');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var CapacitorLabAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            IntroSimView,
            DielectricSimView,
            MultipleCapacitorsSimView
        ]

    });

    return CapacitorLabAppView;
});
