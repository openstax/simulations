define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var MazeGameSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var MazeGameAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            MazeGameSimView
        ]

    });

    return MazeGameAppView;
});
