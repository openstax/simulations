define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var HydrogenAtomSimView  = require('hydrogen-atom/views/sim');

    var Assets = require('assets');

    require('less!hydrogen-atom/styles/font-awesome');

    var HydrogenAtomAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            HydrogenAtomSimView
        ]

    });

    return HydrogenAtomAppView;
});
