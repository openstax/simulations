define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var ChargesAndFieldsSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var ChargesAndFieldsAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            ChargesAndFieldsSimView
        ]

    });

    return ChargesAndFieldsAppView;
});
