define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var RutherfordScatteringSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var RutherfordScatteringAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            RutherfordScatteringSimView
        ]

    });

    return RutherfordScatteringAppView;
});
