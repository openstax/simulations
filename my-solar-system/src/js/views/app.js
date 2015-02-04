define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var MSSSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var MSSAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            MSSSimView
        ]

    });

    return MSSAppView;
});
