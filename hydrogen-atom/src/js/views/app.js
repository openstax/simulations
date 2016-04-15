define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var HydrogenAtomSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var HydrogenAtomAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            HydrogenAtomSimView
        ]

    });

    return HydrogenAtomAppView;
});
