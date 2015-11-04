define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var LasersSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var LasersAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            LasersSimView
        ]

    });

    return LasersAppView;
});
