define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var DischargeLampsSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var DischargeLampsAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            DischargeLampsSimView
        ]

    });

    return DischargeLampsAppView;
});
