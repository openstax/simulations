define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var CCKSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');


    var FaradayAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            CCKSimView
        ]

    });

    return FaradayAppView;
});
