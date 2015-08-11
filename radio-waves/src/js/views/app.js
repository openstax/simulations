define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var RadioWavesSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var RadioWavesAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            RadioWavesSimView
        ]

    });

    return RadioWavesAppView;
});
